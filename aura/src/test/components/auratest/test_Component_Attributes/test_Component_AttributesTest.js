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
             * There are 3 ways to access Attribute values on a Component.
             * This test verifies that all 3 ways get the same result.
             */
            var stringValueThroughComponentApi = component.getValue('{!v.label}');
            aura.test.assertNotNull(stringValueThroughComponentApi,"Cound not retrieve attribute using getAttributes().getValue()");

            var stringValueByExpression = $A.expressionService.getValue(component, "{!v.label}");
            aura.test.assertNotNull(stringValueByExpression,"Cound not retrieve attribute using expression service");

            var attribute = component.getValue('v.label');
            aura.test.assertNotNull(attribute,"Cound not retrieve component's attribute");
            //Attributes are value objects but the auraType is changed to Attribute. see
            aura.test.assertTrue(attribute.auraType ==='Value', 'aura type for attribute not set');
            var stringValueThruComponent = attribute.getValue();

            //Verify that all of them returned the same value
            aura.test.assertEquals(stringValueThruComponent,stringValueThroughComponentApi.getValue(),'Attribute values differ across various access types');
            aura.test.assertEquals(stringValueThruComponent,stringValueByExpression.getValue(),'Attribute values differ across various access types');
        }

    },
    testVerifyWaysToModifyAttributes: {
        test: function(component){
            /**
             * There are 3 ways to set values on a Component's Attribute.
             * This test verifies that all 3 ways can change the values.
             */
            component.setValue('{!v.label}' , 'newLabel');
            var labelValueThroughComponentApi = component.get("v.label");
            var labelValueByExpression = $A.expressionService.getValue(component, "{!v.label}").getValue();
            var labelValueThruComponent = component.get('v.label');

            //Verify that all of them see the same value
            aura.test.assertEquals(labelValueThruComponent,'newLabel');
            aura.test.assertEquals(labelValueThruComponent,labelValueThroughComponentApi);
            aura.test.assertEquals(labelValueThruComponent,labelValueByExpression);

            $A.expressionService.setValue(component, "{!v.label}" , 'AttributeDefault');
            var labelValueThroughComponentApi = component.get("v.label");
            var labelValueByExpression = $A.expressionService.getValue(component, "{!v.label}").getValue();
            var labelValueThruComponent = component.get('v.label');

            //Verify that all of them see the same value
            aura.test.assertEquals(labelValueThruComponent,'AttributeDefault');
            aura.test.assertEquals(labelValueThruComponent,labelValueThroughComponentApi);
            aura.test.assertEquals(labelValueThruComponent,labelValueByExpression);

            component.set('v.label','newLabel');
            var labelValueThroughComponentApi = component.get("v.label");
            var labelValueByExpression = $A.expressionService.getValue(component, "{!v.label}").getValue();
            var labelValueThruComponent = component.get('v.label');

            //Verify that all of them see the same value
            aura.test.assertEquals(labelValueThruComponent,'newLabel');
            aura.test.assertEquals(labelValueThruComponent,labelValueThroughComponentApi);
            aura.test.assertEquals(labelValueThruComponent,labelValueByExpression);
        }

    },
    testVerifyCommitFunctionOnAttributes: {
        test: function(component){
            /**Attributes of a Component are stored as value objects
             * Verify that such value objects can be committed
             */
            var stringValue = component.getValue('v.label');
            aura.test.assertTrue(stringValue.getValue()==="AttributeDefault", "Value mis match between attribute value and retrieved value");
            stringValue.setValue('newString');

            aura.test.assertTrue(stringValue.getValue()==='newString', "getValue is not retrieving the latest value");
            aura.test.assertTrue(component.getValue('v.label').getPreviousValue()==='AttributeDefault', "getPreviousValue is not retrieving the previous value");
            //Commit a value
            component.getValue('v.label').commit();
            aura.test.assertTrue(component.getValue('v.label').getPreviousValue()==="newString", "Value was not committed");
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
            $A.test.assertFalse(newValue !== undefined, 'A defined Value object was created');
            // TODO(W-795118): AttributeSet.setValues should assert that the attribute exists
            // try {
                component.set('v.nonExistingAttribute', 'blahhh');
                // $A.test.fail("Setting a non-existent attribute should throw error.");
            // } catch (e) {
                // $A.test.assertTrue(e.message.indexOf("Assertion Failed!: Unknown attribute") != -1,
                //        "Setting non-existent attribute did not throw expected Error.");
                $A.test.assertFalse(component.get('v.nonExistingAttribute') !== undefined);
            // }
        }
    }
})
