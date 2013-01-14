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
package org.auraframework.impl.java.model;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.TreeSet;

import org.auraframework.system.Annotations.AuraEnabled;
import org.auraframework.system.Annotations.Model;
import org.auraframework.system.Annotations.Type;

@Model
public class TestModelWithJavaTypeAnnotation {
    /**
     * Basic Date type
     */
    @AuraEnabled
    @Type("java://java.lang.String")
    public String getJavaString() {
        return "Java";
    }

    @AuraEnabled
    @Type("String")
    public String getString() {
        return "Model";
    }

    @AuraEnabled
    @Type("Integer")
    public Integer getInteger() {
        return 123;
    }

    @AuraEnabled
    @Type("Long")
    public Long getLong() {
        return 123l;
    }

    @AuraEnabled
    @Type("Double")
    public Double getDouble() {
        return 1.23;
    }

    @AuraEnabled
    @Type("Decimal")
    public BigDecimal getDecimal() {
        return new BigDecimal(3.1415);
    }

    @AuraEnabled
    @Type("Boolean")
    public Boolean getBoolean() {
        return true;
    }

    @AuraEnabled
    @Type("Date")
    public Date getDate() {
        return new Date(1095957000000l); // "09/23/2004"
    }

    @AuraEnabled
    @Type("Object")
    public Object getObject() {
        return "Aura";
    }

    @AuraEnabled
    @Type("Map<String, String>")
    public Map<String, String> getStringMap() {
        return new HashMap<String, String>();
    }

    // List of basic data type
    @AuraEnabled
    @Type("List<String>")
    public List<String> getStringList() {
        return new ArrayList<String>();
    }

    // Set of basic data type
    @AuraEnabled
    @Type("Set<String>")
    public Set<String> getStringSet() {
        return new TreeSet<String>();
    }

    // Array of basic data type
    @AuraEnabled
    @Type("String[]")
    public String[] getStringArray() {
        return new String[] { "one", "two" };
    }

    /**
     * @AuraEnabled
     */
}
