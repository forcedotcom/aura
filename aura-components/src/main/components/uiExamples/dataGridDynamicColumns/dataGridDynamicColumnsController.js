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
    handleCurrentPageChange: function (cmp) {
        // Tell the grid to fetch new items from the dataProvider.
        cmp.find('grid').getEvent('refresh').fire();
    },
    replaceData : function(cmp, evt, hlp) {
		cmp.find("data").set("v.empty", false);
		cmp.find("data").getEvent("provide").fire();
	},
	
	emptyData : function(cmp, evt, hlp) {
		cmp.find("data").set("v.empty", true);
		cmp.find("data").getEvent("provide").fire();
	},
	
	initColumns : function(cmp, evt, helper) {
		var grid = cmp.find("grid");
		
		$A.newCmpAsync(
				this,
				function(newCmp) {
					grid.set("v.columns", [newCmp]);
				},
				{
					"componentDef": "markup://ui:dataGridColumn",
		            "attributes": {
		                "values": { label: "Id",
		                			name: "id",
		                			sortable: true
		                		  }
		            }
				}/*,{
					"componentDef": "markup://ui:dataGridColumn",
		            "attributes": {
		                "values": { label: "Name",
		                			name: "who.name"
		                		  }
		            }
				}]*/
		);
	},
	
	insertNewColumns : function(cmp, evt, helper) {
		var grid = cmp.find("grid");
		
		$A.newCmpAsync(
				this,
				function(newCmp) {
					var cols = grid.get("v.columns");
					cols.push(newCmp);
					grid.set("v.columns", cols);
				},
				{
					"componentDef": "markup://ui:dataGridColumn",
		            "attributes": {
		                "values": { label: "Subject",
		                			name: "subject"
		                		  }
		            }
				}/*,{
					"componentDef": "markup://ui:dataGridColumn",
		            "attributes": {
		                "values": { label: "Related To",
		                			name: "what.name"
		                		  }
		            }
				}]*/
		);
	},
	
	removeColumns : function(cmp, evt, helper) {
		var grid = cmp.find("grid"),
			newCols = grid.get("v.columns").splice(1, 1);
		
		grid.set("v.columns", newCols);
	},
	
	switchColumn : function(cmp, evt, hlp) {
		var grid = cmp.find("grid");
		var columns = grid.get("v.columns");		
		
		var column = columns[5];
		if (column.get("v.name") === "activityDate") {
			$A.newCmpAsync(
					this, 
					function(newCmp) {
						var oldCmp = columns[5];
						columns[5] = newCmp;
						grid.set("v.columns", columns);
						
						oldCmp.destroy();
					},
					{
						"componentDef": "markup://ui:dataGridColumn",
			            "attributes": {
			                "values": { label: "Name",
			                			name: "who.name"
			                		  }
			            }
					}
			);
		} else {
			$A.newCmpAsync(
					this, 
					function(newCmp) {
						var oldCmp = columns[5];
						columns[5] = newCmp;
						grid.set("v.columns", columns);
						
						oldCmp.destroy();
					},
					{
						"componentDef": "markup://ui:dataGridColumn",
			            "attributes": {
			                "values": { label: "Due Date",
			                			name: "activityDate"
			                		  }
			            }
					}
			);
		}
	}
})