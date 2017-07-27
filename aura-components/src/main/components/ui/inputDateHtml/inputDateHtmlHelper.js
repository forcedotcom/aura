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
        var config = {
            format: "YYYY-MM-DD",
            timezone: component.get("v.timezone") || $A.get("$Locale.timezone"),
            validateString: false,
            ignoreThaiYearTranslation: true
        };

        var displayValue = function (returnValue) {
            this.setInputValue(component, returnValue.isoString);
        }.bind(this);

        var value = component.get("v.value");
        this.dateTimeLib.dateTimeService.getDisplayValue(value, config, displayValue);
    },

    setInputValue: function (component, displayValue) {
        var inputElement = component.find("inputDateHtml").getElement();

        if (!$A.util.isEmpty(displayValue)) {
            // localizationService.format() will format in the user's locale, which is not accepted by the input
            displayValue = displayValue.split("T", 1)[0] || displayValue;

            inputElement.value = displayValue;
        } else {
            inputElement.value = '';
        }
    }
});
