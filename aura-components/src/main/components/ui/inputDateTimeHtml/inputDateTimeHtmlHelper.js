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
                walltime = $A.localizationService.translateToOtherCalendar(walltime);
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
        var isoDate = $A.localizationService.parseDateTimeUTC(value);
        var timezone = component.get("v.timezone");

        $A.localizationService.WallTimeToUTC(isoDate, timezone, function (utcDate) {
            utcDate = $A.localizationService.translateFromOtherCalendar(utcDate);
            component.set("v.value", $A.localizationService.toISOString(utcDate));
        });
    }
});
