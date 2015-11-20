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
	clearValue: function(component) {
		component.set("v.value", "");
	},

	click: function(component, event, helper) {
        event.preventDefault();
        var concreteCmp = component.getConcreteComponent();
        helper.displayDatePicker(concreteCmp);
    },

    doInit: function(component, event, helper) {
        var datePicker = component.find("datePicker");
    	// only add the placeholder when there is no date picker opener.
        if (helper.isDesktopMode(component)) {
            helper.updateTimeFormat(component);
            if (!component.get("v.displayDatePicker")) {
                var dateFormat = component.get("v.dateFormat"),
                    timeFormat = component.get("v.timeFormat");
                dateFormat = $A.util.isEmpty(dateFormat) ? $A.get("$Locale.dateFormat") : dateFormat;
                timeFormat = $A.util.isEmpty(timeFormat) ? $A.get("$Locale.timeFormat") : timeFormat;

                if ($A.util.isEmpty(component.get("v.placeholder"))) {
                    component.set("v.placeholder", dateFormat);
                }
                if ($A.util.isEmpty(component.get("v.timePlaceholder"))) {
                    component.set("v.timePlaceholder", timeFormat);
                }
            }
            datePicker.set("v.hasTime", false);
            datePicker.set("v.showToday", false);
        } else {
            datePicker.set("v.hasTime", true);
            datePicker.set("v.showToday", true);
        }
    },

    openDatePicker: function(component, event, helper) {
        helper.displayDatePicker(component);
    },

    openTimePicker: function(component, event, helper) {
        event.stopPropagation();
        helper.displayTimePicker(component);
    },

    inputDateFocus: function(component, event, helper) {
        var inputText = helper.getDateString(component);

        if ($A.util.isEmpty(inputText) && !component.get("v.disabled") && component.get("v.displayDatePicker")) {
            helper.displayDatePicker(component);
        }
    },

    inputTimeFocus: function(component, event, helper) {
        event.stopPropagation();
        var inputText = helper.getTimeString(component);
        if ($A.util.isEmpty(inputText) && !component.get("v.disabled")) {
            helper.displayTimePicker(component);
        }
    },

    setValue: function(component, event, helper) {

        var dateValue = event.getParam("value"),
            selectedHours = event.getParam("hours"),
            selectedMinutes = event.getParam("minutes");

        if (helper.isDesktopMode(component)) {
            var hasNewDate = !$A.util.isUndefinedOrNull(dateValue),
                hasNewTime = !$A.util.isUndefinedOrNull(selectedHours) && !$A.util.isUndefinedOrNull(selectedMinutes);

            if (hasNewDate) {
                helper.setDateValue(component, dateValue);
            } else if (hasNewTime) {
                helper.setTimeValue(component, selectedHours, selectedMinutes);
            }

        } else {
            var outputCmp = component.find("inputDate");
            var elem = outputCmp ? outputCmp.getElement() : null;
            var value = elem ? elem.value : null;
            var format = component.get("v.format");
            if (!format) { // use default format
                format = $A.get("$Locale.datetimeFormat");
            }
            var langLocale = component.get("v.langLocale");
            var secs = 0;
            var ms = 0;
            if (value) {
                var currDate = $A.localizationService.parseDateTimeUTC(value, format, langLocale);
                // if invalid text is entered in the inputDate, currentDate will be null
                if (!$A.util.isUndefinedOrNull(currDate)) {
                    secs = currDate.getUTCSeconds();
                    ms = currDate.getUTCMilliseconds();
                }
            }

            var newDate = $A.localizationService.parseDateTimeUTC(dateValue, "YYYY-MM-DD", langLocale);

            var targetTime = Date.UTC(newDate.getUTCFullYear(),
                                      newDate.getUTCMonth(),
                                      newDate.getUTCDate(),
                                      selectedHours,
                                      selectedMinutes,
                                      secs,
                                      ms);
            var d = new Date(targetTime);

            var timezone = component.get("v.timezone");
            $A.localizationService.WallTimeToUTC(d, timezone, function(utcDate) {
                component.set("v.value", $A.localizationService.toISOString(utcDate));
            });
        }
    }
})// eslint-disable-line semi
