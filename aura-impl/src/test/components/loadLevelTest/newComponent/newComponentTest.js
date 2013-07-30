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
/**
 * Tests to verify AuraComponentService.newComponentAsync() or $A.newCmpAsync()
 */
({
    /**
     * Test to verify creating a component whose definition is available at the client.
     */
    testConfig_PreloadedDef:{
        test: function(cmp){
            $A.run(function(){
                cmp.get("c.createCmpWithPreloadedDef").runDeprecated();
            });

            var body = cmp.get('v.body');
            $A.test.assertEquals(1,body.length);
            $A.test.assertEquals("markup://aura:text",body[0].getDef().getDescriptor().getQualifiedName());
            $A.test.assertEquals("0:c",body[0].getGlobalId());
        }
    },

    /**
     * Test to verify creating a component whose definition is fetched from the server.
     */
    testConfig_FetchNewDefFromServer:{
        test: function(cmp){
            $A.run(function(){
                cmp.get("c.createCmpByFetchingDefFromServer").runDeprecated();
            });

            $A.test.addWaitFor(true, $A.test.allActionsComplete, function(){
                var textCmp = cmp.get('v.body')[0];
                //Since this is created under root component and this is the first component from the server
                $A.test.assertEquals("1:3.2",textCmp.getGlobalId(), "Expected global id to be 1:3");
                $A.test.assertEquals(99,textCmp.get('v.number'), "Failed to pass attribute values to created component");
                $A.test.assertEquals("99",$A.test.getTextByComponent(textCmp), "Failed to pass attribute values to created component");
            });
        }
    },

    /**
     * Test to verify creating an invalid component returns proper error.
     * test:test_Preload_BadCmp has two attributes with the same name.
     */
    testConfig_FetchBadComponent:{
        test: function(cmp){
            $A.run(function(){
                cmp.get("c.createComponentWithCompilationProblems").runDeprecated();
            });

            $A.test.addWaitFor(true, $A.test.allActionsComplete, function(){
                var errorCmp = cmp.get('v.body')[0];
                var errorMsg = errorCmp.getValue("v.value").value;
                $A.test.assertTrue($A.test.contains(errorMsg, 'Duplicate definitions for attribute dup on tag aura:attribute'),
                        "Incorrect error message returned in error component when trying to create invalid component");
            });
        }
    },
    /**
     * Test to verify trying to create a non-existent component returns proper error.
     */
    testConfig_NonExistingComponent:{
        test: function(cmp){
            $A.run(function(){
                cmp.get("c.createNonExistingComponent").runDeprecated();
            });

            $A.test.addWaitFor(true, $A.test.allActionsComplete, function(){
                var errorCmp = cmp.get('v.body')[0];
                var errorMsg = errorCmp.getValue("v.value").value;
                $A.test.assertTrue($A.test.contains(errorMsg, 'No COMPONENT named markup://foo:hallelujah found'),
                        "Incorrect error message returned in error component when trying to create invalid component");
            });
        }
    },

    /**
     * Create a component and initialize it with simple attributes.
     * This componentDef is available at the client registry.
     */
    testConfig_ComponentWithSimpleAttributes:{
        test: function(cmp){
            $A.run(function(){
                cmp.get("c.createCmpWithSimpleAttributes").runDeprecated();
            });

            var body = cmp.get('v.body');
            $A.test.assertEquals(1,body.length);
            $A.test.assertEquals("markup://aura:text",body[0].getDef().getDescriptor().getQualifiedName());
            $A.test.assertEquals("TextComponent",body[0].get('v.value'));
            $A.test.assertEquals(6,body[0].get('v.truncate'));
            $A.test.assertEquals("Tex...",$A.test.getText(body[0].getElement()));
        }
    },

    /**
     * Create a component and initialize it with string array type attribute.
     * The definition in this case for the component is not available at the client yet.
     *
     */
    testConfig_ComponentWithComplexAttributes:{
        test: function(cmp){
            $A.run(function(){
                cmp.get("c.createCmpWithComplexAttributes").runDeprecated();
            });
            
            $A.test.addWaitFor(true, $A.test.allActionsComplete, function(){
                var textCmp = cmp.get('v.body')[0];
                $A.test.assertEquals("one,two", textCmp.get('v.StringArray').toString(), "Failed to pass array attribute values to placeholder");
                $A.test.assertEquals('onetwo',$A.test.getTextByComponent(textCmp), "Failed to pass array attribute values to placeholder");
            });
        }
    },

    /**
     * Create a component whose definition is already available at the client, but the component has server
     * dependencies (java model). Verify that attributes are passed to the server with the post action.
     */
    testConfig_ComponentWithServerDependecies:{
        test:function(cmp){
            $A.run(function(){
                cmp.get("c.createCmpWithServerDependecies").runDeprecated();
            });

            $A.test.addWaitFor(true, $A.test.allActionsComplete, function(){
                var serverCmp = cmp.get('v.body')[0];
                $A.test.assertEquals('creatingComponentWithServerDependecies',serverCmp.get("m.string"),
                        "Failed to send attribute with post action, model did not get the attribute required.");
                $A.test.assertTrue($A.test.getTextByComponent(serverCmp).indexOf('creatingComponentWithServerDependecies')!=-1,
                        "Failed to set model value for local component");
            });
        }
    },

    /**
     * Create a component that is abstract, which end up being replaced by an actual implementation.
     */
    testConfig_AbstractComponent:{
        test: function(cmp){
            $A.run(function(){
                cmp.get("c.createAbstractComponent").runDeprecated();
            });

            $A.test.addWaitFor(true, $A.test.allActionsComplete, function(){
                var newCmp = cmp.get('v.body')[0];
                var cmpImplName = newCmp.getDef().getDescriptor().getQualifiedName();
                $A.test.assertEquals("markup://test:test_Provider_AbstractBasicExtends", cmpImplName, 
                        "Abstract component replaced with incorrect implementation on creation");
            });
        }
    },

    /**
     * Create a component with a facet that is marked for lazy loading.
     * This is 2 levels of lazy loading, first the component itself is lazy loaded, then the facet inside the component is lazy loaded.
     */
    testConfig_ComponentWithLazyFacet:{
        test:[function(cmp){
            var helper = cmp.getDef().getHelper();
            $A.run(function(){
                cmp.get("c.createComponentWithLazyFacets").runDeprecated();
            });
            
            $A.test.addWaitFor(
                true,
                function(){
                    var body = cmp.get('v.body');
                    if (body.length > 0) {
                        var c = body[0];
                        if (c.getDef().getDescriptor().getQualifiedName() === "markup://loadLevelTest:serverWithLazyChild") {
                            return true;
                        }
                    }
                    return false;
                },
                function(){
                    var serverCmp = cmp.get('v.body')[0];
                    var kid = serverCmp.find('kid');
                    $A.test.assertEquals("placeholder", kid.getDef().getDescriptor().getName());

                    helper.resumeGateId(cmp, "lazyKid");

                    $A.test.addWaitFor("serverComponent", function(){
                        kid = serverCmp.find('kid');
                        return kid.getDef().getDescriptor().getName();
                });
            });
        }]
    },

    /**
     * Create a component and mark it to be exclusively created,
     *
     */
    testConfig_createComponentExclusively:{
        test:function(cmp){
            aura.test.setTestTimeout(15000)
            $A.run(function(){
                cmp.get("c.createComponentExclusively").runDeprecated();
            });

            $A.test.addWaitFor(true, $A.test.allActionsComplete, function(){
                var body = cmp.get('v.body');
                $A.test.assertEquals("markup://loadLevelTest:serverComponent", body[0].getDef().getDescriptor().getQualifiedName());
                $A.test.assertEquals("markup://loadLevelTest:displayBoolean", body[1].getDef().getDescriptor().getQualifiedName());
                $A.test.assertEquals("markup://loadLevelTest:displayNumber", body[2].getDef().getDescriptor().getQualifiedName());
            });
        }
    },

    /**
     * Create a component and verify that actions with the new component work.
     */
    testConfig_VerifyActionsOnNewComponent:{
        test: function(cmp){
            $A.test.setTestTimeout(50000);
            $A.run(function(){
                cmp.get("c.createComponentAndVerifyAction").runDeprecated();
            });

            $A.test.addWaitFor(true, $A.test.allActionsComplete, function(){
                var serverCmp = cmp.get('v.body')[0];
                serverCmp.find('makeServer').get('e.press').fire();
                $A.test.addWaitFor(true, $A.test.allActionsComplete, function(){
                    var innerCmpBody = serverCmp.get('v.body');
                    $A.test.assertEquals("markup://loadLevelTest:serverComponent", innerCmpBody[0].getDef().getDescriptor().getQualifiedName(),
                            "Could not create comopnent from action of newly created component");
                });
            });
        }
    },

    testConfig_NoDescriptor: {
        test:function(cmp){
            aura.test.setTestTimeout(15000);
            var config = {/*componentDef: "markup://loadLevelTest:displayNumber",*/
                                attributes:{values:{number:{descriptor:'number', value:99}}}
                            };
            try{
                $A.newCmpAsync(this, function(){},config);
                $A.test.fail('Should have failed to create component without a descriptor.');
            }catch(e){
                $A.test.assertEquals("Assertion Failed!: ComponentDef Config required for registration : undefined",e.message);
            }
        }
    },

    testConfig_NotFullyQualifiedNameInConfig: {
        test: function(cmp){
            aura.test.setTestTimeout(15000);
            var config = {componentDef: "loadLevelTest:displayNumber"};
            var cmpName;
            $A.run(function(){
                $A.newCmpAsync(
                    this,
                    function(newCmp){
                        cmpName = newCmp.getDef().getDescriptor().getQualifiedName();
                    },
                    config
                );
            });
            $A.test.addWaitFor(true, $A.test.allActionsComplete, function(){
                $A.test.assertEquals("markup://loadLevelTest:displayNumber", cmpName,
                        "Failed to create component without fully qualified name in config's componenetDef field");
            });
        }
    },

    testConfig_StringConfigAsNotFullyQualifiedName: {
        test: function(cmp){
            aura.test.setTestTimeout(15000);
            var config = "loadLevelTest:displayNumber";
            var cmpName;
            $A.run(function(){
                $A.newCmpAsync(
                    this,
                    function(newCmp){
                        cmpName = newCmp.getDef().getDescriptor().getQualifiedName();
                    },
                    config
                );
            });
            $A.test.addWaitFor(true, $A.test.allActionsComplete, function(){
                $A.test.assertEquals("markup://loadLevelTest:displayNumber", cmpName,
                        "Failed to create component without fully qualified name as config");
            });
        }
    },

    testConfig_NoConfig: {
        test: function(cmp){
            aura.test.setTestTimeout(15000);
            try{
                $A.newCmpAsync(this, function(){},'');
                $A.test.fail('Should have failed to create component without a descriptor.');
            }catch(e){
                $A.test.assertTrue(e.message.indexOf("Assertion Failed!: config is required in ComponentService.newComponentAsync(config)")===0);
            }
        }
    },

    testConfig_AlternateConfigFormat: {
        test: function(cmp){
            aura.test.setTestTimeout(15000);
            //Verify that this format for config is supported
            var config = {componentDef:{descriptor:"markup://loadLevelTest:displayNumber"}};
            var cmpName;
            $A.run(function(){
                $A.newCmpAsync(
                    this,
                    function(newCmp){
                        cmpName = newCmp.getDef().getDescriptor().getQualifiedName();
                    },
                    config
                );
            });
            $A.test.addWaitFor(true, $A.test.allActionsComplete, function(){
                $A.test.assertEquals("markup://loadLevelTest:displayNumber", cmpName,
                        "Alternative config format did not create proper component");
            });
        }
    },

    testConfig_MissingRequiredAttribute:{
        test:function(cmp){
            var config = {componentDef:"markup://aura:renderIf"};
            try{
                $A.newCmpAsync(this, function(){}, config);
                $A.test.fail('Should have failed to create component without a descriptor.');
            }catch(e){
                $A.test.assertEquals("Missing required attribute aura:renderIf.isTrue",e.message);
            }
        }
    },

    /**
     * Passing null in for the callback scope should use the global context, and work as expected in this case.
     */
    testConfig_NullCallbackScope: {
        test: function(cmp){
            var config = { componentDef: "markup://loadLevelTest:displayNumber",
                            attributes:{
                                values:{number:99}
                            }
                         };
            $A.run(function(){
                $A.newCmpAsync(
                        null,
                        function(newCmp){
                            cmp.getValue("v.body").push(newCmp);
                        },
                        config
                );
            });

            $A.test.addWaitFor(true, $A.test.allActionsComplete, function(){
                var textCmp = cmp.get('v.body')[0];
                //Since this is created under root component and this is the first component from the server
                $A.test.assertEquals("1:2.2",textCmp.getGlobalId(), "Expected global id to be 1:2");
                $A.test.assertEquals(99,textCmp.get('v.number'), "Failed to pass attribute values to created component");
                $A.test.assertEquals("99",$A.test.getTextByComponent(textCmp), "Failed to pass attribute values to created component");
            });
        }
    },
    // TODO(W-1766834): setting 'localId' param of config causes error
    _testConfig_SetLocalId:{
        test: function(cmp){
            debugger;
            $A.run(function(){
                cmp.get("c.createCmpWithLocalId").runDeprecated();
            });

            var body = cmp.get('v.body');
            $A.test.assertEquals(1,body.length);
            $A.test.assertEquals("markup://aura:text",body[0].getDef().getDescriptor().getQualifiedName());
            $A.test.assertEquals("TextComponent",body[0].get('v.value'));
            $A.test.assertEquals(6,body[0].get('v.truncate'));
            $A.test.assertEquals("Tex...",$A.test.getText(body[0].getElement()));
        }
    },
})
