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
    testCustomAttributeType:{
        test:function(cmp){
            var customAttrValue = cmp.get('v.pairAttr');
            $A.test.assertNotNull(customAttrValue);
            //Verify the type and value of attribute value
            $A.test.assertEquals(300, customAttrValue.intMember,
                    "Failed to construct attribute value of custom type.");
            $A.test.assertEquals("HouseNo", customAttrValue.strMember,
                    "Failed to construct String attribute value of custom type.");
        }
    },
    testCustomAttributeThroughURL:{
        attributes:{pairAttr:'lat$12890'},
        test:function(cmp){
            var customAttrValue = cmp.get('v.pairAttr');
            //Verify the type and value of attribute value
            $A.test.assertEquals(12890, customAttrValue.intMember,
                    "Attribute initialization in URL failed to initialize value for custom type.");
            $A.test.assertEquals("lat", customAttrValue.strMember,
                    "Attribute initialization in URL failed to initialize value for custom type.");
        }
    }

})
