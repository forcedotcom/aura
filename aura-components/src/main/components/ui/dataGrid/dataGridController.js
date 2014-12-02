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
	init: function (cmp, evt, hlp) {
		var modelItemsKey, items;
		
		// Use for loading logic. 
		cmp._hasDataProvider = cmp._dataProviders && cmp._dataProviders.length > 0;

		// Attempt to extract the initial set of items. 
		if (cmp._hasDataProvider) {
			modelItemsKey = cmp._dataProviders[0].get('v.modelItemsKey');	

			if (modelItemsKey) {
				items = cmp.get("v.dataProvider.0").get("m." + modelItemsKey);
			}
		}

		// Set the initial items and then fire provide against 
		// the dataProvider to configure paging.
		// TODO: move into if statement above
		if (items) {
			cmp.set('v.items', items);	
		}
		
		hlp.initializeCaches(cmp);
		hlp.initializeActionDelegate(cmp);
		hlp.initializeNewColumns(cmp);
		hlp.generateNewItemShape(cmp);
		hlp.initializeRowData(cmp);
		hlp.updateColumnAttributes(cmp);
	},

	handleItemsChange: function (cmp, evt, hlp) {
		hlp.generateNewItemShape(cmp);
		
		if (!cmp.isRendered()) {
			hlp.initializeRowData(cmp);
			hlp.updateColumnAttributes(cmp);
			return;
		}
		
		hlp.handleItemsChange(cmp, evt.getParams());
		hlp.updateColumnAttributes(cmp);

		var concrete = cmp.getConcreteComponent();
		
		if (concrete._sorting) {
			concrete._sorting = false;
		}
	},
	
	handleColumnsChange: function(cmp, evt, helper) {
		var concrete = cmp.getConcreteComponent();
		helper.initializeNewColumns(concrete);
		helper.rerenderRowsWithNewColumns(concrete, concrete._rowData, false);
	},

	handleColumnSortChange: function (cmp, evt, hlp) {
		if (evt) {
			var concrete = cmp.getConcreteComponent();

			concrete._sorting = true;
			cmp.getSuper().set('v.sortBy', evt);
		}
	},

	handleClick: function (cmp, evt, hlp) {
		var name;

		if (evt.target) {
			name = $A.util.getDataAttribute(evt.target, 'action-name'); 

			if (name) {
				hlp.handleAction(cmp, {
					name 		: name,
					index   	: $A.util.getDataAttribute(evt.target, 'item-index'),
					value 		: $A.util.getDataAttribute(evt.target, 'action-value'),
					globalId 	: $A.util.getDataAttribute(evt.target, 'action-global-id')
				});
			}
		}
	},
	
	handleUpdateRowAttrs: function(cmp, evt, hlp) {
		var params = evt.getParams(),
			concrete = cmp.getConcreteComponent(),
			rowData = concrete._rowData[params.index],
			rowElement, rowData, attr, tbody, classIndex;
		
		if (params.className && params.classOp) {
			tbody = cmp.find("tbody").getElement();
			rowElement = tbody.rows[params.index];
			
			hlp.updateRowClass(cmp, rowData, rowElement, params);
		}
		
		if (params.attributes) {
			hlp.updateValueProvider(cmp, rowData, params.attributes);
		}
	}
})