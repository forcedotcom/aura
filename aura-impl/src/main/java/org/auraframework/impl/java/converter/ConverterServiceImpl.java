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

import java.util.Collection;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

import javax.inject.Inject;
import javax.inject.Provider;

import org.auraframework.adapter.LocalizationAdapter;
import org.auraframework.annotations.Annotations.ServiceComponent;
import org.auraframework.impl.java.type.LocalizedConverter;
import org.auraframework.service.ConverterService;
import org.auraframework.service.LoggingService;
import org.auraframework.util.AuraLocale;
import org.auraframework.util.type.ConversionException;
import org.auraframework.util.type.Converter;
import org.auraframework.util.type.MultiConverter;
import org.springframework.beans.BeansException;
import org.springframework.context.ApplicationContext;
import org.springframework.context.ApplicationContextAware;
import org.springframework.context.annotation.Lazy;

import com.google.common.base.Supplier;
import com.google.common.base.Suppliers;
import com.google.common.collect.Maps;

@ServiceComponent
public final class ConverterServiceImpl implements ConverterService, ApplicationContextAware {
    /**
     * Generic converters from one value to another.
     */
    private List<Converter<?, ?>> converters;

    private LoggingService loggingService;

    private Supplier<LocalizationAdapter> localizationAdapterSupplier;

    private ApplicationContext applicationContext;

    private boolean initialized;

    private Map<String, Map<String, Converter<?, ?>>> converterMap;
    private Map<String, Map<String, Map<String, Converter<?, ?>>>> parameterizedConverters;
    private Map<String, Map<String, MultiConverter<?>>> multiConverterMap;

    /**
     * FIXME: once the test passes, remove this in favor of permanent enforcement.
     */
    private final boolean enforce;

    public ConverterServiceImpl() {
        this.enforce = false;
    }

    public ConverterServiceImpl(boolean enforce) {
        this.enforce = true;
    }

    @Override
    public <F, T> T convert(F value, Class<T> to) {
        return convert(value, to, null, true, null);
    }

    @Override
    public <F, T> T convert(F value, Class<T> to, String of, boolean trim) {
        return convert(value, to, of, trim, null);
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
    @Override
    public <F, T> T convert(F value, Class<T> to, String of, boolean trim, AuraLocale locale) {
        if (value == null) {
            return null;
        }

        if (trim && value instanceof String) {
            @SuppressWarnings("unchecked")
            F trimmed = (F) ((String) value).trim();
            value = trimmed;
        }

        @SuppressWarnings("unchecked")
        final Class<F> from = (Class<F>) value.getClass();
        if (of == null && to.isAssignableFrom(from)) {
            @SuppressWarnings("unchecked")
            T result = (T) value;
            return result;
        }
        if (locale != null) {
            LocalizedConverter<F, T> converter = getLocalizedConverter(from, to, of);
            if (converter != null) {
                return converter.convert(value, locale);
            }
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
            String message;
            if (of == null) {
                message = String.format("No converter found for %s to %s", from, to);
            } else {
                message = String.format("No converter found for %s to %s<%s>", from, to, of);
            }
            throw new ConversionException(message);
        }

        return multiConverter.convert(to, value);
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
     * @deprecated Use convert with AuraLocale
     */
    @Override
    @Deprecated
    public <F, T> T convert(F value, Class<T> to, String of, boolean trim, boolean hasLocale) {
        if (hasLocale) {
            return convert(value, to, of, trim, localizationAdapterSupplier.get().getAuraLocale());
        } else {
            return convert(value, to, of, trim, null);
        }
    }

    private <F, T> LocalizedConverter<F, T> getLocalizedConverter(Class<F> from, Class<T> to, String of) {
        Converter<F,T> converter = getConverter(from, to, of);
        if (converter instanceof LocalizedConverter) {
            return (LocalizedConverter<F,T>)converter;
        }
        return null;
    }

    private <F, T> Converter<F, T> getConverter(Class<F> from, Class<T> to, String of) {
        if (!initialized) {
            buildMapOfConverters();
        }
        String className = getAssignableHashMapClassName(from);
        if (of == null) {
            Map<String, Converter<?, ?>> map = converterMap.get(className);
            if (map != null) {
                @SuppressWarnings("unchecked")
                Converter<F,T> result = (Converter<F, T>) map.get(to.getName());
                return result;
            }
        } else {
            Map<String, Map<String, Converter<?, ?>>> parameterized = parameterizedConverters.get(className);
            if (parameterized != null) {
                Map<String, Converter<?, ?>> paramConverters = parameterized.get(to.getName());
                if (paramConverters != null) {
                    @SuppressWarnings("unchecked")
                    Converter<F,T> result = (Converter<F, T>) paramConverters.get(of);
                    return result;
                }
            }
        }
        return null;
    }

    @SuppressWarnings("unchecked")
    private <T> MultiConverter<T> getMultiConverter(Class<?> from, Class<T> to) {
        if (!initialized) {
            buildMapOfConverters();
        }
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

    private synchronized void buildMapOfConverters() {
        if (initialized) {
            return;
        }
        Map<String, Map<String, Converter<?, ?>>> converterBuilding = Maps.newHashMap();
        Map<String, Map<String, Map<String, Converter<?, ?>>>> parameterizedBuilding = Maps.newHashMap();
        Map<String, Map<String, MultiConverter<?>>> multiConverterBuilding = Maps.newHashMap();
        StringBuilder sb = new StringBuilder();

        for (Converter<?, ?> converter : converters) {
            Class<?> fromClass = converter.getFrom();
            Class<?> toClass = converter.getTo();
            if (fromClass == null || toClass == null) {
                sb.append("\tInvalid converter not registered : ");
                sb.append(converter.getClass().getName());
                sb.append("\n");
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

                Map<String, Converter<?, ?>> toMap = converterBuilding.get(from);
                Map<String, Map<String, Converter<?, ?>>> paramToMap = parameterizedBuilding.get(from);
                if (toMap == null) {
                    toMap = Maps.newHashMap();
                    converterBuilding.put(from, toMap);
                }
                if (paramToMap == null) {
                    paramToMap = Maps.newHashMap();
                    parameterizedBuilding.put(from, paramToMap);
                }

                if (toParams != null) {
                    Map<String, Converter<?, ?>> paramMap = paramToMap.get(to);
                    if (paramMap == null) {
                        paramMap = Maps.newHashMap();
                        paramToMap.put(to, paramMap);
                    }
                    if (paramMap.containsKey(toParamNames.toString())) {
                        sb.append("\tMore than one converter registered for ");
                        sb.append(from);
                        sb.append(" to ");
                        sb.append(to);
                        sb.append("<");
                        sb.append(toParamNames);
                        sb.append(">. Found ");
                        sb.append(paramMap.get(toParamNames.toString()).getClass().getName());
                        sb.append(" and ");
                        sb.append(converter.getClass().getName());
                        sb.append("\n");
                    }
                    paramMap.put(toParamNames.toString(), converter);
                } else {
                    if (toMap.containsKey(to)) {
                        sb.append("\tMore than one converter registered for ");
                        sb.append(from);
                        sb.append(" to ");
                        sb.append(to);
                        sb.append(". Found ");
                        sb.append(toMap.get(to).getClass().getName());
                        sb.append(" and ");
                        sb.append(converter.getClass().getName());
                        sb.append("\n");
                    }
                    toMap.put(to, converter);
                }
            }
        }
        // This hack is to avoid the problem of Lazy+required=false not working.
        @SuppressWarnings("rawtypes")
        Collection<MultiConverter> multiConverters = null;
        if (applicationContext != null) {
            multiConverters = applicationContext.getBeansOfType(MultiConverter.class).values();
        }

        if (multiConverters != null) {
            for (MultiConverter<?> multiConverter : multiConverters) {
                Class<?> fromClass = multiConverter.getFrom();
                Set<Class<?>> toClasses = multiConverter.getTo();

                if (fromClass == null || toClasses == null) {
                    sb.append("\tInvalid multiconverter not registered : ");
                    sb.append(multiConverter.getClass().getName());
                    sb.append("\n");
                } else {
                    String from = fromClass.getName();

                    Map<String, MultiConverter<?>> toMap = multiConverterBuilding.get(from);
                    if (toMap == null) {
                        toMap = Maps.newHashMap();
                        multiConverterBuilding.put(from, toMap);
                    }

                    for (Class<?> toClass : toClasses) {
                        String to = toClass.getName();
                        if (toMap.containsKey(to)) {
                            sb.append("\tMore than one multiconverter registered for ");
                            sb.append(from);
                            sb.append(" to ");
                            sb.append(to);
                            sb.append(". Found ");
                            sb.append(toMap.get(to).getClass().getName());
                            sb.append(" and ");
                            sb.append(multiConverter.getClass().getName());
                            sb.append("\n");
                        }
                        toMap.put(to, multiConverter);
                    }
                }
            }
        }
        if (sb.length() > 0) {
            loggingService.error(sb.toString());
            if (enforce) {
                throw new RuntimeException("Conversion errors found:\n"+sb.toString());
            }
        }
        converterMap = converterBuilding;
        parameterizedConverters = parameterizedBuilding;
        multiConverterMap = multiConverterBuilding;
        initialized = true;
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

    /**
     * @param converters the converters to set
     */
    @Inject
    @Lazy
    public void setConverters(List<Converter<?, ?>> converters) {
        this.converters = converters;
    }

    /**
     * @param loggingService the loggingService to set
     */
    @Inject
    @Lazy
    public void setLoggingService(LoggingService loggingService) {
        this.loggingService = loggingService;
    }

    /**
     * {@code localizationAdapter} is a commonly used bean and we use a {@link Provider} for faster performance with the
     * {@code @lazy} annotation.
     * 
     * @param localizationAdapterProvider sets the provider for the localizationAdapter
     */
    @Inject
    @Lazy
    public void setLocalizationAdapter(final Provider<LocalizationAdapter> localizationAdapterProvider) {
    	this.localizationAdapterSupplier = Suppliers.memoize(() ->  localizationAdapterProvider.get());
    }

    @Override
    public void setApplicationContext(ApplicationContext applicationContext) throws BeansException {
        this.applicationContext = applicationContext;
    }
}
