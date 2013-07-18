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
package org.auraframework.util.json;

import java.io.IOException;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Collection;
import java.util.Collections;
import java.util.Date;
import java.util.GregorianCalendar;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.LinkedList;
import java.util.Map;
import java.util.Map.Entry;
import java.util.TreeSet;

import org.auraframework.util.date.DateOnly;
import org.auraframework.util.date.DateService;
import org.auraframework.util.date.DateServiceImpl;
import org.auraframework.util.javascript.Literal;
import org.auraframework.util.json.Json.Serialization;
import org.auraframework.util.json.Json.Serialization.ReferenceType;
import org.auraframework.util.json.JsonSerializer.NoneSerializer;

import com.google.common.collect.Maps;

/**
 * Some basic serializers
 */
public class JsonSerializers {
    public static final LiteralSerializer LITERAL = new LiteralSerializer();
    public static final StringSerializer STRING = new StringSerializer();
    public static final ArraySerializer ARRAY = new ArraySerializer();
    public static final CollectionSerializer COLLECTION = new CollectionSerializer();
    public static final MapSerializer MAP = new MapSerializer();
    public static final DateSerializer DATE = new DateSerializer();
    public static final DateOnlySerializer DATEONLY = new DateOnlySerializer();
    public static final CalendarSerializer CALENDAR = new CalendarSerializer();
    public static final OldSerializer OLD = new OldSerializer();
    public static final BigDecimalSerializer BIGDECIMAL = new BigDecimalSerializer();

    /**
     * two maps full of standard class to serializer mappings
     */
    public static final Map<String, JsonSerializer<?>> MAPPY_FASTY;
    public static final Map<Class<?>, JsonSerializer<?>> MAPPY_SLOWY;
    static {
        Map<Class<?>, JsonSerializer<?>> m = new LinkedHashMap<Class<?>, JsonSerializer<?>>();
        m.put(ArrayList.class, COLLECTION);
        m.put(LinkedList.class, COLLECTION);
        m.put(HashSet.class, COLLECTION);
        m.put(TreeSet.class, COLLECTION);
        m.put(LinkedHashSet.class, COLLECTION);
        m.put(HashMap.class, MAP);
        m.put(LinkedHashMap.class, MAP);
        m.put(String.class, STRING);
        m.put(Character.class, STRING);
        m.put(Integer.class, LITERAL);
        m.put(Float.class, LITERAL);
        m.put(Double.class, LITERAL);
        m.put(Short.class, LITERAL);
        m.put(Long.class, LITERAL);
        m.put(BigDecimal.class, LITERAL);
        m.put(Boolean.class, LITERAL);
        m.put(Date.class, DATE);
        m.put(DateOnly.class, DATEONLY);
        m.put(GregorianCalendar.class, CALENDAR);

        Map<String, JsonSerializer<?>> mFast = Maps.newLinkedHashMap();
        for (Entry<Class<?>, JsonSerializer<?>> e : m.entrySet()) {
            mFast.put(e.getKey().getName(), e.getValue());
        }
        MAPPY_FASTY = Collections.unmodifiableMap(mFast);

        m = new LinkedHashMap<Class<?>, JsonSerializer<?>>();
        m.put(Collection.class, COLLECTION); // maybe iterable
        m.put(Map.class, MAP);
        m.put(Number.class, LITERAL);
        m.put(Calendar.class, CALENDAR);
        MAPPY_SLOWY = Collections.unmodifiableMap(m);
    }

    /**
     * temp class until all the json serializable stuff moves out of the defs
     */
    public static class OldSerializer implements JsonSerializer<JsonSerializable> {
        @Override
        public final ReferenceType getReferenceType(JsonSerializable value) {
            Serialization serialization = value.getClass().getAnnotation(Serialization.class);
            if (serialization != null) {
                return serialization.referenceType();
            }
            return ReferenceType.NONE;
        }

        @Override
        public void serialize(Json json, JsonSerializable value) throws IOException {
            value.serialize(json);
        }

    }

    public static class ArraySerializer extends NoneSerializer<Object[]> {
        @Override
        public void serialize(Json json, Object[] value) throws IOException {
            if (json.getSerializationContext().getCollectionSizeLimit() > -1
                    && value.length > json.getSerializationContext().getCollectionSizeLimit()) {
                json.writeString("Array of length " + value.length + " too large to display");
            } else {
                json.writeArray(value);
            }
        }
    }

    public static class CollectionSerializer extends NoneSerializer<Collection<?>> {

        @Override
        public void serialize(Json json, Collection<?> value) throws IOException {
            if (json.getSerializationContext().getCollectionSizeLimit() > -1
                    && value.size() > json.getSerializationContext().getCollectionSizeLimit()) {
                json.writeString("Collection of size " + value.size() + " too large to display");
            } else {
                json.writeArray(value);
            }
        }

    }

    public static class MapSerializer extends NoneSerializer<Map<?, ?>> {

        @Override
        public void serialize(Json json, Map<?, ?> value) throws IOException {
            if (json.getSerializationContext().getCollectionSizeLimit() > -1
                    && value.size() > json.getSerializationContext().getCollectionSizeLimit()) {
                json.writeString("Map of size " + value.size() + " too large to display");
            } else {
                json.writeMap(value);
            }
        }

    }

    public static class DateSerializer extends NoneSerializer<Date> {

        @Override
        public void serialize(Json json, Date value) throws IOException {
            DateService dateService = DateServiceImpl.get();
            String ret = dateService.getDateTimeISO8601Converter().format(value);
            json.writeString(ret);
        }

    }

    public static class DateOnlySerializer extends NoneSerializer<Date> {

        @Override
        public void serialize(Json json, Date value) throws IOException {
            DateService dateService = DateServiceImpl.get();
            String ret = dateService.getDateISO8601Converter().format(value);
            json.writeString(ret);
        }

    }

    public static class CalendarSerializer extends NoneSerializer<Calendar> {

        @Override
        public void serialize(Json json, Calendar value) throws IOException {
            json.writeValue(value.getTime());
        }

    }

    /**
     * literal means its something that is literal in javascript
     */
    public static class LiteralSerializer extends NoneSerializer<Object> {
        @Override
        public void serialize(Json json, Object value) throws IOException {
            if (value == null) {
                Literal.NULL.serialize(json);
            } else {
                json.writeLiteral(value);
            }
        }

    }

    public static class StringSerializer extends NoneSerializer<Object> {

        @Override
        public void serialize(Json json, Object value) throws IOException {
            if (json.getSerializationContext().getVariableDataSizeLimit() > -1
                    && ((String) value).length() > json.getSerializationContext().getVariableDataSizeLimit()) {
                value = ((String) value).substring(0, json.getSerializationContext().getVariableDataSizeLimit())
                        + " ("
                        + Integer.toString(((String) value).length()
                                - json.getSerializationContext().getVariableDataSizeLimit()) + " more) ...";
            }
            json.writeString(value);
        }

    }

    /**
     * Numbers in JS are only double precision, BigDecimals can overflow and so will be serialized as strings when too large
     */
    public static class BigDecimalSerializer extends NoneSerializer<BigDecimal> {
        public static int MAX_PRECISION = 15;
        
        @Override
        public void serialize(Json json, BigDecimal bd) throws IOException {
            if (bd.precision() > MAX_PRECISION) {
                json.writeString(bd);
            } else {
                json.writeLiteral(bd);
            }
        }

    }
}
