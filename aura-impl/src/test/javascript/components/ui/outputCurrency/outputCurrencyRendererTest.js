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

Function.RegisterNamespace("Test.Ui.OutputCurrency");

[Fixture]
Test.Ui.OutputCurrency.RendererTest = function(){
	var targetRenderer;	
	
	// Aura Files need to be loaded as Json, to catch the object they contain
	ImportJson("ui.outputCurrency.outputCurrencyRenderer",function(path,result){
		targetRenderer=result;
	});
	
	var targetValue = 101;        	
	var targetFormat = 'format';
	var targetCurrencyCode = "$";
	var targetCurrencySymbol = "USD";
	var targetDecimal = "2";
	var targetGrouping = "3";
	var targetHelper;	
	
    [Fixture]
    function render(){   
    	
    	var message = '';
    	
    	var targetComponent={
			get:function(value){
				if(value=="v.value")return targetValue;
				if(value=="v.format")return targetFormat;
				if(value=="v.currencyCode")return targetCurrencyCode;
				if(value=="v.currencySymbol")return targetCurrencySymbol;
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
        function ValueNotNumberNotString(){
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
        function InvalidFormatInvalidCurrencySymbol(){
        	// Arrange
        	var expected = targetValue;  
        	var actual;
        	
        	var targetComponent={
    			get:function(value){
    				if(value=="v.value")return targetValue;
    				if(value=="v.format")return targetFormat;
    				if(value=="v.currencyCode")return null;
    				if(value=="v.currencySymbol")return null;
    			}								
    		};
			
			var mockUtil = Mocks.GetMock(Object.Global(), "$A", {                                
				util: {   
					isNumber: function(num) { if(num == targetValue)return true;},
					isString: function(num) { if(num == targetValue)return false;},
					isEmpty: function(f) { if(f == targetFormat)return true;}
	            },
	            localizationService: {	            	
	            	formatCurrency: function(num) { if(num == targetValue) return targetValue;}
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
        function ValidFormatInvalidCurrencySymbol(){
        	// Arrange
        	var expected = targetValue;    
        	var actual;
        	
        	var targetComponent={
    			get:function(value){
    				if(value=="v.value")return targetValue;
    				if(value=="v.format")return targetFormat;
    				if(value=="v.currencyCode")return null;
    				if(value=="v.currencySymbol")return null;
    			}								
    		};
        	
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
	            	getNumberFormat: function(f, s) { if(f == targetFormat && s == undefined) return mockFormat;}	            	
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
        function ValidFormatValidCurrencySymbol(){
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
	            get: function(val){
	            	if(val == "$Locale.decimal") return targetDecimal;
	            	if(val == "$Locale.grouping") return targetGrouping;
	            },
	            localizationService: {
	            	getNumberFormat: function(f, s) { if(f == targetFormat && 
	            										 s.currencyCode == targetCurrencyCode &&
	            										 s.currency == targetCurrencySymbol &&
	            										 s.decimalSeparator == targetDecimal &&
	            										 s.groupingSeparator == targetGrouping) return mockFormat;}	            	
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
        function InvalidFormatValidCurrencySymbol(){
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
	            get: function(val){
	            	if(val == "$Locale.decimal") return targetDecimal;
	            	if(val == "$Locale.grouping") return targetGrouping;
	            	if(val == "$Locale.currencyFormat") return targetFormat;	            	
	            },
	            localizationService: {
	            	getNumberFormat: function(f, s) { if(f == targetFormat && 
	            										 s.currencyCode == targetCurrencyCode &&
	            										 s.currency == targetCurrencySymbol &&
	            										 s.decimalSeparator == targetDecimal &&
	            										 s.groupingSeparator == targetGrouping) return mockFormat;}	            	
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
        function TestError(){
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
	            get: function(val){
	            	if(val == "$Locale.decimal") return targetDecimal;
	            	if(val == "$Locale.grouping") return targetGrouping;
	            	if(val == "$Locale.currencyFormat") return targetFormat;	            	
	            },
	            localizationService: {
	            	getNumberFormat: function(f, s) { if(f == targetFormat && 
	            										 s.currencyCode == targetCurrencyCode &&
	            										 s.currency == targetCurrencySymbol &&
	            										 s.decimalSeparator == targetDecimal &&
	            										 s.groupingSeparator == targetGrouping)  throw new Error();}	            	
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
    	
    	var targetCodeObj ={
			unwrap:function(){return targetCurrencyCode;},
			isDirty:function(){return true;}
    	};
    	
    	var targetSymbolObj ={
			unwrap:function(){return targetCurrencySymbol;},
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
				if(value=="v.currencyCode")return targetCodeObj;
				if(value=="v.currencySymbol")return targetSymbolObj;
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
        	
        	var targetCodeObj ={
    			isDirty:function(){return false;}
        	};
        	
        	var targetSymbolObj ={
    			isDirty:function(){return false;}
        	};
        	    	        	        	        	        	
        	var targetComponent={
    			getValue:function(value){
    				if(value=="v.value")return targetValueObj;
    				if(value=="v.format")return targetFormatObj;
    				if(value=="v.currencyCode")return targetCodeObj;
    				if(value=="v.currencySymbol")return targetSymbolObj;
    			},
    			find:function(cmp){
    				if(cmp == "span") return spanElement; 
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
        function ValueNotNumberNotString(){
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
            Assert.Equal(message, '');
            Assert.Equal(expected, targetElement.innerText);
            Assert.Equal(expected, targetElement.textContent);
        }
        
        [Fact]
        function InvalidFormatInvalidCurrencySymbol(){
        	// Arrange
        	var expected = targetValue;   
        	
        	var targetCodeObj ={
    			unwrap:function(){return null;},
    			isDirty:function(){return false;}
        	};
        	
        	var targetSymbolObj ={
    			unwrap:function(){return null;},
    			isDirty:function(){return false;}
        	};
        	
        	var targetComponent={
    			getValue:function(value){
    				if(value=="v.value")return targetValueObj;
    				if(value=="v.format")return targetFormatObj;
    				if(value=="v.currencyCode")return targetCodeObj;
    				if(value=="v.currencySymbol")return targetSymbolObj;
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
	            	formatCurrency: function(num) { if(num == targetValue) return targetValue;}
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
        function ValidFormatInvalidCurrencySymbol(){
        	// Arrange
        	var expected = targetValue;            	
        	
        	var targetCodeObj ={
    			unwrap:function(){return null;},
    			isDirty:function(){return false;}
        	};
        	
        	var targetSymbolObj ={
    			unwrap:function(){return null;},
    			isDirty:function(){return false;}
        	};
        	
        	var targetComponent={
    			getValue:function(value){
    				if(value=="v.value")return targetValueObj;
    				if(value=="v.format")return targetFormatObj;
    				if(value=="v.currencyCode")return targetCodeObj;
    				if(value=="v.currencySymbol")return targetSymbolObj;
    			},
    			find:function(cmp){
    				if(cmp == "span") return spanElement; 
    			}									
    		};
        	
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
	            	getNumberFormat: function(f, s) { if(f == targetFormat && s == undefined) return mockFormat;}	            	
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
        function ValidFormatValidCurrencySymbol(){
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
	            get: function(val){
	            	if(val == "$Locale.decimal") return targetDecimal;
	            	if(val == "$Locale.grouping") return targetGrouping;
	            },
	            localizationService: {
	            	getNumberFormat: function(f, s) { if(f == targetFormat && 
	            										 s.currencyCode == targetCurrencyCode &&
	            										 s.currency == targetCurrencySymbol &&
	            										 s.decimalSeparator == targetDecimal &&
	            										 s.groupingSeparator == targetGrouping) return mockFormat;}	            	
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
        function InvalidFormatValidCurrencySymbol(){
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
	            get: function(val){
	            	if(val == "$Locale.decimal") return targetDecimal;
	            	if(val == "$Locale.grouping") return targetGrouping;
	            	if(val == "$Locale.currencyFormat") return targetFormat;	            	
	            },
	            localizationService: {
	            	getNumberFormat: function(f, s) { if(f == targetFormat && 
	            										 s.currencyCode == targetCurrencyCode &&
	            										 s.currency == targetCurrencySymbol &&
	            										 s.decimalSeparator == targetDecimal &&
	            										 s.groupingSeparator == targetGrouping) return mockFormat;}	            	
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
        function TestError(){
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
	            get: function(val){
	            	if(val == "$Locale.decimal") return targetDecimal;
	            	if(val == "$Locale.grouping") return targetGrouping;
	            	if(val == "$Locale.currencyFormat") return targetFormat;	            	
	            },
	            localizationService: {
	            	getNumberFormat: function(f, s) { if(f == targetFormat && 
	            										 s.currencyCode == targetCurrencyCode &&
	            										 s.currency == targetCurrencySymbol &&
	            										 s.decimalSeparator == targetDecimal &&
	            										 s.groupingSeparator == targetGrouping)  throw new Error();}	            	
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