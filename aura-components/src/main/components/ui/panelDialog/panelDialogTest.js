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
	* Aura component to panel.cmp
	*/

	browsers:["GOOGLECHROME", "SAFARI"],
	attributes: {
		isModal : true
	},

	setUp: function(cmp) {
		FORCE = {
			getPrefix: function() {
				return "webkit";
			}
		};
	},

	// verify modal element
	verifyModalElements: function(cmp) {

		var containerEle = cmp.getElement();
		var ele = cmp.find("panel").getElement();
		
		$A.test.assertTruthy(ele.querySelector(".modalWindow"), "Element is not rendered as modal");
		$A.test.assertTruthy(ele.querySelector(".closeBtn"), "Close button is not rendered");
		$A.test.assertTrue($A.util.hasClass(ele, "panel"), "Element is not rendered with panel class");
		$A.test.assertTrue($A.util.hasClass(ele, "panelDialog"), "Element is not rendered with panelDialog class");
		
		//check for modal vs nonModal overlay
		if(cmp.get("v.isModal")) {
			$A.test.assertTrue($A.util.hasClass(containerEle, "modal"), "Container Element should have modal class");
			$A.test.assertTruthy(containerEle.querySelector(".modal-glass"), "modal glass is not rendered");
		}
		else{
			$A.test.assertTrue($A.util.hasClass(containerEle, "nonmodal"), "Container Element is not rendered with nonmodal class");
			$A.test.assertFalsy(containerEle.querySelector(".modal-glass"), "modal glass should not be rendered for nonModal panel Dialog");
		}
		
		// title bar
		if(cmp.get("v.title") || cmp.get("v.detail")) {
			
			$A.test.assertTruthy(ele.querySelector(".titleBar"), "titleBar is not rendered");
			$A.test.assertTruthy(ele.querySelector(".body"), "body is not rendered");

			// title
			if(cmp.get("v.title")) {
				$A.test.assertEquals(cmp.get("v.title"), ele.querySelector(".title").textContent, "title is not expected");
			}
			else {
				$A.test.assertFalsy(ele.querySelector(".title")?ele.querySelector(".title").textContent:ele.querySelector(".title"), "title is unexpectedly rendered");
			}

			// detail
			if(cmp.get("v.detail")) {
				$A.test.assertEquals(cmp.get("v.detail"), ele.querySelector(".detail").textContent, "detail is not expected");
			}
			else {
				$A.test.assertFalsy(ele.querySelector(".detail")?ele.querySelector(".detail").textContent:ele.querySelector(".detail"), "detail is unexpectedly rendered");
			}
		}
		else {
			$A.test.assertFalsy(ele.querySelector(".titleBar"), "titleBar is unexpectedly rendered");
		}

		// buttons
		if(cmp.get("v.body").length) {
			$A.test.assertTruthy(ele.querySelector(".button_row"), "buttons is not rendered");
		}
		else {
			$A.test.assertFalsy(ele.querySelector(".button_row"), "buttons is unexpectedly rendered");
		}


		// additional class
		if(cmp.get("v.class")) {
			$A.test.assertTrue($A.util.hasClass(ele, cmp.get("v.class")), "Additional class not added as expected");
    	}
    	else {
    		$A.test.assertTrue($A.util.hasClass(ele, "forceUIPanel"), "Additional class added unexpectedly");
    	}
	},

	getInnerComponent: function() {
        return $A.componentService.newComponent({
                componentDef: "markup://ui:inputTextArea",
                attributes: {
                    values: {
                        value: "this is value",
                        label: "input box",
                        actionable: true,
                        rows: 100
                    }
                }
            });
    },

    getMockButton: function(label) {
    	return $A.services.component.newComponent({
            componentDef: "markup://ui:actionButton",
            attributes: {
                values: {
                	action: {"label": label}
                }
            }
        });
    },

	/*
	* Modal is rendered
	*/
	testModalAllAttributes:{

		attributes: {
			isVisible: true, 
			'class': "testClass",
			title: "test title",
			detail: "test detail",
			isScrollable: true
		},
	    test : function(cmp){

	    	var context = this;
	    	$A.test.runAfterIf(
	    		function() { return (!cmp.get("v.body").length || cmp.find("panel").getElement().querySelector(".uiButton"));},
	    		function() {
	    			// Assert
	    			context.verifyModalElements(cmp);
	    		}
	    	);
	    }
	},
	
	testNonModalAllAttributes:{

		attributes: {
			isVisible: true, 
			'class': "testClass",
			title: "test title",
			detail: "test detail",
			isScrollable: true,
			isModal: false
		},
	    test : function(cmp){

	    	var context = this;
	    	$A.test.runAfterIf(
	    		function() { return (!cmp.get("v.body").length || cmp.find("panel").getElement().querySelector(".uiButton"));},
	    		function() {
	    			// Assert
	    			context.verifyModalElements(cmp);
	    		}
	    	);
	    }
	},

	testModalTitleOnly:{

		attributes: {
			isVisible:true, 
			'class': "testClass",
			title: "test title",
		},
	    test : function(cmp){

	    	var context = this;
	    	$A.test.runAfterIf(
	    		function() { return (!cmp.get("v.body").length || cmp.find("panel").getElement().querySelector(".uiButton"));},
	    		function() {
	    			// Assert
	    			context.verifyModalElements(cmp);
	    		}
	    	);
	    }
	},

	testModalDetailOnly:{

		attributes: {
			isVisible:true, 
			'class': "testClass",
			detail: "test detail"
		},
	    test : function(cmp){

	    	var context = this;
	    	$A.test.runAfterIf(
	    		function() { return (!cmp.get("v.body").length || cmp.find("panel").getElement().querySelector(".uiButton"));},
	    		function() {
	    			// Assert
	    			context.verifyModalElements(cmp);
	    		}
	    	);
	    }
	},

	testModalTitleAndDetailOnly:{

		attributes: {
			isVisible:true, 
			'class': "testClass",
			title: "test title",
			detail: "test detail"
		},
	    test : function(cmp){

	    	var context = this;
	    	$A.test.runAfterIf(
	    		function() { return (!cmp.get("v.body").length || cmp.find("panel").getElement().querySelector(".uiButton"));},
	    		function() {
	    			// Assert
	    			context.verifyModalElements(cmp);
	    		}
	    	);
	    }
	},

	testModalNoScroller:{

		attributes: {
			isVisible:true, 
			title:"test title",
			'class': "testClass",
			isScrollable: false
		},
	    test : function(cmp){

	    	var context = this;
	    	$A.test.runAfterIf(
	    		function() { return (!cmp.get("v.body").length || cmp.find("panel").getElement().querySelector(".uiButton"));},
	    		function() {
	    			// Assert
	    			context.verifyModalElements(cmp);
	    		}
	    	);
	    }
	},

	testModalSpecialCharecter:{

		attributes: {
			isVisible: true, 
			'class': "testClass",
			title: "test title!$#%^!^%$^&@FAGFDGWAERGY$#^%&@%#^%$&amp;",
			detail: "test detail!$#%^!^%$^&@FAGFDGWAERGY$#^%&@%#^%$&amp;",
			isScrollable: true
		},
	    test : function(cmp){

	    	var context = this;
	    	$A.test.runAfterIf(
	    		function() { return (!cmp.get("v.body").length || cmp.find("panel").getElement().querySelector(".uiButton"));},
	    		function() {
	    			// Assert
	    			context.verifyModalElements(cmp);
	    		}
	    	);
	    }
	}

})
