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
	CONSTANTS : {ASC: 'ASC', DESC: 'DESC', DESC_PREFIX: "-", CONTAINER_ELEMENT_ID: 'listSorter'},
		
	doInit : function(cmp) {
		this.initSorterTrigger(cmp);
		this.initDataProvider(cmp);
		this.initItems(cmp, cmp.get('v.items'), cmp.get('v.defaultSelectedItems'));
	},
	
	initSorterTrigger : function(cmp) {		
		var trigger = cmp.get('v.trigger'),
			triggerLabel = cmp.get('v.triggerLabel');
		
		if (trigger && trigger.length > 0) {
			if (triggerLabel) {
				trigger[0].set("v.label", triggerLabel);
			}
			trigger[0].addHandler('click', cmp, 'c.onOpen');

		} else if (triggerLabel) {
			
			var menuTrigger = $A.createComponentFromConfig({
	            componentDef : { descriptor : "markup://ui:menuTriggerLink" },
	            attributes : { values : { label: triggerLabel } } 
	        });

			menuTrigger.addHandler('click', cmp, 'c.onOpen');
			cmp.set('v.trigger', menuTrigger);
		}
	},
	
	initDataProvider: function(cmp) {
        var dataProviders = cmp.get("v.dataProvider");
        
        if ($A.util.isArray(dataProviders)) {
        	cmp._dataProviders = dataProviders;
            for (var i = 0; i < dataProviders.length; i++) {
            	//add handler
                dataProviders[i].addHandler("onchange", cmp, "c.handleDataChange");
                dataProviders[i].addHandler("error", cmp, "c.handleDataError");
            }
        }
    },
    
    initItems : function(cmp, items, selectedItems) {
		if (!cmp._sortOrderMap) {
			cmp._sortOrderMap = {};
		}
	    
		if (items && items.length > 0) {
			//init sortOrderMap for default selected items
			var filteredItems = [], sList = [], fieldName, label;
            var i;
			if (selectedItems) {
				for (i=0; i< selectedItems.length; i++) {
					cmp._sortOrderMap[selectedItems[i].fieldName] = {order: selectedItems[i].ascending ? this.CONSTANTS.ASC : this.CONSTANTS.DESC, selected: true};				
				}
			}
			var indx = 0;
			for (i=0; i<items.length; i++) {
				if (typeof items[i].isSortable === 'undefined' || items[i].isSortable === true) {
					fieldName = items[i].fieldName;
					label = items[i].label;
					
					if (!cmp._sortOrderMap[fieldName]) {
						//default to ASC order
						cmp._sortOrderMap[fieldName] = {order: this.CONSTANTS.ASC, index: indx, selected: false}; 
					} else {
						cmp._sortOrderMap[fieldName].index = indx;
						//add to selected list
						sList.push({value: fieldName, label: label, index: indx});
					}
					filteredItems.push({fieldName : fieldName, label: label});
					indx++;
				}
			}
			
			cmp._selectedItems = sList;
			cmp.set('v.defaultSelectedItems', selectedItems);
			cmp.set('v.items', filteredItems);
			//show apply button only when item is not empty
			$A.util.removeClass(cmp.find("set").getElement(), "hidden", "visible");
		}
	},

	
	handleOnOpen : function(cmp, force) {
		var items = cmp.get('v.items');
		if ((cmp.get('v.visible') || !cmp.isRendered()) && !force) {
			return;
		}
		this.attachEventHandler(cmp);		
		var selected = this.getDefaultSortBy(cmp);
		if (selected && selected.length > 0 && items && items.length > 0) {
			//update selected item sort orders
			for (var i=0; i< selected.length; i++) {
				if (cmp._sortOrderMap[selected[i].fieldName]) {
					cmp._sortOrderMap[selected[i].fieldName].order = selected[i].ascending ? this.CONSTANTS.ASC : this.CONSTANTS.DESC;
				}
			}
			//reset selectedItems to default
			this.setSelectedItems(cmp, selected);
			//select menu item
			this.selectMenuItem(cmp, selected);
		}
		cmp.set('v.visible', true);
		this.appendElementToBody(cmp);
		this.updateSize(cmp);
	},
	
	handleOnCancel : function(cmp) {
		this.removeEventHandler(cmp);
		this.reset(cmp);
		cmp.set('v.visible', false, true);
		this.setVisible(cmp, false);
		
		var action = cmp.get('v.onCancel');
        if (action) {
        	action.runDeprecated();
        }
	},
	
	handleApply : function(cmp) {
		this.removeEventHandler(cmp);
		cmp.set('v.visible', false, true);
		this.setVisible(cmp, false);
		
		var action = cmp.get('v.onApply');
		if (action) {
			var result = [], order;
			var selectedItems = this.getSelectedMenuItems(cmp);
			for (var i=0; i < selectedItems.length; i++) {
				// append prefix for descending order
				order = selectedItems[i].ascending ? '' : this.CONSTANTS.DESC_PREFIX;
				result.push({ sortBy: order + selectedItems[i].fieldName, label: selectedItems[i].label });
			}
			//update default selected items so correct item is selected when open next time
			cmp.set("v.defaultSelectedItems", selectedItems);
			action.runDeprecated(result);
		}
	},
	
	/**
	 * Reset selected items and sort orders
	 * 
	 */
	reset: function(cmp) {
		//reset sort orders
		/*var sMap = cmp._sortOrderMap;
		for (var prop in sMap) {
			if (sMap.hasOwnProperty(prop)) {
				if (!sMap[prop].selected) {
					//default to ASC order
					sMap[prop].order = this.CONSTANTS.ASC;
				}
			}
		}*/
		//reset selected menu items
		var menuItems = cmp.find('sorterMenuList').get('v.childMenuItems'); 
		for (var i=0; i < menuItems.length; i++) {			 
			var item = menuItems[i];
			if (item.get('v.selected') === true) {
				item.set('v.selected', false);
			}
			
			item.set('v.isAscending', true);
		}
	},
	
	/**
	 * Get default sortBy from data provider
	 */
	getDefaultSortBy: function(cmp) {		
	    	//TODO: need to support multiple data providers
		var sortBy = this.parseSortBy(cmp, cmp.get('v.defaultSelectedItems'));
		for (var i=0; i< sortBy.length; i++) {
			if (cmp._sortOrderMap[sortBy[i].fieldName]) {
				//update item index
				sortBy[i].index = cmp._sortOrderMap[sortBy[i].fieldName].index; 
			}
		}
		return sortBy;
	},
	    
	/**
	 * Parse sortBy string which are comma separated into an array of objects
	 */
	parseSortBy: function(cmp, sortBy) {
		var ret = [];
		if ($A.util.isString(sortBy)) {
			sortBy = sortBy.split(',');
			for (var i=0; i<sortBy.length; i++) {
				//fieldName starts with "-" prefix means descending
	    		if (sortBy[i].indexOf(this.CONSTANTS.DESC_PREFIX) !== -1) {
	    			var fn = sortBy[i].substring(1); 
	    			ret.push({fieldName: fn, ascending: false});
	    		} else {
	    			ret.push({fieldName: sortBy[i], ascending: true});
	    		}
			}
		} else if ($A.util.isArray(sortBy)) {
			ret = sortBy;
		}
		return ret;
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
		var cssClass = "open";
		if (cmp.get('v.modal')) {
			$A.util.toggleClass(cmp.find('mask').getElement(), "open", visible);
			cssClass += " modal";
		}
		$A.util.toggleClass(cmp.find('sorterContainer').getElement(), cssClass, visible);
	},
	
	updateSortOrder : function(cmp) {
		var selectedItems = this.getSelectedMenuItems(cmp);
		if (selectedItems && selectedItems.length > 0) {
			for (var i=0; i<selectedItems.length; i++) {
				cmp._sortOrderMap[selectedItems[i].fieldName].order = selectedItems[i].ascending ? this.CONSTANTS.ASC : this.CONSTANTS.DESC;
			}
		}
	},
	
	getSelectedMenuItems : function(cmp) {
		var menuList = cmp.find('sorterMenuList');
		var values = [];		
	    if (menuList) {	    
			var menuItems = menuList.get('v.childMenuItems');	         
			for (var i = 0; i < menuItems.length; i++) {
				var c = menuItems[i];
			    if (c.get('v.selected') === true) {			    	
			    	values.push({fieldName: c.get('v.value'), label: c.get('v.label'), index: i, ascending: c.get('v.isAscending')});
			    }
			}
	    }
	    return values;
	},
	
	getSelectedItems : function(cmp) {
		return cmp._selectedItems;
	},
	
	setSelectedItems : function(cmp, selectedItems) {
		cmp._selectedItems = selectedItems;
	},
	
	selectMenuItem : function(cmp, selectedItems) {
		var menuList = cmp.find('sorterMenuList');
		var menuItems = menuList.get('v.childMenuItems');
		if (selectedItems && selectedItems.length > 0) {
			var item;
			for (var i = 0; i < selectedItems.length; i++) {
				if (typeof selectedItems[i].index !== 'undefined') {
					item = menuItems[selectedItems[i].index];
					if (item) {
						item.set('v.selected', true);
						item.set('v.isAscending', selectedItems[i].ascending);
					}
				}
			}
			
			this.updateSortOrder(cmp);
		}
	},
	
	attachEventHandler : function(cmp) {
		$A.util.on(document, 'keydown', this.getKeydownHandler(cmp));
        $A.util.on(window, 'orientationchange', this.getOrientationChangeHandler(cmp));
	},
	
	removeEventHandler : function(cmp) {
		$A.util.removeOn(document, 'keydown', this.getKeydownHandler(cmp));
        $A.util.removeOn(window, 'orientationchange', this.getOrientationChangeHandler(cmp));
	},
	
	appendElementToBody : function(cmp) {
		if (!cmp.get('v.modal')) {
			return;
		}
		var id = this.CONSTANTS.CONTAINER_ELEMENT_ID;
		var containerEl = document.getElementById(id);
		var maskEl = cmp.find('mask').getElement();
		var sorterEl = cmp.find('sorterContainer').getElement();
		
		if (!containerEl) {
			//attach the dom to the document body as a modal dialog
    		containerEl = document.createElement('div');
    		containerEl.setAttribute('id', id);
    		$A.util.addClass(containerEl, cmp.getConcreteComponent().getDef().getStyleClassName());
    		containerEl.appendChild(maskEl);
    		containerEl.appendChild(sorterEl);    		
    		document.getElementsByTagName("body")[0].appendChild(containerEl);
		} else if (!$A.util.contains(containerEl, sorterEl)) {
			containerEl.appendChild(maskEl);
			containerEl.appendChild(sorterEl);
		}
    },
    
    /**
     * Update dialog size
     */
    updateSize : function(cmp) {
        if(cmp.isValid() && cmp.isRendered()) {
            var containerEl = cmp.find('sorterContainer').getElement();
            var formfactor = $A.get("$Browser.formFactor");
            var header = cmp.find('headerBar').getElement();
            var menuListHeight;
            if (formfactor !== 'DESKTOP') {
                var viewPort = $A.util.getWindowSize();
                menuListHeight = viewPort.height - header.offsetHeight;

                //fill up the whole screen
                $A.util.addClass(cmp.find('sorterContainer').getElement(), formfactor);
                containerEl.setAttribute("style", "width: " + viewPort.width + "px; height: " + viewPort.height + "px");
                //update sorter menu size to fill up the rest of the screen with the menu list
                cmp.find('sorterMenuList').getElement().style.height = menuListHeight + 'px';
            } else {
                //update sorter menu size to fill up the rest of the screen with the menu list
                menuListHeight = containerEl.offsetHeight - header.offsetHeight;

                cmp.find('sorterMenuList').getElement().style.height = menuListHeight + 'px';
            }
        }
    },
    
	/**
	 * Handler for device orientation change event
	 */
	getOrientationChangeHandler : function(cmp) {
		if (!cmp._orientationChange) {
			var helper = this;		
			cmp._orientationChange = function() {
				helper.updateSize(cmp);
			};
		}
		return cmp._orientationChange;
	},
	
	/**
     * Constructs the handler for the DOM keydown event. Includes handlers for tab key (including shift+tab)
     */
    getKeydownHandler : function(cmp) {
    	if (!cmp._keydownHandler) {
			cmp._keydownHandler = function(event) {
		        switch (event.keyCode) {
		            case 9: // tab key, keep focus inside the dialog
		    			var currentFocus = document.activeElement,
		    			shiftPressed = event.shiftKey,
		    			applyBtn = cmp.find('set').getElement();  	
	                    if (currentFocus === applyBtn && !shiftPressed) {
	                        $A.util.squash(event, true);
	                    }          
		                break;
	            }   	
			};
    	}
    	return cmp._keydownHandler;
    },
 
    isElementInComponent : function(component, targetElem) {
		if (!component || !targetElem) {
			return false;
		}
	    var componentElements = component.getElements();
	    // go up the chain until it hits either a sibling or the root
	    var currentNode = targetElem;
	    do {
	        for (var index = 0; index < componentElements.length ; index++) {
	            if (componentElements[index] === currentNode) { return true; }
	        }
	        currentNode = currentNode.parentNode;
	    } while(currentNode);

	    return false;
    },
    
    unrender: function() {
    	var containerEl = document.getElementById(this.CONSTANTS.CONTAINER_ELEMENT_ID);
    	if (containerEl) {
    		$A.util.removeElement(containerEl);
    	}
    },
    
    refreshMenu : function(cmp) {
		var sorterMenu = cmp.find('sorterMenuList');

    	if (sorterMenu) {
    		sorterMenu.get('e.refresh').fire();
			var items = sorterMenu.get("v.childMenuItems");

			// Resets the roles of the menu items to not be 'menuitem', as although ui:listSorter is using
			// ui:menu/ui:*menuItem components, it doesn't look like one.
			for (var i = 0; i < items.length; i++) {
				items[i].set("v.role", null);
			}
    	}
	}
})// eslint-disable-line semi
