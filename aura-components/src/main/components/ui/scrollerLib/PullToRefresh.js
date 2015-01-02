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
    
    // NAMESPACES
    var SCROLLER = w.__S || (w.__S = {}),
        RAF      = w.requestAnimationFrame,
        PLUGINS  = SCROLLER.plugins || (SCROLLER.plugins = {}),

        CONFIG_DEFAULTS = {
            labelPull     : 'Pull down to refresh...',
            labelRelease  : 'Release to refresh...',
            labelUpdate   : 'Updating...',
            labelSubtitle : '',
            labelError    : 'Error on pull to refresh'
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

    PullToRefresh.prototype = {
        init: function () {
            this._mergePullToRefreshConfig();
            this.on('_initialize', this._appendPullToRefresh);
            this.on('scrollMove', this._onScrollMovePTR);
            this.on('_customResetPosition', this._onResetPositionPTR);
        },
        _mergePullToRefreshConfig: function () {
            this.opts.pullToRefreshConfig = this._mergeConfigOptions(CONFIG_DEFAULTS, this.opts.pullToRefreshConfig);
        },
        _createPullToRefreshMarkup: function () {
            var ptr_container = w.document.createElement('div'),
                pullLabel     = this.opts.pullToRefreshConfig.labelPull,
                subtitleLabel = this.opts.pullToRefreshConfig.labelSubtitle;

            ptr_container.innerHTML = [
                '<span class="' + CLASS_ICON + '"></span>',
                '<span class="' + CLASS_LABEL + '">' + pullLabel + '</span>',
                '<span class="' + CLASS_SUBTITLE + '">' + subtitleLabel + '</span>'
            ].join('');

            ptr_container.className = 'pullToRefresh';

            return ptr_container;
        },
        _appendPullToRefresh: function () {
            var ptr_container = this._createPullToRefreshMarkup();
            if (this.scroller.firstChild) {
                this.scroller.insertBefore(ptr_container, this.scroller.firstChild);
            } else {
                this.scroller.appendChild(ptr_container);
            }

            this.ptrDOM   = ptr_container;
            this.ptrIcon  = ptr_container.getElementsByClassName(CLASS_ICON)[0];
            this.ptrLabel = ptr_container.getElementsByClassName(CLASS_LABEL)[0];

            this._ptrThreshold  = ptr_container.offsetHeight; //relayout
            this._ptrSnapTime   = PULL_TO_SNAP_TIME;

            this.togglePullToRefresh(this.opts.pullToRefresh, true);
        },
        _onResetPositionPTR: function (time) {
            if (this._ptrTriggered) {
                var y    = this._getPTRSize();

                time = time || this._getPTRSnapTime();
                this._scrollTo(0, y, time);
            } else {
                this._resetPosition(time, true);
            }
        },
        _setPTRLoadingState: function (enable) {
            if (enable) {
                this.ptrDOM.classList.add(CLASS_UPDATE_STATE);
                this.ptrLabel.textContent = this.opts.pullToRefreshConfig.labelUpdate;
                this._ptrLoading          = true;
            } else {
                this.ptrDOM.classList.remove(CLASS_UPDATE_STATE);
                this.ptrDOM.classList.remove(CLASS_PULL_STATE);
                this.ptrLabel.textContent = this.opts.pullToRefreshConfig.labelPull;
                this._ptrLoading = false;
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
            if (action === 'gestureMove' && y > 0) {
                this._needsPullToRefresh(y);
            }
        },
        _needsPullToRefresh: function (ypos) {
            if (this._ptrTriggered && ypos < this._ptrThreshold) {
                this._setPullState(false);
            } else if (!this._ptrTriggered && ypos > this._ptrThreshold) {
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
                this._ptrThreshold = 0;
                this.opts.pullToRefresh = false;

            } else if (action === 'enable' && (!this.opts.pullToRefresh || force)) {
                ptr.style.display = '';
                this._ptrThreshold = ptr.offsetHeight;
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
            return this._ptrThreshold;
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