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

/**
 * This test shows that when the browser is mocked to be missing native utilities, the fallbacks implementation in
 * $A.util are used.
 */

[Fixture]
Test.Aura.Util.BrowserUnsupportedUtilTest=function() {
    [Fixture]
    function browserUnsupportedTests() {
        var MockObject = {};
        for (var key in Object) { MockObject[key] = Object[key]; }
        MockObject.prototype = Object.create(Object.prototype);

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
                Style:function() {},
                Bitset:{},
                NumberFormat:{},
                Aura: {Utils: {
                    Json:function() {},
                    Style:function() {},
                    Bitset:{},
                    NumberFormat:{},
                    SizeEstimator:function() {},
                    SecureFilters:{},
                    Mutex:function() {}
                }},
                navigator:{userAgent:''},
                Array: override === MockArray ? override : Array,
                Function: override === MockFunction ? override : Function
            })(function(){
                var CurrentObject = window.Object;
                window.Object = override === MockObject ? MockObject : window.Object;
                [Import("aura-impl/src/main/resources/aura/util/Util.js")]
                try {
                    delegate(new Aura.Utils.Util());
                } finally {
                    window.Object = CurrentObject;
                }
            });
        };

        [Fact]
        function testForEach() {
            var expected = ["THIS_OBJECTA0", "THIS_OBJECTB1", "THIS_OBJECTC2"];
            var actual = [];
            utilMock(MockArray, function(util){
                util.forEach(["A", "B", "C"], function(letter, index) {
                    actual.push(this + letter + index);
                }, "THIS_OBJECT");
            });

            Assert.Equal(expected, actual);
        }

        [Fact]
        function testMap() {
            var expected = ["THIS_OBJECTA0", "THIS_OBJECTB1", "THIS_OBJECTC2"];
            var actual;

            utilMock(MockArray, function(util){
                actual = util.map(["A", "B", "C"], function(letter, index) {
                    return this + letter + index;
                }, "THIS_OBJECT");
            });

            Assert.Equal(expected, actual);
        }

        [Fact]
        function testReduce() {
            var expected = ["A0", "B1", "C2"];
            var actual;

            utilMock(MockArray, function(util){
                actual = util.reduce(["A", "B", "C"], function(current, letter, index) {
                    current.push(letter + index);
                    return current;
                }, []);
            });

            Assert.Equal(expected, actual);
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
            });
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
            });
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
            });
        }

        [Fact]
        function testBind() {
            var bindTarget = function (/*arguments*/){
                var parameters = Array.prototype.slice.call(arguments);
                return parameters.join("|");
            }
            var expected = "bound|one|two";
            var actual;

            utilMock(MockFunction, function(util) {
                var target = util.bind(bindTarget, null, "bound");
                actual = target("one", "two");
            });

            Assert.Equal(expected, actual);
        }

        [Fact]
        function testBindOnBind() {
            var bindTarget = function (/*arguments*/){
                var parameters = Array.prototype.slice.call(arguments);
                return parameters.join("|");
            }
            var expected = "bound|one|two|three";
            var actual;

            utilMock(MockFunction, function(util) {
                var target = util.bind(bindTarget, null, "bound");
                var secondTarget = util.bind(target, null, "one");
                actual = secondTarget("two", "three");
            });

            Assert.Equal(expected, actual);
        }

        [Fact]
        function testBindError() {
            var expected = new TypeError("$A.util.bind called on non-function.");
            var actual;
            utilMock(MockFunction, function(util) {
                actual = Record.Exception(function(){
                    util.bind({});
                });
            });

            Assert.Equal(expected, actual);
        }
    }
}

