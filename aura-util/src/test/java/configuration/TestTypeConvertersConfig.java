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
import org.auraframework.util.type.BadConverter;
import org.auraframework.util.type.Converter;
import org.auraframework.util.type.CustomAbstractType;
import org.auraframework.util.type.CustomAbstractTypeConverter;
import org.auraframework.util.type.CustomDupConverter1;
import org.auraframework.util.type.CustomDupConverter2;
import org.auraframework.util.type.CustomDupType;
import org.auraframework.util.type.CustomPairType;
import org.auraframework.util.type.CustomPairTypeParameterizedConverter;
import org.auraframework.util.type.MultiConverter;
import org.auraframework.util.type.StringToCustomPairArrayConverter;
import org.auraframework.util.type.StringToCustomPairConverter;

@AuraConfiguration
public class TestTypeConvertersConfig {
    @Impl
    public static Converter<String, CustomPairType> testUtilStringToCustomPairType() {
        return new StringToCustomPairConverter();
    }

    @Impl
    public static Converter<String, CustomPairType[]> testUtilStringToCustomPairArray() {
        return new StringToCustomPairArrayConverter();
    }

    @Impl
    public static Converter<String, CustomDupType> testUtilStringToCustomDupType1() {
        return new CustomDupConverter1();
    }

    @Impl
    public static Converter<String, CustomDupType> testUtilStringToCustomDupType2() {
        return new CustomDupConverter2();
    }

    @Impl
    public static Converter<CustomPairType, String> testConverterWithNulls() {
        return new BadConverter();
    }

    @Impl
    public static Converter<String, CustomPairType> testUtilStringToCustomPairParameterized() {
        return new CustomPairTypeParameterizedConverter();
    }
    
    @Impl
    public static MultiConverter<CustomAbstractType> testUtilStringToCustomAbstract() {
    	return new CustomAbstractTypeConverter();
    }
}
