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
     * Verify creation of a component whose definition is available at the client.
     */
    testPreloadedDef: {
        test: function(cmp) {
            try {
                $A.test.blockRequests(); // block server requests to ensure this is run entirely on the client
                $A.run(function(){
                    $A.newCmpAsync(this, function(newCmp){
                    	var body = cmp.get("v.body");
                        body.push(newCmp);
                        cmp.set("v.body", body);
                    }, "markup://aura:text");
                });
                
                var body = cmp.get('v.body');
                $A.test.assertEquals(1, body.length);
                $A.test.assertEquals("markup://aura:text", body[0].getDef().getDescriptor().getQualifiedName());
                $A.test.assertEquals("0:c", body[0].getGlobalId());
            } finally {
                $A.test.releaseRequests();
            }
        }
    },

    /**
     * Verify creation of a component without server dependencies whose definition is declared as a dependency so can
     * be created on the client without a trip to the server.
     */
    testCreateDependencyDef: {
        test: function(cmp) {
            try {
                $A.test.blockRequests(); // block server requests to ensure this is run entirely on the client
                $A.run(function(){
                    $A.newCmpAsync(this, function(newCmp){
                    	var body = cmp.get("v.body");
                        body.push(newCmp);
                        cmp.set("v.body", body);
                    }, "markup://loadLevelTest:clientComponent");
                });

                var body = cmp.get('v.body');
                $A.test.assertEquals(1, body.length);
                $A.test.assertEquals("markup://loadLevelTest:clientComponent", body[0].getDef().getDescriptor().getQualifiedName());
                $A.test.assertEquals("0:c", body[0].getGlobalId());
            } finally {
                $A.test.releaseRequests();
            }
        }
    },

    /**
     * Verify creating a component whose definition is fetched from the server. Then verify the cmp definition is saved
     * on the client so we don't need to make another trip to the server on subsequent requests.
     */
    testFetchNewDefFromServer:{
        test: [
        function(cmp) {

                $A.newCmpAsync(
                        this,
                        function(newCmp) {
                        	var body = cmp.get("v.body");
                            body.push(newCmp);
                            cmp.set("v.body", body);
                        },
                        {
                            componentDef: "markup://loadLevelTest:displayNumber",
						                            attributes : {
							values : {
								number : 99
							}
                            }
                        }
                );

        },
        function(cmp) {
            $A.test.addWaitFor(false, $A.test.isActionPending, function(){
                var textCmp = cmp.get('v.body')[0];
                //Since this is created under root component and this is the first component from the server
                $A.test.assertEquals("1:4;a",textCmp.getGlobalId(), "Expected global id to be 1:4;a");
                $A.test.assertEquals(99,textCmp.get('v.number'), "Failed to pass attribute values to created component");
                $A.test.assertEquals("99",$A.test.getTextByComponent(textCmp), "Failed to pass attribute values to created component");
            });
        },
        function(cmp) {
            // After retrieving the cmp from the server, it should be saved on the client in the def registry
            try {
                $A.test.blockRequests(); // block server requests to ensure this is run entirely on the client
                    $A.newCmpAsync(
                        this,
                        function(newCmp) {
                        	var body = cmp.get("v.body");
                            body.push(newCmp);
                            cmp.set("v.body", body);
                        },
                        {
                            componentDef: "markup://loadLevelTest:displayNumber",
                            attributes: {
                                values: {
                                    number: 100
                                }
                            }
                        }
                    );

            } finally {
                $A.test.releaseRequests();
            }
        },
        function(cmp){
        	 var textCmp = cmp.get('v.body')[1];
             $A.test.assertEquals(100,textCmp.get('v.number'), "Failed to pass attribute values to created component");
             $A.test.assertEquals("100",$A.test.getTextByComponent(textCmp), "Failed to pass attribute values to created component");
        }]
    },

    /**
     * Create a component whose definition is already available at the client, but the component has server
     * dependencies (java model). Verify that attributes are passed to the server with the post action.
     */
    testCreatePreloadedDefWithServerDependencies:{
        test:function(cmp){
            $A.run(function(){
                $A.newCmpAsync(
                        this,
                        function(newCmp) {
                        	var body = cmp.get("v.body");
                            body.push(newCmp);
                            cmp.set("v.body", body);
                        },
                        {
                            componentDef: "markup://loadLevelTest:serverComponent",
                            attributes: {
                                values: {
                                    stringAttribute:'creatingComponentWithServerDependecies'
                                }
                            }
                        }
                );
            });

            $A.test.addWaitFor(false, $A.test.isActionPending, function(){
                var serverCmp = cmp.get('v.body')[0];
                $A.test.assertEquals('creatingComponentWithServerDependecies',serverCmp.get("m.string"),
                        "Failed to send attribute with post action, model did not get the attribute required.");
                $A.test.assertTrue($A.test.getTextByComponent(serverCmp).indexOf('creatingComponentWithServerDependecies')!=-1,
                        "Failed to set model value for local component");
            });
        }
    },

    /**
     * Create a component with multiple levels of server dependencies and verify only one XHR request to the
     * server is made.
     */
    testCreateMultipleLevelServerDef:{
        test:function(cmp){
            var origCount = $A.test.getSentRequestCount();
            $A.run(function(){
                $A.newCmpAsync(
                        this,
                        function(newCmp) {
                        	var body = cmp.get("v.body");
                            body.push(newCmp);
                            cmp.set("v.body", body);
                        },
                        {
                            componentDef: "markup://loadLevelTest:serverWithInnerServerCmp"
                        }
                );
            });

            $A.test.addWaitFor(false, $A.test.isActionPending, function(){
                $A.test.assertEquals("markup://loadLevelTest:serverWithInnerServerCmp",
                        cmp.get('v.body')[0].getDef().getDescriptor().getQualifiedName());
                $A.test.assertEquals(origCount + 1, $A.test.getSentRequestCount(),
                        "Only a single XHR to the server should have been sent.");
            });
        }
    },

    /**
     * Verify creating a component that's available on the client, but has an inner comopnent with server-side
     * dependencies (in this case, a model).
     * TODO: W-2365060
     */
    _testPreloadedDefWithNonPreloadedInnerCmp : {
        test : function(cmp) {
            $A.run(function() {
                $A.newCmpAsync(
                    this,
                    function(newCmp) {
                    	var body = cmp.get("v.body");
                        body.push(newCmp);
                        cmp.set("v.body", body);
                    },
                    "markup://loadLevelTest:clientWithServerChild"
                );
            });

            $A.test.addWaitFor(false, $A.test.isActionPending, function() {
                var body = cmp.get('v.body');
                $A.test.assertEquals(1,body.length);
                $A.test.assertEquals("markup://loadLevelTest:clientWithServerChild",
                        body[0].getDef().getDescriptor().getQualifiedName());
                var cmpText = $A.test.getTextByComponent(body[0]);
                $A.test.assertTrue($A.test.contains(cmpText, "set by clientWithServerChild"),
                        "Model data not present on inner component.");
            });
        }
    },

    /**
     * Verify creation of an array of components returns components in the same order. The framework should be able to
     * handle a mixture of components available on the client and server-dependent component defs.
     */
    _testCreateArrayOfComponents:{
        test: function(cmp){
            $A.run(function(){
                $A.newCmpAsync(
                        this,
                        function(newCmps) {
                            $A.test.assertTrue($A.util.isArray(newCmps) && newCmps.length === 4,
                                'Should be array of components of length 4');
                            var body = cmp.get("v.body");
                            body = body.concat(newCmps);
                            cmp.set("v.body", body);
                        },
                        [{
                            componentDef: "markup://aura:text",
                            attributes:{
                                values:{
                                    value:"TextComponent"
                                }
                            }
                        },
                        // Component not available on the client, must go to server
                        {
                            componentDef: "markup://loadLevelTest:displayNumber",
                            attributes: {
                                values: {
                                    number: 99
                                }
                            }
                        },
                        {
                            componentDef: "markup://aura:text",
                            attributes:{
                                values:{
                                    value:"TextComponent2"
                                }
                            }
                        },
                        // Component not available on the client, must go to server
                        {
                            componentDef: "markup://loadLevelTest:displayNumber",
                            attributes: {
                                values: {
                                    number: 100
                                }
                            }
                        }]
                );
            });

            $A.test.addWaitFor(false, $A.test.isActionPending, function(){
                var body = cmp.get('v.body');
                $A.test.assertEquals(4,body.length);
                $A.test.assertEquals("markup://aura:text", body[0].getDef().getDescriptor().getQualifiedName());
                $A.test.assertEquals("TextComponent",$A.test.getTextByComponent(body[0]));
                $A.test.assertEquals("markup://loadLevelTest:displayNumber", body[1].getDef().getDescriptor().getQualifiedName());
                $A.test.assertEquals("99",$A.test.getTextByComponent(body[1]));
                $A.test.assertEquals("markup://aura:text", body[2].getDef().getDescriptor().getQualifiedName());
                $A.test.assertEquals("TextComponent2",$A.test.getTextByComponent(body[2]));
                $A.test.assertEquals("markup://loadLevelTest:displayNumber", body[3].getDef().getDescriptor().getQualifiedName());
                $A.test.assertEquals("100",$A.test.getTextByComponent(body[3]));
            });
        }
    },

    /**
     * Test to verify creating an invalid component returns proper error.
     * test:test_Preload_BadCmp has two attributes with the same name.
     */
    testCreateBadServerComponent:{
        test: function(cmp){
            $A.run(function(){
                $A.newCmpAsync(
                        this,
                        function(newCmp) {
                        	var body = cmp.get("v.body");
                            body.push(newCmp);
                            cmp.set("v.body", body);
                        },
                        "test:test_Preload_BadCmp"
                );
            });

            $A.test.addWaitFor(false, $A.test.isActionPending, function(){
                var errorCmp = cmp.get('v.body')[0];
                var errorMsg = errorCmp.get("v.value");
                $A.test.assertTrue($A.test.contains(errorMsg, 'Duplicate definitions for attribute dup on tag aura:attribute'),
                        "Incorrect error message returned in error component when trying to create invalid component");
            });
        }
    },

    /**
     * Test to verify trying to create a non-existent component returns proper error.
     */
    testCreateNonExistingComponent:{
        test: function(cmp){
            $A.run(function(){
                $A.newCmpAsync(
                        this,
                        function(newCmp) {
                        	var body = cmp.get("v.body");
                            body.push(newCmp);
                            cmp.set("v.body", body);
                        },
                        "foo:hallelujah"
                );
            });

            $A.test.addWaitFor(false, $A.test.isActionPending, function(){
                var errorCmp = cmp.get('v.body')[0];
                var errorMsg = errorCmp.get("v.value");
                $A.test.assertTrue($A.test.contains(errorMsg, 'No COMPONENT named markup://foo:hallelujah found'),
                        "Incorrect error message returned in error component when trying to create invalid component");
            });
        }
    },

    /**
     * Create a component and initialize it with simple attributes.
     * This componentDef is available at the client registry.
     */
    testCreateComponentWithSimpleAttributes:{
        test: [function(cmp){
                $A.newCmpAsync(
                        this,
                        function(newCmp) {
                        	var body = cmp.get("v.body");
                            body.push(newCmp);
                            cmp.set("v.body", body);
                        },
                        {
                            componentDef: "markup://aura:text",
                            attributes: {
                                values: {
                                    truncate: 6,
                                    value: "TextComponent"
                                }
                            }
                        }
                );
        }, function(cmp){

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
    testCreateComponentWithComplexAttributes:{
        test: function(cmp){
            $A.run(function(){
                $A.newCmpAsync(
                        this,
                        function(newCmp) {
                        	var body = cmp.get("v.body");
                            body.push(newCmp);
                            cmp.set("v.body", body);
                        },
                        {
                            componentDef: "markup://loadLevelTest:displayStringArray",
                            attributes:{
                                values:{
                                    StringArray:['one','two']
                                }
                            }
                        }
                );
            });

            $A.test.addWaitFor(false, $A.test.isActionPending, function(){
                var textCmp = cmp.get('v.body')[0];
                $A.test.assertEquals("one,two", textCmp.get('v.StringArray').toString(), "Failed to pass array attribute values to placeholder");
                $A.test.assertEquals('onetwo',$A.test.getTextByComponent(textCmp), "Failed to pass array attribute values to placeholder");
            });
        }
    },

    /**
     * Create a component that is abstract, which end up being replaced by an actual implementation.
     */
    testCreateAbstractComponent: {
        test: function(cmp){
            $A.run(function(){
                $A.newCmpAsync(
                    this,
                    function(newCmp) {
                    	var body = cmp.get("v.body");
                        body.push(newCmp);
                        cmp.set("v.body", body);
                    },
                    "test:test_Provider_AbstractBasic"
                );
            });

            $A.test.addWaitFor(false, $A.test.isActionPending, function(){
                var newCmp = cmp.get('v.body')[0];
                var cmpImplName = newCmp.getDef().getDescriptor().getQualifiedName();
                $A.test.assertEquals("markup://test:test_Provider_AbstractBasicExtends", cmpImplName,
                        "Abstract component replaced with incorrect implementation on creation");
            });
        }
    },

    testCreateCmpNoDescriptor: {
        test:function(cmp){
            aura.test.setTestTimeout(15000);
            var config = {/*componentDef: "markup://loadLevelTest:displayNumber",*/
                                attributes:{values:{number:{descriptor:'number', value:99}}}
                            };
            try{
                $A.newCmpAsync(this, function(){},config);
                $A.test.fail('Should have failed to create component without a descriptor.');
            }catch(e){
                $A.test.assertEquals("ComponentDef Config required for registration",e.message);
            }
        }
    },

    testNotFullyQualifiedNameInConfig: {
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
            $A.test.addWaitFor(false, $A.test.isActionPending, function(){
                $A.test.assertEquals("markup://loadLevelTest:displayNumber", cmpName,
                        "Failed to create component without fully qualified name in config's componenetDef field");
            });
        }
    },

    testStringConfigAsNotFullyQualifiedName: {
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
            $A.test.addWaitFor(false, $A.test.isActionPending, function(){
                $A.test.assertEquals("markup://loadLevelTest:displayNumber", cmpName,
                        "Failed to create component without fully qualified name as config");
            });
        }
    },

    testNoConfig: {
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

    testAlternateConfigFormat: {
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
            $A.test.addWaitFor(false, $A.test.isActionPending, function(){
                $A.test.assertEquals("markup://loadLevelTest:displayNumber", cmpName,
                        "Alternative config format did not create proper component");
            });
        }
    },

    // TODO: W-2406307: remaining Halo test failure
    _testMissingRequiredAttribute:{
        test:function(cmp){
            try{
                $A.newCmpAsync(this, function(){}, "markup://aura:renderIf");
                $A.test.fail('Should have failed to create component without a descriptor.');
            }catch(e){
                $A.test.assertEquals("Missing required attribute isTrue",e.message);
            }
        }
    },

    /**
     * Passing null in for the callback scope should use the global context, and work as expected in this case.
     */
    testNullCallbackScope: {
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
                        	var body = cmp.get("v.body");
                            body.push(newCmp);
                            cmp.set("v.body", body);
                        },
                        config
                );
            });

            $A.test.addWaitFor(false, $A.test.isActionPending, function(){
                var textCmp = cmp.get('v.body')[0];
                //Since this is created under root component and this is the first component from the server
                $A.test.assertEquals("1:4;a",textCmp.getGlobalId(), "Expected global id to be 1:4;a");
                $A.test.assertEquals(99,textCmp.get('v.number'), "Failed to pass attribute values to created component");
                $A.test.assertEquals("99",$A.test.getTextByComponent(textCmp), "Failed to pass attribute values to created component");
            });
        }
    },

    testSetLocalId:{
        test: [function(cmp){
                $A.newCmpAsync(
                        this,
                        function(newCmp){
                        	var body = cmp.get("v.body");
                            body.push(newCmp);
                            cmp.set("v.body", body);
                        },
                        {
                            componentDef: "markup://aura:text",
                            localId: "userLocalId",
                            attributes: {
                                values: {
                                    truncate: 6,
                                    value:"TextComponent"
                                }
                            }
                        }
                );
        }, function(cmp){

            var body = cmp.get('v.body');
            $A.test.assertEquals(1,body.length);
            var newCmp = body[0].find("userLocalId");
            $A.test.assertEquals("markup://aura:text",newCmp.getDef().getDescriptor().getQualifiedName());
            $A.test.assertEquals("TextComponent",newCmp.get('v.value'));
            $A.test.assertEquals(6,newCmp.get('v.truncate'));
            $A.test.assertEquals("Tex...",$A.test.getText(newCmp.getElement()));
        }]
    },

    testSetLocalIdServerDependencies:{
        test: function(cmp){
            $A.run(function(){
                $A.newCmpAsync(
                        this,
                        function(newCmp){
                        	var body = cmp.get("v.body");
                            body.push(newCmp);
                            cmp.set("v.body", body);
                        },
                        {
                            componentDef: "markup://loadLevelTest:serverComponent",
                            localId: "userLocalId",
                            attributes: {
                                values: {
                                    stringAttribute:'creatingComponentWithServerDependecies'
                                }
                            }
                        }
                );
            });

            $A.test.addWaitFor(false, $A.test.isActionPending, function(){
                var body = cmp.get('v.body');
                $A.test.assertEquals(1,body.length);
                var newCmp = body[0].find("userLocalId");
                $A.test.assertDefined(newCmp);
                $A.test.assertEquals("markup://loadLevelTest:serverComponent",newCmp.getDef().getDescriptor().getQualifiedName());
                $A.test.assertTrue($A.test.getTextByComponent(newCmp).indexOf('creatingComponentWithServerDependecies')!=-1,
                        "Failed to set model value for local component.");
            });
        }
    },

    /**
     * Create a component with a provider which provides a component that contains an inner component with server
     * dependencies. Verify error message stating that it cannot provide a component with server deps
     * TODO: W-2365060
     */
    _testCreateComponentNotOnClientWithClientProvider: {
        test: function(cmp) {
            try {
                $A.newCmpAsync(
                    this,
                    function () {
                    },
                    "markup://loadLevelTest:clientProvidesServerCmp"
                );
                $A.test.fail('Should have failed to create component with client provided server dependent component.');
            } catch(e) {
                $A.test.assertTrue(e.message.indexOf("Client provided component cannot have server dependencies") != -1,
                    "Incorrect error message when creating client provided server dependent component");
            }
        }
    },

    /**
     * test creating a component having model, client and server provider
     */
    testCreationOfKitchenSink:{
        test: function(cmp){
            $A.run(function(){
                $A.newCmpAsync(
                    this,
                    function(newCmp){
                        var body = cmp.get("v.body");
                        body.push(newCmp);
                        cmp.set("v.body", body);
                    },
                    "markup://test:kitchenSink"
                );
            });

            $A.test.addWaitFor(false, $A.test.isActionPending, function() {
                var newCmp = cmp.get('v.body')[0];
                var cmpName = newCmp.getDef().getDescriptor().getQualifiedName();
                $A.test.assertEquals("markup://test:kitchenSink", cmpName, "Component couldn't be created");
            });
        }
    },

    /**
     * Create a component with a facet that is marked for lazy loading.
     * This is 2 levels of lazy loading, first the component itself is lazy loaded, then the facet inside the component is lazy loaded.
     */
    testCreateComponentWithLazyFacet:{
        test:[function(cmp){
            var helper = cmp.getDef().getHelper();
            $A.run(function(){
                $A.newCmpAsync(
                        this,
                        function(newCmp) {
                        	var body = cmp.get("v.body");
                            body.push(newCmp);
                            cmp.set("v.body", body);
                        },
                        "loadLevelTest:serverWithLazyChild"
                );
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
    testCreateComponentExclusively:{
        test:function(cmp){
            aura.test.setTestTimeout(15000)
            $A.run(function(){
                $A.newCmpAsync(
                        this,
                        function(newCmp) {
                        	var body = cmp.get("v.body");
                            body.push(newCmp);
                            cmp.set("v.body", body);
                        },
                        {componentDef : "markup://loadLevelTest:serverComponent", load : "EXCLUSIVE"}
                );
                $A.newCmpAsync(
                        this,
                        function(newCmp) {
                        	var body = cmp.get("v.body");
                            body.push(newCmp);
                            cmp.set("v.body", body);
                        },
                        {componentDef: "markup://loadLevelTest:displayBoolean", load:"LAZY"}
                );
                $A.newCmpAsync(
                        this,
                        function(newCmp) {
                        	var body = cmp.get("v.body");
                            body.push(newCmp);
                            cmp.set("v.body", body);
                        },
                        {componentDef: "markup://loadLevelTest:displayNumber", load:"LAZY"}
                );
            });

            $A.test.addWaitFor(false, $A.test.isActionPending, function(){
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
    testVerifyActionsOnNewComponent:{
        test: function(cmp){
            $A.test.setTestTimeout(50000);
            $A.run(function(){
                $A.newCmpAsync(
                        this,
                        function(newCmp) {
                        	var body = cmp.get("v.body");
                            body.push(newCmp);
                            cmp.set("v.body", body);
                        },
                        {componentDef : "markup://loadLevelTest:clientWithLazyClientChild"}
                );
            });

            $A.test.addWaitFor(false, $A.test.isActionPending, function(){
                var serverCmp = cmp.get('v.body')[0];
                serverCmp.find('makeServer').get('e.press').fire();
                $A.test.addWaitFor(false, $A.test.isActionPending, function(){
                    var innerCmpBody = serverCmp.get('v.body');
                    $A.test.assertEquals("markup://loadLevelTest:serverComponent", innerCmpBody[0].getDef().getDescriptor().getQualifiedName(),
                            "Could not create comopnent from action of newly created component");
                });
            });
        }
    },

    /**
     * Create the same component multiple times using the same source of data for the created components attributes
     * and verify the destruction of the initial components does not affect future components. In other words,
     * verify attribute data is properly cloned when created new components.
     */
    testCreateSameComponentMultipleTimes: {
        test: [function(cmp) {
            this.createClientCmp(cmp);
            $A.test.assertEquals("Doug", cmp.get("v.body")[0].get("v.first"), "First component creation failure.");
            $A.test.assertEquals("Funny", cmp.get("v.body")[0].get("v.last"), "First component creation failure.");
        },
        function(cmp) {
            var oldBody = cmp.get("v.body");
            this.createClientCmp(cmp);
            $A.test.addWaitFor(false, oldBody[0].isValid);
        },
        function(cmp) {
            $A.test.assertEquals("Doug", cmp.get("v.body")[0].get("v.first"), "Second component creation failure.");
            $A.test.assertEquals("Funny", cmp.get("v.body")[0].get("v.last"), "Second component creation failure.");
        },
        function(cmp) {
            var oldBody = cmp.get("v.body");
            this.createClientCmp(cmp);
            $A.test.addWaitFor(false, oldBody[0].isValid);
        },
        function(cmp) {
            $A.test.assertEquals("Doug", cmp.get("v.body")[0].get("v.first"), "Third component creation failure.");
            $A.test.assertEquals("Funny", cmp.get("v.body")[0].get("v.last"), "Third component creation failure.");
        }]
    },

    createClientCmp: function(cmp) {
        $A.run(function(){
            $A.newCmpAsync(
                    this,
                    function(newCmp) {
                        cmp.set("v.body", newCmp);
                    },
                    {
                        componentDef : "markup://loadLevelTest:clientComponent",
                        attributes: {
                            values: {
                                first: cmp.get("v.arrayOfMaps")[0].first,
                                last: cmp.get("v.arrayOfMaps")[0].last,
                                arrayOfMaps: cmp.get("v.arrayOfMaps")
                            }
                        }
                    }
            );
        });
    }
})
