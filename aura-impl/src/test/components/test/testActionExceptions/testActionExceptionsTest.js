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
        attributes : { throwableClass:"java.lang.Throwable",
                       throwableCause:"couldn't decide" },
        test: function(cmp){
            this.checkUnHandledExceptionResponse(cmp, "ERROR", "java://org.auraframework.impl.java.controller.JavaTestController: " +
                                                "java.lang.Throwable: couldn't decide");
        }
    },

    testRuntimeException: {
        attributes : { throwableClass:"java.lang.RuntimeException",
                       throwableCause:"java.lang.IllegalAccessException" },
        test: function(cmp){
            this.checkUnHandledExceptionResponse(cmp, "ERROR", "java://org.auraframework.impl.java.controller.JavaTestController: " +
                                                "java.lang.RuntimeException: java.lang.IllegalAccessException");
        }
    },

    testError: {
        attributes : { throwableClass:"java.lang.Error",
                       throwableCause:"java.lang.RuntimeException" },
        test: function(cmp){
        	this.checkUnHandledExceptionResponse(cmp, "ERROR", "java://org.auraframework.impl.java.controller.JavaTestController: " + 
                                                "java.lang.Error: java.lang.RuntimeException");
        }
    },

    testInvocationTargetException: {
        attributes : { throwableClass:"java.lang.reflect.InvocationTargetException",
                       throwableCause:"java.lang.IllegalArgumentException" },
        test: function(cmp){
            this.checkUnHandledExceptionResponse(cmp, "ERROR", "java://org.auraframework.impl.java.controller.JavaTestController: " +
                                                "java.lang.reflect.InvocationTargetException");
        }
    },

    testInvocationTargetExceptionHanlded: {
        attributes : { throwableClass:"java.lang.reflect.InvocationTargetException",
                       throwableCause:"aura.throwable.AuraHandledException" },
        test: function(cmp){
            this.checkUnHandledExceptionResponse(cmp, "ERROR", "java://org.auraframework.impl.java.controller.JavaTestController: " +
                                                "java.lang.reflect.InvocationTargetException");
        }
    },

    testIllegalArgumentException: {
        attributes : { throwableClass:"java.lang.IllegalArgumentException",
                       throwableCause:"you're not listening" },
        test: function(cmp){
            this.checkUnHandledExceptionResponse(cmp, "ERROR", "java://org.auraframework.impl.java.controller.JavaTestController: " + 
                                                "java.lang.IllegalArgumentException: you're not listening");
        }
    },

    testIllegalAccessException: {
        attributes : { throwableClass:"java.lang.IllegalAccessException",
                       throwableCause:"under 21" },
        test: function(cmp){
        	this.checkUnHandledExceptionResponse(cmp, "ERROR", "java://org.auraframework.impl.java.controller.JavaTestController: " +
                                                "java.lang.IllegalAccessException: under 21");
        }
    },

    testAuraHandledException: {
        attributes : { throwableClass:"aura.throwable.AuraHandledException",
                       throwableCause:"java.lang.IllegalArgumentException" },
        test: function(cmp){
            this.checkHandledExceptionResponse(cmp, "ERROR", "", "org.auraframework.throwable.AuraHandledException");
        }
    },

    testAuraHandledExceptionString: {
        attributes : { throwableClass:"aura.throwable.AuraHandledException", 
                       throwableCause:"something to say" },
        test: function(cmp){
            this.checkHandledExceptionResponse(cmp, "ERROR", "something to say", "org.auraframework.throwable.AuraHandledException: " +
                                                                    "something to say");
        }
    },
    //Because AuraHandledExceptions are treated differently
    checkHandledExceptionResponse : function(cmp, expectedState, expectedMessage, expectedStack){
        cmp.find("trigger").get("e.press").fire();
        $A.test.runAfterIf(
            function(){ return cmp.get("v.response"); },
            function(){
                var action = cmp.get("v.response");
                var msg = action.error[0].message;
                var stack = action.error[0].stack;
                $A.test.assertEquals(expectedState, action.state, "Unexpected state: ");
                if(expectedMessage){
                    $A.test.assertTrue(msg.indexOf(expectedMessage)==0, "Unexpected error message: ");
                }
                if(expectedStack){
                	$A.test.assertTrue(stack.indexOf(expectedStack) === 0, "Unexpected stack: " + stack);
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
    },
})
