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
    //W-2192746
    // There should be an error here saying that there is a problem with case sensitivity.
    testCaseSensitivityWhenSettingParentAttributes:{
        test:function(cmp){
            $A.test.assertEquals(undefined, cmp.get('v.SIMPLEAttribute'),
                "Attribute expression should be case sensitive.");
            $A.test.assertEquals('parentY',cmp.get('v.SimpleAttribute'),
                    "Attribute value must have been overriden by aura:set tag");
        }
    }
})
