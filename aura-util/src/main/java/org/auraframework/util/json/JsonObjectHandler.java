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

import java.util.Map;

import com.google.common.collect.Maps;

/**
 * Base (default) implementation of JsonObjectHandler. When an object is
 * encountered, put will be called for each entry in the map. This
 * implementation adds each item to a Map<String, Object>. If you would like to
 * do something else with each entry, extend this class and override all of the
 * methods.
 */
public class JsonObjectHandler implements JsonHandler {

    private final Map<String, Object> map = Maps.newHashMap();

    public void put(String key, Object value) throws JsonValidationException {
        map.put(key, value);
    }

    @Override
    public Object getValue() {
        return map;
    }
}
