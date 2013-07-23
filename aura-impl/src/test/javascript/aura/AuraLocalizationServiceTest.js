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
Function.RegisterNamespace("Test.Aura");

[Fixture]
Test.Aura.AuraLocalizationServiceTest = function(){	    		
            
	// Mock the exp() function defined in Aura.js, this is originally used for exposing members using a export.js file
	Mocks.GetMock(Object.Global(), "exp", function() {
	})(function() {
		// #import aura.AuraLocalizationService
	});
	
	var mockGlobal = Mocks.GetMocks(Object.Global(), {        
        "exp" : function() {
        }
    });
	
	var targetService;
	mockGlobal(function(){
		targetService = new AuraLocalizationService();
    });   
	
	var targetDate = "07/10/2013";	
	var targetDateFormat = "DD-MM-YYYY";
	var targetDateTime = "07/10/2013 12:00:00";	
	var targetDateTimeFormat = "DD-MM-YYYY hh:mm:ss";
	var targetTime = "12:00:00";
	var targetTimeFormat = "hh:mm:ss";
	var targetLocale = "en";	
	var targetTimezone = "PST";
	
	var mockUtil = Mocks.GetMock(Object.Global(), "$A", {                                
		getGlobalValueProviders:function() {   
			return {
				get:function(value) {        			
					if(value == "$Locale.dateformat") return targetDateFormat;
					if(value == "$Locale.datetimeformat") return targetDateTimeFormat;	
					if(value == "$Locale.timeformat") return targetTimeFormat;		
					if(value == "$Locale.timezone") return targetTimezone;					
				}
			};            		            
        }
    });
	
	var mockInvalidDate = {			    			
		isValid:function(){
			return false;
		}
	};
	
	var mockDate = {			    			
		isValid:function(){
			return true;
		},
		toString:function(){
			return targetDate;
		}
	};
	
	var mockDateTime = {			    			
		isValid:function(){
			return true;
		},
		toString:function(){
			return targetDateTime;
		},
		toDate:function(){
			return targetDateTime;
		}
	};
	
	var mockTime = {			    			
		isValid:function(){
			return true;
		},
		toString:function(){
			return targetTime;
		}
	};
	
	var mockMomentConstructor = Mocks.GetMock(Object.Global(), "moment", function(value, format, locale){				
		if(value == mockDate) return mockDate;
		if(value == mockDateTime) return mockDateTime;
		if(value == mockTime) return mockTime;
		return mockInvalidDate;
	});	
	
	var mockMoment = Mocks.GetMock(Object.Global(), "moment", {				
		utc:function(value){
			if(value == mockDate) return mockDate;
			if(value == mockDateTime) return mockDateTime;			
			if(value == mockTime) return mockTime;
			return mockInvalidDate;
		},
		langData:function(value){
			if(value == targetLocale || value == "zh-cn") return true;
			return false;
		}
	});		
		
	var mockDisplayDateTime = Mocks.GetMock(targetService, "displayDateTime", function(mDate, format, locale){                                        		
		return mDate.toString() + format + locale;        		
    });
	
	var mockGetNormalizedFormat = Mocks.GetMock(targetService, "getNormalizedFormat", function(format){                                        		
		return format;        		
    });
	
	var mockGetNormalizedLangLocale = Mocks.GetMock(targetService, "getNormalizedLangLocale", function(locale){                                        		
		return locale;        		
    });	
	
	var mockGetTimeZoneInfo = Mocks.GetMock(targetService, "getTimeZoneInfo", function(timezone, callback){                                        		
		callback(mockDateTime, timezone);        		
    });		
	
	var mockWallTime = Mocks.GetMock(Object.Global(), "WallTime",{
    	zones: {
    		PST:true,
    		EST:false
    	}
	});	
		 								    		
    [Fixture]
    function displayDuration(){
    
    	var targetNoSuffix = "noSuffix";    	    	
    	var targetDuration={
    		humanize:function(noSuffix){
				if(noSuffix == targetNoSuffix)return true;				
			},
			asDays:function(){				
				return "365";
			},
			asHours:function(){				
				return "24";
			},
			asMilliseconds:function(){				
				return "3600000";
			},
			asMinutes:function(){				
				return "60";
			},
			asMonths:function(){				
				return "12";
			},
			asSeconds:function(){				
				return "3600";
			},
			asYears:function(){				
				return "2013";
			},
			days:function(){				
				return "365";
			},
			hours:function(){				
				return "24";
			},
			milliseconds:function(){				
				return "3600000";
			},
			minutes:function(){				
				return "60";
			},
			months:function(){				
				return "12";
			},
			seconds:function(){				
				return "3600";
			},
			years:function(){				
				return "2013";
			}
		};
        
    	[Fact]
        function displayDuration(){
            // Arrange
            var expected = true;                        
            var actual;        

            // Act   
            actual = targetService.displayDuration(targetDuration, targetNoSuffix);            

            // Assert
            Assert.Equal(expected, actual);
        }    	    	
    
    	[Fact]
        function displayDurationInDays(){
            // Arrange
            var expected = "365";                        
            var actual;        

            // Act               
            actual = targetService.displayDurationInDays(targetDuration);            

            // Assert
            Assert.Equal(expected, actual);
        }
    	
    	[Fact]
        function displayDurationInHours(){
            // Arrange
            var expected = "24";                        
            var actual;        

            // Act               
        	actual = targetService.displayDurationInHours(targetDuration);            

            // Assert
            Assert.Equal(expected, actual);
        }
    	
    	[Fact]
        function displayDurationInMilliseconds(){
            // Arrange
            var expected = "3600000";                        
            var actual;        

            // Act               
        	actual = targetService.displayDurationInMilliseconds(targetDuration);            

            // Assert
            Assert.Equal(expected, actual);
        }
    	
    	[Fact]
        function displayDurationInMinutes(){
            // Arrange
            var expected = "60";                        
            var actual;        

            // Act               
        	actual = targetService.displayDurationInMinutes(targetDuration);            

            // Assert
            Assert.Equal(expected, actual);
        }
    	
    	[Fact]
        function displayDurationInMonths(){
            // Arrange
            var expected = "12";                        
            var actual;        

            // Act               
        	actual = targetService.displayDurationInMonths(targetDuration);            

            // Assert
            Assert.Equal(expected, actual);
        }
    	
    	[Fact]
        function displayDurationInSeconds(){
            // Arrange
            var expected = "3600";                        
            var actual;        

            // Act               
            actual = targetService.displayDurationInSeconds(targetDuration);        

            // Assert
            Assert.Equal(expected, actual);
        }
    	
    	[Fact]
        function displayDurationInYears(){
            // Arrange
            var expected = "2013";                        
            var actual;        

            // Act              
        	actual = targetService.displayDurationInYears(targetDuration);           

            // Assert
            Assert.Equal(expected, actual);
        }
    	
    	[Fact]
        function getDaysInDuration(){
            // Arrange
            var expected = "365";                        
            var actual;        

            // Act               
        	actual = targetService.getDaysInDuration(targetDuration);            

            // Assert
            Assert.Equal(expected, actual);
        }
    	
    	[Fact]
        function getHoursInDuration(){
            // Arrange
            var expected = "24";                        
            var actual;        

            // Act               
        	actual = targetService.getHoursInDuration(targetDuration);            

            // Assert
            Assert.Equal(expected, actual);
        }
    	
    	[Fact]
        function getMillisecondsInDuration(){
            // Arrange
            var expected = "3600000";                        
            var actual;        

            // Act               
            actual = targetService.getMillisecondsInDuration(targetDuration);            

            // Assert
            Assert.Equal(expected, actual);
        }
    	
    	[Fact]
        function getMinutesInDuration(){
            // Arrange
            var expected = "60";                        
            var actual;        

            // Act               
            actual = targetService.getMinutesInDuration(targetDuration);            

            // Assert
            Assert.Equal(expected, actual);
        }
    	
    	[Fact]
        function getMonthsInDuration(){
            // Arrange
            var expected = "12";                        
            var actual;        

            // Act               
            actual = targetService.getMonthsInDuration(targetDuration);            

            // Assert
            Assert.Equal(expected, actual);
        }
    	
    	[Fact]
        function getSecondsInDuration(){
            // Arrange
            var expected = "3600";                        
            var actual;        

            // Act               
            actual = targetService.getSecondsInDuration(targetDuration);            

            // Assert
            Assert.Equal(expected, actual);
        }
    	
    	[Fact]
        function getYearsInDuration(){
            // Arrange
            var expected = "2013";                        
            var actual;        

            // Act               
            actual = targetService.getYearsInDuration(targetDuration);            

            // Assert
            Assert.Equal(expected, actual);
        }    	    	
    }
    
    [Fixture]
    function duration(){
    	    	    	
    	var targetNum = "Num";
    	var targetUnit = "Unit";    	
    	var mockMoment = Mocks.GetMock(Object.Global(), 'moment',{    		    	
    		duration:function(num, unit){
    			if(unit){
    				if(num == targetNum && unit == targetUnit)return "With Unit";    				
    			}
    			else{
    				if(num == targetNum)return "Without Unit";    			
    			}    			
			}	
		});    	
        
    	[Fact]
        function durationWithoutUnit(){
            // Arrange
            var expected = "Without Unit";                        
            var actual;        

            // Act                           
            mockMoment(function(){
            	actual = targetService.duration(targetNum, undefined);
            });

            // Assert
            Assert.Equal(expected, actual);
        }
    	
    	[Fact]
        function durationWithUnit(){
            // Arrange
            var expected = "With Unit";                        
            var actual;        

            // Act   
            mockMoment(function(){
            	actual = targetService.duration(targetNum, targetUnit);
            });

            // Assert
            Assert.Equal(expected, actual);
        }
    }
    
    [Fixture]
    function DateLimits(){    	    	    	    	    	    	    	  
    	
    	var targetDate = "date";
    	var targetUnit = "Unit";  
    	    	    	        	 	        											                	
    	var mockMomentConstr = Mocks.GetMock(Object.Global(), "moment", function(date){				
			if(date == targetDate)return mockDuration;
		});	
    	
    	var mockDuration={    		
			endOf:function(unit){	
				if(unit == targetUnit) {
					return {				
						toDate:function(){ 
							return "endOf"; 
						}
					};
				}				
			},
			startOf:function(unit){	
				if(unit == targetUnit) {
					return {				
						toDate:function(){ 
							return "startOf"; 
						}
					};
				} 				
			}
		};  
    	
    	[Fact]
        function endOf(){    		
            // Arrange
            var expected = "endOf";                        
            var actual;                          

            // Act  
            mockMomentConstr(function(){	            
            	actual = targetService.endOf(targetDate, targetUnit);	            
            });

            // Assert
            Assert.Equal(expected, actual);
        }
    	
    	[Fact]
        function startOf(){    		
            // Arrange
            var expected = "startOf";                        
            var actual;  
                        
            // Act  
            mockMomentConstr(function(){	            
            	actual = targetService.startOf(targetDate, targetUnit);	            
            });

            // Assert
            Assert.Equal(expected, actual);
        }
    }
    
    [Fixture]
    function formatDate(){    		    	        	
    	[Fact]
        function InvalidDate(){    		
            // Arrange    		
            var expected = "Invalid date value";                        
            var actual;                                  	        	

            // Act  
            mockMomentConstructor(function(){	     
            	actual = Record.Exception(function() {
            		targetService.formatDate("", targetDateFormat, targetLocale);
            	});
            });

            // Assert
            Assert.Equal(expected, actual.message);
        }    	
    	
    	[Fact]
        function ValidDate(){    		
            // Arrange    		
            var expected = targetDate + targetDateFormat + targetLocale;                        
            var actual;                                  	        	        	

            // Act          	
    		mockMomentConstructor(function(){	
    			mockDisplayDateTime(function(){
    				actual = targetService.formatDate(targetDate, targetDateFormat, targetLocale);
    			});
    		});
            

            // Assert
            Assert.Equal(expected, actual);
        }    	
    	
    	[Fact]
        function NoFormat(){    		
            // Arrange    		
            var expected = targetDate + targetDateFormat + targetLocale;                        
            var actual;                                 	        	        	        	
        	        	
            // Act          	
    		mockMomentConstructor(function(){	
    			mockDisplayDateTime(function(){
    				mockUtil(function(){
    					actual = targetService.formatDate(targetDate, undefined, targetLocale);
    				});
    			});
    		});
            

            // Assert
            Assert.Equal(expected, actual);
        }    	
    }
    
    [Fixture]
    function formatDateUTC(){    					
    	
    	[Fact]
        function InvalidDate(){    		
            // Arrange    		
            var expected = "Invalid date value";                        
            var actual;                           	         	        	
        	        	
            // Act  
            mockMoment(function(){	     
            	actual = Record.Exception(function() {
            		targetService.formatDateUTC("", targetDateFormat, targetLocale);
            	});
            });

            // Assert
            Assert.Equal(expected, actual.message);
        }    	
    	
    	[Fact]
        function ValidDate(){    		
            // Arrange    		
            var expected = targetDate + targetDateFormat + targetLocale;                        
            var actual;                                	                	        	        	        	

            // Act          	
    		mockMoment(function(){	
    			mockDisplayDateTime(function(){
    				actual = targetService.formatDateUTC(targetDate, targetDateFormat, targetLocale);
    			});
    		});
            

            // Assert
            Assert.Equal(expected, actual);
        }    	
    	
    	[Fact]
        function NoFormat(){    		
            // Arrange    		
            var expected = targetDate + targetDateFormat + targetLocale;                        
            var actual;                                  	        	        	        	        	        	

            // Act  
        	
    		mockMoment(function(){	
    			mockDisplayDateTime(function(){
    				mockUtil(function(){
    					actual = targetService.formatDateUTC(targetDate, undefined, targetLocale);
    				});
    			});
    		});
            

            // Assert
            Assert.Equal(expected, actual);
        }    	
    }
    
    [Fixture]
    function formatDateTime(){
    	    			
    	[Fact]
        function InvalidDateTime(){    		
            // Arrange    		
            var expected = "Invalid date time value";                        
            var actual;                          	         	                	

            // Act  
            mockMomentConstructor(function(){	     
            	actual = Record.Exception(function() {
            		targetService.formatDateTime("", targetDateTimeFormat, targetLocale);
            	});
            });

            // Assert
            Assert.Equal(expected, actual.message);
        }    	
    	
    	[Fact]
        function ValidDateTime(){    		
            // Arrange    		
            var expected = targetDateTime + targetDateTimeFormat + targetLocale;                        
            var actual;                      	                	        	        	        	

            // Act          	
    		mockMomentConstructor(function(){	
    			mockDisplayDateTime(function(){
    				actual = targetService.formatDateTime(targetDateTime, targetDateTimeFormat, targetLocale);
    			});
    		});
            

            // Assert
            Assert.Equal(expected, actual);
        }    	
    	
    	[Fact]
        function NoFormat(){    		
            // Arrange    		
            var expected = targetDateTime + targetDateTimeFormat + targetLocale;                        
            var actual;                                   	        		        	        
        	        	
            // Act          	
    		mockMomentConstructor(function(){	
    			mockDisplayDateTime(function(){
    				mockUtil(function(){
    					actual = targetService.formatDateTime(targetDateTime, undefined, targetLocale);
    				});
    			});
    		});
            

            // Assert
            Assert.Equal(expected, actual);
        }    	
    }
    
    [Fixture]
    function formatDateTimeUTC(){
    	 
    	[Fact]
        function InvalidDateTime(){    		
            // Arrange    		
            var expected = "Invalid date time value";                        
            var actual;                                  	
        	        	
            // Act  
            mockMoment(function(){	     
            	actual = Record.Exception(function() {
            		targetService.formatDateTimeUTC("", targetDateTimeFormat, targetLocale);
            	});
            });

            // Assert
            Assert.Equal(expected, actual.message);
        }    	
    	
    	[Fact]
        function ValidDateTime(){    		
            // Arrange    		
            var expected = targetDateTime + targetDateTimeFormat + targetLocale;                        
            var actual;                                  	
        	        	
            // Act          	
    		mockMoment(function(){	
    			mockDisplayDateTime(function(){
    				actual = targetService.formatDateTimeUTC(targetDateTime, targetDateTimeFormat, targetLocale);
    			});
    		});
            
            // Assert
            Assert.Equal(expected, actual);
        }    	
    	
    	[Fact]
        function NoFormat(){    		
            // Arrange    		
            var expected = targetDateTime + targetDateTimeFormat + targetLocale;                        
            var actual;                                 	        			        	        
        	
            // Act          	
    		mockMoment(function(){	
    			mockDisplayDateTime(function(){
    				mockUtil(function(){
    					actual = targetService.formatDateTimeUTC(targetDateTime, undefined, targetLocale);
    				});
    			});
    		});            

            // Assert
            Assert.Equal(expected, actual);
        }    	
    }
    
    [Fixture]
    function formatTime(){    	   
		
    	[Fact]
        function InvalidTime(){    		
            // Arrange    		
            var expected = "Invalid time value";                        
            var actual;              

            // Act  
            mockMomentConstructor(function(){	     
            	actual = Record.Exception(function() {
            		targetService.formatTime("", targetTimeFormat, targetLocale);
            	});
            });

            // Assert
            Assert.Equal(expected, actual.message);
        }    	
    	
    	[Fact]
        function ValidTime(){    		
            // Arrange    		
            var expected = targetTime + targetTimeFormat + targetLocale;                        
            var actual;                              	                	
        	
            // Act          	
    		mockMomentConstructor(function(){	
    			mockDisplayDateTime(function(){
    				actual = targetService.formatTime(targetTime, targetTimeFormat, targetLocale);
    			});
    		});            

            // Assert
            Assert.Equal(expected, actual);
        }    	
    	
    	[Fact]
        function NoFormat(){    		
            // Arrange    		
            var expected = targetTime + targetTimeFormat + targetLocale;                        
            var actual;                           
        	        	        	
            // Act          	
    		mockMomentConstructor(function(){	
    			mockDisplayDateTime(function(){
    				mockUtil(function(){
    					actual = targetService.formatTime(targetTime, undefined, targetLocale);
    				});
    			});
    		});
            
            // Assert
            Assert.Equal(expected, actual);
        }    	
    }
    
    [Fixture]
    function formatTimeUTC(){    	    		
    	[Fact]
        function InvalidTime(){    		
            // Arrange    		
            var expected = "Invalid time value";                        
            var actual;                           	         	        	        	

            // Act  
            mockMoment(function(){	     
            	actual = Record.Exception(function() {
            		targetService.formatTimeUTC("", targetTimeFormat, targetLocale);
            	});
            });

            // Assert
            Assert.Equal(expected, actual.message);
        }    	
    	
    	[Fact]
        function ValidTime(){    		
            // Arrange    		
            var expected = targetTime + targetTimeFormat + targetLocale;                        
            var actual;                                  	
        	        	
            // Act          	
    		mockMoment(function(){	
    			mockDisplayDateTime(function(){
    				actual = targetService.formatTimeUTC(targetTime, targetTimeFormat, targetLocale);
    			});
    		});
            
            // Assert
            Assert.Equal(expected, actual);
        }    	
    	
    	[Fact]
        function NoFormat(){    		
            // Arrange    		
            var expected = targetTime + targetTimeFormat + targetLocale;                        
            var actual;                                  	        	        
        	        	
            // Act          	
    		mockMoment(function(){	
    			mockDisplayDateTime(function(){
    				mockUtil(function(){
    					actual = targetService.formatTimeUTC(targetTime, undefined, targetLocale);
    				});
    			});
    		});            

            // Assert
            Assert.Equal(expected, actual);
        }    	
    }
    
    [Fixture]
    function DateComparisons(){   
    	
    	var targetDate1 = "date1";
    	var targetDate2 = "date2";
    	var targetUnit = "unit";    	    	                             
    	
    	var mockDuration={    		
			isAfter:function(date2, unit){	
				if(date2 == targetDate2 && unit == targetUnit) return "isAfter"; 				
			},
			isBefore:function(date2, unit){				
				if(date2 == targetDate2 && unit == targetUnit) return "isBefore"; 				
			},
			isSame:function(date2, unit){				
				if(date2 == targetDate2 && unit == targetUnit) return "isSame"; 				
			}
		};    	
    	
    	var mockMomentConstr = Mocks.GetMock(Object.Global(), "moment", function(date){				
			if(date == targetDate1)return mockDuration;
		});	
    
	    [Fact]
	    function isAfter(){
	        // Arrange    		
	        var expected = "isAfter";                        
	        var actual;        	        	        
	        
	        //Act
	        mockMomentConstr(function(){	     
            	actual = targetService.isAfter(targetDate1, targetDate2, targetUnit);            	
            });
	
	        // Assert
	        Assert.Equal(expected, actual);
	    }
	    

	    [Fact]
	    function isBefore(){
	        // Arrange    		
	        var expected = "isBefore";                        
	        var actual;        	        	        
	        
	        //Act
	        mockMomentConstr(function(){	     
            	actual = targetService.isBefore(targetDate1, targetDate2, targetUnit);            	
            });
	
	        // Assert
	        Assert.Equal(expected, actual);
	    }
	    

	    [Fact]
	    function isSame(){
	        // Arrange    		
	        var expected = "isSame";                        
	        var actual;        	        	        
	        
	        //Act
	        mockMomentConstr(function(){	     
            	actual = targetService.isSame(targetDate1, targetDate2, targetUnit);            	
            });
	
	        // Assert
	        Assert.Equal(expected, actual);	        
	    }
    }
    
    [Fixture]
    function parseDateTime(){
    	
    	var mockMomentConstr = Mocks.GetMock(Object.Global(), "moment", function(dateTimeString, format, locale){						
    		if(dateTimeString == mockDateTime && format == targetDateTimeFormat && locale == targetLocale) return mockDateTime;		
    		return mockInvalidDate;
    	});	
    	    	    			
    	[Fact]
        function InvalidDateTimeString(){    		
            // Arrange    		
            var expected = null;                        
            var actual;                          	         	                	

            // Act  
            mockMomentConstr(function(){	     
            	actual = targetService.parseDateTime("", targetDateTimeFormat, targetLocale);            	
            });

            // Assert
            Assert.Equal(expected, actual);
        }    
    	
    	[Fact]
        function InValidFormat(){    		
            // Arrange    		
            var expected = null;                        
            var actual;                                   	        		        	        
        	        	
            // Act          	
            mockMomentConstr(function(){	
            	mockGetNormalizedFormat(function(){
            		mockGetNormalizedLangLocale(function(){
            			actual = targetService.parseDateTime(targetDateTime, "", targetLocale);
            		});
            	});
    		});            

            // Assert
            Assert.Equal(expected, actual);
        }
    	
    	[Fact]
        function InValidDateTime(){    		
            // Arrange    		
            var expected = null;                        
            var actual;                                   	        		        	        
        	        	
            // Act          	
            mockMomentConstr(function(){	
            	mockGetNormalizedFormat(function(){
            		mockGetNormalizedLangLocale(function(){
            			actual = targetService.parseDateTime(targetDateTime, targetDateTimeFormat, "");
            		});
            	});
    		});            

            // Assert
            Assert.Equal(expected, actual);
        }    	    	
    	
    	[Fact]
        function ValidDateTime(){    		
            // Arrange    		
            var expected = targetDateTime;                        
            var actual;                      	                	        	        	        	

            // Act          	
            mockMomentConstr(function(){	
            	mockGetNormalizedFormat(function(){
            		mockGetNormalizedLangLocale(function(){
            			actual = targetService.parseDateTime(targetDateTime, targetDateTimeFormat, targetLocale);
            		});
            	});
    		});            

            // Assert
            Assert.Equal(expected, actual);
        }    	    	    	
    }
    
    [Fixture]
    function parseDateTimeUTC(){
    	
    	var mockMoment = Mocks.GetMock(Object.Global(), "moment", {				
    		utc:function(dateTimeString, format, locale){
    			if(dateTimeString == mockDateTime && format == targetDateTimeFormat && locale == targetLocale) return mockDateTime;		
        		return mockInvalidDate;
    		}
    	});	
    	    			
    	[Fact]
        function InvalidDateTimeString(){    		
            // Arrange    		
            var expected = null;                        
            var actual;                          	         	                	

            // Act  
            mockMoment(function(){	 
            	mockGetNormalizedFormat(function(){
            		mockGetNormalizedLangLocale(function(){            
        				actual = targetService.parseDateTimeUTC("", targetDateTimeFormat, targetLocale);    
            		});
            	});
            });

            // Assert
            Assert.Equal(expected, actual);
        }    
    	
    	[Fact]
        function InvalidFormat(){    		
            // Arrange    		
            var expected = null;                        
            var actual;                          	         	                	

            // Act  
            mockMoment(function(){	    
            	mockGetNormalizedFormat(function(){
            		mockGetNormalizedLangLocale(function(){
            			actual = targetService.parseDateTimeUTC(targetDateTime, "", targetLocale);   
            		});
            	});
            });

            // Assert
            Assert.Equal(expected, actual);
        }        	    	
    	
    	[Fact]
        function InValidDateTime(){    		
            // Arrange    		
            var expected = null;                        
            var actual;                                   	        		        	        
        	        	
            // Act          	
            mockMoment(function(){	
            	mockGetNormalizedFormat(function(){
            		mockGetNormalizedLangLocale(function(){
            			actual = targetService.parseDateTimeUTC(targetDateTime, targetDateTimeFormat, "");
            		});
            	});
    		});            

            // Assert
            Assert.Equal(expected, actual);
        }    	
    	
    	[Fact]
        function ValidDateTime(){    		
            // Arrange    		
            var expected = targetDateTime;                        
            var actual;                      	                	        	        	        	

            // Act          	
            mockMoment(function(){	
            	mockGetNormalizedFormat(function(){
            		mockGetNormalizedLangLocale(function(){
            			actual = targetService.parseDateTimeUTC(targetDateTime, targetDateTimeFormat, targetLocale);
            		});
            	});
    		});            

            // Assert
            Assert.Equal(expected, actual);
        }    	    	    	
    }
    
    [Fixture]
    function UTCToWallTime(){
    	
    	var actual;     	    	
    	
    	var callback = function(dateObj){
    		actual = dateObj.toString();
    	};
    	
    	var mockGetWallTimeFromUTC = Mocks.GetMock(targetService, "getWallTimeFromUTC", function(dateObj, timezone){                                        		
    		if(dateObj == mockDateTime) return dateObj;
    		
        });	
    	    	    			
    	[Fact]
        function DateTimeInGMT(){    		
            // Arrange    		    		
            var expected = targetDateTime;                        
                                     	         	                	
            // Act  	             	        
			targetService.UTCToWallTime(mockDateTime, "GMT", callback);                		            

            // Assert
            Assert.Equal(expected, actual);
        }
    	
    	[Fact]
        function GetDefaultTimezone(){    		
            // Arrange    		    		
            var expected = targetDateTime;  
            
            var mockUtil = Mocks.GetMock(Object.Global(), "$A", {                                
        		getGlobalValueProviders:function() {   
        			return {
        				get:function(value){		
        					if(value == "$Locale.timezone") return "UTC";
        				}
        			};            		            
                }
            });            																																	
                                                 	         	                	
            // Act  
            mockUtil(function(){	            	
				targetService.UTCToWallTime(mockDateTime, "", callback);        		
            });

            // Assert
            Assert.Equal(expected, actual);
        } 
    	
    	[Fact]
        function TimezoneInfoAlreadyLoaded(){    		
            // Arrange    		    		
            var expected = targetDateTime;       
                                     	         	                	
            // Act                  
        	mockWallTime(function(){            		
    			mockGetWallTimeFromUTC(function(){
    				targetService.UTCToWallTime(mockDateTime, targetTimezone, callback);
    			});            	
        	});            

            // Assert
            Assert.Equal(expected, actual);
        }    
    
    	[Fact]
        function LoadTimezoneInfo(){    		
            // Arrange    		    		
            var expected = targetDateTime;                       
                                     	         	                	
            // Act              
        	mockWallTime(function(){  
        		mockGetTimeZoneInfo(function(){
            		mockGetWallTimeFromUTC(function(){	            			
        				targetService.UTCToWallTime(mockDateTime, "EST", callback);	            			
            		});
        		});
        	});            

            // Assert
            Assert.Equal(expected, actual);
        }      	
    }
    
    [Fixture]
    function WallTimeToUTC(){
    	
    	var actual;     	    	
    	
    	var callback = function(dateObj){
    		actual = dateObj.toString();
    	};
    	
    	var mockGetUTCFromWallTime = Mocks.GetMock(targetService, "getUTCFromWallTime", function(dateObj, timezone){                                        		
    		if(dateObj == mockDateTime) return dateObj;
    		
        });	
    	    	    			
    	[Fact]
        function DateTimeInGMT(){    		
            // Arrange    		    		
            var expected = targetDateTime;                        
                                     	         	                	
            // Act  	             	        
			targetService.WallTimeToUTC(mockDateTime, "GMT", callback);                		            

            // Assert
            Assert.Equal(expected, actual);
        }
    	
    	[Fact]
        function GetDefaultTimezone(){    		
            // Arrange    		    		
            var expected = targetDateTime;  
            
            var mockUtil = Mocks.GetMock(Object.Global(), "$A", {                                
        		getGlobalValueProviders:function() {   
        			return {
        				get:function(value){		
        					if(value == "$Locale.timezone") return "UTC";
        				}
        			};            		            
                }
            });            																																	
                                                 	         	                	
            // Act  
            mockUtil(function(){	            	
				targetService.WallTimeToUTC(mockDateTime, "", callback);        		
            });

            // Assert
            Assert.Equal(expected, actual);
        } 
    	
    	[Fact]
        function TimezoneInfoAlreadyLoaded(){    		
            // Arrange    		    		
            var expected = targetDateTime;                   
                                     	         	                	
            // Act                  
        	mockWallTime(function(){            		
        		mockGetUTCFromWallTime(function(){
    				targetService.WallTimeToUTC(mockDateTime, targetTimezone, callback);
    			});            	
        	});            

            // Assert
            Assert.Equal(expected, actual);
        }    
    
    	[Fact]
        function LoadTimezoneInfo(){    		
            // Arrange    		    		
            var expected = targetDateTime;                       
                                     	         	                	
            // Act              
        	mockWallTime(function(){  
        		mockGetTimeZoneInfo(function(){
        			mockGetUTCFromWallTime(function(){	            			
        				targetService.WallTimeToUTC(mockDateTime, "EST", callback);	            			
            		});
        		});
        	});            

            // Assert
            Assert.Equal(expected, actual);
        }      	
    }
    
    [Fixture]
    function displayDateTime(){
    	    	     	        	    	
    	var targetFormat = "format";
    	var targetLang = "lang";    	    	                             
    	
    	var targetDateTimeObj={ 
    		l:'',
    		f:'',
			lang:function(lang){	
				if(lang == targetLang) this.l = lang; 				
			},
			format:function(format){				
				if(format == targetFormat) this.f = format + this.l;
				return this.f;
			}
		};  
    	    	    			
    	[Fact]
        function InvalidLocale(){    		
            // Arrange    		    		
            var expected = targetFormat;    
            var actual;
                                     	         	                	
            // Act  	
            mockGetNormalizedFormat(function(){
            	actual = targetService.displayDateTime(targetDateTimeObj, targetFormat, '');
            });

            // Assert
            Assert.Equal(expected, actual);
        }
    	
    	[Fact]
        function validFormatAndLocale(){    		
            // Arrange    		    		
            var expected = targetFormat+targetLang;    
            var actual;
                                     	         	                	
            // Act  	
            mockGetNormalizedLangLocale(function(){
            	mockGetNormalizedFormat(function(){
            		actual = targetService.displayDateTime(targetDateTimeObj, targetFormat, targetLang);
            	});
            });

            // Assert
            Assert.Equal(expected, actual);
        }
    }
    
    [Fixture]
    function getNormalizedFormat(){
    	    	     	        	    	
    	var targetFormat = "DDMMYYYY";        	    	    	    	
    	    	    			
    	[Fact]
        function inValidFormat(){    		
            // Arrange    		    		
            var expected = "";    
            var actual;
                                     	         	                	
            // Act  	            
            actual = targetService.getNormalizedFormat("");            

            // Assert
            Assert.Equal(expected, actual);
        }
    	
    	[Fact]
        function cacheHit(){    		
            // Arrange    		    		
            var expected = targetFormat;    
            var actual;
            
            var mockCache = Mocks.GetMock(targetService, "cache", {                                        		
	            format: {
	    			DDMMYYYY:targetFormat
	    		}
            });
                                     	         	                	
            // Act  	
            mockCache(function(){
            	actual = targetService.getNormalizedFormat(targetFormat);
            });

            // Assert
            Assert.Equal(expected, actual);
        }  
    	
    	[Fact]
        function cacheMiss(){    		
            // Arrange    		    		
            var expected = targetFormat;    
            var actual;
            
            var mockCache = Mocks.GetMock(targetService, "cache", {                                
        		format: {
        			ddMMyyyy:false
        		}
            });
                                     	         	                	
            // Act  	
            mockCache(function(){
            	actual = targetService.getNormalizedFormat("ddMMyyyy");
            });

            // Assert
            Assert.Equal(expected, actual);
        }      	
    }
    
    [Fixture]
    function getNormalizedLangLocale(){
    	    	     	        	    	    	        	    	    	    	    	    	    			
    	[Fact]
        function inValidFormat(){    		
            // Arrange    		    		
            var expected = "";    
            var actual;
                                     	         	                	
            // Act  	            
            actual = targetService.getNormalizedLangLocale("");            

            // Assert
            Assert.Equal(expected, actual);
        }
    	
    	[Fact]
        function cacheHit(){    		
            // Arrange    		    		
            var expected = targetLocale;    
            var actual;
            
            var mockCache = Mocks.GetMock(targetService, "cache", {                                        		
            	langLocale: {
	    			en:targetLocale
	    		}
            });
                                     	         	                	
            // Act  	
            mockCache(function(){
            	actual = targetService.getNormalizedLangLocale(targetLocale);
            });

            // Assert
            Assert.Equal(expected, actual);
        }  
    	
    	[Fact]
        function cacheMiss(){    		
            // Arrange    		    		
            var expected = targetLocale;    
            var actual;
            
            var mockCache = Mocks.GetMock(targetService, "cache", {                                
            	langLocale: {
        			en:false
        		}
            });
            
            var mockUtil = Mocks.GetMock(Object.Global(), "$A", {                                
				util: {   					
	            	isEmpty: function() { return true; }	            	
	            }
	        });
                                     	         	                	
            // Act  	
            mockCache(function(){
            	mockUtil(function(){
            		mockMoment(function(){
            			actual = targetService.getNormalizedLangLocale(targetLocale);
            		});
            	});
            });

            // Assert
            Assert.Equal(expected, actual);
        }  
    	
    	[Fact]
        function cacheMissInvalidLang(){    		
            // Arrange    		    		
            var expected = targetLocale;    
            var actual;
            
            var mockCache = Mocks.GetMock(targetService, "cache", {                                
            	langLocale: {
        			en:false
        		}
            });
            
            var mockUtil = Mocks.GetMock(Object.Global(), "$A", {                                
				util: {   					
	            	isEmpty: function() { return true; }	            	
	            }
	        });
                                     	         	                	
            // Act  	
            mockCache(function(){
            	mockUtil(function(){
            		mockMoment(function(){
            			actual = targetService.getNormalizedLangLocale("xx");
            		});
            	});
            });

            // Assert
            Assert.Equal(expected, actual);
        }  
    	
    	[Fact]
        function cacheMissCompoundLang(){    		
            // Arrange    		    		
            var expected = "zh-cn";    
            var actual;
            
            var mockCache = Mocks.GetMock(targetService, "cache", {                                
            	langLocale: {
        			en:false
        		}
            });
            
            var mockUtil = Mocks.GetMock(Object.Global(), "$A", {                                
				util: {   					
	            	isEmpty: function() { return false; }	            	
	            }
	        });
                                     	         	                	
            // Act  	
            mockCache(function(){
            	mockUtil(function(){
            		mockMoment(function(){
            			actual = targetService.getNormalizedLangLocale("ZH_CN");
            		});
            	});
            });

            // Assert
            Assert.Equal(expected, actual);
        }  
    	
    	[Fact]
        function cacheMissInvalidCompoundLang(){    		
            // Arrange    		    		
            var expected = targetLocale;    
            var actual;
            
            var mockCache = Mocks.GetMock(targetService, "cache", {                                
            	langLocale: {
        			en:false
        		}
            });
            
            var mockUtil = Mocks.GetMock(Object.Global(), "$A", {                                
				util: {   					
	            	isEmpty: function() { return false; }	            	
	            }
	        });
                                     	         	                	
            // Act  	
            mockCache(function(){
            	mockUtil(function(){
            		mockMoment(function(){
            			actual = targetService.getNormalizedLangLocale("xx_ca");
            		});
            	});
            });

            // Assert
            Assert.Equal(expected, actual);
        }  
    	
    	[Fact]
        function cacheMissInvalidCompoundCountry(){    		
            // Arrange    		    		
            var expected = targetLocale;    
            var actual;
            
            var mockCache = Mocks.GetMock(targetService, "cache", {                                
            	langLocale: {
        			en:false
        		}
            });
            
            var mockUtil = Mocks.GetMock(Object.Global(), "$A", {                                
				util: {   					
	            	isEmpty: function() { return false; }	            	
	            }
	        });
                                     	         	                	
            // Act  	
            mockCache(function(){
            	mockUtil(function(){
            		mockMoment(function(){
            			actual = targetService.getNormalizedLangLocale("en_xx");
            		});
            	});
            });

            // Assert
            Assert.Equal(expected, actual);
        }      	
    }
    
    [Fixture]
    function getTimeZoneInfo(){	
    	
    	[Fact]
        function callbackGetsCalled(){
        	// Arrange
        	var expected = "called";
        	var actual;      
        	
        	var targetCallback = function(){
        		actual = "called";
        	};         	        	
        	
        	var mockEnqueuedAction={
    			getState:function(){
    				return "FAILURE";
    			}
        	};        	
        	
        	var mockAction={
    			timezoneId:'',
        		setParams:function(id){					
        			if(id == targetTimezone)this.timezoneId = id;
				},
				setCallback:function(service, callback){
					callback(mockEnqueuedAction);
				}					
        	};        	
        	        	        															
			var mockUtil = Mocks.GetMock(Object.Global(), "$A", {
				get:function(expression){					
					if(expression=="c.aura://TimeZoneInfoController.getTimeZoneInfo") return mockAction;
				},
                enqueueAction: function(a) { if(a != mockAction) throw new Error("Wrong Action enqueued"); }                	                
            });												
			
			mockUtil(function(){				
				targetService.getTimeZoneInfo(targetTimezone, targetCallback);				
			});

            // Assert
            Assert.Equal(expected, actual);            
        }
			
        [Fact]
        function SuccessWithWalltimeInitialized(){
        	// Arrange
        	var expected = "called";
        	var actual;      
        	
        	var targetCallback = function(){
        		actual = "called";
        	}; 
        	
        	var mockWalltimeData = {
				rules: 'ru',
	    		zones: 'zo'
			}
        	
        	var mockEnqueuedAction={
    			getState:function(){
    				return "SUCCESS";
    			},
        		returnValue : mockWalltimeData
        	};        	
        	
        	var mockAction={
    			timezoneId:'',
        		setParams:function(id){					
        			if(id == targetTimezone)this.timezoneId = id;
				},
				setCallback:function(service, callback){
					callback(mockEnqueuedAction);
				}					
        	};        	
        	        	        															
			var mockUtil = Mocks.GetMock(Object.Global(), "$A", {
				get:function(expression){					
					if(expression=="c.aura://TimeZoneInfoController.getTimeZoneInfo") return mockAction;
				},
                enqueueAction: function(a) { if(a != mockAction) throw new Error("Wrong Action enqueued"); }                	                
            });						
			
			var mockWallTime = Mocks.GetMock(Object.Global(), "WallTime",{
		    	data: '',
		    	zones: true,
		    	addRulesZones : function(a, b){
		    		if(a != 'ru' && b != 'zo') throw new Error("Wrong arguments in walltime.addRulesZones a:" + a + ", b:" + b );
    			},
		    	autoinit: '',
		    	init: function(a, b){
		    		if(this.autoinit == false) throw new Error("walltime.autoinit is not set to true");
		    		if(a != 'ru' && b != 'zo') throw new Error("Wrong arguments in walltime.init a:" + a + ", b:" + b );
		    	}
			});				
			
			mockUtil(function(){
				mockWallTime(function(){
					targetService.getTimeZoneInfo(targetTimezone, targetCallback);
				});
			});

            // Assert
            Assert.Equal(expected, actual);            
        }
        
        [Fact]
        function SuccessWithWalltimeNotInitialized(){
        	// Arrange
        	var expected = "called";
        	var actual;      
        	
        	var targetCallback = function(){
        		actual = "called";
        	}; 
        	
        	var mockWalltimeData = {
				rules: 'ru',
	    		zones: 'zo'
			}
        	
        	var mockEnqueuedAction={
    			getState:function(){
    				return "SUCCESS";
    			},
        		returnValue : mockWalltimeData
        	};        	
        	
        	var mockAction={
    			timezoneId:'',
        		setParams:function(id){					
        			if(id == targetTimezone)this.timezoneId = id;
				},
				setCallback:function(service, callback){
					callback(mockEnqueuedAction);
				}					
        	};        	
        	        	        															
			var mockUtil = Mocks.GetMock(Object.Global(), "$A", {
				get:function(expression){					
					if(expression=="c.aura://TimeZoneInfoController.getTimeZoneInfo") return mockAction;
				},
                enqueueAction: function(a) { if(a != mockAction) throw new Error("Wrong Action enqueued"); }                	                
            });						
			
			var mockWallTime = Mocks.GetMock(Object.Global(), "WallTime",{
		    	data: '',
		    	zones: false,
		    	addRulesZones : function(a, b){
		    		if(a != 'ru' && b != 'zo') throw new Error("Wrong arguments in walltime.addRulesZones a:" + a + ", b:" + b );
    			},
		    	autoinit: '',
		    	init: function(a, b){
		    		if(this.autoinit == false) throw new Error("walltime.autoinit is not set to true");
		    		if(a != 'ru' && b != 'zo') throw new Error("Wrong arguments in walltime.init a:" + a + ", b:" + b );
		    	}
			});				
			
			mockUtil(function(){
				mockWallTime(function(){
					targetService.getTimeZoneInfo(targetTimezone, targetCallback);
				});
			});

            // Assert
            Assert.Equal(expected, actual);            
        }                
    }
    
    [Fixture]
    function getUTCFromWallTime(){
    			
    	[Fact]
        function validDateTime(){    		
            // Arrange    		    		
            var expected = targetDateTime;
            var actual;            
            
            var mockWallTime = Mocks.GetMock(Object.Global(), "WallTime",{		    	
		    	WallTimeToUTC : function(timezone, d){
		    		if(timezone == targetTimezone && d == targetDateTime) return targetDateTime;
    			}
			});		
                                     	         	                	
            // Act  	    
            mockWallTime(function(){
            	actual = targetService.getUTCFromWallTime(targetDateTime, targetTimezone);
            });

            // Assert
            Assert.Equal(expected, actual);
        }
    	
    	[Fact]
        function inValidDateTimeDefaultLocale(){    		
            // Arrange    		    		
            var expected = targetDateTime;
            var actual;            
            
            var mockWallTime = Mocks.GetMock(Object.Global(), "WallTime",{		    	
		    	WallTimeToUTC : function(timezone, d){
		    		if(timezone == targetTimezone && d == targetDateTime) throw new Error();
    			}
			});		
            
            var mockUtil = Mocks.GetMock(Object.Global(), "$A", {                                
        		getGlobalValueProviders:function() {   
        			return {
        				get:function(value) {        			        						
        					if(value == "$Locale.timezone") return "GMT";
        				}
        			};            		            
                }
            });
                                     	         	                	
            // Act  	    
            mockWallTime(function(){
            	mockUtil(function(){
            		actual = targetService.getUTCFromWallTime(targetDateTime, targetTimezone);            		
            	});
            });

            // Assert
            Assert.Equal(expected, actual);
        }
    	
    	[Fact]
        function inValidDateTimeOtherLocale(){    		
            // Arrange    		    		
            var expected = targetDateTime;
            var actual;            
            
            var mockWallTime = Mocks.GetMock(Object.Global(), "WallTime",{		    	
		    	WallTimeToUTC : function(timezone, d){
		    		if(timezone == "" && d == targetDateTime) throw new Error();
		    		if(timezone == targetTimezone && d == targetDateTime) return targetDateTime;
    			}
			});		
            
            var mockUtil = Mocks.GetMock(Object.Global(), "$A", {                                
        		getGlobalValueProviders:function() {   
        			return {
        				get:function(value) {        			        						
        					if(value == "$Locale.timezone") return targetTimezone;
        				}
        			};            		            
                }
            });
                                     	         	                	
            // Act  	    
            mockWallTime(function(){
            	mockUtil(function(){
            		actual = targetService.getUTCFromWallTime(targetDateTime, "");            		
            	});
            });

            // Assert
            Assert.Equal(expected, actual);
        }
    	
    	[Fact]
        function inValidDateTimeException(){    		
            // Arrange    		    		
            var expected = targetDateTime;
            var actual;            
            
            var mockWallTime = Mocks.GetMock(Object.Global(), "WallTime",{		    	
		    	WallTimeToUTC : function(timezone, d){
		    		if(timezone == "" && d == targetDateTime) throw new Error();
		    		if(timezone == targetTimezone && d == targetDateTime) throw new Error();
    			}
			});		
            
            var mockUtil = Mocks.GetMock(Object.Global(), "$A", {                                
        		getGlobalValueProviders:function() {   
        			return {
        				get:function(value) {        			        						
        					if(value == "$Locale.timezone") return targetTimezone;
        				}
        			};            		            
                }
            });
                                     	         	                	
            // Act  	    
            mockWallTime(function(){
            	mockUtil(function(){
            		actual = targetService.getUTCFromWallTime(targetDateTime, "");            		
            	});
            });

            // Assert
            Assert.Equal(expected, actual);
        }
    }
    
    
    [Fixture]
    function getWallTimeFromUTC(){
    			
    	[Fact]
        function validDateTime(){    		
            // Arrange    		    		
            var expected = targetDateTime;
            var actual;
            
            var mockTime ={
        		wallTime : targetDateTime
            };
            
            var mockWallTime = Mocks.GetMock(Object.Global(), "WallTime",{		    	
            	UTCToWallTime : function(d, timezone){
		    		if(timezone == targetTimezone && d == targetDateTime) return mockTime;
    			}
			});		
                                     	         	                	
            // Act  	    
            mockWallTime(function(){
            	actual = targetService.getWallTimeFromUTC(targetDateTime, targetTimezone);
            });

            // Assert
            Assert.Equal(expected, actual);
        }
    	
    	[Fact]
        function inValidDateTimeDefaultLocale(){    		
            // Arrange    		    		
            var expected = targetDateTime;
            var actual;                        
            
            var mockWallTime = Mocks.GetMock(Object.Global(), "WallTime",{		    	
            	UTCToWallTime : function(d, timezone){
		    		if(timezone == targetTimezone && d == targetDateTime) throw new Error();
    			}
			});		
            
            var mockUtil = Mocks.GetMock(Object.Global(), "$A", {                                
        		getGlobalValueProviders:function() {   
        			return {
        				get:function(value) {        			        						
        					if(value == "$Locale.timezone") return "GMT";
        				}
        			};            		            
                }
            });
                                     	         	                	
            // Act  	    
            mockWallTime(function(){
            	mockUtil(function(){
            		actual = targetService.getWallTimeFromUTC(targetDateTime, targetTimezone);
            	});
            });

            // Assert
            Assert.Equal(expected, actual);
        }
    	
    	[Fact]
        function inValidDateTimeOtherLocale(){    		
            // Arrange    		    		
            var expected = targetDateTime;
            var actual;   
            
            var mockTime ={
        		wallTime : targetDateTime
            };
            
            var mockWallTime = Mocks.GetMock(Object.Global(), "WallTime",{		    	
            	UTCToWallTime : function(d, timezone){
		    		if(timezone == "" && d == targetDateTime) throw new Error();
		    		if(timezone == targetTimezone && d == targetDateTime) return mockTime;
    			}
			});		
            
            var mockUtil = Mocks.GetMock(Object.Global(), "$A", {                                
        		getGlobalValueProviders:function() {   
        			return {
        				get:function(value) {        			        						
        					if(value == "$Locale.timezone") return targetTimezone;
        				}
        			};            		            
                }
            });
                                     	         	                	
            // Act  	    
            mockWallTime(function(){
            	mockUtil(function(){
            		actual = targetService.getWallTimeFromUTC(targetDateTime, "");
            	});
            });

            // Assert
            Assert.Equal(expected, actual);
        }
    	
    	[Fact]
        function inValidDateTimeException(){    		
            // Arrange    		    		
            var expected = targetDateTime;
            var actual;                        
            
            var mockWallTime = Mocks.GetMock(Object.Global(), "WallTime",{		    	
            	UTCToWallTime : function(d, timezone){
		    		if(timezone == "" && d == targetDateTime) throw new Error();
		    		if(timezone == targetTimezone && d == targetDateTime) throw new Error();
    			}
			});		
            
            var mockUtil = Mocks.GetMock(Object.Global(), "$A", {                                
        		getGlobalValueProviders:function() {   
        			return {
        				get:function(value) {        			        						
        					if(value == "$Locale.timezone") return targetTimezone;
        				}
        			};            		            
                }
            });
                                     	         	                	
            // Act  	    
            mockWallTime(function(){
            	mockUtil(function(){
            		actual = targetService.getWallTimeFromUTC(targetDateTime, "");
            	});
            });

            // Assert
            Assert.Equal(expected, actual);
        }
    }
    
    [Fixture]
    function init(){
    	
    	[Fact]
        function invalidLangLocale(){    		
            // Arrange    		    		
            var expected = '';                        
            var actual = '';
            
            var mockUtil = Mocks.GetMock(Object.Global(), "$A", {                                
        		getGlobalValueProviders:function() {   
        			return {
        				get:function(value) {        					
        					if(value == "$Locale.langLocale") return '';					
        				}
        			};            		            
                }
            });                       
                                     	         	                	
            // Act  	    
            mockUtil(function(){            	
    			targetService.init();            	
            });

            // Assert
            Assert.Equal(expected, actual);
        }
    	
    	[Fact]
        function validLangLocale(){    		
            // Arrange    		    		
            var expected = targetLocale;                        
            var actual;
            
            var mockUtil = Mocks.GetMock(Object.Global(), "$A", {                                
        		getGlobalValueProviders:function() {   
        			return {
        				get:function(value) {        					
        					if(value == "$Locale.langLocale") return targetLocale;					
        				}
        			};            		            
                }
            });
            
            var mockGetNormalizedLangLocale = Mocks.GetMock(targetService, "getNormalizedLangLocale", function(locale){                                        		
        		if(locale == targetLocale)return locale;        		
            });
        	
        	var mockMoment = Mocks.GetMock(Object.Global(), "moment", {				    		
        		lang:function(value){
        			if(value == targetLocale)actual = value;
        		}
        	});
                                     	         	                	
            // Act  	    
            mockUtil(function(){
            	mockGetNormalizedLangLocale(function(){
            		mockMoment(function(){
            			targetService.init();
            		});
            	});
            });

            // Assert
            Assert.Equal(expected, actual);
        }
    }
}
