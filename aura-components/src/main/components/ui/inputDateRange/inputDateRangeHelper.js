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
    openStartDatePicker: function(component, selectedDate) {
        component._lastOpenInput = "StartDate";

        var datePicker = component.find("datePicker"),
            referenceElement = component.find("inputStartDate").getElement(),
            startDate = component.get("v.startDate"),
            endDate = component.get("v.endDate");

        var datePickerValue = !$A.util.isEmpty(selectedDate) ? selectedDate
                            : !$A.util.isEmpty(startDate) ? startDate
                            : !$A.util.isEmpty(endDate) ? endDate
                            : this.getDateString(new Date());

        if (!$A.util.isUndefinedOrNull(datePicker)) {
            this.displayDatePicker(datePicker, referenceElement, datePickerValue);
            this.highlightRange(datePicker, startDate, endDate);
        }
    },

    openEndDatePicker: function(component, selectedDate) {
        component._lastOpenInput = "EndDate";

        var datePicker = component.find("datePicker"),
            referenceElement = component.find("inputEndDate").getElement(),
            startDate = component.get("v.startDate"),
            endDate = component.get("v.endDate");

        var datePickerValue = !$A.util.isEmpty(selectedDate) ? selectedDate
                            : !$A.util.isEmpty(endDate) ? endDate
                            : !$A.util.isEmpty(startDate) ? startDate
                            : this.getDateString(new Date());

        if (!$A.util.isUndefinedOrNull(datePicker)) {
            this.displayDatePicker(datePicker, referenceElement, datePickerValue);
            this.highlightRange(datePicker, startDate, endDate);
        }
    },

    displayDatePicker: function(datePicker, referenceElement, selectedValue) {
        var localizedDate = $A.localizationService.parseDateTime(selectedValue, "yyyy-MM-dd");
        datePicker.set("v.value", this.getDateString(localizedDate));
        datePicker.set("v.referenceElement", referenceElement);
        datePicker.set("v.visible", true);
    },

    hideDatePicker: function(datePicker, timeout) {
        window.setTimeout(function () {
            $A.run(function () {
                datePicker.set("v.visible", false);
            });
        }, timeout);
    },

    highlightRange: function(datePicker, startDate, endDate) {
        datePicker.highlightRange(startDate, endDate);
    },

    setStartDateValue: function(component, newValue) {
        component.set("v.startDate", newValue);
        var endDate = component.get("v.endDate");

        var shouldResetEndDate = !$A.util.isEmpty(endDate) && $A.localizationService.isAfter(newValue, endDate);
        if (shouldResetEndDate) {
            component.set("v.endDate", "");
        }

        if ($A.util.isEmpty(endDate) || shouldResetEndDate) {
            this.openEndDatePicker(component, newValue);
        } else {
            var datePicker = component.find("datePicker");
            this.highlightRange(datePicker, newValue, endDate);
            this.hideDatePicker(datePicker, 300);
        }
    },

    setEndDateValue: function(component, newValue) {
        component.set("v.endDate", newValue);
        var startDate = component.get("v.startDate");
        // newValue and startDate are formatted in "YYYY-MM-DD"
        var resetStartDate = !$A.util.isEmpty(startDate) && $A.localizationService.isBefore(newValue, startDate);
        if (resetStartDate) {
            component.set("v.startDate", "");
        }
        if ($A.util.isEmpty(startDate) || resetStartDate) {
            this.openStartDatePicker(component, newValue);
        } else {
            var datePicker = component.find("datePicker");
            this.highlightRange(datePicker, startDate, newValue);
            this.hideDatePicker(datePicker, 300);
        }
    },

    displayDates: function(component) {
        var inputElem = component.find("inputStartDate").getElement();
        this.displayValue(component, component.get("v.startDate"), inputElem);

        inputElem = component.find("inputEndDate").getElement();
        this.displayValue(component, component.get("v.endDate"), inputElem);
    },

    displayValue: function(component, value, inputElement) {
        var concCmp = component.getConcreteComponent();
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
        inputElement.value = displayValue ? $A.localizationService.translateToLocalizedDigits(displayValue) : '';
    },

    getDateString: function(date) {
        return date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate();
    }

})// eslint-disable-line semi
