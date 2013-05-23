({
	setUp : function(component){
    	$A.storageService.getStorage("actions").clear();
    },
    
    testStorageOfServerAction:{
        test:function(cmp){
        	var storage = $A.storageService.getStorage("actions");
			cmp.find("button").getEvent("press").fire();
			for (var n = 1; n <= 10; n++) {
				(function() {
					var action;
					var key = "java://org.auraframework.java.controller.ServerStorableActionController/" +
							"ACTION$storedAction:{\"message\":\"some really cool message #" + n + "\"}";
					var expected = "[from server] some really cool message #" + n;
	
					$A.test.addWaitFor(true, function() {
						// Wait until ServerStorableActionController.storedAction is present in storage
						storage.get(key, function(item) {
							action = item;
						});
						
						return action !== undefined;
					}, function() {
						$A.test.assertEquals(expected, action["returnValue"]);
					});
				})();
			}
        }
    },
    /**
     * Verify that an action which accepts simple values as parameters can be marked as storable at the server.
     * Also verify that the same action can be fetched from auraStorage at the client.
     */
    testStorageOfServerActionWithSimpleValues:{
    	test:[function(cmp){
    		 $A.test.setTestTimeout(30000);
    		this.resetCounter(cmp, "testStorageOfServerActionWithSimpleValues");
    	},function(cmp){ 
    		//Run the action that sets up other actions to be storable
    		this.initiateServerAction(cmp, "testStorageOfServerActionWithSimpleValues", 
    				["java://org.auraframework.java.controller.ServerStorableActionController/ACTION$simpleValuesAsParams"] );
            $A.test.addWaitFor(false, $A.test.isActionPending,
                    function(){
            			var storedAction = cmp.get("c.simpleValuesAsParams");
            			//Order of parameter should not matter for storage key
            			storedAction.setParams({mvp: "Buster Posey", year: 2012, 
            				testName: "testStorageOfServerActionWithSimpleValues"});
            			var storageKey = storedAction.getStorageKey();
            			//Check if storage service has the expected action
            			$A.storageService.getStorage("actions").get(storageKey, function(response){
            				if(response){
            					//If the action was stored, make sure it succeeded and return value is correct
            					$A.test.assertEquals("SUCCESS", response.state);
            					$A.test.assertEquals("Message 1 : Buster Posey was the MVP in 2012", response.returnValue);
            				}else{
            					//If the action was not stored, fail
            					$A.test.fail("Storage service does not have the response for the " +
            							"following action:c.simpleValuesAsParams");
            				}
            			});
                    });
    	},function(cmp){
    		//Run the action which is stored, expect to get the stored response
    		var action = cmp.get("c.simpleValuesAsParams");
			action.setParams({mvp: "Buster Posey", year: 2012, testName: "testStorageOfServerActionWithSimpleValues"});
    		action.setStorable();
    		$A.enqueueAction(action);
    		$A.eventService.finishFiring();
    		$A.test.addWaitFor("SUCCESS", function(){return action.getState()},
                    function(){
    					$A.test.assertTrue(action.isFromStorage(), "Should have cached the action response.");
                        $A.test.assertEquals("Message 1 : Buster Posey was the MVP in 2012", action.getReturnValue(), 
                        		"Unexpected action response from cache");
                    });
    	}, function(cmp){//Force the action to run at server
    		var action = cmp.get("c.simpleValuesAsParams");
			action.setParams({mvp: "Buster Posey", year: 2012, testName: "testStorageOfServerActionWithSimpleValues"});
    		$A.enqueueAction(action);
    		$A.eventService.finishFiring();
    		$A.test.addWaitFor("SUCCESS", function(){return action.getState()},
                    function(){
    					$A.test.assertFalse(action.isFromStorage(), "Should have fetched the action response from server.");
                        $A.test.assertEquals("Message 2 : Buster Posey was the MVP in 2012", action.getReturnValue(), 
                        		"Failed to get updated response from server.");
                    });
    	}
    	]
    },
    /**
     * Verify that an action which accepts lists and advanced data types can be marked as storable at the server.
     * This will verify that such actions and their parameters are serialized correctly.
     */
    testStorageOfServerActionWithListValues:{
    	test:[function(cmp){
    		$A.test.setTestTimeout(30000);
   		 	this.resetCounter(cmp, "testStorageOfServerActionWithListValues");
    	},function(cmp){
    		this.initiateServerAction(cmp, "testStorageOfServerActionWithListValues", 
    				["java://org.auraframework.java.controller.ServerStorableActionController/ACTION$complexValuesAsParams"]);
            $A.test.addWaitFor(false, $A.test.isActionPending,
                    function(){
            			var storedAction = cmp.get("c.complexValuesAsParams");
            			//Order of parameter should not matter for storage key
            			storedAction.setParams({players: ["Buster Posey", "Pablo Sandavol", "Angel Pagan"], 
            				testName: "testStorageOfServerActionWithListValues"});
            			var storageKey = storedAction.getStorageKey();
            			//Check if storage service has the expected action
            			$A.storageService.getStorage("actions").get(storageKey, function(response){
            				if(response){
            					//If the action was stored, make sure it succeeded and return value is correct
            					$A.test.assertEquals("SUCCESS", response.state);
            					$A.test.assertEquals("Message 1 : Team contains Buster Posey, Pablo Sandavol, Angel Pagan, ", 
            							response.returnValue);
            				}else{
            					//If the action was not stored, fail
            					$A.test.fail("Storage service does not have the response for the following " +
            							"action:c.complexValuesAsParams");
            				}
            			});
                    });
    	}
    	]
    },
    /**
     * Verify that server actions marked as storable at the serverside are not stored if they fail. 
     */
    testStorageOfFailedServerActions:{
    	test:[function(cmp){
    		$A.test.setTestTimeout(30000);
   		 	this.resetCounter(cmp, "testStorageOfFailedServerActions");
    	},function(cmp){
    		this.initiateServerAction(cmp, "testStorageOfFailedServerActions", 
    				["java://org.auraframework.java.controller.ServerStorableActionController/ACTION$throwsException"]);
    		$A.test.addWaitFor(false, $A.test.isActionPending,
                    function(){
            			var storedAction = cmp.get("c.throwsException");
            			//Order of parameter should not matter for storage key
            			storedAction.setParams({testName: "testStorageOfFailedServerActions"});
            			var storageKey = storedAction.getStorageKey();
            			//Check if failed action was stored.
            			$A.storageService.getStorage("actions").get(storageKey, function(response){
            				if(response){
            					//If the action was stored, fail
            					$A.test.fail("Failed actions should not be stored.");
            				}
            			});
                    });
    	},function(cmp){//Run the action and get the response, verify this is the second run
    		var action = cmp.get("c.throwsException");
			action.setParams({testName: "testStorageOfFailedServerActions"});
    		$A.enqueueAction(action);
    		$A.eventService.finishFiring();
    		$A.test.addWaitFor(false, $A.test.isActionPending,
                    function(){
    					$A.test.assertEquals("ERROR", action.getState(), 
                			"Test setup failure, expected the action to error");
    					$A.test.assertFalse(action.isFromStorage(), "Failed action should be refetched from server");
                        $A.test.assertTrue(action.getError()[0].message.indexOf("Message 2") != -1);
                    });
    	}]
    },
    //W-1554547- Calling an action which expects parameters by not setting any params will cause NullPointerException
    _testStorageofActionWithNoParams:{
    	test:[function(cmp){
	   		$A.test.setTestTimeout(30000);
	   		this.resetCounter(cmp, "testStorageofActionWithNoParams");
	   	},function(cmp){ 
	   		//Run the action that sets up other actions to be storable
	   		this.initiateServerAction(cmp, "testStorageofActionWithNoParams", 
	   				["java://org.auraframework.java.controller.ServerStorableActionController/ACTION$returnNothing"] );
	        $A.test.addWaitFor(false, $A.test.isActionPending,
	                   function(){
	           			var action = cmp.get("c.returnNothing");
	           			var storageKey = action.getStorageKey();
	           			//Check if storage service has the expected action
	           			$A.storageService.getStorage("actions").get(storageKey, function(response){
	           				if(response){
	           					//If the action was stored, make sure it succeeded and return value is correct
	           					$A.test.assertEquals("SUCCESS", response.state);
	           					$A.test.assertFalsy(response.returnValue, "Action should have no return value");
	           				}else{
	           					//If the action was not stored, fail
	           					$A.test.fail("Storage service does not have the response " +
	           							"for the following action:c.returnNothing");
	           				}
	           			});
	           			action.setStorable();
	            		$A.enqueueAction(action);
	            		$A.eventService.finishFiring();
	            		$A.test.addWaitFor("SUCCESS", function(){return action.getState()},
	                            function(){
	            					$A.test.assertTrue(action.isFromStorage(), "Should have cached the action response.");
	                                $A.test.assertFalsy(action.getReturnValue(), 
	                                		"Action should have no return value");
	                            });
	                   });
	   	}]
    },
    //W-1554571 - Attaching actions at client and not marking them to be stored will cause JS errors
    _testChainingUnstoredAction:{
    	test:[function(cmp){
    		$A.test.setTestTimeout(30000);
	   		this.resetCounter(cmp, "testChainingUnstoredAction");
    	},function(cmp){
    		this.initiateServerAction(cmp, "testChainingUnstoredAction", 
    				["java://org.auraframework.java.controller.ServerStorableActionController/ACTION$unStoredAction"]);
    		$A.test.addWaitFor(false, $A.test.isActionPending,
                    function(){
            			var unstoredAction = cmp.get("c.unStoredAction");
            			unstoredAction.setParams({testName: "testChainingUnstoredAction"});
            			var storageKey = unstoredAction.getStorageKey();
            			//Check if action was stored.
            			$A.storageService.getStorage("actions").get(storageKey, function(response){
            				if(response){
            					//If the action was stored, fail
            					$A.test.fail("Action was not marked to be stored.");
            				}
            			});
                    });
    	}]
    },
    testComponentsFromStoredServerAction:{
    	test:[function(cmp){
    		$A.test.setTestTimeout(30000);
	   		this.resetCounter(cmp, "testComponentsFromStoredServerAction");
    	}, function(cmp){
    		//Run the action that sets up other actions to be storable
    		this.initiateServerAction(cmp, "testComponentsFromStoredServerAction", 
    				["java://org.auraframework.java.controller.ServerStorableActionController/ACTION$getComponent"] );
            $A.test.addWaitFor(false, $A.test.isActionPending,
                    function(){
            			var storedAction = cmp.get("c.getComponent");
            			storedAction.setParams({testName: "testComponentsFromStoredServerAction"});
            			var storageKey = storedAction.getStorageKey();
            			//Check if storage service has the expected action
            			$A.storageService.getStorage("actions").get(storageKey, function(response){
            				if(response){
            					//If the action was stored, make sure it succeeded and return value is correct
            					$A.test.assertEquals("SUCCESS", response.state);
            				}else{
            					//If the action was not stored, fail
            					$A.test.fail("Storage service does not have the response " +
            							"for the following action:c.getComponent");
            				}
            			});
                    });
    	}, 
    	// Verify that components can be created with cached action response
    	function(cmp){
    		//Run the action which is stored, create a component with the response
    		var action = cmp.get("c.getComponent");
			action.setParams({testName: "testComponentsFromStoredServerAction"});
    		action.setStorable();
    		action.setCallback(cmp, function(a){
    			var newComponent = $A.newCmpDeprecated(a.getReturnValue());
                cmp.find("facet").getValue("v.body").clear();
                //Insert newly fetched component
                cmp.find("facet").getValue("v.body").push(newComponent);
    		});
    		$A.enqueueAction(action);
    		$A.eventService.finishFiring();
    		$A.test.addWaitFor("SUCCESS", function(){return action.getState()},
                    function(){
    					$A.test.assertTrue(action.isFromStorage(), "Should have cached the action response.");
                    });
    		$A.test.addWaitFor("National League",function(){
    		    				var facet = cmp.get("facet").get('v.body')[0];
    		    				return $A.test.getTextByComponent(facet.find("Division"));
    		    			});
    	}, 
    	//Verify that components can be created multiple times with the same action response
    	function(cmp){
    		var dupAction = cmp.get("c.getComponent");
    		dupAction.setParams({testName: "testComponentsFromStoredServerAction"});
    		dupAction.setStorable();
    		dupAction.setCallback(cmp, function(a){
    			var secondNewComponent = $A.newCmpDeprecated(a.getReturnValue());
    			//push newly fetched component
                cmp.find("facet").getValue("v.body").push(secondNewComponent);
    		});
    		$A.enqueueAction(dupAction);
    		$A.eventService.finishFiring();
    		$A.test.addWaitFor("SUCCESS", function(){return dupAction.getState()},
                    function(){
    					$A.test.assertTrue(dupAction.isFromStorage(), "Failed to fetch action response from storage for second action instance.");
                    });
    		$A.test.addWaitFor("National League",function(){
    		    		var facet_new = cmp.get("facet").get('v.body')[0];
    		    		return $A.test.getTextByComponent(facet_new.find("Division"));
    		    	});
    		$A.test.addWaitFor("National League",function(){
	    		var facet_old = cmp.get("facet").get('v.body')[1];
	    		return $A.test.getTextByComponent(facet_old.find("Division"));
	    	});
    	}]
    },
    /**
     * Verify that original action cannot get marked as storable.
     * Access the original action going from the client by accessing it from context. 
     */
    //W-1554641 - Original action's callback is not called
    _testMarkingOriginalActionAsStorable:{
    	test:[function(cmp){
    		//Run the action that sets up other actions to be storable
        	var a = cmp.get("c.setStorable");
        	a.setCallback(cmp, function(a){
    			cmp._callBackMarker = a.getReturnValue();
    		});
            $A.enqueueAction(a);
            $A.eventService.finishFiring();
            $A.test.addWaitFor(false, $A.test.isActionPending,
                    function(){
            			$A.test.assertTruthy(cmp._callBackMarker, "Action call back was never called.");
            			$A.test.assertEquals("Marking my self as storable",cmp._callBackMarker);
            		});
    	},function(cmp){
    		var storedAction = cmp.get("c.setStorable");
			var storageKey = storedAction.getStorageKey();
			//Check if storage service has the expected action
			$A.storageService.getStorage("actions").get(storageKey, function(response){
				if(response){
					//If the action was stored, make sure it succeeded and return value is correct
					$A.test.assertEquals("SUCCESS", response.state);
					$A.test.assertEquals("Marking my self as storable", response.returnValue);
				}else{
					//If the action was not stored, fail
					$A.test.fail("Originating action's response was not stored.");
				}
			});
		}]
    },
    /**
     * Verify that new action defs can be introduced at client on the fly.
     * Chaining an action whose definition is not known to client.
     */
    //W-1554648 - Client does not know how to create the actiondef and throws some invalid JS error that the action is not a server new action even though it is.
    _testNewStorableActionDefsInResponse:{
    	test:[function(cmp){
    		//
    		$A.test.setTestTimeout(30000);
	   		this.resetCounter(cmp, "testNewStorableActionDefsInResponse");
    	}, function(cmp){
    		//Run the action that sets up other actions to be storable
    		this.initiateServerAction(cmp, "testNewStorableActionDefsInResponse", 
    				["java://org.auraframework.impl.java.controller.TestController/ACTION$getString"] );
            $A.test.addWaitFor(false, $A.test.isActionPending,
                    function(){
            			var storageKey = "java://org.auraframework.impl.java.controller.TestController/ACTION$getString";
            			//Check if storage service has the expected action
            			$A.storageService.getStorage("actions").get(storageKey, function(response){
            				if(response){
            					//If the action was stored, make sure it succeeded and return value is correct
            					$A.test.assertEquals("SUCCESS", response.state);
            				}else{
            					//If the action was not stored, fail
            					$A.test.fail("Storage service does not have the response for new action def");
            				}
            			});
                    });
    	}]  	
    },
    initiateServerAction:function(cmp, _testName, actionNames){
    	//Run the action that sets up other actions to be storable
    	var a = cmp.get("c.setStorable");
        a.setParams({testName: _testName,
        	actionsToMark: actionNames});
        $A.enqueueAction(a);
        $A.eventService.finishFiring();
    },
    resetCounter:function(cmp, testName){
	    var a = cmp.get('c.resetCounter');
	    a.setParams({
	        testName: testName
	    }),
	    a.setExclusive();
	    $A.enqueueAction(a);
    }
})
