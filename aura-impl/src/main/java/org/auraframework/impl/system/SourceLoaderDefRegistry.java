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
import org.auraframework.system.Source;
import org.auraframework.system.SourceLoader;
import org.auraframework.throwable.quickfix.QuickFixException;

/**
 * base class for registries, adds some important methods that aren't exposed through the top level interface
 */
public class SourceLoaderDefRegistry extends DefRegistryImpl {
    private static final long serialVersionUID = -1052118918311747954L;

    private final SourceLoader sourceLoader;

    private final CompilerService compilerService;

    private final boolean hasFind;

    public SourceLoaderDefRegistry(CompilerService compilerService, SourceLoader sourceLoader,
            Set<DefType> defTypes, Set<String> prefixes, Set<String> namespaces, boolean hasFind) {
        super(defTypes, prefixes, namespaces);
        this.sourceLoader = sourceLoader;
        this.hasFind = hasFind;
        this.compilerService = compilerService;
    }

    protected long getLastMod(DefDescriptor<?> descriptor) {
        return 0;
    }

    @Override
    public boolean isCacheable() {
        return true;
    }

    @Override
    public <T extends Definition> T getDef(DefDescriptor<T> descriptor) throws QuickFixException {
        return compilerService.compile(sourceLoader, descriptor);
    }

    @Override
    public boolean hasFind() {
        return hasFind;
    }

    @Override
    public Set<DefDescriptor<?>> find(DescriptorFilter matcher) {
        return sourceLoader.find(matcher);
    }

    @Override
    public <T extends Definition> boolean exists(DefDescriptor<T> descriptor) {
        return sourceLoader.getSource(descriptor).exists();
    }

    @Override
    public <T extends Definition> Source<T> getSource(DefDescriptor<T> descriptor) {
        return sourceLoader.getSource(descriptor);
    }

    @Override
    public void reset() {
    }
}
