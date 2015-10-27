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
    updateTriggerLabel: function(cmp, event, helper) {
        helper.handleUpdateTriggerLabel(cmp, event, "trigger");
    },
    updateTriggerLabelForNestedMenuItems: function(cmp, event, helper) {
        helper.handleUpdateTriggerLabel(cmp, event, "triggerNested");
    },
    updateLabel: function(cmp, event, helper) {
        helper.handleUpdateTriggerLabel(cmp, event, "mytrigger");
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
    getMenuSelected: function(cmp, event, helper) {
        helper.menuSelect(cmp, event, "checkboxMenu");
    },
    getRadioMenuSelected: function(cmp, event, helper) {
        helper.menuSelect(cmp, event, "radioMenu");
    },
    getRadioIterationMenuSelected: function(cmp, event, helper) {
        helper.menuSelect(cmp, event, "iterationRadioMenu");
    },
    getRadioConditionMenuSelected: function(cmp, event, helper) {
        helper.menuSelect(cmp, event, "conditionRadioMenu");
    },
    getConditionIterationMenuSelected: function(cmp, event, helper) {
        helper.menuSelect(cmp, event, "conditionIterationMenu");
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
   },
   countFocus: function (cmp) {
       var counterLabel = "v.focus_counter";
       var focusCounter = cmp.get(counterLabel);
       cmp.set(counterLabel, focusCounter + 1);
   },
   countBlur: function (cmp) {
       var counterLabel = "v.blur_counter";
       var blurCounter = cmp.get(counterLabel);
       cmp.set(counterLabel, blurCounter + 1);
   }   
})
