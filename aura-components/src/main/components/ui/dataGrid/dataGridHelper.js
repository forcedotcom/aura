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
		concrete._columnCount = columns.getLength();
		concrete._columnNames = [];
		concrete._columnOrder = {};
		concrete._columns = {};
		concrete._selectionColumns = [];
		concrete._outputComponents = [];
		concrete._inputComponents = [];
		concrete._row = [];

		columns.each(function (c, i) {
			var name = c.get('v.name'),
				outputComponent = c.get('v.outputComponent'),
				inputComponent = c.get('v.inputComponent');

			concrete._outputComponents[i] = outputComponent;

			if (inputComponent && inputComponent.length > 0) {
				concrete._inputComponents[i] = inputComponent;
			}

			// Match up the correct component to use based on the mode.
			// Copy the referrences to _row for easier access later. 
			if (isEditMode && c.get('v.editable') && inputComponent && inputComponent.length > 0) {
				concrete._row[i] = inputComponent;
			}
			else {
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

	initializeChildren: function (cmp) {
		var concrete = cmp.getConcreteComponent();

		// Children is a 2D array indexed by [columnIndex][rowIndex].
		concrete._children 			= [];

		// Flat references to leaf (cell) components to cleanup later.		
		concrete._allChildren 		= [];

		// References to value providers shared between components of the same row.
		concrete._rowValueProviders = [];
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
    	var itemShape = concrete.getValue('v.itemShape'),
			columns, item, sub, path;

    	if (!itemShape.getValue()) {
			columns = this.getColumns(concrete.getConcreteComponent());
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
						}
						else {
							sub = sub[path[j]] = {};
						}
					}
				}
			}

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

	setChild: function (concrete, columnIndex, rowIndex, key, value) {
		var children = concrete._children, 
			child,
			cols,
			rows;

		if (!children[columnIndex]) {
			children[columnIndex] = [];
		}

		rows = children[columnIndex];

		if (!rows[rowIndex]) {
			rows[rowIndex] = {
				input  : null,
				output : null
			};
		}
		else {
			console.log('split logic please')
		}

		child = rows[rowIndex];
		child[key] = value;
	},

	getChild: function (concrete, columnIndex, rowIndex) {
		return concrete._children[columnIndex][rowIndex];
	},

	/** 
	 * Bulk shift operation for _children.
	 * Use prior to inserting or removing rows.
     *
	 * TODO: take care of memory and component leaks.
	 */
	shiftChildren: function (concrete, rowIndex, count, remove) {
		var children = concrete._children, 
			args = [rowIndex, remove ? count : 0],
			rows, i;

		if (!remove) {
			for (i = 0; i < count; i++) {
				args.push(null);
			}
		}
 
		for (i = 0; i < children.length; i++) {
			rows = children[i];
			rows.splice.apply(rows, args);
		}
	},

	/**
	 * Bulk shift operation for _rowValueProviders.
	 * User prior to inserting or removing rows.
	 */
	shiftRowValueProviders: function (concrete, index, count, remove) {
		var rvp = concrete._rowValueProviders,
			args = [index, remove ? count : 0];

		if (!remove) {
			for (var i = 0; i < count; i++) {
				args.push(null);
			}		
		}

		rvp.splice.apply(rvp, args);
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
		}
		else {
			obj = {};

			for (var i in source) {
				if (typeof source[i] === 'object') {
					obj[i] = this.clone(source[i]);
				}
				else {
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
				value 		: $A.util.isArray(value) || value.toString() === 'ArrayValue' ? value : [value]
			};	
		}	
	},

	handleAddRemove: function (cmp, params) {
		var concrete = cmp.getConcreteComponent(),
			mode = cmp.get('v.mode'),
			index;

		if (params.last) {
			params.index = 'last';
		}
		else {
			params.index = parseInt(params.index);
		}

		params.count = parseInt(params.count);

		if (params.remove) {
			this.removeRows(concrete, params.index, params.count);
		}
		else {
			this.insertRows(concrete, params.index, params.items.getLength(), params.items);
		}
	},	

	/**
	 * TODO: index validation
	 */
	removeRows: function (concrete, index, count) {
		var tbody = concrete.find('tbody').getElement(),
			items = concrete.getValue('v.items'),
			priv_rows = concrete.getValue('v.priv_rows'),
			node;

		// Remove value providers and children which are no longer needed.
		this.shiftRowValueProviders(concrete, index, count, true);
		this.shiftChildren(concrete, index, count, true);

		for (var i = index + count - 1; i >= index; i--) {
			items.remove(index);
			priv_rows.remove(index);
			node = tbody.rows[i];	

			if (node) {
				tbody.removeChild(node);
			}
		} 
	},

	/**
	 * TODO add index validation
	 */
	insertRows: function (concrete, index, count, callback, newItems) {
        if (!concrete.isRendered()) {
            //insertRows might be called before the table is actually rendered to the dom
            //If that's the case, this method will fail.  Instead, we just ignore it
            //and we'll end up calling this method when the dataGrid is rendered anyway
            return;
        }
		var self = this,
			tbody = concrete.find('tbody').getElement(),
			hasSummaryRow = concrete.getValue('v.summaryRow').getLength() > 0,
			items = concrete.getValue('v.items'),
			priv_rows = concrete.getValue('v.priv_rows'),
			resolved = 0,
			realIndex,
			tr,
			node,
			item;

		if (!newItems) {
			newItems = [];

			for (var i = 0; i < count; i++) {
				newItems[i] = $A.expressionService.create(null, concrete.get('v.itemShape'));
			}
		}

		if (index === 'first') {
			realIndex = 0;
		}
		else if (index === 'last') {
			realIndex = priv_rows.getLength(); 
		}
		else {
			realIndex = index;
		}

		concrete._addRemove = true;
		
		for (var i = 0; i < count; i++) {
			item = newItems[i];

			// Create space for new value providers and children.	
			// Not necessary when appending items.
			if (index !== 'last') {
				self.shiftRowValueProviders(concrete, realIndex, count);
				self.shiftChildren(concrete, realIndex, count);
			}

			self.createTableRow(concrete, item, realIndex + i, function (tr) {
				if (index === 'last') {
					// items.push(item);
					priv_rows.push(item);
					tbody.appendChild(tr);
				}
				else {
					items.insert(realIndex, item);
					priv_rows.insert(realIndex, item)

					node = tbody.children[realIndex];
					tbody.insertBefore(tr, node);
				}

				if (++resolved === count) {
					concrete._addRemove = false;

					if (callback) {
						callback();
					}
				}
			});
		}
	},

	resize: function (concrete, length) {
		var self = this,
			items = concrete.getValue('v.items'),
			itemsLength = items.getLength(),
			priv_rows = concrete.getValue('v.priv_rows'),
			priv_rowsLength = priv_rows.getLength(),
			diff, index; 


		if (itemsLength > priv_rowsLength) {
			diff = itemsLength - priv_rowsLength;
			this.insertRows(concrete, 'last', diff, function () {
				self.swap(concrete);
			});
		} 
		else {
			diff = priv_rowsLength - itemsLength;
			index = priv_rowsLength - diff;
			self.removeRows(concrete, index, diff);
			self.swap(concrete);
		}
	},

	swap: function (concrete) {
		var items = concrete.getValue('v.items');

		// This is the only fucking way to get this to work.
		// Touch each row context and fondle it a little.
		items.each(function (value, i) {
			var rvp = concrete._rowValueProviders[i];
			
			rvp.getValue('item').setValue(value.unwrap());
			rvp.getValue('index').setValue(i);
		});

		// Rerender all components. 
		$A.rerender(concrete._allChildren);

		// Set the state back to 'idle'.
		concrete.set('v.state', 'idle');
	},

	/**
	 * 
	 */
	handleModeChange: function (cmp) {
		var self 				= this,
			concrete 			= cmp.getConcreteComponent(),
		 	mode 				= concrete.getValue('v.mode'),
		 	isEditMode 			= mode.getValue().indexOf('EDIT') === 0,
			targetComponents 	= isEditMode ? concrete._inputComponents : concrete._outputComponents,
			itemCount 			= concrete.getValue('v.items').getLength(),
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
					child 			= self.getChild(concrete, columnIndex, rowIndex);
					oldComponents 	= child[isEditMode ? 'output' : 'input'];
					newComponents 	= child[isEditMode ? 'input' : 'output'];

					// Columns do not need to define intputComponents and outputComponents.
					if (!oldComponents) {
						continue;
					}

					if (!newComponents || newComponents.length === 0) {
						newComponents = [];
					}

					// Extract relevant objects.
					el 		= oldComponents[0].getElement();
					parent 	= el.parentNode;
					vp 		= concrete._rowValueProviders[rowIndex];
					cdrs 	= targetComponent;

					$A.unrender(oldComponents);

					// If components have already been created, use them. 
					if (newComponents.length > 0) {
						$A.render(newComponents, parent);
						$A.afterRender(newComponents); 
					}
					else {
						// Create and render the components (async).
						self.createAndRenderComponents(concrete, targetComponent, vp, parent, newComponents);	

						child[isEditMode ? 'input' : 'output'] = newComponents;
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
	handleItemsChange: function (cmp, params) {
		var self = this, 
			length, 
			promise;
		
		// If adding or removing rows, escape.
		if (cmp._addRemove) { 
			return;
		}

		// Loaded once is meant to ensure the first data loaded doesn't break.
		if (!cmp._hasDataProvider || cmp._loadedOnce) {
			if (!params.index) {
				length = params.value.length;

				// Check for a larger or smaller list.
				if (cmp._rowValueProviders.length !== length) {
					this.resize(cmp.getConcreteComponent(), length);
				}
				else {
					this.swap(cmp);
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

	handleSortByChange: function (concrete) {
		var columns = this.getColumns(concrete),
			sortBy = concrete.get('v.sortBy'),
			sort = this.parseSortBy(sortBy);	

		if (columns && sort) {
			// Reset all columns.
			columns.each(function (c) {
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
		var ctxs = cmp._rowValueProviders;

		// Set attribute for 'global' select all.
		cmp.set('v.selectAll', value);

		// Iterate over rows contexts and set 'selected'.
		for (var i = 0; i < ctxs.length; i++) {
			ctxs[i].getValue('selected').setValue(value);
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
			}
			else {
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
	createSummaryRow: function (concrete) {
		var vp = concrete.getAttributeValueProvider(), 
			summaryRow = concrete.getValue('v.summaryRow'), 
			self = this, doc, tr, priv_rows, summaries, colspan;

		// Create map to store by column name. 
		concrete._summaryCells = {};
	
		if (summaryRow.getLength() === 0) {
			return null;
		}

		doc = document.createDocumentFragment(),
		tr = document.createElement('tr'),
	 	priv_rows = concrete.getValue('v.priv_rows'),
		summaries = {},
		colspan = 0;

		doc.appendChild(tr);

		// Build up a mapping of the summary columns and their positions.		
		summaryRow.each(function (cell, i) {
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
					concrete._allChildren.push(summaryCell);

					// Put into map for later awesomeness.
					concrete._summaryCells[column] = summaryCell;
					summaries[co] = summaryCell;
				}, cell, cell.valueProvider || vp);
			}
			else {
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
			}
			else {
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

	// TODO: optimize column iteration
	createTableBody: function (concrete) {
		var self = this,
			priv_rows = concrete.getValue('v.priv_rows'),
			doc = document.createDocumentFragment(),
			components,
			promises = [],
			tr, td, item, val, cdr, cdrs, outputComponent, rowContext, vp, name, n, key, val;

		for (var i = 0; i < priv_rows.getLength(); i++) {
			row = priv_rows.getValue(i);
			
			tr = self.createTableRow(concrete, row, i);
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
	createTableRow: function (concrete, item, index, callback) {
		var self 			 = this, 
			mode 			 = concrete.get('v.mode'),
			isEditMode 		 = mode.indexOf('EDIT') === 0,
			targetComponents = isEditMode ? concrete._inputComponents : concrete._outputComponents,
			childKey 		 = isEditMode ? 'input' : 'output',
			resolved 		 = 0,
			key,
			cdrs,
			tr, 
			td, 
			rowContext, 
			components;

		tr = document.createElement('tr');

		rowContext = {};
		rowContext['item'] = item;
		rowContext['selected'] = $A.expressionService.create(null, false);
		rowContext['index'] = $A.expressionService.create(null, index);
		
		vp = $A.expressionService.createPassthroughValue(rowContext, concrete);
		concrete._rowValueProviders[index] = vp; 

		for (var j = 0; j < concrete._columnCount; j++) {
			td = document.createElement('td');
			components = [];
			key = childKey;

			cdrs = targetComponents[j];

			if (!cdrs) {
				// Columns do not need to define intputComponents and outputComponents.
				// Attempt to fallback if the target is empty (likely for action columns).
				cdrs = concrete._row[j]; 

				// Swap keys to set the correct property on child.
				key = childKey === 'input' ? 'output' : 'input';
			}

			// Create and render the components (async).
			self.createAndRenderComponents(concrete, cdrs, vp, td, components, function () {
				if (callback && (++resolved === concrete._columnCount)) {
					callback(tr);
				}
			});					
			
			// Keep track of created components.
			self.setChild(concrete, j, index, key, components);
			tr.appendChild(td);
		}

		return tr;
	},

	/**
	 * Asynchronously create and render the given components. 
	 *
	 * @param {Compoenent} concrete The concrete componetn
	 * @param {Array.<ComponentDefRef>} cdrs THe defRefs to use as a blueprint
	 * @param {ValueProvider} vp The value provider to resolve against
	 * @param {HTMLElement} element The parent element of the components
	 * @param {Array.<Component>} components An output array for the built components
	 * @param {function (Component)} callback A callback. Not using promises due to high volume.
	 */
	createAndRenderComponents: function (concrete, cdrs, vp, element, components, callback) {
		var resolved = 0,
			cdr;

		for (var k = 0; k < cdrs.length; k++) {
			cdr = cdrs[k];

			$A.componentService.newComponentAsync(this, function (out) {
				components.push(out);
				concrete._allChildren.push(out);

				$A.render(out, element);
				$A.afterRender(out);

				if (callback && (++resolved === cdrs.length)) {
					callback();
				}
			}, cdr, vp);
		}
	}
});
