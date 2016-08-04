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

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;

import org.auraframework.annotations.Annotations.ServiceComponent;
import org.auraframework.def.BaseComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.instance.Component;
import org.auraframework.system.AuraContext;
import org.auraframework.system.AuraContext.Format;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.resource.ResourceLoader;

import com.google.common.collect.Maps;

@ServiceComponent
public class InlineJs extends TemplateResource {

    private static final String WALLTIME_FILE_PATH = "/aura/resources/walltime-js/olson/walltime-data_";
    private static final String WALLTIME_INIT_JS = ";(function(){ if(window.WallTime.init) { window.WallTime.init(window.WallTime.data.rules, window.WallTime.data.zones); } }).call(this);";
    private static final Map<String, String> WALLTIME_TZ_CONTENT = Maps.newConcurrentMap();

    public InlineJs() {
        super("inline.js", Format.JS);
    }

    @Override
    protected void doRender(Component template, Appendable out) throws IOException, QuickFixException {

        // write walltime tz data
        String tz = configAdapter.getCurrentTimezone();
        tz = tz.replace("/", "-");
        if (!"GMT".equals(tz)) {
            String tzContent = WALLTIME_TZ_CONTENT.get(tz);

            if (tzContent == null) {
                ResourceLoader resourceLoader = configAdapter.getResourceLoader();
                String tzPath = WALLTIME_FILE_PATH + tz;
                String minFile = tzPath + ".min.js";
                String devFile = tzPath + tz + ".js";

                // use min file if exists, otherwise use dev version
                String filePath = resourceLoader.getResource(minFile) != null ? minFile :
                        (resourceLoader.getResource(devFile) != null ? devFile : null);

                if (filePath != null) {
                    try (InputStream is = resourceLoader.getResourceAsStream(filePath);
                         ByteArrayOutputStream os = new ByteArrayOutputStream()) {
                        byte[] buffer = new byte[1024];
                        int length;
                        while ((length = is.read(buffer)) != -1) {
                            os.write(buffer, 0, length);
                        }
                        tzContent = os.toString();
                        WALLTIME_TZ_CONTENT.put(tz, tzContent);
                        os.close();
                    }
                }
            }

            if (tzContent != null) {
                out.append(tzContent).append(WALLTIME_INIT_JS);
            }
        }

        // write inline scripts from template
        renderingService.render(template, null, out);
    }

    @Override
    protected boolean shouldCacheHTMLTemplate(DefDescriptor<? extends BaseComponentDef> appDefDesc,
            HttpServletRequest request, AuraContext context) throws QuickFixException {
        return false;
    }
}
