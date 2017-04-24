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
package org.auraframework.impl.factory;

import java.util.Map;

import javax.inject.Inject;

import org.auraframework.def.DefDescriptor;
import org.auraframework.def.Definition;
import org.auraframework.def.RootDefinition;
import org.auraframework.impl.root.parser.handler.RootTagHandler;
import org.auraframework.service.CompilerService;
import org.auraframework.service.ContextService;
import org.auraframework.system.BundleSource;
import org.auraframework.system.DefinitionFactory;
import org.auraframework.system.Source;
import org.auraframework.system.TextSource;
import org.auraframework.throwable.quickfix.QuickFixException;

import com.google.common.collect.Maps;

public abstract class BundleBaseFactory<D extends RootDefinition> extends XMLParserBase<D> implements DefinitionFactory<BundleSource<D>,D> {

    @Inject
    private CompilerService compilerService;

    @Inject
    protected ContextService contextService;

    @Override
    public Class<?> getSourceInterface() {
        return BundleSource.class;
    }

    @Override
    public String getMimeType() {
        return "";
    }

    @SuppressWarnings("unchecked")
    private <T extends Definition> T bogusCompileCall(DefDescriptor<T> descriptor, Source<?> source)
            throws QuickFixException {
        return compilerService.compile(descriptor, (Source<T>)source);
    }

    @Override
    public D getDefinition(DefDescriptor<D> descriptor, BundleSource<D> source) throws QuickFixException {
        RootTagHandler<D> handler = getDefinitionBuilder(descriptor, source);
        if (handler == null) {
            return null;
        }
        return handler.getBuilder().build();
    }

    public Map<DefDescriptor<?>, Definition> buildDefinitionMap(DefDescriptor<D> descriptor,
            Map<DefDescriptor<?>, Source<?>> sourceMap) throws QuickFixException {
        Map<DefDescriptor<?>, Definition> defMap = Maps.newHashMap();
        for (Map.Entry<DefDescriptor<?>, Source<?>> entry : sourceMap.entrySet()) {
            if (!entry.getKey().equals(descriptor)) {
                Definition d = bogusCompileCall(entry.getKey(), entry.getValue());
                if (d != null) {
                    defMap.put(entry.getKey(), d);
                }
            }
        }
        return defMap;
    }

    public RootTagHandler<D> getDefinitionBuilder(DefDescriptor<D> descriptor, BundleSource<D> source)
            throws QuickFixException {
        Map<DefDescriptor<?>, Source<?>> sourceMap = source.getBundledParts();
        Map<DefDescriptor<?>, Definition> defMap = buildDefinitionMap(descriptor, sourceMap);
        @SuppressWarnings("unchecked")
        TextSource<D> bundleDefSource = (TextSource<D>)sourceMap.get(descriptor);
        if (bundleDefSource == null) {
            return null;
        }
        RootTagHandler<D> handler = makeHandler(descriptor, bundleDefSource);
        handler.setBundledDefs(defMap);
        return getDefinitionBuilder(descriptor, bundleDefSource, handler);
    }
}
