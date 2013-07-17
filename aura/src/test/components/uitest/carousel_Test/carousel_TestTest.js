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
 			var carousel = cmp.find("carousel1");
 			var pages = this.getPagesOnCarousel(carousel);
 			
 			this.verifyPageSelected(pages, 1);
 			this.verifyMdmPage(this.getSelectedPage(carousel), 1, "New Post 1");
 			this.assertNavigationIndicatorSelected(carousel, 1);
 		}, function(cmp) {
 			// go back
    		this.goToPageOnCarousel(cmp, "carousel1", 2, "c1-p2");
 		}, function(cmp) {
 			// verify
 			var carousel = cmp.find("carousel1");
 			var pages = this.getPagesOnCarousel(carousel);
 			
    		this.verifyPageSelected(pages, 2);
    		this.verifyMdmPage(this.getSelectedPage(carousel), 1, "New Post 2");
    		this.assertNavigationIndicatorSelected(carousel, 2);
 		}, function(cmp) {
 			// go to last page
 			this.goToPageOnCarousel(cmp, "carousel1", 7, "c1-updateOutput");
 		}, function(cmp) {
 			// verify
 			var carousel = cmp.find("carousel1");
 			var pages = this.getPagesOnCarousel(carousel);
 			
    		this.verifyPageSelected(pages, 7);
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
    		
			$A.test.assertTrue($A.util.hasClass(selectedPage.getElement(), "carousel-page-selected"), 
 				"Selected page should have 'selected' css");
 			$A.test.assertFalse($A.util.hasClass(selectedPage.getElement(), "hidden"),
 				"Selected page should NOT have 'hidden' css");
 			
 			var outputCmp = selectedPage.get("v.body");
 			$A.test.assertFalse($A.util.isUndefinedOrNull(outputCmp), "Could not find output component");
 			$A.test.assertEquals("page 3", outputCmp[0].get("v.value"), 
    			"Not on the correct page.");
    		
    		this.assertNavigationIndicatorSelected(carousel, expectedDefaultPage);
    			
    		// page #2 that was supposed to be default should not have selected css
    		var pageElem = this.getPageOnCarousel(carousel, 2).getElement();
    		$A.test.assertFalse($A.util.hasClass(pageElem, "carousel-page-selected"), 
 				"Selected page should NOT have 'selected' css");
 			$A.test.assertTrue($A.util.hasClass(pageElem, "hidden"),
 				"Selected page should have 'hidden' css");
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
 			// TODO : Bug W-1701867
 			//var indicators = this.getNavigationIndicators(carousel);
 			//$A.test.assertEquals(10, indicators.length, 
            //	"Carousel does not have the correct number of navigation indicators");
            var expectedPage = this.getPageOnCarousel(carousel, 1);
            var selectedPage = this.getSelectedPage(carousel);
            $A.test.assertFalse($A.util.isUndefinedOrNull(selectedPage), 
            	"No page on rerendered carousel was selected");
            $A.test.assertEquals(expectedPage.getLocalId(), selectedPage.getLocalId(), 
            	"Expected focus to be on first page.");
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
            var child = this.carouselInCarouselGetChildCarousel(parentPage);
            
            // go to page 2 on child carousel
            this.goToPageOnCarousel(cmp, "childCarousel-smaller", 2, "childCarousel-smaller-p2");
 		}, function(cmp){
 			// verify on the correct page
            var parent = cmp.find("carouselInCarousel");
            var parentPage = this.getSelectedPage(parent);
            var child = this.carouselInCarouselGetChildCarousel(parentPage);
            var childPage = this.getSelectedPage(child);
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
            var id = page2.getLocalId();
            $A.test.assertEquals("cinc-p2", id, "Expected to switch to page 2 on parent carousel");
            this.assertNavigationIndicatorSelected(parent, 2);
            
            // verify child carousel is on the correct page as well
            var child = this.carouselInCarouselGetChildCarousel(page2);
            var childPage = this.getSelectedPage(child);
            $A.test.assertEquals(childPage.getLocalId(), "childCarousel-sameDim-p1", 
            	"Expected to be on page 1 of child carousel")
            this.assertNavigationIndicatorSelected(child, 1);
        }]
    },
    
    /**
     * Test firing of the fireSlideChangedEvent.
     */
    testFireSlideChangeEvent : {
    	browsers: ["-IE7","-IE8"],
    	test : [function(cmp) {
    		var count = cmp.getValue("v.slideChangedEventCount").getValue();
    		// count should be 2 because of initial load of carousel 1
 			$A.test.assertEquals(1, count, "Initial slideChangedEvent incorrect");
 			
 			// go to 1st page
 			this.goToPageOnCarousel(cmp, "carousel1", 1, "c1-p1");
 		}, function(cmp) {
 			// verify
 			var count = cmp.getValue("v.slideChangedEventCount").getValue();
 			$A.test.assertEquals(2, count, "slideChangedEvent was not fired");
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
 		page = page.getElement();
 		if (isSelected) {
 			$A.test.assertTrue($A.util.hasClass(page, "carousel-page-selected"), 
 				"Selected page at " + pageNum + " should have 'selected' css");
 			$A.test.assertFalse($A.util.hasClass(page, "hidden"),
 				"Selected page at " + pageNum + " should NOT have 'hidden' css");
 			this.assertAriaExpanded(page, true);
 		} else {
 			$A.test.assertFalse($A.util.hasClass(page, "carousel-page-selected"),
 				"UnSelected page at " + pageNum + " should NOT have 'selected' css");
 			$A.test.assertTrue($A.util.hasClass(page, "hidden"),
 				"UnSelected page at " + pageNum + " should have 'hidden' css");
 			this.assertAriaExpanded(page, false);
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
 			var indicatorElem = indicators[i].getElement();
 			
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
    	return (page.getLocalId() === pageId);
    }
})