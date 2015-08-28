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
    deleteItem: function(component, event, helper) {
        helper.fireHandleEvent(component, 'delete');
    },

    getHandledDOMEvents: function(component) {
        return ["click", "keydown", "mouseover"];
    },

    handleInteraction: function(component, event, helper) {
        helper.handledInteraction(component, event);
    },

    onBlur: function(component, event, helper) {
        helper.removeFocus(component);
    },

    focus: function(component, event, helper) {
        helper.setFocus(component);
    },

    onIconError: function(component, event, helper) {
        $A.util.addClass(component.find("icon").getElement(), 'invisible');
    }
})// eslint-disable-line semi