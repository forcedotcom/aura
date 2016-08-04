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

import static org.auraframework.util.json.JsonSerializers.ARRAY;
import static org.auraframework.util.json.JsonSerializers.LITERAL;
import static org.auraframework.util.json.JsonSerializers.STRING;


/**
 * uses 2 maps to find serializers. first is direct class lookup (fast), second
 * is an instanceof lookup (slow)
 */
public class ClassMapJsonSerializationContext extends BaseJsonSerializationContext {

    private final JsonSerializerFactory jsonSerializerFactory;

    public ClassMapJsonSerializationContext(JsonSerializerFactory jsonSerializerFactory,
                                            boolean format, boolean refSupport, int dataSizeLimit,
                                            int collectionSizeLimit) {
        super(format, refSupport, dataSizeLimit, collectionSizeLimit, false);
        this.jsonSerializerFactory = jsonSerializerFactory;
    }

    @Override
    @SuppressWarnings("unchecked")
    public <T> JsonSerializer<T> getSerializer(T o) {

        if (o == null) {
            return (JsonSerializer<T>) LITERAL;
        }
        Class<?> c = o.getClass();
        if (c.isArray()) {
            return (JsonSerializer<T>) ARRAY;
        } else if (c.isEnum()) {
            return (JsonSerializer<T>) STRING;
        }

        return jsonSerializerFactory.getSerializer(o);
    }
}
