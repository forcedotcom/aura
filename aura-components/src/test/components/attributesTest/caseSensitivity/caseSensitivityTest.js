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
	labels : ["UnAdaptableTest"],
	/*
		This test and the one below creates a component(attributesTest:caseInsensitiveChild), 
		the component extends another component(attributesTest:parent), setting its attribute
		with wrong case sensitive name ('SIMPLEAttribute', instead of 'SimpleAttribute').
		
		this test get the definition of "attributesTest:caseInsensitiveChild" from server first,
		then create the component on the client by calling $A.createComponent. $A.createComponent 
		won't go to server for def.
		
		the test below call $A.createComponent directly, it will go to server requesting the def.
		
		both test verify we error out with ACF.
	*/
    testCaseSensitivityWhenSettingParentAttributes_ComponentCreatedOnClient:{
        test:function(){
        	var testCompleted = false;
            var def=null;
            $A.getDefinition("attributesTest:caseInsensitiveChild",function(newDef){
                def=newDef;
            });

            $A.test.runAfterIf(function(){return !!def},function(){
                $A.test.expectAuraError("Access Check Failed!");
                $A.createComponent("attributesTest:caseInsensitiveChild",{},
                function(){
                    testCompleted = true;
                });
                
                $A.test.addWaitFor(true, function() { return testCompleted; } );
            })
        }
    },
    
    testCaseSensitivityWhenSettingParentAttributes_ComponentRequestedFromServer:{
        test:function(){
        		var testCompleted = false;
                $A.test.expectAuraError("Access Check Failed!");
                $A.createComponent("attributesTest:caseInsensitiveChild",{},
                function(){
                	testCompleted = true;
                });
                $A.test.addWaitForWithFailureMessage(true, function() { return testCompleted; },
                        "Didn't get ACF error box",
                        function(){
                        $A.test.getPopOverErrorMessage($A.test.getAuraErrorMessage(),"\' is not visible to \'",
                                "Access Check Failed! Component.setupSuper():'SIMPLEAttribute' of component 'markup://attributesTest:caseInsensitiveChild",
                                    "markup://attributesTest:caseInsensitiveChild");
                });
        }
    },
    

    /**
     * Trying to get a simple attribute with the wrong case will throw and Access Check Failure
     */
    testGetWrongCaseThrowsAccessCheckFailure: {
    	labels : ["UnAdaptableTest"],
        test: function(cmp) {
            $A.test.assertEquals("An Aura of Lightning Lumenated the Plume", cmp.get("v.attr"));
            $A.test.expectAuraError("Access Check Failed!");
            cmp.get("v.Attr");
            $A.test.addWaitForWithFailureMessage(
                    true, 
                    function() {
                        return ($A.test.getAuraErrorMessage().indexOf("Access Check Failed!") !== -1);
                    },
                    "Didn't get ACF error box",
                    function() {
                        $A.test.getPopOverErrorMessage($A.test.getAuraErrorMessage(),"\' is not visible to \'",
                                "Access Check Failed! AttributeSet.get(): attribute 'Attr' of component 'markup://attributesTest:caseSensitivity",
                                    "markup://attributesTest:caseSensitivity");
                    });
        }
    },

    /**
     * Trying to set a simple attribute with the wrong case will throw an Access Check Failure
     */
    testSetWrongCaseThrowsAccessCheckFailure: {
    	labels : ["UnAdaptableTest"],
        test: function(cmp) {
            // Reading the old value
            $A.test.expectAuraError("Access Check Failed!");
            // Setting the new value
            $A.test.expectAuraError("Access Check Failed!");
            cmp.set("v.Attr", "Something new");
            $A.test.addWaitForWithFailureMessage(
                    true, 
                    function() {
                        return ($A.test.getAuraErrorMessage().indexOf("Access Check Failed!") !== -1);
                    },
                    "Didn't get ACF error box",
                    function() {
                        $A.test.getPopOverErrorMessage($A.test.getAuraErrorMessage(),"\' is not visible to \'",
                                "Access Check Failed! AttributeSet.set(): 'Attr' of component 'markup://attributesTest:caseSensitivity",
                                    "markup://attributesTest:caseSensitivity");
                    });
        }
    }
})