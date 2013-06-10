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
package org.auraframework.component.auradev;

import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

import org.auraframework.component.auradev.TestDataProviderController.Item;
import org.auraframework.system.Annotations.AuraEnabled;
import org.auraframework.system.Annotations.Model;

@Model
public class TestDataProviderModel {
    private final List<Item> items;
    
    public TestDataProviderModel() throws Exception {
        this.items = new ArrayList<Item>(10);
        for (int i = 0; i < 10; i++) {
            items.add(new Item("label" + i, "value" + i));
        } 
    }
    
    @AuraEnabled
    public List<Item> getItems() throws SQLException {
        return items;
    }
}