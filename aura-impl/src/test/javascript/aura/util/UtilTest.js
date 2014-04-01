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
	var auraMock=function(delegate){
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
	
	[Fixture]
	function isIE(){
		var auraMockCustomUserAgent=function(delegate, userAgentOverride){
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
				navigator:{userAgent : userAgentOverride }
			})(function(){
				// #import aura.util.Util
				delegate();
			});
		}
		
		[Fact]
		function IE11UserAgentReturnsTrue(){
			//Arrange
			var actual;
			var userAgent = "Mozilla/5.0 (Windows NT 6.3; WOW64; Trident/7.0; .NET4.0E; .NET4.0C; rv:11.0) like Gecko";
			
			//Act
			auraMockCustomUserAgent(function(){
				var targetUtil = new $A.ns.Util();
				actual = targetUtil.isIE; 
			}, userAgent);
			
			// Assert
			Assert.True(actual);
		}
		
		[Fact]
		function ChromeUserAgentReturnsFalse(){
			//Arrange
			var actual;
			var userAgent = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/31.0.1650.63 Safari/537.36";
			
			//Act
			auraMockCustomUserAgent(function(){
				var targetUtil = new $A.ns.Util();
				actual = targetUtil.isIE; 
			}, userAgent);
			
			// Assert
			Assert.False(actual);
		}
	}

    [Fixture]
    function merge() {
        [Fact]
        function testMerge() {
            auraMock(function() {
                var util = new $A.ns.Util(),
                    array1 = [0, 1],
                    array2 = [2, 3, 4],
                    array3 = [5, 6, 7, 8],
                    i = 0;
                
                // Merge arrays into array1 and test:
                util.merge(array1, array2, array3);
                Assert.Equal(9, array1.length);
                for (i = 0; i < array1.length; i++) {
                    Assert.Equal(i, array1[i]);
                }
                
                // Merge just array1 and make sure it doesn't change.
                util.merge(array1);
                Assert.Equal(9, array1.length);
                for (i = 0; i < array1.length; i++) {
                    Assert.Equal(i, array1[i]);
                }
            });
        }
        
        [Fact]
        function testMergeError() {
            auraMock(function() {
                try {
                    new $A.ns.Util().merge({}, [0], [1, 2]);
                    Assert.False(true, "Invalid arguments. Should throw exception.");
                } catch (e) {
                    Assert.Equal("Merge takes only arrays as arguments.", e);
                }
                
                try {
                    new $A.ns.Util().merge([0], [1, 2], {});
                    Assert.False(true, "Invalid arguments. Should throw exception.");
                } catch (e) {
                    Assert.Equal("Merge takes only arrays as arguments.", e);
                }
            });
        }
    }

    [Fixture]
    function supportsTouchEvents() {
        var mockIsUndefinedReturnsFalse = Mocks.GetMock(Object.Global(), "$A", {
            util: {
                isUndefined: function() {
                    return false;
                }
            }
        });

        [Fact] 
        function ReturnsCachedResultIfExistsAndTruthy() {
            var actual;
            var expected = true;
            targetUtil.supportsTouchEvents.cache = expected;

            mockIsUndefinedReturnsFalse(function() {
                actual = targetUtil.supportsTouchEvents();
            });

            Assert.Equal(expected, actual);
        }

        [Fact] 
        function ReturnsCachedResultIfExistsAndFalsy() {
            var actual;
            var expected = false;
            targetUtil.supportsTouchEvents.cache = expected;

            mockIsUndefinedReturnsFalse(function() {
                actual = targetUtil.supportsTouchEvents();
            });

            Assert.Equal(expected, actual);
        }

        [Fact] 
        function ReturnsTrueWhenOnTouchStartInWindow() {
            var actual;
            var expected = true;
            var mockItAll = Mocks.GetMocks(Object.Global(), {
                $A: {
                    util: {
                        isUndefined: function() {
                            return true;
                        }
                    },
                    getContext: function() {
                        return {
                            getMode: function() {
                                return "NonBlacklistedMode";
                            }
                        }
                    }
                },
                window: {
                    ontouchstart: true
                }
            });

            mockItAll(function() {
                actual = targetUtil.supportsTouchEvents();
            });

            Assert.Equal(expected, actual);
        }

        [Fact] 
        function ReturnsTrueForWindowsPhone() {
            var actual;
            var expected = true;
            var mockItAll = Mocks.GetMocks(Object.Global(), {
                $A: {
                    util: {
                        isUndefined: function() {
                            return true;
                        }
                    },
                    getContext: function() {
                        return {
                            getMode: function() {
                                return "NonBlacklistedMode";
                            }
                        }
                    },
                    get: function() {
                        return true;
                    }
                },
                window: {},
                navigator: {
                    msPointerEnabled: true
                }
            });

            mockItAll(function() {
                actual = targetUtil.supportsTouchEvents();
            });

            Assert.Equal(expected, actual);
        }

        [Fact] 
        function ReturnsTrueForMaxTouchPoints() {
            var actual;
            var expected = true;
            var mockItAll = Mocks.GetMocks(Object.Global(), {
                $A: {
                    util: {
                        isUndefined: function() {
                            return true;
                        }
                    },
                    getContext: function() {
                        return {
                            getMode: function() {
                                return "NonBlacklistedMode";
                            }
                        }
                    },
                    get: function() {
                        return false;
                    }
                },
                window: {},
                navigator: {
                    msPointerEnabled: false,
                    msMaxTouchPoints: 10
                }
            });

            mockItAll(function() {
                actual = targetUtil.supportsTouchEvents();
            });

            Assert.Equal(expected, actual);
        }

        [Fact] 
        function ReturnsFalseForBlacklistedMode() {
            var actual;
            var expected = false;
            var mockItAll = Mocks.GetMocks(Object.Global(), {
                $A: {
                    util: {
                        isUndefined: function() {
                            return true;
                        }
                    },
                    getContext: function() {
                        return {
                            getMode: function() {
                                return "PTEST";
                            }
                        }
                    }
                },
                window: {
                    ontouchstart: true
                }
            });

            mockItAll(function() {
                actual = targetUtil.supportsTouchEvents();
            });
 
            Assert.Equal(expected, actual);
        }

        [Fact] 
        // This case covers non-touch IE11 where msPointerEnabled is true
        function ReturnsFalseForPointerEnabledNotWindowsPhone() {
            var actual;
            var expected = false;
            var mockItAll = Mocks.GetMocks(Object.Global(), {
                $A: {
                    util: {
                        isUndefined: function() {
                            return true;
                        }
                    },
                    getContext: function() {
                        return {
                            getMode: function() {
                                return "NonBlacklistedMode";
                            }
                        }
                    },
                    get: function() {
                        return false;
                    }
                },
                window: {},
                navigator: {
                    msPointerEnabled: true,
                    pointerEnabled: true,
                    msMaxTouchPoints: 0,
                    maxTouchPoints:0
                }
            });

            mockItAll(function() {
                actual = targetUtil.supportsTouchEvents();
            });

            Assert.Equal(expected, actual);
        }
    }
}
 