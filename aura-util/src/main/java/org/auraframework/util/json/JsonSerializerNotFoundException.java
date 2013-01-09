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

/**
 * Throw when no serializer is found for value.
 * 
 * 
 * 
 * 
 * <p>
 * Copyright (c) 2010 salesforce.com. All rights reserved.
 * </p>
 */
public class JsonSerializerNotFoundException extends JsonSerializationException {

    /**
     */
    private static final long serialVersionUID = 5331228637185995874L;
    private final static String MESSAGE = "No serializer found for %s";
    private final Object value;

    public JsonSerializerNotFoundException(Object value) {
        super(String.format(MESSAGE, value.getClass()));
        this.value = value;
    }

    public Object getValue() {
        return this.value;
    }
}
