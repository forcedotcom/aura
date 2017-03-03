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
    handleVisibilityChange: function (component) {
        if (!component.get("v.hasMenuOpened") && component.get("v.visible")) {
            component.set("v.hasMenuOpened", true);
        }
    },

    onMenuItemSelected: function (component, event, helper) {
        helper.onMenuItemSelected(component, event);
    },

    onKeyboardEvent: function (component, event, helper) {
        var originalEvent = event.getParam("event");

        if (originalEvent.type !== "keydown") {
            return;
        }

        var downArrowKeyCode = 40;
        var upArrowKeyCode = 38;
        var keyCode = originalEvent.keyCode;
        if (keyCode === downArrowKeyCode || keyCode === upArrowKeyCode) {
            originalEvent.preventDefault();
            window.requestAnimationFrame($A.getCallback(function() {
                helper.setMenuItemFocus(component, 0);
            }));
        } else {
            var isPrintableCharacter =
                (keyCode >= 48 && keyCode <= 57)
                || (keyCode >= 65 && keyCode <= 90);
            var isVisible = component.get("v.visible");
            // Enable type-ahead on trigger either when the menu is opened or the attribute is enabled.
            var triggerTypeAheadEnabled = component.get("v.triggerTypeAhead") || isVisible;
            if (triggerTypeAheadEnabled && isPrintableCharacter) {
                $A.util.squash(originalEvent, true);
                if (!isVisible) {
                    component.set("v.visible", true);
                }
                window.requestAnimationFrame($A.getCallback(function() {
                    helper.setFocusToTypingChars(component, originalEvent);
                }));
            }
        }
    },

    // TODO: This should be moved to a method
    update: function (component, event, helper) {
        var _helper = component.getConcreteComponent().getDef().getHelper() || helper;
        _helper.setEventHandlersOnChildren(component);

        if(event.getPhase() !== "default") {
            event.stopPropagation();
        }
    }
});// eslint-disable-line semi
