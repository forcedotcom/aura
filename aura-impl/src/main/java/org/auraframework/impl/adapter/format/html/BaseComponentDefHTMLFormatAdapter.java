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

import javax.annotation.PostConstruct;
import javax.annotation.concurrent.ThreadSafe;
import javax.inject.Inject;

import org.auraframework.adapter.ConfigAdapter;
import org.auraframework.adapter.ServletUtilAdapter;
import org.auraframework.annotations.Annotations.ServiceComponent;
import org.auraframework.def.BaseComponentDef;
import org.auraframework.def.ComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.StyleDef;
import org.auraframework.http.ManifestUtil;
import org.auraframework.instance.BaseComponent;
import org.auraframework.instance.Component;
import org.auraframework.service.ContextService;
import org.auraframework.service.InstanceService;
import org.auraframework.service.RenderingService;
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
public abstract class BaseComponentDefHTMLFormatAdapter<T extends BaseComponentDef> extends HTMLFormatAdapter<T> {
    @Inject
    private ConfigAdapter configAdapter;

    @Inject
    private ContextService contextService;

    @Inject
    private InstanceService instanceService;

    @Inject
    private RenderingService renderingService;

    @Inject
    private ServletUtilAdapter servletUtilAdapter;

    private ManifestUtil manifestUtil;

    @PostConstruct
    public void createManifestUtil() {
        manifestUtil = new ManifestUtil(contextService, configAdapter);
    }

    @Override
    public void write(T value, Map<String, Object> componentAttributes, Appendable out) throws IOException {
        try {
            ComponentDef templateDef = value.getTemplateDef();
            Map<String, Object> attributes = Maps.newHashMap();

            StringBuilder sb = new StringBuilder();
            writeHtmlStyle(configAdapter.getResetCssURL(), sb);
            attributes.put("auraResetTags", sb.toString());

            AuraContext context = contextService.getCurrentContext();

            sb.setLength(0);
            writeHtmlStyles(servletUtilAdapter.getStyles(context), sb);
            attributes.put("auraStyleTags", sb.toString());

            DefDescriptor<StyleDef> styleDefDesc = templateDef.getStyleDescriptor();
            if (styleDefDesc != null) {
                attributes.put("auraInlineStyle", styleDefDesc.getDef().getCode());
            }

            String contextPath = context.getContextPath();
            Mode mode = context.getMode();

            if (mode.allowLocalRendering() && value.isLocallyRenderable()) {
                BaseComponent<?, ?> cmp = (BaseComponent<?, ?>) instanceService.getInstance(value, componentAttributes);

                attributes.put("body", Lists.<BaseComponent<?, ?>> newArrayList(cmp));
                attributes.put("bodyClass", "");
                attributes.put("defaultBodyClass", "");
                attributes.put("autoInitialize", "false");
            } else {
                if (manifestUtil.isManifestEnabled()) {
                    attributes.put("manifest", servletUtilAdapter.getManifestUrl(context, componentAttributes));
                }
                
                sb.setLength(0);
                writeHtmlScripts(context, servletUtilAdapter.getFrameworkScripts(context, true/*inlineJS*/, false/*dontIgnoreBootstrap*/, componentAttributes), false/*async*/, sb);
                attributes.put("auraNamespacesScriptTags", sb.toString());

                sb.setLength(0);
                writeHtmlScripts(context, servletUtilAdapter.getBaseScripts(context, componentAttributes), true/*async*/, sb);
                attributes.put("auraBaseScriptTags", sb.toString());

                sb.setLength(0);
                writeHtmlScripts(context, servletUtilAdapter.getFrameworkScripts(context, true/*inlineJS*/, false/*dontIgnoreBootstrap*/, componentAttributes), true/*async*/, sb);
                attributes.put("auraNamespacesScriptTags", sb.toString());

                Map<String, Object> auraInit = Maps.newHashMap();
                if (componentAttributes != null && !componentAttributes.isEmpty()) {
                    auraInit.put("attributes", componentAttributes);
                }
                Map<String, Object> namespaces = Maps.newHashMap();
                namespaces.put("internal", configAdapter.getInternalNamespaces());
                namespaces.put("privileged", configAdapter.getPrivilegedNamespaces());
                auraInit.put("ns", namespaces);

                auraInit.put("descriptor", value.getDescriptor());
                auraInit.put("deftype", value.getDescriptor().getDefType());
                auraInit.put("host", contextPath);
                
                String lockerWorkerURL = configAdapter.getLockerWorkerURL();
                if (lockerWorkerURL != null) {
                	auraInit.put("safeEvalWorker", lockerWorkerURL);
                }

                auraInit.put("context", new Literal(context.serialize(AuraContext.EncodingStyle.Full)));

                attributes.put("auraInit", JsonEncoder.serialize(auraInit));
            }
            Component template = instanceService.getInstance(templateDef.getDescriptor(), attributes);
            renderingService.render(template, out, null);
        } catch (QuickFixException e) {
            throw new AuraRuntimeException(e);
        }
    }

    /**
     * @param manifestUtil the manifestUtil to set
     */
    public void setManifestUtil(ManifestUtil manifestUtil) {
        this.manifestUtil = manifestUtil;
    }
}
