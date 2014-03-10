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

import java.io.IOException;

import java.util.List;
import java.util.Map;

import org.auraframework.Aura;
import org.auraframework.instance.Action;
import org.auraframework.instance.Event;
import org.auraframework.service.LoggingService;
import org.auraframework.service.ServerService;
import org.auraframework.system.AuraContext;
import org.auraframework.system.LoggingContext.KeyValueLogger;
import org.auraframework.system.Message;
import org.auraframework.throwable.AuraExecutionException;

import org.auraframework.util.json.Json;

public class ServerServiceImpl implements ServerService {

    private static final long serialVersionUID = -2779745160285710414L;

    @Override
    public void run(Message message, AuraContext context, Appendable out, Map<?,?> extras) throws IOException {
        LoggingService loggingService = Aura.getLoggingService();
        if (message == null) {
            return;
        }
        List<Action> actions = message.getActions();
        Json json = Json.createJsonStream(out, context.getJsonSerializationContext());
        try {
            json.writeMapBegin();
            if (extras != null && extras.size() > 0) {
                for (Map.Entry<?,?> entry : extras.entrySet()) {
                    json.writeMapEntry(entry.getKey(), entry.getValue());
                }
            }
            json.writeMapKey("actions");
            json.writeArrayBegin();
            run(actions, json);
            json.writeArrayEnd();

            loggingService.startTimer(LoggingService.TIMER_SERIALIZATION);
            loggingService.startTimer(LoggingService.TIMER_SERIALIZATION_AURA);
            try {
                json.writeMapEntry("context", context);
                List<Event> clientEvents = Aura.getContextService().getCurrentContext().getClientEvents();
                if (clientEvents != null && !clientEvents.isEmpty()) {
                    json.writeMapEntry("events", clientEvents);
                }
                json.writeMapEnd();
            } finally {
                loggingService.stopTimer(LoggingService.TIMER_SERIALIZATION_AURA);
                loggingService.stopTimer(LoggingService.TIMER_SERIALIZATION);
            }
        } finally {
            json.close();
        }
    }

    private void run(List<Action> actions, Json json) throws IOException {
        LoggingService loggingService = Aura.getLoggingService();
        AuraContext context = Aura.getContextService().getCurrentContext();
        for (Action action : actions) {
            StringBuffer actionAndParams = new StringBuffer(action.getDescriptor().getQualifiedName());
            KeyValueLogger logger = loggingService.getKeyValueLogger(actionAndParams);
            if (logger != null) {
                action.logParams(logger);
            }
            String aap = actionAndParams.toString();
            loggingService.startAction(aap);
            Action oldAction = context.setCurrentAction(action);
            try {
                // DCHASMAN TODO Look into a common base for Action
                // implementations that we can move the call to
                // context.setCurrentAction() into!
                action.run();
            } catch (AuraExecutionException x) {
                Aura.getExceptionAdapter().handleException(x, action);
            } finally {
                context.setCurrentAction(oldAction);
                loggingService.stopAction(aap);
            }
            loggingService.startTimer(LoggingService.TIMER_SERIALIZATION);
            loggingService.startTimer(LoggingService.TIMER_SERIALIZATION_AURA);
            try {
                json.writeArrayEntry(action);
            } finally {
                loggingService.stopTimer(LoggingService.TIMER_SERIALIZATION_AURA);
                loggingService.stopTimer(LoggingService.TIMER_SERIALIZATION);
            }

            List<Action> additionalActions = action.getActions();

            // Recursively process any additional actions created by the
            // action
            if (additionalActions != null && !additionalActions.isEmpty()) {
                run(additionalActions, json);
            }
        }
    }
}
