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
    /*
     * Basic test to verify that a specified Event to be fired for Location
     * Change is available in the component def.
     */
    testDefinedLocationChangeEvent : {
        test : function(component) {
            var event = component.getDef().getLocationChangeEvent();
            // Verify the event associated with Location change
            $A.test.assertTrue(event !== null, "Every component should be automatically registered to fire locationChange event");
            $A.test.assertEquals('markup://test:test_LocChng_Event2', event,
                    "The compositeComponent has registered test:test_LocChng_Event2 for location change.");

            // Verify handlers for this location change event
            var handlerDefs = component.getDef().getAppHandlerDefs();
            $A.test.assertTrue(handlerDefs.length === 1, "Component has more than 1 handlers");
            for ( var i = 0; i < handlerDefs.length; i++) {
                if (handlerDefs[i].eventDef.getDescriptor().getQualifiedName() === 'markup://test:test_LocChng_Event2') {
                    $A.test.assertTrue((handlerDefs[i].action.path === "c.clicked"), "Incorrect action registered for location change handler");
                } else {
                    $A.test.fail("Unkown action/handler registered with component");
                }
            }
        }
    },

    /**
     * Verify that browser History events in a complex component with multiple handlers. Have a simple component which
     * has registered an event for handling Location Change. Have a Bigger component which has registered an event for
     * handling Location Change and also includes the simple component within it's body. Have 2 handlers which handle
     * both location change events. Verify that the handler was invoked when $A.historyService.set() This also tests
     * that all handlers registered for the location change event are invoked.
     */
    testBrowserHistoryInteractionInComplexComponent: {
        test: function(cmp) {
            $A.test.clickOrTouch(cmp.find("compositeButton").getElement());
            var textElement = document.getElementsByClassName("CompositeComponent")[0];

            $A.test.addWaitForWithFailureMessage("test_LocChng_Composite:test:test_LocChng_Event2", function() {
                    return $A.test.getText(textElement);
                },
                "Location change event failed to invoke the right client action",
                function() {
                    var location = $A.historyService.get();
                    $A.test.assertEquals("ButtonClickedCompositeComponent", location.token);
                    $A.test.assertEquals("1", location.locator);
                });
        }
    }

})
