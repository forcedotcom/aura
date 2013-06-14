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
Test.Ui.OutputDateTime.ControllerTest = function(){
	var targetController;	
	
	var targetEvent={					
	};
	
	var targetHelper={				
	};
	
	// Aura Files need to be loaded as Json, to catch the object they contain
	ImportJson("ui.outputDateTime.outputDateTimeController",function(path,result){
		targetController=result;
	});
	
	var mockContext = Mocks.GetMock(Object.Global(), "$A", {                
		getGlobalValueProviders: function(){
			return {
				get: function(expression){			
					if(expression=="$Locale.datetimeformat")return "YYYY-MM-DD HH:mm";
					if(expression=="$Locale.langLocale")return "en";
					if(expression=="$Locale.timezone")return "GMT";
				}
			}
        }
    });
	
    [Fixture]
    function doInit(){    	
    	[Fact]
        function EmptyFormat(){
        	// Arrange
        	var expected = "YYYY-MM-DD HH:mm";
        	var actual;
			var targetComponent={
				get:function(expression){
					if(expression=="v.format")return "";
				},
				
				setValue:function(expression, value){
					if(expression=="v.format")actual = value;
				}
			};
									                     
            // Act
			mockContext(function(){
				targetController.doInit(targetComponent, targetEvent, targetHelper);
			});

            // Assert
            Assert.Equal(expected, actual);
        }
    	
    	[Fact]
        function ValidFormat(){
        	// Arrange
        	var expected = "YYYY-MM-DD HH:mm";
        	var actual;
			var targetComponent={
				get:function(expression){
					if(expression=="v.format")return expected;
				},
				
				setValue:function(expression, value){
					if(expression=="v.format")actual = value;
				}
			};
									                     
            // Act
			mockContext(function(){
				targetController.doInit(targetComponent, targetEvent, targetHelper);
			});

            // Assert
            Assert.Equal(expected, actual);
        }
    	
    	[Fact]
        function EmptyLangLocale(){
        	// Arrange
        	var expected = "en";
        	var actual;
			var targetComponent={
				get:function(expression){
					if(expression=="v.langLocale")return "";
				},
				
				setValue:function(expression, value){
					if(expression=="v.langLocale")actual = value;
				}
			};
									                     
            // Act
			mockContext(function(){
				targetController.doInit(targetComponent, targetEvent, targetHelper);
			});

            // Assert
            Assert.Equal(expected, actual);
        }
    	
    	[Fact]
        function ValidLangLocale(){
        	// Arrange
        	var expected = "en";
        	var actual;
			var targetComponent={
				get:function(expression){
					if(expression=="v.langLocale")return expected;
				},
				
				setValue:function(expression, value){
					if(expression=="v.langLocale")actual = value;
				}
			};
									                     
            // Act
			mockContext(function(){
				targetController.doInit(targetComponent, targetEvent, targetHelper);
			});

            // Assert
            Assert.Equal(expected, actual);
        }
    	
    	[Fact]
        function EmptyTimeZone(){
        	// Arrange
        	var expected = "GMT";
        	var actual;
			var targetComponent={
				get:function(expression){
					if(expression=="v.timezone")return "";
				},
				
				setValue:function(expression, value){
					if(expression=="v.timezone")actual = value;
				}
			};
									                     
            // Act
			mockContext(function(){
				targetController.doInit(targetComponent, targetEvent, targetHelper);
			});

            // Assert
            Assert.Equal(expected, actual);
        }
    	
    	[Fact]
        function ValidTimeZone(){
        	// Arrange
        	var expected = "GMT";
        	var actual;
			var targetComponent={
				get:function(expression){
					if(expression=="v.timezone")return expected;
				},
				
				setValue:function(expression, value){
					if(expression=="v.timezone")actual = value;
				}
			};
									                     
            // Act
			mockContext(function(){
				targetController.doInit(targetComponent, targetEvent, targetHelper);
			});

            // Assert
            Assert.Equal(expected, actual);
        }
    }    	
}