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
package org.auraframework.impl;

import java.util.List;

import org.auraframework.Aura;
import org.auraframework.def.BaseComponentDef;
import org.auraframework.instance.Action;
import org.auraframework.instance.Event;
import org.auraframework.service.LoggingService;
import org.auraframework.service.ServerService;
import org.auraframework.system.AuraContext;
import org.auraframework.system.LoggingContext.KeyValueLogger;
import org.auraframework.system.Message;
import org.auraframework.throwable.AuraExecutionException;

import com.google.common.collect.Lists;

public class ServerServiceImpl implements ServerService {

    private static final long serialVersionUID = -2779745160285710414L;

    @Override
    public Message<?> run(final Message<?> message, final AuraContext context) {
        Message<?> ret = null;

        if (message != null) {
            List<Action> actions = message.getActions();
            List<Event> clientEvents = Aura.getContextService().getCurrentContext().getClientEvents();
            actions = run(actions);
            ret = new Message<BaseComponentDef>(actions, clientEvents);
        }

        return ret;
    }

    private static List<Action> run(List<Action> actions) {
        LoggingService loggingService = Aura.getLoggingService();
        List<Action> result = Lists.newArrayList();
        for (Action action : actions) {
            StringBuffer actionAndParams = new StringBuffer(action.getDescriptor().getQualifiedName());
            KeyValueLogger logger = loggingService.getKeyValueLogger(actionAndParams);
            if (logger != null) {
                action.logParams(logger);
            }
            try {
                loggingService.startAction(actionAndParams.toString());

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
                loggingService.stopAction(actionAndParams.toString());
            }
        }

        return result;
    }
}
