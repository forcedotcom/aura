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
	afterRender: function(cmp, helper) {
		this.superAfterRender();
		
		cmp._preventDefault = function(e) {
			e.preventDefault();
		};

		$A.util.on(cmp.find("panel").getElement(), "touchmove", cmp._preventDefault);
		if (cmp.get('v.isModal')) {
			$A.util.on(cmp.find("modal-glass").getElement(), "touchmove", cmp._preventDefault);
		}
		if (cmp.get("v.isVisible")) {
			helper.show(cmp);
		}
		cmp.getEvent('panelDoneRendering').setParams({
			panelId: cmp.getGlobalId(),
			panelType: 'ui:panelSlider'
		}).fire();
	},
	
	unrender: function(cmp, helper) {
		$A.util.removeOn(cmp.find("panel").getElement(), "touchmove", cmp._preventDefault);
		if ( cmp.get("v.escToClose") ) {
			$A.util.removeOn(window, "keydown", cmp._windowKeyHandler);
		}
		if (cmp.get('v.isModal')) {
			$A.util.removeOn(cmp.find("modal-glass").getElement(), "touchmove", cmp._preventDefault);
		}
	}
})