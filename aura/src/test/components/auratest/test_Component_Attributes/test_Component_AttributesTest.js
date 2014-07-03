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
    testVerifyWaysToAccessAttributes: {
        test: function(component){
            /**
             * There is 1 way to access Attribute values on a Component.
             * This test verifies that way gets the expected result.
             */
            var stringValueThroughComponentApi = component.get('{!v.label}');
            $A.test.assertNotNull(stringValueThroughComponentApi,"Cound not retrieve attribute using Component.get()");
            $A.test.assertEquals("AttributeDefault",stringValueThroughComponentApi, 'Attribute values differ from expected');
            
            //Without the curly bang
            stringValueThroughComponentApi = component.get('v.label');
            $A.test.assertNotNull(stringValueThroughComponentApi);
            $A.test.assertEquals("AttributeDefault",stringValueThroughComponentApi);
        }

    },
    testVerifyWaysToModifyAttributes: {
        test: function(component){
            /**
             * There is 1 way to set values on a Component's Attribute.
             */
            component.set('{!v.label}' , 'newLabel');
            var labelValueThroughComponentApi = component.get("v.label");
            //Verify that we see the same value
            $A.test.assertEquals('newLabel', labelValueThroughComponentApi);

            //Without curly bang
            component.set('v.label','newerLabel');
            labelValueThroughComponentApi = component.get("v.label");
            //Verify that all of them see the same value
            $A.test.assertEquals('newerLabel', labelValueThroughComponentApi);
        }

    },
    /**
     * Verify behavior of setting the value of an attribute that does not exist.
     *
     * Currently setting a non-existent attribute is a no-op, but after W-795118 is fixed, we should throw an Error.
     */
    testVerifySetValueNonExistentAttributes:{
        test: function(component){
        	var newValue = component.get('v.nonExistingAttribute');
            $A.test.assertUndefined(newValue, 'A defined Value object was created');
            
            /*BUG W-2248588
            // try {
                component.set('v.nonExistingAttribute', 'blahhh');
                // $A.test.fail("Setting a non-existent attribute should throw error.");
            // } catch (e) {
                // $A.test.assertTrue(e.message.indexOf("Assertion Failed!: Unknown attribute") != -1,
                //        "Setting non-existent attribute did not throw expected Error.");
                $A.test.assertFalse(component.get('v.nonExistingAttribute') !== undefined);
            // }
            */
        }
    }
})
