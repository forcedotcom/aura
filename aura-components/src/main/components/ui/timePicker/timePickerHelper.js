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

    convertFrom24To12: function(component, hours) {
        var amPmCmp = component.find("ampm");
        if (amPmCmp) {
            if (hours == 0) { // 12am
                amPmCmp.setValue("v.value", "am");
                return 12;
            } else if (hours == 12) { // 12pm
                amPmCmp.setValue("v.value", "pm");
                return 12;
            }
            amPmCmp.setValue("v.value", hours > 12 ? "pm" : "am");
            return hours % 12;
        }
        return hours;
    },
    
    renderTime: function(component) {
        // set hours based on 24/12 hour format
        var is24HourFormat = component.getValue("v.is24HourFormat").getBooleanValue();
        var hours = component.get("v.hours");
        hours %= 24;
        if (is24HourFormat === false) {
            hours = this.convertFrom24To12(component, hours);
        }
        var hoursCmp = component.find("hours");
        if (hoursCmp) {
            hoursCmp.setValue("v.value", hours);
        }
        
        // set minutes
        var minutes = component.get("v.minutes");
        minutes %= 60;
        var minutesCmp = component.find("minutes");
        if (minutesCmp) {
            minutes = minutes + '';
            if (minutes.length < 2) {
                minutes = '0' + minutes;
            }
            minutesCmp.setValue("v.value", minutes);
        }
    },
    
    updateHourValue: function(component, hours) {
        var is24HourFormat = component.getValue("v.is24HourFormat").getBooleanValue();
        var hoursValue = component.getValue("v.hours");
        if (is24HourFormat === true) {
            hoursValue.setValue(hours);
        } else {
            var amPmCmp = component.find("ampm");
            if (amPmCmp) {
                var isPm = amPmCmp.get("v.value") == "pm";
                if (hours == 12) { // 12am and 12pm
                    hoursValue.setValue(isPm ? 12 : 0);
                } else {
                    hoursValue.setValue(isPm ? parseInt(hours) + 12 : hours);
                }
            }
        }
    },
    
    updateMinuteValue: function(component, minutes) {
        var minutesValue = component.getValue("v.minutes");
        minutesValue.setValue(minutes);
    },
    
    validateNumber: function(value, min, max) {
        var intRegex = /^\d+$/; // nonnegative integer
        if (intRegex.test(value)) {
            var n = parseInt(value);
            return n <= max && n >= min;
        }
        return false;
    }
})