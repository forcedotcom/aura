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
package org.auraframework.impl.java.converter;

import java.util.HashMap;
import java.util.Map;
import java.util.Set;

import javax.annotation.PostConstruct;
import javax.inject.Inject;

import org.auraframework.adapter.LocalizationAdapter;
import org.auraframework.annotations.Annotations.ServiceComponent;
import org.auraframework.impl.java.type.LocalizedConverter;
import org.auraframework.service.ConverterService;
import org.auraframework.service.LoggingService;
import org.auraframework.util.AuraLocale;
import org.auraframework.util.type.ConversionException;
import org.auraframework.util.type.Converter;
import org.auraframework.util.type.ConverterInitError;
import org.auraframework.util.type.MultiConverter;
import org.auraframework.util.type.MultiConverterInitError;
import org.springframework.beans.factory.annotation.Autowired;

import com.google.common.collect.Maps;

@ServiceComponent
public final class ConverterServiceImpl implements ConverterService {

    /**
     * Converts from one type to a collection of types. So not Array to List, but Array of Strings to a Collection of Strings.
     * We use autowired(require=false) since we don't actually have any of these in Aura, but consumers of Aura may. @Inject does not have an optional parameter.
     */
    @Autowired(required = false)
    private MultiConverter<?>[] multiConverters;

    /**
     * Generic converters from one value to another.
     */
    @Inject
    private Converter<?, ?>[] converters;

    @Inject
    private LoggingService loggingService;

    @Inject
    private LocalizationAdapter localizationAdapter;

    private final Map<String, Map<String, LocalizedConverter<?, ?>>> localizedConverterMap = Maps.newHashMap();
    private final Map<String, Map<String, Map<String, LocalizedConverter<?, ?>>>> localizedParameterizedConverters = Maps.newHashMap();

    private final Map<String, Map<String, Converter<?, ?>>> converterMap = Maps.newHashMap();
    private final Map<String, Map<String, Map<String, Converter<?, ?>>>> parameterizedConverters = Maps.newHashMap();
    private final Map<String, Map<String, MultiConverter<?>>> multiConverterMap = Maps.newHashMap();


    public ConverterServiceImpl() {
    }

    @PostConstruct
    void init() {
        buildMapOfConverters();
    }

    @Override
    public <F, T> T convert(F value, Class<T> to) {
        return convert(value, to, null, true);
    }

    @SuppressWarnings("unchecked")
    @Override
    public <F, T> T convert(F value, Class<T> to, String of, boolean trim) {

        if (value == null) {
            return null;
        }

        if (trim && value instanceof String) {
            value = (F) ((String) value).trim();
        }

        Class<F> from = (Class<F>) value.getClass();
        if (of == null && to.isAssignableFrom(from)) {
            return (T) value;
        }

        Converter<F, T> converter = getConverter(from, to, of);
        if (converter != null) {
            return converter.convert(value);
        }

        MultiConverter<T> multiConverter = null;
        if (of == null) {
            multiConverter = getMultiConverter(from, to);
        }

        if (multiConverter == null) {
            throw new ConversionException(String.format("No Converter or MultiConverter found for %s to %s<%s>", from, to, of));
        }

        return multiConverter.convert(to, value);
    }

    /**
     * Attempt to use the Locale to convert the values.
     * Defaults to trim the value before returning if possible.
     * Will revert to the non localized convert if no converter was present for the type.
     */
    @Override
    public <F, T> T convert(F value, Class<T> to, AuraLocale locale) {
        return convert(value, to, null, true, locale);
    }

    /**
     * Attempt to use the Locale to convert the values.
     * Will revert to the non localized convert if no special localized converter was present for the type.
     *
     * @param value  the Raw value to convert to the specific type. We have different converter classes to convert from one value to another. So "1,2,3" to List.class would convert from String to List.
     * @param to     A Class instance to convert the value to. List.class would convert it to a class. Integer.class would convert the value to an integer.
     * @param of     Used for types that have a parameter specification. Think of this as Collection<Of> as in List<String>
     * @param trim   Should the result be trimmed if the value is a string?
     * @param locale We should use the localized converts and the specified local to convert the value. If you specify null, we use the non localized converters.
     */
    @SuppressWarnings("unchecked")
    @Override
    public <F, T> T convert(F value, Class<T> to, String of, boolean trim, AuraLocale locale) {
        if (value == null) {
            return null;
        }
        if (locale == null) {
            return convert(value, to, of, trim);
        }

        // if no localized version exists, use the standard convert utility
        final Class<F> from = (Class<F>) value.getClass();
        final LocalizedConverter<F, T> converter = getLocalizedConverter(from, to, of);
        if (converter == null) {
            return convert(value, to, of, trim);
        }

        // otherwise try the localized steps
        if (trim && value instanceof String) {
            value = (F) ((String) value).trim();
        }

        if (to.isAssignableFrom(from)) {
            return (T) value;
        }

        return converter.convert(value, locale);
    }

    /**
     * Attempt to use the Locale to convert the values. Will revert to the non localized convert if no special localized
     * converter was present for the type.
     *
     * @param value the Raw value to convert to the specific type. We have different converter classes to convert from
     *            one value to another. So "1,2,3" to List.class would convert from String to List.
     * @param to A Class instance to convert the value to. List.class would convert it to a class. Integer.class would
     *            convert the value to an integer.
     * @param of Used for types that have a parameter specification. Think of this as Collection<Of> as in List<String>
     * @param trim Should the result be trimmed if the value is a string?
     * @param hasLocale We should use the localized converts and the specified local to convert the value. If you
     *            specify null, we use the non localized converters.
     */
    @Override
    public <F, T> T convert(F value, Class<T> to, String of, boolean trim, boolean hasLocale) {
        return hasLocale ? convert(value, to, of, trim, localizationAdapter.getAuraLocale()) : convert(value, to, of,
                trim);
    }

    @SuppressWarnings("unchecked")
    private <F, T> LocalizedConverter<F, T> getLocalizedConverter(Class<F> from, Class<T> to, String of) {
        if (of == null) {
            Map<String, LocalizedConverter<?, ?>> map = localizedConverterMap.get(from.getName());
            if (map != null) {
                return (LocalizedConverter<F, T>) map.get(to.getName());
            }
        } else {
            Map<String, Map<String, LocalizedConverter<?, ?>>> converters = localizedParameterizedConverters.get(from
                    .getName());
            if (converters != null) {
                Map<String, LocalizedConverter<?, ?>> paramConverters = converters.get(to.getName());
                if (paramConverters != null) {
                    return (LocalizedConverter<F, T>) paramConverters.get(of);
                }
            }
        }
        // Don't panic yet - if no LocalizedConverter is found, we can still use
        // the non-localized version.
        return null;
    }

    @SuppressWarnings("unchecked")
    private <F, T> Converter<F, T> getConverter(Class<F> from, Class<T> to, String of) {
        String className = getAssignableHashMapClassName(from);
        if (of == null) {
            Map<String, Converter<?, ?>> map = converterMap.get(className);
            if (map != null) {
                return (Converter<F, T>) map.get(to.getName());
            }
        } else {
            Map<String, Map<String, Converter<?, ?>>> converters = parameterizedConverters.get(className);
            if (converters != null) {
                Map<String, Converter<?, ?>> paramConverters = converters.get(to.getName());
                if (paramConverters != null) {
                    return (Converter<F, T>) paramConverters.get(of);
                }
            }
        }
        return null;
    }

    @SuppressWarnings("unchecked")
    private <T> MultiConverter<T> getMultiConverter(Class<?> from, Class<T> to) {
        String className = getAssignableHashMapClassName(from);
        Map<String, MultiConverter<?>> map = multiConverterMap.get(className);
        if (map != null) {
            return (MultiConverter<T>) map.get(to.getName());
        }

        return null;
    }


    /**
     * Checks whether Class is assignable to HashMap (LinkedHashMap).
     * If so, return HashMap to find all existing HashMap converters.
     *
     * @param clz Class to find
     * @return class name
     */
    private static String getAssignableHashMapClassName(Class<?> clz) {
        String className = clz.getName();
        if (HashMap.class.isAssignableFrom(clz)) {
            className = HashMap.class.getName();
        }
        return className;
    }

    private void buildMapOfConverters() {
        for (Converter<?, ?> converter : converters) {
            // Handled earlier.
            if (converter instanceof LocalizedConverter) {
                try {
                    String from = converter.getFrom().getName();
                    String to = converter.getTo().getName();
                    Class<?>[] toParams = converter.getToParameters();

                    Map<String, LocalizedConverter<?, ?>> toMap = localizedConverterMap.get(from);
                    if (toMap == null) {
                        toMap = Maps.newHashMap();
                        localizedConverterMap.put(from, toMap);
                    }

                    if (toParams == null) {

                        if (toMap.containsKey(to)) {
                            loggingService.warn("Duplicate LocalizedConverter not registered: " + converter);
                        } else {
                            toMap.put(to, (LocalizedConverter<?, ?>) converter);
                        }

                    } else {

                        Map<String, Map<String, LocalizedConverter<?, ?>>> paramToMap = localizedParameterizedConverters.get(from);
                        if (paramToMap == null) {
                            paramToMap = Maps.newHashMap();
                            localizedParameterizedConverters.put(from, paramToMap);
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
                            loggingService.warn("Duplicate LocalizedConverter not registered: " + converter);
                        } else {
                            paramMap.put(toParamNames, (LocalizedConverter<?, ?>) converter);
                        }
                    }

                } catch (Exception e) {
                    loggingService.error("Invalid LocalizedConverter not registered: " + converter, e);
                }
            } else {
                Class<?> fromClass = converter.getFrom();
                Class<?> toClass = converter.getTo();
                if (fromClass == null || toClass == null) {
                    System.err.println("Invalid converter not registered : " + converter);
                } else {
                    String from = fromClass.getName();
                    String to = toClass.getName();
                    Class<?>[] toParams = converter.getToParameters();
                    StringBuilder toParamNames = new StringBuilder();
                    if (toParams != null) {
                        for (Class<?> clz : toParams) {
                            if (toParamNames.length() > 0) {
                                toParamNames.append(',');
                            }
                            toParamNames.append(clz.getSimpleName());
                        }
                    }

                    Map<String, Converter<?, ?>> toMap = converterMap.get(from);
                    Map<String, Map<String, Converter<?, ?>>> paramToMap = parameterizedConverters.get(from);
                    if (toMap == null) {
                        toMap = Maps.newHashMap();
                        converterMap.put(from, toMap);
                    }
                    if (paramToMap == null) {
                        paramToMap = Maps.newHashMap();
                        parameterizedConverters.put(from, paramToMap);
                    }

                    if (toParams != null) {
                        Map<String, Converter<?, ?>> paramMap = paramToMap.get(to);
                        if (paramMap == null) {
                            paramMap = Maps.newHashMap();
                            paramToMap.put(to, paramMap);
                        }
                        if (paramMap.containsKey(toParamNames.toString())) {
                            converter = new ConverterInitError<>(String.format(
                                    "More than one converter registered for %s to %s<%s>.  Using %s.", from, to,
                                    toParamNames.toString(), paramMap.get(toParamNames.toString())));
                        }
                        paramMap.put(toParamNames.toString(), converter);
                    } else {
                        if (toMap.containsKey(to)) {
                            converter = new ConverterInitError<>(String.format(
                                    "More than one converter registered for %s to %s.  Using %s.", from, to, toMap.get(to)));
                        }
                        toMap.put(to, converter);
                    }
                }
            }
        }

        if (multiConverters != null) {
            for (MultiConverter<?> multiConverter : multiConverters) {
                Class<?> fromClass = multiConverter.getFrom();
                Set<Class<?>> toClasses = multiConverter.getTo();

                if (fromClass == null || toClasses == null) {
                    System.err.println("Invalid multiconverter not registered : " + multiConverter);
                } else {
                    String from = fromClass.getName();

                    Map<String, MultiConverter<?>> toMap = multiConverterMap.get(from);
                    if (toMap == null) {
                        toMap = Maps.newHashMap();
                        multiConverterMap.put(from, toMap);
                    }

                    for (Class<?> toClass : toClasses) {
                        final String to = toClass.getName();
                        if (toMap.containsKey(to)) {
                            multiConverter = new MultiConverterInitError(String.format(
                                    "More than one multiconverter registered for %s to %s.", from, to));
                        }
                        toMap.put(to, multiConverter);
                    }
                }
            }
        }
    }

    @Override
    public boolean hasConverter(Class<?> from, Class<?> to) {
        return getConverter(from, to, null) != null;
    }

    @Override
    public boolean hasLocalizedConverter(Class<?> from, Class<?> to) {
        return getLocalizedConverter(from, to, null) != null;
    }

    @Override
    public boolean hasConverter(Class<?> from, Class<?> to, String of) {
        return getConverter(from, to, of) != null || (of == null && getMultiConverter(from, to) != null);
    }

}
