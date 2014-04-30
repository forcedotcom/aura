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
    afterRender: function(component, helper) {
        var visible = component.get("v.visible"),
            managed = component.get('v.managed');

        if (visible === true) {
            if (component.get("v._yearListInitialized") === false) {
                helper.refreshYearSelection(component);
                component.set("v._yearListInitialized", true);
            }

            helper.setGridInitialValue(component);
            helper.updateMonthYear(component, component.get("v.value"));
            helper.updateGlobalEventListeners(component);
        }

        // If this picker is not 'managed' (consumed by ui:dataPickerManager),
        // then positioning should be taken into account.
        if (visible === true && !managed) {
            helper.position(component);
        }

        this.superAfterRender();
    },

    rerender: function(component, helper) {
        var visible = component.get("v.visible"),
            managed = component.get('v.managed');

        if (visible === true) {
            if (component.get("v._yearListInitialized") === false) {
                helper.refreshYearSelection(component);
                component.set("v._yearListInitialized", true);
            }

            helper.setGridInitialValue(component);
            helper.updateMonthYear(component, component.get("v.value"));
            helper.updateGlobalEventListeners(component);
        }

        this.superRerender();

        // If this picker is not 'managed' (consumed by ui:dataPickerManager),
        // then positioning should be taken into account.
        if (visible === true && !managed) {
            helper.position(component);
        }

        var isAndroid = $A.get("$Browser.isAndroid");

        if (isAndroid == true) {
            var f = function(e) {
                helper.handleWinResize(component, e);
            };
            if (visible === true) {
                $A.util.on(window, "resize", f);
            } else {
                $A.util.removeOn(window, "resize", f);
            }
        }
    }
})
