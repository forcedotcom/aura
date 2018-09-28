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
import org.auraframework.util.type.Converter;

/**
 * Conversion with a locale.
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
 * 
 * @see Converter
 */
public interface LocalizedConverter<F, T> extends Converter<F,T> {
    /**
     * Do the conversion from value to a T using the AuraLocale.
     * 
     * @param value
     * @param locale a non-null AuraLocale
     * @return F converted into a T
     */
    T convert(F value, AuraLocale locale);
}
