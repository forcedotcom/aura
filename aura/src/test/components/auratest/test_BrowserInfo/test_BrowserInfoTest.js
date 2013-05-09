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
	assertBrowserProperties : function(component, expectedMap) {
		var text = $A.test.getText(component.getSuper().get("v.body")[0].getElement());
		for (var propertyName in expectedMap){
			var expr = '$Browser.' + propertyName;
			var expectedValue = expectedMap[propertyName];
			
			// check server rendered content
			if(text.indexOf("[" + propertyName + "=" + expectedValue + "]") < 0) {
				$A.test.fail("Unexpected value for '" + propertyName + "'; expected '" + expectedValue + "' but got " + text);
			}
			
			// check provider property 
			$A.test.assertEquals(expectedValue,
					$A.get("$Browser")[propertyName], propertyName + ' had unexpected on $Browser');
			
			// check expression evaluation from root provider
			$A.test.assertEquals(expectedValue, $A.get(expr), propertyName + ' had unexpected value from $A.get()');
			
			// check expression evaluation from component provider
			$A.test.assertEquals(expectedValue, component.get('{!' + expr + '}'),
				propertyName + ' had unexpected value from component expression evaluation');
		}
	},
	
	testInvalidProperties : {
            test : function(component) {
            	$A.test.assertEquals(undefined, $A.get("$Browser.isUnknown"), "Unexpected property 'isUnknown' found on $Browser");
            	$A.test.assertEquals(undefined, $A.get("$Browser.isAndroid.really"), "Unexpected subproperty 'isAndroid.really' found on $Browser");
            	$A.test.assertEquals(undefined, $A.get("$Browser.0"), "Unexpected property '0' found on $Browser");
            }
	},
	
    testBrowserInfoChrome : {
    	browsers:["GOOGLECHROME"],
    	testLabels : ["UnAdaptableTest"],
        test : function(component) {
        	this.assertBrowserProperties(component, {
    			formFactor : "DESKTOP",
    			isTablet : false,
    			isPhone : false,
    			isAndroid : false,
    			isIPad : false,
    			isIPhone : false,
    			isIOS : false
    		});
        }
    },
    
    testBrowserInfoFireFox : {
    	testLabels : ["UnAdaptableTest"],
    	browsers:["FIREFOX"],
        test : function(component) {
        	this.assertBrowserProperties(component, {
    			formFactor : "DESKTOP",
    			isTablet : false,
    			isPhone : false,
    			isAndroid : false,
    			isIPad : false,
    			isIPhone : false,
    			isIOS : false
    		});
        }
    },
    
    testBrowserInfoSafari : {
    	testLabels : ["UnAdaptableTest"],
    	browsers:["SAFARI"],
        test : function(component) {
        	this.assertBrowserProperties(component, {
    			formFactor : "DESKTOP",
    			isTablet : false,
    			isPhone : false,
    			isAndroid : false,
    			isIPad : false,
    			isIPhone : false,
    			isIOS : false
    		});
        }
    },
    
    testBrowserInfoIPad : {
    	testLabels : ["UnAdaptableTest"],
    	browsers:["IPAD"],
        test : function(component) {
        	this.assertBrowserProperties(component, {
    			formFactor : "TABLET",
    			isTablet : true,
    			isPhone : false,
    			isAndroid : false,
    			isIPad : true,
    			isIPhone : false,
    			isIOS : true
    		});
        }
    },
    
    testBrowserInfoIPhone : {
    	browsers:["IPHONE"],
        test : function(component) {
        	this.assertBrowserProperties(component, {
    			formFactor : "PHONE",
    			isTablet : false,
    			isPhone : true,
    			isAndroid : false,
    			isIPad : false,
    			isIPhone : true,
    			isIOS : true
    		});
        }
    },
    
    testBrowserInfoAndroidPhone : {
    	testLabels : ["UnAdaptableTest"],
    	browsers:["ANDROID_PHONE"],
        test : function(component) {
        	this.assertBrowserProperties(component, {
    			formFactor : "PHONE",
    			isTablet : false,
    			isPhone : true,
    			isAndroid : true,
    			isIPad : false,
    			isIPhone : false,
    			isIOS : false
    		});
        }
    },
    
    testBrowserInfoAndroidTablet : {
    	testLabels : ["UnAdaptableTest"],
    	browsers:["ANDROID_TABLET"],
        test : function(component) {
        	this.assertBrowserProperties(component, {
    			formFactor : "TABLET",
    			isTablet : true,
    			isPhone : false,
    			isAndroid : true,
    			isIPad : false,
    			isIPhone : false,
    			isIOS : false
    		});
        }
    }
})