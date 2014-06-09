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
     * Verify that default value assigned to a simple attribute.
     */
    testSimpleAttributeValue:{
        test:function(cmp){
            aura.test.assertEquals('grandparentX',cmp.get('v.SimpleAttribute'), "Value of attribute has the wrong default value.");
            //UI verification to check that renderer used the right attribute value
            aura.test.assertEquals('The value of SimpleAttribute = grandparentX',$A.test.getText(cmp.find('simpleAttr_id').getElement()));
        }
    },
    /**
     * Verify default value assignment to a attribute of type AuraComponent.
     */
    testComponentAsAttributeValue:{
        test:function(cmp){
            aura.test.assertEquals('Component',cmp.get('v.ComponentTypeAttribute')[0].auraType, "Attribute value was expected to be a component.")
            //Access the Aura.Component type attribute
            var cmpAttrValue = cmp.get('v.ComponentTypeAttribute')[0];
            aura.test.assertEquals('markup://test:test_button',cmpAttrValue.getDef().getDescriptor().getQualifiedName(), "Attribute should have been a button.")
            //Verify the label of the button
            aura.test.assertEquals('grandParentX_Button',$A.test.getText(cmpAttrValue.getElement()), "Button should have had text set in this (base) component.");
        }
    }
})
