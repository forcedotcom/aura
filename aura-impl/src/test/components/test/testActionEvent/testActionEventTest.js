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
    checkResponse : function(cmp, expectedState, eventName, expectedMessage){
        cmp.find("trigger").get("e.press").fire();
        //Wait till action's call back is invoked
        $A.test.runAfterIf(
            function(){ return cmp.get("v.response"); }, //v.response is set only if action's call back is invoked
            function(){
        	var action = cmp.get("v.response");
                $A.log(action);
                $A.log(action.error);
                $A.test.assertEquals(expectedState, action.state, "Unexpected state: ");
                $A.test.assertEquals(eventName, cmp.get("v.event"));
                $A.test.assertEquals(expectedMessage, cmp.get("v.data"));
            }
        );
    },

    checkFailure : function(cmp, expectedState, expectedMessage, expectedStack) {
        cmp.find("trigger").get("e.press").fire();
        $A.test.runAfterIf(
            function(){ return cmp.get("v.response"); },
            function(){
                var action = cmp.get("v.response");
                var msg = action.error[0].message;
                var stack = action.error[0].stack;
                $A.log(action);
                $A.log(action.error);

                $A.test.assertEquals(expectedState, action.state, "Unexpected state: ");
                if(expectedMessage){
                    $A.test.assertEquals(expectedMessage, msg, "Unexpected error message: ");
                }
                if(expectedStack){
                    $A.test.assertTrue(stack.indexOf(expectedStack) === 0, "Unexpected stack: " + stack);
                }
            }
        );
    },

    testApplicationEvent_SystemError: {
        attributes : { eventName:"aura:systemError",
                       eventParamName:"message",
                       eventParamValue:"bah!" },
        test: function(cmp){
            // we have a boston accent.
            this.checkResponse(cmp, "ERROR", "markup://aura:systemError", "bah!");
        }
    },

    testComponentEvent: {
        attributes : { eventName:"test:testActionEventEvent",
                       eventParamName:"msg",
                       eventParamValue:"foo!" },
        test: function(cmp){
            this.checkResponse(cmp, "ERROR", "markup://test:testActionEventEvent", "foo!");
        }
    },
    
    
    checkResponseForEventsWithoutHandler : function(cmp, expectedState, eventName){
	$A.test.assertUndefinedOrNull($A.eventService.getEventDef(eventName),
		"Test setup failure, eventdef known before hand.");
        cmp.find("trigger").get("e.press").fire();
        //Wait till action's call back is invoked
        $A.test.runAfterIf(
            function(){ return cmp.get("v.response"); }, //v.response is set only if action's call back is invoked
            function(){
        	var action = cmp.get("v.response");
                $A.test.assertEquals(expectedState, action.state, "Unexpected state: ");
                $A.test.assertDefined($A.eventService.getEventDef(eventName), 
                	"Failed to add new event def from action response.");
            }
        );
    },
    testApplicationEventWithNoHandler: {
	attributes : { eventName:"test:applicationEvent"},
        test: function(cmp){
            this.checkResponseForEventsWithoutHandler(cmp, "ERROR", "markup://test:applicationEvent");
        }    
    },
    testComponentEventWithNoHandler: {
	attributes : { eventName:"test:anevent"},
        test: function(cmp){
            this.checkResponseForEventsWithoutHandler(cmp, "ERROR", "markup://test:anevent");
        } 
    },
    testBadEvent: {
        attributes : { eventName:"test:testActionEventEventNonExistant",
                       eventParamName:"msg",
                       eventParamValue:"foo!" },
        test: function(cmp){
        	$A.test.expectAuraError("Unable to process your request\n\norg.auraframework.throwable.AuraRuntimeException:");
            cmp.find("trigger").get("e.press").fire();
            $A.test.addWaitFor(
                    false,
                    $A.test.isActionPending,
                    function () {
                    	$A.test.assertTrue(
	                		$A.test.getAuraErrorMessage().
	                		indexOf("Unable to process your request\n\n"+
                				"org.auraframework.throwable.AuraRuntimeException: "+
                				"org.auraframework.throwable.quickfix.DefinitionNotFoundException: " +
                				"No EVENT named markup://test:testActionEventEventNonExistant found")==0, "Failed to see quick fix exception message");
                    }
                );
        }
    }
})

