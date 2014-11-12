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
({
    updateTriggerLabel: function(cmp, event) {
        var triggerCmp = cmp.find("trigger");
        if (triggerCmp) {
            var source = event.getSource();
            var label = source.get("v.label");
            triggerCmp.set("v.label", label);
        }
    },
    updateLabel: function(cmp, event) {
        var triggerCmp = cmp.find("mytrigger");
        if (triggerCmp) {
            var source = event.getSource();
            var label = source.get("v.label");
            triggerCmp.set("v.label", label);
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
            triggerCmp.set("v.label", label);
        }
    },
    getMenuSelected: function(cmp, event) {
        var menuCmp = cmp.find("checkboxMenu");
        var menuItems = menuCmp.get("v.childMenuItems");
        var values = [];
        for (var i = 0; i < menuItems.length; i++) {
            var c = menuItems[i];
            if (c.get("v.selected") === true) {
                values.push(c.get("v.label"));
            }
        }
        var resultCmp = cmp.find("result");
        resultCmp.set("v.value", values.join(","));
    },
    getRadioMenuSelected: function(cmp, event) {
        var menuCmp = cmp.find("radioMenu");
        var menuItems = menuCmp.get("v.childMenuItems");
        var values = [];
        for (var i = 0; i < menuItems.length; i++) {
            var c = menuItems[i];
            if (c.get("v.selected") === true) {
                values.push(c.get("v.label"));
            }
        }
        var resultCmp = cmp.find("radioResult");
        resultCmp.set("v.value", values.join(","));
    },
    getRadioIterationMenuSelected: function(cmp, event) {
        var menuCmp = cmp.find("iterationRadioMenu");
        var menuItems = menuCmp.get("v.childMenuItems");
        var values = [];
        for (var i = 0; i < menuItems.length; i++) {
            var c = menuItems[i];
            if (c.get("v.selected") === true) {
                values.push(c.get("v.label"));
            }
        }
        var resultCmp = cmp.find("radioIterationResult");
        resultCmp.set("v.value", values.join(","));
    },
    menuCollapse: function(cmp){
    	 cmp.set("v.collapseEventFired", true);
    	 cmp.set("v.expandEventFired", false);
    },
    menuExpand: function(cmp){
   	 cmp.set("v.expandEventFired", true);
   	 cmp.set("v.collapseEventFired", false);
   },
   incrementMenuSelectFireCount : function(cmp, evt){
	   cmp.set("v.menuSelectFireCount", cmp.get("v.menuSelectFireCount") + 1);
   }
})
