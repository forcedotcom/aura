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
Test.Ui.OutputRichText.RendererTest = function(){

	var targetRenderer;	
	
	// Aura Files need to be loaded as Json, to catch the object they contain
	ImportJson("ui.outputRichText.outputRichTextRenderer",function(path,result){
		targetRenderer=result;
	});
	
    [Fixture]
    function render(){    	    	    	        
    	    	    	    	    	
        [Fact]
        function testRender(){
        	// Arrange             	        	
        	var targetComponent;    	
        	var targetElement;
        	var targetHelper={        		
    			validate:function(cmp){
    				if(cmp!=targetComponent) throw new Error("Wrong Argument");
    			}
    		};   
        	    	    	
        	var mockSuper = Mocks.GetMock(targetRenderer, "superRender", function() {                                
    			return targetElement; 								
            });
        	
        	var expected = targetElement;        											
        	var actual;
        	
            // Act
        	mockSuper(function(){
				actual = targetRenderer.render(targetComponent, targetHelper);
			});

            // Assert
            Assert.Equal(expected, actual);            
        }
    }
    
    [Fixture]
    function rerender(){    	    	    	        
    	    	    	    	    	
        [Fact]
        function testRender(){
        	// Arrange             	        	
        	var targetComponent;    	
        	var targetElement;
        	var targetHelper={        		
    			validate:function(cmp){
    				if(cmp!=targetComponent) throw new Error("Wrong Argument");
    			}
    		};   
        	    	    	
        	var mockSuper = Mocks.GetMock(targetRenderer, "superRerender", function() {                                
    			return targetElement; 								
            });
        	
        	var expected = targetElement;        											
        	var actual;
        	
            // Act
        	mockSuper(function(){
				actual = targetRenderer.rerender(targetComponent, targetHelper);
			});

            // Assert
            Assert.Equal(expected, actual);            
        }
    }
    
}