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
    var Aura = {Errors: {}};

    Mocks.GetMocks(Object.Global(), {
        "Aura": Aura,
        "AuraError": function(){},
        "AuraFriendlyError": function(){},
        "window": {}
    })(function() {
        [Import("aura-impl/src/main/resources/aura/AuraError.js"),
         Import("aura-impl/src/main/resources/aura/AuraFriendlyError.js")]
    });

    function mockFramework(during) {
        var mock = {
            "Aura": {
                "Errors": {
                    "AuraError": Aura.Errors.AuraError
                }
            },
            "window": {}
        };
        return Mocks.GetMocks(Object.Global(),mock)(during);
    }

    [Fixture]
    function Constructor() {
        [Fact]
        function ErrorTypeName() {
            var expected = "AuraFriendlyError";
            var actual;

            mockFramework(function(){
                actual = new Aura.Errors.AuraFriendlyError().name;
            });

           Assert.Equal(expected, actual);
       }

        [Fact]
        function MessageIsEmptyWhenConstructorHasNoArgument() {
            var actual;

            mockFramework(function(){
                actual = new Aura.Errors.AuraFriendlyError().message;
            });

            Assert.Empty(actual);
        }

        [Fact]
        function MessageIsSetAsFirstArgument() {
            var expected = "test message";
            var actual;

            mockFramework(function(){
                actual = new Aura.Errors.AuraFriendlyError(expected).message;
            });

            Assert.Equal(expected, actual);
        }
    }

    [Fixture]
    function ToString() {
        [Fact]
        function ContainsMessage() {
            var expected = "test message";
            var target;

            mockFramework(function(){
                target = new Aura.Errors.AuraFriendlyError(expected);
            });

            Assert.Equal(expected, target.toString());
        }

        [Fact]
        function ContainsCustomData() {
            var target;
            var errorMsg = "test message";
            var expected = errorMsg + "\n\t" +
                    "[custom data: {\"friendly message\":\"test friendly message\"}]";

            mockFramework(function(){
                target = new Aura.Errors.AuraFriendlyError(errorMsg);
            });
            target.data = {
                'friendly message': 'test friendly message'
            };

            Assert.Equal(expected, target.toString());
        }

        [Fact]
        function ContainsCustomDataWithSpecialCharacters() {
            var target;
            var errorMsg = "test message";
            var expected = errorMsg + "\n\t" +
                    "[custom data: {\"friendly message\":\"$A.bla@# = function(){[&|]}\"}]";

            mockFramework(function(){
                target = new Aura.Errors.AuraFriendlyError(errorMsg);
            });
            target.data = {
                "friendly message": "$A.bla@# = function(){[&|]}"
            };

            Assert.Equal(expected, target.toString());
        }


        [Fact]
        function ContainsCustomDataWhenDataIsString() {
            var errorMsg = "test message";
            var expected = errorMsg + "\n\t" +
                    "[custom data: \"friendly message\"]";
            var target;

            mockFramework(function(){
                target = new Aura.Errors.AuraFriendlyError(errorMsg);
            });
            target.data = "friendly message";

            Assert.Equal(expected, target.toString());
        }

        [Fact]
        function ContainsCustomDataWhenDataIsEmptyObject() {
            var errorMsg = "test message";
            var expected = errorMsg + "\n\t[custom data: {}]";
            var target;

            mockFramework(function(){
                target = new Aura.Errors.AuraFriendlyError(errorMsg);
            });
            target.data = {};

            Assert.Equal(expected, target.toString());
        }

        [Fact]
        function ContainsCustomDataWhenNoErrorMessage() {
            var expected = "\n\t[custom data: \"friendly message\"]";
            var target;

            mockFramework(function(){
                target = new Aura.Errors.AuraFriendlyError();
            });
            target.data = "friendly message";

            Assert.Equal(expected, target.toString());
        }
    }
}
