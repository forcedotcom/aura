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
	KEY_PAGE_SELECTION_TIMEOUT_DURATION: 200,    
	keyPageSelectionTimeout: null,
    
	
	init : function(cmp) {		
		var pageContainer = cmp.find('pageContainer'),
			width = cmp.get('v.width'),
			height = cmp.get('v.height');
		
		this.initSize(cmp, width, height);
		this.initPages(cmp, width, height);
		this.initScroller(cmp, width, height);				
		this.initPageIndicator(cmp);
	},
				
	initSize : function(cmp, width, height) {
		var style = width ? ('width:' + width + 'px;') : '';
		
		if (height) {
			height += this.INDICATOR_HEIGHT;
			style += 'height:' + height + 'px;';
		}
		cmp.getAttributes().setValue('priv_carouselStyle', style); 
	},
	
	initScroller: function(cmp, width, height) {
		var totalWidth, descriptor,	snap,
			pageCmps = this.getPageComponents(cmp);
		 
		if (pageCmps && pageCmps.length > 0) {
			if (width) {
				//set scroller width if carousel width is already defined
				totalWidth = width * pageCmps.length;
				cmp.getAttributes().setValue('priv_scrollerWidth',	totalWidth + 'px');
			}			

			cmp.getAttributes().setValue('priv_snap', 'section.carousel-page');			 		
		}
	},
	
	initPages: function(cmp, width, height) {
		var pageModels = this.getPageModels(cmp),
			pageCmps = this.getPageComponents(cmp),
			pageContainer = cmp.find('pageContainer'),			
			page,
			pages = [];

		if (pageCmps.length > 0) {			 
			for ( var i = 0; i < pageCmps.length; i++) {
				page = pageCmps[i];
				//append page components to page container body
				if ($A.util.isComponent(page) && page.isInstanceOf("ui:carouselPage")) {
					page.getAttributes().setValue('pageIndex', i);
					page.getAttributes().setValue('parent', [cmp]);
					page.getAttributes().setValue('width', width);
					page.getAttributes().setValue('height', height);
					pages.push(page);
				}
			}
			pageContainer.getValue('v.body').setValue(pages);			
			
		} else if (pageModels.length > 0) {
			for ( var i = 0; i < pageModels.length; i++) {
				page = pageModels[i];
				//create new instance of carousePage and pass pageModel to it
				 var component=$A.componentService.newComponent({
			            componentDef:{descriptor: 'markup://ui:carouselPage'},
			            attributes:{values: {pageModel : page, pageIndex: i, parent: [cmp]}}
			        },null,true);
				 pages.push(component);
			}
			pageContainer.getValue('v.body').setValue(pages);
			cmp.getValue('v.pageComponents').setValue(pages);
		}
	},	
	
	initPageIndicator : function(cmp) {
		var pager = cmp.find('pageIndicator');
		pager.getValue('v.pageComponents').setValue(cmp.find('pageContainer').get('v.body'));
		cmp.addHandler("scrollEnd", pager, "c.handleScrollChange");
	},
	
	/**
	 * Handle window resize event
	 * This event is always fired after the carousel is rendered
	 */
	refresh: function(cmp, evt) {
		var origWidth = cmp.get('v.width'),
			origHeight = cmp.get('v.height'),
			el = cmp.getElement(),
			elWidth = el.offsetWidth,
			elHeight = el.offsetHeight,
			style;
		
		var pages = cmp.find("pageContainer").get('v.body');
		
	    if (pages && pages.length > 0) {	    	
			//need to update each page width if carousel width is not explicitly set
			if (!origWidth) {			
				style = ['width:', elWidth, 'px;'].join('');
				for (var i=0; i< pages.length; i++) {
					pages[i].getElement().setAttribute('style', style);
				}				
				cmp.getAttributes().setValue('priv_scrollerWidth', elWidth * pages.length + 'px');
			}
	    } 
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
	
	/**
	 * Handle carousel indicator key events
	 */	
	handlePagerKeyed : function(cmp, evt) {
		var keyCode = evt.getParam("event").keyCode;
        // left arrow or right arrow
        if (keyCode === 37 || keyCode == 39) {
            var pageComps = this.getPageComponents(cmp),            	
            	pageIndex = evt.getParam("pageIndex");
            
            if (keyCode === 37 && pageIndex > 0) {  // left arrow
            	pageIndex--;
            }
            if (keyCode === 39 && pageIndex < pageComps.length - 1) {  // right arrow
            	pageIndex++;
            }
            
            if (this.keyPageSelectionTimeout != null) {
    			window.clearTimeout(this.keyPageSelectionTimeout);
    			this.keyPageSelectionTimeout = null;
    		}	 
    	 
    		// When coming from a key event, wait a second to commit to the page
    		// selection
            var that = this;
    		this.keyPageSelectionTimeout = window.setTimeout(function() {
    			that.keyPageSelectionTimeout = null;    			
    			that.selectPage(cmp, pageIndex);
    		}, this.KEY_PAGE_SELECTION_TIMEOUT_DURATION);
    		
            if (evt.preventDefault) evt.preventDefault();
        }
	},
	
	/**
	 * Handle scroll event 
	 */
	handleScrollEnd: function(cmp, evt) {		
		var scroller = this.getScroller(cmp),
			currentPageX = scroller.currPageX,
			compEvents = cmp.getEvent("scrollEnd"),
			prevSelectedPage = cmp.get('v.priv_currentPage');
		
		if (prevSelectedPage == currentPageX) {			
			return;
		}
		
		this.pageSelected(cmp, currentPageX);
		
		//fire event to update page indicator
		this.fireScrollEndEvent(cmp, currentPageX);	
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
		
		cmp.getAttributes().setValue('priv_currentPage', pageIndex);
		this.firePageSelectedEvent(cmp, prevSelectedPage, pageIndex);
		this.firePageSelectedEvent(cmp, pageIndex, pageIndex);
	},
	
	/**
	 * Fire pageSelected event to page component
	 */	
	firePageSelectedEvent: function(cmp, pageIndex, selectedPage) {
		var pageCmp = this.getPageComponentFromIndex(cmp, pageIndex);
		
		if (pageCmp) {			
			var e = pageCmp.get('e.pageSelected');
			e.setParams({pageIndex : selectedPage});
			e.fire();
		}
	},
 
	/**
	 * Selecting a page from non-scrolling events
	 */
	selectPage : function(cmp, pageIndex, time) {
		var pages = this.getPageComponents(cmp);

		if (pageIndex >= 0 && pageIndex < pages.length) {
			scroller = this.getScroller(cmp);
			scroller.scrollToPage(pageIndex, null, time);		 
		}		
	},
	
			
	/**
	 * Load dynamic page content into the page
	 */
	loadPage: function(cmp, pageCmp, pageIndex) {		
		var page = this.getPageFromIndex(cmp, pageIndex);
			pageContainer = cmp.find('pages')[pageIndex].getValue('v.body');
				
		 // If cached skip further processing
        if (pageContainer.isCached) {
            return;
        }
	        
		// Discard previous content
        if (pageContainer && !pageContainer.isEmpty()) {
        	pageContainer.destroy();
        }
		pageContainer.setValue(pageCmp);		
		 
        if (page.isCacheable) {
            pageContainer.isCached = true;
        }
	},
		
		 
	fireScrollEndEvent : function(cmp, pageIndex) {		
		var compEvents = cmp.getEvent("scrollEnd");

		compEvents.setParams({
			"currentPageX" : pageIndex
		});		
		compEvents.fire();
	},
	
	getPageComponents:function(cmp) {
		return cmp.get('v.pageComponents');
	},
	
	getPageModels:function(cmp) {
		return cmp.get('v.pageModels');
	},
	
	getPageModelFromIndex: function(cmp, pageIndex) {
		var pageModels = this.getPageModels(cmp);
		return pageModels ? pageModels[pageIndex] : null; 
	},
	
	getPageComponentFromIndex: function(cmp, pageIndex) {
		var pages = this.getPageComponents(cmp);
		if (pages && pageIndex >=0 && pageIndex < pages.length) {
			return pages[pageIndex];
		}
		
		return null;
	},
	 
	getScroller : function(cmp) {
		return cmp.find('scroller')._scroller;
	}
	
})
