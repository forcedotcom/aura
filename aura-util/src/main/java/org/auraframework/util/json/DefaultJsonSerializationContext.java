/*
 * Copyright (C) 2012 salesforce.com, inc.
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

import org.auraframework.util.ServiceLocator;

/**
 * default serialization context that expects the values know how to serialize themselves using {@link JsonSerializable}
 * this uses instanceof to determine how to serialize, there is no fast lookup cache deal.
 */
public class DefaultJsonSerializationContext extends BaseJsonSerializationContext {

    public DefaultJsonSerializationContext(boolean format, boolean refSupport, boolean nullValues) {
        super(format, refSupport, -1, -1, nullValues);
    }

    @Override
    public JsonSerializer<Object> getSerializer(Object o) {
        return ServiceLocator.get().get(DefaultJsonSerializer.class);
    }

}
