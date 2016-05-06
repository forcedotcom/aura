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
	init : function(cmp) {
		var columns = cmp.get("v.columns");
		var headers = cmp.get("v.headerColumns");
		
		cmp.set("v.stale", {});
		
		cmp.find("grid").set("v.columns", columns);
		cmp.find("grid").set("v.headerColumns", headers);
	},
	
	handleColumnsChange : function(cmp) {
		var newColumns = cmp.get("v.columns");
		cmp.find("grid").set("v.columns", newColumns);
	},
	
	handleHeaderChange : function(cmp) {
		var newHeaders = cmp.get("v.headerColumns");
		cmp.find("grid").set("v.headerColumns", newHeaders);
	},
	
	save : function() {
		// Fire save event
		//console.log("The following objects have been modified: ");
		//console.log(cmp.get("v.stale"));
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
		
		// Save copy old item for reset
		helper.cacheStaleItem(cmp, item, payload.index);
		
		// Update UI
		// TODO: Better status passing from container to cell
		item[payload.key] = payload.value;
		item.status[payload.key] = true;
		
		cmp.set("v.items", items);
		cmp._panelCmp.hide();
	}
})// eslint-disable-line semi