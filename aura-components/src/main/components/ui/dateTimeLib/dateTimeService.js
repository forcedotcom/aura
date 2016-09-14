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

    return {
        /*
         * Get the formatted display value of a date string based on timezone
         */
        getDisplayValue: function(value, config, callback) {
            if ($A.util.isEmpty(value)) {
                callback(value);
                return;
            }

            // since v.value is in UTC format like "2015-08-10T04:00:00.000Z", we want to make sure the date portion is valid
            var splitValue = value.split("T");
            var dateValue = splitValue[0] || value;
            var timeValue = splitValue[1];
            var useStrictParsing = config.validateString === true;
            var hasTime = timeValue && timeValue !== '00:00:00.000Z';

            var date = $A.localizationService.parseDateTimeUTC(dateValue, "YYYY-MM-DD", config.langLocale, useStrictParsing);

            if ($A.util.isEmpty(date)) {
                callback(value);
                return;
            }

            var displayValue = function (convertedDate) {
                var translatedDate = $A.localizationService.translateToOtherCalendar(convertedDate);
                var formattedDate = $A.localizationService.formatDateUTC(translatedDate, config.format, config.langLocale);

                callback(formattedDate);
            };

            if (hasTime) {
                convertToTimezone(value, config.timezone, $A.getCallback(displayValue));
            } else {
                displayValue(date);
            }
        }
    };
}