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
    init: function(component) {
        if (component.get("v.disabled")) {
            component.set("v.displayDatePicker", false);
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

    displayDatePicker: function(component) {
        if (component.get("v.useSingleInput") && !component.get("v.displayDatePicker")) {
            return;
        }
        var langLocale = component.get("v.langLocale");
        langLocale = !$A.util.isUndefinedOrNull(langLocale) ? langLocale : $A.get("$Locale.langLocale");
        var currentDate = this.getDateTime(component, langLocale);
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
        }
        this.popUpDatePicker(component, currentDate);
    },

    displayTimePicker: function(component) {
        var inputTimeValue = this.getTimeString(component);
        var dateTimeString;
        var hours, minutes;
        if (!$A.util.isEmpty(inputTimeValue)) {
            var langLocale = component.get("v.langLocale") || $A.get("$Locale.langLocale");

            var inputDateValue = this.getDateString(component);
            if (!$A.util.isEmpty(inputDateValue)) {
                dateTimeString = inputDateValue + " " + inputTimeValue;
            } else {
                // create a new utc date string, append the inputTime value
                var todayDate = new Date();
                var todayDateString = todayDate.getFullYear() + "-" + (todayDate.getMonth() + 1) + "-" + todayDate.getDate();
                var dateFormat = component.get("v.dateFormat") || $A.get("$Locale.dateFormat");
                var formattedDate = this.formatDateString(todayDateString, "yyyy-MM-dd", dateFormat, langLocale);

                dateTimeString = formattedDate + " " + inputTimeValue;
            }

            var format = component.get("v.format") || $A.get("$Locale.datetimeFormat");

            var currentDate = $A.localizationService.parseDateTime(dateTimeString, format, langLocale);

            // if the dateTime is not null, this means that there's a date selected
            if (!$A.util.isUndefinedOrNull(currentDate)) {
                hours = currentDate.getHours();
                minutes = currentDate.getMinutes();
            }
        }
        this.popupTimePicker(component, hours, minutes);
    },

    handleInputDateFocused : function(component) {
        var inputText = this.getDateString(component);

        if ($A.util.isEmpty(inputText) && component.get("v.displayDatePicker")) {
            this.displayDatePicker(component);
        }
    },

    handleInputTimeFocused : function(component) {
        var inputText = this.getTimeString(component);

        if ($A.util.isEmpty(inputText) && !component.get("v.disabled")) {
            this.displayTimePicker(component);
        }
    },

    /**
     * Override ui:input because we have two inputs, and ui:input only adds handlers to the first input
     */
    addDomHandler : function(component, event) {
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
    handleUpdate : function(component, event) {
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
            var langLocale = component.get("v.langLocale") || $A.get("$Locale.langLocale");
            this.setDateTimeValue(component, dateValue, timeValue, langLocale);
        }
    },

    displayValue: function(component) {
        var config = {
            langLocale : component.get("v.langLocale") || $A.get("$Locale.langLocale"),
            timezone : component.get("v.timezone") || $A.get("$Locale.timezone"),
            validateString : false       // should we validate?
        };

        if (component.get("v.useSingleInput")) {
            config.format = component.get("v.format") || $A.get("$Locale.datetimeFormat");
        } else {
            config.format = component.get("v.dateFormat") || $A.get("$Locale.dateFormat");
            config.timeFormat = component.get("v.timeFormat") || $A.get("$Locale.timeFormat");
        }


        var helper = this;
        var displayValue = function (dateValue, timeValue) {
            helper.displayDate(component, dateValue);
            helper.displayTime(component, timeValue);
        };

        var value = component.get("v.value");
        this.dateTimeLib.dateTimeService.getDisplayValue(value, config, displayValue);
    },

    getUTCDateString: function(date) {
        return date.getUTCFullYear() + "-" + (date.getUTCMonth() + 1) + "-" + date.getUTCDate();
    },

    is24HourFormat: function(component) {
        var format = component.get("v.format");
        if (!format) {
            format = $A.get("$Locale.datetimeFormat");
        }
        return !($A.localizationService.isPeriodTimeView(format));
    },

    popUpDatePicker: function(component, date) {
        var useManager = component.get("v.useManager"),
            managerExists = component.get("v.managerExists");

        if (useManager && managerExists) {
            this.openDatepickerWithManager(component, date);
        } else {
            // if useManager was true but there is no manager, or if useManager was false, then set loadDatePicker to true
            this.loadDatePicker(component);

            var datePicker = component.find("datePicker");
            if (datePicker && datePicker.get("v.visible") === false) {
                datePicker.set("v.value", this.getUTCDateString(date));
                datePicker.set("v.hours", date.getUTCHours());
                datePicker.set("v.minutes", date.getUTCMinutes());
                datePicker.set("v.visible", true);
            }
        }
    },

    popupTimePicker: function(component, hours, minutes) {
        this.loadTimePicker(component);

        var timePicker = component.find("timePicker");
        if (timePicker && timePicker.get("v.visible") === false) {
            if (hours) {
                timePicker.set("v.hours", hours);
                timePicker.set("v.minutes", minutes);
            }
            timePicker.set("v.visible", true);
        }
    },

    loadDatePicker: function(component) {
        if (!component.get("v.loadDatePicker")) {
            component.set("v.loadDatePicker", true);

            //datepicker has been loaded now, find it again and set it's reference element
            this.initializeDatePicker(component);
        }
    },

    loadTimePicker: function(component) {
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

    initializeTimePicker: function(component) {
        var timePicker = component.find("timePicker");
        if (timePicker) {
            timePicker.set("v.referenceElement", component.find("inputTime").getElement());
        }
    },

    checkManagerExists: function(component) {
        $A.getEvt('markup://ui:registerDatePickerManager').setParams({
            sourceComponentId : component.getGlobalId()
        }).fire();
    },

    registerManager : function(component, event) {
        var sourceComponentId = event.getParam('sourceComponentId') || event.getParam("arguments").sourceComponentId;
        if ($A.util.isUndefinedOrNull(sourceComponentId)) {
            return;
        }

        var sourceComponent = $A.componentService.get(sourceComponentId);
        if (sourceComponent && sourceComponent.isInstanceOf("ui:datePickerManager")) {
            component.set("v.managerExists", true);
        }
    },

    openDatepickerWithManager: function(component, currentDate) {
        $A.getEvt('markup://ui:showDatePicker').setParams({
            element  	: component.find("inputDate").getElement(),
            value      	: currentDate ? this.getUTCDateString(currentDate) : currentDate,
            sourceComponentId : component.getGlobalId()
        }).fire();
    },

    handleDateSelectionByManager : function(component, event) {
        var dateValue = event.getParam("arguments").value;
        if (dateValue) {
            this.setDateValue(component, dateValue);
        }
    },

    togglePickerIcon: function(component) {
        var openIconCmp = component.find("datePickerOpener");
        var openIconElem = openIconCmp ? openIconCmp.getElement() : null;
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
        }
    },

    handleDateTimeSelection : function(component, event) {
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
            var langLocale = component.get("v.langLocale") || $A.get("$Locale.langLocale");
            var config = {
                hours : selectedHours,
                minutes : selectedMinutes,
                timezone : component.get("v.timeFormat") || $A.get("$Locale.timeFormat")
            };

            var date = $A.localizationService.parseDateTimeUTC(dateValue, "YYYY-MM-DD", langLocale);

            var setValue = function(isoValue) {
                component.set("v.value", isoValue);
            };

            this.dateTimeLib.dateTimeService.getISOValue(date, config, $A.getCallback(setValue));
        }
    },

    setDateValue: function(component, dateValue) {
        var sourceFormat = "yyyy-MM-dd";
        var targetFormat = component.get("v.dateFormat") || $A.get("$Locale.dateFormat");
        var langLocale = component.get("v.langLocale") || $A.get("$Locale.langLocale");

        var displayValue = this.formatDateString(dateValue, sourceFormat, targetFormat, langLocale);

        this.displayDate(component, displayValue);

        var currentTimeString = this.getTimeString(component);
        this.setDateTimeValue(component, displayValue, currentTimeString, langLocale);
    },

    setTimeValue: function(component, selectedHours, selectedMinutes) {
        var timeFormat = component.get("v.timeFormat") || $A.get("$Locale.timeFormat");
        var langLocale = component.get("v.langLocale") || $A.get("$Locale.langLocale");

        var displayValue = this.formatTimeString(selectedHours, selectedMinutes, timeFormat, langLocale);

        this.displayTime(component, displayValue);

        var currentDateString = this.getDateString(component);
        if (!$A.util.isEmpty(currentDateString)) {
        	this.setDateTimeValue(component, currentDateString, displayValue, langLocale);
        }
    },

    setDateTimeValue: function(component, dateString, timeString, langLocale) {
        var hasTime = !$A.util.isEmpty(timeString);

        var date = this.getDateTime(component, langLocale, dateString, timeString);
        if (!$A.util.isUndefinedOrNull(date)) {
            var config = {
                timezone : component.get("v.timezone") || $A.get("$Locale.timezone")
            };

            if (!hasTime && !component.get("v.useSingleInput")) {
                // using 12:00 as default value when no time has been entered yet
                config.hours = 12;
                config.minutes = 0;
            }

            var setValue = function(isoValue) {
                component.set("v.value", isoValue);
            };

            this.dateTimeLib.dateTimeService.getISOValue(date, config, $A.getCallback(setValue));
        } else {
            // date time was invalid, let server do validation
            var value = hasTime ? dateString + " " + timeString : dateString;
            component.set("v.value", value);
        }
    },

    updateTimeFormat: function(component) {
        // removing 'seconds' from the time format
        var timeFormat = component.get("v.timeFormat");
        timeFormat = !$A.util.isUndefinedOrNull(timeFormat) ? timeFormat : $A.get("$Locale.timeFormat");

        var regexp = /(\W*(?=[sS])[^aAZ\s]*)/;
        var timeWithoutSecondsFormat = timeFormat.replace(regexp, '');
        component.set("v.timeFormat", timeWithoutSecondsFormat);
    },

    setPlaceHolder: function (component) {
        // only add the placeholder when there is no date picker opener.
        if (!component.get("v.displayDatePicker")) {
            var dateFormat = component.get("v.dateFormat");
            var timeFormat = component.get("v.timeFormat");

            dateFormat = $A.util.isEmpty(dateFormat) ? $A.get("$Locale.dateFormat") : dateFormat;
            timeFormat = $A.util.isEmpty(timeFormat) ? $A.get("$Locale.timeFormat") : timeFormat;

            if ($A.util.isEmpty(component.get("v.placeholder"))) {
                component.set("v.placeholder", dateFormat);
            }
            if ($A.util.isEmpty(component.get("v.timePlaceholder"))) {
                component.set("v.timePlaceholder", timeFormat);
            }
        }
    },

    getDateTime: function(component, langLocale, dateString, timeString) {
        var dateValue = !$A.util.isEmpty(dateString) ? dateString : this.getDateString(component);
        return this.parseDateTimeInput(true, component, dateValue, timeString);
    },

    getDateString: function(component) {
        var inputDateElement = component.find("inputDate").getElement();
        return $A.localizationService.translateFromLocalizedDigits(inputDateElement.value);
    },

    getTimeString: function(component) {
        var inputTimeCmp = component.find("inputTime");
        // when useSingleInput=true, we may not have an inputTime
        var inputTimeElement = inputTimeCmp ? inputTimeCmp.getElement() : null;
        if (!inputTimeElement) {
            return null;
        }
        return $A.localizationService.translateFromLocalizedDigits(inputTimeElement.value);
    },

    displayDate: function(component, dateDisplayValue) {
        if (!$A.util.isUndefinedOrNull(dateDisplayValue)){
            var inputElem = component.find("inputDate").getElement();
            inputElem.value = $A.localizationService.translateToLocalizedDigits(dateDisplayValue);
        }
    },

    displayTime: function(component, timeDisplayValue) {
        if (!$A.util.isUndefinedOrNull(timeDisplayValue)){
            var inputElem = component.find("inputTime").getElement();
            inputElem.value = $A.localizationService.translateToLocalizedDigits(timeDisplayValue);
        }
    },

    formatDateString: function(dateString, sourceFormat, targetFormat, locale) {
        var utcDate = $A.localizationService.parseDateTimeUTC(dateString, sourceFormat);

        if (!utcDate) {
            return "";
        }

        utcDate = $A.localizationService.translateToOtherCalendar(utcDate);
        var formattedDate = $A.localizationService.formatDateUTC(utcDate, targetFormat, locale);
        return formattedDate;
    },

    formatTimeString: function(hours, minutes, timeFormat, locale) {
        var date = new Date();
        date.setHours(hours, minutes);
        var formattedTime = $A.localizationService.formatTime(date, timeFormat, locale);

        return formattedTime;
    },

    shouldUpdateDisplayValue: function(component) {
        // on rerender, if an incorrect datetime is entered, do not change the display value so the user has a chance to fix the invalid input
        var currentDateString = this.getDateString(component);
        var currentTimeString = this.getTimeString(component);

        return component.get("v.useSingleInput")
            || ($A.util.isEmpty(currentDateString) && $A.util.isEmpty(currentTimeString))
            || this.parseDateTimeInput(false, component, currentDateString, currentTimeString);

    },

    parseDateTimeInput: function(isUTC, component, dateValue, timeValue) {
        if ($A.util.isEmpty(dateValue)) {
            return null;
        }

        var value, format, date;
        var langLocale = component.get("v.langLocale") || $A.get("$Locale.langLocale");
        var isDesktop = !component.get("v.useSingleInput");

        if (isDesktop) {
            var dateFormat = component.get("v.dateFormat") || $A.get("$Locale.dateFormat");
            var timeFormat = component.get("v.timeFormat") || $A.get("$Locale.timeFormat");

            var hasTime = !$A.util.isEmpty(timeValue);
            format = hasTime ? dateFormat + " " + timeFormat : dateFormat;
            value = hasTime ? dateValue + " " + timeValue : dateValue;
        } else {
            format = component.get("v.format") || $A.get("$Locale.dateTimeFormat");
            value = dateValue;
        }

        if (isUTC) {
            date = $A.localizationService.parseDateTimeUTC(value, format, langLocale, isDesktop);
        } else {
            date = $A.localizationService.parseDateTime(value, format, langLocale, isDesktop);
        }

        return date;
    },

    /**
     * Override ui:input.
     */
    shouldShowError : function () {
        return true;
    }
})// eslint-disable-line semi
