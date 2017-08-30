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
package org.auraframework.impl.controller;

import static org.mockito.Matchers.any;
import static org.mockito.Mockito.verify;

import java.util.Map;

import org.auraframework.adapter.ExceptionAdapter;
import org.auraframework.def.ComponentDef;
import org.auraframework.instance.Action;
import org.auraframework.instance.Component;
import org.auraframework.service.DefinitionService;
import org.auraframework.throwable.AuraRuntimeException;
import org.auraframework.throwable.quickfix.InvalidDefinitionException;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.test.util.UnitTestCase;
import org.junit.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.Mockito;

import com.google.common.collect.Maps;

/**
 * Unit tests for ComponentController
 */
public class ComponentControllerUnitTest extends UnitTestCase {

    @Test
    public void testGetBaseComponentThrowsInvalidDefinitionExceptionWhenDescriptorIsInvalid() {
        String expected = "foobar";
        ComponentController controller = new ComponentController();
        DefinitionService mockDefinitionService = Mockito.mock(DefinitionService.class);
        AuraRuntimeException invalid = new AuraRuntimeException(expected);
        Mockito.when(mockDefinitionService.getDefDescriptor(expected, ComponentDef.class)).thenThrow(invalid);
        controller.setDefinitionService(mockDefinitionService);
        Map<String, Object> attributes = Maps.newHashMap();

        try {
            controller.getBaseComponent(Component.class, ComponentDef.class, expected, attributes, false);
        } catch (QuickFixException e) {
            assertEquals(e.getClass(), InvalidDefinitionException.class);
            assertEquals(e.getMessage(), "Invalid descriptor: " + expected);
        }
    }

    @Test
    public void testReportFailedActionSetsReportingLevelAsErrorByDefault() {
        // Actual
        ComponentController componentController = new ComponentController();

        ExceptionAdapter mockExceptionAdapter = Mockito.mock(ExceptionAdapter.class);
        componentController.setExceptionAdapter(mockExceptionAdapter);

        ArgumentCaptor<AuraClientException> clientExceptionCaptor = ArgumentCaptor.forClass(AuraClientException.class);

        // Act
        componentController.reportFailedAction("descriptor", "id", "error", "clientStack", "componentStack", "stacktraceIdGen", null);

        // Assert
        verify(mockExceptionAdapter).handleException(clientExceptionCaptor.capture(), any(Action.class));
        AuraClientException.Level actual = clientExceptionCaptor.getValue().getLevel();
        assertEquals(AuraClientException.Level.ERROR, actual);
    }

    @Test
    public void testReportFailedActionSetsReportingLevelAsErrorForInvalidLevelString() {
        // Actual
        ComponentController componentController = new ComponentController();

        ExceptionAdapter mockExceptionAdapter = Mockito.mock(ExceptionAdapter.class);
        componentController.setExceptionAdapter(mockExceptionAdapter);

        ArgumentCaptor<AuraClientException> clientExceptionCaptor = ArgumentCaptor.forClass(AuraClientException.class);

        // Act
        String reportingLevel = "invalidLevel";
        componentController.reportFailedAction("descriptor", "id", "error", "clientStack", "componentStack", "stacktraceIdGen", reportingLevel);

        // Assert
        verify(mockExceptionAdapter).handleException(clientExceptionCaptor.capture(), any(Action.class));
        AuraClientException.Level actual = clientExceptionCaptor.getValue().getLevel();
        assertEquals(AuraClientException.Level.ERROR, actual);
    }
}
