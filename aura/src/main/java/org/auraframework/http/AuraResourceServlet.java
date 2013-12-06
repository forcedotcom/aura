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
import java.net.URI;
import java.util.Collection;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.SortedMap;
import javax.servlet.ServletConfig;
import javax.servlet.ServletContext;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.lang3.mutable.MutableInt;
import org.apache.http.HttpHeaders;
import org.auraframework.Aura;
import org.auraframework.def.ApplicationDef;
import org.auraframework.def.BaseComponentDef;
import org.auraframework.def.ComponentDef;
import org.auraframework.def.ControllerDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.DefDescriptor.DefType;
import org.auraframework.def.Definition;
import org.auraframework.def.EventDef;
import org.auraframework.def.StyleDef;
import org.auraframework.instance.Component;
import org.auraframework.service.DefinitionService;
import org.auraframework.service.InstanceService;
import org.auraframework.system.AuraContext;
import org.auraframework.system.AuraContext.Mode;
import org.auraframework.system.MasterDefRegistry;
import org.auraframework.system.SourceListener;
import org.auraframework.throwable.AuraUnhandledException;
import org.auraframework.throwable.ClientOutOfSyncException;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.javascript.JavascriptProcessingError;
import org.auraframework.util.javascript.JavascriptWriter;

import com.google.common.base.Functions;
import com.google.common.collect.ImmutableSortedMap;
import com.google.common.collect.Maps;
import com.google.common.collect.Ordering;
import com.google.common.collect.Sets;

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
     * Provide a better way of distinguishing templates from styles..
     * 
     * This is used to apply the style definition filter for 'templates', but is
     * getting rather further embedded in code.
     * 
     * TODO: W-1486762
     */
    private static interface TempFilter {
        public boolean apply(DefDescriptor<?> descriptor);
    }

    private static <P extends Definition, D extends P> Set<DefDescriptor<D>> filterDependencies(
            Class<D> defType, Set<DefDescriptor<?>> dependencies, TempFilter extraFilter)
            throws QuickFixException {
        Set<DefDescriptor<D>> out = Sets.newLinkedHashSet();

        for (DefDescriptor<?> descriptor : dependencies) {
            if (defType.isAssignableFrom(descriptor.getDefType().getPrimaryInterface())
                    && (extraFilter == null || extraFilter.apply(descriptor))) {
                @SuppressWarnings("unchecked")
                DefDescriptor<D> dd = (DefDescriptor<D>) descriptor;
                out.add(dd);
            }
        }
        return out;
    }

    private static <P extends Definition, D extends P> Set<D> filterAndLoad(Class<D> defType,
            Set<DefDescriptor<?>> dependencies, TempFilter extraFilter) throws QuickFixException {

        Set<D> out = Sets.newLinkedHashSet();
        Set<DefDescriptor<D>> filtered = filterDependencies(defType, dependencies, extraFilter);
        for (DefDescriptor<D> dd : filtered) {
            out.add(dd.getDef());
        }
        return out;
    }

    /**
     * check the top level component/app.
     * 
     * This routine checks to see that we have a valid top level component. If our top level component is out
     * of sync, we have to ignore it here, but we _must_ force the client to not cache the response.
     *
     * If there is a QFE, we substitute the QFE descriptor for the one given us, and continue. Again, we cannot
     * allow caching.
     *
     * Finally, if there is no descriptor given, we simply ignore the request and give them an empty response. Which
     * is done here by returning null.
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
     * identical, the resources are served from the AppCache. Otherwise, the resources are requested from the server
     * and the AppCache is updated.
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

            //
            // TODO: why do we want this restriction? Does it actually help us in
            // any way?
            //
            String originalPath = (String) request.getAttribute(AuraResourceServlet.ORIG_REQUEST_URI);
            if (originalPath != null) {
                String currentManifestUrl = ManifestUtil.getManifestUrl();
                if (!originalPath.equals(currentManifestUrl)) {
                    response.setStatus(HttpServletResponse.SC_NOT_FOUND);
                    return;
                }
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
            attribs.put(LAST_MOD,
                    String.format("app=%s, FW=%s", getContextAppUid(), Aura.getConfigAdapter().getAuraFrameworkNonce()));
            attribs.put(UID, getContextAppUid());
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

    /**
     * write out CSS.
     * 
     * This writes out CSS for the preloads + app to the response. Note that currently it only writes out the preloads
     * because of the missing capability to do the apps will get fixed by W-1166679
     * 
     * @param out the appendable
     * @throws IOException if unable to write to the response
     * @throws QuickFixException if the definitions could not be compiled.
     */
    public static void writeCss(Set<DefDescriptor<?>> dependencies, Appendable out)
            throws IOException, QuickFixException {
        AuraContext context = Aura.getContextService().getCurrentContext();
        
		Mode mode = context.getMode();
        final boolean minify = !(mode.isTestMode() || mode.isDevMode());
        final String mKey = minify ? "MIN:" : "DEV:";

        DefDescriptor<?> applicationDescriptor = context.getLoadingApplicationDescriptor();
        final String uid = context.getUid(applicationDescriptor);
        final String key = "CSS:" + mKey + uid;

        context.setPreloading(true);

        String cached = context.getDefRegistry().getCachedString(uid, applicationDescriptor, key);
        if (cached == null) {

            Map<DefDescriptor<StyleDef>, MutableInt> styleFrequencyMap = createStyleFrequencyMap(dependencies);
            Set<StyleDef> orderedStyleDefs = orderStyles(styleFrequencyMap);

            StringBuffer sb = new StringBuffer();
            Aura.getSerializationService().writeCollection(orderedStyleDefs, StyleDef.class, sb, "CSS");
            cached = sb.toString();
            context.getDefRegistry().putCachedString(uid, applicationDescriptor, key, cached);
        }
        out.append(cached);
    }

    /**
     * Orders StyleDefs with supers (ancestors) first then alphabetical
     * 
     * @param styles style def descriptors
     * @return set of ordered style defs
     * @throws QuickFixException
     */
    private static Set<StyleDef> orderStyles(Map<DefDescriptor<StyleDef>, MutableInt> styles)
            throws QuickFixException {

        /**
         * Style map includes frequency (calculated by its number of descendants). We sort by this frequency to
         * order the CSS by ancestors first then alphabetical.
         * 
         * Comparing DefDescriptor is cleaner than comparing Definition
         */
        Comparator<DefDescriptor<StyleDef>> frequencyComparator = Ordering.natural().reverse()
            .onResultOf(Functions.forMap(styles)).compound(Ordering.natural());
        SortedMap<DefDescriptor<StyleDef>, MutableInt> sorted = ImmutableSortedMap.copyOf(styles, frequencyComparator);

        // We ultimately want StyleDefs so here they are
        Set<StyleDef> styleDefs = Sets.newLinkedHashSet();
        for (DefDescriptor<StyleDef> sdd : sorted.keySet()) {
            StyleDef def = sdd.getDef();
            if (def != null) {
                styleDefs.add(def);
            }
        }

        return styleDefs;
    }

    /**
     * Returns map of styles as key and frequency (based on number of descendants) as value
     * 
     * @param dependencies dependencies
     * @return sorted map
     * @throws QuickFixException
     */
    private static Map<DefDescriptor<StyleDef>, MutableInt> createStyleFrequencyMap(Set<DefDescriptor<?>> dependencies)
            throws QuickFixException {
        Map<DefDescriptor<StyleDef>, MutableInt> frequencyMap = Maps.newHashMap();
        if (dependencies == null) {
            return null;
        }
        for (DefDescriptor<?> defDescriptor : dependencies) {
            // for each component we want to calculate its frequency
            if (defDescriptor.getDefType() == DefType.COMPONENT || defDescriptor.getDefType() == DefType.APPLICATION) {
                @SuppressWarnings("unchecked")
                DefDescriptor<? extends BaseComponentDef> cd = (DefDescriptor<ComponentDef>) defDescriptor;
                addStyleFrequency(frequencyMap, cd);
            } else if (defDescriptor.getDefType() == DefType.STYLE &&
                    defDescriptor.getName().toLowerCase().endsWith("template") &&
                    !frequencyMap.containsKey(defDescriptor)) {
                @SuppressWarnings("unchecked")
                DefDescriptor<StyleDef> sd = (DefDescriptor<StyleDef>) defDescriptor;
                // any remaining style that's not a template and isn't already in map
                frequencyMap.put(sd, new MutableInt(0));
            }
        }

        return frequencyMap;
    }

    /**
     * Adds frequency to particular style based on their component's descendants. All other types just get 1 as its
     * frequency. Adds component's frequency to its style to make ordering CSS easier.
     * 
     * @param frequencyMap dependencies frequency map
     * @param descriptor descriptor to add
     */
    private static <D extends BaseComponentDef>
        void addStyleFrequency(Map<DefDescriptor<StyleDef>, MutableInt> frequencyMap,
                                          DefDescriptor<D> descriptor)
            throws QuickFixException {
        D def = descriptor.getDef();
        DefDescriptor<StyleDef> styleDefDescriptor = def.getStyleDescriptor();
        if (styleDefDescriptor != null) {
            // we only need the style of the component
            MutableInt freq = frequencyMap.get(styleDefDescriptor);
            if (freq == null) {
                int initial = 1;
                if (styleDefDescriptor.getNamespace().equals("aura") ||
                        styleDefDescriptor.getNamespace().equals("ui")) {
                    // aura and ui namespace component css should always be above others so that they can be overridden
                    initial = 6;
                }
                frequencyMap.put(styleDefDescriptor, new MutableInt(initial));
            } else {
                freq.increment();
            }
        }

        DefDescriptor<? extends BaseComponentDef> superDescriptor = def.getExtendsDescriptor();
        // only when extends component is not the base aura:​component which is the default extends
        if (superDescriptor != null && !superDescriptor.equals(def.getDefaultExtendsDescriptor())) {
            // give supers addition freq to ensure supers are before descendants when sorted
            // for instances where component is extended only once
            addStyleFrequency(frequencyMap, superDescriptor);
        }
    }

    /**
     * Write out a set of components in JSON.
     * 
     * This writes out the entire set of components from the namespaces in JSON.
     */
    private void writeComponents(Set<DefDescriptor<?>> dependencies, Appendable out)
            throws ServletException, IOException, QuickFixException {
        AuraContext context = Aura.getContextService().getCurrentContext();

        context.setPreloading(true);
        Aura.getSerializationService().writeCollection(filterAndLoad(BaseComponentDef.class, dependencies, null),
            BaseComponentDef.class, out);
    }

    private static class AuraControllerFilter implements TempFilter {
        @Override
        public boolean apply(DefDescriptor<?> descriptor) {
            return descriptor.getPrefix().equalsIgnoreCase("aura") && descriptor.getDefType() == DefType.CONTROLLER;
        }
    }

    private static final AuraControllerFilter ACF = new AuraControllerFilter();

    /**
     * write out the complete set of definitions in JS.
     * 
     * This generates a complete set of definitions for an app in JS+JSON.
     * 
     */
    public static void writeDefinitions(Set<DefDescriptor<?>> dependencies, Appendable out)
            throws IOException, QuickFixException {
        AuraContext context = Aura.getContextService().getCurrentContext();
        
		Mode mode = context.getMode();
        final boolean minify = !(mode.isTestMode() || mode.isDevMode());
        final String mKey = minify ? "MIN:" : "DEV:";
        //
        // create a temp buffer in case anything bad happens while we're processing this.
        // don't want to end up with a half a JS init function
        //
        // TODO: get rid of this buffering by adding functionality to Json.serialize that will help us
        // make sure serialized JS is valid, non-error-producing syntax if an exception happens in the
        // middle of serialization.
        //

        context.setPreloading(true);
        DefDescriptor<?> applicationDescriptor = context.getLoadingApplicationDescriptor();
        final String uid = context.getUid(applicationDescriptor);
        final String key = "JS:" + mKey + uid;
        String cached = context.getDefRegistry().getCachedString(uid, applicationDescriptor, key);

        if (cached == null) {



            StringBuilder sb = new StringBuilder();


            sb.append("$A.clientService.initDefs({");

            // append component definitions
            sb.append("componentDefs:");
            Collection<BaseComponentDef> defs = filterAndLoad(BaseComponentDef.class, dependencies, null);
            Aura.getSerializationService().writeCollection(defs, BaseComponentDef.class, sb, "JSON");
            sb.append(",");

            // append event definitions
            sb.append("eventDefs:");
            Collection<EventDef> events = filterAndLoad(EventDef.class, dependencies, null);
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
            sb.append("controllerDefs:");
            Collection<ControllerDef> controllers = filterAndLoad(ControllerDef.class, dependencies, ACF);
            Aura.getSerializationService().writeCollection(controllers, ControllerDef.class, sb, "JSON");

            sb.append("});");

            cached = sb.toString();
            // only use closure compiler in prod mode, due to compile cost
            if (minify) {
                StringWriter sw = new StringWriter();
                List<JavascriptProcessingError> errors = JavascriptWriter.CLOSURE_SIMPLE.compress(cached, sw, key);
                if (errors == null || errors.isEmpty()) {
                    // For now, just use the non-compressed version if we can't get
                    // the compression to work.
                    cached = sw.toString();
                }
            }
            context.getDefRegistry().putCachedString(uid, applicationDescriptor, key, cached);
        }

        out.append(cached);
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
                writeCss(topLevel, response.getWriter());
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
                writeDefinitions(topLevel, response.getWriter());
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
                writeComponents(topLevel, response.getWriter());
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
