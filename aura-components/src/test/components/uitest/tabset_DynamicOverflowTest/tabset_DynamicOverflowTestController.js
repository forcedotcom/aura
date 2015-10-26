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
	loadTabs: function(cmp, evt, helper) {
		helper.loadTabs(cmp, 1);
	},
	
	loadMultiTabsets: function(cmp, evt, helper) {
        helper.loadTabs(cmp, "Fixed");
        helper.loadTabs(cmp, 50);
        helper.loadTabs(cmp, 75);
    },
    
    loadAutomationTabsets: function(cmp, evt, helper) {
    	helper.loadTabs(cmp, "ForAutomation");
    },
    
    toggleIsCloseable: function(cmp) {
    	cmp.set("v.isCloseable", $A.util.getBooleanValue(cmp.find("inputIsCloseable").get("v.value")));
    },
    
    toggleIsNestedTabs: function(cmp) {
    	cmp.set("v.isNestedTabs", $A.util.getBooleanValue(cmp.find("inputIsNestedTabs").get("v.value")));
    },
    
    addTab: function(cmp, evt, helper) {
    	var container = cmp.get("v.targetContainer");
    	helper.addTab(cmp, container);
    },
    
    removeTab: function(cmp, evt, helper) {
    	var container = cmp.get("v.targetContainer");
    	helper.removeTab(cmp, container);
    },
    
    changeHeaderTitle: function(cmp, evt, helper) {
    	var container = cmp.get("v.targetContainer");
    	helper.changeHeaderTitle(cmp, container);
    },
    
    updateTargetContainerAddRemove: function(cmp, evt, helper) {
    	helper.updateTargetContainer(cmp, "inputTargetContainerAddRemove");
    },
    
    updateTargetContainerChangeTitle: function(cmp, evt, helper) {
    	helper.updateTargetContainer(cmp, "inputTargetContainerChangeTitle");
    }
})