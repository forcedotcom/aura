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
package org.auraframework.impl.root;

import java.util.Set;

import org.auraframework.Aura;
import org.auraframework.def.ComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.DefDescriptor.DefType;
import org.auraframework.def.DescriptorFilter;
import org.auraframework.def.RootDefinition;
import org.auraframework.impl.parser.ParserFactory;
import org.auraframework.impl.source.SourceFactory;
import org.auraframework.impl.system.DefDescriptorImpl;
import org.auraframework.impl.system.DefFactoryImpl;
import org.auraframework.system.CacheableDefFactory;
import org.auraframework.system.Parser;
import org.auraframework.system.Source;
import org.auraframework.system.SourceWriter;
import org.auraframework.throwable.AuraRuntimeException;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.AuraTextUtil;

/**
 * Creates new ComponentDefs from source or cache.
 * 
 * Should not be used directly. Used by ComponentDefRegistry population of
 * registry. This is actually incorrectly typed, as it is not meant to return a
 * single type. We probably should allow a non-typed Factory, or somehow clean
 * this up.
 */
public final class RootDefFactory extends DefFactoryImpl<RootDefinition> implements CacheableDefFactory<RootDefinition> {

    private final SourceFactory sourceFactory;

    public RootDefFactory(SourceFactory sourceFactory) {
        this.sourceFactory = sourceFactory;
    }

    @SuppressWarnings("unchecked")
    @Override
    public RootDefinition getDef(DefDescriptor<RootDefinition> descriptor) throws QuickFixException {

        RootDefinition def;

        Source<?> source = sourceFactory.getSource(descriptor);
        if (source == null || !source.exists()) {
            return null;
        }

        descriptor = (DefDescriptor<RootDefinition>) source.getDescriptor();

        Parser parser = ParserFactory.getParser(source.getFormat());
        def = parser.parse(descriptor, source);
        return def;
    }

    @Override
    public long getLastMod(DefDescriptor<RootDefinition> descriptor) {
        return sourceFactory.getSource(descriptor).getLastModified();
    }

    @Override
    public boolean hasFind() {
        return true;
    }

    @Override
    public Set<DefDescriptor<RootDefinition>> find(DefDescriptor<RootDefinition> matcher) {
        if (AuraTextUtil.isNullEmptyOrWhitespace(matcher.getNamespace())) {
            throw new AuraRuntimeException(String.format("Empty or malformed namespace in: %s",
                    matcher.getQualifiedName()));
        }
        return sourceFactory.find(matcher);
    }

    @Override
    public Set<DefDescriptor<?>> find(DescriptorFilter matcher) {
        return sourceFactory.find(matcher);
    }

    @Override
    public Set<String> getNamespaces() {
        return sourceFactory.getNamespaces();
    }

    @Override
    public void save(RootDefinition def) {
        Source<?> source = sourceFactory.getSource(def.getDescriptor());
        if (source == null) {
            throw new AuraRuntimeException("Cannot find location to save definition.");
        }
        // Before saving a new definition, clear the old definition in the
        // source.
        source.clearContents();
        SourceWriter writer = ParserFactory.getWriter(source.getFormat());
        writer.write(def, source);
    }

    @Override
    public void synchronize(RootDefinition def) {
        DefDescriptor<?> descriptor = def.getDescriptor();
        if (descriptor.getDefType() == DefType.COMPONENT) {
            DefDescriptor<ComponentDef> javaDescriptor = DefDescriptorImpl.getAssociateDescriptor(descriptor,
                    ComponentDef.class, "java");
            Source<?> source = sourceFactory.getSource(javaDescriptor);
            if (source != null) {
                SourceWriter writer = ParserFactory.getWriter(source.getFormat());
                writer.write(def, source);
            }
        }
    }

    @Override
    public Source<RootDefinition> getSource(DefDescriptor<RootDefinition> descriptor) {
        return sourceFactory.getSource(descriptor);
    }

    @Override
    public boolean exists(DefDescriptor<RootDefinition> descriptor) {
        Aura.getLoggingService().incrementNum("RootDefFactory.exists");
        Source<?> s = getSource(descriptor);
        return s != null && s.exists();
    }
}
