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

Function.RegisterNamespace("Test.Ui.OutputDateTime");

[Fixture]
Test.Ui.OutputDateTime.HelperTest = function(){
	var targetHelper;	
	
	// Aura Files need to be loaded as Json, to catch the object they contain
	ImportJson("ui.outputDateTime.outputDateTimeHelper",function(path,result){
		targetHelper=result;
	});
	
    [Fixture]
    function displayDateTime(){    	
    	
        [Fact]
        function elementExists(){
        	// Arrange
			var targetComponent={
				find:function(component){
					if(component=="span")return outputComponent;
				}								
			};
			
			var outputComponent={
				getElement:function(){
					return targetElement;
				}								
			};
			
			var targetElement={	
				textContent:'',
				innerText:''
			};			
			
			var displayTime = "9/23/04 4:30 PM";

            // Act
			targetHelper.displayDateTime(targetComponent, displayTime);

            // Assert
            Assert.Equal(displayTime, targetElement.textContent);
            Assert.Equal(displayTime, targetElement.innerText);
        }
        
        [Fact]
        function elementDoesntExist(){
        	// Arrange
			var targetComponent={
				find:function(component){
					if(component=="span")return outputComponent;
				}								
			};
			
			var outputComponent={
				getElement:function(){
					return null;
				}								
			};
			
			var targetElement={	
				textContent:'',
				innerText:''
			};			
			
			var displayTime = "9/23/04 4:30 PM";

            // Act
			targetHelper.displayDateTime(targetComponent, displayTime);

            // Assert
            Assert.Equal("", targetElement.textContent);
            Assert.Equal("", targetElement.innerText);
        }        
    }
    
    [Fixture]
    function formatDateTime(){			
			
    	var mockGetNormalizedFormat = Mocks.GetMock(targetHelper, "getNormalizedFormat", function(exp){				
			return exp;			
        });		
		
		var mockGetNormalizedLangLocale = Mocks.GetMock(targetHelper, "getNormalizedLangLocale", function(exp){				
			return exp;			
        });		
		
        [Fact]
        function emptyValue(){
        	// Arrange
        	var expected = "";
        	var actual;
        	
			var targetComponent={
				get:function(expression){
					if(expression=="v.value")return expected;				
				},								
		
				getConcreteComponent:function(component){
					return concreteComponent;
				}								
			};
			
			var concreteComponent={
				getDef:function(){
					return {
						getHelper:function(){					
							return helper;
						}
					};
				}								
			};
			
			var helper={	
				displayDateTime:function(component, displayValue){
					actual = displayValue;					
				}				
			};																			
			
			/*var mockMoment = Mocks.GetMock(Object.Global(), "moment",{
				utc:function(time){
					return targetTime;
				}
			});												
			
			var targetTime={
				isValid:function(){
					return true;
				},
				
				lang:function(langLocale){
					return {
						format:function(format){
							return expected; 
						}
					};
				}
			}*/											
			
            // Act
			targetHelper.formatDateTime(targetComponent);

            // Assert
            Assert.Equal(expected, actual);
        }
        
        [Fact]
        function invalidDate(){
        	// Arrange
        	var expected = "Invalid date time value";
        	var actual;
        	
			var targetComponent={
				get:function(expression){
					if(expression=="v.value")return "2004-09-23T16:30:00.000Z";				
					if(expression=="v.format")return "YYYY-MM-DD 00:00";
					if(expression=="v.timezone")return "GMT";
				},								
		
				getConcreteComponent:function(component){
					return concreteComponent;
				}								
			};
			
			var concreteComponent={
				getDef:function(){
					return {
						getHelper:function(){					
							return helper;
						}
					};
				}								
			};
			
			var helper={	
				displayDateTime:function(component, displayValue){
					actual = displayValue;					
				}				
			};							
			
			var mockMoment = Mocks.GetMock(Object.Global(), "moment",{
				utc:function(time){
					return targetTime;
				}
			});
			
			var targetTime={
				isValid:function(){
					return false;
				}
			};																				

            // Act
						
			mockGetNormalizedFormat(function(){
				mockGetNormalizedLangLocale(function(){
					mockMoment(function(){				
						targetHelper.formatDateTime(targetComponent);
					});			
				});			
            });			

            // Assert
            Assert.Equal(expected, actual);
        }
        
        [Fact]
        function defaultTimeZone(){
        	// Arrange
        	var expected = "2004-09-23 16:30";
        	var actual;
        	
			var targetComponent={
				get:function(expression){
					if(expression=="v.value")return "2004-09-23T16:30:00.000Z";				
					if(expression=="v.format")return "YYYY-MM-DD 00:00";
					if(expression=="v.timezone")return "GMT";
				},								
		
				getConcreteComponent:function(component){
					return concreteComponent;
				}								
			};
			
			var concreteComponent={
				getDef:function(){
					return {
						getHelper:function(){					
							return helper;
						}
					};
				}								
			};
			
			var helper={	
				displayDateTime:function(component, displayValue){
					actual = displayValue;					
				}				
			};													
			
			var mockMoment = Mocks.GetMock(Object.Global(), "moment",{
				utc:function(time){
					return targetTime;
				}
			});
			
			var targetTime={
				isValid:function(){
					return true;
				},
				
				lang:function(langLocale){
					return {
						format:function(format){
							return expected; 
						}
					};
				}
			};																

            // Act
			mockGetNormalizedFormat(function(){
				mockGetNormalizedLangLocale(function(){
					mockMoment(function(){						
						targetHelper.formatDateTime(targetComponent);						
					});
				});
            });			

            // Assert
            Assert.Equal(expected, actual);
        }
        
        [Fact]
        function TimeZoneLoaded(){
        	// Arrange
        	var expected = "2004-09-23 09:30";
        	var actual;
        	
			var targetComponent={
				get:function(expression){
					if(expression=="v.value")return "2004-09-23T16:30:00.000Z";				
					if(expression=="v.format")return "YYYY-MM-DD 00:00";
					if(expression=="v.timezone")return 0;
				},								
		
				getConcreteComponent:function(component){
					return concreteComponent;
				}								
			};
			
			var concreteComponent={
				getDef:function(){
					return {
						getHelper:function(){					
							return helper;
						}
					};
				}								
			};
			
			var helper={									
				updateDisplay:function(component, d, format, timezone, defaultDisplayValue) {
					actual = expected;
				}
			};													
			
			var mockMoment = Mocks.GetMock(Object.Global(), "moment",{
				utc:function(time){
					return targetTime;
				}
			});					
			
			var targetTime={
				isValid:function(){
					return true;
				},
				
				lang:function(langLocale){
					return {
						format:function(format){
							return expected; 
						}
					};
				}
			};	
															
			var mockWallTime = Mocks.GetMock(Object.Global(), "WallTime",{
				zones:[true,false]
			});																																	

            // Act
			mockGetNormalizedFormat(function(){
				mockGetNormalizedLangLocale(function(){
					mockMoment(function(){						
						mockWallTime(function(){						
							targetHelper.formatDateTime(targetComponent);	
						});						
					});
                });
            });			

            // Assert
            Assert.Equal(expected, actual);
        } 
        
        [Fact]
        function TimeZoneInfoNotLoaded(){
        	// Arrange
        	var expected = "2004-09-23 09:30";
        	var actual;
        	
			var targetComponent={
				get:function(expression){
					if(expression=="v.value")return "2004-09-23T16:30:00.000Z";				
					if(expression=="v.format")return "YYYY-MM-DD 00:00";
					if(expression=="v.timezone")return 1;
				},								
		
				getConcreteComponent:function(component){
					return concreteComponent;
				}								
			};
			
			var concreteComponent={
				getDef:function(){
					return {
						getHelper:function(){					
							return helper;
						}
					};
				}								
			};		
			
			var helper={									
				updateDisplay:function(component, d, format, timezone, defaultDisplayValue) {
					actual = expected;
				}
			};	
			
			var mockMoment = Mocks.GetMock(Object.Global(), "moment",{
				utc:function(time){
					return targetTime;
				}
			});					
			
			var targetTime={
				isValid:function(){
					return true;
				},
				
				lang:function(langLocale){
					return {
						format:function(format){
							return expected; 
						}
					};
				}
			};	
						
			var mockWallTime = Mocks.GetMock(Object.Global(), "WallTime",{
				zones:[true,false]
			});		
																					
			var mockGetTimeZoneInfo = Mocks.GetMock(targetHelper, "getTimeZoneInfo", function(){				
				helper.updateDisplay();
			});										

            // Act
			mockGetNormalizedFormat(function(){
				mockGetNormalizedLangLocale(function(){
					mockMoment(function(){						
						mockWallTime(function(){
							mockGetTimeZoneInfo(function(){
								targetHelper.formatDateTime(targetComponent);
							});
						});		                
					});
				});
            });			

            // Assert
            Assert.Equal(expected, actual);
        }                 
    }     
        
    [Fixture]
    function getNormalizedFormat(){		
    	    	    	
    	[Fact]
        function UsingNullAttribute(){
        	// Arrange
        	var expected = "YYYY-MM-DD HH:mm";
        	
			var targetComponent={
				_format:null
			};		
			
			var mockContext = Mocks.GetMock(Object.Global(), "$A", {                                
				util: {   
					isUndefinedOrNull: function() { return true; },
	            	isEmpty: function() { return false; }	            	
	            }
	        });
			
			var mockNormalizeFormat = Mocks.GetMock(targetHelper, "normalizeFormat", function(exp){				
				targetComponent._format = expected;			
	        });	
									
			var actual;			
            // Act
			mockContext(function(){
				mockNormalizeFormat(function(){
					targetHelper.getNormalizedFormat(targetComponent);
					actual = targetComponent._format;
				});
			});

            // Assert
            Assert.Equal(expected, actual);            
        }    
    
        [Fact]
        function UsingEmptyAttribute(){
        	// Arrange
        	var expected = "YYYY-MM-DD HH:mm";
        	
			var targetComponent={
				_format:''
			};	
			
			var mockContext = Mocks.GetMock(Object.Global(), "$A", {                                
				util: {   					
					isUndefinedOrNull: function() { return false; },
	            	isEmpty: function() { return true; }
	            }
	        });
			
			var mockNormalizeFormat = Mocks.GetMock(targetHelper, "normalizeFormat", function(exp){				
				targetComponent._format = expected;			
	        });	
									
			var actual;			
            // Act
			mockContext(function(){
				mockNormalizeFormat(function(){
					targetHelper.getNormalizedFormat(targetComponent);
					actual = targetComponent._format;
				});
			});

            // Assert
            Assert.Equal(expected, actual);            
        }
        
        [Fact]
        function UsingAttribute(){
        	// Arrange
        	var expected = "YYYY-MM-DD HH:mm";
        	
			var targetComponent={
				_format:expected
			};	
			
			var mockContext = Mocks.GetMock(Object.Global(), "$A", {                                
				util: {   	
					isUndefinedOrNull: function() { return false; },
	            	isEmpty: function() { return false; }
	            }
	        });						
									
			var actual;			
            // Act
			mockContext(function(){				
				targetHelper.getNormalizedFormat(targetComponent);
				actual = targetComponent._format;				
			});

            // Assert
            Assert.Equal(expected, actual);            
        }
    }
    
    [Fixture]
    function getNormalizedLangLocale(){		
    	    	      	
    	[Fact]
        function UsingNullAttribute(){
        	// Arrange
        	var expected = "en";
        	
			var targetComponent={
				_langLocale:null
			};	
			
			var mockContext = Mocks.GetMock(Object.Global(), "$A", {                                
				util: {   
					isUndefinedOrNull: function() { return true; },
	            	isEmpty: function() { return false; }	            	
	            }
	        });
			
			var mockNormalizeLangLocale = Mocks.GetMock(targetHelper, "normalizeLangLocale", function(exp){				
				targetComponent._langLocale = expected;			
	        });	
									
			var actual;			
            // Act
			mockContext(function(){
				mockNormalizeLangLocale(function(){
					targetHelper.getNormalizedLangLocale(targetComponent);
					actual = targetComponent._langLocale;
				});
			});

            // Assert
            Assert.Equal(expected, actual);            
        }
		    	    	
        [Fact]
        function UsingEmptyAttribute(){
        	// Arrange
        	var expected = "en";
        	
			var targetComponent={
				_langLocale:''
			};	
			
			var mockContext = Mocks.GetMock(Object.Global(), "$A", {                                
				util: {   					
					isUndefinedOrNull: function() { return false; },
	            	isEmpty: function() { return true; }
	            }
	        });
			
			var mockNormalizeLangLocale = Mocks.GetMock(targetHelper, "normalizeLangLocale", function(exp){				
				targetComponent._langLocale = expected;			
	        });	
									
			var actual;			
            // Act
			mockContext(function(){
				mockNormalizeLangLocale(function(){
					targetHelper.getNormalizedLangLocale(targetComponent);
					actual = targetComponent._langLocale;
				});
			});

            // Assert
            Assert.Equal(expected, actual);            
        }
        
        [Fact]
        function UsingAttribute(){
        	// Arrange
        	var expected = "en";
        	
			var targetComponent={
				_langLocale:expected
			};	
			
			var mockContext = Mocks.GetMock(Object.Global(), "$A", {                                
				util: {   					
					isUndefinedOrNull: function() { return false; },
	            	isEmpty: function() { return false; }
	            }
	        });						
									
			var actual;			
            // Act
			mockContext(function(){				
				targetHelper.getNormalizedLangLocale(targetComponent);
				actual = targetComponent._langLocale;				
			});

            // Assert
            Assert.Equal(expected, actual);            
        }
    }
        
    [Fixture]
    function normalizeFormat(){
    	    	    	
    	[Fact]
        function EmptyString(){
        	// Arrange        	     
        	var expected = "YYYY-MM-DD HH:mm";
        	var actual;
			var targetComponent={
				_format:'',
				get:function(expression){
					if(expression=="v.format")return "";
				},
				
				setValue:function(expression, value){
					if(expression=="v.format")actual = value;
				}
			};			
			
			var mockContext = Mocks.GetMock(Object.Global(), "$A", {                                
	            getGlobalValueProviders: function(){
	    			return {
	    				get: function(expression){			    					
	    					if(expression=="$Locale.datetimeformat")return "YYYY-MM-DD HH:mm";    					
	    				}
	    			}
	            }
	        });

            // Act			
			mockContext(function(){
				targetHelper.normalizeFormat(targetComponent);
				actual = targetComponent._format;
			});			

            // Assert
            Assert.Equal(expected, actual);
        }
    	
        [Fact]
        function StringNeedingNormalization(){
        	// Arrange        	     
        	var expected = "YYYY-MM-DD HH:mm";
        	var actual;
			var targetComponent={
				_format:'',
				get:function(expression){
					if(expression=="v.format")return "yyyy-MM-dd HH:mm";
				},
				
				setValue:function(expression, value){
					if(expression=="v.format")actual = value;
				}
			};									

            // Act					
			targetHelper.normalizeFormat(targetComponent);	
			actual = targetComponent._format;

            // Assert
            Assert.Equal(expected, actual);
        }
        
        [Fact]
        function NormalizedString(){
        	// Arrange        	    
        	var expected = "YYYY-MM-DD HH:mm";
        	var actual;
			var targetComponent={
				_format:'',
				get:function(expression){
					if(expression=="v.format")return expected;
				},
				
				setValue:function(expression, value){
					if(expression=="v.format")actual = value;
				}
			};									                     

            // Act			
			targetHelper.normalizeFormat(targetComponent);	
			actual = targetComponent._format;

            // Assert
            Assert.Equal(expected, actual);
        }                
                
    }
    
    [Fixture]
    function normalizeLangLocale(){		
    	    	    		    	    	
        [Fact]
        function UsingEmptyAttribute(){
        	// Arrange
        	var expected = "en";
        	
			var targetComponent={
				_langLocale:'',
				get:function(expression){					
					if(expression=="v.langLocale")return '';
				}	
			};				
			
			var mockContext = Mocks.GetMock(Object.Global(), "$A", {                                
				util: {                	
	            	isEmpty: function() { return false; }
	            },
				getGlobalValueProviders: function(){
	    			return {
	    				get: function(expression){			    					
	    					if(expression=="$Locale.langLocale")return "en";    					
	    				}
	    			}
	            }
	        });    	
			
			var mockMoment = Mocks.GetMock(Object.Global(), "moment",{
	    		langData:function(){
					return true;
				}
			});
									
			var actual;
            // Act
			mockContext(function(){
				mockMoment(function(){
					targetHelper.normalizeLangLocale(targetComponent);
					actual = targetComponent._langLocale;
				});
			});

            // Assert
            Assert.Equal(expected, actual);            
        }
        
        [Fact]
        function InvalidDefault(){
        	// Arrange
        	var expected = "en";
        	
			var targetComponent={
				_langLocale:'',
				get:function(expression){					
					if(expression=="v.langLocale")return '';
				}	
			};		
			
			var mockContext = Mocks.GetMock(Object.Global(), "$A", {                                
				util: {                	
	            	isEmpty: function() { return false; }
	            },
				getGlobalValueProviders: function(){
	    			return {
	    				get: function(expression){			    					
	    					if(expression=="$Locale.langLocale")return "xx";    					
	    				}
	    			}
	            }
	        });    	
			
			var mockMoment = Mocks.GetMock(Object.Global(), "moment",{
	    		langData:function(){
					return false;
				}
			});
									
			var actual;
            // Act
			mockContext(function(){
				mockMoment(function(){
					targetHelper.normalizeLangLocale(targetComponent);
					actual = targetComponent._langLocale;
				});
			});

            // Assert
            Assert.Equal(expected, actual);            
        }
        
        [Fact]
        function UsingAttribute(){
        	// Arrange
        	var expected = "en";
        	
			var targetComponent={
				_langLocale:'',
				get:function(expression){					
					if(expression=="v.langLocale")return expected;
				}	
			};		
			
			var mockContext = Mocks.GetMock(Object.Global(), "$A", {                                
				util: {                	
	            	isEmpty: function() { return false; }
	            },
				getGlobalValueProviders: function(){
	    			return {
	    				get: function(expression){			    					
	    					if(expression=="$Locale.langLocale")return "en";    					
	    				}
	    			}
	            }
	        });    	
									
			var mockMoment = Mocks.GetMock(Object.Global(), "moment",{
	    		langData:function(){
					return true;
				}
			});
									
			var actual;
            // Act
			mockContext(function(){
				mockMoment(function(){
					targetHelper.normalizeLangLocale(targetComponent);
					actual = targetComponent._langLocale;
				});
			});

            // Assert
            Assert.Equal(expected, actual);            
        }                
        
        [Fact]
        function UsingAttributeChinese(){
        	// Arrange
        	var expected = "zh-cn";
        	
			var targetComponent={
				_langLocale:'',
				get:function(expression){					
					if(expression=="v.langLocale")return "zh_CN";
				}	
			};		
			
			var mockContext = Mocks.GetMock(Object.Global(), "$A", {                                
				util: {                	
	            	isEmpty: function() { return false; }
	            },
				getGlobalValueProviders: function(){
	    			return {
	    				get: function(expression){			    					
	    					if(expression=="$Locale.langLocale")return "en";    					
	    				}
	    			}
	            }
	        });    	
									
			var mockMoment = Mocks.GetMock(Object.Global(), "moment",{
	    		langData:function(){
					return true;
				}
			});
									
			var actual;
            // Act
			mockContext(function(){
				mockMoment(function(){
					targetHelper.normalizeLangLocale(targetComponent);
					actual = targetComponent._langLocale;
				});
			});

            // Assert
            Assert.Equal(expected, actual);            
        }
        
        [Fact]
        function UsingAttributeUSEnglish(){
        	// Arrange
        	var expected = "en-us";
        	
			var targetComponent={
				_langLocale:'',
				get:function(expression){					
					if(expression=="v.langLocale")return "en_us";
				}	
			};		
			
			var mockContext = Mocks.GetMock(Object.Global(), "$A", {                                
				util: {                	
	            	isEmpty: function() { return false; }
	            },
				getGlobalValueProviders: function(){
	    			return {
	    				get: function(expression){			    					
	    					if(expression=="$Locale.langLocale")return "en";    					
	    				}
	    			}
	            }
	        });    	
								
			var mockMoment = Mocks.GetMock(Object.Global(), "moment",{
	    		langData:function(){
					return true;
				}
			});
									
			var actual;
            // Act
			mockContext(function(){
				mockMoment(function(){
					targetHelper.normalizeLangLocale(targetComponent);
					actual = targetComponent._langLocale;
				});
			});

            // Assert
            Assert.Equal(expected, actual);            
        }
        
        [Fact]
        function UsingAttributeGarbageWithUnderscore(){
        	// Arrange
        	var expected = "en";
        	
			var targetComponent={
				_langLocale:'',
				get:function(expression){					
					if(expression=="v.langLocale")return "xx_ab";
				}	
			};		
			
			var mockContext = Mocks.GetMock(Object.Global(), "$A", {                                
				util: {                	
	            	isEmpty: function() { return false; }
	            },
				getGlobalValueProviders: function(){
	    			return {
	    				get: function(expression){			    					
	    					if(expression=="$Locale.langLocale")return "en";    					
	    				}
	    			}
	            }
	        });    	
								
			var mockMoment = Mocks.GetMock(Object.Global(), "moment",{
	    		langData:function(){
					return false;
				}
			});
									
			var actual;
            // Act
			mockContext(function(){
				mockMoment(function(){
					targetHelper.normalizeLangLocale(targetComponent);
					actual = targetComponent._langLocale;
				});
			});

            // Assert
            Assert.Equal(expected, actual);            
        }
        
        [Fact]
        function UsingAttributeMultipleUnderscores(){
        	// Arrange
        	var expected = "en";
        	
			var targetComponent={
				_langLocale:'',
				get:function(expression){					
					if(expression=="v.langLocale")return "a_b_c";
				}	
			};		
			
			var mockContext = Mocks.GetMock(Object.Global(), "$A", {                                
				util: {                	
	            	isEmpty: function() { return false; }
	            },
				getGlobalValueProviders: function(){
	    			return {
	    				get: function(expression){			    					
	    					if(expression=="$Locale.langLocale")return "en";    					
	    				}
	    			}
	            }
	        });    	
									
			var mockMoment = Mocks.GetMock(Object.Global(), "moment",{
	    		langData:function(){
					return false;
				}
			});
									
			var actual;
            // Act
			mockContext(function(){
				mockMoment(function(){
					targetHelper.normalizeLangLocale(targetComponent);
					actual = targetComponent._langLocale;
				});
			});

            // Assert
            Assert.Equal(expected, actual);            
        }
        
        [Fact]
        function UsingAttributeMultipleUnderscoresStartWithzh(){
        	// Arrange
        	var expected = "zh-cn";
        	
			var targetComponent={
				_langLocale:'',
				get:function(expression){					
					if(expression=="v.langLocale")return "zh_CN_dummy_foo";
				}	
			};		
			
			var mockContext = Mocks.GetMock(Object.Global(), "$A", {                                
				util: {                	
	            	isEmpty: function() { return false; }
	            },
				getGlobalValueProviders: function(){
	    			return {
	    				get: function(expression){			    					
	    					if(expression=="$Locale.langLocale")return "en";    					
	    				}
	    			}
	            }
	        });    	
								
			var mockMoment = Mocks.GetMock(Object.Global(), "moment",{
	    		langData:function(){
					return true;
				}
			});
									
			var actual;
            // Act
			mockContext(function(){
				mockMoment(function(){
					targetHelper.normalizeLangLocale(targetComponent);
					actual = targetComponent._langLocale;
				});
			});

            // Assert
            Assert.Equal(expected, actual);            
        }
    }
    
    [Fixture]
    function getTimeZoneInfo(){			
			
        [Fact]
        function callBackIsCalled(){
        	// Arrange
        	var expected = "success";
        	var actual;        	        	
        	
        	var targetTimeZoneId = "";
        	
        	var targetAction={
    			timezoneId:'',
        		setParams:function(){					
        			timezoneId = targetTimeZoneId;
				},
				setCallback:function(){
					targetCallback();
				}					
        	};
        	        	        	
			var targetComponent={
				get:function(expression){					
					if(expression=="c.getTimeZoneInfo") return targetAction;
				}
			};		
									
			var targetCallback=function(){
				actual = "success";								
			};
			
			var mockContext = Mocks.GetMock(Object.Global(), "$A", {                              
                enqueueAction: function() { }                	                
            });
									
			mockContext(function(){
				targetHelper.getTimeZoneInfo(targetComponent, targetTimeZoneId, targetCallback);
			});

            // Assert
            Assert.Equal(expected, actual);            
        }
        
        [Fact]
        function callBackNotCalled(){
        	// Arrange
        	var expected = "success";
        	var actual;        	        	
        	
        	var targetTimeZoneId = "";
        	        	        	
        	var targetAction={
    			timezoneId:'',
        		setParams:function(){					
        			timezoneId = targetTimeZoneId;
				},
				setCallback:function(){				
				}				
        	};
        	        	     	        	
			var targetComponent={
				get:function(expression){					
					if(expression=="c.getTimeZoneInfo") return targetAction;
				}
			};		
									
			var targetCallback=function(){
				actual = "success";								
			};
			
			var mockContext = Mocks.GetMock(Object.Global(), "$A", {                              
                enqueueAction: function() { }                	                
            });
									
			mockContext(function(){
				targetHelper.getTimeZoneInfo(targetComponent, targetTimeZoneId, targetCallback);
			});

            // Assert
            Assert.NotEqual(expected, actual);            
        }
    }
    
    [Fixture]
    function updateDisplay(){  
    	    	
    	var mockGetWallDateTime = Mocks.GetMock(targetHelper, "getWallDateTime", function(d, timezone){				
			return walldate;			
        });	
    	
    	var walldate;
		
    	var mockGetNormalizedLangLocale = Mocks.GetMock(targetHelper, "getNormalizedLangLocale", function(){				
			return "en";			
        });
    	
    	[Fact]
        function invalidDate(){
        	// Arrange
        	var d={
    			getTime:function(){
    				100;
    			}
        	};
			var tagetFormat="YYYY-MM-DD 00:00";
			var targetTimezone="GMT"									
			var defaultValue = "2004-09-23T16:30:00.000Z";
			var expected = "Invalid date time value";
			var actual;
			
			var targetComponent={
				getConcreteComponent:function(component){
					return concreteComponent;
				}								
			};
			
			var concreteComponent={
				getDef:function(){
					return {
						getHelper:function(){					
							return helper;
						}
					};
				}								
			};			
			
			var helper={	
				displayDateTime:function(component, displayValue){
					actual = displayValue;					
				}				
			};	
			
			var mockMoment = Mocks.GetMock(Object.Global(), "moment",{
				utc:function(walldate){
					return targetTime;
				}
			});
			
			var targetTime={
				isValid:function(){
					return false;
				},
				
				lang:function(langLocale){
					return {
						format:function(format){
							return expected; 
						}
					};
				}
			};						
        				
            // Act
			mockMoment(function(){
				mockGetWallDateTime(function(){
					mockGetNormalizedLangLocale(function(){
						targetHelper.updateDisplay(targetComponent, d, tagetFormat, targetTimezone, defaultValue);
					});
				});
			});	

            // Assert
            Assert.Equal(expected, actual);            
        }
    	
        [Fact]
        function validDate(){
        	// Arrange
        	var d={
    			getTime:function(){
    				100;
    			}
        	};
			var tagetFormat="YYYY-MM-DD 00:00";
			var targetTimezone="GMT"									
			var defaultValue = "2004-09-23T16:30:00.000Z";
			var expected = "2004-09-23 16:30";
			var actual;
			
			var targetComponent={
				getConcreteComponent:function(component){
					return concreteComponent;
				}								
			};
			
			var concreteComponent={
				getDef:function(){
					return {
						getHelper:function(){					
							return helper;
						}
					};
				}								
			};			
			
			var helper={	
				displayDateTime:function(component, displayValue){
					actual = displayValue;					
				}				
			};	
			
			var mockMoment = Mocks.GetMock(Object.Global(), "moment",{
				utc:function(walldate){
					return targetTime;
				}
			});
			
			var targetTime={
				isValid:function(){
					return true;
				},
				
				lang:function(langLocale){
					return {
						format:function(format){
							return expected; 
						}
					};
				}
			};						
        	
            // Act
			mockMoment(function(){
				mockGetWallDateTime(function(){
					mockGetNormalizedLangLocale(function(){
						targetHelper.updateDisplay(targetComponent, d, tagetFormat, targetTimezone, defaultValue);
					});
				});
			});	

            // Assert
            Assert.Equal(expected, actual);            
        }
    }
    
    [Fixture]
    function getWallDateTime(){      	
    	
    	[Fact]
        function validTimeZone(){
        	// Arrange
        	var d={
    			getTime:function(){
    				100;
    			}
        	};	
        	
			var targetTimezone="GMT";															
		    var expected = "expected";
	    	
	    	var mockWallTime = Mocks.GetMock(Object.Global(), "WallTime", {
	    		UTCToWallTime: function(d, timezone){
	    			return tzDate;
	    		}						
	        });	
	    	
	    	var tzDate = {
				getTimezoneOffset:function(){
					return 1;
				}
	    	}	    		    	
	    	
	    	var mockMoment = Mocks.GetMock(Object.Global(), "moment", {				
	    		utc: function(){
	    			return mDate;
	    		}			
	        });
	    	    	
	    	var mDate = {
				toDate:function(){
					return expected;
				}
	    	};
				
			var actual;							
        				
            // Act
			mockWallTime(function(){				
				mockMoment(function(){
					actual = targetHelper.getWallDateTime(d, targetTimezone);
				});				
			});	

            // Assert
            Assert.Equal(expected, actual);            
        }
    	
    	[Fact]
        function invalidTimeZone(){
        	// Arrange
        	var d={
    			getTime:function(){
    				100;
    			}
        	};			
			var targetTimezone="Dummy";	
			
	    	var expected = "expected";
	    	
	    	var mockWallTime = Mocks.GetMock(Object.Global(), "WallTime", {
	    		UTCToWallTime: function(d, timezone){
	    			if(timezone == 'America_Los_Angeles') return tzDate;
	    			if(timezone == 'Dummy') throw new Error();
	    		}						
	        });	
	    	
	    	var tzDate = {
				getTimezoneOffset:function(){
					return 1;
				}
	    	}
	    	
	    	var mockContext = Mocks.GetMock(Object.Global(), "$A", {                                
				util: {                	
	            	isEmpty: function() { return false; }
	            },
				getGlobalValueProviders: function(){
	    			return {
	    				get: function(expression){			    					
	    					if(expression=="$Locale.timezone")return "America_Los_Angeles";    					
	    				}
	    			}
	            }
	        });  
	    	
	    	var mockMoment = Mocks.GetMock(Object.Global(), "moment", {				
	    		utc: function(){
	    			return mDate;
	    		}			
	        });
	    	    	
	    	var mDate = {
				toDate:function(){
					return expected;
				}
	    	};
	    	
			var actual;		
						
            // Act
			mockWallTime(function(){
				mockContext(function(){
					mockMoment(function(){
						actual = targetHelper.getWallDateTime(d, targetTimezone);						
					});
				});
			});	

            // Assert
            Assert.Equal(expected, actual);            
        }
    }
}