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
    typeMap: {
        "action": "markup://ui:actionMenuItem",
        "checkbox": "markup://ui:checkboxMenuItem",
        "radio": "markup://ui:radioMenuItem",
        "separator": "markup://ui:menuItemSeparator"
    },

    addMenuItemDomEvents: function (component) {
        var events = ["click", "keydown", "mouseover"];
        if (!component._menuItemDomEventsInstalled) {
            for (var i = 0, len = events.length; i < len; i++) {
                $A.util.on(component.getElement(), events[i], this.domEventHandler.bind(this, component));
            }
            component._menuItemDomEventsInstalled = true;
        }
    },

    domEventHandler: function(component, event) {
        if (!component.isValid() || this.isDisabled(component)) {
            return false;
        }

        var concreteComponent = component.getConcreteComponent();
        if (event.type === "mouseover") {
            concreteComponent.setFocus();
        } else if (event.type === "keydown") {
            if (event.keyCode === 32 || event.keyCode === 13) {  // space or enter key
                event.preventDefault();
                concreteComponent.select();
            }
        } else if (event.type === "click") {
            event.preventDefault();
        }

        return false;
    },

    isDisabled: function (component) {
        return component.get("v.disabled") === true;
    },

    fireSelectEvent: function (component, event, options) {
        if (!component.isValid() || this.isDisabled(component)) {
            return;
        }

        // XXX: menuSelect should be used instead of click, but this code should cover the old uses of click instead.
        component.getEvent("click").fire();

        options = options || {};

        var menuSelectEvent = component.getEvent("menuSelect");
        if (menuSelectEvent) {
            var hideMenu = options.hideMenu;
            if ($A.util.isUndefinedOrNull(hideMenu)) {
                hideMenu = component.get("v.hideMenuAfterSelected");
            }

            var focusTrigger = options.focusTrigger;
            if ($A.util.isUndefinedOrNull(focusTrigger)) {
                focusTrigger = hideMenu;
            }

            menuSelectEvent.setParams({
                selectedItem: component,
                "hideMenu": hideMenu,
                "deselectSiblings": options.deselectSiblings,
                "focusTrigger": focusTrigger
            });
            menuSelectEvent.fire();
        }

    }/*eslint-disable no-unused-vars*/,

    focus: function (component) {
        var element = component.getElement();

        if (element) {
            var anchors = element.getElementsByTagName("a");
            if (anchors && anchors.length > 0) {
                var anchor = anchors[0];
                if (anchor && anchor.focus) {
                    anchor.focus();
                }
            }
        }
    }

})// eslint-disable-line semi
