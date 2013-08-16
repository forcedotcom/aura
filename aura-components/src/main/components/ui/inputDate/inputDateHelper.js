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
    displayValue: function(component) {
        var value = component.get("v.value");
        var displayValue = value;
        if (value) {
            var d = $A.localizationService.parseDateTimeUTC(value, "yyyy-MM-dd");
            if (d) {
                var format = component.get("v.format");
                var langLocale = component.get("v.langLocale");
                try {
                    displayValue = $A.localizationService.formatDateUTC(d, format, langLocale);
                } catch (e) {
                    displayValue = e.message;
                }
            }
        }
        var elem = component.find("inputText").getElement();
        elem.value = displayValue ? displayValue : '';
    },
    
    displayDatePicker: function(component) {
        var currentDate = new Date();
        var value = component.get("v.value");
        if (value) {
            currentDate = $A.localizationService.parseDateTime(value, "yyyy-MM-dd");
        }
        var datePicker = component.find("datePicker");
        if (datePicker) {
            datePicker.setValue("v.value", this.getDateString(currentDate));
            datePicker.setValue("v.visible", true);
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
            if (!format) { // use default format
                format = $A.getGlobalValueProviders().get("$Locale.dateformat");
            }
            var langLocale = component.get("v.langLocale");
            var d = $A.localizationService.parseDateTimeUTC(value, format, langLocale);
            ret = $A.localizationService.formatDateUTC(d, "YYYY-MM-DD");
        }
        component.setValue("v.value", ret);
    },
    
    getDateString: function(date) {
        return date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate();
    }
})