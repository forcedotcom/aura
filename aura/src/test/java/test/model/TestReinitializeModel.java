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
package test.model;

import java.util.ArrayList;

import org.auraframework.Aura;
import org.auraframework.instance.BaseComponent;
import org.auraframework.system.Annotations.AuraEnabled;
import org.auraframework.system.Annotations.Model;
import org.auraframework.throwable.quickfix.QuickFixException;

@Model
public class TestReinitializeModel {
    @SuppressWarnings("unchecked")
    public TestReinitializeModel() throws QuickFixException {
        BaseComponent<?,?> c;

        c = Aura.getContextService().getCurrentContext().getCurrentComponent();

        if (c != null) {
            this.value = (String) c.getAttributes().getValue("attr");
            this.valueParent = (String) c.getAttributes().getValue("attrInParent");
            this.itemList = (ArrayList<String>) c.getAttributes().getValue("listToShow");
        } else {
            this.value = "attr";
            this.valueParent = "attrInParent";
            this.itemList = new ArrayList<String>();
        }
    }
    
    @AuraEnabled
    public String getValue() {
        return value;
    }
    
    @AuraEnabled
    public String getValueParent() {
        return valueParent;
    }
    
    @AuraEnabled
    public ArrayList<String> getItemList() {
        return itemList;
    }
    
    private String value;
    private String valueParent;
    private ArrayList<String> itemList;
}
