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
package org.auraframework.impl.util.json;

import java.util.Collection;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;

import com.google.common.collect.ImmutableMap;
import com.google.common.collect.ImmutableMap.Builder;

import org.auraframework.adapter.JsonSerializerAdapter;
import org.auraframework.impl.AuraImpl;
import org.auraframework.system.AuraContext.Mode;
import org.auraframework.util.json.*;

/**
 * json serialization context for aura
 */
public class AuraJsonContext extends ClassMapJsonSerializationContext {
    private static final Map<String, JsonSerializer<?>> mappyFasty;
    private static final ConcurrentMap<String, JsonSerializer<?>> cache = new ConcurrentHashMap<String, JsonSerializer<?>>();
    private static final Map<Class<?>, JsonSerializer<?>> mappySlowly;

    static {
        Collection<JsonSerializerAdapter> adapters = AuraImpl.getJsonSerializerAdapters();
        Builder<String, JsonSerializer<?>> b = ImmutableMap.builder();
        Builder<Class<?>, JsonSerializer<?>> b2 = ImmutableMap.builder();
        for (JsonSerializerAdapter a : adapters) {
            b.putAll(a.lookupSerializers());
            b2.putAll(a.instanceofSerializers());
        }
        mappyFasty = b.build();
        mappySlowly = b2.build();
    }

    public static AuraJsonContext createContext(Mode mode, boolean refSupport) {
        return new AuraJsonContext(mode.prettyPrint(), refSupport);
    }

    private AuraJsonContext(boolean format, boolean refSupport) {
        super(mappyFasty, mappySlowly, cache, format, refSupport, -1, -1);
    }

    @Override
    @SuppressWarnings("unchecked")
    public <T> JsonSerializer<T> getSerializer(T o) {
        JsonSerializer<T> s = super.getSerializer(o);
        // try the old way until we stop using it
        if (s == null && o instanceof JsonSerializable) {
            //System.out.println("bah old serializer: " + c.getName());
            s = (JsonSerializer<T>) JsonSerializers.OLD;
        }
        return s;
    }

}
