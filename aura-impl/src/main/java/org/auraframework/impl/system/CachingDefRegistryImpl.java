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

import java.util.Set;

import org.auraframework.def.DefDescriptor;
import org.auraframework.def.DefDescriptor.DefType;
import org.auraframework.def.Definition;
import org.auraframework.system.CacheableDefFactory;

/**
 * base class for registries, adds some important methods that aren't exposed through the top level interface
 */
public class CachingDefRegistryImpl<T extends Definition> extends NonCachingDefRegistryImpl<T> {

    private static final long serialVersionUID = -1052118918311747954L;

    private final CacheableDefFactory<T> cacheableFactory;

    public CachingDefRegistryImpl(CacheableDefFactory<T> factory, Set<DefType> defTypes, Set<String> prefixes) {
        super(factory, defTypes, prefixes);
        this.cacheableFactory = factory;
    }

    protected long getLastMod(DefDescriptor<T> descriptor) {
        return cacheableFactory.getLastMod(descriptor);
    }

    @Override
    public boolean isCacheable() {
        return true;
    }
}
