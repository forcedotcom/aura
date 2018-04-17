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

import org.auraframework.adapter.ConfigAdapter;
import org.auraframework.adapter.JsonSerializerAdapter;
import org.auraframework.annotations.Annotations.ServiceComponent;
import org.auraframework.impl.context.AuraContextImpl;
import org.auraframework.impl.context.AuraContextJsonSerializer;
import org.auraframework.impl.java.controller.JavaAction;
import org.auraframework.instance.Action;
import org.auraframework.instance.ActionWithKeyOverride;
import org.auraframework.service.ContextService;
import org.auraframework.service.DefinitionService;
import org.auraframework.system.AuraContext.Mode;
import org.auraframework.system.Location;
import org.auraframework.test.TestContextAdapter;
import org.auraframework.throwable.AuraExceptionUtil;
import org.auraframework.util.AuraLocale;
import org.auraframework.util.json.Json;
import org.auraframework.util.json.JsonSerializable;
import org.auraframework.util.json.JsonSerializer;
import org.auraframework.util.json.JsonSerializers.NoneSerializer;
import org.auraframework.util.json.JsonSerializers;
import org.springframework.beans.factory.annotation.Autowired;

import com.google.common.collect.Maps;

import javax.inject.Inject;

/**
 * the basics
 */
@ServiceComponent
public class JsonSerializerAdapterImpl implements JsonSerializerAdapter {

    private AuraContextJsonSerializer auraContextJsonSerializer;
    private ThrowableSerializer throwableSerializer;
    private Map<String, JsonSerializer<?>> lookupSerializers;
    private Map<Class<?>, JsonSerializer<?>> instanceofSerializers;

    @Inject
    private ConfigAdapter configAdapter;

    @Inject
    private ContextService contextService;

    @Inject
    private DefinitionService definitionService;

    @Autowired(required=false)
    private TestContextAdapter testContextAdapter;

    @Override
    public Map<String, JsonSerializer<?>> lookupSerializers() {
        if (lookupSerializers == null) {
            lookupSerializers = Maps.newLinkedHashMap();
            lookupSerializers.putAll(JsonSerializers.MAPPY_FASTY);
            lookupSerializers.put(AuraContextImpl.class.getName(),
                    getAuraContextJsonSerializer(configAdapter, testContextAdapter, definitionService));
            lookupSerializers.put(JavaAction.class.getName(), Action.SERIALIZER);
            lookupSerializers.put(ActionWithKeyOverride.class.getName(), Action.SERIALIZER);
            lookupSerializers.put(BigDecimal.class.getName(), JsonSerializers.BIGDECIMAL);
        }
        return lookupSerializers;
    }

    @Override
    public Map<Class<?>, JsonSerializer<?>> instanceofSerializers() {
        if (instanceofSerializers == null) {
            instanceofSerializers = Maps.newHashMap();
            instanceofSerializers.putAll(JsonSerializers.MAPPY_SLOWY);
            instanceofSerializers.put(Throwable.class, getThrowableSerializer(contextService));
            instanceofSerializers.put(Location.class, LOCATION);
            instanceofSerializers.put(AuraLocale.class, LOCALE);
        }
        return instanceofSerializers;
    }

    public class ThrowableSerializer extends NoneSerializer<Throwable> {

        private final ContextService contextService;

        public ThrowableSerializer(ContextService contextService) {
            this.contextService = contextService;
        }

        @Override
        public void serialize(Json json, Throwable value) throws IOException {
            if (value instanceof JsonSerializable) {
                ((JsonSerializable) value).serialize(json);
            } else {
                json.writeMapBegin();
                json.writeMapEntry("message", value.getMessage());
                if (contextService.isEstablished()) {
                    Mode mode = contextService.getCurrentContext().getMode();
                    if (mode != Mode.PROD && mode != Mode.PRODDEBUG) {
                        json.writeMapEntry("stack", AuraExceptionUtil.getStackTrace(value));
                    }
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

    private AuraContextJsonSerializer getAuraContextJsonSerializer(ConfigAdapter configAdapter, TestContextAdapter testContextAdapter, DefinitionService definitionService) {
        if (auraContextJsonSerializer == null) {
            auraContextJsonSerializer = new AuraContextJsonSerializer(configAdapter, testContextAdapter, definitionService);
        }
        return auraContextJsonSerializer;
    }

    private ThrowableSerializer getThrowableSerializer(ContextService contextService) {
        if (throwableSerializer == null) {
            throwableSerializer =  new ThrowableSerializer(contextService);
        }
        return throwableSerializer;
    }
}
