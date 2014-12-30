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

    var SCROLLER    = w.__S || (w.__S = {}), //NAMESPACE
        STATICS     = SCROLLER.constructor,
        PLUGINS     = SCROLLER.plugins || (SCROLLER.plugins = {}),
        STYLES      = SCROLLER.styles,
        EASING      = STATICS.EASING,
        BOUNCE_BACK = 200,
        SNAP_SOFT   = 'soft',
        SNAP_STICKY = 'sticky',
        SNAPSIZE_RATIO = 2,
        MAX_SNAP_TIME  = 600;
    
    function Snap() {}

    Snap.prototype = {
        init: function () {
            this._bindSnap();
        },
        _bindSnap: function () {
            this.on('beforeScrollStart', this._snapStart);
        },
        _snapStart: function () {
            this.initX = this.startX;
            this.initY = this.startY;
        },
        _getNearesOffset: function (offset) {
            var s = this.surfacesPositioned;
        },
        _afterEnd: function () {
            var current, dest, time;
            if (!this.moved) {
                current = this._getSnapPosition();
                if (current.init % current.minSnap) {
                    dest = Math.round(current.init / current.snapSize) * current.snapSize;
                    time = BOUNCE_BACK;

                    if (this.scrollVertical) {
                        this.scrollTo(0, dest, time);
                    } else {
                        this.scrollTo(dest, 0 , time);
                    }
                    
                }
            }
        },
        _getSnapSize: function (vertical) {
            return  vertical ? this.itemHeight || this.wrapperHeight : this.itemWidth || this.wrapperWidth;
        },
        _getSnapPosition: function (vertical) {
            var current;
            if (this.scrollVertical) {
                current  = {
                    snapSize : this._getSnapSize(true),
                    dist     : this.distY,
                    init     : this.initY
                };
            } else {
                current = {
                    snapSize : this._getSnapSize(),
                    dist     : this.distX,
                    init     : this.initX
                };
            }
            current.minSnap = current.snapSize / SNAPSIZE_RATIO;
            return current;
        },
        _momentum: function () {
            if (this.opts.snap === SNAP_SOFT) {
                return this._momentumSnapSoft.apply(this, arguments);
            } else {
                return this._momentumSnapSticky.apply(this, arguments);
            }
        },
        _momentumSnapSticky: function (current, start, duration, lowerMargin, wrapperSize) {
            var velocity = this._getVelocity(current, start, duration),
                momentum = this._momentumSnapSoft.apply(this, arguments),
                position = this._getSnapPosition(),
                snapSize = position.snapSize,
                initSnap = Math.round(position.init / snapSize) * snapSize,
                dest, time;

            if (Math.abs(position.init - momentum.destination) < position.minSnap) {
                momentum = {
                    destination : Math.round(position.init / position.snapSize) * position.snapSize,
                    time        : BOUNCE_BACK,
                    snapBack    : true
                };
            } else {
                dest = initSnap + (momentum.destination > current ? snapSize: -snapSize);
                time = Math.abs((current - dest) / velocity);
                momentum = {
                    destination : dest,
                    time        : Math.min(time, MAX_SNAP_TIME)
                };
            }

            return momentum;
        },
        _momentumSnapSoft: function (current, start, duration, lowerMargin, wrapperSize) {
            var velocity = this._getVelocity(current, start, duration),
                momentum = this._computeMomentum(velocity, current),
                pos      = this._getSnapPosition(),
                dist, time;

            if (!this.endless && momentum.destination > 0) {
                momentum        = this._computeSnap(0, wrapperSize, velocity, current);
                momentum.bounce = EASING.bounce;

            } else if (momentum.destination < lowerMargin) {
                momentum        = this._computeSnap(lowerMargin, wrapperSize, velocity, current);
                momentum.bounce = EASING.bounce;

            } else {
                dist = Math.round(momentum.destination / pos.snapSize) * pos.snapSize;
                time = Math.abs(current - dist) < pos.minSnap ? BOUNCE_BACK : Math.abs((dist - current) / velocity);

                momentum = {
                    destination : dist,
                    time        : time
                };

            }
            return momentum;
        }
    };

    PLUGINS.Snap = Snap;

}