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

            var attributeSet = component.getAttributes();
            aura.test.assertTrue(attributeSet.values.auraType ==='Value', 'aura type for attribute set is not set');

            var attribute = component.getAttributes().getValue('label');
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
            var labelValueThroughComponentApi = component.getValue('{!v.label}').getValue();
            var labelValueByExpression = $A.expressionService.getValue(component, "{!v.label}").getValue();
            var labelValueThruComponent = component.getAttributes().getValue('label').getValue();

            //Verify that all of them see the same value
            aura.test.assertEquals(labelValueThruComponent,'newLabel');
            aura.test.assertEquals(labelValueThruComponent,labelValueThroughComponentApi);
            aura.test.assertEquals(labelValueThruComponent,labelValueByExpression);

            $A.expressionService.setValue(component, "{!v.label}" , 'AttributeDefault');
            var labelValueThroughComponentApi = component.getValue('{!v.label}').getValue();
            var labelValueByExpression = $A.expressionService.getValue(component, "{!v.label}").getValue();
            var labelValueThruComponent = component.getAttributes().getValue('label').getValue();

            //Verify that all of them see the same value
            aura.test.assertEquals(labelValueThruComponent,'AttributeDefault');
            aura.test.assertEquals(labelValueThruComponent,labelValueThroughComponentApi);
            aura.test.assertEquals(labelValueThruComponent,labelValueByExpression);

            component.getAttributes().setValue('label','newLabel');
            var labelValueThroughComponentApi = component.getValue('{!v.label}').getValue();
            var labelValueByExpression = $A.expressionService.getValue(component, "{!v.label}").getValue();
            var labelValueThruComponent = component.getAttributes().getValue('label').getValue();

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
            var stringValue = component.getAttributes().getValue('label');
            aura.test.assertTrue(stringValue.getValue()==="AttributeDefault", "Value mis match between attribute value and retrieved value");
            stringValue.setValue('newString');

            aura.test.assertTrue(stringValue.getValue()==='newString', "getValue is not retrieving the latest value");
            aura.test.assertTrue(component.getAttributes().getValue('label').getPreviousValue()==='AttributeDefault', "getPreviousValue is not retrieving the previous value");
            //Commit a value
            component.getAttributes().getValue('label').commit();
            aura.test.assertTrue(component.getAttributes().getValue('label').getPreviousValue()==="newString", "Value was not committed");

        }

    },
    testVerifyInsertingNewAttributes:{
        test: function(component){
            //Calling getValue() on a non existing key (attribute)
            var attributeSet = component.getAttributes();
            var newValue = attributeSet.getValue('nonExistingAttribute');
            aura.test.assertFalse(newValue.isDefined(), 'A defined Value object was created');
            //TODO: W-795118
            //aura.test.assertTrue(attributeSet.getValue('nonExistingAttribute').getValue()==='blah', "New member value not editable");
        }
    },

    testInvalidUseOfGetAttributes:{
        test: function(component){
            var attributeSet = component.getAttributes();
            var attrValue = attributeSet.getValue('label');
            //attrValue.getValue() is the actual usage of a wrapped value object
            var newBlankValue = attrValue.getValue('blah');
            aura.test.assertDefined(newBlankValue, 'A Value was not created');
        }
    }

})
