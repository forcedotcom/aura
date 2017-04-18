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
    formatValue: function (component) {
        var value = component.get("v.value");
        var inputElement = component.find("inputDateTimeHtml").getElement();

        if (!$A.util.isEmpty(value)) {
            var isoDate = $A.localizationService.parseDateTimeISO8601(value);
            var timezone = component.get("v.timezone");

            $A.localizationService.UTCToWallTime(isoDate, timezone, function (walltime) {
                var walltimeISO = $A.localizationService.toISOString(walltime);

                // datetime-local input doesn't support any time zone offset information,
                // so we need to remove the 'Z' off of the end.
                var displayValue = walltimeISO.split("Z", 1)[0] || walltimeISO;
                inputElement.value = displayValue;
            });
        } else {
            inputElement.value = "";
        }
    },

    /**
     * Override
     */
    doUpdate: function (component, value) {
        var timezone = component.get("v.timezone");

        if (component._considerLocalDateTime) {
            // When v.value is empty and the new value is 2017-04-12T01:00, we use parseDateTime method that will parse
            // it in local time. When toISOString is called, it will take into account the timezone offset and return a
            // UTC ISO string corresponding to that local time.
            var date = $A.localizationService.parseDateTime(value);
            this.setValue(component, date);
        } else {
            date = $A.localizationService.parseDateTimeUTC(value);
            $A.localizationService.WallTimeToUTC(date, timezone, function (utcDate) {
                this.setValue(component, utcDate);
            }.bind(this));
        }
    },

    setValue: function (component, value) {
        component.set("v.value", $A.localizationService.toISOString(value), true);
    }
});
