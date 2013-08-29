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
 	/**
 	 * Verify multiple carousels can exist on same page. 
 	 */
 	testMultipleCarousels : {
 		browsers: ["-IE7","-IE8"],
 		test : function(cmp){
			var carousel1 = cmp.find("carousel1");
			$A.test.assertFalse($A.util.isUndefinedOrNull(carousel1), "Did not find carousel 1");
			var carousel2 = cmp.find("carousel2");
			$A.test.assertFalse($A.util.isUndefinedOrNull(carousel2), "Did not find carousel 2");
        }
    },
    
    /**
     * Switching pages using the navigation page indicators correctly switchs page
     * to the target page and navigation indicators are updated. 
     */
 	testSwitchPageUsingPageIndicator : {
 		browsers: ["-IE7","-IE8"],
 		test : [function(cmp) {
 			// go to 1st page
 			this.goToPageOnCarousel(cmp, "carousel1", 1, "c1-p1");
 		}, function(cmp) {
 			// verify
 			var me = this;
 			var carousel = cmp.find("carousel1");
 			var pages = this.getPagesOnCarousel(carousel);
 			
 			$A.test.addWaitForWithFailureMessage(true, function(){
	    		var page = me.getSelectedPage.apply(me, [carousel]);	
	    		return (page === pages[0]);
 			}, "Page 1 is not selected");
 			
 			this.verifyMdmPage(this.getSelectedPage(carousel), 1, "New Post 1");
 			this.assertNavigationIndicatorSelected(carousel, 1);
 		}, function(cmp) {
 			// go back
    		this.goToPageOnCarousel(cmp, "carousel1", 2, "c1-p2");
 		}, function(cmp) {
 			// verify
 			var me = this;
 			var carousel = cmp.find("carousel1");
 			var pages = me.getPagesOnCarousel(carousel);
 			
 			$A.test.addWaitForWithFailureMessage(true, function(){
	    		var page = me.getSelectedPage.apply(me, [carousel]);	
	    		return (page === pages[1]);
 			}, "Page 2 is not selected");

    		this.verifyMdmPage(this.getSelectedPage(carousel), 1, "New Post 2");
    		this.assertNavigationIndicatorSelected(carousel, 2);
 		}, function(cmp) {
 			// go to last page
 			this.goToPageOnCarousel(cmp, "carousel1", 7, "c1-updateOutput");
 		}, function(cmp) {
 			// verify
 			var me = this;
 			var carousel = cmp.find("carousel1");
 			var pages = me.getPagesOnCarousel(carousel); 			
 			
 			$A.test.addWaitForWithFailureMessage(true, function(){
	    		var page = me.getSelectedPage.apply(me, [carousel]);	
	    		return (page === pages[6]);
 			}, "Page 7 is not selected");

 			// are we on the right page?
 			var outputCmp = pages[6].get("v.body");
 			$A.test.assertFalse($A.util.isUndefinedOrNull(outputCmp), "Could not find output component");
 			$A.test.assertEquals("i have something to say...", outputCmp[2].get("v.value"), 
    			"Not on the last page");
    		this.assertNavigationIndicatorSelected(carousel, 7);
        }]
    },
    
    /**
     * Page content of a carousel page can be dynamically updated.
     */
    testUpdatePageContent : {
    	browsers: ["-IE7","-IE8"],
 		test : [function(cmp){
 			var carousel = cmp.find("carousel1");
            this.goToPageOnCarousel(cmp, "carousel1", 7, "c1-updateOutput");
 		}, function(cmp){
 			var carousel = cmp.find("carousel1");
            var page = this.getSelectedPage(carousel);
            
            $A.test.assertNotNull(page, "Page retrieved is null");
            var outputCmp = page.get("v.body");
            $A.test.assertFalse($A.util.isUndefinedOrNull(outputCmp), "Could not find output component");
            $A.test.assertEquals("i have something to say...", outputCmp[2].get("v.value"), 
    			"Not on the last page");
    		
    		var btn = cmp.find("btnUpdateOutput");
    		btn.get("e.press").fire();
    		var getSelectedPage = this.getSelectedPage;
    		var that = this;
    		$A.test.addWaitForWithFailureMessage(true, function(){
    			var carousel = cmp.find("carousel1");
	    		var page = getSelectedPage.apply(that, [carousel]);
	    		$A.test.assertNotNull(page, "Page retrieved is null");
	    		var outputCmp = page.get("v.body");
	    		$A.test.assertFalse($A.util.isUndefinedOrNull(outputCmp), "Could not find output component");
	    		return ("hello!" === outputCmp[2].get("v.value"))
 			}, "Content of page was not updated");
        }]
    },
    
    /**
     * Carousel with one tab renders correctly. 
     */
 	testCarouselWithOneTab : {
 		browsers: ["-IE7","-IE8"],
 		test : function(cmp){
 		    var carousel = cmp.find("carousel2");
 		    var pages = this.getPagesOnCarousel(carousel);
            $A.test.assertEquals(1, pages.length, "Should only see one page");
            this.assertPageSelected(pages[0], true, 1);
            
            // TODO : @ctatlah - uncomment after jye/jhuang check in his changes regarding 
            // tab indicators displaying for single page carousel from projectone to master.
            // 
            // verify tab indicators do not display
            //var indicatorItems = cmp.find("carousel2").find("navContainer").get("v.body")[0].find("indicatorItems");
            //$A.test.assertNull(indicatorItems.getElement(), "Should be zero tab indicators displayed");
        }
    },
    
    /**
     *  Can use navigation indicators at the bottom of page to switch pages
     */
    testNavigationBarAtBottomSwitchPage : {
 		browsers: ["-IE7","-IE8"],
 		test : function(cmp){
            var carousel = cmp.find("carouselNavBottom");
            this.goToPageOnCarousel(cmp, "carouselNavBottom", 2, "cnb-p2");
		}
    }, 
    
    /**
     * Setting isDefault on a carouselPage shows that page on load.
     */
    testDefaultPage : {
    	browsers: ["-IE7","-IE8"],
 		test : function(cmp){
    		var expectedDefaultPage=2;
    		var carousel = cmp.find("carousel1");
    		var pages = this.getPagesOnCarousel(carousel);
			
    		// go through all pages and verify only one is set to selected
    		this.verifyPageSelected(pages, expectedDefaultPage);
    		
    		// verify the selected page is the correct page should be page #2
    		// which has 6 carouselPageItems
    		var page = this.getSelectedPage(carousel);
    		this.verifyMdmPage(page, 1, "New Post 2");
    	}
    },
    
    /**
     * Verify the navigation indicators are displayed correctly when
     * isDefault page is set. 
     */
    testDefaultPageNavigationIndicators : {
    	browsers: ["-IE7","-IE8"],
 		test : function(cmp){ 
    		var expectedDefaultPage=2;
	    	var carousel = cmp.find("carousel1");
	    	this.assertNavigationIndicatorSelected(carousel, expectedDefaultPage);	
    	}
    },
    
    /**
     * Carousel defaultPage attribute can override pages isDefault setting.
     * Verify the correct default page is loaded. 
     */
    testCarouselDefaultPageOverridesPageSetting : {
    	browsers: ["-IE7","-IE8"],
 		test : function(cmp){
    		var expectedDefaultPage=3;
    		var carousel = cmp.find("carouselDefaultOverride");
    		var selectedPage = this.getPageOnCarousel(carousel, expectedDefaultPage);
    	 
			$A.test.assertTrue(selectedPage.getValue('v.isSelected').getBooleanValue(),
 				"Selected page should be selected");
			
			this.assertPageVisibility(selectedPage, true);
 			
 			var outputCmp = selectedPage.get("v.body");
 			$A.test.assertFalse($A.util.isUndefinedOrNull(outputCmp), "Could not find output component");
 			$A.test.assertEquals("page 3", outputCmp[0].get("v.value"), 
    			"Not on the correct page.");
    		
    		this.assertNavigationIndicatorSelected(carousel, expectedDefaultPage);
    			
    		// page #2 that was supposed to be default should not have selected css
    		var pageCmp = this.getPageOnCarousel(carousel, 2);
    		$A.test.assertFalse(pageCmp.getValue('v.isSelected').getBooleanValue(), 
 				"Selected page should NOT be selected");
    		this.assertPageVisibility(pageCmp, false);    		 
    	}
    },
    
    /**
     * Able to rerender entire carousel with new page data. 
     */
    testRerenderCarousel : {
 		browsers: ["-IE7","-IE8"],
 		test : [function(cmp){
            var btn = cmp.find("btnCreatePages");
            btn.get("e.press").fire();
            var getPagesOnCarousel = this.getPagesOnCarousel;
    		var that = this;
    		$A.test.addWaitForWithFailureMessage(10, function(){
    			var carousel = cmp.find("carousel2");
            	var pages = getPagesOnCarousel.apply(that, [carousel]);
	    		return pages.length;
 			}, "Carousel was not rerendered");
 		}, function(cmp){
 			var carousel = cmp.find("carousel2");
 			var expectedPage = this.getPageOnCarousel(carousel, 1);
 			
 			// verify first page is selected
 			var waitForPageChange = this.waitForPageChange;
 			var that = this;
 			$A.test.addWaitFor(true, function(){
 				return waitForPageChange.apply(that, [cmp, "carousel2", expectedPage.getLocalId()]);
 			});
 			var indicators = this.getNavigationIndicators(carousel);
 			$A.test.assertEquals(10, indicators.length, 
            	"Carousel does not have the correct number of navigation indicators");
        }]
    },

    /**
     * Carousel with 100 pages renderes correctly. 
     */
    testMaxPages : {
 		browsers: ["-IE7","-IE8"],
 		test : function(cmp){
            var carousel = cmp.find("carouselMaxPages");
            var pages = this.getPagesOnCarousel(carousel);
            $A.test.assertEquals(100, pages.length, 
            	"Carousel does not have the correct number of pages");
            var indicators = this.getNavigationIndicators(carousel);
            $A.test.assertEquals(100, indicators.length, 
            	"Carousel does not have the correct number of navigation indicators");
        }
    },
    
    /**
     * Continous flow carousel has correct aria values set.
     */
    testContinousFlowAriaValues : {
 		browsers: ["-IE7","-IE8"],
 		test : function(cmp){
 			var carousel = cmp.find("carouselContinousFlow");
    		var pages = this.getPagesOnCarousel(carousel);
    		for (var i=0; i<pages.length; i++) {
    			this.assertAriaExpanded(pages[i].getElement(), true);	
    		}
    	}
    },
    
    /**
     * Able to render a component that has a carousel within a carousel. 
     */
    testCarouselWithinCarousel : {
 		browsers: ["-IE7","-IE8"],
 		test : function(cmp){
            var parent = cmp.find("carouselInCarousel");
			$A.test.assertFalse($A.util.isUndefinedOrNull(parent), "Did not find parent carousel");
			var child1 = cmp.find("childCarousel-smaller");
			$A.test.assertFalse($A.util.isUndefinedOrNull(child1), "Did not find child carousel 1");
			var child2 = cmp.find("childCarousel-sameDim");
			$A.test.assertFalse($A.util.isUndefinedOrNull(child2), "Did not find child carousel 2");
			var child3 = cmp.find("childCarousel-larger");
			$A.test.assertFalse($A.util.isUndefinedOrNull(child3), "Did not find child carousel 3");
        }
    },
    
    /**
     * With a carousel inside another carousel able to switch pages 
     * on a child carousel. All data and navigation indicators on the 
     * parent and child carousel are set properly. 
     */
    testCarouselWithinCarouselSwitchChildPage : {
 		browsers: ["-IE7","-IE8"],
 		test : [function(cmp){
            var parent = cmp.find("carouselInCarousel");
            
            // grab child carousel on page
            var parentPage = this.getSelectedPage(parent);
            $A.test.assertNotNull(parentPage, "Page retrieved is null");
            var child = this.carouselInCarouselGetChildCarousel(parentPage);
            
            // go to page 2 on child carousel
            this.goToPageOnCarousel(cmp, "childCarousel-smaller", 2, "childCarousel-smaller-p2");
 		}, function(cmp){
 			// verify on the correct page
            var parent = cmp.find("carouselInCarousel");
            var parentPage = this.getSelectedPage(parent);
            $A.test.assertNotNull(parentPage, "Page retrieved is null");
            var child = this.carouselInCarouselGetChildCarousel(parentPage);
            var childPage = this.getSelectedPage(child);
            $A.test.assertNotNull(childPage, "Page retrieved is null");
            $A.test.assertEquals(childPage.getLocalId(), "childCarousel-smaller-p2", 
            	"Expected to switch to page 2 on child carousel");
            this.assertNavigationIndicatorSelected(child, 2);
            this.assertNavigationIndicatorSelected(parent, 1);
        }]
    },
    
    /**
     *  With a carousel inside another carousel able to switch pages
     *  on the parent carousel. All data and navigation indicators on the
     *  parent and child carousel are set properly.
     */
    testCarouselWithinCarouselSwitchParentPage : {
 		browsers: ["-IE7","-IE8"],
 		test : [function(cmp){
            var parent = cmp.find("carouselInCarousel");
            this.goToPageOnCarousel(cmp, "carouselInCarousel", 2, "cinc-p2");
 		}, function(cmp){
 			// verify parent carousel is on the correct page
            var parent = cmp.find("carouselInCarousel");
            var page2 = this.getSelectedPage(parent);
            $A.test.assertNotNull(page2, "Page retrieved is null");
            var id = page2.getLocalId();
            $A.test.assertEquals("cinc-p2", id, "Expected to switch to page 2 on parent carousel");
            this.assertNavigationIndicatorSelected(parent, 2);
            
            // verify child carousel is on the correct page as well
            var child = this.carouselInCarouselGetChildCarousel(page2);
            var childPage = this.getSelectedPage(child);
            $A.test.assertNotNull(childPage, "Page retrieved is null");
            $A.test.assertEquals(childPage.getLocalId(), "childCarousel-sameDim-p1", 
            	"Expected to be on page 1 of child carousel")
            this.assertNavigationIndicatorSelected(child, 1);
        }]
    },
    
    /**
     * Test page change action is called when action is provided and page is changed
     */
    testCustomPageChangeAction : {
 		browsers: ["-IE7","-IE8"],
 		test : [function(cmp){
            cmp.getValue("v.isPageChangeActionCalled").setValue("false");
 		}, function(cmp){
 			this.goToPageOnCarousel(cmp, "pgChangeAction", 2, "cpca-p2");
 		}, function(cmp){
 			// verify parent carousel is on the correct page
            var carousel = cmp.find("pgChangeAction");
            var isPageChangeActionCalled = cmp.getValue("v.isPageChangeActionCalled").getBooleanValue();
            $A.test.assertTrue(isPageChangeActionCalled, "Expected custom page change action to be called");
            carousel.getValue("v.isPageChangeActionCalled").setValue("false");
        }]
    },
    
    goToPageOnCarousel : function(cmp, carouselName, pageNumber, pageId) {
    	pageNumber--;
    	var carousel = cmp.find(carouselName);
		var navIndicators = this.getNavigationIndicators(carousel);
		var targetIndicator = navIndicators[pageNumber];
		targetIndicator.get("e.click").fire();
		var waitForPageChange = this.waitForPageChange;
 		var that = this;
		$A.test.addWaitFor(true, function(){
 				return waitForPageChange.apply(that, [cmp, carouselName, pageId]);
 		});
    },
    
    getPagesOnCarousel : function(carousel) {
    	$A.test.assertFalse($A.util.isUndefinedOrNull(carousel), 
    		"Carousel not given. Is the name of the carousel correct?");
    	return carousel.get("v.pageComponents");
 	},
 	
 	getPageOnCarousel : function(carousel, pageNumber) {
 		pageNumber--;	
 		var pages = this.getPagesOnCarousel(carousel);
 		if (pageNumber >= 0 && pageNumber < pages.length) {
 			return pages[pageNumber];
 		}
 		return null;
 	},
 	
 	getSelectedPage : function(carousel) {
 		var pages = this.getPagesOnCarousel(carousel);
 		for (var i=0; i<pages.length; i++) {
 			var page = pages[i];
 			if (page.get("v.isSelected")) {
 				return page;
 			}
 		}
 		return null;
 	},
 	
 	getNavigationIndicators : function(carousel) {
 		$A.test.assertFalse($A.util.isUndefinedOrNull(carousel), 
    		"Carousel not given. Is the name of the carousel correct?");
 		var helper = carousel.getDef().getHelper();
 		var indicatorCmp = helper.getPageIndicatorsComponent(carousel);
 		
    	return indicatorCmp.find("indicatorItems");
 	},
 	
 	/** 
 	 * Goes through all pages and verify only one page is set to selected.
 	 * Use getPageSelected() and/or assertPageSelected to verify a single page.
 	 */
 	verifyPageSelected : function(pages, selectedPageNumber) {
 		for (var i=0; i<pages.length; i++) {
			if ((selectedPageNumber-1) === i) {
				this.assertPageSelected(pages[i], true, (i+1));
			} else {
				this.assertPageSelected(pages[i], false, (i+1));
			}
		}
 	},
 	
 	assertPageSelected : function(page, isSelected, pageNum) {
 		if (isSelected) {
 			$A.test.assertTrue(page.getValue('v.isSelected').getBooleanValue(), 
 				"Selected page at " + pageNum + " should have 'selected' css");
 			this.assertPageVisibility(page, true);
 			this.assertAriaExpanded(page.getElement(), true);
 		} else {
 			$A.test.assertFalse(page.getValue('v.isSelected').getBooleanValue(),
 				"UnSelected page at " + pageNum + " should NOT have 'selected' css");
 			this.assertPageVisibility(page, false);
 			this.assertAriaExpanded(page.getElement(), false);
 		}
 	},
 	
 	assertAriaExpanded : function(element, value) {
 		$A.test.assertEquals(value.toString(), $A.test.getElementAttributeValue(element, "aria-expanded"), 
 			"aria-expanded value was incorrect");
 	},
 	
 	assertAriaControlDefined : function(element, isDefined, errMsg) {
 		var actualAria = $A.test.getElementAttributeValue(element, "aria-controls");
 		if (isDefined) {
 			$A.test.assertNotEquals("undefined", actualAria, errMsg);
 		} else {
 			$A.test.assertTrue(("undefined" == actualAria || "" == actualAria), errMsg);
 		}
 	},
 	
 	assertAriaSelected : function(element, isSelected, errMsg) {
 		var actualAria = $A.test.getElementAttributeValue(element, "aria-selected");
 		$A.test.assertEquals(isSelected.toString(), actualAria, errMsg);
 	},
 	
 	assertNavigationIndicatorSelected : function(carousel, selectedIndicator) {
 		var indicators = this.getNavigationIndicators(carousel);
 		var errorMsg = function(expected, actual, msg) {
 			return "Navigation indicator incorrect. Expected indicator #" +
	 			expected + " to be selectged but indicator #" +
	 			actual + " was selected. " + msg;
 		}
 			
 		for (var i=0; i<indicators.length; i++) { 
 			var indicatorElem = indicators[i].getElement().childNodes[0];
 			
 			if ((selectedIndicator-1) === i) {
 				$A.test.assertTrue($A.util.hasClass(indicatorElem, "carousel-nav-item-selected"), 
 					errorMsg(selectedIndicator, (i+1)));
 				this.assertAriaControlDefined(indicatorElem, true, 
 					errorMsg(selectedIndicator, (i+1), "Checking aria-control"));
 				this.assertAriaSelected(indicatorElem, true, 
 					errorMsg(selectedIndicator, (i+1), "Checking aria-selected"))
 			} else {
 				$A.test.assertFalse($A.util.hasClass(indicatorElem, "carousel-nav-item-selected"), 
 					errorMsg(selectedIndicator, (i+1)));
 				this.assertAriaControlDefined(indicatorElem, false, 
 					errorMsg(selectedIndicator, (i+1), "Checking aria-control"));
 				this.assertAriaSelected(indicatorElem, false, 
 					errorMsg(selectedIndicator, (i+1), "Checking aria-selected"))
 			}
 		}
 	},
 	
 	assertPageVisibility : function(pageCmp, isVisible) {
 		$A.test.addWaitForWithFailureMessage(isVisible, function(){
			return pageCmp.getValue('v.priv_visible').getBooleanValue();
		}, "Selected page should be visible");		
 	},
 	
 	/**
 	 * Verify the selected page is the correct MDM page. MDM pages
 	 * have 6 carouselPageItems. In a matirx:
 	 *     ---------------------------------------------
 	 * [0] |     New Post #      |        Task #       | [1]
 	 *     ---------------------------------------------
 	 * [2] |  New Opportunity #  |   Thank Someone #   | [3]
 	 *     ---------------------------------------------
 	 * [4] |      File #         |  Post a New Poll #  | [5]
 	 *     ---------------------------------------------
 	 */
 	verifyMdmPage : function(page, pageItemNumber, expectedPageItemText) {
 		$A.test.assertNotNull(page, "Verifying mdm page, page provided is null");
 		pageItemNumber--;
 		var pageItems = page.get("v.body");
		$A.test.assertEquals(6, pageItems.length, "Incorrect page elements on MDM page.");
		var pageItem = pageItems[pageItemNumber];
		var actualText = $A.util.trim($A.test.getText(pageItem.getElement()));
		$A.test.assertEquals(expectedPageItemText, actualText, "Contents of MDM page incorrect.");
 	},
 	
 	carouselInCarouselGetChildCarousel : function(page) {
 		var childCarousel = page.get("v.body"); 
 		$A.test.assertFalse($A.util.isUndefinedOrNull(childCarousel), 
 			"Could not find body of carousel page");
 		return childCarousel[0];
    },
    
    waitForPageChange : function(cmp, carouselName, pageId) {
    	var c = cmp.find(carouselName);
    	var page = this.getSelectedPage(c);
    	var selectedPageId = $A.util.isUndefinedOrNull(page) ? "" : page.getLocalId();
    	return (selectedPageId === pageId);
    }
})