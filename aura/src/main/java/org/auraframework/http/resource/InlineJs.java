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
import java.net.URL;
import java.util.List;
import javax.inject.Inject;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.auraframework.annotations.Annotations.ServiceComponent;
import org.auraframework.def.ApplicationDef;
import org.auraframework.def.BaseComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.http.ManifestUtil;
import org.auraframework.instance.Component;
import org.auraframework.service.RenderingService;
import org.auraframework.system.AuraContext;
import org.auraframework.system.AuraContext.Format;
import org.auraframework.throwable.AuraJWTError;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.resource.ResourceLoader;
import org.springframework.beans.factory.annotation.Autowired;

import com.google.common.base.Charsets;
import com.google.common.base.MoreObjects;
import com.google.common.collect.ImmutableList;
import com.google.common.io.Resources;

@ServiceComponent
public class InlineJs extends AuraResourceImpl {

    private static final String DOWNGRADE_JS_RESOURCE_PATH = "aura/resources/compat-helpers/downgrade.js";

    private RenderingService renderingService;
    private List<InlineJSAppender> inlineJsAppenders;

    private String downgradeJs = null;

    public InlineJs() {
        super("inline.js", Format.JS);
    }

    public InlineJs(ManifestUtil manifestUtil) {
        super("inline.js", Format.JS, manifestUtil);
    }

    @Inject
    public void setRenderingService(RenderingService renderingService) { this.renderingService = renderingService; }
    @Autowired(required = false)
    public void setInlineJSAppenders(List<InlineJSAppender> inlineJsAppenders) { this.inlineJsAppenders = inlineJsAppenders; }

    private <T extends BaseComponentDef> void internalWrite(HttpServletRequest request,
                                                            HttpServletResponse response, DefDescriptor<T> defDescriptor, AuraContext context)
            throws IOException, QuickFixException {

        servletUtilAdapter.checkFrameworkUID(context);

        servletUtilAdapter.setCSPHeaders(defDescriptor, request, response);
        context.setApplicationDescriptor(defDescriptor);
        definitionService.updateLoaded(defDescriptor);
        context.setPreloading(true);

        // Knowing the app, we can do the HTTP headers, so of which depend on
        // the app in play, so we couldn't do this earlier.
        T def = definitionService.getDefinition(defDescriptor);

        if (!context.isTestMode() && !context.isDevMode()) {
            String defaultNamespace = configAdapter.getDefaultNamespace();
            DefDescriptor<?> referencingDescriptor = (defaultNamespace != null && !defaultNamespace.isEmpty())
                    ? definitionService.getDefDescriptor(String.format("%s:servletAccess", defaultNamespace),
                            ApplicationDef.class)
                    : null;
            definitionService.assertAccess(referencingDescriptor, def);
        }

        // Always set no cache.
        servletUtilAdapter.setNoCache(response);

        // Prevents Mhtml Xss exploit:
        PrintWriter out = response.getWriter();
        out.write("\n    ");

        Component template = serverService.writeTemplate(context, def, getComponentAttributes(request), out);

        writeModuleCompatDowngradeJs(context, out);
        for(InlineJSAppender appender : MoreObjects.firstNonNull(inlineJsAppenders, ImmutableList.<InlineJSAppender>of())){
            appender.append(def, context, out);
        }

        renderingService.render(template, null, out);
    }

    /**
     * Add downgrade.js content into inline.js if module compat mode is forced
     *
     * @param context AuraContext
     * @param out inline.js output
     */
    private void writeModuleCompatDowngradeJs(AuraContext context, PrintWriter out) {
        if (context.forceCompat()) {
            if (downgradeJs == null) {
                ResourceLoader resourceLoader = this.configAdapter.getResourceLoader();
                try {
                    URL url = resourceLoader.getResource(DOWNGRADE_JS_RESOURCE_PATH);
                    downgradeJs = Resources.toString(url, Charsets.UTF_8);
                } catch (IOException e) {
                    downgradeJs = "";
                }
            }
            out.append(downgradeJs).append(";");
        }
    }


    @Override
    public void write(HttpServletRequest request, HttpServletResponse response, AuraContext context)
            throws IOException {
        try {
            // For appcached apps, inline is not expected to return a CSRF token
            if (!manifestUtil.isManifestEnabled()) {
                String token = request.getParameter("jwt");
                if (!configAdapter.validateBootstrap(token)) {
                    throw new AuraJWTError("Invalid jwt parameter");
                }
            }
            DefDescriptor<? extends BaseComponentDef> appDefDesc = context.getLoadingApplicationDescriptor();
            if (appDefDesc != null) {
                internalWrite(request, response, appDefDesc, context);
            } else {
                servletUtilAdapter.send404(request.getServletContext(), request, response);
            }
        } catch (Throwable t) {
            if (t instanceof AuraJWTError) {
                // If jwt validation fails, just 404. Do not gack.
                try {
                    servletUtilAdapter.send404(request.getServletContext(), request, response);
                } catch (ServletException e) {
                    // ignore
                }
            } else {
                servletUtilAdapter.handleServletException(t, false, context, request, response, false);
                exceptionAdapter.handleException(new AuraResourceException(getName(), response.getStatus(), t));
            }
        }
    }

}
