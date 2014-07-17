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
		//update size in case carousel width is not specified
		helper.updateSize(cmp);
		this.superAfterRender();
		helper.attachEvents(cmp);
		helper.selectDefaultPage(cmp);
	},
	
	rerender: function(cmp, helper) {
		var shouldRerender = false,
            forceUpdate = cmp.isDirty("v.pageComponents");

		if (cmp.isDirty("v.width") || cmp.isDirty("v.height") || cmp.isDirty("v.priv_carouselStyle") || forceUpdate) {
			helper.updateSize(cmp, forceUpdate);
			shouldRerender = true;
		}
		
		if (shouldRerender) {
			this.superRerender();
			if (forceUpdate) {
				helper.selectDefaultPage(cmp);
			}			
		}
	},
	
	unrender: function(cmp, helper) {
		helper.unrender(cmp);
		this.superUnrender();
	}
})
