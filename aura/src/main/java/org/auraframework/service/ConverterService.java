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

    <F, T> T convert(F value, Class<T> to);

    <F, T> T convert(F value, Class<T> to, AuraLocale locale);

    <F, T> T convert(F value, Class<T> to, String of, boolean trim);

    <F, T> T convert(F value, Class<T> to, String of, boolean trim, AuraLocale locale);

    <F, T> T convert(F value, Class<T> to, String of, boolean trim, boolean hasLocale);

    /* Mostly for testing? */
    boolean hasConverter(Class<?> from, Class<?> to);

    boolean hasConverter(Class<?> from, Class<?> to, String of);

    boolean hasLocalizedConverter(Class<?> from, Class<?> to);
}
