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
    // Bootstrap everything
    initialize: function (cmp) {
    	this.initializeInstrumentation(cmp);
        this.initializeIndicator(cmp);
        this.initializePages(cmp);
        this.initializeCarouselPlugin(cmp);
    },
    /*
     * Carousel Plugin (will be injected into the Scroller overriding and extending functionality)
     */
    _buildCarouselPlugin : function () {
        return {
            init: function () {
                this.opts.carouselTransitionTime = this.opts.carouselTransitionTime || 300;
                this.on('scrollEnd', this._onCarouselScrollEnd);
                this.on('scrollStart', this._onCarouselScrollStart);
                this.on('_refresh', this._onCarouselRefresh);
                this._setInitialPage();
            },
            _setInitialPage: function () {
                var initial = this.opts.initialPage;
                if (typeof initial === 'number') {
                    this._activePage = initial;
                    var dest = this._calculateScrollByPage(initial);
                    this.scrollTo(dest.x, dest.y);
                }
            },
            _getPageSize: function (force) {
            	if (!this.pageSize || force) {
            		this.pageSize = this.scrollVertical ? this.itemHeight || this.wrapperHeight : this.itemWidth || this.wrapperWidth;
            	}
            	return this.pageSize;
            },
            _onCarouselRefresh: function () {
            	this._getPageSize("force");
            },
            _calculateScrollByPage: function (pageIndex, force) {
                var size = this._getPageSize(force),
                    dest = -size * pageIndex,
                    x    = this.scrollVertical ? 0 : dest,
                    y    = this.scrollVertical ? dest : 0;

                return { x: x, y: y };
            },
            _onCarouselScrollEnd: function () {
                var oldPage  = this._activePage,
                    pageSize = this._getPageSize(),
                    newPage  = Math.abs(this.x / pageSize);

                if (isNaN(newPage)) {
                    return;
                }

                this._setContinuousFlow(false);
                if (oldPage !== newPage) {
                    this._activePage = newPage;
                    this._fire('pageChange', this._activePage);
                }
            },
            /*
             * If the scroller was forced to stop in the middle of a page transition,
             * we need to make sure it does not get stucked in the middle,
             * so we force it to transalte to a correct state in that case.
             */
            _onStopScrolling: function (e) {
                e.preventDefault();
                var end = this._end;
                var pageSize = this._getPageSize();

                // Hook in the _end since this scroller won't fire any event since has been stopped
                this._end = function () {
                	end.apply(this, arguments);
                	this._end = end; // restore it
                	if ((this.x % pageSize) !== 0) {
                		var dest = this._calculateScrollByPage(Math.abs(Math.round(this.x / pageSize)));
                        this.scrollTo(dest.x, dest.y, this.opts.carouselTransitionTime);
                	}
                };
            },
            _onCarouselScrollStart: function () {
                this._setContinuousFlow(true);
            },
            /**
             * During tab transition, enable continuous flow so that all pages will be visible
             * and give better user experience as the pages slide through the carousel.
             * After tab transition end, disable continuous flow(only the selected tab will be visible)
             * so that keyboard tabbing will be contained only on the active page.
             * @param isContinuousFlow
             * @private
             */
            _setContinuousFlow: function(isContinuousFlow) {
            	if (!this.isDesktop) {
            		return;
            	}

                var scrollerEl = this.scroller,
                    cssClass = 'continuous-flow';

                if(isContinuousFlow) {
                    $A.util.addClass(scrollerEl, cssClass);
                }
                else {
                    $A.util.removeClass(scrollerEl, cssClass);
                }
            },
            _updatePagesSize: function () {
                var wrapperDom = this.wrapper,
                    pages = wrapperDom.getElementsByClassName('carousel-page') || [],
                    width  = wrapperDom.offsetWidth;

                // if both offsetWidth and offsetHeight are 0,
                // assume the layout has display:none and bail
                if(width > 0 || wrapperDom.offsetHeight > 0) {
                    for (var i = 0, len = pages.length; i < len; i++) {
                        pages[i].style.width =  width + 'px';
                    }

                    this._setSize();
                    this._refreshIndicators();
                }
            },

            /* PUBLIC */
            gotoPage: function (pageIndex, force) {
                if ($A.util.isEmpty(pageIndex) || (!force && pageIndex === this._activePage)) {
                    return;
                }

                this._setContinuousFlow(true);
                var dest = this._calculateScrollByPage(pageIndex, force);
                this.scrollTo(dest.x, dest.y, this.opts.carouselTransitionTime);
            },
            getActivePage: function () {
                return this._activePage;
            },
            /**
             * Override scroller 'resize' method to set carouselPage and indicator dimensions.
             * This gets fired on orientationchange or resize.
             * Also select the currently active tab on orientation change.
             */
            resize: function() {
                this._updatePagesSize();
                this.gotoPage(this._activePage, true);
            }
        };
    },
    initializeInstrumentation: function (cmp) {
    	cmp._swiped = {};
    },
    initializeCarouselPlugin: function (cmp) {
        var carouselCmp = cmp.find('carousel');
        if (!carouselCmp.isPluginRegistered('Carousel')) {
            carouselCmp.registerPlugin('Carousel', this._buildCarouselPlugin(cmp));
        }

        /*
         * We want to merge some new configuration
         * that is not defined in the aura Scroller by default
         */
        carouselCmp.setPluginConfig({
        	isDesktop: $A.get('$Browser.isDesktop'),
        	disableWheel: true, // in desktop it will do weird things due to nesting scrollers
        	indicators: [{
        		// Define the selector for the indicator (scope to the component itself)
                el     : '.carousel[data-id="' + cmp.getGlobalId() + '"] .' + cmp.get('v.indicatorStateClass'),
                config : { resize : false, snap : true}
            }],
            initialPage : this.getCurrentPageIndex(cmp)
        });
    },

    /*
     * @initializeIndicator:
     * Pass through all parameters to the give Indicator
     * Add handlers to the interface-defined events
    */
    initializeIndicator: function (cmp) {
        var pager = cmp.get('v.pageIndicatorComponent')[0];
            pager.set('v.pageModels', cmp.get('v.pageModels'));
            pager.set('v.pageComponents', cmp.get('v.pageComponents'));
            pager.set('v.justifyContent', cmp.get('v.justifyContent'));
            pager.set('v.isDotIndicator', cmp.get('v.isDotIndicator'));
            pager.addHandler('pagerClicked', cmp, 'c.pagerClicked');
    },
    /*
     * @initializePages
     * It get either an array of pageModels (Objects which hold the component definition)
     * or an array of components and it creates carouselPages to hold them
     * and manage the interaction with the Carousel
    */
    initializePages: function (cmp) {
        var prefetchedTab      = $A.util.lookup(cmp.get('v.prefetchedTab'), 0),
        	prefetchedTabIndex = cmp.get('v.prefetchedTabIndex') || 0,
        	pageModels         = cmp.get('v.pageModels'),
            pageComponents     = cmp.get('v.pageComponents'),
            pages              = pageModels && pageModels.length > 0 ? pageModels : pageComponents,
            numberOfPages      = pages && pages.length || 0,
            carouselPageCmp    = cmp.get('v.carouselPageComponent')[0],
            carouselPages      = [],
            pageConfig         = {
        		componentDef:         carouselPageCmp.componentDef.descriptor,
        		scrollerPlugins:      cmp.get('v.pageScrollerPlugins'),
        		isScrollable:         cmp.get("v.isScrollable")
        	},
            i;

        cmp._numOfPages = numberOfPages;
        this.setCurrentPageIndex(cmp, 0);

        for (i = 0; i < numberOfPages; i++) {
        	if (i === prefetchedTabIndex) {
        		this.setCurrentPageIndex(cmp, i);
        		cmp._swiped[i] = true; // for instrumentation purposes
        		carouselPages.push(this.createCarouselPage(pages[i], pageConfig, i, prefetchedTab));
        	} else {
        		carouselPages.push(this.createCarouselPage(pages[i], pageConfig, i));
        	}
        }
        cmp.set('v.body', carouselPages);
    },
    createCarouselPage: function (contentCmp, pageConfig, index, preloadContent) {
        return $A.createComponentFromConfig({
            descriptor: pageConfig.componentDef,
            attributes: {
                placeholder: pageConfig.placeholder,
                content: preloadContent || contentCmp,
                pageIndex: index,
                scrollerPlugins: pageConfig.scrollerPlugins,
                isScrollable: pageConfig.isScrollable,
                ignoreExistingAction: pageConfig.ignoreExistingAction
            }
        });
    },
    /*
     * @getCarouselSize
     * gets the current updated DOM size of the carousel
     */
    getCarouselSize: function (cmp) {
        var carousel = this.getCarouselDOM(cmp) || {},
            width    = carousel.offsetWidth,
            height   = carousel.offsetHeight;

        return {
            width : width,
            height: height
        };
    },
    /*
     * @afterRenderCarousel
     * This function is called immediately after the Carousel is on the renderTree
     * which in Aura corresponds to the afterRender method (it was just attached to the DOM)
     */
    afterRenderCarousel: function (cmp) {
    	var self        = this,
    		initialPage = this.getCurrentPageIndex(cmp),
    		carousel    = this.getCarouselInstance(cmp),
            indicator   = cmp.get('v.pageIndicatorComponent')[0],
    		pages       = cmp.get('v.body');

    	carousel._updatePagesSize(cmp, carousel);
        indicator.get('c.changeActivePage').run({pageIndex: initialPage, initialRender: true});

    	carousel.on('pageChange', function (page) {
    		self.onPageChange.call(self, cmp, page);
    	});

        var lazyLoadTabs = cmp.get('v.lazyLoadTabs');
        for (var i = 0; i < pages.length; i++) {
            indicator.get('c.setAriaAttributes').run({pageIndex: i, pageId: pages[i].getGlobalId()});
            this.setPageVisibility(pages[i], (i === initialPage));

            if (lazyLoadTabs) {
                pages[i].get('c.load').run();
            }
        }
    },
    onPageChange: function (cmp, pageIndex) {
    	var pages        = cmp.get('v.body'),
    		oldPageIndex = this.getCurrentPageIndex(cmp),
    		oldPage      = pages[oldPageIndex],
    		page         = pages[pageIndex],
    		indicator    = cmp.get('v.pageIndicatorComponent')[0];

        if (!page.get('v.isContentLoaded')) {
            $A.run(function () {
                page.get('c.load').run();
            });
        }

        this.setPageVisibility(oldPage, false);
        this.setPageVisibility(page, true);

        indicator.get('c.changeActivePage').run({pageIndex: pageIndex});
        this.setCurrentPageIndex(cmp, pageIndex);

    },
    /* GETTERS & SETTERS*/
    setCurrentPageIndex: function (cmp, currentIndex) {
    	cmp._currentPage = currentIndex;
    },
    setPageVisibility: function(carouselPage, isVisible) {
        var cssClass      = 'hidden',
            pageEl        = carouselPage.getElement();

        if (isVisible) {
            pageEl.setAttribute('aria-expanded', 'true');
            pageEl.setAttribute('aria-hidden', 'false');
            if (this.isDesktop) {
            	$A.util.removeClass(pageEl, cssClass);
            }
        } else {
        	pageEl.setAttribute('aria-expanded', 'false');
        	pageEl.setAttribute('aria-hidden', 'true');
        	if (this.isDesktop) {
        		$A.util.addClass(pageEl, cssClass);
        	}
        }
    },
    getCurrentPageIndex: function (cmp) {
    	return cmp._currentPage;
    },
    getCarouselInstance: function (cmp) {
        return cmp.find('carousel').getScrollerInstance();
    },
    getDOMPages: function (cmp) {
        return cmp.getElement().getElementsByClassName('carousel-page');
    },
    getCarouselDOM: function (cmp) {
        return cmp.find('carousel').getElement();
    }
})// eslint-disable-line semi