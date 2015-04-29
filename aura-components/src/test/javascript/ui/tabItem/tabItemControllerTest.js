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

Function.RegisterNamespace("Test.Ui.TabItem");

[Fixture]
Test.Ui.TabItem = function() {
    var targetController = null;
    ImportJson("ui.tabItem.tabItemController.js", function(path, result){
        targetController = result;
    });
    
    // -- HELPER FUNCTIONS -- //
    
    // Sets up and returns a mock event object
	function getEventMock(component, eventName) {
    	return {
    		setParams : function(params){
    			if (params != undefined && params != null && params.tabItem != undefined && params.tabItem != null && params.tabItem == component){
    				component.setParamsCalledWithCmpAsParam = true;
    			}
    		},
    		fire = function() { 
    			component.firedEvents.push(eventName);
    		}
    	}
    }
	
	// Sets up a mock "tabItem" component with the specified getEvent() function
    function getComponentMock(eventName) {
		return {
			setParamsCalledWithCmpAsParam : false,
			firedEvents : [],
			getEvent : function(eventName){
				return getEventMock(this, eventName);
			}
		}
    }
    
    // -- TESTS -- //
    
    [Fixture]
    function testOnTabItemHover(){
    	
        [Fact]
        function TestHoverEventIsFiredWithComponentAsParam() {   
            // ARRANGE -- setup aura and component mocks
        	var auraMock = Mocks.GetMocks( Object.Global(), "$A", {});       
            var componentMock = getComponentMock('onTabItemHover');
        	
            // ACT -- call target function with mocked data
            auraMock(function(){
               targetController.onTabItemHover(componentMock, null, null);
            });
            
            Assert.Equal(2,1);
            // ASSERT -- make sure that the event was fired ... and with the proper params
            Assert.Contains(componentMock.firedEvents, 'onTabItemHover');
            Assert.True(componentMock.setParamsCalledWithCmpAsParam, "Expected params not set on event.");
        } 
    }
    
    [Fixture]
    function testOnTabItemUnhover(){
    	
        [Fact]
        function TestUnhoverEventIsFired() {   
            // ARRANGE -- setup aura and component mocks
        	var auraMock = Mocks.GetMocks( Object.Global(), "$A", {});       
            var componentMock = getComponentMock('onTabItemUnhover');
        	
            // ACT -- call target function with mocked data
            auraMock(function(){
               targetController.onTabItemUnhover(componentMock, null, null);
            });
            
            // ASSERT -- make sure that the event was fired
            Assert.Contains(componentMock.firedEvents, 'onTabItemUnhover');
        } 
    }
}