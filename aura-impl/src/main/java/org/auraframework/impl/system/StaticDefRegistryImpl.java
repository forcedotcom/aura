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
package org.auraframework.impl.system;

import com.google.common.collect.Maps;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.DefDescriptor.DefType;
import org.auraframework.def.Definition;
import org.auraframework.def.DescriptorFilter;
import org.auraframework.system.Source;
import org.auraframework.system.SourceLoader;

import java.util.Collection;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;

/**
 * Immutable DefRegistry implementation, backed by a prepopulated map.
 */
public class StaticDefRegistryImpl extends DefRegistryImpl {

    private static final long serialVersionUID = 1L;
    protected final Map<DefDescriptor<?>, Definition> defs;
    private transient SourceLoader sourceLoader = null;
    private String name;

    public StaticDefRegistryImpl(Set<DefType> defTypes, Set<String> prefixes, Set<String> namespaces,
            Collection<? extends Definition> defs) {
        this(defTypes, prefixes, namespaces, Maps.<DefDescriptor<?>, Definition> newHashMapWithExpectedSize(defs.size()));
        for (Definition def : defs) {
            DefDescriptor<?> desc = def.getDescriptor();
            this.defs.put(desc, def);
        }
    }

    public StaticDefRegistryImpl(Set<DefType> defTypes, Set<String> prefixes, Set<String> namespaces,
            Map<DefDescriptor<?>, Definition> defs) {
        super(defTypes, prefixes, namespaces);
        this.defs = defs;
        this.name = getClass().getSimpleName() + defTypes + prefixes + namespaces;
    }

    @Override
    @SuppressWarnings("unchecked")
    public <D extends Definition> D getDef(DefDescriptor<D> descriptor) {
        return (D)defs.get(descriptor);
    }

    public void setSourceLoader(SourceLoader sourceLoader) {
        this.sourceLoader = sourceLoader;
    }

    @Override
    public boolean hasFind() {
        return true;
    }

    @Override
    public Set<DefDescriptor<?>> find(DescriptorFilter matcher) {
        Set<DefDescriptor<?>> ret = new HashSet<>();

        for (DefDescriptor<?> key : defs.keySet()) {
            if (matcher.matchDescriptor(key)) {
                ret.add(key);
            }
        }
        return ret;
    }

    @Override
    public <D extends Definition> boolean exists(DefDescriptor<D> descriptor) {
        return defs.containsKey(descriptor);
    }

    @Override
    public <D extends Definition> Source<D> getSource(DefDescriptor<D> descriptor) {
        if (sourceLoader != null) {
            return sourceLoader.getSource(descriptor);
        }
        return null;
    }

    @Override
    public boolean isCacheable() {
        return true;
    }
    
    @Override
    public boolean isStatic() {
        return true;
    }

    @Override
    public void reset() {
    }

    @Override
    public String toString() {
        // matches the same output of CompilingDefRegistry
        return name;
    }
}
