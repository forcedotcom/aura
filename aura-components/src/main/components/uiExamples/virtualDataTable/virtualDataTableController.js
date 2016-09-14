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
	init: function(cmp, event, helper) {
	   var items = helper.generateItems(25);
	   
	   cmp.find("grid").set("v.items", items);
	   cmp.find("grid").sort("id");
	},
	
	handleGridAction: function(cmp, evt, helper) {
	    var index = evt.getParam("index");
	    
	    helper.applyRowClass(cmp, index);
	},
	
	/**
     *  Sort currently just reverses all the items
     */
	sort: function(cmp, evt, helper) {
	    var items = cmp.find("grid").get("v.items");
	    items.reverse();
	    
	    cmp.find("grid").set("v.items", items);
	    cmp.find("grid").sort(evt.getParam("sortBy"));
	},
	
	updateRow: function(cmp, evt, helper) {
	    var grid = cmp.find("grid");
	    
	    grid.updateItem({}, 1);
	},
	
	appendRows: function(cmp, evt, helper) {
	    var grid = cmp.find("grid");
	    var startIndex = grid.get("v.items").length;
	    var newItems = helper.generateItems(25, startIndex);

	    grid.appendItems(newItems);
	},
	
	loadMore: function(cmp, callback, helper) {
	    var grid = cmp.find("grid");
        var startIndex = grid.get("v.items").length;
        var newItems = helper.generateItems(25, startIndex);

        grid.appendItems(newItems);
        
        callback();
	},
	
	replaceHeaders: function(cmp, evt, helper) {
	    var headers = [];
	    
	    for (var i = 0; i < 3; i++) {
	        $A.createComponent("markup://ui:dataTableHeader", {
	            name : "header" + i,
	            label : "Header " + i,
	            sortable: true,
	            resizable: true
	        }, function(header, status) {
	        	if (status === "SUCCESS") {
	        	    headers.push(header);
	    	    }
	        });
	    }
	    
	    cmp.find("grid").set("v.headerColumns", headers);
	},
	
	resizeColumns: function(cmp, evt, helper) {
	    var widths = [150, 200, 400];
	    
	    cmp.find("grid").resizeColumns(widths);
	},
})

