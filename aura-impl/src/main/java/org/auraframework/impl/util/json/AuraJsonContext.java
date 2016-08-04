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
package org.auraframework.impl.util.json;

import org.auraframework.system.AuraContext.Mode;
import org.auraframework.util.json.ClassMapJsonSerializationContext;
import org.auraframework.util.json.JsonSerializable;
import org.auraframework.util.json.JsonSerializer;
import org.auraframework.util.json.JsonSerializerFactory;
import org.auraframework.util.json.JsonSerializers;

/**
 * json serialization context for aura
 */
public class AuraJsonContext extends ClassMapJsonSerializationContext {

    public static AuraJsonContext createContext(Mode mode, boolean refSupport, JsonSerializerFactory factory) {
        return new AuraJsonContext(mode.prettyPrint(), refSupport, factory);
    }

    private AuraJsonContext(boolean format, boolean refSupport, JsonSerializerFactory factory) {
        super(factory, format, refSupport, -1, -1);
    }

    @Override
    @SuppressWarnings("unchecked")
    public <T> JsonSerializer<T> getSerializer(T o) {
        JsonSerializer<T> s = super.getSerializer(o);
        // try the old way until we stop using it
        if (s == null && o instanceof JsonSerializable) {
            // System.out.println("bah old serializer: " + c.getName());
            s = (JsonSerializer<T>) JsonSerializers.OLD;
        }
        return s;
    }
}
