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
Function.RegisterNamespace("Test.Aura");

[Fixture]
Test.Aura.AuraErrorTest = function() {
    var $A = {
        ns : {}
    };

    //Mock the exp() function defined in Aura.js, this is originally used for exposing members using a export.js file
    Mocks.GetMocks(Object.Global(), { "exp": function() {}, "$A": $A })(function() {
        // #import aura.AuraError
    });

    [Fixture]
    function Construct() {
        [Fact]
        function ReturnsErrorTypeName() {
            var actual;
            var expected = "AuraError";

            actual = new $A.ns.AuraError().name;

            Assert.Equal(expected, actual);
        }

        [Fact]
        function EmptyConstructorReturnsEmptyMessage() {
            var actual;

            actual = new $A.ns.AuraError().message;

            Assert.Empty(actual);
        }

        [Fact]
        function ReturnsMessage() {
            var actual;
            var expected = "test message";

            actual = new $A.ns.AuraError(expected).message;

            Assert.Equal(expected, actual);
        }

        [Fact]
        function ReturnsCallStack() {
            var actual;

            actual = new $A.ns.AuraError().stackTrace;

            Assert.NotNull(actual);
        }
    }
}