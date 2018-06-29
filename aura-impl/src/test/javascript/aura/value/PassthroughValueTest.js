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
    var PassthroughValueCtor;

    Mocks.GetMocks(Object.Global(), {
    })(function(){
        Import("aura-impl/src/main/resources/aura/value/PassthroughValue.js");
        PassthroughValueCtor = PassthroughValue;
        delete PassthroughValue;
    });

    var mockAura = Mocks.GetMock(Object.Global(), "$A", {
        auraError: function (message) {
            this.message = message;
       },
    });

    [Fixture]
    function set() {

        [Fact]
        function ThrowsErrorForNonStringKey() {
            // Arrange
            var expected = "PassthroughValue.set: 'key' must be a string. Found undefined";

            var primaryProviders = ["foo", "bar"];
            var component = "cmp";
            var target = new PassthroughValueCtor(primaryProviders, component);

            // Act
            var actual;
            mockAura(function() {
                try {
                    target.set(undefined, null, true);
                } catch (e) {
                    actual = e.message;
                }
            });

            // Assert
            Assert.Equal(expected, actual);
        }
    }
}
