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

Function.RegisterNamespace("Test.Ui.OutputPercent");

[Fixture]
Test.Ui.OutputPercent.RendererTest = function(){
	var targetRenderer;	
	
	// Aura Files need to be loaded as Json, to catch the object they contain
	ImportJson("ui.outputPercent.outputPercentRenderer",function(path,result){
		targetRenderer=result;
	});
	
	var targetValue = 10;        	
	var targetFormat = 'format';	
	var targetScale = 2;
	var targetHelper;	
	
    [Fixture]
    function render(){   
    	
    	var message = '';
    	
    	var targetComponent={
			get:function(value){
				if(value=="v.value")return targetValue;
				if(value=="v.format")return targetFormat;
				if(value=="v.valueScale")return '';
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
            Assert.Equal(message, '');
            Assert.Equal(expected, actual.innerText);
            Assert.Equal(expected, actual.textContent);
        }
                
        [Fact]
        function validScale(){
        	// Arrange
        	var expected = targetValue * 100;  
        	var actual;
        	
        	var targetComponent={
    			get:function(value){
    				if(value=="v.value")return targetValue;
    				if(value=="v.format")return targetFormat;
    				if(value=="v.valueScale")return targetScale;
    			}								
    		};
			
			var mockUtil = Mocks.GetMock(Object.Global(), "$A", {                                
				util: {   
					isNumber: function(num) { if(num == targetValue)return true;},
					isString: function(num) { if(num == targetValue)return false;},
					isEmpty: function(f) { if(f == targetFormat)return true;}
	            },
	            localizationService: {	            	
	            	formatPercent: function(num) { if(num == targetValue * 100) return targetValue * 100;}
	            }
	        });		
		
            // Act
			mockUtil(function(){
				mockSuper(function(){					
					actual = targetRenderer.render(targetComponent, targetHelper);					
				});
			});

            // Assert
            Assert.Equal(message, '');
            Assert.Equal(expected, actual.innerText);
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
	            	formatPercent: function(num) { if(num == targetValue) return targetValue;}
	            }
	        });							

            // Act
			mockUtil(function(){
				mockSuper(function(){					
					actual = targetRenderer.render(targetComponent, targetHelper);					
				});
			});

            // Assert
            Assert.Equal(message, '');
            Assert.Equal(expected, actual.innerText);
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
            Assert.Equal(message, '');
            Assert.Equal(expected, actual.innerText);
            Assert.Equal(expected, actual.textContent);
        }
        
        [Fact]
        function InvalidFormat(){
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
	            log: function(e){
	            	message = 'Error';
	            }
	        });										

            // Act
        	mockUtil(function(){
				mockSuper(function(){					
					actual = targetRenderer.render(targetComponent, targetHelper);					
				});
			});

            // Assert
            Assert.Equal(message, 'Error');
            Assert.Equal(expected, actual.innerText);
            Assert.Equal(expected, actual.textContent);
        }
    }
    
    [Fixture]
    function rerender(){   
    	
    	var message = '';
    	
    	var targetValueObj ={
			unwrap:function(){return targetValue;},
			isDirty:function(){return true;}
    	};
    	
    	var targetFormatObj ={
			unwrap:function(){return targetFormat;},
			isDirty:function(){return true;}
    	};   
    	    	
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
			getValue:function(value){
				if(value=="v.value")return targetValueObj;
				if(value=="v.format")return targetFormatObj;
			},
			get:function(value){				
				if(value=="v.valueScale")return '';
			},
			find:function(cmp){
				if(cmp == "span") return spanElement; 
			}
		};
    	
    	[Fact]
        function NotDirty(){
        	// Arrange
        	var expected = '';
        	
        	var targetValueObj ={    		
    			isDirty:function(){return false;}
        	};
        	
        	var targetFormatObj ={    			
    			isDirty:function(){return false;}
        	};
        	
        	var targetComponent={
    			getValue:function(value){
    				if(value=="v.value")return targetValueObj;
    				if(value=="v.format")return targetFormatObj;
    			}
    		};																				

            // Act					
			targetRenderer.rerender(targetComponent, targetHelper);							

            // Assert
            Assert.Equal(message, '');
            Assert.Equal(expected, targetElement.innerText);
            Assert.Equal(expected, targetElement.textContent);
        }    	
    	
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
				targetRenderer.rerender(targetComponent, targetHelper);				
			});

            // Assert
            Assert.Equal(message, '');
            Assert.Equal(expected, targetElement.innerText);
            Assert.Equal(expected, targetElement.textContent);
        }
                
        [Fact]
        function validScale(){
        	// Arrange
        	var expected = targetValue * 100;  
        	var actual;
        	
        	var targetComponent={
    			getValue:function(value){
    				if(value=="v.value")return targetValueObj;
    				if(value=="v.format")return targetFormatObj;
    			},
    			get:function(value){        				
    				if(value=="v.valueScale")return targetScale;
    			},    			
    			find:function(cmp){
    				if(cmp == "span") return spanElement; 
    			}
    		};
			
			var mockUtil = Mocks.GetMock(Object.Global(), "$A", {                                
				util: {   
					isNumber: function(num) { if(num == targetValue)return true;},
					isString: function(num) { if(num == targetValue)return false;},
					isEmpty: function(f) { if(f == targetFormat)return true;}
	            },
	            localizationService: {	            	
	            	formatPercent: function(num) { if(num == targetValue * 100) return targetValue * 100;}
	            }
	        });		
		
            // Act
			mockUtil(function(){				
				targetRenderer.rerender(targetComponent, targetHelper);				
			});

            // Assert
            Assert.Equal(message, '');
            Assert.Equal(expected, targetElement.innerText);
            Assert.Equal(expected, targetElement.textContent);
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
	            	formatPercent: function(num) { if(num == targetValue) return targetValue;}
	            }
	        });							

            // Act
			mockUtil(function(){				
				targetRenderer.rerender(targetComponent, targetHelper);				
			});

            // Assert
            Assert.Equal(message, '');
            Assert.Equal(expected, targetElement.innerText);
            Assert.Equal(expected, targetElement.textContent);
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
				targetRenderer.rerender(targetComponent, targetHelper);				
			});

            // Assert
            Assert.Equal(message, '');
            Assert.Equal(expected, targetElement.innerText);
            Assert.Equal(expected, targetElement.textContent);
        }
        
        [Fact]
        function InvalidFormat(){
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
	            log: function(e){
	            	message = 'Error';
	            }
	        });										

            // Act
        	mockUtil(function(){				
				targetRenderer.rerender(targetComponent, targetHelper);				
			});

            // Assert
            Assert.Equal(message, 'Error');
            Assert.Equal(expected, targetElement.innerText);
            Assert.Equal(expected, targetElement.textContent);
        }
    }
}