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
/*
 * These helper methods are in the renderer due to the many ways
 * that abstractList can be implemented.  Since controller methods
 * can be overridden, and component creation can be dynamic, putting
 * the relevant helper method call in the renderer ensures that the
 * emptyListContent is handled no matter how the list is implemented.
 */
	afterRender : function(component, helper){
		helper.updateEmptyListContent(component);
	},
	rerender : function(component, helper){
		this.superRerender();
		var items = component.getValue('v.items');
		if (items.isDirty()) {
			helper.updateEmptyListContent(component);
		}
	}
})
