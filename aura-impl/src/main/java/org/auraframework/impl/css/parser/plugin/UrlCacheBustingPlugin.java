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
package org.auraframework.impl.css.parser.plugin;

import org.auraframework.Aura;
import org.auraframework.system.AuraContext.Mode;

import com.salesforce.omakase.ast.declaration.UrlFunctionValue;
import com.salesforce.omakase.broadcast.annotation.Rework;
import com.salesforce.omakase.plugin.Plugin;

/**
 * Add cache-busters to urls.
 */
public final class UrlCacheBustingPlugin implements Plugin {
    private final boolean enabled;

    public UrlCacheBustingPlugin() {
        enabled = Aura.getConfigAdapter().isAuraJSStatic()
                && Aura.getContextService().getCurrentContext().getMode() != Mode.DEV;
    }

    // For testing.
    public UrlCacheBustingPlugin(boolean enabled) {
        this.enabled = enabled;
    }

    @Rework
    public void rework(UrlFunctionValue value) {
        // This is very fragile.
        if (enabled && value.url().startsWith("/") && value.url().indexOf("aura.cb") == -1) {
            value.url(addCacheBuster(value.url()));
        }
    }

    /**
     * Internal routine to bust the cache.
     *
     * This is actually a bit fragile, and maybe should use a proper parser.
     */
    private String addCacheBuster(String url) {
        String uri = url;
        if (uri == null) {
            return null;
        }
        int hashLoc = uri.indexOf('#');
        String hash = "";
        if (hashLoc >= 0) {
            hash = uri.substring(hashLoc);
            uri = uri.substring(0, hashLoc);
        }
        StringBuilder sb = new StringBuilder(uri);
        sb.append((uri.contains("?")) ? "&" : "?");
        sb.append("aura.cb=");
        sb.append(Aura.getConfigAdapter().getBuildTimestamp());
        return sb.toString() + hash;
    }

}
