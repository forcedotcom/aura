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
package org.auraframework.impl.adapter.format.html;

import java.io.IOException;
import java.util.Map;

import javax.annotation.concurrent.ThreadSafe;
import javax.inject.Inject;

import org.auraframework.adapter.ConfigAdapter;
import org.auraframework.adapter.ServletUtilAdapter;
import org.auraframework.annotations.Annotations.ServiceComponent;
import org.auraframework.def.BaseComponentDef;
import org.auraframework.def.ComponentDef;
import org.auraframework.def.StyleDef;
import org.auraframework.impl.util.TemplateUtil.Script;
import org.auraframework.instance.BaseComponent;
import org.auraframework.instance.Component;
import org.auraframework.service.ContextService;
import org.auraframework.service.DefinitionService;
import org.auraframework.service.InstanceService;
import org.auraframework.service.RenderingService;
import org.auraframework.service.SerializationService;
import org.auraframework.system.AuraContext;
import org.auraframework.system.AuraContext.Mode;
import org.auraframework.throwable.AuraRuntimeException;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.javascript.Literal;
import org.auraframework.util.json.JsonEncoder;

import com.google.common.collect.Lists;
import com.google.common.collect.Maps;

@ThreadSafe
@ServiceComponent
public abstract class BaseComponentHTMLFormatAdapter<T extends BaseComponent<?, ?>> extends HTMLFormatAdapter<T> {
    @Inject
    private ContextService contextService;

    @Inject
    private DefinitionService definitionService;

    @Inject
    private InstanceService instanceService;

    @Inject
    private RenderingService renderingService;

    @Inject
    private SerializationService serializationService;

    @Inject
    private ConfigAdapter configAdapter;

    @Inject
    private ServletUtilAdapter servletUtilAdapter;
    
    @Override
    public void write(T value, Map<String, Object> componentAttributes, Appendable out) throws IOException {
        try {

            AuraContext context = contextService.getCurrentContext();
            BaseComponentDef def = definitionService.getDefinition(value.getDescriptor());

            ComponentDef templateDef = def.getTemplateDef();
            Map<String, Object> attributes = Maps.newHashMap();

            StringBuilder sb = new StringBuilder();
            writeHtmlStyle(configAdapter.getResetCssURL(), sb);
            attributes.put("auraResetTags", sb.toString());


            sb.setLength(0);
            writeHtmlStyles(servletUtilAdapter.getStyles(context), sb);
            attributes.put("auraStyleTags", sb.toString());

            sb.setLength(0);
            writeHtmlScripts(context, servletUtilAdapter.getScripts(context, true, false, componentAttributes), Script.SYNC, sb);
            StyleDef styleDef = templateDef.getStyleDef();
            if (styleDef != null) {
                attributes.put("auraInlineStyle", styleDef.getCode());
            }

            String contextPath = context.getContextPath();
            String pathPrefix = context.getPathPrefix();
            Mode mode = context.getMode();

            if (mode.allowLocalRendering() && def.isLocallyRenderable()) {
                BaseComponent<?, ?> cmp = (BaseComponent<?, ?>) instanceService.getInstance(def, componentAttributes);

                attributes.put("body", Lists.<BaseComponent<?, ?>> newArrayList(cmp));
                attributes.put("bodyClass", "");
                attributes.put("autoInitialize", "false");

                Component template = instanceService.getInstance(templateDef.getDescriptor(), attributes);

                renderingService.render(template, out);
            } else {

                attributes.put("auraScriptTags", sb.toString());

                Map<String, Object> auraInit = Maps.newHashMap();
                if (componentAttributes != null && !componentAttributes.isEmpty()) {
                    auraInit.put("attributes", componentAttributes);
                }

                Map<String, Object> namespaces = Maps.newHashMap();
                namespaces.put("internal", configAdapter.getInternalNamespaces());
                namespaces.put("privileged", configAdapter.getPrivilegedNamespaces());
                auraInit.put("ns", namespaces);

                auraInit.put("descriptor", def.getDescriptor());
                auraInit.put("deftype", def.getDescriptor().getDefType());
                auraInit.put("host", contextPath);
                auraInit.put("pathPrefix", pathPrefix);
                
                String lockerWorkerURL = configAdapter.getLockerWorkerURL();
                if (lockerWorkerURL != null) {
                    auraInit.put("safeEvalWorker", lockerWorkerURL);
                }

                auraInit.put("MaxParallelXHRCount", configAdapter.getMaxParallelXHRCount());
                auraInit.put("XHRExclusivity", configAdapter.getXHRExclusivity());

                attributes.put("autoInitialize", "false");
                attributes.put("autoInitializeSync", "true");

                auraInit.put("instance", value);
                auraInit.put("token", configAdapter.getCSRFToken());

                StringBuilder contextWriter = new StringBuilder();
                serializationService.write(context, null, AuraContext.class, contextWriter, "JSON");
                auraInit.put("context", new Literal(contextWriter.toString()));

                attributes.put("auraInitSync", JsonEncoder.serialize(auraInit));

                Component template = instanceService.getInstance(templateDef.getDescriptor(), attributes);
                renderingService.render(template, out);
            }
        } catch (QuickFixException e) {
            throw new AuraRuntimeException(e);
        }
    }
}
