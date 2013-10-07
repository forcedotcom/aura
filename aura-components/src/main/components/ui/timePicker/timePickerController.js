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
        var is24HourFormat = component.getValue("v.is24HourFormat").getBooleanValue();
        if (is24HourFormat === false) {
            // Localize am/pm label
            var localizedData = $A.localizationService.getLocalizedDateTimeLabels();
            var ampm = localizedData._ampm;
            if (ampm) {
                var amOptCmp = component.find("amOpt");
                if (amOptCmp) {
                    amOptCmp.setValue("v.label", ampm.am); 
                }
                var pmOptCmp = component.find("pmOpt");
                if (pmOptCmp) {
                    pmOptCmp.setValue("v.label", ampm.pm); 
                } 
            }
        }
    },
    
    updateAmpm: function(component, event, helper) {
        var amPmCmp = component.find("ampm");
        var hours = component.get("v.hours");
        if (amPmCmp) {
            if (amPmCmp.get("v.value") == "am") {
                component.setValue("v.hours", parseInt(hours) - 12);
            } else {
                component.setValue("v.hours", parseInt(hours) + 12);
            }
        }
    },
    
    updateHours: function(component, event, helper) {
        var is24HourFormat = component.getValue("v.is24HourFormat").getBooleanValue();
        var hoursCmp = event.getSource();
        var errorCmp = component.find("hourError");
        var hoursValue = component.getValue("v.hours");
        if (hoursCmp && errorCmp) {
            var hours = hoursCmp.get("v.value");
            if (is24HourFormat === true) {
                if (helper.validateNumber(hours, 0, 23)) {
                    hoursCmp.removeClass("error");
                    errorCmp.setValue("v.value", []);
                    errorCmp.addClass("hide");
                    // update timePicker hours
                    helper.updateHourValue(component, hours);
                    component.setValue("v.isValid", true);
                } else {
                    hoursCmp.addClass("error");
                    errorCmp.setValue("v.value", ["Please input a valid hour value (0 - 23)."]);
                    errorCmp.removeClass("hide");
                    component.setValue("v.isValid", false);
                }
            } else {
                if (helper.validateNumber(hours, 1, 12)) {
                    hoursCmp.removeClass("error");
                    errorCmp.setValue("v.value", []);
                    errorCmp.addClass("hide");
                    // update timePicker hours
                    helper.updateHourValue(component, hours);
                    component.setValue("v.isValid", true);
                } else {
                    hoursCmp.addClass("error");
                    errorCmp.setValue("v.value", ["Please input a valid hour value (1 - 12)."]);
                    errorCmp.removeClass("hide");
                    component.setValue("v.isValid", false);
                }
            }
        }
    },
    
    updateMinutes: function(component, event, helper) {
        var minutesCmp = event.getSource();
        var errorCmp = component.find("minuteError");
        var minutesValue = component.getValue("v.minutes");
        if (minutesCmp && errorCmp) {
            var minutes = minutesCmp.get("v.value");
            if (helper.validateNumber(minutes, 0, 59)) {
                minutesCmp.removeClass("error"); 
                errorCmp.setValue("v.value", []);
                errorCmp.addClass("hide");
                helper.updateMinuteValue(component, minutes);
                component.setValue("v.isValid", true);
            } else {
                minutesCmp.addClass("error");
                errorCmp.setValue("v.value", ["Please input a valid minute value (0 - 59)."]);
                errorCmp.removeClass("hide");
                component.setValue("v.isValid", false);
            }
        }
    }
})