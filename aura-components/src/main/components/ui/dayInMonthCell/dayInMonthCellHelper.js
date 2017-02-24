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
    updateCell: function (component) {
        var elem = component.getElement();
        if (elem) {
            elem.setAttribute("data-datevalue", component.get("v.value"));
        }
    },

    setCalendarAttributes: function (component, config) {
        component.set("v.ariaSelected", config.ariaSelected);
        component.set("v.value", config.value);
        component.set("v.label", config.label);
        component.set("v.class", config.class);
        component.set("v.tdClass", config.tdClass);
        component.set("v.tabIndex", config.tabIndex);
    },

    dateCellSelected: function (component) {
        component.set("v.ariaSelected", true);

        component.getEvent("selectDate").fire({
            "value": component.get("v.value")
        });
    }
})// eslint-disable-line semi