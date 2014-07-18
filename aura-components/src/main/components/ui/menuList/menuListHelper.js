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
        var menuItems = component.get("v.childMenuItems");
        if (menuItems) {
            return menuItems[index];
        }
    },

    handleGlobalClick: function(component, visible) {
        var parent = component.get("v.parent");
        if (parent && !$A.util.isEmpty(parent)) {
            p = parent[0];
            if (visible === true) {
                var action = p.get("c.handleMenuExpand");
                if (action) {
                    action.runDeprecated();
                }
            } else {
                var action = p.get("c.handleMenuCollapse");
                if (action) {
                    action.runDeprecated();
                }
            }
        }
    },
    
    handleVisible : function(component, currentlyVisible) {
        var concreteCmp = component.getConcreteComponent();
        var visible = concreteCmp.get("v.visible");
        var elem = component.getElement();
        if (visible === true) {
            $A.util.addClass(elem, "visible");
        } else {
            $A.util.removeClass(elem, "visible");
        }
        this.handleGlobalClick(concreteCmp, visible);
    },
    
    position: function(component) {
    	var attachToBody = component.getConcreteComponent().get("v.attachToBody");
    	if (attachToBody === true) {
    		this.positionAsBodyChild(component);
    		return;
    	}
    	var divCmp = component.find("menu");
        var elem = divCmp ? divCmp.getElement() : null;
        if (elem) {
            elem.style.top = "auto";
            var visible = component.getConcreteComponent().get("v.visible");
            if (visible) {
            	var autoPosition = component.get('v.autoPosition');
                var elemRect = elem.getBoundingClientRect();
                var viewPort = $A.util.getWindowSize();
                if (autoPosition && elemRect.bottom > viewPort.height) { // no enough space below
                	//getBoundingClientRect method does not return height and width in IE7 and Ie8
                	var height = typeof elemRect.height != 'undefined' ? elemRect.height : elemRect.bottom - elemRect.top;
                	elem.style.top = 0 - height + "px";
                } else {
                    elem.style.top = "auto";
                }
            }
        }
    },
    
    positionAsBodyChild: function(component) {
        var divCmp = component.find("menu");
        var elem = divCmp ? divCmp.getElement() : null;
        var referenceElem = component.getConcreteComponent().get("v.referenceElement");
        if (elem && referenceElem) {
            var visible = component.getConcreteComponent().get("v.visible");
            if (visible) {
            	$A.util.attachToDocumentBody(component.getElement());
            	var referenceElemRect = referenceElem.getBoundingClientRect();
                var elemRect = elem.getBoundingClientRect();
                var viewPort = $A.util.getWindowSize();
                
                // Vertical alignment
                // getBoundingClientRect method does not return height and width in IE7 and Ie8
                var height = typeof elemRect.height != 'undefined' ? elemRect.height : elemRect.bottom - elemRect.top;
                if ((viewPort.height - referenceElemRect.bottom) < height) { // no enough space below
                	if (referenceElemRect.top < height) { // no enough space above either. Put it in the middle then
                		elem.style.top = window.scrollY + "px";
                	} else { // put it above
                		elem.style.top = (referenceElemRect.top - height) + window.scrollY + "px";
                	}
                } else { // put it below
                    elem.style.top = referenceElemRect.bottom + window.scrollY + "px";
                }
                
                // Horizontal alignment
                // getBoundingClientRect method does not return height and width in IE7 and Ie8
                var width = typeof elemRect.width != 'undefined' ? elemRect.width : elemRect.right - elemRect.left;
                if (referenceElemRect.left < 0) {
                	elem.style.left = window.scrollX + "px";
                } else {
                    if ((viewPort.width - referenceElemRect.left) < width) { // no enough space to the right
                	    if (referenceElemRect.right < width) { // no enough space to the left either. Put it in the middle then.
                		    elem.style.left = (viewPort.width - width) + window.scrollX + "px";
                	    } else { // align at the right
                		    elem.style.left = referenceElemRect.right - width + window.scrollX + "px";
                	    }
                    } else { // align at the left
                        elem.style.left = referenceElemRect.left + window.scrollX + "px";
                    }
                }
            }
        }
    },
    
    setAriaAttributes: function(component) {
        var concrete = component.getConcreteComponent();
        var elem = concrete.getElement();
        var parent = concrete.get("v.parent");
        if (parent && !$A.util.isEmpty(parent)) {
            var p = parent[0];
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
                action.runDeprecated();
            }
        }
    },
    
    setFocus: function(component, currentlyVisible) {
    	var concreteCmp = component.getConcreteComponent();
        var visible = concreteCmp.get("v.visible");
        if (visible === true) {
            if (currentlyVisible !== true) { // If menu changes from invisible to visible, let's set the initial focus
                var index = concreteCmp.get("v.focusItemIndex");
                if (index < 0) {
                    index = component.get("v.childMenuItems").length - 1;
                }
                this.setMenuItemFocus(component, index);
            }
        } else {
            concreteCmp.set("v.focusItemIndex", 0);
        }
    },
    
    visibleChange: function(concreteCmp) {
        var visible = concreteCmp.get("v.visible");
        if (visible === true) {
            concreteCmp.get("e.menuExpand").fire();
        } else {
            concreteCmp.get("e.menuCollapse").fire();
        }
    }
})
