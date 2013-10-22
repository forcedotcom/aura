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
     * Anchors with href without fragment are rendered as is.
     */
    testAnchorNoFragment: {
        test: function(component){
            var tag = component.find("nohash").getElement();
            $A.test.assertEquals("salesforce", $A.test.getText(tag), "textContent not expected");
            $A.test.assertTrue($A.test.contains(tag.href, "http://www.salesforce.com/"), "href not expected");
        }
    },

    /**
     * Anchors with href with only hash are rendered with modified href.
     */
    testAnchorFragment: {
        test: function(component){
            var tag = component.find("hash").getElement();
            $A.test.assertEquals("hash", $A.test.getText(tag), "textContent not expected");
            $A.test.assertEquals("javascript:void(0/*#*/);", tag.href, "href not expected");
        }
    },

    /**
     * Anchors with href with fragment are rendered with modified href.
     */
    testAnchorFragmentString: {
        test: function(component){
            var tag = component.find("hashString").getElement();
            $A.test.assertEquals("layout", $A.test.getText(tag), "textContent not expected");
            $A.test.assertEquals("javascript:void(0/*#layout*/);", tag.href, "href not expected");
        }
    },

    /**
     * Area with href should not render modified href with or without hash
     */
    testAreaNoFragment:{
        test: function(component){
            var tag = component.find("noHashArea").getElement();
            $A.test.assertEquals("http://www.salesforce.com/", tag.href, "Area href not expected");
        }
    },

    testAreaFragment:{
        test: function(component){
            var tag = component.find("hashStringArea").getElement();
            var expectedHrefValue = "#layout"
            $A.test.assertTrue(tag.href.substr(tag.href.length-expectedHrefValue.length) === expectedHrefValue);
        }
    },

    testAreaFragmentString:{
        test: function(component){
            var tag = component.find("hashArea").getElement();
            var expectedHrefValue = "#";
            $A.test.assertTrue(tag.href.substr(tag.href.length-expectedHrefValue.length) === expectedHrefValue);
        }
    },

    /**
     * Break tags are output as single self-contained tags.
     */
    testBreak: {
        test: function(component){
            var elems = component.find("hasBr").getElement().getElementsByTagName("br");
            $A.test.assertEquals(1, elems.length, "should only be 1 br tag");
            $A.test.assertEquals(0, elems[0].children.length, "br should not have any children");
        }
    },

    /**
     * Attributes on HTML tags are case-insensitive.
     */
    testAttributeCasing: {
        test: function(component){
            var tag = component.find("case").getElement();
            $A.test.assertTrue(typeof tag.ReadOnly === "undefined" && tag.readOnly === true, "readOnly was not cased properly");
            $A.test.assertTrue(typeof tag.maxlength === "undefined" && tag.maxLength == 11, "maxLength was not cased properly");
            $A.test.assertTrue(typeof tag.AccessKey === "undefined" && tag.accessKey === "x", "accessKey was not cased properly");
            $A.test.assertTrue(typeof tag.TABINDEX === "undefined" && tag.tabIndex === 1, "tabIndex was not cased properly");
            $A.test.assertTrue(typeof tag.ColSpaN === "undefined" && tag.colSpan === "2", "colSpan was not cased properly");
            $A.test.assertTrue(typeof tag.rOWsPAN === "undefined" && tag.rowSpan === "2", "rowSpan was not cased properly");
            $A.test.assertTrue(typeof tag.BGColor === "undefined" && tag.bgColor === "#FFFFFF", "bgColor was not cased properly");
            $A.test.assertTrue(typeof tag.USEmap === "undefined" && tag.useMap === "true", "useMap was not cased properly");
            $A.test.assertTrue(typeof tag.Class === "undefined" && tag.className === "low", "className was not converted properly");
            $A.test.assertTrue(typeof tag.FOR === "undefined" && tag.htmlFor === "ground", "htmlFor was not converted properly");
            $A.test.assertTrue(typeof tag.PLACEHOLDER === "undefined" && tag.placeholder === "Casper", "placeholder was not cased properly");
            $A.test.assertTrue(typeof tag.ValuE === "undefined" && tag.value === "infamous ghost", "value was not cased properly");
        }
    },

    assertClassUpdate : function(component, newValue) {
		component.getValue("v.classValue").setValue(newValue);
		$A.rerender(component);
		$A.test.assertEquals(newValue ? newValue : "", component.find("hasClass").getElement().className);
    },
    
    /**
     * class attribute will be rerendered when initially not set
     */
    testRerenderAddedClassAttribute: {
    	test: function(component) {
    		$A.test.assertEquals("", component.find("hasClass").getElement().className, "initial class not set");
    		this.assertClassUpdate(component, "inner");
    	}
    },

    /**
     * class attribute can be removed and restored in rerender
     */
    testRerenderUpdatedClassAttribute: {
    	attributes: { classValue : "upper" },
    	test: function(component) {
    		$A.test.assertEquals("upper", component.find("hasClass").getElement().className, "initial class not set");
	    	this.assertClassUpdate(component, "");
	    	this.assertClassUpdate(component, "middle");
	    	this.assertClassUpdate(component, null);
	    	this.assertClassUpdate(component, "lower");
	    	this.assertClassUpdate(component);
    	}
    },

    /**
     * Verify rerender of special html attributes
     * type, href, style and data attributes must be set by using setAttribute() on dom elements
     * 
     * Ie7 does not support the inline style attribute.
     */
    testRerenderSpecialHtmlAttributes:{
	browsers: ["-IE7"],
		test:function(component){
		    var input = component.find("specialAttributes_input").getElement();
		    $A.test.assertEquals("textElement" , input.getAttribute("data-name"), "Failed to render data attribute");
		    $A.test.assertEquals("color:blue" , input.getAttribute("style").replace(/[ ;]/g,"").toLowerCase(), "Failed to render style attribute");
		    
		    var a = component.find("specialAttributes_a").getElement();
		    $A.test.assertEquals("http://bazinga.com/" , a.getAttribute("href"), "Failed to render href attribute");
		    
		    component.getAttributes().setValue("style", "color:green");
		    component.getAttributes().setValue("dataName", "inputElement");
		    component.getAttributes().setValue("href", "http://bbt.com/");
		    
		    $A.rerender(component);
		    input = component.find("specialAttributes_input").getElement();
		    $A.test.assertEquals("inputElement" , input.getAttribute("data-name"), "Failed to rerender data attribute");
		    $A.test.assertEquals("color:green" , input.getAttribute("style").replace(/[ ;]/g,"").toLowerCase(), "Failed to rerender style attribute");
		    
		    a = component.find("specialAttributes_a").getElement();
		    $A.test.assertEquals("http://bbt.com/" , a.getAttribute("href"), "Failed to rerender href attribute");
		}
    },

    /**
     * Change type of input element (non-IE)
     */
    testChangeTypeOfInputElement:{
    	browsers: ["-IE7","-IE8","-IE9"],
		test:function(component){
		    var input = component.find("specialAttributes_input").getElement();
		    $A.test.assertEquals("text" , input.getAttribute("type"), "Failed to render type attribute");
		    component.getAttributes().setValue("type", "input");
		    $A.rerender(component);
		    input = component.find("specialAttributes_input").getElement();
		    $A.test.assertEquals("input" , input.getAttribute("type"), "Failed to rerender type attribute");
		}
    },

    /**
     * Verify that touchend event handlers is used if present before using onclick.
     * Automation for W-1564377
     */
    testTouchEndHandlerUsedWhenPresent:{
	browsers:["IPAD"],
	testLabels : ["UnAdaptableTest"],
	test: [
	  //Both click handler and touch end handler defined     
	  function(component){
	    component._TouchEndHandler = false;
	    component._OnClickHandler = false;
	    var targetElement = component.find("bothTouchEndAndClickHandlers").getElement();
	    this.fireTouchEndEventOnElement(component, targetElement);
	    $A.test.addWaitFor(true, 
		    function(){return component._TouchEndHandler},
		    function(){ $A.test.assertFalse(component._OnClickHandler); });
	},
	  //Both touch end handler defined     
	  function(component){
	    var targetElement = component.find("onlyTouchEndHandler").getElement();
	    this.fireTouchEndEventOnElement(component, targetElement);
	    $A.test.addWaitFor(true, function(){return component._TouchEndHandler;},
		    function(){$A.test.assertFalse(component._OnClickHandler);})
	},
	 //Only click handler defined
//	 function(component){
//	    var targetElement = component.find("onlyClickHandler").getElement();
//	    this.fireTouchEndEventOnElement(component, targetElement);
//	    $A.test.addWaitFor(true, function(){return component._OnClickHandler;},
//		    function(){$A.test.assertFalse(component._TouchEndHandler);})
//	}
	]
    },
    fireTouchEndEventOnElement:function(component, targetElement){
	component._OnClickHandler = false;
	component._TouchEndHandler = false;
	var touchEndEvt =  document.createEvent("TouchEvent");
	touchEndEvt.initTouchEvent("touchend", true, true);
	targetElement.dispatchEvent(touchEndEvt);
    }
})
