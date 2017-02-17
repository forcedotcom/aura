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
import org.auraframework.def.DescriptorFilter;
import org.auraframework.service.CompilerService;
import org.auraframework.system.DefRegistry;
import org.auraframework.system.Source;
import org.auraframework.system.SourceLoader;
import org.auraframework.throwable.quickfix.QuickFixException;

import com.google.common.collect.Sets;

public class PassThroughDefRegistry implements DefRegistry {
    private static final long serialVersionUID = 1741611975153818048L;

    private final SourceLoader sourceLoader;
    private final Set<DefType> defTypes;
    private final Set<String> prefixes;
    private final boolean cacheable;
    private final CompilerService compilerService;

    public PassThroughDefRegistry(SourceLoader sourceLoader, Set<DefType> defTypes, Set<String> prefixes,
            boolean cacheable, CompilerService compilerService) {
        this.sourceLoader = sourceLoader;
        this.prefixes = Sets.newHashSet();
        for (String prefix : prefixes) {
            this.prefixes.add(prefix.toLowerCase());
        }
        this.defTypes = defTypes;
        this.cacheable = cacheable;
        this.compilerService = compilerService;
    }

    @Override
    public <T extends Definition> T getDef(DefDescriptor<T> descriptor) throws QuickFixException {
        Source<T> source = sourceLoader.getSource(descriptor);
        if (source != null) {
            descriptor = source.getDescriptor();
            return compilerService.compile(descriptor, source);
        }
        return null;
    }

    @Override
    public void reset() {
    }

    @Override
    public boolean hasFind() {
        return true;
    }

    @Override
    public Set<DefDescriptor<?>> find(DescriptorFilter matcher) {
        return sourceLoader.find(matcher);
    }

    @Override
    public <T extends Definition> boolean exists(DefDescriptor<T> descriptor) {
        Source<T> source = sourceLoader.getSource(descriptor);
        return source != null;
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
        return sourceLoader.getNamespaces();
    }

    @Override
    public <T extends Definition> Source<T> getSource(DefDescriptor<T> descriptor) {
        return sourceLoader.getSource(descriptor);
    }

    @Override
    public boolean isCacheable() {
        return cacheable;
    }

    @Override
    public boolean isStatic() {
        return false;
    }
}
