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
        Logger   = SCROLLER.Logger,

        CONFIG_DEFAULTS = {
            labelNoData : 'No more data to display',
            threshold   : null
        },
        CLASS_FETCHING = 'loading';
    
    function InfiniteLoading () {}

    InfiniteLoading.prototype = {
        init: function () {
            this._mergeInfiniteLoading();
            this.on('_initialize', this._initInfiniteLoading);
        },
        _mergeInfiniteLoading: function () {
            this.opts.infiniteLoadingConfig = this._mergeConfigOptions(
                CONFIG_DEFAULTS,
                this.opts.infiniteLoadingConfig
            );
        },
        _initInfiniteLoading: function () {
            var ilConfig       = this.opts.infiniteLoadingConfig,
                thresholdCheck = this.opts.gpuOptimization ? this._checkItemsthreshold : this._checkLoadingThreshold;

            if (!this.opts.infiniteLoading || !ilConfig.dataProvider) {
                Logger.log('warn', 'InfiniteLoading will not work because there is no data provider or is not activated');
                return;
            }

            this.on('scrollMove', thresholdCheck);
            this.on('scrollEnd',  thresholdCheck);
            this._itemsThreshold = this.items && this.items.length || 10;
        },
        _triggerInfiniteLoadingDataProvider: function () {
            var self            = this,
                ilDataProvider  = this.opts.infiniteLoadingConfig.dataProvider,
                callback        = function () {
                    self._infiniteLoadingTriggerCallback.apply(self, arguments);
                };

            if (ilDataProvider) {
                Logger.log('fetching data');
                this._ilFetchingData = true;
                ilDataProvider(callback);
            } else {
                this._infiniteLoadingTriggerCallback('noop');
            }
        },
        _infiniteLoadingTriggerCallback: function (err, payload) {
            if (!err) {
                // the payload returns an array, append it.
                if (payload instanceof Array && payload.length) {
                    Logger.log('Data fetched!');
                    this.appendItems(payload);

                // the user manually added the dom elements (wrong thing, but we support it..)
                } else if (payload === 'refresh') {
                    Logger.log('InfiniteLoading: refresh!');
                    this.refresh();

                // If the payload is not "refresh" or an Array, we assume there is no more data.
                } else {
                    this._ilNoMoreData = true;
                    Logger.log('No More data!');
                }
            }
            this._ilFetchingData = false;
        },
        // This check is done when surfaceManager is enabled
        _checkItemsthreshold: function (action) {
            if (this._ilNoMoreData || this._ilFetchingData) {
                return;
            }

            var lastIndex  = this._positionedSurfacesLast().contentIndex,
                count      = this.items.length - 1,
                threshold  = this._itemsThreshold;

            if (count - lastIndex < threshold) {
                this._triggerInfiniteLoadingDataProvider();
            }
        },
        // This check is done when surfaceManager is disabled
        _checkLoadingThreshold: function (action, x, y) {
            if (this._ilNoMoreData || this._ilFetchingData) {
                return;
            }

            var config = this.opts.infiniteLoadingConfig,
                delta, threshold, pos, size;

            x || (x = this.x);
            y || (y = this.y);

            if (this.scrollVertical) {
                pos  = y;
                size = this.scrollerWidth;
            } else {
                pos  = x;
                size = this.scrollerHeight;
            }



            threshold = config.threshold || 3 * size;
            delta     = size + pos; // pos is negative

            if (delta < threshold) {
                this._triggerInfiniteLoadingDataProvider();
            }
        },
        /* PUBLIC API */
        fetchData: function () {
            this._triggerInfiniteLoadingDataProvider();
        },
        unlockFetchData: function () {
            this._ilNoMoreData = false;
        },
        lockFetchData: function () {
            this._ilNoMoreData = true;
        }
    };

    PLUGINS.InfiniteLoading = InfiniteLoading;

}