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

import java.util.Map;

import org.auraframework.def.DefDescriptor;
import org.auraframework.def.DefDescriptor.DefType;
import org.auraframework.def.Definition;
import org.auraframework.def.ProviderDef;
import org.auraframework.impl.AuraImplTestCase;
import org.auraframework.system.DefinitionFactory;
import org.auraframework.system.Source;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.junit.Test;
import org.mockito.Mockito;

import com.google.common.collect.Lists;
import com.google.common.collect.Maps;

/**
 * Tests for CompilerServiceImpl.
 */
public class CompilerServiceImplTest extends AuraImplTestCase {
    private class DefinitionFactoryImpl<S extends Source<D>, D extends Definition> implements DefinitionFactory<S, D> {

        Class<?> ifc;
        Class<D> type;
        String mimeType;

        public DefinitionFactoryImpl(Class<?> ifc, Class<D> type, String mimeType) {
            this.type = type;
            this.ifc = ifc;
            this.mimeType = mimeType;
        }

        @Override
        public Class<?> getSourceInterface() {
            return ifc;
        }

        @Override
        public Class<D> getDefinitionClass() {
            return type;
        }

        @Override
        public String getMimeType() {
            return mimeType;
        }

        Map<S,D> defs = Maps.newHashMap();

        public void putDefinition(S source, D def) {
            defs.put(source, def);
        }

        @Override
        public D getDefinition(DefDescriptor<D> descriptor, S source) throws QuickFixException {
            return defs.get(source);
        }
    }

    @Test
    public void testExactFactoryMatch() throws Exception {
        CompilerServiceImpl service = new CompilerServiceImpl();
        DefinitionFactoryImpl<Source<ProviderDef>, ProviderDef> factory = new DefinitionFactoryImpl<>(Source.class, ProviderDef.class, "mimetype");
        @SuppressWarnings("unchecked")
        Source<ProviderDef> source = Mockito.mock(Source.class);
        @SuppressWarnings("unchecked")
        DefDescriptor<ProviderDef> descriptor = Mockito.mock(DefDescriptor.class);
        ProviderDef def = Mockito.mock(ProviderDef.class);

        Mockito.when(source.getDescriptor()).thenReturn(descriptor);
        Mockito.when(source.getMimeType()).thenReturn("mimetype");
        Mockito.when(descriptor.getDefType()).thenReturn(DefType.PROVIDER);
        factory.putDefinition(source, def);
        service.setFactories(Lists.newArrayList(factory));

        assertEquals("should compile a source with no factory", def, service.compile(descriptor, source));
    }

    @Test
    public void testSourceNoFactoryMatch() throws Exception {
        CompilerServiceImpl service = new CompilerServiceImpl();
        @SuppressWarnings("unchecked")
        Source<ProviderDef> source = Mockito.mock(Source.class);
        @SuppressWarnings("unchecked")
        DefDescriptor<ProviderDef> descriptor = Mockito.mock(DefDescriptor.class);

        Mockito.when(source.getDescriptor()).thenReturn(descriptor);
        Mockito.when(source.getMimeType()).thenReturn("mimetype");
        Mockito.when(descriptor.getDefType()).thenReturn(DefType.PROVIDER);
        service.setFactories(Lists.newArrayList());

        assertNull("should not compile a source with no factory", service.compile(descriptor, source));
    }

    @Test
    public void testSourceLoaderNoFactoryMatch() throws Exception {
        CompilerServiceImpl service = new CompilerServiceImpl();
        service.setFactories(Lists.newArrayList());
        //assertNull("should not compile a descriptor with no factory", service.compile(xxx, yyy));
    }
}
