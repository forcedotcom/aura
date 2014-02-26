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
	init: function (cmp, evt, hlp) {
		hlp.initialize(cmp);
	},

	handleDataChange: function (cmp, evt, hlp) {
		var concrete = cmp.getConcreteComponent();
		hlp = concrete.getDef().getHelper(); 
		hlp.handleDataChange(concrete, evt.getParam('data'));
	},

	handleModeChange: function (cmp, evt, hlp) {
		var concrete = cmp.getConcreteComponent(),
			mode = cmp.get('v.mode'),
			isViewOnly = cmp.get('v.viewOnly');

		if (mode === 'EDIT' && isViewOnly) {
			$A.log('Can not put view only grid into EDIT mode.');
			return;
		}

		hlp = concrete.getDef().getHelper();
		hlp.handleModeChange(cmp); 	
	},

	handleSortByChange: function (cmp, evt, hlp) {
		var concrete = cmp.getConcreteComponent();
		hlp = concrete.getDef().getHelper();
		hlp.handleSortByChange(concrete); 
	},

	handleRefresh: function (cmp, evt, hlp) {
		var concrete = cmp.getConcreteComponent();
		hlp = concrete.getDef().getHelper();
		hlp.handleRefresh(concrete); 	
	},

	handleAddRemove: function (cmp, evt, hlp) {
		var concrete = cmp.getConcreteComponent();
		hlp = concrete.getDef().getHelper();
		hlp.handleAddRemove(cmp, evt.getParams()); 	
	}
})