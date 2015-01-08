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
	init: function(component, event, helper) {
		var hourError = component.find("hourError");
		var minError = component.find("minuteError");
		
		component.find("hours").set("v.ariaDescribedBy", hourError.getGlobalId());
		component.find("minutes").set("v.ariaDescribedBy", minError.getGlobalId());
	},
	
	updateAmpm: function(component, event, helper) {
    	var amPmCmp = component.find("ampm");
        var isAndroid = $A.get("$Browser.isAndroid");
        if (isAndroid === true) { // On Android, if hour field is changed and then ampm select is clicked, 
        	                      // the focus is still in hour field. That is, the hour value doesn't get updated.
            var hoursCmp = component.find("hours");
            var currentHourValue = hoursCmp.getElement().value;
            hoursCmp.set("v.value", currentHourValue); 
            if (helper.validateHours(component)) {
                if (amPmCmp) { // it must be in 12 hour format
                    if (amPmCmp.get("v.value") == "am") {
                        component.set("v.hours", parseInt(currentHourValue));
                    } else {
                        component.set("v.hours", parseInt(currentHourValue) + 12);
                    }
                }
                component.set("v.isValid", true);
            } else {
            	component.set("v.isValid", false);
            }
            return;
        }
        
        if (component.get("v.isValid") === true) {
            var hours = component.get("v.hours");
            if (amPmCmp) {
                if (amPmCmp.get("v.value") == "am") {
                    component.set("v.hours", parseInt(hours) - 12);
                } else {
                    component.set("v.hours", parseInt(hours) + 12);
                }
            }
        }
    },
    
    updateHours: function(component, event, helper) {
        if (helper.validateHours(component)) {
            var hoursCmp = event.getSource();
            if (hoursCmp) {
                helper.updateHourValue(component, hoursCmp.get("v.value"));
                component.set("v.isValid", true);
                return;
            }
        }
        component.set("v.isValid", false);
    },
    
    updateMinutes: function(component, event, helper) {
        if (helper.validateMinutes(component)) {
            var minutesCmp = event.getSource();
            if (minutesCmp) {
                helper.updateMinuteValue(component, minutesCmp.get("v.value"));
                component.set("v.isValid", true);
                return;
            }
        }
        component.set("v.isValid", false);
    }
})