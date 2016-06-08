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
	changeColumns: function(cmp, evt, helper) {
	    var grid = cmp.find("grid");
	    var count = cmp.find("totalColumns").get("v.value");
	    var columnDefs = helper.generateColumnDefs(cmp, count);
	    
	    grid.set("v.headerColumns", columnDefs.headers);
	    grid.set("v.columns", columnDefs.columns);
	    grid.set("v.editLayouts", helper.EDIT_LAYOUTS);
	},
	
	changeItems: function(cmp, evt, helper) {
	    cmp.find("grid").set("v.items", helper.generateItems(10));
	},
	
	onEdit: function(cmp, evt, helper) {
	    helper.updateLastEdited(cmp, evt.getParams());
	}
})

