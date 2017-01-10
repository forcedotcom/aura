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
package org.auraframework.integration.test.compound.controller;

import static org.mockito.Matchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.never;

import org.auraframework.adapter.ExceptionAdapter;
import org.auraframework.def.ComponentDef;
import org.auraframework.def.ControllerDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.impl.AuraImplTestCase;
import org.auraframework.impl.compound.controller.CompoundControllerDefFactory;
import org.auraframework.impl.compound.controller.CompoundControllerDefFactory.ActionNameConflictException;
import org.junit.Test;
import org.mockito.ArgumentCaptor;

public class CompoundControllerDefFactoryTest extends AuraImplTestCase {

    @Test
    public void testGetDefGacksForServerClientActionNameConflicts() throws Exception {
        // Arrange
        ExceptionAdapter exceptionAdapter = mock(ExceptionAdapter.class);
        CompoundControllerDefFactory controllerDefFactory = new CompoundControllerDefFactory(exceptionAdapter);

        String cmpMarkup = "<aura:component controller='java://org.auraframework.components.test.java.controller.TestController'>" +
                           "</aura:component>";
        DefDescriptor<ComponentDef> cmpDescriptor = addSourceAutoCleanup(ComponentDef.class, cmpMarkup);
        DefDescriptor<ControllerDef> controllerDesc = definitionService.getDefDescriptor(cmpDescriptor,
                DefDescriptor.JAVASCRIPT_PREFIX, ControllerDef.class);

        // conflicting action name
        String controllerCode = "({ doSomething: function(cmp) { }})";
        addSourceAutoCleanup(controllerDesc, controllerCode);

        // Act
        controllerDefFactory.getDef(controllerDesc);

        // Assert
        ArgumentCaptor<ActionNameConflictException> argumentCaptor = ArgumentCaptor.forClass(ActionNameConflictException.class);
        verify(exceptionAdapter, times(1)).handleException(argumentCaptor.capture());
        String descriptor = argumentCaptor.getValue().getComponentDescriptor();
        assertEquals("handleException() doesn't use correct component descriptor",
                cmpDescriptor.getQualifiedName(), descriptor);
    }

    @Test
    public void testGetDefDoesNotGackForClientControllerOverridden() throws Exception {
        // Arrange
        ExceptionAdapter exceptionAdapter = mock(ExceptionAdapter.class);
        CompoundControllerDefFactory controllerDefFactory = new CompoundControllerDefFactory(exceptionAdapter);

        String baseCmpMarkup = "<aura:component extensible='true'></aura:component>";
        DefDescriptor<ComponentDef> baseCmpDescriptor = addSourceAutoCleanup(ComponentDef.class, baseCmpMarkup);
        DefDescriptor<ControllerDef> baseControllerDesc = definitionService.getDefDescriptor(baseCmpDescriptor,
                DefDescriptor.JAVASCRIPT_PREFIX, ControllerDef.class);

        String cmpMarkup = String.format("<aura:component extends='%s'></aura:component>", baseCmpDescriptor.getDescriptorName());
        DefDescriptor<ComponentDef> cmpDescriptor = addSourceAutoCleanup(ComponentDef.class, cmpMarkup);
        DefDescriptor<ControllerDef> controllerDesc = definitionService.getDefDescriptor(cmpDescriptor,
                DefDescriptor.JAVASCRIPT_PREFIX, ControllerDef.class);

        String controllerCode = "({ doSomething: function(cmp) { }})";
        addSourceAutoCleanup(baseControllerDesc, controllerCode);
        addSourceAutoCleanup(controllerDesc, controllerCode);

        // Act
        controllerDefFactory.getDef(controllerDesc);

        // Assert
        verify(exceptionAdapter, never()).handleException(any(ActionNameConflictException.class));
    }
}
