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

import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;

import javax.annotation.Nonnull;

import org.auraframework.def.DefDescriptor;
import org.auraframework.def.Definition;
import org.auraframework.def.DescriptorFilter;
import org.auraframework.system.AuraLocalStore;
import org.auraframework.system.DependencyEntry;
import org.auraframework.throwable.AuraRuntimeException;

import com.google.common.base.Optional;

public class AuraLocalStoreImpl implements AuraLocalStore {
    private static class LocalInfo {
        public final Map<DefDescriptor<? extends Definition>, Definition> defs;
        public final Set<DefDescriptor<? extends Definition>> nulledDefs;
        public final Set<DefDescriptor<? extends Definition>> dynamicDescs;
        public final Set<DefDescriptor<? extends Definition>> defNotCacheable;
        public final Map<String, DependencyEntry> dependencies;

        public LocalInfo() {
            this.defs = new HashMap<>();
            this.nulledDefs = new HashSet<>();
            this.dynamicDescs = new HashSet<>();
            this.dependencies = new HashMap<>();
            this.defNotCacheable = new HashSet<>();
        }
    };

    private boolean systemMode;
    private final LocalInfo userStore;
    private LocalInfo systemStore;
    private LocalInfo currentStore;

    public AuraLocalStoreImpl() {
        this.userStore = new LocalInfo();
        this.systemStore = null;
        this.systemMode = false;
        this.currentStore = this.userStore;
    }

    @Override
    public void setSystemMode(boolean value) {
        this.systemMode = value;
        if (value) {
            if (this.systemStore == null) {
                this.systemStore = new LocalInfo();
            }
            this.currentStore = this.systemStore;
        } else {
            this.currentStore = this.userStore;
        }
    }

    @Override
    public void setDefNotCacheable(DefDescriptor<?> descriptor) {
        currentStore.defNotCacheable.add(descriptor);
    }

    @Override
    public boolean isDefNotCacheable(DefDescriptor<?> descriptor) {
        return currentStore.defNotCacheable.contains(descriptor)
            || (systemMode && userStore.defNotCacheable.contains(descriptor));
    }

    @Override
    public void addDefinition(DefDescriptor<?> descriptor, Definition def) {
        if (def == null) {
            currentStore.nulledDefs.add(descriptor);
        } else {
            //
            // DANGER!!!DANGER!!!DANGER!!!
            //
            // There are evil dragons here. This putIfAbsent is crucial because the
            // TestContext inserts defs and expects them to magically stay around.
            // This code must change soon, as it violates every rule in the book,
            // and a few that are not even there...
            //
            currentStore.defs.putIfAbsent(descriptor, def);
            //
            // DANGER!!!DANGER!!!DANGER!!!
            //
        }
    }


    @Override
    public <D extends Definition> Optional<D> getDefinition(DefDescriptor<D> descriptor) {
        @SuppressWarnings("unchecked")
        D def = (D) currentStore.defs.get(descriptor);
        if (def != null || currentStore.nulledDefs.contains(descriptor)) {
            return Optional.fromNullable(def);
        }
        if (systemMode) {
            @SuppressWarnings("unchecked")
            D udef = (D) userStore.defs.get(descriptor);
            if (udef != null || userStore.nulledDefs.contains(descriptor)) {
                return Optional.fromNullable(udef);
            }
        }
        return null;
    }

    @Override
    public void addDependencyEntry(String key, DependencyEntry de) {
        if (de.uid != null) {
            currentStore.dependencies.put(de.uid, de);
        }
        currentStore.dependencies.put(key, de);
    }

    @Override
    public DependencyEntry getDependencyEntry(String key) {
        DependencyEntry entry;

        entry = currentStore.dependencies.get(key);
        if (entry == null && systemMode) {
            entry = userStore.dependencies.get(key);
        }
        return entry;
    }

    @Override
    public DependencyEntry findDependencyEntry(DefDescriptor<?> descriptor) {
        for (DependencyEntry det : currentStore.dependencies.values()) {
            if (det.dependencyMap != null && det.dependencyMap.containsKey(descriptor)) {
                return det;
            }
        }
        if (systemMode) {
            for (DependencyEntry det : userStore.dependencies.values()) {
                if (det.dependencyMap != null && det.dependencyMap.containsKey(descriptor)) {
                    return det;
                }
            }
        }
        return null;
    }

    @Override
    public <D extends Definition> void addDynamicDefinition(@Nonnull D def) {
        DefDescriptor<? extends Definition> desc = def.getDescriptor();

        if (desc == null) {
            throw new AuraRuntimeException("Invalid def has no descriptor");
        }
        currentStore.defs.put(desc, def);
        currentStore.defNotCacheable.add(desc);
        currentStore.dynamicDescs.add(desc);
    }

    @Override
    public void addDynamicMatches(Set<DefDescriptor<?>> matched, DescriptorFilter matcher) {
        currentStore.dynamicDescs.stream()
            .filter(desc -> matcher.matchDescriptor(desc))
            .forEach(desc -> matched.add(desc));
        if (systemMode) {
            userStore.dynamicDescs.stream()
                .filter(desc -> matcher.matchDescriptor(desc))
                .forEach(desc -> matched.add(desc));
        }
    }

    @Override
    public Map<DefDescriptor<? extends Definition>, Definition> getDefinitions() {
        return Collections.unmodifiableMap(userStore.defs);
    }
}
