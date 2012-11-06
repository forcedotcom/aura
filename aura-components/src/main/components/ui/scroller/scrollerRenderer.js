/*
 * Copyright (C) 2012 salesforce.com, inc.
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
    afterRender : function(component, helper) {
        this.superAfterRender();
        helper.init(component);
    },

    rerender : function(component, helper) {
        this.superRerender();

        var attributes = component.getAttributes();
        var enabled = attributes.getValue("enabled").getBooleanValue();
        if (enabled) {
            if ($A.util.isUndefined(component._scroller)) {
                helper.init(component);
            }
        } else {
            helper.deactivate(component);
        }
    },

    unrender : function(component, helper) {
        helper.deactivate(component);

        this.superUnrender();
    }
})
