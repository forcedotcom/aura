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

import java.math.BigDecimal;
import java.util.*;

import org.auraframework.Aura;
import org.auraframework.def.ComponentDef;
import org.auraframework.instance.Component;
import org.auraframework.system.Annotations.AuraEnabled;
import org.auraframework.system.Annotations.Model;
import org.auraframework.system.Annotations.Type;

@Model
public class TestModelWithAuraTypeAnnotation {

    /**
     * Basic data type.
     */
    @AuraEnabled
    @Type("aura://String")
    public String getString() {
        return "Model";
    }

    @AuraEnabled
    @Type("AURA://INTEGER")
    public Integer getInteger() {
        return 123;
    }

    @AuraEnabled
    @Type("aura://Long")
    public Long getLong() {
        return 123l;
    }

    @AuraEnabled
    @Type("aura://Double")
    public Double getDouble() {
        return 1.23;
    }

    @AuraEnabled
    @Type("aura://Decimal")
    public BigDecimal getDecimal() {
        return new BigDecimal(3.1415);
    }

    @AuraEnabled
    @Type("aura://Boolean")
    public Boolean getBoolean() {
        return true;
    }

    @AuraEnabled
    @Type("aura://Date")
    public Date getDate() {
        return new Date(1095957000000l); // "09/23/2004"
    }

    @AuraEnabled
    @Type("aura://Object")
    public Object getObject() {
        return "Aura";
    }

    @AuraEnabled
    @Type("aura://Map")
    public Map<String, String> getStringMap() {
        return new HashMap<String, String>();
    }

    // List of basic data type
    @AuraEnabled
    @Type("aura://List<String>")
    public List<String> getStringList() {
        return new ArrayList<String>();
    }

    // Set of basic data type
    @AuraEnabled
    @Type("aura://Set<String>")
    public Set<String> getStringSet() {
        return new HashSet<String>();
    }

    // Array of basic data type
    @AuraEnabled
    @Type("aura://String[]")
    public String[] getStringArray() {
        return new String[] { "one", "two" };
    }

    @AuraEnabled
    @Type("aura://List<Map>")
    public List<Map<String, String>> getListOfMaps() {
        Map<String, String> m = new HashMap<String, String>();
        List<Map<String, String>> l = new ArrayList<Map<String, String>>();
        l.add(m);
        return l;
    }

    @AuraEnabled
    @Type("aura://Set<Map>")
    public Set<Map<String, String>> getSetOfMaps() {
        Map<String, String> m = new HashMap<String, String>();
        Set<Map<String, String>> s = new HashSet<Map<String, String>>();
        s.add(m);
        return s;
    }

    @AuraEnabled
    @Type("aura://List<List>")
    public List<List<String>> getListOfList() {
        List<String> l = new ArrayList<String>();
        List<List<String>> ll = new ArrayList<List<String>>();
        ll.add(l);
        return ll;
    }

    @AuraEnabled
    @Type("aura://Set<List>")
    public Set<List<String>> getSetOfList() {
        List<String> l = new ArrayList<String>();
        Set<List<String>> s = new HashSet<List<String>>();
        s.add(l);
        return s;
    }

    @AuraEnabled
    @Type("aura://List<Set>")
    public List<Set<String>> getListOfSet() {
        Set<String> s = new HashSet<String>();
        List<Set<String>> l = new ArrayList<Set<String>>();
        l.add(s);
        return l;
    }

    @AuraEnabled
    @Type("aura://Set<Set>")
    public Set<Set<String>> getSetOfSet() {
        Set<String> s = new HashSet<String>();
        Set<Set<String>> ss = new HashSet<Set<String>>();
        ss.add(s);
        return ss;
    }

    @AuraEnabled
    @Type("Aura.Component")
    public Component getAuraComponent() throws Exception {
        return (Component) Aura.getInstanceService().getInstance("test:text", ComponentDef.class, null);
    }

    @AuraEnabled
    @Type("Aura.Component[]")
    public Component[] getAuraComponentArray() throws Exception {
        Component[] ret = new Component[2];
        ret[0] = (Component) Aura.getInstanceService().getInstance("test:text", ComponentDef.class, null);
        ret[1] = (Component) Aura.getInstanceService().getInstance("test:test_button", ComponentDef.class, null);
        return ret;
    }
}
