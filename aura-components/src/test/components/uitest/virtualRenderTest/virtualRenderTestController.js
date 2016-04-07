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
	init : function(cmp, evt, helper) {
		var items = [];
		
		for (var i = 0; i < 25; i++) {
			items.push({
				name 	: "Name " + i,
				phone	: "Phone",
				balance	: i
			});
		}
		
		cmp.set("v.gridItems", items);
		cmp.set("v.listItems", items);
	},
	
	appendToGrid : function(cmp, evt, helper) {
		var grid = cmp.find("grid");
		var startIndex = grid.get("v.items").length;
		
		var items = [];
		for (var i = 0; i < 25; i++) {
			items.push({
				name 	: "Name " + (startIndex + i),
				phone	: "Phone",
				balance	: (startIndex + i)
			});
		}
		
		grid.appendItems(items);
	},
	
	appendToList : function(cmp, evt, helper) {
		var list = cmp.find("list");
		var startIndex = list.get("v.items").length;
		
		var items = [];
		for (var i = 0; i < 25; i++) {
			items.push({
				name 	: "Name " + (startIndex + i),
				phone	: "Phone",
				balance	: (startIndex + i)
			});
		}
		
		list.appendItems(items);
	}
})