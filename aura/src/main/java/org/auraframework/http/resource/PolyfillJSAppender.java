/*
 * Copyright (C) 2013 salesforce.com, inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *         http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package org.auraframework.http.resource;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.auraframework.annotations.Annotations.ServiceComponent;
import org.auraframework.def.BaseComponentDef;
import org.auraframework.http.BrowserCompatibilityService;
import org.auraframework.system.AuraContext;
import org.auraframework.system.AuraContext.Mode;
import org.polyfillservice.api.components.Query;
import org.polyfillservice.api.interfaces.PolyfillService;
import org.polyfillservice.api.interfaces.UserAgent;
import org.polyfillservice.api.interfaces.UserAgentParserService;

import javax.inject.Inject;

@ServiceComponent
public class PolyfillJSAppender implements InlineJSAppender {
    private static final Map<String, String> POLYFILL_CACHE = new ConcurrentHashMap<>();
    private PolyfillService polyfillService;
    private UserAgentParserService userAgentParserService;
    private BrowserCompatibilityService browserCompatibilityService;
    
    @Inject
    public void setPolyfillService(PolyfillService polyfillService) {
        this.polyfillService = polyfillService;
    }
    
    @Inject
    public void setUserAgentParserService(UserAgentParserService userAgentParserService) {
        this.userAgentParserService = userAgentParserService;
    }

    @Inject
    public void setBrowserCompatibilityService(BrowserCompatibilityService browserCompatibilityService) {
        this.browserCompatibilityService = browserCompatibilityService;
    }

    /**
     * Writes javascript into pre init "beforeFrameworkInit"
     *
     * @param def current application or component
     * @param context current AuraContext
     * @param out response writer
     */
    @Override
    public void append(BaseComponentDef def, AuraContext context, Appendable out) throws IOException {
        String ua = context.getClient().getUserAgent();
        writePolyfills(ua, out, context.getMode());
    }

    private void writePolyfills(String uaHeader, Appendable out, Mode mode) throws IOException {
        if (!this.browserCompatibilityService.isCompatible(uaHeader)) {
            if (uaHeader == null) {
                // polyfill service NPE with String null
                uaHeader = "";
            }

            UserAgent ua = this.userAgentParserService.parse(uaHeader);
            /**
                Ideally cache key should be based on list of polyfills.
                However, polyfill service requires traversal for list of
                polyfills as well as polyfill source generation.
            **/
            String key = ua.getFamily() + ua.getMajorVersion();

            if (mode.prettyPrint()) {
                key += "|debug";
            }
            String source = POLYFILL_CACHE.get(key);
            if (source == null) {
                Query.Builder queryBuilder = new Query.Builder();
                if (mode.prettyPrint()) {
                    // don't minimize and set debug mode
                    queryBuilder.setMinify(false).setDebugMode(true);
                }
                Query query = queryBuilder.build();
                source = this.polyfillService.getPolyfillsSource(uaHeader, query);
                POLYFILL_CACHE.put(key, source);
            }
            out.append(source);
        }
    }
}
