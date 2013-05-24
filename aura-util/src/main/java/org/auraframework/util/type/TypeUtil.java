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

import java.util.Map;
import java.util.Set;

import org.auraframework.util.ServiceLocator;

import com.google.common.collect.Maps;

/**
 * Type conversion utility.
 */
public class TypeUtil {

    // cached converters
    private final Map<String, Map<String, Converter<?, ?>>> converters = Maps.newHashMap();
    private final Map<String, Map<String, Map<String, Converter<?, ?>>>> parameterizedConverters = Maps.newHashMap();
    private final Map<String, Map<String, MultiConverter<?>>> multiConverters = Maps.newHashMap();

    private static final TypeUtil instance = new TypeUtil();

    private static final TypeUtil get() {
        return instance;
    }

    private TypeUtil() {
        for (Converter<?, ?> converter : ServiceLocator.get().getAll(Converter.class)) {
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

                Map<String, Converter<?, ?>> toMap = converters.get(from);
                Map<String, Map<String, Converter<?, ?>>> paramToMap = parameterizedConverters.get(from);
                if (toMap == null) {
                    toMap = Maps.newHashMap();
                    converters.put(from, toMap);
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
                        converter = new ConverterInitError<Object, Object>(String.format(
                                "More than one converter registered for %s to %s<%s>.  Using %s.", from, to,
                                toParamNames.toString(), paramMap.get(toParamNames.toString())));
                    }
                    paramMap.put(toParamNames.toString(), converter);
                } else {
                    if (toMap.containsKey(to)) {
                        converter = new ConverterInitError<Object, Object>(String.format(
                                "More than one converter registered for %s to %s.  Using %s.", from, to, toMap.get(to)));
                    }
                    toMap.put(to, converter);
                }
            }
        }
        
        for (MultiConverter<?> multiConverter : ServiceLocator.get().getAll(MultiConverter.class)) {
            Class<?> fromClass = multiConverter.getFrom();
            Set<Class<?>> toClasses = multiConverter.getTo();
            
            if (fromClass == null || toClasses == null) {
                System.err.println("Invalid multiconverter not registered : " + multiConverter);
            } else {
                String from = fromClass.getName();

                Map<String, MultiConverter<?>> toMap = multiConverters.get(from);
                if (toMap == null) {
                    toMap = Maps.newHashMap();
                    multiConverters.put(from, toMap);
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

    public static <F, T> T convertNoTrim(F value, Class<T> to) {
        return convert(value, to, null, false);
    }

    public static <F, T> T convert(F value, Class<T> to) {
        return convert(value, to, null, true);
    }

    public static <F, T> T convert(F value, Class<T> to, boolean trim) {
        return convert(value, to, null, trim);
    }

    public static <F, T> T convertNoTrim(F value, Class<T> to, String of) {
        return convert(value, to, of, false);
    }

    public static <F, T> T convert(F value, Class<T> to, String of) {
        return convert(value, to, of, true);
    }

    /**
     * Attempts to convert value to the type specified by 'to'. If 'of' is not
     * null, it indicates that 'to' is a container of 'of' types.
     * 
     * To add supported Conversions, drop a new implementation of Converter into
     * the aura.util.type.converter directory.
     */
    @SuppressWarnings("unchecked")
    public static <F, T> T convert(F value, Class<T> to, String of, boolean trim) {

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

    @SuppressWarnings("unchecked")
    private static <F, T> Converter<F, T> getConverter(Class<F> from, Class<T> to, String of) {
        TypeUtil typeUtil = get();
        if (of == null) {
            Map<String, Converter<?, ?>> map = typeUtil.converters.get(from.getName());
            if (map != null) {
                return (Converter<F, T>) map.get(to.getName());
            }
        } else {
            Map<String, Map<String, Converter<?, ?>>> converters = typeUtil.parameterizedConverters.get(from.getName());
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
	private static <T> MultiConverter<T> getMultiConverter(Class<?> from, Class<T> to) {
    	TypeUtil typeUtil = get();
        Map<String, MultiConverter<?>> map = typeUtil.multiConverters.get(from.getName());
        if (map != null) {
            return (MultiConverter<T>)map.get(to.getName());
        }

        return null;
    }
    
    public static boolean hasConverter(Class<?> from, Class<?> to, String of) {
        return getConverter(from, to, of) != null || (of == null && getMultiConverter(from, to) != null);
    }

    public static class ConversionException extends RuntimeException {

        private static final long serialVersionUID = 297189337708675095L;

        public ConversionException(String msg) {
            super(msg);
        }

    }

    private static class ConverterInitError<F, T> implements Converter<F, T> {

        private final String error;

        private ConverterInitError(String error) {
            this.error = error;
        }

        @Override
        public T convert(F value) {
            throw new ConversionException(error);
        }

        @Override
        public Class<F> getFrom() {
            throw new ConversionException(error);
        }

        @Override
        public Class<T> getTo() {
            throw new ConversionException(error);
        }

        @Override
        public Class<?>[] getToParameters() {
            throw new ConversionException(error);
        }
    }

    private static class MultiConverterInitError implements MultiConverter<Object> {
    	 private final String error;

         private MultiConverterInitError(String error) {
             this.error = error;
         }

		@Override
		public Object convert(Class<? extends Object> toClass, Object fromValue) {
			throw new ConversionException(error);
		}

		@Override
		public Class<?> getFrom() {
			throw new ConversionException(error);
		}

		@Override
		public Set<Class<?>> getTo() {
			throw new ConversionException(error);
		}
    }
}
