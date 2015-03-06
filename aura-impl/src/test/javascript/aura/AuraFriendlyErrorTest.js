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
Test.Aura.AuraFriendlyErrorTest = function() {
    var $A = { ns: { AuraError: function() {} } };

    //Mock the exp() function defined in Aura.js, this is originally used for exposing members using a export.js file
    Mocks.GetMocks(Object.Global(), {"exp": function() {}, "$A": $A })(function() {
        // #import aura.AuraFriendlyError
    });

    var mockAuraError = Mocks.GetMock(Object.Global(), "$A", $A);

    [Fixture]
    function Construct() {
        [Fact]
        function ReturnsErrorTypeName() {
            var actual;
            var expected = "AuraFriendlyError";

            mockAuraError(function () {
                actual = new $A.ns.AuraFriendlyError().name;
            })

            Assert.Equal(expected, actual);
        }
    }
}