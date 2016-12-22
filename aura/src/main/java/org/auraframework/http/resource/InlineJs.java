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
import java.io.PrintWriter;
import java.util.Map;

import javax.annotation.PostConstruct;
import javax.inject.Inject;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.auraframework.annotations.Annotations.ServiceComponent;
import org.auraframework.def.ApplicationDef;
import org.auraframework.def.BaseComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.DefDescriptor.DefType;
import org.auraframework.http.ManifestUtil;
import org.auraframework.instance.Component;
import org.auraframework.service.ContextService;
import org.auraframework.service.RenderingService;
import org.auraframework.system.AuraContext;
import org.auraframework.system.AuraContext.Format;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.resource.ResourceLoader;

import com.google.common.collect.Maps;

@ServiceComponent
public class InlineJs extends AuraResourceImpl {

    private static final String WALLTIME_FILE_PATH = "/aura/resources/walltime-js/olson/walltime-data_";
    private static final String WALLTIME_INIT_JS = ";(function(){ if(window.WallTime.init) { window.WallTime.init(window.WallTime.data.rules, window.WallTime.data.zones); } }).call(this);";
    private static final Map<String, String> WALLTIME_TZ_CONTENT = Maps.newConcurrentMap();

    public InlineJs() {
        super("inline.js", Format.JS);
    }
    
    private ContextService contextService;
    private RenderingService renderingService;
    private ManifestUtil manifestUtil;
    
    @Inject
    public void setContextService(ContextService contextService) {
        this.contextService = contextService;
    }
    
    @Inject
    public void setRenderingService(RenderingService renderingService) {
        this.renderingService = renderingService;
    }
    
    @PostConstruct
    public void initManifest() {
        this.manifestUtil = new ManifestUtil(definitionService, contextService, configAdapter);
    }
    
    private void appendInlineJS(Component template, Appendable out) throws IOException, QuickFixException {

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
    }
    
    private <T extends BaseComponentDef> void internalWrite(HttpServletRequest request,
            HttpServletResponse response, DefDescriptor<T> defDescriptor, AuraContext context)
            throws IOException, QuickFixException {

        servletUtilAdapter.checkFrameworkUID(context);

        servletUtilAdapter.setCSPHeaders(defDescriptor, request, response);
        context.setApplicationDescriptor(defDescriptor);
        definitionService.updateLoaded(defDescriptor);

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

        if (shouldCacheHTMLTemplate(defDescriptor, request, context)) {
            servletUtilAdapter.setLongCache(response);
        } else {
            servletUtilAdapter.setNoCache(response);
        }

        // Prevents Mhtml Xss exploit:
        PrintWriter out = response.getWriter();
        out.write("\n    ");

        Component template = serverService.writeTemplate(context, def, getComponentAttributes(request), out);
        appendInlineJS(template, out);
        renderingService.render(template, null, out);
    }

    private boolean shouldCacheHTMLTemplate(DefDescriptor<? extends BaseComponentDef> appDefDesc,
            HttpServletRequest request, AuraContext context) throws QuickFixException {
        if (appDefDesc != null && appDefDesc.getDefType().equals(DefType.APPLICATION)) {
            Boolean isOnePageApp = ((ApplicationDef)definitionService.getDefinition(appDefDesc)).isOnePageApp();
            if (isOnePageApp != null) {
                return isOnePageApp;
            }
        }
        return !manifestUtil.isManifestEnabled(request);
    }

    @Override
    public void write(HttpServletRequest request, HttpServletResponse response, AuraContext context)
            throws IOException {
        try {
            DefDescriptor<? extends BaseComponentDef> appDefDesc = context.getLoadingApplicationDescriptor();
            internalWrite(request, response, appDefDesc, context);
        } catch (Throwable t) {
            servletUtilAdapter.handleServletException(t, false, context, request, response, false);
            exceptionAdapter.handleException(new AuraResourceException(getName(), response.getStatus(), t));
        }
    }

}
