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
	/** IE & FIREFOX are excluded:The tests try to send out a request to other domains http://invalid.salesforce.com, 
	 * IE and Firefox block it by default
	 */
    browsers:["GOOGLECHROME","SAFARI"],
    
    setUp: function(component) {
    	// Store a reference to the component to facilitate the use of the test's helpers. 
        this._component = component;	
    },
    
    /**
     * Calling server action on default host succeeds.
     */
    testConnection : {
        test : [function(component) {
                // we assume we start connected
                $A.test.assertTrue($A.clientService.isConnected());
                this.waitForEvents("layoutChange")
            }, function(component) {
                this.sendAndWaitForSuccessfulRequest();
            }, function(component) {
            	// We received a status change after a successful request, assert that the current status is SUCCESS:
            	this.assertActionStatus("SUCCESS"); 
            	
                $A.test.assertEquals("layoutChange", component.get("v.eventsFired"));
                // ensure we still think we're connected
                $A.test.assertTrue($A.clientService.isConnected());
            }]
    },

    /**
     * Calling server action on unknown host throws connectionLost event.
     */
    testConnectionLost : {
        test : [function(component) {
                this.waitForEvents("layoutChange");
            }, function(component) {
                this.sendAndWaitForFailedRequest();
            }, function(component) {
            	// We received a status change after a failed request, assert that the current status is INCOMPLETE:
            	this.assertActionStatus("INCOMPLETE"); 
            	
                $A.test.assertEquals("layoutChange connectionLost", $A.util.trim(component.get("v.eventsFired")));
                $A.test.assertFalse($A.clientService.isConnected());
                this.tryToConnect();
                // Wait for any status change:
                this.waitForActionStatusChange();
            }, function(component) {
                // connectionLost event is not repeated
                $A.test.assertEquals("layoutChange connectionLost", $A.util.trim(component.get("v.eventsFired")));
                // still offline
                $A.test.assertFalse($A.clientService.isConnected());
            }]
    },
    
    /**
     * Test setting connected true while connected does not generate connectionResume event.
     */
    testSetConnectedTrueWhenConnected : {
        test : [function(component) {
                // we assume we start connected
                $A.test.assertTrue($A.clientService.isConnected());            
                this.waitForEvents("layoutChange");
            }, function(component) {
            	// set connected to true should not affect the connected state:
                component.find("setConnectedTrueButton").get("e.press").fire();
                $A.test.assertTrue($A.clientService.isConnected());
                
                this.sendAndWaitForSuccessfulRequest();
            }, function(component) {
            	// We received a status change after a successful request, assert that the current status is SUCCESS:
            	this.assertActionStatus("SUCCESS"); 
            	
                // There should be no events beside the layout change since we started connected:
                $A.test.assertEquals("layoutChange", $A.util.trim(component.get("v.eventsFired")));
                $A.test.assertTrue($A.clientService.isConnected());
            }]
    },
    
    /**
     * Test calling setConnected(true) after setConnected(false) should fire an event and vice versa.
     */
    testSetConnectedTrueAfterDisconnect : {
        test : [function(component) {
                // we assume we start connected
                $A.test.assertTrue($A.clientService.isConnected());            
                this.waitForEvents("layoutChange");
             }, function(component) {
                component.find("setConnectedFalseButton").get("e.press").fire();
                this.waitForEvents("layoutChange connectionLost")
             }, function(component) {
            	component.find("setConnectedTrueButton").get("e.press").fire();
                this.waitForEvents("layoutChange connectionLost connectionResumed");
             }]
    },
    
    /**
     * Test setting connected true after reconnecting does not generate connectionResumed event.
     */
    testSetConnectedTrueAfterReconnect : {
        test : [function(component) {
                // we assume we start connected
                $A.test.assertTrue($A.clientService.isConnected());            
                this.waitForEvents("layoutChange");
            }, function(component) {
                component.find("setConnectedFalseButton").get("e.press").fire();
                this.waitForEvents("layoutChange connectionLost");
            }, function(component) {
                $A.test.assertFalse($A.clientService.isConnected());
                this.sendAndWaitForFailedRequest();
            }, function(component) {
            	// We received a status change after a failed request, assert that the current status is INCOMPLETE:
            	this.assertActionStatus("INCOMPLETE"); 
            	
                $A.test.assertEquals("layoutChange connectionLost", $A.util.trim(component.get("v.eventsFired")));
                $A.test.assertFalse($A.clientService.isConnected());
                
                component.find("setConnectedTrueButton").get("e.press").fire();
                this.waitForEvents("layoutChange connectionLost connectionResumed");
            }, function(component) {
            	// We have been set back to connected in the previous step:
            	$A.test.assertTrue($A.clientService.isConnected());
                this.sendAndWaitForSuccessfulRequest();
            }, function(component) {
            	// We received a status change after a successful request, assert that the current status is SUCCESS:
            	this.assertActionStatus("SUCCESS"); 
            	
                // ensure there are not 2 connectionResumed events generated after invoking setConnected when 
            	// and then making a successful request:
                $A.test.assertEquals("layoutChange connectionLost connectionResumed", $A.util.trim(component.get("v.eventsFired")));
                $A.test.assertTrue($A.clientService.isConnected());
            }]
    },
 
    
    /**
     * Test setting connected false generates connectionLost event.  Subsequent actions will succeed and generate
     * connectionResumed event
     */
    testSetConnectedFalse : {
        test : [function(component) {
                // we assume we start connected
                $A.test.assertTrue($A.clientService.isConnected());            
                this.waitForEvents("layoutChange");
             }, function(component) {
                component.find("setConnectedFalseButton").get("e.press").fire();
                this.waitForEvents("layoutChange connectionLost");
             }, function(component) {
                $A.test.assertFalse($A.clientService.isConnected());
                this.sendAndWaitForSuccessfulRequest();
            }, function(component) {
            	// We received a status change after a successful request, assert that the current status is SUCCESS:
            	this.assertActionStatus("SUCCESS"); 
            	
                $A.test.assertEquals("layoutChange connectionLost connectionResumed", $A.util.trim(component.get("v.eventsFired")));
                $A.test.assertTrue($A.clientService.isConnected());
            }]
    },

    /**
     * Test setting connected false after disconnect does not generate connectionLost event.
     */
    testSetConnectedFalseAfterDisconnect : {
        test : [function(component) {
                // we assume we start connected
                $A.test.assertTrue($A.clientService.isConnected());            
                this.waitForEvents("layoutChange");
            }, function(component) {
                this.sendAndWaitForFailedRequest();
            }, function(component) {
            	// We received a status change after a failed request, assert that the current status is INCOMPLETE:
            	this.assertActionStatus("INCOMPLETE"); 
            	
                $A.test.assertEquals("layoutChange connectionLost", $A.util.trim(component.get("v.eventsFired")));
                $A.test.assertFalse($A.clientService.isConnected());
            }, function(component) {
                component.find("setConnectedFalseButton").get("e.press").fire();
                this.waitForEvents("layoutChange connectionLost");
            }, function(component) {
                $A.test.assertFalse($A.clientService.isConnected());
                this.sendAndWaitForSuccessfulRequest();
            }, function(component) {
            	// We received a status change after a successful request, assert that the current status is SUCCESS:
            	this.assertActionStatus("SUCCESS"); 
            	
                // ensure there are not 2 connectionLost events generated before a resume
                $A.test.assertEquals("layoutChange connectionLost connectionResumed", $A.util.trim(component.get("v.eventsFired")));
                $A.test.assertTrue($A.clientService.isConnected());
            }]
    },
    /**
     * Test setting connected false then disconnect does not generate connectionLost event.
     */
    testSetConnectedFalseThenDisconnect : {
        test : [function(component) {
                // we assume we start connected
                $A.test.assertTrue($A.clientService.isConnected());            
                this.waitForEvents("layoutChange");
            }, function(component) {
                component.find("setConnectedFalseButton").get("e.press").fire();
                this.waitForEvents("layoutChange connectionLost");
            }, function(component) {
                $A.test.assertFalse($A.clientService.isConnected());
                this.sendAndWaitForFailedRequest();
            }, function(component) {
            	// We received a status change after a failed request, assert that the current status is INCOMPLETE:
            	this.assertActionStatus("INCOMPLETE"); 
            	
                $A.test.assertEquals("layoutChange connectionLost", $A.util.trim(component.get("v.eventsFired")));
                $A.test.assertFalse($A.clientService.isConnected());
            }, function(component) {
            	this.sendAndWaitForSuccessfulRequest();
            }, function(component) {
            	// We received a status change after a successful request, assert that the current status is SUCCESS:
            	this.assertActionStatus("SUCCESS"); 
            	
                // ensure there are not 2 connectionLost events generated before a resume
                $A.test.assertEquals("layoutChange connectionLost connectionResumed", $A.util.trim(component.get("v.eventsFired")));
                $A.test.assertTrue($A.clientService.isConnected());
            }]
    },
 
    /**
     * Calling server action succeeds after a prior connection failure.
     */
    testConnectionResumed : {
        test : [function(component) {
                this.waitForEvents("layoutChange");
            }, function(component) {
                this.sendAndWaitForFailedRequest();
            }, function(component) {
            	// We received a status change after a failed request, assert that the current status is INCOMPLETE:
            	this.assertActionStatus("INCOMPLETE"); 
            	
                $A.test.assertEquals("layoutChange connectionLost", $A.util.trim(component.get("v.eventsFired")));
                $A.test.assertFalse($A.clientService.isConnected());
                this.sendAndWaitForSuccessfulRequest();
            }, function(component) {
            	// We received a status change after a successful request, assert that the current status is SUCCESS:
            	this.assertActionStatus("SUCCESS"); 
            	
                $A.test.assertEquals("layoutChange connectionLost connectionResumed", $A.util.trim(component.get("v.eventsFired")));
                $A.test.assertTrue($A.clientService.isConnected());
                this.sendAndWaitForSuccessfulRequest();
            }, function(component) {
            	// We received a status change after a successful request, assert that the current status is SUCCESS:
            	this.assertActionStatus("SUCCESS"); 
            	
                // connectionResumed event is not repeated
                $A.test.assertEquals("layoutChange connectionLost connectionResumed", $A.util.trim(component.get("v.eventsFired")));
                // still online
                $A.test.assertTrue($A.clientService.isConnected());
            }]
    },

    /**
     * Changing layout with no connection throws connectionLost and layoutFailed events.
     */
    testConnectionLostForLayout : {
        attributes : { host : "http://invalid.salesforce.com" },
        test : [function(component) {
                this.waitForEvents("connectionLost layoutFailed layoutChange");
            }, function(component) {
                $A.test.assertFalse($A.clientService.isConnected());
            }]
    },

    /**
     * Changing layout after a prior connection failure succeeds.
     * Excluding IE: history service was not previously supported in IE
     */
    testConnectionResumedForLayout : {
        attributes : { host : "http://invalid.salesforce.com" },
        test : [function(component) {
        		this.waitForEvents("connectionLost layoutFailed layoutChange");
            }, function(component) {
                $A.test.assertFalse($A.clientService.isConnected());
                component.getValue("v.host").setValue(undefined); // restore to default
                $A.historyService.set("action");
                this.waitForEvents("connectionLost layoutFailed layoutChange connectionResumed layoutChange");
            }, function(component) {
                $A.test.assertTrue($A.clientService.isConnected());
            }]
    },
    
    // HELPERS:

    /**
     * Waits until the v.eventsFired attribute equals the value provided.
     */
    waitForEvents: function(eventsToWaitFor) {
    	$A.test.addWaitForWithFailureMessage(
			eventsToWaitFor, 
			function() { 
				return $A.util.trim(this._component.get("v.eventsFired")); 
			}.bind(this),
			"Timed out waiting for events: " + eventsToWaitFor
		);
    },
    
    /**
     * Waits for the action status to change to any new value. It is more desirable to wait for a 
     * change in status and then validating the state in the next test step in order to fail fast
     * when some exception occurs instead of polling unnecessarily. This strategy will also ensure
     * that only the first action status change will be taken into account (if multiple status changes
     * occur and the final state is the expected state, waiting for the specific action status will 
     * cause the test to pass even though it is not the desired behavior).
     */
    waitForActionStatusChange: function() {
    	var currentActionStatus = this._component.get("v.actionStatus");
        $A.test.addWaitFor(
    		true, 
    		function() { 
    			return this._component.get("v.actionStatus") !== currentActionStatus; 
			}.bind(this)
		);
    },
    
    /**
     * Asserts that the current action status equals the expected.
     */
    assertActionStatus: function(statusExpected) {
    	$A.test.assertEquals(statusExpected, this._component.get("v.actionStatus"));
    },
    
    /**
     * Fires a request to test for connectivity. This method is asynchronous, therefore, after invocation,
     * waitForActionStatusChange, waitForEvents or $A.test.addWaitFor should be used.
     */
    tryToConnect: function() {
    	this._component.find("testConnection").get("e.press").fire();
    },
    
    /**
     * Sends a request to a valid URL (default) and then waits for the action status to change.
     */
    sendAndWaitForSuccessfulRequest: function() {
    	this._component.getValue("v.host").setValue(undefined); // restore to default
        this.tryToConnect();
        this.waitForActionStatusChange();
    },
    
    /**
     * Sends a request to an invalid URL and then waits for the action status to change (this call will also set
     * the test timeout to 30 seconds to avoid the test failing while waiting for request to timeout).
     */
    sendAndWaitForFailedRequest: function() {
    	$A.test.setTestTimeout(30000);
    	this._component.getValue("v.host").setValue("http://invalid.salesforce.com");
    	this.tryToConnect();
        this.waitForActionStatusChange();
    }
    
})
