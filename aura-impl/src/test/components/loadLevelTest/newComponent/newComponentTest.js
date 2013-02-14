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
/**
     * Tests to verify AuraComponentService.newComponent() or $A.newCmp()
     */

({
    /**
     * Test to verify creating a component whose definition is available at the client.
     */
    testConfig_PreloadedDef:{
        test:[function(cmp){
            var action = cmp.get('c.createCmpWithPreloadedDef');
            action.run();
            cmp.getEvent("press").fire();

            var body = cmp.get('v.body');
            $A.test.assertEquals(1,body.length);
            $A.test.assertEquals("markup://aura:text",body[0].getDef().getDescriptor().getQualifiedName());
            $A.test.assertEquals("0:c",body[0].getGlobalId());
        }]
    },
    /**
     * Tests to verify creating a component whose definition is fetched from the server.
     */
    testConfig_FetchNewDefFromServer:{
        test:[function(cmp){
            var action = cmp.get('c.createCmpByFetchingDefFromServer');
            action.run();
            cmp.getEvent("press").fire();

            var body = cmp.get('v.body');
            $A.test.assertEquals("markup://aura:placeholder", body[0].getDef().getDescriptor().getQualifiedName(),
                    "Expected component to be initially represented by a placeholder.");
            //Wait till all specified facets marked with aura:load are replaced by actual components, and then call callbackAfterLoad()
            this.assertAfterLazyLoading(body[0],"markup://loadLevelTest:displayNumber",
                    function(){
                        var textCmp = this.extractCmpFromPlaceholder(body[0],"markup://loadLevelTest:displayNumber");
                        //Since this is created under root component and this is the first component from the server
                        $A.test.assertEquals("1:2.2",textCmp.getGlobalId(), "Expected global id to be 1:2");
                        $A.test.assertEquals(99,textCmp.get('v.number'), "Failed to pass attribute values to placeholder");
                        $A.test.assertEquals("99",$A.test.getTextByComponent(textCmp), "Failed to pass attribute values to placeholder");
                    });
        }]

    },
    /**
     * Provider a component descriptor whose compilation fails.
     * test:test_Preload_BadCmp has two attributes with the same name.
     */
    //W-1278774
    _testConfig_FetchBadComponent:{
        test:[function(cmp){
            var action = cmp.get('c.createComponentWithCompilationProblems');
            action.run();
            cmp.getEvent("press").fire();

            var body = cmp.get('v.body');
            $A.test.assertEquals("markup://aura:placeholder", body[0].getDef().getDescriptor().getQualifiedName(),
                    "Expected component to be initially represented by a placeholder.");
            //Wait for suitable error message and assert on that
            $A.test.assertEquals('Duplicate definitions for attribute dup on tag aura:attribute at test:test_Preload_BadCmp',aura.util.getElement("auraErrorMessage").innerHTML)
        }]
    },
    /**
     * Provider a component descriptor that does not exist.
     */
    //W-1278774
    _testConfig_NonExistingComponent:{
        test:[function(cmp){
            var action = cmp.get('c.createNonExistingComponent');
            action.run();
            cmp.getEvent("press").fire();

            var body = cmp.get('v.body');
            $A.test.assertEquals("markup://aura:placeholder", body[0].getDef().getDescriptor().getQualifiedName(),
                    "Expected component to be initially represented by a placeholder.");
            //Wait for suitable error message and assert on that
            $A.test.assertEquals('Duplicate definitions for attribute dup on tag aura:attribute at test:test_Preload_BadCmp',aura.util.getElement("auraErrorMessage").innerHTML)
        }]

    },
    /**
     * Create a component and initialize it with simple attributes.
     * This componentDef is available at the client registry.
     */
    testConfig_ComponentWithSimpleAttributes:{
        test:[function(cmp){
            var action = cmp.get('c.createCmpWithSimpleAttributes');
            action.run();
            cmp.getEvent("press").fire();

            var body = cmp.get('v.body');
            $A.test.assertEquals(1,body.length);
            $A.test.assertEquals("markup://aura:text",body[0].getDef().getDescriptor().getQualifiedName());
            $A.test.assertEquals("TextComponent",body[0].get('v.value'));
            $A.test.assertEquals(6,body[0].get('v.truncate'));
            $A.test.assertEquals("Tex...",$A.test.getText(body[0].getElement()));
        }]
    },
    /**
     * Create a component and initialize it with string array type attribute.
     * The definition in this case for the component is not available at the client yet.
     *
     */
    //TODO W-1278791: Will work fine, if the definition already existed at the client.
    _testConfig_ComponentWithComplexAttributes:{
        test:[function(cmp){
            var action = cmp.get('c.createCmpWithComplexAttributes');
            action.run();
            cmp.getEvent("press").fire();

            var body = cmp.get('v.body');
            $A.test.assertEquals("markup://aura:placeholder", body[0].getDef().getDescriptor().getQualifiedName(),
                    "Expected component to be initially represented by a placeholder.");
            this.assertAfterLazyLoading(body[0],"markup://loadLevelTest:displayStringArray",
                    function(){
                        var textCmp = this.extractCmpFromPlaceholder(body[0],"markup://loadLevelTest:displayStringArray");
                        $A.test.assertEquals(['one','two'],textCmp.get('v.StringArray'), "Failed to pass array attribute values to placeholder");
                        $A.test.assertEquals("onetwo",$A.test.getTextByComponent(textCmp), "Failed to pass array attribute values to placeholder");
                    });
        }]
    },
    /**
     * Create a component whose definition is already available at the client,
     * but the component has server dependencies. Make sure, initially a placeholder is put in place, later replaced by actual component.
     * Verify that attributes are passed to the server with the post action.
     * The model for
     */
    testConfig_ComponentWithServerDependecies:{
        test:[function(cmp){
            var action = cmp.get('c.createCmpWithServerDependecies');
            action.run();
            cmp.getEvent("press").fire();

            var body = cmp.get('v.body');
            $A.test.assertEquals("markup://aura:placeholder", body[0].getDef().getDescriptor().getQualifiedName(),
                    "Expected component to be initially represented by a placeholder.");
            this.assertAfterLazyLoading(body[0],"markup://loadLevelTest:serverComponent",
                    function(){
                        var serverCmp = this.extractCmpFromPlaceholder(body[0],"markup://loadLevelTest:serverComponent");

                        $A.test.assertEquals('creatingComponentWithServerDependecies',serverCmp.get("m.string"),
                                "Failed to send attribute with post action, model did not get the attribute required.");
                        $A.test.assertTrue($A.test.getTextByComponent(serverCmp).indexOf('creatingComponentWithServerDependecies')!=-1,
                            "Failed to set model value for local component");
                    });
        }]
    },
    /**
     * Create a component that is abstract, which end up being replaced by an actual implementation.
     */
    testConfig_AbstractComponent:{
        test:[function(cmp){
            var action = cmp.get('c.createAbstractComponent');
            action.run();
            cmp.getEvent("press").fire();

            var body = cmp.get('v.body');
            $A.test.assertEquals("markup://aura:placeholder", body[0].getDef().getDescriptor().getQualifiedName(),
                    "Expected component to be initially represented by a placeholder.");
            this.assertAfterLazyLoading(body[0],"markup://test:test_Provider_AbstractBasicExtends");
        }]
    },
    /**
     * Create a component with a facet that is marked for lazy loading.
     * This is 2 levels of lazy loading, first the component itself is lazy loaded, then the facet inside the component is lazy loaded.
     */
    testConfig_ComponentWithLazyFacet:{
        test:[function(cmp){
            var action = cmp.get('c.createComponentWithLazyFacets');
            action.run();
            cmp.getEvent("press").fire();
            var body = cmp.get('v.body');

            $A.test.assertEquals("markup://aura:placeholder", body[0].getDef().getDescriptor().getQualifiedName(),
                    "Expected component to be initially represented by a placeholder.");
            this.assertAfterLazyLoading(body[0],"markup://loadLevelTest:serverWithLazyChild",
                    function(){
                        var serverCmp = this.extractCmpFromPlaceholder(body[0],"markup://loadLevelTest:serverWithLazyChild");
                        var kid = serverCmp.find("kid");
                        $A.test.assertEquals("placeholder", kid.getDef().getDescriptor().getName());
                        $A.test.addWaitFor(true, $A.test.isActionPending,
                                function(){$A.test.callServerAction(cmp.get("c.resumeAll"), true);});

                        $A.test.addWaitFor("serverComponent", function(){
                            kid = serverCmp.find("kid");
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
        test:[function(cmp){
            aura.test.setTestTimeout(15000)
            var action = cmp.get('c.createComponentExclusively');
            action.run();
            cmp.getEvent("press").fire();

            var body = cmp.get('v.body');
            $A.test.assertEquals("markup://aura:placeholder", body[0].getDef().getDescriptor().getQualifiedName());
            $A.test.assertEquals("markup://loadLevelTest:serverComponent", body[0].get('v.refdescriptor'));
            $A.test.assertEquals("markup://aura:placeholder", body[1].getDef().getDescriptor().getQualifiedName());
            $A.test.assertEquals("markup://loadLevelTest:displayBoolean", body[1].get('v.refdescriptor'));
            $A.test.assertEquals("markup://aura:placeholder", body[2].getDef().getDescriptor().getQualifiedName());
            $A.test.assertEquals("markup://loadLevelTest:displayNumber", body[2].get('v.refdescriptor'));

            this.assertAfterLazyLoading(body[0],"markup://loadLevelTest:serverComponent");
            this.assertAfterLazyLoading(body[1],"markup://loadLevelTest:displayBoolean");
            this.assertAfterLazyLoading(body[2],"markup://loadLevelTest:displayNumber");
        }]
    },
    /**
     * Create a component and verify that actions with the new component work.
     */
    testConfig_VerifyActionsOnNewComponent:{
        test:[function(cmp){
            $A.test.setTestTimeout(50000);
            var action = cmp.get('c.createComponentAndVerifyAction');
            action.run();
            cmp.getEvent("press").fire();

            var body = cmp.get('v.body');
            $A.test.assertEquals("markup://aura:placeholder", body[0].getDef().getDescriptor().getQualifiedName(),
            "Expected component to be initially represented by a placeholder.");
            this.assertAfterLazyLoading(body[0],"markup://loadLevelTest:clientWithLazyClientChild",
                function(){
                    var serverCmp = this.extractCmpFromPlaceholder(body[0],"markup://loadLevelTest:clientWithLazyClientChild");

                    serverCmp.find('makeServer').get('e.press').fire();

                    var innerCmpBody = serverCmp.get('v.body');
                    $A.test.assertEquals("markup://aura:placeholder", innerCmpBody[0].getDef().getDescriptor().getQualifiedName());
                    this.assertAfterLazyLoading(innerCmpBody[0],"markup://loadLevelTest:serverComponent");
                });
        }]
    },
    /**
     * Boundary cases for newComponent API.
     */
    testConfigs:{
        test:[function(cmp){
            aura.test.setTestTimeout(15000);
            //Without descriptor
            var config = {/*componentDef: "markup://loadLevelTest:displayNumber",*/
                                attributes:{values:{number:{descriptor:'number', value:99}}}
                            };
            try{
                $A.componentService.newComponent(config);
                $A.test.fail('Should have failed to create component without a descriptor.');
            }catch(e){
                $A.test.assertEquals("Assertion Failed!: ComponentDef Config required for registration : undefined",e.message);
            }
        },function(cmp){
            aura.test.setTestTimeout(15000);
            //Without fully qualified name
            var config = {componentDef:"loadLevelTest:displayNumber"};
            var newCmp = $A.componentService.newComponent(config);

            $A.test.assertEquals("markup://aura:placeholder",newCmp.getDef().getDescriptor().getQualifiedName());
            cmp.getValue("v.body").push(newCmp);
            cmp.getEvent("press").fire();
            this.assertAfterLazyLoading(newCmp,"markup://loadLevelTest:displayNumber");
        },function(cmp){
            aura.test.setTestTimeout(15000);
            //Without fully qualified name
            var newCmp = $A.componentService.newComponent("loadLevelTest:displayBoolean");

            $A.test.assertEquals("markup://aura:placeholder",newCmp.getDef().getDescriptor().getQualifiedName());
            cmp.getValue("v.body").push(newCmp);
            cmp.getEvent("press").fire();
            this.assertAfterLazyLoading(newCmp,"markup://loadLevelTest:displayBoolean");
        },function(cmp){
            aura.test.setTestTimeout(15000);
            //Literal as descriptor
            try{
                $A.componentService.newComponent('');
                $A.test.fail('Should have failed to create component without a descriptor.');
            }catch(e){
                $A.test.assertTrue(e.message.indexOf("Assertion Failed!: config is required in ComponentService.newComponent(config)")===0);
            }
        },function(cmp){
            aura.test.setTestTimeout(15000);
            //Verify that this format for config is supported
            var config = {componentDef:{descriptor:"markup://aura:text"}};
            var cmp = $A.componentService.newComponent(config);
            $A.test.assertNotNull(cmp);
            $A.test.assertNotNull(cmp.getDef());
        }
        ]
    },
    test_ConfigMissingRequiredAttribute:{
        test:function(cmp){
            var config = {componentDef:"markup://aura:renderIf"};
                try{
                    $A.componentService.newComponent(config);
                    $A.test.fail('Should have failed to create component without a descriptor.');
                }catch(e){
                    $A.test.assertEquals("Missing required attribute aura:renderIf.isTrue",e.message);
                }
        }
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
    }

}
)
