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

function lib(w) {
    'use strict';
    w || (w = window);
    
    // NAMESPACES
    var SCROLLER = w.__S || (w.__S = {}),
        RAF      = w.requestAnimationFrame,
        PLUGINS  = SCROLLER.plugins || (SCROLLER.plugins = {}),
        STYLES   = SCROLLER.styles,
        HELPERS  = SCROLLER.helpers,
        SUPPORT  = SCROLLER.support,

        // Enum of the types of PTR (pullToRefresh) we support:
        PTR_TYPE = {
            'synthetic': 'synthetic', // The default PTR built in the scroller
            'native'   : 'native', // PTR done for nativeScrolling (adds some special logic)
            'ios'      : 'ios' // In iOS we can leverage the momentum and snap to do native PTR
        },
        CONFIG_DEFAULTS = {
            labelPull     : 'Pull down to refresh...',
            labelClick    : 'Tap to refresh...',
            labelRelease  : 'Release to refresh...',
            labelUpdate   : 'Updating...',
            labelSubtitle : '',
            labelError    : 'Error on pull to refresh',
            type          : undefined // TBD at instanciation type from PTR_TYPE
        },
        PULL_TO_SNAP_TIME  = 200,
        ERROR_TIMEOUT      = 1000,
        CLASS_UPDATE_STATE = 'update',
        CLASS_PULL_STATE   = 'pull',
        CLASS_ICON         = 'icon',
        CLASS_ERROR        = 'error',
        CLASS_LABEL        = 'label',
        CLASS_SUBTITLE     = 'sub',
        CLASS_PTR          = 'pullToRefresh';
    
    function PullToRefresh() {}

    PullToRefresh.DEFAULTS = CONFIG_DEFAULTS;

    PullToRefresh.prototype = {
        init: function () {
            this._mergePullToRefreshConfig();
            this.on('_initialize', this._initializePullToRefresh);
            this.on('scrollMove', this._onScrollMovePTR);
            this.on('_customResetPosition', this._onResetPositionPTR);
            this.on('destroy', this._destroyPTR);
            //this.on('_refresh', this._onRefreshPTR); //this is done conditionally on initializePTR
        },
        _getPTRType: function () {
            var nativeScroller = this.opts.useNativeScroller;
            if (!nativeScroller) {
                this._synthPTR = true;
                return PTR_TYPE.synthetic;
            } else if (SUPPORT.isIOS) {
                this._iosPTR = true;
                return PTR_TYPE.ios;
            } else {
                this._nativePTR = true;
                return PTR_TYPE['native'];
            }
        },
        _mergePullToRefreshConfig: function () {
            var ptrConfig = this._mergeConfigOptions(CONFIG_DEFAULTS, this.opts.pullToRefreshConfig);
            if (ptrConfig.type === undefined) {
                ptrConfig.type = this._getPTRType();
            }
            this.opts.pullToRefreshConfig = ptrConfig;
        },
        _createPullToRefreshMarkup: function () {
            var self          = this,
                ptr_container = w.document.createElement('div'),
                pullLabel     = this.opts.pullToRefreshConfig.labelPull,
                clickLabel    = this.opts.pullToRefreshConfig.labelClick,
                actionLabel   = this._nativePTR ? clickLabel : pullLabel,
                subtitleLabel = this.opts.pullToRefreshConfig.labelSubtitle;

            ptr_container.appendChild(HELPERS.createLabel(CLASS_ICON, ""));
            ptr_container.appendChild(HELPERS.createLabel(CLASS_LABEL, actionLabel));
            ptr_container.appendChild(HELPERS.createLabel(CLASS_SUBTITLE, subtitleLabel));

            ptr_container.className = 'pullToRefresh';

            if (this._nativePTR) {
                ptr_container.addEventListener('click', function (e) {
                    self.triggerPTR();
                });
            }

            return ptr_container;
        },
        _initializePullToRefresh: function () {
            if (this._iosPTR) {
                this._bindTouchEventsIOS();
                this.on('_refresh', this._onRefreshPTR);
            } else if (this._nativePTR) {
                this.on('_refresh', this._onRefreshPTR);
            }

            this._appendPullToRefresh();
        },
        _destroyPTR: function () {
            // We may want to destroy the touchEvents in case of iOS?
            // altough all modern browsers do the right thing here...
        },
        _bindTouchEventsIOS: function () {
            this.on('scrollEnd', this._onScrollEndPTR);

            HELPERS.bind(this.wrapper, 'touchstart', function (e) {
                if (this.y >= 0) {
                    this._start(e);
                    this.forceTranslate = true;
                }
            }.bind(this));

            HELPERS.bind(this.wrapper, 'touchmove', function (e) {
                var point = e.touches ? e.touches[0] : e,
                    x     = point.pageX - this.pointX,
                    y     = point.pageY - this.pointY;

                if (this._iosTouching || (y > 0 && this.scroller.scrollTop === 0)) {
                    e.preventDefault();
                    this._iosTouching = true;
                    e.preventDefault();
                    this._move(e);
                }
            }.bind(this));

            HELPERS.bind(this.wrapper, 'touchend', function (e) {
                this._iosTouching = false;
                this._end(e);
            }.bind(this));
            
        },
        //TODO: FIX clicking for PTR
        _appendPullToRefresh: function () {
            var ptr_container = this._createPullToRefreshMarkup(),
                onWrapper     = this._iosPTR,
                target        = onWrapper ? this.wrapper : this.scroller;

            if (target.firstChild) {
                target.insertBefore(ptr_container, target.firstChild);
            } else {
                target.appendChild(ptr_container);
            }

            this.ptrDOM   = ptr_container;
            this.ptrIcon  = ptr_container.getElementsByClassName(CLASS_ICON)[0];
            this.ptrLabel = ptr_container.getElementsByClassName(CLASS_LABEL)[0];

            this._ptrSize     = ptr_container.offsetHeight; //relayout
            this._ptrSnapTime = PULL_TO_SNAP_TIME;

            if (this._nativePTR) {
                var ptrSize = this.getPTRSize();
                this.ptrDOM.style.position = 'relative';
                if (this.scrollerHeight <= this.wrapperHeight) {
                    this.ptrDOM.style[STYLES.transform] = 'translate3d(0,' + ptrSize + 'px,0)';
                }
                this.scrollTo(0, ptrSize);
            }

            this.togglePullToRefresh(this.opts.pullToRefresh, true);
        },
        _onResetPositionPTR: function (time) {
            if (this._ptrTriggered) {
                var y    = this._getPTRSize();

                time = time || this._getPTRSnapTime();
                this.scrollTo(0, y, time);
            } else {
                this._resetPosition(time, true);
            }
        },
        _onRefreshPTR: function () {
            var pos = this.y,
                scrollTarget;
            if (this._nativePTR) {
                scrollTarget = this.opts.gpuOptimization ? this.scroller : this.wrapper;
                pos = scrollTarget.scrollTop;
                this.y = -pos;
            }
            
            if (pos === 0 && !this._ptrLoading) {
                this.scrollTo(0, -this.getPTRSize());
            }
        },
        _setPTRLoadingState: function (enable) {
            var updateLabel = this.opts.pullToRefreshConfig.labelUpdate,
                pullLabel   = this.opts.pullToRefreshConfig.labelPull,
                clickLabel  = this.opts.pullToRefreshConfig.labelClick,
                actionLabel = this._nativePTR ? clickLabel : pullLabel;

            if (enable) {
                this.ptrDOM.classList.add(CLASS_UPDATE_STATE);
                this.ptrLabel.textContent = updateLabel;
                this._ptrLoading = true;
            } else {
                this.ptrDOM.classList.remove(CLASS_UPDATE_STATE);
                this.ptrDOM.classList.remove(CLASS_PULL_STATE);
                this.ptrLabel.textContent = actionLabel;
                this._ptrLoading = false;
                if (this._nativePTR) {
                    this.scrollTo(0, -this.getPTRSize(), 300);
                }
            }
        },
        _setPullState: function (enable) {
            if (enable) {
                this.ptrDOM.classList.add(CLASS_PULL_STATE);
                this.ptrLabel.textContent = this.opts.pullToRefreshConfig.labelRelease;
                this._ptrTriggered = true;
            } else {
                this.ptrDOM.classList.remove(CLASS_PULL_STATE);
                this.ptrLabel.textContent = this.opts.pullToRefreshConfig.labelPull;
                this._ptrTriggered = false;
            }
        },
        _setPTRErrorState: function (error) {
            var labelError = this.opts.pullToRefreshConfig.labelError;
            // error == false remove error state
            if (typeof error === 'boolean' && !error) {
                this.ptrDOM.classList.remove(CLASS_ERROR);
                this._setPullState(false);
            } else {
                this._setPTRLoadingState(false);
                this.ptrDOM.classList.add(CLASS_ERROR);
                this.ptrLabel.textContent = error.labelError || labelError;
            }
        },
        _onScrollMovePTR: function (action, x, y) {
            var touching    = action === 'gestureMove',
                isPTRNative = this._nativePTR;

            if (this._iosPTR && y > 0) {
                this.ptrDOM.style[STYLES.transform] = 'translate3d(0,' + (y) + 'px,0)';
            }

            if (touching && y > 0) {
                return this._needsPullToRefresh(y);
            }

            if (isPTRNative) { 
                if (y > -this._ptrSize) {
                    this.ptrDOM.style[STYLES.transform] = 'translate3d(0,' + (50 + y) + 'px,0)';
                }   
            }
        },
        _onScrollEndPTR: function (e) {
            if (this._iosPTR && !this._ptrTriggered) {
                this.forceTranslate = false;
            }
        },
        _needsPullToRefresh: function (ypos) {
            if (this._ptrTriggered && ypos < this._ptrSize) {
                this._setPullState(false);
            } else if (!this._ptrTriggered && ypos > this._ptrSize) {
                this._setPullState(true);
            }
        },

        _ptrToggle: function (action, force) {
            var ptr = this.ptrDOM;

            if (!ptr) {
                return;
            }

            if (action === 'disable' && (this.opts.pullToRefresh || force)) {
                ptr.style.display = 'none';
                this._ptrSize = 0;
                this.opts.pullToRefresh = false;

            } else if (action === 'enable' && (!this.opts.pullToRefresh || force)) {
                ptr.style.display = '';
                this._ptrSize = ptr.offsetHeight;
                this.opts.pullToRefresh = true;
            }
        },
        _ptrExecTrigger: function () {
            var self = this,
                ptrDataProvider = this.opts.onPullToRefresh,
                callback = function () {
                    self._ptrExecTriggerCallback.apply(self, arguments);
                };

            if (ptrDataProvider) {
                ptrDataProvider(callback);
            } else {
                w.setTimeout(function (){
                    self._ptrExecTriggerCallback('handler not defined');
                }, 600);
            }
        },
        _ptrExecTriggerCallback: function (err, data) {
            var self = this;
            if (err) {
                this._setPTRErrorState(err);
                this._ptrTriggered = false;
                w.setTimeout(function () {
                    self._resetPosition(self._ptrSnapTime);
                    self._setPTRErrorState(false);
                }, ERROR_TIMEOUT);
            } else {
                this.prependItems(data);
                this._ptrTriggered = false;
                this._setPTRLoadingState(false);

                RAF(function() {
                    self._resetPosition(self._ptrSnapTime);
                });
            }
            
        },
        /*
        * ==================================
        * PUBLIC API
        * ==================================
        */
        isTriggeredPTR: function () {
            return this._ptrTriggered;
        },
        getPTRSize: function () {
            return this._ptrSize;
        },
        getPTRSnapTime: function () {
            return this._ptrSnapTime;
        },
        triggerPTR: function () {
            if (!this._ptrLoading) {
                this._setPTRLoadingState(true);
            }
            this._ptrExecTrigger();
        },
        getResetPositionPTR: function () {
            if (!this._triggerPTRAfterReset) {
                this._setPTRLoadingState(true);
                this._triggerPTRAfterReset = true;
            } else {
                this._triggerPTRAfterReset = false;
                this.triggerPTR();
            }
            return {
                x    : this.x,
                y    : this.getPTRSize(),
                time : this.getPTRSnapTime()
            };
        },
        togglePullToRefresh: function (enabled, force) {
            var hasToggleArg = enabled !== undefined,
                toggleStr = hasToggleArg ? enabled ? 'enable' : 'disable' : '';

            if (hasToggleArg) {
                this._ptrToggle(toggleStr, force);
            } else {
                this._ptrToggle(this.opts.pullToRefresh ? 'disable' : 'enable', force);
            }
        }
    };

    PLUGINS.PullToRefresh = PullToRefresh;

}