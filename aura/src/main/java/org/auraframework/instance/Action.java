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
package org.auraframework.instance;

import java.io.IOException;
import java.util.List;
import java.util.Map;

import org.auraframework.def.ActionDef;
import org.auraframework.throwable.AuraExecutionException;
import org.auraframework.util.javascript.Literal;
import org.auraframework.util.json.Json;
import org.auraframework.util.json.JsonSerializer.NoneSerializer;


/**
 */
public interface Action extends Instance<ActionDef> {

    public enum State{
        ABORTED,
        ERROR,
        NEW,
        RUNNING,
        SUCCESS
    }

    public String getId();
    public void setId(String id);

    public void run() throws AuraExecutionException;

    public void add(List<Action> actions);
    public List<Action> getActions();

    public Object getReturnValue();

    public State getState();

    public List<Object> getErrors();

    public static final Serializer SERIALIZER = new Serializer();

    public static class Serializer extends NoneSerializer<Action> {

        @Override
        public void serialize(Json json, Action action) throws IOException {
            // This is a temporary fix to allow server-side actions to return null and have the value serialized to the client.
            // Ideally I think Serializers should have a flag that determines whether null values should be serialized.
            // The reason I'm not adding that now is because it would add an extra call to getSerializer() in Json.java, which,
            // because JsonSerializationContext does not have caching by type, could be slow.  To summarize, we should:
            // 1) add Serializer caching
            // 2) add shouldSerializeNulls hook
            // 3) get rid of this hacky workaround
            // Hoo-rah.
            Object returnValue = action.getReturnValue();
            if (returnValue == null) {
                returnValue = Literal.NULL;
            }

            json.writeMapBegin();
            
            json.writeMapEntry("id" , action.getId());
            json.writeMapEntry("state" , action.getState());
            json.writeMapEntry("returnValue", returnValue);
            json.writeMapEntry("error", action.getErrors());
            
            Map<String, BaseComponent<?, ?>> components = action.getComponents();
            if (!components.isEmpty()) {
                json.writeMapKey("components");
                json.writeMapBegin();

                for (BaseComponent<?, ?> component : components.values()) {
                    if (component.hasLocalDependencies()) {
                        json.writeMapEntry(component.getGlobalId(), component);
                    }
                }

                json.writeMapEnd();
            }
            
            json.writeMapEnd();
        }

    }

	public void registerComponent(BaseComponent<?, ?> component);
	public Map<String, BaseComponent<?, ?>> getComponents();
}
