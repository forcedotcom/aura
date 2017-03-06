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
    afterRender: function (component, helper) {
        this.superAfterRender();
        var visible = component.get("v.visible");
        var managed = component.get('v.managed');

        if (visible) {
            helper.refreshYearSelection(component);
            helper.setInitialValuesOnChildren(component);
            helper.initializeMonthYear(component, component.get("v.value"));
            helper.updateGlobalEventListeners(component);
            helper.setInitialFocus(component);

            // If this picker is not 'managed' (consumed by ui:dataPickerManager),
            // then positioning should be taken into account.
            if (!managed) {
                helper.position(component);
            }
        }
    },

    rerender: function (component, helper) {
        this.superRerender();
        var visible = component.get("v.visible");
        if (visible) {
            helper.refreshYearSelection(component);
            helper.setInitialValuesOnChildren(component);
            helper.initializeMonthYear(component, component.get("v.value"));
            helper.updateGlobalEventListeners(component);
            helper.position(component);
        }
    },

    unrender: function (component, helper) {
        helper.unposition(component);
        component.removeDocumentLevelHandler(component._clickHandler);
        this.superUnrender();
    }
})// eslint-disable-line semi
