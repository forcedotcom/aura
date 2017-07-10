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
package org.auraframework.impl;

import java.io.IOException;
import java.io.Writer;
import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.Callable;
import java.util.concurrent.ExecutionException;

import javax.annotation.PostConstruct;
import javax.inject.Inject;

import org.auraframework.adapter.ConfigAdapter;
import org.auraframework.adapter.ExceptionAdapter;
import org.auraframework.adapter.ServletUtilAdapter;
import org.auraframework.annotations.Annotations.ServiceComponent;
import org.auraframework.cache.Cache;
import org.auraframework.css.StyleContext;
import org.auraframework.def.BaseComponentDef;
import org.auraframework.def.BaseStyleDef;
import org.auraframework.def.ComponentDef;
import org.auraframework.def.ControllerDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.DefDescriptor.DefType;
import org.auraframework.def.Definition;
import org.auraframework.def.EventDef;
import org.auraframework.def.IncludeDefRef;
import org.auraframework.def.LibraryDef;
import org.auraframework.def.SVGDef;
import org.auraframework.def.StyleDef;
import org.auraframework.def.module.ModuleDef;
import org.auraframework.http.ManifestUtil;
import org.auraframework.impl.util.TemplateUtil;
import org.auraframework.instance.Action;
import org.auraframework.instance.BaseComponent;
import org.auraframework.instance.Component;
import org.auraframework.instance.Event;
import org.auraframework.service.CachingService;
import org.auraframework.service.ContextService;
import org.auraframework.service.DefinitionService;
import org.auraframework.service.InstanceService;
import org.auraframework.service.LoggingService;
import org.auraframework.service.MetricsService;
import org.auraframework.service.SerializationService;
import org.auraframework.service.ServerService;
import org.auraframework.system.AuraContext;
import org.auraframework.system.AuraContext.Format;
import org.auraframework.system.AuraContext.Mode;
import org.auraframework.system.DependencyEntry;
import org.auraframework.system.LoggingContext.KeyValueLogger;
import org.auraframework.system.Message;
import org.auraframework.throwable.AuraExecutionException;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.javascript.Literal;
import org.auraframework.util.json.JsonEncoder;
import org.auraframework.util.json.JsonSerializationContext;

import com.google.common.base.Joiner;
import com.google.common.base.Optional;
import com.google.common.base.Throwables;
import com.google.common.collect.Lists;
import com.google.common.collect.Maps;
import com.google.common.collect.Sets;

@ServiceComponent
public class ServerServiceImpl implements ServerService {

    @Inject
    private LoggingService loggingService;

    @Inject
    private MetricsService metricsService;

    @Inject
    private ConfigAdapter configAdapter;

    @Inject
    private ContextService contextService;

    @Inject
    private ExceptionAdapter exceptionAdapter;

    @Inject
    private SerializationService serializationService;

    @Inject
    private CachingService cachingService;

    @Inject
    private DefinitionService definitionService;

    @Inject
    private ServletUtilAdapter servletUtilAdapter;

    @Inject
    private InstanceService instanceService;

    private ManifestUtil manifestUtil;

    @PostConstruct
    public void createManifestUtil() {
        manifestUtil = new ManifestUtil(definitionService, contextService, configAdapter);
    }

    private static final long serialVersionUID = -2779745160285710414L;

    public static final int AURA_SERIALIZATION_VERSION = 1;

    private Cache<String, String> stringsCache;

    private Cache<String, String> altStringsCache;

    @PostConstruct
    private void setCaches() {
        this.stringsCache = cachingService.getStringsCache();
        this.altStringsCache = cachingService.getAltStringsCache();
    }

    @Override
    public void run(Message message, AuraContext context, Writer out, Map<?,?> extras) throws IOException {
        loggingService.startTimer(LoggingService.TIMER_AURA_RUN);

        if (message == null) {
            return;
        }
        List<Action> actions = message.getActions();
        JsonSerializationContext serializationContext = context.getJsonSerializationContext();
        JsonEncoder json = JsonEncoder.createJsonStream(out, serializationContext);
        try {
            json.writeMapBegin();
            if (extras != null && extras.size() > 0) {
                for (Map.Entry<?,?> entry : extras.entrySet()) {
                    json.writeMapEntry(entry.getKey(), entry.getValue());
                }
            }
            json.writeMapKey("actions");
            json.writeArrayBegin();
            run(actions, json, 0);
            json.writeArrayEnd();

            loggingService.startTimer(LoggingService.TIMER_SERIALIZATION);
            loggingService.startTimer(LoggingService.TIMER_SERIALIZATION_AURA);
            try {
                json.writeMapEntry("context", context);
                List<Event> clientEvents = contextService.getCurrentContext().getClientEvents();
                if (clientEvents != null && !clientEvents.isEmpty()) {
                    json.writeMapEntry("events", clientEvents);
                }
            } finally {
                loggingService.stopTimer(LoggingService.TIMER_SERIALIZATION_AURA);
                loggingService.stopTimer(LoggingService.TIMER_SERIALIZATION);
            }

            loggingService.stopTimer(LoggingService.TIMER_AURA_RUN);

            try {
                if (context.getMode() != Mode.PROD) {
                    metricsService.serializeMetrics(json);
                }
                // Always serialize metrics summary
                metricsService.serializeMetricsSummary(json);
            } catch (Exception e) {
                loggingService.error("Error parsing MetricsService", e);
            }

            json.writeMapEnd();
        } finally {
            try {
                json.close();
            } catch (Throwable ignored) {
                loggingService.error("Error closing json", ignored);
            }
        }
    }

    private int run(List<Action> actions, JsonEncoder json, int idx) throws IOException {
        AuraContext context = contextService.getCurrentContext();
        for (Action action : actions) {
            StringBuffer actionAndParams = new StringBuffer(action.getDescriptor().getQualifiedName());
            KeyValueLogger logger = loggingService.getKeyValueLogger(actionAndParams);
            if (logger != null) {
                action.logParams(logger);
            }
            String aap = String.valueOf(++idx)+"$"+actionAndParams.toString();
            loggingService.startAction(aap, action);
            Action oldAction = context.setCurrentAction(action);
            boolean earlyCleanup = false;
            try {
                action.setup();
                action.run();
            } catch (AuraExecutionException x) {
                earlyCleanup = true;
                exceptionAdapter.handleException(x, action);
            } finally {
                if (earlyCleanup){
                    action.cleanup();
                }
                context.setCurrentAction(oldAction);
                loggingService.stopAction(aap);
            }
            loggingService.startTimer(LoggingService.TIMER_SERIALIZATION);
            loggingService.startTimer(LoggingService.TIMER_SERIALIZATION_AURA);
            try {
                json.writeArrayEntry(action);
            } finally {
                loggingService.stopTimer(LoggingService.TIMER_SERIALIZATION_AURA);
                loggingService.stopTimer(LoggingService.TIMER_SERIALIZATION);
                if (!earlyCleanup){
                    action.cleanup();
                }
            }

            List<Action> additionalActions = action.getActions();

            // Recursively process any additional actions created by the
            // action
            if (additionalActions != null && !additionalActions.isEmpty()) {
                idx = run(additionalActions, json, idx);
            }
        }
        return idx;
    }

    @Override
    public void writeAppCss(final Set<DefDescriptor<?>> dependencies, Writer out) throws IOException, QuickFixException {
        AuraContext context = contextService.getCurrentContext();
        boolean minify = context.getMode().minify();

        StyleContext styleContext = context.getStyleContext();

        // build cache key
        final StringBuilder keyBuilder = new StringBuilder(64);
        keyBuilder.append("CSS:");

        // browser type
        keyBuilder.append(styleContext.getClientType());

        // other "true" conditions from style adapter (e.g., isDesktop)
        String trueConditionsKey = Joiner.on("-").skipNulls().join(styleContext.getExtraTrueConditionsOnly());
        if (!trueConditionsKey.isEmpty()) {
            keyBuilder.append(":");
            keyBuilder.append(trueConditionsKey);
        }

        // tokens uid. The app tokens are in the app dependencies and thus part of appuid, however we need
        // a distinct uid because one of the descriptors may be provided. this can be further optimized by only adding
        // a uid for provided descriptors only though.
        Optional<String> tokensUid = styleContext.getTokens().getDescriptorsUid();
        if (tokensUid.isPresent()) {
            keyBuilder.append(":").append(tokensUid.get());
        }

        // TODONM: If a tokens def uses a map-provider it will affect the css key too. Current idea is to cache a
        // "pre-evaluated" version of the CSS (but still ordered and concatenated). Another idea is to defer cache to
        // fileforce, etc... once a map-provider is involved. right now we skip the cache, so until this is address
        // map-providers shouldn't be used.

        keyBuilder.append("$");

        // minified or not
        final String mKey = minify ? "MIN:" : "DEV:";
        keyBuilder.append(mKey);

        // app uid
        DefDescriptor<?> appDesc = context.getLoadingApplicationDescriptor();
        final String uid = context.getUid(appDesc);
        keyBuilder.append(uid);

        final String key = keyBuilder.toString();
        context.setPreloading(true);

        String cached = null;
        final boolean skipCache = styleContext.getTokens().hasDynamicTokens(); // TODONM undo this cache skipping
        if (skipCache) {
            cached = getAppCssString(dependencies);
        } else {
            cached = getAltCachedString(uid, appDesc, key,
                new Callable<String>() {
                    @Override
                    public String call() throws Exception {
                        return getAppCssString(dependencies);
                    }
                }
            );
        }

        if (out != null) {
            out.append(cached);
        }
    }

    private String getAppCssString(Set<DefDescriptor<?>> dependencies) throws QuickFixException, IOException {
        Collection<BaseStyleDef> orderedStyleDefs = filterAndLoad(BaseStyleDef.class, dependencies, null);
        StringBuffer sb = new StringBuffer();
        serializationService.writeCollection(orderedStyleDefs, BaseStyleDef.class, sb, "CSS");
        return sb.toString();
    }

    @Override
    public void writeAppSvg(DefDescriptor<SVGDef> svg, Writer out)
            throws IOException, QuickFixException {
        AuraContext context = contextService.getCurrentContext();

        // build cache key
        final StringBuilder keyBuilder = new StringBuilder(64);
        keyBuilder.append("SVG:");

        // browser type
        keyBuilder.append(context.getClient().getType());

        keyBuilder.append("$");

        DefDescriptor<? extends BaseComponentDef> appDesc = context.getLoadingApplicationDescriptor();

        // verify the app has access to the svg
        final SVGDef svgDef = definitionService.getDefinition(svg);
        definitionService.assertAccess(appDesc, svgDef);

        // svg uid
        final String uid = definitionService.getUid(null, svg);
        keyBuilder.append(uid);

        final String key = keyBuilder.toString();
        context.setPreloading(true);

        String cached = getCachedString(uid, appDesc, key,
            new Callable<String>() {
                @Override
                public String call() throws Exception {
                    return getAppSvgString(svgDef);
                }
            }
        );

        out.append(cached);
    }

    private String getAppSvgString(SVGDef svgDef) throws QuickFixException, IOException {
        StringBuffer sb = new StringBuffer();
        serializationService.write(svgDef, null, SVGDef.class, sb, Format.SVG.name());
        return sb.toString();
    }

    @Override
    public void writeDefinitions(final Set<DefDescriptor<?>> dependencies, Writer out, boolean hasParts, int partIndex)
            throws IOException, QuickFixException {
        AuraContext context = contextService.getCurrentContext();
        final boolean minify = context.getMode().minify();

        context.setPreloading(true);
        DefDescriptor<? extends BaseComponentDef> appDesc = context.getLoadingApplicationDescriptor();

        final String mKey = minify ? "MIN:" : "DEV:";
        final String uid = context.getUid(appDesc);
        final String lockerService = configAdapter.isLockerServiceEnabled() ? ":ls" : "";
        // modules definitions will be present with modules enabled so needs to be cached separately
        final String modules = context.isModulesEnabled() ? ":m" : "";
        final String compat = context.useCompatSource() ? ":c" : "";
        final String key = "JS:" + mKey + uid + (hasParts ? ":" + partIndex : "") + ":" + lockerService + modules + compat;

        final Callable<String> buildFunction = () -> {
            String res = getDefinitionsString(dependencies, key, partIndex == 0);
            //log the cache miss here
            cachingService.getAltStringsCache().logCacheStatus("cache miss for key: "+key+";");
            return res;
        };
        String cached;
        //
        // Careful here. We want to be sure that it is safe to 'permanently' cache the app.js
        // string here. In the case of cacheable components, this is the case, otherwise, no.
        //
        if (definitionService.isDependencySetCacheable(uid)) {
            cached = getAltCachedString(uid, appDesc, key, buildFunction);
        } else {
            cached = getCachedString(uid, appDesc, key, buildFunction);
        }

        if (out != null) {
           out.append(cached);
        }
    }

    private String getDefinitionsString (Set<DefDescriptor<?>> dependencies, String key, boolean uncomment)
            throws QuickFixException, IOException {

        AuraContext context = contextService.getCurrentContext();
        boolean minify = context.getMode().minify();

        JsonSerializationContext serializationContext = context.getJsonSerializationContext();
        serializationContext.pushFormatRootItems();

        StringBuilder sb = new StringBuilder();

        // Process Libraries with a lower granularity level, to prevent duplication of external includes.
        Collection<LibraryDef> libraryDefs = filterAndLoad(LibraryDef.class, dependencies, null);
        for (LibraryDef libraryDef : libraryDefs) {
            List<IncludeDefRef> includeDefs = libraryDef.getIncludes();
            for (IncludeDefRef defRef : includeDefs) {
                if (uncomment) {
                    sb.append("$A.componentService.addLibraryExporter(\"" + defRef.getClientDescriptor() + "\", (function (){");
                } else {
                    sb.append("$A.componentService.addLibraryExporter(\"" + defRef.getClientDescriptor() + "\", (function l(){/*");
                }

                sb.append(defRef.getCode(minify));

                if (uncomment) {
                    sb.append("}));");
                } else {
                    sb.append("*/}));");
                }

                context.setClientClassLoaded(defRef.getDescriptor(), true);
            }
        }

        // Append component classes.
        Collection<BaseComponentDef> componentDefs = filterAndLoad(BaseComponentDef.class, dependencies, null);
        for (BaseComponentDef def : componentDefs) {
            // templates are not needed in app.js as they are rendered server side and html sent to client
            if (def.isTemplate()) {
                continue;
            }

            if (uncomment) {
                sb.append("$A.componentService.addComponent(\"" + def.getDescriptor() + "\", (function (){");
            } else {
                sb.append("$A.componentService.addComponent(\"" + def.getDescriptor() + "\", (function c(){/*");
            }

            // Mark class as loaded in the client
            context.setClientClassLoaded(def.getDescriptor(), true);

            // Component Class
            sb.append(def.getCode(minify));

            // Component definition
            sb.append("return ");
            serializationService.write(def, null, BaseComponentDef.class, sb, "JSON");
            sb.append(";");

            if (uncomment) {
                sb.append("}));\n");
            } else {
                sb.append("*/}));\n");
            }
        }

        // Append event definitions
        sb.append("$A.componentService.initEventDefs(");
        Collection<EventDef> events = filterAndLoad(EventDef.class, dependencies, null);
        serializationService.writeCollection(events, EventDef.class, sb, "JSON");
        sb.append(");\n");

        // Append library definitions
        sb.append("$A.componentService.initLibraryDefs(");
        serializationService.writeCollection(libraryDefs, LibraryDef.class, sb, "JSON");
        sb.append(");\n");

        // Append controller definitions
        // Dunno how this got to be this way. The code in the Format adaptor was twisted and stupid,
        // as it walked the namespaces looking up the same descriptor, with a string.format that had
        // the namespace but did not use it. This ends up just getting a single controller.
        sb.append("$A.componentService.initControllerDefs(");
        Collection<ControllerDef> controllers = filterAndLoad(ControllerDef.class, dependencies, ACF);
        serializationService.writeCollection(controllers, ControllerDef.class, sb, "JSON");
        sb.append(");\n");

        sb.append("$A.componentService.initModuleDefs(");
        Collection<ModuleDef> modules = filterAndLoad(ModuleDef.class, dependencies, null);
        serializationService.writeCollection(modules, ModuleDef.class, sb, "JSON");
        sb.append(");\n");

        return sb.toString();
    }

    @Override
    public void writeComponents(Set<DefDescriptor<?>> dependencies, Writer out)
            throws IOException, QuickFixException {
        AuraContext context = contextService.getCurrentContext();

        context.setPreloading(true);
        serializationService.writeCollection(filterAndLoad(BaseComponentDef.class, dependencies, null),
                BaseComponentDef.class, out);
    }

    /**
     * Provide a better way of distinguishing templates from styles..
     *
     * This is used to apply the style definition filter for 'templates', but is getting rather further embedded in
     * code.
     *
     * TODO: W-1486762
     */
    private static interface TempFilter {
        public boolean apply(DefDescriptor<?> descriptor);
    }

    private static class AuraControllerFilter implements TempFilter {
        @Override
        public boolean apply(DefDescriptor<?> descriptor) {
            return descriptor.getPrefix().equalsIgnoreCase("aura") && descriptor.getDefType() == DefType.CONTROLLER;
        }
    }

    private static final AuraControllerFilter ACF = new AuraControllerFilter();

    private <P extends Definition, D extends P> Set<D> filterAndLoad(Class<D> defType,
            Set<DefDescriptor<?>> dependencies, TempFilter extraFilter) {

        Set<D> out = Sets.newLinkedHashSet();
        if(dependencies != null) {
            AuraContext context = contextService.getCurrentContext();
            for (DefDescriptor<?> descriptor : dependencies) {
                if (defType.isAssignableFrom(descriptor.getDefType().getPrimaryInterface())
                        && (extraFilter == null || extraFilter.apply(descriptor))) {
                    @SuppressWarnings("unchecked")
                    DefDescriptor<D> dd = (DefDescriptor<D>) descriptor;
                    Optional<D> optionalDef = context.getLocalDef(dd);
                    D def = (optionalDef != null)? optionalDef.orNull() : null;
                    if (def == null) {
                        try {
                            def = definitionService.getDefinition(dd);
                        } catch (QuickFixException qfe) {
                            //
                            // completely ignore this here, we should have already failed,
                            // actually, we should be able to use 'getLocalDef', but for some
                            // reason that fails in a few spots, will have to dig in to that.
                            //
                            throw new IllegalStateException("Illegal state, missing def for "+dd, qfe);
                        }
                    }
                    if (def == null) {
                        throw new IllegalStateException("Illegal state, missing def for "+dd);
                    }
                    out.add(def);
                }
            }
        }
        return out;
    }

    /**
     * Get a named string from the cache for a cacheable definition.
     *
     * @param uid the UID for the definition (must have called {@link DefinitionService#getUid(String, DefDescriptor)}).
     * @param descriptor the descriptor.
     * @param key the key.
     * @param loader the loader for the string
     * @throws QuickFixException
     * @throws IOException
     */
    private String getCachedString(String uid, DefDescriptor<?> descriptor, String key, Callable<String> loader)
            throws QuickFixException, IOException {
        return getCachedString(stringsCache, uid, descriptor, key, loader);
    }

    /**
     * Get a named string from the alternate cache for a cacheable definition.
     *
     * @param uid the UID for the definition (must have called {@link DefinitionService#getUid(String, DefDescriptor)}).
     * @param descriptor the descriptor.
     * @param key the key.
     * @param loader the loader for the string
     * @throws QuickFixException
     * @throws IOException
     */
    private String getAltCachedString(String uid, DefDescriptor<?> descriptor, String key, Callable<String> loader)
            throws QuickFixException, IOException {
        return getCachedString(altStringsCache, uid, descriptor, key, loader);
    }

    private String getCachedString(Cache<String, String> cache, String uid, DefDescriptor<?> descriptor, String key, Callable<String> loader) throws QuickFixException, IOException {
        if (uid != null) {
            AuraContext context = contextService.getCurrentContext();
            DependencyEntry de = context.getLocalDependencyEntry(uid);

            if (de != null) {
                try {
                    return cache.get(getKey(de, descriptor, key), loader);
                } catch (ExecutionException e) {
                    // Don't interfere if the callable caused these exceptions.
                    Throwables.propagateIfInstanceOf(e.getCause(), IOException.class);
                    Throwables.propagateIfInstanceOf(e.getCause(), QuickFixException.class);
                    // Propagates as-is if RuntimeException, or wraps with a RuntimeException.
                    Throwables.propagate(e);
                }
            }
        }

        // When caching is bypassed, execute the loader directly.
        try {
            return loader.call();
        } catch (Exception e) {
            // Don't interfere if the call caused these exceptions.
            Throwables.propagateIfInstanceOf(e, IOException.class);
            Throwables.propagateIfInstanceOf(e, QuickFixException.class);
            // Propagates as-is if RuntimeException, or wraps with a RuntimeException.
            Throwables.propagate(e);
        }

        return null;
    }

    private String getKey(DependencyEntry de, DefDescriptor<?> descriptor, String key) {
        return String.format("%s@%s@%s", de.uid, descriptor.getQualifiedName().toLowerCase(), key);
    }

    private TemplateUtil templateUtil = new TemplateUtil();

    @Override
    public <T extends BaseComponentDef> Component writeTemplate(AuraContext context,
            T value, Map<String, Object> componentAttributes, Appendable out)
            throws IOException, QuickFixException {

        ComponentDef templateDef = value.getTemplateDef();
        Map<String, Object> attributes = Maps.newHashMap();
        Mode mode = context.getMode();

        StringBuilder sb = new StringBuilder();

        templateUtil.writePrefetchScriptTags(servletUtilAdapter.getJsPrefetchUrls(context), sb);
        attributes.put("prefetchTags", sb.toString());
        sb.setLength(0);

        StyleDef styleDef = templateDef.getStyleDef();
        if (styleDef != null) {
            attributes.put("auraInlineStyle", styleDef.getCode());
        }

        templateUtil.writeHtmlStyle(configAdapter.getResetCssURL(), null, sb);
        attributes.put("auraResetTags", sb.toString());
        sb.setLength(0);

        StringBuilder styleTagStringBuilder = new StringBuilder();
        templateUtil.writeHtmlStyles(servletUtilAdapter.getStyles(context), "auraCss", styleTagStringBuilder);

        if (mode.allowLocalRendering() && value.isLocallyRenderable()) {

            BaseComponent<?, ?> cmp = (BaseComponent<?, ?>) instanceService.getInstance(value, componentAttributes);

            attributes.put("auraStyleTags", styleTagStringBuilder.toString());
            attributes.put("body", Lists.<BaseComponent<?, ?>> newArrayList(cmp));
            attributes.put("bodyClass", "");
            attributes.put("defaultBodyClass", "");
            attributes.put("autoInitialize", "false");
        } else {
            if (manifestUtil.isManifestEnabled()) {
                attributes.put("manifest", servletUtilAdapter.getManifestUrl(context, componentAttributes));
            }

            servletUtilAdapter.writeScriptUrls(context, value, componentAttributes, sb, styleTagStringBuilder.toString());

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
            auraInit.put("host", context.getContextPath());
            auraInit.put("pathPrefix", context.getPathPrefix());

            // appcached apps must receive the token via bootstrap to avoid caching of the token
            if (!manifestUtil.isManifestEnabled()) {
                auraInit.put("token", configAdapter.getCSRFToken());
            }

            String lockerWorkerURL = configAdapter.getLockerWorkerURL();
            if (configAdapter.isStrictCSPEnforced() && lockerWorkerURL != null) {
                auraInit.put("safeEvalWorker", lockerWorkerURL);
            }

            auraInit.put("MaxParallelXHRCount", configAdapter.getMaxParallelXHRCount());
            auraInit.put("XHRExclusivity", configAdapter.getXHRExclusivity());

            auraInit.put("context", new Literal(context.serialize(AuraContext.EncodingStyle.Full)));
            attributes.put("auraInit", JsonEncoder.serialize(auraInit));
        }

        Component template = instanceService.getInstance(templateDef.getDescriptor(), attributes);
        return template;
    }
}
