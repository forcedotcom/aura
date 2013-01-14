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
package org.auraframework.util.type;

/**
 * Used by aura.util.type.TypeUtil Defines a type converter that converts an
 * object of type F to an object of type T. The implementations are located by
 * naming convention in the aura.util.type.converter package. For Array types,
 * substitute the [] in the type signature with the word "Array".
 * 
 * So, If you're trying to convert from a String[] to an Integer[], you would
 * create an implementation called StringArrayToIntegerArrayConverter.
 **/
public interface Converter<F, T> {

    /**
     * 
     * @param value
     * @return F converted into a T
     */
    T convert(F value);

    Class<F> getFrom();

    Class<T> getTo();

    Class<?>[] getToParameters();
}
