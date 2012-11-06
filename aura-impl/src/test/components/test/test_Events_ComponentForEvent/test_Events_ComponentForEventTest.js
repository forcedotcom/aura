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
    /*Positive test Case 1: Verify that all the registered events are available*/
    testRegisteredEvents: {
        test: function(component){
            var event = component.getEvent("testPress");
            aura.test.assertTrue(event!==null, "Could not find the event registered for this component");
            event = component.getEvent("testMouseOver");
            aura.test.assertTrue(event!==null, "Could not find the event registered for this component");
        }
    },
    /*Positive test Case 2: Verify that all the registered events are available
     * More thorough tests will be written as ftests*/
    testRegisteredEventsProperties: {
        test: function(component){
            var event = component.getEvent("testPress");
            /*Get source returns the name of the component generating the event along with the Dom id of the element*/
            aura.test.assertTrue(event.getSource().toString().indexOf("test:test_Events_ComponentForEvent")!=-1,"Source of the event is incorrect");
            /*Second event*/
            event = component.getEvent("testMouseOver");
            aura.test.assertTrue(event.getSource().toString().indexOf("test:test_Events_ComponentForEvent")!=-1,"Source of the event is incorrect");
        }
    },


    /*Negative test Case 1: Verify that all the un-registered events are unavailable*/
    testUnRegisteredEvents: {
        test: function(component){
            var event = component.getEvent("");
            aura.test.assertTrue(event===null, "Should not be able to retrieve any event with this name");
            event = component.getEvent("testPress1");
            aura.test.assertTrue(event===null, "Should not be able to retrieve any event with this name");
            event = component.getEvent("testPres");
            aura.test.assertTrue(event===null, "Should not be able to retrieve any event with this name");
            event = component.getEvent("testBiggerPress");
            aura.test.assertTrue(event===null, "Should not be able to retrieve any event Registered with components which use this component");
        }
    },
    /*Negative test Case 2: Verify that the same event cannot be fired twice*/
    testEventFiring: {
        test: function(component){
            var event = component.getEvent("testPress");
            event.fire();
            try{
                event.fire();
            }catch (expected){
            }
        }
    },


})
