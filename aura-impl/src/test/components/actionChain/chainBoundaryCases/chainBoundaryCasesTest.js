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
    enqueueServerActionAndFireEvent:function(cmp, action){
        action.runAfter(action);
        cmp.getEvent("press").fire();
    },

    /**
     * Negative case: Verify that specifying null to a controller that is expecting a chain of actions to call post its completion works fine.
     */
    testNullSpecifiedForChaining:{
        test:function(cmp){
            var a = $A.test.getAction(cmp,"c.add", { "a" : 1, "b" : 99,actions : null});
            this.enqueueServerActionAndFireEvent(cmp, a);
            //"Expected the server to flag an error."
            $A.test.addWaitFor("ERROR",
                       function(){return a.getState()},
                       function(){
                            $A.test.assertTrue(a.getError()[0].message.indexOf("java.lang.NullPointerException") !== -1)
                       });
        }
    },

    /**
     *
     * Negative case: Verify that exceptions caused in chained controller are surfaced as part of only that controller and does not affect others.
     */
    testSurfaceExceptionsWhileChaining:{
        test:function(cmp){
            var multiply = $A.test.getAction(cmp,"c.multiply", {"a" : 2});
            multiply.setChained();
            //Divide by 0 error
            var divide = $A.test.getAction(cmp,"c.divide",{"a" : 0});
            divide.setChained();

            var add = $A.test.getAction(cmp,"c.add",{
                                        "a" : 1, "b" : 99,
                                        "actions": $A.util.json.encode({
                                            actions: [divide, multiply]
                                        })
                                    });
            this.enqueueServerActionAndFireEvent(cmp, add);
            $A.test.addWaitFor("ERROR",
                               function(){return divide.getState()},
                               function(){
                                   $A.test.assertEquals("SUCCESS", add.getState(), "Expected the server to successfully run this action even though the chained action failed.");
                                   $A.test.assertEquals(100, add.getReturnValue(), "Actions not run in expected sequence.");

                                   $A.test.assertEquals("SUCCESS", multiply.getState(), "Expected the server to run this chained action");
                                   $A.test.assertEquals(200, multiply.getReturnValue(), "Actions not run in expected sequence.");

                                   $A.test.assertEquals("ERROR", divide.getState(), "Expected to see an error due to exception in server action.");
                                   $A.test.assertTrue(divide.getError()[0].message.indexOf("java.lang.ArithmeticException: / by zero") != -1, "expected to find the exception string");
                               });
        }
    },

    /**
     * Will an infinite loop of controller chain be caught by the server.
     */
    //TODO W-1252082
    _testInfiniteChainingAtClient:{
        test:function(cmp){
            var doNothing = $A.test.getAction(cmp,"c.doNothing",{ });
            doNothing.setChained();
            var add = $A.test.getAction(cmp,"c.add",{ });

            for(var i=0;i<10;i++){
                add.setParams({"a" : 1, "b" : 99,
                            "actions": $A.util.json.encode({
                                        actions: [doNothing]
                                    })
                        });
                doNothing.setParams({"actions": $A.util.json.encode({actions:[add]})})
            }
            this.enqueueServerActionAndFireEvent(cmp, add);
            //"Server failed to detect an infinite chain."
            $A.test.addWaitFor("ERROR", function(){return doNothing.getState()},
                                function(){
                                    $A.test.assertEquals("ERROR", doNothing.getState(), "Server failed to detect an infinite chain.");
                                    $A.test.assertEquals("ERROR", add.getState(), "Server failed to detect an infinite chain.");
                                });
        }
    },

    //W-1251785: Unable to detect server side infinite action.
    _testInfiniteChainingAtServer:{
        test:function(cmp){
            var infiniteChain = $A.test.getAction(cmp,"c.infiniteChain",{});
            this.enqueueServerActionAndFireEvent(cmp, infiniteChain);
            //"Server failed to detect an infinite chain."
            $A.test.addWaitFor("ERROR", function(){return infiniteChain.getState()},
                                function(){
                                    $A.test.assertEquals("ERROR", infiniteChain.getState(), "Server failed to detect an infinite chain.");
                                });
        }
    },

    /**
     * Setting a chained action to be exclusive has no effect.
     * setChained() takes precedence over setExclusive()
     */
    // TODO: W-1347322
    _testSettingChainedActionToBeExclusive:{
        test:function(cmp){
            var multiply = $A.test.getAction(cmp,"c.multiply", {"a" : 2},
                function(action){
                    $A.test.assertEquals(200, action.getReturnValue(), "Exclusive action should not be executed before parent action.");
                    //If the call backs are in order, then this attribute will have value set by c.add's call back
                    $A.test.assertEquals("1", cmp.getAttributes().getValue('responseOrder').getValue(), "Action chaining did not preserve order at client.");
                    cmp.getAttributes().setValue('responseOrder', "2");
                });
            multiply.setChained();
            multiply.setExclusive(true);

            var add = $A.test.getAction(cmp,"c.add",
                {"a" : 1, "b" : 99, "actions": $A.util.json.encode({ actions: [multiply] })},
                function(action){
                        $A.test.assertEquals(100, action.getReturnValue(), "Chained action was executed before parent action.");
                        //If the call backs are in order, then this attribute will have the default value
                        $A.test.assertEquals("", cmp.getAttributes().getValue('responseOrder').getValue(), "Action chaining did not preserve order at client.");
                        cmp.getAttributes().setValue('responseOrder', "1");
                });
            this.enqueueServerActionAndFireEvent(cmp, add);
            $A.test.addWaitFor("2", function(){return cmp.getAttributes().get('responseOrder');});
        }
    },

    //TODO: W-1252083 Setting chained action to be abortable
    //Not really sure how it impacts action chaining at this point
    testSettingChainedActionTobeAbortable:{
        test:function(cmp){

        }
    },

    /**
     * Verify chaining the same action multiple times.
     */
    testChainSameActionTwice:{
        test:[function(cmp){

                var multiply = $A.test.getAction(cmp,"c.multiply", {"a" : 2},
                                                            //Server call back function will be called back twice
                                                            function(action){
                                                                $A.test.assertEquals("SUCCESS",action.getState());
                                                                $A.test.assertEquals(200*cmp.getAttributes().getValue('callbackCount').getValue(), action.getReturnValue());
                                                                cmp.getAttributes().setValue('callbackCount', cmp.getAttributes().getValue('callbackCount').getValue()+1);
                                                            });
                multiply.setChained();
                var add = $A.test.getAction(cmp,"c.add",{
                                            "a" : 1, "b" : 99,
                                            "actions": $A.util.json.encode({
                                                actions: [multiply, multiply]
                                            })
                                        },function(action){
                                            $A.test.assertEquals("SUCCESS",action.getState());
                                            $A.test.assertEquals(100, action.getReturnValue(), "Chained action was executed before parent action.");
                                            cmp.getAttributes().setValue('callbackCount', 1);
                                        });
                this.enqueueServerActionAndFireEvent(cmp, add);
                //Chaining same action multiple times failed.
                $A.test.addWaitFor(3, function(){return cmp.getAttributes().getValue('callbackCount').getValue();});
            }]

    },

    /**
     * Should not be able to chain a client action.
     */
    testChainingClientAction:{
        test:function(cmp){
            var clientAction = cmp.get("c.handleClick");
            try{
                $A.test.callServerAction(clientAction);
                $A.test.fail("Should not be able to chain a client action.");
            }catch(e){
                $A.test.assertTrue(e.message.indexOf("Assertion Failed!: RunAfter() cannot be called on a client action. Use run() on a client action instead.")==0, e.message);
            }
        }
    }
})
