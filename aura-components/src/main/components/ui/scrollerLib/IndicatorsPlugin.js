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
    
    var SCROLLER = w.__S || (w.__S = {}), //NAMESPACE
        NOW      = Date.now || function () { return new Date().getTime(); },
        RAF      = w.requestAnimationFrame,
        STYLES   = SCROLLER.styles,
        HELPERS  = SCROLLER.helpers,
        PLUGINS  = SCROLLER.plugins || (SCROLLER.plugins = {}),

        DEFAULTS_INDICATOR = {
            interactive : false,
            resize      : true,
            snap        : true
        },

        DEFAULT_STYLE_SCROLLBAR = [
            'position:absolute',
            'z-index:9999'
        ].join(';'),

        DEFAULT_STYLE_INDICATOR = [
            '-webkit-box-sizing:border-box;-moz-box-sizing:border-box;box-sizing:border-box',
            'position:absolute',
            'background:rgba(0,0,0,0.5)',
            'border:1px solid rgba(255,255,255,0.9)',
            'border-radius:3px'
        ].join(';'),

        DEFAULT_STYLE_VERTICAL_SB = [
            '',
            'height:7px',
            'left:2px',
            'right:2px',
            'bottom:0'
        ].join(';'),
        DEFAULT_STYLE_HORIZONTAL_SB = [
            '',
            'width:7px',
            'bottom:2px',
            'top:2px',
            'right:1px'
        ].join(';'),

        FULL_INDICATOR_RATIO = -0.1;

    function Indicator (scroller, options) {
        this.wrapper        = typeof options.el === 'string' ? document.querySelector(options.el) : options.el;
        this.indicator      = this.wrapper.children[0];
        this.indicatorStyle = this.indicator.style;
        this.scroller       = scroller;
        this.opts           = HELPERS.simpleMerge(DEFAULTS_INDICATOR, options);
        this.scrollVertical = scroller.scrollVertical;

        this.sizeRatioX   = 1;
        this.sizeRatioY   = 1;
        this.maxPosX      = 0;
        this.maxPosY      = 0;
        this.virtualSizeX = 1;
        this.virtualSizeY = 1;

        if (this.opts.interactive) {
            if (!this.opts.disableTouch) {
                HELPERS.bind(this.indicator, 'touchstart', this);
                HELPERS.bind(window, 'touchend', this);
            }
            if (!this.opts.disablePointer) {
                HELPERS.bind(this.indicator, 'MSPointerDown', this);
                HELPERS.bind(window, 'MSPointerUp', this);
            }
            if (!this.opts.disableMouse) {
                HELPERS.bind(this.indicator, 'mousedown', this);
                HELPERS.bind(window, 'mouseup', this);
            }
        }
    }

    Indicator.prototype = {
        handleEvent: function (e) {
            switch ( e.type ) {
                case 'touchstart':
                case 'MSPointerDown':
                case 'mousedown':
                    this._start(e);
                    break;
                case 'touchmove':
                case 'MSPointerMove':
                case 'mousemove':
                    this._move(e);
                    break;
                case 'touchend':
                case 'MSPointerUp':
                case 'mouseup':
                case 'touchcancel':
                case 'MSPointerCancel':
                case 'mousecancel':
                    this._end(e);
                    break;
            }
        },

        destroy: function () {
            if ( this.opts.interactive ) {
                HELPERS.unbind(this.indicator, 'touchstart', this);
                HELPERS.unbind(this.indicator, 'MSPointerDown', this);
                HELPERS.unbind(this.indicator, 'mousedown', this);

                HELPERS.unbind(window, 'touchmove', this);
                HELPERS.unbind(window, 'MSPointerMove', this);
                HELPERS.unbind(window, 'mousemove', this);

                HELPERS.unbind(window, 'touchend', this);
                HELPERS.unbind(window, 'MSPointerUp', this);
                HELPERS.unbind(window, 'mouseup', this);
            }
        },

        _start: function (e) {
            var point = e.touches ? e.touches[0] : e;

            e.preventDefault();
            e.stopPropagation();

            this.transitionTime(0);

            this.initiated  = true;
            this.moved      = false;
            this.lastPointX = point.pageX;
            this.lastPointY = point.pageY;
            this.startTime  = NOW();

            if (!this.opts.disableTouch) {
                HELPERS.bind(window, 'touchmove', this);
            }
            if (!this.opts.disablePointer) {
                HELPERS.bind(window, 'MSPointerMove', this);
            }
            if ( !this.opts.disableMouse ) {
                HELPERS.bind(window, 'mousemove', this);
            }
        },

        _move: function (e) {
            var point     = e.touches ? e.touches[0] : e,
                timestamp = NOW(),
                deltaX, deltaY, newX, newY;

            e.preventDefault();
            e.stopPropagation();

            this.moved = true;

            if (this.scroller.opts.gpuOptimization) {
                newX = point.pageX - this.wrapper.getBoundingClientRect().left - this.width / 2;
                newY = point.pageY - this.wrapper.getBoundingClientRect().top - this.height / 2;
            } else {
                deltaX = point.pageX - this.lastPointX;
                deltaY = point.pageY - this.lastPointY;

                this.lastPointX = point.pageX;
                this.lastPointY = point.pageY;

                newX = this.x + deltaX;
                newY = this.y + deltaY;
            }

            this._pos(newX, newY);

            this.x = newX;
            this.y = newY;
        },

        _end: function (e) {
            if (!this.initiated) {
                return;
            }

            this.initiated = false;

            e.preventDefault();
            e.stopPropagation();

            HELPERS.unbind(window, 'touchmove', this);
            HELPERS.unbind(window, 'MSPointerMove', this);
            HELPERS.unbind(window, 'mousemove', this);
        },
        _pos: function (x, y) {
            var self = this;

            if ( x < 0 ) {
                x = 0;
            } else if ( x > this.maxPosX ) {
                x = this.maxPosX;
            }

            if ( y < 0 ) {
                y = 0;
            } else if ( y > this.maxPosY ) {
                y = this.maxPosY;
            }

            x = !this.scrollVertical ? Math.round(x / this.sizeRatioX) : this.scroller.x;
            y = this.scrollVertical  ? Math.round(y / this.sizeRatioY) : this.scroller.y;

            if (!this._rafPos) {
                this._rafPos = RAF(function (t) {
                    self._posRAF(x, y);
                });
            }
        },
        _posRAF: function (x, y) {
            this.scroller.scrollTo(x, y);
            this._rafPos = false;
        },

        transitionTime: function (time) {
            time = time || 0;
            this.indicatorStyle[STYLES.transitionDuration] = time + 'ms';
        },

        transitionEasing: function (easing) {
            this.indicatorStyle[STYLES.transitionTimingFunction] = easing;
        },
        getCurrentSizes: function () {
            if (this.scrollVertical) {
                return {
                    virtual     : this.virtualSizeY,
                    wrapperSize : this.wrapperHeight,
                    maxScroll   : this.scroller.maxScrollY
                };
            } else {
                return {
                    virtual     : this.virtualSizeX,
                    wrapperSize : this.wrapperWidth,
                    maxScroll   : this.scroller.maxScrollX
                };
            }
        },
        getVirtualScrollSize: function () {
            var s = this.getCurrentSizes();
            if (s.virtual < s.wrapperSize) {
                return Math.abs(s.maxScroll) || s.wrapperSize;
            } else {
                return s.virtual;
            }
        },
        getVirtualMaxSize: function (scrollSize) {
            var s = this.getCurrentSizes();
            return s.maxScroll === -Infinity ? -scrollSize : (s.virtual ? s.wrapperSize - scrollSize : s.maxScroll);
        },
        refresh: function () {
            this.transitionTime(0);

            var scroller      = this.scroller,
                wHeight       = this.wrapperHeight = this.wrapper.offsetHeight, // possible relayout
                wWidth        = this.wrapperWidth  = this.wrapper.offsetWidth,
                size          = this.scrollVertical ? wHeight : wWidth,
                scrollSize    = Math.max(this.getVirtualScrollSize(), size),
                maxScroll     = this.getVirtualMaxSize(scrollSize),
                indicatorSize = Math.max(Math.round(size * size / scrollSize), 8);

            if (this.scrollVertical) {
                if (this.opts.resize) {
                    this.indicatorHeight       = indicatorSize;
                    this.indicatorStyle.height = this.indicatorHeight + 'px';
                } else {
                    this.indicatorHeight = this.indicator.offsetHeight;
                }
                
                this.maxPosY               = size - this.indicatorHeight;
                this.minBoundaryY          = 0;
                this.maxBoundaryY          = this.maxPosY;
                this.sizeRatioY            = this.maxPosY / maxScroll || FULL_INDICATOR_RATIO;
                this.height                = this.indicatorHeight;
            } else {
                if (this.opts.resize) {
                    this.indicatorWidth       = indicatorSize;
                    this.indicatorStyle.width = this.indicatorWidth + 'px';
                } else {
                    this.indicatorWidth = this.indicator.offsetWidth;
                }
                this.maxPosX               = size - this.indicatorWidth;
                this.minBoundaryX          = 0;
                this.maxBoundaryX          = this.maxPosX;
                this.sizeRatioX            = this.maxPosX / maxScroll || FULL_INDICATOR_RATIO;
                this.width                 = this.indicatorWidth;
            }

            this.updatePosition();
        },

        _updatePositionAbstractProperties: function (x, y) {
            if (this.scrollVertical) {
                return {
                    posRatio      : y,
                    indicatorSize : this.indicatorHeight,
                    size          : this.height,
                    minBoundary   : this.minBoundaryY,
                    maxBoundary   : this.maxBoundaryY,
                    maxPos        : this.maxPosY 
                };
            } else {
                return {
                    posRatio      : x,
                    indicatorSize : this.indicatorWidth,
                    size          : this.width,
                    minBoundary   : this.minBoundaryX,
                    maxBoundary   : this.maxBoundaryX,
                    maxPos        : this.maxPosX 
                };
            }
        },
        updatePosition: function () {
            var x      = this.sizeRatioX * this.scroller.x,
                y      = this.sizeRatioY * this.scroller.y,
                s      = this._updatePositionAbstractProperties(x, y),
                pos    = s.posRatio,
                scaleX = 1,
                scaleY = 1,
                scale,
                tmpSize;

            if (pos < s.minBoundary) {
                tmpSize = this.opts.snap ? Math.max(s.indicatorSize + s.posRatio * 3, 8) : s.indicatorSize;
                scale   = tmpSize / s.size;
                pos     = s.minBoundary - ((s.size - tmpSize) / 2);

            } else if (pos > s.maxBoundary) {
                tmpSize = this.opts.snap ? Math.max(s.indicatorSize - (s.posRatio - s.maxPos) * 3, 8): s.indicatorSize;
                scale   = tmpSize / s.size;
                pos     = s.maxPos + ((s.size - tmpSize) / 2);
            }

            if (scale) {
                if (this.scrollVertical) {
                    scaleY = scale; y = pos;   
                } else {
                    scaleX = scale; x = pos;
                }
            } 

            this.x = x;
            this.y = y;

            this.indicatorStyle[STYLES.transform] = 'matrix3d(' + scaleX +',0,0,0,0,' + scaleY + ',0,0,0,0,1,0,' + x +',' + y +', 0, 1)';
        }
    };


    /*
    * ==================================
    * INDICATORS MANAGER CLASS
    * ==================================
    */
    function Indicators () {}

    Indicators.prototype = {
        init: function () {
            this._indicators = [];
            this._virtualScroll = 0;

            this.on('_initialize', this._initializeIndicators);
            this.on('_update', this._updateIndicators);
            this.on('_refresh', this._refreshIndicators);

            this._hook('after', '_transitionTime', this._transitionTimeIndicators);
            this._hook('after', '_transitionEasing', this._transitionEasingIndicators);
            this._hook('after', '_translate', this._updateIndicators);
            this._hook('after', '_setInfiniteScrollerSize', this._setVirtualScrollSize);
        },
        _initializeIndicators: function () {
            var self = this;
            if (this.opts.scrollbars) {
                this._createDefaultScrollbars(this.opts.scrollbars);
            }
            if (this.opts.indicators) {
                this.opts.indicators.forEach(function (i) {self.addIndicator(i.el, i.config)});
            }

            this._initVirtualScrollSize();                
        },
        _initVirtualScrollSize: function () {
            var hasScroll     = this.scrollVertical ? this.hasScrollY : this.hasScrollX,
                virtualSize   = this.scrollVertical ? 'virtualSizeY'  : 'virtualSizeX',
                virtualScroll = hasScroll ? this._virtualScroll : 0;

            this._indicators.forEach(function (i) {
                i[virtualSize] = virtualScroll;
                i.refresh();
            });
        },
        _setVirtualScrollSize: function () {
            var last          = this._positionedSurfacesLast(),
                virtualScroll = last.offset + (this.scrollVertical ? last.height : last.width),
                virtualSize   = this.scrollVertical ? 'virtualSizeY' : 'virtualSizeX';

            if (virtualScroll > this._virtualScroll) {
                this._virtualScroll = virtualScroll;
                this._indicators.forEach(function (i) {
                    i[virtualSize] = virtualScroll;
                    i.refresh();
                });
            }
        },
        _updateIndicators: function () {
            this._indicators.forEach(function (i) {i.updatePosition();});
        },
        _refreshIndicators: function () {
            this._indicators.forEach(function (i) {
                i.refresh();
            });
        },
        _transitionTimeIndicators: function (time) {
            time || (time = 0);
            this._indicators.forEach(function (i) {i.transitionTime(time);});
        },
        _transitionEasingIndicators: function (easing) {
            this._indicators.forEach(function (i) {i.transitionEasing(easing);});
        },
        _createDefaultScrollbars: function (config) {
            var interactive = true,  // TODO:
                customStyle = false, // Move those two as params
                scrollbar   = this._createDefaultScrollbar(this.scrollVertical, interactive, customStyle);
            this.wrapper.appendChild(scrollbar);
            
            this._indicators.push(new Indicator(this, {
                el          : scrollbar,
                interactive : interactive
            }));
        },
        _createDefaultScrollbar: function (vertical, interactive, customStyle) {
            var scrollbar            = w.document.createElement('div'),
                indicator            = w.document.createElement('div'),
                inlineStyleScrollbar = DEFAULT_STYLE_SCROLLBAR,
                inlineStyleIndicator = DEFAULT_STYLE_INDICATOR;

            indicator.className     = 'scrollbar';
            indicator.style.cssText = inlineStyleIndicator;

            if (!vertical) {
                if (!customStyle) {
                    scrollbar.style.cssText += inlineStyleScrollbar + DEFAULT_STYLE_VERTICAL_SB;
                    indicator.style.height   = '100%';
                }
                scrollbar.className = 'scrollbar-horizontal';
            } else {
                if (!customStyle) {
                    scrollbar.style.cssText += inlineStyleScrollbar + DEFAULT_STYLE_HORIZONTAL_SB;
                    indicator.style.width    = '100%';
                }
                scrollbar.className = 'scrollbar-vertical';
            }

            if (!interactive) {
                scrollbar.style.pointerEvents = 'none';
            }

            scrollbar.appendChild(indicator);
            return scrollbar;
        },
        /* PUBLIC API */
        addIndicator: function (el, cfg) {
            cfg || (cfg = {});
            cfg.el = el;
            var indicator = new Indicator(this, cfg);

            this._indicators.push(indicator);
            indicator.refresh();
        }
    };
    
    Indicators.Indicator = Indicator;
    PLUGINS.Indicators   = Indicators;

}