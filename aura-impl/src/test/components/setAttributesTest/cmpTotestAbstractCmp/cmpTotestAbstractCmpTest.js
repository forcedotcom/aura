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
    testSettingAttributeValueInheritedFromAbstractComponents:{
        test:function(cmp){
            //Access the abstract component included as facet
            var testCmp = cmp.find('id');
            aura.test.assertNotNull(testCmp);
            //It should actually be the implementing component because the provider would have injected the implementation.
            aura.test.assertEquals('markup://setAttributesTest:abstractCmpExtension',testCmp.getDef().getDescriptor().getQualifiedName());
            aura.test.assertEquals('abstractExtensionX',testCmp.getSuper().getValue('v.SimpleAttribute').getValue());
            //Verify the content of the HTML element
            aura.test.assertEquals('The value of SimpleAttribute = abstractExtensionX',$A.test.getText(testCmp.getElement()));
        }
    }
})