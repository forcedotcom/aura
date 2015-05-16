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

function (w) {
    'use strict';
    w || (w = window);

    /**
     * A facade for a DOM element
     * to simplift reading/writing values
     * as well as prevent unnecessary DOM reads
     * @class  ElementProxy
     * @private
     * @param el {HTMLElement} el
     * @param id {String} a unique id for the element
     */
    function ElementProxy(el, id) {
        this.id = id;
        this.width = 0;
        this.height = 0;
        this.left = 0;
        this.top = 0;
        this.right = 0;
        this.bottom = 0;
        this._dirty = false;
        this._node = null;


        if(!el) {
            throw new Error('Element missing');
        }
        this._node = el;
        this.refresh();
        
    }

    /**
     * Update values from the dom
     * 
     * @method refresh
     */
    ElementProxy.prototype.refresh = function() {


        if(this.isDirty()) {
            return;
        }
        var box, x;
        
        if(this._node !== w) {
            box = this._node.getBoundingClientRect();
            for(x in box) {
                this[x] = box[x];
            }
            this.top = this.top + w.scrollY;
            this.left = this.left + w.scrollX;
        } else {
            box = {};
            this.width = w.innerWidth;
            this.height = w.innerHeight;
            this.left = w.scrollX;
            this.top = w.scrollY;
            this.right = w.innerWidth + w.scrollX;
            this.bottom = w.innerHeight;
        }

        this._dirty = false;
    };

    /**
     * Get the underlying DOM node
     * @return {HTMLElement}
     */
    ElementProxy.prototype.getNode = function() {
        return this._node;
    };

    /**
     * Check if this is dirty:
     * values have been changed but the DOM
     * is not updated
     * @return {Boolean}
     */
    ElementProxy.prototype.isDirty = function() {
        return this._dirty;
    };

    ElementProxy.prototype.bake = function() {
        this._node.style.top = this.top + 'px';
        this._node.style.left = this.left + 'px';
        this._dirty = false;
    };

    ElementProxy.prototype.set = function(direction, val) {
        this[direction] = val;
        this._dirty = true;
    };


    return {
        ElementProxy: ElementProxy
    };
}