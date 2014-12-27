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
     * Verify that outputText can accept Object from java model and handle it.
     */
    testObjectValueFromJavaModel:{
        test:function(cmp){
            var testCmp = cmp.find('myComp1');
            aura.test.assertNotNull(testCmp);
            aura.test.assertEquals('', $A.test.getText(testCmp.find('span').getElement()), "Failed to handle Object from Java model");
        }
    },

	/**
     * Verify that outputText can accept Boolean from java model and handle it.
     */
    testBooleanValueFromJavaModel:{
        test:function(cmp){
            var testCmp = cmp.find('myComp2');
            aura.test.assertNotNull(testCmp);
            aura.test.assertEquals('', $A.test.getText(testCmp.find('span').getElement()), "Failed to handle Text from Java model");
        }
    },	

	/**
     * Verify that outputText can accept String from java model and display it.
     */
    testStringValueFromJavaModel:{
        test:function(cmp){
            var testCmp = cmp.find('myComp3');
            aura.test.assertNotNull(testCmp);
            aura.test.assertEquals('Model', $A.test.getText(testCmp.find('span').getElement()), "Failed to display String from Java model");
        }
    },

    /**
     * Verify that outputText can accept Long from java model and display it.
     */
    testLongValueFromJavaModel:{
        test:function(cmp){
            var testCmp = cmp.find('myComp4');
            aura.test.assertNotNull(testCmp);
            aura.test.assertEquals('123456789123456780', $A.test.getText(testCmp.find('span').getElement()), "Failed to display Long from Java model");
        }
    }
})
