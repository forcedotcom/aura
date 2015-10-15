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

Function.RegisterNamespace("Test.Components.Ui.TabItem");

[Fixture]
Test.Components.Ui.TabItem = function() {
    var targetHelper = null;
    ImportJson("aura-components/src/main/components/ui/tabItem/tabItemHelper.js", function(path, result){
        targetHelper = result;
    });
    
    // -- HELPER FUNCTIONS -- //

    // Sets up and returns a mock event object that has both the setParams() function and the fire() function mocked out.
    // When setParams() is called it checks to see if the param passed in is equal to the tabItemComponentMock and if so
    // it sets the relevant attribute on that object to true. When fire() is called it adds the name of the event that was
    // fired to an array stored in the tabItemComponentMock.
	function getEventMock(component, eventName) {
    	return {
    		setParams : function(params){
    			component.paramsSetByEvents[eventName] = params;
    			return this;
    		},
    		fire : function() {
    			component.firedEvents.push(eventName);
    		}
    	}
    }

	// Sets up a mock "tabItem" component with the specified getEvent() function as well as a couple additional attributes that
	// are used by the event mock's functions in a way such that we are able to later determine the nature of the target function's
	// interactions with the given event object.
    function getTabItemComponentMock() {
		return {
			paramsSetByEvents : {},
			firedEvents : [],
			getEvent : function(eventName){
				return getEventMock(this, eventName);
			}
		}
    }

    // -- TESTS -- //

    [Fixture]
    function testHandleHoverEvent(){

        [Fact]
        function HandleHoverEventFiresSpecifiedEvent() {
            // ARRANGE -- setup aura and component mocks
            var auraMock = Mocks.GetMock( Object.Global(), "$A", {});
            var tabItemComponentMock = getTabItemComponentMock();
            var eventName = "testEvent";

            // ACT -- call target function with mocked data
            auraMock(function(){
               targetHelper.handleHoverEvent(tabItemComponentMock, eventName);
            });

            // ASSERT -- make sure that the event was fired ... and with the proper params
            Assert.Contains(tabItemComponentMock.firedEvents, eventName);
        }

        [Fact]
        function HandleHoverEventStoresEventParameters() {
            // ARRANGE -- setup aura and component mocks
            var auraMock = Mocks.GetMock( Object.Global(), "$A", {});
            var tabItemComponentMock = getTabItemComponentMock();
            var eventName = "testEvent";
            var actual;

            // ACT -- call target function with mocked data
            auraMock(function(){
                targetHelper.handleHoverEvent(tabItemComponentMock, eventName);
                actual = tabItemComponentMock.paramsSetByEvents[eventName];
            });

            // ASSERT -- make sure that the event was fired ... and with the proper params
            Assert.Equal(tabItemComponentMock, actual.tabComponent);
        }

    }
}