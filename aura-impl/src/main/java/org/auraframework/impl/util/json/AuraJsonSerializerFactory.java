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

import javax.annotation.PostConstruct;
import javax.inject.Inject;

import org.auraframework.adapter.JsonSerializerAdapter;
import org.auraframework.annotations.Annotations.ServiceComponent;
import org.auraframework.service.LoggingService;
import org.auraframework.util.json.DefaultJsonSerializer;
import org.auraframework.util.json.JsonSerializer;
import org.auraframework.util.json.JsonSerializerFactory;

import com.google.common.collect.ImmutableMap;

/**
 * Retrieves Json Serializers
 */
@ServiceComponent
public class AuraJsonSerializerFactory implements JsonSerializerFactory {

    private Map<String, JsonSerializer<?>> SERIALIZERS_LOOKUP_MAP;
    private Map<Class<?>, JsonSerializer<?>> SERIALIZERS_INSTANCE_MAP;
    private final ConcurrentMap<String, JsonSerializer<?>> cache = new ConcurrentHashMap<>();
    private final JsonSerializer<?> NOT_FOUND = new DefaultJsonSerializer();
    private final Object lock = new Object();

    private LoggingService loggingService;
    
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
        String className = c.getName();
        JsonSerializer<T> s = (JsonSerializer<T>) cache.get(className);
        if (s != null) {
            return (s != NOT_FOUND)? s : null;
        }

        if (SERIALIZERS_INSTANCE_MAP == null) {
            initSerializerMaps();
        }

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

        cache.putIfAbsent(className, NOT_FOUND);
        loggingService.info("no JsonSerializer found for:" + className);
        return null;
    }

    /**
     * @return the loggingService
     */
    public LoggingService getLoggingService() {
        return loggingService;
    }

    /**
     * @param loggingService the loggingService to set
     */
    @Inject
    public void setLoggingService(LoggingService loggingService) {
        this.loggingService = loggingService;
    }

    /**
     * @return the jsonSerializerAdapters
     */
    public Collection<JsonSerializerAdapter> getJsonSerializerAdapters() {
        return jsonSerializerAdapters;
    }

    /**
     * @param jsonSerializerAdapters the jsonSerializerAdapters to set
     */
    @Inject
    public void setJsonSerializerAdapters(Collection<JsonSerializerAdapter> jsonSerializerAdapters) {
        this.jsonSerializerAdapters = jsonSerializerAdapters;
    }
}
