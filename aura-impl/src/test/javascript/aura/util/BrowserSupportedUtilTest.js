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
Function.RegisterNamespace("Test.Aura.BrowserSupportedUtilTest");

/**
 * This test shows that when the browser is mocked to have native utilities in place, they are used instead of
 * the fallbacks.
 */

[Fixture]
Test.Aura.BrowserSupportedUtilTest=function() {
    
    [Fixture]
    function browserSupportedTests() {
        var MockObject = {};
        for (var key in Object) { MockObject[key] = Object[key]; }
        MockObject.prototype = Object.create(Object.prototype);
        
        MockObject.keys = function() {throw "KEYS";};
        
        var MockFunction = function MockFunction() {};
        MockFunction.prototype = Object.create(Function.prototype);
        
        MockFunction.prototype.bind = function() {throw "BIND";};
        
        var MockArray = function MockArray() {};
        MockArray.prototype = Object.create(Array.prototype);
        
        MockArray.prototype.forEach = function() {throw "FOREACH";};
        MockArray.prototype.map = function() {throw "MAP";};
        MockArray.prototype.reduce = function() {throw "REDUCE";};
        MockArray.prototype.some = function() {throw "SOME";};
        MockArray.prototype.every = function() {throw "EVERY";};
        MockArray.prototype.filter = function() {throw "FILTER";};
        MockArray.isArray = function(obj) {
            return obj instanceof [].constructor;
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
        
        [Fact]
        function testForEach() {
            utilMock(MockArray, function(util){
                try {
                    util.forEach(new MockArray("A", "B", "C"), function(letter, index) {
                        return this + letter + index;
                    }, "THIS_OBJECT");
                    Assert.False(true, "default call should have raised an exception!");
                } catch (e) {
                    Assert.Equal("FOREACH", e);
                }
            });
        }
        
        [Fact]
        function testMap() {
            utilMock(MockArray, function(util){
                try {
                    var actual = util.map(new MockArray("A", "B", "C"), function(letter, index) {
                        return this + letter + index;
                    }, "THIS_OBJECT");
                    Assert.False(true, "default call should have raised an exception!");
                } catch (e) {
                    Assert.Equal("MAP", e);
                }
            });
        }
        
        [Fact]
        function testReduce() {
            utilMock(MockArray, function(util){
                try {
                    var actual = util.reduce(new MockArray("A", "B", "C"), function(letter, index) {
                        return this + letter + index;
                    }, "THIS_OBJECT", []);
                    Assert.False(true, "default call should have raised an exception!");
                } catch (e) {
                    Assert.Equal("REDUCE", e);
                }
            });
        }
        
        [Fact]
        function testFilter() {
            utilMock(MockArray, function(util){
                try {
                    var actual = util.filter(new MockArray("A", "B", "C"), function(letter, index) {
                        return (this + letter + index) === "THIS_OBJECTB1";
                    }, "THIS_OBJECT", []);
                    Assert.False(true, "default call should have raised an exception!");
                } catch (e) {
                    Assert.Equal("FILTER", e);
                }
            });
        }
        
        [Fact]
        function testEvery() {
            utilMock(MockArray, function(util){
                try {
                    var actual = util.every(new MockArray("A", "B", "C"), function(letter, index) {
                        return false;
                    }, "THIS_OBJECT", []);
                    Assert.False(true, "default call should have raised an exception!");
                } catch (e) {
                    Assert.Equal("EVERY", e);
                }
            });
        }
        
        [Fact]
        function testSome() {
            utilMock(MockArray, function(util){
                try {
                    var actual = util.some(new MockArray("A", "B", "C"), function(letter, index) {
                        return false;
                    }, "THIS_OBJECT", []);
                    Assert.False(true, "default call should have raised an exception!");
                } catch (e) {
                    Assert.Equal("SOME", e);
                }
            });
        }
        
        [Fact]
        function testBind() {
            utilMock(MockFunction, function(util){
                try {
                    var actual = util.bind(function() {}, 1);
                    Assert.False(true, "default call should have raised an exception!");
                } catch (e) {
                    Assert.Equal("BIND", e);
                }
            });
        }
        
        [Fact]
        function testKeys() {
            utilMock(MockObject, function(util){
                try {
                    var actual = util.keys({});
                    Assert.False(true, "default call should have raised an exception!");
                } catch (e) {
                    Assert.Equal("KEYS", e);
                }
            });
        }
    }
}
 