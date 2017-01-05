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

import java.util.EnumSet;
import java.util.Set;

import org.auraframework.adapter.RegistryAdapter;
import org.auraframework.def.DefDescriptor.DefType;
import org.auraframework.def.Definition;
import org.auraframework.impl.system.CachingDefRegistryImpl;
import org.auraframework.impl.system.NonCachingDefRegistryImpl;
import org.auraframework.system.AuraContext.Authentication;
import org.auraframework.system.AuraContext.Mode;
import org.auraframework.system.CacheableDefFactory;
import org.auraframework.system.DefFactory;
import org.auraframework.system.DefRegistry;
import org.auraframework.system.SourceLoader;

import com.google.common.collect.Sets;

public abstract class AbstractRegistryAdapterImpl implements RegistryAdapter {

    @Override
    public abstract DefRegistry[] getRegistries(Mode mode, Authentication access, Set<SourceLoader> extraLoaders);

    protected static <T extends Definition> DefRegistry createDefRegistry(DefFactory<T> factory, DefType defType,
            String prefix) {
        return createDefRegistry(factory, EnumSet.of(defType), Sets.newHashSet(prefix));
    }

    protected static <T extends Definition> DefRegistry createDefRegistry(DefFactory<T> factory,
            Set<DefType> defTypes, Set<String> prefixes) {
        if (factory instanceof CacheableDefFactory) {
            return new CachingDefRegistryImpl((CacheableDefFactory<T>) factory, defTypes, prefixes);
        } else {
            return new NonCachingDefRegistryImpl(factory, defTypes, prefixes);
        }
    }
}
