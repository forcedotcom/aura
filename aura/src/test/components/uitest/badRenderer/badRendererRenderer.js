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
    render: function(component, helper) {
        var skipRender = $A.util.getBooleanValue(component.get("v.skipRender"));
        return !skipRender ? this.superRender() : null;
    },

    afterRender: function(component, helper) {
        var skipAfterRender = $A.util.getBooleanValue(component.get("v.skipAfterRender"));
        if (!skipAfterRender) {
            this.superAfterRender();
        }
    },

    rerender: function(component, helper) {
        var skipRerender = $A.util.getBooleanValue(component.get("v.skipRerender"));
        if (!skipRerender) {
            this.superRerender();
        }
    },

    unrender: function(component, helper) {
        var skipUnrender = $A.util.getBooleanValue(component.get("v.skipUnrender"));
        if (!skipUnrender) {
            this.superUnrender();
        }
    }
})
