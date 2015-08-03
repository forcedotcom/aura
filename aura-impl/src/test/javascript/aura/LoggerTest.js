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
    var Aura = {Utils:{SecureFilters:{}}};

    Mocks.GetMocks(Object.Global(), {Aura: Aura })(function(){
        [Import("aura-impl/src/main/resources/aura/Logger.js")]
    });

    var messageCalled = false,
        showErrors    = true,
        mockUtil      = Mocks.GetMock(Object.Global(), "$A", {
            util: {
                isString: function (obj) {
                    return typeof obj === 'string';
                },
                isError: function (obj) {
                    return !!obj && this.objToString.apply(obj) === '[object Error]';
                },
                isUndefinedOrNull: function (obj) {
                    return obj === undefined || obj === null;
                },
                isObject: function(obj){
                    return typeof obj === "object" && obj !== null && !this.isArray(obj);
                },
                isArray: typeof Array.isArray === "function" ? Array.isArray : function(obj) {
                    return obj instanceof Array;
                },
                objToString: Object.prototype.toString
            },
            message: function() {
                messageCalled = true;
            },
            showErrors: function() {
                return showErrors;
            }
        });

    [Fixture]
    function info() {

        var logger = new Aura.Utils.Logger(),
            level, message, error;
        var cb = function(l, m, e) {
            level = l;
            message = m;
            error = e;
        };

        [Fact]
        function InfoLog() {
            var expectedLevel = "INFO",
                expectedMsg = "expectedMsg";
            logger.subscribe(expectedLevel, cb);
            mockUtil(function() {
                logger.info(expectedMsg);
            });

            Assert.Equal(expectedLevel, level);
            Assert.Equal(expectedMsg, message);
            Assert.Equal(true, logger.hasSubscriptions(expectedLevel));
            Assert.Equal(undefined, error);
        }
    }

    [Fixture]
    function warning() {

        var logger = new Aura.Utils.Logger(),
            level, message, error;
        var cb = function(l, m, e) {
            level = l;
            message = m;
            error = e;
        };

        [Fact]
        function WarningLog() {
            var expectedLevel = "WARNING",
                expectedMsg = "expectedMsg";
            logger.subscribe(expectedLevel, cb);
            mockUtil(function() {
                logger.warning(expectedMsg);
            });

            Assert.Equal(expectedLevel, level);
            Assert.Equal(expectedMsg, message);
            Assert.Equal(true, logger.hasSubscriptions(expectedLevel));
            Assert.Equal(undefined, error);
        }
    }

    [Fixture]
    function assertion() {

        var logger = new Aura.Utils.Logger(),
            level, message, error;
        var cb = function(l, m, e) {
            level = l;
            message = m;
            error = e;
        };

        [Fact]
        function AssertFalse() {
            var expectedLevel = "ASSERT",
                expectedMsg = "expectedMsg",
                condition = false;
            logger.subscribe(expectedLevel, cb);
            mockUtil(function() {
                logger.assert(false, expectedMsg);
            });

            Assert.Equal(expectedLevel, level);
            Assert.Equal("Assertion Failed!: " + expectedMsg + " : " + condition, message);
            Assert.Equal(true, logger.hasSubscriptions(expectedLevel));
            Assert.Equal(undefined, error);
        }

        [Fact]
        function AssertTrue() {
            var called = false;
            logger.log = function() {
                called = true;
            };

            logger.assert(true, "blah");

            Assert.False(called);
        }
    }

    [Fixture]
    function error() {

        var logger = new Aura.Utils.Logger(),
            level, message, error;
        var cb = function(l, m, e) {
            level = l;
            message = m;
            error = e;
        };

        [Fact]
        function ErrorLog() {
            var expectedLevel = "ERROR",
                expectedMsg = "expectedMsg";
            logger.subscribe(expectedLevel, cb);
            mockUtil(function() {
                logger.error(expectedMsg);
            });

            Assert.Equal(expectedLevel, level);
            Assert.Equal(0, message.indexOf(expectedMsg));
            Assert.Equal(true, logger.hasSubscriptions(expectedLevel));
            Assert.Equal(undefined, error);
        }

        [Fact]
        function NoMessageWhenShowErrorsFalse() {
            var expectedLevel = "ERROR",
                expectedMsg = "expectedMsg";
            logger.subscribe(expectedLevel, cb);
            showErrors = false;
            mockUtil(function() {
                logger.error(expectedMsg);
            });

            Assert.Equal(expectedLevel, level);
            Assert.Equal(0, message.indexOf(expectedMsg));
            Assert.Equal(true, logger.hasSubscriptions(expectedLevel));
            Assert.Equal(undefined, error);
            Assert.False(messageCalled);
            // reset
            messageCalled = false;
            showErrors = true;
        }
    }

    [Fixture]
    function subscribe() {

        var logger = new Aura.Utils.Logger(),
            level, message, error;
        var cb = function(l, m, e) {
            level = l;
            message = m;
            error = e;
        };

        [Fact]
        function LoggerSubscibe() {
            logger.subscribe("INFO", cb);
            // case insensitive
            Assert.True(logger.hasSubscriptions("iNFo"));
        }
    }

    [Fixture]
    function unsubscribe() {

        var logger = new Aura.Utils.Logger(),
            level, message, error;
        var cb = function(l, m, e) {
            level = l;
            message = m;
            error = e;
        };

        [Fact]
        function SubscriberRemoved() {
            logger.subscribe("INFO", cb);
            Assert.True(logger.hasSubscriptions("InFo"));

            logger.unsubscribe("INFO", cb);
            Assert.False(logger.hasSubscriptions("INFO"));
        }

        [Fact]
        function SubscriberForLevelRemoved() {
            logger.subscribe("INFO", cb);
            Assert.True(logger.hasSubscriptions("InFo"));
            logger.subscribe("WARNING", cb);
            Assert.True(logger.hasSubscriptions("Warning"));

            logger.unsubscribe("INFO", cb);
            Assert.False(logger.hasSubscriptions("INFO"));
            Assert.True(logger.hasSubscriptions("WARNING"));
        }

        [Fact] // splice makes iteration dependent on traversal direction
        function OlderSubscriberRemoved() {
            logger.subscribe("INFO", cb);
            Assert.True(logger.hasSubscriptions("InFo"));
            logger.subscribe("WARNING", cb);
            Assert.True(logger.hasSubscriptions("Warning"));

            logger.unsubscribe("INFO", cb);
            Assert.False(logger.hasSubscriptions("INFO"));
            Assert.True(logger.hasSubscriptions("WARNING"));
        }

        [Fact] // splice makes iteration dependent on traversal direction
        function NewerSubscriberRemoved() {
            logger.subscribe("INFO", cb);
            Assert.True(logger.hasSubscriptions("InFo"));
            logger.subscribe("WARNING", cb);
            Assert.True(logger.hasSubscriptions("Warning"));

            logger.unsubscribe("WARNING", cb);
            Assert.True(logger.hasSubscriptions("INFO"));
            Assert.False(logger.hasSubscriptions("WARNING"));
        }

        [Fact]
        function NoOpIfNotSubscriber() {
            logger.unsubscribe("INFO", cb);
            Assert.False(logger.hasSubscriptions("INFO"));

            logger.subscribe("INFO", cb);
            Assert.True(logger.hasSubscriptions("InFo"));
        }
        
        [Fact]
        function NonSubscriberNotRemoved() {
            var expectedMsg = "expectedMsg";
            logger.subscribe("INFO", cb);
            Assert.True(logger.hasSubscriptions("InFo"));

            logger.unsubscribe("INFO", function(){});
            Assert.True(logger.hasSubscriptions("INFO"));
            
            mockUtil(function() {
                logger.info(expectedMsg);
            });
            Assert.Equal(expectedMsg, message);
        }

        [Fact]
        function WrongLevelNotRemoved() {
            var expectedMsg = "expectedMsg";
            logger.subscribe("INFO", cb);
            Assert.True(logger.hasSubscriptions("InFo"));

            logger.unsubscribe("WARNING", cb);
            Assert.True(logger.hasSubscriptions("INFO"));
            
            mockUtil(function() {
                logger.info(expectedMsg);
            });
            Assert.Equal(expectedMsg, message);
        }
    }

    [Fixture]
    function validation() {

        var logger = new Aura.Utils.Logger(),
            level, message, error;
        var cb = function(l, m, e) {
            level = l;
            message = m;
            error = e;
        };

        [Fact]
        function InvalidLevel() {
            try {
                logger.subscribe("WRONG", cb);
                Assert.Fail("Should have thrown error for invalid level");
            } catch (e) {
                Assert.Equal("Please specify valid log level: 'INFO', 'WARNING', 'ASSERT', 'ERROR'", e);
            }
        }

        [Fact]
        function InvalidCallback() {
            try {
                logger.subscribe("INFO", true);
                Assert.Fail("Should have thrown error for invalid callback");
            } catch (e) {
                Assert.Equal("Logging callback must be a function", e);
            }
        }
    }

    [Fixture]
    function reportError() {
        var logger = new Aura.Utils.Logger();
        var called = false;
        var mockAction = {
                setAbortable: function() {},
                setParams: function() {},
                setCallback: function() {}
            };

        var mockDeps = Mocks.GetMock(Object.Global(), "$A", {
                get: function() { return mockAction; },
                clientService: {
                    enqueueAction: function() {called = true;}
                }
            });

        [Fact]
        function earlyReturnsIfReported() {
            var target = new Error();
            target["reported"] = true;

            mockDeps(function() {
                logger.reportError(target, "testAction", "testId");
            });

            Assert.False(called);
        }

        [Fact]
        function enqueuesAction() {
            var target = new Error();

            mockDeps(function() {
                logger.reportError(target, "testAction", "testId");
            });

            Assert.True(called);
        }

        [Fact]
        function setsErrorReported() {
            var target = new Error();

            mockDeps(function() {
                logger.reportError(target, "testAction", "testId");
            });

            Assert.True(target["reported"]);
        }
    }
};
