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
/*eslint no-loop-func: 0*/
function lib(w){ //eslint-disable-line no-unused-vars
	'use strict';
    w || (w = window);

    /**
     * Default configuration for the resizer
     */
    var DEFAULT_CONFIG = {
    		minWidth : 20,
    		maxWidth : 1000,
    		step : 10,

    		indicatorClasses : '',
    		contentSpanClasses : 'content',
    		headerSpanClasses : 'header-wrapper',

    		assistiveLabel : 'Column Width'
    };

    var VENDORS  = ['webkit', 'Moz', 'ms'];
    var COLUMN_DIVIDER_CLASS = 'column-divider';

    var ColumnResizer = function(table, config) {
    	this._initializeConfig(config);
    	this._initializeResizer(table);
    	this._initializeColumns(table);
    };

    ColumnResizer.prototype = {

    	DIVIDER_RELAYOUT_DELAY: 150,
        _setDividerHeight: function(indicator) {
            var that = this;
            return new Promise($A.getCallback(function(resolve) {
                setTimeout(resolve, that.DIVIDER_RELAYOUT_DELAY);
            })).then($A.getCallback(function(){
                var viewportHeight = window.innerHeight;
                var divider = indicator.querySelector('.' + COLUMN_DIVIDER_CLASS);
                if (indicator.parentNode) {
                    var indicatorLoc = indicator.parentNode.getBoundingClientRect().top;
                    divider.style.height = (viewportHeight - indicatorLoc)  + 'px';
				}
            }));
        },

    	/**
    	 * Use the default configuration wherever the user hasn't specified a value
    	 *
    	 * @method _initializeConfig
    	 * @param config {Object} Configuration object
    	 * @private
    	 */
		_initializeConfig : function(config) {
			config = config || {};

	    	this.config = {
	    			container : config.container,
	    			initialWidths : config.initialWidths,

	    			step : config.step || DEFAULT_CONFIG.step,
	    			minWidth : config.minWidth || DEFAULT_CONFIG.minWidth,
	    			maxWidth : config.maxWidth || DEFAULT_CONFIG.maxWidth,

	    			indicatorClasses : config.indicatorClasses || DEFAULT_CONFIG.indicatorClasses,
	    			contentSpanClasses : config.contentSpanClasses || DEFAULT_CONFIG.contentSpanClasses,
	    			headerSpanClasses : config.headerSpanClasses || DEFAULT_CONFIG.headerSpanClasses,

	    			assistiveLabel : config.assistiveLabel || DEFAULT_CONFIG.assistiveLabel
	    	};
		},

		/**
		 * Initializes internal parameters and creates the
		 * indicator for the resizer.
		 *
		 * @method _initializeResizer
		 * @param table {HTMLElement} <table> element we want to attach the resizer to
		 * @private
		 */
		_initializeResizer : function(table) {
			this.container = this.config.container || table.parentNode;
			this.tableParent = table.parentNode;
	    	this.table = table;
	    	this._events = {};

	    	this.current = null;

	    	// Create and attach the visual elements for resizing
	    	this.indicator = this._createIndicator();
	        this.tableParent.insertBefore(this.indicator, table);
	        this._setDividerHeight(this.indicator);

	    	// Determine what vendor prefixes to use for the animation
	    	this._initializeBrowserSupport();
		},

		/**
		 * Set up the columns
		 *
		 * @method _initializeColumns
		 * @param table {HTMLElement} <table> element we want to attach the resizer to
		 * @private
		 */
		_initializeColumns : function(table) {

			// Avoid having to go to the DOM each time we need a reference to the columns.
	    	// Use a real array so we get the array methods
	    	this.columns = [];
	    	var columns = table.querySelectorAll("thead th");
	    	for (var i = 0; i < columns.length; i++) {
	    		this.columns[i] = columns[i];
	    	}

	    	if (this.columns.length > 0) {
	    		this._initializeHandles(table);
	    		this.indicator.style.height = this.columns[0].clientHeight + 'px';

	    	}
		},

		/**
		 * Determine the appropriate CSS styles to use for animations
		 *
		 * @method _initializeBrowserSupport
		 * @private
		 */
		_initializeBrowserSupport : function() {
			var docStyle = w.document.documentElement.style;

			if (typeof docStyle.transform !== 'undefined') {
	    		this.transformStyle = 'transform';
	    	} else {
	    		for (var i = 0; i < VENDORS.length; i++) {
	    			var property = VENDORS[i] + 'Transform';
	    			if (typeof docStyle[property] !== 'undefined') {
	    				this.transformStyle = property;
	    				break;
	    			}
	    		}
	    	}
		},

		/**
		 * Create and attach handles to each column
		 *
		 * @method _createHandles
		 * @private
		 */
        _initializeHandles : function(table) {
            var totalWidth = 0;
            var columns = this.columns;

            var initialWidths = this.config.initialWidths || [];
            // Create and attach a handle to each column
            var promise = Promise.resolve();
            var that = this;
            for (var i = 0; i < columns.length; i++) {
                promise = this._calculateWidthAsync(promise, columns[i], initialWidths[i])
                    .then(function(column) {
                        totalWidth += column.clientWidth;
                    });
            }

            promise = promise.then($A.getCallback(function (){
                return that._setDividerHeight(that.indicator);
            })).then($A.getCallback(function (){
                table.style.width = totalWidth + 'px';
            }));
        },

        _calculateWidthAsync: function(promise, column, initialWidth) {
            var that = this;
            if (!this.hasHandle(column)) {
                var handle = this._createHandle();
                this._attachHandle(column, handle);

                // Chain each setDividerHeight for each column into async sequence.
                promise = promise.then($A.getCallback(function(){
                	// resizeColumn maybe called, which will mark column is resized.
					// If so, use column.clientWidth as the initialWidth
                	if (column._resized) {
                        initialWidth = column.clientWidth;
					} else {

                        initialWidth = initialWidth || column.clientWidth;
                        if (initialWidth < that.config.minWidth) {
                            initialWidth = that.config.minWidth;
                        }
					}

                    return that._setDividerHeight(handle).then(function(){
                        return initialWidth;
                    });
                })).then($A.getCallback(function(width) {
                    that._resize(column, width);
                    that._updateRange(that._findRangeElement(column), column.clientWidth);
                }));
            }
            return promise.then(function() {
                return column;
            });
        },

		/**
		 * Interface to attach the handle to the column <th> element.
		 *
		 * Because the existing header component requires a refactor to support this plugin,
		 * manually rearrange the column elements. This is very specific to the current
		 * implementation of ui:dataGridColumn
		 *
		 * TODO: refactor ui:dataGridColumn
		 */
		_attachHandle : function(column, handle) {
			var contentSpan = document.createElement('span');

			// Move all childNodes into the contentSpan
			contentSpan.setAttribute('class', this.config.contentSpanClasses);
			while (column.firstChild) {
				contentSpan.appendChild(column.firstChild);
			}

			var outerSpan = document.createElement('span');
			outerSpan.setAttribute('class', this.config.headerSpanClasses);
			outerSpan.appendChild(contentSpan);
			outerSpan.appendChild(handle);

			var colDiv = document.createElement('div');
			colDiv.appendChild(outerSpan);

			column.appendChild(colDiv);

		},

		/**
		 * Create an indicator element to show how the column is going to be resized
		 *
		 * @method _createIndicator
		 * @private
		 */
		_createIndicator : function() {
            var indicator = document.createElement('div');
            var indicatorClasses = $A.util.isString(this.config.indicatorClasses) ? this.config.indicatorClasses : '';

            indicatorClasses = indicatorClasses.split(/\s+/);
            // We should manually add all classes because IE does not support multiple arguments for 'add' https://developer.mozilla.org/en-US/docs/Web/API/Element/classList
            for (var i = 0; i < indicatorClasses.length; i++) {
                indicator.classList.add(indicatorClasses[i]);
            }

            indicator.classList.add("indicator");
            var columnDivider = document.createElement('span');
            columnDivider.classList.add(COLUMN_DIVIDER_CLASS);

            indicator.appendChild(columnDivider);

            return indicator;
		},

		/**
		 * Create a handle element for the user to interact with
		 *
		 * @method _createHandle
		 * @private
		 */
		_createHandle : function(columnWidth) {
			var handleContainer = document.createElement('div');
			handleContainer.classList.add("handle");

			// Input range for storing the width of the column as a slider
			var range = this._createRangeElement(columnWidth);

			// Visible handle the user will interact with
			var resizeHandle = document.createElement('span');
			resizeHandle.classList.add("resize-button");

			// Divider line to show what's being resized
			var columnDivider = document.createElement('span');
			columnDivider.classList.add("column-divider");



			// Compose all the elements and attach event handlers
			resizeHandle.appendChild(columnDivider);


			handleContainer.appendChild(range);
			handleContainer.appendChild(resizeHandle);


			handleContainer.addEventListener('keydown', this);
			handleContainer.addEventListener('mousedown', this);

			return handleContainer;
		},

		/**
		 * Creates the input range element used in the handle
		 *
		 * @return {HTMLElement} input element of type range
		 */
		_createRangeElement : function(value) {

			var range = document.createElement('input');


			range.setAttribute('type', 'range');
			range.setAttribute('min', this.config.minWidth);
			range.setAttribute('max', this.config.maxWidth);
			range.value = value;
			range.addEventListener('focus', function(e) {
				var handle = e.target.parentNode.querySelector('.resize-button');
				if(handle) {
					this._setDividerHeight(handle);
				}

			}.bind(this));

			return range;
		},

		/**
		 * Translates the indicator element to the specified location
		 *
		 * @method _slideIndicator
		 * @param x {Integer} The position to translate the indicator to, in pixels.
		 * @private
		 */
		_slideIndicator : function(x) {
			var pos = this._getTranslatedPosition(this.indicator);
	    	this.indicator.style[this.transformStyle] = 'translate3d(' + x + 'px,' + pos.y + 'px,' + pos.z + 'px)';
	    	this._setTranslatedPosition(this.indicator, 'x', x);
		},

		_getTranslatedPosition: function (element) {
			return {
				x : element._x || 0,
				y : element._y || 0,
				z : element._z || 0
			};
		},

		_setTranslatedPosition: function(element, coord, value) {
			element['_' + coord] = value;
		},


		_addTableWidth: function(width) {
			var currentTableWidth = this.tableWidth;
			if (this.table.offsetParent !== null) {
				currentTableWidth = this.table.clientWidth;
			}
			this.tableWidth = currentTableWidth + width;
			this.table.style.width = this.tableWidth + 'px';
		},

		/**
		 * Resizes the specified column to the target width and
		 * updates the total table width
		 *
		 * @method resizeColumn
		 * @param column {HTMLElement} column element to resize
		 * @param targetWidth {Integer} target width to resize the column to, in pixels
		 * @param rangeElement {HTMLElement} OPTIONAL input element of type range that holds the width value
		 */
		resizeColumn : function(column, targetWidth, rangeElement) {

			if (targetWidth < this.config.minWidth) {
				targetWidth = this.config.minWidth;
			}

	    	var diff = targetWidth - column.clientWidth;

	    	// Resize the column
	    	this._resize(column, targetWidth);
			this._addTableWidth(diff);

	    	// If the column width is invalid, we've failed to force the width of the column. To avoid inconsistencies
	    	// between the style and the calculated width, we should reset the style to the calculated width.
	    	if (!this.isValid(column)) {
	    		this._resize(column, column.clientWidth);
				this._addTableWidth(column.clientWidth - targetWidth);
	    	}

	    	// Update the value on the range input attached to this column
	    	if (rangeElement) {
	    		this._updateRange(rangeElement, column.clientWidth);
	    	}

	    	// Fire event notifying listeners that we have resized.
	    	this._fire("resize", {
				index : this.columns.indexOf(column),
				width : column.clientWidth
			});

	    	// Mark column is already resized in case async initializeHandles reset it back to initialWidth.
	    	column._resized = true;
	    	return column.clientWidth;
		},

		/**
		 * Resizes the specified element to the target width
		 *
		 * @method _resize
		 * @param element {HTMLElement} The target element to resize
		 * @param targetWidth {Integer} The width to resize to, in pixels
		 * @private
		 */
		_resize : function(element, targetWidth) {
			element.style.width = targetWidth + 'px';
		},

		/**
		 * Updates the range element with the specified value
		 *
		 * @method _updateRange
		 * @param range {HTMLElement} The target range element
		 * @private
		 */
		_updateRange : function(range, value) {
			range.value = value;
		},

		/**
		 * Attaches the needed event handlers when resizing begins
		 *
		 * @method attachHandlers
		 */
		attachHandlers : function() {
			this.container.addEventListener('mousemove', this);
	    	this.container.addEventListener('mouseup', this);
	    	this.container.addEventListener('mouseleave', this);
	    	this.indicator.addEventListener('mouseup', this);
		},

		/**
		 * Detaches the event handlers when resizing ends
		 *
		 * @method detachHandlers
		 */
		detachHandlers : function() {
			this.container.removeEventListener('mousemove', this);
	    	this.container.removeEventListener('mouseup', this);
	    	this.container.removeEventListener('mouseleave', this);
	    	this.indicator.removeEventListener('mouseup', this);
		},

		/**
		 * Dispatches all of the events that the resizer listens to.
		 * The browser calls this function if any of the events are triggered.
		 * Use with attachHandlers and detachHandlers to manage events we want
		 * to listen to
		 *
		 * @method handleEvent
		 * @param e {event} The event fired by the browser
		 * @private
		 */
		handleEvent : function(e) {
			switch (e.type) {
			case 'mousedown':
				this._onStart(e);

				// Prevent the browser default (text selection) during resizing
				$A.util.squash(e, true);
				break;
			case 'mousemove':
				this._onMove(e);
				break;
			case 'mouseup':
			case 'mouseleave':
				this._onEnd(e);
				break;
			case 'keydown':
				this._onKeydown(e);
				break;
			case 'focus':
				this._onFocus(e);
				break;
			}
		},

		/**
		 * Handler when resizing begins
		 *
		 * @method _onStart
		 * @param e {event} Event fired by the browser
		 */
		_onStart : function(e) {
			var th = this._findParentTH(e.target);

			// Save what's being resized so we can reference it later
	    	this.current = {
	    			element : th,
	    			range : this._findRangeElement(th),
	    			startX : e.clientX,
	    			width : th.clientWidth,
	    			tableOffset : this.table.getBoundingClientRect().left
	    	};

			this.attachHandlers();

			this.indicator.classList.add("active");
	    	this.table.classList.add("resizing");
	    	this._setDividerHeight(this.indicator);

			this._slideIndicator(e.clientX - this.current.tableOffset);
		},

		/**
		 * Handler while column is being resized
		 *
		 * @method _onMove
		 * @param e {event} Event fired by the browser
		 */
		_onMove : function(e) {
			var current = this.current;
			var currentWidth = e.clientX - current.element.offsetLeft - current.tableOffset;

			if (currentWidth > this.config.minWidth || e.clientX > current.startX) {
				this._slideIndicator(e.clientX - current.tableOffset);
	    		current.width = currentWidth;
	    	}
		},

		/**
		 * Handler when resizing is finished
		 *
		 * @method _onEnd
		 */
		_onEnd : function() {
			var current = this.current;

			this.resizeColumn(current.element, current.width, current.range);

			this.detachHandlers();
			this.current = null;

			this.table.classList.remove("resizing");
			this.indicator.classList.remove("active");
		},

		/**
		 * Handler when keyboard is used on a focused resize handle
		 *
		 * @method _onKeydown
		 * @param e {event} Event fired by the browser
		 */
		_onKeydown : function(e) {


			var range = e.target;
			var column;
			switch(e.keyCode) {
			// Left Arrow key
			case 37:
				column = this._findParentTH(range);
				this.resizeColumn(column, column.clientWidth - this.config.step, range);
				break;
			// Right Arrow key
			case 39:
				column = this._findParentTH(range);
				this.resizeColumn(column, column.clientWidth + this.config.step, range);
				break;
			}
		},

		/**
		 * Attach an event handler onto the resizer
		 *
		 * @method on
		 * @param eventType {string} event name
		 * @param fn {function} The callback to execute in response to the event
		 * @param [context] {object} Override 'this' object in callback
		 * @public
		 */
		on: function(eventType, fn, context) {
			var eventQueue = this._events[eventType] || (this._events[eventType] = []);
			eventQueue.push({
				fn 		: fn,
				context : context
			});
		},

		/**
		 * Fire a custom event by name
		 * The callback functions are executed with the resizer instance as context and witht he parameters listed here.
		 * The first argument is the event type and any additional arguments are passed to the listeners as parameters.
		 * This is used to notify any listeners when resizing happens
		 *
		 * @method _fire
		 * @param eventType {string} Type of event to be dispatched
		 * @param arguments {object} An arbitrary set of parameters to pass to the listener
		 * @private
		 */
		_fire: function(eventType) {


			var eventQueue = this._events[eventType],
				eventFncs = eventQueue && eventQueue.length,
				params = Array.prototype.slice.call(arguments, 1),
				ePayload;

			if (eventFncs) {
				for (var i = 0; i < eventFncs; i++) {
					ePayload = eventQueue[i];
					ePayload.fn.apply(ePayload.context || this, params);
				}
			}
		},

		/**
		 * Finds the parent TH of the specified element
		 *
		 * @method _findParentTH
		 * @param element {HTMLElement} child element of a th
		 * @return {HTMLElement} the TH parent element
		 */
		_findParentTH: function(element) {
			while (element.tagName !== "TH") {
				element = element.parentNode;
			}
			return element;
		},

		/**
		 * Finds the range element used to store the column width values
		 *
		 * @method _findRangeElement
		 * @param headerEl {HTMLElement} header element
		 * @return {HTMLElement} The input of type range we use to store the column width values
		 */
		_findRangeElement: function(headerEl) {
			return headerEl ? headerEl.querySelector('input[type="range"]') : null;
		},

		/**
		 * Checks to see if the DOM element's calculated width matches the specified width
		 *
		 * @method isValid
		 * @param column {HTMLElement} column element to be checked
		 * @return {Boolean} Whether the column's calculated width matches the specified width
		 */
		isValid : function(column) {
			//this detection only works if the column is visible so we check for that with offsetParent
			if (column.offsetParent === null) {
				return true;
			}
			return  ((column.clientWidth + 'px') === column.style.width);
		},

		/**
		 * Checks to see if the specified column has a handle attached
		 */
		hasHandle : function(column) {
			return column ? (column.querySelector('.handle') !== null) : false;
		},

		/**
		 * Re-initialize column data
		 */
		updateColumns : function() {
			if(this.indicator) {
				this._setDividerHeight(this.indicator);
			}
			this._initializeColumns(this.table);
		},

		/**
		 * Retrieves the widths of all the columns
		 *
		 * @method getColumnWidths
		 * @return {Array} widths of all the columns as an array of integers
		 */
		getColumnWidths : function() {
			return this.columns.map(function(th) {
				return th.clientWidth;
			});
		},

		/**
		 * Manually resizes the specified column
		 */
		resize : function(index, width) {
			var column = this.columns[index];
			if (column && width > 0) {
				this.resizeColumn(column, width, this._findRangeElement(column));
			}
		},

		/**
		 * Manually resize all columns
		 */
		resizeAll : function(widths) {
			this.tableWidth = 0;
			for (var i = 0; i < widths.length; i++) {
				this.resize(i, widths[i]);
			}
			for (var j = i; j < this.columns.length; j++) {
				this.resize(j, this.config.minWidth);
			}
		},

		/**
		 * Updates the accessibility labels for each resizer
		 */
		updateAccessibilityLabels : function(labels) {
			var columns = this.columns;

			for (var i = 0; i < columns.length; i++) {
				var range = this._findRangeElement(columns[i]);
				range.setAttribute('aria-label', labels[i] + ' ' + this.config.assistiveLabel);
			}
		}
    };

    /**
     * Static Manager used to create new instances of the resizer
     */
	var ColumnResizeManager = {};

	/**
	 * Initializes resizing on the specified table
	 *
	 * @method initializeColumnResizer
	 * @param table {HTMLElement} the table element to attach the resizer to
	 * @param config {object} config object
	 * @public
	 */
	ColumnResizeManager.initializeColumnResizer = function(table, config) {
		return new ColumnResizer(table, config);
	};

	return ColumnResizeManager;
}