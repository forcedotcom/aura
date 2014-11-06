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
package org.auraframework.http;

import java.io.IOException;
import java.io.StringWriter;
import java.io.Writer;
import java.net.URI;
import java.util.Map;
import java.util.Set;

import javax.servlet.ServletConfig;
import javax.servlet.ServletContext;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.lang3.StringUtils;
import org.apache.http.HttpHeaders;
import org.auraframework.Aura;
import org.auraframework.def.ApplicationDef;
import org.auraframework.def.BaseComponentDef;
import org.auraframework.def.ComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.DefDescriptor.DefType;
import org.auraframework.instance.Component;
import org.auraframework.service.DefinitionService;
import org.auraframework.service.InstanceService;
import org.auraframework.system.AuraContext;
import org.auraframework.system.MasterDefRegistry;
import org.auraframework.throwable.ClientOutOfSyncException;
import org.auraframework.throwable.quickfix.QuickFixException;

import com.google.common.collect.Maps;

/**
 * The aura resource servlet.
 * 
 * This servlet serves up the application content for 'preloaded' definitions. It should be cacheable, which means that
 * the only context used should be the context sent as part of the URL. If any other information is required, caching
 * will cause bugs.
 * 
 * Note that this servlet should be very careful to not attempt to force the client to re-sync (except for manifest
 * fetches), since these calls may well be to re-populate a cache. In general, we should send back at least the basics
 * needed for the client to survive. All resets should be done from {@link AuraServlet}, or when fetching the manifest
 * here.
 */
public class AuraResourceServlet extends AuraBaseServlet {

    private static final String RESOURCE_URLS = "resourceURLs";
    private static final String LAST_MOD = "lastMod";
    private static final String UID = "uid";
    private static final long serialVersionUID = -3642790050433142397L;
    public static final String ORIG_REQUEST_URI = "aura.origRequestURI";

    private static ServletContext servletContext;

    /**
     * check the top level component/app.
     * 
     * This routine checks to see that we have a valid top level component. If our top level component is out of sync,
     * we have to ignore it here, but we _must_ force the client to not cache the response.
     * 
     * If there is a QFE, we substitute the QFE descriptor for the one given us, and continue. Again, we cannot allow
     * caching.
     * 
     * Finally, if there is no descriptor given, we simply ignore the request and give them an empty response. Which is
     * done here by returning null.
     * 
     * Also note that this handles the 'if-modified-since' header, as we want to tell the browser that nothing changed
     * in that case.
     * 
     * @param request the request (for exception handling)
     * @param response the response (for exception handling)
     * @param context the context to get the definition.
     * @return the set of descriptors we are sending back, or null in the case that we handled the response.
     * @throws IOException if there was an IO exception handling a client out of sync exception
     * @throws ServletException if there was a problem handling the out of sync
     */
    private Set<DefDescriptor<?>> handleTopLevel(HttpServletRequest request, HttpServletResponse response,
            AuraContext context) throws IOException, ServletException {
        DefDescriptor<? extends BaseComponentDef> appDesc = context.getApplicationDescriptor();
        DefinitionService definitionService = Aura.getDefinitionService();
        MasterDefRegistry mdr = context.getDefRegistry();

        context.setPreloading(true);
        if (appDesc == null) {
            //
            // This means we have nothing to say to the client, so the response is
            // left completely empty.
            //
            return null;
        }
        long ifModifiedSince = request.getDateHeader(HttpHeaders.IF_MODIFIED_SINCE);
        String uid = context.getUid(appDesc);
        try {
            try {
                definitionService.updateLoaded(appDesc);
                if (uid != null && ifModifiedSince != -1) {
                    //
                    // In this case, we have an unmodified descriptor, so just tell
                    // the client that.
                    //
                    response.sendError(HttpServletResponse.SC_NOT_MODIFIED);
                    return null;
                }
            } catch (ClientOutOfSyncException coose) {
                //
                // We can't actually handle an out of sync here, since we are doing a
                // preload. We have to ignore it, and continue as if nothing happened.
                // But in the process, we make sure to set 'no-cache' so that the result
                // is thrown away. This may actually not give the right result in bizarre
                // corner cases... beware cache inconsistencied on revert after a QFE.
                //
                // We actually probably should do something different, like send a minimalist
                // set of stuff to make the client re-try.
                //
                setNoCache(response);
                String oosUid = mdr.getUid(null, appDesc);
                return mdr.getDependencies(oosUid);
            }
        } catch (QuickFixException qfe) {
            DefDescriptor<ComponentDef> qfeDescriptor;

            //
            // A quickfix exception means that we couldn't compile something.
            // In this case, we still want to preload things, but we want to preload
            // quick fix values, note that we force NoCache here.
            //
            setNoCache(response);

            qfeDescriptor = definitionService.getDefDescriptor("markup://auradev:quickFixException",
                    ComponentDef.class);
            context.setLoadingApplicationDescriptor(qfeDescriptor);
            String qfeUid;
            try {
                qfeUid = mdr.getUid(null, qfeDescriptor);
            } catch (QuickFixException death) {
                //
                // Ok, we really can't handle this here, so just punt. This means that
                // the quickfix display is broken, and whatever we try will give us grief.
                //
                response.sendError(HttpServletResponse.SC_NOT_FOUND);
                return null;
            }
            return mdr.getDependencies(qfeUid);
        }
        setLongCache(response);
        if (uid == null) {
            uid = context.getUid(appDesc);
        }
        return mdr.getDependencies(uid);
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
     * @throws IOException if unable to write out the response
     */
    private void writeManifest(HttpServletRequest request, HttpServletResponse response) throws IOException {
        AuraContext context = Aura.getContextService().getCurrentContext();

        setNoCache(response);

        try {
            //
            // First, we make sure that the manifest is enabled.
            //
            if (!ManifestUtil.isManifestEnabled(request)) {
                response.setStatus(HttpServletResponse.SC_NOT_FOUND);
                return;
            }
            //
            // Now we validate the cookie, which includes loop detection.
            // this routine sets the response code.
            //
            if (!ManifestUtil.checkManifestCookie(request, response)) {
                return;
            }

            boolean appOk = false;

            DefDescriptor<? extends BaseComponentDef> descr = null;
            try {
                descr = context.getApplicationDescriptor();

                if (descr != null) {
                    Aura.getDefinitionService().updateLoaded(descr);
                    appOk = true;
                }
            } catch (QuickFixException qfe) {
                //
                // ignore qfe, since we really don't care... the manifest will be 404ed.
                // This will eventually cause the browser to give up. Note that this case
                // should almost never occur, as it requires the qfe to be introduced between
                // the initial request (which will not set a manifest if it gets a qfe) and
                // the manifest request.
                //
            } catch (ClientOutOfSyncException coose) {
                //
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
            String appUid = getContextAppUid();
            attribs.put(LAST_MOD,
                    String.format("app=%s, FW=%s", appUid, Aura.getConfigAdapter().getAuraFrameworkNonce()));
            attribs.put(UID, appUid);
            StringWriter sw = new StringWriter();

            for (String s : getStyles()) {
                sw.write(s);
                sw.write('\n');
            }

            for (String s : getScripts()) {
                sw.write(s);
                sw.write('\n');
            }

            // Add in any application specific resources
            if (descr != null && descr.getDefType().equals(DefType.APPLICATION)) {
                ApplicationDef def = (ApplicationDef) descr.getDef();
                for (String s : def.getAdditionalAppCacheURLs()) {
                    sw.write(s);
                    sw.write('\n');
                }
            }

            attribs.put(RESOURCE_URLS, sw.toString());

            DefinitionService definitionService = Aura.getDefinitionService();
            InstanceService instanceService = Aura.getInstanceService();
            DefDescriptor<ComponentDef> tmplDesc = definitionService
                    .getDefDescriptor("ui:manifest", ComponentDef.class);
            Component tmpl = instanceService.getInstance(tmplDesc, attribs);
            Aura.getRenderingService().render(tmpl, response.getWriter());
        } catch (Exception e) {
            Aura.getExceptionAdapter().handleException(e);
            // Can't throw exception here: to set manifest OBSOLETE
            response.setStatus(HttpServletResponse.SC_NOT_FOUND);
        }
    }

    private void writeCss(HttpServletRequest request, Set<DefDescriptor<?>> dependencies, AuraContext context,
            Writer out) throws IOException, QuickFixException {
        if (isAppRequest(request)) {
            Aura.getServerService().writeAppCss(dependencies, out);
        } else {
            Aura.getClientLibraryService().writeCss(context, out);
        }
    }

    private boolean isAppRequest(HttpServletRequest request) {
        String type = request.getParameter(AuraResourceRewriteFilter.TYPE_PARAM);
        if (StringUtils.endsWithIgnoreCase(type, "app")) {
            return true;
        }
        return false;
    }

    private void writeJs(HttpServletRequest request, Set<DefDescriptor<?>> dependencies, AuraContext context,
            Writer out) throws IOException, QuickFixException {
        if (isAppRequest(request)) {
            Aura.getServerService().writeDefinitions(dependencies, out);
        } else {
            Aura.getClientLibraryService().writeJs(context, out);
        }
    }

    /**
     * Serves up CSS or JS resources for a list of namespaces.
     * 
     * URLs follow the format:
     * 
     * <pre>
     * /auraResource?aura.namespaces=&lt;namespace1&gt;/&lt;namespace2&gt;/&lt;namespace3&gt;/...&aura.format=&lt;format&gt;
     * </pre>
     * 
     * Access to this servlet may also follow a shortened URL form specified in aura.conf.
     * 
     * <p>
     * Examples: -
     * 
     * <pre>
     * /l/123123123/aura/os/mobile.css
     * </pre>
     * 
     * (The number is the last mod timestamp) -
     * 
     * <pre>
     * /l/213423423/aura/os.js
     * </pre>
     * 
     * -
     * 
     * <pre>
     * /l/aura/os/mobile.css
     * </pre>
     * 
     * -
     * 
     * <pre>
     * /l/aura/os.js
     * </pre>
     * 
     * </p>
     * 
     * @see javax.servlet.http.HttpServlet#doGet(javax.servlet.http.HttpServletRequest,
     *      javax.servlet.http.HttpServletResponse)
     */
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        AuraContext context = Aura.getContextService().getCurrentContext();
        Set<DefDescriptor<?>> topLevel;
        response.setCharacterEncoding(AuraBaseServlet.UTF_ENCODING);
        setLongCache(response);
        AuraContext.Format format = context.getFormat();
        response.setContentType(getContentType(format));
        setBasicHeaders(response);
        switch (format) {
        case MANIFEST:
            writeManifest(request, response);
            break;
        case CSS:
            topLevel = handleTopLevel(request, response, context);
            if (topLevel == null) {
                return;
            }
            try {
                writeCss(request, topLevel, context, response.getWriter());
            } catch (Throwable t) {
                handleServletException(t, true, context, request, response, true);
            }
            break;
        case JS:
            topLevel = handleTopLevel(request, response, context);
            if (topLevel == null) {
                return;
            }
            try {
                writeJs(request, topLevel, context, response.getWriter());
            } catch (Throwable t) {
                handleServletException(t, true, context, request, response, true);
            }
            break;
        case JSON:
            try {
                Aura.getConfigAdapter().validateCSRFToken(csrfToken.get(request));
            } catch (Throwable t) {
                handleServletException(t, true, context, request, response, false);
                return;
            }
            topLevel = handleTopLevel(request, response, context);
            if (topLevel == null) {
                return;
            }
            try {
                Aura.getServerService().writeComponents(topLevel, response.getWriter());
            } catch (Throwable t) {
                handleServletException(t, true, context, request, response, true);
            }
            break;
        default:
            break;
        }
    }

    protected boolean checkAccess(DefDescriptor<?> desc) {
        return true;
    }

    public static boolean isResourceLocallyAvailable(String resourceURI) {
        if (resourceURI != null && resourceURI.startsWith("/") && servletContext != null) {
            try {
                URI uri = URI.create(resourceURI);
                if (uri != null) {
                    ServletContext c = servletContext.getContext(uri.getPath());
                    if (c != null && c.getResource(uri.getPath()) != null) {
                        return true;
                    }
                }
            } catch (Exception e) {
            }
        }
        return false;
    }

    @Override
    public void init(ServletConfig config) {
        servletContext = config.getServletContext();
    }
}
