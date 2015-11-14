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
         *
         */
        initialize: function (tbody, rowElements) {
            this.tbody = tbody;
            this.currentRowIndex = 0;

            tbody.addEventListener("keydown", this._onKeydown.bind(this), true);
            tbody.addEventListener("click", this._onClick.bind(this));

            this.updateRowElements(rowElements);
        },

        updateRowElements: function (newRowElements) {
            this.rowElements = newRowElements;

            if (newRowElements.length > 0) {
                this._targetColumnIndex = this._findTargetColumnIndex(0);
                var inputElement = this._getInputElement(this.currentRowIndex, this._targetColumnIndex);
                inputElement.setAttribute("tabindex", "0");
            }
        },

        _getInputElement: function (rowIndex, colIndex) {
            // This is hard-coded to grab the first input, we should make this configurable
            return this.rowElements[rowIndex].children[colIndex].getElementsByTagName('input')[0];
        },

        /**
         * Focus on a specific cell in the grid
         */
        focus: function (rowIndex, colIndex) {
            var inputElement = this._getInputElement(rowIndex, colIndex);
            if (inputElement) {
                inputElement.focus();
            }
        },

        /**
         * Navigate to row
         */
        navigateToRow: function (rowIndex) {
            if (!this._targetColumnIndex) {
                this._targetColumnIndex = this._findTargetColumnIndex(rowIndex);
            }

            this.focus(rowIndex, this._targetColumnIndex);
        },

        _findTargetRowIndex: function(el) {
            while (el) {
                var index = parseInt(el._index, 10);

                if (index > -1) {
                    return parseInt(index, 10);
                }
                el = el.parentNode;
            }
            return 0;
        },

        /**
         * Figure out which column should get the focus (should only be 1 column with an input element right now)
         */
        _findTargetColumnIndex: function (rowIndex) {
            var columns = this.rowElements[rowIndex].children;
            var targetColumnIndex = 0;
            for (var i = 0; i < columns.length; i++) {
                var inputElement = columns[i].getElementsByTagName('input')[0];
                if (inputElement) {
                    targetColumnIndex = i;
                    break;
                }
            }
            return targetColumnIndex;
        },

        /**
         * Main event handler for keyboard interactions on the table body
         */
        _onKeydown: function (e) {
            switch (e.keyCode) {
                // Up Arrow key
                case 38:
                    // Go back
                    if (this.currentRowIndex > 0) {
                        this._updateCurrentRowIndex(this.currentRowIndex - 1);
                        this.navigateToRow(this.currentRowIndex);
                    }
                    e.preventDefault();
                    e.stopPropagation();
                    break;
                // Down Array key
                case 40:
                    // Go forward
                    if (this.currentRowIndex + 1 < this.rowElements.length) {
                        this._updateCurrentRowIndex(this.currentRowIndex + 1);
                        this.navigateToRow(this.currentRowIndex);
                    }
                    e.preventDefault();
                    e.stopPropagation();
                    break;
            }
        },

        _updateCurrentRowIndex: function (newIndex) {
            if (newIndex !== this.currentRowIndex) {
                var oldCurrentElement = this._getInputElement(this.currentRowIndex, this._targetColumnIndex);
                var newCurrentElement = this._getInputElement(newIndex, this._targetColumnIndex);
                oldCurrentElement.setAttribute("tabindex", "-1");
                newCurrentElement.setAttribute("tabindex", "0");
                this.currentRowIndex = newIndex;
            }
        },

        _onClick: function(event) {
            this._updateCurrentRowIndex(this._findTargetRowIndex(event.target));
            this.focus(this.currentRowIndex, this._targetColumnIndex);
        }

    };

    // TODO: Library needs to return a new instance of the object for each grid, rather than one single lib object
    return new KeyboardNavManager();
}