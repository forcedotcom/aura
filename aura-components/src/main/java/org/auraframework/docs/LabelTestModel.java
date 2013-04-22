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
package org.auraframework.docs;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;

import org.auraframework.components.ui.MenuItem;
import org.auraframework.system.Annotations.AuraEnabled;
import org.auraframework.system.Annotations.Model;

/**
 * Model for auradocs:demoLabel to demo ui:label
 */
@Model
public class LabelTestModel {
    @AuraEnabled
    public List<Object> getIterationItems() {
        List<Object> menuItem = new LinkedList<Object>();
        for (int i = 0; i < 4; i++) {
            Map<String, Object> theMap = new HashMap<String, Object>();
            theMap.put("label","label" + i );
            theMap.put("value", "value" + i);
            menuItem.add(theMap);
        }
        return menuItem;
    }
}