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

Function.RegisterNamespace("Test.Ui.OutputText");

[Fixture]
Test.Ui.OutputText.HelperTest = function(){
	var targetHelper;	
	
	// Aura Files need to be loaded as Json, to catch the object they contain
	ImportJson("ui.outputText.outputTextHelper",function(path,result){
		targetHelper=result;
	});
	
	[Fixture]
    function appendTextElements(){    	
    	
    	var actual = '';    	
		var targetContainerEl={
			appendChild:function(val){
				actual += val; 
			}								
		};
		
		var mockDocument = Mocks.GetMock(Object.Global(), 'document',{
			createTextNode:function(val){
				return val;
			},
			createElement:function(val){
				return val;
			}
		});
		
		[Fact]
        function testNullElement(){
        	// Arrange
        	var expected = '';
			
            // Act
			mockDocument(function(){
				targetHelper.appendTextElements('1234', null);
			});

            // Assert
            Assert.Equal('', actual);            
        }
		
        [Fact]
        function testSimpleNumber(){
        	// Arrange
        	var targetValue = 1234;
        	var expected = '1234';
        	actual = '';
        	
            // Act
			mockDocument(function(){
				targetHelper.appendTextElements(targetValue, targetContainerEl);
			});

            // Assert
            Assert.Equal(expected, actual);            
        }                
        
        [Fact]
        function testSimpleString(){
        	// Arrange
        	var targetValue = 'Aura';
        	var expected = 'Aura';
			actual = '';
			
            // Act
			mockDocument(function(){
				targetHelper.appendTextElements(targetValue, targetContainerEl);
			});

            // Assert
            Assert.Equal(expected, actual);            
        }
        /*
        [Fact]
        function testTextWithNewLineInbetween(){
        	// Arrange
        	var targetValue = '123\n456';
        	var expected = '123br456';
        	actual = '';
        	
            // Act
			mockDocument(function(){
				targetHelper.appendTextElements(targetValue, targetContainerEl);
			});

            // Assert
            Assert.Equal(expected, actual);            
        }
        
        [Fact]
        function testTextWithNewLineAtEnd(){
        	// Arrange
        	var targetValue = '123456\n';        	        	
        	var expected = '123456br';
        	actual = '';
        	
            // Act
			mockDocument(function(){
				targetHelper.appendTextElements(targetValue, targetContainerEl);
			});

            // Assert
            Assert.Equal(expected, actual);            
        }
        
        [Fact]
        function testTextWithReturnInBegining(){
        	// Arrange
        	var targetValue = '123\r\n456';
        	var expected = '123br456';
        	actual = '';
        	
            // Act
			mockDocument(function(){
				targetHelper.appendTextElements(targetValue, targetContainerEl);
			});

            // Assert
            Assert.Equal(expected, actual);            
        }
        
        [Fact]
        function testTextWithReturnAndNewLine(){
        	// Arrange
        	var targetValue = '\n123\r456\r\n';
        	var expected = 'br123br456br';
        	actual = '';
        	
            // Act
			mockDocument(function(){
				targetHelper.appendTextElements(targetValue, targetContainerEl);
			});

            // Assert
            Assert.Equal(expected, actual);            
        }                
        
        [Fact]
        function testComplexString(){
        	// Arrange
        	var targetValue = '\r\nAura\n\r\n\nRocks\r\n';
        	var expected = 'brAurabrbrbrRocksbr';
			actual = '';
			
            // Act
			mockDocument(function(){
				targetHelper.appendTextElements(targetValue, targetContainerEl);
			});

            // Assert
            Assert.Equal(expected, actual);            
        }
        
        [Fact]
        function testNoText(){
        	// Arrange
        	var targetValue = '\r\n\n\r\n\n\r\n';
        	var expected = 'brbrbrbrbr';
			actual = '';
			
            // Act
			mockDocument(function(){
				targetHelper.appendTextElements(targetValue, targetContainerEl);
			});

            // Assert
            Assert.Equal(expected, actual);            
        }
        */
        
        [Fact]
        function testBoolean(){
        	// Arrange
        	var targetValue = true;
        	var expected = '';
			actual = '';
			
            // Act
			mockDocument(function(){
				targetHelper.appendTextElements(targetValue, targetContainerEl);
			});

            // Assert
            Assert.Equal(expected, actual);            
        }
        
        [Fact]
        function testObject(){
        	// Arrange        	
        	var expected = '';
			actual = '';
			
            // Act
			mockDocument(function(){
				targetHelper.appendTextElements(targetContainerEl, targetContainerEl);
			});

            // Assert
            Assert.Equal(expected, actual);            
        }
        
        [Fact]
        function testSpaces(){
        	// Arrange
        	var targetValue = '  ';
        	var expected = '  ';
			actual = '';
			
            // Act
			mockDocument(function(){
				targetHelper.appendTextElements(targetValue, targetContainerEl);
			});

            // Assert
            Assert.Equal(expected, actual);            
        }
        
        [Fact]
        function testTextWithSpaces(){
        	// Arrange
        	var targetValue = '  ab  ';
        	var expected = '  ab  ';
			actual = '';
			
            // Act
			mockDocument(function(){
				targetHelper.appendTextElements(targetValue, targetContainerEl);
			});

            // Assert
            Assert.Equal(expected, actual);            
        }
	}
	
	[Fixture]
    function removeChildren(){    	
    	
    	var actual = 0;    			    	
				
		var mockContext = Mocks.GetMock(Object.Global(), "$A", {                                
			util: {   
				removeElement: function(el) {
					actual++;
				}            		            
            }
        });				
		
		[Fact]
        function testNullElement(){
        	// Arrange
        	var expected = 0;
        	actual = 0; 
			
            // Act
        	mockContext(function(){
				targetHelper.removeChildren(null);
			});

            // Assert
            Assert.Equal(expected, actual);            
        }
		
		[Fact]
        function testInvalidNodeType(){
        	// Arrange
        	var expected = 0;
        	actual = 0;        	
        	
        	var targetChild1={						
    			nextSibling:null										
    		};
        	
        	var targetEl={
    			nodeType:0,
    			firstChild:targetChild1													
    		};
			
            // Act
        	mockContext(function(){
				targetHelper.removeChildren(targetEl);
			});

            // Assert
            Assert.Equal(expected, actual);            
        }
		
		[Fact]
        function testNoChild(){
        	// Arrange
        	var expected = 0;
        	actual = 0;        	
        	
        	var targetEl={
    			nodeType:1,
    			firstChild:null													
    		};
			
            // Act
        	mockContext(function(){
				targetHelper.removeChildren(targetEl);
			});

            // Assert
            Assert.Equal(expected, actual);            
        }
		
		[Fact]
        function testOneChild(){
        	// Arrange
        	var expected = 1;
        	actual = 0;        	        	
        	
        	var targetChild1={						
    			nextSibling:null										
    		};
        	
        	var targetEl={
    			nodeType:1,
    			firstChild:targetChild1													
    		};
			
            // Act
        	mockContext(function(){
				targetHelper.removeChildren(targetEl);
			});

            // Assert
            Assert.Equal(expected, actual);            
        }
		
		[Fact]
        function testTwoChildren(){
        	// Arrange
        	var expected = 2;
        	actual = 0;
        	
        	var targetChild2={						
    			nextSibling:null										
    		};
        	
        	var targetChild1={						
    			nextSibling:targetChild2										
    		};
        	
        	var targetEl={
    			nodeType:1,
    			firstChild:targetChild1													
    		};
			
            // Act
        	mockContext(function(){
				targetHelper.removeChildren(targetEl);
			});

            // Assert
            Assert.Equal(expected, actual);            
        }
		
		[Fact]
        function testManyChildren(){
        	// Arrange
        	var expected = 4;
        	actual = 0;
        	
        	var targetChild4={						
    			nextSibling:null										
    		};
        	
        	var targetChild3={						
    			nextSibling:targetChild4										
    		};
        	
        	var targetChild2={						
    			nextSibling:targetChild3										
    		};
        	
        	var targetChild1={						
    			nextSibling:targetChild2										
    		};
        	
        	var targetEl={
    			nodeType:1,
    			firstChild:targetChild1													
    		};
			
            // Act
        	mockContext(function(){
				targetHelper.removeChildren(targetEl);
			});

            // Assert
            Assert.Equal(expected, actual);            
        }
	}
	
}