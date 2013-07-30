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
        	var targetElement={	
    			textContent:'',
    			innerText:''
    		};	
        	
        	var outputComponent={
				getElement:function(){
					return targetElement;
				}								
			};
        	
			var targetComponent={
				find:function(component){
					if(component=="span")return outputComponent;
				}								
			};		
			
			var mockContext = Mocks.GetMock(Object.Global(), "$A", {                                
				localizationService: {   
					translateToLocalizedDigits: function(value) { return value; }	            	
	            }
	        });												
			
			var displayTime = "9/23/04 4:30 PM";

            // Act
            mockContext(function(){					
				targetHelper.displayDateTime(targetComponent, displayTime);
			});	

            // Assert
            Assert.Equal(displayTime, targetElement.textContent);
            Assert.Equal(displayTime, targetElement.innerText);
        }
        
        [Fact]
        function elementDoesntExist(){
        	// Arrange					
        	var targetElement={	
    			textContent:'',
    			innerText:''
    		};	
        	
			var outputComponent={
				getElement:function(){
					return null;
				}								
			};					
			
			var targetComponent={
				find:function(component){
					if(component=="span")return outputComponent;
				}								
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

			var helper={	
				displayDateTime:function(component, displayValue){
					actual = displayValue;					
				},
                getFormat:function(component){
                    return component.get("v.format");
                },
                getTimeZone:function(component) {
                    return component.get("v.timezone");
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

			var targetComponent={
				get:function(expression){
					if(expression=="v.value")return expected;				
				},								
		
				getConcreteComponent:function(component){
					return concreteComponent;
				}								
			};																																				
			
            // Act
			targetHelper.formatDateTime(targetComponent);

            // Assert
            Assert.Equal(expected, actual);
        }
        
        [Fact]
        function DateValue(){
        	// Arrange        	
        	var expectedDate = "Date";
        	var expectedFormat = "YYYY-MM-DD 00:00";
        	var expectedLang = "en";        	
        	var actual;	
			
			var helper={	
				displayDateTime:function(component, displayValue){
					actual = displayValue;					
				},
                getFormat:function(component){
                    return component.get("v.format");
                },
                getTimeZone:function(component) {
                    return component.get("v.timezone");
                }
			};	
			
			var concreteComponent={
				getDef:function(){
					return {
						getHelper:function(){					
							return helper;
						}
					};
				},
				get:function(expression){
					if(expression=="v.format")return expectedFormat;	
					if(expression=="v.langLocale")return expectedLang;
					if(expression=="v.timezone")return "GMT";
				}
			};
			        	
			var targetComponent={
				get:function(expression){
					if(expression=="v.value")return "2004-09-23T16:30:00.000Z";									
				},								
		
				getConcreteComponent:function(component){
					return concreteComponent;
				}								
			};				
						
			var mockContext = Mocks.GetMock(Object.Global(), "$A", {                                
				localizationService: {   
					UTCToWallTime: function(dateObj,timezone, callback ) { callback(dateObj); },
					formatDateTimeUTC: function(walltime, format, langLocale) { return "Date"+format+langLocale; },
                    parseDateTimeISO8601: function(datetimeString) { return new Date(datetimeString); },
                    translateToOtherCalendar: function(date) { return date; }
	            }
	        });												
			 
            // Act
									
			mockContext(function(){					
				targetHelper.formatDateTime(targetComponent);
			});			

            // Assert
            Assert.NotEqual(-1, actual.indexOf(expectedDate));
            Assert.NotEqual(-1, actual.indexOf(expectedFormat));
            Assert.NotEqual(-1, actual.indexOf(expectedLang));
        }
        
        
        [Fact]
        function ThrowsException(){
        	// Arrange
        	var expected = "Invalid date time value";
        	var actual;
        	
			var helper={	
				displayDateTime:function(component, displayValue){
					actual = displayValue;					
				},
<<<<<<< HEAD
                getFormat:function(component){
                    return component.get("v.format");
                },
                getTimeZone:function(component) {
                    return component.get("v.timezone");
                } 				
            };	
=======
				getFormat:function(component){
				    return component.get("v.format");
				},
				getTimeZone:function(component) {
                    return component.get("v.timezone");
                }		
			};	
>>>>>>> 8a0ab36... Make getFormat and getTimeZone overridable.
			
			var concreteComponent={
				getDef:function(){
					return {
						getHelper:function(){					
							return helper;
						}
					};
				},
				get:function(expression){
					if(expression=="v.format")return "YYYY-MM-DD 00:00";	
					if(expression=="v.langLocale")return "en";
					if(expression=="v.timezone")return "GMT";
				}
			};
			        	
			var targetComponent={
				get:function(expression){
					if(expression=="v.value")return "2004-09-23T16:30:00.000Z";									
				},								
		
				getConcreteComponent:function(component){
					return concreteComponent;
				}								
			};				
									
			var mockContext = Mocks.GetMock(Object.Global(), "$A", {                                
				localizationService: {   
					UTCToWallTime: function(dateObj,timezone, callback) { callback(dateObj); },			
					formatDateTimeUTC: function(walltime, format, langLocale) { throw {message: expected}; },
<<<<<<< HEAD
					parseDateTimeISO8601: function(datetimeString) { return new Date(datetimeString); },
                    translateToOtherCalendar: function(date) { return date; }           	
=======
					parseDateTimeISO8601: function(datetimeString) { return new Date(datetimeString); }	            	
>>>>>>> 11377d9... Fix outputDateTime in IE8
	            }
	        });												
			 
            // Act
									
			mockContext(function(){					
				targetHelper.formatDateTime(targetComponent);
			});			

            // Assert
            Assert.Equal(expected, actual);
        }   
         
    }                
}