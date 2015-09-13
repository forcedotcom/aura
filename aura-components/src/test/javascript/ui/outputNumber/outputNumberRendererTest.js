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

Function.RegisterNamespace("Test.Components.Ui.OutputNumber");

[Fixture]
Test.Components.Ui.OutputNumber.RendererTest = function(){
	var targetRenderer;	
	
	// Aura Files need to be loaded as Json, to catch the object they contain
	ImportJson("aura-components/src/main/components/ui/outputNumber/outputNumberRenderer.js",function(path,result){
		targetRenderer=result;
	});
	
	var targetValue = 101;        	
	var targetFormat = 'format';
	var targetHelper;	
	
    [Fixture]
    function render(){    	
    	var targetComponent={
			get:function(value){
				if(value=="v.value")return targetValue;
				if(value=="v.format")return targetFormat;
			}								
		};
    	
    	var spanElement={
			innerText:'',
			textContent:''
		};
    	
    	var mockSuper = Mocks.GetMock(targetRenderer, "superRender", function() {                                
			return [spanElement]; 								
        });
    	
        [Fact]
        function NotNumberNotString(){
        	// Arrange
        	var expected = '';     
        	var actual;
												
			var mockUtil = Mocks.GetMock(Object.Global(), "$A", {                                
				util: {   
					isNumber: function(num) { if(num == targetValue)return false;},
					isString: function(num) { if(num == targetValue)return false;}	            	
	            }
	        });							

            // Act
			mockUtil(function(){
				mockSuper(function(){
					actual = targetRenderer.render(targetComponent, targetHelper);
				});
			});

            // Assert
            Assert.Equal(expected, actual.textContent);
        }
        
        [Fact]
        function EmptyFormat(){
        	// Arrange
        	var expected = targetValue;  
        	var actual;
			
			var mockUtil = Mocks.GetMock(Object.Global(), "$A", {                                
				util: {   
					isNumber: function(num) { if(num == targetValue)return true;},
					isString: function(num) { if(num == targetValue)return false;},
					isEmpty: function(f) { if(f == targetFormat)return true;}
	            },
	            localizationService: {	            	
	            	formatNumber: function(num) { if(num == targetValue) return targetValue;}
	            }
	        });							

            // Act
			mockUtil(function(){
				mockSuper(function(){
					actual = targetRenderer.render(targetComponent, targetHelper);
				});
			});

            // Assert
            Assert.Equal(expected, actual.textContent);
        }
        
        [Fact]
        function NotEmptyFormat(){
        	// Arrange
        	var expected = targetValue;    
        	var actual;
        	
        	var mockFormat={
				format:function(num){
					if(num == targetValue) return targetValue;
				}
			}		
			
        	var mockUtil = Mocks.GetMock(Object.Global(), "$A", {                                
				util: {   
					isNumber: function(num) { if(num == targetValue)return true;},
					isString: function(num) { if(num == targetValue)return false;},
					isEmpty: function(f) { if(f == targetFormat)return false;}
	            },
	            localizationService: {
	            	getNumberFormat: function(f) { if(f == targetFormat) return mockFormat;}	            	
	            }
	        });										

            // Act
        	mockUtil(function(){
				mockSuper(function(){
					actual = targetRenderer.render(targetComponent, targetHelper);
				});
			});

            // Assert
            Assert.Equal(expected, actual.textContent);
        }
        
        [Fact]
        function InvalidFormatLogsErrorObject(){
        	// Arrange
        	var expected = new Error();    
        	var actual;        	
        	
        	var mockFormat={
				format:function(num){
					if(num == targetValue) return targetValue;
				}
			}		
			
        	var mockUtil = Mocks.GetMock(Object.Global(), "$A", {                                
				util: {   
					isNumber: function(num) { if(num == targetValue)return true;},
					isString: function(num) { if(num == targetValue)return false;},
					isEmpty: function(f) { if(f == targetFormat)return false;}
	            },
	            localizationService: {
	            	getNumberFormat: function(f) { if(f == targetFormat) throw expected;}	            	
	            },	            
	            log: function(e){
	            	actual = e;
	            }
	        });										

            // Act
        	mockUtil(function(){
				mockSuper(function(){
					targetRenderer.render(targetComponent, targetHelper);
				});
			});

            // Assert
            Assert.Equal(expected, actual);
        }    

        [Fact]
        function InvalidFormatRendersErrorMessageToElement(){
        	// Arrange
        	var expected = 'Invalid format attribute';    
        	var actual;        	
        	
        	var mockFormat={
				format:function(num){
					if(num == targetValue) return targetValue;
				}
			}		
			
        	var mockUtil = Mocks.GetMock(Object.Global(), "$A", {                                
				util: {   
					isNumber: function(num) { if(num == targetValue)return true;},
					isString: function(num) { if(num == targetValue)return false;},
					isEmpty: function(f) { if(f == targetFormat)return false;}
	            },
	            localizationService: {
	            	getNumberFormat: function(f) { if(f == targetFormat) throw new Error();}	            	
	            },	            
	            log: function(e){}
	        });										

            // Act
        	mockUtil(function(){
				mockSuper(function(){
					actual = targetRenderer.render(targetComponent, targetHelper);
				});
			});

            // Assert
            Assert.Equal(expected, actual.textContent);
        }

        [Fact]
        function InvalidFormatRendersErrorMessageToElementForIE(){
        	// Arrange
        	var expected = 'Invalid format attribute';    
        	var actual;        	
        	
        	var mockFormat={
				format:function(num){
					if(num == targetValue) return targetValue;
				}
			}		
			
        	var mockUtil = Mocks.GetMock(Object.Global(), "$A", {                                
				util: {   
					isNumber: function(num) { if(num == targetValue)return true;},
					isString: function(num) { if(num == targetValue)return false;},
					isEmpty: function(f) { if(f == targetFormat)return false;}
	            },
	            localizationService: {
	            	getNumberFormat: function(f) { if(f == targetFormat) throw new Error();}	            	
	            },	            
	            log: function(e){}
	        });										

            // Act
        	mockUtil(function(){
				mockSuper(function(){
					actual = targetRenderer.render(targetComponent, targetHelper);
				});
			});

            // Assert
            Assert.Equal(expected, actual.innerText);
        }
    }
    
    [Fixture]
    function rerender(){
    	    	    	    	    	    	    	
    	var targetElement={
			innerText:'',
			textContent:''
		};
    	
    	var spanElement={
			getElement:function(){
				return targetElement;
    		}
		};
    	
    	var targetComponent={
			get:function(value){
				if(value=="v.value")return targetValue;
				if(value=="v.format")return targetFormat;
			},
			find:function(cmp){
				if(cmp == "span") return spanElement; 
			}
		};
    	
        [Fact]
        function NotNumberNotString(){
        	// Arrange
        	var expected = '';           	        	           	        	
												
			var mockUtil = Mocks.GetMock(Object.Global(), "$A", {                                
				util: {   
					isNumber: function(num) { if(num == targetValue)return false;},
					isString: function(num) { if(num == targetValue)return false;}	            	
	            }
	        });							

            // Act
			mockUtil(function(){				
				targetRenderer.rerender(targetComponent, targetHelper);
			});

            // Assert
            Assert.Equal(expected, targetElement.textContent);
        }
        
        [Fact]
        function EmptyFormat(){
        	// Arrange
        	var expected = targetValue;          	        	
        	       			
			var mockUtil = Mocks.GetMock(Object.Global(), "$A", {                                
				util: {   
					isNumber: function(num) { if(num == targetValue)return true;},
					isString: function(num) { if(num == targetValue)return false;},
					isEmpty: function(f) { if(f == targetFormat)return true;}
	            },
	            localizationService: {	            	
	            	formatNumber: function(num) { if(num == targetValue) return targetValue;}
	            }
	        });							

            // Act
			mockUtil(function(){				
				targetRenderer.rerender(targetComponent, targetHelper);
			});

            // Assert
            Assert.Equal(expected, targetElement.textContent);
        }
        
        [Fact]
        function NotEmptyFormat(){
        	// Arrange
        	var expected = targetValue;           	        	
        	
        	var mockFormat={
				format:function(num){
					if(num == targetValue) return targetValue;
				}
			}		
			
        	var mockUtil = Mocks.GetMock(Object.Global(), "$A", {                                
				util: {   
					isNumber: function(num) { if(num == targetValue)return true;},
					isString: function(num) { if(num == targetValue)return false;},
					isEmpty: function(f) { if(f == targetFormat)return false;}
	            },
	            localizationService: {
	            	getNumberFormat: function(f) { if(f == targetFormat) return mockFormat;}	            	
	            }
	        });										

            // Act
        	mockUtil(function(){				
				targetRenderer.rerender(targetComponent, targetHelper);
			});

            // Assert
            Assert.Equal(expected, targetElement.textContent);
        }
        
        [Fact]
        function InvalidFormatLogsErrorObject(){
        	// Arrange
        	var expected = new Error();               	
        	var actual;

        	var mockFormat={
				format:function(num){
					if(num == targetValue) return targetValue;
				}
			}		
			
        	var mockUtil = Mocks.GetMock(Object.Global(), "$A", {                                
				util: {   
					isNumber: function(num) { if(num == targetValue)return true;},
					isString: function(num) { if(num == targetValue)return false;},
					isEmpty: function(f) { if(f == targetFormat)return false;}
	            },
	            localizationService: {
	            	getNumberFormat: function(f) { if(f == targetFormat) throw expected;}	            	
	            },	            
	            log: function(e){
	            	actual = e;
	            }
	        });										

            // Act
        	mockUtil(function(){				
				targetRenderer.rerender(targetComponent, targetHelper);
			});

            // Assert
            Assert.Equal(expected, actual);
        }        

        [Fact]
        function InvalidFormatRenndersErrorMessageOnRenderedElement(){
        	// Arrange
        	var expected = 'Invalid format attribute';               	
        	
        	var mockFormat={
				format:function(num){
					if(num == targetValue) return targetValue;
				}
			}		
			
        	var mockUtil = Mocks.GetMock(Object.Global(), "$A", {                                
				util: {   
					isNumber: function(num) { if(num == targetValue)return true;},
					isString: function(num) { if(num == targetValue)return false;},
					isEmpty: function(f) { if(f == targetFormat)return false;}
	            },
	            localizationService: {
	            	getNumberFormat: function(f) { if(f == targetFormat) throw new Error();}	            	
	            },	            
	            log: function(e){}
	        });										

            // Act
        	mockUtil(function(){				
				targetRenderer.rerender(targetComponent, targetHelper);
			});

            // Assert
            Assert.Equal(expected, targetElement.textContent);
        }

        [Fact]
        function InvalidFormatRenndersErrorMessageOnRenderedElementForIE(){
        	// Arrange
        	var expected = 'Invalid format attribute';               	
        	
        	var mockFormat={
				format:function(num){
					if(num == targetValue) return targetValue;
				}
			}		
			
        	var mockUtil = Mocks.GetMock(Object.Global(), "$A", {                                
				util: {   
					isNumber: function(num) { if(num == targetValue)return true;},
					isString: function(num) { if(num == targetValue)return false;},
					isEmpty: function(f) { if(f == targetFormat)return false;}
	            },
	            localizationService: {
	            	getNumberFormat: function(f) { if(f == targetFormat) throw new Error();}	            	
	            },	            
	            log: function(e){}
	        });										

            // Act
        	mockUtil(function(){				
				targetRenderer.rerender(targetComponent, targetHelper);
			});

            // Assert
            Assert.Equal(expected, targetElement.innerText);
        }
    }
}