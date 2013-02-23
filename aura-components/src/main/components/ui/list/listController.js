/*
 * Copyright (C) 2012 salesforce.com, inc.
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
	handlePageChange: function(component, event, helper) {
		var currentPage = event.getParam("currentPage");
		var pageSize = event.getParam("pageSize");
		
		component.getValue("v.currentPage").setValue(currentPage);
		component.getValue("v.pageSize").setValue(pageSize);
		
		helper.triggerDataProvider(component);
	},
	
	handleDataChange: function(component, event, helper) {
		component.getValue("v.items").setValue(event.getParam("data"));
	},
	
	init: function(component, event, helper) {
		helper.init(component);
	}
})