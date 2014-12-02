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
    handleModePress: function (cmp) {
    	var mode = cmp.get('v.mode');
        cmp.set("v.mode", mode === 'VIEW' ? 'EDIT' : 'VIEW');
    },

    handleCurrentPageChange: function (cmp) {
        // Tell the grid to fetch new items from the dataProvider.
        cmp.find('grid').getEvent('refresh').fire();
    },

    handleAddRow: function (cmp, evt, hlp) {
        hlp.fireAddRemove(cmp, {
            last: true,
            count: 1
        }); 
    },

    handleInsert: function (cmp, evt, hlp) {
        var index = cmp.get('v.index'),
            count = cmp.get('v.count') || 1,
            items = [],
            seed = 0;
        
        for (var i = 0; i < count; i++) {
        	seed = Math.floor(Math.random()*(10000-5020+1)+5020);
        	items.push({
                id           : seed,
                subject      : 'Foo ' + seed, 
                activityDate : '2014-01-01',
                who          : {
                    name : 'John New With A Fairly Long New Name ' + seed,
                    id   : '00' + seed
                },
                what: {
                    name : 'Acme' + seed,
                    id   : '00' + seed
                }
            });
        }

        if (!$A.util.isUndefinedOrNull(index)) {
            hlp.fireAddRemove(cmp, {
                index : index,
                count : count,
                items : items
            }); 
        }
    },

    handleRemove: function (cmp, evt, hlp) {
        var index = cmp.get('v.index'),
            count = cmp.get('v.count') || 1;

        if (!$A.util.isUndefinedOrNull(index)) {
            hlp.fireAddRemove(cmp, {
                index  : index,
                count  : count,
                remove : true
            }); 
        }
    },

    handleAction: function (cmp, evt, hlp) {
        var name = evt.getParam('name');

        switch (name) {
            case 'disable': 
                hlp.changeRowDisabled(cmp, evt.getParam('index'), true);
                break;
            case 'enable':
            	hlp.changeRowDisabled(cmp, evt.getParam('index'), false);
            	break;
            case 'toggleClass':
            	hlp.changeRowClass(cmp, evt.getParam('index'), "error", "toggle");
        }
    },
    
    spit : function(cmp, evt, hlp) {
    	var list = cmp.find("grid").get("v.items");
		cmp.set("v.gridItems", list);
	},
	
	getSelected : function(cmp, evt, hlp) {
    	var list = cmp.find("grid").get("v.selectedItems");
    	cmp.set("v.gridSelectedItems", []); // workaround for rerendering issue
		cmp.set("v.gridSelectedItems", list);
	},
	
	replaceData : function(cmp, evt, hlp) {
		cmp.find("data").set("v.empty", false);
		cmp.find("data").getEvent("provide").fire();
	},
	
	emptyData : function(cmp, evt, hlp) {
		cmp.find("data").set("v.empty", true);
		cmp.find("data").getEvent("provide").fire();
	},
	
	switchColumn : function(cmp, evt, hlp) {
		var grid = cmp.find("grid");
		var columns = grid.get("v.columns");		
		
		var column = columns[5];
		if (column.get("v.name") === "activityDate") {
			$A.newCmpAsync(
					this, 
					function(newCmp) {
						columns[5] = newCmp;
						grid.set("v.columns", columns);
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
						columns[5] = newCmp;
						grid.set("v.columns", columns);
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
	},
	
	/**
	 * Row Attribute Update Handlers
	 */
	
	disableRow : function(cmp, evt, helper) {
		helper.changeRowDisabled(cmp, cmp.get("v.rowIndex"), false, true);
	},
	
	enableRow : function(cmp, evt, helper) {
		helper.changeRowDisabled(cmp, cmp.get("v.rowIndex"), false, false);
	},
	
	addClass : function(cmp, evt, helper) {
		helper.changeRowClass(cmp, cmp.get("v.rowIndex"), cmp.get("v.className"), "add");
	},
	
	removeClass : function(cmp, evt, helper) {
		helper.changeRowClass(cmp, cmp.get("v.rowIndex"), cmp.get("v.className"), "remove");
	},
	
	toggleClass : function(cmp, evt, helper) {
		helper.changeRowClass(cmp, cmp.get("v.rowIndex"), cmp.get("v.className"), "toggle");
	}
})