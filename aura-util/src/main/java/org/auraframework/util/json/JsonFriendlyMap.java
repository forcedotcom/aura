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
package org.auraframework.util.json;

import java.util.*;

/**
 * A LinkedHashMap of String to Object, which is the variety most often useful for JSON Serialization purposes For added
 * usefulness, in addition to the standard Map methods, also has an add method that will create a List with the given
 * key (or use one that already exists), and then add the value to that List. Any entries with null values will be
 * omitted upon json serialization.
 */
public class JsonFriendlyMap extends LinkedHashMap<Object, Object> {

    public JsonFriendlyMap() {}

    public JsonFriendlyMap(Map<? extends Object, ? extends Object> m) {
        super(m);
    }

    private static final long serialVersionUID = 1L;

    @SuppressWarnings("unchecked")
    public <T> void add(String key, T value) {
        Object oldValue = get(key);

        List<T> valueList = null;
        if (oldValue == null) {
            valueList = new ArrayList<T>();
        } else if (oldValue.getClass().equals(value.getClass())) {
            valueList = new ArrayList<T>();
            valueList.add((T)oldValue);
        } else {
            valueList = (List<T>)oldValue;
        }
        valueList.add(value);

        put(key, valueList);
    }
}
