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

import com.google.common.collect.ImmutableMap;
import org.auraframework.adapter.JsonSerializerAdapter;
import org.auraframework.annotations.Annotations.ServiceComponent;
import org.auraframework.util.json.JsonSerializer;
import org.auraframework.util.json.JsonSerializerFactory;

import javax.annotation.PostConstruct;
import javax.inject.Inject;
import java.util.Collection;
import java.util.Map;

import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;

/**
 * Retrieves Json Serializers
 */
@ServiceComponent
public class AuraJsonSerializerFactory implements JsonSerializerFactory {

    private static Map<String, JsonSerializer<?>> SERIALIZERS_LOOKUP_MAP;
    private static Map<Class<?>, JsonSerializer<?>> SERIALIZERS_INSTANCE_MAP;
    private static final ConcurrentMap<String, JsonSerializer<?>> cache = new ConcurrentHashMap<>();
    private static final Object lock = new Object();

    @Inject
    private Collection<JsonSerializerAdapter> jsonSerializerAdapters;

    @PostConstruct
    private void initSerializerMaps() {
        synchronized (lock) {
            if (SERIALIZERS_LOOKUP_MAP != null) {
                return;
            }
            ImmutableMap.Builder<String, JsonSerializer<?>> b = ImmutableMap.builder();
            ImmutableMap.Builder<Class<?>, JsonSerializer<?>> b2 = ImmutableMap.builder();
            for (JsonSerializerAdapter a : jsonSerializerAdapters) {
                b.putAll(a.lookupSerializers());
                b2.putAll(a.instanceofSerializers());
            }
            SERIALIZERS_LOOKUP_MAP = b.build();
            SERIALIZERS_INSTANCE_MAP = b2.build();
        }
    }

    @Override
    @SuppressWarnings("unchecked")
    public <T> JsonSerializer<T> getSerializer(T o) {
        Class<?> c = o.getClass();
        JsonSerializer<T> s = (JsonSerializer<T>) cache.get(c.getName());
        if (s != null) {
            return s;
        }

        if (SERIALIZERS_INSTANCE_MAP == null) {
            initSerializerMaps();
        }

        String className = c.getName();
        s = (JsonSerializer<T>) SERIALIZERS_LOOKUP_MAP.get(className);
        if (s != null) {
            cache.putIfAbsent(className, s);
            return s;
        }

        for (Map.Entry<Class<?>, JsonSerializer<?>> e : SERIALIZERS_INSTANCE_MAP.entrySet()) {
            if (e.getKey().isAssignableFrom(c)) {
                s = (JsonSerializer<T>) e.getValue();
                cache.putIfAbsent(className, s);
                return s;
            }
        }
        return null;
    }
}
