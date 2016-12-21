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
//testCustomNS1.getDefinition$testGetMultipleDefinitionsAllFromClient(org.auraframework.integration.test.ComponentJSUITest$ComponentTestCase): class java.lang.AssertionError: Uncaught Uncaught error in $A.run() [Access Check Failed! ComponentService.getDef():'markup://aura:label' is not visible to 'markup://testCustomNS1:getDefinition {1:0} body = "[object Object]", definitionNames = "", complete = "false"'.](..)
//testCustomNS1.getDefinition$testGetMultipleEventDefinitions(org.auraframework.integration.test.ComponentJSUITest$ComponentTestCase): class java.lang.AssertionError: Uncaught Uncaught error in $A.run() [Access Check Failed! EventService.getEventDef():'markup://aura:titleChange' is not visible to 'markup://testCustomNS1:getDefinition {1:0} body = "[object Object]", definitionNames = "", complete = "false"'.](..)
//testCustomNS1.getDefinition$testGetMultipleComponentAndEventDefinitions(org.auraframework.integration.test.ComponentJSUITest$ComponentTestCase): class java.lang.AssertionError: Uncaught Error in $A.getCallback() [Access Check Failed! EventService.getEventDef():'markup://clientApiTest:getDefinitionTestEvent' is not visible to 'markup://testCustomNS1:getDefinition {1:0} body = "[object Object]", definitionNames = "", complete = "false"'.](..)
//testCustomNS1.getDefinition$testOnlyCallsCallbackOnceWhenGettingMutipleDefinitions(org.auraframework.integration.test.ComponentJSUITest$ComponentTestCase): class java.lang.AssertionError: Uncaught Error in $A.getCallback() [Access Check Failed! EventService.getEventDef():'markup://clientApiTest:getDefinitionTestEvent' is not visible to 'markup://testCustomNS1:getDefinition {1:0} body = "[object Object]", definitionNames = "", complete = "false"'.](..)
    testGetDefinitionReturnsUndefined:{
        test:function(){
            var actual = $A.getDefinition("aura:text", function(definition){});
            $A.test.assertUndefined(actual);
        }
    },

    testGetComponentDefinitionWithShortDescriptor:{
        test: function(){
            var descriptor = "aura:text";
            var expected = "markup://aura:text";

            $A.getDefinition(descriptor, function(definition) {
                $A.test.assertNotUndefinedOrNull(definition, "Definition should be an object.");
                $A.test.assertAuraType("ComponentDef", definition,
                        "Definition should be a instance of ComponentDef, but actual is " +
                        definition.constructor.name);
                $A.test.assertEquals(expected, definition.getDescriptor().getQualifiedName());
            });
        }
    },

    testGetComponentDefinitionWithFullDescriptor:{
        test: function(){
            var expected = "markup://aura:text";

            $A.getDefinition(expected, function(definition) {
                $A.test.assertNotUndefinedOrNull(definition, "Definition should be an object.");
                $A.test.assertAuraType("ComponentDef", definition,
                        "Definition should be a instance of ComponentDef, but actual is " +
                        definition.constructor.name);
                $A.test.assertEquals(expected, definition.getDescriptor().getQualifiedName());
            });
        }
    },

    testGetComponentDefinitionFromServer:{
        test: function(){
            var expected = "markup://ui:button";
            var actionComplete = false;

            $A.getDefinition(expected, function(definition) {
                $A.test.assertNotUndefinedOrNull(definition, "Definition should be an object.");
                $A.test.assertAuraType("ComponentDef", definition,
                        "Definition should be a instance of ComponentDef, but actual is " +
                        definition.constructor.name);
                $A.test.assertEquals(expected, definition.getDescriptor().getQualifiedName());
                actionComplete = true;
            });

            $A.test.addWaitFor(true, function(){ return actionComplete; });
        }
    },

    testDefinitionIsNullForUnkownComponent:{
        test: function(){
            var actionComplete = false;

            $A.getDefinition("unknown:unknown", function(definition) {
                $A.test.assertNull(definition);
                actionComplete = true;
            });

            $A.test.addWaitFor(true, function(){ return actionComplete; });
        }
    },

    testGetEventDefinitionWithShortDescriptor:{
        test: function(){
            var descriptor = "e.aura:valueChange";
            var expected = "markup://aura:valueChange";

            $A.getDefinition(descriptor, function(definition) {
                $A.test.assertNotUndefinedOrNull(definition, "Definition should be an object.");
                $A.test.assertAuraType("EventDef", definition,
                        "Definition should be a instance of EventDef, but actual is " +
                        definition.constructor.name);
                $A.test.assertEquals(expected, definition.getDescriptor().getQualifiedName());
            });
        }
    },

    testGetEventDefinitionWithFullDescriptor:{
        test: function(){
            var descriptor = "markup://e.aura:valueChange";
            var expected = "markup://aura:valueChange";
            $A.getDefinition(descriptor, function(definition) {
                $A.test.assertNotUndefinedOrNull(definition, "Definition should be an object.");
                $A.test.assertAuraType("EventDef", definition,
                        "Definition should be a instance of EventDef, but actual is " +
                        definition.constructor.name);
                $A.test.assertEquals(expected, definition.getDescriptor().getQualifiedName());
            });
        }
    },

    // This event is inaccessible here.
    _testGetEventDefinitionFromServer:{
        test: function(){
            var descriptor = "e.clientApiTest:getDefinitionTestEvent";
            var expected = "markup://clientApiTest:getDefinitionTestEvent";
            var actionComplete = false;

            $A.getDefinition(descriptor, function(definition) {
                $A.test.assertNotUndefinedOrNull(definition, "Definition should be an object.");
                $A.test.assertAuraType("EventDef", definition,
                        "Definition should be a instance of EventDef, but actual is " +
                        definition.constructor.name);
                $A.test.assertEquals(expected, definition.getDescriptor().getQualifiedName());
                actionComplete = true;
            });

            $A.test.addWaitFor(true, function(){ return actionComplete; });
        }
    },

    testDefinitionIsNullForUnkownEvent: {
        test: function(){
            var actionComplete = false;

            $A.getDefinition("e.unknown:unknown", function(definition) {
                $A.test.assertNull(definition);
                actionComplete = true;
            });

            $A.test.addWaitFor(true, function(){ return actionComplete; });
        }
    },
   
    testGetDefinitionForApplicationEventWithoutAccess: {
    	 test: function(){
    	 	$A.test.expectAuraError("Access Check Failed! EventService.getEventDef():'markup://testCustomNS2:applicationEventWithDefaultAccess' is not visible to 'markup://testCustomNS1:getDefinition");
            var actionComplete = false;

            $A.getDefinition("e.testCustomNS2:applicationEventWithDefaultAccess", function(definition) {
                $A.test.assertNull(definition);
                actionComplete = true;
            });

            $A.test.addWaitFor(true, function(){ return actionComplete; });
        }
    
    },
    
    testGetDefinitionForApplicationEventWithAccess: {
    	 test: function(){
            var actionComplete = false;
            $A.getDefinition("e.testCustomNS1:applicationEventWithDefaultAccess", function(definition) {
                $A.test.assertEquals("markup://testCustomNS1:applicationEventWithDefaultAccess", definition.getDescriptor().getQualifiedName());
                actionComplete = true;
            });

            $A.test.addWaitFor(true, function(){ return actionComplete; });
        }
    
    },
    

    testGetDefinitionFromServerWhenOffline: {
        test:function(cmp) {
            var actionComplete = false;
            $A.test.setServerReachable(false);
            $A.test.addCleanup(function() {$A.test.setServerReachable(true);});

            $A.getDefinition("ui:inputCheckbox", function(definition) {
                $A.test.assertNull(definition);
                actionComplete = true;
            });

            $A.test.addWaitFor(true, function(){ return actionComplete; });
        }
    },

    testGetMultipleDefinitionsAllFromClient:{
        test:function(cmp) {

            $A.getDefinitions([
                    "aura:text",
                    //"markup://aura:label"
                ], function(definitions) {
                    var definition = definitions[0];
                    $A.test.assertNotUndefinedOrNull(definition,
                        "definitions[0] should be an object.");
                    $A.test.assertAuraType("ComponentDef", definition,
                        "definitions[0] should be a instance of ComponentDef, but actual is " +
                        definition.constructor.name);
                    $A.test.assertEquals("markup://aura:text", definition.getDescriptor().getQualifiedName());

                    //definition = definitions[1];
                    //$A.test.assertNotUndefinedOrNull(definition,
                        //"definitions[1] should be an object.");
                    //$A.test.assertAuraType("ComponentDef", definition,
                        //"definitions[1] should be a instance of ComponentDef, but actual is " +
                        //definition.constructor.name);
                    //$A.test.assertEquals("markup://aura:label", definition.getDescriptor().getQualifiedName());
                });
        }
    },

    testGetMultipleDefinitionsAllFromServer:{
        test:function(cmp) {
            var actionComplete = false;

            $A.getDefinitions([
                    "ui:button",
                    "ui:inputCheckbox"
                ], function(definitions) {
                    var definition = definitions[0];
                    $A.test.assertNotUndefinedOrNull(definition,
                        "definitions[0] should be an object.");
                    $A.test.assertAuraType("ComponentDef", definition,
                        "definitions[0] should be a instance of ComponentDef, but actual is " +
                        definition.constructor.name);
                    $A.test.assertEquals("markup://ui:button", definition.getDescriptor().getQualifiedName());

                    definition = definitions[1];
                    $A.test.assertNotUndefinedOrNull(definition,
                        "definitions[1] should be an object.");
                    $A.test.assertAuraType("ComponentDef", definition,
                        "definitions[1] should be a instance of ComponentDef, but actual is " +
                        definition.constructor.name);
                    $A.test.assertEquals("markup://ui:inputCheckbox", definition.getDescriptor().getQualifiedName());

                    actionComplete = true;
                });

            $A.test.addWaitFor(true, function(){ return actionComplete; });
        }
    },

    testGetMultipleDefinitionsFromClientAndServer:{
        test:function(cmp) {
            var actionComplete = false;

            $A.getDefinitions([
                    "aura:text",
                    "ui:button"
                ], function(definitions) {
                    var definition = definitions[0];
                    $A.test.assertNotUndefinedOrNull(definition,
                        "definitions[0] should be an object.");
                    $A.test.assertAuraType("ComponentDef", definition,
                        "definitions[0] should be a instance of ComponentDef, but actual is " +
                        definition.constructor.name);
                    $A.test.assertEquals("markup://aura:text", definition.getDescriptor().getQualifiedName());

                    var definition = definitions[1];
                    $A.test.assertNotUndefinedOrNull(definition,
                        "definitions[1] should be an object.");
                    $A.test.assertAuraType("ComponentDef", definition,
                        "definitions[1] should be a instance of ComponentDef, but actual is " +
                        definition.constructor.name);
                    $A.test.assertEquals("markup://ui:button", definition.getDescriptor().getQualifiedName());

                    actionComplete = true;
                });

            $A.test.addWaitFor(true, function(){ return actionComplete; });
        }
    },

    testGetMultipleDefinitionsWithDuplicateDescriptors:{
        test:function(cmp) {

            $A.getDefinitions([
                    "aura:text",
                    "aura:text",
                    "aura:text"
                ], function(definitions) {
                    var definition = definitions[0];
                    $A.test.assertNotUndefinedOrNull(definition,
                        "definitions[0] should be an object.");
                    $A.test.assertAuraType("ComponentDef", definition,
                        "definitions[0] should be a instance of ComponentDef, but actual is " +
                        definition.constructor.name);
                    $A.test.assertEquals("markup://aura:text", definition.getDescriptor().getQualifiedName());

                    var definition = definitions[1];
                    $A.test.assertNotUndefinedOrNull(definition,
                        "definitions[1] should be an object.");
                    $A.test.assertAuraType("ComponentDef", definition,
                        "definitions[1] should be a instance of ComponentDef, but actual is " +
                        definition.constructor.name);
                    $A.test.assertEquals("markup://aura:text", definition.getDescriptor().getQualifiedName());

                    var definition = definitions[2];
                    $A.test.assertNotUndefinedOrNull(definition,
                        "definitions[2] should be an object.");
                    $A.test.assertAuraType("ComponentDef", definition,
                        "definitions[2] should be a instance of ComponentDef, but actual is " +
                        definition.constructor.name);
                    $A.test.assertEquals("markup://aura:text", definition.getDescriptor().getQualifiedName());
                });
        }
    },

    testGetMultipleEventDefinitions: {
        test:function(cmp) {
            $A.getDefinitions([
                    "e.aura:valueChange" //,
                    //"e.aura:titleChange"
                ], function(definitions) {
                    var definition = definitions[0];
                    $A.test.assertNotUndefinedOrNull(definition, "definitions[0] should be an object.");
                    $A.test.assertAuraType("EventDef", definition,
                            "definitions[0] should be a instance of EventDef, but actual is " +
                            definition.constructor.name);
                    $A.test.assertEquals("markup://aura:valueChange", definition.getDescriptor().getQualifiedName());

                    //definition = definitions[1];
                    //$A.test.assertNotUndefinedOrNull(definition,
                            //"definitions[1] should be an object.");
                    //$A.test.assertAuraType("EventDef", definition,
                            //"definitions[1] should be a instance of EventDef, but actual is " +
                            //definition.constructor.name);
                    //$A.test.assertEquals("markup://aura:titleChange", definition.getDescriptor().getQualifiedName());
                });
        }
    },

    // Verify getting a mix of component and event definitions
    testGetMultipleComponentAndEventDefinitions: {
        test:function(cmp) {
            var actionComplete = false;

            $A.getDefinitions([
                    "aura:text",
                    "ui:button",
                    //"e.clientApiTest:getDefinitionTestEvent"
                ], function(definitions) {
                    var definition = definitions[0];
                    $A.test.assertNotUndefinedOrNull(definition, "definitions[0] should be an object.");
                    $A.test.assertAuraType("ComponentDef", definition,
                            "definitions[0] should be a instance of ComponentDef, but actual is " +
                            definition.constructor.name);
                    $A.test.assertEquals("markup://aura:text", definition.getDescriptor().getQualifiedName());

                    definition = definitions[1];
                    $A.test.assertNotUndefinedOrNull(definition, "definitions[1] should be an object.");
                    $A.test.assertAuraType("ComponentDef", definition,
                            "definitions[1] should be a instance of ComponentDef, but actual is " +
                            definition.constructor.name);
                    $A.test.assertEquals("markup://ui:button", definition.getDescriptor().getQualifiedName());

                    //definition = definitions[2];
                    //$A.test.assertNotUndefinedOrNull(definition, "definitions[2] should be an object.");
                    //$A.test.assertAuraType("EventDef", definition,
                            //"definitions[2] should be a instance of EventDef, but actual is " +
                            //definition.constructor.name);
                    //$A.test.assertEquals("markup://clientApiTest:getDefinitionTestEvent", definition.getDescriptor().getQualifiedName());

                    actionComplete = true;
                });

            $A.test.addWaitFor(true, function(){ return actionComplete; });
        }
    },

    testGetMultipleUnknownDescriptors: {
        test:function(){
            var actionComplete = false;

            $A.getDefinitions([
                    "unknown1:unknown1",
                    "unknown2:unknown2"
                ], function(definitions) {
                    $A.test.assertNull(definitions[0], "definitions[0] should be null.");
                    $A.test.assertNull(definitions[1], "definitions[1] should be null.");
                    actionComplete = true;
                });

            $A.test.addWaitFor(true, function(){ return actionComplete; });
        }
    },

    testGetMultipleDefinitionsContainUnknownDescriptor: {
        test:function(){
            var actionComplete = false;

            $A.getDefinitions([
                    "aura:text",
                    "unknown:unknown",
                    "e.unknown:unknownEvt"
                ], function(definitions) {
                    var definition = definitions[0];
                    $A.test.assertNotUndefinedOrNull(definition, "definitions[0] should be an object.");
                    $A.test.assertAuraType("ComponentDef", definition,
                            "definitions[0] should be a instance of ComponentDef, but actual is " +
                            definition.constructor.name);
                    $A.test.assertEquals("markup://aura:text", definition.getDescriptor().getQualifiedName());

                    $A.test.assertNull(definitions[1], "definition[1] should be null.");
                    $A.test.assertNull(definitions[2], "definition[2] should be null.");
                    actionComplete = true;
                });

            $A.test.addWaitFor(true, function(){ return actionComplete; });
        }
    },

    testOnlyCallsCallbackOnceWhenGettingMutipleDefinitions: {
        test:function(){
            var expected = 1;
            var actual = 0;
            var actionComplete = false;

            $A.getDefinitions([
                    "ui:button",
                    "aura:text",
                    "e.aura:valueChange" 
                ], function(definitions) {
                    actual++;
                    actionComplete = true;
                });

            $A.test.addWaitFor(true,
                    function(){ return actionComplete; },
                    function() {$A.test.assertEquals(expected, actual)}
                );
        }
    }

})
