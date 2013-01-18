/*
 * Copyright (C) 2012 salesforce.com, inc.
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
import java.io.StringReader;
import java.io.StringWriter;
import java.net.URI;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

import javax.servlet.ServletConfig;
import javax.servlet.ServletContext;
import javax.servlet.ServletException;
import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.auraframework.Aura;
import org.auraframework.def.BaseComponentDef;
import org.auraframework.def.ComponentDef;
import org.auraframework.def.ControllerDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.Definition;
import org.auraframework.def.DependencyDef;
import org.auraframework.def.DescriptorFilter;
import org.auraframework.def.EventDef;
import org.auraframework.def.ThemeDef;
import org.auraframework.http.RequestParam.StringParam;
import org.auraframework.instance.Component;
import org.auraframework.service.DefinitionService;
import org.auraframework.service.InstanceService;
import org.auraframework.system.AuraContext;
import org.auraframework.system.AuraContext.Mode;
import org.auraframework.system.Client;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.javascript.JavascriptProcessingError;
import org.auraframework.util.javascript.JavascriptWriter;

import com.google.common.collect.Lists;
import com.google.common.collect.Maps;
import com.google.common.collect.Sets;

public class AuraResourceServlet extends AuraBaseServlet {

    private static final String RESOURCE_URLS = "resourceURLs";
    private static final String LAST_MOD = "lastMod";
    private static final String UID = "uid";
    private static final long serialVersionUID = -3642790050433142397L;
    public static final String ORIG_REQUEST_URI = "aura.origRequestURI";

    private static ServletContext servletContext;

    private final static StringParam errorParam = new StringParam(AURA_PREFIX + "error", 128, false);

    /**
     * A very hackish internal filter.
     * 
     * This is used to apply the theme definition filter for 'templates', which
     * appears to be quite bogus, but is getting rather further embedded in
     * code.
     * 
     * TODO: W-1486762
     */
    private static interface TempFilter {
        public boolean apply(DefDescriptor<?> descriptor);
    }

    /**
     * An internal routine to populate a set from a set of namespaces.
     * 
     * This will go away when W-1166679 is fixed.
     */
    private static <P extends Definition, D extends P> void addDefinitions(Class<D> preloadType,
            List<DescriptorFilter> filters, TempFilter extraFilter, Set<P> defs) throws QuickFixException {
        DefinitionService definitionService = Aura.getDefinitionService();

        for (DescriptorFilter filter : filters) {
            Set<DefDescriptor<?>> descriptors = definitionService.find(filter);

            for (DefDescriptor<?> descriptor : descriptors) {
                if (preloadType.isAssignableFrom(descriptor.getDefType().getPrimaryInterface())
                        && (extraFilter == null || extraFilter.apply(descriptor))) {
                    @SuppressWarnings("unchecked")
                    DefDescriptor<? extends D> dd = (DefDescriptor<? extends D>) descriptor;
                    P def = dd.getDef();
                    if (def != null) {
                        defs.add(def);
                    }
                }
            }
        }
    }

    /**
     * Get the set of filters for the current context using a different base
     * component.
     * 
     * Note the special handling here for quick fixes, as we need to be able to
     * get all of the appropriate definitions even when the app fails to
     * compile. In that case we reset everything and get the
     * auradev:quickFixException.
     * 
     * TODO: Note that this means the quickfix handling is hard wired, but I'm
     * not sure that this is an issue. We should maybe make it more obvious by
     * moving things around and using static strings..
     */
    private static List<DescriptorFilter> getFilters() throws QuickFixException {
        AuraContext context = Aura.getContextService().getCurrentContext();
        List<DescriptorFilter> filters = Lists.newArrayList();
        BaseComponentDef comp = null;
        try {
            DefDescriptor<? extends BaseComponentDef> appDesc = context.getApplicationDescriptor();
            if (appDesc != null) {
                comp = appDesc.getDef();
            }
        } catch (QuickFixException qfe) {
            comp = Aura.getDefinitionService().getDefinition("auradev:quickFixException", ComponentDef.class);
        }
        for (String ns : context.getPreloads()) {
            filters.add(new DescriptorFilter(ns, "*"));
        }
        if (comp != null && comp.getDependencies() != null) {
            for (DependencyDef dd : comp.getDependencies()) {
                filters.add(dd.getDependency());
            }
        }
        return filters;
    }

    /**
     * Write out the manifest.
     * 
     * This writes out the full manifest for an application so that we can use
     * the AppCache.
     * 
     * TODO: W-1486764 we should document what goes in the manifest and why.
     * 
     * @param request the request
     * @param response the response
     * @throws IOException if unable to write out the response
     */
    private void writeManifest(HttpServletRequest request, HttpServletResponse response) throws IOException {
        setNoCache(response);

        try {

            if (errorParam.get(request) != null) {
                addManifestErrorCookie(response);
                response.setStatus(HttpServletResponse.SC_NO_CONTENT);
                return;
            }

            if (!isManifestEnabled(request)) {
                response.setStatus(HttpServletResponse.SC_NOT_FOUND);
                return;
            }

            String originalPath = (String) request.getAttribute(AuraResourceServlet.ORIG_REQUEST_URI);
            if (originalPath != null) {
                String currentManifestUrl = AuraServlet.getManifest();
                if (!originalPath.equals(currentManifestUrl)) {
                    response.setStatus(HttpServletResponse.SC_NOT_FOUND);
                    deleteManifestCookie(response);
                    return;
                }
            }

            Map<String, Object> attribs = Maps.newHashMap();
            Cookie cookie = getManifestCookie(request);
            if (cookie != null) {
                if (MANIFEST_ERROR.equals(cookie.getValue())) {
                    response.setStatus(HttpServletResponse.SC_NOT_FOUND);
                    deleteManifestCookie(response);
                    return;
                } else {
                    int pos = cookie.getValue().indexOf(':');
                    if (pos > 0) {
                        attribs.put(UID, cookie.getValue().substring(0, pos));
                    }
                }
            }

            String serverLastMod = Long.toString(getManifestLastMod());
            attribs.put(LAST_MOD, serverLastMod);
            StringWriter sw = new StringWriter();
            for (String s : AuraServlet.getStyles()) {
                sw.write(s);
                sw.write('\n');
            }
            for (String s : AuraServlet.getScripts()) {
                sw.write(s);
                sw.write('\n');
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

    /**
     * A cache for compressed CSS output.
     * 
     * This is currently done by namespace, but it will eventually be by app
     * after W-1166679
     */
    private static final Map<String, String> cssCache = new ConcurrentHashMap<String, String>();

    private static class NonTemplateFilter implements TempFilter {
        @Override
        public boolean apply(DefDescriptor<?> descriptor) {
            return !descriptor.getName().toLowerCase().endsWith("template");
        }
    }

    private static final NonTemplateFilter NTF = new NonTemplateFilter();

    /**
     * write out CSS.
     * 
     * This writes out CSS for the preloads + app to the response. Note that
     * currently it only writes out the preloads because of the missing
     * capability to do the apps will get fixed by W-1166679
     * 
     * @param request the request
     * @param response the response
     * @throws IOException if unable to write to the response
     * @throws QuickFixWxception if the definitions could not be compiled.
     */
    public static void writeCss(Appendable out) throws IOException, QuickFixException {
        AuraContext context = Aura.getContextService().getCurrentContext();

        List<DescriptorFilter> filters = getFilters();
        Client.Type type = Aura.getContextService().getCurrentContext().getClient().getType();
        Mode mode = context.getMode();
        StringBuffer sb = new StringBuffer();

        context.setPreloading(true);
        for (DescriptorFilter filter : filters) {
            String key = type.name() + "$" + filter;

            String nsCss = !mode.isTestMode() ? cssCache.get(key) : null;
            if (nsCss == null) {
                Set<ThemeDef> nddefs = Sets.newHashSet();
                List<DescriptorFilter> shortlist = Lists.newArrayList();

                shortlist.add(filter);
                addDefinitions(ThemeDef.class, shortlist, NTF, nddefs);
                sb.setLength(0);
                Appendable tmp = mode.isTestMode() ? out : sb;
                Aura.getSerializationService().writeCollection(nddefs, ThemeDef.class, tmp, "CSS");
                if (!mode.isTestMode()) {
                    nsCss = sb.toString();
                    cssCache.put(key, nsCss);
                }
            }

            if (nsCss != null) {
                out.append(nsCss);
            }
        }
    }

    /**
     * Write out a set of components in JSON.
     * 
     * FIXME: I have no idea of why this is here when JS does effectively the
     * same thing with extra stuff.
     * 
     * This writes out the entire set of components from the namespaces in JSON.
     */
    private void writeComponents(Appendable out) throws ServletException, IOException, QuickFixException {
        AuraContext context = Aura.getContextService().getCurrentContext();
        List<DescriptorFilter> filters = getFilters();
        Set<BaseComponentDef> defs = Sets.newLinkedHashSet();

        addDefinitions(BaseComponentDef.class, filters, null, defs);
        context.setPreloading(true);
        Aura.getSerializationService().writeCollection(defs, BaseComponentDef.class, out);
    }

    private static final Map<String, String> definitionCache = new ConcurrentHashMap<String, String>();
    private static final List<DescriptorFilter> aurafilter = Arrays
            .asList(new DescriptorFilter[] { new DescriptorFilter("aura://*:*", "CONTROLLER") });

    /**
     * write out the complete set of definitions in JS.
     * 
     * This generates a complete set of definitions for an app in JS+JSON.
     * 
     */
    public static void writeDefinitions(Appendable out) throws IOException, QuickFixException {
        AuraContext context = Aura.getContextService().getCurrentContext();
        List<DescriptorFilter> filters = getFilters();
        Mode mode = context.getMode();
        //
        // create a temp buffer in case anything bad happens while we're
        // processing this.
        // don't want to end up with a half a JS init function
        // TODO: get rid of this buffering by adding functionality to
        // Json.serialize that will help us
        // make sure serialized JS is valid, non-error-producing syntax if an
        // exception happens in the
        // middle of serialization.
        //
        String ret = null;
        String key = null;

        context.setPreloading(true);
        if (!mode.isTestMode()) {
            StringBuilder keyBuilder = new StringBuilder();

            for (DescriptorFilter dm : filters) {
                keyBuilder.append(dm);
                keyBuilder.append(",");
            }
            key = keyBuilder.toString();

            ret = definitionCache.get(key);
            if (ret != null) {
                out.append(ret);
            }
        }
        StringBuilder sb = new StringBuilder();

        sb.append("$A.clientService.initDefs({");

        // append component definitions
        Set<BaseComponentDef> defs = Sets.newLinkedHashSet();

        addDefinitions(BaseComponentDef.class, filters, null, defs);
        sb.append("componentDefs:");
        Aura.getSerializationService().writeCollection(defs, BaseComponentDef.class, sb, "JSON");
        sb.append(",");

        // append event definitions
        sb.append("eventDefs:");
        Set<EventDef> events = Sets.newLinkedHashSet();
        addDefinitions(EventDef.class, filters, null, events);
        Aura.getSerializationService().writeCollection(events, EventDef.class, sb, "JSON");

        sb.append(",");

        //
        // append controller definitions
        // Dunno how this got to be this way. The code in the Format adaptor was
        // twisted and stupid,
        // as it walked the namespaces looking up the same descriptor, with a
        // string.format that had
        // the namespace but did not use it. This ends up just getting a single
        // controller.
        //
        Set<ControllerDef> controllers = Sets.newLinkedHashSet();
        addDefinitions(ControllerDef.class, aurafilter, null, controllers);
        sb.append("controllerDefs:");
        Aura.getSerializationService().writeCollection(controllers, ControllerDef.class, sb, "JSON");

        sb.append("});");

        ret = sb.toString();
        if (!mode.isTestMode()) {
            StringWriter sw = new StringWriter();
            List<JavascriptProcessingError> errors = JavascriptWriter.CompressionLevel.CLOSURE_SIMPLE.compress(
                    new StringReader(ret), sw, key);
            if (errors == null || errors.isEmpty()) {
                // For now, just use the non-compressed version if we can't get
                // the compression to work.
                ret = sw.toString();
            }
            //
            // Note that we just use put (last one wins), as we don't really
            // care what happens
            // when there is a race. Just that one of them gets in.
            definitionCache.put(key, ret);
        }
        out.append(ret);
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
     * Access to this servlet may also follow a shortened URL form specified in
     * aura.conf.
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
        response.setCharacterEncoding(AuraBaseServlet.UTF_ENCODING);
        long now = System.currentTimeMillis();
        long ifModifiedSince = request.getDateHeader("If-Modified-Since");
        if (ifModifiedSince != -1 && ifModifiedSince + 1000 > now) {
            response.sendError(HttpServletResponse.SC_NOT_MODIFIED);
            return;
        }

        setLongCache(response);
        AuraContext.Format format = context.getFormat();
        response.setContentType(getContentType(format));
        switch (format) {
        case MANIFEST:
            writeManifest(request, response);
            break;
        case CSS:
            try {
                writeCss(response.getWriter());
            } catch (Throwable t) {
                handleServletException(t, true, context, request, response, true);
            }
            break;
        case JS:
            try {
                writeDefinitions(response.getWriter());
            } catch (Throwable t) {
                handleServletException(t, true, context, request, response, true);
            }
            break;
        case JSON:
            try {
                Aura.getConfigAdapter().validateCSRFToken(csrfToken.get(request));
                writeComponents(response.getWriter());
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
