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
    
    // GLOBALS UTILS
    var NOW            = Date.now || function () { return new Date().getTime(); },
        RAF            = w.requestAnimationFrame,
        CAF            = w.cancelAnimationFrame,

    // NAMESPACES
        SCROLLER       = w.__S || {},
        PLUGINS        = SCROLLER.plugins,
        HELPERS        = SCROLLER.helpers,
        SUPPORT        = SCROLLER.support,
        STYLES         = SCROLLER.styles,
        CubicBezier    = SCROLLER.CubicBezier,
        Logger         = SCROLLER.Logger,

        // iOS Feature detection
        IS_IOS         = SUPPORT.isIOS,

        /*
        * For the sake of simplicity, these action-string
        * constants won't be exposed as STATIC variables 
        * in the Scroller.
        */
        ACTION_RESET         = 'reset',
        ACTION_LOCK          = 'lock',
        ACTION_GESTURE_START = 'gestureStart',
        ACTION_GESTURE_MOVE  = 'gestureMove',
        ACTION_SCROLL_MOVE   = 'scrollMove',
        ACTION_GESTURE_END   = 'gestureEnd',
        ACTION_ANIM_START    = 'animationStart',
        ACTION_ANIM_MOVING   = 'animationMove',
        ACTION_ANIM_END      = 'animationEnd',
        ACTION_SCROLL        = 'scroll',
        ACION_DOM_MUTATION   = 'mutationObserver',
        HOOK_BEFORE          = 'before',
        HOOK_AFTER           = 'after',

        /**
        * Distinguish the type of touch events so they don't conflict in certain
        * contexts, like Dual gestures on Windows Tablets or in ChromeDevTools. 
        * (There's a bug where enabling touch gestures fires both types.)
        *
        */
        EVENT_TYPE = {
            touchstart : 1,
            touchmove  : 1,
            touchend   : 1,

            mousedown : 2,
            mousemove : 2,
            mouseup   : 2,

            pointerdown : 3,
            pointermove : 3,
            pointerup   : 3,

            MSPointerDown : 4,
            MSPointerMove : 4,
            MSPointerUp   : 4
        },

        /**
        * Identifies vertical scrolling.
        *
        * @property SCROLL_VERTICAL
        * @type String
        * @static
        * @final
        */
        SCROLL_VERTICAL = 'vertical',

        /**
        * Identifies horizontal scrolling.
        *
        * @property SCROLL_HORIZONTAL
        * @type String
        * @static
        * @final
        */
        SCROLL_HORIZONTAL = 'horizontal',

        /**
        * Identifies bidirectional scrolling.
        *
        * @property SCROLL_BIDIRECTIONAL
        * @type String
        * @static
        * @final
        */
        SCROLL_BIDIRECTIONAL = 'bidirectional',

        /**
        * Configuration object for the MutatorObserver
        *
        * @property MUTATOR_OBSERVER_CONFIG
        * @type Object
        * @static
        * @final
        */
        MUTATOR_OBSERVER_CONFIG = {
            subtree    : true, 
            childList  : true, 
            attributes : false
            // NOTE: if using attributeFilter
            // Avoid listen for "style" attribute changes
        },

        /**
        * Default configuration for the scroller.
        * This option can be modified at the static level
        * or on a per instance basis.
        *
        * @property DEFAULTS
        * @type String
        * @static
        */
        DEFAULTS = {
            enabled               : true,
            bounceTime            : 600,
            useCSSTransition      : false,
            useNativeScroller     : false,
            dualListeners         : false,
            minThreshold          : 5,     // It should be in the [0, 10] range
            minDirectionThreshold : 2,     // It should be smaller than minThreshold
            lockOnDirection       : null,
            itemHeight            : null,
            itemWidth             : null,
            bindToWrapper         : false,
            scroll                : SCROLL_VERTICAL,
            pullToRefresh         : false,
            pullToLoadMore        : false,
            scrollbars            : false,
            infiniteLoading       : false,
            gpuOptimization       : false,
            debounce              : true,
            observeDomChanges     : true,
            observeDomConfig      : MUTATOR_OBSERVER_CONFIG
        },

        /**
        * Default parametrized CubicBezier function curve 
        * that is used on regular scrolling.
        * @property EASING_REGULAR
        * @type {function}
        * @static
        * @default "CubicBezier(0.33, 0.66, 0.66, 1)"
        */
        EASING_REGULAR = CubicBezier(0.33, 0.66, 0.66, 1),

        /**
        * Default parametrized CubicBezier function curve 
        * that is used when the scroller goes out of limits.
        * @property EASING_BOUNCE
        * @type {function}
        * @static
        * @default "CubicBezier(0.33, 0.33, 0.66, 0.81)"
        */
        EASING_BOUNCE  = CubicBezier(0.33, 0.33, 0.66, 0.81),

        /**
        * Wraps EASING_REGULAR and EASING_BOUNCE 
        * with the corresponding string representation.
        *
        * @property EASING
        * @type {Object}
        * @static
        * @final
        * @default "{regular: {}, bounce: {}}"
        */
        EASING = {
            regular : {
                style : EASING_REGULAR.toString(),
                fn    : EASING_REGULAR
            },
            bounce : {
                style : EASING_BOUNCE.toString(),
                fn    : EASING_BOUNCE
            }
        },

        /**
        * Specifies the minimum velocity required to scroll. 
        *
        * @property MIN_VELOCITY
        * @type {float}
        * @static
        * @default "0.1"
        */
        MIN_VELOCITY          = 0.1,

        /**
        * Specifies the acceleration constant px/ms².
        *
        * @property ACCELERATION_CONSTANT
        * @type {float}
        * @static
        * @default "0.0005"
        */
        ACCELERATION_CONSTANT = 0.0005,

        /**
        * Specifies the mouse wheel speed.
        *
        * @property MOUSE_WHEEL_SPEED
        * @type {integer}
        * @static
        * @default "20"
        */
        MOUSE_WHEEL_SPEED     = 20,

        /**
        * Specifies whether or not mouse wheel movements should be inverted.
        *
        * @property MOUSE_WHEEL_INVERTED
        * @type {boolean}
        * @static
        * @default "false"
        */
        MOUSE_WHEEL_INVERTED  = false;

    /**
    * Scroller class that provides the core logic for scrolling.
    *
    * @class Scroller
    * @param el {HTMLElement} DOM element to attach the Scroller.
    * @param config {Object} Object literal with initial attribute values.
    * @constructor
    */
    function Scroller (el, config) {
        config || (config = {});
        
        this._initializeScroller();
        this._setConfig(config);
        this._setElement(el);
        this._setSize();
        this._initializePlugins(config);
        this._initialize();

        this._handleEvents('bind');
    }

    // Attach and expose Statics into the Scroller Class
    Scroller.DEFAULTS              = DEFAULTS;
    Scroller.CubicBezier           = CubicBezier;
    Scroller.EASING_REGULAR        = EASING_REGULAR;
    Scroller.EASING_BOUNCE         = EASING_BOUNCE;
    Scroller.EASING                = EASING;
    Scroller.MIN_VELOCITY          = MIN_VELOCITY;
    Scroller.ACCELERATION_CONSTANT = ACCELERATION_CONSTANT;
    Scroller.SCROLL_VERTICAL       = SCROLL_VERTICAL;
    Scroller.SCROLL_HORIZONTAL     = SCROLL_HORIZONTAL;
    Scroller.MOUSE_WHEEL_SPEED     = MOUSE_WHEEL_SPEED;
    Scroller.MOUSE_WHEEL_INVERTED  = MOUSE_WHEEL_INVERTED;
    Scroller.Logger                = Logger;
    Scroller.plugins               = PLUGINS;


    /**
    * Register a plugin in to the global registry
    * so all scrollers can plug it anytime.
    * @static
    * @method registerPlugin
    * @public
    */
    Scroller.registerPlugin = function (name, plugin) {
        if (this.plugins[name]) {
            Logger.log('Overriding plugin: ', name);
        }
        this.plugins[name] = plugin;
    };

    Scroller.prototype = {
        /**
        * Called in the constructor.
        * Initializes the internal state of the instance.
        *
        * @method _initializeScroller
        * @private
        */
        _initializeScroller: function () {
            this._events = {};
            this.x       = 0;
            this.y       = 0;
        },
        /**
        * Called in the constructor.
        * Fires an event to nofify plugins 
        * that they can initialize themselves.
        *
        * @method _initialize
        * @private
        */
        _initialize: function () {
            this._fire('_initialize');
        },
        /**
        * Initializes the plugins provided in the configuration object.
        * By default the scroller tries to initialize core plugins, such as
        * `SurfaceManager,` `PullToRefresh,` and `PullToLoadMore`.
        *
        * @method _initializePlugins
        * @param cfg {Object} Scroller configuration object
        * @private
        */
        _initializePlugins: function (cfg) {
            var userPlugins    = this.opts.plugins,
                SurfaceManager = PLUGINS.SurfaceManager,
                PullToRefresh  = PLUGINS.PullToRefresh,
                PullToLoadMore = PLUGINS.PullToLoadMore,
                enableSM       = !this.opts.useCSSTransition && this.opts.gpuOptimization,
                enablePTR      = this.opts.onPullToRefresh,
                enablePTL      = this.opts.onPullToLoadMore;
            
            if (enablePTR && PullToRefresh)  {
                this.plug(PullToRefresh);
            }
            if (enablePTL && PullToLoadMore) {
                this.plug(PullToLoadMore);
            }
            if (enableSM  && SurfaceManager) {
                this.plug(SurfaceManager);
            }

            if (userPlugins) {
                userPlugins.forEach(function (plugin) {
                    this.plug(plugin);
                }, this);
            }
        },
        /**
        * Returns wether or not to obserChanges on the DOM
        * By default `observeDomChanges` will be enabled 
        * unless `gpuOptimization` is set to true.
        *
        * @method _observeChanges
        * @return {Boolean} Boolean to wether observe changes or not.
        * @protected
        */
        _observeChanges: function () {
            return window.MutationObserver && this.opts.observeDomChanges && !this.opts.gpuOptimization;
        },
        /**
        * Creates a MutationObserver object and 
        * sets it to observe the Scoller wrapper elelement.
        *
        * @method _initializeDOMObserver
        * @private
        */
        _initializeDOMObserver: function () {
            var self     = this,
                config   = this.opts.observeDomConfig,
                observer = this.observer = new MutationObserver(function () {
                    self._observedDOMChange.apply(self, arguments);
                });

            observer.observe(this.wrapper, config);
        },
        _observedDOMChange: function (e) {
            this.refresh(ACION_DOM_MUTATION);
        },
        /**
        * Helper method to merge two object configurations.
        * Relies on the `Helpers` utility module.
        *
        * @method _initializePlugins
        * @param cfg {Object} Configuration base
        * @param toMerge {Object} Configuration to merge
        * @return {Object} An object that merges both configuration properties.
        * @private
        */
        _mergeConfigOptions: function (cfg, toMerge) {
            return HELPERS.simpleMerge(cfg, toMerge);
        },

        /**
        * Enables or disables the scroller
        *
        * @method setEnable
        * @param enabled {Boolean} Enablement.
        * @private
        */
        setEnable: function (enabled) {
            this.enabled = enabled;
        },
        /**
        * Merges the default configuration with the configuraton provided by the 
        * user and attaches the options to the instances.
        * Also copies some options directly to the instance for easy access to them.
        *
        * @method _setConfig
        * @param cfg {Object} Configuration base
        * @private
        */
        _setConfig: function (cfg) {
            var opts = this.opts = this._mergeConfigOptions(DEFAULTS, cfg);

            this.enabled               = opts.enabled;
            this.scroll                = opts.scroll;
            this.itemHeight            = opts.itemHeight;
            this.itemWidth             = opts.itemWidth;

            this.acceleration          = opts.acceleration || ACCELERATION_CONSTANT;
            this.scrollVertical        = this.scroll === SCROLL_VERTICAL;
            this.scrollHorizontal      = this.scroll === SCROLL_HORIZONTAL;

            // Guard for missconfigurations

            if (opts.infiniteLoading && opts.pullToLoadMore) {
                Logger.log(
                    'You cannot have infiniteLoading and pullToShowMore at the same time.' +
                    'Switching to infiniteLoading');
                this.opts.pullToLoadMore = false;
            }

            if (this.scrollHorizontal && (opts.pullToRefresh || opts.pullToLoadMore)) {
                Logger.log(
                    'The attributes: pullToRefresh or pullToShowMore are not available in horizontal mode yet.'+
                    ' Switching them to false');

                this.opts.pullToRefresh  = false;
                this.opts.pullToLoadMore = false;
            }

            if (this.opts.scroll === SCROLL_BIDIRECTIONAL) {
                this.opts.debounce = false;
            }
        },
        /**
        * Finds the DOM element where the scroller will be hosted. 
        * The provided element will be the `scroller-wrapper` 
        * and the first child is the one that performs the scroll.
        * This method also sets the proper class to the wrapper, depending 
        * on `scrollDirection` set in the configuration.
        *
        * @method _setElement
        * @param el {string|HTMLElement} Element to which the scroller is attached
        * @private
        */
        _setElement: function (el) {
            this.wrapper       = typeof el === 'string' ? w.document.querySelector(el) : el;
            this.scroller      = this.wrapper.children[0];
            this.scrollerStyle = this.scroller.style;

            var scrollDirection = this.scroll === SCROLL_BIDIRECTIONAL ? 'scroll-bidirectional' : 
                                  this.scrollVertical ? 'scroll-vertical' : 'scroll-horizontal';

            // Add default classes
            this.scroller.classList.add('scroller');
            this.wrapper.classList.add('scroller-wrapper');
            this.wrapper.classList.add(scrollDirection);

            if (this.opts.useNativeScroller) {
                this.wrapper.classList.add('native');
            }
        },
        /**
        * Queries the wrapper element to get the updated size, in width and height.
        * The element must be in the DOM to get the right measurement.
        * The scroller won't work correctly if this attribute is set incorrectly.
        *
        * @method _setWrapperSize
        * @private
        */
        _setWrapperSize: function () {
            var oldSize        = this.wrapperSize;
            this.wrapperWidth  = this.wrapper.clientWidth;
            this.wrapperHeight = this.wrapper.clientHeight;
            this.wrapperSize   = this.scrollVertical ? this.wrapperHeight : this.wrapperWidth;

            if (this.opts.gpuOptimization && this.opts.useNativeScroller && oldSize !== this.wrapperSize) {
                this.scroller.style.height = this.wrapperSize + 'px';
            }
            
        },
        /**
        * Sets the overall sizes of the scroller.
        * Calculates the actual scrollable area and sets the proper internal state.
        * Note that this has a small dependency on the `PullToLoadMore` plugin.
        *
        * @method _setWrapperSize
        * @private
        */
        _setSize: function (contentOnly) {
            var scrollerDOM = this.scroller,
                // We need to take into account if the `PullToLoadMore` plugin is active
                // and in that case substract the height from the scrollable area size
                ptl         = this.opts.pullToLoadMore;

            if (!contentOnly) {
                this._setWrapperSize();
                this._sizePullToShowMore();
            }
            // Once all the sizes are accurate, performn the scroll size calculations
            this.scrollerWidth  = scrollerDOM.offsetWidth;
            this.scrollerHeight = ptl ? scrollerDOM.offsetHeight - this.getPTLSize() : scrollerDOM.offsetHeight;

            this.maxScrollX     = this.wrapperWidth  - this.scrollerWidth;
            this.maxScrollY     = this.wrapperHeight - this.scrollerHeight;

            this.maxScrollX     = this.maxScrollX > 0 ? 0 : this.maxScrollX;
            this.maxScrollY     = this.maxScrollY > 0 ? 0 : this.maxScrollY;

            this.hasScrollX     = this.maxScrollX < 0;
            this.hasScrollY     = this.maxScrollY < 0;

        },
        /**
        * To be overriden by the `PullToShowMore` plugin.
        * Calculates the height of `PullToShowMore` so
        * it can be taken into account when calculating the total scrollable size.
        *
        * @method _setPullToShowMore
        * @private
        */
        _sizePullToShowMore: function () {
            //To be overriden
        },
        /**
        * To be overriden by the `PullToShowMore` plugin.
        * Gets the height of `PullToShowMore` so
        * it can be taken into account when calculating the total scrollable size.
        *
        * @method getPTLSize
        * @private
        */
        getPTLSize: function () {
            return 0;
        },

        /**
        * To be overriden by plugins.
        * Gets the numbers of DOM elements appended inside the scroller
        *
        * @method _getCustomAppendedElements
        * @private
        */
        _getCustomAppendedElements: function () {
            return 0;
        },

        /**
        * Private destroy function that is responsible for the destruction of the
        * instance itself. 
        * The plugins destroy themselves, as triggered by the public
        * `destroy` method.
        *
        * @method _destroy
        * @private
        */
        _destroy: function () {
            this._handleEvents('unbind');
        },

    /* 
    * ==================================================
    * Event handling and bindings
    * ================================================== 
    */
        /**
        * When scrolling using native CSS (webkit-overflow-scrolling: touch), 
        * iOS will bounce the viewport if you are in the top, which is pretty annoying
        * We can't prevent default because that will break the scrolling itself,
        * so we just detect on touchStart if is on 0 and we set it to 1
        *
        * @param event {TouchEvent} DOM Event
        * @method _iosScrollFixture
        * @private
        */
        _iosScrollFixture: function (e) {
            if (this.scroller.scrollTop === 0) {
                this.scroller.scrollTop = 1;
            }
        },
        /**
        * Add or remove all of the neccesary event listeners, based on the provided configuration.
        *
        * @param action {string} Action to bind or unbind events
        * @method _handleEvents
        * @private
        */
        _handleEvents: function (action) {
            var self      = this,
                eventType = action === 'bind' ? HELPERS.bind : HELPERS.unbind,
                wrapper   = this.wrapper,
                target    = this.opts.bindToWrapper ? wrapper : window,
                pHandlers = false, // pointerHandlers flag
                scroller  = this.scroller;

            eventType(window, 'orientationchange', this);
            eventType(window, 'resize', this);

            if (this._observeChanges()) {
                this._initializeDOMObserver();
            }

            if (this.opts.useNativeScroller) {
                var scrollTarget = this.opts.gpuOptimization ? this.scroller : this.wrapper;
                eventType(scrollTarget, 'scroll', this);
                if (IS_IOS && !this.opts.pullToRefresh) {
                    eventType(wrapper, 'touchstart', function (e) {self._iosScrollFixture.apply(self, arguments);});
                }
                return;
            }

            // Touch interaction handlers

            if (SUPPORT.touch && !this.opts.disableTouch) {
                eventType(wrapper, 'touchstart',  this);
                eventType(target,  'touchmove',   this);
                eventType(target,  'touchcancel', this);
                eventType(target,  'touchend',    this);
            }

            if ((SUPPORT.pointers || SUPPORT.msPointers) && !this.opts.disablePointers) {
                if (SUPPORT.pointers) {
                    eventType(wrapper, 'pointerdown',   this);
                    eventType(target,  'pointermove',   this);
                    eventType(target,  'pointercancel', this);
                    eventType(target,  'pointerup',     this);
                } else {
                    eventType(wrapper, 'MSPointerDown',   this);
                    eventType(target,  'MSPointerMove',   this);
                    eventType(target,  'MSPointerCancel', this);
                    eventType(target,  'MSPointerUp',     this);
                }
                pHandlers = true;
            }

            // Surface devices can have both mouse and pointer events
            if (!this.opts.disableMouse && (!pHandlers || (pHandlers && this.opts.dualListeners))) {
                eventType(wrapper, 'mousedown',   this);
                eventType(target,  'mousemove',   this);
                eventType(target,  'mousecancel', this);
                eventType(target,  'mouseup',     this);
            }

            if (!this.opts.disableWheel && !this.opts.useNativeScroller) {
                eventType(wrapper, 'wheel', this);
                eventType(wrapper, 'mousewheel', this);
                eventType(wrapper, 'DOMMouseScroll', this);
            }

            // TRANSITIONS 

            eventType(this.scroller, 'transitionend', this);
            eventType(this.scroller, SUPPORT.prefix + 'TransitionEnd', this);

            
        },

        /**
        * Fire a custom event by name.
        * The callback functions are executed with the scroller instance as context, and with the parameters listed here.
        * The first argument is the event type and any additional arguments are passed to the listeners as parameters.
        * This is used to notify the plugins of events that occur on the scroller.
        *
        * @param eventType {string} Type of event to be dispatched
        * @param arguments {object} An arbitrary set of parameters to pass to the listeners
        * @method _fire
        * @private
        */
        _fire: function (eventType /*,arguments*/) {
            var eventQueue = this._events[eventType],
                eventFncs  = eventQueue && eventQueue.length,
                params     = Array.prototype.slice.call(arguments, 1),
                ePayload;
                
            if (eventFncs) {
                for (var i = 0; i < eventFncs; i++) {
                    ePayload = eventQueue[i];
                    ePayload.fn.apply(ePayload.context || this, params);
                }
            }
        },

        /**
        * Hook mechanism that allows plugins to run functions before or after 
        * the execution of a particular scroller function.
        *
        * @param when {string} When to execute the hooked function (before|after)
        * @param method {string} Where to perform the hook
        * @param method {function} Hook function to execute
        * @method _hook
        * @private
        */
        _hook: function (when, method, hookFn) {
            var self         = this,
                toHookMethod = this[method];
            
            if (toHookMethod) {
                if (when === HOOK_AFTER) {
                    this[method] = function () {
                        toHookMethod.apply(this, arguments);
                        hookFn.apply(this, arguments);
                    };
                } else if (when === HOOK_BEFORE) {
                    this[method] = function () {
                        hookFn.apply(this, arguments);
                        toHookMethod.apply(this, arguments);
                    };
                }
            }
        },
        /**
        * Handler to dispatch all of the events that the scroller listens to.
        * The browser calls this function if any of the events 
        * registered in _handleEvents are triggered.
        *
        * @param e {event} The event provided by the browser
        * @method handleEvent
        * @private
        */
        handleEvent: function (e) {
            switch (e.type) {
                case 'touchstart':
                case 'pointerdown':
                case 'MSPointerDown':
                case 'mousedown':
                    this._start(e);
                    break;
                case 'touchmove':
                case 'pointermove':
                case 'MSPointerMove':
                case 'mousemove':
                    this._move(e);
                    break;
                case 'touchend':
                case 'pointerup':
                case 'MSPointerUp':
                case 'mouseup':
                case 'touchcancel':
                case 'pointercancel':
                case 'MSPointerCancel':
                case 'mousecancel':
                    this._end(e);
                    break;
                case 'orientationchange':
                case 'resize':
                    this.resize();
                    break;
                case 'transitionend':
                case SUPPORT.prefix + 'TransitionEnd':
                    this._transitionEnd(e);
                    break;
                case 'wheel':
                case 'DOMMouseScroll':
                case 'mousewheel':
                    this._wheel(e);
                    break;
                case 'scroll': 
                    this._nativeScroll(e);
            }
        },
    /* 
    * ==================================================
    * Scroller gestures
    * ================================================== 
    */

        /**
        * Handles the start gesture event.
        *
        * @param e {event} The gesturestart event provided by the browser
        * @method handleEvent
        * @private
        */
        _start: function (e) {
            if ( !this.enabled || (this._initiated && EVENT_TYPE[e.type] !== this._initiated)) {
                return;
            }

            var point = e.touches ? e.touches[0] : e;

            // Reset internal state
            this._initiated      = EVENT_TYPE[e.type]; // Register eventType so we can't prevent conflicts
            this.moved           = false;
            this.distX           = 0;
            this.distY           = 0;
            this.velocity        = 0;
            this.scrollDirection = null;

            this._transitionTime();    // Reset CSS transition timing
            this._isAnimating = false;

            // If we are in the middle of a scrolling we need to stop everything and reset
            if (this._isScrolling) {
                this._stopMomentum();
                this._isScrolling = false;
                this._onStopScrolling(e);
            }

            // Set current position and time
            this.startX         = this.x;
            this.startY         = this.y;
            this.pointX         = point.pageX;
            this.pointY         = point.pageY;
            this.startTime      = NOW();
            this._lastPosition  = this.scrollVertical ? this.startY : this.startX;

            // Fires public event
            this._fire('beforeScrollStart', ACTION_GESTURE_START, e);
        },

        /**
        * Invoked if a gestureStart event occurs while scrolling.
        * By default, it will `preventDefault()` the start event so if a link is clicked, 
        * it won't trigger browser navigation.
        *
        * @param e {event} The gesturemove event provided by the browser
        * @method _onStopScrolling
        * @protected
        */
        _onStopScrolling: function (e) {
            e.preventDefault();
        },
        /**
        * Tracks and calculates the velocity of the gesture between two points in time.
        * Executed when scroller option `debounce: true` in the context of a `requestAnimationFrame` (every ~17ms).
        * It uses the delta for both position and time between the current and previous frames to get the current velocity value,
        * then it applies an exponential moving average filter to weight and smooth out the final velocity.
        * 
        *
        * @param e {event} The gesturemove event provided by the browser
        * @method _trackVelocity
        * @protected
        */
        _trackVelocity: function (t) {
            var lastPos    = this._lastPosition,
                currentPos = this.scrollVertical ? this.y : this.x,
                elapsed    = 17, //ms between frames (RAF calss), hardcoded due to inconsistencies in different devices
                delta      = currentPos - lastPos,
                v;

            this._lastPosition  = currentPos;

            v = delta / elapsed; // velocity relative to this frame

            // Applying exponential moving average filter
            this.velocity = 0.6 * v + 0.4 * this.velocity;
        },
        /**
        * Starts a `requestAnimationFrame` loop when a gestureMove is triggered 
        * to debounce the event from the animation.
        * For each frame, it updates the position and velocity, and 
        * fires a private `_update` event to any plugin listening to it.
        *
        * @method _startMoveRAF
        * @private
        */
        _startMoveRAF: function () {
            var self = this;
            function moveStep (t) {
                self._translate(self.x, self.y);
                self._trackVelocity(t);
                self._update();
                self._fire(ACTION_SCROLL_MOVE, ACTION_GESTURE_MOVE, self.x, self.y);
                self._rafMoving = RAF(moveStep);
            }
            moveStep();
        },
        /**
        * Stops the `requestAnimationFrame` debounce loop when gestureEnd is triggered.
        *
        * @method _endMoveRAF
        * @private
        */
        _endMoveRAF: function () {
            CAF(this._rafMoving);
        },
        /**
        * Fires and broadcasts a private `_update` event.
        * This function is critical for notifying the plugins that the scroller is moving.
        *
        * @method _endMoveRAF
        * @private
        */
        _update: function () {
            //TODO: Standarize when we call this (and align with scrollMove and scrollEnd events)
            this._fire('_update');
        },

        /**
        * Checks if the scroller needs locking (will become inactive).
        * By default, the scroller is locked if `lockOnDirection` is defined 
        * and it matches the current scrollDirection of the gesture.
        * This can be useful when dealing with multiple nested scrollers 
        * which operate in different directions.
        *
        * @method _needsLocking
        * @private
        */
        _needsLocking: function () {
            return  this.opts.lockOnDirection &&
                    this.scrollDirection &&
                    this.opts.lockOnDirection === this.scrollDirection;
        },

        /**
        * Deactivates the scroller for a given gesture and fires the private `lock` event.
        *
        * @method _lockScroller
        * @private
        */
        _lockScroller: function () {
            this._initiated = false;
            this._fire(ACTION_LOCK, this.scrollDirection);
        },

        /**
        * Get the scroll direction once the gesture is bigger than a 
        * given threshold (via the `minDirectionThrehold` option).
        *
        * @param absX {integer} Absolute value of the x coordinate
        * @param absY {integer} Absolute value of the y coordinate
        * @method _getScrollDirection
        * @protected
        */
        _getScrollDirection: function (absX, absY) {
            var treshold = this.opts.minDirectionThreshold;
            this.scrollDirection =
                (absX > absY + treshold) ? SCROLL_HORIZONTAL :
                (absY > absX + treshold) ? SCROLL_VERTICAL :
                null;

            // lock one direction at the time on bidirectional mode
            if (this.scrollDirection && this.opts.lockOnDirection && this.scroll === SCROLL_BIDIRECTIONAL) {
                this.scrollVertical = this.scrollDirection === SCROLL_VERTICAL;
            }

            return this.scrollDirection;
        },

        /**
        * Checks the current position. 
        *
        * @param absX {integer} Current x coordinate
        * @param absY {integer} Current y coordinate
        * @method _isOutOfScroll
        * @private
        */
        _isOutOfScroll: function (x, y) {
            return this.scrollVertical ? (y > 0 || y < this.maxScrollY) : (x > 0 || x < this.maxScrollX);
        },

        /**
        * Normalizes and sets the coordinate that is not being scrolled 
        * to 0 so it moves in one direction only.
        *
        * @param absX {integer} Current x coordinate
        * @param absY {integer} Current y coordinate
        * @method _setNormalizedXY
        * @private
        */
        _setNormalizedXY: function (x, y) {
            if (!this.opts.lockOnDirection && this.scroll === SCROLL_BIDIRECTIONAL) {
                this.x = x;
                this.y = y;
            } else if (this.scrollVertical) {
                this.y = y;
            } else {
                this.x = x;
            }
        },
        /**
        * Handles move gesture event.
        *
        * @param e {event} The gesturemove event provided by the browser
        * @method _move
        * @private
        */
        _move: function (e) {
            // If an element captures onTouchMove and sets "cancelScrolling" to true, Scroller will cancel scrolling.
            if (!this.enabled || (EVENT_TYPE[e.type] !== this._initiated) || e.cancelScrolling) {
                e.scrollDirection = this.scrollDirection; // keep bubbling up the direction if is defined
                return;
            }

            var point     = e.touches ? e.touches[0] : e,
                deltaX    = point.pageX - this.pointX,
                deltaY    = point.pageY - this.pointY,
                timestamp = NOW(),
                newX, newY, absDistX, absDistY;

            // if movement is detected
            if (!this.moved && (deltaX || deltaY)) {
                this.moved = true;
                this._translate(this.x, this.y);
                this._fire('scrollStart', ACTION_GESTURE_START, e); // notify listeners
                if (!this.opts.useCSSTransition || this.opts.debounce) {
                    this._startMoveRAF(); // start requestAnimationFrame for debouncing the move event
                }
            }
            // Update position and state
            this.pointX  = point.pageX;
            this.pointY  = point.pageY;
            this.distX   = this.distX + deltaX;
            this.distY   = this.distY + deltaY;
            absDistX     = Math.abs(this.distX);
            absDistY     = Math.abs(this.distY);
            newX         = this.x + deltaX;
            newY         = this.y + deltaY;

            // Calculate and expose the gesture direction
            e.scrollDirection = this.scrollDirection || this._getScrollDirection(absDistX, absDistY);

            if (this._needsLocking()) {
                this._lockScroller();
                return;
            }

            // If minThrehold is defined, do not start moving until the distance is over it. 
            if (this.opts.minThreshold && (absDistX < this.opts.minThreshold && absDistY < this.opts.minThreshold)) {
                this._fire(ACTION_SCROLL_MOVE, ACTION_GESTURE_MOVE, this.x, this.y, e);
                return;
            }

            // Reduce scrollability (slowdown) when dragging beyond the scroll limits
            if (this._isOutOfScroll(newX, newY)) {
                newY = this.y + deltaY / 3;
                newX = this.x + deltaX / 3;
            }

            // Scroll one direction at the time (set zero values on the other direction)
            this._setNormalizedXY(newX, newY);

            if (this.opts.useCSSTransition && !this.opts.debounce) {
                // If debounce is set to false, we force the browser to update the position every time
                this._translate(this.x, this.y);
                this._fire(ACTION_SCROLL_MOVE, ACTION_GESTURE_MOVE, this.x, this.y, e);

                // The timeStart reset helps keeping track only on the recent past of the gesture
                // which reduces variability and gets a more consistent velocity calculation
                if (timestamp - this.startTime > 300) {
                    this.startTime = timestamp;
                    this.startX = this.x;
                    this.startY = this.y;
                }
            }
        },
        /**
        * Handles end gesture event.
        *
        * @param e {event} The gesturemove event provided by the browser
        * @method _end
        * @private
        */
        _end: function (e) {
            this._endMoveRAF(); // Always cancel the debounce RAF

            if (!this.enabled || !this.moved || (EVENT_TYPE[e.type] !== this._initiated)) {
                this._initiated = false;
                return;
            }

            this._initiated = false;

            var duration = NOW() - this.startTime,
                time     = 0,
                bounce   = EASING.regular,
                momentum;

            // If its outside the scrolling boundaries at this point (pos > 0 || pos < maxScroll),
            // Just snap back (reset the position to be within the scrollable area)
            if (this._resetPosition(this.opts.bounceTime)) {
                return;
            }

            // If we arrive here, is time to scroll!
            this._isScrolling = true;

            // Calculate the momentum {destination, time} based on the gesture
            if (this.scrollVertical) {
                momentum = this._momentum(this.y, this.startY, duration, this.maxScrollY, this.wrapperHeight);
                this._scrollTo(this.x, momentum.destination, momentum.time, momentum.bounce);

            } else if (this.scrollHorizontal) {
                momentum = this._momentum(this.x, this.startX, duration, this.maxScrollX, this.wrapperWidth);
                this._scrollTo(momentum.destination, this.y, momentum.time, momentum.bounce);
            } else {
                // Bidirectional
                var momentumX = this._momentum(this.x, this.startX, duration, this.maxScrollX, this.wrapperWidth),
                    momentumY = this._momentum(this.y, this.startY, duration, this.maxScrollY, this.wrapperHeight);

                this._scrollTo(momentumX.destination, momentumY.destination, Math.max(momentumX.time, momentumY.time), momentumX.bounce);
            }
        },

        /**
        * Handles the wheel event for scrolling.
        *
        * @param e {event} The wheel event provided by the browser
        * @method _wheel
        * @private
        */
        _wheel: function (e) {
            if (!this.enabled) {
                return;
            }
            // Stop browser defaults
            e.preventDefault();
            e.stopPropagation();

            var self                 = this,
                mouseWheelSpeed      = Scroller.MOUSE_WHEEL_SPEED,
                invertWheelDirection = Scroller.MOUSE_WHEEL_INVERTED ? -1 : 1,
                wheelDeltaX, wheelDeltaY, newX, newY;

            // NOTE: The math behind this function was taken from iScroll.
            // Eventually revisit the logic to make sure is cross platform compatible

            if ( 'deltaX' in e ) {
                wheelDeltaX = -e.deltaX;
                wheelDeltaY = -e.deltaY;
            } else if ( 'wheelDeltaX' in e ) {
                wheelDeltaX = e.wheelDeltaX / 120 * mouseWheelSpeed;
                wheelDeltaY = e.wheelDeltaY / 120 * mouseWheelSpeed;
            } else if ( 'wheelDelta' in e ) {
                wheelDeltaX = wheelDeltaY = e.wheelDelta / 120 * mouseWheelSpeed;
            } else if ( 'detail' in e ) {
                wheelDeltaX = wheelDeltaY = -e.detail / 3 * mouseWheelSpeed;
            } else {
                return;
            }

            wheelDeltaX *= invertWheelDirection;
            wheelDeltaY *= invertWheelDirection;

            if (this.scrollHorizontal) {
                wheelDeltaX = wheelDeltaY;
                wheelDeltaY = 0;
            }

            newX = this.x + Math.round(this.hasScrollX ? wheelDeltaX : 0);
            newY = this.y + Math.round(this.hasScrollY ? wheelDeltaY : 0);

            if (newX > 0) {
                newX = 0;
            } else if ( newX < this.maxScrollX ) {
                newX = this.maxScrollX;
            }

            if (newY > 0) {
                newY = 0;
            } else if ( newY < this.maxScrollY ) {
                newY = this.maxScrollY;
            }

            this.x = newX;
            this.y = newY;

            if (!this._rafWheel) {
                this._rafWheel = RAF(function (t) {
                    self._isScrolling = true;
                    self.distY = wheelDeltaY;
                    self.distX = wheelDeltaX;
                    self._wheelRAF(); // Debounce event from animation
                });
            }
        },
        /**
        * Handles the debounce of the wheel event to decouple the event and the actual DOM update.
        *
        * @param e {event} The wheel event provided by the browser
        * @method _wheelRAF
        * @private
        */
        _wheelRAF: function () {
            this._translate(this.x, this.y);
            this._update();
            this._rafWheel    = false;
            this._isScrolling = false;
            this._fire(ACTION_SCROLL_MOVE, ACTION_ANIM_MOVING, this.x, this.y);
        },

        /* 
        * ==================================================
        * Scroller Maths and calculation
        * ================================================== 
        */


        /**
        * Gets the velocity of the gesture.
        * If `debounce:true`, the velocity has been already calculated through `_trackVelocity`.
        * Otherwise, the value is determined from the current state of the scroller.
        *
        * @param current {float} Current position of the scroller
        * @param start {float} Start position of the scroller when the gesture started
        * @param time  {integer Duration of the gesture
        * @method _getVelocity
        * @return {float} Velocity of the gesture
        * @protected
        */
        _getVelocity: function (current, start, time) {
            var v = this.opts.debounce ? this.velocity : ((current - start) / time);
            if (Math.abs(v) < MIN_VELOCITY) { // if the velocity is really low, assume no movement
                v = 0;
            }
            this.velocity = v;
            return v;
        },

        /**
        * Calculates the momentum {destination, time} based on the velocity of the gesture and on the
        * acceleration.
        *
        * @param velocity {float} Velocity of the gesture
        * @param current {float} Current scroller position
        * @method _computeMomentum
        * @return {Object} An object with the destination and time where the scroller should go.
        * @protected
        */
        _computeMomentum: function (velocity, current) {
            var acceleration = this.acceleration,
                time         = Math.abs(velocity) / acceleration, // t = v / a
                distance     = velocity / 2 * time; // ΔX = vt + 1/2 at² = v / 2 * t 

            return {
                destination : current + distance,
                time        : time
            };
        },

        /**
        * Calculates the snap momentum.
        * If the original momentum calculation indicates that the 
        * destination of the scroller is way beyond the scrollable area, 
        * it needs to calculate a momentum that is closer to the boundaries 
        * to create the snap effect.
        * The mathematical function to get the destination is a simple ponderation 
        * of how much px to snap based on the current position and velocity.
        *
        * @param start {float} Minimum or maximum scrollable position
        * @param end {float} Wrapper size (how big the scroller wrapper is)
        * @param velocity {float} Current gesture velocity
        * @param current {float} Current scroller position
        * @method _computeSnap
        * @return {Object} An object with the destination and time where the scroller should snap to.
        * @protected
        */
        _computeSnap: function (start, end, velocity, current) {
            var destination = start + (end / 2) * (velocity / 8);
            return {
                destination : destination,
                time        : Math.abs((destination - current) / velocity)
            };
        },

        /**
        * Calculates the momentum for the current gesture.
        * If the destination of the momentum falls outside of the scrollable region,
        * it calculate the snapping point and the new momentum related to it.
        * @param current {float} Current scroller position
        * @param start {float} Start scroller position
        * @param duration {float} Time of the gesture
        * @param lowerMargin {integer} Maximum/minimum scrollable position
        * @param wrapperSize {integer} Size of the scroller wrapper
        * @method _momentum
        * @return {Object} An object with the destination and time where the scroller should scroll to.
        * @protected
        */
        _momentum: function (current, start, duration, lowerMargin, wrapperSize) {
            var velocity = this._getVelocity(current, start, duration),
                momentum = this._computeMomentum(velocity, current);

            // Beyond the scrollable area (bottom)
            if (momentum.destination < lowerMargin) {
                momentum = this._computeSnap(lowerMargin, wrapperSize, velocity, current);
                momentum.bounce = EASING.bounce;

            // Beyond the scrollable area (top)
            } else if (momentum.destination > 0) {
                momentum = this._computeSnap(0, wrapperSize, velocity, current);
                momentum.bounce = EASING.bounce;
            }

            return momentum;

        },

        /**
        * Stops the scroller inertia while scrolling and
        * establishes the current scroller position.
        *
        * @method _stopMomentum
        * @private
        */
        _stopMomentum: function () {
            var transform  = STYLES.transform,
                transition = STYLES.transition,
                style, matrix, x, y;

            // If we are using CSS transitions, we need to calculate the current 
            // position and reset the transition time.
            if (this.opts.useCSSTransition) {
                style  = w.getComputedStyle(this.scroller, null);
                if (SUPPORT.matrix) {
                    matrix = new STYLES.matrix(style[transform]);
                    this.scrollerStyle[transition] = '';
                    x = matrix.m41;
                    y = matrix.m42;
                } else {
                    matrix = style[transform].split(')')[0].split(', ');
                    x = +(matrix[12] || matrix[4]);
                    y = +(matrix[13] || matrix[5]);
                }
                this._translate(x, y);
            } else {
                // Otherwise we are using animation 
                // Cancel RAF
                CAF(this._rafReq);
            }
        },

        /**
        * Checks whether or not a custom reset position is needed.
        * Used to decouple `pullToRefresh` and `pullToLoadMore`
        * functionality as much as possible.
        *
        * @method _customResetPosition
        * @protected
        */
        _customResetPosition: function () {
            return this.opts.pullToRefresh || this.opts.pullToLoadMore;
        },

        /**
        * Checks whether or not a custom reset position is needed if the scroller is
        * outside the boundaries.
        * Used to decouple `pullToRefresh` and `pullToLoadMore`
        * functionality as much as possible.
        * @param time {integer} Default time for the scroll in case a snap is needed
        * @method _resetPosition
        * @protected
        */
        _resetPosition: function (time, forceReset) {
            time || (time = 0);

            var x = this.x,
                y = this.y,
                custom;

            // TODO: Find a way to decouple completely pullToRefresh and pullToLoadMore
            if (this._customResetPosition()) {
                if (this.opts.pullToRefresh && this.isTriggeredPTR()) {
                    custom = this.getResetPositionPTR();
                } else if (this.opts.pullToLoadMore && this.isTriggeredPTL()) {
                    custom = this.resetPositionPTL();
                }
            }

            if (custom) {
                y    = custom.y;
                x    = custom.x;
                time = custom.time || time;

            } else {
                // Outside boundaries top
                if (!this.hasScrollY || this.y > 0) {
                    y = 0;

                // Outside boundaries bottom
                } else if (this.y < this.maxScrollY) {
                    y = this.maxScrollY;
                }

                // Outsede left
                if (!this.hasScrollX || this.x > 0 ) {
                    x = 0;

                // Outside right
                } else if (this.x < this.maxScrollX) {
                    x = this.maxScrollX;
                }
            }

            if (y === this.y && x === this.x) {
                return false;
            }

            this._scrollTo(x, y, time, EASING.regular);
            return true;
        },

        /**
        * Sets the transition easing function property into the scroller node.
        * 
        * @param easing {integer} String representation of the CSS easing function
        * @method _transitionEasing
        * @private
        */
        _transitionEasing: function (easing) {
            this.scrollerStyle[STYLES.transitionTimingFunction] = easing;
        },

        /**
        * Sets the transition time property into the scroller node.
        * 
        * @param time {integer} Time or duration of the transition
        * @method _transitionTime
        * @private
        */
        _transitionTime: function (time) {
            time || (time = 0);
            this.scrollerStyle[STYLES.transitionDuration] = time + 'ms';
        },
        /**
        * Sets the current position in the CSS matrix3d transform.
        * We use matrix3d to force GPU acceleration and to allow plugins to easily
        * manipulate the matrix later on.
        * 
        * @param x {integer} Position for x coordinate 
        * @param y {integer} Position for y coordinate 
        * @method _translate
        * @protected
        */
        _translate: function (x, y) {
            if (!this.opts.useNativeScroller || this.forceTranslate) {
                // TODO: We use translate3d here due to a bug in compositing layers on iOS 8.1.x
                // Revert this back once the bug is fixed.
                // this.scrollerStyle[STYLES.transform] = 'matrix3d(1,0,0,0,0,1,0,0,0,0,1,0,' + x +',' + y +', 0, 1)';
                this.scrollerStyle[STYLES.transform] = 'translate3d(' + x +'px,' + y +'px, 0)';    
            } else {
                this._wrapperScrollTo(x, y);
            }

            this.x = x;
            this.y = y;
        },
        /**
        * Handler invoked by the transitionEnd event when the scroller reached an end
        * (this is used when `cssTransition:true`).
        * 
        * @param e {event} The transitionEnd event provided by the browser
        * @method _transitionEnd
        * @protected
        */
        _transitionEnd: function (e) {
            if (this.opts.useCSSTransition && e.target === this.scroller) {
                this._transitionTime();
                if (!this._resetPosition(this.opts.bounceTime)) {
                    this._isScrolling  = false;
                    this._fire('scrollEnd', ACTION_ANIM_END);
                }
            }
        },

        /**
        * Performs a custom animation given a function and
        * using `requestAnimationFrame` as a way to interpolate points in time.
        * The provided function must be continuous between [0,1] and images f(x)
        * should also be within [0, 1].
        * By default the scroller uses `CubicBezier` function curves with the parameters
        * defined in the EASING static variables.
        *
            * @param x {float} The x-position to scroll to
            * @param y {float} The y-position to scroll to
            * @param duration {float} The duration of the animation
            * @param easingFn {function} A function that images x values within [0,1] range
        * @method _animate
            * @private
        */
        _animate: function (x, y, duration, easingFn) {
            var self      = this,
                startX    = this.x,
                startY    = this.y,
                startTime = NOW(),
                deltaX    = x - startX,
                deltaY    = y - startY,
                destTime  = startTime + duration;

            function step () {
                var now = NOW(),
                    newX, newY, easing;

                if (now >= destTime) { // Finish the animation here
                    self._isAnimating = false;
                    self._rafReq = null;
                    self._translate(x, y);

                    // Snap back if we are out of boundaries
                    if (!self._resetPosition(self.opts.bounceTime)) {
                        self._fire('scrollEnd', ACTION_ANIM_END);
                        self._isScrolling = false;
                    }
                    return;
                }

                // `now` will the percentage of completion in the [0,1] range
                now    = ( now - startTime ) / duration;
                easing = easingFn(now); // Get f(x) => y position

                // Calculate new position based on the result of the function
                // and the start position.
                newX = deltaX * easing + startX;
                newY = deltaY * easing + startY;

                // Set the new position and notify changes
                self._translate(newX, newY);
                self._fire(ACTION_SCROLL_MOVE, ACTION_ANIM_MOVING, newX, newY);
                self._update();

                if (self._isAnimating) {
                    self._rafReq = RAF(step);
                }
            }

            this._isAnimating = true;
            step();
        },

        /**
        * Prepend an Array of elements into the scroller.
        * This function is overriden by SurfaceManager to allow a custom DOM manipulation.
        * @param items {HTMLElement[]} Array of items to insert in the scroller
        * @method _prependData
        * @protected
        */
        _prependData: function (items) {
            var docfrag = w.document.createDocumentFragment(),
                scrollerContainer = this.scroller,
                ptrContainer = scrollerContainer.firstChild;

            items.forEach(function (i) {
                docfrag.appendChild(i);
            });

            if (scrollerContainer.lastChild === ptrContainer) {
                scrollerContainer.appendChild(docfrag);
            } else {
                scrollerContainer.insertBefore(docfrag, ptrContainer.nextSibling);
            }
        },

        /**
        * Append an Array of elements into the scroller.
        * This function is overriden by SurfaceManager to allow a custom DOM manipulation.
        * @param items {HTMLElement[]} Array of items to insert in the scroller
        * @method _appendData
        * @protected
        */
        _appendData: function (items) {
            var docfrag           = w.document.createDocumentFragment(),
                scrollerContainer = this.scroller,
                i;

            for (i = 0 ; i < items.length; i++) {
                docfrag.appendChild(items[i]);
            }
            scrollerContainer.appendChild(docfrag);
        },
        /**
        * Scroll to a {x,y} position, given a specific time and easing function.
        * If `useCSSTransition: true`, the CSS changes are applied to the scroller.
        * Otherwise, an animation that interpolates
        * positions using `requestAnimationFrame` is triggered.
        *
        * @param x {float} The x-position to scroll to
        * @param y {float} The x-position to scroll to
        * @param time {float} Duration of the animation
        * @param easingFn {function} An easing function (if not provided, regular CubicBezier is used)
        * @method _scrollTo
        * @private
        */
        _scrollTo: function (x, y, time, easing) {
            easing || (easing = EASING.regular);

            if (!time || this.opts.useCSSTransition) {
                this._transitionEasing(easing.style);
                this._transitionTime(time);
                this._translate(x, y);
                this._update();
                if (!time) {
                    this._isScrolling = false;
                    this._fire(ACTION_GESTURE_END);
                } else {
                    this._fire(ACTION_ANIM_START, ACTION_ANIM_START);
                }
            } else {
                this._animate(x, y, time, easing.fn);
            }
        },
        _nativeScroll: function (e) {
            if (SUPPORT.isIOS) {
                this._nativeScrollIOS(e);
            } else {
                this._nativeScrollRAF(e);
            }
        },
        _nativeScrollIOS: function (e) {
            if (!this._rafNativeScroll) {
                this._rafNativeScroll = RAF(this._nativeScrollRAF.bind(this, e));
            }
        },
        _nativeScrollRAF: function (e) {
            var scrollTarget = this.opts.gpuOptimization ? this.scroller : this.wrapper,
                x = -scrollTarget.scrollLeft,
                y = -scrollTarget.scrollTop;

            this._isScrolling = true;
            
            this.distX = x - this.x;
            this.distY = y - this.y;
            
            this.x = x;
            this.y = y;
            
            this._update();
            this._fire(ACTION_SCROLL_MOVE, ACTION_SCROLL, x, y, e);

            this._isScrolling = false;
            this._rafNativeScroll = false;
        },

        /**
         * Scroll to a {x,y} position using the wrapper's scrollTop and scrollLeft attributes.
         *
         * @param x {float} The x-position to scroll to
         * @param y {float} The y-position to scroll to
         * @method _wrapperScrollTo
         * @private
         *
         * TODO: Integrate with open source scroller in 196
         */
        _wrapperScrollTo: function(x, y) {
           this.wrapper.scrollTop = this.scrollVertical ? Math.abs(y) : this.wrapper.scrollTop;
           this.wrapper.scrollLeft = this.scrollVertical ? this.wrapper.scrollLeft : Math.abs(x);
        },

        /**
        * Prepend an Array of elements into the scroller.
        * This function is overriden by SurfaceManager to allow a custom DOM manipulation.
        * @param eventType {string} Event name
        * @param fn {function} The callback to execute in response to the event
        * @param [context] {object} Override `this` object in callback
        * @method on
        * @public
        */
        on: function (eventType, fn, context) {
            var eventQueue = this._events[eventType] || (this._events[eventType] = []);
            eventQueue.push({
                fn      : fn,
                context : context
            });
        },

        /**
        * Update the scroller size.
        * Called automatically when the browser fires a `resize` or an `orientationChange` event.
        * @method resize
        * @public
        */
        resize: function () {
            var self = this;
            RAF(function () {
                // NOTE: Check the translate(0,0), we do it so when we get narrow width,
                // The scroll position may not exist anymore
                // We should be able to calculate the new (x,y) position
                self._translate(0,0);
                self._setSize();
            });
        },

        /**
        * Refreshes the scroller size and fires a private `_refresh` event so plugins can update themselves. 
        * This method is meant to be called when something in the DOM has changed to 
        * notify the scroller that it needs to recalculate its size and to set the correct internal state.
        * @method refresh
        * @public
        */
        refresh: function () {
            var self = this;
            if (!this._rafRefresh) {
                this._rafRefresh = RAF(function () { // debounce the refresh
                    self._fire('_refresh');
                    self._setSize();
                    self._rafRefresh = null;
                });
            }
        },
        /**
        * Adds a plugin to the scroller.
        *
        * A plugin can be a constructor function with its prototype or just a regular object. The scroller
        * merges these methods with its own (with the exception of a method called `init`).
        *
        * If an `init` method is provided, the scroller automatically calls it to
        * let the plugin initialize, attach custom events, and set the right state.
        * @param plugin {Function | Object} Plugin to inject into the scroller
        * @method plug
        * @public
        *
        * @example
            var scroller = new Scroller('#wrapper', {myCustomOption: 'yay!'});

            scroller.plug({
                init: function () {
                    this.on('_update', this._myPluginUpdate);
                },
                _myPluginUpdate: function () {
                    console.log(this.opts.myCustomOption + this.y);
                }
            });
            
        **/
        plug: function (plugin) {
            var ScrollerPlugin  = typeof plugin === 'string' ? PLUGINS[plugin] : plugin,
                PluginPrototype = (ScrollerPlugin && ScrollerPlugin.prototype) || ScrollerPlugin, // try to get the prototype if it has one
                whiteList       = ['init'],
                methodName;

            if (PluginPrototype) {
                for (methodName in PluginPrototype) {
                    if (whiteList.indexOf(methodName) === -1) {
                        this[methodName] = PluginPrototype[methodName];
                    }
                }

                if (PluginPrototype.init) {
                    PluginPrototype.init.call(this);
                }
            } else {
                console.log('Error adding plugin:', plugin);
            }
        },

        /**
        * Scroll to a {x,y} position given a specific time and easing function.
        *
        * @param x {float} The x-position to scroll to
        * @param y {float} The y-position to scroll to
        * @param [time] {float} ms of the scroll animation
        * @param [easingFn] {function} An easing equation if time is set (default is the `easing` attribute)
        * @method scrollTo
        * @public
        */
        scrollTo: function (x, y, time) {
            if (this.x !== x || this.y !== y) {
                this._stopMomentum();

                //emulate gesture
                this.distX = x - this.x;
                this.distY = y - this.y;
                this._isScrolling = true;

                this._scrollTo.apply(this, arguments);
            }
        },

        /**
        * Scroll to the top of the scroller.
        *
        * @param [time] {float} ms of the scroll animation
        * @param [easingFn] {function} An easing equation if time is set (default is the `easing` attribute)
        * @method scrollToTop
        * @public
        */
        scrollToTop: function (time, easing) {
            this.scrollTo(0, 0, time, easing);
        },

        /**
        * Scroll to the bottom of the scroller.
        *
        * @param [time] {float} ms of the scroll animation
        * @param [easingFn] {function} An easing equation if time is set (default is the `easing` attribute)
        * @method scrollToBottom
        * @public
        */
        scrollToBottom: function (time, easing) {
            var x = this.maxScrollX,
                y = this.maxScrollY;
            if (this.scrollVertical) {
                x = 0;
            } else {
                y = 0;
            }

            this.scrollTo(x, y, time, easing);
        },
        /**
        * Prepend items to the scroller.
        *
        * It's recommended to use this method to add content to the scroller
        * instead of manually adding it to the DOM directly,
        * because the scroller will be able to optimize the rendering lifecycle depending on the configuration.
        *
        * @param data {HTMLElement | HTMLElement[] | String} Elements to prepend into the scroller
        * @method prependItems
        * @public
        */
        prependItems: function (data) {
            var parsedData = HELPERS.parseDOM(data);
            if (parsedData) {
                this._prependData(parsedData);
                this._setSize();
            }
        },
        /**
        * Append items to the scroller.
        *
        * It's recommended to use this method to add content to the scroller
        * instead of manually adding it to the DOM directly,
        * because the scroller will be able to optimize the rendering lifecycle depending on the configuration.
        *
        * @param data {HTMLElement | HTMLElement[] | String} Elements to append into the scroller
        * @method appendItems
        * @public
        */
        appendItems: function (data) {
            var parsedData = HELPERS.parseDOM(data);
            if (parsedData) {
                this._appendData(parsedData);
                this._setSize();
            }
        },
        /**
        * Destroy lifecycle method. Fires the `_destroy` event prior to invoking the destructor on itself.
        *
        * @method destroy
        * @public
        */
        destroy: function () {
            this._destroy();
            this._fire('destroy');
        }
    };

    w.Scroller = SCROLLER.constructor = Scroller;

}