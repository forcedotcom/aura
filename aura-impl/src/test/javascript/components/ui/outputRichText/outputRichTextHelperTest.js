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

Function.RegisterNamespace("Test.Ui.OutputRichText");

[Fixture]
Test.Ui.OutputRichText.HelperTest = function(){

	var targetHelper;	
	
	// Aura Files need to be loaded as Json, to catch the object they contain
	ImportJson("ui.outputRichText.outputRichTextHelper",function(path,result){
		targetHelper=result;
	});
	
    [Fixture]
    function validate(){    	    	    	        
    	    	    	    	    	
        [Fact]
        function valueUndefinedOrNull(){
        	// Arrange     
        	var expected = null;       
        	
        	var targetComponent={
        		value : null,	
    			get:function(attribute){
    				if(attribute=="v.value") return this.value;
    			}
    		};   
        	
			var mockContext = Mocks.GetMock(Object.Global(), "$A", {                                
				util: {   
					isUndefinedOrNull: function(value) { return true; },
					isEmpty: function(value) { return false; }	  
	            }
	        });												
						
            // Act
            mockContext(function(){					
				targetHelper.validate(targetComponent);
			});	

            // Assert
            Assert.Equal(expected, targetComponent.value);            
        }
        
        [Fact]
        function valueEmpty(){
        	// Arrange    
        	var expected = '';  
        	
        	var targetComponent={
        		value : '',	
    			get:function(attribute){
    				if(attribute=="v.value") return this.value;
    			}
    		};   
    	
			var mockContext = Mocks.GetMock(Object.Global(), "$A", {                                
				util: {   
					isUndefinedOrNull: function(value) { return false; },
					isEmpty: function(value) { return true; }
	            }
	        });												
						
            // Act
            mockContext(function(){					
				targetHelper.validate(targetComponent);
			});	

            // Assert
            Assert.Equal(expected, targetComponent.value);            
        }
        
        [Fact]
        function valueWithoutTags(){
        	// Arrange    
        	var expected = 'value';  
        	
        	var targetComponent={
        		value : 'value',	
    			get:function(attribute){
    				if(attribute=="v.value") return this.value;
    			}
    		};   
    	
			var mockContext = Mocks.GetMock(Object.Global(), "$A", {                                
				util: {   
					isUndefinedOrNull: function(value) { return false; },
					isEmpty: function(value) { return false; },
					stripTags: function(value, tag) { return value; }
	            }
	        });												
						
            // Act
            mockContext(function(){					
				targetHelper.validate(targetComponent);
			});	

            // Assert
            Assert.Equal(expected, targetComponent.value);            
        }
        
        [Fact]
        function valueWithTags(){
        	// Arrange    
        	var expected = 'value-script,style';     
        	
        	var targetComponent={
        		value : 'value',	
    			get:function(attribute){
    				if(attribute=="v.value") return this.value;
    			},
    			setValue:function(attribute, val){
    				if(attribute=="v.value") this.value = val;
    			}
    		};   
        	        	
			var mockContext = Mocks.GetMock(Object.Global(), "$A", {                                
				util: {   
					isUndefinedOrNull: function(value) { return false; },
					isEmpty: function(value) { return false; },
					stripTags: function(value, tags) {return value + '-' + tags; }
	            }
	        });	
															
            // Act
            mockContext(function(){		            	
            		targetHelper.validate(targetComponent);            	
			});	

            // Assert
            Assert.Equal(expected, targetComponent.value);            
        }
        
    }
    
}