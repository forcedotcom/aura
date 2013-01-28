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
                var e = p.getEvent("menuExpand");
                if (e) {
                    e.fire();
                }
            } else {
                var e = p.getEvent("menuCollapse");
                if (e) {
                    e.fire();
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
    },
    
    setVisible : function(component) {
        var concreteCmp = component.getConcreteComponent();
        var visible = concreteCmp.get("v.visible");
        var divCmp = concreteCmp.find("menu");
        if (divCmp) {
            var elem = divCmp.getElement();
            var currentlyVisible = $A.util.hasClass(elem, "visible");
            if (visible === true) {
                $A.util.addClass(elem, "visible");
                if (!currentlyVisible) { // If menu changes from invisible to visible, let's set the initial focus
                    var index = concreteCmp.get("v.focusItemIndex");
                    if (index < 0) {
                        index = concreteCmp.getValue("v.childMenuItems").getLength() - 1;
                    }
                    this.setMenuItemFocus(concreteCmp, index);
                }
            } else {
                $A.util.removeClass(elem, "visible");
                concreteCmp.setValue("{!v.focusItemIndex}", 0);
            }
            this.handleGlobalClick(concreteCmp, visible);
        }
    }
})