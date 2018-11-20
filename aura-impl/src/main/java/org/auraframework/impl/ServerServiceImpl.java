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
import java.io.StringWriter;
import java.io.Writer;
import java.util.Collection;
import java.util.HashSet;
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
import org.auraframework.adapter.StyleAdapter;
import org.auraframework.annotations.Annotations.ServiceComponent;
import org.auraframework.cache.Cache;
import org.auraframework.css.StyleContext;
import org.auraframework.def.ApplicationDef;
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
import org.auraframework.http.BootstrapUtil;
import org.auraframework.http.ManifestUtil;
import org.auraframework.impl.cache.ApplicationInitializerCache;
import org.auraframework.impl.css.CssVariableWriter;
import org.auraframework.impl.css.StyleDefWriter;
import org.auraframework.impl.util.TemplateUtil;
import org.auraframework.instance.Action;
import org.auraframework.instance.ApplicationInitializer;
import org.auraframework.instance.BaseComponent;
import org.auraframework.instance.Component;
import org.auraframework.instance.Event;
import org.auraframework.instance.Instance;
import org.auraframework.service.CSPInliningService;
import org.auraframework.service.CachingService;
import org.auraframework.service.ContextService;
import org.auraframework.service.DefinitionService;
import org.auraframework.service.InstanceService;
import org.auraframework.service.LoggingService;
import org.auraframework.service.MetricsService;
import org.auraframework.service.ServerService;
import org.auraframework.system.AuraContext;
import org.auraframework.system.AuraContext.Mode;
import org.auraframework.system.DependencyEntry;
import org.auraframework.system.LoggingContext.KeyValueLogger;
import org.auraframework.system.Message;
import org.auraframework.throwable.AuraExecutionException;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.AuraTextUtil.JSONEscapedFunctionStringBuilder;
import org.auraframework.util.javascript.Literal;
import org.auraframework.util.json.JsonEncoder;
import org.auraframework.util.json.JsonSerializationContext;
import org.springframework.context.annotation.Lazy;

import com.google.common.base.Joiner;
import com.google.common.base.Optional;
import com.google.common.base.Throwables;
import com.google.common.collect.Lists;
import com.google.common.collect.Maps;
import com.google.common.collect.Sets;

@ServiceComponent
public class ServerServiceImpl implements ServerService {

    @Inject
    @Lazy
    private LoggingService loggingService;

    @Inject
    @Lazy
    private MetricsService metricsService;

    @Inject
    @Lazy
    private ConfigAdapter configAdapter;

    @Inject
    @Lazy
    private ContextService contextService;

    @Inject
    @Lazy
    private ExceptionAdapter exceptionAdapter;

    @Inject
    @Lazy
    private CachingService cachingService;

    @Inject
    @Lazy
    private DefinitionService definitionService;

    @Inject
    @Lazy
    private ServletUtilAdapter servletUtilAdapter;

    @Inject
    @Lazy
    private InstanceService instanceService;

    @Inject
    @Lazy
    private BootstrapUtil bootstrapUtil;

    @Inject
    @Lazy
    protected CSPInliningService cspInliningService;

    @Inject
    @Lazy
    private ApplicationInitializerCache applicationInitializerCache;

    private ManifestUtil manifestUtil;

    @PostConstruct
    public void createManifestUtil() {
        manifestUtil = new ManifestUtil(definitionService, contextService, configAdapter);
    }

    public static final int AURA_SERIALIZATION_VERSION = 1;

    private Cache<String, String> stringsCache;

    private Cache<String, String> altStringsCache;

    private Cache<String, String> cssStringsCache;

    @PostConstruct
    private void setCaches() {
        this.stringsCache = cachingService.getStringsCache();
        this.altStringsCache = cachingService.getAltStringsCache();
        this.cssStringsCache = cachingService.getCssStringsCache();
    }

    @Override
    public void run(Message message, AuraContext context, Writer out, Map<?,?> extras) throws IOException {
        if (message == null) {
            return;
        }
        loggingService.startTimer(LoggingService.TIMER_AURA_RUN);

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

    /**
     * Set up the calling definition and make sure we don't do bad things to perf.
     *
     * try hard not to fail here, as we are dealing with customer input.
     *
     * Note that this is fundamentally broken because of the fact that some descriptors cannot
     * be retrieved as definitions. This is because we fail to honor the contract for some dynamic
     * definitions. This should really be fixed.
     *
     * @param action the action to set up.
     * @param context the context to use.
     */
    private void setupCallingDefinition(Action action, AuraContext context) {
        DefDescriptor<? extends BaseComponentDef> callingDescriptor;
        boolean found = false;

        callingDescriptor = action.getCallingDescriptor();
        if (callingDescriptor == null) {
            return;
        }
        try {
            if (definitionService.exists(callingDescriptor)) {
                found = true;
            } else {
                DefDescriptor<? extends BaseComponentDef> appDescriptor;
                appDescriptor = definitionService.getDefDescriptor(callingDescriptor.getQualifiedName(),
                        ApplicationDef.class);
                if (definitionService.exists(appDescriptor)) {
                    // if we exist use this def.
                    callingDescriptor = appDescriptor;
                    found = true;
                }
            }
        } catch (Exception e) {
            // this should not happen, as "exists" should never throw, but if it does, just log it and continue.
            exceptionAdapter.handleException(e);
        }
        action.setCallingDescriptor(callingDescriptor);
        if (found) {
            try {
                if (!context.getPreloadedDefinitions().contains(callingDescriptor)) {
                    String uid = definitionService.getUid(null, callingDescriptor);
                    context.addPreloadedDefinitions(definitionService.getDependencies(uid));
                }
                action.setCallingDefinition(definitionService.getDefinition(callingDescriptor));
            } catch (Exception qfe) {
                // this really should not happen!
                exceptionAdapter.handleException(qfe);
            }
        } else {
            context.addPreloadedDefinitions(Sets.newHashSet(callingDescriptor));
        }
    }

    private int run(List<Action> actions, JsonEncoder json, int idx) throws IOException {
        AuraContext context = contextService.getCurrentContext();
        int counter = idx;
        for (Action action : actions) {
            StringBuffer actionAndParams = new StringBuffer(action.getDescriptor().getQualifiedName());
            KeyValueLogger logger = loggingService.getKeyValueLogger(actionAndParams);
            if (logger != null) {
                action.logParams(logger);
            }
            String aap = String.valueOf(++counter)+"$"+actionAndParams.toString();
            loggingService.startAction(aap, action);
            setupCallingDefinition(action, context);
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
                counter = run(additionalActions, json, counter);
            }
        }
        return counter;
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
        // a distinct uid because one of the descriptors may be provided or we may be using map-provided tokens
        Optional<String> tokensUid = styleContext.getTokens().getTokensUid();
        if (tokensUid.isPresent()) {
            keyBuilder.append(":").append(tokensUid.get());
        }

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

        String cached = getCachedString(cssStringsCache, uid, appDesc, key,
                new Callable<String>() {
                    @Override
                    public String call() throws Exception {
                        return getAppCssString(dependencies);
                    }
                });

        if (out != null) {
            out.append(cached);
        }
    }

    @Inject
    private StyleAdapter styleAdapter;

    private String getAppCssString(Set<DefDescriptor<?>> dependencies) throws QuickFixException, IOException {
        Collection<BaseStyleDef> orderedStyleDefs = filterAndLoad(BaseStyleDef.class, dependencies, null);
        StringBuffer sb = new StringBuffer();
        new StyleDefWriter(definitionService, styleAdapter, contextService.getCurrentContext())
            .writeStyleDefs(orderedStyleDefs, sb);
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
        if (svgDef != null) {
            return svgDef.getContents();
        } else {
            return "";
        }
    }

    @Override
    public void writeDefinitions(final Set<DefDescriptor<?>> dependencies, Writer out, boolean hasParts, int partIndex, HYDRATION_TYPE hydrationType)
            throws IOException, QuickFixException {
        writeDefinitions(dependencies, out, hasParts, partIndex, hydrationType, true);
    }

    @Override
    public void writeDefinitions(final Set<DefDescriptor<?>> dependencies, Writer out, boolean hasParts, int partIndex, HYDRATION_TYPE hydrationType, boolean preloading)
            throws IOException, QuickFixException {
        AuraContext context = contextService.getCurrentContext();
        final boolean minify = context.getMode().minify();

        context.setPreloading(preloading);
        DefDescriptor<? extends BaseComponentDef> appDesc = context.getLoadingApplicationDescriptor();

        final String mKey = minify ? "MIN:" : "DEV:";
        final String uid = context.getUid(appDesc);
        final String lockerService = configAdapter.isLockerServiceEnabled() ? ":ls" : "";
        final String compat = context.useCompatSource() ? ":c" : "";
        final String key = "JS:" + mKey + uid + (hasParts ? ":" + partIndex : "") + ":" + lockerService + compat;

        final Callable<String> buildFunction = () -> {
            String res = getDefinitionsString(dependencies, hydrationType);
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

    private String getDefinitionsString (Set<DefDescriptor<?>> dependencies, HYDRATION_TYPE hydrationType)
            throws QuickFixException, IOException {

        AuraContext context = contextService.getCurrentContext();
        boolean minify = context.getMode().minify();

        JsonSerializationContext serializationContext = context.getJsonSerializationContext();
        serializationContext.pushFormatRootItems();

        StringBuilder sb = new StringBuilder();
        JSONEscapedFunctionStringBuilder escapedHydrationFunctionStringBuilder = new JSONEscapedFunctionStringBuilder(sb);

        Set<String> serverSideDescriptor = new HashSet<>();

        // Process Libraries with a lower granularity level, to prevent duplication of external includes.
        sb.append("$A.componentService.addLibraryExporter({");
        Collection<LibraryDef> libraryDefs = filterAndLoad(LibraryDef.class, dependencies, null);
        for (LibraryDef libraryDef : libraryDefs) {
            List<IncludeDefRef> includeDefs = libraryDef.getIncludes();
            for (IncludeDefRef defRef : includeDefs) {
                sb.append("'" + defRef.getClientDescriptor() + "':function(){/*");

                escapedHydrationFunctionStringBuilder.append(defRef.getCode(minify));

                sb.append("*/},");

                context.setClientClassLoaded(defRef.getDescriptor(), true);
            }
        }
        int end = sb.length();
        sb.replace(end, end, "});\n");

        // Append component classes.
        sb.append("$A.componentService.addComponent({");
        Collection<BaseComponentDef> componentDefs = filterAndLoad(BaseComponentDef.class, dependencies, null);
        for (BaseComponentDef def : componentDefs) {
            // templates are not needed in app.js as they are rendered server side and html sent to client
            if (def.isTemplate()) {
                continue;
            }
            serverSideDescriptor.add(def.getDescriptor().toString());

            // force hydration if this is a restricted namespace (requires an authenticated users)
            Boolean hydrationEnabled = hydrationType == HYDRATION_TYPE.all ||
                    context.getRestrictedNamespaces().contains(def.getDescriptor().getNamespace());

            if (hydrationEnabled) {
                sb.append("'")
                    .append(def.getDescriptor())
                    .append("':function(){/*");

                // Mark class as loaded in the client
                context.setClientClassLoaded(def.getDescriptor(), true);

                // Component Class
                escapedHydrationFunctionStringBuilder.append(def.getCode(minify));

                // Component definition
                sb.append("return ");
                JsonEncoder.serialize(def, escapedHydrationFunctionStringBuilder, context.getJsonSerializationContext());

                sb.append("*/},");
            } else {
                end = sb.length() - 1;
                sb.replace(end, end, "});\n");
                sb.append(def.getCode(minify));

                sb.append("$A.componentService.addComponents({'")
                        .append(def.getDescriptor())
                        .append("':");
                JsonEncoder.serialize(def, sb, context.getJsonSerializationContext());
                sb.append(",");
            }
        }
        end = sb.length() - 1;
        sb.replace(end, end, "});\n");

        // Append event definitions
        writeDefinitionStringToBuilder(EventDef.class, dependencies, null, context, sb, "$A.componentService.initEventDefs(", serverSideDescriptor);

        // Append library definitions
        writeDefinitionStringToBuilder(libraryDefs, context, sb, "$A.componentService.initLibraryDefs(", serverSideDescriptor);

        // Append controller definitions
        // Dunno how this got to be this way. The code in the Format adaptor was twisted and stupid,
        // as it walked the namespaces looking up the same descriptor, with a string.format that had
        // the namespace but did not use it. This ends up just getting a single controller.
        writeDefinitionStringToBuilder(ControllerDef.class, dependencies, ACF, context, sb, "$A.componentService.initControllerDefs(", serverSideDescriptor);

        writeDefinitionStringToBuilder(ModuleDef.class, dependencies, null, context, sb, "$A.componentService.initModuleDefs(", serverSideDescriptor);

        for (DefDescriptor<? extends Definition> dependency : dependencies) {
            String name = dependency.getQualifiedName();
            if (!serverSideDescriptor.contains(name)) {
                java.util.Optional<String> match = serverSideDescriptor.stream().filter((d)->name.equalsIgnoreCase(d)).findFirst();
                if (match.isPresent()) {
                    sb.append("$A.componentService.addDescriptorCaseMapping(\"")
                            .append(name)
                            .append("\",\"")
                            .append(match.get())
                            .append("\");\n");
                }
            }
        }

        return sb.toString();
    }

    @SuppressWarnings("rawtypes")
    private void writeDefinitionStringToBuilder(Class defType, Set<DefDescriptor<?>> dependencies,
                                                TempFilter extraFilter, AuraContext context, StringBuilder sb,
                                                String prefix, Set<String> serverSideDescriptor) {
        @SuppressWarnings("unchecked")
        Collection<Definition> definitions = filterAndLoad(defType, dependencies, extraFilter);
        writeDefinitionStringToBuilder(definitions, context, sb, prefix, serverSideDescriptor);
    }

    private void writeDefinitionStringToBuilder(Collection<? extends Definition> definitions, AuraContext context, StringBuilder sb,
                                                String prefix, Set<String> serverSideDescriptor) {
        if (definitions.size() > 0) {
            sb.append(prefix);
            JsonEncoder.serialize(definitions, sb, context.getJsonSerializationContext());
            sb.append(");\n");
            definitions.stream().forEach((def -> serverSideDescriptor.add(def.getDescriptor().toString())));
        }
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
                    // Wraps with a RuntimeException for others exceptions.
                    throw new RuntimeException(e);
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

            // TODO: once we upgrade to guava 20+ (not just OSS), we can replace these deprecated calls.
            // Re-throw as-is if it's a RuntimeException.
            // Wraps with a RuntimeException for others exceptions.
            // Throwables.throwIfUnchecked(e);
            // throw new RuntimeException(e);
            Throwables.propagate(e);
        }

        return null;
    }

    private String getKey(DependencyEntry de, DefDescriptor<?> descriptor, String key) {
        return String.format("%s@%s@%s", de.uid, descriptor.getQualifiedName().toLowerCase(), key);
    }

    private TemplateUtil templateUtil = new TemplateUtil();

    @Override
    public String serializeContext(AuraContext context) throws QuickFixException, IOException {
        DefDescriptor<? extends BaseComponentDef> app = context.getApplicationDescriptor();
        context.addPreloadedDefinitions(definitionService.getDependencies(definitionService.getUid(null, app)));

        // ensure all labels are loaded in context before serializing GVPs
        bootstrapUtil.loadLabelsToContext(context, this.definitionService);

        JsonSerializationContext serializationContext = context.getJsonSerializationContext();
        StringWriter writer = new StringWriter();
        JsonEncoder json = JsonEncoder.createJsonStream(writer, serializationContext);
        json.writeValue(context);
        writer.flush();
        writer.close();

        return writer.toString();
    }

    private String serializeAppBootstrap(Instance<?> appInstance, AuraContext context) throws IOException {
        // reduce verbosity of serialization
        context.setPreloading(false);

        JsonSerializationContext serializationContext = context.getJsonSerializationContext();
        StringWriter writer = new StringWriter();
        JsonEncoder json = JsonEncoder.createJsonStream(writer, serializationContext);
        writer.append("window.Aura.appBootstrap = ");
        json.writeMapBegin();
        json.writeMapKey("data");
        json.writeMapBegin();

        bootstrapUtil.serializeApplication(appInstance, context, json);

        json.writeMapEnd();
        json.writeMapEnd();
        writer.write(bootstrapUtil.getAppendScript());
        writer.flush();
        writer.close();

        return writer.toString();
    }

    private String serializeStyleContext(AuraContext context) throws IOException{
        if (context.getStyleContext() == null){
            context.setStyleContext();
        }
        JsonSerializationContext serializationContext = context.getJsonSerializationContext();
        StringWriter writer = new StringWriter();
        JsonEncoder json = JsonEncoder.createJsonStream(writer, serializationContext);
        json.writeValue(context.getStyleContext());
        writer.flush();
        writer.close();

        return writer.toString();
    }

    private String writeError(Throwable t, AuraContext context) throws IOException {
        JsonSerializationContext serializationContext = context.getJsonSerializationContext();
        StringWriter writer = new StringWriter();
        JsonEncoder json = JsonEncoder.createJsonStream(writer, serializationContext);
        writer.append("window.Aura.appBootstrap = ");
        json.writeMapBegin();
        json.writeMapEntry("error", t);
        json.writeMapEnd();
        writer.write(bootstrapUtil.getAppendScript());
        writer.flush();
        writer.close();

        return writer.toString();
    }

    @Override
    public String serializeInitializers(AuraContext context) throws IOException {
        Map<String, ApplicationInitializer> appInitializers;
        String appName = context.getApplicationDescriptor().getDescriptorName();
        appInitializers = applicationInitializerCache.getInitializers(appName);
        JsonSerializationContext serializationContext = context.getJsonSerializationContext();
        StringBuilder sb = new StringBuilder();
        JsonEncoder json = new JsonEncoder(sb, serializationContext);
        json.writeMapBegin();
        for (Map.Entry<String, ApplicationInitializer> entry : appInitializers.entrySet()) {
            json.writeMapEntry(entry.getKey(), entry.getValue().provideConfiguration());
        }
        json.writeMapEnd();
        return sb.toString();
    }

    @Override
    public <T extends BaseComponentDef> Component writeTemplate(AuraContext context,
            T value, Map<String, Object> componentAttributes, Appendable out)
            throws IOException, QuickFixException {

        ComponentDef templateDef = value.getTemplateDef();
        Map<String, Object> attributes = Maps.newHashMap();
        Mode mode = context.getMode();
        StringBuilder sb = new StringBuilder();
        String serializedContext = null;

        if (configAdapter.isBootstrapInliningEnabled() &&
               (context.getFormat() == AuraContext.Format.JS || cspInliningService.getInlineMode() != CSPInliningService.InlineScriptMode.UNSUPPORTED)) {
            // ensure definitions are serialized inline on the context and not via uri addressable defs.
            context.setSerializeDefinitions(true);
            // ensure app dependencies are excluded from context serialization
            try {
                DefDescriptor<? extends BaseComponentDef> app = context.getApplicationDescriptor();
                Instance<?> appInstance = null;
                if (!configAdapter.isBootstrapModelExclusionEnabled()) {
                    appInstance = instanceService.getInstance(app, componentAttributes);
                }

                serializedContext = serializeContext(context);

                String appBootstrap = serializeAppBootstrap(appInstance, context);
                attributes.put("appBootstrap", appBootstrap);
            }
            catch (Throwable t) {
                // if there was an error initializing and serializing the app, fallback to the less verbose context
                // serialization and include the error to display during init
                serializedContext = context.serialize(AuraContext.EncodingStyle.Full);
                attributes.put("appBootstrap", writeError(t, context));
            }
        } else {
            serializedContext = context.serialize(AuraContext.EncodingStyle.Full);
        }

        if (configAdapter.uriAddressableDefsEnabled()){
            String styleContext = serializeStyleContext(context);
            attributes.put("styleContext", styleContext);
        }

        templateUtil.writePreloadLinkTags(servletUtilAdapter.getCssPreloadUrls(context), sb);
        templateUtil.writePreloadScriptTags(servletUtilAdapter.getJsPreloadUrls(context), sb);
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

        templateUtil.writeHtmlDataHrefStyles(servletUtilAdapter.getStyles(context), "auraCss", sb);
        attributes.put("auraStyleTags", sb.toString());
        sb.setLength(0);

        if (mode.allowLocalRendering() && value.isLocallyRenderable()) {

            BaseComponent<?, ?> cmp = (BaseComponent<?, ?>) instanceService.getInstance(value, componentAttributes);

            attributes.put("body", Lists.<BaseComponent<?, ?>> newArrayList(cmp));
            attributes.put("bodyClass", "");
            attributes.put("defaultBodyClass", "");
            attributes.put("autoInitialize", "false");
            attributes.put("auraInit", "{context:{}}");

        } else {
            if (manifestUtil.isManifestEnabled()) {
                attributes.put("manifest", servletUtilAdapter.getManifestUrl(context, componentAttributes));
            }

            servletUtilAdapter.writeScriptUrls(context, value, componentAttributes, sb);

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

            boolean bootstrapInlined = configAdapter.isBootstrapInliningEnabled();
            // appcached apps must receive the token via bootstrap to avoid caching of the token
            // When bootstrap is inlined, Its content would be cached in appCache either as part of the app template or inline.js.
            // In the case of a stale cached token, aura actions would recover through action retry logic.
            if (!manifestUtil.isManifestEnabled() || bootstrapInlined) {
                auraInit.put("token", configAdapter.getCSRFToken());
            }
            auraInit.put("bootstrapInlined", bootstrapInlined);

            auraInit.put("MaxParallelXHRCount", configAdapter.getMaxParallelXHRCount());
            auraInit.put("XHRExclusivity", configAdapter.getXHRExclusivity());
            auraInit.put("cssVariables", CssVariableWriter.getCssVariables(definitionService, contextService));

            if (configAdapter.isBootstrapModelExclusionEnabled()) {
                auraInit.put("initializers", new Literal(serializeInitializers(context)));
            }

            auraInit.put("context", new Literal(serializedContext));
            attributes.put("auraInit", JsonEncoder.serialize(auraInit));
        }

        Component template = instanceService.getInstance(templateDef.getDescriptor(), attributes);
        return template;
    }
}
