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
    formatValue: function(component) {
        var value = component.get("v.value");

        if ($A.util.isEmpty(value)) {
            this.setInputValue(component, value);
            return;
        }

        var timezone = component.get("v.timezone");
        var dateValue = value.split("T", 1)[0] || value;
        var hasTime = dateValue !== value;
        var helper = this;

        var displayValue = function(date) {
            var formattedDate = !$A.util.isEmpty(date) ? $A.localizationService.formatDateUTC(date, "YYYY-MM-DD") : "";
            helper.setInputValue(component, formattedDate);
        };

        if (hasTime) {
            this.convertToTimezone(value, timezone, $A.getCallback(displayValue));
        } else {
            var parsedDate = $A.localizationService.parseDateTimeUTC(dateValue, "YYYY-MM-DD");
            displayValue(parsedDate);
        }
    },

    convertToTimezone: function(value, timezone, callback) {
        var date = $A.localizationService.parseDateTimeISO8601(value);
        if (!$A.util.isUndefinedOrNull(date)) {
            $A.localizationService.UTCToWallTime(date, timezone, callback);
        }
    },

    setInputValue: function(component, displayValue) {
        var inputElement = component.find("inputDateHtml").getElement();
        if (!$A.util.isUndefinedOrNull(inputElement)) {
            inputElement.value = displayValue ? displayValue : "";
        }
    }
});
