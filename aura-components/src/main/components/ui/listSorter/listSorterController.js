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
		helper.doInit(cmp);
	},
	
	handleDataChange : function(cmp, evt, helper) {
		cmp._dataProvided = true;
		var data = evt.getParam('data');
		if (data) {
        	helper.initItems(cmp, data.columns, data.orderBy);
        	if (cmp._openAfterDataProvided) {
        		cmp._openAfterDataProvided = false;
        		helper.handleOnOpen(cmp);
        	}
		}
	},
	
	onOpen: function(cmp, evt, helper) {
		var dataProvider = cmp.get('v.dataProvider');
		if (dataProvider.length > 0 && (!cmp._dataProvided || cmp._needUpdate)) {
			cmp._needUpdate = false;
			cmp._openAfterDataProvided = true;
			helper.triggerDataProvider(cmp);
		} else {
			helper.handleOnOpen(cmp);
		}
	},
	
	onCancel: function(cmp, evt, helper) {
		helper.handleOnCancel(cmp);
	},
	
	onMenuExpand: function(cmp, evt, helper) {
		var action = cmp.get('v.onOpen');
        if (action) {
        	action.runDeprecated();
        }
	},
	
	onMenuCollapse: function(cmp, evt, helper) {
		var action = cmp.get('v.onCancel');
        if (action) {
        	action.runDeprecated();
        }
	},
	
	onMenuSelected : function(cmp, evt, helper) {
		helper.setSelectedItems(cmp, helper.getSelectedMenuItems(cmp));
		helper.updateSortOrder(cmp);
	},
	
	onApply : function(cmp, evt, helper) {
		helper.handleApply(cmp);
	},
	
	onVisible : function(cmp, evt, helper) {
		var visible = evt.getParam('value');
		if (visible) {
			helper.attachEventHandler(cmp);    
		} else {
			helper.removeEventHandler(cmp);
		}
		helper.setVisible(cmp, visible);		
	},
	
	refresh: function(cmp, evt, helper) {
		cmp._needUpdate = true;
	}
})