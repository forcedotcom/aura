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
    	var _helper = component.getConcreteComponent().getDef().getHelper() || helper;
        
    	_helper.setKeyboardEventHandlers(component);
        _helper.setEventHandlersOnChildren(component);

        var ret = this.superAfterRender();

        _helper.setFocus(component, false);

        return ret;
    },

    rerender: function(component, helper) {
        if (!component.isDirty("v.childMenuItems")) {
            // The below will re-scan the body of the menu list to find any changes, and will update
            // child menu items, hence why we don't re-scan when the chidlMenuItems attribute is changed.
            var _helper = component.getConcreteComponent().getDef().getHelper() || helper;
            _helper.setEventHandlersOnChildren(component);
        }

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
        try {
            var _helper = component.getConcreteComponent().getDef().getHelper() || helper;
            _helper.removeKeyboardEventHandlers(component);
        } finally {
            return this.superUnrender();
        }
    }
})// eslint-disable-line semi