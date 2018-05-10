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
    
    var getImperialYearLabel = function(data, useKey) {
        return useKey ? data.key : data.label;
    };

    // Japanese imperial year
    var imperialYear = [
        // note: the order matters. see implementation of getImperialYear 
        {key: "H", year: 1989, label: "平成"}, // Heisei:  1/8/1989
        {key: "S", year: 1926, label: "昭和"}, // Showa:  12/25/1926
        {key: "T", year: 1912, label: "大正"}, // Taisho:  7/30/1912
        {key: "M", year: 1868, label: "明治"}  // Meiji:   1/1/1868
    ];

    var getImperialYear = function(year) {
        var langLocale = $A.get("$Locale.langLocale");
        var useShortName = langLocale !== "ja";
        for (var i = 0; i < imperialYear.length; i++) {
            if (year >= imperialYear[i].year) {
                var ret = getImperialYearLabel(imperialYear[i], useShortName) + (year - imperialYear[i].year + 1);
                if (year === imperialYear[i].year && i < imperialYear.length - 1) {
                    // transition year -- display both
                    var prev = imperialYear[i + 1];
                    ret += '/' +  getImperialYearLabel(prev, useShortName) + (year - prev.year + 1);
                }
                return ret;
            }
        }
        return null;
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

                var isoFormattedDateTime = convertedDate.toISOString();

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
                var isoString = translatedDate.toISOString();

                callback(isoString);
            };

            convertFromTimezone(date, config.timezone, $A.getCallback(isoValue));
        },
        
        formatYear: function(year) {
            var jpYear = $A.get("$Locale.showJapaneseImperialYear") && getImperialYear(year);
            return year + (jpYear ? " (" + jpYear + ")" : "");
        }
    };
}
