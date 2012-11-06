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
/**
 */
package org.auraframework.impl.java.model;

import java.util.*;

import com.google.common.collect.ImmutableList;

import org.auraframework.system.Annotations.AuraEnabled;
import org.auraframework.system.Annotations.Model;

/**
 * for iterationTest components
 *
 * @since
 */
@Model
public class TestIterationModel {

    private final List<Object> data;
    private final List<Object> capitaldata;
    private final List<String> innerdata;

    public TestIterationModel() {
        data = new LinkedList<Object>();
        capitaldata = new LinkedList<Object>();
        for (int i = 0; i < 26; i++) {
            Map<String, Object> dora = new HashMap<String, Object>();
            char c = (char)('a' + i);
            dora.put("stringy", "" + c + c + c);
            dora.put("whatever", "hooray for everybody");
            data.add(dora);
            dora = new HashMap<String, Object>();
            c = (char)('A' + i);
            dora.put("stringy", "" + c + c + c + c + c);
            dora.put("whatever", "boo for nobody");
            capitaldata.add(dora);
        }
        innerdata = ImmutableList.of("gah", "bah", "stah", "brah", "yah", "nah", "hah");
    }

    @AuraEnabled
    public List<Object> getData() {
        return data;
    }

    @AuraEnabled
    public List<Object> getCapitalData() {
        return capitaldata;
    }

    @AuraEnabled
    public List<String> getInnerData() {
        return innerdata;
    }

    @AuraEnabled
    public String getDerp() {
        return "DERP";
    }
}
