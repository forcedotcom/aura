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
package org.auraframework.impl.java.type;

import java.util.Map;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;

import com.google.common.collect.Maps;

import org.auraframework.Aura;
import org.auraframework.util.AuraLocale;
import org.auraframework.util.ServiceLocator;
import org.auraframework.util.type.TypeUtil;

/**
 * Converts java Aura values between types, using the Aura Localization layer
 * to decipher formatting and handle parsing.
 *
 * @see TypeUtil
 */
public class JavaLocalizedTypeUtil {

    private static final Log log = LogFactory.getLog(JavaLocalizedTypeUtil.class);

    private static final JavaLocalizedTypeUtil instance = new JavaLocalizedTypeUtil();

    private static final JavaLocalizedTypeUtil get() {
        return instance;
    }

    // cached converters
    private final Map<String, Map<String, LocalizedConverter<?, ?>>> converters = Maps.newHashMap();
    private final Map<String, Map<String, Map<String, LocalizedConverter<?, ?>>>> parameterizedConverters = Maps.newHashMap();


    /**
     * Private constructor that populates a converter cache.
     */
    private JavaLocalizedTypeUtil() {
        for (LocalizedConverter<?, ?> converter : ServiceLocator.get().getAll(LocalizedConverter.class)) {
            try {
                String from = converter.getFrom().getName();
                String to = converter.getTo().getName();
                Class<?>[] toParams = converter.getToParameters();

                Map<String, LocalizedConverter<?, ?>> toMap = converters.get(from);
                if (toMap == null) {
                    toMap = Maps.newHashMap();
                    converters.put(from, toMap);
                }

                if (toParams == null) {

                    if (toMap.containsKey(to)) {
                        log.warn("Duplicate LocalizedConverter not registered: " + converter);
                    } else {
                        toMap.put(to, converter);
                    }

                } else {

                    Map<String, Map<String, LocalizedConverter<?, ?>>> paramToMap = parameterizedConverters.get(from);
                    if (paramToMap == null) {
                        paramToMap = Maps.newHashMap();
                        parameterizedConverters.put(from, paramToMap);
                    }

                    StringBuilder toParamNamesBuilder = new StringBuilder();
                    for (Class<?> clz : toParams) {
                        if (toParamNamesBuilder.length() > 0) {
                            toParamNamesBuilder.append(',');
                        }
                        toParamNamesBuilder.append(clz.getSimpleName());
                    }
                    String toParamNames = toParamNamesBuilder.toString();

                    Map<String, LocalizedConverter<?, ?>> paramMap = paramToMap.get(to);
                    if (paramMap == null) {
                        paramMap = Maps.newHashMap();
                        paramToMap.put(to, paramMap);
                    }

                    if (paramMap.containsKey(toParamNames)) {
                        log.warn("Duplicate LocalizedConverter not registered: " + converter);
                    } else {
                        paramMap.put(toParamNames, converter);
                    }
                }

            } catch (Exception e) {
                log.error("Invalid LocalizedConverter not registered: " + converter, e);
            }
        }
    }

    /**
     * Ask if a given converter is available.
     *
     * @param from the conversion source data type
     * @param to the conversion target data type
     * @param of if not null, 'to' is a container of this type
     *
     * @return true if a converter is available
     */
    public static boolean hasConverter(Class<?> from, Class<?> to, String of) {
        return getConverter(from, to, of) != null;
    }


    /**
     * Ask if a given converter is available.
     *
     * @param from
     * @param to
     * @return true if a converter is available
     */
    public static boolean hasConverter(Class<?> from, Class<?> to) {
        return hasConverter(from, to, null);
    }

    /**
     * Attempts to convert value to the type specified by 'to'. To add supported
     * Conversions, drop a new implementation of LocalizedConverter into the
     * aura.impl.java.type.converter directory and add a reference to it in
     * configuration.AuraImplConfig.
     *
     * If a Locale aware <code>LocalizedConverter</code> can't be found a
     * <code>aura.util.type.Converter<code> will be used instead.
     *
     * @param <F>
     * @param <T>
     * @param value
     * @param to
     * @param of
     * @param trim
     * @param locale
     *
     * @return a converted T
     */
    @SuppressWarnings("unchecked")
    public static <F, T> T convert(F value, Class<T> to, String of, boolean trim, AuraLocale locale) {

        if (value == null) {
            return null;
        }
        // if no localized version exists, use the standard convert utility
        Class<F> from = (Class<F>) value.getClass();
        if (!hasConverter(from, to, of)) {
            return org.auraframework.util.type.TypeUtil.convert(value, to, of, trim);
        }

        // otherwise try the localized steps
        if (trim && value instanceof String) {
            value = (F) ((String) value).trim();
        }
        if (to.isAssignableFrom(from)) {
            return (T) value;
        }
        if (locale == null) {
            locale = Aura.getLocalizationAdapter().getAuraLocale();
        }
        return getConverter(from, to, of).convert(value, locale);
    }



    // additional convert signatures that all just pass in the right args
    // to the long form version

    public static <F, T> T convertNoTrim(F value, Class<T> to) {
        return convert(value, to, null, false, null);
    }

    public static <F, T> T convertNoTrim(F value, Class<T> to,
            AuraLocale locale) {
        return convert(value, to, null, false, locale);
    }

    public static <F, T> T convert(F value, Class<T> to) {
        return convert(value, to, null, true, null);
    }

    public static <F, T> T convert(F value, Class<T> to, AuraLocale locale) {
        return convert(value, to, null, true, locale);
    }

    public static <F, T> T convert(F value, Class<T> to, boolean trim) {
        return convert(value, to, null, trim, null);
    }

    public static <F, T> T convert(F value, Class<T> to, boolean trim,
            AuraLocale locale) {
        return convert(value, to, null, trim, locale);
    }

    public static <F, T> T convertNoTrim(F value, Class<T> to, String of) {
        return convert(value, to, of, false, null);
    }

    public static <F, T> T convertNoTrim(F value, Class<T> to, String of,
            AuraLocale locale) {
        return convert(value, to, of, false, locale);
    }

    public static <F, T> T convert(F value, Class<T> to, String of) {
        return convert(value, to, of, true, null);
    }

    public static <F, T> T convert(F value, Class<T> to, String of,
            AuraLocale locale) {
        return convert(value, to, of, true, locale);
    }

    public static <F, T> T convert(F value, Class<T> to, String of, boolean trim) {
        return convert(value, to, of, trim, null);
    }

    /**
     * Returns a LocalizedConverter to go from F to T, or null if one is not
     * available. If 'of' is not null, it indicates that 'to' is a container of
     * 'of' types.
     */
    @SuppressWarnings("unchecked")
    private static <F, T> LocalizedConverter<F, T> getConverter(Class<F> from, Class<T> to, String of) {
        JavaLocalizedTypeUtil typeUtil = get();
        if (of == null){
            Map<String, LocalizedConverter<?,?>> map = typeUtil.converters.get(from.getName());
            if(map != null){
                return (LocalizedConverter<F,T>)map.get(to.getName());
            }
        } else {
            Map<String, Map<String, LocalizedConverter<?, ?>>> converters = typeUtil.parameterizedConverters.get(from.getName());
            if(converters != null){
                Map<String, LocalizedConverter<?,?>> paramConverters = converters.get(to.getName());
                if(paramConverters != null){
                    return (LocalizedConverter<F,T>) paramConverters.get(of);
                }
            }
        }
        // Don't panic yet - if no LocalizedConverter is found, we can still use the non-localized version.
        return null;
    }

}
