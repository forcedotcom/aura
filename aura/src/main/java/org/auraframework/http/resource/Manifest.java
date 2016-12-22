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
import java.io.StringWriter;
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
import org.auraframework.def.DefDescriptor.DefType;
import org.auraframework.http.ManifestUtil;
import org.auraframework.instance.Component;
import org.auraframework.service.ContextService;
import org.auraframework.service.RenderingService;
import org.auraframework.system.AuraContext;
import org.auraframework.system.AuraContext.Format;
import org.auraframework.throwable.ClientOutOfSyncException;
import org.auraframework.throwable.quickfix.QuickFixException;

import com.google.common.collect.Maps;

@ServiceComponent
public class Manifest extends AuraResourceImpl {
    // ui:manifest attribute names
    private static final String LAST_MOD = "lastMod";
    private static final String UID = "uid";
    private static final String RESOURCE_URLS = "resourceURLs";
    private static final String FALLBACK_URLS = "fallbackURLs";

    // FIXME: this is horrendous we actually render the manifest as a component.
    private RenderingService renderingService;
    private ContextService contextService;
    private ManifestUtil manifestUtil;

    public Manifest() {
        super("app.manifest", Format.MANIFEST);
    }

    @PostConstruct
    public void createManifestUtil() {
        this.manifestUtil = new ManifestUtil(definitionService, contextService, configAdapter);
    }

    /**
     * Write out the manifest.
     *
     * This writes out the full manifest for an application so that we can use the AppCache.
     *
     * The manifest contains CSS and JavaScript URLs. These specified resources are copied into the AppCache with the
     * HTML template. When the page is reloaded, the existing manifest is compared to the new manifest. If they are
     * identical, the resources are served from the AppCache. Otherwise, the resources are requested from the server and
     * the AppCache is updated.
     *
     * @param request the request
     * @param response the response
     * @param context the context
     * @throws IOException if unable to write out the response
     */
    @Override
    public void write(HttpServletRequest request, HttpServletResponse response, AuraContext context) throws IOException {
        servletUtilAdapter.setNoCache(response);
        try {
            Map<String,Object> attributes = getComponentAttributes(request);
            //
            // First, we make sure that the manifest is enabled.
            //
            if (!manifestUtil.isManifestEnabled(request)) {
                response.setStatus(HttpServletResponse.SC_NOT_FOUND);
                return;
            }
            //
            // Now we validate the cookie, which includes loop detection.
            // this routine sets the response code.
            //
            if (!manifestUtil.checkManifestCookie(request, response)) {
                return;
            }

            boolean appOk = false;

            DefDescriptor<? extends BaseComponentDef> descr = null;
            try {
                descr = context.getApplicationDescriptor();

                if (descr != null) {
                    definitionService.updateLoaded(descr);
                    appOk = true;
                }
            } catch (QuickFixException | ClientOutOfSyncException ex) {
                // QuickFixException
                // ignore qfe, since we really don't care... the manifest will be 404ed.
                // This will eventually cause the browser to give up. Note that this case
                // should almost never occur, as it requires the qfe to be introduced between
                // the initial request (which will not set a manifest if it gets a qfe) and
                // the manifest request.
                //

                // ClientOutOfSyncException
                // In this case, we want to force a reload... A 404 on the manifest is
                // supposed to handle this. we hope that the client will do the right
                // thing, and reload everything. Note that this case really should only
                // happen if the client already has content, and thus should be refreshing
                // However, there are very odd edge cases that we probably can't detect
                // without keeping server side state, such as the case that something
                // is updated between the initial HTML request and the manifest request.
                // Not sure what browsers will do in this case.
                //
            }

            if (!appOk) {
                response.setStatus(HttpServletResponse.SC_NOT_FOUND);
                return;
            }

            //
            // This writes both the app and framework signatures into
            // the manifest, so that if either one changes, the
            // manifest will change. Note that in most cases, we will
            // write these signatures in multiple places, but we just
            // need to make sure that they are in at least one place.
            //
            Map<String, Object> attribs = Maps.newHashMap();
            String appUid = getContextAppUid(context);
            String nonce = configAdapter.getAuraFrameworkNonce();
            // Since we don't get the UID from our URL, we set it here.
            context.setFrameworkUID(nonce);
            attribs.put(LAST_MOD, String.format("app=%s, FW=%s", appUid, nonce));
            attribs.put(UID, appUid);

            StringWriter sw = new StringWriter();

            String resetCssUrl = configAdapter.getResetCssURL();
            if (resetCssUrl != null) {
                sw.write(resetCssUrl);
                sw.write('\n');
            }

            for (String s : servletUtilAdapter.getStyles(context)) {
                sw.write(s);
                sw.write('\n');
            }

            for (String s : servletUtilAdapter.getScripts(context, true, true, attributes)) {
                sw.write(s);
                sw.write('\n');
            }

            // inline.js is included in appcache so the app may boot while offline
            sw.write(servletUtilAdapter.getInlineJsUrl(context, attributes));
            sw.write('\n');

            // Add locker service safe eval worker url
            String lockerWorkerURL = configAdapter.getLockerWorkerURL();
            if (lockerWorkerURL != null) {
                sw.write(lockerWorkerURL);
                sw.write('\n');
            }

            // Add in any application specific resources
            if (descr != null && descr.getDefType().equals(DefType.APPLICATION)) {
                ApplicationDef def = (ApplicationDef) definitionService.getDefinition(descr);
                for (String s : def.getAdditionalAppCacheURLs()) {
                    if (s != null) {
                        sw.write(s);
                        sw.write('\n');
                    }
                }
            }

            // Add token for bootstrap.js requests
            // because those requests are issued from script tags in app-cached files
            String token = configAdapter.generateJwtToken();
            if (token != null) {
                sw.write("# bootstrap token: ");
                sw.write(token);
                sw.write('\n');
            }

            attribs.put(RESOURCE_URLS, sw.toString());

            sw = new StringWriter();
            for (String s : servletUtilAdapter.getFrameworkFallbackScripts(context, true, attributes)) {
                sw.write(s);
                sw.write('\n');
            }
            attribs.put(FALLBACK_URLS, sw.toString());

            DefDescriptor<ComponentDef> tmplDesc = definitionService
                    .getDefDescriptor("ui:manifest", ComponentDef.class);
            Component tmpl = instanceService.getInstance(tmplDesc, attribs);
            renderingService.render(tmpl, response.getWriter());
        } catch (Exception e) {
            exceptionAdapter.handleException(e);
            // Can't throw exception here: to set manifest OBSOLETE
            response.setStatus(HttpServletResponse.SC_NOT_FOUND);
        }
    }

    /**
     * Gets the UID for the application descriptor of the current context, or {@code null} if there is no application
     * (probably because of a compile error).
     */
    public String getContextAppUid(AuraContext context) {
        DefDescriptor<? extends BaseComponentDef> app = context.getApplicationDescriptor();

        if (app != null) {
            try {
                return definitionService.getUid(null, app);
            } catch (QuickFixException e) {
                // This is perfectly possible, but the error is handled in more
                // contextually-sensible places. For here, we know there's no
                // meaningful uid, so we fall through and return null.
            }
        }
        return null;
    }

    /**
     * @param renderingService the renderingService to set
     */
    @Inject
    public void setRenderingService(RenderingService renderingService) {
        this.renderingService = renderingService;
    }

    @Inject
    public void setContextService(ContextService contextService) {
        this.contextService = contextService;
    }

    public void setManifestUtil(ManifestUtil manifestUtil) {
        this.manifestUtil = manifestUtil;
    }
}
