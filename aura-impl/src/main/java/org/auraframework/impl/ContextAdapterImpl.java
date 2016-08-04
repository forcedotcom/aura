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

import org.antlr.misc.MutableInteger;
import org.auraframework.adapter.ConfigAdapter;
import org.auraframework.adapter.ContextAdapter;
import org.auraframework.annotations.Annotations.ServiceComponent;
import org.auraframework.def.BaseComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.DefDescriptor.DefType;
import org.auraframework.impl.context.AuraContextImpl;
import org.auraframework.impl.system.MasterDefRegistryImpl;
import org.auraframework.instance.GlobalValueProvider;
import org.auraframework.service.CachingService;
import org.auraframework.service.DefinitionService;
import org.auraframework.service.LoggingService;
import org.auraframework.system.AuraContext;
import org.auraframework.system.AuraContext.Authentication;
import org.auraframework.system.AuraContext.Format;
import org.auraframework.system.AuraContext.Mode;
import org.auraframework.system.MasterDefRegistry;
import org.auraframework.test.TestContextAdapter;
import org.auraframework.throwable.AuraRuntimeException;
import org.auraframework.util.json.JsonSerializationContext;
import org.springframework.beans.factory.annotation.Autowired;

import javax.inject.Inject;

import java.util.Map;

/**
 */
@ServiceComponent
public class ContextAdapterImpl implements ContextAdapter {
    @Inject
    private ConfigAdapter configAdapter;

    @Inject
    private CachingService cachingService;

    @Inject
    private DefinitionService definitionService;

    @Inject
    private LoggingService loggingService;

    @Autowired(required=false)
    private TestContextAdapter testContextAdapter;

    private static ThreadLocal<AuraContext> currentContext = new ThreadLocal<>();
    
    private static ThreadLocal<AuraContext> systemContext = new ThreadLocal<>();

    private static ThreadLocal<MutableInteger> systemDepth = new ThreadLocal<>();

    @Override
    public AuraContext establish(Mode mode, MasterDefRegistry masterRegistry, Map<DefType, String> defaultPrefixes,
            Format format, Authentication access, JsonSerializationContext jsonContext,
            Map<String, GlobalValueProvider> globalProviders,
            DefDescriptor<? extends BaseComponentDef> appDesc) {
        return establish(mode, masterRegistry, defaultPrefixes, format, access, jsonContext,
                globalProviders, appDesc, false);
    }

    @Override
    public AuraContext establish(Mode mode, MasterDefRegistry masterRegistry,
                                 Map<DefType, String> defaultPrefixes, Format format, Authentication access,
                                 JsonSerializationContext jsonContext,
                                 Map<String, GlobalValueProvider> globalProviders,
                                 DefDescriptor<? extends BaseComponentDef> appDesc,
                                 boolean isDebugToolEnabled) {
        AuraContext context = new AuraContextImpl(mode, masterRegistry, defaultPrefixes, format, access, jsonContext,
                globalProviders, isDebugToolEnabled, configAdapter, definitionService, testContextAdapter);
        currentContext.set(context);
        context.setApplicationDescriptor(appDesc);
        
        return context;
    }

    protected AuraContext buildSystemContext(AuraContext original) {
        MasterDefRegistryImpl mdr = new MasterDefRegistryImpl(configAdapter, definitionService, loggingService,
                cachingService, (MasterDefRegistryImpl) original.getDefRegistry());
        AuraContext context = new AuraContextImpl(original.getMode(), mdr, original.getDefaultPrefixes(), original.getFormat(), original.getAccess(),
                original.getJsonSerializationContext(), original.getGlobalProviders(), false, configAdapter,
                definitionService, testContextAdapter);
        mdr.setContext(context);
        return context;
    }
    
    @Override
    public AuraContext pushSystemContext() {
        AuraContext context = systemContext.get();
        MutableInteger count = systemDepth.get();
        
        if (count == null) {
            count = new MutableInteger(1);
            systemDepth.set(count);
        } else {
            count.value += 1;
        }
        if (context == null) {
            context = buildSystemContext(currentContext.get());
            systemContext.set(context);
        }
        return context;
    }

    @Override
    public void popSystemContext() {
        MutableInteger count = systemDepth.get();

        if (count == null || count.value == 0) {
            throw new AuraRuntimeException("unmatched pop");
        }
        count.value -= 1;
    }
    
    @Override
    public AuraContext getCurrentContext() {
        MutableInteger count = systemDepth.get();

        if (count != null && count.value > 0) {
            return systemContext.get();
        }
        return currentContext.get();
    }

    @Override
    public boolean isEstablished() {
        return currentContext.get() != null;
    }

    @Override
    public void release() {
        currentContext.set(null);
        systemContext.set(null);

        MutableInteger count = systemDepth.get();
        if (count != null && count.value != 0) {
            throw new AuraRuntimeException("unmatched push");
        }
    }
}
