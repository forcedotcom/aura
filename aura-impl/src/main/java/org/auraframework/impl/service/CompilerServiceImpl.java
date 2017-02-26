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
package org.auraframework.impl.service;

import java.util.List;
import java.util.Map;

import javax.inject.Inject;

import org.auraframework.annotations.Annotations.ServiceComponent;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.Definition;
import org.auraframework.service.CompilerService;
import org.auraframework.system.DefinitionFactory;
import org.auraframework.system.Source;
import org.auraframework.system.SourceLoader;
import org.auraframework.throwable.quickfix.QuickFixException;

import com.google.common.collect.Maps;

/**
 * Compiler for source to definition.
 *
 * This class provides the service of compiling a source to definition. This service converts
 * a source to a definition.
 */
@ServiceComponent
public class CompilerServiceImpl implements CompilerService {
    @Inject
    private List<DefinitionFactory<?, ?>> factories;

    private final Map<String, DefinitionFactory<?,?>> factoryMap = Maps.newHashMap();

    private <S extends Source<D>, D extends Definition> DefinitionFactory<S,D> findFactory(S source, Class<D> type) {
        DefinitionFactory<S,D> found = null;
        Class<?> sourceClass = source.getClass();

        for (DefinitionFactory<?,?> factory : factories) {
            if (source.getMimeType().equals(factory.getMimeType())
                    && type.isAssignableFrom(factory.getDefinitionClass())
                    && (found == null || found.getDefinitionClass().isAssignableFrom(factory.getDefinitionClass()))
                    && factory.getSourceInterface().isAssignableFrom(sourceClass)
                    && (found == null
                        || found.getSourceInterface().isAssignableFrom(factory.getSourceInterface()))) {
                @SuppressWarnings("unchecked")
                DefinitionFactory<S,D> t = (DefinitionFactory<S,D>)factory;

                found = t;
            }
        }
        return found;
    }

    private <S extends Source<D>, D extends Definition> D getDefinitionTypeSafe(DefDescriptor<D> descriptor,
            S source, Class<D> type) throws QuickFixException {
        if (source == null) {
            return null;
        }
        String key = source.getClass().getName()+":"+type.getName()+":"+source.getMimeType();
        @SuppressWarnings("unchecked")
        DefinitionFactory<S,D> factory = (DefinitionFactory<S,D>)factoryMap.get(key);
        if (factory == null) {
            factory = findFactory(source, type);
            factoryMap.put(key, factory);
        }
        if (factory == null) {
            return null;
        }
        D def = factory.getDefinition(descriptor, source);
        if (def != null) {
            def.validateDefinition();
        }
        return def;
    }

    @Override
    public <D extends Definition> D compile(DefDescriptor<D> descriptor, Source<D> source) throws QuickFixException {
        @SuppressWarnings("unchecked")
        Class<D> clazz = (Class<D>)descriptor.getDefType().getPrimaryInterface();
        return getDefinitionTypeSafe(descriptor, source, clazz);
    }

    @Override
    public <D extends Definition> D compile(SourceLoader sourceLoader, DefDescriptor<D> descriptor)
            throws QuickFixException {
        @SuppressWarnings("unchecked")
        Class<D> clazz = (Class<D>)descriptor.getDefType().getPrimaryInterface();
        Source<D> source = sourceLoader.getSource(descriptor);
        if (source == null) {
            return null;
        }
        return getDefinitionTypeSafe(descriptor, source, clazz);
    }

    /**
     * @return the factories
     */
    public List<DefinitionFactory<?, ?>> getFactories() {
        return factories;
    }

    /**
     * @param factories the factories to set
     */
    public void setFactories(List<DefinitionFactory<?, ?>> factories) {
        this.factories = factories;
    }
}
