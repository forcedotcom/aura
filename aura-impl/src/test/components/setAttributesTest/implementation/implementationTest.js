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
     * Verify that setting simple attribute values of parent interface works.
     */
    // TODO W-1468465 - cannot set attribute values on interface
    _testSettingValueOfInterfaceSimpleAttributes:{
        test:function(cmp){
            aura.test.assertEquals('implementationX',cmp.getValue('v.SimpleAttribute').getValue(), "Attribute value must have been overriden by aura:set tag");
            //Another way of accessing attributes
            aura.test.assertEquals('implementationX',cmp.getAttributes('SimpleAttribute').getValue());
            //UI verification to check that renderer used the right attribute value
            aura.test.assertEquals('The value of SimpleAttribute = implementationX',$A.test.getText(cmp.find('simpleAttr_id').getElement()));
        }
    }
})