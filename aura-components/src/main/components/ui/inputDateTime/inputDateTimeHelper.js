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
    displayDatePicker: function(component) {
        var datePicker = component.find("datePicker");
        if (!datePicker || datePicker.get("v.visible") === true) {
            return;
        }
        var now = new Date(); // local date
        // Later on, we will use getUTC... methods to get year/month/date
        var currentDate = new Date(Date.UTC(now.getFullYear(), 
                                            now.getMonth(), 
                                            now.getDate(), 
                                            now.getHours(), 
                                            now.getMinutes(), 
                                            now.getSeconds(), 
                                            now.getMilliseconds()));
        var outputCmp = component.find("inputText");
        var elem = outputCmp ? outputCmp.getElement() : null;
        var value = elem ? elem.value : null;
        var format = component.get("v.format");
        if (!format) { // use default format
            format = $A.getGlobalValueProviders().get("$Locale.datetimeformat");
        }
        var langLocale = component.get("v.langLocale");
        if (!langLocale) {
            langLocale = $A.getGlobalValueProviders().get("$Locale.langLocale");
        }
        if (value) {
            var d = $A.localizationService.parseDateTimeUTC(value, format, langLocale);
            if (d) {
                currentDate = d;
            }
        }
        this.popUpDatePicker(component, currentDate);
    },
    
    /**
     * This can be overridden by extended component.
     */
    displayDateTime: function(component, displayValue) {
        var outputCmp = component.find("inputText");
        var elem = outputCmp ? outputCmp.getElement() : null;
        if (elem) {
            elem.value = $A.localizationService.translateToLocalizedDigits(displayValue);
        }
    },
    
    /**
     * Override ui:input.
     *
     */
    doUpdate : function(component, value) {
        var v = $A.localizationService.translateFromLocalizedDigits(value);
        var ret = v;
        if (value) {
            var format = component.get("v.format");
            if (!format) { // use default format
                format = $A.getGlobalValueProviders().get("$Locale.datetimeformat");
            }
            var langLocale = component.get("v.langLocale");
            if (!langLocale) {
                langLocale = $A.getGlobalValueProviders().get("$Locale.langLocale");
            }
            var d = $A.localizationService.parseDateTimeUTC(v, format, langLocale);
            if (d) {
                var timezone = component.get("v.timezone");
                $A.localizationService.WallTimeToUTC(d, timezone, function(utcDate) {
                    utcDate = $A.localizationService.translateFromOtherCalendar(utcDate);
                    component.setValue("v.value", $A.localizationService.toISOString(utcDate));
                });
            } else {
                component.setValue("v.value", ret);
            }
        }
    },
    
    formatDateTime: function(component) {
        var concreteCmp = component.getConcreteComponent();
        var _helper = concreteCmp.getDef().getHelper();
        var value = component.get("v.value");
        if (!value) { // Setting an empty value probably means clear out existing value
            _helper.displayDateTime(component, "");
            return;
        }
        var d = $A.localizationService.parseDateTimeISO8601(value);
        if (d) {
            var format = component.get("v.format");
            var langLocale = component.get("v.langLocale");
            var timezone = component.get("v.timezone");
            $A.localizationService.UTCToWallTime(d, timezone, function(walltime) {
                try {
                    walltime = $A.localizationService.translateToOtherCalendar(walltime);
                    var displayValue = $A.localizationService.formatDateTimeUTC(walltime, format, langLocale);
                    _helper.displayDateTime(concreteCmp, displayValue);
                } catch (e) {
                    _helper.displayDateTime(concreteCmp, e.message);
                }
            });
        } else {
            _helper.displayDateTime(component, value);
        }
    },
    
    getDateString: function(date) {
        return date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate();
    },
    
    getUTCDateString: function(date) {
        return date.getUTCFullYear() + "-" + (date.getUTCMonth() + 1) + "-" + date.getUTCDate();
    },
    
    is24HourFormat: function(component) {
        var format = component.get("v.format");
        if (!format) {
            format = $A.getGlobalValueProviders().get("$Locale.datetimeformat");
        }
        return !($A.localizationService.isPeriodTimeView(format));
    },
    
    popUpDatePicker: function(component, date) {
        var datePicker = component.find("datePicker");
        if (datePicker) {
            datePicker.setValue("v.value", this.getUTCDateString(date));
            datePicker.setValue("v.hours", date.getUTCHours());
            datePicker.setValue("v.minutes", date.getUTCMinutes());
            datePicker.setValue("v.is24HourFormat", this.is24HourFormat(component));
            datePicker.setValue("v.visible", true);
        }
    }
})