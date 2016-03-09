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
package org.auraframework.integration.test.java.controller;

import org.auraframework.def.ActionDef;
import org.auraframework.def.ComponentDef;
import org.auraframework.def.ControllerDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.JavaControllerDef;
import org.auraframework.impl.AuraImplTestCase;
import org.auraframework.test.source.StringSourceLoader;
import org.auraframework.throwable.NoAccessException;
import org.auraframework.throwable.quickfix.DefinitionNotFoundException;
import org.auraframework.throwable.quickfix.InvalidDefinitionException;
import org.auraframework.util.test.annotation.UnAdaptableTest;
import org.junit.Test;

/**
 * Integration tests for java Controllers.
 */
public class JavaControllerTest extends AuraImplTestCase {
    public JavaControllerTest(String name) {
        super(name);
    }

    //TODO: Enable this after merging uitier branch
    public void _testJavaControllerMissesImplements() throws Exception {
        String targetController = "org.auraframework.impl.java.controller.TestControllerWithoutImplements";
        try {
            definitionService.getDefinition("java://" + targetController, ControllerDef.class);
            fail("Expected InvalidDefinitionException when Java controller doesn't implements org.auraframework.ds.servicecomponent.Controller.");
        } catch(Exception e) {
            String expectedMessage = "class org.auraframework.impl.java.controller.TestControllerWithoutImplements must implement org.auraframework.ds.servicecomponent.Controller";
            this.checkExceptionStart(e, InvalidDefinitionException.class, expectedMessage, targetController);
        }
    }

    /**
     * Verify that InvalidDefinitionException is thrown when parameters of Java controller method misses Key annotation
     */
    public void testMissingKeyAnnotation() throws Exception {
        String targetController = "org.auraframework.impl.java.controller.TestControllerMissingKey";

        try {
            definitionService.getDefinition("java://" + targetController, ControllerDef.class);
            fail("Expected InvalidDefinitionException when parameters of Java controller method misses @Key annotation.");
        } catch (Exception e) {
            String expectedErrorMessage = "@Key annotation is required on all action parameters";
            String expectedErrorLocation = targetController + ".appendStrings";
            this.checkExceptionStart(e, InvalidDefinitionException.class, expectedErrorMessage, expectedErrorLocation);
        }
    }

    /**
     * Verify that protected methods in Java controller are not processed as an action.
     */
    @Test
    public void testProtectedMethodIsNotAction() throws Exception {
        String targetController = "java://org.auraframework.impl.java.controller.TestControllerWithNonPublicMethods";
        ControllerDef controllerDef = getJavaControllerDef(targetController);
        assertNotNull("Failed to find controller", controllerDef);

        ActionDef actual = controllerDef.getActionDefs().get("protectedMethod");
        assertNull("protected method in Java controller class should NOT be an action.", actual);
    }

    /**
     * Verify that package private methods in Java controller are not processed as an action.
     */
    @Test
    public void testPackagePrivateMethodIsNotAction() throws Exception {
        String targetController = "java://org.auraframework.impl.java.controller.TestControllerWithNonPublicMethods";
        ControllerDef controllerDef = getJavaControllerDef(targetController);
        assertNotNull("Failed to find controller", controllerDef);

        ActionDef actual = controllerDef.getActionDefs().get("packagePrivateMethod");
        assertNull("package private method in Java controller class should NOT be an action.", actual);
    }

    /**
     * Verify that private methods in Java controller are not processed as an action.
     */
    @Test
    public void testPrivateMethodIsNotAction() throws Exception {
        String targetController = "java://org.auraframework.impl.java.controller.TestControllerWithNonPublicMethods";
        ControllerDef controllerDef = getJavaControllerDef(targetController);
        assertNotNull("Failed to find controller", controllerDef);

        ActionDef actual = controllerDef.getActionDefs().get("privateMethod");
        assertNull("private method in Java controller class should NOT be an action.", actual);
    }

    /**
     * Verify that InvalidDefinitionException is thrown when two methods (action) have same name in one Java controller.
     */
    @Test
    public void testDuplicateActionInJavaController() throws Exception {
        String targetController = "org.auraframework.impl.java.controller.TestControllerWithDuplicateAction";
        try {
            definitionService.getDefinition("java://" + targetController, ControllerDef.class);
            fail("Expected InvalidDefinitionException when duplicate actions are defined in on Java controller.");
        } catch (Exception e) {
            String expectedErrorMessage = "Duplicate action appendStrings";
            this.checkExceptionStart(e, InvalidDefinitionException.class, expectedErrorMessage, targetController);
        }
    }

    /**
     * Verify that DefinitionNotFoundException is thrown when a component uses non-existing Java controller
     */
    @Test
    public void testExceptionIsThrownWhenCmpUsesNonExistingJavaController() throws Exception {
        DefDescriptor<ComponentDef> cmpDefDesc = addSourceAutoCleanup(ComponentDef.class,
                "<aura:component controller='java://DoesNotExist'></aura:component>");
        try {
            definitionService.getDefinition(cmpDefDesc);
            fail("Expected DefinitionNotFoundException when a component uses non-existing Java controller");
        } catch (Exception e) {
            String expectedMessage = "No CONTROLLER named java://DoesNotExist found";
            checkExceptionContains(e, DefinitionNotFoundException.class, expectedMessage);
        }
    }

    /**
     * Verify Java controller can be accessed in privileged (system) namespace.
     */
    @Test
    public void testUsingJavaControllerInPriviledgedNamespace() throws Exception {
        String cmpMarkup = "<aura:component controller='java://org.auraframework.components.test.java.controller.TestController'></aura:component>";
        DefDescriptor<ComponentDef> cmpDefDesc = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class,
                cmpMarkup, StringSourceLoader.DEFAULT_NAMESPACE + ":testComponent", true);

        ComponentDef cmpDef = definitionService.getDefinition(cmpDefDesc);
        assertNotNull(cmpDef);
    }

    /**
     * Verify Java controller can NOT be accessed in non-privileged (custom) namespace.
     */
    @Test
    @UnAdaptableTest("namespace start with c means something special in core")
    public void testUsingJavaControllerInNonPrivilegedNamespace() throws Exception {
        String cmpMarkup = "<aura:component controller='java://org.auraframework.components.test.java.controller.TestController'></aura:component>";
        DefDescriptor<ComponentDef> cmpDefDesc = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class,
                cmpMarkup, StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testComponent", false);

        try {
            definitionService.getDefinition(cmpDefDesc);
            fail("Expected NoAccessException when accessing Java controller in non-privileged namespace.");
        } catch (Exception e) {
            String expectedMessage = String.format("Access to controller 'org.auraframework.components.test.java.controller:TestController' from namespace '%s' in '%s(COMPONENT)'"
                    , StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE, cmpDefDesc.getQualifiedName());
            checkExceptionContains(e, NoAccessException.class, expectedMessage);
        }
    }

    @Test
    public void testGetSubDefinition() throws Exception {
        String targetController = "java://org.auraframework.components.test.java.controller.TestController";
        ControllerDef controllerDef = getJavaControllerDef(targetController);

        ActionDef actionDef = controllerDef.getSubDefinition("getString");

        assertEquals("SubDefinition is the wrong type", ActionDef.ActionType.SERVER, actionDef.getActionType());
        String excpectedActionDesc = targetController + "/ACTION$getString";
        assertEquals(excpectedActionDesc, actionDef.getDescriptor().getQualifiedName());
    }

    @Test
    public void testGetSubDefinitionRetrunsNullWhenActionNotExist() throws Exception {
        String targetController = "java://org.auraframework.components.test.java.controller.TestController";
        ControllerDef controllerDef = getJavaControllerDef(targetController);

        ActionDef actionDef = controllerDef.getSubDefinition("DoesNotExist");
        assertNull(actionDef);
    }

    @Test
    public void testSerializeJavaController() throws Exception {
        String targetController = "java://org.auraframework.impl.java.controller.ParallelActionTestController";
        ControllerDef controllerDef = getJavaControllerDef(targetController);
        serializeAndGoldFile(controllerDef);
    }

    private ControllerDef getJavaControllerDef(String qualifiedName) throws Exception {
        ControllerDef controllerDef = definitionService.getDefinition(qualifiedName, ControllerDef.class);
        assertTrue(controllerDef instanceof JavaControllerDef);
        return controllerDef;
    }
}

