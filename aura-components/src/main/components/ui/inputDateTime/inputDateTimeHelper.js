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
        var timePicker = component.find("timePicker");
        if (!timePicker || timePicker.get("v.visible") === true) {
            return;
        }
        var inputTimeValue = this.getTimeString(component);
        var dateTimeString;
        if (!$A.util.isEmpty(inputTimeValue)) {
            var langLocale = component.get("v.langLocale");
            langLocale = !$A.util.isUndefinedOrNull(langLocale) ? langLocale : $A.get("$Locale.langLocale");

            var inputDateValue = this.getDateString(component);
            if (!$A.util.isEmpty(inputDateValue)) {
                dateTimeString = inputDateValue + " " + inputTimeValue;
            } else {
                // create a new utc date string, append the inputTime value
                var todayDate = new Date();
                var todayDateString = todayDate.getFullYear() + "-" + (todayDate.getMonth() + 1) + "-" + todayDate.getDate()
                var utcDate = $A.localizationService.parseDateTimeUTC(todayDateString, "yyyy-MM-dd");
                if (!$A.util.isUndefinedOrNull(utcDate)) {
                    var dateFormat = component.get("v.dateFormat");
                    dateFormat = !$A.util.isUndefinedOrNull(dateFormat) ? dateFormat : $A.get("$Locale.dateFormat");

                    var displayValue = $A.localizationService.formatDate(utcDate, dateFormat, langLocale);
                    dateTimeString = displayValue + " " + inputTimeValue;
                }
            }

            var format = component.get("v.format");
            format = !$A.util.isUndefinedOrNull(format) ? format : $A.get("$Locale.datetimeFormat");

            var currentDate = $A.localizationService.parseDateTime(dateTimeString, format, langLocale);

            // if the dateTime is not null, this means that there's a date selected
            if (!$A.util.isUndefinedOrNull(currentDate)) {
                timePicker.set("v.hours", currentDate.getHours());
                timePicker.set("v.minutes", currentDate.getMinutes());
            }
        }

        timePicker.set("v.visible", true);
    },

    /**
     * This can be overridden by extended component.
     */
    displayDateTime: function(component, dateDisplayValue, timeDisplayValue) {
        if (!$A.util.isUndefinedOrNull(dateDisplayValue)){
            var inputCmp = component.find("inputDate");
            var elem = inputCmp ? inputCmp.getElement() : null;
            if (elem) {
                elem.value = $A.localizationService.translateToLocalizedDigits(dateDisplayValue);
            }
        }
        if (!$A.util.isUndefinedOrNull(timeDisplayValue)){
            var inputCmp = component.find("inputTime");
            var elem = inputCmp ? inputCmp.getElement() : null;
            if (elem) {
                elem.value = $A.localizationService.translateToLocalizedDigits(timeDisplayValue);
            }
        }
    },

    /**
     * Override ui:input because we have two inputs, and ui:input only adds class to the first input
     */
    addInputClass: function(component) {
        if (!this.isDesktopMode(component)) {
            var inputEl = this.getInputElement(component);
            $A.util.addClass(inputEl, component.getConcreteComponent().getDef().getStyleClassName());
        } else {
            var inputElements = component.getElement().getElementsByTagName('input');
            for (var i = 0; i < inputElements.length; i++) {
                var element = inputElements[i];
                $A.util.addClass(element, component.getConcreteComponent().getDef().getStyleClassName());
            }
        }
    },

    /**
     * Override ui:input because we have two inputs, and ui:input only adds handlers to the first input
     */
    addDomHandler : function(component, event) {
        if (!this.isDesktopMode(component)) {
            var inputElement = this.getInputElement(component);
            $A.util.on(inputElement, event, this.lib.interactive.domEventHandler);
        } else {
            var inputElements = component.getElement().getElementsByTagName('input');
            for (var i = 0; i < inputElements.length; i++) {
                var element = inputElements[i];
                $A.util.on(element, event, this.lib.interactive.domEventHandler);
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
            if (!$A.util.isEmpty(dateValue)) {
                var timeValue = this.getTimeString(component);
                var dateTimeString = timeValue ? dateValue + " " + timeValue : dateValue;
                var hasTime = !$A.util.isEmpty(timeValue);
                this.doUpdate(component, dateTimeString, hasTime);
            }
        }
    },

    /**
     * Override ui:input.
     *
     */
    doUpdate : function(component, value, hasTime) {
        if (!$A.util.isEmpty(value)) {
            var langLocale = component.get("v.langLocale");
            langLocale = !$A.util.isUndefinedOrNull(langLocale) ? langLocale : $A.get("$Locale.langLocale");

            this.setDateTimeValue(component, value, hasTime, langLocale);
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

        var langLocale = component.get("v.langLocale");
        langLocale = !$A.util.isUndefinedOrNull(langLocale) ? langLocale : $A.get("$Locale.langLocale");

        var date = $A.localizationService.parseDateTimeISO8601(value);

        if (this.isDesktopMode(component)) {
            if (!$A.util.isUndefinedOrNull(date)) {
                var dateFormat = component.get("v.dateFormat");
                dateFormat = !$A.util.isUndefinedOrNull(dateFormat) ? dateFormat : $A.get("$Locale.dateFormat");

                var timeFormat = component.get("v.timeFormat");
                timeFormat = !$A.util.isUndefinedOrNull(timeFormat) ? timeFormat : $A.get("$Locale.timeFormat");

                var timezone = component.get("v.timezone");
                $A.localizationService.UTCToWallTime(date, timezone, function(walltime) {
                    try {
                        walltime = $A.localizationService.translateToOtherCalendar(walltime);
                        var dateDisplayValue = $A.localizationService.formatDateUTC(walltime, dateFormat, langLocale);
                        var timeDisplayValue = $A.localizationService.formatTimeUTC(walltime, timeFormat, langLocale);
                        _helper.displayDateTime(concreteCmp, dateDisplayValue, timeDisplayValue);
                    } catch (e) {
                        _helper.displayDateTime(concreteCmp, e.message);
                    }
                });
            } else {
                _helper.displayDateTime(component, value);
            }

        } else {
            if (!$A.util.isUndefinedOrNull(date)) {
                var format = component.get("v.format");
                var langLocale = component.get("v.langLocale");
                var timezone = component.get("v.timezone");
                $A.localizationService.UTCToWallTime(date, timezone, function (walltime) {
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
        }
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
        var datePicker = component.find("datePicker");
        if (datePicker) {
            datePicker.set("v.value", this.getUTCDateString(date));
            datePicker.set("v.hours", date.getUTCHours());
            datePicker.set("v.minutes", date.getUTCMinutes());
            datePicker.set("v.is24HourFormat", this.is24HourFormat(component));
            datePicker.set("v.visible", true);
            if (this.isDesktopMode(component)) {
                datePicker.set("v.hasTime", false);
                datePicker.set("v.showToday", false);
            } else {
                datePicker.set("v.hasTime", true);
                datePicker.set("v.showToday", true);
            }
        }
    },

    toggleClearButton: function(component) {
        if (!this.isDesktopMode(component)) {
            var inputCmp = component.find("inputDate");
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

    setDateValue: function(component, dateValue) {
        var utcDate = $A.localizationService.parseDateTimeUTC(dateValue, "yyyy-MM-dd");
        if (!$A.util.isUndefinedOrNull(utcDate)) {
            var dateFormat = component.get("v.dateFormat");
            dateFormat = !$A.util.isUndefinedOrNull(dateFormat) ? dateFormat : $A.get("$Locale.dateFormat");

            var langLocale = component.get("v.langLocale");
            langLocale = !$A.util.isUndefinedOrNull(langLocale) ? langLocale : $A.get("$Locale.langLocale");

            var displayValue;
            try {
                utcDate = $A.localizationService.translateToOtherCalendar(utcDate);
                displayValue = $A.localizationService.formatDateUTC(utcDate, dateFormat, langLocale);
            } catch (e) {
                displayValue = e.message;
            }
        }

        var elem = component.find("inputDate").getElement();
        displayValue = displayValue ? $A.localizationService.translateToLocalizedDigits(displayValue) : '';
        elem.value = displayValue;

        var currentTimeString = this.getTimeString(component);
        var dateTimeString = displayValue + " " + currentTimeString,
            hasTime = !$A.util.isEmpty(currentTimeString);
        this.setDateTimeValue(component, dateTimeString, hasTime, langLocale);
    },

    setTimeValue: function(component, selectedHours, selectedMinutes) {
        // for setting the time value we don't need the selected date
        var date = new Date();
        date.setHours(selectedHours, selectedMinutes);

        var timeFormat = component.get("v.timeFormat");
        timeFormat = !$A.util.isUndefinedOrNull(timeFormat) ? timeFormat : $A.get("$Locale.timeFormat");

        var langLocale = component.get("v.langLocale");
        langLocale = !$A.util.isUndefinedOrNull(langLocale) ? langLocale : $A.get("$Locale.langLocale");


        var displayValue = $A.localizationService.formatTime(date, timeFormat, langLocale);
        var elem = component.find("inputTime").getElement();
        displayValue = displayValue ? $A.localizationService.translateToLocalizedDigits(displayValue) : '';
        elem.value = displayValue;

        var currentDateString = this.getDateString(component);
        if (!$A.util.isEmpty(currentDateString)) {
            var dateTimeString = currentDateString + " " + displayValue,
                hasTime = !$A.util.isEmpty(displayValue);
            this.setDateTimeValue(component, dateTimeString, hasTime, langLocale);
        }
    },

    setDateTimeValue: function(component, dateTimeString, hasTime, langLocale) {
        var localizedValue = $A.localizationService.translateFromLocalizedDigits(dateTimeString);
        var ret = localizedValue;
        var date = this.getDateTime(component, langLocale, localizedValue);
        if (!$A.util.isUndefinedOrNull(date)) {
            if (!hasTime) {
                // using 12:00 as default value when no time has been entered yet
                date = Date.UTC(date.getUTCFullYear(),
                    date.getUTCMonth(),
                    date.getUTCDate(),
                    12,
                    0);
            }
            var localDate = new Date(date);

            $A.localizationService.WallTimeToUTC(localDate, component.get("v.timezone"), function (utcDate) {
                utcDate = $A.localizationService.translateFromOtherCalendar(utcDate);
                component.set("v.value", $A.localizationService.toISOString(utcDate));
            });
        } else {
            component.set("v.value", ret);
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

    getDateTime: function(component, langLocale, dateTimeString) {
        var dateValue = !$A.util.isEmpty(dateTimeString) ? dateTimeString : this.getDateTimeString(component);

        var date;
        if (!$A.util.isUndefinedOrNull(dateValue)) {
            var format = component.get("v.format");
            format = !$A.util.isUndefinedOrNull(format) ? format : $A.get("$Locale.datetimeFormat");

            date = $A.localizationService.parseDateTimeUTC(dateValue, format, langLocale);
        }

        return date;
    },

    getDateTimeString: function(component) {
        var dateValue = this.getDateString(component);

        // on desktop, time has a separate input field.
        if (this.isDesktopMode(component) && !$A.util.isEmpty(dateValue)) {
            var timeValue = this.getTimeString(component);
            dateValue += timeValue ? " " + timeValue : "";
        }
        return dateValue;
    },

    getDateString: function(component) {
        var inputDate = component.find("inputDate");
        var dateElem = inputDate ? inputDate.getElement() : null;
        return dateElem ? dateElem.value : null;
    },

    getTimeString: function(component) {
        var inputTime = component.find("inputTime");
        var timeElem = inputTime ? inputTime.getElement() : null;
        return timeElem ? timeElem.value : null;
    },

    isDesktopMode: function(component) {
        return $A.get("$Browser.formFactor") == "DESKTOP" &&
                !component.get("v.useSingleInput")
    }
})