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
	onInit: function(cmp, evt, helper) {
		//populate pageId with component's globalId
		cmp.set('v.priv_pageId', cmp.getGlobalId());
	},

	onPageSelected : function (cmp, evt, helper) {
		helper.selectPage(cmp, evt);
	},

	onPageUpdate: function(cmp, evt, helper) {
		helper.updatePage(cmp, evt.getParam("pageComponent"));
	},

	onPageShow: function(cmp, evt, helper) {
		helper.showPage(cmp, evt.getParam('pageIndex'));
	},

	onPageHide: function(cmp, evt, helper) {
		helper.hidePage(cmp, evt.getParam('pageIndex'));
	},

	onUpdateSize: function(cmp, evt, helper) {
		var size = evt.getParam('pageSize');
		if (size) {
			helper.updateSize(cmp, size.width, size.height);
		}
	}
})
