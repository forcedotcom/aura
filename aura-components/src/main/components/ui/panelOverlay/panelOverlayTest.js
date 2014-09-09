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
	
	browsers:["GOOGLECHROME", "SAFARI"],

	setUp: function(cmp) {
		
		FORCE = {
			getPrefix: function() {
				return "webkit";
			}
		};

	},

	// verify panel element
	verifyPanelElements: function(cmp) {

		var ele = cmp.find("panel").getElement();
		var attributes = cmp.attributes;

		$A.test.assertTrue($A.util.hasClass(ele, "panel"), "Element is not rendered with panel class");

		$A.test.assertFalsy(cmp.get('v.detail'), "unexpected attr");
		$A.test.assertFalsy(cmp.get('v.icon'), "unexpected attr");
		$A.test.assertTruthy(ele.querySelector(".body"), "body is not rendered");
		
		// title bar
		if(!cmp.get("v.removeHeader") && cmp.get("v.title")) {
			$A.test.assertTruthy(ele.querySelector(".titleBar"), "titleBar is not rendered");

			// title
			if(cmp.get("v.title")) {
				$A.test.assertEquals(cmp.get("v.title"), ele.querySelector(".title").textContent, "title is not expected");
			}
			else {
				$A.test.assertFalsy(ele.querySelector(".title")?ele.querySelector(".title").textContent:ele.querySelector(".title"), "title is unexpectedly rendered");
			}
		}
		else {
			$A.test.assertFalsy(ele.querySelector(".titleBar"), "titleBar is unexpectedly rendered");
		}

		// buttons
		if(cmp.get("v.body").length) {
			$A.test.assertTruthy(ele.querySelector(".button_row"), "buttons not rendered");
		}
		else {
			$A.test.assertFalsy(ele.querySelector(".button_row"), "buttons unexpectedly rendered");
		}

		// additional class
		if(cmp.get("v.class")) {
    		$A.test.assertTrue($A.util.hasClass(ele, cmp.get("v.class")), "Additional class not added as expected");
    	}
    	else {
    		$A.test.assertTrue($A.util.hasClass(ele, "forceUIPanel"), "Additional class added unexpectedly");
    	}
	},

	/*
	* Panel is rendered
	*/
	testPanelAllAttributes:{
		attributes: { 
			isVisible:true, 
			title:"test title",
			'class': "testClass",
			isScrollable: true,
			removeHeader: false
		},
	    test : function(cmp){

	    	// Assert
	    	this.verifyPanelElements(cmp);
	    }
	},
	
	testPanelNoScroller:{
		attributes: { 
			isVisible:true, 
			title:"test title",
			'class': "testClass",
			isScrollable: false
		},
	    test : function(cmp){

	    	// Assert
	    	this.verifyPanelElements(cmp);
	    }
	},

	testPanelRemoveHeader:{
		attributes: { 
			isVisible:true, 
			title:"test title",
			'class': "testClass",
			removeHeader: true
		},
	    test : function(cmp){

			// Assert
	    	this.verifyPanelElements(cmp);
	    }
	},

	testPanelSpecialCharecter:{
		attributes: { 
			isVisible:true, 
			title:"test title!$#%^!^%$^&@FAGFDGWAERGY$#^%&@%#^%$&amp;",
			'class': "testClass",
			isScrollable: true,
			removeHeader: false
		},
	    test : function(cmp){

	    	// Assert
	    	this.verifyPanelElements(cmp);
	    }
	}
})
