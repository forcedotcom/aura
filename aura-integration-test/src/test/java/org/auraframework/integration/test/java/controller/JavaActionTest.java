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

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.auraframework.adapter.ExceptionAdapter;
import org.auraframework.def.ActionDef;
import org.auraframework.def.ControllerDef;
import org.auraframework.def.JavaControllerDef;
import org.auraframework.def.ValueDef;
import org.auraframework.impl.AuraImplTestCase;
import org.auraframework.impl.java.controller.JavaAction;
import org.auraframework.impl.java.controller.JavaActionDef;
import org.auraframework.instance.Action;
import org.auraframework.instance.Action.State;
import org.auraframework.system.LoggingContext.KeyValueLogger;
import org.auraframework.throwable.AuraUnhandledException;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.junit.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.Mockito;

/**
 * Integration tests for JavaAction.
 */
public class JavaActionTest extends AuraImplTestCase {

    /**
     * Tests to verify the APIs on Action to mark actions as storable.
     */
    @Test
    public void testSetStorable() throws Exception {
        String controllerName = "java://org.auraframework.components.test.java.controller.TestController";
        String actionName = "getString";
        ActionDef actionDef = getJavaActionDef(controllerName, actionName);
        Action action = instanceService.getInstance(actionDef, null);
        assertTrue("Expected an instance of JavaAction", action instanceof JavaAction);

        assertFalse("Actions should not be storable by default.", action.isStorable());
        action.setStorable();
        assertTrue("Failed to mark a action as storable.", action.isStorable());
    }

    @Test
    public void testActionKeepsStorableStateAfterRun() throws Exception {
        String controllerName = "java://org.auraframework.components.test.java.controller.TestController";
        String actionName = "getString";
        ActionDef actionDef = getJavaActionDef(controllerName, actionName);
        Action action = instanceService.getInstance(actionDef, null);

        action.setStorable();
        assertTrue("Failed to mark a action as storable.", action.isStorable());
        action.run();

        assertTrue("Storable action was unmarked during execution", action.isStorable());
    }

    @Test
    public void testRunActionWithNoParameters() throws Exception {
        String targetController = "java://org.auraframework.components.test.java.controller.TestController";
        ControllerDef controllerDef = getJavaControllerDef(targetController);

        Map<String, Object> params = new HashMap<>();
        ActionDef actionDef = controllerDef.getSubDefinition("doSomething");
        JavaAction javaAction = instanceService.getInstance(actionDef, params);
        javaAction.run();

        assertEquals(State.SUCCESS, javaAction.getState());
        assertActionNotContainsError(javaAction);
        assertNull(javaAction.getReturnValue());
    }

    @Test
    public void testRunActionWithReturnValue() throws Exception {
        String targetController = "java://org.auraframework.components.test.java.controller.TestController";
        ControllerDef controllerDef = getJavaControllerDef(targetController);

        Map<String, Object> params = new HashMap<>();
        ActionDef actionDef = controllerDef.getSubDefinition("getString");
        JavaAction javaAction = instanceService.getInstance(actionDef, params);
        javaAction.run();

        assertEquals(State.SUCCESS, javaAction.getState());
        assertActionNotContainsError(javaAction);
        assertEquals("TestController", javaAction.getReturnValue());
    }

    /**
     * Verify that action state is ERROR and contains error message when exception is thrown from server action.
     */
    @Test
    public void testRunActionWithException() throws Exception {
        String targetController = "java://org.auraframework.components.test.java.controller.TestController";
        ControllerDef controllerDef = getJavaControllerDef(targetController);

        Map<String, Object> params = new HashMap<>();
        ActionDef actionDef = controllerDef.getSubDefinition("throwException");
        JavaAction javaAction = instanceService.getInstance(actionDef, params);
        javaAction.run();

        assertEquals("State should be Error when exception it thrown from server action.",
                State.ERROR, javaAction.getState());
        assertEquals(null, javaAction.getReturnValue());
        assertEquals(1, javaAction.getErrors().size());
        Exception actualException = (Exception) javaAction.getErrors().get(0);
        String expectedMessage = "java://org.auraframework.components.test.java.controller.TestController: " +
                "java.lang.RuntimeException: intentionally generated";
        checkExceptionContains(actualException, AuraUnhandledException.class, expectedMessage);
    }

    @Test
    public void testRunActionWithParameters() throws Exception {
        String targetController = "java://org.auraframework.impl.java.controller.TestControllerWithParameters";
        ControllerDef controllerDef = getJavaControllerDef(targetController);

        Map<String, Object> params = new HashMap<>();
        params.put("a", "x");
        params.put("b", "y");
        ActionDef actionDef = controllerDef.getSubDefinition("appendStrings");
        JavaAction javaAction = instanceService.getInstance(actionDef, params);
        javaAction.run();

        assertEquals(State.SUCCESS, javaAction.getState());
        assertActionNotContainsError(javaAction);
        assertEquals("xy", javaAction.getReturnValue());
    }

    @Test
    public void testRunActionWithIntegerParameters() throws Exception {
        String targetController = "java://org.auraframework.impl.java.controller.TestControllerWithParameters";
        ControllerDef controllerDef = getJavaControllerDef(targetController);

        Map<String, Object> params = new HashMap<>();
        params.put("a", Integer.valueOf(1));
        params.put("b", Integer.valueOf(2));
        ActionDef actionDef = controllerDef.getSubDefinition("sumValues");
        JavaAction javaAction = instanceService.getInstance(actionDef, params);
        javaAction.run();

        assertEquals(State.SUCCESS, javaAction.getState());
        assertActionNotContainsError(javaAction);
        assertEquals(Integer.valueOf(3), javaAction.getReturnValue());
    }

    /**
     * Verify correct errors are thrown when invalid parameters are passed to the controller.
     */
    @Test
    public void testRunActionWithIncorrectTypeParameters() throws Exception {
        String targetController = "java://org.auraframework.impl.java.controller.TestControllerWithParameters";
        ControllerDef controllerDef = getJavaControllerDef(targetController);

        Map<String, Object> params = new HashMap<>();
        // Passing the wrong type (NaN instead of Integers)
        params.put("a", Double.valueOf(Double.NaN));
        params.put("b", Double.valueOf(Double.NaN));
        ActionDef actionDef = controllerDef.getSubDefinition("sumValues");
        JavaAction javaAction = instanceService.getInstance(actionDef, params);
        javaAction.run();

        assertEquals("State should be Error when exception it thrown from server action.",
                State.ERROR, javaAction.getState());
        assertEquals(null, javaAction.getReturnValue());
        assertEquals(1, javaAction.getErrors().size());
        Exception actualException = (Exception) javaAction.getErrors().get(0);
        String expectedMessage = "Error on parameter a: java://java.lang.Integer";
        checkExceptionContains(actualException, AuraUnhandledException.class, expectedMessage);
    }

    @Test
    public void testRunActionWithIncorrectCutsomTypeParameters() throws Exception {
        String targetController = "java://org.auraframework.impl.java.controller.TestControllerWithParameters";
        ControllerDef controllerDef = getJavaControllerDef(targetController);

        Map<String, Object> params = new HashMap<>();
        params.put("a", "x");
        ActionDef actionDef = controllerDef.getSubDefinition("customParam");
        JavaAction javaAction = instanceService.getInstance(actionDef, params);
        javaAction.run();

        assertEquals("State should be Error when exception it thrown from server action.",
                State.ERROR, javaAction.getState());
        assertEquals(null, javaAction.getReturnValue());
        assertEquals(1, javaAction.getErrors().size());
        Exception actualException = (Exception) javaAction.getErrors().get(0);
        String expectedMessage = String.format("Error on parameter a: %s$CustomParam", targetController);
        checkExceptionContains(actualException, AuraUnhandledException.class, expectedMessage);
    }

    /**
     * This is testing JavaAction with parameter that throws QFE when accessing. verify AuraUnhandledException is added
     * when this happen in JavaAction
     */
    @Test
    public void testRunActionWithBadParameterThrowsQFE() throws Exception {
        JavaActionDef actionDef = Mockito.mock(JavaActionDef.class);
        List<ValueDef> params = new ArrayList<>();

        ValueDef valueDef = Mockito.mock(ValueDef.class);
        QuickFixException expected = Mockito.mock(QuickFixException.class);
        String name = "test";
        Mockito.doThrow(expected).when(valueDef).getType();
        Mockito.doReturn(name).when(valueDef).getName();
        params.add(valueDef);
        Mockito.doReturn(new Class[] { String.class }).when(actionDef).getJavaParams();
        Mockito.doReturn(params).when(actionDef).getParameters();

        ExceptionAdapter excAdapt = Mockito.mock(ExceptionAdapter.class);

        Action target = new JavaAction(null, actionDef, null, new HashMap<>(), excAdapt, null, null);
        Mockito.doReturn(expected).when(excAdapt).handleException(Mockito.any(), Mockito.any());

        target.run();

        assertEquals(State.ERROR, target.getState());
        assertEquals(null, target.getReturnValue());
        assertEquals(1, target.getErrors().size());
        ArgumentCaptor<Throwable> throwableCaptor = ArgumentCaptor.forClass(Throwable.class);
        ArgumentCaptor<Action> actionCaptor = ArgumentCaptor.forClass(Action.class);
        Mockito.verify(excAdapt, Mockito.times(1)).handleException(throwableCaptor.capture(), actionCaptor.capture());
        Mockito.verifyNoMoreInteractions(excAdapt);
        assertEquals(expected, throwableCaptor.getValue().getCause());
        assertEquals(target, actionCaptor.getValue());
    }

    @Test
    public void testParamLoggingForNonLoggableParam() throws Exception {
        String controllerName = "java://org.auraframework.components.test.java.controller.JavaTestController";
        String actionName = "getString";
        Map<String, Object> params = new HashMap<>();
        params.put("param", "bar");
        ActionDef actionDef = getJavaActionDef(controllerName, actionName);
        JavaAction javaAction = instanceService.getInstance(actionDef, params);

        TestLogger testLogger = new TestLogger();
        javaAction.logParams(testLogger);

        assertNull("Key should not have been logged", testLogger.key);
        assertNull("Value should not have been logged", testLogger.value);
    }

    @Test
    public void testParamLoggingForLoggableParam() throws Exception {
        String controllerName = "java://org.auraframework.components.test.java.controller.JavaTestController";
        String actionName = "getLoggableString";
        Map<String, Object> params = new HashMap<>();
        params.put("param", "bar");
        ActionDef actionDef = getJavaActionDef(controllerName, actionName);
        JavaAction javaAction = instanceService.getInstance(actionDef, params);

        TestLogger testLogger = new TestLogger();
        javaAction.logParams(testLogger);

        assertEquals("Key was not logged", "param", testLogger.key);
        assertEquals("Value was not logged", "bar", testLogger.value);
    }

    @Test
    public void testParamLoggingForLoggableParamWithNullValue() throws Exception {
        String controllerName = "java://org.auraframework.components.test.java.controller.JavaTestController";
        String actionName = "getLoggableString";
        Map<String, Object> params = new HashMap<>();
        params.put("param", null);
        ActionDef actionDef = getJavaActionDef(controllerName, actionName);
        JavaAction javaAction = instanceService.getInstance(actionDef, params);

        TestLogger testLogger = new TestLogger();
        javaAction.logParams(testLogger);

        assertEquals("Key was not logged", "param", testLogger.key);
        assertEquals("Value was not logged", "null", testLogger.value);
    }

    // KeyValueLogger implementation for ParamLogging tests
    private static class TestLogger implements KeyValueLogger {
        private String key = null;
        private String value = null;

        @Override
        public void log(String keyIn, String valueIn) {
            this.key = keyIn;
            this.value = valueIn;
        }
    }

    private ControllerDef getJavaControllerDef(String qualifiedName) throws Exception {
        ControllerDef controllerDef = definitionService.getDefinition(qualifiedName, ControllerDef.class);
        assertTrue(controllerDef instanceof JavaControllerDef);
        return controllerDef;
    }

    /**
     * Assert an action doesn't contain any errors.
     */
    private void assertActionNotContainsError(Action action) {
        int numOfError = action.getErrors().size();
        if(numOfError > 0) {
            fail(String.format("There are %d errors when running action %s: %s",
                    Integer.valueOf(numOfError), action.getDescriptor().getQualifiedName(), action.getErrors()));
        }
    }

    private JavaActionDef getJavaActionDef(String controllerQualifiedName, String actionName) throws Exception {
        ControllerDef controllerDef = definitionService.getDefinition(controllerQualifiedName, ControllerDef.class);
        ActionDef actionDef = controllerDef.getSubDefinition(actionName);

        assertTrue(actionDef instanceof JavaActionDef);
        return (JavaActionDef)actionDef;
    }
}
