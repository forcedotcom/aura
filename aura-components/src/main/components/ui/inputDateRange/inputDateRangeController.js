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
    doInit: function(component, event, helper) {
        var format = component.get("v.format");
        if ($A.util.isEmpty(format)) {
            format = $A.get("$Locale.dateFormat");
        }
        if ($A.util.isEmpty(component.get("v.startInputPlaceholder"))) {
            component.set("v.startInputPlaceholder", format);
        }
        if ($A.util.isEmpty(component.get("v.endInputPlaceholder"))) {
            component.set("v.endInputPlaceholder", format);
        }
    },

    clickStart: function(component, event, helper) {
        event.preventDefault();
        var _helper = component.getConcreteComponent().getDef().getHelper();
        _helper.openStartDatePicker(component);
    },

    clickEnd: function(component, event, helper) {
        event.preventDefault();
        var _helper = component.getConcreteComponent().getDef().getHelper();
        _helper.openEndDatePicker(component);
    },

    openStartDatePicker: function(component, event, helper) {
        var _helper = component.getConcreteComponent().getDef().getHelper();
        _helper.openStartDatePicker(component);
    },

    openEndDatePicker: function(component, event, helper) {
        var _helper = component.getConcreteComponent().getDef().getHelper();
        _helper.openEndDatePicker(component);
    },

    setValue: function(component, event, helper) {
        var _helper = component.getConcreteComponent().getDef().getHelper();
        var dateValue = event.getParam("value");

        if (!$A.util.isEmpty(dateValue)) {
            if (component._lastOpenInput === "StartDate") {
                _helper.setStartDateValue(component, dateValue);
            } else if (component._lastOpenInput === "EndDate") {
                _helper.setEndDateValue(component, dateValue);
            }
        }
    }
})// eslint-disable-line semi