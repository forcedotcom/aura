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
package org.auraframework.impl.adapter;

import java.io.IOException;
import java.math.BigDecimal;
import java.util.Map;

import org.auraframework.Aura;
import org.auraframework.adapter.JsonSerializerAdapter;
import org.auraframework.impl.context.AuraContextImpl;
import org.auraframework.impl.java.controller.JavaAction;
import org.auraframework.instance.Action;
import org.auraframework.system.AuraContext.Mode;
import org.auraframework.system.Location;
import org.auraframework.throwable.AuraExceptionUtil;
import org.auraframework.util.AuraLocale;
import org.auraframework.util.json.Json;
import org.auraframework.util.json.JsonSerializable;
import org.auraframework.util.json.JsonSerializer;
import org.auraframework.util.json.JsonSerializer.NoneSerializer;
import org.auraframework.util.json.JsonSerializers;

import com.google.common.collect.Maps;

/**
 * the basics
 */
public class JsonSerializerAdapterImpl implements JsonSerializerAdapter {

    @Override
    public Map<String, JsonSerializer<?>> lookupSerializers() {
        Map<String, JsonSerializer<?>> m = Maps.newLinkedHashMap();
        m.putAll(JsonSerializers.MAPPY_FASTY);
        m.put(AuraContextImpl.class.getName(), AuraContextImpl.FULL_SERIALIZER);
        m.put(JavaAction.class.getName(), Action.SERIALIZER);
        m.put(BigDecimal.class.getName(), JsonSerializers.BIGDECIMAL);
        return m;
    }

    @Override
    public Map<Class<?>, JsonSerializer<?>> instanceofSerializers() {
        Map<Class<?>, JsonSerializer<?>> m = Maps.newHashMap();
        m.putAll(JsonSerializers.MAPPY_SLOWY);
        m.put(Throwable.class, THROWABLE);
        m.put(Location.class, LOCATION);
        m.put(AuraLocale.class, LOCALE);
        return m;
    }

    public static final ThrowableSerializer THROWABLE = new ThrowableSerializer();

    public static class ThrowableSerializer extends NoneSerializer<Throwable> {
        @Override
        public void serialize(Json json, Throwable value) throws IOException {
            if (value instanceof JsonSerializable) {
                ((JsonSerializable) value).serialize(json);
            } else {
                json.writeMapBegin();
                json.writeMapEntry("message", value.getMessage());
                if (Aura.getContextService().isEstablished()
                        && Aura.getContextService().getCurrentContext().getMode() != Mode.PROD) {
                    json.writeMapEntry("stack", AuraExceptionUtil.getStackTrace(value));
                }
                json.writeMapEnd();
            }
        }
    }

    public static final LocationSerializer LOCATION = new LocationSerializer();

    public static class LocationSerializer extends NoneSerializer<Location> {
        @Override
        public void serialize(Json json, Location value) throws IOException {
            json.writeString(value);
        }
    }

    public static final LocaleSerializer LOCALE = new LocaleSerializer();

    public static class LocaleSerializer extends NoneSerializer<AuraLocale> {
        @Override
        public void serialize(Json json, AuraLocale value) throws IOException {
            json.writeString(value);
        }
    }
}
