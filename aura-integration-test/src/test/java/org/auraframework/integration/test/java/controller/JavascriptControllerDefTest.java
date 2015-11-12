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

import static org.hamcrest.CoreMatchers.instanceOf;
import static org.junit.Assert.assertThat;

import java.util.HashMap;
import java.util.Map;

import org.auraframework.def.ActionDef;
import org.auraframework.def.ControllerDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.impl.AuraImplTestCase;
import org.auraframework.impl.javascript.controller.JavascriptActionDef;
import org.auraframework.impl.javascript.controller.JavascriptControllerDef;
import org.auraframework.impl.javascript.controller.JavascriptPseudoAction;
import org.auraframework.instance.Action;
import org.auraframework.throwable.quickfix.DefinitionNotFoundException;

/**
 * Test class to verify implementation of JavaScript Controllers for component.
 */
public class JavascriptControllerDefTest extends AuraImplTestCase {
    public JavascriptControllerDefTest(String name) {
        super(name);
    }

    /**
     * Verify JavascriptRendererDef is non-local.
     */
    public void testIsLocalReturnsFalse() {
        ControllerDef controllerDef = (new JavascriptControllerDef.Builder()).build();
        assertFalse(controllerDef.isLocal());
    }

    public void testGetActionDefs() throws Exception {
        String controllerJs = 
                "({ " +
                "    function1: function(arg) {}," +
                "    function2: function(arg) {}" +
                "})";
        DefDescriptor<ControllerDef> controllerDesc = addSourceAutoCleanup(ControllerDef.class, controllerJs);
        ControllerDef controllerDef = controllerDesc.getDef();

        assertThat(controllerDef, instanceOf(JavascriptControllerDef.class));
        Map<String, ? extends ActionDef> actionDefMap = controllerDef.getActionDefs();

        assertTrue("Expected there be only two action in the javascript controller.", actionDefMap.size() == 2);
        ActionDef actionDef1 = actionDefMap.get("function1");
        assertThat(actionDef1, instanceOf(JavascriptActionDef.class));
        assertEquals("function1", actionDef1.getName());

        ActionDef actionDef2 = actionDefMap.get("function2");
        assertThat(actionDef2, instanceOf(JavascriptActionDef.class));
        assertEquals("function2", actionDef2.getName());
    }

    public void testGetSubDefinition() throws Exception {
        String expected = "function1";
        String controllerJs = "({ function1: function(arg) {} })";
        DefDescriptor<ControllerDef> controllerDesc = addSourceAutoCleanup(ControllerDef.class, controllerJs);
        ControllerDef controllerDef = controllerDesc.getDef();

        assertThat(controllerDef, instanceOf(JavascriptControllerDef.class));
        ActionDef actionDef = controllerDef.getSubDefinition(expected);

        assertThat(actionDef, instanceOf(JavascriptActionDef.class));
        assertEquals(expected, actionDef.getName());
    }

    public void testSerializeJavascriptActionDef() throws Exception {
        String controllerJs =
                "({\n" +
                "    function1: function(args) {\n" +
                "       var str = 'do Nothing';\n"+
                "    },\n" +
                "    function2: function(args1, args2) {\n" +
                "        var str = 'Still do Nothing';\n"+
                "    }\n" +
                "})";
        DefDescriptor<ControllerDef> controllerDesc = addSourceAutoCleanup(ControllerDef.class, controllerJs);
        ControllerDef controllerDef = controllerDesc.getDef();

        serializeAndGoldFile(controllerDef, "_JSControllerDef");
    }

    /*
     * Verify JavascriptControllerDef creates an JavascriptPseudoAction object on server side.
     */
    public void testCreateAction() throws Exception {
        String controllerJs = "({ function1: function(arg) {} })";
        DefDescriptor<ControllerDef> controllerDesc = addSourceAutoCleanup(ControllerDef.class, controllerJs);
        ControllerDef controllerDef = controllerDesc.getDef();

        assertThat(controllerDef, instanceOf(JavascriptControllerDef.class));
        Action action = controllerDef.createAction("function1", null);

        assertThat(action, instanceOf(JavascriptPseudoAction.class));
    }

    public void testCreateActionThrowsExceptionWhenCreatingNonExsitingAction() throws Exception {
        String controllerJs = "({ function1: function(arg) {} })";
        DefDescriptor<ControllerDef> controllerDesc = addSourceAutoCleanup(ControllerDef.class, controllerJs);
        ControllerDef controllerDef = controllerDesc.getDef();

        try {
            controllerDef.createAction("nonExistingAction", new HashMap<String, Object>());
            fail("Should not be able to create an instance of the non-existing client action");
        } catch (Exception e) {
            String expectMessage = String.format("No ACTION named %s/ACTION$nonExistingAction found", controllerDesc.getQualifiedName());
            checkExceptionFull(e, DefinitionNotFoundException.class, expectMessage);
        }
    }
}
