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
package org.auraframework.util.type;

import java.util.Set;

/**
 * The MultiConverter interface is a type converter that converts a value from one Java type 
 * to variety of other Java types. You can implement this interface to provide a custom converter 
 * for your own custom type for converting data sent from the client to the server, 
 * such as input parameters of server-side controller actions or component attributes.
 **/
public interface MultiConverter<T> {

    /**
     * Converts fromValue to a value of the type specified by toClass.
     * @param toClass The target type
     * @param fromValue The value to convert to the target Java type.
     * @return The converted value.
     */
    T convert(Class<? extends T> toClass, Object fromValue);

    /**
     * Returns the type that this converter can convert from.
     * @return Supported source Java type.
     */
    Class<?> getFrom();

    /**
     * Returns the Java types that this converter can convert to.
     * @return Supported target Java types.
     */
    Set<Class<?>> getTo();
}
