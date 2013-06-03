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

import java.util.Collection;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;

import org.auraframework.def.DefDescriptor;
import org.auraframework.def.DefDescriptor.DefType;
import org.auraframework.def.Definition;
import org.auraframework.def.DescriptorFilter;
import org.auraframework.system.Source;

import com.google.common.collect.Maps;

/**
 * Immutable DefRegistry implementation, backed by a prepopulated map.
 */
public class StaticDefRegistryImpl<T extends Definition> extends DefRegistryImpl<T> {

    private static final long serialVersionUID = 1L;
    protected final Map<DefDescriptor<T>, T> defs;
    private static final String WILD = "*";
    protected final Map<DefDescriptor<T>, Source<T>> sources;

    public StaticDefRegistryImpl(Set<DefType> defTypes, Set<String> prefixes, Set<String> namespaces, Collection<T> defs) {
        this(defTypes, prefixes, namespaces, Maps.<DefDescriptor<T>, T> newHashMapWithExpectedSize(defs.size()), null);
        for (T def : defs) {
            @SuppressWarnings("unchecked")
            DefDescriptor<T> desc = (DefDescriptor<T>) def.getDescriptor();
            this.defs.put(desc, def);
        }
    }

    public StaticDefRegistryImpl(Set<DefType> defTypes, Set<String> prefixes, Set<String> namespaces,
            Map<DefDescriptor<T>, T> defs, Map<DefDescriptor<T>, Source<T>> sources) {
        super(defTypes, prefixes, namespaces);
        this.defs = defs;
        this.sources = sources;
    }

    @Override
    public T getDef(DefDescriptor<T> descriptor) {
        return defs.get(descriptor);
    }

    @Override
    public boolean hasFind() {
        return true;
    }

    @Override
    public Set<DefDescriptor<T>> find(DefDescriptor<T> matcher) {
        String namespace = matcher.getNamespace();
        String prefix = matcher.getPrefix();
        DefType defType = matcher.getDefType();
        Set<DefDescriptor<T>> ret = new HashSet<DefDescriptor<T>>();
        for (DefDescriptor<T> key : defs.keySet()) {

            if (defType == key.getDefType() && key.getPrefix().equalsIgnoreCase(prefix)
                    && (namespace.equalsIgnoreCase(WILD) || namespace.equalsIgnoreCase(key.getNamespace()))) {

                ret.add(key);
            }
        }
        return ret;
    }

    @Override
    public Set<DefDescriptor<?>> find(DescriptorFilter matcher) {
        Set<DefDescriptor<?>> ret = new HashSet<DefDescriptor<?>>();

        for (DefDescriptor<T> key : defs.keySet()) {
            if (matcher.matchDescriptor(key)) {
                ret.add(key);
            }
        }
        return ret;
    }

    @Override
    public void save(T def) {
        throw new UnsupportedOperationException();
    }

    @Override
    public boolean exists(DefDescriptor<T> descriptor) {
        return defs.containsKey(descriptor);
    }

    @Override
    public Source<T> getSource(DefDescriptor<T> descriptor) {
        if (sources != null) {
            return sources.get(descriptor);
        }
        return null;
    }

    @Override
    public boolean isCacheable() {
        return false;
    }
}
