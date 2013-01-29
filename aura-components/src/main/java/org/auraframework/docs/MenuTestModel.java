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

import java.util.ArrayList;
import java.util.List;

import org.auraframework.components.ui.MenuItem;
import org.auraframework.system.Annotations.AuraEnabled;
import org.auraframework.system.Annotations.Model;

/**
 * Model for auradocs:demoMenu to demo aura:menu
 */
@Model
public class MenuTestModel {

    @AuraEnabled
    public List<MenuItem> getData() {
        ArrayList<MenuItem> a = new ArrayList<MenuItem>(3);
        MenuItem m1 = new MenuItem("Heavenly", true, "checkbox");
        a.add(m1);
        MenuItem m2 = new MenuItem("Kirkwood", false, "checkbox");
        a.add(m2);
        MenuItem m3 = new MenuItem("North Star", false, "checkbox");
        a.add(m3);
        MenuItem m4 = new MenuItem("Square Valley", true, "checkbox");
        a.add(m4);
        return a;
    }
    
    @AuraEnabled
    public List<MenuItem> getPlaces() {
        ArrayList<MenuItem> a = new ArrayList<MenuItem>(3);
        MenuItem m1 = new MenuItem("Heavenly", true, "action");
        a.add(m1);
        MenuItem m2 = new MenuItem("North Star", false, "action");
        a.add(m2);
        MenuItem m3 = new MenuItem("Square Valley", true, "action");
        a.add(m3);
        return a;
    }
}