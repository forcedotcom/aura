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
({
    updateTriggerLabel: function(cmp, event) {
        var triggerCmp = cmp.find("trigger");
        if (triggerCmp) {
            var source = event.getSource();
            var label = source.get("v.label");
            triggerCmp.setValue("v.label", label); 
        }
    },
    updateLabel: function(cmp, event) {
        var triggerCmp = cmp.find("mytrigger");
        if (triggerCmp) {
            var source = event.getSource();
            var label = source.get("v.label");
            triggerCmp.setValue("v.label", label); 
        }
    },
    clickMenu: function(cmp, event) {
        var source = event.getSource();
        var label = source.get("v.label");
        console.log("click menu item " + label);
    },
    pickPlace: function(cmp, event) {
        var triggerCmp = cmp.find("metadataAction");
        if (triggerCmp) {
            var source = event.getParam("selectedItem");
            var label = source.get("v.label");
            triggerCmp.setValue("v.label", label); 
        }
    },
    getMenuSelected: function(cmp, event) {
        var menuCmp = cmp.find("checkboxMenu");
        var menuItems = menuCmp.getValue("v.childMenuItems");
        var values = [];
        for (var i = 0; i < menuItems.getLength(); i++) {
            var c = menuItems.getValue(i);
            if (c.get("v.selected") === true) {
                values.push(c.get("v.label"));
            }
        }
        var resultCmp = cmp.find("result");
        resultCmp.setValue("v.value", values.join(","));
    },
    getRadioMenuSelected: function(cmp, event) {
        var menuCmp = cmp.find("radioMenu");
        var menuItems = menuCmp.getValue("v.childMenuItems");
        var values = [];
        for (var i = 0; i < menuItems.getLength(); i++) {
            var c = menuItems.getValue(i);
            if (c.get("v.selected") === true) {
                values.push(c.get("v.label"));
            }
        }
        var resultCmp = cmp.find("radioResult");
        resultCmp.setValue("v.value", values.join(","));
    }
})
