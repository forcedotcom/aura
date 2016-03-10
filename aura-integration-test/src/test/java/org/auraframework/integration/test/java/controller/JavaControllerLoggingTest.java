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

import java.io.StringWriter;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.apache.log4j.spi.LoggingEvent;
import org.auraframework.Aura;
import org.auraframework.components.test.java.controller.JavaTestController.CustomParamType;
import org.auraframework.def.ActionDef;
import org.auraframework.def.ControllerDef;
import org.auraframework.def.JavaControllerDef;
import org.auraframework.instance.Action;
import org.auraframework.integration.test.logging.AbstractLoggingTest;
import org.auraframework.service.ContextService;
import org.auraframework.service.InstanceService;
import org.auraframework.service.LoggingService;
import org.auraframework.service.ServerService;
import org.auraframework.system.Message;
import org.junit.Test;

import com.google.common.collect.Lists;
import com.google.common.collect.Maps;

/**
 * Integration tests for java Controllers loggings.
 */
public class JavaControllerLoggingTest extends AbstractLoggingTest {

    private ServerService serverService;
    private InstanceService instanceService;
    private ContextService contextService;
    private LoggingService loggingService;

    public JavaControllerLoggingTest(String name) {
        super(name);
        // TODO: inject these services after merging uitier
        serverService = Aura.getServerService();
        instanceService = Aura.getInstanceService();
        contextService = Aura.getContextService();
        loggingService = Aura.getLoggingService();
    }

    @Test
    public void testParamLogging_NoParams() throws Exception {
        ControllerDef controller = getJavaControllerDef("java://org.auraframework.components.test.java.controller.TestController");
        Map<String, Object> params = Maps.newHashMap();
        ActionDef actionDef = controller.getSubDefinition("getString");
        Action nonLoggableStringAction = instanceService.getInstance(actionDef, params);
        Set<String> logsSet = runActionsAndReturnLogs(Lists.newArrayList(nonLoggableStringAction));
        assertEquals(1, logsSet.size());
        assertTrue(
                "Failed to log a server action",
                logsSet.contains(
                        "action_1$java://org.auraframework.components.test.java.controller.TestController/ACTION$getString"));
    }

    @Test
    public void testParamLogging_SelectParameters() throws Exception {
        ControllerDef controller = getJavaControllerDef("java://org.auraframework.components.test.java.controller.JavaTestController");
        Map<String, Object> params = Maps.newHashMap();
        params.put("strparam", "BoogaBoo");
        params.put("intparam", 1);
        ActionDef actionDef = controller.getSubDefinition("getSelectedParamLogging");
        Action selectParamLoggingAction = instanceService.getInstance(actionDef, params);
        Set<String> logsSet = runActionsAndReturnLogs(Lists.newArrayList(selectParamLoggingAction));
        assertEquals(1, logsSet.size());
        assertTrue(
                "Failed to log a server action and selected parameter assignment",
                logsSet.contains(
                        "action_1$java://org.auraframework.components.test.java.controller.JavaTestController/ACTION$getSelectedParamLogging{strparam,BoogaBoo}"));
    }

    @Test
    public void testParamLogging_MultipleIdenticalActions() throws Exception {
        ControllerDef controller = getJavaControllerDef("java://org.auraframework.components.test.java.controller.JavaTestController");
        Map<String, Object> params1 = Maps.newHashMap();
        params1.put("strparam", "BoogaBoo");
        params1.put("intparam", 1);

        ActionDef actionDef = controller.getSubDefinition("getSelectedParamLogging");
        Action selectParamLoggingAction1 = instanceService.getInstance(actionDef, params1);

        Map<String, Object> params2 = Maps.newHashMap();
        params2.put("strparam", "BoogaBoo");
        params2.put("intparam", 1);
        Action selectParamLoggingAction2 = instanceService.getInstance(actionDef, params2);

        Set<String> logsSet = runActionsAndReturnLogs(Lists.newArrayList(selectParamLoggingAction1, selectParamLoggingAction2));
        assertEquals(2, logsSet.size());
        assertTrue(
                "Failed to log first server action and selected parameter assignment",
                logsSet.contains(
                        "action_1$java://org.auraframework.components.test.java.controller.JavaTestController/ACTION$getSelectedParamLogging{strparam,BoogaBoo}"));
        assertTrue(
                "Failed to log second server action and selected parameter assignment",
                logsSet.contains(
                        "action_2$java://org.auraframework.components.test.java.controller.JavaTestController/ACTION$getSelectedParamLogging{strparam,BoogaBoo}"));
    }

    @Test
    public void testParamLogging_MultipleParameters() throws Exception {
        ControllerDef controller = getJavaControllerDef("java://org.auraframework.components.test.java.controller.JavaTestController");
        Map<String, Object> params = Maps.newHashMap();
        params.put("we", "we");
        params.put("two", "two");

        ActionDef actionDef = controller.getSubDefinition("getMultiParamLogging");
        Action selectParamLoggingAction = instanceService.getInstance(actionDef, params);
        Set<String> logsSet = runActionsAndReturnLogs(Lists.newArrayList(selectParamLoggingAction));
        assertEquals(1, logsSet.size());
        assertTrue(
                "Failed to log a server action and multiple params",
                logsSet.contains(
                        "action_1$java://org.auraframework.components.test.java.controller.JavaTestController/ACTION$getMultiParamLogging{we,we}{two,two}"));
    }

    @Test
    public void testParamLogging_NullValuesForParameters() throws Exception {
        ControllerDef controller = getJavaControllerDef("java://org.auraframework.components.test.java.controller.JavaTestController");
        Map<String, Object> params = Maps.newHashMap();

        ActionDef actionDef = controller.getSubDefinition("getLoggableString");
        Action selectParamLoggingAction = instanceService.getInstance(actionDef, params);
        Set<String> logsSet = runActionsAndReturnLogs(Lists.newArrayList(selectParamLoggingAction));
        assertEquals(1, logsSet.size());
        assertTrue(
                "Failed to log a server action and param with null value",
                logsSet.contains(
                        "action_1$java://org.auraframework.components.test.java.controller.JavaTestController/ACTION$getLoggableString{param,null}"));
    }

    @Test
    public void testParamLogging_ParametersOfCustomDataType() throws Exception {
        ControllerDef controller = getJavaControllerDef("java://org.auraframework.components.test.java.controller.JavaTestController");
        Map<String, Object> params = Maps.newHashMap();
        params.put("param", new CustomParamType());

        ActionDef actionDef = controller.getSubDefinition("getCustomParamLogging");
        Action selectParamLoggingAction = instanceService.getInstance(actionDef, params);
        Set<String> logsSet = runActionsAndReturnLogs(Lists.newArrayList(selectParamLoggingAction));
        assertEquals(1, logsSet.size());
        assertTrue(
                "Logging custom action param time failed to call toString() of the custom type",
                logsSet.contains(
                        "action_1$java://org.auraframework.components.test.java.controller.JavaTestController/ACTION$getCustomParamLogging{param,CustomParamType_toString}"));
    }

    @Test
    public void testParamLogging_ChainingActions() throws Exception {
        ControllerDef controller = getJavaControllerDef("java://org.auraframework.impl.java.controller.ActionChainingController");
        Map<String, Object> params = Maps.newHashMap();
        params.put("a", 1);
        params.put("b", 1);
        params.put(
                "actions",
                "{\"actions\":[{\"descriptor\":\"java://org.auraframework.impl.java.controller.ActionChainingController/ACTION$multiply\",\"params\":{\"a\":2}}]}");

        ActionDef actionDef = controller.getSubDefinition("add");
        Action selectParamLoggingAction = instanceService.getInstance(actionDef, params);
        Set<String> logsSet = runActionsAndReturnLogs(Lists.newArrayList(selectParamLoggingAction));
        assertEquals(2, logsSet.size());
        assertTrue(
                "Failed to log server action",
                logsSet.contains(
                        "action_1$java://org.auraframework.impl.java.controller.ActionChainingController/ACTION$add"));
        assertTrue(
                "Failed to log chained server action",
                logsSet.contains(
                        "action_2$java://org.auraframework.impl.java.controller.ActionChainingController/ACTION$multiply"));
    }

    @Test
    public void testParamLogging_ChainingIdenticalActions() throws Exception {
        ControllerDef controller = getJavaControllerDef("java://org.auraframework.impl.java.controller.ActionChainingController");
        List<Action> actions = Lists.newArrayList();
        Map<String, Object> params = Maps.newHashMap();
        Action action;
        params.put("a", 1);
        params.put("b", 1);
        params.put(
                "actions",
                "{\"actions\":[{\"descriptor\":\"java://org.auraframework.impl.java.controller.ActionChainingController/ACTION$add\",\"params\":{\"a\":2, \"actions\":\"\"}}]}");

        ActionDef actionDef = controller.getSubDefinition("add");
        action = instanceService.getInstance(actionDef, params);
        actions.add(action);

        params = Maps.newHashMap();
        params.put("a", 1);
        params.put("b", 1);
        params.put("actions", null);
        action = instanceService.getInstance(actionDef, params);
        actions.add(action);

        Set<String> logsSet = runActionsAndReturnLogs(actions);
        assertEquals(3, logsSet.size());
        assertTrue(
                "Failed to log server action",
                logsSet.contains(
                        "action_1$java://org.auraframework.impl.java.controller.ActionChainingController/ACTION$add"));
        assertTrue(
                "Failed to log chained server action",
                logsSet.contains(
                        "action_2$java://org.auraframework.impl.java.controller.ActionChainingController/ACTION$add"));
        assertTrue(
                "Failed to log chained server action",
                logsSet.contains(
                        "action_3$java://org.auraframework.impl.java.controller.ActionChainingController/ACTION$add"));
    }

    /**
     * we run the list of actions, collect logs, parse them into a set of strings, return the set.
     * @param actions
     * @return
     * @throws Exception
     */
    private Set<String> runActionsAndReturnLogs(List<Action> actions) throws Exception {
        boolean debug = false;
        List<LoggingEvent> logs;
        StringWriter sw = new StringWriter();
        appender.clearLogs();
        try {
            serverService.run(new Message(actions), contextService.getCurrentContext(), sw, null);
        } finally {
            loggingService.flush();
            logs = appender.getLog();
            assertNotNull(logs);
        }
        Set<String> logsSet = new HashSet<>();
        for(LoggingEvent le: logs) {
            String message = le.getMessage().toString();
            //we only care about log contain things like "action_1$java://org.auraframework.impl.java.controller.ActionChainingController/ACTION$bla;"
            if(message.contains("action_1")) {
                String[] msgList = message.split(";", 20);
                for(String msg : msgList) {
                    if(msg.startsWith("action_")) {
                        //msg looks like this action_1$java://org.auraframework.impl.java.controller.ActionChainingController/ACTION$functionName{some parameter}: 4
                        //but we don't want the ': 4' at the end
                        logsSet.add(msg.substring(0, msg.lastIndexOf(':')));
                        if(debug) { System.out.println("add sub-msg:"+msg.substring(0, msg.lastIndexOf(':'))); }
                    } else {
                        if(debug) { System.out.println("ignore sub-msg:"+msg); }
                    }
                }
            } else {
                if(debug) { System.out.println("ignore msg: "+message); }
            }
        }
        return logsSet;
    }

    private ControllerDef getJavaControllerDef(String qualifiedName) throws Exception {
        ControllerDef controllerDef = definitionService.getDefinition(qualifiedName, ControllerDef.class);
        assertTrue(controllerDef instanceof JavaControllerDef);
        return controllerDef;
    }
}
