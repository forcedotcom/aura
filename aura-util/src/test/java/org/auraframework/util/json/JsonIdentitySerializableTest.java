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

import org.auraframework.util.json.Json.Serialization;
import org.auraframework.util.json.Json.Serialization.ReferenceType;

@Serialization(referenceType = ReferenceType.IDENTITY)
public class JsonIdentitySerializableTest implements JsonSerializable {

    private Integer value;

    public JsonIdentitySerializableTest(int value) {
        this.value = value;
    }

    public void setValue(int value) {
        this.value = value;
    }

    public int getValue() {
        return value;
    }

    @Override
    public int hashCode() {
        return value.hashCode();
    }

    @Override
    public boolean equals(Object obj) {
        if (obj instanceof JsonIdentitySerializableTest) {
            JsonIdentitySerializableTest other = (JsonIdentitySerializableTest) obj;
            return value == other.value;
        }
        return false;
    }

    @Override
    public void serialize(Json json) throws IOException {
        json.writeString("JsonIdentitySerializableTest serialized string");
    }

}
