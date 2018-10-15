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
package org.auraframework.impl.adapter;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.auraframework.adapter.GlobalValueProviderAdapter;
import org.auraframework.annotations.Annotations.ServiceComponent;
import org.auraframework.instance.GlobalValueProvider;
import org.auraframework.instance.GlobalValueProviderFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;

/**
 * Factory bean for retrieving {@link GlobalValueProvider}s.
 * 
 * @author eperret (Eric Perret)
 */
@ServiceComponent
public class GlobalValueProviderFactoryImpl implements GlobalValueProviderFactory {

    private final GlobalValueProviderAdapter primaryGlobalValueProviderAdapter;
    private final List<GlobalValueProviderAdapter> globalValueProviderAdapters;
    
    /**
     * Sets the sources for the {@link GlobalValueProvider}. They will be used at runtime to look up the
     * {@code GlobalValueProvider}s applicable for current request/context.
     * 
     * @param primaryGlobalValueProviderAdapter The adapter for retrieving the primary {@link GlobalValueProvider}s.
     * @param globalValueProviderAdapters The adapter for retrieving the secondary/tertiary
     *        {@code GlobalValueProvider}s.
     */
    @Autowired
    @Lazy
    public GlobalValueProviderFactoryImpl(final GlobalValueProviderAdapter primaryGlobalValueProviderAdapter, final List<GlobalValueProviderAdapter> globalValueProviderAdapters) {
        this.primaryGlobalValueProviderAdapter = primaryGlobalValueProviderAdapter;
        this.globalValueProviderAdapters = globalValueProviderAdapters;
    }
    
    /* (non-Javadoc)
     * @see org.auraframework.instance.GlobalValueProviderFactory#getGlobalProviders()
     */
    @Override
    public Map<String, GlobalValueProvider> getGlobalProviders() {
        // load any @Primary GlobalValueProviderAdapter first, to give it's
        // implementations precedence
        final Map<String, GlobalValueProvider> instances = new HashMap<>();
        for (final GlobalValueProvider g : primaryGlobalValueProviderAdapter.createValueProviders()) {
            instances.put(g.getValueProviderKey().getPrefix(), g);
        }
        for (final GlobalValueProviderAdapter factory : globalValueProviderAdapters) {
            if (!factory.equals(primaryGlobalValueProviderAdapter)) {
                for (GlobalValueProvider g : factory.createValueProviders()) {
                    if (!instances.containsKey(g.getValueProviderKey().getPrefix())) {
                        instances.put(g.getValueProviderKey().getPrefix(), g);
                    }
                }
            }
        }

        return instances;
    }
}
