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
    // remove globals
    delete SecureObject;
    delete newWeakMap;
    delete rawToSecureObjectCaches;

    [Fixture]
    function unfilterEverything() {
        var validLockSet = new WeakSet();
        var newWeakMap;

        var mockGlobals = Mocks.GetMocks(Object.Global(), {
            getLockerSecret: function (st, type) {
                if (typeof st !== "object" && typeof st !== "function") {
                    throw new TypeError("Secrets can only be stored in Objects and Functions.");
                }
                var lock = st["$ls" + type];

                if (lock && validLockSet["has"](lock)) {
                    return lock(masterKey);
                } else if (lock) {
                    throw new ReferenceError('Invalid Secure Object');
                }
            },

            newWeakMap: function() {
                return newWeakMap;
            },

            SecureObject: Aura.Locker.SecureObject,
            
            document: {},
            window: {}
        });

        [Fact]
        function ValueExistsInVisited() {
            var value = {};

            newWeakMap = new WeakMap();
            mockGlobals(function() {
                Aura.Locker.SecureObject.unfilterEverything({}, value);
            });

            Assert.True(newWeakMap.has(value));
        }

        [Fact]
        function CyclicObjectReferences() {
            var value = {
                "v": value
            };

            var actual;
            newWeakMap = new WeakMap();
            mockGlobals(function() {
                actual = Aura.Locker.SecureObject.unfilterEverything({}, value);
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
            newWeakMap = new WeakMap();
            mockGlobals(function() {
                actual = Aura.Locker.SecureObject.unfilterEverything({}, value);
            });

            Assert.Equal(actual["test"], "test string");
        }

        [Fact]
        function CyclicArrayReferences() {
            var value = [value];

            var actual;
            newWeakMap = new WeakMap();
            mockGlobals(function() {
                actual = Aura.Locker.SecureObject.unfilterEverything({}, value);
            });

            Assert.Equal(1, actual.length);
        }

        [Fact]
        function ArrayContainsCyclicReferences() {
            var value = [value, "v"];

            var actual;
            newWeakMap = new WeakMap();
            mockGlobals(function() {
                actual = Aura.Locker.SecureObject.unfilterEverything({}, value);
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
                actual = Aura.Locker.SecureObject.unfilterEverything({}, value, visited);
            });

            Assert.True(expected === actual);
        }
    }
}
