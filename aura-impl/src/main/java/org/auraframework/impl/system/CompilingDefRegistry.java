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

import java.util.Map;
import java.util.Set;

import org.auraframework.def.DefDescriptor;
import org.auraframework.def.DefDescriptor.DefType;
import org.auraframework.def.Definition;
import org.auraframework.def.DescriptorFilter;
import org.auraframework.service.CompilerService;
import org.auraframework.system.DefRegistry;
import org.auraframework.system.Source;
import org.auraframework.system.SourceLoader;
import org.auraframework.throwable.quickfix.QuickFixException;

import com.google.common.collect.Maps;
import com.google.common.collect.Sets;

public class CompilingDefRegistry implements DefRegistry {
    private static final long serialVersionUID = -4852130888436267039L;

    private final SourceLoader sourceLoader;
    private final Set<DefType> defTypes;
    private final Set<String> prefixes;
    private final Set<String> namespaces;
    private final Map<DefDescriptor<?>, DefHolder> registry;
    private final CompilerService compilerService;
    private String name;

    private static class DefHolder {
        public DefHolder(DefDescriptor<?> descriptor) {
            this.descriptor = descriptor;
        }
        public final DefDescriptor<?> descriptor;
        public Definition def;
        public QuickFixException qfe;
        public boolean initialized;
    }

    public CompilingDefRegistry(SourceLoader sourceLoader, Set<String> prefixes, Set<DefType> defTypes,
                                CompilerService compilerService) {
        this.sourceLoader = sourceLoader;
        this.namespaces = Sets.newHashSet();
        this.registry = Maps.newHashMap();
        this.prefixes = Sets.newHashSet();
        for (String prefix : prefixes) {
            this.prefixes.add(prefix.toLowerCase());
        }
        this.defTypes = defTypes;
        this.compilerService = compilerService;
        reset();
    }

    @Override
    public void reset() {
        namespaces.clear();
        registry.clear();
        sourceLoader.reset();

        namespaces.addAll(sourceLoader.getNamespaces());
        Set<DefDescriptor<?>> descriptors = sourceLoader.find(new DescriptorFilter("*://*:*"));
        //
        // Initialize our map to hold all defs.
        //
        for (DefDescriptor<?> descriptor : descriptors) {
            registry.put(descriptor, new DefHolder(descriptor));
        }
        this.name = getClass().getSimpleName()+defTypes+prefixes+namespaces;
    }


    @Override
    public <T extends Definition> T getDef(DefDescriptor<T> descriptor) throws QuickFixException {
        DefHolder holder = registry.get(descriptor);

        if (holder == null) {
            return null;
        }
        synchronized (holder) { 
            if (!holder.initialized) {
                try {
                    @SuppressWarnings("unchecked")
                    DefDescriptor<Definition> canonical = (DefDescriptor<Definition>)holder.descriptor;
                    holder.def = compilerService.compile(sourceLoader, canonical);
                } catch (QuickFixException qfe) {
                    holder.qfe = qfe;
                }
                holder.initialized = true;
            }
        }
        if (holder.qfe != null) {
            throw holder.qfe;
        }
        @SuppressWarnings("unchecked")
        T def = (T)holder.def;
        return def;
    }

    @Override
    public boolean hasFind() {
        return true;
    }

    @Override
    public Set<DefDescriptor<?>> find(DescriptorFilter matcher) {
        Set<DefDescriptor<?>> ret = Sets.newHashSet();

        for (DefDescriptor<?> key : registry.keySet()) {
            if (matcher.matchDescriptor(key)) {
                ret.add(key);
            }
        }
        return ret;
    }

    @Override
    public <T extends Definition> boolean exists(DefDescriptor<T> descriptor) {
        return registry.containsKey(descriptor);
    }

    @Override
    public Set<DefType> getDefTypes() {
        return defTypes;
    }

    @Override
    public Set<String> getPrefixes() {
        return prefixes;
    }

    @Override
    public Set<String> getNamespaces() {
        return namespaces;
    }

    @Override
    public <T extends Definition> Source<T> getSource(DefDescriptor<T> descriptor) {
        return sourceLoader.getSource(descriptor);
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
    public String toString() {
        return name;
    }
}
