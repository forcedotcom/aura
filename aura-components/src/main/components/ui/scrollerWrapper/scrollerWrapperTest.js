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
	 * When using scrollerWrapper there should be a scrollable and a v.class
	 */
	testClassAttribute : {
		attributes : {
			"class" : "test"
		},
		test : function(component) {
			$A.test.assertTrue($A.util.hasClass(component, "scrollable"),
					"There should be a scrollable class");
			$A.test.assertTrue($A.util.hasClass(component, "test"),
					"There should be a v.class");
		}
	},

	/**
	 * When using IOS there should be a scrollingOnIOS class
	 */
	testClassAttributeIOS : {
		browsers : [ "IPHONE", "IPAD" ],
		test : function(component) {
			$A.test.assertTrue($A.util.hasClass(component, "scrollingOnIOS"),
					"There should be a scrollingOnIOS class");
		}
	},

	/**
	 * When using nonIOS there should NOT be a scrollingOnIOS class
	 */
	testClassAttributeNonIOS : {
		browsers : [ "-IPHONE", "-IPAD" ],
		test : function(component) {
			$A.test.assertFalse($A.util.hasClass(component, "scrollingOnIOS"),
					"There should NOT be a scrollingOnIOS class");
		}
	},

	/**
	 * Check scroll container's dimensions when it's initialized with width and height
	 */
	testInitWithHeightWidth : {
		attributes : { "height" : "100px", "width" : "200px" },
		test : function(component) {
			var wrapperElement = component.find("scrollerWrapper").getElement();
			var actualHeight = wrapperElement.style.height;
			var actualWidth = wrapperElement.style.width;
			var expectedHeight = "100px";
			var expectedWidth  = "200px";

			$A.test.assertEquals(expectedHeight, actualHeight,
				"Scroll container's height should be set to " + expectedHeight + ", but it's " + actualHeight);
			$A.test.assertEquals(expectedWidth, actualWidth,
				"Scroll container's height should be set to " + expectedWidth + ", but it's " + actualWidth);
		}
	},

	/**
	 * Check scroll container's dimensions when width and height are set
	 */
	testSetHeightWidth : {
		test : [function(component) {			
			this.expectedHeight = "50vh";
			this.expectedWidth  = "50%";

			component.set("v.height", this.expectedHeight);
			component.set("v.width", this.expectedWidth);
		}, function(component) {
			var wrapperElement = component.find("scrollerWrapper").getElement();
			var actualHeight = wrapperElement.style.height;
			var actualWidth = wrapperElement.style.width;

			$A.test.assertEquals(this.expectedHeight, actualHeight,
				"Scroll container's height should be set to " + this.expectedHeight + ", but it's " + actualHeight);
			$A.test.assertEquals(this.expectedWidth, actualWidth,
				"Scroll container's height should be set to " + this.expectedWidth + ", but it's " + actualWidth);
		}]
	},

	/**
	 * Check scroll container's dimensions when the width and height are not set
	 * Expected values for both are empty strings
	 */
	testNoHeightWidth : {
		test : function(component) {
			var wrapperElement = component.find("scrollerWrapper").getElement();
			var actualHeight = wrapperElement.style.height;
			var actualWidth = wrapperElement.style.width;

			$A.test.assertEquals('', actualHeight, "Scroll container should not have height and width set");
			$A.test.assertEquals('', actualWidth, "Scroll container should not have height and width set");
		}
	}
})// eslint-disable-line semi
