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
     * Create a new component whose definition was already preloaded and use the current component as attribute value provider.
     */
    testValueProviderForPreloadedDef:{
        test:function(cmp){
            var action = cmp.get('c.createCmpWithPreloadedDef');
            action.run();
            $A.eventService.finishFiring();

            var body = cmp.get('v.body');
            $A.test.assertEquals(1,body.length);
            $A.test.assertEquals("markup://aura:text",body[0].getDef().getDescriptor().getQualifiedName());
            $A.test.assertEquals("fooBar", $A.test.getText(body[0].getElement()));

            //Verify that local ID can be used to find the component
            var newTextCmp = cmp.find("txt_Id");
            $A.test.assertTruthy(newTextCmp, "Failed to find new Component with its localId");
            $A.test.assertEquals("markup://aura:text", newTextCmp.getDef().getDescriptor().getQualifiedName());
        }
    },
    /**
     * Create a new component whose definition was already preloaded and provide a custom attribute value provider.
     * W-1308292 - Passing localId in config for newCmp will invoke the fix
     */
    testPassThroughValueAsValueProvider:{
        test:function(cmp){
            var action = cmp.get('c.createCmpWithPassthroughValue');
            action.run();
            $A.eventService.finishFiring();

            //Verify that local ID can be used to find the component
            var newTextCmp = cmp.find("txt_Id");
            $A.test.assertTruthy(newTextCmp, "Failed to find new Component with its localId")

            $A.test.assertEquals("markup://aura:text", newTextCmp.getDef().getDescriptor().getQualifiedName());
            $A.test.assertEquals("Washington", newTextCmp.getAttributes().getValue('value').getValue());
            $A.test.assertEquals("Washington", $A.test.getText(newTextCmp.getElement()));
        }
    },
    /**
     * Create a component whose definition is not available at the client.
     * This definition would be fetched at the server.
     */
    //TODO W-1320697
    _testValueProviderForDefFetchedFromServer:{
        attributes:{numberAttribute:999},
        test:[function(cmp){
            var action = cmp.get('c.createCmpByFetchingDefFromServer');
            action.run();
            $A.eventService.finishFiring();

            var body = cmp.get('v.body');
            $A.test.assertEquals("markup://aura:placeholder", body[0].getDef().getDescriptor().getQualifiedName(),
                    "Expected component to be initially represented by a placeholder.");

            //Wait till placeholder is replaced by actual component that was specified in newCmp()
            this.assertAfterLazyLoading(body[0],"markup://loadLevelTest:displayNumber",
                    function(){
                        var numberCmp = this.extractCmpFromPlaceholder(body[0],"markup://loadLevelTest:displayNumber");

                        $A.test.assertEquals(999,numberCmp.get('v.number'), "Failed to pass attribute values to placeholder");
                        $A.test.assertEquals("999",$A.test.getTextByComponent(numberCmp), "Failed to pass attribute values to placeholder");

                        /**W-1318095 - Verify that new Component was provided the local id specified in config
                        $A.test.assertTruthy(cmp.find("num_Id"));
                        $A.test.assertEquals(numberCmp, cmp.find("num_Id"));*/
                    });
        }]
    },

    /**
     * Wait till the placeholder is replaced by actual component and call the callback function.
     */
    assertAfterLazyLoading:function(placeholder, expectedComponent, callback){
        var extractCmpFromPlaceholder = this.extractCmpFromPlaceholder;
        $A.test.addWaitFor(true,
                function(){
                        return !!extractCmpFromPlaceholder(placeholder,expectedComponent);
                },callback);
    },
    /**
     * The target component to be loaded is inserted into the body of the placeholder.
     * This function return the component when its found in the body of the placeholder else it returns nothing.
     */
    extractCmpFromPlaceholder:function(placeholder, cmpName){
        var body = placeholder.get("v.body");
        var ret;
        if(body.forEach){
            body.forEach(function(key){
                if(key.auraType && key.auraType === 'Component' && key.getDef().getDescriptor().getQualifiedName()===cmpName)
                    ret= key;
            });
        }
        return ret;
    },
    /**
     * Use empty value provider and make sure it is either caught or throws a useful JS error.
     */
    //W-1320706
    _testEmptyValueProvider:{
        test:function(cmp){
            var action = cmp.get('c.createCmpWithEmptyValueProvider');
            action.run();
            try{
            $A.eventService.finishFiring();
            //Look at the c.createCmpWithEmptyValueProvider, it is providing {} as attribute value provider
            $A.test.fail("Should have failed to resolve value provider for new component.");
            }catch(e){
                //W-1320706 Informative error message
                $A.test.assertEquals("TypeError: Object #<Object> has no method 'getValue'", e.toString());
            }
        }
    },
    /**
     * Use undefined as value provider and make sure it is either caught or throws a useful JS error.
     */
    //W-1320706
    _testUndefinedAsValueProvider:{
        test:function(cmp){
            var action = cmp.get('c.createCmpWithUndefinedValueProvider');
            action.run();
            try{
                $A.eventService.finishFiring();
                //Look at the c.createCmpWithUndefinedValueProvider, it is providing undefined as attribute value provider
                $A.test.fail("Should have failed to resolve value provider for new component.");
            }catch(e){
                //W-1320706 Informative error message
                $A.test.assertEquals("TypeError: Cannot call method 'getValue' of undefined", e.toString());
            }
        }
    },
    /**
     * Use undefined as value provider, but the new component has no references to the value provider.
     * The attributes of new component has no reference to attributes of the parent component.
     */
    testNewComponentWithoutDependenceOnAVP:{
        test:function(cmp){
            var action = cmp.get('c.createCmpWithNoRequirementForAVP');
            action.run();
            $A.eventService.finishFiring();

            var body = cmp.get('v.body');
            $A.test.assertEquals(1,body.length);
            $A.test.assertEquals("markup://aura:text",body[0].getDef().getDescriptor().getQualifiedName());
            $A.test.assertEquals("SelfSustaining", $A.test.getText(body[0].getElement()));
        }
    }
})
