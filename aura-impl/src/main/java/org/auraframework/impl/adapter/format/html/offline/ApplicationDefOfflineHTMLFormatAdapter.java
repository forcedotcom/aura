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
package org.auraframework.impl.adapter.format.html.offline;

import java.io.*;
import java.util.List;
import java.util.Map;

import javax.annotation.concurrent.ThreadSafe;

import org.auraframework.Aura;
import org.auraframework.def.*;
import org.auraframework.http.AuraResourceServlet;
import org.auraframework.http.AuraServlet;
import org.auraframework.instance.Application;
import org.auraframework.instance.Component;
import org.auraframework.service.*;
import org.auraframework.system.*;
import org.auraframework.system.AuraContext.*;
import org.auraframework.throwable.AuraRuntimeException;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.IOUtil;
import org.auraframework.util.json.Json;

import com.google.common.collect.Lists;
import com.google.common.collect.Maps;

/**
 */
@ThreadSafe
public class ApplicationDefOfflineHTMLFormatAdapter extends OfflineHTMLFormatAdapter<ApplicationDef> {

    @Override
    public Class<ApplicationDef> getType() {
        return ApplicationDef.class;
    }

    @Override
    public void write(Object value, Map<String, Object> args, Appendable out) throws IOException {

        ApplicationDef def = (ApplicationDef) value;

        String outputPath = (String) args.get("outputPath");
        if (outputPath == null) {
            throw new AuraRuntimeException(
                    "'outputPath' directory path is required as an attribute to use this FormatAdapter");
        }

        String appName = def.getDescriptor().getName();
        File outputDir = new File(outputPath, appName);
        if (outputDir.exists()) {
            throw new AuraRuntimeException(String.format("%s exists.  Please select another location.",
                    outputDir.getAbsolutePath()));
        } else {
            outputDir.mkdirs();
        }

        File html = new File(outputDir, "index.html");

        InstanceService instanceService = Aura.getInstanceService();
        RenderingService renderingService = Aura.getRenderingService();

        ContextService contextService = Aura.getContextService();
        AuraContext context = contextService.getCurrentContext();

        Writer htmlWriter = new FileWriter(html);
        try {
            ComponentDef templateDef = def.getTemplateDef();
            Map<String, Object> attributes = Maps.newHashMap();

            StringBuilder sb = new StringBuilder();
            // Get the preload css
            List<String> styles = Lists.newArrayList(String.format("%s.css", appName));
            this.writeHtmlStyles(styles, sb);
            File css = new File(outputDir, String.format("%s.css", appName));
            FileWriter cssWriter = new FileWriter(css);
            try {
                AuraResourceServlet.writeCss(cssWriter);
            } finally {
                cssWriter.close();
            }
            attributes.put("auraStyleTags", sb.toString());

            // Clear sb out
            sb.setLength(0);

            List<String> scripts = Lists.newArrayList("aura.js", String.format("%s.js", appName));
            writeHtmlScripts(scripts, sb);

            // Get the framework js
            File auraJs = new File(outputDir, "aura.js");
            FileWriter auraJsWriter = new FileWriter(auraJs);
            InputStream in = Aura.getConfigAdapter().getResourceLoader()
                    .getResourceAsStream("aura/javascript/aura_dev.js");
            InputStreamReader reader = new InputStreamReader(in);
            try {
                Aura.getConfigAdapter().regenerateAuraJS();
                IOUtil.copyStream(reader, auraJsWriter);
            } finally {
                try {
                    auraJsWriter.close();
                } finally {
                    reader.close();
                }
            }

            Application instance = instanceService.getInstance(def, null);

            // Get the preload js
            File js = new File(outputDir, String.format("%s.js", appName));
            FileWriter jsWriter = new FileWriter(js);
            try {
                AuraResourceServlet.writeDefinitions(jsWriter);

                // Write the app at the bottom of the same file

                Map<String, Object> auraInit = Maps.newHashMap();

                auraInit.put("instance", instance);
                auraInit.put("token", AuraServlet.getToken());
                auraInit.put("host", context.getContextPath());

                context.addPreload("aura");

                contextService.startContext(Mode.PROD, Format.HTML, Access.AUTHENTICATED, def.getDescriptor());
                auraInit.put("context", contextService.getCurrentContext());
                jsWriter.append("\n$A.initConfig($A.util.json.resolveRefs(");
                Json.serialize(auraInit, jsWriter, context.getJsonSerializationContext());
                jsWriter.append("));\n");
            } finally {
                jsWriter.close();
            }

            attributes.put("auraScriptTags", sb.toString());

            DefDescriptor<StyleDef> styleDefDesc = templateDef.getStyleDescriptor();
            if (styleDefDesc != null) {
                Client.Type type = context.getClient().getType();
                attributes.put("auraInlineStyle", styleDefDesc.getDef().getCode(type));
            }

            attributes.put("autoInitialize", false);
            Component template = instanceService.getInstance(templateDef.getDescriptor(), attributes);
            renderingService.render(template, htmlWriter);
        } catch (QuickFixException e) {
            throw new AuraRuntimeException(e);
        } finally {
            htmlWriter.close();
        }
    }
}
