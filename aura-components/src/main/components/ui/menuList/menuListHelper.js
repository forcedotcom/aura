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
    setEventHandlersOnChildren: function(component) {
        var children = [];
        var body = component.get("v.body");
        for (var i = 0; i < body.length; i++) {
            var child = body[i];
            if (child.isInstanceOf("ui:menuItem")) {
            	child.addHandler("menuSelect", component, "c.onMenuItemSelected");
                children.push(child);
            } else if (child.isInstanceOf("aura:iteration")) { // support external iteration
                var iters = child.get("v.body");
                for (var k = 0; k < iters.length; k++) {
                    var iter = iters[k];
                    if (iter.isInstanceOf("ui:menuItem")) {
                    	iter.addHandler("menuSelect", component, "c.onMenuItemSelected");
                        children.push(iter);
                    }
                }
            }
        }
        var items = component.find("item");
        if (items && $A.util.isArray(items)) {
            for (var j = 0; j < items.length; j++) {
                var item = items[j];
                if (item.isInstanceOf("ui:menuItem")) {
                	item.addHandler("menuSelect", component, "c.onMenuItemSelected");
                    children.push(item);
                }
            }
        }
        component.set("v.childMenuItems", children);
    },
    
    getMenuItem: function(component, index) {
        var menuItems = component.get("v.childMenuItems");
        if (menuItems) {
            return menuItems[index];
        }
    },

    handleVisible : function(component) {
        var elements = this.getElementCache(component),
            visible = elements.target.get("v.visible");

        if (visible === true) {
            $A.util.addClass(elements.targetElement, "visible");
            elements.target.get("e.menuExpand").fire();
        } else {
            $A.util.removeClass(elements.targetElement, "visible");
            elements.target.get("e.menuCollapse").fire();
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

    setKeyboardEventHandlers: function(component) {
    	var el = component.find("datalist").getElement();
    	$A.util.on(el, "keydown", this.getKeyboardInteractionHandler(component));
    },

    removeKeyboardEventHandlers: function(component) {
    	var el = component.find("datalist").getElement();
    	$A.util.removeOn(el, "keydown", this.getKeyboardInteractionHandler(component));
    	delete component._keyboardEventHandler;
    },
    /**
     * Handle keyboard interactions
     *
     */
    getKeyboardInteractionHandler: function(component) {
    	var helper = this;
    	if (!component._keyboardEventHandler) {
    		component._keyboardEventHandler = function(event) {
		        var concreteCmp = component.getConcreteComponent();
		        if (event.type === "keydown") {
		            if (event.keyCode === 39 || event.keyCode === 40) {  // right or down arrow key
		                event.preventDefault();
		                helper.setFocusToNextItem(concreteCmp, event);
		            } else if (event.keyCode === 37 || event.keyCode === 38) {  // left or up arrow key
		                event.preventDefault();
		                helper.setFocusToPreviousItem(concreteCmp, event);
		            } else if (event.keyCode === 27) {  // Esc key
		                event.stopPropagation();
		                helper.handleEsckeydown(concreteCmp, event);
		            } else if (event.keyCode === 9) {  // tab key: dismiss the menu
		                helper.handleTabkeydown(concreteCmp, event);
		            } else {
		                helper.setFocusToTypingChars(concreteCmp, event);
		            }
		        }
    		}
    	}
    	return component._keyboardEventHandler;
    },

    handleEsckeydown: function(component, event) {
        component.getConcreteComponent().get("e.doClose").fire();
        // put the focus back to menu trigger
        this.setFocusToTrigger(component);
    },

    setFocusToTrigger: function(component) {
    	var action =  component.get("v.focusTrigger");
    	if (action) {
    		action.runDeprecated();
    	}
    },

    setFocusToNextItem: function(component, event) {
        var nextIndex = 0;
        var srcComponent = this.getComponentForElement(event.target || event.srcElement);
        var menuItems = component.get("v.childMenuItems");
        for (var i = 0; i < menuItems.length; i++) {
            if (srcComponent === menuItems[i]) {
                nextIndex = ++i;
                break;
            }
        }
        if (nextIndex >= menuItems.length) {
            nextIndex = 0;
        }
        var nextFocusCmp = menuItems[nextIndex];
        var action = nextFocusCmp.get("c.setFocus");
        action.runDeprecated();
    },

    setFocusToPreviousItem: function(component, event) {
        var previousIndex = 0;
        var srcComponent = this.getComponentForElement(event.target || event.srcElement);
        var menuItems = component.get("v.childMenuItems");
        for (var i = 0; i < menuItems.length; i++) {
            if (srcComponent === menuItems[i]) {
                previousIndex = --i;
                break;
            }
        }
        if (previousIndex < 0) {
            previousIndex = menuItems.length - 1;
        }
        var previousFocusCmp = menuItems[previousIndex];
        var action = previousFocusCmp.get("c.setFocus");
        action.runDeprecated();
    },

    /**
     * Dismiss the menu when tab key is pressed.
     */
    handleTabkeydown: function(component, event) {
		var closeOnTab = component.get('v.closeOnTabKey');
        var concreteComponent = component.getConcreteComponent();
        if (concreteComponent && closeOnTab) {
            concreteComponent.get("e.doClose").fire();
        }
    },

    /**
     * Focus on the item whose starting character(s) are what the end user types.
     * Copied from Accentjs dropdown component.
     */
    setFocusToTypingChars: function(component, event) {
        // If we were going to clear what keys were typed, don't yet.
        if (!$A.util.isUndefinedOrNull(component._clearBufferId)) {
            clearTimeout(component._clearBufferId);
        }

        // Store the letter.
        var letter = String.fromCharCode(event.keyCode);
        component._keyBuffer = component._keyBuffer || [];
        component._keyBuffer.push(letter);

        // Try to select
        var matchText = component._keyBuffer.join("").toLowerCase();
        var menuItems = component.get("v.childMenuItems");
        for(var i = 0; i < menuItems.length; i++) {
            var c = menuItems[i];
            var text = c.get("v.label");
            if(text.toLowerCase().indexOf(matchText) === 0) {
                var action = c.get("c.setFocus");
                action.runDeprecated();
                break;
            }
        }

        component._clearBufferId = setTimeout(function() {
        	component._keyBuffer = [];
        }, 700);
    },

    deselectSiblings: function(component, selectedItem) {
          var children = component.get("v.childMenuItems");
          for (var i = 0; i < children.length; i++) {
              var c = children[i];
              //TODO: should use boolean flag such as singleSelect or multiSelect instead of checking for ui:radioMenuItem
              if (c.isInstanceOf("ui:radioMenuItem") &&
                  $A.util.getBooleanValue(c.get("v.selected")) &&
                  c.getGlobalId() != selectedItem.getGlobalId()) {
                  c.set("v.selected", false);
                  break;
              }
          }
    },

    onMenuItemSelected: function(component, event) {
    	var concrete = component.getConcreteComponent();
    	var hideMenu = event.getParam("hideMenu");
    	var deselectSiblings = event.getParam("deselectSiblings");
    	var focusTrigger = event.getParam("focusTrigger");

    	if (deselectSiblings === true) {
    		this.deselectSiblings(component, event.getSource());
    	}
    	if (hideMenu === true) {
    		concrete.set("v.visible", false);
    	}
    	if (focusTrigger) {
    		this.setFocusToTrigger(component);
    	}
    	var e = component.get("e.menuSelect");
    	e.setParams(event.getParams()).fire();
    },

    /**
     * TODO: Need to walk up the tree to find the menuItem. menuItem could contain other components.
     */
    getComponentForElement: function(element) {
    	var htmlCmp = $A.componentService.getRenderingComponentForElement(element);
    	return htmlCmp ? htmlCmp.getComponentValueProvider().getConcreteComponent() : null;
    }
})
