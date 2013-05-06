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
import java.util.EnumMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.auraframework.Aura;
import org.auraframework.adapter.GlobalValueProviderAdapter;
import org.auraframework.adapter.PrefixDefaultsAdapter;
import org.auraframework.adapter.RegistryAdapter;
import org.auraframework.def.BaseComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.impl.AuraImpl;
import org.auraframework.impl.system.MasterDefRegistryImpl;
import org.auraframework.impl.util.json.AuraJsonContext;
import org.auraframework.instance.GlobalValueProvider;
import org.auraframework.instance.ValueProviderType;
import org.auraframework.service.ContextService;
import org.auraframework.system.AuraContext;
import org.auraframework.system.AuraContext.Access;
import org.auraframework.system.AuraContext.Format;
import org.auraframework.system.AuraContext.Mode;
import org.auraframework.system.DefRegistry;
import org.auraframework.system.MasterDefRegistry;
import org.auraframework.system.SourceLoader;
import org.auraframework.throwable.NoContextException;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.ServiceLocator;

/**
 */
public class AuraContextServiceImpl implements ContextService {

    private static final long serialVersionUID = 2204785781318401371L;

    @Override
    public AuraContext getCurrentContext() {
        return AuraImpl.getContextAdapter().getCurrentContext();
    }

    /**
     * is there a context established
     */
    @Override
    public boolean isEstablished() {
        return AuraImpl.getContextAdapter().isEstablished();
    }

    @Override
    public AuraContext startContext(Mode mode, Format format, Access access) {
        return startContext(mode, null, format, access, null);
    }

    @Override
    public AuraContext startContext(Mode mode, Set<SourceLoader> loaders, Format format, Access access) {
        // initialize logging context
        Aura.getLoggingService().establish();
        AuraContext context = AuraImpl.getContextAdapter().establish(mode, getDefRegistry(mode, access, loaders),
                getDefaultsProvider().getPrefixDefaults(mode), format, access,
                AuraJsonContext.createContext(mode, true), getGlobalProviders(), null);
        return context;
    }

    @Override
    public AuraContext startContext(Mode mode, Format format, Access access,
            DefDescriptor<? extends BaseComponentDef> appDesc) {
        return startContext(mode, format, access, appDesc, false);
    }
    
    @Override
	public AuraContext startContext(Mode mode, Format format, Access access,
			DefDescriptor<? extends BaseComponentDef> appDesc,
			boolean isDebugToolEnabled) {
		return startContext(mode, null, format, access, appDesc, isDebugToolEnabled);
	}

    @Override
    public AuraContext startContext(Mode mode, Set<SourceLoader> loaders, Format format, Access access,
            DefDescriptor<? extends BaseComponentDef> appDesc) {
    	return startContext(mode, loaders, format, access, appDesc, false);
    }
    
    @Override
    public AuraContext startContext(Mode mode, Set<SourceLoader> loaders, Format format, Access access,
            DefDescriptor<? extends BaseComponentDef> appDesc, boolean isDebugToolEnabled) {
        // initialize logging context
        Aura.getLoggingService().establish();
        AuraContext context = AuraImpl.getContextAdapter().establish(mode, getDefRegistry(mode, access, loaders),
                getDefaultsProvider().getPrefixDefaults(mode), format, access,
                AuraJsonContext.createContext(mode, true), getGlobalProviders(), appDesc, isDebugToolEnabled);
        return context;
    }

    @Override
    public void endContext() {
        try {
            AuraImpl.getContextAdapter().release();
        } finally {
            Aura.getLoggingService().release();
        }
    }

    private PrefixDefaultsAdapter getDefaultsProvider() {
        return ServiceLocator.get().get(PrefixDefaultsAdapter.class);
    }

    private MasterDefRegistry getDefRegistry(Mode mode, Access access, Set<SourceLoader> loaders) {
        return new MasterDefRegistryImpl(getRegistries(mode, access, loaders));
    }

    private DefRegistry<?>[] getRegistries(Mode mode, Access access, Set<SourceLoader> loaders) {
        List<DefRegistry<?>> ret = new ArrayList<DefRegistry<?>>();
        Collection<RegistryAdapter> providers = AuraImpl.getRegistryAdapters();
        for (RegistryAdapter provider : providers) {
            DefRegistry<?>[] registries = provider.getRegistries(mode, access, loaders);
            if (registries != null) {
                for (DefRegistry<?> reg : registries) {
                    ret.add(reg);
                }
            }
        }
        return ret.toArray(new DefRegistry[ret.size()]);
    }

    private Map<ValueProviderType, GlobalValueProvider> getGlobalProviders() {
        // load any @Primary GlobalValueProviderAdatper first, to give it's
        // implementations percedence
        GlobalValueProviderAdapter primaryFactory = ServiceLocator.get().get(GlobalValueProviderAdapter.class);
        Map<ValueProviderType, GlobalValueProvider> instances = new EnumMap<ValueProviderType, GlobalValueProvider>(
                ValueProviderType.class);
        for (GlobalValueProvider g : primaryFactory.createValueProviders()) {
            instances.put(g.getValueProviderKey(), g);
        }
        Collection<GlobalValueProviderAdapter> factories = ServiceLocator.get()
                .getAll(GlobalValueProviderAdapter.class);
        for (GlobalValueProviderAdapter factory : factories) {
            if (!factory.equals(primaryFactory)) {
                for (GlobalValueProvider g : factory.createValueProviders()) {
                    if (!instances.containsKey(g.getValueProviderKey())) {
                        instances.put(g.getValueProviderKey(), g);
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
    public void assertAccess(DefDescriptor<?> desc) throws QuickFixException {
        assertEstablished();

        getCurrentContext().getDefRegistry().assertAccess(desc);
    }

}
