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
package configuration;

import org.auraframework.util.ServiceLoaderImpl.AuraConfiguration;
import org.auraframework.util.ServiceLoaderImpl.Impl;
import org.auraframework.util.adapter.SourceControlAdapter;
import org.auraframework.util.adapter.SourceControlAdapterImpl;
import org.auraframework.util.json.DefaultJsonSerializer;
import org.auraframework.util.type.Converter;
import org.auraframework.util.type.converter.ArrayListToBooleanArrayConverter;
import org.auraframework.util.type.converter.ArrayListToDateArrayConverter;
import org.auraframework.util.type.converter.ArrayListToIntegerArrayConverter;
import org.auraframework.util.type.converter.ArrayListToStringArrayConverter;
import org.auraframework.util.type.converter.BigDecimalToIntegerConverter;
import org.auraframework.util.type.converter.BigDecimalToLongConverter;
import org.auraframework.util.type.converter.BigDecimalToStringConverter;
import org.auraframework.util.type.converter.BooleanToStringConverter;
import org.auraframework.util.type.converter.IntegerToStringConverter;
import org.auraframework.util.type.converter.LongToDateConverter;
import org.auraframework.util.type.converter.LongToIntegerConverter;
import org.auraframework.util.type.converter.LongToStringConverter;
import org.auraframework.util.type.converter.StringToArrayListConverter;
import org.auraframework.util.type.converter.StringToBigDecimalConverter;
import org.auraframework.util.type.converter.StringToBooleanConverter;
import org.auraframework.util.type.converter.StringToCalendarConverter;
import org.auraframework.util.type.converter.StringToDateConverter;
import org.auraframework.util.type.converter.StringToDateOnlyConverter;
import org.auraframework.util.type.converter.StringToDoubleConverter;
import org.auraframework.util.type.converter.StringToHashMapConverter;
import org.auraframework.util.type.converter.StringToHashSetConverter;
import org.auraframework.util.type.converter.StringToIntegerConverter;
import org.auraframework.util.type.converter.StringToListConverter;
import org.auraframework.util.type.converter.StringToLongConverter;
import org.auraframework.util.type.converter.StringToStringArrayConverter;

/**
 */
@AuraConfiguration
public class AuraUtilConfig {

    @Impl
    public static DefaultJsonSerializer auraUtilDefaultJsonSerializer() {
        return new DefaultJsonSerializer();
    }

    @Impl
    public static SourceControlAdapter auraUtilSourceControlAdapter() {
        return new SourceControlAdapterImpl();
    }

    @Impl
    public static Converter<?, ?> auraUtilArrayListToBooleanArrayConverter() {
        return new ArrayListToBooleanArrayConverter();
    }

    @Impl
    public static Converter<?, ?> auraUtilArrayListToDateArrayConverter() {
        return new ArrayListToDateArrayConverter();
    }

    @Impl
    public static Converter<?, ?> auraUtilArrayListToIntegerArrayConverter() {
        return new ArrayListToIntegerArrayConverter();
    }

    @Impl
    public static Converter<?, ?> auraUtilArrayListToStringArrayConverter() {
        return new ArrayListToStringArrayConverter();
    }

    @Impl
    public static Converter<?, ?> auraUtilBigDecimalToIntegerConverter() {
        return new BigDecimalToIntegerConverter();
    }

    @Impl
    public static Converter<?, ?> auraUtilBigDecimalToLongConverter() {
        return new BigDecimalToLongConverter();
    }

    @Impl
    public static Converter<?, ?> auraUtilBigDecimalToStringConverter() {
        return new BigDecimalToStringConverter();
    }

    @Impl
    public static Converter<?, ?> auraUtilBooleanToStringConverter() {
        return new BooleanToStringConverter();
    }

    @Impl
    public static Converter<?, ?> auraUtilIntegerToStringConverter() {
        return new IntegerToStringConverter();
    }

    @Impl
    public static Converter<?, ?> auraUtilLongToDateConverter() {
        return new LongToDateConverter();
    }

    @Impl
    public static Converter<?, ?> auraUtilLongToIntegerConverter() {
        return new LongToIntegerConverter();
    }

    @Impl
    public static Converter<?, ?> auraUtilLongToStringConverter() {
        return new LongToStringConverter();
    }

    @Impl
    public static Converter<?, ?> auraUtilStringToArrayListConverter() {
        return new StringToArrayListConverter();
    }

    @Impl
    public static Converter<?, ?> auraUtilStringToBigDecimalConverter() {
        return new StringToBigDecimalConverter();
    }

    @Impl
    public static Converter<?, ?> auraUtilStringToBooleanConverter() {
        return new StringToBooleanConverter();
    }

    @Impl
    public static Converter<?, ?> auraUtilStringToCalendarConverter() {
        return new StringToCalendarConverter();
    }

    @Impl
    public static Converter<?, ?> auraUtilStringToDateConverter() {
        return new StringToDateConverter();
    }

    @Impl
    public static Converter<?, ?> auraUtilStringToDateOnlyConverter() {
        return new StringToDateOnlyConverter();
    }

    @Impl
    public static Converter<?, ?> auraUtilStringToDoubleConverter() {
        return new StringToDoubleConverter();
    }

    @Impl
    public static Converter<?, ?> auraUtilStringToHashMapConverter() {
        return new StringToHashMapConverter();
    }

    @Impl
    public static Converter<?, ?> auraUtilStringToHashSetConverter() {
        return new StringToHashSetConverter();
    }

    @Impl
    public static Converter<?, ?> auraUtilStringToIntegerConverter() {
        return new StringToIntegerConverter();
    }

    @Impl
    public static Converter<?, ?> auraUtilStringToListConverter() {
        return new StringToListConverter();
    }

    @Impl
    public static Converter<?, ?> auraUtilStringToLongConverter() {
        return new StringToLongConverter();
    }

    @Impl
    public static Converter<?, ?> auraUtilStringToStringArrayConverter() {
        return new StringToStringArrayConverter();
    }

}
