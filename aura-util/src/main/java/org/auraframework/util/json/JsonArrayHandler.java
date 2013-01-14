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

import java.util.List;

import com.google.common.collect.Lists;

/**
 * Base (default) implementation of JsonArrayHandler. When an array is
 * encountered, add will be called for each element in the array. This
 * implementation adds each item to a List<Object>. If you would like to do
 * something else with each item, extend this class and override all of the
 * methods.
 */
public class JsonArrayHandler implements JsonHandler {

    List<Object> list = Lists.newArrayList();

    public void add(Object o) throws JsonValidationException {
        list.add(o);
    }

    @Override
    public Object getValue() {
        return list;
    }

}
