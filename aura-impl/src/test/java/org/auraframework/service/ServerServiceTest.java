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
package org.auraframework.service;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.concurrent.Future;
import java.util.concurrent.TimeUnit;

import org.auraframework.Aura;
import org.auraframework.def.ActionDef;
import org.auraframework.def.BaseComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.instance.Action;
import org.auraframework.system.AuraContext;
import org.auraframework.system.AuraContext.Format;
import org.auraframework.system.Message;
import org.auraframework.throwable.quickfix.QuickFixException;

import com.google.common.collect.Lists;
import com.google.common.collect.Maps;

/**
 * @hierarchy Aura.Services.ServerService
 * @userStory a07B0000000Eb3M
 */
public class ServerServiceTest extends BaseServiceTest<ServerService, ServerServiceTest.Config> implements
        ServerService {

    private static final long serialVersionUID = -5810328283514294579L;

    public ServerServiceTest(String name) {
        super(name);
    }

    @Override
    public List<Config> getConfigs() {
        List<Config> ret = Lists.newArrayList();

        Config config = new Config();
        ret.add(config);
        return permuteConfigs(ret);
    }

    public static class Config extends BaseServiceTest.Config {

    }

    private static final String action1 = "java://org.auraframework.impl.java.controller.JavaTestController/ACTION$getString";
    private static final String param1 = "world";
    private static final String action2 = "java://org.auraframework.impl.java.controller.JavaTestController/ACTION$getInt";
    private static final int param2 = 3;

    @Override
    public Message<?> run(Message<?> message, AuraContext context) throws QuickFixException, IOException {
        ContextService contextService = Aura.getContextService();
        Message<?> msg;
        Message<?> result;
        List<Action> actionList;
        Map<String, Object> params;
        List<Action> actions;
        Action action;
        try {
            AuraContext ctx = contextService.startContext(config.mode, config.format, config.access);

            // test single action request
            DefDescriptor<ActionDef> actionDescriptor = Aura.getDefinitionService().getDefDescriptor(action1,
                    ActionDef.class);
            actionList = Lists.newArrayList();
            params = Maps.newHashMap();

            params.put("param", param1);
            actionList.add((Action) Aura.getInstanceService().getInstance(actionDescriptor, params));

            msg = new Message<BaseComponentDef>(actionList);
            result = service.run(msg, ctx);

            actions = result.getActions();
            assertEquals(1, actions.size());
            action = actions.get(0);
            assertNotNull(action);
            assertEquals(Action.State.SUCCESS, action.getState());
            assertEquals(param1, action.getReturnValue());

            // test multiple action request
            params = Maps.newHashMap();

            params.put("param", param2);
            actionList.add((Action) Aura.getInstanceService().getInstance(
                    Aura.getDefinitionService().getDefDescriptor(action2, ActionDef.class), params));

            msg = new Message<BaseComponentDef>(actionList);
            result = service.run(msg, ctx);

            actions = result.getActions();
            assertEquals(2, actions.size());

            action = actions.get(0);
            assertNotNull(action);
            assertEquals(Action.State.SUCCESS, action.getState());
            assertEquals(param1, action.getReturnValue());

            action = actions.get(1);
            assertNotNull(action);
            assertEquals(Action.State.SUCCESS, action.getState());
            assertEquals(param2, action.getReturnValue());

        } finally {
            contextService.endContext();
        }
        return null;
    }

    @Override
    public Future<?> runAsync(Message<?> message, Appendable callback, AuraContext context) {
        int timeout = 5; // seconds
        ContextService contextService = Aura.getContextService();
        Message<?> msg;
        Message<?> expectedResult = null;
        List<Action> actionList;
        Map<String, Object> params;
        Appendable asyncCallback;
        Appendable expectedCallback;
        Future<?> result;

        try {
            AuraContext ctx = contextService.startContext(config.mode, config.format, config.access);

            // test single action
            DefDescriptor<ActionDef> actionDescriptor = Aura.getDefinitionService().getDefDescriptor(action1,
                    ActionDef.class);
            actionList = Lists.newArrayList();
            params = Maps.newHashMap();
            params.put("param", param1);

            try {
                actionList.add((Action) Aura.getInstanceService().getInstance(actionDescriptor, params));
            } catch (Exception x) {
                x.printStackTrace();
                fail();
            }

            msg = new Message<BaseComponentDef>(actionList);
            asyncCallback = new StringBuilder();
            expectedCallback = new StringBuilder();

            Format format = Aura.getContextService().getCurrentContext().getFormat();
            try {
                expectedResult = service.run(msg, ctx);
                Aura.getSerializationService().writeCollection(expectedResult.getActions(), Action.class,
                        expectedCallback);
            } catch (Exception x) {
                if (format == Format.JSON) {
                    x.printStackTrace();
                    fail("Exception while serializing synchronous result.");
                }
            }

            result = service.runAsync(msg, asyncCallback, ctx);
            try {
                result.get(timeout, TimeUnit.SECONDS);
            } catch (Exception x) {
                if (format == Format.JSON) {
                    x.printStackTrace();
                    fail("Exception while getting asynchronous Future.");
                }
            }
            assertEquals(expectedCallback.toString(), asyncCallback.toString());

            // test multiple actions
            params = Maps.newHashMap();

            params.put("param", param2);
            try {
                actionList.add((Action) Aura.getInstanceService().getInstance(
                        Aura.getDefinitionService().getDefDescriptor(action2, ActionDef.class), params));
            } catch (Exception x) {
                x.printStackTrace();
                fail();
            }

            msg = new Message<BaseComponentDef>(actionList);
            asyncCallback = new StringBuilder();
            expectedCallback = new StringBuilder();

            try {
                expectedResult = service.run(msg, ctx);
                Aura.getSerializationService().writeCollection(expectedResult.getActions(), Action.class,
                        expectedCallback);
            } catch (Exception x) {
                if (format == Format.JSON) {
                    x.printStackTrace();
                    fail("Exception while serializing synchronous result.");
                }
            }

            result = service.runAsync(msg, asyncCallback, ctx);
            try {
                result.get(timeout, TimeUnit.SECONDS);
            } catch (Exception x) {
                if (format == Format.JSON) {
                    x.printStackTrace();
                    fail("Exception while getting asynchronous Future.");
                }
            }
            assertEquals(expectedCallback.toString(), asyncCallback.toString());
        } finally {
            contextService.endContext();
        }
        return null;

    }

}
