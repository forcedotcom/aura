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
	clearValue: function(component) {
		component.set("v.value", "");
	},

	click: function(component, event) {
        event.preventDefault();
        var concreteCmp = component.getConcreteComponent();
        var _helper = concreteCmp.getDef().getHelper();
        _helper.displayDatePicker(component);
    },

    doInit: function(component, event, helper) {
    	// only add the placeholder when there is no date picker opener.
        if ($A.get("$Browser.formFactor") === "DESKTOP") {
            if (!component.get("v.displayDatePicker")) {
                component.set("v.placeholder", component.get("v.format"));
            }
            if (component.get("v.useManager")) {
                helper.checkManagerExists(component);
                component.set("v.loadDatePicker", false);
            }
        }
    },

    openDatePicker: function(component) {
        var concreteCmp = component.getConcreteComponent();
        var _helper = concreteCmp.getDef().getHelper();
        _helper.displayDatePicker(component);
    },

    inputDateFocus: function(component, event, helper) {
        var inputText = component.find("inputText").getElement().value;

        if ($A.util.isEmpty(inputText) && !component.get("v.disabled") && component.get("v.displayDatePicker")) {
            helper.displayDatePicker(component);
        }
    },

    // override ui:handlesDateSelected
    onDateSelected: function(component, event, helper) {
        helper.setValue(component, event);
    },

    // override ui:hasManager
    registerManager: function(component, event) {
        var sourceComponentId = event.getParam('sourceComponentId') || event.getParam("arguments").sourceComponentId;
        if ($A.util.isUndefinedOrNull(sourceComponentId)) {
            return;
        }

        var sourceComponent = $A.componentService.get(sourceComponentId);
        if (sourceComponent && sourceComponent.isInstanceOf("ui:datePickerManager")) {
            component.set("v.managerExists", true);
        }
    }

})// eslint-disable-line semi