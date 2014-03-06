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
Function.RegisterNamespace("Test.Aura.Iteration");

[Fixture]
Test.Aura.Iteration.HelperTest = function(){
	var targetHelper;	
	
	// Aura Files need to be loaded as Json, to catch the object they contain
	ImportJson("aura.iteration.iterationHelper",function(path,result){
		targetHelper=result;
	});
		
    [Fixture]
    function createAddComponentCallback(){    	    	    	        
    	
        [Fact]
        function callbackNotSet(){
        	// Arrange                	
        	var expected = '123';
        	
        	var targetBodyCollector={
    			count:0,
    			callback:''
        	};
        	
        	var targetIndexCollector={	
    			body:[],
    			bodyCollector:targetBodyCollector
    		};
        	
        	// Act
			var callback = targetHelper.createAddComponentCallback(targetIndexCollector, 0);
			callback(expected);
			
			// Assert
			Assert.Equal(expected, targetIndexCollector.body[0]);			
        }
                
        [Fact]
        function callbackNotCalled(){
        	// Arrange 
        	var expected = '123';
        	var actual = ''; 
        	
        	var targetObj={
        		destroy:function(flag){
        			if(flag != true) throw new Error("Wrong flag used");
        		}
        	};
        	        	
        	var targetRealBodyList=[targetObj];
        	
        	var targetBodyCollector={
    			count:1,
    			callback:function(val){
    				if(val != expected) throw new Error("Wrong val used");
    				actual=val;
    			},
    			realBodyList:[targetRealBodyList],
    			offset:0,
    			cmp:{
    				_currentBodyCollector:''
    			}
        	};        	        	        	
        	
        	var targetIndexCollector={	
    			body:[],
    			bodyCollector:targetBodyCollector
    		};        	        	
        	
        	// Act
			var callback = targetHelper.createAddComponentCallback(targetIndexCollector, 0);			
			callback(expected);
			
			// Assert
			Assert.Equal(expected, targetIndexCollector.body[0]);			
			Assert.Equal('', actual);           
        }         
        
        [Fact]
        function callbackCalled(){
        	// Arrange 
        	var expected = '123';           	        	
        	var actual = '';        
        	
        	var targetRealBodyList=[expected];
        	
        	var targetBodyCollector={
    			count:1,
    			callback:function(val){
    				if(val != expected) throw new Error("Wrong val used");
    				actual=val;
    			},
    			realBodyList:[targetRealBodyList],
    			offset:0,
    			cmp:{
    				_currentBodyCollector:''
    			}
        	};        	        	        	
        	
        	var targetIndexCollector={	
    			body:[],
    			bodyCollector:targetBodyCollector
    		};  
        	
        	targetBodyCollector.cmp._currentBodyCollector = targetBodyCollector;
        	
        	// Act
			var callback = targetHelper.createAddComponentCallback(targetIndexCollector, 0);			
			callback(expected);
			
			// Assert
			Assert.Equal(expected, targetIndexCollector.body[0]);
			Assert.Equal(expected, actual);
        }    
        
        [Fact]
        function callbackCalledWithRealBodyLenghtTwo(){
        	// Arrange 
        	var expected = ['123','456'];           	        	
        	var actual = '';        
        	
        	var targetRealBodyList1=['123'];
        	var targetRealBodyList2=['456'];
        	
        	var targetBodyCollector={
    			count:1,
    			callback:function(val){
    				if(val[0] != '123' && val[1] != '456') throw new Error("Wrong val used");
    				actual=val;
    			},
    			realBodyList:[targetRealBodyList1, targetRealBodyList2],
    			offset:0,
    			cmp:{
    				_currentBodyCollector:''
    			}
        	};        	        	        	
        	
        	var targetIndexCollector={	
    			body:[],
    			bodyCollector:targetBodyCollector
    		};  
        	
        	targetBodyCollector.cmp._currentBodyCollector = targetBodyCollector;
        	
        	// Act
			var callback = targetHelper.createAddComponentCallback(targetIndexCollector, 0);			
			callback(expected);
			
			// Assert
			Assert.Equal(expected, targetIndexCollector.body[0]);
			Assert.Equal(expected, actual);
        }    
        
        [Fact]
        function callbackCalledWithRealBodyListTwo(){
        	// Arrange 
        	var expected = ['123','456'];           	        	
        	var actual = '';        
        	
        	var targetRealBodyList=['123', '456'];
        	
        	var targetBodyCollector={
    			count:1,
    			callback:function(val){
    				if(val[0] != '123' && val[1] != '456') throw new Error("Wrong val used");
    				actual=val;
    			},
    			realBodyList:[targetRealBodyList],
    			offset:0,
    			cmp:{
    				_currentBodyCollector:''
    			}
        	};        	        	        	
        	
        	var targetIndexCollector={	
    			body:[],
    			bodyCollector:targetBodyCollector
    		};  
        	
        	targetBodyCollector.cmp._currentBodyCollector = targetBodyCollector;
        	
        	// Act
			var callback = targetHelper.createAddComponentCallback(targetIndexCollector, 0);			
			callback(expected);
			
			// Assert
			Assert.Equal(expected, targetIndexCollector.body[0]);
			Assert.Equal(expected, actual);
        }    
    }
    
    [Fixture]
    function createComponentsForIndex(){    	    	    	        
    	                        
        [Fact]
        function testBodyLengthZero(){
        	// Arrange 
        	var expected = 0;                	
        	
        	var targetBody={
    			getLength:function(){
    				return 0;
    			}
        	};
        	        	        	       
        	var targetAttributes={
        		get:function(att){
        			if(att=="var") return "var";
        			if(att=="indexVar") return false;        			
        		},
        		getValue:function(att){
        			if(att=="body") return targetBody;
        			if(att=="forceServer"){
	        			return {
	        				getValue:function(){					
								return 'forceServer';
							}
						};
        			}
        		},
        		getValueProvider:function(){
        			return '';
        		}
        	};        	        	        	

        	var targetBodyCollector={	
    			count:0,
    			realBodyList:[]
    		};
        	
        	var targetCmp={
    			getAttributes:function(){
					return targetAttributes;
				}		        			
        	};
        	
        	var targetItems={
    			getValue:function(index){
					return 'Some Value';
				}		        			
        	};
        	
        	// Act
			var actual = targetHelper.createComponentsForIndex(targetBodyCollector, targetCmp, targetItems, 0, false);
			
			// Assert
            Assert.Equal(expected, actual);
            Assert.Equal(targetBody.getLength()-1, targetBodyCollector.count);
        }
        
        [Fact]
        function testExpressionServiceCreate(){
        	// Arrange 
        	var expected = 0; 
        	var actual;
        	
        	var targetBody={
    			getLength:function(){
    				return 0;
    			}
        	};
        	        	        	       
        	var targetAttributes={
        		get:function(att){
        			if(att=="var") return "var";
        			if(att=="indexVar") return true;        			
        		},
        		getValue:function(att){
        			if(att=="body") return targetBody;
        			if(att=="forceServer"){
	        			return {
	        				getValue:function(){					
								return 'forceServer';
							}
						};
        			}
        		},
        		getValueProvider:function(){
        			return '';
        		}
        	};        	        	        	

        	var targetBodyCollector={	
    			count:0,
    			realBodyList:[]
    		};
        	
        	var targetCmp={
    			getAttributes:function(){
					return targetAttributes;
				}		        			
        	};
        	
        	var targetItems={
    			getValue:function(index){
    				if(index != 0) throw new Error("Wrong index used");
					return 'Some Value';
				}		        			
        	};
        	
        	var mockContext = Mocks.GetMock(Object.Global(), "$A", {                                
        		expressionService: {   
					create: function(valueProvider, config) {
						if(valueProvider != null) throw new Error("Wrong valueProvider used");
						if(config != 0) throw new Error("Wrong config used");
						return 'iv'; 
					}					
	            }
	        });												
			 
            // Act									
			mockContext(function(){	       
				actual = targetHelper.createComponentsForIndex(targetBodyCollector, targetCmp, targetItems, 0, false);
			});
			
			// Assert
            Assert.Equal(expected, actual);
            Assert.Equal(targetBody.getLength()-1, targetBodyCollector.count);
        }
        
        [Fixture]
        function testBodyLengthAndAttValueProvider(){
        
        	var expected;   
        	var actual;
        	var ivpCalled = 0;
        	var compCreated = 0;
        	
        	var targetConfig={
    			valueProvider:'vp'
        	};
        	
        	var targetBodyLength;
        	
        	var targetBody={
    			getLength:function(){
    				return targetBodyLength;
    			},
    			get:function(index){
    				if(this.getLength() == 1 && index != 0) throw new Error("Wrong index used");
    				if(this.getLength() == 2 && (index != 0 && index != 1)) throw new Error("Wrong index used");
    				return targetConfig;
    			}
        	};        	        	        
        	
        	var targetAttributeValueProvider = '';
        	
        	var targetAttributes={
        		get:function(att){
        			if(att=="var") return 'var';
        			if(att=="indexVar") return false;        			
        		},
        		getValue:function(att){
        			if(att=="body") return targetBody;
        			if(att=="forceServer"){
	        			return {
	        				getValue:function(){					
								return 'forceServer';
							}
						};
        			}
        		},
        		getValueProvider:function(){
        			return targetAttributeValueProvider;
        		}
        	};        	        	        	

        	var targetBodyCollector={	
    			count:0,
    			realBodyList:[]
    		};
        	
        	var targetCmp={
    			getAttributes:function(){
					return targetAttributes;
				}		        			
        	};
        	
        	var targetItems={
    			getValue:function(index){
    				if(index != 0) throw new Error("Wrong index used");
					return 'Some Value';
				}		        			
        	};
        	
        	var mockContext = Mocks.GetMock(Object.Global(), "$A", {                                
        		expressionService: {   
        			createPassthroughValue: function(primaryProviders, cmp) { 
        				if(primaryProviders['var'] != 'Some Value') throw new Error("Wrong primaryProviders used");        				
    					if(cmp != 'vp') throw new Error("Wrong cmp used");
    					
    					ivpCalled += 1;
        				return 'ivp'; 
    				}					
	            },
	            componentService: {   
	            	newComponentAsync: function(callbackScope, callback, config, attributeValueProvider, localCreation, doForce, forceServer) { 
	            		if(callback != 'callback') throw new Error("Wrong Callback used");   
	            		if(config != targetConfig) throw new Error("Wrong Config used");
	            		if(attributeValueProvider != 'ivp') throw new Error("Wrong AttributeValueProvider used");
	            		if(localCreation != false) throw new Error("Wrong localCreation used");
	            		if(doForce != false) throw new Error("Wrong doForce used"); // TODO fix this
	            		if(forceServer != 'forceServer') throw new Error("Wrong forceServer used"); 
	            		
	            		compCreated += 1;
        			}					
	            }
	        });		
        	
        	var mockMethod = Mocks.GetMock(targetHelper, "createAddComponentCallback", function(indexCollector, index){       
        		if(indexCollector.bodyCollector != targetBodyCollector) throw new Error("Wrong BodyCollector used");        		        		
        		if(targetBody.getLength() == 1 && index != 0) throw new Error("Wrong Index used");
        		if(targetBody.getLength() == 2 && (index != 0 && index != 1)) throw new Error("Wrong Index used");        		        		
        		return 'callback';    		
        	});
        	
	        [Fact]
	        function testBodyLengthOne(){
	        	// Arrange 
	        	expected = 1;   
	        	actual = 0;
	        	ivpCalled = 0;
	        	compCreated = 0;
	        	
	        	targetBodyLength = 1;	        	
	        	targetBodyCollector.count = 0;
				 
	            // Act								
				mockContext(function(){
					mockMethod(function(){
						actual = targetHelper.createComponentsForIndex(targetBodyCollector, targetCmp, targetItems, 0, false);
					});
				});
				
				// Assert
	            Assert.Equal(expected, actual);            
	            Assert.Equal(targetBody.getLength()-1, targetBodyCollector.count);                        
	            Assert.Equal(1, ivpCalled);
	            Assert.Equal(1, compCreated);
	        }
	        
	        [Fact]
	        function testBodyLengthTwo(){
	        	// Arrange 
	        	expected = 2;   
	        	actual = 0;
	        	ivpCalled = 0;
	        	compCreated = 0; 
	        	
	        	targetBodyLength = 2;
	        	targetBodyCollector.count = 0;
	        	
	        	// Act								
				mockContext(function(){
					mockMethod(function(){
						actual = targetHelper.createComponentsForIndex(targetBodyCollector, targetCmp, targetItems, 0, false);
					});
				});
				
				// Assert
	            Assert.Equal(expected, actual);
	            Assert.Equal(targetBody.getLength()-1, targetBodyCollector.count);
	            Assert.Equal(1, ivpCalled);
	            Assert.Equal(2, compCreated);
	        }        
	        
	        [Fact]
	        function testOneAttValueProvider(){
	        	// Arrange 
	        	expected = 1;   
	        	actual = 0;
	        	ivpCalled = 0;
	        	compCreated = 0;
	        	
	        	targetBodyLength = 1;
	        	targetBodyCollector.count = 0;
	        	
	        	targetConfig={
	    			valueProvider:undefined
	        	};
	        	
	        	targetAttributeValueProvider = 'vp';
				 
	            // Act								
				mockContext(function(){
					mockMethod(function(){
						actual = targetHelper.createComponentsForIndex(targetBodyCollector, targetCmp, targetItems, 0, false);
					});
				});
				
				// Assert
	            Assert.Equal(expected, actual);            
	            Assert.Equal(targetBody.getLength()-1, targetBodyCollector.count);                        
	            Assert.Equal(1, ivpCalled);
	            Assert.Equal(1, compCreated);
	        }
	        
	        [Fact]
	        function testTwoAttValueProvider(){
	        	// Arrange 
	        	expected = 2;   
	        	actual = 0;
	        	ivpCalled = 0;
	        	compCreated = 0; 
	        	
	        	targetBodyLength = 2;
	        	targetBodyCollector.count = 0;
	        	
	        	targetConfig={
	    			valueProvider:undefined
	        	};
	        	
	        	targetAttributeValueProvider = 'vp';
	        	
	        	// Act								
				mockContext(function(){
					mockMethod(function(){
						actual = targetHelper.createComponentsForIndex(targetBodyCollector, targetCmp, targetItems, 0, false);
					});
				});
				
				// Assert
	            Assert.Equal(expected, actual);
	            Assert.Equal(targetBody.getLength()-1, targetBodyCollector.count);
	            Assert.Equal(1, ivpCalled);
	            Assert.Equal(2, compCreated);
	        }
        }                
    }
    
    [Fixture]
    function createComponentsForIndexFromServer(){    	    	    	        
    	                        
        [Fact]
        function testBodyLengthZero(){
        	// Arrange 
        	var expected = 0;    
        	var actual;
        	
        	var targetBody={
    			getLength:function(){
    				return 0;
    			}
        	};
        	        	        	       
        	var targetAttributes={
        		get:function(att){
        			if(att=="var") return "var";
        			if(att=="indexVar") return false;        			
        		},
        		getValue:function(att){
        			if(att=="body") return targetBody;        			
        		}
        	};        	        	        	        	
        	
        	var targetCmp={
    			getAttributes:function(){
					return targetAttributes;
				}		        			
        	};
        	
        	var targetItems={
    			getValue:function(index){
					return 'Some Value';
				}		        			
        	};
        	
        	var mockContext = Mocks.GetMock(Object.Global(), "$A", {                                        		  
        		setCreationPathIndex: function(index) { 
    				if(index != 0) throw new Error("Wrong index used");        									
				},
        		pushCreationPath: function(body) { 
    				if(body != 'body') throw new Error("Wrong body used in push");        									
				},
				popCreationPath: function(body) { 
    				if(body != 'body') throw new Error("Wrong body used in pop");        									
				}
        	});	
			 
            // Act								
        	mockContext(function(){       
				actual = targetHelper.createComponentsForIndexFromServer(targetCmp, targetItems, 0, false);
			});
			
			// Assert
            Assert.Equal(expected, actual.length);
        }
        
        [Fact]
        function testExpressionServiceCreate(){
        	// Arrange 
        	var expected = 0;    
        	var actual;
        	
        	var targetBody={
    			getLength:function(){
    				return 0;
    			}
        	};
        	        	        	       
        	var targetAttributes={
        		get:function(att){
        			if(att=="var") return "var";
        			if(att=="indexVar") return true;        			
        		},
        		getValue:function(att){
        			if(att=="body") return targetBody;        			
        		},
        		getValueProvider:function(){
        			return '';
        		}
        	};        	        	        	        	
        	
        	var targetCmp={
    			getAttributes:function(){
					return targetAttributes;
				}		        			
        	};
        	
        	var targetItems={
    			getValue:function(index){
					return 'Some Value';
				}		        			
        	};
        	
        	var mockContext = Mocks.GetMock(Object.Global(), "$A", {                                        		  
        		setCreationPathIndex: function(index) { 
    				if(index != 0) throw new Error("Wrong index used");        									
				},
        		pushCreationPath: function(body) { 
    				if(body != 'body') throw new Error("Wrong body used in push");        									
				},
				popCreationPath: function(body) { 
    				if(body != 'body') throw new Error("Wrong body used in pop");        									
				},
				expressionService: {   
					create: function(valueProvider, config) {
						if(valueProvider != null) throw new Error("Wrong valueProvider used");
						if(config != 0) throw new Error("Wrong config used");
						return 'iv'; 
					}					
	            }
        	});										
			 
            // Act					  								
        	mockContext(function(){       
				actual = targetHelper.createComponentsForIndexFromServer(targetCmp, targetItems, 0, false);
        	});
			
			// Assert
            Assert.Equal(expected, actual.length);
        }
        
        [Fixture]
        function testBodyLengthAndAttValueProvider(){
        	
        	var expected = 1;    
        	var actual;
        	
        	var targetConfig={
    			valueProvider:'vp'
        	};
        	
        	var targetBodyLength;
        	
        	var targetBody={
    			getLength:function(){
    				return targetBodyLength;
    			},
    			get:function(index){
    				if(this.getLength() == 1 && index != 0) throw new Error("Wrong index used");
    				if(this.getLength() == 2 && (index != 0 && index != 1)) throw new Error("Wrong index used");
    				return targetConfig;
    			}
        	};
        	
        	var targetAttributeValueProvider = '';
        	        	        	       
        	var targetAttributes={
        		get:function(att){
        			if(att=="var") return "var";
        			if(att=="indexVar") return false;        			
        		},
        		getValue:function(att){
        			if(att=="body") return targetBody;        			
        		},
        		getValueProvider:function(){
        			return targetAttributeValueProvider;
        		}
        	};        	        	        	        	
        	
        	var targetCmp={
    			getAttributes:function(){
					return targetAttributes;
				}		        			
        	};
        	
        	var targetItems={
    			getValue:function(index){
					return 'Some Value';
				}		        			
        	};
        	
        	var mockContext = Mocks.GetMock(Object.Global(), "$A", {                                        		  
        		setCreationPathIndex: function(index) { 
    				if(targetBody.getLength() == 1 && index != 0) throw new Error("Wrong index used");
    				if(targetBody.getLength() == 2 && (index != 0 && index != 1)) throw new Error("Wrong index used");
				},
        		pushCreationPath: function(body) { 
    				if(body != 'body') throw new Error("Wrong body used in push");        									
				},
				popCreationPath: function(body) { 
    				if(body != 'body') throw new Error("Wrong body used in pop");        									
				},                              
        		expressionService: {   
        			createPassthroughValue: function(primaryProviders, cmp) { 
        				if(primaryProviders['var'] != 'Some Value') throw new Error("Wrong primaryProviders used");        				
    					if(cmp != 'vp') throw new Error("Wrong cmp used");
        				return 'ivp'; 
    				}					
	            },
	            componentService: {   
	            	newComponentDeprecated: function(config, attributeValueProvider, localCreation, doForce) {
	            		if(config != targetConfig) throw new Error("Wrong Config used");
	            		if(attributeValueProvider != 'ivp') throw new Error("Wrong AttributeValueProvider used");
	            		if(localCreation != false) throw new Error("Wrong localCreation used");
	            		if(doForce != false) throw new Error("Wrong doForce used"); // TODO fix this
	            		
	            		return 'ret';
        			}					
	            }
	        });	       
        
	        [Fact]
	        function testBodyLengthOne(){
	        	// Arrange 
	        	expected = 1;    
	        	actual;
	        	targetBodyLength = 1;
				 
	            // Act						
	        	mockContext(function(){      
	        		actual = targetHelper.createComponentsForIndexFromServer(targetCmp, targetItems, 0, false);
				});
				
				// Assert
	            Assert.Equal(expected, actual.length);
	            Assert.Equal('ret', actual[0]);
	        }
	        
	        [Fact]
	        function testBodyLengthTwo(){
	        	// Arrange 
	        	expected = 2;    
	        	actual;
	        	targetBodyLength = 2;
	        	
	            // Act						
	        	mockContext(function(){      
	        		actual = targetHelper.createComponentsForIndexFromServer(targetCmp, targetItems, 0, false);
				});
				
				// Assert
	            Assert.Equal(expected, actual.length);
	            Assert.Equal('ret', actual[0]);
	            Assert.Equal('ret', actual[1]);
	        }        
        
	        [Fact]
	        function testOneAttValueProvider(){
	        	// Arrange 
	        	expected = 1;    
	        	actual;
	        	targetBodyLength = 1;
	        	
	        	targetConfig={
	    			valueProvider:undefined
	        	};
	        	
	        	targetAttributeValueProvider = 'vp';        	        	
				 
	            // Act						
	        	mockContext(function(){      
	        		actual = targetHelper.createComponentsForIndexFromServer(targetCmp, targetItems, 0, false);
				});
				
				// Assert
	            Assert.Equal(expected, actual.length);
	            Assert.Equal('ret', actual[0]);
	        }
	        
	        [Fact]
	        function testTwoAttValueProvider(){
	        	// Arrange 
	        	expected = 2;    
	        	actual;
	        	targetBodyLength = 2;
	        	
	        	targetConfig={
	    			valueProvider:undefined
	        	};
	        	
	        	targetAttributeValueProvider = 'vp';
	        	
	            // Act						
	        	mockContext(function(){      
	        		actual = targetHelper.createComponentsForIndexFromServer(targetCmp, targetItems, 0, false);
				});
				
				// Assert
	            Assert.Equal(expected, actual.length);
	            Assert.Equal('ret', actual[0]);
	            Assert.Equal('ret', actual[1]);
	        }
        }           
    }

    [Fixture]
    function createRealBody(){ 
    	
    	[Fixture]
        function testCallbackCalled(){
        	
        	var expected = true;    
        	var actual = false;
        	var isLiteral;
        	var isEmpty;
        	
        	var targetItems={
    			getLength:function(){
    				return 1;
    			},
    			isLiteral:function(){
    				return isLiteral;
    			},
    			isEmpty:function(){
    				return isEmpty;
    			}
        	};
        	        	        	       
        	var targetAttributes={        		
        		getValue:function(att){
        			if(att=="items") return targetItems;         			       			
        		}
        	};        	        	        	        	
        	
        	var targetCmp={
    			_currentBodyCollector:'',
    			getAttributes:function(){
					return targetAttributes;
				}		        			
        	};
        	
        	var targetCallback = function(arg){
        		actual = true;
        	};        	        	        	        	        	        				             
    	
	    	[Fact]
	        function testWithBoth(){
	        	// Arrange 
	        	expected = true;    
	        	actual = false;
	        	isLiteral = true;
	        	isEmpty = true;        	
	        	        	        	        	        				 
	            // Act								        
				targetHelper.createRealBody(targetCmp, true, targetCallback);
	        	
				// Assert
	            Assert.Equal(expected, actual);
	            Assert.Equal([], targetCmp._currentBodyCollector.realBodyList);
	            Assert.Equal(targetCallback, targetCmp._currentBodyCollector.callback);
	            Assert.Equal(targetItems.getLength(), targetCmp._currentBodyCollector.count);
	            Assert.Equal(targetCmp, targetCmp._currentBodyCollector.cmp);
	            Assert.Equal(0, targetCmp._currentBodyCollector.offset);
	        }
	    	                        
	        [Fact]
	        function testWithEmpty(){
	        	// Arrange 
	        	expected = true;    
	        	actual = false;
	        	isLiteral = false;
	        	isEmpty = true;        	        	
	        	        	        	        	        				 
	            // Act								        
				targetHelper.createRealBody(targetCmp, true, targetCallback);
	        	
				// Assert
	            Assert.Equal(expected, actual);
	            Assert.Equal([], targetCmp._currentBodyCollector.realBodyList);
	            Assert.Equal(targetCallback, targetCmp._currentBodyCollector.callback);
	            Assert.Equal(targetItems.getLength(), targetCmp._currentBodyCollector.count);
	            Assert.Equal(targetCmp, targetCmp._currentBodyCollector.cmp);
	            Assert.Equal(0, targetCmp._currentBodyCollector.offset);
	        }
	        
	        [Fact]
	        function testWithLiteral(){
	        	// Arrange 
	        	expected = true;    
	        	actual = false;
	        	isLiteral = true;
	        	isEmpty = false;        	 
	        	        	        	        	        				 
	            // Act								        
				targetHelper.createRealBody(targetCmp, true, targetCallback);
	        	
				// Assert
	            Assert.Equal(expected, actual);
	            Assert.Equal([], targetCmp._currentBodyCollector.realBodyList);
	            Assert.Equal(targetCallback, targetCmp._currentBodyCollector.callback);
	            Assert.Equal(targetItems.getLength(), targetCmp._currentBodyCollector.count);
	            Assert.Equal(targetCmp, targetCmp._currentBodyCollector.cmp);
	            Assert.Equal(0, targetCmp._currentBodyCollector.offset);
	        }  
    	}
        
        [Fixture]
        function testBodyNotCreated(){
        	var expected = true;    
        	var actual = false;
        	var isEnd;
        	var isStart;        	
        	
        	var targetEnd={
    			isDefined:function(){
    				return isEnd;
    			}
        	};
        	
        	var targetStart={
    			isDefined:function(){
    				return isStart;
    			}
        	};
        	
        	var targetItemsLength;
        	
        	var targetItems={
    			getLength:function(){
    				return targetItemsLength;
    			},
    			isLiteral:function(){
    				return false;
    			},
    			isEmpty:function(){
    				return false;
    			}
        	};
        	        	        	       
        	var targetAttributes={        		
        		getValue:function(att){
        			if(att=="items") return targetItems;  
        			if(att=="start") return targetStart;
        			if(att=="end") return targetEnd;
        		}
        	};        	        	        	        	
        	
        	var targetCmp={
    			_currentBodyCollector:'',
    			getAttributes:function(){
					return targetAttributes;
				}		        			
        	};
        	
        	var targetCallback = function(arg){
        		actual = true;
        	};   
        	
        	[Fact]
	        function testBothNotDefined(){
	        	// Arrange 
	        	expected = true;    
	        	actual = false;
	        	isEnd = false;
	        	isStart = false;
	        	targetItemsLength = 0;
	        	
	        	// Act								        
				targetHelper.createRealBody(targetCmp, true, targetCallback);
	        	
				// Assert
	            Assert.Equal(expected, actual);
        	}
        
	        [Fact]
	        function testStartDefined(){
	        	// Arrange 
	        	expected = true;    
	        	actual = false;
	        	isEnd = false;
	        	isStart = true;
	        	targetItemsLength = 0;
	        	
	        	var mockGetNumber = Mocks.GetMock(targetHelper, "getNumber", function(start){       
	        		if(start != targetStart) throw new Error("Wrong start used");        		        		      		        		        		        		
	        		
	        		return 0;        		
	        	});	
	        	        	        	        	        				 
	            // Act		
	        	mockGetNumber(function(){
	        		targetHelper.createRealBody(targetCmp, true, targetCallback);
	        	});
	        	
				// Assert
	            Assert.Equal(expected, actual);
	        }
	        
	        [Fact]
	        function testStartDefinedGreater(){
	        	// Arrange 
	        	expected = true;    
	        	actual = false;  
	        	isEnd = false;
	        	isStart = true;
	        	targetItemsLength = 0;
	        	
	        	var mockGetNumber = Mocks.GetMock(targetHelper, "getNumber", function(start){       
	        		if(start != targetStart) throw new Error("Wrong start used");        		        		      		        		        		        		
	        		
	        		return 1;        		
	        	});	
	        	        	        	        	        				 
	            // Act		
	        	mockGetNumber(function(){
	        		targetHelper.createRealBody(targetCmp, true, targetCallback);
	        	});
	        	
				// Assert
	            Assert.Equal(expected, actual);
	        }        
        
	        [Fact]
	        function testEndDefined(){
	        	// Arrange 
	        	expected = true;    
	        	actual = false;
	        	isEnd = true;
	        	isStart = false;
	        	targetItemsLength = 0;        	   
	        	
	        	var mockGetNumber = Mocks.GetMock(targetHelper, "getNumber", function(end){       
	        		if(end != targetEnd) throw new Error("Wrong end used");        		        		      		        		        		        		
	        		
	        		return 0;        		
	        	});	
	        	        	        	        	        				 
	            // Act		
	        	mockGetNumber(function(){
	        		targetHelper.createRealBody(targetCmp, true, targetCallback);
	        	});
	        	
				// Assert
	            Assert.Equal(expected, actual);
	        }
	        
	        [Fact]
	        function testEndDefinedLesser(){
	        	// Arrange 
	        	expected = true;    
	        	actual = false;
	        	isEnd = true;
	        	isStart = false;
	        	targetItemsLength = 1;        		              	  
	        	
	        	var mockGetNumber = Mocks.GetMock(targetHelper, "getNumber", function(end){       
	        		if(end != targetEnd) throw new Error("Wrong end used");        		        		      		        		        		        		
	        		
	        		return 0;        		
	        	});	
	        	        	        	        	        				 
	            // Act		
	        	mockGetNumber(function(){
	        		targetHelper.createRealBody(targetCmp, true, targetCallback);
	        	});
	        	
				// Assert
	            Assert.Equal(expected, actual);
	        }
        }
        
        [Fixture]
        function testBodyNotCreatedBothDefined(){
        	
        	var expected = true;    
        	var actual = false;
        	
        	var targetEnd={
    			type:'e',
    			isDefined:function(){
    				return true;
    			}
        	};
        	
        	var targetStart={
        		type:'s',	
    			isDefined:function(){
    				return true;
    			}
        	};
        	
        	var targetItemsLength;
        	
        	var targetItems={
    			getLength:function(){
    				return targetItemsLength;
    			},
    			isLiteral:function(){
    				return false;
    			},
    			isEmpty:function(){
    				return false;
    			}
        	};
        	        	        	       
        	var targetAttributes={        		
        		getValue:function(att){
        			if(att=="items") return targetItems;  
        			if(att=="start") return targetStart;
        			if(att=="end") return targetEnd;
        		}
        	};        	        	        	        	
        	
        	var targetCmp={
    			_currentBodyCollector:'',
    			getAttributes:function(){
					return targetAttributes;
				}		        			
        	};
        	
        	var targetCallback = function(arg){
        		actual = true;
        	};    
        	
        	var mockGetNumber = Mocks.GetMock(targetHelper, "getNumber", function(num){       
        		if(num != targetStart && num != targetEnd) throw new Error("Wrong num used");        		
        		if(num == targetStart){
        			if(targetItems.getLength() == 0)return 0;
        			if(targetItems.getLength() == 2)return 1;
        		}
        		if(num == targetEnd){
        			if(targetItems.getLength() == 0)return 0;
        			if(targetItems.getLength() == 2)return 1;
        		}        		
        	});	
        
	        [Fact]
	        function testBothSame(){
	        	// Arrange 
	        	expected = true;    
	        	actual = false;
	        	targetItemsLength = 0;
	        	        	        	        	        				 
	            // Act		
	        	mockGetNumber(function(){
	        		targetHelper.createRealBody(targetCmp, true, targetCallback);
	        	});
	        	
				// Assert
	            Assert.Equal(expected, actual);
	        }
	        
	        [Fact]
	        function testBothDifferent(){
	        	// Arrange 
	        	expected = true;    
	        	actual = false; 
	        	targetItemsLength = 2;
	        	        	        	        	        				 
	            // Act		
	        	mockGetNumber(function(){
	        		targetHelper.createRealBody(targetCmp, true, targetCallback);
	        	});
	        	
				// Assert
	            Assert.Equal(expected, actual);
	        }
        }
        
        [Fixture]
        function testBodyCreated(){
        
        	var expected;    
        	var actual;
        	var callbackCalled;
        	
        	var targetEnd={
    			isDefined:function(){
    				return false;
    			}
        	};
        	
        	var targetStart={
    			isDefined:function(){
    				return false;
    			}
        	};
        	
        	var targetItemsLength;
        	
        	var targetItems={
    			getLength:function(){
    				return targetItemsLength;
    			},
    			isLiteral:function(){
    				return false;
    			},
    			isEmpty:function(){
    				return false;
    			}
        	};
        	        	        	       
        	var targetAttributes={        		
        		getValue:function(att){
        			if(att=="items") return targetItems;  
        			if(att=="start") return targetStart;
        			if(att=="end") return targetEnd;
        		}
        	};        	        	        	        	
        	
        	var targetCmp={
    			_currentBodyCollector:'',
    			getAttributes:function(){
					return targetAttributes;
				}		        			
        	};
        	
        	var targetCallback = function(arg){
        		actual = true;
        	};      
        	
        	var mockCreateComponentsForIndex = Mocks.GetMock(targetHelper, "createComponentsForIndex", function(bodyCollector, cmp, items, index, doForce){       
        		if(bodyCollector.count != targetItems.getLength()) throw new Error("Wrong bodyCollector used");
        		if(cmp != targetCmp) throw new Error("Wrong cmp used");
        		if(items != targetItems) throw new Error("Wrong items used");
        		if(targetItems.getLength() == 1 && index != 0) throw new Error("Wrong index used");
        		if(targetItems.getLength() == 2 && index != 0 && index != 1) throw new Error("Wrong index used");
        		if(doForce != true) throw new Error("Wrong doForce used");
        		   
        		actual += 1;        		
        		return 1;
        	});	
        
	        [Fact]
	        function testCreatedOnce(){
	        	// Arrange 
	        	expected = 1;    
	        	actual = 0;
	        	callbackCalled= false;
	        	targetItemsLength = 1;
	        	        	        	        	        				 
	            // Act		
	        	mockCreateComponentsForIndex(function(){								        
	        		targetHelper.createRealBody(targetCmp, true, targetCallback);
	        	});
	        	
				// Assert
	            Assert.Equal(expected, actual);
	            Assert.Equal(false, callbackCalled);
	        }
	        
	        [Fact]
	        function testCreatedTwice(){
	        	// Arrange 
	        	expected = 2;    
	        	actual = 0;
	        	callbackCalled= false;  
	        	targetItemsLength = 2;
	        	        	        	        	        				 
	            // Act		
	        	mockCreateComponentsForIndex(function(){								        
	        		targetHelper.createRealBody(targetCmp, true, targetCallback);
	        	});
	        	
				// Assert
	            Assert.Equal(expected, actual);
	            Assert.Equal(false, callbackCalled);
	        }
        }
    }
    
    [Fixture]
    function createRealBodyServer(){  
    	
    	[Fixture]
        function testChecks(){
	    	var expected = [];    
	    	var actual;
	    	var isLiteral;
	    	var isEmpty;
	    	
	    	var targetItems={    			
				isLiteral:function(){
					return isLiteral;
				},
				isEmpty:function(){
					return isEmpty;
				}
	    	};
	    	        	        	       
	    	var targetAttributes={        		
	    		getValue:function(att){
	    			if(att=="items") return targetItems;         			       			
	    		}
	    	};        	        	        	        	
	    	
	    	var targetCmp={    			
				getAttributes:function(){
					return targetAttributes;
				}		        			
	    	};        	    
    	
	    	[Fact]
	        function testBoth(){
	        	// Arrange 
	        	expected = [];    
	        	actual;
	        	isLiteral = true;
		    	isEmpty = true;        	        	
	        	        	        	        	        				 
	            // Act								        
				actual = targetHelper.createRealBodyServer(targetCmp, true);
	        	
				// Assert
	            Assert.Equal(expected, actual);
	        }
	    	
	    	[Fact]
	        function testOnlyEmpty(){
	        	// Arrange 
	        	expected = [];    
	        	actual;
	        	isLiteral = false;
		    	isEmpty = true;         	      	    
	        	        	        	        	        				 
	            // Act								        
				actual = targetHelper.createRealBodyServer(targetCmp, true);
	        	
				// Assert
	            Assert.Equal(expected, actual);
	        }
	    	
	    	[Fact]
	        function testOnlyLiteral(){
	        	// Arrange 
	        	expected = [];    
	        	actual;
	        	isLiteral = true;
		    	isEmpty = false; 
	        	        	        	        				 
	            // Act								        
				actual = targetHelper.createRealBodyServer(targetCmp, true);
	        	
				// Assert
	            Assert.Equal(expected, actual);
	        }
    	}
    	    	    	
    	[Fixture]
        function testBodyNotCreated(){
    		
    		var expected = [];    
        	var actual;
        	var isEnd;
        	var isStart;
        	
        	var targetEnd={
    			isDefined:function(){
    				return isEnd;
    			}
        	};
        	
        	var targetStart={
    			isDefined:function(){
    				return isStart;
    			}
        	};
        	        	   
        	var targetItemsLength;
        	
        	var targetItems={
    			getLength:function(){
    				return targetItemsLength;
    			},        	    			
    			isLiteral:function(){
    				return false;
    			},
    			isEmpty:function(){
    				return false;
    			}
        	};
        	        	        	       
        	var targetAttributes={        		
        		getValue:function(att){
        			if(att=="items") return targetItems;
        			if(att=="start") return targetStart;
        			if(att=="end") return targetEnd;
        		}
        	};        	        	        	        	
        	
        	var targetCmp={    			
    			getAttributes:function(){
					return targetAttributes;
				}		        			
        	}; 
        	
        	var mockContext = Mocks.GetMock(Object.Global(), "$A", {                                        		          		
        		pushCreationPath: function(body) { 
    				if(body != 'realbody') throw new Error("Wrong body used in push");        									
				},
				popCreationPath: function(body) { 
    				if(body != 'realbody') throw new Error("Wrong body used in pop");        									
				}
        	});	       
        	
        	[Fact]
            function testBodyNotCreatedStartEndNotDefined(){
        		// Arrange 
        		expected = [];    
            	actual;
            	isStart = false;
	        	isEnd = false;
	        	targetItemsLength = 0;
	        	
	        	// Act								
	        	mockContext(function(){								        
	        		actual = targetHelper.createRealBodyServer(targetCmp, true);
	        	});
	        	
				// Assert
	            Assert.Equal(expected, actual);
        	}
    	
	    	[Fact]
	        function testStartDefined(){
	        	// Arrange 
	    		expected = [];    
	        	actual;	        	
	        	isStart = true;
	        	isEnd = false;
	        	targetItemsLength = 0;
	        	
	        	var mockGetNumber = Mocks.GetMock(targetHelper, "getNumber", function(start){       
	        		if(start != targetStart) throw new Error("Wrong start used");        		        		      		        		        		        		
	        		
	        		return 0;        		
	        	});	
				 
	            // Act								
	        	mockContext(function(){
	        		mockGetNumber(function(){
	        			actual = targetHelper.createRealBodyServer(targetCmp, true);
	        		});
	        	});
	        	
				// Assert
	            Assert.Equal(expected, actual);
	        }
	    	
	    	[Fact]
	        function testStartDefinedGreater(){
	        	// Arrange 
	        	expected = [];    
	        	actual;	        	
	        	isStart = true;
	        	isEnd = false;
	        	targetItemsLength = 0;
	        	
	        	var mockGetNumber = Mocks.GetMock(targetHelper, "getNumber", function(start){       
	        		if(start != targetStart) throw new Error("Wrong start used");        		        		      		        		        		        		
	        		
	        		return 1;        		
	        	});	
	        	
	            // Act								
	        	mockContext(function(){
	        		mockGetNumber(function(){
	        			actual = targetHelper.createRealBodyServer(targetCmp, true);
	        		});
	        	});
	        	
				// Assert
	            Assert.Equal(expected, actual);
	    	}    	        	        	
    	    
	    	[Fact]
	        function testEndDefined(){
	        	// Arrange 
	    		expected = [];    
	        	actual;
	        	isStart = false;
	        	isEnd = true;	        	
	        	targetItemsLength = 0;
	        	
	        	var mockGetNumber = Mocks.GetMock(targetHelper, "getNumber", function(end){       
	        		if(end != targetEnd) throw new Error("Wrong end used");        		        		      		        		        		        		
	        		
	        		return 0;        		
	        	});
				 
	            // Act								
	        	mockContext(function(){
	        		mockGetNumber(function(){
	        			actual = targetHelper.createRealBodyServer(targetCmp, true);
	        		});
	        	});
	        	
				// Assert
	            Assert.Equal(expected, actual);
	        }
	    	
	    	[Fact]
	        function testEndDefinedLesser(){
	        	// Arrange 
	        	expected = [];    
	        	actual;   
	        	isStart = false;
	        	isEnd = true;
	        	targetItemsLength = 1;
	        	
	        	var mockGetNumber = Mocks.GetMock(targetHelper, "getNumber", function(end){       
	        		if(end != targetEnd) throw new Error("Wrong end used");        		        		      		        		        		        		
	        		
	        		return 0;        		
	        	});
				 
	            // Act								
	        	mockContext(function(){
	        		mockGetNumber(function(){
	        			actual = targetHelper.createRealBodyServer(targetCmp, true);
	        		});
	        	});
	        	
				// Assert
	            Assert.Equal(expected, actual);
	        }
    	}
    	
    	[Fixture]
        function testBodyNotCreatedBothDefined(){
    		
    		var expected;    
        	var actual;
        	
        	var targetEnd={
    			type:'e',
    			isDefined:function(){
    				return true;
    			}
        	};
        	
        	var targetStart={
        		type:'s',	
    			isDefined:function(){
    				return true;
    			}
        	};
        	
        	var targetItemsLength;
        	var targetItems={
    			getLength:function(){
    				return targetItemsLength;
    			},        	    			
    			isLiteral:function(){
    				return false;
    			},
    			isEmpty:function(){
    				return false;
    			}
        	};
        	        	        	       
        	var targetAttributes={        		
        		getValue:function(att){
        			if(att=="items") return targetItems;
        			if(att=="start") return targetStart;
        			if(att=="end") return targetEnd;
        		}
        	};        	        	        	        	
        	
        	var targetCmp={    			
    			getAttributes:function(){
					return targetAttributes;
				}		        			
        	}; 
        	
        	var mockContext = Mocks.GetMock(Object.Global(), "$A", {                                        		          		
        		pushCreationPath: function(body) { 
    				if(body != 'realbody') throw new Error("Wrong body used in push");        									
				},
				popCreationPath: function(body) { 
    				if(body != 'realbody') throw new Error("Wrong body used in pop");        									
				}
        	});	
        	
        	var mockGetNumber = Mocks.GetMock(targetHelper, "getNumber", function(num){       
        		if(num != targetStart && num != targetEnd) throw new Error("Wrong num used");
        		if(num == targetStart){
        			if(targetItems.getLength() == 0) return 0;
        			if(targetItems.getLength() == 2) return 1;
        		}
        		if(num == targetEnd) {
        			if(targetItems.getLength() == 0) return 0;
        			if(targetItems.getLength() == 2) return 1;        		
        		}
        	});	
    	
	    	[Fact]
	        function testBothSame(){
	        	// Arrange 
	        	expected = [];    
	        	actual;
	        	targetItemsLength = 0;
	        	
	            // Act								
	        	mockContext(function(){								        
	        		mockGetNumber(function(){
	        			actual = targetHelper.createRealBodyServer(targetCmp, true);
	        		});
	        	});
	        	
				// Assert
	            Assert.Equal(expected, actual);
	        }
	    	
	    	[Fact]
	        function testBothDifferent(){
	        	// Arrange 
	        	expected = [];    
	        	actual;
	        	targetItemsLength = 2;
	        	
	            // Act								
	        	mockContext(function(){								        
	        		mockGetNumber(function(){
	        			actual = targetHelper.createRealBodyServer(targetCmp, true);
	        		});
	        	});
	        	
				// Assert
	            Assert.Equal(expected, actual);
	        }
    	}
    	
    	
    	[Fixture]
        function testBodyCreation(){
    		
    		var expected;    
        	var actual;
        	
        	var targetEnd={    			
    			isDefined:function(){
    				return false;
    			}
        	};
        	
        	var targetStart={        			
    			isDefined:function(){
    				return false;
    			}
        	};
        	
        	var targetItemsLength;
        	var targetItems={
    			getLength:function(){
    				return targetItemsLength;
    			},        	    			
    			isLiteral:function(){
    				return false;
    			},
    			isEmpty:function(){
    				return false;
    			}
        	};
        	        	        	       
        	var targetAttributes={        		
        		getValue:function(att){
        			if(att=="items") return targetItems;
        			if(att=="start") return targetStart;
        			if(att=="end") return targetEnd;
        		}
        	};        	        	        	        	
        	
        	var targetCmp={    			
    			getAttributes:function(){
					return targetAttributes;
				}		        			
        	}; 
        	
        	var mockContext = Mocks.GetMock(Object.Global(), "$A", {                                        		          		
        		pushCreationPath: function(body) { 
    				if(body != 'realbody') throw new Error("Wrong body used in push");        									
				},
				popCreationPath: function(body) { 
    				if(body != 'realbody') throw new Error("Wrong body used in pop");        									
				}
        	});	   
        	
        	var mockCreateComponentsForIndexFromServer = Mocks.GetMock(targetHelper, "createComponentsForIndexFromServer", function(cmp, items, index, doForce){               		
        		if(cmp != targetCmp) throw new Error("Wrong cmp used");
        		if(items != targetItems) throw new Error("Wrong items used");
        		if(targetItems.getLength() == 1 && index != 0) throw new Error("Wrong index used");
        		if(targetItems.getLength() == 2 && (index != 0 && index != 1)) throw new Error("Wrong index used");
        		if(doForce != true) throw new Error("Wrong doForce used");
        		            		
        		return [index + 1];
        	});	
    	
	    	[Fact]
	        function testCreatedOnce(){
	        	// Arrange 
	    		expected = [1];    
	        	actual;
	        	targetItemsLength = 1;
				 
	            // Act								
	        	mockContext(function(){
	        		mockCreateComponentsForIndexFromServer(function(){
	        			actual = targetHelper.createRealBodyServer(targetCmp, true);
	        		});
	        	});
	        	
				// Assert
	            Assert.Equal(expected, actual);
	        }
	    	
	    	[Fact]
	        function testCreatedTwice(){
	        	// Arrange 
	        	expected = [1,2];    
	        	actual;     
	        	targetItemsLength = 2;
				 
	            // Act								
	        	mockContext(function(){
	        		mockCreateComponentsForIndexFromServer(function(){
	        			actual = targetHelper.createRealBodyServer(targetCmp, true);
	        		});
	        	});
	        	
				// Assert
	            Assert.Equal(expected, actual);            
	        }
    	}
    }

    [Fixture]
    function rerenderEverything(){    	    	    	        
    	                        
    	[Fact]
        function cmpInvalid(){
        	// Arrange                	
        	var expected = false;
        	var actual = false;        	        	
        	
        	var targetCmp={
    			isValid:function(){
    				return false;
    			},
    			getValue:function(att){
    				actual = true;
    			}
        	};   
        	
        	var mockMethod = Mocks.GetMock(targetHelper, "createRealBody", function(cmp, doForce, callback){       
        		if(cmp != targetCmp) throw new Error("Wrong cmp used");
        		if(doForce != false) throw new Error("Wrong doForce used");             		        		   
        	});	
        	
        	// Act
        	mockMethod(function(){
        		targetHelper.rerenderEverything(targetCmp);
        	});
			
			// Assert
			Assert.Equal(expected, actual);			
        }
    	
    	[Fact]
        function cmpValid(){
        	// Arrange                	
        	var expected = true;
        	var actual = false;
        	
        	var destroyCalled;
        	var eventCalled;
        	var setBodyCalled;
        	
        	var targetEvent={
    			fire:function(){
    				eventCalled = true;
    			}
        	};
        	
        	var targetBody={
    			destroy:function(){
    				destroyCalled = true;
    			},
    			setValue:function(att){
    				if(att != 'new') throw new Error("Wrong body used");
    				setBodyCalled = true;
    			}
        	};
        	
        	var targetCmp={
    			isValid:function(){
    				return true;
    			},
    			getValue:function(att){
    				if(att == 'v.realbody') return targetBody;
    			},
    			getEvent:function(ev){
    				if(ev == 'rerenderComplete') return targetEvent;
    			}
        	};   
        	
        	var mockMethod = Mocks.GetMock(targetHelper, "createRealBody", function(cmp, doForce, callback){       
        		if(cmp != targetCmp) throw new Error("Wrong cmp used");
        		if(doForce != false) throw new Error("Wrong doForce used");   
        		
        		callback('new');
        		actual = true;
        	});	
        	
        	// Act
        	mockMethod(function(){
        		targetHelper.rerenderEverything(targetCmp);
        	});
			
			// Assert
			Assert.Equal(expected, actual);	
			Assert.Equal(true, destroyCalled);
			Assert.Equal(true, setBodyCalled);
			Assert.Equal(true, eventCalled);
        }
    }

    [Fixture]
    function getNumber(){
    	
    	var expected;        	
    	var actual;
    	var isString = false;    	
    	var targetValue;
    	
    	var mockContext = Mocks.GetMock(Object.Global(), "aura", {                                
    		util:{
        		isString: function(val) { 
					if(typeof targetValue.unwrap == 'function'){
						if(val != targetValue.unwrap()) throw new Error("Wrong val used in isString()1");
					}
					else{
						if(val != targetValue) throw new Error("Wrong val used in isString()2");
					}
					return isString; 
				}
			}	            		            				
        });	
    	
    	[Fact]
        function testEmpty(){
        	// Arrange                	
        	expected = '';        	
        	actual = '';        	
        	targetValue='';   
        	isString = false;
        	
        	// Act
        	mockContext(function(){
        		actual = targetHelper.getNumber(targetValue);
        	});
			
			// Assert
			Assert.Equal(expected, actual);			
        }    	    	
    	
    	[Fact]
        function testWrongType(){
        	// Arrange                	        	        	
        	actual = '';  
        	isString = false;
        	
        	targetValue={	
    			auraType:''
    		};           	        	        	
        	
        	// Act
        	mockContext(function(){
        		actual = targetHelper.getNumber(targetValue);
        	});
			
			// Assert
			Assert.Equal(targetValue, actual);			
        }
    	
    	[Fact]
        function testString(){
        	// Arrange                	
        	expected = 1;        	
        	actual = '';
        	isString = true;        	
        	
        	targetValue={	
    			auraType:'Value',
    			unwrap:function(){
    				return '1';
    			}
    		};           	        	        	
        	
        	// Act
        	mockContext(function(){
        		actual = targetHelper.getNumber(targetValue);
        	});
			
			// Assert
			Assert.Equal(expected, actual);			
        }
    	
    	[Fact]
        function testNumber(){
        	// Arrange                	
        	expected = 1;        	
        	actual ='';    
        	isString = false;
        	
        	targetValue={	
    			auraType:'Value',
    			unwrap:function(){
    				return 1;
    			}
    		};   
        	
        	// Act
        	mockContext(function(){
        		actual = targetHelper.getNumber(targetValue);
        	});
			
			// Assert
			Assert.Equal(expected, actual);			
        }
    }
    
}