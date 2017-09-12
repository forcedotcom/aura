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
package org.auraframework.test.instance;

import java.io.IOException;
import java.util.List;
import java.util.Map;

import org.auraframework.def.ActionDef;
import org.auraframework.def.ControllerDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.instance.AbstractActionImpl;
import org.auraframework.instance.Action;
import org.auraframework.instance.InstanceStack;
import org.auraframework.system.LoggingContext;
import org.auraframework.throwable.AuraExecutionException;
import org.auraframework.util.json.Json;
import org.junit.Assert;
import org.junit.Test;
import org.mockito.Mockito;

import com.google.common.collect.Lists;
import com.google.common.collect.Maps;

public class AbstractActionImplTest {
    //
    // A class to remove the 'abstract'
    //
    // We do not verify any of the actual functions here, except to use run to change the state.
    //
    private static class MyAction extends AbstractActionImpl<ActionDef> {
        public MyAction(DefDescriptor<ControllerDef> controllerDescriptor, ActionDef actionDef,
                Map<String, Object> paramValues) {
            super(controllerDescriptor, actionDef, paramValues);
        }

        @Override
        public void run() throws AuraExecutionException {
        }

        @Override
        public Object getReturnValue() {
            return null;
        }

        @Override
        public List<Object> getErrors() {
            return null;
        }

        @Override
        public void serialize(Json json) throws IOException {
        }

        public void setState(State state) {
            this.state = state;
        }
    };

    @Test
    public void testId() {
        ActionDef def = Mockito.mock(ActionDef.class);
        Action test = new MyAction(null, def, null);

        Assert.assertEquals("id should be initialized to null", null, test.getId());
        test.setId("a");
        Assert.assertEquals("setId should work the first time.", "a", test.getId());
        test.setId("b");
        Assert.assertEquals("setId should work a second time.", "b", test.getId());
        test.setId(null);
        Assert.assertEquals("setId should work a third time.", null, test.getId());
    }

    private Action getActionWithId(String id) {
        ActionDef def = Mockito.mock(ActionDef.class);
        Action test = new MyAction(null, def, null);
        test.setId(id);
        return test;
    }

    @Test
    public void testActions() {
        ActionDef def = Mockito.mock(ActionDef.class);
        Action test = new MyAction(null, def, null);

        List<Action> actions = test.getActions();
        Assert.assertNotNull("Actions should never be null", actions);
        Assert.assertEquals("Actions should empty", 0, actions.size());

        List<Action> newActions = Lists.newArrayList(getActionWithId("a"), getActionWithId("b"));
        test.add(newActions);
        actions = test.getActions();
        Assert.assertNotNull("Actions should never be null", actions);
        Assert.assertEquals("Actions should be length 2", 2, actions.size());
        Assert.assertEquals("Action 'a' should be first", "a", actions.get(0).getId());
        Assert.assertEquals("Action 'b' should be first", "b", actions.get(1).getId());

        newActions = Lists.newArrayList(getActionWithId("c"), getActionWithId("d"));
        test.add(newActions);
        actions = test.getActions();
        Assert.assertNotNull("Actions should never be null", actions);
        Assert.assertEquals("Actions should be length 4", 4, actions.size());
        Assert.assertEquals("Action 'a' should be first", "a", actions.get(0).getId());
        Assert.assertEquals("Action 'b' should be first", "b", actions.get(1).getId());
        Assert.assertEquals("Action 'c' should be first", "c", actions.get(2).getId());
        Assert.assertEquals("Action 'd' should be first", "d", actions.get(3).getId());
    }

    @Test
    public void testState() {
        ActionDef def = Mockito.mock(ActionDef.class);
        MyAction test = new MyAction(null, def, null);

        Assert.assertEquals("state should be initialized to new", Action.State.NEW, test.getState());
        test.setState(Action.State.RUNNING);
        Assert.assertEquals("state should be able to change", Action.State.RUNNING, test.getState());
    }

    @Test
    public void testStorable() {
        ActionDef def = Mockito.mock(ActionDef.class);
        Action test = new MyAction(null, def, null);

        Assert.assertEquals("isStorable should be initialized to false", false, test.isStorable());
        test.setStorable();
        Assert.assertEquals("isStorable should change on setStorable", true, test.isStorable());
        Assert.assertEquals("id should change on setStorable", "s", test.getId());
        test.setId("x");
        test.setStorable();
        Assert.assertEquals("isStorable should not change on second setStorable", true, test.isStorable());
        Assert.assertEquals("id should not change on second setStorable", "x", test.getId());
    }

    @Test
    public void testDescriptor() {
        ActionDef def = Mockito.mock(ActionDef.class);
        Action test = new MyAction(null, def, null);
        @SuppressWarnings("unchecked")
        DefDescriptor<ActionDef> expectedDesc = Mockito.mock(DefDescriptor.class);
        Mockito.when(def.getDescriptor()).thenReturn(expectedDesc);

        Assert.assertSame("descriptor should work", expectedDesc, test.getDescriptor());
    }

    @Test
    public void testParams() {
        Map<String, Object> params = Maps.newHashMap();
        ActionDef def = Mockito.mock(ActionDef.class);
        Action test = new MyAction(null, def, params);
        LoggingContext.KeyValueLogger logger = Mockito.mock(LoggingContext.KeyValueLogger.class);

        Assert.assertSame("params should be initialized", params, test.getParams());

        params.put("a", "b");
        test.logParams(logger);
        // logable values of null should avoid calls to the logger.
        Mockito.verifyNoMoreInteractions(logger);

        Mockito.when(def.getLoggableParams()).thenReturn(Lists.newArrayList("a", "b"));
        test.logParams(logger);
        Mockito.verify(logger, Mockito.times(1)).log("a", "b");
        Mockito.verify(logger, Mockito.times(1)).log("b", "null");
        Mockito.verifyNoMoreInteractions(logger);

        test = new MyAction(null, def, null);
        // Rebuild logger to check the logging correctly.
        logger = Mockito.mock(LoggingContext.KeyValueLogger.class);
        Assert.assertEquals("null params results in empty params", 0, test.getParams().size());
        test.logParams(logger);
        Mockito.verify(logger, Mockito.times(1)).log("a", "null");
        Mockito.verify(logger, Mockito.times(1)).log("b", "null");
        Mockito.verifyNoMoreInteractions(logger);
    }

    @Test
    public void testInstanceStack() {
        ActionDef def = Mockito.mock(ActionDef.class);
        Action test = new MyAction(null, def, null);
        InstanceStack iStack = test.getInstanceStack();
        Assert.assertEquals("Instance stack should be initialized without action ID as path", "/*[0]", iStack.getPath());
        Assert.assertEquals("Subsequent calls to getInstanceStack should return same InstanceStack", iStack,
                test.getInstanceStack());
    }

    /**
     * Verify we can set an Id after we get an InstaceStack. Used to threw Exception, now valid.
     */
    @Test
    public void testSetIdWithInstanceStackSet() {
        ActionDef def = Mockito.mock(ActionDef.class);
        Action test = new MyAction(null, def, null);
        test.getInstanceStack();
        test.setId("newId");
    }
}
