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
    typeMap : {
        "action": "ui:actionMenuItem",
        "checkbox": "ui:checkboxMenuItem",
        "radio": "ui:radioMenuItem",
        "separator": "ui:menuItemSeparator"
        
    },
    
    addMenuItemDomEvents : function(component) {
        var events = ["click", "keydown", "mouseover"];
        for (var i=0, len=events.length; i < len; i++) {
            // We need to fire these events for status update anyway
            if (!component.hasEventHandler(events[i])) {
                this.addDomHandler(component, events[i]);
            }           
        }
    },
    
    getParentComponent: function(component) {
        var parent = component.getValue("v.parent");
        if (parent && !parent.isEmpty()) {
            return parent.getValue(0);
        }
        return null;
    },
    
    /**
     * Override
     *
     */
     fireEvent : function (component, event, helper) {
        if (component.get("v.disabled") === true && event.type !== "mouseover") {
            return;
        }
        var e = component.getEvent(event.type);
        helper.setEventParams(e, event);
        e.fire();
     },
    
    fireSelectEvent: function(component, event) {
        var concrete = component.getConcreteComponent();
        var parent = concrete.getValue("v.parent");
        if (parent && !parent.isEmpty()) {
            p = parent.getValue(0);
            var e = p.getEvent("menuSelect");
            if (e) {
                e.setParams({
                    selectedItem: event.getSource()
                });
                e.fire();
            }
        }
    },
    
    /**
     * Dismiss the menu and put the focus back to menu trigger.
     */
    handleEsckeydown: function(component, event) {
        var parent = this.getParentComponent(component);
        if (parent) {
            if (parent.get("v.visible") === true) {
                parent.setValue("{!v.visible}", false);
                if (component.get("v.disabled") === true) {
                    // for disabled menu item, no Aura event gets fired, so we have to directly deal with DOM.
                    var devCmp = parent.find("menu");
                    if (devCmp) {
                        var elem = devCmp.getElement();
                        $A.util.removeClass(elem, "visible");
                    }
                }
            }            
        }
        // put the focus back to menu trigger
        this.setFocusToTrigger(component);
    },
    
    /**
     * Select the menu item when Space bar is pressed
     *
     */
    handleSpacekeydown: function(component, event) {
        if (component.get("v.disabled") === true) {
            return;
        }
        var e = component.getEvent("click");
        this.setEventParams(e, event);
        e.fire();
    },
    
    /**
     * Dismiss the menu when tab key is pressed.
     */
    handleTabkeydown: function(component, event) {
        var parent = this.getParentComponent(component);
        if (parent) {
            if (parent.get("v.visible") === true) {
                parent.setValue("{!v.visible}", false);
                if (component.get("v.disabled") === true) {
                    // for disabled menu item, no Aura event gets fired, so we have to directly deal with DOM.
                    var devCmp = parent.find("menu");
                    if (devCmp) {
                        var elem = devCmp.getElement();
                        $A.util.removeClass(elem, "visible");
                    }
                }
            }
        }
    },
    
    preEventFiring: function(component, event) {
        this.supportKeyboardInteraction(component, event);
    },
    
    setDisabled : function(component) {
        var concreteCmp = component.getConcreteComponent();
        var linkCmp = concreteCmp.find("link");
        var elem = linkCmp.getElement();
        if (elem) {
            var disabled = component.get("v.disabled");
            if (disabled === true) {
                $A.util.removeClass(elem, "selectable");
                elem.setAttribute("aria-disabled", "true");
            } else {
                $A.util.addClass(elem, "selectable");
                elem.removeAttribute("aria-disabled");
            }
        }
    },
    
    setFocus: function(component) {
        var concreteCmp = component.getConcreteComponent();
        var linkCmp = concreteCmp.find("link");
        var elem = linkCmp.getElement();
        if (elem && elem.focus) {
            elem.focus();
        }
    },
    
    setFocusToNextItem: function(component) {
        var parent = this.getParentComponent(component);
        if (parent) {
            var nextIndex = 0;
            var menuItems = parent.getValue("v.childMenuItems");
            for (var i = 0; i < menuItems.getLength(); i++) {
                if (component === menuItems.getValue(i)) {
                    nextIndex = ++i;
                    break;
                }
            }
            if (nextIndex >= menuItems.getLength()) {
                nextIndex = 0;
            }
            var nextFocusCmp = menuItems.getValue(nextIndex);
            var action = nextFocusCmp.get("c.setFocus");
            action.run();
        }
    },
    
    setFocusToPreviousItem: function(component) {
        var parent = this.getParentComponent(component);
        if (parent) {
            var previousIndex = 0;
            var menuItems = parent.getValue("v.childMenuItems");
            for (var i = 0; i < menuItems.getLength(); i++) {
                if (component === menuItems.getValue(i)) {
                    previousIndex = --i;
                    break;
                }
            }
            if (previousIndex < 0) {
                previousIndex = menuItems.getLength() - 1;
            }
            var previousFocusCmp = menuItems.getValue(previousIndex);
            var action = previousFocusCmp.get("c.setFocus");
            action.run();
        }
    },
    
    setFocusToTrigger: function(component) {
        var parent = this.getParentComponent(component);
        if (parent) {
            var grandParent = parent.getValue("v.parent");
            if (grandParent && !grandParent.isEmpty()) {
                var dropdownCmp = grandParent.getValue(0);
                var dropdownHelper = dropdownCmp.getDef().getHelper();
                var menuTriggerCmp = dropdownHelper.getTriggerComponent(dropdownCmp);
                if (menuTriggerCmp) {
                    var action =  menuTriggerCmp.get("c.focus");
                    action.run();
                }
            }
        }
    },
    
    /**
     * Focus on the item whose starting character(s) are what the end user types.
     * Copied from Accentjs dropdown component.
     */
    setFocusToTypingChars: function(component, event) {
        var parent = this.getParentComponent(component);
        if (parent) {
            // If we were going to clear what keys were typed, don't yet.
            if (!$A.util.isUndefinedOrNull(parent._clearBufferId)) { 
                clearTimeout(parent._clearBufferId); 
            }

            // Store the letter.
            var letter = String.fromCharCode(event.keyCode);
            parent._keyBuffer = parent._keyBuffer || [];
            parent._keyBuffer.push(letter);

            // Try to select
            var matchText = parent._keyBuffer.join("").toLowerCase();
            var menuItems = parent.getValue("v.childMenuItems");
            for(var i = 0; i < menuItems.getLength(); i++) {
                var c = menuItems.getValue(i)
                var text = c.get("v.label");
                if(text.toLowerCase().indexOf(matchText) === 0) {
                    var action = c.get("c.setFocus");
                    action.run();
                    break;
                }
            }

            parent._clearBufferId = setTimeout(function() {
                parent._keyBuffer = [];
            }, 700);
        }
    },
    
    /**
     * Handle keyboard interactions
     *
     */
    supportKeyboardInteraction: function(component, event) {
        var concreteCmp = component.getConcreteComponent();
        if (event.type === "keydown") {
            if (event.keyCode === 39 || event.keyCode === 40) {  // right or down arrow key
                event.preventDefault();
                this.setFocusToNextItem(concreteCmp);
            } else if (event.keyCode === 37 || event.keyCode === 38) {  // left or up arrow key
                event.preventDefault();
                this.setFocusToPreviousItem(concreteCmp);
            } else if (event.keyCode === 27) {  // Esc key
                event.stopPropagation();
                this.handleEsckeydown(concreteCmp, event);
            } else if (event.keyCode === 9) {  // tab key: dismiss the menu
                this.handleTabkeydown(concreteCmp, event);
            } else if (event.keyCode === 32) {  // space key: select the menu item
                event.preventDefault();
                this.handleSpacekeydown(concreteCmp, event);
            } else {
                this.setFocusToTypingChars(concreteCmp, event);
            }
        }
    },
})