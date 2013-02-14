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
    /**
     * Verify that setting a simple attribute works.
     */
    testSettingValueOfInheritedSimpleAttribute_SecondLevelInheritance:{
        test:function(cmp){
            aura.log(cmp);

            aura.test.assertEquals('childX',cmp.getSuper().getValue('v.SimpleAttribute').getValue(), "Attribute value should have been overriden in child component.");

            //UI verification to check that renderer used the right attribute value
            aura.test.assertEquals('The value of SimpleAttribute = childX', $A.test.getText(cmp.getSuper().getSuper().find('simpleAttr_id').getElement()));
        }
    },

    /**
     * Verify that setting an attribute of type AuraComponent works.
     */
    // W-969871 https://gus.soma.salesforce.com/a07B0000000FCTd
    _testSettingValueOfInheritedComponentAttribute_SecondLevelInheritance:{
        test:function(cmp){
            /**TODO: Should verify the value of attribute through API too.
             * aura.test.assertEquals('Component',cmp.getValue('v.ComponentTypeAttribute').getValue()[0].auraType, "Attribute value was expected to be a component.")
            var attrValue = cmp.getValue('v.ComponentTypeAttribute').getValue()[0];
            aura.test.assertEquals('markup://test:test_button',attrValue.getDef().getDescriptor().getQualifiedName(), "Attribute should have been a button.")
            aura.test.assertEquals('childX_Button',$A.test.getText(attrValue.getElement()), "ComponentTypeAttribute should have been assigned a button with label: childX_Button.");
            */
            aura.log(cmp.find("btn").getElements());
            aura.test.assertEquals('childX_Button', $A.test.getText(cmp.find('btn').getElement()), "ComponentTypeAttribute should have been assigned a button with label: childX_Button.");
        }
    }
})
