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
        "action": "ui:actionMenuItem",
        "checkbox": "ui:checkboxMenuItem",
        "radio": "ui:radioMenuItem",
        "separator": "ui:menuItemSeparator"

    },

    addMenuItemDomEvents: function (component) {
        var events = ["click", "keydown", "mouseover"];
        for (var i = 0, len = events.length; i < len; i++) {
            // We need to fire these events for status update anyway
            if (!component.hasEventHandler(events[i])) {
                this.addDomHandler(component, events[i]);
            }
        }
    },
    /**
     * Override
     *
     */
    fireEvent: function (component, event, helper) {
        if (this.isDisabled(component) && event.type !== "mouseover") {
            return;
        }
        var e = component.getEvent(event.type);
        helper.setEventParams(e, event);
        e.fire();
    },

    isDisabled: function (component) {
        return component.get("v.disabled") === true;
    },

    fireSelectEvent: function (component, event, options) {
        if (this.isDisabled(component)) {
            return;
        }

        options = options || {};
        var e = component.getEvent("menuSelect");
        if (e) {

            var hideMenu = options.hideMenu;
            if ($A.util.isUndefinedOrNull(hideMenu)) {
                hideMenu = component.get("v.hideMenuAfterSelected");
            }

            var focusTrigger = options.focusTrigger;
            if ($A.util.isUndefinedOrNull(focusTrigger)) {
                focusTrigger = hideMenu;
            }

            e.setParams({
                selectedItem: component,
                "hideMenu": hideMenu,
                "deselectSiblings": options.deselectSiblings,
                "focusTrigger": focusTrigger
            });
            e.fire();
        }
    }/*eslint-disable no-unused-vars*/,
    /**
     * Select the menu item when Space bar is pressed
     *
     */
    handleSpacekeydown: function (component, event) {
        if (this.isDisabled(component)) {
            return;
        }
        component.select();
    },

    preEventFiring: function (component, event) {
        this.supportKeyboardInteraction(component, event);
    },

    setDisabled: function (component) {
        var concreteCmp = component.getConcreteComponent();
        var linkCmp = this.getAnchorElement(component);
        var elem = linkCmp ? linkCmp.getElement() : null;
        if (elem) {
            if (this.isDisabled(concreteCmp)) {
                $A.util.removeClass(elem, "selectable");
                elem.setAttribute("aria-disabled", "true");
            } else {
                $A.util.addClass(elem, "selectable");
                elem.removeAttribute("aria-disabled");
            }
        }
    },

    setFocus: function (component) {
        var linkCmp = this.getAnchorElement(component);
        var elem = linkCmp ? linkCmp.getElement() : null;
        if (elem && elem.focus) {
            elem.focus();
        }
    },

    getAnchorElement: function (component) {
        //Walk up the component ancestor to find the contained component by localId
        var localId = "link", c = component.getConcreteComponent();
        var retCmp = null;
        while (c) {
            retCmp = c.find(localId);
            if (retCmp) {
                break;
            }
            c = c.getSuper();
        }
        return retCmp;
    },

    /**
     * Handle keyboard interactions
     *
     */
    supportKeyboardInteraction: function (component, event) {
        var concreteCmp = component.getConcreteComponent();
        if (event.type === "keydown") {
            if (event.keyCode === 32) {  // space key: select the menu item
                event.preventDefault();
                this.handleSpacekeydown(concreteCmp, event);
            }
        }
    }

})// eslint-disable-line semi
