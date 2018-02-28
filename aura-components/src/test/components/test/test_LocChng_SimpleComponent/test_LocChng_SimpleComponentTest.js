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
    testLocationChangeEventIsDefined : {
        test : function(component) {
            // Verify the event registered for Location Change
            var event = component.getDef().getLocationChangeEvent();
            $A.test.assertTrue(event !== null, "Every component should be automatically registered to fire locationChange event");
            $A.test.assertEquals('markup://test:test_LocChng_Event', event, "The simpleComponent has registered test:test_LocChng_Event for location change.");

            // Verify the actions associated with
            var handlerDefs = component.getDef().getAppHandlerDefs();
            $A.test.assertTrue(handlerDefs.length === 3);
            for ( var i = 0; i < handlerDefs.length; i++) {
                var qname = handlerDefs[i].eventDef.getDescriptor().getQualifiedName();
                var action = handlerDefs[i].action.path;

                if (qname === 'markup://test:test_LocChng_Event') {
                    $A.test.assertTrue(action === "c.locationChange", "Incorrect action registered for location change handler");
                } else if (qname === 'markup://test:test_LocChng_Event2') {
                    $A.test.assertTrue(action === "c.locationChangeComposite", "Incorrect action registered for location change handler");
                } else if (qname === 'markup://aura:locationChange') {
                    $A.test.assertTrue(action === "c.locationChangeGeneric", "Incorrect action registered for location change handler");
                } else {
                    $A.test.fail("Unknown handler/action registered");
                }

            }
        }
    },

    /**
     * Verify that browser History events are fired with a simple component. Have a simple component which has
     * registered an event for handling Location Change. Have a handler which handles this location change event. Verify
     * that the handler was invoked when $A.historyService.set()
     */
    testBrowserHistoryInteractionInSimpleComponent: {
        test: function(cmp) {
            $A.test.clickOrTouch(cmp.find("button").getElement());
            var textElement = document.getElementsByClassName("SimpleComponent")[0];

            $A.test.addWaitForWithFailureMessage("test_LocChng_SimpleComponent#aura:locationChange", function() {
                    return $A.test.getText(textElement);
                },
                "Location change event failed to invoke the right client action",
                function() {
                    var location = $A.historyService.get();
                    $A.test.assertEquals("ButtonClickedSimpleComponent", location.token);
                    $A.test.assertEquals("1", location.num);
                });
        }
    }

})
