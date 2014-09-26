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

import java.io.StringWriter;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.auraframework.Aura;
import org.auraframework.cache.Cache;
import org.auraframework.def.ActionDef;
import org.auraframework.def.ComponentDef;
import org.auraframework.def.ControllerDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.Definition;
import org.auraframework.def.TypeDef;
import org.auraframework.def.DefDescriptor.DescriptorKey;
import org.auraframework.impl.AuraImplTestCase;
import org.auraframework.impl.java.model.JavaValueDef;
import org.auraframework.impl.system.DefDescriptorImpl;
import org.auraframework.instance.Action;
import org.auraframework.instance.Action.State;
import org.auraframework.service.DefinitionService;
import org.auraframework.system.Annotations.AuraEnabled;
import org.auraframework.system.Annotations.Controller;
import org.auraframework.system.Location;
import org.auraframework.system.LoggingContext.KeyValueLogger;
import org.auraframework.system.Message;
import org.auraframework.test.annotation.ThreadHostileTest;
import org.auraframework.test.annotation.UnAdaptableTest;
import org.auraframework.test.controller.TestLoggingAdapterController;
import org.auraframework.throwable.AuraUnhandledException;
import org.auraframework.throwable.quickfix.DefinitionNotFoundException;
import org.auraframework.throwable.quickfix.InvalidDefinitionException;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.mockito.Mockito;

import com.google.common.collect.Lists;
import com.google.common.collect.Maps;

/**
 * Automation for java Controllers.
 */
public class JavaControllerTest extends AuraImplTestCase {
    public JavaControllerTest(String name) {
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
            fail("Expected " + clazz.getName());
        } catch (Exception e) {
            this.checkExceptionStart(e, clazz, start, loc);
        }
    }

    private void checkPassAction(ControllerDef controller, String name, Map<String, Object> args, State expState,
            Object returnValue) throws DefinitionNotFoundException {
        Action action = controller.createAction(name, args);
        action.run();
        assertEquals(name + " State", expState, action.getState());
        assertEquals(name + " expected no errors", 0, action.getErrors().size());
        assertEquals(name + " return", returnValue, action.getReturnValue());
    }

    private void checkFailAction(ControllerDef controller, String name, Map<String, Object> args, State expState,
            Class<? extends Exception> error, String errorMessage) throws DefinitionNotFoundException {
        Action action = controller.createAction(name, args);
        action.run();
        assertEquals(name + " State", expState, action.getState());
        assertEquals(name + " expected an error", 1, action.getErrors().size());
        checkExceptionContains((Exception) action.getErrors().get(0), error, errorMessage);
        assertEquals(name + " return", null, action.getReturnValue());
    }

    /**
     * Verify that class level annotation is required for a java Controller.
     */
    public void testClassLevelAnnotationForJavaController() throws Exception {
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
                InvalidDefinitionException.class, "Invalid non-static action in a controller: appendStrings",
                "java://org.auraframework.impl.java.controller.TestControllerWithNonStaticAction");
    }

    public void testActionNoParameters() throws Exception {
        ControllerDef controller = getJavaController("java://org.auraframework.impl.java.controller.TestController");
        Map<String, Object> empty = new HashMap<>();
        Map<String, Object> hasOne = new HashMap<>();
        hasOne.put("a", "don't care");
        assertNotNull("unable to load test controller", controller);

        checkPassAction(controller, "doSomething", empty, State.SUCCESS, null);
        checkPassAction(controller, "doSomething", hasOne, State.SUCCESS, null);
        checkPassAction(controller, "getString", empty, State.SUCCESS, "TestController");
        checkFailAction(controller, "throwException", empty, State.ERROR, AuraUnhandledException.class,
                "org.auraframework.throwable.AuraExecutionException: " +
                        "java://org.auraframework.impl.java.controller.TestController: " +
                        "java.lang.RuntimeException: intentionally generated");
    }

    /**
     * Verify correct errors are thrown when invalid parameters are passed to the controller.
     */
    public void testActionWithParametersError() throws Exception {
        ControllerDef controller = getJavaController("java://org.auraframework.impl.java.controller.TestControllerWithParameters");
        Map<String, Object> args = new HashMap<>();

        // A custom type parameter without a converter for what's passed to it (String)
        args.put("a", "x");
        checkFailAction(controller, "customParam", args, State.ERROR, AuraUnhandledException.class,
                "Error on parameter a: java://org.auraframework.impl.java.controller.TestControllerWithParameters$CustomParam");

        // No parameters to a controller method that requires params
        args.clear();
        checkFailAction(controller, "sumValues", args, State.ERROR, AuraUnhandledException.class,
                "org.auraframework.throwable.AuraExecutionException: " +
                        "java://org.auraframework.impl.java.controller.TestControllerWithParameters: " +
                        "java.lang.NullPointerException");

        // Passing the wrong type (Strings instead of Integers)
        args.put("a", "x");
        args.put("b", "y");
        checkFailAction(controller, "sumValues", args, State.ERROR, AuraUnhandledException.class,
                "Invalid value for a: java://java.lang.Integer");
    }

    /**
     * Test to ensure that parameters get passed correctly.
     */
    public void testActionWithParameters() throws Exception {
        ControllerDef controller = getJavaController("java://org.auraframework.impl.java.controller.TestControllerWithParameters");
        Map<String, Object> args = new HashMap<>();

        args.put("a", "x");
        args.put("b", "y");
        checkPassAction(controller, "appendStrings", args, State.SUCCESS, "xy");

        // Is this correct?
        args.clear();
        checkPassAction(controller, "appendStrings", args, State.SUCCESS, "nullnull");

        args.put("a", new Integer(1));
        args.put("b", new Integer(2));
        checkPassAction(controller, "sumValues", args, State.SUCCESS, new Integer(3));

        args.put("a", "1");
        args.put("b", "2");
        checkPassAction(controller, "sumValues", args, State.SUCCESS, new Integer(3));
        
    }
    
    /** 
     * This is testing JavaAction with parameter that throws QFE when accessing. 
     * verify AuraUnhandledException is added when this happen in JavaAction
     */
    public void testActionWithBadParameterThrowsQFE() throws Exception {
    	//create DefDescriptor for JavaValueDefExt, type doesn't matter as we plan to spy on it.
    	String instanceName = "java://java.lang.String";
    	DefDescriptor<TypeDef> JavaValueDefDesc = DefDescriptorImpl.getInstance(instanceName, TypeDef.class);
    	//spy on DefDescriptor, ask it to throw QFE when calling getDef()
    	DefDescriptor<TypeDef> JavaValueDefDescMocked = Mockito.spy(JavaValueDefDesc);
    	Mockito.when(JavaValueDefDescMocked.getDef()).thenThrow(new TestQuickFixException("new quick fix exception"));
    	//time to ask MDR give us what we want
    	String name = "java://org.auraframework.impl.java.controller.JavaControllerTest$JavaValueDefExt";
    	Class<TypeDef> defClass = TypeDef.class;
    	DescriptorKey dk = new DescriptorKey(name, defClass);
        Cache<DescriptorKey, DefDescriptor<? extends Definition>> cache =
        		Aura.getCachingService().getDefDescriptorByNameCache();
        cache.put(dk, JavaValueDefDescMocked);
        
    	//jvd doesn't matter that much for triggering QFE, as we only used it as the Object param
        JavaValueDef jvd = new JavaValueDef("tvdQFE", JavaValueDefDesc, null);
        Map<String, Object> args = new HashMap<>();
        args.put("keya", jvd);
    	ControllerDef controller = getJavaController("java://org.auraframework.impl.java.controller.TestControllerOnlyForJavaControllerTest");
     	
    	//we actually catch the QFE in JavaAction.getArgs(), then wrap it up with AuraUnhandledException 
    	String errorMsg = "org.auraframework.impl.java.controller.JavaControllerTest$TestQuickFixException: new quick fix exception";
    	checkFailAction(controller, "customErrorParam", args, State.ERROR, AuraUnhandledException.class,
    			errorMsg);
    	
    }
    
    @SuppressWarnings("serial")
	public class JavaValueDefExt extends JavaValueDef {
		public JavaValueDefExt(String name,
				DefDescriptor<TypeDef> typeDescriptor, Location location) {
			super(name, typeDescriptor, location);
		}
    }
    
    
    private static class TestQuickFixException extends QuickFixException {
	        private static final long serialVersionUID = 7887234381181710432L;
	        public TestQuickFixException(String name) {
	            super(name, null);
	        }
	 }

    /**
     * Verify that nice exception is thrown if controller def doesn't exist
     */
    public void testControllerNotFound() throws Exception {
        DefDescriptor<ComponentDef> dd = addSourceAutoCleanup(ComponentDef.class,
                "<aura:component controller='java://goats'/>");
        try {
            Aura.getInstanceService().getInstance(dd);
            fail("Expected DefinitionNotFoundException");
        } catch (DefinitionNotFoundException e) {
            assertEquals(String.format("No CONTROLLER named java://goats found : [%s]", dd.getQualifiedName()),
                    e.getMessage());
        }
        ControllerDef controller = getJavaController("java://org.auraframework.impl.java.controller.TestController");
        Map<String, Object> empty = new HashMap<>();
        try {
            controller.createAction("imNotHere", empty);
            fail("Should not be able to create JavaAction when method does not exist in Controller class");
        } catch (DefinitionNotFoundException e) {
            assertEquals(
                    "No ACTION named java://org.auraframework.impl.java.controller.TestController/ACTION$imNotHere found",
                    e.getMessage());
        }
    }

    public void testDuplicateAction() throws Exception {
        assertControllerThrows("java://org.auraframework.impl.java.controller.TestControllerWithDuplicateAction",
                InvalidDefinitionException.class, "Duplicate action appendStrings",
                "org.auraframework.impl.java.controller.TestControllerWithDuplicateAction");
    }

    public void testGetSubDefinition() throws Exception {
        ControllerDef controller = getJavaController("java://org.auraframework.impl.java.controller.TestController");
        ActionDef subDef = controller.getSubDefinition("getString");
        assertEquals("SubDefinition is the wrong type", ActionDef.ActionType.SERVER, subDef.getActionType());
        assertEquals("java://org.auraframework.impl.java.controller.TestController/ACTION$getString", subDef
                .getDescriptor().getQualifiedName());
    }

    public void testGetNullSubDefinition() throws Exception {
        ControllerDef controller = getJavaController("java://org.auraframework.impl.java.controller.TestController");
        ActionDef subDefNonExistent = controller.getSubDefinition("iDontExist");
        assertNull("Trying to retrieve non-existent subdefiniton should return null", subDefNonExistent);
    }

    /**
     * Tests to verify the APIs on Action to mark actions as storable.
     */
    public void testStorable() throws Exception {
        ControllerDef controller = getJavaController("java://org.auraframework.impl.java.controller.TestController");
        Action freshAction = controller.createAction("getString", null);

        assertTrue("Expected an instance of JavaAction", freshAction instanceof JavaAction);
        JavaAction action = (JavaAction) freshAction;
        assertFalse("Actions should not be storable by default.", action.isStorable());
        action.run();
        assertFalse("isStorabel should not change values after action execution.", action.isStorable());

        Action storableAction = controller.createAction("getString", null);
        action = (JavaAction) storableAction;
        action.setStorable();
        assertTrue("Failed to mark a action as storable.", action.isStorable());
        action.run();
        assertTrue("Storable action was unmarked during execution", action.isStorable());
    }

    /**
     * Action without annotation is not backgroundable
     */
    public void testJavaActionDefIsBackgroundWithoutAnnotation() throws Exception {
        ControllerDef controller = getJavaController("java://org.auraframework.impl.java.controller.ParallelActionTestController");
        ActionDef actionDef = controller.getActionDefs().get("executeInForeground");
        assertFalse("ActionDefs should not be backgroundable without BackgroundAction annotation",
                ((JavaActionDef) actionDef).isBackground());
    }

    /**
     * Action without annotation is not backgroundable
     */
    public void testJavaActionDefIsBackgroundWithAnnotation() throws Exception {
        ControllerDef controller = getJavaController("java://org.auraframework.impl.java.controller.ParallelActionTestController");
        ActionDef actionDef = controller.getActionDefs().get("executeInBackground");
        assertTrue("ActionDefs should be backgroundable with BackgroundAction annotation",
                ((JavaActionDef) actionDef).isBackground());
    }

    public void testSerialize() throws Exception {
        ControllerDef controller = getJavaController("java://org.auraframework.impl.java.controller.ParallelActionTestController");
        serializeAndGoldFile(controller);
    }

    /**
     * Tests to verify the logging of params
     */
    public void testParamLogging() throws Exception {
        ControllerDef controller = getJavaController("java://org.auraframework.impl.java.controller.JavaTestController");
        JavaAction nonLoggableStringAction = (JavaAction) controller.createAction("getString", null);
        JavaAction nonLoggableIntAction = (JavaAction) controller.createAction("getInt", null);
        JavaAction loggableStringAction = (JavaAction) controller.createAction("getLoggableString",
                Collections.singletonMap("param", (Object) "bar"));
        JavaAction loggableIntAction = (JavaAction) controller.createAction("getLoggableString",
                Collections.singletonMap("param", (Object) 1));
        JavaAction loggableNullAction = (JavaAction) controller.createAction("getLoggableString",
                Collections.singletonMap("param", null));
        TestLogger testLogger = new TestLogger();

        nonLoggableStringAction.logParams(testLogger);
        assertNull("Key should not have been logged", testLogger.key);
        assertNull("Value should not have been logged", testLogger.value);

        nonLoggableIntAction.logParams(testLogger);
        assertNull("Key should not have been logged", testLogger.key);
        assertNull("Value should not have been logged", testLogger.value);

        loggableStringAction.logParams(testLogger);
        assertEquals("Key was not logged", "param", testLogger.key);
        assertEquals("Value was not logged", "bar", testLogger.value);

        loggableIntAction.logParams(testLogger);
        assertEquals("Key was not logged", "param", testLogger.key);
        assertEquals("Value was not logged", "1", testLogger.value);

        loggableNullAction.logParams(testLogger);
        assertEquals("Key was not logged", "param", testLogger.key);
        assertEquals("Value was not logged", "null", testLogger.value);
    }

    @ThreadHostileTest("TestLoggingAdapter not thread-safe")
    public void testParamLogging_NoParams() throws Exception {
        ControllerDef controller = getJavaController("java://org.auraframework.impl.java.controller.TestController");
        Map<String, Object> params = Maps.newHashMap();
        Action nonLoggableStringAction = controller.createAction("getString", params);
        List<Map<String, Object>> logs = runActionsAndReturnLogs(Lists.newArrayList(nonLoggableStringAction));
        assertEquals(1, logs.size());
        assertTrue(
                "Failed to log a server action",
                logs.get(0).containsKey(
                        "action_java://org.auraframework.impl.java.controller.TestController/ACTION$getString"));
    }

    @ThreadHostileTest("TestLoggingAdapter not thread-safe")
    public void testParamLogging_SelectParameters() throws Exception {
        ControllerDef controller = getJavaController("java://org.auraframework.impl.java.controller.JavaTestController");
        Map<String, Object> params = Maps.newHashMap();
        params.put("strparam", "BoogaBoo");
        params.put("intparam", 1);
        Action selectParamLoggingAction = controller.createAction("getSelectedParamLogging", params);
        List<Map<String, Object>> logs = runActionsAndReturnLogs(Lists.newArrayList(selectParamLoggingAction));
        assertEquals(1, logs.size());
        assertTrue(
                "Failed to log a server action and selected parameter assignment",
                logs.get(0)
                        .containsKey(
                                "action_java://org.auraframework.impl.java.controller.JavaTestController/ACTION$getSelectedParamLogging{strparam,BoogaBoo}"));
    }

    @ThreadHostileTest("TestLoggingAdapter not thread-safe")
    public void testParamLogging_MultipleParameters() throws Exception {
        ControllerDef controller = getJavaController("java://org.auraframework.impl.java.controller.JavaTestController");
        Map<String, Object> params = Maps.newHashMap();
        params.put("we", "we");
        params.put("two", "two");
        Action selectParamLoggingAction = controller.createAction("getMultiParamLogging", params);
        List<Map<String, Object>> logs = runActionsAndReturnLogs(Lists.newArrayList(selectParamLoggingAction));
        assertEquals(1, logs.size());
        assertTrue(
                "Failed to log a server action and multiple params",
                logs.get(0)
                        .containsKey(
                                "action_java://org.auraframework.impl.java.controller.JavaTestController/ACTION$getMultiParamLogging{we,we}{two,two}"));
    }

    @ThreadHostileTest("TestLoggingAdapter not thread-safe")
    public void testParamLogging_NullValuesForParameters() throws Exception {
        ControllerDef controller = getJavaController("java://org.auraframework.impl.java.controller.JavaTestController");
        Map<String, Object> params = Maps.newHashMap();
        Action selectParamLoggingAction = controller.createAction("getLoggableString", params);
        List<Map<String, Object>> logs = runActionsAndReturnLogs(Lists.newArrayList(selectParamLoggingAction));
        assertEquals(1, logs.size());
        assertTrue(
                "Failed to log a server action and param with null value",
                logs.get(0)
                        .containsKey(
                                "action_java://org.auraframework.impl.java.controller.JavaTestController/ACTION$getLoggableString{param,null}"));
    }

    @ThreadHostileTest("TestLoggingAdapter not thread-safe")
    public void testParamLogging_ParametersOfCustomDataType() throws Exception {
        ControllerDef controller = getJavaController("java://org.auraframework.impl.java.controller.JavaTestController");
        Map<String, Object> params = Maps.newHashMap();
        params.put("param", new JavaTestController.CustomParamType());
        Action selectParamLoggingAction = controller.createAction("getCustomParamLogging", params);
        List<Map<String, Object>> logs = runActionsAndReturnLogs(Lists.newArrayList(selectParamLoggingAction));
        assertEquals(1, logs.size());
        assertTrue(
                "Logging custom action param time failed to call toString() of the custom type",
                logs.get(0)
                        .containsKey(
                                "action_java://org.auraframework.impl.java.controller.JavaTestController/ACTION$getCustomParamLogging{param,CustomParamType_toString}"));
    }

    @ThreadHostileTest("TestLoggingAdapter not thread-safe")
    public void testParamLogging_ChainingActions() throws Exception {
        ControllerDef controller = getJavaController("java://org.auraframework.java.controller.ActionChainingController");
        Map<String, Object> params = Maps.newHashMap();
        params.put("a", 1);
        params.put("b", 1);
        params.put(
                "actions",
                "{\"actions\":[{\"descriptor\":\"java://org.auraframework.java.controller.ActionChainingController/ACTION$multiply\",\"params\":{\"a\":2}}]}");
        Action selectParamLoggingAction = controller.createAction("add", params);
        List<Map<String, Object>> logs = runActionsAndReturnLogs(Lists.newArrayList(selectParamLoggingAction));
        assertEquals(1, logs.size());
        assertTrue(
                "Failed to log server action",
                logs.get(0).containsKey(
                        "action_java://org.auraframework.java.controller.ActionChainingController/ACTION$add"));
        assertTrue(
                "Failed to log chained server action",
                logs.get(0).containsKey(
                        "action_java://org.auraframework.java.controller.ActionChainingController/ACTION$multiply"));
    }

    private List<Map<String, Object>> runActionsAndReturnLogs(List<Action> actions) throws Exception {
        List<Map<String, Object>> logs;
        StringWriter sw = new StringWriter();
        TestLoggingAdapterController.beginCapture();
        try {
            Aura.getServerService().run(new Message(actions), Aura.getContextService().getCurrentContext(), sw, null);
        } finally {
            Aura.getLoggingService().flush();
            logs = TestLoggingAdapterController.endCapture();
            assertNotNull(logs);
        }
        return logs;
    }

    private static class TestLogger implements KeyValueLogger {

        private String key = null;
        private String value = null;

        @Override
        public void log(String key, String value) {
            this.key = key;
            this.value = value;
        }
    }

    private void checkInvalidBeanConstructor(Class<?> clazz, String message) {
        DefDescriptor<ControllerDef> desc = DefDescriptorImpl.getInstance("java://" + clazz.getName(),
                ControllerDef.class);
        DefinitionService definitionService = Aura.getDefinitionService();
        try {
            definitionService.getDefinition(desc);
            fail("Expected exception");
        } catch (Exception e) {
            checkExceptionStart(e, InvalidDefinitionException.class, message, "java://" + clazz.getCanonicalName());
        }
    }

    @Controller(bean = true)
    public static class BadBeanControllerConstructor {
        public BadBeanControllerConstructor(String value) {
        }
    }

    @UnAdaptableTest("BeanAdapter might be different")
    public void testBadBeanControllerConstructor() {
        checkInvalidBeanConstructor(BadBeanControllerConstructor.class, "No default constructor found");
    }

    @Controller(bean = true)
    public static class PrivateBeanControllerConstructor {
        private PrivateBeanControllerConstructor() {
        }
    }

    @UnAdaptableTest("BeanAdapter might be different")
    public void testPrivateBeanControllerConstructor() {
        checkInvalidBeanConstructor(PrivateBeanControllerConstructor.class, "Default constructor is not public");
    }

    @Controller(bean = true)
    public static class ProtectedBeanControllerConstructor {
        protected ProtectedBeanControllerConstructor() {
        }
    }

    @UnAdaptableTest("BeanAdapter might be different")
    public void testProtectedBeanControllerConstructor() {
        checkInvalidBeanConstructor(ProtectedBeanControllerConstructor.class, "Default constructor is not public");
    }

    @Controller(bean = true)
    public static class StaticBeanControllerMethod {
        public StaticBeanControllerMethod() {
        }

        @AuraEnabled
        public static String getString() {
            return "hi";
        }
    }

    public void testStaticBeanControllerMethod() {
        checkInvalidBeanConstructor(StaticBeanControllerMethod.class, "Invalid static action in a bean: getString");
    }
}
