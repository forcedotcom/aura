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

import java.util.HashMap;
import java.util.Map;

import javax.inject.Inject;

import org.auraframework.cache.Cache;
import org.auraframework.def.ActionDef;
import org.auraframework.def.ControllerDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.DefDescriptor.DescriptorKey;
import org.auraframework.def.Definition;
import org.auraframework.def.JavaControllerDef;
import org.auraframework.def.TypeDef;
import org.auraframework.impl.AuraImplTestCase;
import org.auraframework.impl.java.controller.JavaAction;
import org.auraframework.impl.java.controller.JavaActionDef;
import org.auraframework.impl.java.model.JavaValueDef;
import org.auraframework.instance.Action;
import org.auraframework.instance.Action.State;
import org.auraframework.service.CachingService;
import org.auraframework.service.InstanceService;
import org.auraframework.system.LoggingContext.KeyValueLogger;
import org.auraframework.throwable.AuraUnhandledException;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.junit.Test;
import org.mockito.Mockito;

/**
 * Integration tests for JavaAction.
 */
public class JavaActionTest extends AuraImplTestCase {

    @Inject
    private CachingService cachingService;

    @Inject
    private InstanceService instanceService;

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
        params.put("a", 1);
        params.put("b", 2);
        ActionDef actionDef = controllerDef.getSubDefinition("sumValues");
        JavaAction javaAction = instanceService.getInstance(actionDef, params);
        javaAction.run();

        assertEquals(State.SUCCESS, javaAction.getState());
        assertActionNotContainsError(javaAction);
        assertEquals(3, javaAction.getReturnValue());
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
        params.put("a", Double.NaN);
        params.put("b", Double.NaN);
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
        // create DefDescriptor for JavaValueDefExt, type doesn't matter as we plan to spy on it.
        String instanceName = "java://java.lang.String";
        DefDescriptor<TypeDef> JavaValueDefDesc = definitionService.getDefDescriptor(instanceName, TypeDef.class);
        // spy on DefDescriptor, ask it to throw QFE when calling getDef()
        DefDescriptor<TypeDef> JavaValueDefDescMocked = Mockito.spy(JavaValueDefDesc);
        Mockito.doThrow(Mockito.mock(QuickFixException.class)).when(JavaValueDefDescMocked).getDef();
        // time to ask MDR give us what we want
        String name = "java://org.auraframework.impl.java.model.JavaValueDef";
        Class<TypeDef> defClass = TypeDef.class;
        DescriptorKey dk = new DescriptorKey(name, defClass);
        Cache<DescriptorKey, DefDescriptor<? extends Definition>> cache =
                cachingService.getDefDescriptorByNameCache();
        cache.put(dk, JavaValueDefDescMocked);

        // jvd doesn't matter that much for triggering QFE, as we only used it as the Object param
        JavaValueDef jvd = new JavaValueDef("tvdQFE", JavaValueDefDesc, null);
        Map<String, Object> args = new HashMap<>();
        args.put("keya", jvd);
        ControllerDef controllerDef = getJavaControllerDef("java://org.auraframework.integration.test.java.controller.TestControllerOnlyForJavaControllerTest");

        // we actually catch the QFE in JavaAction.getArgs(), then wrap it up with AuraUnhandledException
        ActionDef actionDef = controllerDef.getSubDefinition("customErrorParam");
        Action action = instanceService.getInstance(actionDef, args);
        action.run();

        assertEquals(State.ERROR, action.getState());
        assertEquals(null, action.getReturnValue());
        assertEquals(1, action.getErrors().size());
        Exception actualException = (Exception) action.getErrors().get(0);
        // we actually catch the QFE in JavaAction.getArgs(), then wrap it up with AuraUnhandledException
        String expectedMessage = "Invalid parameter keya: java://java.lang.String";
        checkExceptionContains(actualException, AuraUnhandledException.class, expectedMessage);
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
        public void log(String key, String value) {
            this.key = key;
            this.value = value;
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
                    numOfError, action.getDescriptor().getQualifiedName(), action.getErrors()));
        }
    }

    private JavaActionDef getJavaActionDef(String controllerQualifiedName, String actionName) throws Exception {
        ControllerDef controllerDef = definitionService.getDefinition(controllerQualifiedName, ControllerDef.class);
        ActionDef actionDef = controllerDef.getSubDefinition(actionName);

        assertTrue(actionDef instanceof JavaActionDef);
        return (JavaActionDef)actionDef;
    }
}
