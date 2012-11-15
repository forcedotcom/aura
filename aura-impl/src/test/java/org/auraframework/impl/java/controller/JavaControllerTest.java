/*
 * Copyright (C) 2012 salesforce.com, inc.
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

import java.util.HashMap;
import java.util.Map;

import org.auraframework.Aura;
import org.auraframework.def.*;
import org.auraframework.impl.AuraImplTestCase;
import org.auraframework.impl.system.DefDescriptorImpl;

import org.auraframework.instance.Action;
import org.auraframework.instance.Action.State;

import org.auraframework.throwable.AuraExecutionException;
import org.auraframework.throwable.AuraUnhandledException;
import org.auraframework.throwable.quickfix.DefinitionNotFoundException;
import org.auraframework.throwable.quickfix.InvalidDefinitionException;

/**
 * Automation for java Controllers.
 * 
 * @hierarchy Aura.Unit Tests.Components.Controller.Java Controller
 * @priority high
 */
public class JavaControllerTest extends AuraImplTestCase {
    public JavaControllerTest(String name){
        super(name);
    }

    private ControllerDef getJavaController(String name) throws Exception {
        DefDescriptor<ControllerDef> javaCntrlrDefDesc = DefDescriptorImpl.getInstance(name, ControllerDef.class);
        return javaCntrlrDefDesc.getDef();
    }

    private void assertControllerThrows(String name, Class<? extends Exception> clazz, String start, String loc) {
        DefDescriptor<ControllerDef> javaCntrlrDefDesc = DefDescriptorImpl.getInstance(name, ControllerDef.class);

        try {
            javaCntrlrDefDesc.getDef();
            fail("Expected "+clazz.getName());
        } catch (Exception e) {
            this.checkExceptionStart(e, clazz, start, loc);
        }
    }

    private void checkPassAction(ControllerDef controller, String name, Map<String, Object> args, State expState,
            Object returnValue) {
        Action action = controller.createAction(name, args);
        action.run();
        assertEquals(name+" State", expState, action.getState());
        assertEquals(name+" expected no errors", 0, action.getErrors().size());
        assertEquals(name+" return", returnValue, action.getReturnValue());
    }

    private void checkFailAction(ControllerDef controller, String name, Map<String,Object> args, State expState,
                                 Class<? extends Exception> error, String errorMessage) {
        Action action = controller.createAction(name, args);
        action.run();
        assertEquals(name+" State", expState, action.getState());
        assertEquals(name+" expected an error", 1, action.getErrors().size());
        checkExceptionStart((Exception)action.getErrors().get(0), error, errorMessage, null);
        assertEquals(name+" return", null, action.getReturnValue());
    }

    /**
     * Verify that class level annotation is required for a java Controller.
     * 
     * @userStory a07B0000000FAmj
     */
    public void testClassLevelAnnotationForJavaController()throws Exception{
        assertControllerThrows("java://org.auraframework.impl.java.controller.TestControllerWithoutAnnotation",
                InvalidDefinitionException.class, "@Controller annotation is required on all Controllers.",
                "org.auraframework.impl.java.controller.TestControllerWithoutAnnotation");
    }

    /**
     * Ensure that a key is required for every parameter.
     */
    public void testMissingKeyAnnotation() throws Exception {
        assertControllerThrows("java://org.auraframework.impl.java.controller.TestControllerMissingKey",
                InvalidDefinitionException.class, "@Key annotation is required on all action parameters",
                "org.auraframework.impl.java.controller.TestControllerMissingKey.appendStrings");
    }

    /**
     * Ensure that an action must be public. Currently, we do not actualy process non-public members. This is due to a
     * limitation in the way java returns methods. If we do want to do this, we'd have to process all methods in a
     * rather complex way (walking up the class hierarchy).
     */
    public void testProtectedAction() throws Exception {
        ControllerDef cont = getJavaController("java://org.auraframework.impl.java.controller.TestControllerWithProtectedAction");

        assertNotNull("could not find controller", cont);
        assertNull("should not have appendStrings", cont.getActionDefs().get("appendStrings"));
        assertNull("should not have doSomething", cont.getActionDefs().get("doSomething"));
        assertEquals("should have one method", 1, cont.getActionDefs().size());
        assertNotNull("should have doNothing", cont.getActionDefs().get("doNothing"));
    }

    /**
     * Ensure that an action must be static.
     */
    public void testNonStaticAction() throws Exception {
        assertControllerThrows("java://org.auraframework.impl.java.controller.TestControllerWithNonStaticAction",
                InvalidDefinitionException.class, "Actions must be public static methods",
                "org.auraframework.impl.java.controller.TestControllerWithNonStaticAction.appendStrings");
    }

    public void testActionNoParameters() throws Exception {
        ControllerDef controller = getJavaController("java://org.auraframework.impl.java.controller.TestController");
        Map<String,Object> empty = new HashMap<String, Object>();
        Map<String,Object> hasOne = new HashMap<String, Object>();
        hasOne.put("a", "don't care");
        assertNotNull("unable to load test controller", controller);

        checkPassAction(controller, "doSomething", empty, State.SUCCESS, null);
        // FIXME: extra arguments probably should fail.
        checkPassAction(controller, "doSomething", hasOne, State.SUCCESS, null);
        checkPassAction(controller, "getString", empty, State.SUCCESS, "TestController");
        checkFailAction(controller, "throwException", empty, State.ERROR, AuraExecutionException.class,
                "java://org.auraframework.impl.java.controller.TestController: java.lang.RuntimeException: intentionally generated");
        checkFailAction(controller, "imNotHere", empty, State.ERROR, InvalidDefinitionException.class,
                "No action found");
    }

    /**
     * Test to ensure that parameters get passed correectly.
     */
    public void testActionWithParameters() throws Exception {
        ControllerDef controller = getJavaController("java://org.auraframework.impl.java.controller.TestControllerWithParameters");
        Map<String,Object> args = new HashMap<String, Object>();

        args.put("a", "x");
        args.put("b", "y");
        checkPassAction(controller, "appendStrings", args, State.SUCCESS, "xy");

        // Is this correct?
        args.clear();
        checkPassAction(controller, "appendStrings", args, State.SUCCESS, "nullnull");

        args.put("a", new Integer(1));
        args.put("b", new Integer(2));
        checkPassAction(controller, "sumValues", args, State.SUCCESS, new Integer(3));

        args.clear();
        checkFailAction(controller, "sumValues", args, State.ERROR, AuraExecutionException.class,
                "java://org.auraframework.impl.java.controller.TestControllerWithParameters: java.lang.NullPointerException");

        args.put("a", "x");
        args.put("b", "y");
        checkFailAction(controller, "sumValues", args, State.ERROR, AuraUnhandledException.class,
                        "Invalid value for a: java://java.lang.Integer");

        args.put("a", "1");
        args.put("b", "2");
        checkPassAction(controller, "sumValues", args, State.SUCCESS, new Integer(3));
    }

    /**
     * Verify that nice exception is thrown if controller def doesn't exist
     */
    public void testControllerNotFound() throws Exception {
        DefDescriptor<ComponentDef> dd = addSourceAutoCleanup("<aura:component controller='java://goats'/>",
                ComponentDef.class);
        try {
            Aura.getInstanceService().getInstance(dd);
            fail("Expected DefinitionNotFoundException");
        } catch (DefinitionNotFoundException e) {
            assertEquals("No CONTROLLER named java://goats found", e.getMessage());
        }
    }

}
