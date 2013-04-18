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
package org.auraframework.impl.java.type;

import org.auraframework.util.AuraLocale;

/**
 * Used by {@link JavaLocalizedTypeUtil}
 * <p>
 * Defines a type converter that converts an object of type F to an object of
 * type T using the specified AuraLocale to help resolve the conversion.
 * <p>
 * The implementations are located by naming convention in the
 * {@link org.auraframework.impl.java.type} package. For Array types, substitute
 * the [] in the type signature with the word "Array".
 * <p>
 * Similar to {@link Converter} but uses {@link AuraLocale} during conversion
 * between types.
 * <p>
 * If you're trying to convert from a String[] to an Integer[], you would create
 * an implementation called LocalizedStringArrayToIntegerArrayConverter then add
 * a static return method in {@link AuraImplConfig} that returns your new
 * {@link LocalizedConverter} class instance. Your converter can either
 * implement all the required methods listed here directly, or subclass a
 * non-localized version to pick some up for free.
 * 
 * @see Converter
 **/
public interface LocalizedConverter<F, T> {
    /*
     * This was previously a child of Converter, but the Aura service loader
     * loads by class type and precaches all the converters for performance. If
     * this extends Converter the classes that implement this will be put into
     * BOTH caches (that's bad). However the implementing classes can extend
     * classes that implement Converter and only get put into a single cache.
     */

    /**
     * Do the conversion from value to a T using the AuraLocale.
     * 
     * @param value
     * @param locale a non-null AuraLocale
     * @return F converted into a T
     */
    T convert(F value, AuraLocale locale);

    /**
     * Returns the source class type.
     * 
     * @return a class
     */
    Class<F> getFrom();

    /**
     * Returns the target class type.
     * 
     * @return a class
     */
    Class<T> getTo();

    /**
     * Returns the parameters for converting to a group of a type, or null if
     * not needed.
     * 
     * @return an array of Classes, or null if not needed
     */
    Class<?>[] getToParameters();

}
