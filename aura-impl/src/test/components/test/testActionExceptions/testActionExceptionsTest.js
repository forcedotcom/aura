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
({
    checkResponse : function(cmp, expectedState, expectedMessage, expectedStack){
        cmp.find("trigger").get("e.press").fire();
        $A.test.runAfterIf(
            function(){ return cmp.get("v.response"); },
            function(){
                var action = cmp.get("v.response");
                $A.log(action);
                $A.log(action.error);
                $A.test.assertEquals(expectedState, action.state, "Unexpected state: ");
                if(expectedMessage){
                    $A.test.assertEquals(expectedMessage, action.error.message, "Unexpected error message: ");
                }
                if(expectedStack){
                    $A.test.assertTrue(action.error.stack.indexOf(expectedStack) === 0, "Unexpected stack: " + action.error.stack);
                } else {
                    $A.test.assertTrue(action.error.stack.indexOf("aura.throwable.AuraExecutionException: " + expectedMessage) === 0, "Unexpected stack: " + action.error.stack);
                }
            }
        );
    },

    // All these tests need to be rechecked after abortable actions refactor
    _testThrowable: {
        attributes : { throwableClass:"java.lang.Throwable", throwableCause:"couldn't decide" },
        test: function(cmp){
            this.checkResponse(cmp, "ERROR", "java.lang.Throwable: couldn't decide");
        }
    },

    _testRuntimeException: {
        attributes : { throwableClass:"java.lang.RuntimeException", throwableCause:"java.lang.IllegalAccessException" },
        test: function(cmp){
            this.checkResponse(cmp, "ERROR", "java.lang.RuntimeException: java.lang.IllegalAccessException");
        }
    },

    _testError: {
        attributes : { throwableClass:"java.lang.Error", throwableCause:"java.lang.RuntimeException" },
        test: function(cmp){
            this.checkResponse(cmp, "ERROR", "java.lang.Error: java.lang.RuntimeException");
        }
    },

    _testInvocationTargetException: {
        attributes : { throwableClass:"java.lang.reflect.InvocationTargetException", throwableCause:"java.lang.IllegalArgumentException" },
        test: function(cmp){
            this.checkResponse(cmp, "ERROR", "java.lang.reflect.InvocationTargetException");
        }
    },

    _testInvocationTargetExceptionHanlded: {
        attributes : { throwableClass:"java.lang.reflect.InvocationTargetException", throwableCause:"aura.throwable.AuraHandledException" },
        test: function(cmp){
            this.checkResponse(cmp, "ERROR", "java.lang.reflect.InvocationTargetException");
        }
    },

    _testIllegalArgumentException: {
        attributes : { throwableClass:"java.lang.IllegalArgumentException", throwableCause:"you're not listening" },
        test: function(cmp){
            this.checkResponse(cmp, "ERROR", "java.lang.IllegalArgumentException: you're not listening");
        }
    },

    _testIllegalAccessException: {
        attributes : { throwableClass:"java.lang.IllegalAccessException", throwableCause:"under 21" },
        test: function(cmp){
            this.checkResponse(cmp, "ERROR", "java.lang.IllegalAccessException: under 21");
        }
    },

    _testAuraHandledException: {
        attributes : { throwableClass:"aura.throwable.AuraHandledException", throwableCause:"java.lang.IllegalArgumentException" },
        test: function(cmp){
            this.checkResponse(cmp, "ERROR", "", "aura.throwable.AuraHandledException");
        }
    },

    _testAuraHandledExceptionString: {
        attributes : { throwableClass:"aura.throwable.AuraHandledException", throwableCause:"something to say" },
        test: function(cmp){
            this.checkResponse(cmp, "ERROR", "something to say", "aura.throwable.AuraHandledException: something to say");
        }
    }
})
