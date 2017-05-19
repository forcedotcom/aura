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
    init: function (component) {
        if (component.get("v.disabled")) {
            component.set("v.displayDatePicker", false);
            // don't bother with the rest if the input is disabled
            return;
        }
        this.cacheDefaultValues(component);
        if ($A.get("$Browser.formFactor") === "DESKTOP") {
            // only add the placeholder when there is no date picker opener.
            if (!component.get("v.displayDatePicker")) {
                component.set("v.placeholder", component.get("v.format"));
            }
            if (component.get("v.useManager")) {
                this.checkManagerExists(component);
            }
        } else {
            component.set("v._isPhoneOrTablet", true);
        }
    },

    cacheDefaultValues: function (component) {
        // these attributes are defined in an interface, and we currently cannot have their default set to an expression
        component._timezone = component.get("v.timezone") || $A.get("$Locale.timezone");
        component._format = component.get("v.format") || $A.get("$Locale.dateFormat");
        // localizationService uses locale in $Locale.langLocale by default
        component._locale = component.get("v.langLocale");
    },

    displayValue: function (component) {
        var config = {
            langLocale: component._locale,
            format: component._format,
            timezone: component._timezone,
            validateString: true
        };

        var displayValue = function (returnValue) {
            this.setInputValue(component, returnValue.date);
        }.bind(this);

        var value = component.get("v.value");
        this.dateTimeLib.dateTimeService.getDisplayValue(value, config, displayValue);
    },

    displayDatePicker: function (component, focusDatePicker) {
        if (!component.get("v.displayDatePicker")) {
            return;
        }
        var useManager = component.get("v.useManager"),
            managerExists = component.get("v.managerExists");
        if (useManager && managerExists) {
            this.openDatepickerWithManager(component, focusDatePicker, true);
        } else {
            // if useManager was true but there is no manager, or if useManager was false, then set loadDatePicker to
            // true
            this.loadDatePicker(component);

            var datePicker = component.find("datePicker");
            if (datePicker && datePicker.get("v.visible") === false) {
                var currentDate = this.getDateValueForDatePicker(component);
                datePicker.show(currentDate, focusDatePicker);
            }
        }
    },

    /**
     * Override ui:input.
     */
    doUpdate: function (component, value) {
        var localizedValue = $A.localizationService.translateFromLocalizedDigits(value);
        var formattedDate = localizedValue;
        if (value) {
            var langLocale = component._locale;
            var format = component._format;
            var date = $A.localizationService.parseDateTimeUTC(localizedValue, format, langLocale, true);

            if (date) {
                date = $A.localizationService.translateFromOtherCalendar(date);
                formattedDate = $A.localizationService.formatDateUTC(date, "YYYY-MM-DD");
            }
        }
        component.set("v.value", formattedDate);
    },

    /**
     * Override ui:input.
     */
    getInputElement: function (component) {
        var inputCmp = component.getConcreteComponent().find("inputText");
        if (inputCmp) {
            return inputCmp.getElement();
        }
        return component.getElement();
    },

    getDateValueForDatePicker: function (component) {
        var date;
        var format = component._format;
        var langLocale = component._locale;
        var dateString = this.getInputElement(component).value;
        if (!$A.util.isEmpty(dateString)) {
            date = $A.localizationService.parseDateTime(dateString, format, langLocale, true);
        }
        return date ? $A.localizationService.translateFromOtherCalendar(date) : new Date();
    },

    getDateString: function (date) {
        return date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate();
    },

    /**
     * toggles the datepicker icon (and the clear icon for phone and tablet)
     *
     */
    togglePickerIcon: function (component) {
        var openIconCmp = component.find("datePickerOpener");
        var openIconElem = openIconCmp ? openIconCmp.getElement() : null;
        var clearCmp = component.find("clear");
        var clearElem = clearCmp ? clearCmp.getElement() : null;

        if (component.get("v._isPhoneOrTablet")) {
            if ($A.util.isEmpty(component.get("v.value"))) { // no value, so hide the clear icon and display the date picker icon
                $A.util.swapClass(clearElem, "display", "hide");
                $A.util.swapClass(openIconElem, "hide", "display");
            } else {
                $A.util.swapClass(clearElem, "hide", "display");
                $A.util.swapClass(openIconElem, "display", "hide");
            }
        }
    },

    loadDatePicker: function (component) {
        if (!component.get("v.loadDatePicker")) {
            component.set("v.loadDatePicker", true);

            //datepicker has been loaded now, find it again and set it's reference element
            this.initializeDatePicker(component);
        }
    },

    initializeDatePicker: function (component) {
        var datePicker = component.find("datePicker");
        if (datePicker) {
            datePicker.set("v.referenceElement", component.find("inputText").getElement());
        }
    },

    checkManagerExists: function (component) {
        $A.getEvt('markup://ui:registerDatePickerManager').fire({
            sourceComponentId: component.getGlobalId()
        });
    },

    registerManager: function (component, event) {
        var sourceComponentId = event.getParam('sourceComponentId') || event.getParam("arguments").sourceComponentId;
        if ($A.util.isUndefinedOrNull(sourceComponentId)) {
            return;
        }

        var sourceComponent = $A.componentService.get(sourceComponentId);
        if (sourceComponent && sourceComponent.isInstanceOf("ui:datePickerManager")) {
            component.set("v.managerExists", true);
        }
    },

    openDatepickerWithManager: function (component, focusDatePicker, toggleVisibility) {
        var currentDate = this.getDateValueForDatePicker(component);

        $A.getEvt('markup://ui:showDatePicker').fire({
            element: this.getInputElement(component),
            value: currentDate ? this.getDateString(currentDate) : currentDate,
            sourceComponentId: component.getGlobalId(),
            focusDatePicker: focusDatePicker,
            toggleVisibility: toggleVisibility
        });
    },

    handleDateSelectionByManager: function (component, event) {
        var dateValue = event.getParam("value") || event.getParam("arguments").value;
        if (dateValue) {
            component.set("v.value", dateValue);
        }
    },

    setInputValue: function (component, displayValue) {
        var inputElement = this.getInputElement(component);
        if (!$A.util.isUndefinedOrNull(inputElement) && inputElement.value !== displayValue) {
            // only update value if display value is different.
            inputElement.value = displayValue ? $A.localizationService.translateToLocalizedDigits(displayValue) : "";
        }
    },

    handlePickerTab: function (component, event) {
        if (event.keyCode === 9) { //tab
            var useManager = component.get("v.useManager"),
                managerExists = component.get("v.managerExists");
            if (useManager && managerExists) {
                // ask the manager to focus the open datepicker, without toggling visibility
                this.openDatepickerWithManager(component, true, false);
            } else {
                var datepicker = component.find("datePicker");
                if (datepicker && datepicker.get("v.visible") === true) {
                    datepicker.focus();
                }
            }
        }
    }
})// eslint-disable-line semi
