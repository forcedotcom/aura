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
	
    testNullValue:{
        test:function(cmp){
            var testCmp = cmp.find('myComp1');
            $A.test.assertNotNull(testCmp);
            $A.test.assertEquals('', $A.test.getText(testCmp.find('div').getElement()), "Failed to handle null from Java model");
        }
    },
	
    testEmptyStringValue:{
        test:function(cmp){
            var testCmp = cmp.find('myComp2');
            $A.test.assertNotNull(testCmp);
            $A.test.assertEquals('', $A.test.getText(testCmp.find('div').getElement()), "Failed to handle empty string from Java model");
        }
    },	
	
    testStringValue:{
        test:function(cmp){
            var testCmp = cmp.find('myComp3');
            $A.test.assertNotNull(testCmp);
            $A.test.assertEquals('Model', $A.test.getText(testCmp.find('div').getElement()), "Failed to display String from Java model");
        }
    },
        
    testStringValueWithScriptTag:{
        test:function(cmp){
            var testCmp = cmp.find('myComp4');
            $A.test.assertNotNull(testCmp);
            $A.test.assertEquals('Some text from server with script tag', $A.test.getText(testCmp.find('div').getElement()), "Failed to display richtext from Java model");
            $A.test.assertEquals(1, testCmp.find('div').getElement().getElementsByTagName("big").length, "Big tag should be there");
            $A.test.assertEquals(0, testCmp.find('div').getElement().getElementsByTagName("script").length, "script tag should not be there");
        }
    },
        
    testStringValueWithStyleTag:{
        test:function(cmp){
            var testCmp = cmp.find('myComp5');
            $A.test.assertNotNull(testCmp);
            $A.test.assertEquals('Some text from server with style tag', $A.test.getText(testCmp.find('div').getElement()), "Failed to display richtext from Java model");
            $A.test.assertEquals(1, testCmp.find('div').getElement().getElementsByTagName("big").length, "Big tag should be there");
            $A.test.assertEquals(0, testCmp.find('div').getElement().getElementsByTagName("style").length, "style tag should not be there");
        }
    },
	
    testStringValueWithBlacklistedTags:{
        test:function(cmp){
            var testCmp = cmp.find('myComp6');
            $A.test.assertNotNull(testCmp);
            var actual = $A.test.getText(testCmp.find('div').getElement());
            $A.test.assertEquals('Some text from server with blacklisted tags', $A.util.trim(actual), "Failed to display richtext from Java model");
            $A.test.assertEquals(0, testCmp.find('div').getElement().getElementsByTagName("script").length, "script tag should not be there");
            $A.test.assertEquals(0, testCmp.find('div').getElement().getElementsByTagName("style").length, "style tag should not be there");
        }
    },
	
    testStringValueWithNestedBlacklistedTags:{
        test:function(cmp){
            var testCmp = cmp.find('myComp7');
            $A.test.assertNotNull(testCmp);
            $A.test.assertEquals('Some text from server with nested blacklisted tags', $A.test.getText(testCmp.find('div').getElement()), "Failed to display richtext from Java model");
            $A.test.assertEquals(0, testCmp.find('div').getElement().getElementsByTagName("script").length, "script tag should not be there");
            $A.test.assertEquals(0, testCmp.find('div').getElement().getElementsByTagName("style").length, "style tag should not be there");
        }
    },        
        
    testStringValueWithWhitelistedChildrenTags:{
        test:function(cmp){
            var testCmp = cmp.find('myComp8');
            $A.test.assertNotNull(testCmp);
            $A.test.assertEquals('Some text from server with nested input in balcklisted tags', $A.test.getText(testCmp.find('div').getElement()), "Failed to display richtext from Java model");                
            $A.test.assertEquals(0, testCmp.find('div').getElement().getElementsByTagName("script").length, "script tag should not be there");
            $A.test.assertEquals(0, testCmp.find('div').getElement().getElementsByTagName("input").length, "Input tag should not be there");
        }
    },

    testStringValueWithBlacklistedChildrenTags:{
        test:function(cmp){
            var testCmp = cmp.find('myComp9');
            $A.test.assertNotNull(testCmp);
            var actual = $A.test.getText(testCmp.find('div').getElement());
            $A.test.assertEquals('Some text from server with nested blacklisted tags in div', $A.util.trim(actual), "Failed to display richtext from Java model");
            $A.test.assertEquals(1, testCmp.find('div').getElement().getElementsByTagName("div").length, "Only the outer Div should be present");
            $A.test.assertEquals(0, testCmp.find('div').getElement().getElementsByTagName("script").length, "script tag should not be there");
            $A.test.assertEquals(0, testCmp.find('div').getElement().getElementsByTagName("style").length, "style tag should not be there");
        }
    }
})
