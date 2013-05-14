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
     * Verify a scenario where a server action from one component is chained to a server action of another component.
     */
    testChainingExternalActions:{
        test:function(cmp){
            //Local action
            var getString = $A.test.getAction(cmp, "c.getString",{});
            getString.setChained();

            //Chain local action with action of facet
            var facet = cmp.find('facet');
            var add = $A.test.getAction(facet,"c.add",
                                    {
                                        "a" : 1, "b" : 99,
                                        "actions": $A.util.json.encode({
                                            actions: [getString]
                                        })
                                    },function(action){
                                        $A.test.assertEquals("SUCCESS", action.getState());
                                        $A.test.assertEquals(100, action.getReturnValue(), "Server Controller failed to return correct value.");
                                    });
            $A.enqueueAction(add);
            cmp.getEvent("press").fire();
            $A.test.addWaitFor("SUCCESS",
                       function(){return getString.getState()},
                       function(){
                           $A.test.assertEquals("TestController", getString.getReturnValue(), "Server Controller failed to return correct value.");

                            $A.test.assertEquals("SUCCESS", add.getState());
                            $A.test.assertEquals(100, add.getReturnValue(), "Server Controller failed to return correct value.");
                       });
        }
    }
})
