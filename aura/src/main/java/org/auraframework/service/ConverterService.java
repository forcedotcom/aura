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
package org.auraframework.service;

import org.auraframework.util.AuraLocale;

public interface ConverterService {

    /**
     * Convert from a value to a given class.
     *
     * @param value the value to convert
     * @param to the class that is desired
     * @return the converted value, null if the input is null.
     * @throws ConversionException if there is no converter
     */
    <F, T> T convert(F value, Class<T> to);

    /**
     * Convert from a value to a given class.
     *
     * @param value the value to convert
     * @param to the class that is desired
     * @param locale the locale for conversion, used if there is a localized converter.
     * @return the converted value, null if the input is null.
     * @throws ConversionException if there is no converter
     */
    <F, T> T convert(F value, Class<T> to, AuraLocale locale);

    /**
     * Convert from a value to a given class.
     *
     * @param value the value to convert
     * @param to the class that is desired
     * @param of the string version of the parameters to the class.
     * @param trim if true and the value is a string, trim it.
     * @param locale the locale for conversion, used if there is a localized converter.
     * @return the converted value, null if the input is null.
     * @throws ConversionException if there is no converter
     */
    <F, T> T convert(F value, Class<T> to, String of, boolean trim);

    /**
     * Convert from a value to a given class.
     *
     * @param value the value to convert
     * @param to the class that is desired
     * @param of the string version of the parameters to the class.
     * @param trim if true and the value is a string, trim it.
     * @param locale the locale for conversion, used if there is a localized converter.
     * @return the converted value, null if the input is null.
     * @throws ConversionException if there is no converter
     */
    <F, T> T convert(F value, Class<T> to, String of, boolean trim, AuraLocale locale);

    /**
     * Convert from a value to a given class.
     *
     * @param value the value to convert
     * @param to the class that is desired
     * @param of the string version of the parameters to the class.
     * @param trim if true and the value is a string, trim it.
     * @param hasLocale if true, get the local from the localization service
     * @return the converted value, null if the input is null.
     * @throws ConversionException if there is no converter
     * @deprecated use the version with AuraLocale instead
     */
    @Deprecated
    <F, T> T convert(F value, Class<T> to, String of, boolean trim, boolean hasLocale);

    /* Mostly for testing? */
    boolean hasConverter(Class<?> from, Class<?> to);

    boolean hasConverter(Class<?> from, Class<?> to, String of);

    boolean hasLocalizedConverter(Class<?> from, Class<?> to);
}
