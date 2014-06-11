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
    	
        var mockContext = Mocks.GetMock(Object.Global(), "$A", {                                
            getContext: function() {
                return {
                    getMode: function() {
                        return "";
                    }
                }
            },
    
            mark: function(str){},
 
            endMark: function(str){}    		            				
        });
    	
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
        	mockContext(function(){	
			    var callback = targetHelper.createAddComponentCallback(targetIndexCollector, 0);
			    callback(expected);
        	});
			
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
    				_currentBodyCollector:'',
        			getGlobalId:function(){
        				return "";
        			}
    			}
        	};        	        	        	
        	
        	var targetIndexCollector={	
    			body:[],
    			bodyCollector:targetBodyCollector
    		};        	        	
        	
        	// Act
        	mockContext(function(){	
			    var callback = targetHelper.createAddComponentCallback(targetIndexCollector, 0);			
			    callback(expected);
        	});
			
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
    				_currentBodyCollector:'',
        			getGlobalId:function(){
        				return "";
        			}
    			}
        	};        	        	        	
        	
        	var targetIndexCollector={	
    			body:[],
    			bodyCollector:targetBodyCollector
    		};  
        	
        	targetBodyCollector.cmp._currentBodyCollector = targetBodyCollector;
        	
        	// Act
        	mockContext(function(){	
			    var callback = targetHelper.createAddComponentCallback(targetIndexCollector, 0);			
			    callback(expected);
        	});
			
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
    				_currentBodyCollector:'',
        			getGlobalId:function(){
        				return "";
        			}
    			}
        	};        	        	        	
        	
        	var targetIndexCollector={	
    			body:[],
    			bodyCollector:targetBodyCollector
    		};  
        	
        	targetBodyCollector.cmp._currentBodyCollector = targetBodyCollector;
        	
        	// Act
        	mockContext(function(){	
			    var callback = targetHelper.createAddComponentCallback(targetIndexCollector, 0);			
			    callback(expected);
        	});
			
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
    				_currentBodyCollector:'',
        			getGlobalId:function(){
        				return "";
        			}
    			}
        	};        	        	        	
        	
        	var targetIndexCollector={	
    			body:[],
    			bodyCollector:targetBodyCollector
    		};  
        	
        	targetBodyCollector.cmp._currentBodyCollector = targetBodyCollector;
        	
        	// Act
        	mockContext(function(){	
			    var callback = targetHelper.createAddComponentCallback(targetIndexCollector, 0);			
			    callback(expected);
        	});
			
			// Assert
			Assert.Equal(expected, targetIndexCollector.body[0]);
			Assert.Equal(expected, actual);
        }    
    }
    
    [Fixture, Skip("JBUCH: HALO: THESE TESTS NEED RETHINKING")]
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
        	        	        	       
        	var targetBodyCollector={	
    			count:0,
    			realBodyList:[]
    		};
        	
        	var targetCmp={
        		get:function(att){
        			if(att=="v.var") return "var";
        			if(att=="v.indexVar") return false;        			
        		},
        		getValue:function(att){
        			if(att=="v.body") return targetBody;
        			if(att=="v.forceServer"){
	        			return {
	        				getValue:function(){					
								return 'forceServer';
							}
						};
        			}
        		},
        		getAttributeValueProvider:function(){
        			return '';
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
        	        	        	       
        	var targetBodyCollector={	
    			count:0,
    			realBodyList:[]
    		};
        	
        	var targetCmp={
        		get:function(att){
        			if(att=="v.var") return "var";
        			if(att=="v.indexVar") return true;        			
        		},
        		getValue:function(att){
        			if(att=="v.body") return targetBody;
        			if(att=="v.forceServer"){
	        			return {
	        				getValue:function(){					
								return 'forceServer';
							}
						};
        			}
        		},
        		getAttributeValueProvider:function(){
        			return '';
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
        
        [Fixture, Skip("JBUCH: HALO: THESE NEED RETHINKING")]
        function testBodyLengthAndAttValueProvider(){
            // JBUCH: FIXME: THESE TESTS NEED RETHINKING
        	var expected;   
        	var actual;
        	var ivpCalled = 0;
        	var compCreated = 0;
        	
        	var targetConfig={
    			valueProvider:'vp'
        	};
        	
        	var targetBodyLength;
        	
        	var targetBody=[];
        	
        	var targetAttributeValueProvider = '';
        	
        	var targetBodyCollector={	
    			count:0,
    			realBodyList:[]
    		};
        	
        	var targetCmp={
                get:function(att){
                    if (att == "v.var") return 'var';
                    if (att == "v.indexVar") return false;
                    if (att == "v.body") return targetBody;
                    if (att == "v.forceServer")return 'forceServer';
                },
    			getAttributes:function(){
                    return {
                        getValueProvider: function () {
                            return targetAttributeValueProvider;
                        }
				}		        			
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
        		if(targetBody.length == 1 && index != 0) throw new Error("Wrong Index used");
        		if(targetBody.length == 2 && (index != 0 && index != 1)) throw new Error("Wrong Index used");
        		return 'callback';    		
        	});
        	
	        [Fact]
	        function testBodyLengthOne(){
	        	// Arrange 
	        	expected = 1;   
	        	actual = 0;
	        	ivpCalled = 0;
	        	compCreated = 0;
	        	
	        	targetBody = [{}];
	        	targetBodyCollector.count = 0;
				 
	            // Act								
				mockContext(function(){
					mockMethod(function(){
						actual = targetHelper.createComponentsForIndex(targetBodyCollector, targetCmp, targetItems, 0, false);
					});
				});
				
				// Assert
	            Assert.Equal(expected, actual);            
	            Assert.Equal(targetBody.length-1, targetBodyCollector.count);
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
	        	
	        	targetBody = [{},{}];
	        	targetBodyCollector.count = 0;
	        	
	        	// Act								
				mockContext(function(){
					mockMethod(function(){
						actual = targetHelper.createComponentsForIndex(targetBodyCollector, targetCmp, targetItems, 0, false);
					});
				});
				
				// Assert
	            Assert.Equal(expected, actual);
	            Assert.Equal(targetBody.length-1, targetBodyCollector.count);
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
	        	
	        	targetBody= [{}];
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
	            Assert.Equal(targetBody.length-1, targetBodyCollector.count);
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
	        	
	        	targetBodyLength = [{},{}];
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
	            Assert.Equal(targetBody.length-1, targetBodyCollector.count);
	            Assert.Equal(1, ivpCalled);
	            Assert.Equal(2, compCreated);
	        }
        }                
    }
    
    [Fixture, Skip("JBUCH: HALO: THESE TESTS NEED RETHINKING")]
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
        	        	        	       
        	var targetCmp={
        		get:function(att){
        			if(att=="v.var") return "var";
        			if(att=="v.indexVar") return false;        			
        		},
        		getValue:function(att){
        			if(att=="v.body") return targetBody;        			
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
        	        	        	       
        	var targetCmp={
        		get:function(att){
        			if(att=="v.var") return "var";
        			if(att=="v.indexVar") return true;        			
        		},
        		getValue:function(att){
        			if(att=="v.body") return targetBody;        			
        		},
        		getAttributeValueProvider:function(){
        			return '';
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
        	        	        	       
        	var targetCmp={
        		get:function(att){
        			if(att=="v.var") return "var";
        			if(att=="v.indexVar") return false;        			
        		},
        		getValue:function(att){
        			if(att=="v.body") return targetBody;        			
        		},
        		getAttributeValueProvider:function(){
        			return targetAttributeValueProvider;
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
	        	targetBody= [{}];
				 
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
	        	targetBody = [{},{}];
	        	
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
	        	targetBody = [{}];
	        	
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
	        	targetBody = [{},{}];
	        	
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
    function createNewComponents(){    	    	    	        
    	                     
    	var expected = false;    
    	var actual = false;
    	
    	var targetRealBody={
			getLength:function(){
				return 1;
			}
    	};
    	
    	var targetBody={
			getLength:function(){
				return 1;
			}
    	};
    	        	        	       
    	var targetItems;
    	
    	var targetCmp={
    		get:function(att){
    			if(att=="v.var") return "var";
    			if(att=="v.indexVar") return false;        			
    		},
    		getValue:function(att){
    			if(att=="v.realbody") return targetRealBody; 
    			if(att=="v.body") return targetBody;        			
    			if(att=="v.items") return targetItems;   
    		}
    	};
    	
    	var targetCallback;
    	        	        	        	
    	var mockGetStart = Mocks.GetMock(targetHelper, "getStart", function(cmp){       
    		if(cmp != targetCmp) throw new Error("Wrong cmp used");        		        		      		        		
    		return 1;    		
    	});
    	
        [Fact]
        function testDontCreate(){
        	// Arrange 
        	expected = false;    
        	actual = false;	
        	
        	var mockGetEnd = Mocks.GetMock(targetHelper, "getEnd", function(cmp){       
        		if(cmp != targetCmp) throw new Error("Wrong cmp used");        		        		      		        		
        		return 2;    		
        	});	
			 
            // Act								
        	mockGetStart(function(){
        		mockGetEnd(function(){
        			targetHelper.createNewComponents(targetCmp, targetCallback);
        		});
			});
			
			// Assert
            Assert.Equal(expected, actual);
        }
        
        [Fact]
        function testCreate(){
        	// Arrange 
        	expected = true;    
        	actual = false;        	        	
        	
        	var mockGetEnd = Mocks.GetMock(targetHelper, "getEnd", function(cmp){       
        		if(cmp != targetCmp) throw new Error("Wrong cmp used");        		        		      		        		
        		return 3;    		
        	});	
        	
        	var mockCreateSelectiveComponentsForIndex = Mocks.GetMock(targetHelper, "createSelectiveComponentsForIndex", function(cmp, items, index, doForce, callback){       
        		if(cmp != targetCmp) throw new Error("Wrong cmp used");        		        		      		        		
        		if(items != targetItems) throw new Error("Wrong items used");
        		if(index != 2) throw new Error("Wrong index used");
        		if(doForce != false) throw new Error("Wrong doForce used");
        		if(callback != targetCallback) throw new Error("Wrong callback used");
        		
        		actual = true;        		
        	});	
			 
            // Act								
        	mockGetStart(function(){
        		mockGetEnd(function(){
        			mockCreateSelectiveComponentsForIndex(function(){
        				targetHelper.createNewComponents(targetCmp, targetCallback);
        			});
        		});
			});
			
			// Assert
            Assert.Equal(expected, actual);
        }
    }
    
    [Fixture]
    function createRealBody(){ 
    	
    	var mockContext = Mocks.GetMock(Object.Global(), "$A", {                                
    		getContext: function() {
    			return {
    				getMode: function() {
    					return "";
    				}
    			}
    		},
    		
    		mark: function(str){},
    		
            endMark: function(str){}    		            				
        });
    	
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
        	        	        	       
        	var targetCmp={
    			_currentBodyCollector:'',
        		getValue:function(att){
        			if(att=="v.items") return targetItems;		       			
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
	        	mockContext(function(){	
				    targetHelper.createRealBody(targetCmp, true, targetCallback);
	        	});
	        	
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
	        	mockContext(function(){	
				    targetHelper.createRealBody(targetCmp, true, targetCallback);
	        	});
	        	
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
	        	mockContext(function(){	
				    targetHelper.createRealBody(targetCmp, true, targetCallback);
	        	});
	        	
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
        	        	        	       
        	var targetCmp={
    			_currentBodyCollector:'',
        		getValue:function(att){
        			if(att=="v.items") return targetItems;  
        			if(att=="v.start") return targetStart;
        			if(att=="v.end") return targetEnd;
        		},
    			getGlobalId:function(){
    				return "";
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
	        	mockContext(function(){	
				    targetHelper.createRealBody(targetCmp, true, targetCallback);
	        	});
	        	
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
	        	mockContext(function(){	
	        	    mockGetNumber(function(){
	        		    targetHelper.createRealBody(targetCmp, true, targetCallback);
	        	    });
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
	        	mockContext(function(){	
	        	    mockGetNumber(function(){
	        		    targetHelper.createRealBody(targetCmp, true, targetCallback);
	        	    });
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
	        	mockContext(function(){	
	        	    mockGetNumber(function(){
	        		    targetHelper.createRealBody(targetCmp, true, targetCallback);
	        	    });
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
	        	mockContext(function(){	
	        	    mockGetNumber(function(){
	        		    targetHelper.createRealBody(targetCmp, true, targetCallback);
	        	    });
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
        	        	        	       
        	var targetCmp={
    			_currentBodyCollector:'',
        		getValue:function(att){
        			if(att=="v.items") return targetItems;  
        			if(att=="v.start") return targetStart;
        			if(att=="v.end") return targetEnd;
        		},
    			getGlobalId:function(){
    				return "";
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
	        	mockContext(function(){	
	        	    mockGetNumber(function(){
	        		    targetHelper.createRealBody(targetCmp, true, targetCallback);
	        	    });
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
	        	mockContext(function(){	
	        	    mockGetNumber(function(){
	        		    targetHelper.createRealBody(targetCmp, true, targetCallback);
	        	    });
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
        	        	        	       
        	var targetCmp={
    			_currentBodyCollector:'',
        		getValue:function(att){
        			if(att=="v.items") return targetItems;  
        			if(att=="v.start") return targetStart;
        			if(att=="v.end") return targetEnd;
        		},
    			getGlobalId:function(){
    				return "";
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
	        	mockContext(function(){	
	        	    mockCreateComponentsForIndex(function(){								        
	        		    targetHelper.createRealBody(targetCmp, true, targetCallback);
	        	    });
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
	        	mockContext(function(){	
	        	    mockCreateComponentsForIndex(function(){								        
	        		    targetHelper.createRealBody(targetCmp, true, targetCallback);
	        	    });
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
	    	        	        	       
	    	var targetCmp={    			
	    		getValue:function(att){
	    			if(att=="v.items") return targetItems;         			       			
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
        	        	        	       
        	var targetCmp={    			
        		getValue:function(att){
        			if(att=="v.items") return targetItems;
        			if(att=="v.start") return targetStart;
        			if(att=="v.end") return targetEnd;
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
        	        	        	       
        	var targetCmp={    			
        		getValue:function(att){
        			if(att=="v.items") return targetItems;
        			if(att=="v.start") return targetStart;
        			if(att=="v.end") return targetEnd;
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
        	        	        	       
        	var targetCmp={    			
        		getValue:function(att){
        			if(att=="v.items") return targetItems;
        			if(att=="v.start") return targetStart;
        			if(att=="v.end") return targetEnd;
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
    
    [Fixture, Skip("JBUCH: HALO: THESE TESTS NEED RETHINKING")]
    function createSelectiveComponentsForIndex(){    	    	    	        
    	                        
        [Fact]
        function testExpressionServiceCreate(){
        	// Arrange         	                      	
        	var expected = true;
        	var actual;
        	
        	var targetBody={
    			getLength:function(){
    				return 0;
    			}
        	};
        	        	        	       
        	var targetCmp={
    			_currentSelectiveBodyCollector:'',
        		get:function(att){
        			if(att=="v.var") return "var";
        			if(att=="v.indexVar") return 1;        			
        		},
        		getValue:function(att){
        			if(att=="v.body") return targetBody;
        			if(att=="v.forceServer"){
	        			return {
	        				getValue:function(){					
								return 'forceServer';
							}
						};
        			}
        		},
        		getAttributeValueProvider:function(){
        			return '';
        		}
        	};
        	
        	var targetItems={
    			getValue:function(index){
					return 'Some Value';
				},
				getLength:function(){
    				return 0;
    			}	        			
        	};
        	
        	var targetCallback;
        	
        	var mockContext = Mocks.GetMock(Object.Global(), "$A", {                                
        		expressionService: {   
					create: function(valueProvider, config) {
						if(valueProvider != null) throw new Error("Wrong valueProvider used");
						if(config != 0) throw new Error("Wrong config used");
						actual = true;
						return 'iv'; 
					}					
	            }
	        });												
			 
            // Act
									
			mockContext(function(){	     
				targetHelper.createSelectiveComponentsForIndex(targetCmp, targetItems, 0, false, targetCallback);
			});
						
			// Assert
            Assert.Equal(expected, actual);
            
        }
        
        [Fixture]
        function testBodyLengthAndAttValueProvider(){
        	
        	var expected;   
        	var actual;
        	var ivpCalled;
        	
        	var targetConfig={
    			valueProvider:'vp'
        	};
        	
        	var targetBodyLength;
        	var targetBody={
    			getLength:function(){
    				return targetBodyLength;
    			},
    			get:function(index){
    				if(this.getLength() == 1 && index != 0) throw new Error("Wrong index used1");
    				if(this.getLength() == 2 && (index != 0 && index != 1)) throw new Error("Wrong index used1");
    				return targetConfig;
    			}
        	};
        	        	        
        	var targetAttributeValueProvider = '';
        	
        	var targetCmp={
        		get:function(att){
        			if(att=="v.var") return 'var';
        			if(att=="v.indexVar") return false;        			
        		},
        		getValue:function(att){
        			if(att=="v.body") return targetBody;
        			if(att=="v.forceServer"){
	        			return {
	        				getValue:function(){					
								return 'forceServer';
							}
						};
        			}
        		},
        		getAttributeValueProvider:function(){
        			return targetAttributeValueProvider;
        		}
        	};
        	
        	var targetItemsLength;
        	var targetItems={
    			getValue:function(index){
    				if(index != 0) throw new Error("Wrong index used");
					return 'Some Value';
				},
				getLength:function(){
				    return targetItemsLength;
				}
        	};
        	
        	var targetCallback;
        	
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
	            		
	            		actual += 1;
        			}					
	            },
	            setCreationPathIndex:function(index){
	            	if(targetBody.getLength() == 1 && index != 0) throw new Error("Wrong index used in setCreationPathIndex()");
	            	if(targetBody.getLength() == 2 && (index != 0 && index != 1)) throw new Error("Wrong index used in setCreationPathIndex()");
	            }
	        });		
	        
	        var mark = "_currentSelectiveBodyCollector" + "timestamp";
        	
        	var mockMethod = Mocks.GetMock(targetHelper, "createSelectiveComponentsCallback", function(selectiveBodyCollector, index){       
        		if(selectiveBodyCollector.realBodyList.length != 0) throw new Error("Wrong selectiveBodyCollector.realBodyList used");
        		if(selectiveBodyCollector.count != targetBody.getLength()) throw new Error("Wrong selectiveBodyCollector.count used");
        		if(selectiveBodyCollector.cmp != targetCmp) throw new Error("Wrong selectiveBodyCollector.cmp used");
        		if(selectiveBodyCollector.callback != targetCallback) throw new Error("Wrong selectiveBodyCollector.callback used");        		
        		if(targetBody.getLength() == 1 && index != 0) throw new Error("Wrong index used in createSelectiveComponentsCallback()");
            	if(targetBody.getLength() == 2 && (index != 0 && index != 1)) throw new Error("Wrong index used in createSelectiveComponentsCallback()");
            	targetCmp[mark] = selectiveBodyCollector;   		        		
        		return 'callback';    		
        	});	 
        	
        	[Fact]
	        function testBodyLengthZero(){
	        	// Arrange 
	        	expected = 0;   
	        	actual = 0;
	        	ivpCalled = 0;
	        	
	        	targetBodyLength = 0;
	        	targetItemsLength = 0;
				 
	            // Act								
				mockContext(function(){
					mockMethod(function(){
						targetHelper.createSelectiveComponentsForIndex(targetCmp, targetItems, 0, false, targetCallback);
					});
				});
				
				// Assert
				Assert.Equal(expected, actual);
				Assert.Equal(0, ivpCalled);
				Assert.Equal(undefined, targetCmp[mark]);
	            
	        }  
        
	        [Fact]
	        function testBodyLengthOne(){
	        	// Arrange 
	        	expected = 1;   
	        	actual = 0;
	        	ivpCalled = 0;
	        	
	        	targetBodyLength = 1;
	        	targetItemsLength = 1;
				 
	            // Act								
				mockContext(function(){
					mockMethod(function(){
						targetHelper.createSelectiveComponentsForIndex(targetCmp, targetItems, 0, false, targetCallback);
					});
				});
				
				// Assert
				Assert.Equal(expected, actual);
				Assert.Equal(1, ivpCalled);
				Assert.Equal([], targetCmp[mark].realBodyList);
	            Assert.Equal(targetBody.getLength(), targetCmp[mark].count);
	            Assert.Equal(targetCmp, targetCmp[mark].cmp);
	            Assert.Equal(targetCallback, targetCmp[mark].callback);
	        }      
	        
	        [Fact]
	        function testBodyLengthTwo(){
	        	// Arrange 
	        	expected = 2;   
	        	actual = 0;
	        	ivpCalled = 0;    
	        	
	        	targetBodyLength = 2;
	        	targetItemsLength = 2;
				 
	            // Act								
				mockContext(function(){
					mockMethod(function(){
						targetHelper.createSelectiveComponentsForIndex(targetCmp, targetItems, 0, false, targetCallback);
					});
				});
				
				// Assert
				Assert.Equal(expected, actual);
				Assert.Equal(1, ivpCalled);			
				Assert.Equal([], targetCmp[mark].realBodyList);
	            Assert.Equal(targetBody.getLength(), targetCmp[mark].count);
	            Assert.Equal(targetCmp, targetCmp[mark].cmp);
	            Assert.Equal(targetCallback, targetCmp[mark].callback);
	        }        
        
	        [Fact]
	        function testOneAttValueProvider(){
	        	// Arrange 
	        	expected = 1;   
	        	actual = 0;
	        	ivpCalled = 0;
	        	targetBodyLength = 1;
	        	targetItemsLength = 1;
	        	
	        	targetConfig={
	    			valueProvider:undefined
	        	};
	        	
	        	targetAttributeValueProvider = 'vp';        	        	
				 
	            // Act								
				mockContext(function(){
					mockMethod(function(){
						targetHelper.createSelectiveComponentsForIndex(targetCmp, targetItems, 0, false, targetCallback);
					});
				});
				
				// Assert
				Assert.Equal(expected, actual);
				Assert.Equal(1, ivpCalled);
				Assert.Equal([], targetCmp[mark].realBodyList);
	            Assert.Equal(targetBody.getLength(), targetCmp[mark].count);
	            Assert.Equal(targetCmp, targetCmp[mark].cmp);
	            Assert.Equal(targetCallback, targetCmp[mark].callback);
	        }
	        
	        [Fact]
	        function testTwoAttValueProvider(){
	        	// Arrange 
	        	expected = 2;   
	        	actual = 0;
	        	ivpCalled = 0;
	        	targetBodyLength = 2;
	        	targetItemsLength = 2;
	        	
	        	targetConfig={
	    			valueProvider:undefined
	        	};
	        	
	        	targetAttributeValueProvider = 'vp';        	        	
				 
	            // Act								
				mockContext(function(){
					mockMethod(function(){
						targetHelper.createSelectiveComponentsForIndex(targetCmp, targetItems, 0, false, targetCallback);
					});
				});
				
				// Assert
				Assert.Equal(expected, actual);
				Assert.Equal(1, ivpCalled);
				Assert.Equal([], targetCmp[mark].realBodyList);
	            Assert.Equal(targetBody.getLength(), targetCmp[mark].count);
	            Assert.Equal(targetCmp, targetCmp[mark].cmp);
	            Assert.Equal(targetCallback, targetCmp[mark].callback);
	        }
        }
                
    }
    
    [Fixture]
    function createSelectiveComponentsCallback(){    	    	    	        
    	                        
    	[Fact]
        function callbackNotSet(){
        	// Arrange                	
        	var expected = '123';
        	
        	var targetBodyCollector={
    			realBodyList:[],	
    			count:0,
    			callback:''
        	};        	        	
        	
        	// Act
			var callback = targetHelper.createSelectiveComponentsCallback(targetBodyCollector, 0);
			callback(expected);
			
			// Assert
			Assert.Equal(expected, targetBodyCollector.realBodyList[0]);
			Assert.Equal('', targetBodyCollector.callback);
        }
    	
    	[Fact]
        function callbackCalledRealBodyLengthOne(){
    		// Arrange 
        	var expected = ['123'];
        	var actual = ''; 
        	
        	var newCmp = '123';
        	
        	var targetBodyCollector={
    			realBodyList:[],
    			count:1,
    			callback:function(val){
    				if(val[0] != '123') throw new Error("Wrong val used");
    				actual=expected;
    			},    			    			
    			cmp:{
    				__currentSelectiveBodyCollector:''
    			},
    			timestamp: "timestamp"
        	};   
        	
        	targetBodyCollector.cmp["_currentSelectiveBodyCollector" + "timestamp"] = targetBodyCollector;
        	
        	// Act
        	var callback = targetHelper.createSelectiveComponentsCallback(targetBodyCollector, 0);
			callback(newCmp);
			
			// Assert
			Assert.Equal(newCmp, targetBodyCollector.realBodyList[0]);
			Assert.Equal(expected, actual);  
        }    
    	
    	[Fact]
        function callbackCalledRealBodyLengthTwo(){
        	// Arrange 
        	var expected = ['123','456'];
        	var actual = '';    
        	
        	var newCmp = '456';
        	
        	var targetBodyCollector={
    			realBodyList:['123'],
    			count:1,
    			callback:function(val){
    				if(val[0] != '123' && val[1] != '456') throw new Error("Wrong val used");
    				actual=expected;
    			},    			    			
    			cmp:{
    				__currentSelectiveBodyCollector:''
    			},
    			timestamp: "timestamp"
        	};   
        	
        	targetBodyCollector.cmp["_currentSelectiveBodyCollector" + "timestamp"] = targetBodyCollector;
        	
        	// Act
        	var callback = targetHelper.createSelectiveComponentsCallback(targetBodyCollector, 1);
			callback(newCmp);
			
			// Assert
			Assert.Equal(newCmp, targetBodyCollector.realBodyList[1]);
			Assert.Equal(expected, actual);           
        }    
    }
    
    
    [Fixture]
    function rerenderEverything(){    
    	
    	var mockContext = Mocks.GetMock(Object.Global(), "$A", {                                
    		getContext: function() {
    			return {
    				getMode: function() {
    					return "";
    				}
    			}
    		},
    		
    		mark: function(str){},
    		
            endMark: function(str){}    		            				
        });
    	                        
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
    			},
    			getGlobalId:function(){
    				return "";
    			}
        	};   
        	
        	var mockMethod = Mocks.GetMock(targetHelper, "createRealBody", function(cmp, doForce, callback){       
        		if(cmp != targetCmp) throw new Error("Wrong cmp used");
        		if(doForce != false) throw new Error("Wrong doForce used");   
        		
        		callback('new');
        		actual = true;
        	});	
        	
        	// Act
        	mockContext(function(){
        	    mockMethod(function(){
        		    targetHelper.rerenderEverything(targetCmp);
        	    });
        	});
			
			// Assert
			Assert.Equal(expected, actual);	
			Assert.Equal(true, destroyCalled);
			Assert.Equal(true, setBodyCalled);
			Assert.Equal(true, eventCalled);
        }
    }
        
    [Fixture]
    function rerenderSelective(){    	    	    	        
    	                        
    	[Fact]
        function realBodyIsEmpty(){
        	// Arrange                	
        	var expected = true;
        	var actual = false;    
        	
        	var targetItems={    					        			
        	};
        	
        	var targetRealBody={
    			isEmpty:function(){
					return true;
				}		        			
        	};
        	
        	var targetBody={
    			getLength:function(){
					return 0;
				}		        			
        	};  
        	
        	var targetCmp={
        		getValue:function(att){
        			if(att=="v.items") return targetItems;
        			if(att=="v.realbody") return targetRealBody; 
        			if(att=="v.body") return targetBody;        			
        		}
        	};        	        
        	        	        	        	
        	var mockGetStart = Mocks.GetMock(targetHelper, "getStart", function(cmp){       
        		if(cmp != targetCmp) throw new Error("Wrong cmp used");        		        		      		        		
        		return 0;    		
        	});	
        	
        	var mockGetEnd = Mocks.GetMock(targetHelper, "getEnd", function(cmp){       
        		if(cmp != targetCmp) throw new Error("Wrong cmp used");        		        		      		        		
        		return 0;    		
        	});	
    			 
        	
        	var mockRerenderEverything = Mocks.GetMock(targetHelper, "rerenderEverything", function(cmp){       
        		if(cmp != targetCmp) throw new Error("Wrong cmp used");  
        		
        		actual = true;
        	});	
        	
        	// Act
        	mockRerenderEverything(function(){
        		mockGetEnd(function(){
        			mockGetStart(function(){        		
        				targetHelper.rerenderSelective(targetCmp);
        			});
        		});
        	});
			
			// Assert
			Assert.Equal(expected, actual);			
        }    	    	
    	
    	[Fixture]
        function noDiffIndex(){
    		
        	var targetValueProvider={
    			getValue:function(val){  
        			if(val == 1){
	    				return {
	        				unwrap:function(){
			        			return 1;        			
			        		}
	        			};
        			}
        			if(val == 'var'){
	    				return "data";
        			}
        		}
        	};
        	
        	var targetBodyCmp={
				getAttributeValueProvider:function(){
        			return targetValueProvider;        			
        		}
        	};  
        	
        	var targetItems={ 
    			getValue:function(index){
    				if(index == 1) return 'data';
    			}
        	};
        	
        	var targetRealBodyLength;
        	
        	var targetRealBody={
    			value:[],
    			push:function(val){
    				this.value.push(val);
    			},
    			isEmpty:function(){
					return false;
				},
				getLength:function(){
					return targetRealBodyLength;
				},
				getValue:function(index){
					if(index == 0 || index == 1) return targetBodyCmp;
				}
        	};
        	
        	var targetBody={
    			getLength:function(){
					return 0;
				}		        			
        	};  
        	
        	var targetCmp={
        		get:function(att){
        			if(att=="v.var") return "var";
        			if(att=="v.indexVar") return 1;        			
        		},
        		getValue:function(att){
        			if(att=="v.items") return targetItems;
        			if(att=="v.realbody") return targetRealBody; 
        			if(att=="v.body") return targetBody;        			
        		}
        	};        	        
        	        	        	        	
        	var mockGetStart = Mocks.GetMock(targetHelper, "getStart", function(cmp){       
        		if(cmp != targetCmp) throw new Error("Wrong cmp used");        		        		      		        		
        		return 0;    		
        	});	
        	
        	var mockGetEnd = Mocks.GetMock(targetHelper, "getEnd", function(cmp){       
        		if(cmp != targetCmp) throw new Error("Wrong cmp used");        		        		      		        		
        		return 0;    		
        	});	    			         	
        	
        	var mockCreateNewComponents = Mocks.GetMock(targetHelper, "createNewComponents", function(cmp, callback){       
        		if(cmp != targetCmp) throw new Error("Wrong cmp used in createNewComponents()");          		
        		callback(['a','b']);
        	});
        	
        	[Fact]
	        function testWithRealBodyLengthOne(){
	        	// Arrange 	
	        	targetRealBodyLength = 0;
	        	targetRealBody.value = [];
	        	
	        	// Act
	        	mockCreateNewComponents(function(){
	        		mockGetEnd(function(){
	        			mockGetStart(function(){        		
	        				targetHelper.rerenderSelective(targetCmp);
	        			});
	        		});
	        	});
				
				// Assert	
				Assert.Equal(['a','b'], targetRealBody.value);
	        }
    		
	    	[Fact]
	        function testWithRealBodyLengthOne(){
	        	// Arrange	 
	        	targetRealBodyLength = 1;
	        	targetRealBody.value = [];
	        	
	        	// Act
	        	mockCreateNewComponents(function(){
	        		mockGetEnd(function(){
	        			mockGetStart(function(){        		
	        				targetHelper.rerenderSelective(targetCmp);
	        			});
	        		});
	        	});
				
				// Assert
				Assert.Equal(['a','b'], targetRealBody.value);
	        }
	    	
	    	[Fact]
	        function testWithRealBodyLengthTwo(){
	        	// Arrange
	        	targetRealBodyLength = 2;
	        	targetRealBody.value = [];
	        	        		        	
	        	// Act
	        	mockCreateNewComponents(function(){
	        		mockGetEnd(function(){
	        			mockGetStart(function(){        		
	        				targetHelper.rerenderSelective(targetCmp);
	        			});
	        		});
	        	});
				
				// Assert	
				Assert.Equal(['a','b'], targetRealBody.value);
	    	}
        }
    	
    	[Fixture]
    	function invalidDiffIndex(){
    		
        	var targetValueProvider1Data;
        	
        	var targetValueProvider1={
    			getValue:function(val){  
        			if(val == -1){
	    				return {
	        				unwrap:function(){
			        			return -1;        			
			        		}
	        			};
        			}
        			if(val == 'var'){
	    				return targetValueProvider1Data;
        			}
        		}
        	};
        	
        	var targetBodyCmp1={
				getAttributeValueProvider:function(){
        			return targetValueProvider1;        			
        		}
        	};        	        	
        	
        	var targetValueProvider2={
    			getValue:function(val){  
        			if(val == -1){
	    				return {
	        				unwrap:function(){
			        			return -1;        			
			        		}
	        			};
        			}
        			if(val == 'var'){
	    				return 'data';
        			}
        		}
        	};
        	
        	var targetBodyCmp2={
				getAttributeValueProvider:function(){
        			return targetValueProvider2;        			
        		}
        	};
        	
        	var targetItems={ 
    			getValue:function(index){
    				if(index == -1) return 'data1';
    			}
        	};
        	
        	var targetRealBodyLength;
        	
        	var targetRealBody={
    			value:[],
    			push:function(val){
    				this.value.push(val);
    			},
    			isEmpty:function(){
					return false;
				},
				getLength:function(){
					return targetRealBodyLength;
				},
				getValue:function(index){
					if(index == 0) return targetBodyCmp1;
					if(index == 1) return targetBodyCmp2;
				}
        	};
        	
        	var targetBody={
    			getLength:function(){
					return 0;
				}		        			
        	};  

        	var targetCmp={
        		get:function(att){
        			if(att=="v.var") return "var";
        			if(att=="v.indexVar") return -1;        			
        		},
        		getValue:function(att){
        			if(att=="v.items") return targetItems;
        			if(att=="v.realbody") return targetRealBody; 
        			if(att=="v.body") return targetBody;        			
        		}
        	};        	        
        	        	        	        	
        	var mockGetStart = Mocks.GetMock(targetHelper, "getStart", function(cmp){       
        		if(cmp != targetCmp) throw new Error("Wrong cmp used");        		        		      		        		
        		return 0;    		
        	});	
        	
        	var mockGetEnd = Mocks.GetMock(targetHelper, "getEnd", function(cmp){       
        		if(cmp != targetCmp) throw new Error("Wrong cmp used");        		        		      		        		
        		return 0;    		
        	});	    			         	
        	
        	var mockCreateNewComponents = Mocks.GetMock(targetHelper, "createNewComponents", function(cmp, callback){       
        		if(cmp != targetCmp) throw new Error("Wrong cmp used in createNewComponents()");          		
        		callback(['a','b']);
        	});	     		
    	
	    	[Fact]
	        function testWithRealBodyLengthOne(){
	        	// Arrange
	        	targetValueProvider1Data = 'data';
	        	targetRealBodyLength = 1;
	        	targetRealBody.value = [];
	        	
	        	// Act
	        	mockCreateNewComponents(function(){
	        		mockGetEnd(function(){
	        			mockGetStart(function(){        		
	        				targetHelper.rerenderSelective(targetCmp);
	        			});
	        		});
	        	});
				
				// Assert
				Assert.Equal(['a','b'], targetRealBody.value);
	        }
	    	
	    	[Fact]
	        function testWithRealBodyLengthTwo(){
	        	// Arrange  	        	
	        	targetValueProvider1Data = 'data1';
	        	targetRealBodyLength = 2;
	        	targetRealBody.value = [];
	        	
	        	// Act
	        	mockCreateNewComponents(function(){
	        		mockGetEnd(function(){
	        			mockGetStart(function(){        		
	        				targetHelper.rerenderSelective(targetCmp);
	        			});
	        		});
	        	});
				
				// Assert	
				Assert.Equal(['a','b'], targetRealBody.value);
	        }
    	}
    	
    	[Fixture]
        function validDiffIndexNextItemDifferent(){
    		
        	var targetValueProvider={
    			getValue:function(val){  
        			if(val == 1){
	    				return {
	        				unwrap:function(){
			        			return 1;        			
			        		}
	        			};
        			}
        			if(val == 'var'){
	    				return 'data';
        			}
        		}
        	};
        	
        	var targetBodyCmp={
				getAttributeValueProvider:function(){
        			return targetValueProvider;        			
        		}
        	};  
        	
        	var targetItems={ 
    			getValue:function(index){
    				if(index == 1) return 'data1';
    				if(index == 2) return 'data2';
    			}
        	};
        	        	
        	var targetRealBodyList = [];
        	
        	var targetRealBody={    
    			value:[],
    			push:function(val){
    				this.unwrap().push(val);
    			},
    			isEmpty:function(){
					return this.unwrap().length === 0;
				},
				getLength:function(){
					return this.unwrap().length;
				},
				getValue:function(index){
					if(index == 0 || index == 1) return targetBodyCmp;
				},
				unwrap:function(){
					return targetRealBodyList;
				},
				remove: function(i, len) {
					return this.unwrap().splice(i, len);
    			}
        	};
        	
        	var targetBodyLength;
        	var targetBody={
    			getLength:function(){
					return targetBodyLength;
				}		        			
        	};  
        	
        	var targetCmp={
        		get:function(att){
        			if(att=="v.var") return "var";
        			if(att=="v.indexVar") return 1;        			
        		},
        		getValue:function(att){
        			if(att=="v.items") return targetItems;
        			if(att=="v.realbody") return targetRealBody; 
        			if(att=="v.body") return targetBody;        			
        		}
        	};        	        
        	        	        	        	
        	var mockGetStart = Mocks.GetMock(targetHelper, "getStart", function(cmp){       
        		if(cmp != targetCmp) throw new Error("Wrong cmp used");        		        		      		        		
        		return 0;    		
        	});	
        	
        	var mockGetEnd = Mocks.GetMock(targetHelper, "getEnd", function(cmp){       
        		if(cmp != targetCmp) throw new Error("Wrong cmp used");        		        		      		        		
        		return 0;    		
        	});	 
        	
        	var mockIncrementIndices = Mocks.GetMock(targetHelper, "incrementIndices", function(cmpArray, start, indexVar, change, bodyLen){       
        		if(cmpArray != 'a') throw new Error("Wrong cmpArray used");
        		if(start != 0) throw new Error("Wrong start used");
        		if(indexVar != 1) throw new Error("Wrong indexVar used");
        		if(change != -1) throw new Error("Wrong change used");
        		if(bodyLen != targetBody.getLength()) throw new Error("Wrong bodyLen used");
        	});	
        	
        	var mockCreateNewComponents = Mocks.GetMock(targetHelper, "createNewComponents", function(cmp, callback){       
        		if(cmp != targetCmp) throw new Error("Wrong cmp used in createNewComponents()");          		
        		callback(['b','c']);
        	});
    	    	
			[Fact]
	        function testBodyLengthZero(){
	        	// Arrange  	
	        	targetRealBodyList.push('a');
	        	targetBodyLength = 0;
	        	
	        	// Act
	        	mockCreateNewComponents(function(){
		        	mockIncrementIndices(function(){
		        		mockGetEnd(function(){
		        			mockGetStart(function(){        		
		        				targetHelper.rerenderSelective(targetCmp);
		        			});
		        		});
		        	});
	        	});
				
				// Assert
				Assert.Equal(['a', 'b','c'], targetRealBodyList);
	        }
    	
	    	[Fact]
	        function validDiffIndexNextItemDifferentBodyLengthOne(){
	        	// Arrange
	        	var targetObj={
	    			destroy:function(){					
					}
	        	}; 
	        		        	
	        	targetRealBodyList = [targetObj, 'a'];	        		        	        	        		        		        
	        	targetBodyLength = 1;
	        	        	
	        	// Act
	        	mockCreateNewComponents(function(){
		        	mockIncrementIndices(function(){
		        		mockGetEnd(function(){
		        			mockGetStart(function(){        		
		        				targetHelper.rerenderSelective(targetCmp);
		        			});
		        		});
		        	});
	        	});
				
				// Assert
				Assert.Equal(['a','b','c'], targetRealBodyList);
	        }
    	}
        	
    	[Fixture]
    	function validDiffIndexNextItemSame(){
    		
        	var targetValueProvider={
    			getValue:function(val){  
        			if(val == 1){
	    				return {
	        				unwrap:function(){
			        			return 1;        			
			        		}
	        			};
        			}
        			if(val == 'var'){
	    				return "data";
        			}
        		}
        	};
        	
        	var targetBodyCmp={
				getAttributeValueProvider:function(){
        			return targetValueProvider;        			
        		}
        	};  
        	        	
        	var targetItems={ 
    			getValue:function(index){
    				if(index == 1) return "data1";
    				if(index == 2) return "data";
    			}
        	};
        	
        	var targetRealBody={    
    			value:[],
    			isEmpty:function(){
					return false;
				},
				getLength:function(){
					return 1;
				},
				getValue:function(index){
					if(index == 0) return targetBodyCmp;
				},
				unwrap:function(){
					return ['1'];
				},
				setValue:function(val){					
    				if(val[0] != '0' || val[1] != '1') throw new Error("Wrong val used");
    				this.value = val;
    			}
        	};
        	
        	var targetBody={
    			getLength:function(){
					return 0;
				}		        			
        	};  
        	
        	var targetCmp={
        		get:function(att){
        			if(att=="v.var") return "var";
        			if(att=="v.indexVar") return 1;        			
        		},
        		getValue:function(att){
        			if(att=="v.items") return targetItems;
        			if(att=="v.realbody") return targetRealBody; 
        			if(att=="v.body") return targetBody;        			
        		}
        	};        	        
        	        	        	        	
        	var mockGetStart = Mocks.GetMock(targetHelper, "getStart", function(cmp){       
        		if(cmp != targetCmp) throw new Error("Wrong cmp used");        		        		      		        		
        		return 0;    		
        	});	
        	
        	var mockGetEnd = Mocks.GetMock(targetHelper, "getEnd", function(cmp){       
        		if(cmp != targetCmp) throw new Error("Wrong cmp used");        		        		      		        		
        		return 3;    		
        	});	 
        	
        	var mockIncrementIndices = Mocks.GetMock(targetHelper, "incrementIndices", function(cmpArray, start, indexVar, change, bodyLen){       
        		if(cmpArray.length == 1 && cmpArray[0] != '1') throw new Error("Wrong cmpArray used");
        		if(cmpArray.length == 2 && (cmpArray[0] != '1' && cmpArray[1] != '2')) throw new Error("Wrong cmpArray used");
        		if(start != 0) throw new Error("Wrong start used");
        		if(indexVar != 1) throw new Error("Wrong indexVar used");
        		if(change != 1) throw new Error("Wrong change used");
        		if(bodyLen != 0) throw new Error("Wrong bodyLen used");
        		        		
        	});	
        	
        	var mockCreateSelectiveComponentsForIndex = Mocks.GetMock(targetHelper, "createSelectiveComponentsForIndex", function(cmp, items, index, doForce, callback){       
        		if(cmp != targetCmp) throw new Error("Wrong cmp used in createSelectiveComponentsForIndex()");  
        		if(items != targetItems) throw new Error("Wrong items used in createSelectiveComponentsForIndex()");
        		if(index != 1) throw new Error("Wrong index used in createSelectiveComponentsForIndex()");
        		if(doForce != false) throw new Error("Wrong doForce used in createSelectiveComponentsForIndex()");        		        		
        		
        		callback(['0']);
        	});	 
    	    		
	    	[Fact]
	        function testRealBodyLengthOne(){
	        	// Arrange                	
	    		
	        	// Act
	        	mockCreateSelectiveComponentsForIndex(function(){
		        	mockIncrementIndices(function(){
		        		mockGetEnd(function(){
		        			mockGetStart(function(){        		
		        				targetHelper.rerenderSelective(targetCmp);
		        			});
		        		});
		        	});
	        	});
				
				// Assert
				Assert.Equal(['0','1'], targetRealBody.value);
	        }
    	
	    	[Fact]
	        function testRealBodyLengthTwo(){
	        	// Arrange
	        	targetRealBody={    
        			value:[],
        			isEmpty:function(){
    					return false;
    				},
    				getLength:function(){
    					return 2;
    				},
    				getValue:function(index){
    					if(index == 0) return targetBodyCmp;
    				},
    				unwrap:function(){
    					return ['1', '2'];
    				},
    				setValue:function(val){					
        				if(val[0] != '0' || val[1] != '1' || val[2] != '2') throw new Error("Wrong val used");
        				this.value = val;
        			}
            	};
	        	
	        	// Act
	        	mockCreateSelectiveComponentsForIndex(function(){
		        	mockIncrementIndices(function(){
		        		mockGetEnd(function(){
		        			mockGetStart(function(){        		
		        				targetHelper.rerenderSelective(targetCmp);
		        			});
		        		});
		        	});
	        	});
				
				// Assert
				Assert.Equal(['0','1', '2'], targetRealBody.value);
	        }
    	}
    
    	[Fixture]
        function validDiffIndexNextItemSameExtras(){
    		// Arrange 
        	var targetObj={
    			destroy:function(){					
				}
        	}; 
        	
        	var targetValueProvider={
    			getValue:function(val){  
        			if(val == 1){
	    				return {
	        				unwrap:function(){
			        			return 1;        			
			        		}
	        			};
        			}
        			if(val == 'var'){
	    				return "data";
        			}
        		}
        	};
        	
        	var targetBodyCmp={
				getAttributeValueProvider:function(){
        			return targetValueProvider;        			
        		}
        	};  
        	
        	var targetItems={ 
    			getValue:function(index){
    				if(index == 1) return "data1";
    				if(index == 2) return "data";
    			}
        	};
        	
        	var targetRealBody={    
    			value:[],
    			isEmpty:function(){
					return false;
				},
				getLength:function(){
					return 1;
				},
				getValue:function(index){
					if(index == 0) return targetBodyCmp;
				},
				unwrap:function(){
					return [targetObj];
				},
				setValue:function(val){
    				if(val != '0') throw new Error("Wrong val used");
    				this.value = val;
    			}
        	};
        	
        	var targetBody={
    			getLength:function(){
					return 1;
				}		        			
        	};  
        	
        	var targetCmp={
        		get:function(att){
        			if(att=="v.var") return "var";
        			if(att=="v.indexVar") return 1;        			
        		},
        		getValue:function(att){
        			if(att=="v.items") return targetItems;
        			if(att=="v.realbody") return targetRealBody; 
        			if(att=="v.body") return targetBody;        			
        		}
        	};        	        
        	        	        	        	
        	var mockGetStart = Mocks.GetMock(targetHelper, "getStart", function(cmp){       
        		if(cmp != targetCmp) throw new Error("Wrong cmp used");        		        		      		        		
        		return 0;    		
        	});	
        	
        	var mockGetEnd = Mocks.GetMock(targetHelper, "getEnd", function(cmp){       
        		if(cmp != targetCmp) throw new Error("Wrong cmp used");        		        		      		        		
        		return 1;    		
        	});	 
        	
        	var mockIncrementIndices = Mocks.GetMock(targetHelper, "incrementIndices", function(cmpArray, start, indexVar, change, bodyLen){       
        		if(cmpArray.length == 1 && cmpArray[0] != targetObj) throw new Error("Wrong cmpArray used");
        		if(cmpArray.length == 2 && (cmpArray[0] != '1' && cmpArray[1] != targetObj)) throw new Error("Wrong cmpArray used");
        		if(start != 0) throw new Error("Wrong start used");
        		if(indexVar != 1) throw new Error("Wrong indexVar used");
        		if(change != 1) throw new Error("Wrong change used");
        		if(bodyLen != 1) throw new Error("Wrong bodyLen used");
        		        		
        	});	
        	
        	var mockCreateSelectiveComponentsForIndex = Mocks.GetMock(targetHelper, "createSelectiveComponentsForIndex", function(cmp, items, index, doForce, callback){       
        		if(cmp != targetCmp) throw new Error("Wrong cmp used in createSelectiveComponentsForIndex()");  
        		if(items != targetItems) throw new Error("Wrong items used in createSelectiveComponentsForIndex()");
        		if(index != 1) throw new Error("Wrong index used in createSelectiveComponentsForIndex()");
        		if(doForce != false) throw new Error("Wrong doForce used in createSelectiveComponentsForIndex()");        		        		
        		
        		callback(['0']);
        	});	        	        	        	        	    	
    	
	    	[Fact]
	        function testWithOneExtra(){
	    		// Arrange
	    		
	    		// Act
	        	mockCreateSelectiveComponentsForIndex(function(){
		        	mockIncrementIndices(function(){
		        		mockGetEnd(function(){
		        			mockGetStart(function(){        		
		        				targetHelper.rerenderSelective(targetCmp);
		        			});
		        		});
		        	});
	        	});
				
				// Assert	
				Assert.Equal(['0'], targetRealBody.value);
	        }
	    	
	    	[Fact]
	        function testWithTwoExtra(){
	        	// Arrange
	        	targetRealBody={    
        			value:[],
        			isEmpty:function(){
    					return false;
    				},
    				getLength:function(){
    					return 2;
    				},
    				getValue:function(index){
    					if(index == 0) return targetBodyCmp;
    				},
    				unwrap:function(){
    					return ['1', targetObj];
    				},
    				setValue:function(val){
        				if(val[0] != '0' || val[1] != '1') throw new Error("Wrong val used");
        				this.value = val;
        			}
            	};
	        	
	        	// Act
	        	mockCreateSelectiveComponentsForIndex(function(){
		        	mockIncrementIndices(function(){
		        		mockGetEnd(function(){
		        			mockGetStart(function(){        		
		        				targetHelper.rerenderSelective(targetCmp);
		        			});
		        		});
		        	});
	        	});
				
				// Assert	
				Assert.Equal(['0', '1'], targetRealBody.value);
	        } 
    	}
    }
    
    [Fixture]
    function incrementIndices(){   
    	
    	var indexVar = 'indexVar';
    	var change = 'Up';        	
    	
    	var targetIndex1={
    		value:'',	
			setValue:function(val){          			
    			this.value = val;
    		},
    		unwrap:function(){          			
    			return 'val1';
    		}
    	};
    	
    	var targetIndex2={
    		value:'',	
			setValue:function(val){          			
    			this.value = val;
    		},
    		unwrap:function(){          			
    			return 'val2';
    		}
    	};
    	
    	var targetValueProvider1={
			getValue:function(val){  
    			if(val != indexVar) throw new Error("Wrong val used in targetValueProvider.getValue()");
    			return targetIndex1;
    		}
    	};
    	
    	var targetValueProvider2={
			getValue:function(val){  
    			if(val != indexVar) throw new Error("Wrong val used in targetValueProvider.getValue()");
    			return targetIndex2;
    		}
    	};
    	
    	var targetCmp1={	
			getAttributeValueProvider:function(){
    			return targetValueProvider1;        			
    		}
		};
    	
    	var targetCmp2={	
			getAttributeValueProvider:function(){
    			return targetValueProvider2;        			
    		}
		};
    	
    	[Fact]
        function noIncrement(){
        	// Arrange                	
        	var expected = '';        	        	        	
        	targetIndex1.value = '';
        	var cmpArray = [];
        	
        	// Act
			targetHelper.incrementIndices(cmpArray, 1, indexVar, change, undefined);			
			
			// Assert
			Assert.Equal(expected, targetIndex1.value);			
        }
    	
    	[Fact]
        function noIncrementStart(){
        	// Arrange                	
        	var expected = '';        	        	        	
        	targetIndex1.value = '';
        	var cmpArray = [targetCmp1];
        	
        	// Act
			targetHelper.incrementIndices(cmpArray, 1, indexVar, change, undefined);			
			
			// Assert
			Assert.Equal(expected, targetIndex1.value);			
        }
    	    	    	
        [Fact]
        function oneIncrement(){
        	// Arrange                	
        	var expected = 'val1Up';        	        	        	
        	targetIndex1.value = '';
        	var cmpArray = [targetCmp1];
        	
        	// Act
			targetHelper.incrementIndices(cmpArray, 0, indexVar, change, undefined);			
			
			// Assert
			Assert.Equal(expected, targetIndex1.value);			
        }
        
        [Fact]
        function twoIncrement(){
        	// Arrange                	
        	var expected = ['val1Up', 'val2Up'];        	
        	targetIndex1.value = '';
        	targetIndex2.value = '';        	
        	var cmpArray = [targetCmp1, targetCmp2];
        	
        	// Act
			targetHelper.incrementIndices(cmpArray, 0, indexVar, change, undefined);			
			
			// Assert
			Assert.Equal(expected[0], targetIndex1.value);
			Assert.Equal(expected[1], targetIndex2.value);
        }
        
        [Fact]
        function IncrementUsingBodyLen(){
        	// Arrange                	
        	var expected = ['val1Up', 'val2Up'];        	
        	targetIndex1.value = '';
        	targetIndex2.value = '';        	
        	var cmpArray = [targetCmp1, targetCmp2];
        	
        	// Act
			targetHelper.incrementIndices(cmpArray, 0, indexVar, change, 1);			
			
			// Assert
			Assert.Equal(expected[0], targetIndex1.value);
			Assert.Equal(expected[1], targetIndex2.value);
        }
        
        [Fact]
        function skipIncrementUsingBodyLen(){
        	// Arrange                	
        	var expected = ['val1Up', ''];        	
        	targetIndex1.value = '';
        	targetIndex2.value = '';        	
        	var cmpArray = [targetCmp1, targetCmp2];
        	
        	// Act
			targetHelper.incrementIndices(cmpArray, 0, indexVar, change, 2);			
			
			// Assert
			Assert.Equal(expected[0], targetIndex1.value);
			Assert.Equal(expected[1], targetIndex2.value);
        }
    }
    
    [Fixture]
    function getStart(){ 
    	
    	var expected;
    	var value;
    	var actual;
    	var isEmpty;
    	
    	var targetCmp={	
			get:function(att){  
    			if(att=='v.start') return value;
    		}
		};   
    	        	
    	var mockContext = Mocks.GetMock(Object.Global(), "$A", {                                
    		util:{
        		isEmpty: function(val) { 
					if(val != value) throw new Error("Wrong val used in isEmpty()"); 
					return isEmpty; 
				}
			}	            		            				
        });	
    	
    	var mockGetNumber = Mocks.GetMock(targetHelper, "getNumber", function(val){       
    		if(val != value) throw new Error("Wrong val used in getNumber()");        		        		      		        		
    		return value;    		
    	});	    	
    	
    	[Fact]
        function testEmpty(){
        	// Arrange                	
        	expected = 0;
        	value = '';
        	actual = '';
        	isEmpty = true;        	        	
        	
        	// Act
        	mockContext(function(){
        		actual = targetHelper.getStart(targetCmp);
        	});
			
			// Assert
			Assert.Equal(expected, actual);			
        }
    	
    	[Fact]
        function testNegativeValue(){
        	// Arrange                	
        	expected = 0;
        	value = -1;
        	actual = '';        	
        	isEmpty = false;         		
        	
        	// Act
        	mockContext(function(){
        		mockGetNumber(function(){
        			actual = targetHelper.getStart(targetCmp);
        		});
        	});
			
			// Assert
        	Assert.Equal(expected, actual);			
        }
    	
    	[Fact]
        function testPositiveValue(){
        	// Arrange                	
        	expected = 1;
        	value = 1;
        	actual = '';
        	isEmpty = false; 
        	
        	// Act
        	mockContext(function(){
        		mockGetNumber(function(){
        			actual = targetHelper.getStart(targetCmp);
        		});
        	});
			
			// Assert
        	Assert.Equal(expected, actual);			
        }
    }
    
    [Fixture]
    function getEnd(){       	
    	
    	var expected;
    	var value;
    	var actual;    	
    	var isEmpty;
    	
    	var targetCmp={	
			get:function(att){  
    			if(att=='v.end') return value;
    			if(att=='v.items.length') return 0;
    		}
		};   
    	        	
    	var mockContext = Mocks.GetMock(Object.Global(), "$A", {                                
    		util:{
        		isEmpty: function(val) { 
					if(val != value) throw new Error("Wrong val used in isEmpty()"); 
					return isEmpty; 
				}
			}	            		            				
        });	
    	
    	var mockGetNumber = Mocks.GetMock(targetHelper, "getNumber", function(val){       
    		if(val != value) throw new Error("Wrong val used in getNumber()");        		        		      		        		
    		return value;    		
    	});	
    	
    	[Fact]
        function testEmpty(){
        	// Arrange                	
        	expected = 0;
        	value = '';
        	actual = ''; 
        	isEmpty = true;
        	
        	// Act
        	mockContext(function(){
        		actual = targetHelper.getEnd(targetCmp);
        	});
			
			// Assert
			Assert.Equal(expected, actual);			
        }
    	
    	[Fact]
        function testNegativeValue(){
        	// Arrange                	
        	expected = -1;
        	value = -1;
        	actual = '';  
        	isEmpty = false;
        	
        	// Act
        	mockContext(function(){
        		mockGetNumber(function(){
        			actual = targetHelper.getEnd(targetCmp);
        		});
        	});
			
			// Assert
        	Assert.Equal(expected, actual);			
        }
    	
    	[Fact]
        function testPositiveValue(){
        	// Arrange                	
        	expected = 0;
        	value = 1;
        	actual = ''; 
        	isEmpty = false;
        	
        	// Act
        	mockContext(function(){
        		mockGetNumber(function(){
        			actual = targetHelper.getEnd(targetCmp);
        		});
        	});
			
			// Assert
        	Assert.Equal(expected, actual);			
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
