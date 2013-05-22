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
	INDICATOR_HEIGHT: 55,
	//number of milliseconds to wait before navigating to the next page with arrow key
	KEY_PAGE_SELECTION_TIMEOUT_DURATION: 200,
	//number of pixels the scroller has moved before handling the scrollMove event
	SCROLL_START_THRESHOLD : 10,
	//indicates only the selected page is visible or not
    SHOW_SELECTED_PAGE_ONLY : true,
   	
	init : function(cmp) {		
		var pageContainer = cmp.find('pageContainer');
		
		this.initSize(cmp);
		this.initPages(cmp);
		this.initScroller(cmp);		
		this.initPageIndicator(cmp);		 
	},
				
	initSize : function(cmp) {
		var width = cmp.get('v.width'),
			height = cmp.get('v.height'),
			style = width ? ('width:' + width + 'px;') : '';
		
		cmp._width = width;
		cmp._height = height;
				
		if (height) {
			height += this.INDICATOR_HEIGHT;
			style += 'height:' + height + 'px;';
		} else {
			style += 'height:100%';
			cmp.getValue('v.priv_scrollContentClass').setValue('full-height');
		}
		
		cmp.getAttributes().setValue('priv_carouselStyle', style);		
	},
	
	initScroller: function(cmp) {
		var pageCmps = this.getPageComponents(cmp);			
 		 
		if (pageCmps && pageCmps.length > 0) {				
			if (!cmp.get('v.continuousFlow')) {
				cmp.getAttributes().setValue('priv_snap', 'section.carousel-page');
			}

			if (cmp._width) {
				//set scroller width
				var totalWidth = cmp._width * pageCmps.length;
				cmp.getAttributes().setValue('priv_scrollerWidth',	totalWidth + 'px');
			}	
		}
	},
	
	initPages: function(cmp) {
		var pageModels = this.getPageModels(cmp),
			pageCmps = this.getPageComponents(cmp),
			pageContainer = cmp.find('pageContainer'),
			isContinuousFlow = cmp.get('v.continuousFlow'), 
			isVisible = isContinuousFlow || !this.SHOW_SELECTED_PAGE_ONLY,
			page,			
			pages = [];

		if (pageCmps && pageCmps.length > 0) {
			for ( var i = 0; i < pageCmps.length; i++) {
				page = pageCmps[i];
				//append page components to page container body
				if ($A.util.isComponent(page) && page.isInstanceOf("ui:carouselPage")) {
					//page index starts with 1
					page.getValue('v.pageIndex').setValue(i + 1);
					page.getValue('v.parent').setValue([cmp]);
					page.getValue('v.priv_width').setValue(cmp._width);
					page.getValue('v.priv_visible').setValue(isVisible);
					page.getValue('v.priv_height').setValue(cmp._height);
					page.getValue('v.priv_continuousFlow').setValue(isContinuousFlow);
					pages.push(page);
				}
			}
			var body = pageContainer.getValue('v.body');
			body.destroy();
			body.setValue(pages);			
		} else if (pageModels.length > 0) {
			for ( var i = 0; i < pageModels.length; i++) {
				page = pageModels[i];
				//create new instance of carousePage and pass pageModel to it
				 var component=$A.componentService.newComponent({
			            componentDef:{descriptor: 'markup://ui:carouselPage'},
			            //page index starts with 1
			            attributes:{values: {
			            	'priv_visible' : isVisible, 
			            	'pageModel' : page, 
			            	'pageIndex' : i + 1,
			            	'parent' : [cmp]},
			            	'priv_width' : cmp._width,
			            	'priv_height' : cmp._height,
			            	'priv_continuousFlow' : isContinuousFlow}
			        },null,true);
				 pages.push(component);
			}
			var body = pageContainer.getValue('v.body');
			body.destroy();
			body.setValue(pages);			 
			cmp.getValue('v.pageComponents').setValue(pages);
		}		
	},	
	
	initPageIndicator : function(cmp) {
		if (cmp.find('navContainer')) {
			var pager = cmp.find('pageIndicator');
			pager.getValue('v.pageComponents').setValue(cmp.getValue('v.pageComponents'));
		}
	},
	
	/**
	 * Handle window resize event
	 * This event is always fired after the carousel is rendered
	 */
	refresh: function(cmp, evt) {
		if (cmp.isRendered()) {		    	
			this.updateSize(cmp);
	    } 
	},
	
	/**
	 * Update carousel and page size if carousel width is not pre-defined
	 */
	updateSize: function(cmp) {
		var origWidth = cmp.get('v.width'),
			origHeight = cmp.get('v.height');
	
		var pages = this.getPageComponents(cmp);
		//need to update each page width if carousel width is not explicitly set
		if (pages && pages.length > 0 && !origWidth) {				
			var parentSize = this._getParentSize(cmp.getElement()), 
				style = ['width:', parentSize.width, 'px;', origHeight ? 'height:' + origHeight : ''].join('');
			
			cmp.getValue('v.priv_carouselStyle').setValue(style);
			cmp.getValue('v.priv_scrollerWidth').setValue(parentSize.width * pages.length + 'px');
			
			for (var i=0; i< pages.length; i++) {
				var e = pages[i].get('e.updateSize');
				e.setParams({pageSize: parentSize});
				e.fire();					
			}				
		}
	},
	
	_getParentSize: function(el) {		 		
		var width, height,
			parent = el.parentNode;
		
		if (parent) {
			width = parent.offsetWidth;
			height = parent.offsetHeight;			
		}
		
		return {width: width, height: height}
	},
	
	/**
	 * Update page content
	 */
	updatePage: function(cmp, pageIndex, pageContentCmp) {
		var pageCmp = this.getPageComponentFromIndex(cmp, pageIndex);
		var e = pageCmp.get('e.update');
		e.setParams({pageComponent: pageContentCmp});
		e.fire();		
	},
	
	handlePagerClicked : function(cmp, pageIndex) {
		var curPage = cmp.get('v.priv_currentPage');
		if (curPage != pageIndex) {
			cmp._pageToHide = curPage;
		}
		
		this.showPage(cmp, pageIndex);
		this.selectPage(cmp, pageIndex);
	},
	
	/**
	 * Handle carousel indicator key events
	 */	
	handlePagerKeyed : function(cmp, evt) {
		var keyCode = evt.getParam("event").keyCode;
        // left arrow or right arrow
        if (keyCode === 37 || keyCode == 39) {
            var pageComps = this.getPageComponents(cmp),
            	prevPage = evt.getParam("pageIndex"),
            	pageIndex = prevPage;
            
            if (keyCode === 37 && pageIndex > 0) {  // left arrow
            	pageIndex--;
            }
            if (keyCode === 39 && pageIndex < pageComps.length) {  // right arrow
            	pageIndex++;
            }
            
            if (cmp._keyPageSelectionTimeout != null) {
    			window.clearTimeout(cmp._keyPageSelectionTimeout);
    			cmp._keyPageSelectionTimeout = null;
    		}	 
    	 
    		// When coming from a key event, wait a second to commit to the page
    		// selection
            var me = this;
    		cmp._keyPageSelectionTimeout = window.setTimeout(function() {
    			cmp._keyPageSelectionTimeout = null;
    			cmp._pageToHide = prevPage;
    			me.showPage(cmp, pageIndex);
    			me.selectPage(cmp, pageIndex);    			 
    		}, this.KEY_PAGE_SELECTION_TIMEOUT_DURATION);
    		
            if (evt.preventDefault) evt.preventDefault();
        }
	},
	
	/**
	 * Handle scrollStart event 
	 */
	handleScrollMove: function(cmp, evt) {
		if (!this.SHOW_SELECTED_PAGE_ONLY) {
			return;
		}
		
		var scroller = this.getScroller(cmp),
			nextPage,			
			prevSelectedPage = cmp.get('v.priv_currentPage');
		
		if (scroller.absDistX > this.SCROLL_START_THRESHOLD && !cmp._isScrollStartProcessed) {			
			if (scroller.dirX == 1) {
				//scrolling to right
				//scroller page starts with 0;
				nextPage = scroller.currPageX + 2;
			} else if (scroller.dirX == -1) {
				//scrolling to the left				
				nextPage = scroller.currPageX;
			}
					
			cmp._isScrollStartProcessed = true;
			cmp._pageToHide = scroller.currPageX + 1;
			
			this.showPage(cmp, nextPage);				
		}
	},
	
	/**
	 * Handle scroll event 
	 */
	handleScrollEnd: function(cmp, evt) {
		var scroller = this.getScroller(cmp),
			//scroller page starts with 0
			currentPageX = scroller.currPageX + 1,			
			prevSelectedPage = cmp.get('v.priv_currentPage');
		
		cmp._isScrollStartProcessed = false;
				
		if (prevSelectedPage == currentPageX) {
			//scrolled back to the same page
			if (cmp._pageLastShown != currentPageX) {
				this.hidePage(cmp, cmp._pageLastShown);
			}
			return;
		}
		
		this.pageSelected(cmp, currentPageX);
		
		if (cmp._pageToHide) {
			//it has scrolled to the next page, need to hide the previous page
			var prevPage;
			if (scroller.dirX == 1) {
				//scrolling to the right
				prevPage = currentPageX - 1;
			} else if (scroller.dirX == -1) {
				//scrolling to the left
				prevPage = currentPageX + 1;
			}
			
			this.hidePage(cmp, cmp._pageToHide)
			delete cmp._pageToHide;
		}
	},
	
	showPage: function(cmp, pageIndex){
		if (cmp.get('v.continuousFlow')) {
			return;
		}
		
		var pageComponent = this.getPageComponentFromIndex(cmp, pageIndex);
		if (pageComponent) {
			cmp._pageLastShown = pageIndex;
			var e = pageComponent.get('e.show');
			e.setParams({'pageIndex' : pageIndex});
			e.fire();
		}
	},
	
	hidePage: function(cmp, pageIndex) {
		if (cmp.get('v.continuousFlow')) {
			return;
		}
		
		var pageComponent = this.getPageComponentFromIndex(cmp, pageIndex);
		if (pageComponent) {	 
			var e = pageComponent.get('e.hide');
			e.setParams({'pageIndex' : pageIndex});
			e.fire();
		}
	},
	
	/**
	 * Page is selected, delegate the event to page component
	 */
	pageSelected: function(cmp, pageIndex) {
	
		var prevSelectedPage = cmp.get('v.priv_currentPage');
			//pageContainer = this.getPageContainerFromIndex(cmp, pageIndex);
			
		if (prevSelectedPage == pageIndex) {			
			return;
		}

		var curPageCmp = this.getPageComponentFromIndex(cmp, pageIndex);
		if (curPageCmp) {
			var prePageCmp = this.getPageComponentFromIndex(cmp, prevSelectedPage);
			
			cmp.getAttributes().setValue('priv_currentPage', pageIndex);
			
			this.firePageSelectedEventToPage(prePageCmp, pageIndex);
			this.firePageSelectedEventToPage(curPageCmp, pageIndex, pageIndex);
			this.firePageSelectedEventToPageIndicator(cmp, curPageCmp, pageIndex);			
		}
	},
	
	/**
	 * Fire pageSelected event to page component
	 */	
	firePageSelectedEventToPage: function(pageCmp, selectedPage) {
		if (pageCmp) {
			var e = pageCmp.get('e.pageSelected');
			e.setParams({pageIndex : selectedPage});
			e.fire();		
		}
	},
		 
	firePageSelectedEventToPageIndicator: function(carouselCmp, pageCmp, selectedPage) {
		var pageIndicator = carouselCmp.find('pageIndicator');
		
		if (pageIndicator && pageCmp.isRendered()) {			 
			var pageId = pageCmp.getElement().id,
				e = pageIndicator.get('e.pageSelected');
		
			e.setParams({pageIndex : selectedPage, pageId: pageId});
			e.fire();		 			
		}
	},
 
	/**
	 * Selecting a page from non-scrolling events
	 */
	selectPage : function(cmp, pageIndex, time) {		
		var pages = this.getPageComponents(cmp);
		//scroller page starts with 0
		pageIndex--;
		if (pageIndex >= 0 && pageIndex < pages.length) {
			scroller = this.getScroller(cmp);
			scroller.scrollToPage(pageIndex, null, time);		 
		}		
	},
	
	selectDefaultPage : function(cmp) {
		var pageCmps = this.getPageComponents(cmp),
			defaultPage = cmp.get('v.defaultPage'),
			pageToSelect = 1;
		 
		if (defaultPage) {
			pageToSelect = defaultPage;
		} else {
		    for (var i = 0; i < pageCmps.length; i++) {
		        if (pageCmps[i].get('v.isDefault')) {
		        	//page starts at 1
		        	pageToSelect = i + 1;
		        }
		    }	        
		}
		this.selectPage(cmp, pageToSelect, 0); 
	},
		 
		
	getPageComponents:function(cmp) {
		return cmp.get('v.pageComponents');
	},
	
	getPageModels:function(cmp) {
		return cmp.get('v.pageModels');
	},
	
	getPageModelFromIndex: function(cmp, pageIndex) {
		var pageModels = this.getPageModels(cmp);
		//page start from 1
		pageIndex--;

		return pageModels ? pageModels[pageIndex] : null; 
	},
	
	getPageComponentFromIndex: function(cmp, pageIndex) {
		var pages = this.getPageComponents(cmp);
		//page start from 1
		pageIndex--;
		if (pages && pageIndex >=0 && pageIndex < pages.length) {
			return pages[pageIndex];
		}
		
		return null;
	},
	 
	getScroller : function(cmp) {		
		return cmp.find('scroller')._scroller;		
	}
	
})
