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
    // TODO(W-2192746): There should be an error here saying that there is a problem with case sensitivity.
    testCaseSensitivityWhenSettingParentAttributes:{
        test:function(){
            var def=null;
            $A.getDefinition("attributesTest:caseInsensitiveChild",function(newDef){
                def=newDef;
            });

            $A.test.runAfterIf(function(){return !!def},function(){
                $A.test.expectAuraError("Access Check Failed!");
                $A.createComponent("attributesTest:caseInsensitiveChild",{},function(){});
            })
        }
    },

    /**
     * Trying to get a simple attribute with the wrong case will throw and Access Check Failure
     */
    testGetWrongCaseThrowsAccessCheckFailure: {
        test: function(cmp) {
            $A.test.assertEquals("An Aura of Lightning Lumenated the Plume", cmp.get("v.attr"));
            $A.test.expectAuraError("Access Check Failed!");
            cmp.get("v.Attr");
        }
    },

    /**
     * Trying to set a simple attribute with the wrong case will throw an Access Check Failure
     */
    testSetWrongCaseThrowsAccessCheckFailure: {
        test: function(cmp) {
            // Reading the old value
            $A.test.expectAuraError("Access Check Failed!");
            // Setting the new value
            $A.test.expectAuraError("Access Check Failed!");
            cmp.set("v.Attr", "Something new");
        }
    }
})