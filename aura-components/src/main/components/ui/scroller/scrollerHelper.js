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

({
    /*
    * =========================
    * PUBLIC HELPER METHODS
    * =========================
    */
    /*
    * This method attach helper-functions:
    * Those functions are referenced-copied in the component 
    * so users can register a plugin.
    */
    initialize: function (component) {
        var helper = this;

        component.registerPlugin = function () {
            return helper.registerPlugin.apply(helper, arguments);
        };

        component.setPluginConfig = function (config) {
            return helper.setPluginConfig(component, config);
        };

        component.getScrollerNamespace = function () {
            return helper.getScrollerNamespace();
        };

        component.getScrollerInstance = function () {
            return helper.getScrollerInstance(this);
        };

        component.isPluginRegistered = function (name) {
            return helper.isPluginRegistered(name);
        };
    },
    isPluginRegistered: function (name) {
        return !!this.getScrollerNamespace().plugins[name];
    },
    registerPlugin: function (name, constructor) {
        var NS = this.getScrollerNamespace(),
            plugins = NS.plugins;

        if (!plugins[name]) {
            plugins[name] = constructor;
        }
    },
    setPluginConfig: function (component, config) {
        var sh = this.getScrollerNamespace().helpers;
        component._pluginConfig = sh.simpleMerge(component._pluginConfig, config);
    },
    initAfterRender: function (component) {
        var scrollerNamespace = this.getScrollerNamespace(),
            scrollerHelpers = scrollerNamespace.helpers,
            scrollerWrapperDOM = this._getScrollerWrapper(component),
            scrollerOptions = this._mapAuraScrollerOptions(component),
            mergedOptions = scrollerHelpers.simpleMerge(scrollerOptions, component._pluginConfig),
            ScrollerConstructor = scrollerNamespace.constructor,
            scrollerInstance = new ScrollerConstructor(scrollerWrapperDOM, mergedOptions);

        this._attachAuraEvents(component, scrollerInstance);
        this.setScollerInstance(component, scrollerInstance);
    },
    applyDeviceStyles: function (cmp) {
        var scroller = cmp.getElement();
        //Apply this style to windows tablet only to prevent issue in W-4661294
        //-ms-overflow-style: none; was added in css to address W-2456475
        if (scroller && $A.get("$Browser.isWindowsTablet")
            && scroller.classList.contains('native')) {

            scroller.style.msOverflowStyle = 'none';
        }
    },
    getScrollerInstance: function (component) {
        return component._scroller;
    },
    setScollerInstance: function (component, scrollerInstance) {
        component._scroller = scrollerInstance;

        // For debugging purposes...
        //#if {"excludeModes" : ["PRODUCTION", "PRODUCTIONDEBUG", "PERFORMANCEDEBUG"]}
        var scrollerNS = this.getScrollerNamespace(component),
            instances = scrollerNS.instances || (scrollerNS.instances = {});
        instances[component.getGlobalId()] = scrollerInstance;
        // #end
    },
    getScrollerNamespace: function () {
        return window.__S;
    },
    // TODO: handleScrollTo: Move and clean this logic inside the scroller (@dval, @jye)
    handleScrollTo: function (component, event) {
        var scroller = this.getScrollerInstance(component);
        if (!scroller) {
            $A.warning("Error trying to handleScrollTo: Scroller has not been initialized.");
            return;
        }

        var isNative = component.get('v.useNativeScroller'),
            wrapper = scroller.wrapper,
            scrollBody = scroller.scroller,
            params = event.getParams(),
            dest = params.destination,
            time = params.time,
            x = params.xcoord || 0,
            y = params.ycoord || 0;

        if (dest === 'custom') {
            if (isNative) {
                if (scroller.scrollVertical) {
                    wrapper.scrollTop = Math.abs(y);
                }
                if (scroller.scrollHorizontal) {
                    wrapper.scrollLeft = Math.abs(x);
                }
            } else {
                scroller.scrollTo(x, y, time);
            }
        } else if (dest === 'top' || dest === 'left') {
            if (isNative) {
                wrapper.scrollTop = 0;
            } else {
                scroller.scrollToTop(time);
            }
        } else if (dest === 'bottom' || dest === 'right') {
            if (isNative) {
                wrapper.scrollTop = scrollBody.offsetHeight - wrapper.offsetHeight;
            } else {
                scroller.scrollToBottom(time);
            }
        }
    },
    handleScrollBy: function (component, event) {
        var scroller = this.getScrollerInstance(component);
        if (!scroller) {
            $A.warning("Error trying to handleScrollBy: Scroller has not been initialized");
            return;
        }

        var params = event.getParams(),
            time = params.time,
            deltaX = params.deltaX || 0,
            deltaY = params.deltaY || 0;

        scroller.scrollTo(scroller.x + deltaX, scroller.y + deltaY, time);
    },
    swapShowMore: function (cmp, newValue) {
        var scroller = this.getScrollerInstance(cmp);
        if (scroller && scroller.togglePullToLoadMore) {
            scroller.togglePullToLoadMore(newValue);
        }
    },
    swapRefresh: function (cmp, newValue) {
        var scroller = this.getScrollerInstance(cmp);
        if (scroller && scroller.togglePullToRefresh) {
            scroller.togglePullToRefresh(newValue);
        }
    },
    /*
    * =========================
    * PRIVATE HELPER METHODS
    * =========================
    */
    /*
    * @_bind: 
    * Receives a method and an array of arguments 
    * Returns a function binding the current context and concatenating the original args with the news ones returned
    */
    _bind: function (method) {
        var context = this,
            xArgs = Array.prototype.slice.call(arguments, 1);

        return function () {
            method.apply(context, xArgs.concat(Array.prototype.slice.call(arguments)));
        };
    },
    _getScrollerWrapper: function (component) {
        return component.find('scrollWrapper').getElement();
    },
    _getPullToRefreshConfig: function (component) {
        var nativeScroller = component.get('v.useNativeScroller');
        return {
            labelPull: nativeScroller ? component.get('v.pullToRefreshClick') : component.get("v.pullToRefreshPull"),
            labelRelease: component.get("v.pullToRefreshRelease"),
            labelUpdate: component.get("v.pullToRefreshUpdating"),
            labelSubtitle: component.get("v.pullToRefreshSubtitle"),
            labelError: component.get("v.pullToRefreshError")
        };
    },
    _getPullToLoadMoreConfig: function (component) {
        var nativeScroller = component.get('v.useNativeScroller');
        return {
            labelPull: nativeScroller ? component.get('v.pullToShowMoreClick') : component.get("v.pullToShowMorePull"),
            labelRelease: component.get("v.pullToShowMoreRelease"),
            labelUpdate: component.get("v.pullToShowMoreUpdating"),
            labelSubtitle: component.get("v.pullToShowMoreSubtitle"),
            labelError: component.get("v.pullToShowMoreError")
        };
    },
    _getInfiniteLoadingConfig: function (component) {
        var auraDataProvider = component.get('v.infiniteLoadingDataProvider'),
            dataProviderBridge = auraDataProvider && this._bind(this._bridgeScrollerCallback, component, auraDataProvider),
            templates = component.get("v.infiniteLoadingTemplate"),
            template = (templates && templates.length === 1) ? templates[0] : null;

        var config = {
            threshold: component.get('v.infiniteLoadingThreshold'),
            dataProvider: dataProviderBridge,
            autoFillPage: component.get('v.infiniteLoadingAutoFillPage'),
            labelNoData: component.get("v.infiniteLoadingNoDataLabel"),
            labelIdle: component.get("v.infiniteLoadingIdleLabel"),
            labelLoading: component.get("v.infiniteLoadingLoadingLabel"),
            hasTemplate: false
        };

        if (template) {
            if (!template.isInstanceOf("ui:scrollerInfiniteLoadingTemplate")) {
                $A.warning("Infinite Loading Template must implement ui:scrollerInfiniteLoadingTemplate.");
            }
            else {
                config.hasTemplate = true;
                config.templateContainer = template.getElement();
                config.templateIsManualLoad = template.get("v.manualLoad");
                config.templateSetLoadingFn = function (loading) {
                    template.set("v.loading", loading);
                };
                config.templateSetHasMoreDataFn = function (moreData) {
                    template.set("v.hasMoreData", moreData);
                };
                config.templateSetHasMoreDataFn = function (moreData) {
                    template.set("v.hasMoreData", moreData);
                };
                config.templateSetManualTriggerFn = function (triggerFn) {
                    template.set("v.manualLoadTrigger", $A.getCallback(triggerFn));
                };
            }
        }

        return config;
    },
    _getVoiceOverConfig: function (component) {
        return {
            supportVO: component.get('v.supportVoiceOver'),
            enable: $A.get('$Global.isVoiceOver'),
            labelUp: component.get('v.scrollButtonUp'),
            labelDown: component.get('v.scrollButtonDown'),
            labelLeft: component.get('v.scrollButtonLeft'),
            labelRight: component.get("v.scrollButtonRight")
        };
    },
    _getPlugins: function (component) {
        var rawPlugins = component.get('v.plugins') || '',
            plugins = (rawPlugins && rawPlugins.split(',')) || [],
            corePlugins = [],
            scrollbars = component.get('v.showScrollbars'),
            snap = component.get('v.snap'),
            endless = component.get('v.endless'),
            infiniteLoading = component.get('v.infiniteLoading'),
            supportVoiceOver = component.get('v.supportVoiceOver');

        // If the attributes are true add the core plugins to the scroller plugin array
        scrollbars && corePlugins.push('Indicators');
        snap && corePlugins.push('Snap');
        endless && corePlugins.push('Endless');
        infiniteLoading && corePlugins.push('InfiniteLoading');
        supportVoiceOver && corePlugins.push('VoiceOver');

        return corePlugins.concat(plugins);
    },
    _mapAuraScrollerOptions: function (component) {
        var cssTransition = component.get('v.useCSSTransition'),
            canRefresh = component.get('v.canRefresh'),
            canShowMore = component.get('v.canShowMore'),

            // scroller properties check
            useNativeScroller = component.get('v.useNativeScroller'),
            enabled = component.get('v.enabled'),
            itemWidth = component.get('v.itemWidth'),
            itemHeight = component.get('v.itemHeight'),
            scroll = component.get('v.scroll'),
            scrollbars = component.get('v.showScrollbars'),
            gpuOptimization = component.get('v.gpuOptimization'),
            minThreshold = component.get('v.minThreshold'),
            minDirectionThreshold = component.get('v.minDirectionThreshold'),
            lockOnDirection = component.get('v.lockOnDirection'),

            // For now, default android and ios to use CSSTransitions
            useCSSTransition = typeof cssTransition === "boolean" ? cssTransition : !gpuOptimization,

            debounce = component.get('v.debounce'),
            bindToWrapper = component.get('v.bindEventsToScroller'),
            plugins = this._getPlugins(component),

            auraOnPullToRefresh = component.get('v.onPullToRefresh'),
            auraOnPullToLoadMore = component.get('v.onPullToShowMore'),
            auraInfiniteLoading = component.get('v.infiniteLoadingDataProvider'),

            pullToRefresh = canRefresh,
            pullToLoadMore = canShowMore,
            infiniteLoading = auraInfiniteLoading && component.get('v.infiniteLoading'),

            pullToRefreshConfig = this._getPullToRefreshConfig(component),
            pullToLoadMoreConfig = this._getPullToLoadMoreConfig(component),
            infiniteLoadingConfig = this._getInfiniteLoadingConfig(component),
            voiceOverConfig = this._getVoiceOverConfig(component);

        return {
            enabled: useNativeScroller ? false : enabled,
            useNativeScroller: useNativeScroller,
            itemWidth: itemWidth,
            itemHeight: itemHeight,
            scroll: scroll,
            scrollbars: scrollbars,
            useCSSTransition: useCSSTransition,
            debounce: debounce,
            bindToWrapper: bindToWrapper,
            gpuOptimization: gpuOptimization,
            lockOnDirection: lockOnDirection === 'true' ? true : lockOnDirection,
            minThreshold: minThreshold,
            minDirectionThreshold: minDirectionThreshold,
            voiceOverConfig: voiceOverConfig,

            pullToRefresh: pullToRefresh,
            pullToLoadMore: pullToLoadMore,
            infiniteLoading: !!infiniteLoading,

            onPullToRefresh: auraOnPullToRefresh && this._bind(this._bridgeScrollerCallback, component, auraOnPullToRefresh),
            onPullToLoadMore: auraOnPullToLoadMore && this._bind(this._bridgeScrollerCallback, component, auraOnPullToLoadMore),
            pullToRefreshConfig: pullToRefreshConfig,
            pullToLoadMoreConfig: pullToLoadMoreConfig,

            infiniteLoadingConfig: infiniteLoadingConfig,
            plugins: plugins
        };
    },
    _bridgeScrollerCallback: function (component, auraAction, callback) {
        // Users of this component need to call the event/callback that gets passed
        // on to onPullToRefresh and onPullToRefresh with error or success arguments
        // for the scroller to update its 'loading' state.
        $A.run(function () {
            if (component.isValid()) {
                auraAction.run(function () {
                    callback.apply(this, arguments);
                });
            }
        });
    },
    _bridgeScrollerAction: function (component, scrollerInstance, actionName) {
        var attrActionName = 'on' + actionName.charAt(0).toUpperCase() + actionName.slice(1),
            action = component.get("v." + attrActionName);

        if (action) {
            scrollerInstance.on(actionName, $A.getCallback(function () {
                action.run.apply(action, arguments);
            }));
        }
    },
    _preventDefault: function (e) {
        e.preventDefault();
    },
    _attachAuraEvents: function (component, scrollerInstance) {
        var nativeScroller = component.get('v.useNativeScroller');
        var events = [
            'beforeScrollStart',
            'scrollStart',
            'scrollMove',
            'scrollEnd'
        ], wrapper;

        if (component.get('v.preventDefaultOnMove')) {
            wrapper = this._getScrollerWrapper(component);
            wrapper.addEventListener('touchmove', this._preventDefault, false);
        }

        if (nativeScroller && component.get('v.preventNestedScroll')) {
            this.scopedScroll.scroll.scope(this._getScrollerWrapper(component));
        }

        if (!nativeScroller) {
            this._stopNativeDragging(component);
        }

        for (var i = 0; i < events.length; i++) {
            this._bridgeScrollerAction(component, scrollerInstance, events[i]);
        }
    },
    /*
    * Prevents he native dragging functionality
    * Removes the undesired dragging effect if click happens within an anchor or li elements.
    */
    _stopNativeDragging: function (component) {
        var wrapper = this._getScrollerWrapper(component);
        wrapper.ondragstart = function () {
            return false;
        }; //testing
    },
    deactivate: function (component) {
        var namespace = this.getScrollerNamespace(),
            scroller = this.getScrollerInstance(component),
            wrapper = this._getScrollerWrapper(component);

        if (component.get('v.preventDefaultOnMove')) {
            wrapper.removeEventListener('touchmove', this._preventDefault, false);
        }

        //#if {"excludeModes" : ["PRODUCTION", "PRODUCTIONDEBUG", "PERFORMANCEDEBUG"]}
        if ($A.util.isObject(namespace) && $A.util.isObject(namespace.instances)) {
            delete namespace.instances[component.getGlobalId()];
        }
        // #end

        if (scroller) {
            scroller.destroy();
        }

        delete component._scroller;
    }
})// eslint-disable-line semi
