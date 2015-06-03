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
      
    // Verifies that when the target function is called that the event with the specified name is called
    // with the expected params
    function testHoverEventHandlers(targetFunction, eventName) {
    	// ARRANGE -- setup aura and component mocks
    	var auraMock = Mocks.GetMock( Object.Global(), "$A", {});       
        var componentMock = getComponentMock();
    	
        // The event param that gets passed into the target function
        var handlerEventParam = {
        	getParams : function(){
        		return "component";
        	}	
        };
        
        // ACT -- call target function with mocked data
        auraMock(function(){
           targetFunction(componentMock, handlerEventParam, null);
        });
        
        // ASSERT -- make sure that the event was fired ... and with the proper params
        Assert.Contains(componentMock.firedEvents, eventName);
        var actualParams = componentMock.paramsSetByEvents[eventName];
        Assert.NotUndefined(actualParams);
        Assert.NotNull(actualParams);
        Assert.Equal("component", actualParams);
    }
    
    // -- TESTS -- //
    
	[Fixture]
	function testOnTabHover(){
	  	
	    [Fact]
	    function TestHoverEventIsFiredWithComponentAsParam() {   
	  	  testHoverEventHandlers(targetController.onTabHover, 'onTabHover');
	    } 
    }
    
    [Fixture]
    function testOnTabUnhover(){
    	
        [Fact]
        function TestUnhoverEventIsFired() {   
        	testHoverEventHandlers(targetController.onTabUnhover, 'onTabUnhover');
        } 
    }
}