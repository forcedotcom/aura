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
     * Verify that outputRichText can accept Object from java model and handle it.
     */
    testNullValueFromJavaModel:{
        test:function(cmp){
            var testCmp = cmp.find('myComp1');
            aura.test.assertNotNull(testCmp);
            aura.test.assertEquals('', $A.test.getText(testCmp.find('div').getElement()), "Failed to handle null from Java model");
        }
    },

	/**
     * Verify that outputRichText can accept Boolean from java model and handle it.
     */
    testEmptyStringValueFromJavaModel:{
        test:function(cmp){
            var testCmp = cmp.find('myComp2');
            aura.test.assertNotNull(testCmp);
            aura.test.assertEquals('', $A.test.getText(testCmp.find('div').getElement()), "Failed to handle empty string from Java model");
        }
    },	

	/**
     * Verify that outputRichText can accept String from java model and display it.
     */
    testStringValueFromJavaModel:{
        test:function(cmp){
            var testCmp = cmp.find('myComp3');
            aura.test.assertNotNull(testCmp);
            aura.test.assertEquals('Model', $A.test.getText(testCmp.find('div').getElement()), "Failed to display String from Java model");
        }
    },

	/**
     * Verify that outputRichText can accept String from java model and display it after escaping tags.
     */
    testStringValueWithTagsFromJavaModel:{
        test:function(cmp){
            var testCmp = cmp.find('myComp4');
            aura.test.assertNotNull(testCmp);
            aura.test.assertEquals('Some text from server with tags', $A.test.getText(testCmp.find('div').getElement()), "Failed to display richtext from Java model");
        }
    },

	/**
     * Verify that outputRichText can accept String from java model and display it after escaping tags.
     */
    testStringValueWithNestedTagsFromJavaModel:{
        test:function(cmp){
            var testCmp = cmp.find('myComp5');
            aura.test.assertNotNull(testCmp);
            aura.test.assertEquals('Some text from server with nested tags', $A.test.getText(testCmp.find('div').getElement()), "Failed to display richtext from Java model");
        }
    }
})
