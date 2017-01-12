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

Function.RegisterNamespace("Test.Components.Ui.TabBar");

[Fixture]
Test.Components.Ui.TabBar = function() {
    var targetController = null;
    ImportJson("aura-components/src/main/components/ui/tabBar/tabBarController.js", function(path, result){
        targetController = result;
    });
    
    // -- HELPER FUNCTIONS -- //
    
    // Sets up and returns a mock event object
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
	
	// Sets up a mock "tabBar" component with the specified getEvent() function as well as a couple additional attributes that
	// are used by the event mock's functions in a way such that we are able to later determine the nature of the target function's
	// interactions with the given event object. 
    function getComponentMock() {
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
	function ControllerActionOnTabHover(){
	  	
        [Fact]
        function OnTabHoverFiresOnTabHoverComponentEvent() {
            // ARRANGE -- setup aura and component mocks
            var eventName = "onTabHover";
            var onTabHoverEvent = Stubs.Aura.GetEvent();
            var component = Stubs.Aura.GetComponent({}, {}, {
                getEvent: function(name){
                    if(name === eventName) {return onTabHoverEvent;}
                }
            });
            var event = Stubs.Aura.GetEvent({"tabComponent":component});
            
            // ACT -- call target function with mocked data
            targetController.onTabHover(component, event);
            
            // ASSERT -- make sure that the event was fired ... and with the proper params
            Assert.Equal(1, onTabHoverEvent.fire.Calls.length);
        } 

        [Fact]
        function OnTabHoverPassesComponent() {
            // ARRANGE -- setup aura and component mocks
            var eventName = "onTabHover";
            var onTabHoverEvent = Stubs.Aura.GetEvent();
            var component = Stubs.Aura.GetComponent({}, {}, {
                getEvent: function(name){
                    if(name === eventName) {return onTabHoverEvent;}
                }
            });
            var event = Stubs.Aura.GetEvent({"tabComponent":component});
            var expected = event.getParams();
            
            // ACT -- call target function with mocked data
            targetController.onTabHover(component, event);
            var actual = onTabHoverEvent.getParams();
            
            // ASSERT -- make sure that the event was fired ... and with the proper params
            Assert.Equal(expected, actual);
        } 
    }
    
    [Fixture]
    function ControllerActionOnTabUnhover(){

        [Fact]
        function OnTabUnhoverFiresOnTabHoverComponentEvent() {
            // ARRANGE -- setup aura and component mocks
            var eventName = "onTabUnhover";
            var onTabUnhoverEvent = Stubs.Aura.GetEvent();
            var component = Stubs.Aura.GetComponent({}, {}, {
                getEvent: function(name){
                    if(name === eventName) {return onTabUnhoverEvent;}
                }
            });
            var event = Stubs.Aura.GetEvent({"tabComponent":component});
            
            // ACT -- call target function with mocked data
            targetController.onTabUnhover(component, event);
            
            // ASSERT -- make sure that the event was fired ... and with the proper params
            Assert.Equal(1, onTabUnhoverEvent.fire.Calls.length);
        }

        [Fact]
        function OnTabUnhoverPassesComponent() {
            // ARRANGE -- setup aura and component mocks
            var eventName = "onTabUnhover";
            var onTabUnhoverEvent = Stubs.Aura.GetEvent();
            var component = Stubs.Aura.GetComponent({}, {}, {
                getEvent: function(name){
                    if(name === eventName) {return onTabUnhoverEvent;}
                }
            });
            var event = Stubs.Aura.GetEvent({"tabComponent":component});
            var expected = event.getParams();
            
            // ACT -- call target function with mocked data
            targetController.onTabUnhover(component, event);
            var actual = onTabUnhoverEvent.getParams();
            
            // ASSERT -- make sure that the event was fired ... and with the proper params
            Assert.Equal(expected, actual);
        } 

    }
}