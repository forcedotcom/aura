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
    getMenuItem: function(component, index) {
        var menuItems = component.getValue("v.childMenuItems");
        if (menuItems) {
            return menuItems.getValue(index);
        }
    },

    handleGlobalClick: function(component, visible) {
        var parent = component.getValue("v.parent");
        if (parent && !parent.isEmpty()) {
            p = parent.getValue(0);
            if (visible === true) {
                var action = p.get("c.handleMenuExpand");
                if (action) {
                    action.run();
                }
            } else {
                var action = p.get("c.handleMenuCollapse");
                if (action) {
                    action.run();
                }
            }
        }
    },
    
    handleVisible : function(component, currentlyVisible) {
        var concreteCmp = component.getConcreteComponent();
        var visible = concreteCmp.get("v.visible");
        if (visible === true) {
            if (currentlyVisible !== true) { // If menu changes from invisible to visible, let's set the initial focus
                var index = concreteCmp.get("v.focusItemIndex");
                if (index < 0) {
                    index = concreteCmp.getValue("v.childMenuItems").getLength() - 1;
                }
                this.setMenuItemFocus(concreteCmp, index);
            }
        } else {
            concreteCmp.setValue("v.focusItemIndex", 0);
        }
        this.handleGlobalClick(concreteCmp, visible);
    },
    
    position: function(component) {
        var divCmp = component.find("menu");
        var elem = divCmp ? divCmp.getElement() : null;
        if (elem) {
            elem.style.top = "auto";
            var visible = component.get("v.visible");
            if (visible) {
                var elemRect = elem.getBoundingClientRect();
                var viewPort = $A.util.getWindowSize();
                if (elemRect.bottom > viewPort.height) { // no enough space below
                    elem.style.top = 0 - elemRect.height + "px"; 
                } else {
                    elem.style.top = "auto";
                }
            }
        }
    },
    
    setAriaAttributes: function(component) {
        var concrete = component.getConcreteComponent();
        var elem = concrete.getElement();
        var parent = concrete.getValue("v.parent");
        if (parent && !parent.isEmpty()) {
            var p = parent.getValue(0);
            var pHelper = p.getDef().getHelper();
            if (pHelper.getTriggerComponent) {
                var triggerCmp = pHelper.getTriggerComponent(p);
                if (triggerCmp) {
                    var triggerElem = triggerCmp.getElement();
                    if (triggerElem && elem) {
                        elem.setAttribute("aria-labelledby", triggerElem.getAttribute("id"));
                    }
                }
            }
        }
    },
    
    setMenuItemFocus: function(component, index) {
        var menuItem = this.getMenuItem(component, index);
        if (menuItem) {
            var action = menuItem.get("c.setFocus");
            if (action) {
                action.run();
            }
        }
    }
})