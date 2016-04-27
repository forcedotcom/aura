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
	generateItems : function(count, startIndex) {
		var items = [];
		var startIndex = startIndex || 0;
		
		for (var i = startIndex; i < (startIndex + count); i++) {
			items.push({
				name 	: "Name " + i,
				phone	: "Phone",
				balance	: i
			});
		}
		
		return items;
	},
	
	update : function(cmp, layoutId) {
	    var index = 2;
	    var layoutComponent = cmp.find(layoutId);
	    var item = this.generateItems(1, 2222)[0];
	    
	    layoutComponent.updateItem(item, index);
	},
	
	appendTo : function(cmp, layoutId) {
		var layoutComponent = cmp.find(layoutId);
		var startIndex = layoutComponent.get("v.items").length;
		var items = this.generateItems(25, startIndex);
		
		layoutComponent.appendItems(items);
	}
})