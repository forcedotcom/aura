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
        var inputElement = component.find("inputDateHtml").getElement();

        if (value && inputElement) {
            // v.value could be in UTC format like "2015-08-10T04:00:00.000Z",
            // we DON'T need the time portion
            var dateValue = value.split("T", 1)[0] || value;

            // HTML5 date input requires a full date format equal to YYYY-MM-DD.
            inputElement.value = $A.localizationService.formatDate(dateValue, "YYYY-MM-DD");
        }
    }
});
