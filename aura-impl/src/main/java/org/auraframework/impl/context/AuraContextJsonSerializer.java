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
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;

import org.auraframework.adapter.ConfigAdapter;
import org.auraframework.def.BaseComponentDef;
import org.auraframework.def.ApplicationDef;
import org.auraframework.def.ComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.DefDescriptor.DefType;
import org.auraframework.def.Definition;
import org.auraframework.def.module.ModuleDef;
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


/**
 * AuraContext JSON Serializer
 */
public class AuraContextJsonSerializer extends NoneSerializer<AuraContext> {
    public static final String DELETED = "deleted";

    private final TestContextAdapter testContextAdapter;
    private final ConfigAdapter configAdapter;
    private final DefinitionService definitionService;

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

    @SuppressWarnings("unchecked")
    @Override
    public void serialize(Json json, AuraContext ctx) throws IOException {

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
        }
                    
        String contextPath = ctx.getContextPath();
        if (!contextPath.isEmpty()) {
            // serialize servlet context path for html component to prepend for client created components
            json.writeMapEntry("contextPath", contextPath);
        }

        if (ctx.getRequestedLocales() != null) {
            List<String> locales = new ArrayList<>();
            for (Locale locale : ctx.getRequestedLocales()) {
                locales.add(locale.toString());
            }
            json.writeMapEntry("requestedLocales", locales);
        }

        if (testContextAdapter != null) {
            TestContext testContext = testContextAdapter.getTestContext();
            if (testContext != null) {
                json.writeMapEntry("test", testContext.getName());
            }
        }

        if (ctx.getFrameworkUID() != null) {
            json.writeMapEntry("fwuid", ctx.getFrameworkUID());
        } else {
            json.writeMapEntry("fwuid", configAdapter.getAuraFrameworkNonce());
        }
        
        //
        // Now comes the tricky part, we have to serialize all of the definitions that are
        // required on the client side, and, of all types. This way, we won't have to handle
        // ugly cases of actual definitions nested inside our configs, and, we ensure that
        // all dependencies actually get sent to the client. Note that the 'loaded' set needs
        // to be updated as well, but that needs to happen prior to this.
        //
        Map<DefDescriptor<? extends Definition>, Definition> defMap;

        defMap = ctx.filterLocalDefs(ctx.getPreloadedDefinitions());

        if (defMap.size() > 0) {
            List<Definition> componentDefs = Lists.newArrayList();
            List<Definition> eventDefs = Lists.newArrayList();
            List<Definition> libraryDefs = Lists.newArrayList();
            List<Definition> moduleDefs = Lists.newArrayList();

            for (Map.Entry<DefDescriptor<? extends Definition>, Definition> entry : defMap.entrySet()) {
                DefDescriptor<? extends Definition> desc = entry.getKey();
                DefType dt = desc.getDefType();
                Definition d = entry.getValue();
                //
                // Ignore defs that ended up not being valid. This is arguably something
                // that the MDR should have done when filtering.
                //
                if (d != null) {
                    try {
                        d.retrieveLabels();
                    } catch (QuickFixException qfe) {
                        // this should not throw a QFE
                    }
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
            writeDefs(json, "eventDefs", eventDefs);
            writeDefs(json, "libraryDefs", libraryDefs);
            writeDefs(json, "componentDefs", componentDefs);
            writeDefs(json, "moduleDefs", moduleDefs);
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
            loadedStrings.put(String.format("%s@%s", entry.getKey().getDefType().toString(),
                    entry.getKey().getQualifiedName()), entry.getValue());
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


        if (configAdapter.isLockerServiceEnabled()) {
            json.writeMapEntry("lockerEnabled", true);
        }

        if (ctx.isModulesEnabled()) {
            json.writeMapEntry("m", 1);
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
        List<DefDescriptor<ModuleDef>> services = appDef.getModuleServices();
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
