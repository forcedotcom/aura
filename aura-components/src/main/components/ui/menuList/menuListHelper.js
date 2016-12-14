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
    	var concrete = component.getConcreteComponent();
        var children = [];

        var existingChildren = concrete.get("v.childMenuItems") || [];

        this.setHandlersOnMenuItems(concrete, concrete.get("v.body"), children, existingChildren);

        var items = component.find("item");
        if (items && $A.util.isArray(items)) {
            this.setHandlersOnMenuItems(concrete, items, children, existingChildren);
        }
        concrete.set("v.childMenuItems", children);
    },

    setHandlersOnMenuItems: function(component, items, children, existingChildren) {
        for (var i = 0; i < items.length; i++) {
            var child = items[i];
            if (child.isInstanceOf("ui:menuItem")) {
                if (existingChildren && existingChildren.indexOf(child) === -1) {
                    child.addHandler("menuSelect", component, "c.onMenuItemSelected");
                }
                children.push(child);
            } else if (child.isInstanceOf("aura:iteration") || child.isInstanceOf("aura:if")) {
                this.setHandlersOnMenuItems(component, child.get("v.body"), children, existingChildren);
            } else if (child.isInstanceOf("aura:expression")) {
                this.setHandlersOnMenuItems(component, child.get("v.value"), children, existingChildren);
            }
        }
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

        if ($A.util.hasClass(elements.targetElement, "visible") === visible) {
            return;
        }

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
        if (menuItem && menuItem.isValid() && menuItem.getElement()) {
            menuItem.setFocus();
            this.fireMenuFocusChangeEvent(component, null, menuItem);
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
                // @dval: There a multiple corner cases 
                // were we might endup in the wrong branch
                // Make this more robust once we refactor this component
    			var concreteCmp = component.getConcreteComponent();
    			if (event.type === "keydown") {
    				if (event.keyCode === 40) {  // down arrow key
    					event.preventDefault();
    					helper.setFocusToNextItem(concreteCmp, event);
    				} else if (event.keyCode === 38) {  // up arrow key
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
    		};
    	}
    	return component._keyboardEventHandler;
    },

    handleEsckeydown: function(component) {
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

        var menuItems = component.get("v.childMenuItems");

        if (event) {
            var srcComponent = this.getComponentForElement(event.target || event.srcElement);

            for (var i = 0; i < menuItems.length; i++) {
                if (srcComponent === menuItems[i]) {
                    nextIndex = ++i;
                            break;
                        }
                    }
            if (nextIndex >= menuItems.length) {
                nextIndex = 0;
            }
        }

        var nextFocusCmp = menuItems[nextIndex];
        nextFocusCmp.setFocus();

        this.fireMenuFocusChangeEvent(component, srcComponent, nextFocusCmp);
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
        previousFocusCmp.setFocus();
        
        this.fireMenuFocusChangeEvent(component, srcComponent, previousFocusCmp);
    },
    
    fireMenuFocusChangeEvent: function(component, previousItem, currentItem) {
    	var event = component.getEvent("menuFocusChange");
    	event.setParams({
			"previousItem": previousItem,
			"currentItem": currentItem
		});
    	event.fire();
    },

    /**
     * Dismiss the menu when tab key is pressed.
     */
    handleTabkeydown: function(component) {
		var closeOnTab = component.get('v.closeOnTabKey');
        var concreteComponent = component.getConcreteComponent();
        if (concreteComponent && closeOnTab) {
            if (component.get("v.attachToBody")) {
                this.setFocusToTrigger(component);
            }
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
        var srcComponent = this.getComponentForElement(event.target || event.srcElement);
        var matchText = component._keyBuffer.join("").toLowerCase();
        var menuItems = component.get("v.childMenuItems");
        for(var i = 0; i < menuItems.length; i++) {
            var c = menuItems[i];
            var text = c.get("v.label");
            if(text && text.toLowerCase().indexOf(matchText) === 0) {
                c.setFocus();
                this.fireMenuFocusChangeEvent(component, srcComponent, c);
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
              if (c.isInstanceOf("ui:radioMenuItem") &&
                      $A.util.getBooleanValue(c.get("v.selected")) &&
                      c.getGlobalId() !== selectedItem.getGlobalId()) {
                  c.set("v.selected", false);
                  break;
              }
          }
    },

    onMenuItemSelected: function(component, event) {
        if (!component.isValid()) {
            return;
        }

    	var concrete = component.getConcreteComponent();

        var deselectSiblings = event.getParam("deselectSiblings");
        if (deselectSiblings === true) {
            this.deselectSiblings(component, event.getSource());
        }

        var hideMenu = event.getParam("hideMenu");
        if (hideMenu === true) {
            concrete.set("v.visible", false);
        }

        var focusTrigger = event.getParam("focusTrigger");
        if (focusTrigger === true) {
            this.setFocusToTrigger(component);
        }

    	component.get("e.menuSelect").fire(event.getParams());
    },

    /**
     * TODO: Need to walk up the tree to find the menuItem. menuItem could contain other components.
     */
    getComponentForElement: function(element) {
    	var htmlCmp = $A.componentService.getRenderingComponentForElement(element);
    	return htmlCmp ? htmlCmp.getComponentValueProvider().getConcreteComponent() : null;
    }
})// eslint-disable-line semi
