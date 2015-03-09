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

import java.util.Collection;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;

import org.auraframework.adapter.JsonSerializerAdapter;
import org.auraframework.impl.AuraImpl;
import org.auraframework.system.AuraContext.Mode;
import org.auraframework.util.json.ClassMapJsonSerializationContext;
import org.auraframework.util.json.JsonSerializable;
import org.auraframework.util.json.JsonSerializer;
import org.auraframework.util.json.JsonSerializers;

import com.google.common.collect.ImmutableMap;
import com.google.common.collect.ImmutableMap.Builder;

/**
 * json serialization context for aura
 */
public class AuraJsonContext extends ClassMapJsonSerializationContext {
    private static Map<String, JsonSerializer<?>> SERIALIZERS_LOOKUP_MAP;
    private static final ConcurrentMap<String, JsonSerializer<?>> cache = new ConcurrentHashMap<>();
    private static Map<Class<?>, JsonSerializer<?>> SERIALIZERS_INSTANCE_MAP;   

    public static AuraJsonContext createContext(Mode mode, boolean refSupport) {
        return new AuraJsonContext(mode.prettyPrint(), refSupport);
    }

    private AuraJsonContext(boolean format, boolean refSupport) {
        super(getLookupMap(), getInstanceMap(), cache, format, refSupport, -1, -1);
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

    private static Map<String, JsonSerializer<?>> getLookupMap()  {
        buildSerializerMaps();
        return SERIALIZERS_LOOKUP_MAP;
    }

    private static Map<Class<?>, JsonSerializer<?>> getInstanceMap()  {
        buildSerializerMaps();
        return SERIALIZERS_INSTANCE_MAP;
    }

    private static synchronized void buildSerializerMaps() {
        if (SERIALIZERS_LOOKUP_MAP != null) {
            return;
        }
        Collection<JsonSerializerAdapter> adapters = AuraImpl.getJsonSerializerAdapters();
        Builder<String, JsonSerializer<?>> b = ImmutableMap.builder();
        Builder<Class<?>, JsonSerializer<?>> b2 = ImmutableMap.builder();
        for (JsonSerializerAdapter a : adapters) {
            b.putAll(a.lookupSerializers());
            b2.putAll(a.instanceofSerializers());
        }
        SERIALIZERS_LOOKUP_MAP = b.build();
        SERIALIZERS_INSTANCE_MAP = b2.build();
    }
}
