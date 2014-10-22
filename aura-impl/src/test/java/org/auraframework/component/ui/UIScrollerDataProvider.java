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
package org.auraframework.component.ui;

import java.io.IOException;
import java.util.*;

import org.auraframework.system.Annotations.AuraEnabled;
import org.auraframework.system.Annotations.Controller;
import org.auraframework.system.Annotations.Key;
import org.auraframework.util.json.Json;
import org.auraframework.util.json.JsonSerializable;

@Controller
public class UIScrollerDataProvider {

    private static int PTR_COUNTER = 0;
    private static int PTL_COUNTER = 0;
    private static int INF_COUNTER = 0;
    @AuraEnabled
    public static List<Item> getItemsPTR(@Key("size") int size) throws Exception {
        List<Item> l = null;
        if(size > 0){
            l = new ArrayList<>(size);
            for (int i = 0; i < size; i++) {
                int id = ++PTR_COUNTER;
                l.add(new Item("After PTR, pretty row " + id + " from server", Integer.toString(id)));
            }
        }
        PTR_COUNTER = 0;
        return l;
    }

    @AuraEnabled
    public static List<Item> getItemsPTL(@Key("size") int size) throws Exception {
        List<Item> l = null;
        if(size > 0){
            l = new ArrayList<>(size);
            for (int i = 0; i < size; i++) {
                int id = ++PTL_COUNTER;
                l.add(new Item("After PTL, pretty row " + id + " from server", Integer.toString(id)));
            }
        }
        PTL_COUNTER = 0;
        return l;
    }

    @AuraEnabled
    public static List<Item> getItemsInfinite(@Key("size") int size) throws Exception {
        List<Item> l = null;
        if(size > 0){
            l = new ArrayList<>(size);
            for (int i = 0; i < size; i++) {
                int id = ++INF_COUNTER;
                l.add(new Item("After INF, pretty row " + id + " from server", Integer.toString(id)));
            }
        }
        INF_COUNTER = 0;
        return l;
    }

    public static class Item implements JsonSerializable {
        private String label;
        private String value;

        public Item(String label, String value) {
            this.label = label;
            this.value = value;
        }

        public String getLabel() {
            return this.label;
        }

        public String getValue() {
            return this.value;
        }

        @Override
        public void serialize(Json json) throws IOException {
            json.writeMapBegin();
            json.writeMapEntry("label", this.label);
            json.writeMapEntry("value", this.value);
            json.writeMapEnd();
        }
    }
}