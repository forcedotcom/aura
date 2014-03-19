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

	private static int COUNTER = -1;
	
    @AuraEnabled
    public static List<Item> getItems(@Key("size") int size) throws Exception {
    	List<Item> l = null;
    	if(size > 0){
	        l = new ArrayList<Item>(size);
	        for (int i = 0; i < size; i++) {
	        	int id = ++COUNTER;
	            l.add(new Item("Pretty row " + id + " from server", Integer.toString(id)));
	        }
    	}
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