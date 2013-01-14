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
package org.auraframework.impl.adapter.format.json;

import java.io.IOException;
import java.io.Reader;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.annotation.concurrent.ThreadSafe;

import org.auraframework.Aura;
import org.auraframework.def.ActionDef;
import org.auraframework.def.ComponentDef;
import org.auraframework.instance.Action;
import org.auraframework.instance.Event;
import org.auraframework.system.AuraContext;
import org.auraframework.system.Message;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.json.Json;
import org.auraframework.util.json.JsonReader;

import com.google.common.collect.Lists;

/**
 */
@ThreadSafe
public class MessageJSONFormatAdapter extends JSONFormatAdapter<Message<?>> {

    @SuppressWarnings("rawtypes")
    @Override
    public Class<Message> getType() {
        return Message.class;
    }

    @SuppressWarnings("unchecked")
    @Override
    public Message<?> read(Reader in) throws IOException, QuickFixException {
        Map<?, ?> message = (Map<?, ?>) new JsonReader().read(in);

        List<?> actions = (List<?>) message.get("actions");
        List<Action> actionList = Lists.newArrayList();
        if (actions != null) {
            for (Object action : actions) {
                Map<?, ?> map = (Map<?, ?>) action;

                // FIXME: ints are getting translated into BigDecimals here.
                Map<String, Object> params = (Map<String, Object>) map.get("params");

                Action instance = (Action) Aura.getInstanceService().getInstance((String) map.get("descriptor"),
                        ActionDef.class, params);
                instance.setId((String) map.get("id"));

                actionList.add(instance);
            }
        }

        return new Message<ComponentDef>(actionList, null, null);
    }

    @Override
    public void write(Object value, Map<String, Object> attributes, Appendable out) throws IOException {
        Message<?> message = (Message<?>) value;
        AuraContext c = Aura.getContextService().getCurrentContext();
        Map<String, Object> m = new HashMap<String, Object>();
        m.put("actions", message.getActions());
        m.put("context", c);
        List<Event> clientEvents = message.getClientEvents();
        if (clientEvents != null && !clientEvents.isEmpty()) {
            m.put("events", clientEvents);
        }

        Json.serialize(m, out, c.getJsonSerializationContext());
    }

}
