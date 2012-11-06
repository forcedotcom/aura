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

import java.io.Serializable;
import java.util.Set;

import org.auraframework.def.DefDescriptor;
import org.auraframework.def.DefDescriptor.DefType;
import org.auraframework.def.Definition;
import org.auraframework.system.DefRegistry;

import com.google.common.collect.Sets;

public abstract class DefRegistryImpl<T extends Definition> implements DefRegistry<T>, Serializable {
    private static final long serialVersionUID = 1011408241457411660L;
    private final Set<DefType> defTypes;
    private final Set<String> prefixes;
    private final Set<String> namespaces;

    public DefRegistryImpl(Set<DefType> defTypes, Set<String> prefixes, Set<String> namespaces) {
        this.defTypes = defTypes;
        this.prefixes = prefixes;
        if(namespaces == null){
            this.namespaces = Sets.newHashSet("*");
        }else{
            this.namespaces = namespaces;
        }
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
    public void markValid(DefDescriptor<T> descriptor, T def) {
        def.markValid();
    }

    @Override
    public void clear() {
        // nothing to do
    }
}
