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
        if (helper.validateHours(component)) {
            var hoursCmp = event.getSource();
            if (hoursCmp) {
                helper.updateHourValue(component, hoursCmp.get("v.value"));
                component.setValue("v.isValid", true);
                return;
            }
        }
        component.setValue("v.isValid", false);
    },
    
    updateMinutes: function(component, event, helper) {
        if (helper.validateMinutes(component)) {
            var minutesCmp = event.getSource();
            if (minutesCmp) {
                helper.updateMinuteValue(component, minutesCmp.get("v.value"));
                component.setValue("v.isValid", true);
                return;
            }
        }
        component.setValue("v.isValid", false);
    }
})