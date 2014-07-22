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
			handleColumnSortChange 	= concrete.get('c.handleColumnSortChange'),
			mode 					= concrete.get('v.mode'),
			isEditMode				= mode.indexOf('EDIT') === 0;

		// TODO cleanup
		concrete._columnCount = columns.length;
		concrete._columnNames = [];
		concrete._columnOrder = {};
		concrete._columns = {};
		concrete._selectionColumns = [];
		concrete._outputComponents = [];
		concrete._inputComponents = [];
		concrete._row = [];

		$A.util.forEach(columns, function (c, i) {
			var name = c.get('v.name'),
				outputComponent = c.get('v.outputComponent'),
				inputComponent = c.get('v.inputComponent');

			concrete._outputComponents[i] = outputComponent;

			if (inputComponent && inputComponent.length > 0) {
				concrete._inputComponents[i] = inputComponent;
			}

			// Match up the correct component to use based on the mode.
			// Copy the references to _row for easier access later. 
			if (isEditMode && c.get('v.editable') && inputComponent && inputComponent.length > 0) {
				concrete._row[i] = inputComponent;
			} else {
				concrete._row[i] = outputComponent; 
			}

			if (name) {	
				concrete._columnNames[i] = name.split('.');			

				concrete._columnOrder[name] = i;
				concrete._columns[name] = c; 

				c.set('v.onsortchange', handleColumnSortChange);
			}

			if (c.isInstanceOf('ui:dataGridSelectionColumn')) {
				concrete._selectionColumns.push(c);
			}
		});
	},

	initializeCaches: function (cmp) {
		var concrete = cmp.getConcreteComponent();

		// Flat references to leaf (cell) components to cleanup later.		
		concrete._allChildrenCmps 	= [];
		
		// Private references to the data items that makes up each row
		concrete._rowItems = [];
		
		// References to data needed to render each row's components
		concrete._rowData = [];
	},

	/**
	 * Attach action delegate for easier access.
	 */ 
	initializeActionDelegate: function (cmp) {
		var actionDelegate = cmp.get('v.actionDelegate');

		if (actionDelegate && actionDelegate.length > 0) {
			cmp._actionDelegate = actionDelegate[0];
		}
	},

	deriveItemShape: function (concrete) {
    	var itemShape = concrete.get('v.itemShape'),
			item, sub, path;

    	if (!itemShape) {
			item = {};

			for (var i = 0; i < concrete._columnNames.length; i++) {
				path = concrete._columnNames[i];
				sub = item;

				if (path && path.length > 0) {
					for (var j = 0; j < path.length; j++) {
						
						// For leaves, place empty string.
						// For objects, place an empty object.
						if (j === path.length - 1) {
							sub[path[j]] = '';	
						} else {
							sub = sub[path[j]] = {};
						}
					}
				}
			}

			concrete.set("v.itemShape", item);
    	}
    },
	
	/**
	 * @return {Array} columns
	 */
	getColumns: function (concrete) {
		var columns = concrete.get('v.columns'),
		    ret = [];

		// Handle force:recordLayout
		// TODO: make adapter? 
		if (columns && columns.length > 0) {
			$A.util.forEach(columns, function (column) {
				var recordLayoutBody; 

				if (column.getDef().getDescriptor().getPrefix() === 'layout') {
					recordLayoutBody = column.getSuper().get('v.body');
					$A.util.forEach(recordLayoutBody, function (col) {
						ret.push(col);
					});
				} else {
					ret.push(column);
				}
			});
		}

		return ret;
	},

	/**
	 * Cache the [input/output] components at each cell to avoid re-creating them later.
	 */
	setCellComponents: function(concrete, rowIndex, columnIndex, key, value) {
		var rowData = concrete._rowData,
			columns, cellData;
		
		if (!rowData[rowIndex]) {
			// TODO index validation
		}
		
		cellData = rowData[rowIndex].columnData[columnIndex];
		
		if (!cellData.components) {
			components = {
					input : null,
					output : null
			}
		}
		
		cellData.components[key] = value;
	},
	
	/**
	 * Returns a cell's specific data.
	 */
	getCellData: function(concrete, rowIndex, columnIndex) {
		return concrete._rowData[rowIndex].columnData[columnIndex];
	},
	
	/**
	 * Shift row data down in preparation for adding new rows or to remove rows from the grid.
	 */
	shiftRowData: function(concrete, index, count, remove) {
		var rowData = concrete._rowData,
			args = [index, remove ? count : 0];
		
		if (!remove) {
			for (var i=0; i<count; i++) {
				args.push(null);
			}
		} else {
			// TODO: clean up references before removing them
		}
		
		rowData.splice.apply(rowData, args);
	},

	/**
	 * Fastest, cleanest deep clone. 
	 * Falls back to provide a simple implementation for IE7. 
 	 * @param {Object} source
	 */
	clone: function (source) {
		var obj;

		if (window['JSON']) {
			return JSON.parse(JSON.stringify(source));
		} else {
			obj = {};

			for (var i in source) {
				if (typeof source[i] === 'object') {
					obj[i] = this.clone(source[i]);
				} else {
					obj[i] = source[i];
				}
			}
		} 
	}, 

	/**
	 * Clones a defRef (primary its attributes) so that a components constructed from 
	 * the same template defRef do not share attribute values after creation.
	 * Purposely not copying 'localId' to avoid confusion.	
     * If the overriden cellTemplate has no attributes, then inject the structure.
	 * 
     * @param {ComponentDefRef} defRef	
     * TODO: rework
	 */
	cloneDefRef: function (defRef) {
		return {
			attributes		: defRef.attributes ? this.clone(defRef.attributes) : { values : {} },
			componentDef	: defRef.componentDef,
			valueProvider	: defRef.valueProvider
		}
	},

	// TODO rework
	// Used in createSummaryRow
	inject: function (cmpDefRef, attribute, value, force) {
		var self = this;

		if (force && !cmpDefRef.attributes) {
			cmpDefRef.attributes = { values: {} };
		}

		// If the value has not been set or force is specified, then inject. 
		if (!cmpDefRef.attributes.values[attribute] || force) {
			cmpDefRef.attributes.values[attribute] = {
				descriptor 	: attribute,
				value 		: $A.util.isArray(value) || value.toString() === 'ArrayValue' ? value : [value]
			};	
		}	
	},

	// TODO rework
	/**
	 * params : {
	 * 		index
	 * 		count
	 * 		last
	 * 		items
	 * 		remove
	 * }
	 */
	handleAddRemove: function (cmp, params) {
		var concrete = cmp.getConcreteComponent(),
			mode = cmp.get('v.mode'),
			index;

		if (params.last) {
			params.index = 'last';
		} else {
			params.index = parseInt(params.index);
		}

		params.count = parseInt(params.count);

		if (params.remove) {
			this.removeRows(concrete, params.index, params.count);
		} else {
			// Insert n rows of but no items?
			this.insertRowsAndUpdateData(concrete, params.index, params.count, params.items, true);
		}
	},	

	/**
	 * TODO: index validation
	 */
	removeRows: function (concrete, index, count) {
		var tbody = concrete.find('tbody').getElement(),
			items = concrete.get("v.items"),
			priv_rows = concrete._rowItems,
			node;

		// Remove value providers and children which are no longer needed.
		this.shiftRowData(concrete, index, count, true);

		for (var i = index + count - 1; i >= index; i--) {
			items.splice(index, 1);
			priv_rows.splice(index, 1);
			node = tbody.rows[i];	

			if (node) {
				tbody.removeChild(node);
			}
		}
		concrete.set("v.items", items, true);
	},

	/**
	 * Inserts rows at the specified index. Inserts the data from newItems or empty
	 * objects if insertItems = true
	 * 
	 * @param {Component} concrete
	 * @param {Number} index zero-based index to begin insertion
	 * @param {Number} count number of rows/items being inserted
	 * @param {Array} newItems (optional) objects to be inserted 
	 * @param {Boolean} insertItems (optional) whether data should be inserted (if items already exist in v.items, we don't want to insert)
	 * @param {Function} callback (optional) callback after all the rows have been inserted
	 * 
	 * TODO add index validation
	 * TODO BUG: Deal with situation where items being inserted already exists in v.items
	 */ 
	insertRowsAndUpdateData: function (concrete, index, count, newItems, insertItems, callback) {
        if (!concrete.isRendered()) {
            //insertRowsAndUpdateData might be called before the table is actually rendered to the dom
            //If that's the case, this method will fail.  Instead, we just ignore it
            //and we'll end up calling this method when the dataGrid is rendered anyway
            return;
        }

		var self = this,
			tbody = concrete.find('tbody').getElement(),
			items = concrete.get('v.items'),
			priv_rows = concrete._rowItems,
			priv_rowsLength = priv_rows ? priv_rows.length : 0,
			resolved = 0,
			realIndex, tr, node, item;

		if (!newItems) {
			newItems = [];

			for (var i = 0; i < count; i++) {
				newItems[i] = concrete.get('v.itemShape');
			}
		}

		if (index === 'first') {
			realIndex = 0;
		} else if (index === 'last') {
			realIndex = priv_rowsLength; 
		} else {
			realIndex = index;
		}

		concrete._addRemove = true;
		
		// Create space for new value providers and children.	
		// Not necessary when appending items.
		if (index !== 'last') {
			self.shiftRowData(concrete, realIndex, count);
		}
		
		for (var i = 0; i < count; i++) {
			item = newItems[i];

			self.createTableRow(concrete, item, realIndex + i, {}, function (tr) {
				if (index === 'last') {
					if (insertItems) {
						items.push(item);
					}
					tbody.appendChild(tr);
				} else {
					if (insertItems) {
						items.splice(realIndex + i, 0, item);
					}

					node = tbody.children[realIndex + i];
					tbody.insertBefore(tr, node);
				}

				if (++resolved === count) {
					concrete._addRemove = false;
					concrete.set("v.items", items, true)
					concrete._rowItems = items;

					if (callback) {
						callback();
					}
				}
			});
		}
	},

	// TODO rework
	resize: function (concrete, length) {
		var self = this,
			items = concrete.get('v.items'),
			itemsLength = items.length,
			priv_rows = concrete._rowItems,
			priv_rowsLength = priv_rows ? priv_rows.length : 0,
			diff, index; 

		if (itemsLength > priv_rowsLength) {
			diff = itemsLength - priv_rowsLength;
			this.insertRowsAndUpdateData(concrete, 'last', diff, null, false, function () {
				self.updateValueProvidersFromItems(concrete);
			});
		} else {
			diff = priv_rowsLength - itemsLength;
			index = priv_rowsLength - diff;
			
			self.removeRows(concrete, index, diff);
			self.updateValueProvidersFromItems(concrete);
		}
	},
	
	updateValueProvidersFromItems: function (concrete) {
		var items = concrete.get('v.items');

		$A.util.forEach(items, function (value, i) {
			var rvp = concrete._rowData[i].vp;
			
			rvp.getValue('item').setValue(value);
			rvp.getValue('index').setValue(i);
		});
		
		// Rerender all components. 
		$A.rerender(concrete._allChildrenCmps);

		// Set the state back to 'idle'.
		// TODO: is this necessary? Not used anywhere else
		//concrete.set('v.state', 'idle');
	},

	/**
	 * TODO rework
	 */
	handleModeChange: function (cmp) {
		var self 				= this,
			concrete 			= cmp.getConcreteComponent(),
		 	mode 				= concrete.get('v.mode'),
		 	isEditMode 			= mode.indexOf('EDIT') === 0,
			targetComponents 	= isEditMode ? concrete._inputComponents : concrete._outputComponents,
			itemCount 			= concrete.get('v.items').length,
			targetComponent, 
			childIndex, 
			child, 
			el, 
			vp, 
			parent,
			oldComponents,
			newComponents, 
			cdrs,
			cdr; 

		for (var columnIndex = 0; columnIndex < concrete._columnCount; columnIndex++) {
			targetComponent = targetComponents[columnIndex];

			if (targetComponent) {
				for (var rowIndex = 0; rowIndex < itemCount; rowIndex++) {

					// Get reference to child.
					cellData 			= self.getCellData(concrete, rowIndex, columnIndex);
					oldComponents 	= cellData.components[isEditMode ? 'output' : 'input'];
					newComponents 	= cellData.components[isEditMode ? 'input' : 'output'];

					// Columns do not need to define intputComponents and outputComponents.
					if (!oldComponents) {
						continue;
					}

					if (!newComponents || newComponents.length === 0) {
						newComponents = [];
					}

					// Extract relevant objects.
					el 		= cellData.elementRef;
					vp		= concrete._rowData[rowIndex].vp;
					cdrs 	= targetComponent;

					$A.unrender(oldComponents);

					// If components have already been created, use them. 
					if (newComponents.length > 0) {
						$A.render(newComponents, el);
						$A.afterRender(newComponents); 
					} else {
						// Create and render the components (async).
						self.createAndRenderCell(concrete, targetComponent, vp, el, newComponents);	

						cellData.components[isEditMode ? 'input' : 'output'] = newComponents;
					}
				}
			}
		}
	},

	/**
	 * Respond to changed on to and within the items array.
	 *
	 * @param {Object} params change event parameters
	 */
	// TODO rework
	handleItemsChange: function (cmp, params) {
		var self = this,
			newLength;
		
		// If adding or removing rows, escape.
		if (cmp._addRemove) { 
			return;
		}
		
		// Loaded once is meant to ensure the first data loaded doesn't break.
		if (!cmp._hasDataProvider || cmp._loadedOnce) {
			if (!params.index) {
				newLength = params.value.length;
				// Check for a larger or smaller list.
				// TODO: concrete vs cmp?
				if (cmp._rowData.length !== newLength) {
					this.resize(cmp.getConcreteComponent(), newLength);
				} else {
					this.updateValueProvidersFromItems(cmp);
				}
			}
		}
	
		if (cmp._sorting) {
			cmp._sorting = false;
		}

		if (!cmp._loadedOnce) {
			cmp._loadedOnce = true;
		}		
	},

	// TODO rework
	handleSortByChange: function (concrete) {
		var columns = this.getColumns(concrete),
			sortBy = concrete.get('v.sortBy'),
			sort = this.parseSortBy(sortBy);	

		if (columns && sort) {
			// Reset all columns.
			$A.util.forEach(columns, function (c) {
				var name = c.get('v.name'),
					direction = sort[name] || '';

				c.set('v.direction', direction);
			});

			// Reset selection columns.
			for (var i = 0; i < concrete._selectionColumns.length; i++) {
				concrete._selectionColumns[i].set('v.selectAll', false);
			}
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
			globalId = cfg.globalId,
			item;

		if (name === 'dataGrid:select') {
			if (typeof value === 'string') {
				value = (value == 'true');
			}
			
			// An empty index implies that this is select all. 
			if ($A.util.isUndefinedOrNull(index)) {
				this.selectAll(cmp, value);
			} else {
				// Don't worry about calling 'selectOne'.
				// hlp.selectOne(cmp, index, value);
				this.changeSelectedItems(cmp, [cmp.get('v.items.' + index)], value);
			}
		} else if (name && index && globalId) {

			// Use value object incase change handlers are important.
			// For the dataGrid implementation, we provide the internal row object.
			item = cmp.getValue('v.items.' + index);

			if (item && cmp._actionDelegate) {
				cmp._actionDelegate.getEvent('onaction').setParams({
					name 		: name,
					index 		: index,
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

	/** 
	 * Changes the selected status of an individual item in the grid. 
	 *
	 * @param {Component} cmp
	 * @param {Number} index zero-based index of the item 
	 * @param {Boolean} value selected status to propagate 
	 */ 
	// TODO rework
	selectOne: function (cmp, index, value) {
		var item = cmp._rowItems[index];

		if (item) {
			item.set('selected', value);
			this.changeSelectedItems(cmp, [item], value);
		}
	},

	/** 
	 * Changes the selected status of all items in the grid. 
	 *
	 * @param {Component} cmp
	 * @param {Boolean} value selected status to propagate 
	 */
	// TODO rework
	selectAll: function (cmp, value) {
		var rowData = cmp._rowData;

		// Set attribute for 'global' select all.
		cmp.set('v.selectAll', value);

		// Iterate over rows contexts and set 'selected'.
		for (var i = 0; i < rowData.length; i++) {
			rowData[i].vp.getValue('selected').setValue(value);
		}

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
	// TODO rework, internal set doesn't work in preventing duplicates
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
				concrete.set('v.selectedItems', items);
			} else {
				setKeys();
				concrete.set('v.selectedItems', replace(value ? items : []));
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
	 * @return {HTMLElement} null if no summary row is defined
	 */
	// TODO rework
	createSummaryRow: function (concrete) {
		var vp = concrete.getAttributeValueProvider(), 
			summaryRow = concrete.get('v.summaryRow'), 
			self = this, doc, tr, priv_rows, summaries, colspan;

		// Create map to store by column name. 
		concrete._summaryCells = {};
	
		if (summaryRow.length === 0) {
			return null;
		}

		doc = document.createDocumentFragment(),
		tr = document.createElement('tr'),
	 	priv_rows = concrete._rowItems,//concrete.getValue('v.priv_rows'),
		summaries = {},
		colspan = 0;

		doc.appendChild(tr);

		// Build up a mapping of the summary columns and their positions.		
		$A.util.forEach(summaryRow, function (cell, i) {
			cell = cell.getValue();

			var column = cell.attributes.values.column.value, 
				co = concrete._columnOrder[column];

			if (!$A.util.isUndefinedOrNull(co)) {
				// If an outputComponent has not been definited, inject one.
				if (cell.attributes && !cell.attributes.values.outputComponent && concrete._columns[column]) {

					// TODO: investigate valueProvider
					var cdr = concrete._columns[column].get('v.outputComponent')[0];
					delete cdr.attributes.valueProvider;
					var clone = self.cloneDefRef(cdr);

					self.inject(cell, 'outputComponent', clone);	
				}

				// Force inject the initial items.
				// With a reference to the value object, changes should propagate.
				self.inject(cell, 'items', priv_rows, true);

				// Create component from defRef. 
				$A.componentService.newComponentAsync(this, function (summaryCell) {
					concrete._allChildrenCmps.push(summaryCell);

					// Put into map for later awesomeness.
					concrete._summaryCells[column] = summaryCell;
					summaries[co] = summaryCell;
				}, cell, cell.valueProvider || vp);
			} else {
				$A.error('Invalid column name: \'' + column + '\'');
			}
		});

		// Fill the missing cells with wide cells.
		for (var i = 0; i < concrete._columnCount; i++) {
			if (summaries[i]) {
				
				if (colspan > 0) {
					pushFiller();
					colspan = 0;
				}

				$A.render(summaries[i], tr);
				$A.afterRender(summaries[i]);
			} else {
				++colspan;
			}

			if (colspan && i === concrete._columnCount - 1) {
				pushFiller();
			}
		}

		function pushFiller() {
			var td = document.createElement('td');
			td.setAttribute('colspan', colspan);
			tr.appendChild(td);
		}

		return doc;
	},

	/**
	 * Rendering functions to help generate the table's DOM
	 */
	// TODO: optimize column iteration
	createTableBody: function (concrete) {
		var self = this,
			items = concrete._rowItems,
			doc = document.createDocumentFragment(),
			initialRenderCount = concrete.get("v.initialRenderCount"),
			initialLength = initialRenderCount < items.length ? initialRenderCount : items.length,
			batchRenderCount = concrete.get("v.batchRenderCount"),
			components,
			tr, row, asyncParams;

		concrete._rowData = [];
		asyncParams = {
				renderAsync : false,
				batchCount : batchRenderCount < items.length ? batchRenderCount : items.length
		}
		
		// TODO: Make this whole section better
		for (var i = 0; i < items.length; i++) {
			asyncParams.renderAsync = !(i < initialLength);
			tr = self.createTableRow(concrete, items[i], i, asyncParams);
			doc.appendChild(tr);
		}

		return doc;
	},
	
	/**
	 * Creates a table row.
	 *
	 * @param {Component} concrete 
	 * @param {Object} item 
	 * @param {Integer} index Where the item should exist. If an item already exists, perform insert and shift logic.
	 */
	createTableRow: function (concrete, item, rowIndex, asyncParams, callback) {
		var self 			 = this, 
			//mode 			 = concrete.get('v.mode'),
			isEditMode 		 = false, //mode.indexOf('EDIT') === 0,
			targetComponents = isEditMode ? concrete._inputComponents : concrete._outputComponents,
			childKey 		 = isEditMode ? 'input' : 'output',
			rowData = {},
			resolved = 0,
			asyncParamsExist = !$A.util.isUndefinedOrNull(asyncParams),
			key, cdrs, tr, td, components, cellCmps;
		
		concrete._rowData[rowIndex] = rowData;
		
		tr = document.createElement('tr');
		rowData.vp = self.createPassthroughValue(concrete, item, rowIndex);
		rowData.columnData = [];
		
		// Generate row's cells
		for (var colIndex = 0; colIndex < concrete._columnCount; colIndex++) {
			td = document.createElement('td');
			cellCmps = {};
			components = [];
			key = childKey;

			cdrs = targetComponents[colIndex];

			if (!cdrs) {
				// Columns do not need to define inputComponents and outputComponents.
				// Attempt to fallback if the target is empty (likely for action columns).
				cdrs = concrete._row[colIndex];

				// Swap keys to set the correct property on child.
				key = childKey === 'input' ? 'output' : 'input';
			}
			
			cellCmps[key] = components
			
			rowData.columnData[colIndex] = {
					elementRef : td,
					components : cellCmps,
					cellKey : key
			};
			
			// Keep track of created components in cache
			self.setCellComponents(concrete, rowIndex, colIndex, key, components);
			tr.appendChild(td);
			
			// Create and render the components synchronously
			if (asyncParamsExist && !asyncParams.renderAsync) {
				self.createAndRenderCell(concrete, cdrs, rowData.vp, td, components, function () {
					if (callback && (++resolved === concrete._columnCount)) {
						callback(tr);
					}
				});
			}
		}
		
		if (asyncParamsExist && asyncParams.renderAsync) {
			// Only render the rows async if we're at the end of a batch
			if (self.shouldBatchRender(asyncParams.batchCount, rowIndex)) {
				self.renderTableRowsAsync(concrete, rowIndex, asyncParams.batchCount, callback);
			}
		}
		
		return tr;
	},

	/**
	 * Asynchronously (if has serverside dependencies) create and render the given components. 
	 *
	 * @param {Component} concrete The concrete componetn
	 * @param {Array.<ComponentDefRef>} cdrs THe defRefs to use as a blueprint
	 * @param {ValueProvider} vp The value provider to resolve against
	 * @param {HTMLElement} element The parent element of the components
	 * @param {Array.<Component>} components An output array for the built components
	 * @param {function (Component)} callback A callback. Not using promises due to high volume.
	 */
	createAndRenderCell: function (concrete, cdrs, vp, element, components, callback) {
		var resolved = 0,
			cdr, path, output, span;

		for (var cdrIndex = 0; cdrIndex < cdrs.length; cdrIndex++) {
			cdr = cdrs[cdrIndex];

			// Fallback for simple text to use <span> and save on component creation
			/*if (cdr.attributes.values.value && cdr.attributes.values.value.value.path) {
				path = cdr.attributes.values.value.value.path;
				output = vp.getValue("item").unwrap();
				for (var i = 1; i < path.length; i++) {
					output = output[path[i]];
				}
				span = document.createElement("span");
				span.innerText = output;
				element.appendChild(span);
			} else {*/
				$A.componentService.newComponentAsync(this, function (out) {
					components.push(out);
					concrete._allChildrenCmps.push(out);
	
					$A.render(out, element);	// Most of the performance hits here
					$A.afterRender(out);
	
					if (callback && (++resolved === cdrs.length)) {
						callback();
					}
				}, cdr, vp);
			//}
		}
	},
	
	renderTableRowsAsync : function(concrete, rowIndex, rowCount, callback) {
		var self = this;
		window.setTimeout(function() {
			for (var i = rowCount-1; i >= 0; i--) {
				self.renderTableRow(concrete, rowIndex - i, callback);
			}
		});
	},
	
	renderTableRow : function(concrete, rowIndex, callback) {
		var self = this,
			rowData = concrete._rowData[rowIndex],
			isEditMode = false,
			targetComponents = isEditMode ? concrete._inputComponents : concrete._outputComponents,
			resolved = 0,
			colData, td, components, key, cdrs;
		
		for (var colIndex = 0; colIndex < concrete._columnCount; colIndex++) {
			colData = rowData.columnData[colIndex];
			
			td = colData.elementRef;
			key = colData.cellKey;
			components = colData.components[key];
			
			cdrs = targetComponents[key];
			
			if (!cdrs) {
				cdrs = concrete._row[colIndex];
			}
			
			self.createAndRenderCell(concrete, cdrs, rowData.vp, td, components, function () {
				if (callback && (++resolved === concrete._columnCount)) {
					callback(tr);
				}
			});
		}
	},
	
	shouldBatchRender : function(rowCount, rowIndex) {
		return (rowIndex + 1) % rowCount == 0;
	},
	
	/**
	 * Helper function to generate the value provider for a row
	 */
	createPassthroughValue: function(concrete, item, rowIndex) {
		var rowContext = {
				item : $A.expressionService.create(null, item),
				selected : $A.expressionService.create(null, false),
				index : $A.expressionService.create(null, rowIndex)
		};
		
		return $A.expressionService.createPassthroughValue(rowContext, concrete);
	}
});
