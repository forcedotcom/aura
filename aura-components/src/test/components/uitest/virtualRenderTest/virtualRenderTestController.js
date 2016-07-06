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
		var items = helper.generateItems(25);
		
		cmp.set("v.gridItems", items);
		cmp.set("v.listItems", items);
	},
	
	updateOnGrid : function(cmp, evt, helper) {
	    helper.update(cmp, "grid");
	},
	
	appendToGrid : function(cmp, evt, helper) {
		helper.appendTo(cmp, "grid");
	},
	
	delayedAppendToGrid : function(cmp, evt, helper) {
		setTimeout($A.getCallback(function() {
			helper.appendTo(cmp, "grid");
		}), 300);
	},
	
	appendToList : function(cmp, evt, helper) {
		helper.appendTo(cmp, "list");
	},
	
	updateList : function(cmp, evt, helper) {
		var list = cmp.find("list");
		var index = 0;
		
		var item = list.get("v.items")[index];
		item.name += '.';
		list.updateItem(item, index);
	}
})