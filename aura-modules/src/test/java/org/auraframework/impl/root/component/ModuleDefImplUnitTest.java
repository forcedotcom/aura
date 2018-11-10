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

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;
import static org.junit.Assert.fail;
import static org.mockito.Mockito.verify;
import static org.powermock.api.mockito.PowerMockito.mock;
import static org.powermock.api.mockito.PowerMockito.mockStatic;
import static org.powermock.api.mockito.PowerMockito.when;

import java.io.ByteArrayOutputStream;
import java.io.NotSerializableException;
import java.io.ObjectOutputStream;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.auraframework.Aura;
import org.auraframework.adapter.ConfigAdapter;
import org.auraframework.def.ActionDef;
import org.auraframework.def.ControllerDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.DefinitionAccess;
import org.auraframework.def.module.ModuleDef;
import org.auraframework.impl.DefinitionAccessImpl;
import org.auraframework.impl.system.DefDescriptorImpl;
import org.auraframework.modules.ModulesCompilerData;
import org.auraframework.service.ContextService;
import org.auraframework.service.DefinitionService;
import org.auraframework.system.AuraContext;
import org.auraframework.throwable.NoAccessException;
import org.auraframework.throwable.quickfix.InvalidDefinitionException;
import org.auraframework.validation.ReferenceValidationContext;
import org.junit.Assert;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.lwc.decorator.DecoratorParameterValue;
import org.lwc.decorator.DecoratorParameterValueType;
import org.lwc.reference.Reference;
import org.lwc.reference.ReferenceType;
import org.mockito.ArgumentCaptor;
import org.powermock.core.classloader.annotations.PrepareForTest;
import org.powermock.modules.junit4.PowerMockRunner;

import com.google.common.collect.ImmutableMap;
import com.google.common.collect.ImmutableSet;
import com.google.common.collect.Maps;
import com.google.common.collect.Sets;

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
    public void validateInvalidControllerReference() throws Exception {
        ModuleDefImpl.Builder moduleDefBuilder = new ModuleDefImpl.Builder();
        Reference bad = new Reference(ReferenceType.apexMethod, "someController.someMethod", "file", null, "someController.someMethod");
        List<Reference> references = new ArrayList<>();
        
        references.add(bad);
        moduleDefBuilder.setSourceReferences(references);

        try {
            moduleDefBuilder.build();
            fail("module definition should fail with invalid controller reference");
        } catch (Exception e) {
            assertEquals("Incorrect exception for invalid controller reference", InvalidDefinitionException.class, e.getClass());
            assertTrue("Incorrect error for invalid controller reference", e.getMessage().contains("Invalid controller reference:"));
        }
    }
    
    @Test
    @SuppressWarnings("unchecked")
    public void validatePublicControllerInDifferentNamespace() throws Exception {
        ModuleDefImpl.Builder moduleDefBuilder = new ModuleDefImpl.Builder();
        
        ReferenceValidationContext validationContext = mock(ReferenceValidationContext.class);
        Reference reference = new Reference(ReferenceType.apexMethod, "someController.someMethod", "file", null, "ns.someController.someMethod");
        List<Reference> references = new ArrayList<>();
        
        references.add(reference);
        
        DefDescriptor<ControllerDef> controllerDescriptor = new DefDescriptorImpl("apex", "ns", "someController", ControllerDef.class);
        
        DefinitionAccess publicAccess = new DefinitionAccessImpl(AuraContext.Access.PUBLIC);
        ControllerDef controllerDef = mock(ControllerDef.class);
        when(controllerDef.getDescriptor()).thenReturn(controllerDescriptor);
        when(controllerDef.getAccess()).thenReturn(publicAccess);
        
        when(validationContext.getAccessibleDefinition(controllerDescriptor)).thenReturn(controllerDef);

        moduleDefBuilder.setDescriptor(new DefDescriptorImpl("markup", "my", "module", ModuleDef.class));
        moduleDefBuilder.setSourceReferences(references);
        ModuleDef moduleDef = moduleDefBuilder.build();

        try {
            moduleDef.validateReferences(validationContext);
            fail("module definition should fail with controller access exception");
        } catch (Exception e) {
            assertEquals("Incorrect exception for invalid controller reference", NoAccessException.class, e.getClass());
            assertTrue("Incorrect error for invalid controller reference", e.getMessage().contains("namespace cannot use controller"));
        }
    }

    @Test
    @SuppressWarnings("unchecked")
    public void validatePublicControllerInSameCaseInsensitiveNamespace() throws Exception {
        String casedNamespace = "someAweSomeNamespace";
        String controllerName = "someController";
        String methodName = "someMethod";

        ModuleDefImpl.Builder moduleDefBuilder = new ModuleDefImpl.Builder();

        ReferenceValidationContext validationContext = mock(ReferenceValidationContext.class);
        Reference reference = new Reference(ReferenceType.apexMethod, controllerName + "." + methodName, "file", null, casedNamespace + "." + controllerName + "." + methodName);
        List<Reference> references = new ArrayList<>();

        references.add(reference);

        DefDescriptor<ControllerDef> controllerDescriptor = new DefDescriptorImpl("apex", casedNamespace, controllerName, ControllerDef.class);

        DefinitionAccess publicAccess = new DefinitionAccessImpl(AuraContext.Access.PUBLIC);
        ControllerDef controllerDef = mock(ControllerDef.class);
        when(controllerDef.getDescriptor()).thenReturn(controllerDescriptor);
        when(controllerDef.getAccess()).thenReturn(publicAccess);

        when(validationContext.getAccessibleDefinition(controllerDescriptor)).thenReturn(controllerDef);

        ActionDef actionDef = mock(ActionDef.class);
        when(actionDef.getDescriptor()).thenReturn(new DefDescriptorImpl("apex://", casedNamespace, controllerName + "/ACTION$" + methodName, ActionDef.class));
        when(actionDef.getAccess()).thenReturn(publicAccess);
        Map<String, ActionDef> actions = new HashMap<>();
        actions.put(methodName, actionDef);

        when(controllerDef.getActionDefs()).thenAnswer(invocation -> actions);

        moduleDefBuilder.setDescriptor(new DefDescriptorImpl("markup", "someawesomenamespace", "module", ModuleDef.class));
        moduleDefBuilder.setSourceReferences(references);
        ModuleDef moduleDef = moduleDefBuilder.build();

        try {
            moduleDef.validateReferences(validationContext);
        } catch (Exception e) {
            fail("Should not throw exception");
        }
    }
    
    @Test
    @SuppressWarnings("unchecked")
    public void validatePrivateController() throws Exception {
        ModuleDefImpl.Builder moduleDefBuilder = new ModuleDefImpl.Builder();
        
        ReferenceValidationContext validationContext = mock(ReferenceValidationContext.class);
        Reference reference = new Reference(ReferenceType.apexMethod, "someController.someMethod", "file", null, "ns.someController.someMethod");
        List<Reference> references = new ArrayList<>();
        
        references.add(reference);
        
        DefDescriptor<ControllerDef> controllerDescriptor = new DefDescriptorImpl("apex", "ns", "someController", ControllerDef.class);
        
        DefinitionAccess privateAccess = new DefinitionAccessImpl(AuraContext.Access.PRIVATE);
        ControllerDef controllerDef = mock(ControllerDef.class);
        when(controllerDef.getDescriptor()).thenReturn(controllerDescriptor);
        when(controllerDef.getAccess()).thenReturn(privateAccess);
        
        when(validationContext.getAccessibleDefinition(controllerDescriptor)).thenReturn(controllerDef);

        moduleDefBuilder.setDescriptor(new DefDescriptorImpl("markup", "my", "module", ModuleDef.class));
        moduleDefBuilder.setSourceReferences(references);
        ModuleDef moduleDef = moduleDefBuilder.build();

        try {
            moduleDef.validateReferences(validationContext);
            fail("module definition should fail with controller access exception");
        } catch (Exception e) {
            assertEquals("Incorrect exception for invalid controller access", NoAccessException.class, e.getClass());
            assertTrue("Incorrect error for invalid controller access", e.getMessage().contains("namespace cannot use controller"));
        }
    }
    
    @Test
    @SuppressWarnings("unchecked")
    public void validateMissingControllerMethod() throws Exception {
        ModuleDefImpl.Builder moduleDefBuilder = new ModuleDefImpl.Builder();
        
        ReferenceValidationContext validationContext = mock(ReferenceValidationContext.class);
        Reference reference = new Reference(ReferenceType.apexMethod, "someController.someMethod", "file", null, "ns.someController.someMethod");
        List<Reference> references = new ArrayList<>();
        
        references.add(reference);
        
        DefDescriptor<ControllerDef> controllerDescriptor = new DefDescriptorImpl("apex", "ns", "someController", ControllerDef.class);
        
        DefinitionAccess globalAccess = new DefinitionAccessImpl(AuraContext.Access.GLOBAL);
        ControllerDef controllerDef = mock(ControllerDef.class);
        when(controllerDef.getDescriptor()).thenReturn(controllerDescriptor);
        when(controllerDef.getAccess()).thenReturn(globalAccess);
        when(controllerDef.getActionDefs()).thenReturn(Collections.emptyMap());
        
        when(validationContext.getAccessibleDefinition(controllerDescriptor)).thenReturn(controllerDef);

        moduleDefBuilder.setDescriptor(new DefDescriptorImpl("markup", "my", "module", ModuleDef.class));
        moduleDefBuilder.setSourceReferences(references);
        ModuleDef moduleDef = moduleDefBuilder.build();
        
        try {
            moduleDef.validateReferences(validationContext);
            fail("module definition should fail with no method found");
        } catch (Exception e) {
            assertEquals("Incorrect exception for no method found", InvalidDefinitionException.class, e.getClass());
            assertTrue("Incorrect error for no method found", e.getMessage().contains("No controller method named someMethod found"));
        }
    }
    
    @Test
    @SuppressWarnings("unchecked")
    public void validateControllerReferenceNamespacedIdNull() throws Exception {
        String namespace = "my";
        String controllerName = "someController";
        String methodName = "someMethod";
        String expectedDescriptorName = "apex://" + namespace + "." + controllerName;
        
        ModuleDefImpl.Builder moduleDefBuilder = new ModuleDefImpl.Builder();
        
        ReferenceValidationContext validationContext = mock(ReferenceValidationContext.class);
        Reference reference = new Reference(ReferenceType.apexMethod, controllerName + "." + methodName, "file", null, null); // null namespacedId
        List<Reference> references = new ArrayList<>();
        references.add(reference);
        
        DefDescriptor<ControllerDef> controllerDescriptor = new DefDescriptorImpl("apex", namespace, controllerName, ControllerDef.class);
        
        DefinitionAccess globalAccess = new DefinitionAccessImpl(AuraContext.Access.GLOBAL);
        DefinitionAccess publicAccess = new DefinitionAccessImpl(AuraContext.Access.PUBLIC);
        ControllerDef controllerDef = mock(ControllerDef.class);
        when(controllerDef.getDescriptor()).thenReturn(controllerDescriptor);
        when(controllerDef.getAccess()).thenReturn(globalAccess);
        
        when(validationContext.getAccessibleDefinition(controllerDescriptor)).thenReturn(controllerDef);

        ActionDef actionDef = mock(ActionDef.class);
        when(actionDef.getDescriptor()).thenReturn(new DefDescriptorImpl("apex://", namespace, controllerName + "/ACTION$" + methodName, ActionDef.class));
        when(actionDef.getAccess()).thenReturn(publicAccess);
        Map<String, ActionDef> actions = new HashMap<>();
        actions.put(methodName, actionDef);

        when(controllerDef.getActionDefs()).thenAnswer(invocation -> actions);

        moduleDefBuilder.setDescriptor(new DefDescriptorImpl("markup", namespace, "module", ModuleDef.class));
        moduleDefBuilder.setSourceReferences(references);
        ModuleDef moduleDef = moduleDefBuilder.build();

        try {
            moduleDef.validateReferences(validationContext);
        } catch (Exception e) {
            fail("Should not throw exception");
        }
        
        ArgumentCaptor<DefDescriptorImpl> descriptorCaptor = ArgumentCaptor.forClass(DefDescriptorImpl.class);
        verify(validationContext).getAccessibleDefinition(descriptorCaptor.capture());
        
        String actualDescriptorName = descriptorCaptor.getValue().getQualifiedName();
        assertEquals("Incorrect controller descriptor name", expectedDescriptorName, actualDescriptorName);
    }
}