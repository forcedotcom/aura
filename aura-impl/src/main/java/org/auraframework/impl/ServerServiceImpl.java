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
package org.auraframework.impl;

import java.io.IOException;
import java.util.List;
import java.util.concurrent.Callable;
import java.util.concurrent.Future;
import java.util.concurrent.ScheduledThreadPoolExecutor;

import org.auraframework.Aura;
import org.auraframework.def.ActionDef;
import org.auraframework.def.BaseComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.instance.Action;
import org.auraframework.instance.Event;
import org.auraframework.service.ContextService;
import org.auraframework.service.DefinitionService;
import org.auraframework.service.LoggingService;
import org.auraframework.service.SerializationService;
import org.auraframework.service.ServerService;
import org.auraframework.system.AuraContext;
import org.auraframework.system.Message;
import org.auraframework.throwable.AuraExecutionException;
import org.auraframework.throwable.quickfix.DefinitionNotFoundException;
import org.auraframework.throwable.quickfix.QuickFixException;

import com.google.common.collect.Lists;

/**
 */
public class ServerServiceImpl implements ServerService {

    /**
     */
    private static final long serialVersionUID = -2779745160285710414L;
    private final ScheduledThreadPoolExecutor executor = new ScheduledThreadPoolExecutor(30);

    @Override
    public Message<?> run(final Message<?> message, final AuraContext context) {
        Message<?> ret = null;

        if (message != null) {
            List<Action> actions = message.getActions();
            List<Event> clientEvents = Aura.getContextService().getCurrentContext().getClientEvents();
            actions = run(actions);
            ret = new Message<BaseComponentDef>(actions, clientEvents, null, null);
        }

        return ret;
    }

    /*
     * Pop quiz: This method is: a) gross, and the reason Message has a generic
     * b) temporary c) named as such to make you want to remove it d) will help
     * make Message's signature much nicer with its removal e) all of the above.
     * ǝ :ɹǝʍsuɐ The dream is that there will be a standard controller for
     * getting Defs. This will be replaced with an Action that hits the
     * controller. That way, GETs and POSTs look the same--everything is an
     * Action, and that's all Message needs to care about.
     */
    @Override
    public <T extends BaseComponentDef> Message<T> temporaryGet(final Message<T> message, final AuraContext context)
            throws DefinitionNotFoundException, QuickFixException {
        DefinitionService definitionService = Aura.getDefinitionService();

        DefDescriptor<T> defDescriptor = message.getDefDescriptor();
        T def = definitionService.getDefinition(defDescriptor);
        return new Message<T>(null, null, def);
    }

    @Override
    public Future<?> runAsync(final Message<?> message, final Appendable callback, final AuraContext context) {

        return executor.submit(new Callable<Boolean>() {
            @Override
            public Boolean call() throws IOException, QuickFixException {
                SerializationService serializationService = Aura.getSerializationService();
                ContextService contextService = Aura.getContextService();
                try {
                    contextService.startContext(context.getMode(), context.getFormat(), context.getAccess());

                    if (message != null) {
                        List<Action> actions = message.getActions();

                        actions = ServerServiceImpl.run(actions);

                        serializationService.writeCollection(actions, Action.class, callback);
                    }
                } finally {
                    contextService.endContext();
                }
                return true;
            }
        });

    }

    private static List<Action> run(List<Action> actions) {
        LoggingService loggingService = Aura.getLoggingService();
        List<Action> result = Lists.newArrayList();
        for (Action action : actions) {
            DefDescriptor<ActionDef> defDes = action.getDescriptor();
            try {
                loggingService.startTimer(LoggingService.TIMER_ACTION + defDes.getQualifiedName());

                // Always include the action in the result
                result.add(action);

                AuraContext context = Aura.getContextService().getCurrentContext();
                Action oldAction = context.setCurrentAction(action);
                try {
                    // DCHASMAN TODO Look into a common base for Action
                    // implementations that we can move the call to
                    // context.setCurrentAction() into!
                    action.run();
                } finally {
                    context.setCurrentAction(oldAction);
                }

                List<Action> additionalActions = action.getActions();

                // Recursively process any additional actions created by the
                // action
                if (additionalActions != null && !additionalActions.isEmpty()) {
                    result.addAll(run(additionalActions));
                }
            } catch (AuraExecutionException x) {
                Aura.getExceptionAdapter().handleException(x, action);
            } finally {
                loggingService.stopTimer(LoggingService.TIMER_ACTION + defDes.getQualifiedName());
            }
        }

        return result;
    }
}
