({
    /**
     * Verify we can get action not accessable through current component by $A.test.getExternalAction
     * in the test down below, if we do cmp.get("c.getNamedComponent"); it will return nothing and error out
     */
    testGetExternalAction : {
        test: [function(cmp) {
            var eAction = $A.test.getExternalAction(cmp, "java://org.auraframework.impl.java.controller.TestController/ACTION$getNamedComponent",
                    {"componentName":"markup://aura:text", 'attributes':{'value':'valuable'}},
                    "java://org.auraframework.instance.component",
                    function(action){
                        $A.test.assertTrue(action.state === "SUCCESS");
                    });
            $A.test.addWaitForWithFailureMessage(true, function() { return $A.test.areActionsComplete([eAction]); },
                    "external action didn't finish");
            $A.enqueueAction(eAction);
        }]
    },

	testModifyResponseFromServer : {
		test: [
		       function(cmp) {
		    	   //let's tap into transit and modify the response
		    	   var decode_done = false;
		    	   var cb_handle;
		           
			       var modifyResponse = function (oldResponse) {
			        	var response = oldResponse["response"];
			        	//Dangerous : executeInForegroundWithReturn is part of response because perf metrics add it, if they decide to remove it in the future, we need to modify condition below
			        	if( response.indexOf("testModifyResponseFromServer") >= 0 && response.indexOf("executeInForegroundWithReturn") >= 0 && response.indexOf("recordObjCounter") >= 0) {
				        	var newResponse = {};
				    		//copy everything from oldResponse
				    		var responseText = oldResponse["responseText"];
				    		var status = oldResponse["status"];
				    		newResponse["status"] = status;
				    		newResponse["response"] = response;
				    		newResponse["responseText"] = responseText;
				    		//change recordObjCounter to 10
				    		var idx = response.indexOf("Counter");
				    		var idxNumberStart = idx;// Counter":1 
				    		var idxNumberEnd = response.indexOf(",", idx);
				    		var numberStr = response.substring(idxNumberStart, idxNumberEnd);
			    			newResponse["response"] = newResponse["response"].replace(numberStr, "Counter\": 10");
			    			newResponse["responseText"] = newResponse["responseText"].replace(numberStr, "Counter\": 10");
			    			decode_done = true;
			    			$A.test.removePreDecodeCallback(cb_handle);
			    			
			    			//new feed decode with the new response
				    		return newResponse;
			    		} else {
			    			return oldResponse;
			    		}
			    		
			    	};
			    	
			    	cb_handle = $A.test.addPreDecodeCallback(modifyResponse);
		            
		            $A.test.addWaitFor(true, function() { return decode_done; });
		    	   
		    	   //now enqueue the Action
		    	   var action = $A.test.getAction(cmp, "c.executeInForegroundWithReturn", {i:1});
				   $A.enqueueAction(action);
				   $A.test.addWaitForWithFailureMessage(true, 
						   function(){ return $A.test.areActionsComplete([action])},
						   "fail waiting for server action to finish",
						   function() {
							   $A.test.assertEquals(10, action.getReturnValue().Counter, "fail to modify return Value in response");
						   });
		       }
		]
	},
	
	testServerActionWithStoredResponseGetStorageFirst : {
		test: [
		function primeActionStorage(cmp) {
			var action = cmp.get("c.executeInForeground");
			action.setStorable();
			$A.enqueueAction(action);
			$A.test.addWaitFor(true, function(){ return $A.test.areActionsComplete([action])});
		},
		function runRefreshAction(cmp) {
			cmp._callbackDone = false;

			var action = cmp.get("c.executeInForeground");
            action.setCallback(this, function(a) {
                cmp._callbackDone = true;
            }, "SUCCESS");
            action.setStorable({
                "refresh": 0
            });

            //set up watch
            var cb_handle; var watch_done = false;
            // watch for the action we gonna enqueue
            var preSendCallback = function(actions, actionToWatch) {
                if (actionToWatch) {
                    $A.test.assertTrue(cmp._callbackDone,
                            "we should fetch response from storage first, before sending the action to server")
                    watch_done = true;
                }
            };
            cb_handle = $A.test.addPreSendCallback(action, preSendCallback);
            $A.test.addWaitFor(true, function() { return watch_done; });

            //now enqueue the action
            $A.enqueueAction(action);
        }
        ]
    },

    testIncompleteActionRefreshDoesNotInvokeCallback: {
        test: [
        function primeActionStorage(cmp) {
            var action = cmp.get("c.executeInForeground");
            action.setStorable();
            $A.enqueueAction(action);
            $A.test.addWaitFor(true, function(){ return $A.test.areActionsComplete([action])});
        },
        function runRefreshActionAndVerifyNoIncompleteCallback(cmp) {
            // Disconnect from server to force INCOMPLETE state on action
            $A.test.setServerReachable(false);
            $A.test.addCleanup(function() { $A.test.setServerReachable(true)});
            var action = cmp.get("c.executeInForeground");
            action.setCallback(this, function(a) {
                $A.test.fail("INCOMPLETE callback should not be called on refresh actions");
            }, "INCOMPLETE");
            action.setStorable({
                "refresh": 0
            });
            $A.enqueueAction(action);
            $A.test.addWaitFor(true, function(){
                return $A.test.areActionsComplete([action]) && !$A.test.isActionPending();
            });
        }]
    },

    testStoredActionInvokesCallbackWhenOffline: {
        test: [
        function primeActionStorage(cmp) {
            var action = cmp.get("c.executeInForeground");
            action.setStorable();
            $A.enqueueAction(action);
            $A.test.addWaitFor(true, function(){ return $A.test.areActionsComplete([action])});
        },
        function runRefreshActionAndVerifyNoIncompleteCallback(cmp) {
            var callbackCalled = false;
            $A.test.setServerReachable(false);
            $A.test.addCleanup(function() { $A.test.setServerReachable(true)});
            var action = cmp.get("c.executeInForeground");
            action.setCallback(this, function(a) {
                callbackCalled = true;
            }, "SUCCESS");
            action.setStorable({
                "refresh": 0
            });
            $A.enqueueAction(action);
            $A.test.addWaitFor(true, function(){
                return $A.test.areActionsComplete([action]);
            }, function() {
                $A.test.assertTrue(callbackCalled, "SUCCESS callback never called for stored action when offline");
            });
        }]
    },

    /**
     * test for bug W-2694348
     * The bug was invalid component trying to call getVersion()
     * when component version gets wrapped into an server action.
     */
    testServerActionAssociatedWithInvalidCmp : {
        test: function(cmp) {
            var callbackCalled = false;
            var action = cmp.get("c.executeInForeground");

            cmp.destroy(false);
            $A.test.assertFalse(cmp.isValid());

            $A.enqueueAction(action);
            $A.test.addWaitFor(true,
                function(){return $A.test.areActionsComplete([action]);},
                function(){
                    // associated component is invalid, so the action will be aborted
                    $A.test.assertEquals("ABORTED", action.getState());
                });
        }
    },

    testActionStatusIsIncompleteWhenOffline : {
        test: function(cmp) {
            var callbackCalled = false;
            $A.test.setServerReachable(false);
            $A.test.addCleanup(function() {$A.test.setServerReachable(true)});
            var action = cmp.get("c.executeInForeground");
            action.setCallback(this, function(a) {
                callbackCalled = true;
            }, "INCOMPLETE");

            $A.enqueueAction(action);

            $A.test.addWaitFor(true,
                function(){ return $A.test.areActionsComplete([action]); },
                function() {
                    $A.test.assertEquals("INCOMPLETE", action.getState());
                    $A.test.assertTrue(callbackCalled,
                            "INCOMPLETE callback should get called.");
                });
        }
    },

    /**
     * This test may need to be changed after W-2692868 is done.
     */
    testActionWithErrorsIsErrorState: {
        test: function(cmp) {
            var callbackCalled = false;
            var action = cmp.get("c.throwsClientOutOfSyncException");
            action.setCallback(this, function(a) {
                callbackCalled = true;
            }, "ERROR");

            $A.enqueueAction(action);

            $A.test.addWaitFor(true,
                function(){ return $A.test.areActionsComplete([action]); },
                function() {
                    $A.test.assertEquals("ERROR", action.getState());
                    $A.test.assertTrue(callbackCalled,
                            "ERROR callback should get called.");
                });
        }
    },

    /**
     * Test the server side action is a background action
     */
    testServerActionIsBackground : {
        test : function(component) {
            var foregroundAction = component.get("c.executeInForeground");
            $A.test.assertFalse(foregroundAction.isBackground(),
                    "foreground action should have had isBackground === false");
            var foregroundActionWR = component.get("c.executeInForegroundWithReturn");
            $A.test.assertFalse(foregroundActionWR.isBackground(),
                    "foreground action with return should have had isBackground === false");
            var backgroundAction = component.get("c.executeInBackground");
            $A.test.assertTrue(backgroundAction.isBackground(),
                    "background action should have had isBackground === true");
            var backgroundActionWR = component.get("c.executeInBackgroundWithReturn");
            $A.test.assertTrue(backgroundActionWR.isBackground(),
                    "background action with return should have had isBackground === true");

            var wasFG = component.get("c.executeInForeground");
            wasFG.setBackground(true);
            $A.test.assertTrue(wasFG.isBackground(), "wasFG action should have had isBackground set to true");
            var stillBG = component.get("c.executeInBackground");
            stillBG.setBackground(false);
            $A.test.assertTrue(stillBG.isBackground(), "stillBG action should not have had isBackground set to false");
        }
    },

    testEnqueuedCallbackJavascriptError : {
        test : function(cmp) {
            $A.test.expectAuraWarning("Callback failed: java://org.auraframework.impl.java.controller.ParallelActionTestController/ACTION$executeInForeground");
            $A.test.expectAuraError("this is intentional");
            var a = $A.test.getAction(cmp, "c.executeInForeground", null, function() {
                throw new Error("this is intentional");
            });
            $A.run(function() { $A.enqueueAction(a); });
            $A.test.addWaitFor(true, function() { return $A.test.areActionsComplete([a]); });
        }
    },

    testRunActionsCallbackJavascriptError : {
        test : function(cmp) {
            $A.test.expectAuraError("this is intentional");
            var a = $A.test.getAction(cmp, "c.executeInForeground", null, function() {
                throw new Error("this is intentional");
            });
            $A.enqueueAction(a);
            $A.test.addWaitFor(true, function() { return $A.test.areActionsComplete([a]); });
        }
    },

    testServerActionSendsError : {
        test : [ function(cmp) {
                var a = $A.test.getAction(cmp, "c.errorInForeground", null,
                      function(action) {
                          cmp.set("v.errorMessage", action.error[0].message);
                      });
                $A.enqueueAction(a);
                $A.test.addWaitFor(true, function() {
                        return !!cmp.get("v.errorMessage");
                    });
            }, function(cmp) {
                 var message = cmp.get("v.errorMessage");
                 $A.test.assertTrue(message.indexOf("ArrayIndexOutOfBoundsException: 42") > 0,
                     "Wrong message received from server: " + message);
            }]
    },

    /**
     * When requesting a component via an action, the returned config should be consumed on the client in the Action
     * callback. If it is not, a warning should be logged.
     */
    testUnconsumedPartialConfigsLogsWarning : {
        test : function(cmp) {
            $A.test.expectAuraWarning("unused configs");
            var action = $A.get("c.aura://ComponentController.getComponent");
            action.setParams({
                "name" : "markup://loadLevelTest:serverComponent"
            });
            action.setCallback(this, function(a) {
                if (a.getState() === "SUCCESS") {
                    // Here is where the config should normally be consumed
                }
            });
            $A.run(function(){
                $A.enqueueAction(action);
            });

            $A.test.addWaitFor(false, $A.test.isActionPending, function(){
                // This test will fail if we don't get the warning specificed by the $A.test.expectAuraWarning()
                // call above. This wait is just to ensure the Action code finishes.
            });
        }
    },

    /**
     * Storable actions without a callback are a special case and should have their unused component configs cleared
     * automatically without an error or warning.
     */
    testClearingPartialConfigsOnStorableActions : {
        failOnWarning: true,
        test : function(cmp) {
            // Run storable action (no callback) that has unconsumed component configs
            var actionStorable = $A.get("c.aura://ComponentController.getComponent");
            actionStorable.setStorable();
            actionStorable.setParams({
                "name" : "markup://loadLevelTest:serverComponent"
            });
            $A.run(function(){
                $A.enqueueAction(actionStorable);
            });

            // Wait for storable action to complete
            $A.test.addWaitFor(false, $A.test.isActionPending, function(){
                var action = $A.get("c.aura://ComponentController.getComponent");
                action.setParams({
                    "name" : "markup://loadLevelTest:serverComponent"
                });
                action.setCallback(this, function(a) {
                    if (a.getState() === "SUCCESS") {
                        // Consume config to avoid warning/error
                        $A.newCmpDeprecated(a.getReturnValue());
                    }
                });

                // Run another action to verify there are no lingering configs from previous storable action
                $A.run(function() {
                    $A.enqueueAction(action);
                });
                $A.test.addWaitFor(false, $A.test.isActionPending, function(){ });
            });
        }
    },

    /**
     * When a stored action fails in Action.js#finishAction we enqueue a retry action. Verify the following:
     * 1. We get a warning saying the cached action failed and we're retrying from server.
     * 2. The error message box is not displayed to users when the stored action fails.
     * 3. The server action is enqueued and ran successfully.
     */
    testStorableRetry: {
        test : [ function(cmp) {
            // prime storage
            var a = $A.test.getAction(cmp, "c.executeInForeground", undefined);
            a.setStorable();
            $A.enqueueAction(a);
            $A.test.addWaitFor(true, function() { return $A.test.areActionsComplete([a]); });
        }, function(cmp) {
            var errorMsg = "Action callback error from test",
                warningMsg = "Finishing cached action failed. Trying to refetch from server",
                errorThrown = false,
                that = this;

            // Actions from storage will log a warning instead of displaying error box
            $A.test.expectAuraWarning(warningMsg);
            $A.test.expectAuraError(errorMsg);
            var a = $A.test.getAction(cmp, "c.executeInForeground", undefined, function(a) {
                if (!errorThrown) {
                    // First callback is action from storage
                    $A.test.assertTrue(a.isFromStorage(), "First action callback should be from storage");
                    errorThrown = true;
                    $A.error(errorMsg);
                    throw new Error("Thrown by test");
                } else {
                    // Second callback is retry action from server. Error from stored action should not be present.
                    $A.test.assertFalse(a.isFromStorage(), "Second action callback should be from server");
                    $A.test.assertFalse(that.isAuraErrorDivVisible());
                }
            });
            a.setStorable();
            $A.enqueueAction(a);
            $A.test.addWaitFor(true, function() { return $A.test.areActionsComplete([a]); });
        }]
    },

    /**
     * Verify when a retry action from the server fails the error is properly displayed to the user.
     */
    testStorableRetry_errorOnRetry: {
        test : [ function(cmp) {
            // prime storage
            var a = $A.test.getAction(cmp, "c.executeInForeground", undefined);
            a.setStorable();
            $A.enqueueAction(a);
            $A.test.addWaitFor(true, function() { return $A.test.areActionsComplete([a]); });
        }, function(cmp) {
            var errorMsg = "Action callback error from test",
                warningMsg = "Finishing cached action failed. Trying to refetch from server",
                thrownErrorMsg = "Thrown by test",
                that = this;

            // Actions from storage log a warning instead of displaying error box
            $A.test.expectAuraWarning(warningMsg);
            // Expect 3 errors in the test. 2 from our $A.error calls in the action callback below, and 1 for the
            // error thrown in the callback of the retry action. We only see the error once because the first
            // error thrown on the action from storage is intentionally swallowed.
            $A.test.expectAuraError(errorMsg);
            $A.test.expectAuraError(errorMsg);
            $A.test.expectAuraError(thrownErrorMsg);
            var a = $A.test.getAction(cmp, "c.executeInForeground", undefined, function(a) {
                $A.error(errorMsg);
                if (a.isFromStorage()) {
                    // Verify no error message displayed on action from storage
                    $A.test.assertFalse(that.isAuraErrorDivVisible());
                } else {
                    // Verify error message displayed from retry action
                    $A.test.assertTrue(that.isAuraErrorDivVisible());
                    var error = $A.test.getAuraErrorMessage();
                    $A.test.assertTrue(error.indexOf(errorMsg) !== -1);
                }
                throw new Error(thrownErrorMsg);
            });
            a.setStorable();
            $A.enqueueAction(a);
            $A.test.addWaitForWithFailureMessage(true,
                    function() {
                        var error = $A.test.getAuraErrorMessage();
                        return error.indexOf(thrownErrorMsg) !== -1;
                    },
                    "Error div never displayed error thrown from retry action callback"
            );
        }]
    },

    isAuraErrorDivVisible: function() {
        var element = $A.util.getElement("auraErrorMessage");
        return element.offsetWidth > 0 && element.offsetHeight > 0;
    },

    /************************************ Test for Concurrent Server Action starts ***********************************/
    /*
     * enqueue two actions with same signature, go offline, verify both of them return with INCOMPLETE
     */
    testConcurrentServerActionsBothIncomplete : {
        test : [ function doTest(cmp) {
            var currentTransactionId = $A.getCurrentTransactionId();
            //create two actions with same signature
            //also set current transcationId to be the same as first abortable action
            var a1 = $A.test.getAction(cmp, "c.executeInForegroundWithReturn", {i:2});
            var a2 = $A.test.getAction(cmp, "c.executeInForegroundWithReturn", {i:2});
            a1.setStorable();
            a2.setStorable();
            //do some sanity check callbacks
            a1.setCallback(cmp, function(action) {
                $A.test.assertTrue(action.isFromStorage() === false, "1st action should get response from server");
            });
            a2.setCallback(cmp, function(action) {
                $A.test.assertTrue(action.isFromStorage() === false, "2st action should get response from 1st action");
            });
            //let's cut the server so we don't get any response
            $A.test.setServerReachable(false);
            //make sure both actions get schedule to send in a same XHR box
            $A.run(
                    function() {
                        $A.enqueueAction(a1);
                        $A.enqueueAction(a2);
                    }
            );
            //need to make sure both actions return as INCOMPLETE
            $A.test.addWaitForWithFailureMessage(true,
                    function() { return (a1.state==="INCOMPLETE")},
                    "fail waiting for action 1 return with state=INCOMPLETE"
            );

            $A.test.addWaitForWithFailureMessage(true,
                    function() { return (a2.state==="INCOMPLETE"); },
                    "fail waiting for action 2 return with state=INCOMPLETE"
            );
        }, function reconnectTheServer(cmp) {
            $A.test.setServerReachable(true);
        }]
    },


    /**
     * We enqueue two foreground abortable actions with same action sigature (a1 & a2). Drop server connection right 
     * before we send a1 out (a2 is a dupe of a1, we don't send a2 out)
     * Right after we send them out, another foreground abortable action was enqueued(a4), which will push TransactionId
     * forward by1
     * When we deal with response for a1, server is offline already, we have no response, a1 was aborted because it has
     * old transactionId, a2 was aborted because it's a dupe of a1. 
     * 
     * NOTE:
     * Four places we do action.abort() on AuraClientSrevice: this test 3rd place in AuraClientService.processIncompletes().
     * 1st is test in testAbortQueuedAbortable, 2nd by testAbortInFlightAbortable , 4th by testAbortStorable,
     * all in enqueueActionTest.js
     */
    testConcurrentActionGetAbortedDuringReceive : {
    	test: [
    	       function enqueueConcurrentActions(cmp) {
    	    	   var testCompleted = false;
    	    	   //get two actions with same signature
    	    	   var a1 = $A.test.getAction(cmp, "c.executeInForegroundWithReturn", {i:2});
                   var a2 = $A.test.getAction(cmp, "c.executeInForegroundWithReturn", {i:2});
    	    	   //let's drop offline right before sending a1, go offline right after sending is too late
                   var preSendCallback = function(actions, actionToWatch) {
                       if(actionToWatch) {
                     	  //go offline
                     	  $A.test.setServerReachable(false);
                       }
                       //we only need to do this callback once, once we are done, remove it
                       $A.test.removePrePostSendCallback(cb_handle2);
                   }
                   var cb_handle2 = $A.test.addPreSendCallback(a1, preSendCallback);
                   var postSendCallback = function(actions, actionToWatch) {
                      if(actionToWatch) {
                    	  //push TransactionId forward
                    	  var a4 = $A.test.getAction(cmp, "c.executeInForegroundWithReturn", {i:4});
	                      a4.setAbortable();
	                      $A.run(
	                                  function() {    $A.enqueueAction(a4);  }
	                      );
                      }
                      //we only need to do this callback once, once we are done, remove it
                      $A.test.removePreSendCallback(cb_handle);
                  }
                  var cb_handle = $A.test.addPostSendCallback(a1, postSendCallback);
                  //let's make sure a1 & a2 did finish
                  $A.test.addWaitForWithFailureMessage(true, function() { return $A.test.areActionsComplete([a1,a2]); }, 
                		  "a1&a2 finish",
                		  function() {
                	  			//we abort a1 and a2 in receive() after we enqueue a4
                                $A.test.assertEquals("ABORTED", a1.getState(), "a1 should get aborted");
                                $A.test.assertEquals("ABORTED", a2.getState(), "a2 should get aborted");
                                $A.test.setServerReachable(true);//go online
                  });
                  //enqueue a1 and a2 with same signature, we will only send out a1, keep a1 in the actionsDeferred queue, a2 is stored as a1's dupe.
                   a1.setStorable(); 
                   a2.setStorable(); 
                   $A.run(
                           function() {
                               $A.enqueueAction(a1);
                               $A.enqueueAction(a2);
                           }
                   );
    	       }
    	]
    },

    /*
     * two concurrent background actions, 2nd action get copy of 1st's response
     */
    testConcurrentBackgroundServerActionsBothStorable : {
        test : [ function(cmp) {
            var a1Return = undefined, a2Return = undefined;
            var recordObjCounterFromA1 = undefined;
            //create two actions with same signature
            var a1 = $A.test.getAction(cmp, "c.executeInBackgroundWithReturn", {i:1});
            var a2 = $A.test.getAction(cmp, "c.executeInBackgroundWithReturn", {i:1});
            a1.setStorable();
            a2.setStorable();
            //we check response in callbacks
            a1.setCallback(cmp, function(action) {
                $A.test.assertFalse(action.isFromStorage(), "1st action should get response from server");
                a1Return = action.getReturnValue();
                $A.test.assertEquals(1, a1Return.Counter, "counter of 1nd action should be 1");
                recordObjCounterFromA1 = a1Return.recordObjCounter;
                $A.test.assertTrue(recordObjCounterFromA1!==undefined, "expect to get recordObjCounter from 1st action");
            });
            a2.setCallback(cmp, function(action) {
                $A.test.assertFalse(action.isFromStorage(), "2nd action should get response from 1st, but not from storage");
                a2Return = action.getReturnValue();
                $A.test.assertEquals(1, a2Return.Counter, "counter of 2nd action should be 1");
                $A.test.assertEquals(recordObjCounterFromA1, a2Return.recordObjCounter, "2nd action should get a copy response from 1st action");
            });
            //make sure both ations get schedule to send in a same XHR box
            $A.run ( function() {
                $A.enqueueAction(a1);
                $A.enqueueAction(a2);
                }
            );

            //just need to make sure both actions get some return
            $A.test.addWaitForWithFailureMessage(true,
                    function() { return (a1Return!==undefined); },
                    "fail waiting for action1 returns something"
            );
            $A.test.addWaitForWithFailureMessage(true,
                    function() { return (a2Return!==undefined); },
                    "fail waiting for action2 returns something"
            );
        }
        ]
    },

    /*
     * we enqueue two server frontend action with identical action signature
     * 1st action get send to server then return with ERROR state
     * 2nd will copy the error response from 1st one.
     */
    testConcurrentServerActionsBothStorable1stActionErrorOut : {
        test : [ function(cmp) {
            //create two actions with same signature
            var a1 = $A.test.getAction(cmp, "c.errorInForeground", null);
            var a2 = $A.test.getAction(cmp, "c.errorInForeground", null);
            a1.setStorable();
            a2.setStorable();
            //we check response in callbacks
            a1.setCallback(cmp, function(action) {
                $A.test.assertFalse(action.isFromStorage(), "1st action should get response from server");
                $A.test.assertEquals("ERROR", action.state, "we expect 1st action to error out on server");
                $A.test.assertTrue(action.error[0].message.indexOf("ArrayIndexOutOfBoundsException: 42") > 0,
                        "expect error message from 1st action");
            });
            a2.setCallback(cmp, function(action) {
                $A.test.assertFalse(action.isFromStorage(), "2st action should get response from 1st action");
                $A.test.assertEquals("ERROR", action.state, "we expect 2nd action to get error response like 1st action");
                $A.test.assertTrue(action.error[0].message.indexOf("ArrayIndexOutOfBoundsException: 42") > 0,
                        "expect error message from 2nd action");
            });
            //make sure both ations get schedule to send in a same XHR box
            $A.run(
                    function() {
                        $A.enqueueAction(a1);
                        $A.enqueueAction(a2);
                    }
            );
            //just need to make sure both actions get some return
            $A.test.addWaitForWithFailureMessage(true,
                    function() { return (a1.state==="ERROR")&&(a2.state==="ERROR"); },
                    "fail waiting for both action return ERROR"
            );

        }]
    },

    /*
     * test server actions with same signature get schedule to send in a same XHR
     * both are storable
     * only the first action get to send to the server. second one get response from the 1st one
     */
    testConcurrentServerActionsBothStorable : {
        test : [ function(cmp) {
            var a1Return = undefined, a2Return = undefined;
            var recordObjCounterFromA1 = undefined;
            //create two actions with same signature
            var a1 = $A.test.getAction(cmp, "c.executeInForegroundWithReturn", {i : 1});
            var a2 = $A.test.getAction(cmp, "c.executeInForegroundWithReturn", {i : 1});
            a1.setStorable();
            a2.setStorable();
            //we check response in callbacks
            a1.setCallback(cmp, function(action) {
                $A.test.assertFalse(action.isFromStorage(), "1st action should get response from server");
                a1Return = action.getReturnValue();
                $A.test.assertEquals(1, a1Return.Counter, "counter of 1nd action should be 1");
                recordObjCounterFromA1 = a1Return.recordObjCounter;
                $A.test.assertTrue(recordObjCounterFromA1!==undefined, "expect to get recordObjCounter from 1st action");
            });
            a2.setCallback(cmp, function(action) {
                $A.test.assertFalse(action.isFromStorage(), "2nd action should get response from 1st, but not from storage");
                a2Return = action.getReturnValue();
                $A.test.assertEquals(1, a2Return.Counter, "counter of 2nd action should be 1");
                $A.test.assertEquals(recordObjCounterFromA1, a2Return.recordObjCounter, "2nd action should get a copy response from 1st action");
            });
            //make sure both ations get schedule to send in a same XHR box
            $A.run(
                    function() {
                        $A.enqueueAction(a1);
                        $A.enqueueAction(a2);
                    }
            );
            //just need to make sure both actions get some return
            $A.test.addWaitForWithFailureMessage(true,
                    function() { return (a1Return!==undefined); },
                    "fail waiting for action 1 returns something"
            );
            $A.test.addWaitForWithFailureMessage(true,
                    function() { return (a2Return!==undefined); },
                    "fail waiting for action 2 returns something"
            );
        }
        ]
    },

    /*
     * enqueue two server actions with same signature, the action has response in storage.
     * both of them will read response from storage first.
     * then we send two refresh actions.
     * Note1: for refresh actions, 2nd one is not 1st one's dupe, they both go to server
     * Note2: server action we enqueue here go to server, increase recordObjCounter, and bring it back,
     * that's why we check new counter = old counter+2 at the end of the test, and also why this test is threadHostile
     */
    testConcurrentServerActionsBothStorableWithResponseStored : {
        labels : [ "threadHostile" ],
        test : [ function primeActionStorage(cmp) {
            var a0 = $A.test.getAction(cmp, "c.executeInForegroundWithReturn", {i : 1});
            a0.setStorable();
            cmp._storageKey = a0.getStorageKey();
            $A.enqueueAction(a0);
            $A.test.addWaitForWithFailureMessage(true, function(){
                return $A.test.areActionsComplete([a0]) && !$A.test.isActionPending();
            }, "a0 doesn't finish",
            function() {
                cmp._counter = a0.getReturnValue().recordObjCounter;
            });
        }, function enqueueTwoActionWithSameSignature(cmp) {
            var recordObjCounterFromA1 = undefined;
            //create two actions with same signature
            var a1 = $A.test.getAction(cmp, "c.executeInForegroundWithReturn", {i : 1});
            var a2 = $A.test.getAction(cmp, "c.executeInForegroundWithReturn", {i : 1});
            a1.setStorable();
            a2.setStorable();
            a1.setStorable({  "refresh": 0 });
            a2.setStorable({  "refresh": 0 });

            //both ations get schedule to send in a same XHR box
            $A.enqueueAction(a1);
            $A.enqueueAction(a2);

            $A.test.addWaitForWithFailureMessage(true,
                    function() { return $A.test.areActionsComplete([a1, a2]) },
                    "fail waiting for action1 and 2 to finish",
                    function() {
                        $A.test.assertTrue(a1.isFromStorage(), "1st action should get response from storage");
                        $A.test.assertTrue(a2.isFromStorage(), "2st action should get response from storage");
                    }
            );
        }, function bothRefreshActionsGoToServer(cmp) {
            $A.test.addWaitForWithFailureMessage(true, function() {
                var res = $A.storageService.getStorage("actions").get(cmp._storageKey).then(
                        function(item) { cmp._newCounter = item.value.returnValue.recordObjCounter; });
                return cmp._newCounter&&(cmp._newCounter == cmp._counter+2);
            }, "fail to update stored response");
        }
        ]
    },

    /*
     * test server actions with same signature get schedule to send in a same XHR
     * only 2nd are storable
     * both actions get to send to the server
     */
    testConcurrentServerActions1stNonstorable : {
        test : [ function(cmp) {
            var a1Return = undefined, a2Return = undefined;
            var recordObjCounterFromA1 = undefined;
            //create two actions with same signature
            var a1 = $A.test.getAction(cmp, "c.executeInForegroundWithReturn", {i : 1});
            var a2 = $A.test.getAction(cmp, "c.executeInForegroundWithReturn", {i : 1});
            a2.setStorable();
            //we check response in callbacks
            a1.setCallback(cmp, function(action) {
                $A.test.assertFalse(action.isFromStorage(), "1st action should get response from server");
                a1Return = action.getReturnValue();
                $A.test.assertEquals(1, a1Return.Counter, "counter of 1nd action should be 1");
                recordObjCounterFromA1 = a1Return.recordObjCounter;
                $A.test.assertTrue(recordObjCounterFromA1!==undefined, "expect to get recordObjCounter from 1st action");
            });
            a2.setCallback(cmp, function(action) {
                $A.test.assertFalse(action.isFromStorage(), "2nd action should get response from server, as 1st isn't storable");
                a2Return = action.getReturnValue();
                $A.test.assertEquals(1, a2Return.Counter, "counter of 2nd action should be 1");
                $A.test.assertTrue(a2Return.recordObjCounter > recordObjCounterFromA1, "2nd action should get response from server, after 1st");
            });
            //make sure both ations get schedule to send in a same XHR box
            $A.run(
                    function() {
                        $A.enqueueAction(a1);
                        $A.enqueueAction(a2);
                    }
            );
            //just need to make sure both actions get some return
            $A.test.addWaitForWithFailureMessage(true,
                    function() { return (a1Return!==undefined); },
                    "fail waiting for action 1 returns something"
            );
            $A.test.addWaitForWithFailureMessage(true,
                    function() { return (a2Return!==undefined); },
                    "fail waiting for action 2 returns something"
            );
        }
        ]
    },

    /*
     * test server actions with same signature get schedule to send in a same XHR
     * only 1st is storable
     * both action get the send to server
     */
    testConcurrentServerActions2ndNonstorable : {
        test : [ function(cmp) {
            var a1Return = undefined, a2Return = undefined;
            var recordObjCounterFromA1 = undefined;
            //create two actions with same signature
            var a1 = $A.test.getAction(cmp, "c.executeInForegroundWithReturn", {i : 1});
            var a2 = $A.test.getAction(cmp, "c.executeInForegroundWithReturn", {i : 1});
            a2.setStorable();
            //we check response in callbacks
            a1.setCallback(cmp, function(action) {
                $A.test.assertFalse(action.isFromStorage(), "1st action should get response from server");
                a1Return = action.getReturnValue();
                $A.test.assertEquals(1, a1Return.Counter, "counter of 1nd action should be 1");
                recordObjCounterFromA1 = a1Return.recordObjCounter;
                $A.test.assertTrue(recordObjCounterFromA1!==undefined, "expect to get recordObjCounter from 1st action");
            });
            a2.setCallback(cmp, function(action) {
                $A.test.assertFalse(action.isFromStorage(), "2nd action should send to server");
                a2Return = action.getReturnValue();
                $A.test.assertEquals(1, a2Return.Counter, "counter of 2nd action should be 1");
                $A.test.assertTrue(a2Return.recordObjCounter > recordObjCounterFromA1, "2nd action should send to server, after 1st");
            });
            //make sure both ations get schedule to send in a same XHR box
            $A.run(
                    function() {
                        $A.enqueueAction(a1);
                        $A.enqueueAction(a2);
                    }
            );
            //just need to make sure both actions get some return
            $A.test.addWaitForWithFailureMessage(true,
                    function() { return (a1Return!==undefined); },
                    "fail waiting for action1 returns something"
            );
            $A.test.addWaitForWithFailureMessage(true,
                    function() { return (a2Return!==undefined); },
                    "fail waiting for action2 returns something"
            );
        }
        ]
    }
})
