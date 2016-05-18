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
    enqueueServerActionAndFireEvent:function(cmp, action){
        $A.enqueueAction(action);
        cmp.getEvent("press").fire();
    },

    /**
     *
     * Negative case: Verify that exceptions caused in chained controller are surfaced as part of only that controller and does not affect others.
     */
    testSurfaceExceptionsWhileChaining:{
        test:[function(cmp){
            multiply = $A.test.getAction(cmp,"c.multiply", {"a" : 2});
            multiply.setChained();
            //Divide by 0 error
            divide = $A.test.getAction(cmp,"c.divide",{"a" : 0});
            divide.setChained();

            add = $A.test.getAction(cmp,"c.add",{
                                        "a" : 1, "b" : 99,
                                        "actions": $A.util.json.encode({
                                            actions: [divide, multiply]
                                        })
                                    });
            this.enqueueServerActionAndFireEvent(cmp, add);
        }, function(cmp){
            $A.test.addWaitFor("ERROR",
                function(){return divide.getState()},
                function(){
                    $A.test.assertEquals("SUCCESS", add.getState(),
                         "Expected the server to successfully run this action even though the chained action failed.");
                    $A.test.assertEquals(100, add.getReturnValue(), "Actions not run in expected sequence.");
                    $A.test.assertEquals("SUCCESS", multiply.getState(), "Expected the server to run this chained action");
                    $A.test.assertEquals(200, multiply.getReturnValue(), "Actions not run in expected sequence.");
                    $A.test.assertEquals("ERROR", divide.getState(),
                        "Expected to see an error due to exception in server action.");
                    $A.test.assertTrue(divide.getError()[0].message.indexOf("java.lang.ArithmeticException: / by zero") != -1,
                        "expected to find the exception string");
                               });
        }]
    },

    /**
     * Verify chaining the same action multiple times.
     *
     */
    testChainActionTwice:{
        test:[function(cmp){
                var multiply = $A.test.getAction(cmp,"c.multiply", {"a" : 2},
                    //Server call back function will be called back twice
                    function(action){
                        $A.test.assertEquals("SUCCESS",action.getState());
                        $A.test.assertEquals(200*cmp.get('v.callbackCount'),
                            action.getReturnValue());
                        cmp.set('v.callbackCount',
                            cmp.get('v.callbackCount')+1);
                    });
                var multiply2 = $A.test.getAction(cmp,"c.multiply", {"a" : 2},
                    //Server call back function will be called back twice
                    function(action){
                        $A.test.assertEquals("SUCCESS",action.getState());
                        $A.test.assertEquals(200*cmp.get('v.callbackCount'),
                            action.getReturnValue());
                        cmp.set('v.callbackCount',
                            cmp.get('v.callbackCount')+1);
                    });
                multiply.setChained();
                multiply2.setChained();
                var add = $A.test.getAction(cmp,"c.add",{
                                            "a" : 1, "b" : 99,
                                            "actions": $A.util.json.encode({
                                                actions: [multiply, multiply2]
                                            })
                                        },function(action){
                                            $A.test.assertEquals("SUCCESS",action.getState());
                                            $A.test.assertEquals(100, action.getReturnValue(), "Chained action was executed before parent action.");
                                            cmp.set('v.callbackCount', 1);
                                        });
                this.enqueueServerActionAndFireEvent(cmp, add);
                //Chaining same action multiple times failed.
                $A.test.addWaitFor(3, function(){return cmp.get('v.callbackCount');});
            }]

    }
})
