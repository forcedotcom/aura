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
    DATE_FORMAT: "YYYY-MM-DD",

    init: function (component) {
        if (component.get("v.disabled")) {
            if (component.get('v.displayDatePicker') && !component.get('v.useSingleInput')) {
                this.updateTimeFormat(component);
            }
            // don't bother with the rest if the input is disabled
            return;
        }
        if (!component.get("v.useSingleInput")) {
            this.updateTimeFormat(component);
            this.setPlaceHolder(component);

            if (component.get("v.useManager")) {
                this.checkManagerExists(component);
            }
        }
    },

    displayDatePicker: function (component, focusDatePicker) {
        if (!component.get("v.displayDatePicker")) {
            return;
        }

        var currentDate = this.getDateValueForDatePicker(component);
        this.popUpDatePicker(component, currentDate, focusDatePicker);
    },

    displayTimePicker: function (component, focusTimePicker) {
        if (!component.get("v.displayDatePicker")) {
            return;
        }

        var inputTimeValue = this.getTimeString(component);
        var dateTimeString;
        var hours, minutes;
        if (!$A.util.isEmpty(inputTimeValue)) {
            var inputDateValue = this.getDateString(component);
            if (!$A.util.isEmpty(inputDateValue)) {
                dateTimeString = inputDateValue + " " + inputTimeValue;
            } else {
                // create a new utc date string, append the inputTime value
                var todayDate = new Date();
                var todayDateString = todayDate.getFullYear() + "-" + (todayDate.getMonth() + 1) + "-" + todayDate.getDate();
                var formattedDate = this.formatDateString(component, todayDateString);

                dateTimeString = formattedDate + " " + inputTimeValue;
            }

            var currentDate = $A.localizationService.parseDateTime(dateTimeString, this.getDateTimeFormat(component), this.getLocale(component));

            // if the dateTime is not null, this means that there's a date selected
            if (!$A.util.isUndefinedOrNull(currentDate)) {
                hours = currentDate.getHours();
                minutes = currentDate.getMinutes();
            }
        }
        this.popupTimePicker(component, hours, minutes, focusTimePicker);
    },

    /**
     * Override ui:input because we have two inputs, and ui:input only adds handlers to the first input
     */
    addDomHandler: function (component, event) {
        if (component.get("v.useSingleInput")) {
            var inputElement = this.getInputElement(component);
            this.lib.interactive.attachDomHandlerToElement(component, inputElement, event);
        } else {
            var inputElements = component.getElement().getElementsByTagName('input');
            for (var i = 0; i < inputElements.length; i++) {
                var element = inputElements[i];
                this.lib.interactive.attachDomHandlerToElement(component, element, event);
            }
        }
    },

    /**
     * Override ui:input.
     */
    handleUpdate: function (component, event) {
        var helper = component.getDef().getHelper();
        var updateOn = helper.getUpdateOn(component);

        // if this is an event we're supposed to update on, call this component's update implementation
        if (updateOn.indexOf(event.type) > -1) {
            var dateValue = this.getDateString(component);
            var timeValue = this.getTimeString(component);
            if (!component.get("v.useSingleInput")) {
                if ($A.util.isEmpty(dateValue) && !$A.util.isEmpty(timeValue)) { // if date is empty, but time is not empty, do not update
                    return;
                }
            }

            var dateTimeParams = {
                date: dateValue,
                time: timeValue,
                ignoreChange: true        // change event is fired through the input, no need to fire it again.
            };
            this.setDateTimeValue(component, dateTimeParams);
        }
    },

    displayValue: function (component) {
        var config = {
            langLocale: this.getLocale(component),
            timezone: this.getTimezone(component),
            validateString: false       // should we validate?
        };

        if (component.get("v.useSingleInput")) {
            config.format = this.getDateTimeFormat(component);
        } else {
            config.format = this.getDateFormat(component);
            config.timeFormat = this.getTimeFormat(component);
        }

        var displayValue = function (returnValue) {
            this.displayDate(component, returnValue.date);
            this.displayTime(component, returnValue.time);
        }.bind(this);

        var value = component.get("v.value");
        this.dateTimeLib.dateTimeService.getDisplayValue(value, config, displayValue);
    },

    getUTCDateString: function (date) {
        return $A.localizationService.formatDateUTC(date, this.DATE_FORMAT);
    },

    is24HourFormat: function (component) {
        var format = this.getDateTimeFormat(component);
        if (!format) {
            return false;
        }

        var shouldEscape = false;
        for (var i = 0; i < format.length; i++) {
            var c = format.charAt(i);
            if (c === 'h' && shouldEscape === false) {
                return true;
            }
            if (c === '[') {
                shouldEscape = true;
            } else if (c === ']') {
                shouldEscape = false;
            }
        }
        return false;
    },

    popUpDatePicker: function (component, date, focusDatePicker) {
        var useManager = component.get("v.useManager"),
            managerExists = component.get("v.managerExists");

        if (useManager && managerExists) {
            this.openDatepickerWithManager(component, date, focusDatePicker, true);
        } else {
            // if useManager was true but there is no manager, or if useManager was false, then set loadDatePicker to
            // true
            this.loadDatePicker(component);

            var datePicker = component.find("datePicker");
            if (datePicker && datePicker.get("v.visible") === false) {
                var currentDate = this.getUTCDateString(date);
                datePicker.show(currentDate, focusDatePicker);

                if (component.get("v.useSingleInput")) {
                    datePicker.set("v.hours", date.getUTCHours());
                    datePicker.set("v.minutes", date.getUTCMinutes());
                }
            }
        }
    },

    popupTimePicker: function (component, hours, minutes, focusTimePicker) {
        this.loadTimePicker(component);

        var timePicker = component.find("timePicker");
        if (timePicker && timePicker.get("v.visible") === false) {
            timePicker.show(hours, minutes, focusTimePicker);
        }
    },

    loadDatePicker: function (component) {
        if (!component.get("v.loadDatePicker")) {
            component.set("v.loadDatePicker", true);

            //datepicker has been loaded now, find it again and set it's reference element
            this.initializeDatePicker(component);
        }
    },

    loadTimePicker: function (component) {
        if (!component.get("v.loadTimePicker")) {
            component.set("v.loadTimePicker", true);
        }

        this.initializeTimePicker(component);
    },

    initializeDatePicker: function (component) {
        var datePicker = component.find("datePicker");
        if (datePicker) {
            datePicker.set("v.referenceElement", component.find("inputDate").getElement());
            datePicker.set("v.is24HourFormat", this.is24HourFormat(component));
        }
    },

    initializeTimePicker: function (component) {
        var timePicker = component.find("timePicker");
        if (timePicker) {
            timePicker.set("v.referenceElement", component.find("inputTime").getElement());
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

    openDatepickerWithManager: function (component, currentDate, focusDatePicker, toggleVisibility) {
        $A.getEvt('markup://ui:showDatePicker').fire({
            element: component.find("inputDate").getElement(),
            value: currentDate ? this.getUTCDateString(currentDate) : currentDate,
            sourceComponentId: component.getGlobalId(),
            focusDatePicker: focusDatePicker,
            toggleVisibility: toggleVisibility
        });
    },

    closeDatepickerWithManager: function(component) {
        var useManager = component.get("v.useManager"),
        managerExists = component.get("v.managerExists");
        if (useManager && managerExists) {
            $A.getEvt('markup://ui:hideDatePicker').fire();
        }
    },

    handleDateSelectionByManager: function (component, event) {
        var dateValue = event.getParam("arguments").value;
        if (dateValue) {
            this.setDateValue(component, dateValue);
        }
    },

    togglePickerIcon: function (component) {
        var openIconCmp = component.find("datePickerOpener");
        var openIconElem = openIconCmp ? openIconCmp.getElement() : null;
        var openTimeIconCmp = component.find("timePickerOpener");
        var openTimeIconElem = openTimeIconCmp ? openTimeIconCmp.getElement() : null;
        var clearCmp = component.find("clear");
        var clearElem = clearCmp ? clearCmp.getElement() : null;

        if (component.get("v.useSingleInput")) {
            if ($A.util.isEmpty(component.get("v.value"))) { // no value, so hide the clear icon and display the date picker icon
                $A.util.swapClass(clearElem, "display", "hide");
                $A.util.swapClass(openIconElem, "hide", "display");
            } else {
                $A.util.swapClass(clearElem, "hide", "display");
                $A.util.swapClass(openIconElem, "display", "hide");
            }
        } else {
            if (component.get('v.displayDatePicker')) {
                if ($A.util.getBooleanValue(component.get('v.disabled'))) {
                    $A.util.swapClass(openIconElem, "display", "hide");
                    if (openTimeIconElem) {
                        $A.util.swapClass(openTimeIconElem, "display", "hide");
                    }
                } else {
                    $A.util.swapClass(openIconElem, "hide", "display");
                    if (openTimeIconElem) {
                        $A.util.swapClass(openTimeIconElem, "hide", "display");
                    }
                }
            }
        }
    },

    handleDateTimeSelection: function (component, event) {
        var dateValue = event.getParam("value"),
            selectedHours = event.getParam("hours"),
            selectedMinutes = event.getParam("minutes");

        if (!component.get("v.useSingleInput")) {
            var hasNewDate = !$A.util.isUndefinedOrNull(dateValue),
                hasNewTime = !$A.util.isUndefinedOrNull(selectedHours) && !$A.util.isUndefinedOrNull(selectedMinutes);

            if (hasNewDate) {
                this.setDateValue(component, dateValue);
            } else if (hasNewTime) {
                this.setTimeValue(component, selectedHours, selectedMinutes);
            }
        } else {
            var config = {
                hours: selectedHours,
                minutes: selectedMinutes,
                timezone: this.getTimezone(component)
            };

            var date = $A.localizationService.parseDateTimeUTC(dateValue, this.DATE_FORMAT, this.getLocale(component));

            var setValue = function (isoValue) {
                this.setComponentValue(component, isoValue);
            }.bind(this);

            this.dateTimeLib.dateTimeService.getISOValue(date, config, $A.getCallback(setValue));
        }
    },

    setDateValue: function (component, dateValue) {
        var displayValue = this.formatDateString(component, dateValue);

        this.displayDate(component, displayValue);

        var dateTimeParams = {
            date: displayValue,
            time: this.getTimeString(component),
            ignoreChange: false
        };
        this.setDateTimeValue(component, dateTimeParams);
    },

    setTimeValue: function (component, selectedHours, selectedMinutes) {
        var displayValue = this.formatTimeString(component, selectedHours, selectedMinutes);

        this.displayTime(component, displayValue);

        var currentDateString = this.getDateString(component);
        if (!$A.util.isEmpty(currentDateString)) {
            var dateTimeParams = {
                date: currentDateString,
                time: displayValue,
                ignoreChange: false
            };
            this.setDateTimeValue(component, dateTimeParams);
        }
    },

    setDateTimeValue: function (component, dateTimeParams) {
        var hasTime = !$A.util.isEmpty(dateTimeParams.time);

        var date = this.getDateTime(component, dateTimeParams.date, dateTimeParams.time);
        if (!$A.util.isUndefinedOrNull(date)) {
            var config = {
                timezone: this.getTimezone(component)
            };

            if (!hasTime && !component.get("v.useSingleInput")) {
                // using 12:00 as default value when no time has been entered yet
                config.hours = 12;
                config.minutes = 0;
            }

            var setValue = function (isoValue) {
                this.setComponentValue(component, isoValue, dateTimeParams.ignoreChange);
            }.bind(this);

            this.dateTimeLib.dateTimeService.getISOValue(date, config, $A.getCallback(setValue));
        } else {
            // date time was invalid, let server do validation
            var value = hasTime ? dateTimeParams.date + " " + dateTimeParams.time : dateTimeParams.date;
            this.setComponentValue(component, value, dateTimeParams.ignoreChange);
        }
    },

    updateTimeFormat: function (component) {
        // removing 'seconds' from the time format
        var timeFormat = this.getTimeFormat(component);

        var regexp = /(\W*(?=[sS])[^aAZ\s]*)/;
        var timeWithoutSecondsFormat = timeFormat.replace(regexp, '');
        component.set("v.timeFormat", timeWithoutSecondsFormat);
    },

    setPlaceHolder: function (component) {
        // only add the placeholder when there is no date picker opener.
        if (!component.get("v.displayDatePicker")) {
            if ($A.util.isEmpty(component.get("v.placeholder"))) {
                component.set("v.placeholder", this.getDateFormat(component));
            }
            if ($A.util.isEmpty(component.get("v.timePlaceholder"))) {
                component.set("v.timePlaceholder", this.getTimeFormat(component));
            }
        }
    },

    getDateValueForDatePicker: function (component) {
        var currentDate = this.getDateTime(component);
        if (!currentDate) {
            var now = new Date(); // local date
            // Later on, we will use getUTC... methods to get year/month/date
            currentDate = new Date(Date.UTC(now.getFullYear(),
                now.getMonth(),
                now.getDate(),
                now.getHours(),
                now.getMinutes(),
                now.getSeconds(),
                now.getMilliseconds()));
        } else {
            currentDate = $A.localizationService.translateFromOtherCalendar(currentDate);
        }
        return currentDate;
    },

    getDateTime: function (component, dateString, timeString) {
        var dateValue = !$A.util.isEmpty(dateString) ? dateString : this.getDateString(component);
        return this.parseDateTimeInput(true, component, dateValue, timeString);
    },

    getDateString: function (component) {
        var inputDateElement = component.find("inputDate").getElement();
        return $A.localizationService.translateFromLocalizedDigits(inputDateElement.value);
    },

    getTimeString: function (component) {
        var inputTimeCmp = component.find("inputTime");
        // when useSingleInput=true, we may not have an inputTime
        var inputTimeElement = inputTimeCmp ? inputTimeCmp.getElement() : null;
        if (!inputTimeElement) {
            return null;
        }
        return $A.localizationService.translateFromLocalizedDigits(inputTimeElement.value);
    },

    displayDate: function (component, dateDisplayValue) {
        if (!$A.util.isUndefinedOrNull(dateDisplayValue)) {
            var inputElem = component.find("inputDate").getElement();
            inputElem.value = $A.localizationService.translateToLocalizedDigits(dateDisplayValue);
        }
    },

    displayTime: function (component, timeDisplayValue) {
        if (!component.get("v.useSingleInput") && !$A.util.isUndefinedOrNull(timeDisplayValue)) {
            var inputElem = component.find("inputTime").getElement();
            inputElem.value = $A.localizationService.translateToLocalizedDigits(timeDisplayValue);
        }
    },

    formatDateString: function (component, dateString) {
        var utcDate = $A.localizationService.parseDateTimeUTC(dateString, this.DATE_FORMAT);

        if (!utcDate) {
            return "";
        }

        utcDate = $A.localizationService.translateToOtherCalendar(utcDate);
        var formattedDate = $A.localizationService.formatDateUTC(utcDate, this.getDateFormat(component), this.getLocale(component));
        return formattedDate;
    },

    formatTimeString: function (component, hours, minutes) {
        var date = new Date();
        date.setHours(hours, minutes);
        var formattedTime = $A.localizationService.formatTime(date, this.getTimeFormat(component), this.getLocale(component));

        return formattedTime;
    },

    shouldUpdateDisplayValue: function (component) {
        // on rerender, if an incorrect datetime is entered, do not change the display value so the user has a chance
        // to fix the invalid input
        var currentDateString = this.getDateString(component);
        var currentTimeString = this.getTimeString(component);

        return component.get("v.useSingleInput")
            || ($A.util.isEmpty(currentDateString) && $A.util.isEmpty(currentTimeString))
            || $A.util.isEmpty(component.get("v.value"))
            || this.parseDateTimeInput(false, component, currentDateString, currentTimeString);
    },

    parseDateTimeInput: function (isUTC, component, dateValue, timeValue) {
        if ($A.util.isEmpty(dateValue)) {
            return null;
        }

        var value, format, date;
        var isDesktop = !component.get("v.useSingleInput");

        if (isDesktop) {
            var dateFormat = this.getDateFormat(component);
            var timeFormat = this.getTimeFormat(component);

            var hasTime = !$A.util.isEmpty(timeValue);
            format = hasTime ? dateFormat + " " + timeFormat : dateFormat;
            value = hasTime ? dateValue + " " + timeValue : dateValue;
        } else {
            format = this.getDateTimeFormat(component);
            value = dateValue;
        }

        if (isUTC) {
            date = $A.localizationService.parseDateTimeUTC(value, format, this.getLocale(component), isDesktop);
        } else {
            date = $A.localizationService.parseDateTime(value, format, this.getLocale(component), isDesktop);
        }

        return date;
    },

    handlePickerTab: function (component, event) {
        if (event.keyCode === 9) { //tab
            var useManager = component.get("v.useManager"),
                managerExists = component.get("v.managerExists");
            if (useManager && managerExists) {
                // ask the manager to focus the open datepicker, without toggling visibility
                this.openDatepickerWithManager(component, null, true, false);
            } else {
                var datepicker = component.find("datePicker");
                if (datepicker && datepicker.get("v.visible") === true) {
                    datepicker.focus();
                }
            }
        }
    },

    setComponentValue: function (component, newValue, ignoreChange) {
        if (component.get("v.value") !== newValue) {
            component.set("v.value", newValue);
            this.fireChangeEvent(component, ignoreChange);
        }
    },

    fireChangeEvent: function (component, ignoreChange) {
        if (!ignoreChange) {
            component.getEvent("change").fire();
        }
    },

    getDateFormat: function (component) {
        return component.get("v.dateFormat") || $A.get("$Locale.dateFormat");
    },

    getTimeFormat: function (component) {
        return component.get("v.timeFormat") || $A.get("$Locale.timeFormat");
    },

    getDateTimeFormat: function (component) {
        return component.get("v.format") || $A.get("$Locale.datetimeFormat");
    },

    getTimezone: function (component) {
        return component.get("v.timezone") || $A.get("$Locale.timezone");
    },

    getLocale: function (component) {
        return component.get("v.langLocale");
    },

    /**
     * Override ui:input.
     */
    shouldShowError: function () {
        return true;
    }
})// eslint-disable-line semi
