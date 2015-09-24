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
	activateTab: function(cmp, evt, helper) {
		helper.setActive(cmp, evt.getParam("active"), evt.getParam("focus"));
	},
	/**
	 * Handler for event that's fired when user clicks on tab to activate
	 */
	onTabActivated: function(cmp) {
		if($A.util.getBooleanValue("v.active")) {
		    cmp.get('e.onActivate').fire();
		}
	},
	
	close: function(cmp, evt) {
		cmp.get("e.onClose").fire();
		$A.util.squash(evt, true);
	},
	
	onTabHover: function(cmp, evt, helper) {
		helper.handleHoverEvent(cmp, 'onTabHover');
	},
	
	onTabUnhover: function(cmp, evt, helper) {
		helper.handleHoverEvent(cmp, 'onTabUnhover');
	}
})// eslint-disable-line semi