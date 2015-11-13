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
    /**
     * Handle keyboard interactions
     *
     */
    handledInteraction: function(component, event) {
        var params = event.getParams();
        var domEvent = params.domEvent;
        var action;
        if (params.keyCode === 37) {  // left arrow
            action = 'focusPrevItem';
        } else if (params.keyCode === 39) { // right arrow
            action = 'focusNextItem';
        } else if (params.keyCode === 46) { // delete key so we 'delete'
            action = 'delete';
        } else if (params.keyCode === 8) { // backspace key so we 'delete' and prevent default browser behavior
            action = 'delete';
        }
        if (action) {
            if (domEvent) {
                domEvent.preventDefault();
            }
            this.fireHandleEvent(component, action);
        }
    },

    fireHandleEvent : function(component, action) {
        var ev = component.getEvent("onHandledEvent");

        var params = {
            id: component.get('v.id'),
            label: component.get('v.label'),
            action: action
        };
        ev.setParams({ value : params }).fire();
    },

    setFocus: function(component) {
        var linkCmp = component.find('link');
        var elem = linkCmp ? linkCmp.getElement() : null;
        if (elem) {
            elem.focus();
            $A.util.addClass(elem, "focused");
        }
    },

    removeFocus: function(component) {
        var linkCmp = component.find('link');
        var elem = linkCmp ? linkCmp.getElement() : null;
        if (elem) {
            $A.util.removeClass(elem, "focused");
        }
    }
})// eslint-disable-line semi
