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
Function.RegisterNamespace("Test.Aura.Locker");

[Fixture]
Test.Aura.Locker.SecureObjectTest = function() {

    Function.RegisterNamespace("Aura.Locker");
    [Import("aura-impl/src/main/resources/aura/locker/SecureObject.js")]

    var mockGlobals = Mocks.GetMocks(Object.Global(), {

        ls_getKey: function() {},
        ls_getRef: function() {},

        SecureObject: SecureObject,

        document: {},
        window: {},
        File: function(){},
        FileList: function(){},
        CSSStyleDeclaration: function(){},
        TimeRanges: function(){}
    });

    // remove globals
    delete SecureObject;

    [Fixture]
    function unfilterEverything() {

        [Fact]
        function ValueExistsInVisited() {
            var value = {};
            var visited = new WeakMap();

            mockGlobals(function() {
               SecureObject.unfilterEverything({}, value, visited);
            });

            Assert.True(visited.has(value));
        }

        [Fact]
        function CyclicObjectReferences() {
            var value = {
                "v": value
            };

            var actual;
            mockGlobals(function() {
                actual =SecureObject.unfilterEverything({}, value);
            });

            Assert.Equal(1, Object.getOwnPropertyNames(actual).length);
        }

        [Fact]
        function ObjectContainsCyclicReferences() {
            var value = {
                "v": value,
                "test": "test string"
            };

            var actual;
            mockGlobals(function() {
                actual =SecureObject.unfilterEverything({}, value);
            });

            Assert.Equal(actual["test"], "test string");
        }

        [Fact]
        function CyclicArrayReferences() {
            var value = [value];

            var actual;
            mockGlobals(function() {
                actual =SecureObject.unfilterEverything({}, value);
            });

            Assert.Equal(1, actual.length);
        }

        [Fact]
        function ArrayContainsCyclicReferences() {
            var value = [value, "v"];

            var actual;
            mockGlobals(function() {
                actual =SecureObject.unfilterEverything({}, value);
            });

            Assert.Equal(2, actual.length);
        }

        [Fact]
        function ReturnsVisitedValue() {
            var value = {};
            var expected = {};

            var actual;
            var visited = new WeakMap();
            visited.set(value, expected);
            mockGlobals(function() {
                actual = SecureObject.unfilterEverything({}, value, visited);
            });

            Assert.True(expected === actual);
        }

        [Fixture]
        function testPassthroughValues() {
            var CustomFileClass = function(){};
            var CustomFileListClass = function(){};
            // Mock the File and FileList class with a custom class
            var mockClassTypes = Mocks.GetMocks(Object.Global(), {
                File: CustomFileClass,
                FileList: CustomFileListClass
            });

            [Fact]
            [Data({clazz: CustomFileClass, msg: "File type value should passthrough unfiltered"})]
            [Data({clazz: CustomFileListClass, msg: "FileList type value should passthrough unfiltered"})]
            function PassThroughFileValue(data) {
                // Arrange
                var value = new data.clazz();
                var expected = value;

                // Act
                var actual;
                mockGlobals(function() {
                    mockClassTypes(function () {
                        actual = SecureObject.unfilterEverything({}, value);
                    });
                });

                // Assert
                Assert.True(expected === actual, data.msg);
            }
        }
    }
}
