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
    var _AuraError;
    var _AuraFriendlyError;
    var _StackFrame;
    var _ErrorStackParser;

    Mocks.GetMocks(Object.Global(), {
        "Aura": {Errors: {}},
    })(function() {
        Import("aura-impl/src/main/resources/aura/polyfill/stackframe.js");
        Import("aura-impl/src/main/resources/aura/polyfill/error-stack-parser.js");
        Import("aura-impl/src/main/resources/aura/error/AuraError.js");
        Import("aura-impl/src/main/resources/aura/error/AuraFriendlyError.js");
        _StackFrame = StackFrame;
        _ErrorStackParser = ErrorStackParser;
        _AuraError = AuraError;
        _AuraFriendlyError = Aura.Errors.AuraFriendlyError;
        delete StackFrame;
        delete ErrorStackParser;
        delete AuraError;
        delete Aura.Errors.AuraFriendlyError;
    });

    function getAuraMock(during) {
        return Mocks.GetMocks(Object.Global(), {
            Aura: {
                Errors: {
                    AuraError: _AuraError,
                    AuraFriendlyError: _AuraFriendlyError,
                    StackFrame: _StackFrame,
                    StackParser: _ErrorStackParser
                }
            }
        })(during);
    }

    [Fixture]
    function Constructor() {
        [Fact]
        function ErrorTypeName() {
            var expected = "AuraFriendlyError";
            var actual;

            getAuraMock(function(){
                actual = new Aura.Errors.AuraFriendlyError().name;
            });

           Assert.Equal(expected, actual);
       }

        [Fact]
        function IsInstanceAuraError() {
            var actual;

            getAuraMock(function(){
                actual = new Aura.Errors.AuraFriendlyError();
                Assert.True(actual instanceof Aura.Errors.AuraError);
            });
        }

        [Fact]
        function MessageIsEmptyWhenConstructorHasNoArgument() {
            var actual;

            getAuraMock(function(){
                actual = new Aura.Errors.AuraFriendlyError().message;
            });

            Assert.Empty(actual);
        }

        [Fact]
        function MessageIsSetAsFirstArgument() {
            var expected = "test message";
            var actual;

            getAuraMock(function(){
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

            getAuraMock(function(){
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

            getAuraMock(function(){
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

            getAuraMock(function(){
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

            getAuraMock(function(){
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

            getAuraMock(function(){
                target = new Aura.Errors.AuraFriendlyError(errorMsg);
            });
            target.data = {};

            Assert.Equal(expected, target.toString());
        }

        [Fact]
        function ContainsCustomDataWhenNoErrorMessage() {
            var expected = "\n\t[custom data: \"friendly message\"]";
            var target;

            getAuraMock(function(){
                target = new Aura.Errors.AuraFriendlyError();
            });
            target.data = "friendly message";

            Assert.Equal(expected, target.toString());
        }
    }
}
