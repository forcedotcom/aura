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
package org.auraframework.impl.java.model;

import java.util.List;
import java.util.Map;

import org.auraframework.system.Annotations.AuraEnabled;
import org.auraframework.system.Annotations.Model;

import com.google.common.collect.Lists;
import com.google.common.collect.Maps;

@Model
public class ValueChangeModel {

    private final Map<String, String> map = Maps.newHashMap();
    private final List<String> list = Lists.newArrayList();

    @AuraEnabled
    public Map<String, String> getMap() {
        return map;
    }

    @AuraEnabled
    public String getString() {
        return "hey";
    }

    @AuraEnabled
    public List<String> getList() {
        return list;
    }

    @AuraEnabled
    public int getRecurseADepth() {
        return 0;
    }

    @AuraEnabled
    public String getRecurseA() {
        return "A";
    }

    @AuraEnabled
    public int getRecurseBDepth() {
        return 0;
    }

    @AuraEnabled
    public String getRecurseB() {
        return "B";
    }

    @AuraEnabled
    public int getRecurseCDepth() {
        return 0;
    }

    @AuraEnabled
    public String getRecurseC() {
        return "C";
    }

    @AuraEnabled
    public String getChained() {
        return "chained";
    }

    @AuraEnabled
    public String getUnchained() {
        return "unchained";
    }
}
