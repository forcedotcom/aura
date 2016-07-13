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
		var items = helper.generateItems();
		
		cmp.set("v.items", items);
		
		// Generate edit layouts:
		cmp.find("grid").set("v.editLayouts", helper.EDIT_LAYOUTS);
		cmp.find("grid").set("v.editPanelConfigs", helper.EDIT_PANEL_CONFIG);
	},
	
	onEdit : function(cmp, evt) {
	    // TODO: onEdit handler
	},

	onKeyboardModeEnabled : function(cmp, evt) {
	    // TODO: onKeyboardModeEnabled handler
	    alert('enabled');
	},	

	onKeyboardModeDisabled : function(cmp, evt) {
	    // TODO: onKeyboardModeDisabled handler
	    alert('disabled');
	},	

	handleEditableChange: function(cmp, evt, helper){
		var editable = cmp.get('v.editable');
		cmp.set('v.editable', !editable);
		
	},

	handleKeyboardModeChange: function(cmp, evt, handler){
		var inKeyboardMode = cmp.get('v.inKeyboardMode');
		cmp.set('v.inKeyboardMode', !inKeyboardMode);

		if (!inKeyboardMode) {
			cmp.find('grid').enableKeyboardMode(cmp);
		}
		else {
			cmp.find('grid').disableKeyboardMode(cmp);
		}
	},

	editActiveCell: function(cmp, evt, helper){
		cmp.find('grid').editActiveCell(cmp);
	}
})// eslint-disable-line semi