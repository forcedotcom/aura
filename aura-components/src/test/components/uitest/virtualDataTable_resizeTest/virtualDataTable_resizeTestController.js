/*
 * Copyright 2017 salesforce.com, inc.
 * All Rights Reserved
 * Company Confidential
 */
({
	init : function(cmp, evt, helper) {
        cmp.find("grid").set("v.resizableColumnsConfig", {
            initialWidths : cmp.get("v.initialWidths"),
            minWidth : 50
        });
        cmp.find("grid3").set("v.resizableColumnsConfig", {
            initialWidths : null,
            minWidth : 50
        });
	},
	
	onResize : function(cmp, evt, helper) {
		var src = evt.getParam("src");
		cmp.set("v.prevResize", {
			src : {
				index : src.colIndex,
				label : src.column.get("v.label")
			},
			width : evt.getParam("newSize")
		});
	},
	
	showGrid2 : function(cmp) {
		var grid2Container = cmp.find("container2");
		grid2Container.getElement().style.display = "block";
	},

	addCol : function(cmp) {
		var grid = cmp.find("grid");
		var colIndex = 4;
		var headers = grid.get("v.headerColumns");
		var columns = grid.get("v.columns");
		var config = {
				header: {
					"componentDef": "markup://ui:dataTableHeader",
		            "attributes": {
		                "values": { label: "Age",
		                			name: "age"
	                		  }
		            }
				},
				column: {
					"componentDef": "markup://ui:outputText",
					"attributes": {
						"values": { 
							value: $A.expressionService.create(null, "{!item.age}")
						}
					}
				}
			};
	
		$A.newCmpAsync(
				this, 
				function(newCmp) {
					headers[colIndex] = newCmp;
					grid.set("v.headerColumns", headers);
				},
				config.header
		);
		columns[colIndex] = config.column;
		grid.set("v.columns", columns);
	},
	
	removeCol : function(cmp) {
		var grid = cmp.find("grid");
		var colIndex = 1;
		var headers = grid.get("v.headerColumns");
		var columns = grid.get("v.columns");
		
		headers = headers.splice(0,colIndex).concat(headers.splice(colIndex));;
		grid.set("v.headerColumns", headers);
		columns = columns.splice(0,colIndex).concat(columns.splice(colIndex));
		grid.set("v.columns", columns);
	},
	
	switchCol : function(cmp) {
		var grid = cmp.find("grid");
		var colIndex = 1;
		var headers = grid.get("v.headerColumns");
		var columns = grid.get("v.columns");
		var config = {
				
				header: {
					"componentDef": "markup://ui:dataTableHeader",
		            "attributes": {
		                "values": { label: "Gender",
		                			name: "gender"
	                		  }
		            }
				},
				column: {
					"componentDef": "markup://ui:outputText",
					"attributes": {
						"values": { 
							value: $A.expressionService.create(null, "{!item.gender}")
						}
					}
				}
			};
	
		$A.newCmpAsync(
				this, 
				function(newCmp) {
					headers[colIndex] = newCmp;
					grid.set("v.headerColumns", headers);
				},
				config.header
		);
		columns[colIndex] = config.column;
		grid.set("v.columns", columns);
	}
})