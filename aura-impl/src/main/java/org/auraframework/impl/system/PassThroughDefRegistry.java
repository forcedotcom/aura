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
import org.auraframework.impl.parser.ParserFactory;
import org.auraframework.system.DefRegistry;
import org.auraframework.system.Parser;
import org.auraframework.system.Source;
import org.auraframework.system.SourceLoader;
import org.auraframework.throwable.quickfix.QuickFixException;

import com.google.common.collect.Sets;

public class PassThroughDefRegistry implements DefRegistry<Definition> {
    private static final long serialVersionUID = 1741611975153818048L;

    private final SourceLoader sourceLoader;
    private final Set<DefType> defTypes;
    private final Set<String> prefixes;
    private final boolean cacheable;

    public PassThroughDefRegistry(SourceLoader sourceLoader, Set<DefType> defTypes, Set<String> prefixes,
            boolean cacheable) {
        this.sourceLoader = sourceLoader;
        this.prefixes = Sets.newHashSet();
        for (String prefix : prefixes) {
            this.prefixes.add(prefix.toLowerCase());
        }
        this.defTypes = defTypes;
        this.cacheable = cacheable;
    }

    @Override
    public Definition getDef(DefDescriptor<Definition> descriptor) throws QuickFixException {
        Source<Definition> source = sourceLoader.getSource(descriptor);
        if (source != null && source.exists()) {
            descriptor = source.getDescriptor();
            Parser<Definition> parser = ParserFactory.getParser(source.getFormat(), descriptor);
            return parser.parse(descriptor, source);
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
    public boolean exists(DefDescriptor<Definition> descriptor) {
        Source<Definition> source = sourceLoader.getSource(descriptor);
        return source != null && source.exists();
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
    public Source<Definition> getSource(DefDescriptor<Definition> descriptor) {
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
