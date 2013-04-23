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
import java.io.OutputStream;
import java.util.Calendar;
import java.util.Collection;
import java.util.Date;
import java.util.Map;

import org.auraframework.util.javascript.Literal;
import org.auraframework.util.json.Json.Serialization;
import org.auraframework.util.json.Json.Serialization.ReferenceType;

public class DefaultJsonSerializer implements JsonSerializer<Object> {
    @Override
    public ReferenceType getReferenceType(Object value) {
        Serialization serialization = value.getClass().getAnnotation(Serialization.class);
        if (serialization != null) {
            return serialization.referenceType();
        }
        return ReferenceType.NONE;
    }

    /**
     * all the stuff that used to be in Json.writeValueNoRefSupport.
     * 
     * Identify the type of the value passed in, and appropriately encode it.
     * writeValue() calls this, and can also be called by anything that wants to
     * bypass serRefId processing for some reason (you should usually be calling
     * writeValue(Object) instead of this.)
     */
    @Override
    public void serialize(Json json, Object value) throws IOException {
        // JsonSerializationContext context = json.getSerializationContext();

        if (value == null) {
            Literal.NULL.serialize(json);
        } else if (value instanceof JsonSerializable) {
            // If you've bothered to implement JsonSerializable then you
            // probably want it called.
            ((JsonSerializable) value).serialize(json);
        } else if (value instanceof Map<?, ?>) {
            json.writeMap((Map<?, ?>) value);
        } else if (value instanceof Collection<?>) {
            json.writeArray((Collection<?>) value);
        } else if (value instanceof Object[]) {
            json.writeArray((Object[]) value);
        } else if (value instanceof Boolean || value instanceof Number) {
            // Don't quote boolean or number values
            json.writeLiteral(value);
        } else if (value instanceof Date) {
            json.writeDate((Date) value);
        } else if (value instanceof Calendar) {
            json.writeDate(((Calendar) value).getTime());
        } else if (value instanceof byte[]) {
            // Copy the byte array into the output as a binary stream
            final OutputStream out = json.writeBinaryStreamBegin(((byte[]) value).length);
            out.write((byte[]) value);
            out.close();
            json.writeBinaryStreamEnd();
        } else {
            // all else encoded as toString()
            json.writeString(value);
        }
    }
}
