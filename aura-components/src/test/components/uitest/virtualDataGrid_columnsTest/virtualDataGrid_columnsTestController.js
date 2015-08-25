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
		helper.generateColumnConfigs(cmp);
	},
	
    spit : function(cmp, evt, helper) {
    	var list = cmp.find("grid").get("v.items");
		cmp.set("v.gridItems", list);
	},
	
	replaceData : function(cmp, evt, helper) {
		cmp.find("data").set("v.empty", false);
		cmp.find("data").getEvent("provide").fire();
	},
	
	emptyData : function(cmp, evt, helper) {
		cmp.find("data").set("v.empty", true);
		cmp.find("data").getEvent("provide").fire();
	},
	
	switchColumn : function(cmp, evt, helper) {
		var grid = cmp.find("grid"),
			colIndex = 4,
			headers = grid.get("v.headerColumns"),
			columns = grid.get("v.columns"),
			config = (headers[colIndex].get("v.name") === "activityDate") ?
				cmp._columnConfigs.who : cmp._columnConfigs.activityDate;
		
		$A.newCmpAsync(
				this, 
				function(newCmp) {
					headers[4] = newCmp;
					grid.set("v.headerColumns", headers);
				},
				config.header
		);
		columns[colIndex] = config.column;
		grid.set("v.columns", columns);
	},
	
	onsort : function(cmp, evt, helper) {
		var params = evt.getParams();

		params.callback({
			data : ["hi", "bye"],
			state : "State",
			error : {}
		});
	}
})