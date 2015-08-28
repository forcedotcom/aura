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
	setActive: function(cmp, evt, helper) {
	    var active = evt.getParam("active");
	    //workaround issue where Integer type is passed in as String
	    var index = parseInt(evt.getParam("index"));
	    if (active) {
	        helper.activateTab(cmp, index, evt.getParam("focus"));
	    } else {
	        var tab = cmp._tabItems[index];
	        if (cmp._activeTab === tab) {
	            //deactive current active tab
	            tab.get("e.activateTab").setParams({"active": false}).fire();
	            cmp._activeTab = null;
	        }
	    }
	},
	
	addTab: function(cmp, evt, helper) {
		helper.addTab(cmp, evt.getParam("index"), evt.getParam("tab"));
	},
	
	/**
	 * This action is invoked from parent component to close a tabItem.
	 */
	closeTab: function(cmp, evt, helper) {
		var succeed = helper.closeTab(cmp, evt.getParam("index"), evt.getParam("tab"));
		var callback = evt.getParam("callback");
		if (typeof callback === "function") {
		    callback(succeed);
		}
	},
	
	/**
	 * This action is invoked from the overflow menu tab when an overflow item is focused or selected
	 */
	onOverflowSelection: function(cmp, evt, helper) {
		var overflowData = helper.getOverflowData(cmp),
			index = evt.getParam("index"),
			oldTab = cmp._activeTab && cmp._activeTab.isValid() ? cmp._activeTab : null,
			e = cmp.get('e.onTabActivated');
		
		// If an index is provided by the event, use it. -1 is treated as the last tab currently visible.
		// Otherwise, obtain the index from the tab cache using the provided name.
		if ($A.util.isUndefinedOrNull(index)) {
			index = overflowData.tabCache[evt.getParam("name").toLowerCase()];
		} else if (index === -1) {
			index = overflowData.overflowTabIndex;
		}
		
		e.setParams({"index": index, "oldTab": oldTab, "focus": evt.getParam("focus")}).fire();
	},

	onKeyDown: function(cmp, evt, helper) {
		helper.onKeyDown(cmp, evt);
	},

	/**
	 * This action is invoked when the tabItem is clicked
	 */
	onTabActivated: function(cmp, evt, helper) {
		var tab = evt.getSource(),
			index = helper.getTabItems(cmp).indexOf(tab),
			oldTab = cmp._activeTab && cmp._activeTab.isValid() ? cmp._activeTab : null,
			e = cmp.get("e.onTabActivated");
		
		e.setParams({"index": index, "oldTab": oldTab}).fire();
	},
	
	onTabClosed: function(cmp, evt, helper) {
		var tabItems = helper.getTabItems(cmp), item = evt.getSource(),
			index = tabItems.indexOf(item);

		helper.closeTab(cmp, index);
		cmp.get("e.onTabClosed").setParams({"index": index}).fire();
	},
	
	onTabHover: function(cmp, evt, helper) {
		cmp.getEvent("onTabHover").setParams(evt.getParams()).fire();
	},
	
	onTabUnhover: function(cmp, evt, helper) {
		cmp.getEvent("onTabUnhover").setParams(evt.getParams()).fire();
	}
// eslint-disable-line semi
})