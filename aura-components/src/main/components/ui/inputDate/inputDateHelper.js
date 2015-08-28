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
            var langLocale = component.get("v.langLocale") || $A.get("$Locale.langLocale");
            // since v.value is in UTC format like "2015-08-10T04:00:00.000Z", we only need the date portion
            var dateValue = value.split("T", 1)[0] || value;
            var date = $A.localizationService.parseDateTimeUTC(dateValue, "YYYY-MM-DD", langLocale, true);
            if (date) {
                var format = component.get("v.format") || $A.get("$Locale.dateFormat");
                try {
                    date = $A.localizationService.translateToOtherCalendar(date);
                    displayValue = $A.localizationService.formatDateUTC(date, format, langLocale);
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
                var langLocale = component.get("v.langLocale") || $A.get("$Locale.langLocale");
                // since v.value is in UTC format like "2015-08-10T04:00:00.000Z", we only need the date portion
                var dateValue = value.split("T", 1)[0] || value;
                currentDate = $A.localizationService.parseDateTime(dateValue, "YYYY-MM-DD", langLocale, true);
            }
            // if invalid text is entered in the inputText, currentDate will be null
            if (!$A.util.isUndefinedOrNull(currentDate)) {
                datePicker.set("v.value", this.getDateString(currentDate));
            }
            datePicker.set("v.visible", true);
        }
    },

    /**
     * Override ui:input.
     */
    handleUpdate : function(component, event) {
        var helper = component.getDef().getHelper();
        var updateOn = helper.getUpdateOn(component);

        // if this is an event we're supposed to update on, call this component's update implementation
        if (updateOn.indexOf(event.type) > -1) {
            helper.doUpdate(component, helper.getDomElementValue(this.getInputElement(component)));
        }
    },

    /**
     * Override ui:input.
     *
     */
    doUpdate : function(component, value) {
    	var localizedValue = $A.localizationService.translateFromLocalizedDigits(value);
        var formattedDate = localizedValue;
        if (value) {
            var langLocale = component.get("v.langLocale") || $A.get("$Locale.langLocale");
            var format = component.get("v.format") || $A.get("$Locale.dateFormat");
            var date = $A.localizationService.parseDateTimeUTC(localizedValue, format, langLocale, true);

            if (date) {
                date = $A.localizationService.translateFromOtherCalendar(date);
                formattedDate = $A.localizationService.formatDateUTC(date, "YYYY-MM-DD");
            }
        }
        component.set("v.value", formattedDate);
    },

    /**
     * @Override
     */
    addDomHandler : function(component, event) {
        var el = this.getInputElement(component);
        $A.util.on(el, event, this.lib.interactive.domEventHandler);
    },

    getInputElement : function(component) {
        var element;
        // on desktop, the input is wrapped in a <form> tag
        if (this.hasLabel(component) || $A.get("$Browser.formFactor") == "DESKTOP") {
            var el = component.getElement();
            element = el.getElementsByTagName('input')[0] || el;
        } else {
            element = component.getElement();
        }
        return element;
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
    },

    /**
     * Show/hide open date picker icon based on v.disabled
     */
    toggleOpenIconVisibility: function(component) {
    	var openIconCmp = component.find("datePickerOpener"),
    	    openIconEl = openIconCmp ? openIconCmp.getElement() : null;
    	if (openIconEl) {
    	    if (component.get("v.disabled") === true) {
    	    	$A.util.swapClass(openIconEl, "display", "hide");
    	    } else {
                var clearCmp = component.find("clear");
                var clearElem = clearCmp ? clearCmp.getElement() : null;
                if (!clearElem || !$A.util.hasClass(clearElem, "display")) {
                    $A.util.swapClass(openIconEl, "hide", "display");
                }
    	    }
    	}
    }
})// eslint-disable-line semi