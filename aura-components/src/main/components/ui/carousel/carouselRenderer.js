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
{
	afterRender: function(cmp, helper) {
		helper.attachEvents(cmp);
		//update size in case carousel width is not specified
		helper.updateSize(cmp);
		this.superAfterRender();
		helper.selectDefaultPage(cmp);
	},
	
	rerender: function(cmp, helper) {
		var width = cmp.getValue('v.width'),
			height = cmp.getValue('v.height'),
			pageCmps = cmp.getValue('v.pageComponents');

		if (width.isDirty() || height.isDirty()) {
			helper.updateSize(cmp, true);
		}
		
		this.superRerender();
	},
	
	unrender: function(cmp, helper) {
		helper.unrender(cmp);
		this.superUnrender();
	}
}