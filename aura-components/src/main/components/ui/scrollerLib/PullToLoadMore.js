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
        RAF      = w.requestAnimationFrame,
        PLUGINS  = SCROLLER.plugins || (SCROLLER.plugins = {}),
        STYLES   = SCROLLER.styles,
        HELPERS  = SCROLLER.helpers,
        SUPPORT  = SCROLLER.support,

        PTL_TYPE = {
            'synthetic': 'synthetic', // The default PTL built in the scroller
            'native'   : 'native', // PTL done for nativeScrolling (adds some special logic)
            'ios'      : 'ios' // In iOS we can leverage the momentum and snap to do native PTR
        },

        CONFIG_DEFAULTS = {
            labelPull     : 'Pull up to show more',
            labelRelease  : 'Release to show more',
            labelUpdate   : 'Updating...',
            labelClick    : 'Tap to load more...',
            labelSubtitle : '',
            labelError    : 'Error on pull to load more'
        },
        
        PULL_TO_SNAP_TIME  = 200,
        ERROR_TIMEOUT      = 1000,
        CLASS_UPDATE_STATE = 'update',
        CLASS_PULL_STATE   = 'pull',
        CLASS_ICON         = 'icon',
        CLASS_ERROR        = 'error',
        CLASS_LABEL        = 'label',
        CLASS_SUBTITLE     = 'sub',
        CLASS_PTL          = 'pullToLoadMore';
    
    function PullToLoadMore() {}

    PullToLoadMore.prototype = {
        init: function () {
            this._mergePullToLoadMoreConfig();
            this.on('_initialize', this._appendPullToLoad);
            this.on('scrollMove', this._onScrollMovePTL);
        },
        _getPTLType: function () {
            var nativeScroller = this.opts.useNativeScroller;
            if (!nativeScroller) {
                return PTL_TYPE.synthetic;
            } else if (SUPPORT.isIOS) {
                this._iosPTL = true;
                return PTL_TYPE.ios;
            } else {
                this._nativePTL = true;
                return PTL_TYPE['native'];
            }
        },
        _mergePullToLoadMoreConfig: function () {
            var ptlConfig = this._mergeConfigOptions(CONFIG_DEFAULTS, this.opts.pullToLoadMoreConfig);
            if (ptlConfig.type === undefined) {
                ptlConfig.type = this._getPTLType();
            }
            this.opts.pullToLoadMoreConfig = ptlConfig;
        },
        
        triggerPTL: function () {
            //set waiting state
            if (!this._ptlLoading) {
                this._setPTLLoadingState(true);
            }
            this._ptlExecTrigger();
        },
        _createPullToLoadMarkup: function () {
            var self          = this,
                ptl_container = w.document.createElement('div'),
                pullLabel     = this.opts.pullToLoadMoreConfig.labelPull,
                clickLabel    = this.opts.pullToLoadMoreConfig.labelClick,
                actionLabel   = this._nativePTL ? clickLabel : pullLabel,
                subtitleLabel = this.opts.pullToLoadMoreConfig.labelSubtitle;

            ptl_container.innerHTML = [
                '<span class="' + CLASS_ICON + '"></span>',
                '<span class="' + CLASS_LABEL + '">' + actionLabel + '</span>',
                '<span class="' + CLASS_SUBTITLE + '">' + subtitleLabel + '</span>'
            ].join('');

            if (this._nativePTL) {
                ptl_container.addEventListener('click', function (e) {
                    self.triggerPTL();
                });
            }

            ptl_container.className = CLASS_PTL;
            return ptl_container;
        },
        _createPullToLoadSpacer: function () {
            var ptl_spacer = w.document.createElement('div');
            ptl_spacer.classList.add('spacer-pull-to-load-more');

            return ptl_spacer;
        },
        _sizePullToShowMore: function () {
            var spacer = this.ptlSpacer,
                diff   = this.wrapperHeight - spacer.offsetTop;

            diff = diff > 0 ? diff: 0;

            if (diff !== this.ptlSpacerSize) {
                this.ptlSpacerSize = diff;
                spacer.style.height = this.ptlSpacerSize + 'px';
            }
        },
        _appendPullToLoad: function () {
            var ptl_container = this._createPullToLoadMarkup(),
                ptl_spacer    = this._createPullToLoadSpacer();

            this.scroller.appendChild(ptl_spacer);
            this.scroller.appendChild(ptl_container);

            this.ptlSpacer = ptl_spacer;
            this.ptlDOM    = ptl_container;
            this.ptlIcon   = ptl_container.firstChild;
            this.ptlLabel  = ptl_container.getElementsByClassName(CLASS_LABEL)[0];

            this._ptlThreshold  = ptl_container.offsetHeight;
            this._ptlSnapTime   = PULL_TO_SNAP_TIME;
            this.togglePullToLoadMore(this.opts.pullToLoadMore, true);

            this._setSize();
        },
        _appendData: function (items) {
            var docfrag = w.document.createDocumentFragment(),
                scrollerContainer = this.scroller,
                ptlContainer = this.ptlSpacer;

            items.forEach(function (i) {
                docfrag.appendChild(i);
            });

            if (ptlContainer) {
                scrollerContainer.insertBefore(docfrag, ptlContainer);
            } else {
                scrollerContainer.appendChild(docfrag);
            }
        },
        _ptlIsEnabled: function () {
            return this.opts.pullToLoadMore;
        },
        _ptlToggle: function (action, force) {
            var ptl = this.ptlDOM;

            if (!ptl) {
                return;
            }

            if (action === 'disable' && (this.opts.pullToLoadMore || force)) {
                ptl.style.display = 'none';
                this._ptlThreshold = 0;
                this.opts.pullToLoadMore = false;

            } else if (action === 'enable' && (!this.opts.pullToLoadMore || force)) {
                ptl.style.display = '';
                this._ptlThreshold = ptl.offsetHeight;
                this.opts.pullToLoadMore = true;
            }
        },
        _onScrollMovePTL: function (action, x, y) {
            if (action === 'gestureMove' && y < this.maxScrollY) {
                this._needsPullToLoadMore(y);
            }
        },
        _needsPullToLoadMore: function (ypos) {
            if (!this.opts.pullToLoadMore) {
                return;
            }

            var threshold = this.maxScrollY - this._ptlThreshold;

            if (this._ptlTriggered && ypos > threshold) {
                this._setPTLPullState(false);
                this._ptlTriggered = false;

            } else if (!this._ptlTriggered && ypos < threshold) {
                this._setPTLPullState(true);
                this._ptlTriggered = true;
            }
        },
        _setPTLPullState: function (enable) {
            if (enable) {
                this.ptlDOM.classList.add(CLASS_PULL_STATE);
                this.ptlLabel.textContent = this.opts.pullToLoadMoreConfig.labelRelease;
                this._ptlTriggered = true;
            } else {
                this.ptlDOM.classList.remove(CLASS_PULL_STATE);
                this.ptlLabel.textContent = this.opts.pullToLoadMoreConfig.labelPull;
                this._ptlTriggered = false;
            }
        },
        _setPTLLoadingState: function (enable) {
            if (enable) {
                this.ptlDOM.classList.add(CLASS_UPDATE_STATE);
                this.ptlLabel.textContent = this.opts.pullToLoadMoreConfig.labelUpdate;
                this._ptlLoading          = true;
            } else {
                this.ptlDOM.classList.remove(CLASS_UPDATE_STATE);
                this.ptlDOM.classList.remove(CLASS_PULL_STATE);
                this.ptlLabel.textContent = this.opts.pullToLoadMoreConfig.labelPull;
                this._ptlLoading = false;
            }
        },
        _setPTLErrorState: function (error) {
            var labelError = this.opts.pullToLoadMoreConfig.labelError;
            // error == false remove error state
            if (typeof error === 'boolean' && !error) {
                this.ptlDOM.classList.remove(CLASS_ERROR);
                this._setPTLPullState(false);
            } else {
                this._setPTLLoadingState(false);
                this.ptlDOM.classList.add(CLASS_ERROR);
                this.ptlLabel.textContent = error.labelError || labelError;
            }
        },
        _ptlExecTrigger: function () {
            var self = this,
                ptrDataProvider = this.opts.onPullToLoadMore,
                callback = function () {
                    self._ptlExecTriggerCallback.apply(self, arguments);
                };

            if (ptrDataProvider) {
                ptrDataProvider(callback);
            } else {
                w.setTimeout(function (){
                    self._ptlExecTriggerCallback('no fnc');
                }, 600);
            }
        },
        _ptlExecTriggerCallback: function (err, items) {
            var self = this;
            if (err) {
                this._setPTLErrorState(err);
                this._ptlTriggered = false;
                w.setTimeout(function () {
                    self._resetPosition(self._ptlSnapTime);
                    self._setPTLErrorState(false);
                }, ERROR_TIMEOUT);
            } else {
                this.appendItems(items);
                this._ptlTriggered = false;
                this._setPTLLoadingState(false);

                RAF(function() {
                    self._resetPosition(self._ptlSnapTime);
                });
            }
        },
        _getCustomAppendedElements: function () {
            return 2;
        },
        /*
        * ==================================
        * PUBLIC API
        * ==================================
        */
        getPTLSize: function () {
            if (!this._ptlThreshold) {
                this._ptlThreshold = this.ptlDOM.offsetHeight;
            }

            return this._ptlThreshold;
        },
        getPTLSnapTime: function () {
            return this._ptlSnapTime;
        },
        isTriggeredPTL: function () {
            return this._ptlTriggered;
        },
        resetPositionPTL: function () {
            if (!this._triggerPTLAfterReset) {
                this._setPTLLoadingState(true);
                this._triggerPTLAfterReset = true;
            } else {
                this._triggerPTLAfterReset = false;
                this.triggerPTL();
            }
            return {
                x    : this.x,
                y    : this.maxScrollY - this.getPTLSize(),
                time : this.getPTLSnapTime()
            };
        },
        togglePullToLoadMore: function (enabled, force) {
            var hasToggleArg = enabled !== undefined,
                toggleStr = hasToggleArg ? enabled ? 'enable' : 'disable' : '';

            if (hasToggleArg) {
                this._ptlToggle(toggleStr, force);
            } else {
                this._ptlToggle(this.opts.pullToLoadMore ? 'disable' : 'enable', force);
            }
        }
    };

    PLUGINS.PullToLoadMore = PullToLoadMore;

}