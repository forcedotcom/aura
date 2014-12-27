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
    function removeEventHandlers(){    	    	    	        
    	    	    	    	    	
        [Fact]
        function noAttribute(){
        	// Arrange     
        	var expected = undefined;               	
        	
        	var targetElement={
    			attributes: ''
    		}; 
        	
            // Act            				
			var actual = targetHelper.removeEventHandlers(targetElement);				

            // Assert
            Assert.Equal(expected, actual); 
            Assert.Equal('', targetElement.attributes);
        }
        
        [Fact]
        function IEAndAttributeNotSpecified(){
        	// Arrange     
        	var expected = undefined;  
        	var actual;
        	
        	var targetAttribute={
    			specified: false,
    			nodeName: '',
    			nodeValue: ''
    		}; 
        	
        	var targetElement={
    			attributes: [targetAttribute]
    		}; 
        	
			var mockUtil = Mocks.GetMock(Object.Global(), "$A", {                                
				util: {   
					isIE: true 
	            }
	        });												
						
            // Act
            mockUtil(function(){					
            	actual = targetHelper.removeEventHandlers(targetElement);
			});	

            // Assert
            Assert.Equal(expected, actual); 
            Assert.Equal(targetAttribute, targetElement.attributes[0]);            
        }
        
        [Fact]
        function foundEvent(){
        	// Arrange     
        	var expected = undefined;    
        	var actual
        	
        	var targetAttribute={
    			specified: true,
    			nodeName: 'onFocus',
    			nodeValue: 'attack'
    		}; 
        	
        	var targetElement={
    			attributes: [targetAttribute]
    		}; 
        	
			var mockUtil = Mocks.GetMock(Object.Global(), "$A", {                                
				util: {   
					isIE: false 
	            }
	        });												
						
            // Act
            mockUtil(function(){					
            	actual = targetHelper.removeEventHandlers(targetElement);
			});	

            // Assert
            Assert.Equal(expected, actual); 
            Assert.Equal(targetAttribute, targetElement.attributes[0]);   
            Assert.Equal(null, targetAttribute.nodeValue);
        }
    }
	
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
        	
			var mockUtil = Mocks.GetMock(Object.Global(), "$A", {                                
				util: {   
					isUndefinedOrNull: function(value) { return true; },
					isEmpty: function(value) { return false; }	  
	            }
	        });												
						
            // Act
            mockUtil(function(){					
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
    	
			var mockUtil = Mocks.GetMock(Object.Global(), "$A", {                                
				util: {   
					isUndefinedOrNull: function(value) { return false; },
					isEmpty: function(value) { return true; }
	            }
	        });												
						
            // Act
            mockUtil(function(){					
				targetHelper.validate(targetComponent);
			});	

            // Assert
            Assert.Equal(expected, targetComponent.value);            
        }
                
        [Fact]
        function valueWithDefaultTags(){
        	// Arrange    
        	var expected = 'value:form,input,button,img,div,span,ol,li,p,ul,a,h1,h2,h3,b,i,strong,em,u,s,sub,sup,blockquote,pre,big,' +
        				   'small,tt,code,kbd,samp,var,del,ins,cite,q,table,tr,td,caption,thead,th,tbody,tfoot,hr,object,param,' +
        				   'embed,iframe';  
        	
        	var targetComponent={
        		value : 'value',	
    			get:function(attribute){
    				if(attribute=="v.value") return this.value;
    				if(attribute=="v.supportedTags") return null;
    			},
    			set:function(attribute, val){
    				if(attribute=="v.value") this.value = val;
    			}
    		};           	             	    
        	
        	var mockDiv = {				
    			innerHTML:''				
    		};
        	
        	var mockDocument = Mocks.GetMock(Object.Global(), "document", {				
    			createElement:function(value){
    				if(value == 'div') return mockDiv;
    			}
    		});
    			        	
        	var mockHelper =  Mocks.GetMock(targetHelper, "validateElement", function(element, tags){
        		if(element == mockDiv) element.innerHTML = element.innerHTML + ":" + tags; 
			});         
        	        	    	
			var mockUtil = Mocks.GetMock(Object.Global(), "$A", {                                
				util: {   
					isUndefinedOrNull: function(value) { return false; },
					isEmpty: function(value) { return false; },					
					removeElement: function(element) { 
						if(element != mockDiv) throw new Error("Wrong Element, expected div"); 
					}
	            }
	        });												
						
            // Act
            mockUtil(function(){		
            	mockHelper(function(){            
	            	mockDocument(function(){	    				
    					targetHelper.validate(targetComponent);	    				
	            	});
            	});
            });

            // Assert
            Assert.Equal(expected, targetComponent.value);            
        }
        
        [Fact]
        function valueWithBadTag(){
        	// Arrange    
        	var expected = 'value';  
        	
        	var targetComponent={
        		value : 'value<script>',	
    			get:function(attribute){
    				if(attribute=="v.value") return this.value;
    				if(attribute=="v.supportedTags") return null;
    			},
    			set:function(attribute, val){
    				if(attribute=="v.value") this.value = val;
    			}
    		};           	        	    	    
        	
        	var mockDiv = {				
    			innerHTML:''
    		};
        	
        	var mockDocument = Mocks.GetMock(Object.Global(), "document", {				
    			createElement:function(value){
    				if(value == 'div') return mockDiv;
    			}
    		});
    			        	
        	var mockHelper =  Mocks.GetMock(targetHelper, "validateElement", function(element, tags){
        		if(element == mockDiv){					
        			mockDiv.innerHTML = mockDiv.innerHTML.replace('<script>', '');					
				}			
			});         
        	        	    	
			var mockUtil = Mocks.GetMock(Object.Global(), "$A", {                                
				util: {   
					isUndefinedOrNull: function(value) { return false; },
					isEmpty: function(value) { return false; },					
					removeElement: function(element) { 
						if(element != mockDiv) throw new Error("Wrong Element, expected div"); 
					}
	            }
	        });												
						
            // Act
            mockUtil(function(){		
            	mockHelper(function(){            
	            	mockDocument(function(){	    				
    					targetHelper.validate(targetComponent);	    				
	            	});
            	});
            });

            // Assert
            Assert.Equal(expected, targetComponent.value);            
        }
        
        [Fact]
        function valueWithMixedTags(){
        	// Arrange    
        	var expected = 'value<input>';  
        	
        	var targetComponent={
        		value : 'value<input><script>',	
    			get:function(attribute){
    				if(attribute=="v.value") return this.value;
    				if(attribute=="v.supportedTags") return null;
    			},
    			set:function(attribute, val){
    				if(attribute=="v.value") this.value = val;
    			}
    		};           	        	
        	
        	var mockDiv = {				
    			innerHTML:''
    		};
        	
        	var mockDocument = Mocks.GetMock(Object.Global(), "document", {				
    			createElement:function(value){
    				if(value == 'div') return mockDiv;
    			}
    		});
    			        	
        	var mockHelper =  Mocks.GetMock(targetHelper, "validateElement", function(element, tags){
        		if(element == mockDiv){					
        			mockDiv.innerHTML = mockDiv.innerHTML.replace('<script>', '');					
				}			
			});         
        	        	    	
			var mockUtil = Mocks.GetMock(Object.Global(), "$A", {                                
				util: {   
					isUndefinedOrNull: function(value) { return false; },
					isEmpty: function(value) { return false; },					
					removeElement: function(element) { 
						if(element != mockDiv) throw new Error("Wrong Element, expected div"); 
					}
	            }
	        });												
						
            // Act
            mockUtil(function(){		
            	mockHelper(function(){            
	            	mockDocument(function(){	    				
    					targetHelper.validate(targetComponent);	    				
	            	});
            	});
            });

            // Assert
            Assert.Equal(expected, targetComponent.value);            
        }
        
        [Fact]
        function valueWithCustomTag(){
        	// Arrange    
        	var expected = 'value<script>';  
        	
        	var targetComponent={
        		value : 'value<script>',	
    			get:function(attribute){
    				if(attribute=="v.value") return this.value;
    				if(attribute=="v.supportedTags") return 'script';
    			},
    			set:function(attribute, val){
    				if(attribute=="v.value") this.value = val;
    			}
    		};           	        	  
        	
        	var mockDiv = {				
    			innerHTML:''
    		};
        	
        	var mockDocument = Mocks.GetMock(Object.Global(), "document", {				
    			createElement:function(value){
    				if(value == 'div') return mockDiv;
    			}
    		});
    			        	
        	var mockHelper =  Mocks.GetMock(targetHelper, "validateElement", function(element, tags){
        		if(element != mockDiv || tags[0] != 'script') throw new Error("Wrong Element or suppoprted tags");
			});         
        	        	    	
			var mockUtil = Mocks.GetMock(Object.Global(), "$A", {                                
				util: {   
					isUndefinedOrNull: function(value) { return false; },
					isEmpty: function(value) { return false; },					
					removeElement: function(element) { 
						if(element != mockDiv) throw new Error("Wrong Element, expected div"); 
					}
	            }
	        });												
						
            // Act
            mockUtil(function(){		
            	mockHelper(function(){            
	            	mockDocument(function(){	    				
    					targetHelper.validate(targetComponent);	    				
	            	});
            	});
            });

            // Assert
            Assert.Equal(expected, targetComponent.value);            
        }                
                          
    }
    
    [Fixture]
    function validateElement(){    	    	    	        
    	    	    	    	    	
        [Fact]
        function textElement(){
        	// Arrange     
        	var expected = undefined;       
        	
        	var targetElement={
    			nodeType: 3
    		};           												
						
            // Act            				
			var actual = targetHelper.validateElement(targetElement, '');				

            // Assert
            Assert.Equal(expected, actual);            
        }
        
        [Fact]
        function removeElement(){
        	// Arrange     
        	var expected = 'script';    
        	var actual = '';        	        	
        	
        	var targetElement={
    			nodeType: 1,
    			tagName: 'script'			
    		};          	        	
        	
			var mockUtil = Mocks.GetMock(Object.Global(), "$A", {                                
				util: {   
					removeElement: function(element) { 
						if(element == targetElement) actual = element; 
					}	  
	            }
	        });												
						
            // Act
            mockUtil(function(){					
				targetHelper.validateElement(targetElement, ['input', 'button']);
			});	

            // Assert
            Assert.Equal(expected, actual.tagName);            
        }
        
        [Fact]
        function removeEventsAndValidateChildren(){
        	// Arrange     
        	var expected = 'input';    
        	var actual = '';  
        	var returnVal = '';
        	
        	var childElement={
    			nodeType: 3
    		};  
        	
        	var targetElement={
    			nodeType: 1,
    			tagName: 'input',    			
				childNodes: [childElement]
    		};          	        	        	
        	
        	var mockHelper =  Mocks.GetMock(targetHelper, "removeEventHandlers", function(element){        						
    			 actual = element;				    						
    		});           													
						
            // Act            
        	mockHelper(function(){	
        		returnVal = targetHelper.validateElement(targetElement, ['input', 'button']);
        	});				

            // Assert        	            
            Assert.Equal(expected, actual.tagName);
            Assert.Equal(undefined, returnVal);
        }
                 
    }
    
}