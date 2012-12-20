/*
 * Copyright (C) 2012 salesforce.com, inc.
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
import org.auraframework.def.Definition;
import org.auraframework.def.DescriptorMatcher;
import org.auraframework.system.DefFactory;
import org.auraframework.system.Source;

import com.google.common.collect.Sets;

/**
 */
public abstract class DefFactoryImpl<D extends Definition>  implements DefFactory<D>{

    private static final Set<String> defaultNamespaces = Sets.newHashSet("*");

    @Override
    public boolean exists(DefDescriptor<D> descriptor) {
        throw new UnsupportedOperationException();
    }

    @Override
    public boolean hasFind() {
        return false;
    }

    @Override
    public Set<DefDescriptor<D>> find(DefDescriptor<D> matcher) {
        throw new UnsupportedOperationException();
    }

    @Override
    public Set<DefDescriptor<?>> find(DescriptorMatcher matcher) {
        throw new UnsupportedOperationException();
    }

    @Override
    public void save(D def) {
        throw new UnsupportedOperationException();
    }

    @Override
    public void synchronize(D def) {
    }

    @Override
    public Source<D> getSource(DefDescriptor<D> descriptor) {
        throw new UnsupportedOperationException();
    }

    @Override
    public Set<String> getNamespaces() {
        return defaultNamespaces;
    }
}
