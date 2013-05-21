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
    formatDate: function(component) {
        var value = component.get("v.value");
        var format = component.get("v.format");
        var displayValue = value;
        if (value) {
            var mDate = moment.utc(value, "YYYY-MM-DD");
            if (mDate.isValid()) {
                displayValue = mDate.format(format);
            }
        }
        
        var outputCmp = component.find("span");
        var elem = outputCmp ? outputCmp.getElement() : null;
        if (elem) {
            elem.textContent = elem.innerText = displayValue;
        }
    }
})