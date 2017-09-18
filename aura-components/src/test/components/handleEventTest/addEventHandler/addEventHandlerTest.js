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
 
    testAddComponentEvent : {
        test : function(component) {
            var expected = "handleEventTest:event";
            var event;

            component.addEventHandler("compEvent", component.getReference("c.handleAndLogEventType"));
            event = component.getEvent("compEvent");
            event.fire();

            $A.test.assertEquals(expected, component.get("v.output"), "Added component event did not fire.");
        }
    },

    testAddRemoveComponentEvent: {
        test : function(component) {
            var expected = "";
            var event;

            component.set("v.output", expected);
            component.addEventHandler("compEvent", component.getReference("c.handleAndLogEventType"));
            component.removeEventHandler("compEvent", component.getReference("c.handleAndLogEventType"));
            event = component.getEvent("compEvent");
            event.fire();

            $A.test.assertEquals(expected, component.get("v.output"), "Added component event was not removed.");
        }
    },

    testAddApplicationEvent : {
        test : function(component) {
            var expected = "handleEventTest:applicationEvent";
            var event;

            component.addEventHandler("handleEventTest:applicationEvent", component.getReference("c.handleAndLogEventType"));
            event = $A.get("e.handleEventTest:applicationEvent");
            event.fire();

            $A.test.assertEquals(expected, component.get("v.output"), "Added application event did not fire.");
        }
    },

    testAddRemoveApplicationEvent: {
        test : function(component) {
            var expected = "";
            var event;

            component.set("v.output", expected);
            component.addEventHandler("handleEventTest:applicationEvent", component.getReference("c.handleAndLogEventType"));
            component.removeEventHandler("handleEventTest:applicationEvent", component.getReference("c.handleAndLogEventType"));
            event = $A.get("e.handleEventTest:applicationEvent");
            event.fire();

            $A.test.assertEquals(expected, component.get("v.output"), "Added application event was not removed.");
        }

    },

    testAddAnonymousApplicationEventHandler: {
        test : function(component) {
            var expected = "handleEventTest:applicationEvent";
            var event;
            var actual;

            component.addEventHandler("handleEventTest:applicationEvent", function(auraEvent) {
                actual = auraEvent.getType();
            });
            event = $A.get("e.handleEventTest:applicationEvent");
            event.fire();

            $A.test.assertEquals(expected, actual, "Added application event did not fire.");
        }
        
    },

    testAddRemoveAnonymousApplicationEventHandler: {        
        test : function(component) {
            var expected;
            var event;
            var actual;
            var handler = function(auraEvent) {
                actual = auraEvent.getType();
            };

            component.set("v.output", expected);
            component.addEventHandler("handleEventTest:applicationEvent", handler);
            component.removeEventHandler("handleEventTest:applicationEvent", handler);
            event = $A.get("e.handleEventTest:applicationEvent");
            event.fire();

            $A.test.assertEquals(expected, actual, "Added application event not get removed.");
        }
    },

    testAddComponentEventForContainedComponent: {
        test : function(component) {
            var expected = "ui:press";
            var event;

            var button = component.find("button");
            button.addEventHandler("press", component.getReference("c.handleAndLogEventType"));
            
            button.getEvent("press").fire();

            $A.test.assertEquals(expected, component.get("v.output"), "Added component event did not fire.");
        }

    }

})
