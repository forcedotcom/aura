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


    testThrowable: {
        attributes : {
            throwableClass:"java.lang.Throwable",
            throwableCause:"couldn't decide"
        },
        test: function(cmp){
            var expectedMessage = "java://org.auraframework.components.test.java.controller.JavaTestController: " +
                    "java.lang.Throwable: couldn't decide";
            this.checkUnHandledExceptionResponse(cmp, "ERROR", expectedMessage);
        }
    },

    testRuntimeException: {
        attributes : {
            throwableClass:"java.lang.RuntimeException",
            throwableCause:"java.lang.IllegalAccessException"
        },
        test: function(cmp){
            var expectedMessage = "java://org.auraframework.components.test.java.controller.JavaTestController: " +
                    "java.lang.RuntimeException: java.lang.IllegalAccessException";
            this.checkUnHandledExceptionResponse(cmp, "ERROR", expectedMessage);
        }
    },

    testError: {
        attributes : {
            throwableClass:"java.lang.Error",
            throwableCause:"java.lang.RuntimeException"
        },
        test: function(cmp){
            var expectedMessage = "java://org.auraframework.components.test.java.controller.JavaTestController: " +
                    "java.lang.Error: java.lang.RuntimeException";
            this.checkUnHandledExceptionResponse(cmp, "ERROR", expectedMessage);
        }
    },

    testInvocationTargetException: {
        attributes : {
            throwableClass:"java.lang.reflect.InvocationTargetException",
            throwableCause:"java.lang.IllegalArgumentException"
        },
        test: function(cmp){
            var expectedMessage = "java://org.auraframework.components.test.java.controller.JavaTestController: " +
                    "java.lang.reflect.InvocationTargetException";
            this.checkUnHandledExceptionResponse(cmp, "ERROR", expectedMessage);
        }
    },

    testInvocationTargetExceptionHanlded: {
        attributes : {
            throwableClass:"java.lang.reflect.InvocationTargetException",
            throwableCause:"aura.throwable.AuraHandledException"
        },
        test: function(cmp){
            var expectedMessage = "java://org.auraframework.components.test.java.controller.JavaTestController: " +
                    "java.lang.reflect.InvocationTargetException";
            this.checkUnHandledExceptionResponse(cmp, "ERROR", expectedMessage);
        }
    },

    testIllegalArgumentException: {
        attributes : {
            throwableClass:"java.lang.IllegalArgumentException",
            throwableCause:"you're not listening"
        },
        test: function(cmp){
            var expectedMessage = "java://org.auraframework.components.test.java.controller.JavaTestController: " +
                    "java.lang.IllegalArgumentException: you're not listening";
            this.checkUnHandledExceptionResponse(cmp, "ERROR", expectedMessage);
        }
    },

    testIllegalAccessException: {
        attributes : {
            throwableClass:"java.lang.IllegalAccessException",
            throwableCause:"under 21"
        },
        test: function(cmp){
            var expectedMessage = "java://org.auraframework.components.test.java.controller.JavaTestController: " +
                    "java.lang.IllegalAccessException: under 21";
            this.checkUnHandledExceptionResponse(cmp, "ERROR", expectedMessage);
        }
    },

    testAuraHandledException: {
        attributes : {
            throwableClass:"aura.throwable.AuraHandledException",
            throwableCause:"java.lang.IllegalArgumentException"
        },
        test: function(cmp){
            var expectedStack = "org.auraframework.throwable.AuraHandledException";
            this.checkHandledExceptionResponse(cmp, "ERROR", "", expectedStack);
        }
    },

    testAuraHandledExceptionString: {
        attributes : {
            throwableClass: "aura.throwable.AuraHandledException",
            throwableCause: "something to say"
        },
        test: function(cmp) {
            var expectedMessage = "something to say";
            var expectedStack = "org.auraframework.throwable.AuraHandledException: something to say";
            this.checkHandledExceptionResponse(cmp, "ERROR", expectedMessage, expectedStack);
        }
    },

    /**
     * Test that an XHR-level exception fires the corresponding app-level event
     * and sets this action to ERROR state.
     *
     * Note: Test.js' setup pushes an access context so it's not possible for a cmp test
     * to create and verify behavior of an access context-less XHR receive loop.
     */
     // the test will get into infinite reload because of invalidSession so disable for now.
    _testXhrLevelException: {
        test: [
            function(cmp){
                // set an invalid token to trigger an XHR-level exception event
                $A.clientService.resetToken("invalid");

                cmp.find("trigger").get("e.press").fire();
                $A.test.addWaitForWithFailureMessage(true, function(){ return !!cmp.get("v.response");},
                    "response attribute is never set",
                    function() {
                        var action = cmp.get("v.response");
                        $A.test.assertEquals("ERROR", action.state, "Found unexpected state");

                        var msg = action.error[0].message;
                        var expectedMessage = "Received exception event from server";
                        $A.test.assertStartsWith(expectedMessage, msg, "Found unexpected error message");

                        // For client side error, different browsers may have different format of stacktrace.
                        // Only check stack exists.
                        // On IE, stack is added when error is thrown. For error in action, we create a new Error
                        // instance in AuraClientService.prototype.processErrors, so there is no stack for IE.
                        var stack = action.error[0].stack;
                        var browser = $A.get("$Browser");
                        if(!browser.isIE10 && !browser.isIE11) {
                            $A.test.assertTrue(stack.length > 0, "Unexpected stack: " + stack);
                        }
                    }
                );
            },
            function(cmp) {
                $A.test.assertTrue(cmp.get("v.invalidSessionReceived"), "aura:invalidSession event was not fired / received");
            }
        ]
    },

    //Because AuraHandledExceptions are treated differently
    checkHandledExceptionResponse : function(cmp, expectedState, expectedMessage, expectedStack){
        cmp.find("trigger").get("e.press").fire();
        $A.test.addWaitForWithFailureMessage(true, function(){ return !!cmp.get("v.response");},
            "response attribute is never set",
            function() {
                var action = cmp.get("v.response");
                var msg = action.error[0].message;
                var stack = action.error[0].stack;
                $A.test.assertEquals(expectedState, action.state, "Found unexpected state");

                if(expectedMessage){
                    $A.test.assertStartsWith(expectedMessage, msg, "Found unexpected error message");
                }

                if(expectedStack){
                    $A.test.assertTrue(stack.indexOf(expectedStack) > -1, "Unexpected stack: " + stack);
                }
            }
        );
    },

    checkUnHandledExceptionResponse : function(cmp, expectedState, expectedMessage, expectedStack){
        cmp.find("trigger").get("e.press").fire();
        $A.test.runAfterIf(
            function(){ return cmp.get("v.response"); },
            function(){
                var action = cmp.get("v.response");
                var msg = action.error[0].message;
                var stack = action.error[0].stack;
                $A.test.assertEquals(expectedState, action.state, "Unexpected state: ");
                if(expectedMessage){
                    $A.test.assertNotNull(
                            msg.match(/^An internal server error has occurred\nError ID:.*\n\norg\.auraframework\.throwable\.AuraExecutionException:/)
                            ||
                            msg.match(/^Unable to process your request\n\norg\.auraframework\.throwable\.AuraExecutionException:/)
                    );
                    $A.test.assertTrue(msg.indexOf(expectedMessage)!= -1,
                            "Expected error message not seen: Expected {"+expectedMessage+"} but saw {"+msg+"}");
                }
                if(expectedStack){
                    $A.test.assertTrue(stack.indexOf(expectedStack) === 0, "Unexpected stack: " + stack);
                } else {
                    $A.test.assertTrue(stack.indexOf("org.auraframework.throwable.AuraUnhandledException: ") === 0, "Unexpected stack: " + stack);
                }
            }
        );
    }
})
