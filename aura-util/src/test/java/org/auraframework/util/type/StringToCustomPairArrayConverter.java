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

import org.auraframework.annotations.Annotations.ServiceComponent;
import org.springframework.context.annotation.Lazy;

import java.util.ArrayList;

@Lazy
@ServiceComponent
public class StringToCustomPairArrayConverter implements Converter<String, CustomPairType[]> {

    @Override
    public CustomPairType[] convert(String value) {
        if (!value.startsWith("[") && !value.endsWith("]")) {
            return new CustomPairType[] {};
        }
        value = value.substring(1, value.length() - 1);
        ArrayList<CustomPairType> ret = new ArrayList<>();
        Converter<String, CustomPairType> customPairTypeConverter = new CustomPairTypeParameterizedConverter();
        for (String parts : value.split(",")) {
            ret.add(customPairTypeConverter.convert(parts));
        }
        return ret.toArray(new CustomPairType[ret.size()]);
    }

    @Override
    public Class<String> getFrom() {
        return String.class;
    }

    @Override
    public Class<CustomPairType[]> getTo() {
        return CustomPairType[].class;
    }

    @Override
    public Class<?>[] getToParameters() {
        return null;
    }

}
