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

function lib() { //eslint-disable-line no-unused-vars

    var convertToTimezone = function(isoString, timezone, callback) {
        var date = $A.localizationService.parseDateTimeISO8601(isoString);
        if (!$A.util.isUndefinedOrNull(date)) {
            $A.localizationService.UTCToWallTime(date, timezone, callback);
        }
    };

    var convertFromTimezone = function(date, timezone, callback) {
        var localDate = new Date(date);
        $A.localizationService.WallTimeToUTC(localDate, timezone, callback);
    };

    return {
        /*
         * Get the formatted display value of a date string based on timezone
         * callback(dateDisplayValue, timeDisplayValue) is called after formatting and converting to timezone
         */
        getDisplayValue: function(value, config, callback) {
            if ($A.util.isEmpty(value)) {
                callback({
                    date: "",
                    time: ""
                });
                return;
            }

            // since v.value is in UTC format like "2015-08-10T04:00:00.000Z", we want to make sure the date portion is valid
            var splitValue = value.split("T");
            var dateValue = splitValue[0] || value;
            var timeValue = splitValue[1];
            var useStrictParsing = config.validateString === true;

            var date = config.langLocale ?
                    $A.localizationService.parseDateTimeUTC(dateValue, "YYYY-MM-DD", config.langLocale, useStrictParsing) :
                    $A.localizationService.parseDateTimeUTC(dateValue, "YYYY-MM-DD", useStrictParsing) ;

            if ($A.util.isEmpty(date)) {
                // invalid date/time value.
                callback({
                    date: dateValue,
                    time: timeValue || value
                });
                return;
            }

            var hasTime = !$A.util.isEmpty(timeValue);
            // For date only fields, the value is by default an ISO string ending with '00:00:00.000Z'.
            // Only in this case, we don't need to convert the date to the provided timezone since we might end up
            // with a +/-1 date difference. DateTime fields should still be converted to the provided timezone
            if (!config.timeFormat && timeValue === "00:00:00.000Z") {
                hasTime = false;
            }

            var displayValue = function (convertedDate) {
                if (!$A.util.getBooleanValue(config.ignoreThaiYearTranslation)) {
                    convertedDate = $A.localizationService.translateToOtherCalendar(convertedDate);
                }

                var formattedDate = $A.localizationService.formatDateUTC(convertedDate, config.format, config.langLocale);
                var formattedTime;
                // time format is provided by inputDateTime, where there is a separate input for date and time
                if (config.timeFormat) {
                    formattedTime = $A.localizationService.formatTimeUTC(convertedDate, config.timeFormat, config.langLocale);
                }

                var isoFormattedDateTime = $A.localizationService.toISOString(convertedDate);

                callback({
                    date: formattedDate,
                    time: formattedTime,
                    isoString: isoFormattedDateTime
                });
            };

            if (hasTime) {
                convertToTimezone(value, config.timezone, $A.getCallback(displayValue));
            } else {
                displayValue(date);
            }
        },

        /*
         * Get an ISO8601 string representing the passed in Date object.
         */
        getISOValue: function(date, config, callback) {
            var hours = config.hours;
            var minutes = config.minutes;

            if (hours) {
                date = Date.UTC(date.getUTCFullYear(),
                    date.getUTCMonth(),
                    date.getUTCDate(),
                    hours,
                    minutes);
            }

            var isoValue = function (convertedDate) {
                var translatedDate = $A.localizationService.translateFromOtherCalendar(convertedDate);
                var isoString = $A.localizationService.toISOString(translatedDate);

                callback(isoString);
            };

            convertFromTimezone(date, config.timezone, $A.getCallback(isoValue));
        }
    };
}
