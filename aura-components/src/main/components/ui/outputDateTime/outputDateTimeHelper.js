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
    /**
     * This can be overridden by extended component.
     */
    displayDateTime: function(component, displayValue) {
        var outputCmp = component.find("span");
        var elem = outputCmp ? outputCmp.getElement() : null;
        if (elem) {
            elem.textContent = elem.innerText = displayValue;
        }
    },
    
    formatDateTime: function(component) {
        var concreteCmp = component.getConcreteComponent();
        var _helper = concreteCmp.getDef().getHelper();
        var value = component.get("v.value");
        if (!value) { // Setting an empty value probably means clear out existing value
            _helper.displayDateTime(concreteCmp, "");
            return;
        }
        
        var format = concreteCmp.get("v.format");;
        var langLocale = concreteCmp.get("v.langLocale");
        var d = $A.localizationService.parseDateTimeISO8601(value);
        var timezone = concreteCmp.get("v.timezone");
        $A.localizationService.UTCToWallTime(d, timezone, function(walltime) {
            try {
                var displayValue = $A.localizationService.formatDateTimeUTC(walltime, format, langLocale);
                _helper.displayDateTime(concreteCmp, displayValue);
            } catch (e) {
                _helper.displayDateTime(concreteCmp, e.message);
            }
        });
    }
})