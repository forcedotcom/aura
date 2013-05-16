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
        $A.test.runAfterIf(
            function(){ return cmp.get("v.response"); },
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

    testSystemError: {
        attributes : { eventName:"aura:systemError",
                       eventParamName:"message",
                       eventParamValue:"bah!" },
        test: function(cmp){
            // we have a boston accent.
            this.checkResponse(cmp, "ERROR", "markup://aura:systemError", "bah!");
        }
    },

    testLocalEvent: {
        attributes : { eventName:"test:testActionEventEvent",
                       eventParamName:"msg",
                       eventParamValue:"foo!" },
        test: function(cmp){
            this.checkResponse(cmp, "ERROR", "markup://test:testActionEventEvent", "foo!");
        }
    },

    //
    // This would work, but it dies in $A.error.
    //
    _testBadEvent: {
        attributes : { eventName:"test:testActionEventEventNonExistant",
                       eventParamName:"msg",
                       eventParamValue:"foo!" },
        test: function(cmp){
            this.checkFailure(cmp, "ERROR", "org.auraframework.throwable.quickfix.DefinitionNotFoundException: No EVENT named markup://test:testActionEventEventNonExistant found");
        }
    }
})

