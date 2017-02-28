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
package org.auraframework.util.type.converter;

import java.util.ArrayList;
import java.util.Collections;
import org.auraframework.annotations.Annotations.ServiceComponent;
import org.auraframework.util.type.Converter;
import org.springframework.context.annotation.Lazy;


/**
 * Convert strings to array lists.
 *
 * The suppress warnings here is because of the broken Java handling of
 * parameterized types. it is not possible to properly type things here (syntax
 * errors result).
 */
@Lazy
@SuppressWarnings("rawtypes")
@ServiceComponent
public class StringArrayToArrayListConverter implements Converter<String[], ArrayList> {

    /**
     * Convert an incoming string value to an arraylist of strings.
     *
     * A couple of oddities here. Inputs of null will return null, and empty
     * strings will return an empty list.
     *
     * @param value the incoming value.
     */
    @Override
    public ArrayList<String> convert(String[] value) {
        if (value == null || value.length == 0) {
            return new ArrayList<>();
        }
        
        ArrayList<String> list = new ArrayList<String>();
        Collections.addAll(list, value);
        return list;
    }

    @Override
    public Class<String[]> getFrom() {
        return String[].class;
    }

    @Override
    public Class<ArrayList> getTo() {
        return ArrayList.class;
    }

    @Override
    public Class<?>[] getToParameters() {
        return null;
    }
}
