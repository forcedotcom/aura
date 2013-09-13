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
        // Localize am/pm label
        /*
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
        */
        
        // set hours based on 24/12 hour format
        /*
        var hours = component.get("v.hours");
        hours %= 24;
        var is24HourFormat = component.getValue("v.is24HourFormat").getBooleanValue();
        if (!is24HourFormat) {
            component.setValue("v.isPm", hours >= 12 : true : false);
            component.setValue("v.hours", hours % 12);
        }
        */
    },
    
    hoursChange: function(component, event, helper) {
        var hoursCmp = component.find("hours");
        if (hoursCmp) {
            var v = hoursCmp.getValue("v.value");
            var hours = component.get("v.hours");
            if (helper.validateNumber(hours, 0, 23)) { 
                v.setValid(true);
                v.clearErrors();
            } else {
                v.setValid(false);
                v.addErrors([{message:"Please input a valid hour value (0 - 23)."}]);
            }
        }
    },
    
    minutesChange: function(component, event, helper) {
        var minutesCmp = component.find("minutes");
        if (minutesCmp) {
            var v = minutesCmp.getValue("v.value");
            var minutes = component.get("v.minutes");
            if (helper.validateNumber(minutes, 0, 59)) { 
                v.setValid(true);
                v.clearErrors();
            } else {
                v.setValid(false);
                v.addErrors([{message:"Please input a valid minute value (0 - 59)"}]);
            }
        }
    }
})