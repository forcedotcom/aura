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
        
        $A.util.forEach(columns, function forEachColumn(c, i) {
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
    handleItemsChange: function (cmp) {
        var concrete = cmp.getConcreteComponent();
        
        // If adding or removing rows, escape.
        if (cmp._addRemove) { 
            return;
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
            $A.util.forEach(columns, function forEachColumn(c) {
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
            $A.util.forEach(columns, function forEachColumn(column) {
                var recordLayoutBody; 

                if (column.getDef().getDescriptor().getPrefix() === 'layout') {
                    recordLayoutBody = column.getSuper().get('v.body');
                    $A.util.forEach(recordLayoutBody, function addColumn(col) {
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
        var concrete = cmp.getConcreteComponent();
        var	rowData = concrete.find("tableRow");
        var	selectionData = concrete._selectionData;
        var rowsLength = rows ? rows.length : rowData.length;
        for (var i = 0; i < rowsLength; i++) {
            var j = rows ? rows[i] : i;
            rowData[j].set("v.selected", value);
            selectionData.selectedIndexes[j] = value;
        }

        // Set the selected items to 
        var items = concrete.get("v.items") || [];
        var selectedItems = rows ? retrieveSelected(selectionData.selectedIndexes, items) : (value ? items : []);
        cmp.set("v.selectedItems", selectedItems);
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
        var items = concrete.get("v.items");
        this.updateColumns(concrete, 'disabled', (items.length === 0));
    },

    /**
     * TODO: index validation
     * TODO: works for removing just the rowData without the items, but questionably
     */
    removeRows: function (concrete, index, count) {
        var	items = concrete.get("v.items") || [];
        items.splice(index, count);
        concrete.set("v.items", items);
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

        var realIndex;
        var items = concrete.get('v.items') || [];

        // Convert possible index enums to actual indexes
        if (index === 'first') {
            realIndex = 0;
        } else if (index === 'last') {
            realIndex = items.length; 
        } else {
            realIndex = index;
        }
        if (index === 'last') {
            if (insertItems) {
                items = items.concat(newItems);
            }
        } else {
            if (insertItems) {
                Array.prototype.splice.apply(items, [realIndex, 0].concat(newItems));
            }
        }
        
        concrete._addRemove = false;

        //Make sure change handlers are not triggered
        concrete.set("v.items", items);		
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
        } else {
            diff = rowDataLength - itemsLength;
            index = rowDataLength - diff;
            
            self.removeRows(concrete, index, diff);
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
            $A.util.forEach(colData.components, function destroyComponent(cmp) {
                cmp.destroy();
            });
            
            colData.components = [];
            parentTR.removeChild(colData.elementRef);

            rowData.columnData[colIndex] = {};
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
    updateRowClass: function(cmp, rowData, params) {
        var classes = rowData.get("v.classes");
        var index = classes.indexOf(params.className);

        switch (params.classOp.toLowerCase()) {
        case "add":
            classes.push(params.className);
            break;
        case "remove":
            if (index > -1) {
                classes.splice(index, 1);
            }
            break;
        case "toggle":
            if (index === -1) {
                classes.push(params.className);
            } else {
                classes.splice(index, 1);
            }
            break;
        default:
            $A.log("datagrid " + cmp.getGlobalId() + " - updateGridRows handler: unrecognized class operation. Please use \"add\", \"remove\", or \"toggle\".");
        }
        rowData.set("v.classes", classes);
    },
    
    updateValueProvider: function(cmp, rowData, attributes) {
        for (var i=0; i<attributes.length; i++) {
            var attr = attributes[i];
            if (attr.name === 'disabled') {
                rowData.set("v.disabled", attr.value);
            }
        }
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
    }
});
