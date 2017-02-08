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
     * Verify creation of a component whose definition is available at the client.
     */
    testPreloadedDef: {
        test: function(cmp) {
            var actionComplete = false;
            // block server requests to ensure this is run entirely on the client
            $A.test.blockRequests();
            $A.test.addCleanup(function(){ $A.test.releaseRequests(); });
            $A.createComponent("aura:text", null, function(newCmp, status){
                $A.test.assertEquals("SUCCESS", status);
                var body = cmp.get("v.body");
                body.push(newCmp);
                cmp.set("v.body", body);
                actionComplete = true;
            });

            $A.test.addWaitFor(true, function(){ return actionComplete; }, function(){
                var body = cmp.get('v.body');
                $A.test.assertEquals(1, body.length);
                $A.test.assertEquals("markup://aura:text", body[0].getDef().getDescriptor().getQualifiedName());
            });
        }
    },

    /**
     * Verify creation of a component without server dependencies whose definition is declared as a dependency so can
     * be created on the client without a trip to the server.
     */
    testCreateDependencyDef: {
        test: function(cmp) {
            var actionComplete = false;
             // block server requests to ensure this is run entirely on the client
            $A.test.blockRequests();
            $A.test.addCleanup(function(){ $A.test.releaseRequests(); });

            $A.createComponent("loadLevelTest:clientComponent", null, function(newCmp){
                var body = cmp.get("v.body");
                body.push(newCmp);
                cmp.set("v.body", body);
                actionComplete = true;
            });

            $A.test.addWaitFor(true, function(){ return actionComplete; }, function(){
                var body = cmp.get('v.body');
                $A.test.assertEquals(1, body.length);
                $A.test.assertEquals("markup://loadLevelTest:clientComponent", body[0].getDef().getDescriptor().getQualifiedName());
            });
        }
    },

    /**
     * Verify creating a component whose definition is fetched from the server. Then verify the cmp definition is saved
     * on the client so we don't need to make another trip to the server on subsequent requests.
     */
    testFetchNewDefFromServer:{
        test: [
        function(cmp) {
            var actionComplete = false;
            $A.createComponent("loadLevelTest:displayNumber", { number : 99 }, function(newCmp){
                var body = cmp.get("v.body");
                body.push(newCmp);
                cmp.set("v.body", body);
                actionComplete = true;
            });

            $A.test.addWaitFor(true, function(){ return actionComplete; }, function(){
                var textCmp = cmp.get('v.body')[0];
                //Since this is created under root component and this is the first component from the server
                $A.test.assertEquals("1:2;a", textCmp.getGlobalId(), "Expected global id to be 1:2;a");
                $A.test.assertEquals(99, textCmp.get('v.number'), "Failed to pass attribute values to created component");
                $A.test.assertEquals("99", $A.test.getTextByComponent(textCmp), "Failed to pass attribute values to created component");
            });
        },
        function(cmp) {
            var actionComplete = false;
            // After retrieving the cmp from the server, it should be saved on the client in the def registry
            $A.test.blockRequests(); // block server requests to ensure this is run entirely on the client
            $A.test.addCleanup(function(){ $A.test.releaseRequests(); });
            $A.createComponent("loadLevelTest:displayNumber", { number : 100 }, function(newCmp){
                var body = cmp.get("v.body");
                body.push(newCmp);
                cmp.set("v.body", body);
                actionComplete = true;
            });

            $A.test.addWaitFor(true, function(){ return actionComplete; });
        },
        function(cmp){
        	 var textCmp = cmp.get('v.body')[1];
             $A.test.assertEquals(100, textCmp.get('v.number'), "Failed to pass attribute values to created component");
             $A.test.assertEquals("100", $A.test.getTextByComponent(textCmp), "Failed to pass attribute values to created component");
        }]
    },

    /**
     * Create a component whose definition is already available at the client, but the component has server
     * dependencies (java model). Verify that attributes are passed to the server with the post action.
     */
    testCreatePreloadedDefWithServerDependencies:{
        test:function(cmp){
            var actionComplete = false;
            $A.createComponent("loadLevelTest:serverComponent", { stringAttribute:"creatingComponentWithServerDependecies" }, function(newCmp){
                var body = cmp.get("v.body");
                body.push(newCmp);
                cmp.set("v.body", body);
                actionComplete = true;
            });

            $A.test.addWaitFor(true, function(){ return actionComplete; }, function(){
                var serverCmp = cmp.get('v.body')[0];
                $A.test.assertEquals('creatingComponentWithServerDependecies', serverCmp.get("m.string"),
                        "Failed to send attribute with post action, model did not get the attribute required.");
                $A.test.assertTrue($A.test.getTextByComponent(serverCmp).indexOf('creatingComponentWithServerDependecies')!==-1,
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
            var actionComplete = false;
            $A.createComponent("loadLevelTest:serverWithInnerServerCmp", null, function(newCmp){
                var body = cmp.get("v.body");
                body.push(newCmp);
                cmp.set("v.body", body);
                actionComplete = true;
            });

            $A.test.addWaitFor(true, function(){ return actionComplete; }, function(){
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
    testPreloadedDefWithNonPreloadedInnerCmp : {
        test : function(cmp) {
            var actionComplete = false;
            $A.createComponent("loadLevelTest:clientWithServerChild", null, function(newCmp){
                var body = cmp.get("v.body");
                body.push(newCmp);
                cmp.set("v.body", body);
                actionComplete = true;
            });

            $A.test.addWaitFor(true, function(){ return actionComplete; }, function() {
                var body = cmp.get('v.body');
                $A.test.assertEquals(1, body.length);
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
    testCreateArrayOfComponents:{
        test: function(cmp){
            var actionComplete = false;
            $A.createComponents([
                    ["aura:text", { value:"TextComponent" }],
                    // Component not available on the client, must go to server
                    ["loadLevelTest:displayNumber", { number:99 }],
                    ["aura:text", { value:"TextComponent2" }],
                    // Component not available on the client, must go to server
                    ["loadLevelTest:displayNumber", { number:100 }]
                ], function(newCmps, status) {
                    $A.test.assertTrue($A.util.isArray(newCmps) && newCmps.length === 4,
                        'Should be array of components of length 4');
                    var body = cmp.get("v.body");
                    body = body.concat(newCmps);
                    cmp.set("v.body", body);
                    $A.test.assertEquals("SUCCESS", status);
                    actionComplete = true;
                }
            );

            $A.test.addWaitFor(true, function(){ return actionComplete; }, function(){
                var body = cmp.get('v.body');
                $A.test.assertEquals(4, body.length);
                $A.test.assertEquals("markup://aura:text", body[0].getDef().getDescriptor().getQualifiedName());
                $A.test.assertEquals("TextComponent", $A.test.getTextByComponent(body[0]));
                $A.test.assertEquals("markup://loadLevelTest:displayNumber", body[1].getDef().getDescriptor().getQualifiedName());
                $A.test.assertEquals("99", $A.test.getTextByComponent(body[1]));
                $A.test.assertEquals("markup://aura:text", body[2].getDef().getDescriptor().getQualifiedName());
                $A.test.assertEquals("TextComponent2", $A.test.getTextByComponent(body[2]));
                $A.test.assertEquals("markup://loadLevelTest:displayNumber", body[3].getDef().getDescriptor().getQualifiedName());
                $A.test.assertEquals("100", $A.test.getTextByComponent(body[3]));
            });
        }
    },

    testPassesERRORIfOneComponentErrorsWhenCreatingMultipleComponents: {
        test: function(cmp) {
            var expected="ERROR";
            var expectedList="SUCCESS,SUCCESS,ERROR,SUCCESS,";
            var actual;
            var actualList;
            var actionComplete = false;

            $A.createComponents([
                [ "aura:text", { value:"TextComponent1" } ],
                [ "aura:text", { value:"TextComponent2" } ],
                [ "bogus:bogus", {} ],
                [ "aura:text", { value:"TextComponent3" } ]
            ], function(newCmps, overallStatus, statusList) {
                actual = overallStatus;
                actualList="";
                statusList.forEach(function(item){
                    actualList += item.status + ",";
                });
                actionComplete = true;
            });

            $A.test.addWaitFor(true, function(){ return actionComplete; }, function() {
                $A.test.assertEquals(expected, actual);
                $A.test.assertEquals(expectedList, actualList);
            });
        }
    },

    testPassesINCOMPLETEIfOneComponentTimesoutWhenCreatingMultipleComponents: {
        // TODO(W-2537764): IE < 10 gives Access Denied error when trying to send XHRs after setServerReachable(false)
        browsers: ["-IE7", "-IE8", "-IE9"],
        test: function(cmp) {
            var expected="INCOMPLETE";
            var expectedList="SUCCESS,SUCCESS,INCOMPLETE,";
            var actual;
            var actualList;
            var actionComplete = false;
            $A.test.setServerReachable(false);

            $A.createComponents([
                [ "aura:text", { value:"TextComponent1" } ],
                [ "aura:text", { value:"TextComponent2" } ],
                [ "ui:button", { label:"ButtonLabel" } ]
            ], function(newCmps, status, statusList) {
                actual = status;
                actualList="";
                statusList.forEach(function(item){
                    actualList += item.status + ",";
                });
                $A.test.setServerReachable(true);
                actionComplete = true;
            });

            $A.test.addWaitFor(true, function(){ return actionComplete; }, function() {
                $A.test.assertEquals(expected, actual);
                $A.test.assertEquals(expectedList, actualList);
            });
        }
    },

    /**
     * Test to verify creating an invalid component returns proper error.
     * test:test_Preload_BadCmp has two attributes with the same name.
     */
    testCreateBadServerComponent:{
        test: function(cmp){
            var actionComplete = false;
            $A.createComponent("test:test_Preload_BadCmp", null, function(newCmp, status, statusDetail) {
                $A.test.assertNull(newCmp, "No component expected on error");
                $A.test.assertEquals("ERROR", status, "Wrong status");
                $A.test.assertTrue($A.test.contains(statusDetail, "There is already an attribute named 'dup' on component 'test:test_Preload_BadCmp'."),
                        "Incorrect error message returned in error component when trying to create invalid component");
                actionComplete = true;
            });

            $A.test.addWaitFor(true, function(){ return actionComplete; }, function(){});
        }
    },

    /**
     * Create a component that is abstract, which end up being replaced by an actual implementation.
     */
    testCreateAbstractComponent: {
        test: function(cmp){
            var actionComplete = false;
            $A.createComponent("test:test_Provider_AbstractBasic", null, function(newCmp) {
            	var body = cmp.get("v.body");
                body.push(newCmp);
                cmp.set("v.body", body);
                actionComplete = true;
            });

            $A.test.addWaitFor(true, function(){ return actionComplete; }, function(){
                var newCmp = cmp.get('v.body')[0];
                var cmpImplName = newCmp.getDef().getDescriptor().getQualifiedName();
                $A.test.assertEquals("markup://test:test_Provider_AbstractBasicExtends", cmpImplName,
                        "Abstract component replaced with incorrect implementation on creation");
            });
        }
    },

    /**
     * test creating a component having model, client and server provider
     */
    testCreationOfKitchenSink:{
        test: function(cmp){
            var actionComplete = false;
            $A.createComponent("test:kitchenSink", null, function(newCmp){
                var body = cmp.get("v.body");
                body.push(newCmp);
                cmp.set("v.body", body);
                actionComplete = true;
            });

            $A.test.addWaitFor(true, function(){ return actionComplete; }, function() {
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
            $A.createComponent("loadLevelTest:serverWithLazyChild", null, function(newCmp) {
            	var body = cmp.get("v.body");
                body.push(newCmp);
                cmp.set("v.body", body);
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
            $A.test.addWaitFor(false, function(){return oldBody[0].isValid();});
        },
        function(cmp) {
            $A.test.assertEquals("Doug", cmp.get("v.body")[0].get("v.first"), "Second component creation failure.");
            $A.test.assertEquals("Funny", cmp.get("v.body")[0].get("v.last"), "Second component creation failure.");
        },
        function(cmp) {
            var oldBody = cmp.get("v.body");
            this.createClientCmp(cmp);
            $A.test.addWaitFor(false, function(){return oldBody[0].isValid();});
        },
        function(cmp) {
            $A.test.assertEquals("Doug", cmp.get("v.body")[0].get("v.first"), "Third component creation failure.");
            $A.test.assertEquals("Funny", cmp.get("v.body")[0].get("v.last"), "Third component creation failure.");
        }]
    },

    createClientCmp: function(cmp) {
        $A.createComponent(
            "loadLevelTest:clientComponent",
            {
                first: cmp.get("v.arrayOfMaps")[0].first,
                last: cmp.get("v.arrayOfMaps")[0].last,
                arrayOfMaps: cmp.get("v.arrayOfMaps")
            },
            function(newCmp) {
                cmp.set("v.body", newCmp);
            }
        );
    }
})
