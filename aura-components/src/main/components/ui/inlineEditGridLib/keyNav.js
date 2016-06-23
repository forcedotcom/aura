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

function lib(w) { //eslint-disable-line no-unused-vars
    'use strict';
    w || (w = window);

    var KeyboardNavManager = function () {

    };

    KeyboardNavManager.prototype = {

        /**
         * Initialize Key Nav Manager Entry
         * @param cmp
         */
        initKeyboardEntry: function (cmp) {
            this.cmp = cmp;
            this.grid = cmp.find('grid').getElement();
            this.handlersAdded = false;
            this.table = this.grid.querySelector('tbody'); 
        },

        /**
         * Add Event Handlers (click/keyup) for interacting with the grid
         */
        _addEventHandlers: function(){
            this._onKeyupHandler = this._onKeyup.bind(this);
            this.grid.addEventListener("keyup", this._onKeyupHandler, true);

            this._onClickHandler = this._onClick.bind(this);
            this.grid.addEventListener("click", this._onClickHandler, true);

            this._onDoubleClickHandler = this._onDoubleClick.bind(this);
            this.grid.addEventListener("dblclick", this._onDoubleClickHandler, true);

            this.handlersAdded=true;     
        },

        /**
         * Unbind keyboard and click Nav events         
         */
        _removeEventHandlers: function () {
            this.grid.removeEventListener("keyup", this._onKeyupHandler, true);
            this.grid.removeEventListener("click", this._onClickHandler, true);
            this.handlersAdded = false;
        },

        /**
         * Disables the keyboard mode status of the specified cmp
         * @param cmp
         */
        enableKeyboardMode: function(cmp) {
            if (!this.handlersAdded){
                this._addEventHandlers();
            }
            
            cmp.set('v.inKeyboardMode', true);
            this._focusActiveCellInput();
        },

        /**
         * Disables the keyboard mode status of the specified cmp
         * @param cmp         
         */
        disableKeyboardMode: function(cmp) {
            // Just used for testing
            var root = $A.getRoot();
            root.set('v.inKeyboardMode', false);

            this._removeEventHandlers();
            cmp.set('v.inKeyboardMode', false);
            this._blurActiveCellInput();
            this.grid.blur();
        },        

        /**
         * Sets the active cell and active input
         * @param cmp
         */
        initActiveCell: function(){
            
            // Find and set the active cell based on just the dom
            var rows = this.table.rows;
            var cells;
            var activeFound = false;

            for (var row=0;row<rows.length;row++){
                cells = rows[row].cells;
                
                for(var cell=0;cell<cells.length;cell++){
                    if (!this._cellIsDisabled(row,cell)){
                        activeFound=true;
                        break;
                    }
                }

                if (activeFound) {
                    this._setActiveCell(row,cell);
                    this._blurActiveCellInput();
                    break;
                }

            }
        },

        /**
         * Triggers the inline edit on the active cell (if available)
         */
        triggerEditOnActiveCell: function() {
            if(this._activeCellInputExists() && !$A.util.isUndefinedOrNull(this.activeCellInput)){
                this.activeCellInput.click();
            }
        },

        /**
         * Returns true if the cell is set to disabled
         */
        _cellIsDisabled: function(rowIndex, columnIndex){
            // TODO: Find a concrete solution to tell if a cell is disabled
            return this.table.rows[rowIndex].cells[columnIndex].querySelector('.cellContainer.disabled')!==null;
        },

        /**
         * Removes focus from the active cell input
         */
        _blurActiveCellInput: function(){
            if (this._activeCellInputExists()){
                this.activeCell.querySelector('button').blur();
            }
        },

        /**
         * Focuses the active cell input
         */
        _focusActiveCellInput: function(){
            if (this._activeCellInputExists()){
                this.activeCell.querySelector('button').focus();
            }            
        },

        /**
         * Returns true if an active cell has been set
         */
        _activeCellExists: function(){
            return !$A.util.isUndefinedOrNull(this.activeCell);
        },

        /**
         * Returns true if an active cell is set and contains an input element
         */
        _activeCellInputExists: function(){
            return  this._activeCellExists() && !$A.util.isUndefinedOrNull(this.activeCell.querySelector('button'));
        },

        /**
         * Returns true if the target column index is in range of the activeRow
         * @param columnIndex         
         */
        _targetColumnInRange: function(columnIndex){
            return this._targetInRange(columnIndex, 0, this.table.rows[this.activeRowIndex].cells.length); // target, min, max
        },

        /**
         * Returns true if the target row index is in range of the grid row length
         * @param rowIndex - index of the row
         */
        _targetRowInRange: function(rowIndex){
            return this._targetInRange(rowIndex, 0, this.table.rows.length); // target, min, max
        },        

        /**
         * Helper function returns true if target is in range of min and max values
         * @param target - Target value to test in range
         * @param min - Min value in range
         * @param max - Max value in range
         */
        _targetInRange: function(target, min, max){
            return target < max && target >= min;
        },

        /**
         * Set cell at row and column active, active == add class to TD and focus on input
         * @param rowIndex - index of the row
         * @param columnIndex - index of the column
         * @param triggerEdit (optional) - Flag to trigger the inline edit on the activeCell
         */
        _setActiveCell: function (rowIndex, columnIndex, triggerEdit) {
            
            this._blurActiveCell();

            this.activeCell = this.table.rows[rowIndex].cells[columnIndex];
            this.activeRowIndex = rowIndex;
            this.activeColumnIndex = columnIndex;
            this.activeCellInput = (this._activeCellInputExists()) ? this.activeCell.querySelector('button') : null;

            this._focusActiveCell();

            if(!$A.util.isUndefined(triggerEdit) && triggerEdit){
                this.triggerEditOnActiveCell();
            }
        },

        /**
         * Add active class to TD and set focus to input (if exists)
         * @param rowIndex - index of the row
         * @param columnIndex - index of the column 
         */
        _focusActiveCell: function() {
            $A.util.addClass(this.activeCell, "activeCell");
            this._focusActiveCellInput();
        },

        /**
         * Blur activeCell, remove active class, blur activeCell input (if exists)
         * @param rowIndex
         * @param columnIndex         
         */
        _blurActiveCell: function(){
            // TODO: Find a concrete solution to set a cell as active
            $A.util.removeClass(this.table.querySelector(".activeCell"), "activeCell");
            this._blurActiveCellInput();
        },

        /*
         * Helper function to move to next column on the grid
         * @param rowIndex - index of the row
         * @param columnIndex - index of the column
         */
        _gotoNextCell: function(rowIndex, columnIndex){
            var currentRow = $A.util.isUndefined(rowIndex) ? this.activeRowIndex : rowIndex;
            var currentColumn = $A.util.isUndefined(columnIndex) ? this.activeColumnIndex : columnIndex;
            var targetRow = currentRow+1;
            var targetColumn = currentColumn+1;
            
            //currentRow, targetRow, currentColumn, targetColumn, direction
            this._traverseColumns(currentRow, targetRow, currentColumn, targetColumn, 'next'); 
        },

        /*
         * Helper function to move to previous column on the grid
         * @param rowIndex - index of the row
         * @param columnIndex - index of the column        
         */
        _gotoPreviousCell: function(rowIndex, columnIndex) {

            var currentRow = $A.util.isUndefined(rowIndex) ? this.activeRowIndex : rowIndex;
            var currentColumn = $A.util.isUndefined(columnIndex) ? this.activeColumnIndex : columnIndex;
            var targetRow = currentRow-1;
            var targetColumn = currentColumn-1;
            
            //currentRow, targetRow, currentColumn, targetColumn, direction
            this._traverseColumns(currentRow, targetRow, currentColumn, targetColumn, 'previous');    
        },

        /*
         * Helper function to traverse columns on the grid, active class is added to 'active' cells
         * @param currentRow - Index of the current row
         * @param targetRow - Index of the target row
         * @param currentColumn - Index of the current column
         * @param targetolumn - Index of the target column
         * @param direction - direction to traverse (next, previous)
         */
        _traverseColumns: function(currentRow, targetRow, currentColumn, targetColumn, direction){
            
            if (this._targetColumnInRange(targetColumn)){
                if (this._cellIsDisabled(currentRow, targetColumn)){
                    if (direction==='next') {
                        this._gotoNextCell(currentRow, targetColumn);
                    } else {
                        this._gotoPreviousCell(currentRow, targetColumn);
                    }
                } else {
                    this._setActiveCell(currentRow, targetColumn);
                }
            } else if (this._targetRowInRange(targetRow)){
                
                targetColumn = (direction==='next') ? 0 : this.table.rows[currentRow].cells.length-1;
                
                if (this._cellIsDisabled(targetRow, targetColumn)){
                    if (direction==='next') {
                        this._gotoNextCell(targetRow, targetColumn);
                    } else {
                        this._gotoPreviousCell(targetRow, targetColumn);
                    }
                } else {
                    this._setActiveCell(targetRow, targetColumn);
                }

            } else {
                if (direction==='next'){
                    // Hit the end of table
                } else if (direction==='previous'){
                    // Hit the start of table
                }
            }            
        },

        /*
         * Helper function to move to the next row on the grid
         * @param rowIndex - index of the row
         * @param columnIndex - index of the column
         */
        _gotoNextRow: function(rowIndex, columnIndex){

            var currentColumn = $A.util.isUndefined(columnIndex) ? this.activeColumnIndex : columnIndex;
            var currentRow = $A.util.isUndefined(rowIndex) ? this.activeRowIndex : rowIndex;
            var targetRow = currentRow+1;

            this._traverseRows(currentRow, targetRow, currentColumn, 'next');
        },     

        /*
         * Helper function to move to the previous row on the grid
         * @param rowIndex - index of the row
         * @param columnIndex - index of the column      
         */
        _gotoPreviousRow: function(rowIndex, columnIndex){
            
            var currentColumn = $A.util.isUndefined(columnIndex) ? this.activeColumnIndex : columnIndex;
            var currentRow = $A.util.isUndefined(rowIndex) ? this.activeRowIndex : rowIndex;
            var targetRow = currentRow-1;

            this._traverseRows(currentRow, targetRow, currentColumn, 'previous');
        },

        /*
         * Helper function to move to previous/next rows on the grid
         * @param currentRow - Index of the current row
         * @param targetRow - Index of the target row
         * @param currentColumn - Index of the current column
         * @param direction - direction to traverse (next, previous)
         */
        _traverseRows: function(currentRow, targetRow, currentColumn, direction){
            if (this._targetRowInRange(targetRow)){
                if (this._cellIsDisabled(targetRow, currentColumn)){
                    if (direction==='next'){
                        this._gotoNextRow(targetRow, currentColumn);
                    } else if (direction==='previous'){
                        this._gotoPreviousRow(targetRow, currentColumn);
                    }
                } else {
                    this._setActiveCell(targetRow, currentColumn);
                }                        
            } else {
                if (direction==='next'){
                    // Hit the last row
                } else if (direction==='previous'){
                    // Hit the first row
                }
            }
        },

        /*
         * Helper function to move to first enabled cell on the active row
         */
        _gotoFirstEnabledCellInRow: function() {
            var rowIndex = this.activeRowIndex;
            var columnIndex = 0;

            if (this._cellIsDisabled(rowIndex, columnIndex)){
                this._gotoNextCell(rowIndex, columnIndex);
            } else {
                this._setActiveCell(rowIndex, columnIndex);
            }
        },

        /*
         * Helper function to move to last enabled cell on the on the active row
         */        
        _gotoLastEnabledCellInRow: function() {
            var rowIndex = this.activeRowIndex;
            var columnIndex = this.table.rows[rowIndex].cells.length-1;

            if (this._cellIsDisabled(rowIndex, columnIndex)){
                this._gotoNextCell(rowIndex, columnIndex);
            } else {
                this._setActiveCell(rowIndex, columnIndex);
            }
        },

        /**
         * Main event handler for keyboard interactions on the grid
         * @param e - event
         */
        _onKeyup: function (e) {

            // // Prevent default actions/events
            e.preventDefault();
            e.stopPropagation();

            var _context = this;
            var cmp = _context.cmp;
            var _KEY_CODES = _context._KEY_CODES;

            switch (e.keyCode) {

                /**
                 * Basic Exit
                 */
                case _KEY_CODES.esc:
                    _context.disableKeyboardMode(cmp);
                    break;

                /**
                 * Basic Navigation Keys
                 */
                case _KEY_CODES.backspace:
                    _context._gotoPreviousCell();
                    break;

                case _KEY_CODES.tab:
                    if (e.shiftKey) {
                        _context._gotoPreviousCell();
                    } else {
                        _context._gotoNextCell();
                    }
                    break;

                case _KEY_CODES.leftArrow:
                    _context._gotoPreviousCell();
                    break;

                case _KEY_CODES.upArrow:
                    _context._gotoPreviousRow();
                    break;

                case _KEY_CODES.rightArrow:
                    _context._gotoNextCell();
                    break;
                
                case _KEY_CODES.downArrow:
                    _context._gotoNextRow();
                    break;

                /**
                 * Basic Interaction Keys
                 */
                case _KEY_CODES.enter:
                    _context.triggerEditOnActiveCell();
                    break;
                
                case _KEY_CODES.space:
                    _context.triggerEditOnActiveCell();
                    break;                    
                /**
                 * Advanced Navigation Keys
                 */
                case _KEY_CODES.pageUp:
                    // Got to first visible row in the viewport
                    break;
                
                case _KEY_CODES.pageDown:
                    // Got to last visible row in the viewport
                    break;

                case _KEY_CODES.home:
                    _context._gotoFirstEnabledCellInRow();
                    break;

                case _KEY_CODES.end:
                    _context._gotoLastEnabledCellInRow();
                    break;
                          
                /**
                 * Advanced Interaction Keys
                 */
                case _KEY_CODES.s:
                    if (e.ctrlKey) {
                        // trigger save
                    }
                    break;                  
            }
        },

        /**
         * Main event handler for click interactions on the grid
         * @param e
         */
        _onClick: function (e) {
            var cellLocation = this._getClickedCellLocation(e);

            // Check if disabled
            if (!this._cellIsDisabled(cellLocation.row, cellLocation.column)){
                this._setActiveCell(cellLocation.row, cellLocation.column);
            } else {
                // If disabled, don't do anything (?)
            }
        },

        /**
         * Main event handler for click interactions on the grid
         * @param e
         */
        _onDoubleClick: function (e) {

            var cellLocation = this._getClickedCellLocation(e);

            if (!this._cellIsDisabled(cellLocation.row, cellLocation.column)){
                
                // set active AND trigger edit mode
                this._setActiveCell(cellLocation.row, cellLocation.column, true);
            } else {
                // If disabled, don't do anything (?)
            }
        },

        /**
         * Get the location of the clicked cell (row, column)
         * @param e
         * @return {row: x, column: x}
         */
        _getClickedCellLocation: function(e){
            var cell = this._getCellElement(e.target, "TD");
            
            return { 
                row: cell.parentElement.rowIndex-1, 
                column: cell.cellIndex
            };
        },

        /**
         * Gets the closest ancestor of match nodeName of the specified element
         */
        _getCellElement: function(element, nodeName) {

            while (element.nodeName !== nodeName){
                element = element.parentElement;
            }
            
            return element;
        }, 

        /**
         * Helper Object that contains the supported keyboard codes constants for interaction/navigation
         */
        _KEY_CODES: {

            // Entry/Exit
            esc:27,

            // Basic navigation
            backspace:8,
            tab:9,
            leftArrow:37,
            upArrow:38,
            rightArrow:39,
            downArrow:40,

            // Basic Interaction
            enter:13,
            space:32,

            // Advanced navigation
            pageUp:33,
            pageDown:34,
            end:35,
            home:36,

            // Shortcut keys
            shift:16,
            ctrl:17,
            alt:18,
            s: 83
        },

        /**
         * Helper constants to keep track of class names
         */
        ACTIVE_CELL_CLASS: 'activeCell'
    };

    // TODO: Library needs to return a new instance of the object for each grid, rather than one single lib object
    return new KeyboardNavManager();
}