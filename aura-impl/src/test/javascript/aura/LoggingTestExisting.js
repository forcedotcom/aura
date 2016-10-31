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
Test.Aura.LoggerTest = function() {
    var subscribe = Stubs.GetMethod("name", "fn");
    // have to keep this, as import changes onerror
    var existing_onerror = Stubs.GetMethod("message", "url", "line", "col", "err", true);
    var theWindow = {
        "onerror": existing_onerror
    };

    Mocks.GetMocks(Object.Global(), {
        "$A" : {
            "logger": {
                "subscribe" : subscribe
            }
        },
        "window":theWindow
    })(function(){
        [Import("aura-impl/src/main/resources/aura/Logging.js")]
    });


    [Fixture]
    function onerror() {
        [Fact]
        function OnErrorCallsExisting() {
            var reportError = Stubs.GetMethod("message", "err", false);
            var message = "message";
            var expectedError = "error";
            var file="file", line="line", col="col";

            Mocks.GetMocks(Object.Global(), {
                "$A": {
                    "reportError":reportError
                }
            })(function() {
                theWindow.onerror(message, file, line, col, expectedError);
            });
            Assert.Equal({"message":message, "url":file, "line":line, "col":col, "err":expectedError},
                existing_onerror.Calls[0].Arguments);
        }

        [Fact]
        function OnErrorCallsReportErrorWithExisting() {
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
            Assert.Equal({"message":expectedMessage, "err":expectedError}, reportError.Calls[0].Arguments);
        }

        [Fact]
        function OnErrorDoesNotCallConsoleLogIfNoReportAndExisting() {
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
            Assert.Equal(0, consoleError.Calls.length);
        }
    }
};
