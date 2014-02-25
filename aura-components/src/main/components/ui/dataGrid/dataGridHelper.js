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
	/**
	 * Initializes columns. Only call during init or later. 
	 * Action instances are not ready at provide invokation.
	 */
	initializeColumns: function (concrete) {
		var columns 				= this.getColumns(concrete),
			handleColumnSortChange 	= concrete.get('c.handleColumnSortChange');

		concrete._columnCount = columns.getLength();
		concrete._columnOrder = {};
		concrete._columns = {};

		columns.each(function (c, i) {
			var name = c.get('v.name');
			
			concrete._columnOrder[name] = i;
			concrete._columns[name] = c; 

			c.setValue('v.onsortchange', handleColumnSortChange);
		});
	},

	/**
	 * This function is mess, but it does most of the work.
	 * 
	 * I've done a lot of things in my life that I'm not proud of... and the things I AM proud of, are disgusting.
	 * Good luck, may the odds be ever in your favor.
	 */ 
	constructTable: function (cmp) {
		// TODO: fetch all of this more efficiently
		var hlp = this,
			concrete = cmp.getConcreteComponent(),
		 	mode = cmp.get('v.mode'),
			isEdit = mode.indexOf('EDIT') === 0,
			isViewOnly = !isEdit && mode === 'VIEW_ONLY',
			columns = hlp.getColumns(cmp),
			sortable = cmp.get('v.sortable'),
			inputComponents = [],
			outputComponents = [],
			rowTemplate = concrete.get('v.rowTemplate'),
			cellTemplate = concrete.get('v.cellTemplate'),
			cellTemplateDefRef = (cellTemplate && cellTemplate.length == 1) ? cellTemplate[0] : null,
			actionDelegate = cmp.get('v.actionDelegate'),
			cells = []; 

		// Do not continue rendering if cellTemplate is not provided.
		if (!cellTemplateDefRef) {
			$A.error('DataGrid requires a cellTemplate.');
		}

		// Attach action delegate for easier access.
		if (actionDelegate && actionDelegate.length > 0) {
			concrete._actionDelegate = actionDelegate[0];
		}

		columns.each(function (c) {
			var outputComponent = c.get('v.outputComponent'),
				inputComponent = c.get('v.inputComponent'),
				cell;

			// If no in or out component was defined, then error.
			// TODO: allow for data type resolution.
			if (!inputComponent && !outputComponent) {
				$A.error('Need to resolve this column type');
			}

			cell = hlp.createCell(cellTemplateDefRef);

			// Extract output CDR.
			if (outputComponent && outputComponent.length > 0) {
				hlp.inject(cell, 'outputComponent', outputComponent);
			}

			// Extract input CDR.
			if (!isViewOnly && inputComponent && inputComponent.length > 0) {
				hlp.inject(cell, 'inputComponent', inputComponent);
			}

			cells.push(cell);

			// Propagate sortable to columns.
			// TODO: create extract into interface
			if (!sortable && c.isInstanceOf('ui:dataGridColumn')) {
				c.setValue('v.sortable', false);
			}

			// Wire 'selectAll' attribute into selection column.
			if (c.isInstanceOf('ui:dataGridSelectionColumn')) {

				// Handle changes to 'selectAll' and propagate them.
				cmp.getValue('v.selectAll').addHandler({
					eventName : 'change',
					globale   : cmp.getGlobalId(),
					method    : function (evt) {
						if (cmp.isValid() && c.isValid()) {
							c.setValue('v.selectAll', evt.getParam('value').getValue());
						}
					}
				});
			}
		});
		
		// Create a row context. These values can be accessed by anything 
		// that get rendered within the row template. 
		var rowContext = {};
		rowContext['onitemchange'] = this.createActionReference(concrete, 'onitemchange');
		
		rowTemplate[0].valueProvider = $A.expressionService.createPassthroughValue(rowContext, rowTemplate[0].valueProvider);;

		if (cells.length > 0) {
			hlp.inject(rowTemplate[0], 'cells', cells);
		}
		
		hlp.constructRows(concrete);		
	},

	/**
	 * Creates wrapper objects around the data and places them in priv_items.
	 *
	 * @param {Component} super cmp or concrete?
	 */
	constructRows: function (cmp) {
		var items = cmp.get('v.items'),
			mode = cmp.get('v.mode'),
			rowSwap = cmp.getValue('v.priv_rowSwap'),
			concrete = cmp.getConcreteComponent(),
			rows = [];
		
		if (items) {

			// Unwrap items entirely due to high change handler volume.
			for (var i = 0; i < items.length; i++) {
				rows.push({
					item 		  : items[i],
					selected	  : false,
					mode 		  : mode,
					rowSwap 	  : rowSwap
				});
			}

			concrete.setValue('v.priv_rows', rows);
		}
	},

	/**
	 * Swaps item within each row with the corresponding item. 
	 * Huge performance gain over recreating each row component. 
	 */
	swapRows: function (cmp) {
		var concrete = cmp.getConcreteComponent(),
			items = cmp.get('v.items'),	
			rowSwap = concrete.getValue('v.priv_rowSwap'), 
			priv_rows = concrete.getValue('v.priv_rows'), 
			rows, row;

		// Notify rows of mass row swap; prevent unnecessary events.
		rowSwap.setValue(true);

		// Notify rows of mass row swap.
		rowSwap.setValue(true);

		priv_rows.each(function (row, i) {
			row.getValue('item').setValue(items[i]);
		});

		rowSwap.setValue(false);
	},

	swapSummaryRow: function (cmp, column) {
		var concrete = cmp.getConcreteComponent(),
			items = cmp.get('v.items'),
			summaryRow;

		if (column) {
			summaryRow = concrete._summaryCells[column];

			if (summaryRow) {
				summaryRow.setValue('v.items', items);
			}
			else {
				$A.warning('Could not find summary row for column \'' + column + '\'');
			}
		}
		else {
			for (var k in concrete._summaryCells) {
				summaryRow = concrete._summaryCells[k];
				summaryRow.setValue('v.items', items);
			}
		}
	},

	swapMode: function (cmp) {
		var concrete = cmp.getConcreteComponent(),
			mode = cmp.get('v.mode'),	
			priv_rows = concrete.getValue('v.priv_rows');

		priv_rows.each(function (row, i) {
			row.getValue('mode').setValue(mode);
		});
	},

	constructSummaryRow: function (cmp) {
		var self = this,
			concrete = cmp.getConcreteComponent(),
			globalId = cmp.getGlobalId(),
			items = cmp.get('v.items'), // unwap array to avoid change handler from propagating; bizarreness
			summaryRow = cmp.getValue('v.summaryRow'),
			priv_summaryRow = [],
			summaries = {},
			colspan = 0;

		// Create map to store by column name. 
		concrete._summaryCells = {};
	
		if (summaryRow.getLength() === 0) {
			return;
		}

		// Build up a mapping of the summary columns and their positions.		
		summaryRow.each(function (cell, i) {
			cell = cell.getValue();

			var column = cell.attributes.values.column.value, 
				co = cmp._columnOrder[column];

			if (co) {
				// If an outputComponent has not been definited, inject one.
				if (cell.attributes && !cell.attributes.values.outputComponent && concrete._columns[column]) {
					self.inject(cell, 'outputComponent', self.cloneDefRef(concrete._columns[column].get('v.outputComponent')[0]));	
				}

				// Inject the initial items.
				self.inject(cell, 'items', items);

				// Create component from defRef. 
				$A.componentService.newComponentAsync(this, function (summaryCell) {
					
					// Put into map for later awesomeness.
					concrete._summaryCells[column] = summaryCell;
					summaries[co] = summaryCell;
				}, cell);
			}
			else {
				$A.error('Invalid column name: \'' + column + '\'');
			}
		});

		// Fill the missing cells with wide cells.
		for (var i = 0; i < cmp._columnCount; i++) {
			if (summaries[i]) {
				
				if (colspan > 0) {
					pushFiller();
					colspan = 0;
				}

				priv_summaryRow.push(summaries[i]);
			}
			else {
				++colspan;
			}

			if (colspan && i === cmp._columnCount - 1) {
				pushFiller();
			}
		}

		cmp.setValue('v.priv_summaryRow', priv_summaryRow);

		function pushFiller() {
			var tmp = $A.componentService.newComponentDeprecated({ 
				componentDef: 'markup://aura:html', 
				attributes: {
					values: {
						tag: 'td'
					}
				}
			});
			
			tmp.getValue('v.HTMLAttributes').put('colspan', colspan);
			priv_summaryRow.push(tmp);
		}
	},

	createCell: function (cellTemplateDefRef, bodyDefRef) {
		var cell = this.cloneDefRef(cellTemplateDefRef);
		
		if (bodyDefRef) {
			// TODO remove for 'inject'
			this.injectBody(cell, bodyDefRef);
		}

		return cell;
	},

	/**
	 * Fastest, cleanest deep clone. 
 	 * @param {Object} source
	 */
	clone: function (source) {
		return JSON.parse(JSON.stringify(source));
	}, 

	/**
	 * Clones a defRef (primary its attributes) so that a components constructed from 
	 * the same template defRef do not share attribute values after creation.
	 * Purposely not copying 'localId' to avoid confusion.	
     * If the overriden cellTemplate has no attributes, then inject the structure.
	 * 
     * @param {ComponentDefRef} defRef	
	 */
	cloneDefRef: function (defRef) {
		return {
			attributes		: defRef.attributes ? this.clone(defRef.attributes) : { values : {} },
			componentDef	: defRef.componentDef,
			valueProvider	: defRef.valueProvider
		}
	},

	inject: function (cmpDefRef, attribute, value, force) {
		var self = this;

		if (force && !cmpDefRef.attributes) {
			cmpDefRef.attributes = { values: {} };
		}

		// If the value has not been set or force is specified, then inject. 
		if (!cmpDefRef.attributes.values[attribute] || force) {
			cmpDefRef.attributes.values[attribute] = {
				descriptor 	: attribute,
				value 		: $A.util.isArray(value) ? value : [value]
			};	
		}	
	},

	// TODO: clean this up. keep only for the recursive body traversal/injection.
	injectBody: function (cmpDefRef, bodyValue, force) {
		var self = this;
		
		if (force && !cmpDefRef.attributes) {
			cmpDefRef.attributes = { values: {} };
		}

		if (cmpDefRef.componentDef && cmpDefRef.componentDef.descriptor === 'markup://ui:dataGridRow') {
			cmpDefRef.attributes.values.inputComponents = {
				descriptor 	: 'inputComponents',
				value		: $A.util.isArray(bodyValue) ? bodyValue : [bodyValue]
			}
		}
		else {
			// TODO: will this cause memory leaks?
			if (force || !cmpDefRef.attributes.values.body) {
				cmpDefRef.attributes.values.body = {
					descriptor	: 'body',
					value		: $A.util.isArray(bodyValue) ? bodyValue : [bodyValue]
				};		
			}
			else if (cmpDefRef.attributes.values.body.value[0].componentDef === 'markup://aura:html') {
				// Do NOT allow for injection into components which render a body.
				// TODO: should have interface?
				// TODO: is just grabbing the first def ref sufficient?
				self.injectBody(cmpDefRef.attributes.values.body.value[0], bodyValue);	
			}
			else {
				console.log('defRef already has body!');
			}	
		}	
	},

	handleAddRemove: function (cmp, params) {
		var concrete = cmp.getConcreteComponent(),
			priv_rows = concrete.getValue('v.priv_rows'),
			mode = cmp.get('v.mode');

		if (params.remove) {
			priv_rows.remove(params.index);
		}
		else {
			// TODO: use correct event param values
			priv_rows.insert(priv_rows.getLength(), {
				item 		: concrete.get('v.itemShape'),
				selected 	: false,
				mode 	 	: mode
			});
		}
	},	

	/**
	 * Respond to changed on to and within the items array.
	 *
	 * @param {Object} params change event parameters
	 */
	handleItemsChange: function (cmp, params) {

		// Loaded once is meant to ensure the first data loaded doesn't break.
		if (!cmp._hasDataProvider || cmp._loadedOnce) {
			if (!params.index) {
				// Replace the existing objects within the rows
				// only if the replace was on the entire set. 
				this.swapRows(cmp);
				this.swapSummaryRow(cmp);

				// Set the state back to 'idle'.
				cmp.setValue('v.state', 'idle'); 
			}
			else if (cmp._summaryCells[params.index]) {
				// Update the summary row
				this.swapSummaryRow(cmp, params.index);
			}
		}
	
		if (cmp._sorting) {
			cmp._sorting = false;
		}

		if (!cmp._loadedOnce) {
			cmp._loadedOnce = true;
		}		
	},

	handleModeChange: function (cmp) {
		// Notify rows of mode change.
		this.swapMode(cmp);
	},	

	handleSortByChange: function (concrete) {
		var columns = this.getColumns(concrete),
			sortBy = concrete.get('v.sortBy'),
			sort = this.parseSortBy(sortBy);	

		if (columns && sort) {
			columns.each(function (c) {
				var name = c.get('v.name'),
					direction = sort[name] || '';

				c.setValue('v.direction', direction);
			});
		}

		// Refresh to force fetch from data provider (if available).
		concrete.getEvent('refresh').fire();
	},
	/**
	 * @param {Component} cmp
	 * @param {Object} cfg { name: String, index: number, value: String, globalId: String }
	 */
	handleAction: function (cmp, cfg) {
		var name = cfg.name, 
			index = cfg.index, 
			value = cfg.value, 
			globalId = cfg.globalId;

		if (name === 'dataGrid:select') {
			if (typeof value === 'string') {
				value = (value == 'true');
			}

			// An empty index implies that this is select all. 
			if ($A.util.isUndefinedOrNull(index)) {
				this.selectAll(cmp, value);
			}
			else {
				// Don't worry about calling 'selectOne'.
				// hlp.selectOne(cmp, index, value);
				this.changeSelectedItems(cmp, [cmp.get('v.items.' + index)], value);
			}
		}
		else if (name && index && globalId) {
			// Use value object incase change handlers are important.
			// For the dataGrid implementation, we provide the internal row object.
			item = cmp.getValue('v.priv_rows.' + index);

			if (item && cmp._actionDelegate) {
				cmp._actionDelegate.getEvent('onaction').setParams({
					name 		: name,
					item 		: item,
					value 		: value, 
					component 	: $A.getCmp(globalId)
				}).fire();
			}
		}
	},

	/**
	 * @param {String} sortBy
	 */
	parseSortBy: function (sortBy) {
		var columns = {}, 
			tokens, token, name,
			desc = false;

		if (sortBy) {
			tokens = sortBy.split(','); 
			
			for (var i = 0; i < tokens.length; i++) {
				token = tokens[i];

				if (token) {
					desc = (token[0] === '-');
					name = desc ? token.slice(1, token.length) : token;

					columns[name] = desc ? 'descending' : 'ascending';
				}
			}	
		}

		return columns;
	},

	deriveItemShape: function (concrete) {
	    	var itemShape = concrete.getValue('v.itemShape'),
    		columns, item;

    	if (!itemShape.getValue()) {
			columns = this.getColumns(concrete.getConcreteComponent());
			item = {};

			columns.each(function (column) {
				var name = column.get('v.name'); 
				item[name] = null;
			});

			itemShape.setValue(item);
    	}
    },

	/**
	 * @return {ArrayValue} columns
	 */
	getColumns: function (concrete) {
		var columns = concrete.getValue('v.columns'),
		    ret = [];

		// Handle force:recordLayout
		// TODO: make adapater? 
		if (columns && columns.getLength() > 0) {
			columns.each(function (column) {
				var recordLayoutBody; 

				if (column.getDef().getDescriptor().getPrefix() === 'layout') {
					recordLayoutBody = column.getSuper().getValue('v.priv_entityDetail');
					recordLayoutBody.each(function (col) {
						ret.push(col);
					});
				}
				else {
					ret.push(column);
				}
			});
		}

		return $A.expressionService.create(null, ret);
	},

	/** 
	 * Changes the selected status of an individual item in the grid. 
	 *
	 * @param {Component} cmp
	 * @param {Number} index zero-based index of the item 
	 * @param {Boolean} value selected status to propagate 
	 */ 
	selectOne: function (cmp, index, value) {
		var item = cmp.getValue('v.priv_rows.' + index);

		if (item) {
			item.getValue('selected').setValue(value);
			this.changeSelectedItems(cmp, [item], value);
		}
	},

	/** 
	 * Changes the selected status of all items in the grid. 
	 *
	 * @param {Component} cmp
	 * @param {Boolean} value selected status to propagate 
	 */
	selectAll: function (cmp, value) {
		cmp.setValue('v.selectAll', value);

		// Iterate over rows and set 'row.selected'.
		cmp.getValue('v.priv_rows').each(function (row) {
			row.getValue('selected').setValue(value);
		});

		this.changeSelectedItems(cmp, cmp.get('v.items'), value);
	},

	/**
	 * Commits selected status changes to the public 'selectedItems' attribute.
	 * Uses an internal set to ensure items only appear once in the array. 
	 * 
	 * @param {Component} cmp
	 * @param {Array} items objects to modify
	 * @param {Boolean} value are these items selected
	 */ 
	changeSelectedItems: function (cmp, items, value) {
		var concrete = cmp.getConcreteComponent();

		// Guarantee correct value object is updated.
		if (items) {
			
			// Create a set for the selected items.
			if (!concrete._selected) {
				concrete._selected = {
					items: 	items,
					keys: 	{}
				};

				setKeys();
				concrete.setValue('v.selectedItems', items);
			}
			else {
				setKeys();
				concrete.setValue('v.selectedItems', replace(value ? items : []));
			}
		}

		/**
		 * Replaces the existing set of selected items.
		 */
		function replace(newArray) {
			var keys = concrete._selected.keys,
				selected = concrete._selected.items;

			for (var i = 0; i < selected.length; i++)	{
				if (keys[selected[i].id]) {
					newArray.push(selected[i]);
				}
			}

			concrete._selected.items = newArray;
			return newArray;
		}

		/**
		 * Set the keys in the existing set.
		 */ 
		function setKeys() {
			for (var i = 0; i < items.length; i++) {
				concrete._selected.keys[items[i].id] = value;
			}
		}
	},

	/**
	 * @param {Component} cmp component which owns the action
	 * @param {String} name name of the action 
	 */
	createActionReference: function (cmp, name) {
		return $A.expressionService.create(cmp, cmp.getDef().getControllerDef().getActionDef(name));
	}
});
