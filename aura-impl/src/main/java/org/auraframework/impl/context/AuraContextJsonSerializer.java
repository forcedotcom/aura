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
package org.auraframework.impl.context;

import java.io.IOException;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.auraframework.adapter.ConfigAdapter;
import org.auraframework.def.ApplicationDef;
import org.auraframework.def.BaseComponentDef;
import org.auraframework.def.ComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.DefDescriptor.DefType;
import org.auraframework.def.Definition;
import org.auraframework.def.InterfaceDef;
import org.auraframework.def.module.ModuleDef;
import org.auraframework.instance.AuraValueProviderType;
import org.auraframework.instance.GlobalValueProvider;
import org.auraframework.service.DefinitionService;
import org.auraframework.system.AuraContext;
import org.auraframework.test.TestContext;
import org.auraframework.test.TestContextAdapter;
import org.auraframework.throwable.ClientOutOfSyncException;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.json.Json;
import org.auraframework.util.json.JsonSerializers.NoneSerializer;

import com.google.common.collect.Lists;
import com.google.common.collect.Sets;

/**
 * AuraContext JSON Serializer
 */
public class AuraContextJsonSerializer extends NoneSerializer<AuraContext> {

    public static interface AuraContextJsonSerializerProvider {
        AuraContextJsonSerializer createAuraContextJsonSerializer(ConfigAdapter configAdapter,
                TestContextAdapter testContextAdapter, DefinitionService definitionService);
    }

    public static final String DELETED = "deleted";

    protected final TestContextAdapter testContextAdapter;
    protected final ConfigAdapter configAdapter;
    private final DefinitionService definitionService;
    private static final Set<DefType> SERIALIZEABLE_DEF_TYPES = Sets.immutableEnumSet(
            DefType.COMPONENT,
            DefType.APPLICATION,
            DefType.EVENT,
            DefType.LIBRARY,
            DefType.MODULE);

    public AuraContextJsonSerializer(ConfigAdapter configAdapter, TestContextAdapter testContextAdapter,
            DefinitionService definitionService) {
        this.configAdapter = configAdapter;
        this.testContextAdapter = testContextAdapter;
        this.definitionService = definitionService;
    }

    private void writeDefs(Json json, String name, List<Definition> writable) throws IOException {
        if (writable.size() > 0) {
            json.writeMapEntry(name, writable);
        }
    }

    @Override
    public void serialize(Json json, AuraContext ctx) throws IOException {        
        // pre-compute some things needed to determine the cache key
        String fwuid = ctx.getFrameworkUID() != null ? ctx.getFrameworkUID() : configAdapter.getAuraFrameworkNonce();
        Map<DefDescriptor<? extends Definition>, Definition> defMap = ctx.filterLocalDefs(ctx.getPreloadedDefinitions());
        
        serialize(json, ctx, fwuid, defMap);
    }
    
    /**
     * IMPORTANT: if this logic changes, cache key construction in ZeroAuraContextJsonSerializer may also need to change.
     */
    @SuppressWarnings("unchecked")
    protected void serialize(Json json, AuraContext ctx, String fwuid, Map<DefDescriptor<? extends Definition>, Definition> defMap) throws IOException {
        
        Boolean uriEnabled = ctx.getUriDefsEnabled();
        if (uriEnabled == null) {
            uriEnabled = configAdapter.uriAddressableDefsEnabled();
        }

        json.writeMapBegin();
        json.writeMapEntry("mode", ctx.getMode());
        boolean isApplication = false;

        DefDescriptor<? extends BaseComponentDef> appDesc = ctx.getApplicationDescriptor();
        if (appDesc != null) {
            if (appDesc.getDefType().equals(DefType.APPLICATION)) {
                json.writeMapEntry("app", String.format("%s:%s", appDesc.getNamespace(), appDesc.getName()));
                isApplication = true;
            } else {
                json.writeMapEntry("cmp", String.format("%s:%s", appDesc.getNamespace(), appDesc.getName()));
            }

            if (uriEnabled) {
                try {
                    if (definitionService.hasInterface(appDesc, definitionService.getDefDescriptor("aura:uriDefinitionsDisabled", InterfaceDef.class))) {
                        uriEnabled = false;
                    }
                } catch (QuickFixException qfe) {
                    // ignore
                }
            }
        }

        String contextPath = ctx.getContextPath();
        if (!contextPath.isEmpty()) {
            // serialize servlet context path for html component to prepend for client created components
            json.writeMapEntry("contextPath", contextPath);
        }

        String currentPathPrefix = ctx.getPathPrefix();
        if (currentPathPrefix != null) {
            json.writeMapEntry("pathPrefix", currentPathPrefix);
        }

        if (testContextAdapter != null) {
            TestContext testContext = testContextAdapter.getTestContext();
            if (testContext != null) {
                json.writeMapEntry("test", testContext.getName());
            }
        }

        json.writeMapEntry("fwuid", fwuid);

        if (uriEnabled) {
            json.writeMapEntry(Json.ApplicationKey.URIADDRESSABLEDEFINITIONS, 1);
        }

        //
        // Now comes the tricky part, we have to serialize all of the definitions that are
        // required on the client side, and, of all types. This way, we won't have to handle
        // ugly cases of actual definitions nested inside our configs, and, we ensure that
        // all dependencies actually get sent to the client. Note that the 'loaded' set needs
        // to be updated as well, but that needs to happen prior to this.
        //
        if (defMap.size() > 0) {

            try {
                definitionService.populateGlobalValues(AuraValueProviderType.LABEL.getPrefix(), defMap);
            } catch (QuickFixException qfe) {
                // this should not throw a QFE
            }

            List<Definition> componentDefs = Lists.newArrayList();
            List<Definition> moduleDefs = Lists.newArrayList();
            
            if (uriEnabled && !ctx.isPreloading()) {
                if (!defMap.isEmpty()) {
                    json.writeMapKey("descriptorUids");
                    json.writeMapBegin();

                    for (Map.Entry<DefDescriptor<? extends Definition>, Definition> entry : defMap.entrySet()) {
                        Definition def = entry.getValue();

                        if (def != null && SERIALIZEABLE_DEF_TYPES.contains(entry.getKey().getDefType())) {
                            if (def.isDynamicallyGenerated()) {
                                DefType dt = entry.getKey().getDefType();
                                if (DefType.COMPONENT.equals(dt) || DefType.APPLICATION.equals(dt)) {
                                    componentDefs.add(def);
                                } else if (DefType.MODULE.equals(dt)) {
                                    moduleDefs.add(def);
                                }
                                continue;
                            }
                            try {
                                json.writeMapEntry(def.getDescriptor(), definitionService.getUid(null, def.getDescriptor()));
                            } catch (Exception ex) {
                                //TODO: error handling, surface the exception
                            }
                        }
                    }
                    json.writeMapEnd();
                }
                
                if (componentDefs.size() > 0) {
                    writeDefs(json, "componentDefs", componentDefs);
                }
                if (moduleDefs.size() > 0) {
                    writeDefs(json, "moduleDefs", moduleDefs);
                }

            } else {

                List<Definition> eventDefs = Lists.newArrayList();
                List<Definition> libraryDefs = Lists.newArrayList();

                for (Map.Entry<DefDescriptor<? extends Definition>, Definition> entry : defMap.entrySet()) {
                    DefDescriptor<? extends Definition> desc = entry.getKey();
                    DefType dt = desc.getDefType();
                    Definition d = entry.getValue();
                    //
                    // Ignore defs that ended up not being valid. This is arguably something
                    // that the MDR should have done when filtering.
                    //
                    if (d != null) {
                        if (DefType.COMPONENT.equals(dt) || DefType.APPLICATION.equals(dt)) {
                            componentDefs.add(d);
                        } else if (DefType.EVENT.equals(dt)) {
                            eventDefs.add(d);
                        } else if (DefType.LIBRARY.equals(dt)) {
                            libraryDefs.add(d);
                        } else if (DefType.MODULE.equals(dt)) {
                            moduleDefs.add(d);
                        }
                    }
                }
                if (eventDefs.size() > 0) {
                    writeDefs(json, "eventDefs", eventDefs);
                }
                if (libraryDefs.size() > 0) {
                    writeDefs(json, "libraryDefs", libraryDefs);
                }
                if (componentDefs.size() > 0) {
                    writeDefs(json, "componentDefs", componentDefs);
                }
                if (moduleDefs.size() > 0) {
                    writeDefs(json, "moduleDefs", moduleDefs);
                }
            }
        }

        try {
            addTrackedDefs(appDesc, defMap);
        } catch (QuickFixException e) {
            // If we fail, we have nothing to do.
        }

        // Create the new loaded array.
        // loaded = server + (client - server) @ DELETED.

        // Step 1: Start with client defintion set
        Set<DefDescriptor<?>> currentLoaded = new HashSet<>();
        currentLoaded.addAll(ctx.getClientLoaded().keySet());

        // Step 2: serialize the server set and subtract the server set from the client set.
        Map<String, String> loadedStrings = new HashMap<>();
        for (Map.Entry<DefDescriptor<?>, String> entry : ctx.getLoaded().entrySet()) {
            if (!uriEnabled || appDesc.equals(entry.getKey())) {
                // uri defs disabled or
                // if uri defs enabled we want to send the application in loaded still
                loadedStrings.put(String.format("%s@%s", entry.getKey().getDefType().toString(),
                        entry.getKey().getQualifiedName()), entry.getValue());
            }
            currentLoaded.remove(entry.getKey());

        }

        // Step 3: serialize remaining not found client definitions, now unused.
        for (DefDescriptor<?> deleted : currentLoaded) {
            loadedStrings.put(String.format("%s@%s", deleted.getDefType().toString(),
                    deleted.getQualifiedName()), DELETED);
        }
        if (loadedStrings.size() > 0) {
            json.writeMapKey("loaded");
            json.writeMap(loadedStrings);
        }

        ctx.serializeAsPart(json);

        //
        // client needs value providers, urls don't
        // Note that we do this _post_ components, because they load labels.
        //
        boolean started = false;

        for (GlobalValueProvider valueProvider : ctx.getGlobalProviders().values()) {
            if (!valueProvider.isEmpty()) {
                if (!started) {
                    json.writeMapKey("globalValueProviders");
                    json.writeArrayBegin();
                    started = true;
                }
                json.writeComma();
                json.writeIndent();
                json.writeMapBegin();
                json.writeMapEntry("type", valueProvider.getValueProviderKey().getPrefix());
                json.writeMapEntry("values", valueProvider.getData());
                json.writeMapEnd();
            }
        }

        if (started) {
            json.writeArrayEnd();
        }

        // JBUCH: TEMPORARY CRUC FIX FOR 202. REMOVE IN 204
        json.writeMapEntry("enableAccessChecks",((AuraContextImpl)ctx).enableAccessChecks);

        if (configAdapter.isActionPublicCachingEnabled()) {
            json.writeMapEntry("apce", 1);
            json.writeMapEntry("apck", ctx.getActionPublicCacheKey());
        }

        if (configAdapter.isLockerServiceEnabled()) {
            json.writeMapEntry("ls", 1);
        }
        
        if (configAdapter.isStrictCSPEnforced()) {
            json.writeMapEntry("csp", 1);
        }

        if (configAdapter.isFrozenRealmEnabled()) {
            json.writeMapEntry("fr", 1);
        }
        
        if (configAdapter.cdnEnabled()) {
            json.writeMapEntry(Json.ApplicationKey.CDN_HOST, configAdapter.getCDNDomain());
        }

        Map<String, String> moduleNamespaceAliases = configAdapter.getModuleNamespaceAliases();
        if (!moduleNamespaceAliases.isEmpty()) {
            json.writeMapEntry("mna", moduleNamespaceAliases);
        }

        if (ctx.useCompatSource()) {
            json.writeMapEntry("c", 1);
        }

        if (ctx.forceCompat()) {
            json.writeMapEntry("fc", 1);
        }

        if (isApplication) {
            try {
                injectModuleServices(json, (DefDescriptor<ApplicationDef>) appDesc);
            } catch (QuickFixException e) {}
        }

        json.writeMapEnd();

    }

    private void injectModuleServices (Json json, DefDescriptor<ApplicationDef> appDesc) throws QuickFixException, IOException {
        ApplicationDef appDef = definitionService.getDefinition(appDesc);
        Set<DefDescriptor<ModuleDef>> services = appDef.getModuleServices();
        if (services != null && !services.isEmpty()) {
            json.writeMapEntry("services", services);
        }
    }

    private void addTrackedDefs(DefDescriptor<? extends BaseComponentDef> appDesc, 
            Map<DefDescriptor<? extends Definition>, Definition> defMap) throws QuickFixException {

        if (appDesc == null || defMap == null || defMap.isEmpty()) {
            return;
        }

        BaseComponentDef appDef = definitionService.getDefinition(appDesc);
        List<DefDescriptor<ComponentDef>> trackedDefs = appDef.getTrackedDependencies();
        if (trackedDefs == null || trackedDefs.isEmpty()) {
            return;
        }

        for (DefDescriptor<? extends Definition> desc : defMap.keySet()) {
            if (trackedDefs.contains(desc)) {
                try {
                    definitionService.updateLoaded(desc);
                } catch (ClientOutOfSyncException e) {
                    // We can swallow the exception here since desc is taken
                    // from the set of definition we are already returning
                    // and out of sync would have already been processed.
                }
            }
        }
    }
}
