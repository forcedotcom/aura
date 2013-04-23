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
    updateCell: function(component) {
        var elem = component.getElement();
        if (elem) {
            var value = component.get("v.value");
            if (!$A.util.isUndefinedOrNull(value)) {
                var date = new Date(value);
                var mDate = moment(value, "YYYY-MM-DD");
                if (mDate.isValid()) {
                    date = mDate.toDate();
                }
                elem.setAttribute("data-datevalue", date.toLocaleDateString());
            }
            var tabIndex = component.get("v.tabIndex");
            if (parseInt(tabIndex) > -1) {
                elem.removeAttribute("tabindex");
            }
        } 
    }
})