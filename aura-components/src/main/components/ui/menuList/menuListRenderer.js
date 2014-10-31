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
        helper.setKeyboardEventHandlers(component);
        helper.setEventHandlersOnChildren(component);

        var ret = this.superAfterRender();

        helper.setFocus(component, false);

        return ret;
    },

    rerender: function(component, helper) {
        var currentlyVisible = false;
        var divCmp = component.find("menu");
        if (divCmp) {
            var elem = divCmp.getElement();
            if (elem) {
                currentlyVisible = $A.util.hasClass(elem, "visible");
            }
        }
        helper.handleVisible(component);
        var ret = this.superRerender();
        helper.setFocus(component, currentlyVisible);
        return ret;
    },

    unrender: function(component, helper) {
    	helper.removeKeyboardEventHandlers(component);
        return this.superUnrender();
    }
})