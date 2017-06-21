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
Test.Aura.LoggingTest = function() {
    var subscribe = Stubs.GetMethod("name", "fn");
    var eventHandler;
    var theWindow = {
        addEventListener: function(eventname, handler) { eventHandler = handler; }
    };

    Mocks.GetMocks(Object.Global(), {
        "$A" : {
            "logger": {
                "subscribe" : subscribe
            },
        },
        "window":theWindow
    })(function(){
        [Import("aura-impl/src/main/resources/aura/Logging.js")]
    });

    [Fixture]
    function initialization() {
        [Fact]
        function OnErrorIsSet() {
            Assert.NotNull(theWindow.onerror);
        }

        [Fact]
        function SubscribeCallsAreAsExpected() {
            Assert.Equal(5, subscribe.Calls.length);
        }
    }

    [Fixture]
    function onerror() {
        [Fact]
        function OnErrorCallsReportErrorWithBareMessage() {
            var reportError = Stubs.GetMethod("message", "err", true);
            var message = "message";
            var expectedMessage = message;
            var expectedError = "error";

            Mocks.GetMocks(Object.Global(), {
                "$A": {
                    "reportError":reportError
                }
            })(function() {
                theWindow.onerror(message, null, null, null, expectedError);
            });
            // This is a bit bogus, but it gets rid of the warning.
            Assert.Equal({"message":expectedMessage, "err":expectedError}, reportError.Calls[0].Arguments);
        }

        [Fact]
        function OnErrorCallsReportErrorWithBareMessagePlusFile() {
            var reportError = Stubs.GetMethod("message", "err", true);
            var message = "message";
            var expectedError = "error";
            var file="file", line="line", col="col";
            var expectedMessage = message+"\nthrows at "+file+":"+line+":"+col;

            Mocks.GetMocks(Object.Global(), {
                "$A": {
                    "reportError":reportError
                }
            })(function() {
                theWindow.onerror(message, file, line, col, expectedError);
            });
            // This is a bit bogus, but it gets rid of the warning.
            Assert.Equal({"message":expectedMessage, "err":expectedError}, reportError.Calls[0].Arguments);
        }

        [Fact]
        function OnErrorDoesNotCallsConsoleErrorIfReportAndNoExisting() {
            var reportError = Stubs.GetMethod("message", "err", true);
            var consoleError = Stubs.GetMethod("message", "err", undefined);
            var message = "message";
            var expectedError = "error";
            var file="file", line="line", col="col";
            var expectedMessage = message+"\nthrows at "+file+":"+line+":"+col;

            Mocks.GetMocks(Object.Global(), {
                "$A": {
                    "reportError":reportError
                },
                "window": {
                    "console":{
                        "error":consoleError
                    }
                }
            })(function() {
                theWindow.onerror(message, file, line, col, expectedError);
            });
            Assert.Equal(0, consoleError.Calls.length);
        }

        [Fact]
        function OnErrorCallsConsoleErrorIfNoReportAndNoExisting() {
            var reportError = Stubs.GetMethod("message", "err", false);
            var consoleError = Stubs.GetMethod("message", "err", undefined);
            var message = "message";
            var expectedError = "error";
            var file="file", line="line", col="col";
            var expectedMessage = message+"\nthrows at "+file+":"+line+":"+col;

            Mocks.GetMocks(Object.Global(), {
                "$A": {
                    "reportError":reportError
                },
                "window": {
                    "console":{
                        "error":consoleError
                    }
                }
            })(function() {
                theWindow.onerror(message, file, line, col, expectedError);
            });
            Assert.Equal({"message":expectedMessage, "err":expectedError}, consoleError.Calls[0].Arguments);
        }

        [Fact]
        function OnErrorHandlesConsoleMissing() {
            var reportError = Stubs.GetMethod("message", "err", false);
            var message = "message";
            var expectedError = "error";
            var file="file", line="line", col="col";
            var expectedMessage = message+"\nthrows at "+file+":"+line+":"+col;

            Mocks.GetMocks(Object.Global(), {
                "$A": {
                    "reportError":reportError
                },
                "window": {
                }
            })(function() {
                theWindow.onerror(message, file, line, col, expectedError);
            });
            Assert.Equal(1, reportError.Calls.length);
        }

        [Fact]
        function OnErrorHandlesConsoleErrorMissing() {
            var reportError = Stubs.GetMethod("message", "err", false);
            var message = "message";
            var expectedError = "error";
            var file="file", line="line", col="col";
            var expectedMessage = message+"\nthrows at "+file+":"+line+":"+col;

            Mocks.GetMocks(Object.Global(), {
                "$A": {
                    "reportError":reportError
                },
                "window": {
                    "console": {
                        "foo":function(){}
                    }
                }
            })(function() {
                theWindow.onerror(message, file, line, col, expectedError);
            });
            Assert.Equal(1, reportError.Calls.length);
        }
    }

    [Fixture]
    function unhandledrejectionHandler() {
        [Fact]
        function CallsReportErrorWithEventReason() {
            var reportError = Stubs.GetMethod("message", "error", true);
            var expected = "error message";

            Mocks.GetMocks(Object.Global(), {
                "$A": {
                    "reportError":reportError,
                    "auraError": function(msg, err) {
                        this.message = err.message;
                    },
                }
            })(function() {
                eventHandler({reason:new Error(expected)});
            });

            var actual = reportError.Calls[0].Arguments["error"].message;
            Assert.Equal(expected, actual);
        }

        [Fact]
        function DoesNotCallConsoleErrorIfReportReturnsTrue() {
            var reportError = Stubs.GetMethod("message", "error", true);
            var consoleError = Stubs.GetMethod("message", "error", undefined);

            Mocks.GetMocks(Object.Global(), {
                "$A": {
                    "reportError":reportError,
                    "auraError": function(){}
                },
                "window": {
                    "console":{
                        "error":consoleError
                    }
                }
            })(function() {
                eventHandler({reason:new Error()});
            });

            Assert.Equal(0, consoleError.Calls.length);
        }

        [Fact]
        function CallsConsoleErrorIfReportReturnsFalse() {
            var reportError = Stubs.GetMethod("message", "error", false);
            var consoleError = Stubs.GetMethod("message", "error", undefined);
            var expectedError = "bad reason";

            Mocks.GetMocks(Object.Global(), {
                "$A": {
                    "reportError":reportError
                },
                "window": {
                    "console":{
                        "error":consoleError
                    }
                }
            })(function() {
                eventHandler({reason:expectedError});
            });

            Assert.Equal({"message":null, "error":expectedError}, consoleError.Calls[0].Arguments);
        }
    }
};
