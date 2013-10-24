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
Function.RegisterNamespace("Test.Aura.Util");

[Fixture]
Test.Aura.UtilTest=function(){
	auraMock=function(delegate){
		Mocks.GetMocks(Object.Global(),{
			exp:function() {},
			window:Object.Global(),
			document:{createDocumentFragment:function() {}},
			Json:function() {},
			Transport:function() {},
			Style:function() {},
			Bitset:{},
			NumberFormat:{},			
			$A:{ns:{}},
			navigator:{userAgent:''}
		})(function(){
			// #import aura.util.Util
			delegate();
		});
	}
	
	var targetUtil;
	auraMock(function(){
		targetUtil = new $A.ns.Util();
	});
	
	[Fixture]
	function stripTags(){
		
		var tags = ['script', 'style'];
		
		var mockElement = {
			name: '',	
			parentNode: ''
		};
		
		var mockDiv = {				
			innerHTML:'',
			getElementsByTagName:function(name){							
				mockElement.name = name;
				mockElement.parentNode = this;
											
				var str;
				if(name == 'script'){						
					str = '<script>';
				}
				else{
					str = '<style>';
				}
				var count = 0;								
				var index = this.innerHTML.indexOf(str);
				while(index != -1){
					count++;
					index = this.innerHTML.indexOf(str, index+1);
				}
				
				var arr = new Array();					
				for (var j = 0; j < count; j++){
					arr[j] = mockElement;
				}					
				return arr;				
			},
			removeChild:function(element) {				
				if(element.name == 'script') {
					this.innerHTML = this.innerHTML.replace('<script>', '');
					this.innerHTML = this.innerHTML.replace('</script>', '');
				}
				if(element.name == 'style') {
					this.innerHTML = this.innerHTML.replace('<style>', '');
					this.innerHTML = this.innerHTML.replace('</style>', '');
				}
			}
		};
		
		var mockDocument = Mocks.GetMock(Object.Global(), "document", {				
			createElement:function(value){
				if(value == 'div') return mockDiv;										
			}
		});		
					
		var mockRemoveElement = Mocks.GetMock(targetUtil, "removeElement", function(element){
			if(element != mockDiv) throw new Error("Wrong Element, expected div");
	    });	    
		
		[Fact]
		function undefinedValue(){
			var expected = undefined;  
			var actual = targetUtil.stripTags(undefined, tags);
			
            // Assert
            Assert.Equal(expected, actual); 		
			
		}
		
		[Fact]
		function invalidValue(){
			var expected = undefined;  
			var actual = targetUtil.stripTags('', tags);
			
            // Assert
            Assert.Equal(expected, actual); 					
		}
		
		[Fact]
		function invalidTags(){
			var expected = 'value';  
			var actual;						
												
			mockDocument(function(){
				mockRemoveElement(function(){
					actual = targetUtil.stripTags('value', '');
				});
			});
            // Assert
            Assert.Equal(expected, actual); 					
		}
		
		[Fact]
		function noTags(){
			var expected = 'value';  
			var actual;						
												
			mockDocument(function(){
				mockRemoveElement(function(){
					actual = targetUtil.stripTags('value', tags);
				});
			});
            // Assert
            Assert.Equal(expected, actual); 					
		}		
		
		[Fact]
		function withTags(){
			var expected = 'value';  
			var actual;						
												
			mockDocument(function(){
				mockRemoveElement(function(){
					actual = targetUtil.stripTags('<script>value</script>', tags);
				});
			});
            // Assert
            Assert.Equal(expected, actual); 					
		}
				
		[Fact]
		function withMultipleTags(){
			var expected = 'value';  
			var actual;						
												
			mockDocument(function(){
				mockRemoveElement(function(){
					actual = targetUtil.stripTags('<script></script>value<script></script>', tags);
				});
			});
            // Assert
            Assert.Equal(expected, actual); 					
		}
		
		[Fact]
		function withNestedTags(){
			var expected = 'value';  
			var actual;						
												
			mockDocument(function(){
				mockRemoveElement(function(){
					actual = targetUtil.stripTags('<script><script><style>value</style></script></script>', tags);
				});
			});
            // Assert
            Assert.Equal(expected, actual); 					
		}
		
		[Fact]
		function withMultipleValues(){
			var expected = 'value1 value2 value3';  
			var actual;						
												
			mockDocument(function(){
				mockRemoveElement(function(){
					actual = targetUtil.stripTags('value1 <script><script><style>value2</style></script></script> value3', tags);
				});
			});
            // Assert
            Assert.Equal(expected, actual); 					
		}
	}
}
 