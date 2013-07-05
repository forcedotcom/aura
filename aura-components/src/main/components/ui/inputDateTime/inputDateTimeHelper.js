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
        var now = new Date(); // local date
        // Later on, we will use getUTC... methods to get year/month/date
        var currentDate = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
        var outputCmp = component.find("inputText");
        var elem = outputCmp ? outputCmp.getElement() : null;
        var value = elem ? elem.value : null;
        var format = component.get("v.format");
        var langLocale = component.get("v.langLocale");
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
            elem.value = displayValue;
        }
    },
    
    /**
     * Override ui:input.
     *
     */
    doUpdate : function(component, value) {
        var ret = value;
        if (value) {
            var format = component.get("v.format");
            var langLocale = component.get("v.langLocale");
            var d = $A.localizationService.parseDateTimeUTC(value, format, langLocale);
            if (d) {
                var timezone = component.get("v.timezone");
                $A.localizationService.WallTimeToUTC(d, timezone, function(utcDate) {
                    component.setValue("v.value", utcDate.toISOString());
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
        var d = new Date(value);
        var format = component.get("v.format");
        var langLocale = component.get("v.langLocale");
        var timezone = component.get("v.timezone");
        $A.localizationService.UTCToWallTime(d, timezone, function(walltime) {
            try {
                var displayValue = $A.localizationService.formatDateTimeUTC(walltime, format, langLocale);
                _helper.displayDateTime(concreteCmp, displayValue);
            } catch (e) {
                _helper.displayDateTime(concreteCmp, e.message);
            }
        });
    },
    
    getDateString: function(date) {
        return date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate();
    },
    
    getUTCDateString: function(date) {
        return date.getUTCFullYear() + "-" + (date.getUTCMonth() + 1) + "-" + date.getUTCDate();
    },
    
    popUpDatePicker: function(component, date) {
        var datePicker = component.find("datePicker");
        datePicker.setValue("v.value", this.getUTCDateString(date));
        datePicker.setValue("v.visible", true);
    }
})