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

import java.util.Map;
import java.util.concurrent.ConcurrentMap;

import org.auraframework.adapter.JsonSerializerAdapter;
import org.auraframework.impl.AuraImplTestCase;
import org.auraframework.service.LoggingService;
import org.auraframework.util.json.JsonSerializer;
import org.auraframework.util.test.util.AuraPrivateAccessor;
import org.junit.Test;
import org.mockito.Mock;
import org.mockito.Mockito;

import com.google.common.collect.Lists;
import com.google.common.collect.Maps;

public class AuraJsonSerializerFactoryTest extends AuraImplTestCase {
    @Mock
    LoggingService loggingService;

    @Mock
    JsonSerializerAdapter jsonSerializerAdapter;

    @Test
    public void testFindLookupSerializer() {
        Map<String,JsonSerializer<?>> map = Maps.newHashMap();
        JsonSerializer<?> serializer = Mockito.mock(JsonSerializer.class);
        String object = "object";
        map.put(object.getClass().getName(), serializer);
        Mockito.when(jsonSerializerAdapter.lookupSerializers()).thenReturn(map);
        Mockito.when(jsonSerializerAdapter.instanceofSerializers()).thenReturn(Maps.newHashMap());

        AuraJsonSerializerFactory factory = new AuraJsonSerializerFactory();
        factory.setLoggingService(loggingService);
        factory.setJsonSerializerAdapters(Lists.newArrayList(jsonSerializerAdapter));

        assertEquals("Should get the provided lookup serializer", serializer, factory.getSerializer(object));
    }

    @Test
    public void testDontFindMissingLookupSerializer() {
        Map<String,JsonSerializer<?>> map = Maps.newHashMap();
        JsonSerializer<?> serializer = Mockito.mock(JsonSerializer.class);
        String object = "object";
        map.put("thisisseriouslynotaname", serializer);
        Mockito.when(jsonSerializerAdapter.lookupSerializers()).thenReturn(map);
        Mockito.when(jsonSerializerAdapter.instanceofSerializers()).thenReturn(Maps.newHashMap());

        AuraJsonSerializerFactory factory = new AuraJsonSerializerFactory();
        factory.setLoggingService(loggingService);
        factory.setJsonSerializerAdapters(Lists.newArrayList(jsonSerializerAdapter));

        assertEquals("Should get null", null, factory.getSerializer(object));
    }

    @Test
    public void testFindInstanceSerializer() {
        Map<Class<?>,JsonSerializer<?>> map = Maps.newHashMap();
        JsonSerializer<?> serializer = Mockito.mock(JsonSerializer.class);
        String object = "object";
        map.put(Object.class, serializer);
        Mockito.when(jsonSerializerAdapter.instanceofSerializers()).thenReturn(map);
        Mockito.when(jsonSerializerAdapter.lookupSerializers()).thenReturn(Maps.newHashMap());

        AuraJsonSerializerFactory factory = new AuraJsonSerializerFactory();
        factory.setLoggingService(loggingService);
        factory.setJsonSerializerAdapters(Lists.newArrayList(jsonSerializerAdapter));

        assertEquals("Should get the provided lookup serializer", serializer, factory.getSerializer(object));
    }

    @Test
    public void testDontFindMissingInstanceSerializer() {
        Map<Class<?>,JsonSerializer<?>> map = Maps.newHashMap();
        @SuppressWarnings("unchecked")
        JsonSerializer<Object> serializer = Mockito.mock(JsonSerializer.class);
        String object = "object";
        map.put(this.getClass(), serializer);
        Mockito.when(jsonSerializerAdapter.instanceofSerializers()).thenReturn(map);
        Mockito.when(jsonSerializerAdapter.lookupSerializers()).thenReturn(Maps.newHashMap());

        AuraJsonSerializerFactory factory = new AuraJsonSerializerFactory();
        factory.setLoggingService(loggingService);
        factory.setJsonSerializerAdapters(Lists.newArrayList(jsonSerializerAdapter));

        assertEquals("Should get null", null, factory.getSerializer(object));
    }

    @Test
    public void testLookupSerializerIsCached() throws Exception {
        Map<String,JsonSerializer<?>> map = Maps.newHashMap();
        JsonSerializer<?> serializer = Mockito.mock(JsonSerializer.class);
        String object = "object";
        map.put(object.getClass().getName(), serializer);
        Mockito.when(jsonSerializerAdapter.lookupSerializers()).thenReturn(map);
        Mockito.when(jsonSerializerAdapter.instanceofSerializers()).thenReturn(Maps.newHashMap());

        AuraJsonSerializerFactory factory = new AuraJsonSerializerFactory();
        factory.setLoggingService(loggingService);
        factory.setJsonSerializerAdapters(Lists.newArrayList(jsonSerializerAdapter));

        assertEquals("Should get the provided lookup serializer", serializer, factory.getSerializer(object));

        ConcurrentMap<String, JsonSerializer<?>> cache = AuraPrivateAccessor.get(factory, "cache");
        assertEquals("Serializer should be cached", serializer, cache.get(object.getClass().getName()));
    }

    @Test
    public void testInstanceOfSerializerIsCached() throws Exception {
        Map<String,JsonSerializer<?>> map = Maps.newHashMap();
        JsonSerializer<?> serializer = Mockito.mock(JsonSerializer.class);
        String object = "object";
        map.put(object.getClass().getName(), serializer);
        Mockito.when(jsonSerializerAdapter.lookupSerializers()).thenReturn(map);
        Mockito.when(jsonSerializerAdapter.instanceofSerializers()).thenReturn(Maps.newHashMap());

        AuraJsonSerializerFactory factory = new AuraJsonSerializerFactory();
        factory.setLoggingService(loggingService);
        factory.setJsonSerializerAdapters(Lists.newArrayList(jsonSerializerAdapter));

        assertEquals("Should get the provided lookup serializer", serializer, factory.getSerializer(object));

        ConcurrentMap<String, JsonSerializer<?>> cache = AuraPrivateAccessor.get(factory, "cache");
        assertEquals("Serializer should be cached", serializer, cache.get(object.getClass().getName()));
    }

    @Test
    public void testNotFoundIsCached() throws Exception {
        Map<String,JsonSerializer<?>> map = Maps.newHashMap();
        JsonSerializer<?> serializer = Mockito.mock(JsonSerializer.class);
        String object = "object";
        map.put("thisisseriouslynotaname", serializer);
        Mockito.when(jsonSerializerAdapter.lookupSerializers()).thenReturn(map);
        Mockito.when(jsonSerializerAdapter.instanceofSerializers()).thenReturn(Maps.newHashMap());

        AuraJsonSerializerFactory factory = new AuraJsonSerializerFactory();
        factory.setLoggingService(loggingService);
        factory.setJsonSerializerAdapters(Lists.newArrayList(jsonSerializerAdapter));

        assertEquals("Should get null", null, factory.getSerializer(object));

        ConcurrentMap<String, JsonSerializer<?>> cache = AuraPrivateAccessor.get(factory, "cache");
        assertNotNull("Serializer (null) should be cached", cache.get(object.getClass().getName()));
    }
}
