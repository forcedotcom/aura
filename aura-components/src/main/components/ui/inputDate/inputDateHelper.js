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
        var concCmp = component.getConcreteComponent();
        var value = concCmp.get("v.value");
        var displayValue = value;
        if (value) {
            var d = $A.localizationService.parseDateTimeUTC(value, "yyyy-MM-dd");
            if (d) {
                var format = concCmp.get("v.format");
                var langLocale = concCmp.get("v.langLocale");
                try {
                    d = $A.localizationService.translateToOtherCalendar(d);
                    displayValue = $A.localizationService.formatDateUTC(d, format, langLocale);
                } catch (e) {
                    displayValue = e.message;
                }
            }
        }
        
        /**This instance of the component variable was left in because in cases when we are extending inputDate,
         * getting the concreteComponent will give us the lowest hanging fruit, which does not include an 
         * element with an id of inputText. By leaving this variable in, it will work in both cases.
         */
        var elem = component.find("inputText").getElement();
        elem.value = displayValue ? $A.localizationService.translateToLocalizedDigits(displayValue) : '';
    },

    displayDatePicker: function(component) {
        var concCmp = component.getConcreteComponent();
        var datePicker = concCmp.find("datePicker");
        if (datePicker && datePicker.get("v.visible") === false) {
            var currentDate = new Date();
            var value = concCmp.get("v.value");
            if (value) {
                currentDate = $A.localizationService.parseDateTime(value, "yyyy-MM-dd");
            }
            datePicker.set("v.value", this.getDateString(currentDate));
            datePicker.set("v.visible", true);
        }
    },

    /**
     * Override ui:input.
     *
     */
    doUpdate : function(component, value) {
        var concCmp = component.getConcreteComponent();
        var v = $A.localizationService.translateFromLocalizedDigits(value);
        var ret = v;
        if (value) {
            var format = concCmp.get("v.format");
            if (!format) { // use default format
                format = $A.get("$Locale.dateFormat");
            }
            var langLocale = concCmp.get("v.langLocale");
            var d = $A.localizationService.parseDateTimeUTC(v, format, langLocale);
            if (d) {
                d = $A.localizationService.translateFromOtherCalendar(d);
                ret = $A.localizationService.formatDateUTC(d, "YYYY-MM-DD");
            }
        }
        concCmp.set("v.value", ret);
    },

    getDateString: function(date) {
        return date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate();
    },

    toggleClearButton: function(component) {
        if (($A.get("$Browser.isPhone") === true) || ($A.get("$Browser.isTablet") === true)) {
            var inputCmp = component.find("inputText");
            var inputElem = inputCmp ? inputCmp.getElement() : null;
            var clearCmp = component.find("clear");
            var clearElem = clearCmp ? clearCmp.getElement() : null;
            if (inputElem && clearElem) {
                var openIconCmp = component.find("datePickerOpener");
                var openIconElem = openIconCmp ? openIconCmp.getElement() : null;
                var currentValue = inputElem.value;
                if ($A.util.isUndefinedOrNull(currentValue) || $A.util.isEmpty(currentValue)) { // remove clear icon
                    $A.util.swapClass(clearElem, "display", "hide");

                    if (openIconElem) {
                        $A.util.swapClass(openIconElem, "hide", "display");
                    }
                } else {
                    $A.util.swapClass(clearElem, "hide", "display");
                    if (openIconElem) {
                        $A.util.swapClass(openIconElem, "display", "hide");
                    }
                }
            }
        }
    }
})