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
package org.auraframework.docs;

import java.util.HashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;

import org.auraframework.system.Annotations.AuraEnabled;
import org.auraframework.system.Annotations.Model;

/**
 * for aura:iteration docs modified from TestIterationModel.java
 */
@Model
public class SampleIterationModel {

    private final List<Object> data;

    public SampleIterationModel() {
        data = new LinkedList<Object>();
        for (int i = 0; i < 26; i++) {
            Map<String, Object> theMap = new HashMap<String, Object>();
            char c = (char) ('a' + i);
            theMap.put("letters", "" + c + c + c);
            data.add(theMap);
        }
    }

    @AuraEnabled
    public List<Object> getData() {
        return data;
    }
}
