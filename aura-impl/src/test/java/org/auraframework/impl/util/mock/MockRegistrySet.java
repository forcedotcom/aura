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
package org.auraframework.impl.util.mock;

import java.util.Collection;
import java.util.List;
import java.util.Map;

import org.auraframework.def.DefDescriptor;
import org.auraframework.def.Definition;
import org.auraframework.def.DescriptorFilter;
import org.auraframework.system.DefRegistry;
import org.auraframework.system.RegistrySet;
import org.mockito.Mockito;

import com.google.common.collect.Lists;
import com.google.common.collect.Maps;

/**
 * Registry sets do not lend themselves to mocking, too many generics.
 */
public class MockRegistrySet implements RegistrySet {
    private final Map<DefDescriptor<?>,DefRegistry> registryMap = Maps.newHashMap();
    private final Map<DescriptorFilter, Collection<DefRegistry>> filterMap = Maps.newHashMap();
    private final List<DefRegistry> allRegistries = Lists.newArrayList();
    
    public void addRegistryFor(DefDescriptor<?> descriptor, DefRegistry registry) {
        registryMap.put(descriptor, registry);
        if (!allRegistries.contains(registry)) {
            allRegistries.add(registry);
        }
    }

    public void addFilterFor(DescriptorFilter matcher, Collection<DefRegistry> registries) {
        filterMap.put(matcher, registries);
        for (DefRegistry registry: registries) {
            if (!allRegistries.contains(registry)) {
                allRegistries.add(registry);
            }
        }
    }

    public void addFilterFor(DescriptorFilter matcher, DefRegistry registry) {
        addFilterFor(matcher, Lists.newArrayList(registry));
    }


    @Override
    public Collection<DefRegistry> getAllRegistries() {
        return allRegistries;
    }

    @Override
    public Collection<DefRegistry> getRegistries(DescriptorFilter matcher) {
        return filterMap.get(matcher);
    }

    @Override
    public <T extends Definition> DefRegistry getRegistryFor(DefDescriptor<T> descriptor) {
        return registryMap.get(descriptor);
    }

    /**
     * add defDescriptor desc to defRegistry reg, when we call reg.getDef(desc), it will return definition
     * @param desc
     * @param reg
     * @param definition
     * @throws Exception
     */
    public <T extends Definition> void setupRegistryFor(DefDescriptor<T> desc, DefRegistry reg, T definition)
            throws Exception {
        addRegistryFor(desc, reg);
        Mockito.when(reg.getDef(desc)).thenReturn(definition);
    }

}
