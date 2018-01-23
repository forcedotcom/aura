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
	 * Verify aria attributes are correct on carousel pages
	 */
	testCarouselAccessibility : {
		browsers : [ "-IE8" ],
		test : [function(cmp) {
                        // Disabled due to this functionality not working with Chrome 59 and ChromeDriver
                        // 2.33. See W-4402250, https://gus.lightning.force.com/one/one.app#/sObject/a07B0000004BgIyIAK/view
                        // for more information.
			//this.goToPageOnCarousel(cmp, "carousel", 2);
		},
		function(cmp) {
			var carousel = cmp.find("carousel"),
				pages = carousel.get("v.body");

			// Checks that aria attributes are correct for when the second page is selected
                        // Disabled due to this functionality not working with Chrome 59 and ChromeDriver
                        // 2.33. See W-4402250, https://gus.lightning.force.com/one/one.app#/sObject/a07B0000004BgIyIAK/view
                        // for more information.
			//this.assertAriaAttributesOnPage(pages[0].getElement(), false);
			//this.assertAriaAttributesOnPage(pages[1].getElement(), true);
        },
        function(cmp) {
        	this.goToPageOnCarousel(cmp, "carousel", 1);
        },
        function(cmp) {
        	var carousel = cmp.find("carousel"),
        		pages = carousel.get("v.body");
        	
        	// Checks that aria attributes are correct for when the first page is selected
        	this.assertAriaAttributesOnPage(pages[0].getElement(), true);
			this.assertAriaAttributesOnPage(pages[1].getElement(), false);
        }]
    },
    
    /**
     * Assertions
     */
    assertAriaAttributesOnPage : function(element, isSelected) {
    	this.assertElementAttribute(element, 'aria-expanded', isSelected);
    	this.assertElementAttribute(element, 'aria-hidden', !isSelected);
    },
    
    /**
     * Helper Functions
     */
    
    goToPageOnCarousel : function(cmp, carouselName, pageNumber) {
		pageNumber--;
		var carousel = cmp.find(carouselName),
			pageIndicator = carousel.get("v.pageIndicatorComponent")[0];
		
		pageIndicator.getEvent("pagerClicked")
					 .setParams({pageIndex : pageNumber})
					 .fire();
		
		var waitForPageChange = this.waitForPageChange;
		var that = this;
		$A.test.addWaitFor(true, function() {
			return waitForPageChange.apply(that, [ cmp, carouselName,
					pageNumber ]);
		});
	},
	assertElementAttribute : function(element, attribute, value) {
		var errorMsg = attribute + " value was incorrect";
		
		$A.test.assertEquals(value.toString(), $A.test
				.getElementAttributeValue(element, attribute),
				errorMsg);
	},
	waitForPageChange : function(cmp, carouselName, pageIndex) {
		var c = cmp.find(carouselName);
		return (c._currentPage === pageIndex);
	}
})
