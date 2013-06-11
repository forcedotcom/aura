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
			
			var mockMoment = Mocks.GetMock(Object.Global(), "moment",{
				utc:function(time){
					return targetTime;
				}
			});						
			
			var mockGetLangLocale = Mocks.GetMock(targetHelper, "getLangLocale", function(){				
				return "en";			
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
			}											
			
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
			mockMoment(function(){				
            	targetHelper.formatDateTime(targetComponent);                
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
			
			var mockGetLangLocale = Mocks.GetMock(targetHelper, "getLangLocale", function(){				
				return "en";			
	        });																

            // Act
			mockMoment(function(){
				mockGetLangLocale(function(){
                	targetHelper.formatDateTime(targetComponent);
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
			
			var mockGetLangLocale = Mocks.GetMock(targetHelper, "getLangLocale", function(){				
				return "en";			
	        });										
			
			var mockWallTime = Mocks.GetMock(Object.Global(), "WallTime",{
				zones:[true,false]
			});																																	

            // Act
			mockMoment(function(){
				mockGetLangLocale(function(){
					mockWallTime(function(){						
						targetHelper.formatDateTime(targetComponent);						
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
			
			var mockGetLangLocale = Mocks.GetMock(targetHelper, "getLangLocale", function(){				
				return "en";			
	        });										
			
			var mockWallTime = Mocks.GetMock(Object.Global(), "WallTime",{
				zones:[true,false]
			});		
																					
			var mockGetTimeZoneInfo = Mocks.GetMock(targetHelper, "getTimeZoneInfo", function(){				
				helper.updateDisplay();
			});										

            // Act
			mockMoment(function(){
				mockGetLangLocale(function(){
					mockWallTime(function(){
						mockGetTimeZoneInfo(function(){
							targetHelper.formatDateTime(targetComponent);
						});
					});
                });
            });			

            // Assert
            Assert.Equal(expected, actual);
        }                 
    }     
    
    [Fixture]
    function getLangLocale(){			
			
        [Fact]
        function UsingNameAttribute(){
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
				actual = targetHelper.getLangLocale(targetComponent);
			});

            // Assert
            Assert.Equal(expected, actual);            
        }
        
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
                	isUndefinedOrNull: function() { return true; },
                	isEmpty: function() { return false; }
                }
            });
									
			var actual;
            // Act
			mockContext(function(){
				actual = targetHelper.getLangLocale(targetComponent);
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
                	isUndefinedOrNull: function() { return true; },
                	isEmpty: function() { return false; }
                }
            });
									
			var actual;
            // Act
			mockContext(function(){
				actual = targetHelper.getLangLocale(targetComponent);
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
                	isUndefinedOrNull: function() { return true; },
                	isEmpty: function() { return false; }
                }
            });
									
			var actual;
            // Act
			mockContext(function(){
				actual = targetHelper.getLangLocale(targetComponent);
			});

            // Assert
            Assert.Equal(expected, actual);            
        }
        
        [Fact]
        function UsingAttributeUSEnglish(){
        	// Arrange
        	var expected = "en";
        	
			var targetComponent={
				_langLocale:'',
				get:function(expression){					
					if(expression=="v.langLocale")return "en_us";
				}	
			};		
			
			var mockContext = Mocks.GetMock(Object.Global(), "$A", {                
                util: {
                	isUndefinedOrNull: function() { return true; },
                	isEmpty: function() { return false; }
                }
            });
									
			var actual;
            // Act
			mockContext(function(){
				actual = targetHelper.getLangLocale(targetComponent);
			});

            // Assert
            Assert.Equal(expected, actual);            
        }
        
        [Fact]
        function UsingAttributeMultipleUnderscores(){
        	// Arrange
        	var expected = "a";
        	
			var targetComponent={
				_langLocale:'',
				get:function(expression){					
					if(expression=="v.langLocale")return "a_b_c";
				}	
			};		
			
			var mockContext = Mocks.GetMock(Object.Global(), "$A", {                
                util: {
                	isUndefinedOrNull: function() { return true; },
                	isEmpty: function() { return false; }
                }
            });
									
			var actual;
            // Act
			mockContext(function(){
				actual = targetHelper.getLangLocale(targetComponent);
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
                	isUndefinedOrNull: function() { return true; },
                	isEmpty: function() { return false; }
                }
            });
									
			var actual;
            // Act
			mockContext(function(){
				actual = targetHelper.getLangLocale(targetComponent);
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
				utc:function(time){
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
        	
			var mockWallTime = Mocks.GetMock(Object.Global(), "WallTime",{
				UTCToWallTime:function(d, timezone){
					return tzDate;
				}
			});	
			
			var tzDate={
				getTimezoneOffset:function(){
					return 1;
				}
			};	
			
			var mockGetLangLocale = Mocks.GetMock(targetHelper, "getLangLocale", function(){				
				return "en";			
	        });	
			
            // Act
			mockMoment(function(){
				mockWallTime(function(){
					mockGetLangLocale(function(){
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
				UTCToWallTime:function(d, timezone){
					return tzDate;
				}
			});	
			
			var tzDate={
				getTimezoneOffset:function(){
					return 1;
				}
			};	
			
			var mockGetLangLocale = Mocks.GetMock(targetHelper, "getLangLocale", function(){				
				return "en";			
	        });	
			
            // Act
			mockMoment(function(){
				mockWallTime(function(){
					mockGetLangLocale(function(){
						targetHelper.updateDisplay(targetComponent, d, tagetFormat, targetTimezone, defaultValue);
					});
				});
			});	

            // Assert
            Assert.Equal(expected, actual);
            
        }
    }
}