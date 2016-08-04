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
import java.io.PrintWriter;
import java.util.Arrays;
import java.util.List;
import java.util.Map;

import javax.annotation.PostConstruct;
import javax.inject.Inject;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.auraframework.annotations.Annotations.ServiceComponent;
import org.auraframework.def.ApplicationDef;
import org.auraframework.def.BaseComponentDef;
import org.auraframework.def.ComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.StyleDef;
import org.auraframework.http.ManifestUtil;
import org.auraframework.instance.BaseComponent;
import org.auraframework.instance.Component;
import org.auraframework.service.ContextService;
import org.auraframework.service.LoggingService;
import org.auraframework.service.RenderingService;
import org.auraframework.system.AuraContext;
import org.auraframework.system.AuraContext.Format;
import org.auraframework.system.AuraContext.Mode;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.javascript.Literal;
import org.auraframework.util.json.JsonEncoder;

import com.google.common.collect.Lists;
import com.google.common.collect.Maps;

@ServiceComponent
public abstract class TemplateResource extends AuraResourceImpl {

    protected LoggingService loggingService;
    protected RenderingService renderingService;
    protected ContextService contextService;

    protected ManifestUtil manifestUtil;

    public TemplateResource(String name, Format format) {
        super(name, format);
    }

    @PostConstruct
    public void initManifest() {
        this.manifestUtil = new ManifestUtil(contextService, configAdapter);
    }

    @Override
    public void write(HttpServletRequest request, HttpServletResponse response, AuraContext context)
            throws IOException {
        try {
            DefDescriptor<? extends BaseComponentDef> appDefDesc = context.getLoadingApplicationDescriptor();

            internalWrite(request, response, appDefDesc, context);
            // fixme.
        } catch (Throwable t) {
            servletUtilAdapter.handleServletException(t, false, context, request, response, false);
        }
    }

    protected <T extends BaseComponentDef> void internalWrite(HttpServletRequest request,
            HttpServletResponse response, DefDescriptor<T> defDescriptor, AuraContext context)
            throws IOException, QuickFixException {
        // Knowing the app, we can do the HTTP headers, so of which depend on
        // the app in play, so we couldn't do this earlier.
        T def;

        servletUtilAdapter.setCSPHeaders(defDescriptor, request, response);

        context.setFrameworkUID(configAdapter.getAuraFrameworkNonce());

        context.setApplicationDescriptor(defDescriptor);
        definitionService.updateLoaded(defDescriptor);
        def = definitionService.getDefinition(defDescriptor);

        if (!context.isTestMode() && !context.isDevMode()) {
            String defaultNamespace = configAdapter.getDefaultNamespace();
            DefDescriptor<?> referencingDescriptor = (defaultNamespace != null && !defaultNamespace.isEmpty())
                    ? definitionService.getDefDescriptor(String.format("%s:servletAccess", defaultNamespace),
                            ApplicationDef.class)
                    : null;
            definitionService.getDefRegistry().assertAccess(referencingDescriptor, def);
        }

        if (shouldCacheHTMLTemplate(defDescriptor, request, context)) {
            servletUtilAdapter.setLongCache(response);
        } else {
            servletUtilAdapter.setNoCache(response);
        }
        try {
            loggingService.startTimer(LoggingService.TIMER_SERIALIZATION);
            loggingService.startTimer(LoggingService.TIMER_SERIALIZATION_AURA);
            // Prevents Mhtml Xss exploit:
            PrintWriter out = response.getWriter();
            out.write("\n    ");
            writeTemplate(context, def, getComponentAttributes(request), out);
        } finally {
            loggingService.stopTimer(LoggingService.TIMER_SERIALIZATION_AURA);
            loggingService.stopTimer(LoggingService.TIMER_SERIALIZATION);
        }
    }

    protected abstract boolean shouldCacheHTMLTemplate(DefDescriptor<? extends BaseComponentDef> appDefDesc,
            HttpServletRequest request, AuraContext context) throws QuickFixException;

    private <T extends BaseComponentDef> void writeTemplate(AuraContext context, T value,
            Map<String, Object> componentAttributes, Appendable out) throws IOException, QuickFixException {

        ComponentDef templateDef = value.getTemplateDef();
        Map<String, Object> attributes = Maps.newHashMap();

        StringBuilder sb = new StringBuilder();
        writeHtmlStyles(Lists.newArrayList(Arrays.asList(configAdapter.getResetCssURL())), sb);
        attributes.put("auraResetCss", sb.toString());

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
            BaseComponent<?, ?> cmp = null;

            cmp = (BaseComponent<?, ?>) instanceService.getInstance(value, componentAttributes);

            attributes.put("body", Lists.<BaseComponent<?, ?>> newArrayList(cmp));
            attributes.put("bodyClass", "");
            attributes.put("defaultBodyClass", "");
            attributes.put("autoInitialize", "false");
        } else {
            if (manifestUtil.isManifestEnabled()) {
                attributes.put("manifest", servletUtilAdapter.getManifestUrl(context, componentAttributes));
            }

            sb.setLength(0);
            writeHtmlScripts(servletUtilAdapter.getBaseScripts(context, componentAttributes), sb);
            attributes.put("auraBaseScriptTags", sb.toString());

            sb.setLength(0);
            writeHtmlScripts(servletUtilAdapter.getFrameworkScripts(context, true, false, componentAttributes), true, sb);
            attributes.put("auraNamespacesScriptTags", sb.toString());

            // init namespaces.

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
        doRender(template, out);
    }

    protected abstract void doRender(Component template, Appendable out) throws IOException, QuickFixException;

    private static final String HTML_STYLE = "        <link href=\"%s\" rel=\"stylesheet\" type=\"text/css\"/>\n";
    private static final String HTML_SCRIPT = "       <script src=\"%s\" ></script>\n";
    private static final String HTML_LAZY_SCRIPT = "       <script data-src=\"%s\" ></script>\n";

    protected void writeHtmlStyles(List<String> styles, Appendable out) throws IOException {
        if (styles != null) {
            for (String style : styles) {
                out.append(String.format(HTML_STYLE, style));
            }
        }
    }

    protected void writeHtmlScripts(List<String> scripts, Appendable out) throws IOException {
        writeHtmlScripts(scripts, false, out);
    }

    protected void writeHtmlScripts(List<String> scripts, boolean lazy, Appendable out) throws IOException {
        if (scripts != null) {
            for (String script : scripts) {
                out.append(String.format(lazy ? HTML_LAZY_SCRIPT : HTML_SCRIPT, script));
            }
        }
    }

    @Inject
    public void setLoggingService(LoggingService loggingService) {
        this.loggingService = loggingService;
    }

    @Inject
    public void setRenderingService(RenderingService renderingService) {
        this.renderingService = renderingService;
    }

    @Inject
    public void setContextService(ContextService contextService) {
        this.contextService = contextService;
    }
}
