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
	var expectedFormat = "YYYY-MM-DD HH:mm";
	
	var targetEvent={					
	};
	
	var targetHelper={				
	};
	
	// Aura Files need to be loaded as Json, to catch the object they contain
	ImportJson("ui.outputDateTime.outputDateTimeController",function(path,result){
		targetController=result;
	});
	
    [Fixture]
    function doInit(){
        [Fact]
        function FormatGetsChanged(){
        	// Arrange        	        	
			var targetComponent={
				get:function(expression){
					if(expression=="v.format")return "yyyy-MM-dd HH:mm";
				},
				
				setValue:function(expression, value){
					if(expression=="v.format")actualFormat = value;
				}
			};									                        

            // Act
            targetController.doInit(targetComponent, targetEvent, targetHelper);

            // Assert
            Assert.Equal(expectedFormat, actualFormat);
        }
        
        [Fact]
        function FormatStaysSame(){
        	// Arrange        	        	
			var targetComponent={
				get:function(expression){
					if(expression=="v.format")return expectedFormat;
				},
				
				setValue:function(expression, value){
					if(expression=="v.format")actualFormat = value;
				}
			};									                     

            // Act
            targetController.doInit(targetComponent, targetEvent, targetHelper);

            // Assert
            Assert.Equal(expectedFormat, actualFormat);
        }
        
        [Fact]
        function EmptyFormat(){
        	// Arrange
			var targetComponent={
				get:function(expression){
					if(expression=="v.format")return "";
				},
				
				setValue:function(expression, value){
					if(expression=="v.format")actualFormat = value;
				}
			};
									                     
            // Act
            targetController.doInit(targetComponent, targetEvent, targetHelper);

            // Assert
            Assert.Equal(expectedFormat, actualFormat);
        }
                
    }
}