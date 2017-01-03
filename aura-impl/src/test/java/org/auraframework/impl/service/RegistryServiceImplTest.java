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

import org.auraframework.adapter.RegistryAdapter;
import org.auraframework.def.DefDescriptor.DefType;
import org.auraframework.impl.AuraImplTestCase;
import org.auraframework.impl.RegistryServiceImpl;
import org.auraframework.system.DefRegistry;
import org.auraframework.system.RegistrySet;
import org.junit.Test;
import org.mockito.Mockito;

import com.google.common.collect.Lists;
import com.google.common.collect.Sets;

public class RegistryServiceImplTest extends AuraImplTestCase {
    @Test
    public void testSingleRegistry() throws Exception {
        RegistryServiceImpl rs = new RegistryServiceImpl();
        DefRegistry reg = Mockito.mock(DefRegistry.class);
        Mockito.when(reg.getNamespaces()).thenReturn(Sets.newHashSet("*"));
        Mockito.when(reg.getPrefixes()).thenReturn(Sets.newHashSet("test"));
        Mockito.when(reg.getDefTypes()).thenReturn(Sets.newHashSet(DefType.COMPONENT));

        RegistrySet result = rs.getRegistrySet(reg);

        assertEquals(1, result.getAllRegistries().size());
        assertEquals(reg, result.getAllRegistries().iterator().next());
    }

    @Test
    public void testDoubleRegistry() throws Exception {
        RegistryServiceImpl rs = new RegistryServiceImpl();
        DefRegistry reg1 = Mockito.mock(DefRegistry.class);
        DefRegistry reg2 = Mockito.mock(DefRegistry.class);
        Mockito.when(reg1.getNamespaces()).thenReturn(Sets.newHashSet("*"));
        Mockito.when(reg1.getPrefixes()).thenReturn(Sets.newHashSet("test"));
        Mockito.when(reg1.getDefTypes()).thenReturn(Sets.newHashSet(DefType.COMPONENT));

        Mockito.when(reg2.getNamespaces()).thenReturn(Sets.newHashSet("*"));
        Mockito.when(reg2.getPrefixes()).thenReturn(Sets.newHashSet("test2"));
        Mockito.when(reg2.getDefTypes()).thenReturn(Sets.newHashSet(DefType.COMPONENT));

        RegistrySet result = rs.getRegistrySet(Lists.newArrayList(reg1, reg2));

        assertEquals(2, result.getAllRegistries().size());
        assertTrue(result.getAllRegistries().contains(reg1));
        assertTrue(result.getAllRegistries().contains(reg2));
    }

    @Test
    public void testDefaultWithProviders() {
        RegistryServiceImpl rs = new RegistryServiceImpl();
        DefRegistry reg = Mockito.mock(DefRegistry.class);
        RegistryAdapter mockAdapter = Mockito.mock(RegistryAdapter.class);
        Mockito.when(reg.getNamespaces()).thenReturn(Sets.newHashSet("*"));
        Mockito.when(reg.getPrefixes()).thenReturn(Sets.newHashSet("test"));
        Mockito.when(reg.getDefTypes()).thenReturn(Sets.newHashSet(DefType.COMPONENT));
        Mockito.when(mockAdapter.getRegistries(null, null, null)).thenReturn(new DefRegistry[] { reg });
        List<RegistryAdapter> adapters = Lists.newArrayList(mockAdapter);
        rs.setAdapters(adapters);
        rs.setLocationAdapters(Lists.newArrayList());

        RegistrySet result = rs.getDefaultRegistrySet(null, null);

        assertTrue(result.getAllRegistries().contains(reg));
    }
    // I'd test with CLAs, but that is very painful. Maybe we need to clean that code up and make it testable.
}
