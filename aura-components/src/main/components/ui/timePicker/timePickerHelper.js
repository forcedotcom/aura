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
                amPmCmp.set("v.value", "am");
                return 12;
            } else if (hours == 12) { // 12pm
                amPmCmp.set("v.value", "pm");
                return 12;
            }
            amPmCmp.set("v.value", hours > 12 ? "pm" : "am");
            return hours % 12;
        }
        return hours;
    },

    localizeAmpmLabel: function(component) {
        var is24HourFormat = $A.util.getBooleanValue(component.get("v.is24HourFormat"));
        if (is24HourFormat === false) {
            // Localize am/pm label
            var localizedData = $A.localizationService.getLocalizedDateTimeLabels();
            var ampm = localizedData._ampm;
            if (ampm) {
                var amOptCmp = component.find("amOpt");
                if (amOptCmp) {
                    amOptCmp.set("v.label", ampm.am);
                }
                var pmOptCmp = component.find("pmOpt");
                if (pmOptCmp) {
                    pmOptCmp.set("v.label", ampm.pm);
                }
            }
        }
    },

    renderTime: function(component) {
        // set hours based on 24/12 hour format
        var is24HourFormat = $A.util.getBooleanValue(component.get("v.is24HourFormat"));
        var hours = component.get("v.hours");
        hours %= 24;
        if (is24HourFormat === false) {
            hours = this.convertFrom24To12(component, hours);
        }
        var hoursCmp = component.find("hours");
        if (hoursCmp) {
            hoursCmp.set("v.value", hours);
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
            minutesCmp.set("v.value", minutes);
        }
    },

    updateHourValue: function(component, hours) {
        var is24HourFormat = $A.util.getBooleanValue(component.get("v.is24HourFormat"));
        if (is24HourFormat === true) {
        	component.set("v.hours", hours);
        } else {
            var amPmCmp = component.find("ampm");
            if (amPmCmp) {
                var isPm = amPmCmp.get("v.value") == "pm";
                if (hours == 12) { // 12am and 12pm
                	component.set("v.hours", isPm ? 12 : 0);
                } else {
                	component.set("v.hours", isPm ? parseInt(hours) + 12 : hours);
                }
            }
        }
    },

    updateMinuteValue: function(component, minutes) {
    	component.set("v.minutes", minutes);
    },

    validateNumber: function(value, min, max) {
        var intRegex = /^\d+$/; // nonnegative integer
        if (intRegex.test(value)) {
            var n = parseInt(value);
            return n <= max && n >= min;
        }
        return false;
    },

    validateHours: function(component) {
        var is24HourFormat = $A.util.getBooleanValue(component.get("v.is24HourFormat"));
        var hoursCmp = component.find("hours");
        var errorCmp = component.find("hourError");
        if (hoursCmp && errorCmp) {
            var hours = hoursCmp.get("v.value");
            if (is24HourFormat === true) {
                if (this.validateNumber(hours, 0, 23)) {
                    $A.util.removeClass(hoursCmp.getElement(), "error");
                    errorCmp.set("v.value", []);
                    $A.util.addClass(errorCmp.getElement(), "hide");
                    return true;
                } else {
                	$A.util.addClass(hoursCmp.getElement(), "error");
                    errorCmp.set("v.value", ["Please input a valid hour value (0 - 23)."]);
                    $A.util.removeClass(errorCmp.getElement(), "hide");
                    return false;
                }
            } else {
                if (this.validateNumber(hours, 1, 12)) {
                    $A.util.removeClass(hoursCmp.getElement(), "error");
                    errorCmp.set("v.value", []);
                    $A.util.addClass(errorCmp.getElement(), "hide");
                    return true;
                } else {
                	$A.util.addClass(hoursCmp.getElement(), "error");
                    errorCmp.set("v.value", ["Please input a valid hour value (1 - 12)."]);
                    $A.util.removeClass(errorCmp.getElement(), "hide");
                    return false;
                }
            }
        }
        return false;
    },

    validateMinutes: function(component) {
        var minutesCmp = component.find("minutes");
        var errorCmp = component.find("minuteError");
        if (minutesCmp && errorCmp) {
            var minutes = minutesCmp.get("v.value");
            if (this.validateNumber(minutes, 0, 59)) {
            	$A.util.removeClass(minutesCmp.getElement(), "error");
                errorCmp.set("v.class", "hide");
                errorCmp.set("v.value", []);
                return true;
            } else {
            	$A.util.addClass(minutesCmp.getElement(), "error");
                errorCmp.set("v.class", "");
                errorCmp.set("v.value", ["Please input a valid minute value (0 - 59)."]);
                return false;
            }
        }
        return false;
    }

})