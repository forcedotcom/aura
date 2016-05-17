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
		var columns = cmp.get("v.columns");
		var headers = cmp.get("v.headerColumns");
		var itemVar = cmp.get("v.itemVar");
		
		for (var i = 0; i < columns.length; i++) {
			helper.initializeCellStates(columns[i], itemVar);
		}
		
		cmp.set("v.editedItems", {});
		
		cmp.find("grid").set("v.columns", columns);
		cmp.find("grid").set("v.headerColumns", headers);
	},
	
	/* TODO: save and cancel footer is being moved out of this component */
	save : function() {
		// Fire save event
		// TODO: Implement
	},
	
	cancel : function(cmp, evt, helper) {
		helper.reset(cmp);
	},
	
	handleGridAction : function(cmp, evt, helper) {
		var action = evt.getParam("action");
		
		/**
		 * If the bubbled event is an edit, send an edit panel to the cell
		 */
		if (action === 'edit') {
			var index = evt.getParam("index");
			var payload = evt.getParam("payload");
			
			var editLayouts = cmp.get("v.editLayouts") || {};
			var editLayout = editLayouts[payload.name];
			
			if (editLayout) {
				// TODO: Need check that editLayout follows a certain interface so we can attach the appropriate
				// attributes and events.
				var attributes = editLayout.attributes || {};
				
				attributes.value = payload.value;
				attributes.updateOn = 'input';
				
				$A.createComponent(editLayout.componentDef.descriptor, attributes, function (inputComponent) {
					var panelBodyAttributes = {
							index : index,
							key : payload.name,
							inputComponent : inputComponent
					};
					
					helper.displayEditPanel(cmp, panelBodyAttributes, payload.targetElement);
				});
			}
		}
	},
	
	handlePanelSubmit : function(cmp, evt, helper) {
		var payload = evt.getParam("payload");
		var items = cmp.get("v.items");
		var item = items[payload.index];
		
		// TODO: Move into preprocessing logic when items are initially set
		item.status = item.status || {};
		
		// Save copy old item for reset
		helper.cacheEditedItem(cmp, item, payload.index);
		
		// Update UI
		// TODO: Better status passing from container to cell
		item.data[payload.key] = payload.value;
		if (!item.status[payload.key]) {
			item.status[payload.key] = {};
		}
		item.status[payload.key].edited = true;

		// Sample status update
		if ($A.util.isUndefinedOrNull(payload.value)) {
			item.status[payload.key].hasErrors = true;
		}
		
		cmp.set("v.items", items);
		cmp._panelCmp.hide();
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
	}
})// eslint-disable-line semi