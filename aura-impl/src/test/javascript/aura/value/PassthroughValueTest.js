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
Function.RegisterNamespace("Test.Aura.Value");

[Fixture]
Test.Aura.Value.PassthroughValueTest = function(){
    var _passThroughValue;

    Mocks.GetMocks(Object.Global(), {
    })(function(){
        Import("aura-impl/src/main/resources/aura/value/PassthroughValue.js");
        _passThroughValue = PassthroughValue;
        delete PassthroughValue
    });

    function getAuraMock(during) {
        return 
    }

    [Fixture]
    function set(){
        [Fact]
        function AssertFailedWhenKeyUndefined(){
            // Arrange
            var expectedPrimaryProviders = ["foo", "bar"];
            var expectedFallbackComponent = "cmp";
            var ptv = new _passThroughValue(expectedPrimaryProviders, expectedFallbackComponent);

            // Act
            var actual;
            Mocks.GetMocks(Object.Global(), {
                $A: {
                    assert: function(condition, message) {
                        throw message;
                    },
                    util: {
                        isString: function(obj) {
                            return false;
                        }
                    }
                }
            })(function() {
                try {
                    ptv.set(undefined, null, true);
                } catch (e) {
                    actual = e;
                }
            });

            // Assert
            var expected = "PassthroughValue.prototype.set should be called with a valid key!\n"+
                "[key]: " + undefined + '\n' +
                "[primaryProviders]: " + expectedPrimaryProviders + '\n' +
                "[falls back component]: " + expectedFallbackComponent + '\n';
            Assert.Equal(expected, actual);
        }
    }
}
