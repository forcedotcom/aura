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
     * Verify setting value attribute to '' blank.
     */
    testEmptyValue:{
        attributes : {value: ''},
        test: function(component){
            $A.test.assertEquals('', $A.test.getText(component.find("span").getElement()), "When value is initialized to an empty string, nothing should be shown.");
        }
    },

    /**
     * positive test case: Verify outputText can display text.
     */
    testValue: {
        attributes : {value : 'Hello World!'},
        test: function(component){        	
        	$A.test.assertEquals('Hello World!', $A.test.getText(component.find("span").getElement()), "Value attribute not correct");
        }
    },
    
    /**
     * W-2743289: Verify title is not present for span element by default
     */
    testTitleNotPresentByDefault: {
        attributes : {value : 'Hello World!'},
        test: function(component){        
        	$A.test.assertEquals('', $A.test.getElementAttributeValue(component.find("span").getElement(), "title"), "Title attribute on element should not be present");
        }
    },
    
    /**
     * W-2743289: Verify title present
     */
    testTitlePresent: {
        attributes : {value : 'Hello World!', title: 'TestTitle'},
        test: function(component){        	
        	$A.test.assertEquals('TestTitle', $A.test.getElementAttributeValue(component.find("span").getElement(), "title"), "Title attribute on element should  be present");
        }
    },

    /**
     * Verify displaying non string value.
     */
    testNonStringValue:{
        attributes: {value: 3.1415},
        test: function(component){
        	$A.test.assertEquals('3.1415', $A.test.getText(component.find("span").getElement()), "Failed to display string form of numeric value");
        }
    },
    /**
     * Verify displaying Empty spaces.
     */
    // W-1075402
    _testTrimmingSpaces:{
        attributes: {value: '   '},
        test: function(component){
        	$A.test.assertEquals('', $A.test.getText(component.find("span").getElement()), "Failed to trim spaces");
        }
    },
    /**
     * Verify prefix and suffix trimming of space.
     */
    // W-1075402
    _testTrimmingSpacesAtFrontAndEnd:{
        attributes: {value: '   foo '},
        test: function(component){
        	$A.test.assertEquals('foo', $A.test.getText(component.find("span").getElement()), "Failed to trim spaces");
        }
    },
    /**
     * Output text with linefeed.
     * IE7 IE8 Excluded: textContent doesn't work https://github.com/forcedotcom/lumen-beta/commit/25650a7343a41b5fd613c23ad0ec400098657f6f
     * and $A.test.getText() won't trim the space
     */
    testLineFeed:{
        browsers: ["-IE7", "-IE8"],
        attributes: {value: '\n'},
        test: function(component){
        	$A.test.assertEquals('', component.find("span").getElement().textContent, "Failed to convert \r\n\ and \n into <br>");
        }
    },
    /**
     * Output text with CarriageReturn.
     * IE7 IE8 Excluded: textContent doesn't work https://github.com/forcedotcom/lumen-beta/commit/25650a7343a41b5fd613c23ad0ec400098657f6f
     * and $A.test.\u200bgetText() won't trim the space
     */
    testCarriageReturn:{
        browsers: ["-IE7", "-IE8"],
        labels : ["UnAdaptableTest"],
        attributes: {value: '\r\n'},
        test: function(component){
        	var tags = component.find("span").getElement().innerHTML;
			tags = tags.replace(/<!---->/g, '');
			$A.test.assertEquals('<br>', tags, "Failed to convert \r\n\ and \n into <br>");
        }
    },
    /**
     * Output text with linefeeds.
     * IE7 IE8 Excluded: textContent doesn't work https://github.com/forcedotcom/lumen-beta/commit/25650a7343a41b5fd613c23ad0ec400098657f6f
     * and $A.test.getText() won't trim the space
     */
    testLineFeeds:{
        browsers: ["-IE7", "-IE8"],
        attributes: {value: '\n1\n2\n'},
        test: function(component){
        	$A.test.assertEquals('12', component.find("span").getElement().textContent, "Failed to convert \r\n\ and \n into <br>");
        }
    },
    /**
     * Output text with carriage returns & linefeeds.  Carriage returns are output as \n by browser.
     * IE7 IE8 Excluded: textContent doesn't work https://github.com/forcedotcom/lumen-beta/commit/25650a7343a41b5fd613c23ad0ec400098657f6f
     * and $A.test.getText() won't trim the space
     */
    testCarriageReturnLineFeeds:{
        browsers: ["-IE7", "-IE8"],
        labels : ["UnAdaptableTest"],
        attributes: {value: '\r\na\r\nb\r\n'},
        test: function(component){ 
        	var tags = component.find("span").getElement().innerHTML;
			tags = tags.replace(/<!---->/g, '');			
			$A.test.assertEquals('<br>a<br>b<br>', tags, "Failed to convert \r\n\ and \n into <br>");
        }
    }
})// eslint-disable-line semi
