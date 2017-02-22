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
	init: function (cmp, evt, helper) {
        helper.initialize(cmp);
	},

	handleDataChange: function (cmp, evt, helper) {
        helper.secureCallHandler(cmp, "handleDataChange", evt.getParam('data'));
	},

	handleModeChange: function (cmp, evt, helper) {
		var mode = cmp.get('v.mode'),
			isViewOnly = cmp.get('v.viewOnly');

		if (mode === 'EDIT' && isViewOnly) {
			$A.log('Can not put view only grid into EDIT mode.');
			return;
		}

        helper.secureCallHandler(cmp, "handleModeChange");
	},

	handleSortByChange: function (cmp, evt, helper) {
		helper.secureCallHandler(cmp, "handleSortByChange");
	},

	handleRefresh: function (cmp, evt, helper) {
		helper.secureCallHandler(cmp, "handleRefresh");
	},

	handleAddRemove: function (cmp, evt, helper) {
        helper.secureCallHandler(cmp, "handleAddRemove", evt.getParams());
	}
})// eslint-disable-line semi