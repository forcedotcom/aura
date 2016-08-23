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
		helper.initializeColumns(cmp);
	},
	
	handleColumnsChange : function(cmp, evt, helper) {
	    helper.initializeColumns(cmp);
	},
	
	handleHeadersChange : function(cmp, evt, helper) {
	    helper.updateHeaderColumns(cmp);
	},

	handleGridAction : function(cmp, evt, helper) {
		var action = evt.getParam("action");

		/**
		 * If the bubbled event is an edit, send an edit panel to the cell
		 */
		if (action === 'edit') {
		    // Prevent inline edit if editable is false   
            if (!cmp.get('v.editable')){
                evt.preventDefault();
                evt.stopPropagation();
                return;
            }
			if (cmp._panelCmp && cmp._panelCmp.isValid()) {
				// there is another panel currently active.
				// kick off the event after it is done.
				cmp._delayedEditEvent = evt;

				// TODO: Setting the activeCell here as a workaround
				// In the onClick, the keyboard is paused and will just return without doing anything. 
				// Researching better ways to handle this
				var payload = evt.getParam("payload");
				helper.getKeyboardManager(cmp).setActiveCell(payload.targetRowIndex, payload.targetCellIndex);
			}
			else {
				helper.handleEditAction(cmp, evt);
			}
		}
	},
	
	handlePanelSubmit : function(cmp, evt, helper) {
	    var items = cmp.get("v.items");
	    var dataVar = cmp.get("v.dataVar");
	    
		var payload = evt.getParam("payload");
		var values = payload.values;
		var index = payload.index;
		var item = items[index];
		var updateMap = payload.updateMap;

		// Retrieving the edited status object of the item (edited = true || false)
		var status = helper.getEditedStatus(item[dataVar], values, updateMap);

		// TODO: Move into preprocessing logic when items are initially set
		item.status = item.status || {};
		
		// Update all record data values and status
		if (values) {
			$A.util.apply(item[dataVar], values, true, true);
		}
		if (status) {
			$A.util.apply(item.status, status, true, true);
		}
		
		// Update only the specified item
		// TODO: Revisit post feature freeze as right now we are doing two updates. - One here and one in the listViewManagerGrid
		helper.updateItem(cmp, item, index);
		cmp._panelCmp.close($A.getCallback(function() {
			helper.fireEditEvent(cmp, payload);
			helper.getKeyboardManager(cmp).resumeKeyboardMode();
		}));
	},
	
	enterKeyboardMode: function(cmp, evt, helper){
		var args = evt.getParam('arguments'),
			editActiveCell = args.editActiveCell,
			clearActiveCell = args.clearActiveCell;
		helper.getKeyboardManager(cmp).enterKeyboardMode(cmp, editActiveCell, clearActiveCell);
		helper.fireKeyboardModeEnterEvent(cmp);
	},
	
	exitKeyboardMode: function(cmp, evt, helper){
		helper.getKeyboardManager(cmp).exitKeyboardMode(cmp);
		helper.fireKeyboardModeExitEvent(cmp);
	},

	handleEnableKeyboardMode: function(cmp, evt, helper){
		helper.handleEnableKeyboardMode(cmp);
	},

	/* Passthrough handlers & methods */
	handleSort : function(cmp, evt, helper) {
		helper.bubbleEvent(cmp, evt, 'onSort');
	},
	
	handleColumnResize : function(cmp, evt, helper) {
		helper.bubbleEvent(cmp, evt, 'onColumnResize');
	},
	
	appendItems : function(cmp, evt) {
		var items = evt.getParam('arguments').items;
		cmp.find("grid").appendItems(items);
	},
	
	resizeColumns : function(cmp, evt) {
		var widths = evt.getParam('arguments').widths;
		cmp.find("grid").resizeColumns(widths);
	},
	
	sort : function(cmp, evt) {
		var sortBy = evt.getParam('arguments').sortBy;
		cmp.find("grid").sort(sortBy);
	},

    updateItem: function (cmp, event, helper) {
        var params = event.getParam('arguments');
        helper.updateItem(cmp, params.item, params.index);
    }
})// eslint-disable-line semi