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
        cmp._initializing = true;

    	helper.verifyInterfaces(cmp);
        helper.initialize(cmp);
        helper.initializeDataModel(cmp);
        
        helper.initializeTemplates(cmp);
        helper.initializeSorting(cmp);
        
        helper.initializeItems(cmp);
        helper.createVirtualRows(cmp); // if we initialize data model, we then create the rows twice
        helper.markDirty(cmp);

        cmp._initializing = false;
        
    },
    handleItemsChange: function (cmp, event, helper) {
        if (cmp._initializing || cmp._appending || cmp._updating) {
            return;
        }

        helper.markClean(cmp, 'v.items');
    	helper.createVirtualRows(cmp);
        helper.markDirty(cmp); // So we go into the rerender
    },
    handleColumnsChange: function (cmp, event, helper) {
        var concreteCmp = cmp.getConcreteComponent(),
            isExtended  = concreteCmp !== cmp;

        if (isExtended && concreteCmp.handleColumnsChange) {
            concreteCmp.handleColumnsChange();
        }

        helper.reset(cmp);
        helper.initializeTemplates(cmp);
        helper.initializeSorting(cmp);

        helper.markClean(cmp, 'v.columns');
        helper.markClean(cmp, 'v.headerColumns');
        helper.createVirtualRows(cmp);
        helper.markDirty(cmp); // So we go into the rerender
    },
    handleDataChange: function(cmp, evt) {
    	cmp.set("v.items", evt.getParam("data"), cmp._initializing);
    },
    handleGridAction: function(cmp, event, helper) {
    	var params = event.getParams();
    	var payload = params.payload;
    	var index = helper._getRowIndex(event.getSource().getElement());
    	
    	switch (params.action) {
    	case "select":
    	    if (index < 0) {
    	        // Invalid selection index
    	        return;
    	    }
    		helper.selectRow(cmp, index, payload.value);
    		payload.selectedItem = cmp.get("v.items")[index];
    		break;
    	}
    	params.index = index;
    	
    	// Prevent old event from firing
    	event.stopPropagation();
    	
    	// Pass new event with updated parameters
    	cmp.getEvent("gridAction").setParams(params).fire();
    },

    updateItem: function (cmp, event, helper) {
        var params  = event.getParam('arguments'),
            index   = params.index,
            item     = params.item;
        
        cmp = helper._getRootComponent(cmp);
        
        if (item) {
            cmp._updating = true;
            helper.updateItem(cmp, item, index);
            cmp._updating = false;
        }
    },     
    
    /*
     * =========================
     * SORTING
     * =========================
     */
    handleSortTrigger: function(cmp, evt, helper) {
    	// TODO: Refactor how dataGridColumn handles triggering a sort
    	var sortBy = evt;
    	
    	if (sortBy) {
    		// Hack to undo UI changes in dataGridColumn
    		helper.updateSortData(cmp, cmp.get('v._sortBy'));
    		
    		var dataModel = cmp.get('v.dataModel')[0];
    		
    		cmp.getEvent('onsort').setParams({
				sortBy 	 : sortBy,
				callback : helper.sortCallback.bind(helper, cmp)
			}).fire();
    		
    		if (dataModel) {
    			dataModel.set('v.sortBy', sortBy);
    			
    			// TODO: determine how to attach callback for when we get data back
    			dataModel.getEvent('provide').fire();
    			// TODO: Assume synchronous provide & success (previous behavior) for now
    			helper.updateSortData(cmp, sortBy);
    		}
    	}
    },

    /**
     * Direct method to call when we want the grid to sort its data.
     * Currently only updates the UI based on the given sortBy
     */
    sort: function(cmp, event, helper) {
    	var sortBy = event.getParam('arguments').sortBy;
    	
    	if (sortBy) {
    		helper.updateSortData(cmp, sortBy);
    	}
    },
    
    /**
     * Direct method to resize all the comments on the grid. Requires that
     * v.enableResizableColumns is true.
     */
    resizeColumns : function(cmp, evt, helper) {
    	var widths = evt.getParam('arguments').widths;
    	
    	if (!helper.getResizer(cmp)) {
    		// We don't have a resizer yet
    		return;
    	}
    	
    	if (!helper.hasResizerHandles(cmp)) {
    		helper.updateColumnResizer(cmp);
    	}
    	
    	helper.resizeColumns(cmp, widths);
    },
    
    /*
	 *  METHODS
	 */
    appendItems: function (cmp, event, helper) {
        var superCmp   = cmp.getSuper(),
            isExtended = superCmp.getType() !== 'aura:component',
            items      = event.getParam('arguments').items;

        if (isExtended) {
            cmp = superCmp;
        }

        if (items && items.length) {
            cmp._appending = true;
            helper.appendVirtualRows(cmp, items);
            cmp._appending = false;
        }
    },
    
    /*
    * DEPRECATED FROM OLD GRID
    */
    handleRefresh: function () {
    }
})// eslint-disable-line semi
