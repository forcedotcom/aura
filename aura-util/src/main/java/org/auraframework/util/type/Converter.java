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

/**
 * The Converter interface is a type converter that converts a value from one Java type 
 * to another Java type. You can implement this interface to provide a custom converter 
 * for your own custom type for converting data sent from the client to the server, 
 * such as input parameters of server-side controller actions or component attributes.
 * 
 * NOTE: Standard types are automatically converted and don't require custom converters.
 **/
public interface Converter<F, T> {

    /**
     * Converts the specified value from its original Java type F to the target 
     * Java type T and returns the converted value.
     * @param value The value to convert to the target Java type.
     * @return The converted value.
     */
    T convert(F value);

    /**
     * Returns the original Java type of the value.
     * @return The original Java type.
     */
    Class<F> getFrom();

    /**
     * Returns the Java type that the value is to be converted to.
     * @return The target Java type.
     */
    Class<T> getTo();

    /**
     * Returns the Java type parameters of a target type that is a parameterized type. 
     * If the target type is not parameterized, returns <code>null</code>.
     * @return The Java type parameters of a target parameterized type.
     */
    Class<?>[] getToParameters();
}
