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

import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

import javax.inject.Inject;

import org.auraframework.adapter.ConfigAdapter;
import org.auraframework.adapter.ContextAdapter;
import org.auraframework.adapter.GlobalValueProviderAdapter;
import org.auraframework.adapter.PrefixDefaultsAdapter;
import org.auraframework.adapter.RegistryAdapter;
import org.auraframework.annotations.Annotations.ServiceComponent;
import org.auraframework.def.BaseComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.impl.system.MasterDefRegistryImpl;
import org.auraframework.impl.util.AuraUtil;
import org.auraframework.impl.util.json.AuraJsonContext;
import org.auraframework.instance.GlobalValueProvider;
import org.auraframework.service.CachingService;
import org.auraframework.service.ContextService;
import org.auraframework.service.DefinitionService;
import org.auraframework.service.LoggingService;
import org.auraframework.system.AuraContext;
import org.auraframework.system.AuraContext.Authentication;
import org.auraframework.system.AuraContext.Format;
import org.auraframework.system.AuraContext.Mode;
import org.auraframework.system.DefRegistry;
import org.auraframework.system.SourceLoader;
import org.auraframework.throwable.NoContextException;
import org.auraframework.util.json.JsonSerializerFactory;
import org.springframework.context.annotation.Lazy;

import com.google.common.collect.ImmutableMap;

@Lazy
@ServiceComponent
public class AuraContextServiceImpl implements ContextService {
    @Inject
    private GlobalValueProviderAdapter primaryGlobalValueProviderAdapter;

    @Inject
    private List<GlobalValueProviderAdapter> globalValueProviderAdapters;

    @Inject
    private ConfigAdapter configAdapter;

    @Inject
    private DefinitionService definitionService;

    @Inject
    private LoggingService loggingService;

    @Inject
    private ContextAdapter contextAdapter;

    @Inject
    private Collection<RegistryAdapter> providers;

    @Inject
    private PrefixDefaultsAdapter prefixDefaultsAdapter;

    @Inject
    private JsonSerializerFactory jsonSerializerFactory;

    private CachingService cachingService;

    @Inject
    public void setCachingService(CachingService service) {
        cachingService = service;
    }

    private static final long serialVersionUID = 2204785781318401371L;

    @Override
    public AuraContext getCurrentContext() {
        return contextAdapter.getCurrentContext();
    }

    /**
     * is there a context established
     */
    @Override
    public boolean isEstablished() {
        return contextAdapter.isEstablished();
    }

    @Override
    public AuraContext startContext(Mode mode, Format format, Authentication access) {
        return startContext(mode, null, format, access, null);
    }

    @Override
    public AuraContext startContext(Mode mode, Set<SourceLoader> loaders, Format format, Authentication access) {
        // initialize logging context
        loggingService.establish();
        MasterDefRegistryImpl mdr = getDefRegistry(mode, access, loaders);
        AuraContext context = contextAdapter.establish(mode, mdr,
                this.prefixDefaultsAdapter.getPrefixDefaults(mode), format, access,
                AuraJsonContext.createContext(mode, true, jsonSerializerFactory),
                getGlobalProviders(), null);
        mdr.setContext(context);
        return context;
    }

    @Override
    public AuraContext startContext(Mode mode, Format format, Authentication access,
            DefDescriptor<? extends BaseComponentDef> appDesc) {
        return startContext(mode, format, access, appDesc, false);
    }
    
    @Override
    public AuraContext startContext(Mode mode, Format format, Authentication access,
                    DefDescriptor<? extends BaseComponentDef> appDesc,
                    boolean isDebugToolEnabled) {
        return startContext(mode, null, format, access, appDesc, isDebugToolEnabled);
    }

    @Override
    public AuraContext startContext(Mode mode, Set<SourceLoader> loaders, Format format, Authentication access,
            DefDescriptor<? extends BaseComponentDef> appDesc) {
        return startContext(mode, loaders, format, access, appDesc, false);
    }
    
    @Override
    public AuraContext startContext(Mode mode, Set<SourceLoader> loaders, Format format, Authentication access,
            DefDescriptor<? extends BaseComponentDef> appDesc, boolean isDebugToolEnabled) {
        // initialize logging context
        loggingService.establish();
        MasterDefRegistryImpl mdr = getDefRegistry(mode, access, loaders);
        AuraContext context = contextAdapter.establish(mode, mdr,
                this.prefixDefaultsAdapter.getPrefixDefaults(mode), format, access,
                AuraJsonContext.createContext(mode, true, jsonSerializerFactory), getGlobalProviders(), appDesc, isDebugToolEnabled);
        mdr.setContext(context);
        return context;
    }

    @Override
    public void endContext() {
        try {
            contextAdapter.release();
        } finally {
            loggingService.release();
        }
    }

    @Override
    public AuraContext pushSystemContext() {
        assertEstablished();
        return contextAdapter.pushSystemContext();
    }

    @Override
    public void popSystemContext() {
        contextAdapter.popSystemContext();
    }

    private MasterDefRegistryImpl getDefRegistry(Mode mode, Authentication access, Set<SourceLoader> loaders) {
        return new MasterDefRegistryImpl(configAdapter, definitionService, loggingService, cachingService,
                getRegistries(mode, access, loaders));
    }

    private DefRegistry<?>[] getRegistries(Mode mode, Authentication access, Set<SourceLoader> loaders) {
        List<DefRegistry<?>> ret = new ArrayList<>();
        ret.addAll(addRegistriesFromProviders(providers, mode, access, loaders));
        return ret.toArray(new DefRegistry[ret.size()]);
    }

    private List<DefRegistry<?>> addRegistriesFromProviders(Collection<RegistryAdapter> providers, Mode mode,
                                                            Authentication access, Set<SourceLoader> loaders) {
        List<DefRegistry<?>> ret = new ArrayList<>();
        for (RegistryAdapter provider : providers) {
            DefRegistry<?>[] registries = provider.getRegistries(mode, access, loaders);
            if (registries != null) {
                Collections.addAll(ret, registries);
                }
            }
        return ret;
    }
    
    private Map<String, GlobalValueProvider> getGlobalProviders() {
        // load any @Primary GlobalValueProviderAdapter first, to give it's
        // implementations precedence
        Map<String, GlobalValueProvider> instances = new HashMap<>();
        for (GlobalValueProvider g : primaryGlobalValueProviderAdapter.createValueProviders()) {
            instances.put(g.getValueProviderKey().getPrefix(), g);
        }
        for (GlobalValueProviderAdapter factory : globalValueProviderAdapters) {
            if (!factory.equals(globalValueProviderAdapters)) {
                for (GlobalValueProvider g : factory.createValueProviders()) {
                    if (!instances.containsKey(g.getValueProviderKey().getPrefix())) {
                        instances.put(g.getValueProviderKey().getPrefix(), g);
                    }
                }
            }
        }
        return instances;
    }

    @Override
    public void assertEstablished() {
        if (!isEstablished()) {
            throw new NoContextException();
        }
    }

    @Override
    public void registerGlobal(String approvedName, boolean publicallyWritable, Object defaultValue) {
        AuraContextImpl.registerGlobal(approvedName, publicallyWritable, defaultValue);
    }
    
    @Override
    public ImmutableMap<String, AuraContext.GlobalValue> getAllowedGlobals()  {
        return (ImmutableMap<String, AuraContext.GlobalValue>) AuraUtil.immutableMap(AuraContextImpl.getAllowedGlobals());
    }
}
