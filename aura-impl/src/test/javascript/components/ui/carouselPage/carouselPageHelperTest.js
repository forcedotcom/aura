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
 
Function.RegisterNamespace("Test.Components.Ui.CarouselPage");

[Fixture]
Test.Components.Ui.Carousel.CarouselPageHelperTest=function(){
	var targetHelper = null;
	
	ImportJson("ui.carouselPage.carouselPageHelper",function(path,result){
		targetHelper=result;
	});
	
	[Fixture]
    function selectPage(){
    	[Fact]
    	function PageSelectedAddsCorrectCSS(){
    		// Arrange
    		expected = "addClass";
    		
    		var targetComponent = {
    			get : function(expression) {
    				if (expression === "v.pageIndex") {
    					return 1;
    				} else if (expression === "v.parent") {
    					return [{get : function(expression) {
    						return {
    							setParams : function(params){},
    							fire : function(){}
    						}
    					}}];
    				}
    			},
    			getElement : function() {},
    			getValue : function(value) {
    				return {
    					setValue : function(value) {}
    				}
    			}
    		};
    		var targetEvent = {
    			getParam : function(param) {return 1;}
    		};
    		
    		var mockAura = Mocks.GetMock(Object.Global(), "$A", Stubs.GetObject({}, {
				util : {
					addClass : function(element, css) {
						if (css === "carousel-page-selected") {
							actual="addClass";
						}
					},
					removeClass : function(element, css) {
						if (css === "carousel-page-selected") {
							actual="removeClass";
						}
					}
				}
			}));
			
    		actual = "";
    		
    		// Act
    		mockAura(function(){
    			targetHelper.selectPage(targetComponent, targetEvent);
    		});
    		
    		// Assert
    		Assert.Equal(expected,actual);
    	}
    	
    	[Fact]
    	function PageUnSelectedAddsCorrectCSS(){
    		// Arrange
    		expected = "removeClass";
    		
    		var targetComponent = {
    			get : function(expression) {
    				if (expression === "v.pageIndex") {
    					return 1;
    				} else if (expression === "v.parent") {
    					return [{get : function(expression) {
    						return {
    							setParams : function(params){},
    							fire : function(){}
    						}
    					}}];
    				}
    			},
    			getElement : function() {},
    			getValue : function(value) {
    				return {
    					setValue : function(value) {}
    				}
    			}
    		};
    		var targetEvent = {
    			getParam : function(param) {return 2;}
    		};
    		
    		var mockAura = Mocks.GetMock(Object.Global(), "$A", Stubs.GetObject({}, {
				util : {
					removeClass : function(element, css) {
						if (css === "carousel-page-selected") {
							actual="removeClass";
						}
					}
				}
			}));
			
    		actual = "";
    		
    		// Act
    		mockAura(function(){
    			targetHelper.selectPage(targetComponent, targetEvent);
    		});
    		
    		// Assert
    		Assert.Equal(expected,actual);
    	}
    }
    
    [Fixture]
    function updatePage(){
    	[Fact]
    	function UpdatePageWhenContainerIsNotEmpty(){
    		// Arrange
    		var targetComponent = {
    			find : function(expression) {
    				return {
    					getValue : function(value) {
    						return {
    							isEmpty : function() {return false;},
    							destroy : function() {actual = true;},
    							setValue : function() {}
    						}
    					}
    				}
    			}
    		};
    		var targetEvent = {
    			getParam : function(param) {return true;}
    		};
    		
    		actual = false;
    		
    		// Act
    		targetHelper.updatePage(targetComponent, targetEvent);
    		
    		// Assert
    		Assert.True(actual);
    	}
    	
    	[Fact]
    	function DestroyDoesNotGetCalledWhenContainerIsEmpty(){
    		// Arrange
    		var targetComponent = {
    			find : function(expression) {
    				return {
    					getValue : function(value) {
    						return {
    							isEmpty : function() {return true;},
    							destroy : function() {actual = true;},
    							setValue : function() {}
    						}
    					}
    				}
    			}
    		};
    		var targetEvent = {
    			getParam : function(param) {return true;}
    		};
    		
    		actual = false;
    		
    		// Act
    		targetHelper.updatePage(targetComponent, targetEvent);
    		
    		// Assert
    		Assert.False(actual);
    	}
    }
}