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
     * Create a new component whose definition was already preloaded and use the current component as attribute value provider.
     */
    testValueProviderForPreloadedDef:{
        test:function(cmp){
            $A.run(function(){
                cmp.get('c.createCmpWithPreloadedDef').runDeprecated();
            });

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
     * Automation for W-1308292 - Passing localId in config for newCmp will invoke the fix
     */
    testPassThroughValueAsValueProvider:{
        test:function(cmp){
            $A.run(function(){
                cmp.get('c.createCmpWithPassthroughValue').runDeprecated();
            });

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
    //TODO - W-1818696 - this only fails on jenkins autointegration.  Figure out why
    _testValueProviderForDefFetchedFromServer:{
        attributes:{numberAttribute:999},
        test: function(cmp){
            $A.run(function(){
                cmp.get('c.createCmpByFetchingDefFromServer').runDeprecated();
            });

            $A.test.addWaitFor(true, $A.test.allActionsComplete, function(){
                var numberCmp = cmp.get('v.body')[0];
                $A.test.assertEquals("markup://loadLevelTest:displayNumber", numberCmp.getDef().getDescriptor().getQualifiedName(),
                        "Failed to create new component: markup://loadLevelTest:displayNumber");
                $A.test.assertEquals(999,numberCmp.get('v.number'), "Failed to pass attribute values to placeholder");
                        $A.test.assertEquals("999",$A.test.getTextByComponent(numberCmp), "Failed to pass attribute values to placeholder");

                // Verify that new Component was provided the local id specified in config
                $A.test.assertTruthy(cmp.find("num_Id"), "Failed to find new Component with its localId");
                $A.test.assertEquals(numberCmp, cmp.find("num_Id"));
            });
        }
    },

    /**
     * Verify component with PropertyReferenceValue in MapValue attributes has correct values
     */
    testMapValueProviderForDefFetchedFromServer:{
        test: function(cmp){
            $A.run(function(){
                cmp.get('c.createCmpWithMapValuePropRefValueFromServer').runDeprecated();
            });

            $A.test.addWaitFor(true, $A.test.allActionsComplete, function(){
                var mapCmp = cmp.get('v.body')[0];
                $A.test.assertEquals("markup://loadLevelTest:displayMap",
                    mapCmp.getDef().getDescriptor().getQualifiedName(),
                    "Failed to create new component: markup://loadLevelTest:displayMap");
                $A.test.assertEquals("barFoo", mapCmp.get('v.map.propRef'), "Wrong value for v.map.propRef");
                $A.test.assertEquals("barFoo", mapCmp.get('v.map.map2.propRef'), "Wrong value for v.map.map2.propRef");
                mapCmp.setValue("v.stringAttribute", "fooBar");
                $A.test.assertEquals("fooBar", mapCmp.get('v.map.propRef'), "Wrong value for v.map.propRef. Should be updated");
                $A.test.assertEquals("fooBar", mapCmp.get('v.map.map2.propRef'), "Wrong value for v.map.map2.propRef. Should be updated");

                // Verify that new Component was provided the local id specified in config
                $A.test.assertTruthy(cmp.find("map_Id"), "Failed to find new Component with its localId");
                $A.test.assertEquals(mapCmp, cmp.find("map_Id"));
            });
        }
    },

    /**
     * Use empty value provider and make sure it is either caught or throws a useful JS error.
     */
    // TODO(W-1320706): Specifying bad attribute value providers should give a more informative message to user
    _testEmptyValueProvider:{
        test:function(cmp){
            try{
                $A.run(function(){
                    cmp.get('c.createCmpWithEmptyValueProvider').runDeprecated();
                });
                
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
    // TODO(W-1320706): Specifying bad attribute value providers should give a more informative message to user
    _testUndefinedAsValueProvider:{
        test:function(cmp){
            
            try{
                $A.run(function(){
                    cmp.get('c.createCmpWithUndefinedValueProvider').runDeprecated();
                });
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
            $A.run(function(){
                cmp.get('c.createCmpWithNoRequirementForAVP').runDeprecated();
            });

            var body = cmp.get('v.body');
            $A.test.assertEquals(1,body.length);
            $A.test.assertEquals("markup://aura:text",body[0].getDef().getDescriptor().getQualifiedName());
            $A.test.assertEquals("SelfSustaining", $A.test.getText(body[0].getElement()));
        }
    }
})
