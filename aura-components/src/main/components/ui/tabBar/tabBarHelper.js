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
	activateTab:  function(cmp, index, focus) {
		if ($A.util.isNumber(index) && cmp._tabItems[index]) {
			var tab = cmp._tabItems[index];
			this.deactivateTab(cmp, tab);
			tab.get("e.activateTab").setParams({"active": true, "focus": focus}).fire();
		}
	},
	
	/**
	 * Close given tab item
	 */
	closeTab: function(cmp, index) {
		var closed = false, tabItems = cmp._tabItems;
		if ($A.util.isNumber(index) && index >=0 && index < tabItems.length) {
			var item = tabItems.splice(index, 1);
			item[0].destroy();
			closed = true;
		}
		return closed;
	},
	
	/**
	 * Add new tab item to the tabBar
	 */
	addTab: function(cmp, index, tab) {
		var self = this, items = cmp._tabItems;
		if ($A.util.isNumber(index) && index >=0 && index <= items.length) {
			var docFrag = document.createDocumentFragment();
			var tabValues = $A.expressionService.create(null, [tab]);
			var pNode = cmp.find("tabItemsContainer").getElement();
			this.createAndRenderComponents(cmp, tabValues, docFrag, function(newItems){
				if (index >= items.length) {
				    pNode.appendChild(docFrag);
				} else {
					var el = items[index].getElement();
					var pn = el.parentNode;
					pn.insertBefore(docFrag, el);
				}
				items.splice.apply(items, [index, 0].concat(newItems));
				//TODO: revisit to support adding array of tabs
				if (newItems[0].get("v.active")) {
				    self.activateTab(cmp, index);
				}
			});
		}
	},
	
	/**
	 * @private
	 * Deactivate the active tab
	 */
	deactivateTab: function(cmp, activeTab) {
		if (cmp._activeTab === activeTab) {
			return;
		}
		if (cmp._activeTab && cmp._activeTab.isValid()) {
			var e = cmp._activeTab.get("e.activateTab");
			e.setParams({active: false}).fire();
		}
		cmp._activeTab = activeTab;
	},
	
	onKeyDown: function(cmp, domEvent) {
		var srcElement = domEvent.srcElement || domEvent.target, keyCode = domEvent.keyCode;
		
		if (srcElement.hasAttribute("aria-selected") && keyCode >= 37 && keyCode <=40) {
			var tabItems = cmp._tabItems, len = tabItems.length;
			var index = this.getTabIndex(cmp, srcElement);
			if (index < 0 || index >= len) {
				return;
			}
			var oldTab = index;
	        if (keyCode === 37 || keyCode === 38) {
	            //left or up arrow key
	        	if (index === 0) {
	        		index = len - 1;
	        	} else {
	        		index--;
	        	}
	        } else if (keyCode === 39 || keyCode === 40) {
	        	//right or down arrow key
	        	if (index === len - 1) {
	        		index = 0;
	        	} else {
	        		index++;
	        	}
	        }
	        cmp.get('e.onTabActivated').setParams({"index": index, "oldTab": oldTab}).fire();
	        $A.util.squash(domEvent, true);
		}
	},
	
	
	/**
	 * Get element position index
	 * @private
	 */
	getTabIndex: function(cmp, element) {
		var index = -1, container = cmp.find("tabItemsContainer").getElement();
		var el = element;
		while (el.parentNode) {
			if (el.parentNode === container) {
				index = $A.util.arrayIndexOf(container.children, el);
				break;
			}
			el = el.parentNode;
		}
		return index;
	},
	
	/**
	 * @private
	 */
	renderTabItems: function(cmp) {
		cmp._tabItems = [];
		var docFrag = document.createDocumentFragment();
		this.createAndRenderComponents(cmp, cmp.get("v.tabs"), docFrag, function(items) {
			cmp._tabItems = items;
			cmp.find('tabItemsContainer').getElement().appendChild(docFrag);
		});
	},
	
	/**
	 * @private
	 */
	createAndRenderComponents: function (cmp, tabValues, parentEl, callback) {
		var that = this,
			items = [],
			//TODO: JBUCH The following hack because addTab above calls $A.expressionService() to create an array and that returns an ArrayValue
			len = tabValues.getLength?tabValues.getLength():tabValues.length,
			counter = len;
		
		var fn = function (newCmp) {
			counter--;
			newCmp.addHandler("onActivate", cmp, "c.onTabActivated");
			newCmp.addHandler("onClose", cmp, "c.onTabClosed");
			items.push(newCmp);
			$A.render(newCmp, parentEl);
			$A.afterRender(newCmp);
			if (counter === 0 && callback) {
				callback(items);
			}
		}
		
		for (var i=0; i<len; i++) {
			var config = tabValues.get?tabValues.get(i):tabValues[i];
			$A.componentService.newComponentAsync(this, fn, config, config.valueProvider);
		}
	}
})