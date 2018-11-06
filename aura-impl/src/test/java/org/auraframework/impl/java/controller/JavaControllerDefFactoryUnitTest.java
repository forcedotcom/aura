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
package org.auraframework.impl.java.controller;

import org.auraframework.def.ControllerDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.ds.servicecomponent.GlobalController;
import org.auraframework.impl.java.JavaSourceImpl;
import org.auraframework.impl.system.DefDescriptorImpl;
import org.auraframework.system.Annotations.Controller;
import org.junit.Test;

import static org.junit.Assert.assertTrue;

public class JavaControllerDefFactoryUnitTest {

    @Test
    public void getInternalTrueControllerDefAccess() throws Exception {
        DefDescriptor<ControllerDef> controllerDefDescriptor = new DefDescriptorImpl<>(DefDescriptor.JAVA_PREFIX, "aura", "TestInternalGlobalController", ControllerDef.class);
        JavaSourceImpl<ControllerDef> javaSource = new JavaSourceImpl<>(controllerDefDescriptor, TestInternalGlobalController.class);
        JavaControllerDefFactory javaControllerDefFactory = new JavaControllerDefFactory();

        ControllerDef controllerDef = javaControllerDefFactory.getDefinition(controllerDefDescriptor, javaSource);
        assertTrue("GlobalController annotated with @Controller(internal = true) should have internal access", controllerDef.getAccess().isInternal());
    }

    @Test
    public void getInternalFalseControllerDefAccess() throws Exception {
        DefDescriptor<ControllerDef> controllerDefDescriptor = new DefDescriptorImpl<>(DefDescriptor.JAVA_PREFIX, "aura", "TestInternalFalseGlobalController", ControllerDef.class);
        JavaSourceImpl<ControllerDef> javaSource = new JavaSourceImpl<>(controllerDefDescriptor, TestInternalFalseGlobalController.class);
        JavaControllerDefFactory javaControllerDefFactory = new JavaControllerDefFactory();

        ControllerDef controllerDef = javaControllerDefFactory.getDefinition(controllerDefDescriptor, javaSource);
        assertTrue("GlobalController annotated with @Controller(internal = false) should have default public access", controllerDef.getAccess().isPublic());
    }

    @Test
    public void getPublicControllerDefAccess() throws Exception {
        DefDescriptor<ControllerDef> controllerDefDescriptor = new DefDescriptorImpl<>(DefDescriptor.JAVA_PREFIX, "aura", "TestPublicGlobalController", ControllerDef.class);
        JavaSourceImpl<ControllerDef> javaSource = new JavaSourceImpl<>(controllerDefDescriptor, TestPublicGlobalController.class);
        JavaControllerDefFactory javaControllerDefFactory = new JavaControllerDefFactory();

        ControllerDef controllerDef = javaControllerDefFactory.getDefinition(controllerDefDescriptor, javaSource);
        assertTrue("GlobalController should have default public access", controllerDef.getAccess().isPublic());
    }

    @Controller(internal = true)
    private class TestInternalGlobalController implements GlobalController {
        @Override
        public String getQualifiedName() {
            return "aura://TestInternalGlobalController";
        }
    }

    @Controller(internal = false)
    private class TestInternalFalseGlobalController implements GlobalController {
        @Override
        public String getQualifiedName() {
            return "aura://TestInternalFalseGlobalController";
        }
    }

    private class TestPublicGlobalController implements GlobalController {
        @Override
        public String getQualifiedName() {
            return "aura://TestPublicGlobalController";
        }
    }
}