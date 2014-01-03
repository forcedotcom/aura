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
	LABELS :{'ASC' : 'A-Z', 'DESC' : 'Z-A'},
	CONSTANTS : {ASC: 'ASC', DESC: 'DESC', DESC_PREFIX: "-"},
		
	doInit : function(cmp) {
		//default to ASC
    	this.updateSortOrderPicker(cmp, this.CONSTANTS.ASC);
		this.initSorterTrigger(cmp);
		this.initDataProvider(cmp);		
		this.triggerDataProvider(cmp);
	},
	
	initSorterTrigger : function(cmp) {		
		var trigger = cmp.get('v.trigger'),
			triggerLabel = cmp.get('v.triggerLabel');
		
		if (trigger && trigger.length > 0) {
			if (triggerLabel) {
				trigger[0].getValue("v.label").setValue(triggerLabel);
			}
			trigger[0].addHandler('click', cmp, 'c.onOpen');
		} else {
			var menuTrigger = $A.componentService.newComponentDeprecated({
	            "componentDef" : {
	            	"descriptor" : "markup://ui:menuTriggerLink"
	            },
	            "attributes" : {
	            	"values" : {
	            		"label": triggerLabel
	            	}
	            }});			
			menuTrigger.addHandler('click', cmp, 'c.onOpen');
			cmp.getValue('v.trigger').setValue(menuTrigger);
		}
	},
	
	initDataProvider: function(cmp) {
        var dataProviders = cmp.getValue("v.dataProvider").unwrap();
        
        if (dataProviders && dataProviders.length && dataProviders.length > 0) {
        	var items, selectedItems;
            for (var i = 0; i < dataProviders.length; i++) {
            	//get initial values from dataprovider
            	items = dataProviders[i].get('m.columns');            	 
            	this.initItems(cmp, items, dataProviders[i].get('m.defaultOrderByList'));
            	//add handler
                dataProviders[i].addHandler("onchange", cmp, "c.handleDataChange");
            }
            cmp._dataProviders = dataProviders;             
        }        
    },
    
    initItems : function(cmp, items, selectedItems) {
		if (!cmp._sortOrderMap) {
			cmp._sortOrderMap = {};
		}
	    
		if (items && items.length > 0) {
			//init sortOrderMap for default selected items
			var filteredItems = [], sList = [], fieldName, label;
			if (selectedItems) {
				for (var i=0; i< selectedItems.length; i++) {
					cmp._sortOrderMap[selectedItems[i].fieldName] = selectedItems[i].ascending ? this.CONSTANTS.ASC : this.CONSTANTS.DESC;				
				}
			}
			var indx = 0;
			for (var i=0; i<items.length; i++) {
				if (typeof items[i].isSortable == 'undefined' || items[i].isSortable == true) {
					fieldName = items[i].fieldName;
					label = items[i].label;					
					if (!cmp._sortOrderMap[fieldName]) {
						//default to ASC order
						cmp._sortOrderMap[fieldName] = this.CONSTANTS.ASC; 
					} else {
						//add to selected list
						sList.push({value: fieldName, label: label, index: indx});
					}
					filteredItems.push({fieldName : fieldName, label: label});
					indx++;
				}
			}
			
			cmp._selectedItems = sList;
			cmp._defaultOrderByList = sList;
			cmp.getValue('v.items').setValue(filteredItems);			
			this.updateSortedItemsLable(cmp);
		}
	},
     
    triggerDataProvider: function(cmp, index) {    	
        if (!index) {
            index = 0;
        }
        if (index >= 0 && index < cmp._dataProviders.length) {
            cmp._dataProviders[index].get("e.provide").fire();
        }
    },
	
	setVisible : function(cmp, visible) {
		if (cmp.get('v.modal')) {
			$A.util[visible ? 'addClass' : 'removeClass'](cmp.find('mask').getElement(),'open');
			var el = cmp.find('sorterContainer').getElement();
			$A.util[visible ? 'addClass' : 'removeClass'](el,'open');
			$A.util[visible ? 'addClass' : 'removeClass'](el,'modal');
		} else {
			$A.util[visible ? 'addClass' : 'removeClass'](cmp.find('sorterContainer').getElement(),'open');
		}
	},
	
	updateSelectedItemsSortOrder : function(cmp, order) {
		var selectedItems = this.getSelectedItems(cmp);
		if (selectedItems) {
			for (var i=0; i< selectedItems.length; i++) {
				cmp._sortOrderMap[selectedItems[i].value] = order;
			}
		}
	},
	
	updateSortOrderPicker : function(cmp, order) {
		if (order == this.CONSTANTS.ASC) {
			$A.util.addClass(cmp.find('ascBtn').getElement(), "selected");
			$A.util.removeClass(cmp.find('decBtn').getElement(), "selected");			
		} else if (order == this.CONSTANTS.DESC) {
			$A.util.addClass(cmp.find('decBtn').getElement(), "selected");
			$A.util.removeClass(cmp.find('ascBtn').getElement(), "selected");
		}
		this.setCurrentSortOrder(order);
		cmp.find('selectedSortOrderOutput').getValue('v.value').setValue(this.LABELS[order]);
	},
	
	updateSortedItemsLable : function(cmp) {
		var selectedItems = this.getSelectedItems(cmp);
		if (selectedItems && selectedItems.length > 0) {
			var values = [];
			for (var i=0; i<selectedItems.length; i++) {
				values.push(selectedItems[i].label);
			}
			values = values.join(',');
			if (values.length > 0) {
				$A.util.removeClass(cmp.find('separator').getElement(), 'hidden');
				cmp.find('selectedItemOutput').getValue('v.value').setValue(values);
			} else {
				$A.util.addClass(cmp.find('separator').getElement(), 'hidden');
			}
		}
	},
	
	getSelectedMenuItems : function(cmp) {
		var menuList = cmp.find('sorterMenuList');
		var values = [];		
	    if (menuList) {	    
			var menuItems = menuList.getValue('v.childMenuItems');	         
			for (var i = 0; i < menuItems.getLength(); i++) {
				var c = menuItems.getValue(i);
			    if (c.get('v.selected') === true) {			    	
			    	values.push({value: c.get('v.value'), label: c.get('v.label'), index: i});
			    }
			}
	    }
	    return values;
	},
	
	getCurrentSortOrder : function(cmp) {
		return cmp._currentSortOrder;
	},
	
	setCurrentSortOrder : function(cmp, order) {
		cmp._currentSortOrder = order;
	},
	
	getSelectedItems : function(cmp) {
		return cmp._selectedItems;
	},
	
	setSelectedItems : function(cmp, selectedItems) {
		cmp._selectedItems = selectedItems;
	},
	
	selectMenuItem : function(cmp, selectedItems) {
		var menuList = cmp.find('sorterMenuList');
		var menuItems = menuList.getValue('v.childMenuItems');
		if (selectedItems && selectedItems.length > 0) {
			var item;
			for (var i = 0; i < selectedItems.length; i++) {
				item = menuItems.getValue(selectedItems[i].index);
				if (item) {
					item.setValue('v.selected', true);
				}
			}
			this.updateSortedItemsLable(cmp);
			//support single select only for now
			this.updateSortOrderPicker(cmp, cmp._sortOrderMap[selectedItems[0].value]);
		}
	},
	
	handleOnOpen : function(cmp) {
		var items = cmp.getValue('v.items');
		
		if (cmp.get('v.visible')) {
			return;
		}
		this.attachEventHandler(cmp);		
		var selected = cmp._defaultOrderByList;
		if (selected && selected.length > 0) {
			//reset selectedItems to default
			this.setSelectedItems(cmp, selected);
			//select menu item
			this.selectMenuItem(cmp, selected);
			//focus on the first selected default item 
			var index = selected[0].index;
			if (items.unwrap()[index]) {
				cmp.find('sorterMenuList').setValue("v.focusItemIndex", index);
			}			
		}
		cmp.setValue('v.visible', true);
		//fill up the rest of the screen with the menu list
		var container = cmp.find('sorterContainer').getElement(),
			header = cmp.find('headerBar').getElement(),
			pickerCtEl = cmp.find('sortOrderPicker').getElement(),
			menuListHeight = container.offsetHeight - header.offsetHeight - pickerCtEl.offsetHeight;
		
		cmp.find('sorterMenuList').getElement().style.height = menuListHeight + 'px';				
	},
	
	handleOnClose : function(cmp) {
		this.removeEventHandler(cmp);
		cmp.getValue('v.visible').setValue(false, true);
		this.setVisible(cmp, false);
	},
	
	attachEventHandler : function(cmp) {
		if (!cmp._keydownHandler) {
			cmp._keydownHandler = this.getKeydownHandler(cmp);
		}
		$A.util.on(document, 'keydown', cmp._keydownHandler);
		$A.util.on(document.body, this.getOnClickEventProp("onClickStartEvent"), this.getOnClickStartFunction(cmp));
        $A.util.on(document.body, this.getOnClickEventProp("onClickEndEvent"), this.getOnClickEndFunction(cmp));    
	},
	
	removeEventHandler : function(cmp) {
		$A.util.removeOn(document, 'keydown', cmp._keydownHandler);
		$A.util.removeOn(document.body, this.getOnClickEventProp("onClickStartEvent"), this.getOnClickStartFunction(cmp));
        $A.util.removeOn(document.body, this.getOnClickEventProp("onClickEndEvent"), this.getOnClickEndFunction(cmp)); 
		delete cmp._keydownHandler;		
	},
	
	/**
     * Constructs the handler for the DOM keydown event. Includes handlers for tab key (including shift+tab)
     */
    getKeydownHandler : function(cmp) {
    	return function(event) {
	        switch (event.keyCode) {
	            case 9: // tab key, keep focus inside the dialog
	            	var container = cmp.find('sorterContainer').getElement(),
	    			currentFocus = document.activeElement,
	    			shiftPressed = event.shiftKey,
	    			firstFocusable = cmp.find('ascBtn').getElement(),
	    			applyBtn = cmp.find('set').getElement();  	
                    if (currentFocus === applyBtn && !shiftPressed) {
                        $A.util.squash(event, true);
                        firstFocusable.focus();
                    } else if (currentFocus === firstFocusable && shiftPressed) {
                        $A.util.squash(event, true);
                        applyBtn.focus();
                    }                   
	                break;
            }   	
    	}
    },
	
	handleApply : function(cmp) {
		this.removeEventHandler(cmp);
		cmp.getValue('v.visible').setValue(false, true);
		this.setVisible(cmp, false);
		
		var action = cmp.get('v.onApply');
		if (action) {
			var result = [], order;
			var selectedItems = this.getSelectedItems(cmp);
			for (var i=0; i < selectedItems.length; i++) {
				// append prefix for descending order
				order = cmp._sortOrderMap[selectedItems[i].value] === this.CONSTANTS.DESC ? this.CONSTANTS.DESC_PREFIX : '';
				result.push(order + selectedItems[i].value);
			}			
			action.runDeprecated(result);
		}
	},
	
	position : function(cmp) { 
    	if (cmp.get('v.modal')) {
    		var containerEl = cmp.find('sorterContainer').getElement(); 
    		var isPhone = $A.getGlobalValueProviders().get("$Browser.isPhone");
    		if (isPhone) {
    			var viewPort = $A.util.getWindowSize();
    			//fill up the whole screen
    			$A.util.addClass(cmp.find('sorterContainer').getElement(), 'phone');
    			containerEl.style.width = viewPort.width + 'px';
    			containerEl.style.height = viewPort.height + 'px';
    		}
    		//attach the dom to the document body as a modal dialog
    		document.body.appendChild(cmp.find('mask').getElement());
    		document.body.appendChild(containerEl);
    	}
    },
	
	getOnClickStartFunction: function(component) {
        if ($A.util.isUndefined(component._onClickStartFunc)) {
            var helper = this;
            var f = function(event) {
                if (helper.getOnClickEventProp("isTouchDevice")) {
                    var touch = event.changedTouches[0];
                    // record the ID to ensure it's the same finger on a
					// multi-touch device
                    component._onStartId = touch.identifier;
                    component._onStartX = touch.clientX;
                    component._onStartY = touch.clientY;
                } else {
                    component._onStartX = event.clientX;
                    component._onStartY = event.clientY;
                }
            };
            component._onClickStartFunc = f;
        }
        return component._onClickStartFunc;
    },
    
    getOnClickEndFunction : function(component) {
        if ($A.util.isUndefined(component._onClickEndFunc)) {
            var helper = this;
            var f = function(event) {            	
                // ignore gestures/swipes; only run the click handler if it's a
				// click or tap
                var clickEndEvent;
            
                if (helper.getOnClickEventProp("isTouchDevice")) {
                    var touchIdFound = false;
                    for (var i = 0; i < event.changedTouches.length; i++) {
                        clickEndEvent = event.changedTouches[i];
                        if (clickEndEvent.identifier === component._onStartId) {
                            touchIdFound = true;
                            break;
                        }
                    }
                
                    if (helper.getOnClickEventProp("isTouchDevice") && !touchIdFound) {
                        return;
                    }
                } else {
                    clickEndEvent = event;
                }
            
                var startX = component._onStartX, startY = component._onStartY;
                var endX = clickEndEvent.clientX, endY = clickEndEvent.clientY;

                if (Math.abs(endX - startX) > 0 || Math.abs(endY - startY) > 0) {
                    return;
                }
             
                if (!helper.isElementInComponent(component.find('sorterContainer'), event.target)) {
                    // Collapse the sorter
                	 component.setValue("v.visible", false);
                }
                
            };
            component._onClickEndFunc = f;
        }
        return component._onClickEndFunc;
    },
    
    getOnClickEventProp: function(prop) {
        // create the cache
        if ($A.util.isUndefined(this.getOnClickEventProp.cache)) {
            this.getOnClickEventProp.cache = {};
        }

        // check the cache
        var cached = this.getOnClickEventProp.cache[prop];
        if (!$A.util.isUndefined(cached)) {
            return cached;
        }

        // fill the cache
        this.getOnClickEventProp.cache["isTouchDevice"] = !$A.util.isUndefined(document.ontouchstart);
        if (this.getOnClickEventProp.cache["isTouchDevice"]) {
            this.getOnClickEventProp.cache["onClickStartEvent"] = "touchstart";
            this.getOnClickEventProp.cache["onClickEndEvent"] = "touchend";
        } else {
            this.getOnClickEventProp.cache["onClickStartEvent"] = "mousedown";
            this.getOnClickEventProp.cache["onClickEndEvent"] = "mouseup";
        }
        return this.getOnClickEventProp.cache[prop];
    },
	
    isElementInComponent : function(component, targetElem) {
		if (!component || !targetElem) {
			return false;
		}
		
	    var componentElements = [];
	
	    // grab all the siblings
	    var elements = component.getElements();
	    for(var index in elements) {
	        if (elements.hasOwnProperty(index)){
	            componentElements.push(elements[index]);
	        }
	    }
	
	    // go up the chain until it hits either a sibling or the root
	    var currentNode = targetElem;
	
	    do {
	        for (var index = 0; index < componentElements.length ; index++) {
	            if (componentElements[index] === currentNode) { return true; }
	        }
	
	        currentNode = currentNode.parentNode;
	    } while(currentNode);
	
	    return false;
    }
})