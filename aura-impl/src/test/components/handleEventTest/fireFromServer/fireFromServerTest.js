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
	/**
	 * Testcase to verify adding a single application event at the server.
	 */
	testAttachingSingleEventInServerAction : {
		test : function(cmp) {
			var action = cmp.get('c.attachOneEvent');
			action.run();
			$A.eventService.finishFiring();
			$A.test.addWaitFor(false, $A.test.isActionPending,
							function() {
								if (action.getState() === "ERROR") {
									$A.test.fail("Failed to run server action and attach client events.");
								}
								//Verify that application events was attached with the correct parameter.
								$A.test.assertEquals("Go Giants!", $A.test.getText(cmp.find("events").getElement()),
										"Failed to attach event at server or failed to set params on event.");
								//Verify the response of action itself
								$A.test.assertEquals(
												"Attached handleEventsTest:applicationEvent to response",
												$A.test.getText(cmp.find("response").getElement()),
												"Bad response to action after attaching events.");
							})
		}
	},
	/**
	 * Testcase to verify adding multiple events at the server.
	 * Also verify that adding events whose definition is not known to the client does not cause any JS error.
	 */
	testAttachingMultipleEventsInServerAction : {
		test : function(cmp) {
			var action = cmp.get('c.attachMultipleEvents');
			action.run();
			$A.eventService.finishFiring();
			$A.test.addWaitFor(false, $A.test.isActionPending,
							function() {
								if (action.getState() === "ERROR") {
									$A.test.fail("Failed to run server action and attach multiple client events.");
								}
								//Verify that two application events were attached with the correct parameters.
								$A.test.assertEquals("Go Raiders!Go 49ers!",
										$A.test.getText(cmp.find("events").getElement()),
										"Failed to attach multiple events at server");
								//Verify the response of action itself
								$A.test.assertEquals("New Component", 
										$A.test.getText(cmp.find("response").getElement()).trim());
							})
		}
	},
	/**
	 * Testcase to verify adding same event multiple times with different parameters.
	 */
	testAttachingSameEventWithDifferentAttributes:{
		test : function(cmp){
			var action = cmp.get('c.attachDupEvent');
			action.run();
			$A.eventService.finishFiring();
			$A.test.addWaitFor(false, $A.test.isActionPending,
							function() {
								if (action.getState() === "ERROR") {
									$A.test.fail("Failed to run server action and attach duplicate client events.");
								}
								//Verify that both application events were attached with the correct parameters.
								$A.test.assertEquals("PoseySandavol",
										$A.test.getText(cmp.find("events").getElement()),
										"Failed to attach same event twice at server");
								//Verify the response of action itself
								$A.test.assertEquals("Attached handleEventsTest:dupEvent", 
										$A.test.getText(cmp.find("response").getElement()));
							})
		}
	},
	/**
	 * Attach a chain of event.
	 * Controller A invokes Server Action X
	 * Server action X attaches application event 1
	 * Application event 1 has a handler action B
	 * Handler action B invokes Server Action Y
	 * Verify that both server actions' callbacks were processed.
	 */
	testEventHandlerChaining:{
		test:function(cmp){
			var action = cmp.get('c.attachEventChain');
			action.run();
			$A.eventService.finishFiring();
			$A.test.addWaitFor(false, $A.test.isActionPending,
					function() {
						if (action.getState() === "ERROR") {
							$A.test.fail("Failed to run server action and attach duplicate client events.");
						}
						//Verify that both application events were attached with the correct parameters.
						$A.test.assertEquals("Pablo",
								$A.test.getText(cmp.find("events").getElement()),
								"Failed to attach same event twice at server");
						//Verify the response of action itself
						$A.test.assertEquals("Attached handleEventsTest:chainEvent to responseChain Link", 
								$A.test.getText(cmp.find("response").getElement()));
					})
		}
	}
})