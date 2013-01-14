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
import java.util.Map;

import javax.annotation.concurrent.ThreadSafe;

import org.auraframework.Aura;
import org.auraframework.throwable.ClientSideEventException;
import org.auraframework.util.json.Json;
import org.auraframework.util.json.JsonSerializationContext;

import com.google.common.collect.Maps;

@ThreadSafe
public class ClientSideEventExceptionJSONFormatAdapter extends JSONFormatAdapter<ClientSideEventException> {

    @Override
    public Class<ClientSideEventException> getType() {
        return ClientSideEventException.class;
    }

    @Override
    public void write(Object value, Map<String, Object> attributes, Appendable out) throws IOException {
        ClientSideEventException e = (ClientSideEventException) value;
        JsonSerializationContext jsonCxt = Aura.getContextService().getCurrentContext().getJsonSerializationContext();
        Map<String, Object> serialized = Maps.newHashMap();
        serialized.put("exceptionEvent", Boolean.TRUE);
        serialized.put("event", e.getEvent());
        if (jsonCxt != null && jsonCxt.format()) {
            serialized.put("defaultHandler", e.getDefaultHandler());
        } else {
            serialized.put("defaultHandler", e.getDefaultHandler() == null ? null : e.getDefaultHandler().toString());
        }
        Json.serialize(serialized, out, jsonCxt);
    }

}
