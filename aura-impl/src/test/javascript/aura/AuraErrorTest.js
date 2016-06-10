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
    var Aura = {Errors: {}};

    Mocks.GetMocks(Object.Global(), {
        "Aura": Aura,
        "AuraError": function(){}
    })(function() {
        [Import("aura-impl/src/main/resources/aura/AuraError.js")]
    });

    var windowMock=Test.Mocks.NeededMocks.getWindowMock();

    [Fixture]
    function Construct() {
        [Fact]
        function ReturnsErrorTypeName() {
            var actual;
            var expected = "AuraError";

            windowMock(function() {
                actual = new Aura.Errors.AuraError().name;
            });

            Assert.Equal(expected, actual);
        }

        [Fact]
        function EmptyConstructorReturnsEmptyMessage() {
            var actual;

            windowMock(function() {
                actual = new Aura.Errors.AuraError().message;
            });

            Assert.Empty(actual);
        }

        [Fact]
        function ReturnsMessage() {
            var actual;
            var expected = "test message";

            windowMock(function() {
                actual = new Aura.Errors.AuraError(expected).message;
            });

            Assert.Equal(expected, actual);
        }

        [Fact]
        function ReturnsCallStack() {
            var actual;

            windowMock(function() {
                actual = new Aura.Errors.AuraError().stackTrace;
            });

            Assert.NotNull(actual);
        }

        [Fact]
        function ReturnsSeverity() {
            var actual;
            var expected = "FATAL";

            windowMock(function() {
                actual = new Aura.Errors.AuraError(null, null, expected).severity;
            });

            Assert.Equal(expected, actual);
        }

        [Fact]
        function ReturnsId() {
            var actual;

            windowMock(function() {
                actual = new Aura.Errors.AuraError().id;
            });

            // error id length is 36, e.g: 10fdb86c-6868-43ba-b464-347057f3b316
            Assert.Equal(36, actual.length);
        }

        [Fact]
        function ReturnsInnerErrorName() {
            var actual;
            var innerError = new TypeError();
            var expected = innerError.name;

            windowMock(function() {
                actual = new Aura.Errors.AuraError(null, innerError).name;
            });

            Assert.Equal(expected, actual);
        }

        [Fact]
        function ReturnsInnerErrorMessage() {
            var actual;
            var innerError = new TypeError("from inner error");
            var message = "from ctor";
            var expected = message + " [" + innerError.toString() + "]";

            windowMock(function() {
                actual = new Aura.Errors.AuraError(message, innerError).message;
            });

            Assert.Equal(expected, actual);
        }

        [Fact]
        function ReturnsInnerErrorSeverity() {
            var actual;
            var innerError = new Error();
            innerError.severity = "TEST";
            var expected = innerError.severity;

            windowMock(function() {
                actual = new Aura.Errors.AuraError(null, innerError).severity;
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

            windowMock(function(){
                target = new Aura.Errors.AuraError(expected);
            });

            Assert.Equal(expected, target.toString());
        }

        [Fact]
        function ReturnsEmptyStringWhenMessageIsUndefined() {
            var target;

            windowMock(function(){
                target = new Aura.Errors.AuraError();
            });

            Assert.Equal('', target.toString());
        }
    }
}
