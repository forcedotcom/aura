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

import java.util.Map;

import org.auraframework.def.ComponentDef;
import org.auraframework.instance.Component;
import org.auraframework.service.DefinitionService;
import org.auraframework.throwable.AuraRuntimeException;
import org.auraframework.throwable.quickfix.InvalidDefinitionException;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.test.util.UnitTestCase;
import org.junit.Test;
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
}
