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

import com.google.common.collect.ImmutableMap;
import com.google.common.collect.ImmutableSet;
import com.google.common.collect.Maps;
import com.google.common.collect.Sets;
import org.auraframework.Aura;
import org.auraframework.adapter.ConfigAdapter;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.module.ModuleDef;
import org.auraframework.impl.system.DefDescriptorImpl;
import org.auraframework.service.ContextService;
import org.auraframework.modules.ModulesCompilerData;
import org.auraframework.service.DefinitionService;
import org.auraframework.system.AuraContext;
import org.junit.Assert;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.lwc.decorator.DecoratorParameterValue;
import org.lwc.decorator.DecoratorParameterValueType;
import org.powermock.core.classloader.annotations.PrepareForTest;
import org.powermock.modules.junit4.PowerMockRunner;

import java.io.ByteArrayOutputStream;
import java.io.NotSerializableException;
import java.io.ObjectOutputStream;
import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;
import static org.powermock.api.mockito.PowerMockito.mock;
import static org.powermock.api.mockito.PowerMockito.mockStatic;
import static org.powermock.api.mockito.PowerMockito.when;

/**
 * Unit tests for {@link ModuleDefImpl}
 */
@RunWith(PowerMockRunner.class)
@PrepareForTest(Aura.class)
public class ModuleDefImplUnitTest {

    private DefinitionService mockDefinitionService;
    private ContextService mockContextService;
    private AuraContext mockContext;
    private ConfigAdapter mockConfigAdapter;

    @Before
    public void setUp() throws Exception {
        mockStatic(Aura.class);

        mockDefinitionService = mock(DefinitionService.class);
        mockContextService = mock(ContextService.class);
        mockContext = mock(AuraContext.class);
        mockConfigAdapter = mock(ConfigAdapter.class);

        when(Aura.getDefinitionService()).thenReturn(mockDefinitionService);
        when(Aura.getContextService()).thenReturn(mockContextService);
        when(Aura.getConfigAdapter()).thenReturn(mockConfigAdapter);
        when(mockContextService.getCurrentContext()).thenReturn(mockContext);
    }

    @Test
    public void moduleDependenciesWithAuraDependencies() throws Exception {

        DefDescriptor<ModuleDef> moduleDefDescriptor = new DefDescriptorImpl<>(DefDescriptor.MARKUP_PREFIX, "namespace", "componentName", ModuleDef.class);

        when(mockConfigAdapter.getInternalNamespacesMap()).thenReturn(Maps.newHashMap());
        when(mockConfigAdapter.getModuleNamespaceAliases()).thenReturn(Maps.newHashMap());
        when(mockDefinitionService.getDefDescriptor("namespace:componentName", ModuleDef.class)).thenReturn(moduleDefDescriptor);

        ModuleDefImpl.Builder moduleDefBuilder = new ModuleDefImpl.Builder();
        Set<String> dependencies = Sets.newHashSet();
        dependencies.add("aura-instrumentation");
        dependencies.add("aura-storage");
        dependencies.add("proxy-compat/getKey");
        dependencies.add("proxy-compat/setKey");
        dependencies.add("@salesforce/resource-url/my_image");
        dependencies.add("namespace/componentName");
        moduleDefBuilder.setModuleDependencies(dependencies);

        ModuleDef moduleDef = moduleDefBuilder.build();
        Set<DefDescriptor<?>> results = moduleDef.getDependencySet();

        assertEquals("should not be more than 1 module dependency", 1, results.size());
        assertTrue("module dependency not found", results.contains(moduleDefDescriptor));
    }

    @Test
    public void moduleDefWireDecoratorMetadataIsSerializable() throws Exception {
        ModuleDefImpl.Builder moduleDefBuilder = new ModuleDefImpl.Builder();
        moduleDefBuilder.setWireDecorations(ImmutableSet.of(
            new ModulesCompilerData.WireDecoration("property", "userRecord",
                new ModulesCompilerData.WireAdapter("getRecord", "record-service"),
                ImmutableMap.of("Id", "$userId"),
                ImmutableMap.of("FirstName",
                    new DecoratorParameterValue(DecoratorParameterValueType.STRING, "John")))));

        ModuleDef moduleDef = moduleDefBuilder.build();

        try {
            ByteArrayOutputStream byteArrayOutputStream = new ByteArrayOutputStream();
            ObjectOutputStream objectOutputStream = new ObjectOutputStream(byteArrayOutputStream);
            objectOutputStream.writeObject(moduleDef);
        } catch (NotSerializableException e) {
            Assert.fail("ModuleDef should be serializable");
        }
    }

    @Test
    public void errorWhenUsingInvalidReferenceWithDot() throws Exception {
        ModuleDefImpl.Builder moduleDefBuilder = new ModuleDefImpl.Builder();
        Set<String> bundleDependencies = new HashSet(Arrays.asList("namespace/component", "@salesforce/apex/Controller.method", "bar/foo.js"));
        moduleDefBuilder.setModuleDependencies(bundleDependencies);
        moduleDefBuilder.setDescriptor(new DefDescriptorImpl<ModuleDef>(DefDescriptor.MARKUP_PREFIX, "namespace", "yo", ModuleDef.class));

        ModuleDef moduleDef = moduleDefBuilder.build();

        try {
            moduleDef.validateDefinition();
            Assert.fail("Should have failed with invalid dot dependency reference");
        } catch(Exception e) {
            assertTrue("Should contain correct error message with bar/foo.js", e.getMessage().startsWith("Invalid import 'bar/foo.js'"));
        }
    }
}