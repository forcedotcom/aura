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
    testCaseInSensitivityWhenSettingParentAttributes:{
        test:function(cmp){
            //Child component just seens the values given by parent,
            //even though it overrides the value of the attribute, it is reflected only in the parent
            $A.test.assertEquals('parentY',cmp.getValue('v.SIMPLEAttribute').getValue(),
                "Attribute expression should be case insensitive.");
            $A.test.assertEquals('parentY',cmp.getValue('v.SimpleAttribute').getValue(),
                "Attribute in Child did not get the value set by parent.");

            //Value set in child must override the parent's attribute value
            /*TODO : W-1190572
             * $A.test.assertEquals('childY',cmp.getSuper().getValue('v.SimpleAttribute').getValue(),
                    "Attribute value must have been overriden by aura:set tag");
            */
        }
    }
})
