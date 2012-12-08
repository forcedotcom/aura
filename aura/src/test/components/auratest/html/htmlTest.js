/*
 * Copyright (C) 2012 salesforce.com, inc.
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
            aura.test.assertEquals("salesforce", tag.textContent, "textContent not expected");
            aura.test.assertTrue(aura.test.contains(tag.href, "http://www.salesforce.com/"), "href not expected");
        }
    },

    /**
     * Anchors with href with only hash are rendered with modified href.
     */
    testAnchorFragment: {
        test: function(component){
            var tag = component.find("hash").getElement();
            aura.test.assertEquals("hash", tag.textContent, "textContent not expected");
            aura.test.assertEquals("javascript:void(0/*#*/);", tag.href, "href not expected");
        }
    },

    /**
     * Anchors with href with fragment are rendered with modified href.
     */
    testAnchorFragmentString: {
        test: function(component){
            var tag = component.find("hashString").getElement();
            aura.test.assertEquals("layout", tag.textContent, "textContent not expected");
            aura.test.assertEquals("javascript:void(0/*#layout*/);", tag.href, "href not expected");
        }
    },

    /**
     * Area with href should not render modified href with or without hash
     */
    testAreaNoFragment:{
        test: function(component){
            var tag = component.find("noHashArea").getElement();
            aura.test.assertEquals("http://www.salesforce.com/", tag.href, "Area href not expected");
        }
    },

    testAreaFragment:{
        test: function(component){
            var tag = component.find("hashStringArea").getElement();
            var expectedHrefValue = "#layout"
            aura.test.assertTrue(tag.href.substr(tag.href.length-expectedHrefValue.length) === expectedHrefValue);
        }
    },

    testAreaFragmentString:{
        test: function(component){
            var tag = component.find("hashArea").getElement();
            var expectedHrefValue = "#";
            aura.test.assertTrue(tag.href.substr(tag.href.length-expectedHrefValue.length) === expectedHrefValue);
        }
    },

    /**
     * Break tags are output as single self-contained tags.
     */
    testBreak: {
        test: function(component){
            var elems = component.find("hasBr").getElement().getElementsByTagName("br");
            aura.test.assertEquals(1, elems.length, "should only be 1 br tag");
            aura.test.assertEquals(0, elems[0].children.length, "br should not have any children");
        }
    },

    /**
     * Attributes on HTML tags are case-insensitive.
     */
    testAttributeCasing: {
        test: function(component){
            var tag = component.find("case").getElement();
            aura.test.assertTrue(typeof tag.ReadOnly === "undefined" && tag.readOnly === true, "readOnly was not cased properly");
            aura.test.assertTrue(typeof tag.maxlength === "undefined" && tag.maxLength == 11, "maxLength was not cased properly");
            aura.test.assertTrue(typeof tag.AccessKey === "undefined" && tag.accessKey === "x", "accessKey was not cased properly");
            aura.test.assertTrue(typeof tag.TABINDEX === "undefined" && tag.tabIndex === 1, "tabIndex was not cased properly");
            aura.test.assertTrue(typeof tag.ColSpaN === "undefined" && tag.colSpan === "2", "colSpan was not cased properly");
            aura.test.assertTrue(typeof tag.rOWsPAN === "undefined" && tag.rowSpan === "2", "rowSpan was not cased properly");
            aura.test.assertTrue(typeof tag.BGColor === "undefined" && tag.bgColor === "#FFFFFF", "bgColor was not cased properly");
            aura.test.assertTrue(typeof tag.USEmap === "undefined" && tag.useMap === "true", "useMap was not cased properly");
            aura.test.assertTrue(typeof tag.Class === "undefined" && tag.className === "low", "className was not converted properly");
            aura.test.assertTrue(typeof tag.FOR === "undefined" && tag.htmlFor === "ground", "htmlFor was not converted properly");
            aura.test.assertTrue(typeof tag.PLACEHOLDER === "undefined" && tag.placeholder === "Casper", "placeholder was not cased properly");
            aura.test.assertTrue(typeof tag.ValuE === "undefined" && tag.value === "infamous ghost", "value was not cased properly");
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
    }
})
