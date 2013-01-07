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
    testBrowserInfoChrome : {
    	browsers:["GOOGLECHROME"],
    	testLabels : ["UnAdaptableTest"],
        test : function(component) {
        	var formFactor = component.getValue('{!$Browser.formFactor}').getValue();
        	$A.test.assertEquals("DESKTOP", formFactor, "formFactor had unexpected value");

        	var isTablet = component.getValue('{!$Browser.isTablet}').getValue();
        	$A.test.assertEquals(false, isTablet, "isTablet had unexpected value");
        	
        	var isPhone = component.getValue('{!$Browser.isPhone}').getValue();
        	$A.test.assertEquals(false, isPhone, "isPhone had unexpected value");
        	
        	var isAndroid = component.getValue('{!$Browser.isAndroid}').getValue();
        	$A.test.assertEquals(false, isAndroid, "isAndroid had unexpected value");
        	
        	var isIPad = component.getValue('{!$Browser.isIPad}').getValue();
        	$A.test.assertEquals(false, isIPad, "isIPad had unexpected value");
        	
        	var isIPhone = component.getValue('{!$Browser.isIPhone}').getValue();
        	$A.test.assertEquals(false, isIPhone, "isIPhone had unexpected value");
        	
        	var isIOS = component.getValue('{!$Browser.isIOS}').getValue();
        	$A.test.assertEquals(false, isIOS, "isIOS had unexpected value");
            }
    },
    
    testBrowserInfoFireFox : {
    	testLabels : ["UnAdaptableTest"],
    	browsers:["FIREFOX"],
        test : function(component) {
        	var formFactor = component.getValue('{!$Browser.formFactor}').getValue();
        	$A.test.assertEquals("DESKTOP", formFactor, "formFactor had unexpected value");

        	var isTablet = component.getValue('{!$Browser.isTablet}').getValue();
        	$A.test.assertEquals(false, isTablet, "isTablet had unexpected value");
        	
        	var isPhone = component.getValue('{!$Browser.isPhone}').getValue();
        	$A.test.assertEquals(false, isPhone, "isPhone had unexpected value");
        	
        	var isAndroid = component.getValue('{!$Browser.isAndroid}').getValue();
        	$A.test.assertEquals(false, isAndroid, "isAndroid had unexpected value");
        	
        	var isIPad = component.getValue('{!$Browser.isIPad}').getValue();
        	$A.test.assertEquals(false, isIPad, "isIPad had unexpected value");
        	
        	var isIPhone = component.getValue('{!$Browser.isIPhone}').getValue();
        	$A.test.assertEquals(false, isIPhone, "isIPhone had unexpected value");
        	
        	var isIOS = component.getValue('{!$Browser.isIOS}').getValue();
        	$A.test.assertEquals(false, isIOS, "isIOS had unexpected value");
            }
    },
    
    testBrowserInfoSafari : {
    	testLabels : ["UnAdaptableTest"],
    	browsers:["SAFARI"],
        test : function(component) {
        	var formFactor = component.getValue('{!$Browser.formFactor}').getValue();
        	$A.test.assertEquals("DESKTOP", formFactor, "formFactor had unexpected value");

        	var isTablet = component.getValue('{!$Browser.isTablet}').getValue();
        	$A.test.assertEquals(false, isTablet, "isTablet had unexpected value");
        	
        	var isPhone = component.getValue('{!$Browser.isPhone}').getValue();
        	$A.test.assertEquals(false, isPhone, "isPhone had unexpected value");
        	
        	var isAndroid = component.getValue('{!$Browser.isAndroid}').getValue();
        	$A.test.assertEquals(false, isAndroid, "isAndroid had unexpected value");
        	
        	var isIPad = component.getValue('{!$Browser.isIPad}').getValue();
        	$A.test.assertEquals(false, isIPad, "isIPad had unexpected value");
        	
        	var isIPhone = component.getValue('{!$Browser.isIPhone}').getValue();
        	$A.test.assertEquals(false, isIPhone, "isIPhone had unexpected value");
        	
        	var isIOS = component.getValue('{!$Browser.isIOS}').getValue();
        	$A.test.assertEquals(false, isIOS, "isIOS had unexpected value");
            }
    },
    
    testBrowserInfoIPad : {
    	testLabels : ["UnAdaptableTest"],
    	browsers:["IPAD"],
        test : function(component) {
        	var formFactor = component.getValue('{!$Browser.formFactor}').getValue();
        	$A.test.assertEquals("TABLET", formFactor, "formFactor had unexpected value");

        	var isTablet = component.getValue('{!$Browser.isTablet}').getValue();
        	$A.test.assertEquals(true, isTablet, "isTablet had unexpected value");
        	
        	var isPhone = component.getValue('{!$Browser.isPhone}').getValue();
        	$A.test.assertEquals(false, isPhone, "isPhone had unexpected value");
        	
        	var isAndroid = component.getValue('{!$Browser.isAndroid}').getValue();
        	$A.test.assertEquals(false, isAndroid, "isAndroid had unexpected value");
        	
        	var isIPad = component.getValue('{!$Browser.isIPad}').getValue();
        	$A.test.assertEquals(true, isIPad, "isIPad had unexpected value");
        	
        	var isIPhone = component.getValue('{!$Browser.isIPhone}').getValue();
        	$A.test.assertEquals(false, isIPhone, "isIPhone had unexpected value");
        	
        	var isIOS = component.getValue('{!$Browser.isIOS}').getValue();
        	$A.test.assertEquals(true, isIOS, "isIOS had unexpected value");
            }
    },
    
    testBrowserInfoIPhone : {
    	testLabels : ["UnAdaptableTest"],
    	browsers:["IPHONE"],
        test : function(component) {
        	var formFactor = component.getValue('{!$Browser.formFactor}').getValue();
        	$A.test.assertEquals("PHONE", formFactor, "formFactor had unexpected value");

        	var isTablet = component.getValue('{!$Browser.isTablet}').getValue();
        	$A.test.assertEquals(false, isTablet, "isTablet had unexpected value");
        	
        	var isPhone = component.getValue('{!$Browser.isPhone}').getValue();
        	$A.test.assertEquals(true, isPhone, "isPhone had unexpected value");
        	
        	var isAndroid = component.getValue('{!$Browser.isAndroid}').getValue();
        	$A.test.assertEquals(false, isAndroid, "isAndroid had unexpected value");
        	
        	var isIPad = component.getValue('{!$Browser.isIPad}').getValue();
        	$A.test.assertEquals(false, isIPad, "isIPad had unexpected value");
        	
        	var isIPhone = component.getValue('{!$Browser.isIPhone}').getValue();
        	$A.test.assertEquals(true, isIPhone, "isIPhone had unexpected value");
        	
        	var isIOS = component.getValue('{!$Browser.isIOS}').getValue();
        	$A.test.assertEquals(true, isIOS, "isIOS had unexpected value");
            }
    },
    
    



})