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
package org.auraframework.impl.root.component;


import java.util.Collections;
import java.util.Set;

import org.auraframework.Aura;
import org.auraframework.adapter.ConfigAdapter;
import org.auraframework.def.ComponentDef;
import org.auraframework.def.ComponentDefRef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.module.ModuleDef;
import org.auraframework.def.module.ModuleDefRef;
import org.auraframework.impl.system.DefDescriptorImpl;
import org.auraframework.service.ContextService;
import org.auraframework.service.DefinitionService;
import org.auraframework.system.AuraContext;
import org.auraframework.system.Location;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.powermock.core.classloader.annotations.PrepareForTest;
import org.powermock.modules.junit4.PowerMockRunner;

import com.google.common.collect.Sets;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;
import static org.powermock.api.mockito.PowerMockito.mockStatic;
import static org.powermock.api.mockito.PowerMockito.verifyZeroInteractions;
import static org.powermock.api.mockito.PowerMockito.when;
import static org.powermock.api.mockito.PowerMockito.mock;

/**
 * Unit Tests for {@link DefRefDelegate}
 */
@RunWith(PowerMockRunner.class)
@PrepareForTest(Aura.class)
public class DefRefDelegateUnitTest {

    private ComponentDefRef mockComponentDefRef = mock(ComponentDefRef.class);
    private DefinitionService mockDefinitionService = mock(DefinitionService.class);
    private ContextService mockContextService = mock(ContextService.class);
    private AuraContext mockContext = mock(AuraContext.class);
    private ConfigAdapter mockConfigAdapter = mock(ConfigAdapter.class);
    private Set<String> moduleNamespaces = Sets.newHashSet();

    private DefDescriptor<ComponentDef> componentDefDescriptor = new DefDescriptorImpl<>("markup", "defref",
            "test", ComponentDef.class);
    private DefDescriptor<ModuleDef> moduleDefDescriptor = new DefDescriptorImpl<>("markup", "defref",
            "test", ModuleDef.class);

    @Before
    public void setUp() throws Exception {

        mockStatic(Aura.class);

        mockComponentDefRef = mock(ComponentDefRef.class);
        mockDefinitionService = mock(DefinitionService.class);
        mockContextService = mock(ContextService.class);
        mockContext = mock(AuraContext.class);

        when(Aura.getDefinitionService()).thenReturn(mockDefinitionService);
        when(Aura.getContextService()).thenReturn(mockContextService);
        when(Aura.getConfigAdapter()).thenReturn(mockConfigAdapter);
        when(mockContextService.getCurrentContext()).thenReturn(mockContext);
        when(mockConfigAdapter.getModuleNamespaces()).thenReturn(moduleNamespaces);

        when(mockComponentDefRef.getDescriptor()).thenReturn(componentDefDescriptor);

        when(mockDefinitionService.getDefDescriptor(componentDefDescriptor, DefDescriptor.MARKUP_PREFIX, ModuleDef.class))
                .thenReturn(moduleDefDescriptor);

        // set up componentDefRef mocks for building ModuleDefRef
        when(mockComponentDefRef.getAttributeValues()).thenReturn(Collections.EMPTY_MAP);
        when(mockComponentDefRef.getLocation()).thenReturn(new Location("file", 1234324));

        moduleNamespaces.clear();

    }

    @Test
    public void testSwitchableReferences() throws Exception {
        when(mockDefinitionService.exists(moduleDefDescriptor)).thenReturn(true);
        when(mockDefinitionService.exists(componentDefDescriptor)).thenReturn(true);

        moduleNamespaces.add("defref");

        DefRefDelegate defRefDelegate = new DefRefDelegate(mockComponentDefRef);

        when(mockContext.isModulesEnabled()).thenReturn(true);
        assertTrue("Should be ModuleDefRef with modules enabled",
                defRefDelegate.get() instanceof ModuleDefRef);

        when(mockContext.isModulesEnabled()).thenReturn(false);
        assertEquals("Should be ComponentDefRef with modules disabled",
                mockComponentDefRef, defRefDelegate.get());
    }

    @Test
    public void testComponentReference() throws Exception {
        when(mockDefinitionService.exists(moduleDefDescriptor)).thenReturn(false);
        when(mockDefinitionService.exists(componentDefDescriptor)).thenReturn(true);

        moduleNamespaces.add("defref");

        DefRefDelegate defRefDelegate = new DefRefDelegate(mockComponentDefRef);

        when(mockContext.isModulesEnabled()).thenReturn(true);
        assertEquals("Should be ComponentDefRef with non existent module and modules enabled",
                mockComponentDefRef, defRefDelegate.get());

        when(mockContext.isModulesEnabled()).thenReturn(false);
        assertEquals("Should be ComponentDefRef with non existent module and modules disabled",
                mockComponentDefRef, defRefDelegate.get());
    }

    @Test
    public void testModuleReference() throws Exception {
        when(mockDefinitionService.exists(moduleDefDescriptor)).thenReturn(true);
        when(mockDefinitionService.exists(componentDefDescriptor)).thenReturn(false);

        moduleNamespaces.add("defref");

        DefRefDelegate defRefDelegate = new DefRefDelegate(mockComponentDefRef);

        when(mockContext.isModulesEnabled()).thenReturn(true);
        assertTrue("Should be ModuleDefRef with non existent component and modules enabled",
                defRefDelegate.get() instanceof ModuleDefRef);

        when(mockContext.isModulesEnabled()).thenReturn(false);
        assertTrue("Should be ModuleDefRef with non existent component and modules disabled",
                defRefDelegate.get() instanceof ModuleDefRef);
    }

    @Test
    public void testModuleNamespaceNotRegistered() throws Exception {
        DefRefDelegate defRefDelegate = new DefRefDelegate(mockComponentDefRef);

        verifyZeroInteractions(mockDefinitionService);

        assertEquals("Should be ComponentDefRef if module namespace is not registered",
                mockComponentDefRef, defRefDelegate.get());
    }
}