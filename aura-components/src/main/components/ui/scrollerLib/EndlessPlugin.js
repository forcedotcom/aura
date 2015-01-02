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
    
    var SCROLLER = w.__S || (w.__S = {}),
        PLUGINS  = SCROLLER.plugins || (SCROLLER.plugins = {}),
        Logger   = SCROLLER.Logger;
    
    function Endless() {}

    Endless.prototype = {
        init: function () {
            this.endless = true;
        },
        _itemsLeft: function () {
            return true;
        },
        _mod: function (index) {
            var n = this.items.length;
            return ((index % n) + n) % n;
        },
        _setActiveOffset: function () {
            this.activeOffset = (this.scrollVertical ? this.wrapperHeight: this.wrapperWidth) - 5;
        },
        _momentum: function (current, start, duration, lowerMargin, wrapperSize) {
            var velocity = this._getVelocity(current, start, duration),
                momentum = this._computeMomentum(velocity, current);
            return momentum;
        },
        _resetPosition: function () {
            return false;
        },
        _isOutOfScroll: function () {
            return false;
        },
        _updateAllowed: function (current) {
            return this._isScrolling || (Math.abs(current.dist) > 5);
        },
        _getBoundaries: function (pos, size) {
            return {
                top    : -pos - size,
                bottom : -pos + size + this.activeOffset
            };
        },
        _recycleEnableTest: function () {
            return true;
        },
        _initializePositions: function () {
            var items         = this.items,
                itemsSize     = items.length,
                positioned    = this.surfacesPositioned,
                sizeNotCover  = true,
                sizeNeeded    = this.wrapperSize + this.activeOffset,
                heightSum     = 0,
                i,j,
                item, surface, height;

            for (i = 0; i < itemsSize && sizeNotCover; i++) {
                item          = items[i];
                surface       = this._getAvailableSurface();
                heightSum     += this._attachItemInSurface(item, surface, {index: i, offset: heightSum});
                sizeNotCover  = heightSum < sizeNeeded;
                positioned[i] = surface;
            }

            sizeNotCover = true;
            heightSum    = 0;
            sizeNeeded   = this.activeOffset;

            if (i === itemsSize || !sizeNotCover) {
                Logger.log(
                    '[WARNING - SCROLLER ENDLESS PLUGIN] - ' +
                    'Items are not sufficient to fulfill all scrollable area');
            }
            
            for (j = itemsSize - 1; j >= i && sizeNotCover; j--) {
                item          = items[j];
                surface       = this._getAvailableSurface();
                heightSum     += this._attachItemInSurface(item, surface, {index: j, offset: positioned[0].offset, preCalculateSize: true});
                positioned.unshift(surface);
                sizeNotCover = heightSum < sizeNeeded;
            }

            this._setInfiniteScrollerSize();
        }
    };

    PLUGINS.Endless = Endless;

}