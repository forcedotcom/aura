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

	onKeyDown: function(cmp, evt, helper) {
		helper.onKeyDown(cmp, evt);
	},

	/**
	 * This action is invoked when the tabItem is clicked
	 */
	onTabActivated: function(cmp, evt, helper) {
		var tab = evt.getSource(), 
			index = $A.util.arrayIndexOf(cmp._tabItems, tab),
			oldTab = cmp._activeTab && cmp._activeTab.isValid() ? cmp._activeTab : null,
			e = cmp.get('e.onTabActivated');
		
		e.setParams({"index": index, "oldTab": oldTab}).fire();
	},
	
	onTabClosed: function(cmp, evt, helper) {
		var tabItems = cmp._tabItems, item = evt.getSource(),
			index = $A.util.arrayIndexOf(tabItems, item);

		helper.closeTab(cmp, index);
		cmp.get("e.onTabClosed").setParams({"index": index}).fire();
	}
})