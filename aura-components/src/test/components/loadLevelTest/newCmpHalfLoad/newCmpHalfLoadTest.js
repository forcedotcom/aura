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
	//in setUp, we create the receiver component, push it to body
    setUp: function(cmp) {
        var receiverCmp = "markup://"+cmp.get("v.receiverCmp");
        var receiverCmpAuraId = cmp.get("v.receiverCmpAuraId");
        var thisCmp = cmp;
        console.log(receiverCmp);
        $A.createComponent(receiverCmp, {},
            function(newCmp){
                thisCmp.set("v.body", [newCmp]);
                thisCmp.index(receiverCmpAuraId, newCmp.getGlobalId());
            }                
        );
    },
    
    waitForReceiverCmpCreated : function(cmp) {
        $A.test.addWaitForWithFailureMessage(true, 
                function() { 
                    var receiverCmp = cmp.find("receiverCmp"); 
                    return (receiverCmp !== undefined); }, 
                "Waiting for receiver component being created failed"
            );
    },
    
    /**
     * ask receiverCmp(newCmpWithValueProvider) to create a new component
     * kill receiverCmp BEFORE the request is send. 
     * 
     */
    // JBUCH: TEST NO LONGER VALID; REWRITE OR DELETE
    _testCmpCreatedByFetchingMapFromServer:{
        attributes:{ 
            receiverCmp: "loadLevelTest:newCmpWithValueProvider",
            receiverCmpAuraId: "receiverCmp",
            controllerFuncToCreateCmp: "c.createCmpWithMapValuePropRefValueFromServer"
        },
        test:[ function(cmp) {
            this.waitForReceiverCmpCreated(cmp);
        },
        function(cmp){
            var receiverCmp = cmp.find("receiverCmp");

            //var actionToCreateNewCmp = receiverCmp.get(cmp.get("v.controllerFuncToCreateCmp"));
            var actionToCreateNewCmp = cmp.get("c.getComponents");
            actionToCreateNewCmp.setParams({
                input : 2,
            	token : "Bla"
            });
            actionToCreateNewCmp.setCallback(cmp, function(action){
            	var cmpArray = action.getReturnValue();
            	receiverCmp.set("v.body", cmpArray);
            });
            
            var cb_handle;
            var destroy_done = false;
            // watch for _any_ action.
            var preSendCallback = function(actions) {
                var i;
                var action = undefined;
                for (i = 0; i < actions.length; i++) {
                    if (actions[i].getDef().name === "getComponents" && 
                    		actions[i].getParams().token && actions[i].getParams().token === "Bla") {
                        action = actions[i];
                        break;
                    }
                }
                if (action) {
                	receiverCmp.destroy();
                	//because we are watching all actions, once we are done, need to remove the callback handler
                    $A.test.removePreSendCallback(cb_handle);
                    $A.test.addWaitForWithFailureMessage(true, 
                    		function() { return $A.test.areActionsComplete([action]); },
                    		"Action we are watching didn't finish"
                    		);
                    //let the test know we have destroy the receiverCmp
                    destroy_done = true;
                    var errorMsg = "Invalid component tried calling function [set] with arguments [v.body,[object Object],[object Object]], markup://loadLevelTest:newCmpWithValueProvider";
                    $A.test.expectAuraError(errorMsg);
                }
            };
            cb_handle = $A.test.addPreSendCallback(undefined, preSendCallback );
            $A.test.addWaitFor(true, function() { return destroy_done; });

            //now run the action
            $A.enqueueAction(actionToCreateNewCmp);
        }
        ]
    },
    
    /**
     * This test is similar as the one above, the main difference is we create&enqueue a server action(getComponents) 
     * in the test, this allow us to watch *that* action only via addPreSendCallback, instead of watching 
     * all actions
     * 
     * ask receiverCmp(newCmpWithValueProvider) to replace its body with couple new component(auratest:text) 
     * kill receiverCmp BEFORE the request is send. 
     */
    // JBUCH: TEST NO LONGER VALID; REWRITE OR DELETE
    _testCmpCreatedByFetchingMapFromServerWatchSingleAction:{
        attributes:{ 
            receiverCmp: "loadLevelTest:newCmpWithValueProvider",
            receiverCmpAuraId: "receiverCmp",
        },
        test:[ function(cmp) {
            this.waitForReceiverCmpCreated(cmp);
        },
        function(cmp){
            var receiverCmp = cmp.find("receiverCmp");
            var action = cmp.get("c.getComponents");
            action.setParams({
                input : 2,
            	token : "Bla"
            });

            action.setCallback(cmp, function(action){
            	var cmpArray = action.getReturnValue();
            	receiverCmp.set("v.body", cmpArray);
            });
            
            var cb_handle;
            var destroy_done = false;
            // watch for the action we gonna enqueue
            var preSendCallback = function(actions, actionToWatch) {
                if (actionToWatch) {
                	receiverCmp.destroy();
                    $A.test.addWaitForWithFailureMessage(true, 
                    		function() { return $A.test.areActionsComplete([actionToWatch]); },
                    		"Action we are watching didn't finish"
                    		);
                    //let the test know we have destroy the receiverCmp
                    destroy_done = true;
                    var errorMsg = "Invalid component tried calling function [set] with arguments [v.body,[object Object],[object Object]], markup://loadLevelTest:newCmpWithValueProvider";
                    $A.test.expectAuraError(errorMsg);
                }
            };
            cb_handle = $A.test.addPreSendCallback(action, preSendCallback);
            $A.test.addWaitFor(true, function() { return destroy_done; });

            //now enqueue the action
            $A.enqueueAction(action);
            
        }
        ]
    }
})
