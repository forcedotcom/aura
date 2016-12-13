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
	// TODO: possible to separate this out while still using similar scoping?
	updateMenuItems : function(cmp) {
		var self = this,
			menuItems = [],
			newMenuItems = cmp.get("v.menuItems"),
			count = newMenuItems.length,
			menuItemCache = this.getMenuItemCache(cmp);

		var callback = function(newMenuItem, status) {
			if (!cmp.isValid()) {
				return;
			}
			if (status === "SUCCESS") {
				count--;
				newMenuItem.autoDestroy(false);
				newMenuItem.addHandler("click", cmp, "c.onMenuSelection");
				newMenuItem.addHandler("mouseover", cmp, "c.onHover");

				menuItems.push(newMenuItem);
				menuItemCache[newMenuItem.get("v.id")] = newMenuItem;

				if (count === 0) {
					self.updateMenuList(cmp, menuItems);
				}
			}
		};

		// Use an existing menu item from the cache or
		// create a new menu item
		for (var i = 0; i < newMenuItems.length; i++) {
			var id = newMenuItems[i].id,
				title = newMenuItems[i].label;

			if (!menuItemCache[id]) {
				$A.createComponent("ui:actionMenuItem", {
					"label"   : title || id,
					"id"      : id,
					"aura:id" : "overflow-item"
				}, callback);
			} else {
				menuItems.push(menuItemCache[id]);
				count--;
			}
		}

		if (count === 0) {
			this.updateMenuList(cmp, menuItems);
		}

		cmp.set("v.menuItemCache", menuItemCache, true);
	},

	getMenuItemCache: function(cmp) {
		return cmp.get("v.menuItemCache") || {};
	},

	updateMenuList: function(cmp, menuItems) {
		if (cmp.isValid()) {
			cmp.find('menuList').set("v.body", menuItems);
			cmp.find('menuList').get("e.refresh").fire();
		}
	},

	/**
	 * Fire an event to activate the specified tab.
	 *
	 * @param {Component} cmp
	 * @param {String} name
	 * @param {Number} index
	 * @param {Boolean} focus Specifies whether the tab should receive focus
	 */
	triggerTab: function(cmp, name, index, focus) {
		var params = {
			name : name,
			index : index,
			focus : focus
		};

		cmp.get("e.onTabSelection").setParams(params).fire();
	}
})// eslint-disable-line semi
