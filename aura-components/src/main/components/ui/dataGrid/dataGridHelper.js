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
		
		// References to data needed to render each row's components
		concrete._rowData = [];
		
		// References to column and component template data
		concrete._cellTemplates = [];
		concrete._selectionData = this.createSelectionData();
	},
	
	/**
	 * Initializes columns. 
	 * Action instances are not ready at provide invocation.
	 */
	initializeNewColumns: function (concrete) {
		var columns 				= this.getColumns(concrete),
			handleColumnSortChange 	= concrete.get('c.handleColumnSortChange');

		// TODO cleanup components properly
		concrete._cellTemplates = concrete._cellTemplates.slice(0, columns.length);
		
		$A.util.forEach(columns, function (c, i) {
			var name = c.get('v.name'),
				template = c.get('v.outputComponent');

			concrete._cellTemplates[i] = template;

			if (name) {	
				c.set('v.onsortchange', handleColumnSortChange);
			}

			if (c.isInstanceOf('ui:dataGridSelectionColumn')) {
				concrete._selectionData.selectionColumns.push(c);
				
			}
		});
	},
    
	/**
	 * Create the row data for the initial items in the grid and stores them in
	 * concrete._rowData
	 */
    initializeRowData: function(concrete) {
    	var self = this,
    		items = concrete.get("v.items") || [];
    	
    	concrete._rowData = self.createRowData(concrete, items);
    },
    
	/*
	 * ================
	 * Event Handlers
	 * ================
	 */
	
	// TODO rework
	/**
	 * @param {Component} cmp
	 * @param {Object} params ({index, count, last (Boolean), items, remove (Boolean)}) 
	 * 
	 */
	handleAddRemove: function (cmp, params) {
		var concrete = cmp.getConcreteComponent();

		params.index = params.last ? 'last' : parseInt(params.index, 10);
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
		var concrete = cmp.getConcreteComponent();
		
		// If adding or removing rows, escape.
		if (cmp._addRemove) { 
			return;
		}
		
		// Loaded once is meant to ensure the first data loaded doesn't break.
		// TODO: CLEANUP cmp.isRendered might not be needed anymore
		if (!cmp._hasDataProvider || cmp.isRendered()) {
			// TODO: Why are we performing this check?
			if (!params.index) {
				var newLength = (params.value ? params.value.length : 0);
				// Check for a larger or smaller list.
				// TODO: concrete vs cmp?
				if (cmp._rowData.length !== newLength) {
					this.resize(concrete, newLength);
				} else {
					this.updateValueProvidersFromItems(cmp);
				}
			}
		}
		
		this.selectAll(concrete, false);
	},

	// TODO rework
	handleSortByChange: function (concrete) {
		var columns = this.getColumns(concrete),
			sortBy = concrete.get('v.sortBy'),
			sort = this.parseSortBy(sortBy);	

		if (columns && sort) {
			// Reset all columns.
			$A.util.forEach(columns, function (c) {
				if(c.isInstanceOf("ui:dataGridColumn")) {
					var name = c.get('v.name'),
						direction = sort[name] || '';

					c.set('v.direction', direction);
				}
			});

			this.selectAll(concrete, false);
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
				value = (value === 'true');
			}
			
			// An empty index implies that this is select all. 
			if ($A.util.isUndefinedOrNull(index)) {
				this.selectAll(cmp, value);
			} else {
				this.setSelectedItems(cmp, value, [index]);
			}
		} else if (name && index && globalId) {

			// Use value object incase change handlers are important.
			// For the dataGrid implementation, we provide the internal row object.
			var item = cmp.get('v.items.' + index);
			var actionDelegate = cmp.get("v.actionDelegate")[0];

			if (item && actionDelegate) {
				actionDelegate.getEvent('onaction').setParams({
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
    
    /*
     * ================
     * Selection
     * ================
     */
	
	/**
	 * Initializes the structures to manage dataGrid selection
	 */
	// TODO: See why we need selectionColumns as array
	createSelectionData: function() {
		return {
			selectionColumns : [],
			selectedIndexes : {}
		};
	},

	/** 
	 * Changes the selected status of all items in the grid. 
	 *
	 * @param {Component} cmp
	 * @param {Boolean} value selected status to propagate 
	 */
	// TODO rework
	selectAll: function (cmp, value) {
		this.setSelectedItems(cmp, value);
	},

	/**
	 * Commits selected status changes to the public 'selectedItems' attribute.
	 * Uses an internal set to ensure items only appear once in the array. 
	 * 
	 * @param {Component} cmp
	 * @param {Boolean} value Value 
	 * @param {Array} rows (optional) Rows to apply the value to. A null or undefined value will apply the value to all rows
	 */ 
	// TODO rework, internal set doesn't work in preventing duplicates
	setSelectedItems: function (cmp, value, rows) {
    
        /**
         * @return {Array} The selected row items on the grid.
         */
        function retrieveSelected(selectedCache, rowItems) {
            var selected = [];
            for (var index in selectedCache) {
                if (selectedCache[index]) {
                    selected.push(rowItems[index]);
                }
            }
            return selected;
        }

		var concrete = cmp.getConcreteComponent(),
			rowData = concrete._rowData,
			selectionData = concrete._selectionData;
		
        var i;
		// Apply the value either to the specified rows or to all rows depending on whether the rows parameter was defined
		var rowsLength = rows ? rows.length : rowData.length;
		for (i = 0; i < rowsLength; i++) {
			var j = rows ? rows[i] : i;
			
			rowData[j].vp.set("selected", value);
			selectionData.selectedIndexes[j] = value;
		}

		// Set the selected items to 
		var items = concrete.get("v.items") || [],
			selectedItems = rows ? retrieveSelected(selectionData.selectedIndexes, items) : (value ? items : []);
		cmp.set("v.selectedItems", selectedItems);
		
		var isSelectAll = (selectedItems.length === items.length);
		for (i = 0; i < selectionData.selectionColumns.length; i++) {
			selectionData.selectionColumns[i].set("v.selectAll", isSelectAll);
		}
	},

    
    /*
     * ================
     * Data Methods
     * ================
     */
	
	/**
	 * Updates column attributes that are dependent on the data
	 * in the datagrid.
	 * 
	 * @param {Component} cmp
	 */
	updateColumnAttributes: function(cmp) {
		var concrete = cmp.getConcreteComponent();
		this.updateColumns(concrete, 'disabled', (concrete._rowData.length === 0));
	},
    
    /**
     * Sets up the row data needed to display and work with the specified items
     * 
     * @param {Component} concrete
     * @param {Array} items
     */
    createRowData: function(concrete, items) {
    	var self			= this,
    		rowDataArray	= [],
    		cellTemplates 	= concrete._cellTemplates;
    	
    	for (var rowIndex = 0; rowIndex < items.length; rowIndex++) {
    		var rowData = {};
    		
    		rowData.vp = self.createPassthroughValue(concrete, items[rowIndex], rowIndex);
    		rowData.classes = [];
    		rowData.columnData = [];
    		
    		for (var colIndex = 0; colIndex < cellTemplates.length; colIndex++) {
    			self.createCellData(rowData, colIndex);
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

        function destroyComponent(cmp) {
            cmp.destroy();
        }

		var rowData = concrete._rowData,
			args = [index, remove ? count : 0],
            components,
			columnData;

		var i;

		if (!remove) {
			for (i=0; i<count; i++) {
				args.push(null);
			}
		} else {
			for (i=0; i<count; i++) {
				columnData = rowData[index + i].columnData;
				for (var j=0; j<columnData.length; j++) {
					components = columnData[j].components;
					$A.util.forEach(components, destroyComponent);
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
			items = concrete.get("v.items") || [],
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
			realIndex;

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
			realIndex = concrete._rowData.length; 
		} else {
			realIndex = index;
		}

		// TODO: Do we need this addRemove blocks anymore?
		concrete._addRemove = true;
		
		// TODO: Possible refactor here
		// Set up new row data for the new items and generate the DOM elements
		var newRowData = self.createRowData(concrete, newItems);
		var newRowElements = self.createAndRenderTableRows(concrete, newRowData);
		
		// Cache the new row data in the correct place and insert the DOM elements into the grid
		var tbody = concrete.find('tbody').getElement(),
			items = concrete.get('v.items') || [];
		
		if (index === 'last') {
			if (insertItems) {
				items = items.concat(newItems);
			}
			concrete._rowData = concrete._rowData.concat(newRowData);
			tbody.appendChild(newRowElements);
		} else {
			if (insertItems) {
				Array.prototype.splice.apply(items, [realIndex, 0].concat(newItems));
			}
			Array.prototype.splice.apply(concrete._rowData, [realIndex, 0].concat(newRowData));
			
			var node = tbody.children[realIndex];
			tbody.insertBefore(newRowElements, node);
		}
		
		concrete._addRemove = false;
		concrete.set("v.items", items, true);
		
		if (callback) {
			callback();
		}
	},

	// TODO rename to something more accurate
	resize: function (concrete) {
		var self = this,
			items = concrete.get('v.items') || [],
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
		var items = concrete.get('v.items') || [],
			tbody = concrete.find("tbody").getElement();
		
        for(var i=0;i<items.length;i++){
            var rowData=concrete._rowData[i];
            var rowElement = tbody.rows[i];
            
            rowData.vp.set('item',items[i]);
            rowData.vp.set('index',i);
            rowData.vp.set('disabled', false);
            
            var j;

            for(j=0;j<rowData.classes.length;j++) {
            	$A.util.toggleClass(rowElement, rowData.classes[j], false);
            }
            rowData.classes = [];
            
            for(j=0;j<rowData.columnData.length;j++){
                var columnData=rowData.columnData[j];
                var columns=columnData.components;
                for(var c=0;c<columns.length;c++){
                    columns[c].markDirty("DataGrid item changed.");
                }
            }
        }
	},
	
	/**
	 * Creates column data to manage the components that make up a column
	 * and attaches them to the rowData object at the specified index
	 * 
	 * @param {Object} rowData
	 * @param {Integer} colIndex
	 */
	createCellData: function(rowData, colIndex) {
		rowData.columnData[colIndex] = {
				elementRef : null,
				components : []
		};
		return rowData.columnData[colIndex];
	},
	
	/**
	 * Destroys the column data and components at the specified row and column index
	 * and removes the <td> or <th> element from the specified parent <tr>.
	 * 
	 * @param {Object} rowData
	 * @param {Integer} colIndex
	 * @param {HTMLTableRowElement} parentTR
	 */
	destroyCellData: function(rowData, colIndex, parentTR) {
		var colData = rowData.columnData[colIndex];
		
		if (colData) {
			$A.util.forEach(colData.components, function(cmp) {
				cmp.destroy();
			});
			
			colData.components = [];
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
			doc = document.createDocumentFragment(),
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
	 */
	createAndRenderTableRows: function (concrete, rowDataArray) {
		var self = this,
			rowElements = document.createDocumentFragment(),
			tr, rowData;
		
		for (var rowIndex = 0; rowIndex < rowDataArray.length; rowIndex++) {
			tr = document.createElement('tr');
			rowData = rowDataArray[rowIndex];
			
			self.renderTableRow(concrete, rowData, tr, false);
			
			rowElements.appendChild(tr);
		}
		return rowElements;
	},

	/**
	 * Asynchronously (if has serverside dependencies) create and render the given components. 
	 *
	 * @param {Component} concrete The concrete component
	 * @param {Array.<ComponentDefRef>} cdrs THe defRefs to use as a blueprint
	 * @param {ValueProvider} vp The value provider to resolve against
	 * @param {HTMLElement} element The parent element of the components
	 * @param {Array.<Component>} components An output array for the built components
	 * @param {function (Component)} callback A callback. Not using promises due to high volume.
	 */
	createAndRenderCell: function (concrete, cdrs, vp, element, components, callback) {
        callback = callback || function () {};

        var defs = [];

        for (var cdrIndex = 0; cdrIndex < cdrs.length; cdrIndex++) {
            defs.push(cdrs[cdrIndex].componentDef["descriptor"]);
        }

		$A.getDefinitions(defs, $A.getCallback(function () {
            for (var i = 0; i < cdrs.length; i++) {
                var cdr = cdrs[i];
                var config = {
                    descriptor: cdr.componentDef["descriptor"],
                    localId: cdr["localId"],
                    flavor: cdr["flavor"],
                    attributes: cdr.attributes["values"],
                    valueProvider: vp
                };

                var out = $A.createComponentFromConfig(config);

                components.push(out);

                $A.render(out, element);	// Most of the performance hits here
                $A.afterRender(out);
            }
        }));
	},
	
	/**
	 * Renders the row using the data specified in rowData in the element tr.
	 * Optionally cleans up the component data
	 * 
	 * @param {Component} concrete
	 * @param {Object} rowData
	 * @param {HTMLTableRowElement} tr
	 * @param {Booelan} cleanOldComponents
	 */
	renderTableRow: function(concrete, rowData, tr, cleanOldComponents) {
		
        function destroyComponent(cmp) {
            cmp.destroy();
        }        
        
        var self = this,
			cellTemplates = concrete._cellTemplates,
			colElement, cdrs, largerLength, resizeRowData;
		
		largerLength = (cellTemplates.length > rowData.columnData.length) ? cellTemplates.length : rowData.columnData.length;
		
		var useRowHeaders = concrete.get("v.useRowHeaders");
		for (var colIndex = 0; colIndex < largerLength; colIndex++) {
			var colData = rowData.columnData[colIndex];
			cdrs = cellTemplates[colIndex];
			
			// If no cdrs, then these columns should be destroyed
			// TODO: collapse empty columns
			if (!cdrs && colData) {
				self.destroyCellData(rowData, colIndex, tr);
				resizeRowData = true;
			} else {			
				if (!colData) {
					colData = self.createCellData(rowData, colIndex);
				}
				
				if (!colData.elementRef) {
					if (useRowHeaders && colIndex === 0) {
						colElement = document.createElement('th');
						colElement.setAttribute("scope", "row");
					} else {
						colElement = document.createElement('td');
					}
					tr.appendChild(colElement);
				} else {
					colElement = colData.elementRef;
				}
				
				colData.elementRef = colElement;
				
				if (cleanOldComponents) {
					$A.util.forEach(colData.components, destroyComponent);
					colData.components = [];
				}
				self.createAndRenderCell(concrete, cdrs, rowData.vp, colElement, colData.components);
			}
		}
		
		if (resizeRowData) {
			rowData.columnData = rowData.columnData.slice(0, cellTemplates.length);
		}
	},
	
	/**
	 * Updates and rerenders the rows specified by rowDataArray, making sure to pick
	 * up changes to column metadata
	 */
	rerenderRowsWithNewColumns: function (concrete, rowDataArray) {
		var self = this,
			rowElements = concrete.find("tbody").getElement().rows,
			tr, rowData;

		for (var rowIndex = 0; rowIndex < rowDataArray.length; rowIndex++) {
			tr = rowElements[rowIndex];	
			rowData = rowDataArray[rowIndex];

			self.renderTableRow(concrete, rowData, tr, true);
		}
	},
	
	/*
	 * ================
	 * Utilities
	 * ================
	 */
	/**
	 * Updates the class on a <tr> and keeps track of which classes have been
	 * added on the rowData so that they can be removed or reset by the datagrid
	 */
	updateRowClass: function(cmp, rowData, rowElement, params) {
		var classIndex;
		
		switch (params.classOp.toLowerCase()) {
		case "add":
			$A.util.toggleClass(rowElement, params.className, true);
			classIndex = rowData.classes.indexOf(params.className);
			if (classIndex === -1) {
				rowData.classes.push(params.className);
			}
			break;
		case "remove":
			$A.util.toggleClass(rowElement, params.className, false);
			classIndex = rowData.classes.indexOf(params.className);
			if (classIndex > -1) {
				rowData.classes.splice(classIndex, 1);
			}
			break;
		case "toggle":
			$A.util.toggleClass(rowElement, params.className);
			classIndex = rowData.classes.indexOf(params.className);
			if (classIndex === -1) {
				rowData.classes.push(params.className);
			} else {
				rowData.classes.splice(classIndex, 1);
			}
			break;
		default:
			$A.log("datagrid " + cmp.getGlobalId() + " - updateGridRows handler: unrecognized class operation. Please use \"add\", \"remove\", or \"toggle\".");
		}
	},
	
	updateValueProvider: function(cmp, rowData, attributes) {
		for (var i=0; i<attributes.length; i++) {
			var attr = attributes[i];
			
			if (attr.name === 'disabled') {
				rowData.vp.set("disabled", attr.value);
			}
		}
	},
	
	/**
	 * Helper function to generate the value provider for a row
	 */
	createPassthroughValue: function(concrete, item, rowIndex) {
		var rowContext = {
				item : $A.expressionService.create(null, item),
				selected : $A.expressionService.create(null, false),
				index : $A.expressionService.create(null, rowIndex),
				disabled : $A.expressionService.create(null, false)
		};
		
		return $A.expressionService.createPassthroughValue(rowContext, concrete);
	},
	
	/**
	 * Updates the specified attribute of all the column components with
	 * the specified value
	 * 
	 * @param {Component} 	concrete
	 * @param {String} 		attribute 	The attribute to be updated
	 * @param {Object} 		value 		The value to use for the attribute
	 */
	updateColumns: function(concrete, attribute, value) {
		var columns = this.getColumns(concrete);
		
		for (var i=0;i<columns.length;++i) {
			columns[i].set('v.' + attribute, value);
		}
	},
	
	/**
	 * Properly destroy all components when we unrender
	 */
	destroyTemplates: function(concrete) {
		var rowData = concrete._rowData;
		var destroyCmp = function(cmp) {
			cmp.destroy();
		};
		
		for (var i = 0; i < rowData.length; i++) {
			var columnData = rowData[i].columnData;
			for (var j = 0; j < columnData.length; j++) {
				columnData[j].components.forEach(destroyCmp);			
				columnData[j] = null;
			}
		}
	},
	
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
			batchedCmps = [];
		
		for (var i=0; i<count; i++) {
			var columnData = rowDataArray[rowIndex + i].columnData;
			for (var j=0; j<columnData.length; j++) {
				var components = columnData[j].components;
				if (batch && components) {
					batchedCmps = batchedCmps.concat(components);
				} else {
					$A.util.forEach(components, op);
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
	
	// Components cannot be generated with an empty item shape 
	// TODO: set all the data to nulls or empty objects
	generateNewItemShape: function (concrete) {
    	var items = concrete.get("v.items") || [],
			item = items[0] || {};

		if (item) {
			var template = this.clone(item); // TODO: make empty clone rather than full clone?
			concrete.set("v.itemShape", template);
		}
    }
});
