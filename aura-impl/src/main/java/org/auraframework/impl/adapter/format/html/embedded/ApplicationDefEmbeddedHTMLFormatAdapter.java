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
package org.auraframework.impl.adapter.format.html.embedded;

import java.io.IOException;
import java.util.Map;

import javax.annotation.concurrent.ThreadSafe;

import org.auraframework.Aura;
import org.auraframework.def.ApplicationDef;
import org.auraframework.def.ComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.ThemeDef;
import org.auraframework.http.AuraBaseServlet;
import org.auraframework.http.AuraServlet;
import org.auraframework.instance.Application;
import org.auraframework.instance.Component;
import org.auraframework.service.InstanceService;
import org.auraframework.service.RenderingService;
import org.auraframework.system.AuraContext;
import org.auraframework.system.Client;
import org.auraframework.throwable.AuraRuntimeException;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.javascript.Literal;
import org.auraframework.util.json.Json;

import com.google.common.collect.Maps;

/**
 */
@ThreadSafe
public class ApplicationDefEmbeddedHTMLFormatAdapter extends EmbeddedHTMLFormatAdapter<ApplicationDef> {

    @Override
    public Class<ApplicationDef> getType() {
        return ApplicationDef.class;
    }

    @Override
    public void write(Object value, Map<String, Object> componentAttributes, Appendable out) throws IOException {
        InstanceService instanceService = Aura.getInstanceService();
        RenderingService renderingService = Aura.getRenderingService();
        ApplicationDef def = (ApplicationDef) value;
        AuraContext context = Aura.getContextService().getCurrentContext();

        try {
            ComponentDef templateDef = def.getTemplateDef();
            Map<String, Object> attributes = Maps.newHashMap();

            StringBuilder sb = new StringBuilder();
            writeHtmlStyles(AuraServlet.getStyles(), sb);
            attributes.put("auraStyleTags", sb.toString());
            sb.setLength(0);
            writeHtmlScripts(AuraServlet.getScripts(), sb);
            DefDescriptor<ThemeDef> themeDefDesc = templateDef.getThemeDescriptor();
            if (themeDefDesc != null) {
                Client.Type type = context.getClient().getType();
                attributes.put("auraInlineStyle", themeDefDesc.getDef().getCode(type));
            }

            attributes.put("auraScriptTags", sb.toString());
            Map<String, Object> auraInit = Maps.newHashMap();

            Application instance = instanceService.getInstance(def, null);

            auraInit.put("instance", instance);
            auraInit.put("token", AuraBaseServlet.getToken());
            auraInit.put("host", context.getContextPath());

            StringBuilder contextWriter = new StringBuilder();

            Aura.getSerializationService().write(context, null, AuraContext.class, contextWriter, "JSON");

            auraInit.put("context", new Literal(contextWriter.toString()));

            attributes.put("auraInit", Json.serialize(auraInit, context.getJsonSerializationContext()));
            Component template = instanceService.getInstance(templateDef.getDescriptor(), attributes);
            renderingService.render(template, out);
        } catch (QuickFixException e) {
            throw new AuraRuntimeException(e);
        }
    }
}
