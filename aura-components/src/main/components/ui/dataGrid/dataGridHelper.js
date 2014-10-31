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
	
	/*
	 * ================
	 * Initialization Methods
	 * ================
	 */
	
	/**
	 * Initializes the different caches we use to store row and column
	 * data for faster retrieval
	 */
	initializeCaches: function (cmp) {
		var concrete = cmp.getConcreteComponent();

		// Flat references to leaf (cell) components to cleanup later.		
		concrete._allChildrenCmps 	= [];
		
		// References to data needed to render each row's components
		concrete._rowData = [];
		
		// References to column and component template data
		concrete._columnNames = [];
		concrete._columnOrder = {};
		concrete._columns = {};
		concrete._selectionColumns = [];
		concrete._outputComponents = [];
		concrete._inputComponents = [];
		concrete._row = [];
	},
	
	/**
	 * Initializes columns. 
	 * Action instances are not ready at provide invocation.
	 */
	initializeNewColumns: function (concrete) {
		var columns 				= this.getColumns(concrete),
			handleColumnSortChange 	= concrete.get('c.handleColumnSortChange'),
			mode 					= concrete.get('v.mode'),
			isEditMode				= mode.indexOf('EDIT') === 0,
			headerRow				= concrete.find("headerRow").getElement();

		// TODO cleanup components properly
		concrete._columnCount = columns.length;
		concrete._outputComponents = concrete._outputComponents.slice(0, columns.length);
		concrete._inputComponents = concrete._inputComponents.slice(0, columns.length);

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

	/**
	 * Attach action delegate for easier access.
	 */ 
	initializeActionDelegate: function (cmp) {
		var actionDelegate = cmp.get('v.actionDelegate');

		if (actionDelegate && actionDelegate.length > 0) {
			cmp._actionDelegate = actionDelegate[0];
		}
	},
    
	/**
	 * Create the row data for the initial items in the grid and stores them in
	 * concrete._rowData
	 */
    initializeRowData: function(concrete) {
    	var self				= this,
    		items = concrete.get("v.items"),
    		isEditMode			= false; //mode.indexOf('EDIT') === 0; not yet fully supported
    	
    	concrete._rowData = self.createRowData(concrete, items, isEditMode);
    },
    
	/*
	 * ================
	 * Event Handlers
	 * ================
	 */
	
	// TODO rework
	/**
	 * 
	 * 
	 * @param {Component} cmp
	 * @param {Object} params ({index, count, last (Boolean), items, remove (Boolean)}) 
	 * 
	 */
	handleAddRemove: function (cmp, params) {
		var concrete = cmp.getConcreteComponent(),
			mode = cmp.get('v.mode'),
			index;

		params.index = params.last ? 'last' : parseInt(params.index);
		if (params.last) {
			params.index = 'last';
		} else {
			params.index = parseInt(params.index, 10);
		}

		params.count = parseInt(params.count, 10);

		if (params.remove) {
			this.removeRows(concrete, params.index, params.count);
		} else {
			// Insert n rows of but no items?
			this.insertRowsAndUpdateData(concrete, params.index, params.count, params.items, true);
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
			item = cmp.get('v.items.' + index);

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
	
    /*
     * ================
     * Get/Set Methods
     * ================
     */
	
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
    
    /*
     * ================
     * Selection
     * ================
     */
	
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
			rowData[i].vp.set('selected', value);
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
    
    /*
     * ================
     * Data Methods
     * ================
     */
    
    /**
     * Sets up the row data needed to display and work with the specified items
     * 
     * @param {Component} concrete
     * @param {Array} items
     * @param {Boolean} isEditMode
     */
    createRowData: function(concrete, items, isEditMode) {
    	var self				= this,
    		rowDataArray		= [],
    		targetComponents 	= isEditMode ? concrete._inputComponents : concrete._outputComponents,
        	childKey			= isEditMode ? 'input' : 'output',
        	cellCmps, components, key;
    	
    	for (var rowIndex = 0; rowIndex < items.length; rowIndex++) {
    		rowData = {};
    		
    		rowData.vp = self.createPassthroughValue(concrete, items[rowIndex], rowIndex);
    		rowData.columnData = [];
    		
    		for (var colIndex = 0; colIndex < concrete._columnCount; colIndex++) {
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
    					elementRef 	: null,
    					components 	: cellCmps,
    					cellKey		: key
    			};
    		}
    		rowDataArray[rowIndex] = rowData;
    	}
    	return rowDataArray;
    },
    
    /**
	 * Shift row data down in preparation for adding new rows or to remove rows from the grid.
	 */
	// TODO: revisit this function
	shiftRowData: function(concrete, index, count, remove) {
		var rowData = concrete._rowData,
			args = [index, remove ? count : 0],
			columnData, cmpsToUnrender = [];
		
		if (!remove) {
			for (var i=0; i<count; i++) {
				args.push(null);
			}
		} else {
			for (var i=0; i<count; i++) {	
				columnData = rowData[index + i].columnData;
				for (var j=0; j<columnData.length; j++) {
					components = columnData[j].components;
					if (components['output']) {
						$A.util.forEach(components['output'], function(cmp) {
							cmp.destroy(true);
						});
					}
					
					if (components['input']) {
						$A.util.forEach(components['input'], function(cmp) {
							cmp.destroy(true);
						});
					}
				}
			}
		}
		rowData.splice.apply(rowData, args);
	},

	/**
	 * TODO: index validation
	 * TODO: works for removing just the rowData without the items, but questionably
	 */
	removeRows: function (concrete, index, count) {
		var tbody = concrete.find('tbody').getElement(),
			items = concrete.get("v.items"),
			node;

		// Remove value providers and children which are no longer needed.
		// TODO: refactor this function
		this.shiftRowData(concrete, index, count, true);

		for (var i = index + count - 1; i >= index; i--) {
			items.splice(index, 1);
			node = tbody.rows[i];	

			if (node) {
				tbody.removeChild(node);
			}
		}
		concrete._rowItems = items;
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
	 * TODO could use a more thorough refactor
	 */ 
	insertRowsAndUpdateData: function (concrete, index, count, newItems, insertItems, callback) {
        if (!concrete.isRendered()) {
            //insertRowsAndUpdateData might be called before the table is actually rendered to the dom
            //If that's the case, this method will fail.  Instead, we just ignore it
            //and we'll end up calling this method when the dataGrid is rendered anyway
            return;
        }

		var self = this,
			isEditMode = concrete.get("v.mode").indexOf('EDIT') === 0,
			tbody = concrete.find('tbody').getElement(),
			items = concrete.get('v.items'),
			rowDataLength = concrete._rowData.length,
			resolved = 0, realIndex, tr, node, item, newRowData, newRowElements;

		// Create a skeleton for the new data if none are provided
		if (!newItems) {
			newItems = [];

			for (var i = 0; i < count; i++) {
				newItems[i] = concrete.get('v.itemShape');
			}
		}

		// Convert possible index enums to actual indexes
		if (index === 'first') {
			realIndex = 0;
		} else if (index === 'last') {
			realIndex = rowDataLength; 
		} else {
			realIndex = index;
		}

		concrete._addRemove = true;
		
		// Set up new row data for the new items and generate the DOM elements
		newRowData = self.createRowData(concrete, newItems, isEditMode);
		newRowElements = self.createAndRenderTableRows(concrete, newRowData, isEditMode);
		
		// Cache the new row data in the correct place and insert the DOM elements into the grid
		if (index === 'last') {
			if (insertItems) {
				items = items.concat(newItems);
			}
			concrete._rowData = concrete._rowData.concat(newRowData);
			tbody.appendChild(newRowElements);
			//self.appendRowData(concrete, newRowData);
		} else {
			if (insertItems) {
				Array.prototype.splice.apply(items, [realIndex, 0].concat(newItems));
			}
			Array.prototype.splice.apply(concrete._rowData, [realIndex, 0].concat(newRowData));
			node = tbody.children[realIndex];
			tbody.insertBefore(newRowElements, node);
			//self.insertRowData(concrete, newRowData, realIndex);
		}
		
		concrete._addRemove = false;
		concrete.set("v.items", items, true);
		concrete._rowItems = items;
		
		if (callback) {
			callback();
		}
	},

	// TODO rename to something more accurate
	resize: function (concrete, length) {
		var self = this,
			items = concrete.get('v.items'),
			itemsLength = items.length,
			rowDataLength = concrete._rowData.length,
			diff, index; 

		if (itemsLength > rowDataLength) {
			diff = itemsLength - rowDataLength;
			this.insertRowsAndUpdateData(concrete, 'last', diff, null, false, function () {
				self.updateValueProvidersFromItems(concrete);
			});
		} else {
			diff = rowDataLength - itemsLength;
			index = rowDataLength - diff;
			
			self.removeRows(concrete, index, diff);
			self.updateValueProvidersFromItems(concrete);
		}
	},
	
	//TODO MERGE: Check merge
	updateValueProvidersFromItems: function (concrete) {
		var items = concrete.get('v.items');
        for(var i=0;i<items.length;i++){
            var rowData=concrete._rowData[i];
            rowData.vp.set('item',items[i]);
            rowData.vp.set('index',i);
            for(var j=0;j<rowData.columnData.length;j++){
                var columnData=rowData.columnData[j];
                var columns=columnData.components[columnData.cellKey];
                for(var c=0;c<columns.length;c++){
                    columns[c].markDirty("DataGrid item changed.");
                }
            }
        }

		// Set the state back to 'idle'.
		// TODO: is this necessary? Not used anywhere else
		//concrete.set('v.state', 'idle');
	},
	
	/**
	 * Creates column data to manage the components that make up a column
	 * and attaches them to the rowData object at the specified index
	 * 
	 * @param {Object} rowData
	 * @param {Integer} colIndex
	 * @param {Boolean} isEditMode
	 */
	createCellData: function(rowData, colIndex, isEditMode) {
		var cellCmps = {},
			ioKey = isEditMode ? 'input' : 'output';
		
		cellCmps[ioKey] = [];
		rowData.columnData[colIndex] = {
				elementRef : null,
				components : cellCmps,
				cellKey	   : ioKey
		}
		return rowData.columnData[colIndex];
	},
	
	/**
	 * Destroys the column data and components at the specified row and column index
	 * and removes the <td> element from the specified parent <tr>.
	 * 
	 * @param {Object} rowData
	 * @param {Integer} colIndex
	 * @param {HTMLTableRowElement} parentTR
	 */
	destroyCellData: function(rowData, colIndex, parentTR) {
		var colData = rowData.columnData[colIndex],
			key;
		
		if (colData) {
			key = colData.cellKey;
			$A.util.forEach(colData.components[key], function(cmp) {
				cmp.destroy();
			});
			
			colData.components[key] = [];
			parentTR.removeChild(colData.elementRef);
			
			rowData.columnData[colIndex] = {};
		}

	},
    
    /*
     * ================
     * DOM Rendering
     * ================
     */

	/**
	 * Rendering functions to help generate the table's DOM
	 */
	// TODO: optimize column iteration
	createTableBody: function (concrete) {
		var self = this,
			items = concrete.get("v.items"),
			doc = document.createDocumentFragment(),
			tr, asyncParams, rowElements;

		rowElements = self.createAndRenderTableRows(concrete, concrete._rowData, false);
		doc.appendChild(rowElements);
		
		return doc;
	},
	
	/**
	 * Creates table row DOM elements for the specified data and returns the row elements
	 * as a document fragment
	 * 
	 * @param {Component} concrete
	 * @param {Array} rowDataArray
	 * @param {Boolean} isEditMode
	 */
	createAndRenderTableRows: function (concrete, rowDataArray, isEditMode) {
		var self = this,
			rowElements = document.createDocumentFragment(),
			targetComponents = isEditMode ? concrete._inputComponents : concrete._outputComponents,
			tr, td, colData, components, cdrs, rowData;
		
		for (var rowIndex = 0; rowIndex < rowDataArray.length; rowIndex++) {
			tr = document.createElement('tr');
			rowData = rowDataArray[rowIndex];
			
			self.renderTableRow(concrete, rowData, tr, isEditMode, false);
			
			rowElements.appendChild(tr);
		}
		return rowElements;
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
			$A.componentService.newComponentAsync(this, function (out) {
				components.push(out);

				$A.render(out, element);	// Most of the performance hits here
				$A.afterRender(out);

				if (callback && (++resolved === cdrs.length)) {
					callback();
				}
			}, cdr, vp);
		}
	},
	
	/**
	 * Updates and rerenders the rows specified by rowDataArray, making sure to pick
	 * up changes to column metadata
	 */
	rerenderRowsWithNewColumns: function (concrete, rowDataArray, isEditMode) {
		var self = this,
			targetComponents = isEditMode ? concrete._inputComponents : concrete._outputComponents,
			rowElements = concrete.find("tbody").getElement().rows,
			tr, td, colData, components, cdrs, rowData;
		
		for (var rowIndex = 0; rowIndex < rowDataArray.length; rowIndex++) {
			tr = rowElements[rowIndex];	
			rowData = rowDataArray[rowIndex];
			
			self.renderTableRow(concrete, rowData, tr, isEditMode, true);
		}
	},
	
	/**
	 * Renders the row using the data specified in rowData in the element tr.
	 * Optionally cleans up the component data
	 * 
	 * @param {Component} concrete
	 * @param {Object} rowData
	 * @param {HTMLTableRowElement} tr
	 * @param {Boolean} isEditMode
	 * @param {Booelan} cleanOldComponents
	 */
	renderTableRow: function(concrete, rowData, tr, isEditMode, cleanOldComponents) {
		var self = this,
			targetComponents = isEditMode ? concrete._inputComponents : concrete._outputComponents,
			colData, td, key, components, cdrs, colIndex, largerLength, resizeRowData;
		
		largerLength = (targetComponents.length > rowData.columnData.length) ? targetComponents.length : rowData.columnData.length;
		
		for (colIndex = 0; colIndex < largerLength; colIndex++) {
			colData = rowData.columnData[colIndex];
			cdrs = targetComponents[colIndex];
			
			// If no cdrs, then these columns should be destroyed
			// TODO: collapse empty columns
			if (!cdrs && colData) {
				self.destroyColumnData(rowData, colIndex, tr);
				resizeRowData = true;
			} else {			
				if (!colData) {
					colData = self.createCellData(rowData, colIndex, isEditMode);
				}
				
				if (!colData.elementRef) {
					td = document.createElement('td');
					tr.appendChild(td);
				} else {
					td = colData.elementRef;
				}
				
				colData.elementRef = td;
				key = colData.cellKey;
				
				if (cleanOldComponents) {
					$A.util.forEach(colData.components[key], function(cmp) {
						cmp.destroy();
					});
					colData.components[key] = [];
				}
				
				components = colData.components[key];
				
				self.createAndRenderCell(concrete, cdrs, rowData.vp, td, components);
			}
		}
		
		if (resizeRowData) {
			rowData.columnData = rowData.columnData.slice(0, targetComponents.length);
		}
	},
	
	/*
	 * ================
	 * Utilities
	 * ================
	 */
	/**
	 * Maps the given operation onto all the components in the grid
	 * 
	 * @param {Component} concrete
	 * @param {Boolean} batch Specifies whether the operation should be done on an array of components (true) or on each individual component (false)
	 * @param {Function} op A function to be applied onto the components in the data grid. If [batch] is true, this should take an array of components as its parameter. Otherwise, it should take a single component.
	 */
	componentMap: function(concrete, batch, op) {
		var rowDataLength = concrete._rowData.length;
		
		this.selectiveMap(concrete, 0, rowDataLength, batch, op);
	},
	
	/**
	 * Maps the given operation onto the components in the grid, starting from
	 * the specified row index for [count] rows
	 * 
	 * @param {Component} concrete
	 * @param {Integer} rowIndex
	 * @param {Integer} count
	 * @param {Boolean} batch Specifies whether the operation should be done on an array of components (true) or on each individual component (false)
	 * @param {Function} op A function to be applied onto the components in the data grid. If [batch] is true, this should take an array of components as its parameter. Otherwise, it should take a single component.
	 */
	selectiveMap: function (concrete, rowIndex, count, batch, op) {
		var rowDataArray = concrete._rowData,
			batchedCmps = [], components;
		
		for (var i=0; i<count; i++) {
			columnData = rowDataArray[rowIndex + i].columnData;
			for (var j=0; j<columnData.length; j++) {
				components = columnData[j].components
				if (batch) {
					if (components.input) {
						batchedCmps = batchedCmps.concat(components.input);
					}
					if (components.output) {
						batchedCmps = batchedCmps.concat(components.output);
					}
				} else {
					$A.util.forEach(components.input, op);
					$A.util.forEach(components.input, op);
				}
			}
		}
		
		if (batch) {
			op(batchedCmps);
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
	 * Helper function to generate the value provider for a row
	 */
	createPassthroughValue: function(concrete, item, rowIndex) {
		var rowContext = {
				item : $A.expressionService.create(null, item),
				selected : $A.expressionService.create(null, false),
				index : $A.expressionService.create(null, rowIndex)
		};
		
		return $A.expressionService.createPassthroughValue(rowContext, concrete);
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
				value 		: $A.util.isArray(value) ? value : [value]
			};	
		}	
	},
	
	// Components cannot be generated with an empty item shape 
	// TODO: set all the data to nulls or empty objects
	generateNewItemShape: function (concrete) {
    	var itemShape = concrete.get('v.itemShape'),
			item = concrete.get("v.items")[0],
			template,
			sub, path;

		if (item) {
			template = this.clone(item); // TODO: make empty clone rather than full clone?
			concrete.set("v.itemShape", template);
		}

		concrete.set("v.itemShape", item);
    },
    
    /*
     * ================
     * Not-fully-supported Functionality
     * ================
     */
	
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
			var column = cell.get("v.column"),
				co = concrete._columnOrder[column];

			if (!$A.util.isUndefinedOrNull(co)) {
				// If an outputComponent has not been definited, inject one.
				if (!cell.get("v.outputComponent") && concrete._columns[column]) {

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
	}
});
