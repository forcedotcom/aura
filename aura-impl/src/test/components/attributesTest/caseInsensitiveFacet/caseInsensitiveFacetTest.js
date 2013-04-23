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
    //W-1190572
    _testCaseInSensitivityWhenSettingAttributesOfFacets:{
        test:function(cmp){
            var facet = cmp.find('facet');
            $A.test.assertEquals('facetY', facet.getValue('v.SimpleAttribute').getValue(), "Failed to pass on value to facet, attribute name is case sensitive.");

            var facet2 = cmp.find('facetSetAttribute');
            $A.test.assertEquals('facetZ', facet2.getValue('v.SimpleAttribute').getValue(), "Failed to pass on value to facet using aura:set, attribute name is case sensitive.");
        }
    }
})
