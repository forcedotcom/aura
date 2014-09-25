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
    var $A = {
        ns: {}
    };

    //Mock the exp() function defined in Aura.js, this is originally used for exposing members using a export.js file
    Mocks.GetMocks(Object.Global(), { "$A": $A })(function(){
        // #import aura.Logger
    });

    var mockUtil = Mocks.GetMock(Object.Global(), "$A", {
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
        message: function() {}
    });

    [Fixture]
    function info() {

        var logger = new $A.ns.Logger(),
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

        var logger = new $A.ns.Logger(),
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

        var logger = new $A.ns.Logger(),
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

        var logger = new $A.ns.Logger(),
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
            Assert.Equal(expectedMsg, message);
            Assert.Equal(true, logger.hasSubscriptions(expectedLevel));
            Assert.Equal(undefined, error);
        }
    }

    [Fixture]
    function subscribe() {

        var logger = new $A.ns.Logger(),
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

        var logger = new $A.ns.Logger(),
            level, message, error;
        var cb = function(l, m, e) {
            level = l;
            message = m;
            error = e;
        };

        [Fact]
        function LoggerUnsubscibe() {
            logger.subscribe("INFO", cb);
            Assert.True(logger.hasSubscriptions("InFo"));

            logger.unsubscribe("INFO", cb);
            Assert.False(logger.hasSubscriptions("INFO"));
        }
    }

    [Fixture]
    function validation() {

        var logger = new $A.ns.Logger(),
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
};