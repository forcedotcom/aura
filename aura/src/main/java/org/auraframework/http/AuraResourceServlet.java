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
import java.lang.ref.Reference;
import java.lang.ref.SoftReference;
import java.net.URI;
import java.util.Arrays;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.SortedMap;
import java.util.concurrent.ConcurrentHashMap;

import javax.servlet.ServletConfig;
import javax.servlet.ServletContext;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.lang3.mutable.MutableInt;
import org.auraframework.Aura;
import org.auraframework.def.ApplicationDef;
import org.auraframework.def.BaseComponentDef;
import org.auraframework.def.ComponentDef;
import org.auraframework.def.ControllerDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.DefDescriptor.DefType;
import org.auraframework.def.Definition;
import org.auraframework.def.DependencyDef;
import org.auraframework.def.DescriptorFilter;
import org.auraframework.def.EventDef;
import org.auraframework.def.StyleDef;
import org.auraframework.instance.Component;
import org.auraframework.service.DefinitionService;
import org.auraframework.service.InstanceService;
import org.auraframework.system.AuraContext;
import org.auraframework.system.AuraContext.Mode;
import org.auraframework.system.Client;
import org.auraframework.system.SourceListener;
import org.auraframework.throwable.ClientOutOfSyncException;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.javascript.JavascriptProcessingError;
import org.auraframework.util.javascript.JavascriptWriter;

import com.google.common.base.Functions;
import com.google.common.collect.ImmutableSortedMap;
import com.google.common.collect.Lists;
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
 * 
 * TODO: 'preload': use dependencies instead of namespaces here.
 */
public class AuraResourceServlet extends AuraBaseServlet {

    private static final String RESOURCE_URLS = "resourceURLs";
    private static final String LAST_MOD = "lastMod";
    private static final String UID = "uid";
    private static final long serialVersionUID = -3642790050433142397L;
    public static final String ORIG_REQUEST_URI = "aura.origRequestURI";

    private static ServletContext servletContext;
    private static SourceNotifier sourceNotifier = new SourceNotifier();

    static {
        Aura.getDefinitionService().subscribeToChangeNotification(sourceNotifier);
    }

    /**
     * A very hackish internal filter.
     * 
     * This is used to apply the style definition filter for 'templates', which appears to be quite bogus, but is
     * getting rather further embedded in code.
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
        Set<DefDescriptor<P>> defDescriptors = Sets.newHashSet();
        addDefDescriptors(preloadType, filters, extraFilter, defDescriptors);
        for (DefDescriptor<P> defDescriptor : defDescriptors) {
            defs.add(defDescriptor.getDef());
        }
    }

    private static <P extends Definition, D extends P> void addDefDescriptors(Class<D> preloadType,
            List<DescriptorFilter> filters, TempFilter extraFilter, Set<DefDescriptor<P>> defDescriptors)
            throws QuickFixException {
        DefinitionService definitionService = Aura.getDefinitionService();

        for (DescriptorFilter filter : filters) {
            Set<DefDescriptor<?>> descriptors = definitionService.find(filter);

            for (DefDescriptor<?> descriptor : descriptors) {
                if (preloadType.isAssignableFrom(descriptor.getDefType().getPrimaryInterface())
                        && (extraFilter == null || extraFilter.apply(descriptor))) {
                    @SuppressWarnings("unchecked")
                    DefDescriptor<P> dd = (DefDescriptor<P>) descriptor;
                    if (dd.getDef() != null) {
                        defDescriptors.add(dd);
                    }
                }
            }
        }
    }

    /**
     * Get the set of filters for the current context using a different base component.
     * 
     * Note the special handling here for quick fixes, as we need to be able to get all of the appropriate definitions
     * even when the app fails to compile. In that case we reset everything and get the auradev:quickFixException.
     * 
     * TODO: Note that this means the quickfix handling is hard wired, but I'm not sure that this is an issue. We should
     * maybe make it more obvious by moving things around and using static strings..
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
     * check the top level component/app.
     * 
     * This routine checks to see that we have a valid top level component. If our top level component has some problem
     * (QFE/out of sync) we totally ignore it, and continue with the preloading as if everything was ok. Otherwise, if
     * we have no descriptor, we give back an empty response.
     * 
     * Also note that this handles the 'if-modified-since' header, as we want to tell the browser that nothing changed
     * in that case.
     * 
     * @param request the request (for exception handling)
     * @param response the response (for exception handling)
     * @param context the context to get the definition.
     * @return true if processing should continue, false if we are done.
     * @throws IOException if there was an IO exception handling a client out of sync exception
     * @throws ServletException if there was a problem handling the out of sync
     */
    private boolean handleTopLevel(HttpServletRequest request, HttpServletResponse response, AuraContext context)
            throws IOException, ServletException {
        DefDescriptor<? extends BaseComponentDef> appDesc = context.getApplicationDescriptor();
        DefinitionService definitionService = Aura.getDefinitionService();

        if (appDesc == null) {
            //
            // This means we have nothing to say to the client, so the response is
            // left completely empty.
            //
            return false;
        }
        long ifModifiedSince = request.getDateHeader("If-Modified-Since");
        String uid = null;

        if (ifModifiedSince != -1) {
            uid = context.getUid(appDesc);
        }
        try {
            definitionService.updateLoaded(appDesc, true);
            if (uid != null) {
                //
                // In this case, we have an unmodified descriptor, so just tell
                // the client that.
                //
                response.sendError(HttpServletResponse.SC_NOT_MODIFIED);
                return false;
            }
        } catch (QuickFixException qfe) {
            //
            // A quickfix exception means that we couldn't compile something.
            // In this case, we still want to preload things, so we ignore it.
            //
        } catch (ClientOutOfSyncException coose) {
            //
            // We can't actually handle an out of sync here, since we are doing a
            // preload. We have to ignore it, and continue as if nothing happened.
            //
        }
        return true;
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
                    Aura.getDefinitionService().updateLoaded(descr, true);
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
     * A cache for compressed CSS output.
     * 
     * This is currently done by namespace, but it will eventually be by app after W-1166679
     */
    private static final Map<String, Reference<String>> cssCache = new ConcurrentHashMap<String, Reference<String>>();

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
     * This writes out CSS for the preloads + app to the response. Note that currently it only writes out the preloads
     * because of the missing capability to do the apps will get fixed by W-1166679
     * 
     * @param out the appendable
     * @throws IOException if unable to write to the response
     * @throws QuickFixException if the definitions could not be compiled.
     */
    public static void writeCss(Appendable out) throws IOException, QuickFixException {
        AuraContext context = Aura.getContextService().getCurrentContext();

        Set<DescriptorFilter> filters = Sets.newLinkedHashSet();
        filters.addAll(getFilters());
        Client.Type type = Aura.getContextService().getCurrentContext().getClient().getType();
        Mode mode = context.getMode();
        StringBuffer sb = new StringBuffer();

        context.setPreloading(true);
        for (DescriptorFilter filter : filters) {
            String key = type.name() + "$" + filter;
            String nsCss = null;

            if (!mode.isTestMode()) {
                Reference<String> ref = cssCache.get(key);
                if (ref != null) {
                    nsCss = ref.get();
                }
            }
            if (nsCss == null) {
                Set<DefDescriptor<StyleDef>> styleDefDescriptors = Sets.newHashSet();
                List<DescriptorFilter> shortlist = Lists.newArrayList();

                shortlist.add(filter);
                addDefDescriptors(StyleDef.class, shortlist, NTF, styleDefDescriptors);

                Set<StyleDef> orderedStyleDefs = orderStyles(styleDefDescriptors, context);

                sb.setLength(0);
                Appendable tmp = mode.isTestMode() ? out : sb;
                Aura.getSerializationService().writeCollection(orderedStyleDefs, StyleDef.class, tmp, "CSS");
                if (!mode.isTestMode()) {
                    nsCss = sb.toString();
                    cssCache.put(key, new SoftReference<String>(nsCss));
                }
            }

            if (nsCss != null) {
                out.append(nsCss);
            }
        }
    }

    /**
     * Orders StyleDefs with supers (ancestors) first then alphabetical
     * 
     * TODO: refactor when we use CSS by dependency instead of preloads
     * 
     * @param styleDefDescriptors style def descriptors
     * @param context aura context
     * @return set of ordered style defs
     * @throws QuickFixException
     */
    private static Set<StyleDef> orderStyles(Set<DefDescriptor<StyleDef>> styleDefDescriptors, AuraContext context)
            throws QuickFixException {
        DefDescriptor<? extends BaseComponentDef> appDesc = context.getApplicationDescriptor();
        String uid = context.getUid(appDesc);
        Set<DefDescriptor<?>> dependencies = context.getDefRegistry().getDependencies(uid);
        Map<DefDescriptor<?>, MutableInt> styleFrequencyMap = createStyleFrequencyMap(dependencies);

        /**
         * Because we're using CSS from the entire namespace (preloads) we need to add style def descriptors of parent
         * components that's not in the dependencies map. This will then be sorted by frequency then alphabetically.
         * 
         * This can be a set and sort done on the styleFrequencyMap when we load CSS by dependency instead of namespace.
         */
        Map<DefDescriptor<StyleDef>, Integer> styles = Maps.newHashMap();

        /**
         * The loops and checks within are used to return an ordered list of all styles of a namespace sorted by
         * frequency (number of descendants) then alphabetically. Very inefficient and redundant on different namespaces
         * because they use the same dependencies.
         */
        if (styleFrequencyMap != null) {
            for (Map.Entry<DefDescriptor<?>, MutableInt> dependencyEntry : styleFrequencyMap.entrySet()) {
                DefDescriptor<?> defDescriptor = dependencyEntry.getKey();
                if (defDescriptor.getDefType() == DefType.STYLE) {
                    @SuppressWarnings("unchecked")
                    DefDescriptor<StyleDef> styleDD = (DefDescriptor<StyleDef>) defDescriptor;
                    /**
                     * Because we're loading and caching CSS by preloads, we check whether this style def descriptor is
                     * in the set of filtered descriptors by preloads
                     * 
                     * Remove this when we load CSS based on dependencies instead of preloads
                     */
                    if (styleDefDescriptors.contains(defDescriptor)) {
                        styles.put(styleDD, dependencyEntry.getValue().getValue());
                    }
                }
            }
        }

        // Add namespace StyleDefs that are not in the dependencies so that we can sort afterwards
        for (DefDescriptor<StyleDef> style : styleDefDescriptors) {
            if (!styles.containsKey(style)) {
                // frequency is 1 because it most likely doesn't have any descendants
                styles.put(style, 1);
            }
        }

        /**
         * style map includes frequency (calculated by its number of descendants). We sort by this frequency to order
         * the CSS by ancestors first then alphabetical.
         * 
         * Comparing DefDescriptor is cleaner than comparing Definition
         */
        Comparator frequencyComparator = Ordering.natural().reverse().onResultOf(Functions.forMap(styles))
                .compound(Ordering.natural());
        SortedMap<DefDescriptor<StyleDef>, Integer> sorted = ImmutableSortedMap.copyOf(styles, frequencyComparator);

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
     * @param dependencies definition map
     * @return sorted map
     * @throws QuickFixException
     */
    private static Map<DefDescriptor<?>, MutableInt> createStyleFrequencyMap(
            Set<DefDescriptor<?>> dependencies)
            throws QuickFixException {
        if (dependencies == null) {
            return null;
        }

        Map<DefDescriptor<?>, MutableInt> frequencyMap = Maps.newHashMap();
        for (DefDescriptor<?> defDescriptor : dependencies) {
            // for each component we want to calculate its frequency
            if (defDescriptor.getDefType() == DefType.COMPONENT) {
                addStyleFrequency(frequencyMap, defDescriptor);
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
    private static void addStyleFrequency(Map<DefDescriptor<?>, MutableInt> frequencyMap,
            DefDescriptor<?> descriptor) throws QuickFixException {
        ComponentDef def = (ComponentDef) descriptor.getDef();
        DefDescriptor<StyleDef> styleDefDescriptor = def.getStyleDescriptor();
        if (styleDefDescriptor != null) {
            // we only need the style of the component
            MutableInt freq = frequencyMap.get(styleDefDescriptor);
            if (freq == null) {
                frequencyMap.put(styleDefDescriptor, new MutableInt(1));
            } else {
                freq.increment();
            }
        }

        DefDescriptor<ComponentDef> superDescriptor = def.getExtendsDescriptor();
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
     * FIXME: I have no idea of why this is here when JS does effectively the same thing with extra stuff.
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

    /** Map by URL of soft references to an already-loaded resource. */
    private static final Map<String, Reference<String>> definitionCache = new ConcurrentHashMap<String, Reference<String>>();
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
        // create a temp buffer in case anything bad happens while we're processing this.
        // don't want to end up with a half a JS init function
        //
        // TODO: get rid of this buffering by adding functionality to Json.serialize that will help us
        // make sure serialized JS is valid, non-error-producing syntax if an exception happens in the
        // middle of serialization.
        //
        String ret = null;
        String key = null;

        context.setPreloading(true);
        StringBuilder keyBuilder = new StringBuilder();

        for (DescriptorFilter dm : filters) {
            keyBuilder.append(dm);
            keyBuilder.append(",");
        }

        // Swizzle in mode awareness
        keyBuilder.append(mode.name().toLowerCase());

        key = keyBuilder.toString();

        Reference<String> reference = definitionCache.get(key);
        if (reference != null) {
            ret = reference.get();
        }

        if (ret != null) {
            out.append(ret);
            return;
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
        // only use closure compiler in prod mode, due to compile cost
        if (!(mode.isTestMode() || mode.isDevMode())) {
            StringWriter sw = new StringWriter();
            List<JavascriptProcessingError> errors = JavascriptWriter.CLOSURE_SIMPLE.compress(ret, sw, key);
            if (errors == null || errors.isEmpty()) {
                // For now, just use the non-compressed version if we can't get
                // the compression to work.
                ret = sw.toString();
            }
            //
            // Note that we just use put (last one wins), as we don't really
            // care what happens
            // when there is a race. Just that one of them gets in.
            definitionCache.put(key, new SoftReference<String>(ret));
        } else {
            // still store the return in cache in not prod
            definitionCache.put(key, new SoftReference<String>(ret));
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
        response.setCharacterEncoding(AuraBaseServlet.UTF_ENCODING);

        setLongCache(response);
        AuraContext.Format format = context.getFormat();
        response.setContentType(getContentType(format));
        switch (format) {
        case MANIFEST:
            writeManifest(request, response);
            break;
        case CSS:
            if (!handleTopLevel(request, response, context)) {
                return;
            }
            try {
                writeCss(response.getWriter());
            } catch (Throwable t) {
                handleServletException(t, true, context, request, response, true);
            }
            break;
        case JS:
            if (!handleTopLevel(request, response, context)) {
                return;
            }
            try {
                writeDefinitions(response.getWriter());
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
            if (!handleTopLevel(request, response, context)) {
                return;
            }
            try {
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

    /**
     * Singleton class to manage external calls to the parent class' static cache
     */
    private static class SourceNotifier implements SourceListener {
        @Override
        public void onSourceChanged(DefDescriptor<?> source, SourceMonitorEvent event) {
            definitionCache.clear();
            cssCache.clear();
        }
    }

}
