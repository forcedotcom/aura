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
package org.auraframework.impl.adapter.format.json;

import java.io.IOException;
import java.io.Reader;
import java.util.Collection;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.auraframework.Aura;
import org.auraframework.def.ActionDef;
import org.auraframework.instance.Action;
import org.auraframework.system.AuraContext;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.json.Json;
import org.auraframework.util.json.JsonReader;

import com.google.common.collect.Lists;

/**
 */
public class ActionJSONFormatAdapter extends JSONFormatAdapter<Action> {

    @Override
    public Class<Action> getType() {
        return Action.class;
    }

    @Override
    public Collection<Action> readCollection(Reader in) throws IOException, QuickFixException {
        Map<?, ?> message = (Map<?, ?>) new JsonReader().read(in);
        List<?> actions = (List<?>) message.get("actions");
        List<Action> ret = Lists.newArrayList();
        for (Object action : actions) {
            Map<?, ?> map = (Map<?, ?>) action;

            // FIXME: ints are getting translated into BigDecimals here.
            @SuppressWarnings("unchecked")
            Map<String, Object> params = (Map<String, Object>) map.get("params");

            Action instance = (Action) Aura.getInstanceService().getInstance((String) map.get("descriptor"),
                    ActionDef.class, params);
            instance.setId((String) map.get("id"));

            ret.add(instance);
        }
        return ret;
    }

    @Override
    public Action read(Reader in) throws IOException, QuickFixException {
        Map<?, ?> map = (Map<?, ?>) new JsonReader().read(in);
        @SuppressWarnings("unchecked")
        Map<String, Object> params = (Map<String, Object>) map.get("params");
        return (Action) Aura.getInstanceService().getInstance((String) map.get("descriptor"), ActionDef.class, params);
    }

    @Override
    public void writeCollection(Collection<? extends Action> values, Appendable out) throws IOException {
        AuraContext c = Aura.getContextService().getCurrentContext();
        Map<String, Object> m = new HashMap<String, Object>();
        m.put("actions", values);
        m.put("context", c);
        Json.serialize(m, out, c.getJsonSerializationContext());
    }

}
