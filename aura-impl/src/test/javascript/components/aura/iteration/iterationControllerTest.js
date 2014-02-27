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
Function.RegisterNamespace("Test.Aura.Iteration");

[Fixture]
Test.Aura.Iteration.ControllerTest = function(){
	var targetController;	
	
	// Aura Files need to be loaded as Json, to catch the object they contain
	ImportJson("aura.iteration.iterationController",function(path,result){
		targetController=result;
	});
		
    [Fixture]
    function rangeChange(){    	    	    	        
    	
        [Fact]
        function testRerenderCalled(){
        	// Arrange                	
        	var expected = true;
        	var actual;
        	
        	var targetCmp;
        	var targetEvent;
        	
        	var targetHelper={	
    			rerenderEverything:function(cmp){
    				if(cmp == targetCmp) actual = true;
    			}    			
    		};
        	
        	// Act
			targetController.rangeChange(targetCmp, targetEvent, targetHelper);			
			
			// Assert
			Assert.Equal(expected, actual);			
        }
    }
    
    [Fixture]
    function itemsChange(){  
    	
    	[Fact]
        function testRerenderNotCalled(){
        	// Arrange                	
        	var expected = false;        	
        	var actual;
        	
        	var targetCmp={
    			getValue:function(val){
    				if(val=='v.items') return false;
    			}
        	};
        	
        	var targetEvent={
    			getParam:function(param){
    				if(param=='value') return true;
    			}
        	};
        	
        	var targetHelper={	
    			rerenderEverything:function(cmp){
    				if(cmp == targetCmp) actual = true;
    			}    			
    		};
        	
        	// Act
			targetController.itemsChange(targetCmp, targetEvent, targetHelper);			
			
			// Assert
			Assert.Equal(expected, actual);			
        }
    	
        [Fact]
        function testRerenderCalled(){
        	// Arrange                	
        	var expected = true;        	
        	var actual;
        	
        	var targetCmp={
    			getValue:function(val){
    				if(val=='v.items') return true;
    			}
        	};
        	
        	var targetEvent={
    			getParam:function(param){
    				if(param=='value') return true;
    			}
        	};
        	
        	var targetHelper={	
    			rerenderEverything:function(cmp){
    				if(cmp == targetCmp) actual = true;
    			}    			
    		};
        	
        	// Act
			targetController.itemsChange(targetCmp, targetEvent, targetHelper);			
			
			// Assert
			Assert.Equal(expected, actual);			
        }
    }
    
    [Fixture]
    function firstRender(){  
    	
    	[Fact]
        function testRerenderNotCalled(){
        	// Arrange                	
        	var expected = false;        	
        	var actual;
        	
        	var targetRealBody={
    			unwrap:function(){
    				return [''];
    			}
        	};
        	
        	var targetCmp={
    			getValue:function(val){
    				if(val=='v.realbody') return targetRealBody;
    			}
        	};
        	
        	var targetEvent;
        	
        	var targetHelper={	
    			rerenderEverything:function(cmp){
    				if(cmp == targetCmp) actual = true;
    			}    			
    		};
        	
        	// Act
			targetController.firstRender(targetCmp, targetEvent, targetHelper);			
			
			// Assert
			Assert.Equal(expected, actual);			
        }
    	
    	[Fact]
        function testRerenderCalled(){
        	// Arrange                	
        	var expected = true;        	
        	var actual;
        	
        	var targetRealBody={
    			unwrap:function(){
    				return [];
    			}
        	};
        	
        	var targetCmp={
    			getValue:function(val){
    				if(val=='v.realbody') return targetRealBody;
    			}
        	};
        	
        	var targetEvent;
        	
        	var targetHelper={	
    			rerenderEverything:function(cmp){
    				if(cmp == targetCmp) actual = true;
    			}    			
    		};
        	
        	// Act
			targetController.firstRender(targetCmp, targetEvent, targetHelper);			
			
			// Assert
			Assert.Equal(expected, actual);			
        }
    }
}