/* xUnit tests.

To run tests in just this file:
blt --build js-utest -Djstest.modules= -Djstest.path=../org.auraframework.aura-components/src/test/javascript/ui/tabBar/tabBarControllerTest.js
*/
Function.RegisterNamespace("Test.Ui.TabBar");

[Fixture]
Test.Ui.TabBar = function() {
    var targetController = null;
    ImportJson("ui.tabBar.tabBarController.js", function(path, result){
        targetController = result;
    });
    
    // -- HELPER FUNCTIONS -- //
    
    // Sets up and returns a mock event object
	function getEventMock(component, eventName) {
    	return {
    		setParams : function(params){
    			component.paramsSetByEvents[eventName] = params;
    		},
    		fire = function() { 
    			component.firedEvents.push(eventName);
    		}
    	}
    }
	
	// Sets up a mock "tabBar" component with the specified getEvent() function
    function getComponentMock(eventName) {
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
    function testOnTabItemHover(){
    	
        [Fact]
        function TestHoverEventIsFiredWithComponentAsParam() {   
        	// ARRANGE -- setup aura and component mocks
        	var auraMock = Mocks.GetMocks( Object.Global(), "$A", {});       
            var componentMock = getComponentMock('onTabItemHover');
        	
            // The event param that gets passed into the target function
            var handlerEventParam = {
            	getParams : function(){
            		return "test";
            	}	
            };
            
            // ACT -- call target function with mocked data
            auraMock(function(){
               targetController.onTabItemHover(componentMock, handlerEventParam, null);
            });
            
            // ASSERT -- make sure that the event was fired ... and with the proper params
            Assert.Contains(componentMock.firedEvents, 'onTabItemHover');
            var actualParams = componentMock.paramsSetByEvents['onTabItemHover'];
            Assert.NotUndefined(componentMock.paramsSetByEvents['onTabItemHover']);
            Assert.NotNull(componentMock.paramsSetByEvents['onTabItemHover']);
            Assert.Equal("test", actualParams);
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