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
Function.RegisterNamespace("Test.Aura.BrowserUnsupportedUtilTest");

/**
 * This test shows that when the browser is mocked to be missing native utilities, the fallbacks implementation in
 * $A.util are used.
 */

[Fixture]
Test.Aura.BrowserUnsupportedUtilTest=function() {
    
    [Fixture]
    function browserUnsupportedTests() {
        var MockObject = {};
        for (var key in Object) { MockObject[key] = Object[key]; }
        MockObject.prototype = Object.create(Object.prototype);
        
        MockObject.keys = undefined;

        var MockFunction = function MockFunction() {};
        MockFunction.prototype = Object.create(Function.prototype);
        
        MockFunction.prototype.bind = undefined;
        
        var MockArray = function() {};
        MockArray.prototype = Object.create(Array.prototype);
        
        MockArray.prototype.forEach = undefined;
        MockArray.prototype.map = undefined;
        MockArray.prototype.reduce = undefined;
        MockArray.prototype.every = undefined;
        MockArray.prototype.some = undefined;
        MockArray.prototype.filter = undefined;
        MockArray.isArray = function(obj) {
            return (obj instanceof [].constructor);
        };
        
        var utilMock = function(override, delegate) {
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
                navigator:{userAgent:''},
                Array: override === MockArray ? override : Array,
                Function: override === MockFunction ? override : Function
            })(function(){
                var CurrentObject = window.Object;
                window.Object = override === MockObject ? MockObject : window.Object;
                // #import aura.util.Util
                try {
                    delegate(new $A.ns.Util());
                } finally {
                    window.Object = CurrentObject;
                }
            });
        };
            
        function doArrayErrorTest(methodName, isPredicate) {
            utilMock(MockArray, function(util){
                try {
                    util[methodName]({});
                    Assert.False(true, "Method should throw an error.");
                } catch (e) {
                    Assert.True(e instanceof TypeError);
                    Assert.Equal("$A.util." + methodName + " called on non-array.",  e.message);
                }
                
                try {
                    util[methodName]([], {});
                    Assert.False(true, "Method should throw an error.");
                } catch (e) {
                    Assert.True(e instanceof TypeError);
                    Assert.Equal(
                        "$A.util." + methodName + " called with non-function " + (isPredicate ? "predicate." : "callback."),
                        e.message
                    );
                }
            });
        }
            
        [Fact]
        function testForEach() {
            utilMock(MockArray, function(util){
                var actual = [];
                util.forEach(["A", "B", "C"], function(letter, index) {
                    actual.push(this + letter + index);
                }, "THIS_OBJECT");
                
                Assert.Equal(actual[0], "THIS_OBJECTA0");
                Assert.Equal(actual[1], "THIS_OBJECTB1");
                Assert.Equal(actual[2], "THIS_OBJECTC2");
            });
        }
        
        [Fact]
        function testForEachError() {
            doArrayErrorTest("forEach");
        }
        
        [Fact]
        function testMap() {
            utilMock(MockArray, function(util){
                var actual = util.map(["A", "B", "C"], function(letter, index) {
                    return this + letter + index;
                }, "THIS_OBJECT");
                
                Assert.Equal(actual[0], "THIS_OBJECTA0");
                Assert.Equal(actual[1], "THIS_OBJECTB1");
                Assert.Equal(actual[2], "THIS_OBJECTC2");
            });
        }
        
        [Fact]
        function testMapError() {
            doArrayErrorTest("map");
        }
        
        [Fact]
        function testReduce() {
            utilMock(MockArray, function(util){
                var actual = util.reduce(["A", "B", "C"], function(current, letter, index) {
                    current.push(letter + index);
                    return current;
                }, []);
                
                Assert.Equal(actual[0], "A0");
                Assert.Equal(actual[1], "B1");
                Assert.Equal(actual[2], "C2");
            });
        }
        
        [Fact]
        function testReduceError() {
            doArrayErrorTest("reduce");
        }
        
        [Fact]
        function testFilter() {
            utilMock(MockArray, function(util) {
                Assert.Equal(
                    [0, 2],
                    util.filter([0, 2, 3], function(element, index) {
                        return (this + element) % 2 === 1;
                    }, 1), 
                    "Result should only contain even numbers."
                );
                
                Assert.Equal(
            		[],
                    util.every([1, 3, 5], function(element, index) {
                        return (this + element) % 2 === 1;
                    }, 1), 
                    "All numbers were odd, result should be empty."
                );
            });
        }
        
        [Fact]
        function testFilterError() {
            doArrayErrorTest("filter", true);
        }
        
        [Fact]
        function testEvery() {
            utilMock(MockArray, function(util){
                Assert.True(
                    util.every([0, 2, 4], function(element, index) {
                        return (this + element) % 2 === 1;
                    }, 1), 
                    "All elements + 1 should be odd."
                );
                
                Assert.False(
                    util.every([1, 2, 4], function(element, index) {
                        return (this + element) % 2 === 1;
                    }, 1), 
                    "First elements + 1 should not be odd."
                );
            });
        }
        
        [Fact]
        function testEveryError() {
            doArrayErrorTest("every", true);
        }
        
        [Fact]
        function testSome() {
            utilMock(MockArray, function(util) {
                Assert.True(
                    util.some([1, 3, 4], function(element, index) {
                        return (this + element) % 2 === 1;
                    }, 1), 
                    "Last element + 2 should be odd."
                );
                
                Assert.False(
                    util.some([1, 3, 5], function(element, index) {
                        return (this + element) % 2 === 1;
                    }, 1), 
                    "No element + 1 should be odd."
                );
            });
        }
        
        [Fact]
        function testSomeError() {
            doArrayErrorTest("some", true);
        }
            
        [Fact]
        function testBind() {
            function multiplyBPlusCByA(a, b, c) {
                return a * (b + c);
            }
            
            utilMock(MockFunction, function(util) {
                var bPlusCTimes5 = util.bind(multiplyBPlusCByA, null, 5);
                Assert.Equal(20, bPlusCTimes5(1, 3));
                Assert.Equal(50, bPlusCTimes5(7, 3));
                
                var cPlus1Times5 = util.bind(bPlusCTimes5, null, 1);
                Assert.Equal(20, cPlus1Times5(3));
                Assert.Equal(25, cPlus1Times5(4));
                
                var bPlusCTime5Called = util.bind.call(null, multiplyBPlusCByA, null, 5);
                Assert.Equal(20, bPlusCTimes5(1, 3));
                Assert.Equal(50, bPlusCTimes5(7, 3));
            });
        }
        
        [Fact]
        function testBindError() {
            utilMock(MockFunction, function(util) {
                try {
                    util.bind({});
                    Assert.False(true, "Method should throw an error.");
                } catch (e) {
                    Assert.True(e instanceof TypeError);
                    Assert.Equal("$A.util.bind called on non-function.",  e.message);
                }
            });
        }
        
        [Fact]
        function testKeys() {
            utilMock(MockObject, function(util) {
                var testObjects = [{}, new function(){}, []], i;
                for (i = 0; i < testObjects.length; i++) {
                    testObjects[i]["hello"] = "world";
                    testObjects[i]["goodbye"] = "cruel world";
                }
                
                for (i = 0; i < testObjects.length; i++) {
                    var keys = util.keys(testObjects[i]);
                    Assert.Equal(2, keys.length);
                    Assert.Equal("hello", keys[0]);
                    Assert.Equal("goodbye", keys[1]);
                }
            });
        }
        
        [Fact]
        function testKeysError() {
            utilMock(MockObject, function(util) {
                try {
                    util.keys(1);
                    Assert.False(true, "Method should throw an error.");
                } catch (e) {
                    Assert.True(e instanceof TypeError);
                    Assert.Equal("$A.util.keys called on non-object.",  e.message);
                }
            });
        }
    }
}
 