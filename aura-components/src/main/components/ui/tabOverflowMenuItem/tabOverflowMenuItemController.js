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
	/**
	 * Handler for event that's fired programatically
	 */
	activateMenu: function(cmp, evt) {
		if (evt.getParam) {
			cmp.find("menuList").set("v.focusItemIndex", evt.getParam("index"));
		}
		cmp.find("menu").get("e.popupTriggerPress").fire();
	},
	
	focusChange: function(cmp, evt, helper) {
		var focusedItemName = evt.getParam("currentItem").get("v.id");
		cmp.set("v.focusedItemName", focusedItemName, true);
		helper.triggerTab(cmp, focusedItemName, null, false);
	},
	
	onCollapse: function(cmp, evt, helper) {
		var focusedItemName = cmp.get("v.focusedItemName");
		if (!$A.util.isEmpty(focusedItemName)) {
			helper.triggerTab(cmp, focusedItemName, null, true);
		}
	},
	
	onTabHover: function(cmp, evt, helper) {
		helper.handleHoverEvent(cmp, 'onTabHover');
	},
	
	onTabUnhover: function(cmp, evt, helper) {
		helper.handleHoverEvent(cmp, 'onTabUnhover');
	},
	
	onMenuSelection: function(cmp, evt, helper) {
		var source = evt.getSource();
		helper.triggerTab(cmp, source.get("v.id"), null, true);
	},
	
	/**
	 * Handler for a hover on a menu item.
	 */
	onHover: function(cmp, evt) {
		// Don't do anything on hover.
		evt.stopPropagation();
	},
	
	updateMenuItems: function(cmp, evt, helper) {
		helper.updateMenuItems(cmp);
	},
	
	/**
	 * Activate first tab on tab bar
	 */
	handleForwardWrap: function(cmp, evt, helper) {
		helper.triggerTab(cmp, null, 0, true);
	},
	
	/**
	 * Activate last tab on tab bar
	 */
	handleReverseWrap: function(cmp, evt, helper) {
		helper.triggerTab(cmp, null, -1, true);
	}
})// eslint-disable-line semi