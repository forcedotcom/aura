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
    var Aura = {Utils:{}};

    Mocks.GetMocks(Object.Global(), {
        "Aura": Aura,
        "Logger": function(){}
    })(function(){
        [Import("aura-impl/src/main/resources/aura/Logger.js")]
    });

    var messageCalled = false,
        showErrors    = true,
        mockGlobal      = Mocks.GetMock(Object.Global(), "$A", {
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
            },
            auraError: function(message) {
                return Error(message);
            }
        });

    [Fixture]
    function info() {
        var logger = new Aura.Utils.Logger(),
            level, message, error;


        [Fact]
        function InfoLogsWithINFOLevel() {
            var level = "INFO";
            var expected = "INFO";
            var actual;
            logger.subscribe(level, function(level, message, error) {
                actual = level;
            });
            mockGlobal(function() {
                logger.info(expected);
            });

            Assert.Equal(expected, actual);
        }

        [Fact]
        function InfoLogsMessage() {
            var level = "INFO";
            var expected = "expectedMsg";
            var actual;
            logger.subscribe(level, function(level, message, error) {
                actual = message;
            });
            mockGlobal(function() {
                logger.info(expected);
            });

            Assert.Equal(expected, actual);
        }

        [Fact]
        function SubscribeAddsSubscription() {
            var level = "INFO";
            var expected = "expectedMsg";
            var actual;

            logger.subscribe(level, function(level, message, error) {});

            Assert.True(logger.hasSubscriptions(level));
        }

        [Fact]
        function InfoLogsDoesNotHaveError() {
            var level = "INFO";
            var expected = "expectedMsg";
            var actual;
            logger.subscribe(level, function(level, message, error) {
                actual = error;
            });
            mockGlobal(function() {
                logger.info(expected);
            });

            Assert.Undefined(error);
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
            mockGlobal(function() {
                logger.warning(expectedMsg);
            });

            Assert.Equal(expectedMsg, message);
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
            mockGlobal(function() {
                logger.assert(false, expectedMsg);
            });

            Assert.Equal("Assertion Failed!: " + expectedMsg + " : " + condition, message);
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

        [Fact]
        function ErrorsLoggedToSubscriberUseERRORLevel() {
            var actual;
            var expected = "ERROR";
            var expectedLevel = "ERROR",
                expectedMsg = "expectedMsg";
            logger.subscribe(expectedLevel, function(level, message, error){actual = level;});
            
            mockGlobal(function() {
                logger.error(expectedMsg);
            });

            Assert.Equal(expected, actual);
        }

        [Fact]
        function ErrorsLoggedToSubscriber() {
            var actual;
            var expected = "expectedMsg";
            logger.subscribe("ERROR", function(level, message, error){actual = message;});
            
            mockGlobal(function() {
                logger.error(expected);
            });

            Assert.Contains(expected, actual);
        }

        [Fact]
        function ErrorsSubscriberAdded() {
            var actual;

            logger.subscribe("ERROR", function(level, message, error){});
            actual = logger.hasSubscriptions("ERROR");

            Assert.True(actual);
        }

        [Fact]
        function ErrorNotSpecifiedStillHasCallStack() {
            var actual;
            logger.subscribe("ERROR", function(level, message, error){ actual = error; });

            mockGlobal(function() {
                logger.error("error");
            });

            Assert.NotNull(actual.stack);
        }

        [Fact]
        function NoMessageWhenShowErrorsFalse() {
            var expectedLevel = "ERROR",
                expectedMsg = "expectedMsg";
            logger.subscribe(expectedLevel, function(level, message, error){});
            showErrors = false;
            mockGlobal(function() {
                logger.error(expectedMsg);
            });

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
            logger.unsubscribe("INFO", cb);

            Assert.False(logger.hasSubscriptions("INFO"));
        }

        [Fact]
        function SubscriberForLevelRemoved() {
            logger.subscribe("INFO", cb);
            logger.subscribe("WARNING", cb);
            logger.unsubscribe("INFO", cb);

            Assert.False(logger.hasSubscriptions("INFO"));
        }

        [Fact] // splice makes iteration dependent on traversal direction
        function OlderSubscriberRemoved() {
            logger.subscribe("INFO", cb);
            logger.subscribe("WARNING", cb);

            logger.unsubscribe("INFO", cb);
            Assert.False(logger.hasSubscriptions("INFO"));
        }

        [Fact] // splice makes iteration dependent on traversal direction
        function NewerSubscriberRemoved() {
            logger.subscribe("INFO", cb);
            logger.subscribe("WARNING", cb);
            logger.unsubscribe("WARNING", cb);

            Assert.False(logger.hasSubscriptions("WARNING"));
        }

        [Fact]
        function NoOpIfNotSubscriber() {
            logger.unsubscribe("INFO", cb);
            logger.subscribe("INFO", cb);

            Assert.True(logger.hasSubscriptions("InFo"));
        }
        
        [Fact]
        function NonSubscriberNotRemoved() {
            var expectedMsg = "expectedMsg";

            logger.subscribe("INFO", cb);
            logger.unsubscribe("INFO", function(){});
            
            Assert.True(logger.hasSubscriptions("INFO"));
        }

        [Fact]
        function WrongLevelNotRemoved() {
            var expectedMsg = "expectedMsg";

            logger.subscribe("INFO", cb);
            logger.unsubscribe("WARNING", cb);
            
            Assert.True(logger.hasSubscriptions("INFO"));
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
        var clientStackLength = -1;
        var mockAction = {
        		params : {},
                setParams: function(config) { 
                    if(config) {
                    	for ( var key in config) {
                    		this.params[key] = config[key];
                    	}
                    }
                },
                getParam: function(name) {
                	if(name) { 
                		return this.params[name];
                	}
                },
                setCallback: function() {},
                setCaboose: function() {}
            };

        var mockDeps = Mocks.GetMocks(Object.Global(), {"$A": {
                get: function() { return mockAction; },
                clientService: {
                    enqueueAction: function(reportAction) {
                    	called = true;
                    	var clientStack = reportAction.getParam('clientStack');
                    	if(clientStack) {
                    		clientStackLength = clientStack.length;
                    	}
                    }
                }
            }, Aura:{Utils:{Logger:{MAX_STACKTRACE_SIZE:25000}}}
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
        
        [Fact]
        function noLongerThan25000Charactors() {
        	var mockError = {
        		'stackTrace' : Array(25010).join('x'),
        		'reported' : false,
        		toString : function() { }
        	}
        	var target = new Error();

            mockDeps(function() {
                logger.reportError(mockError, "testAction", "testId");
            });
            
            Assert.True(clientStackLength === 25000);
        }
    }

    [Fixture]
    function isExternalError() {

        var logger = new Aura.Utils.Logger();

        var _AuraError;
        var _StackFrame;
        var _ErrorStackParser;

        Mocks.GetMocks(Object.Global(), {
            "Aura": {Errors: {}},
        })(function() {
            Import("aura-impl/src/main/resources/aura/polyfill/stackframe.js");
            Import("aura-impl/src/main/resources/aura/polyfill/error-stack-parser.js");
            Import("aura-impl/src/main/resources/aura/error/AuraError.js");
            _StackFrame = StackFrame;
            _ErrorStackParser = ErrorStackParser;
            _AuraError = AuraError;
            delete StackFrame;
            delete ErrorStackParser;
            delete AuraError;
        });

        function getAuraMock(during) {
            return Mocks.GetMocks(Object.Global(), {
                Aura: {
                    Errors: {
                        AuraError: _AuraError,
                        StackFrame: _StackFrame,
                        StackParser: _ErrorStackParser
                    }
                },
                $A: {
                    auraError: _AuraError
                }
            })(during);
        }

        [Fact]
        function ReturnFalseIfNoArgument() {
            Assert.False(logger.isExternalError());
        }

        [Fact]
        function ReturnTrueIfErrorIsFromExternalScript() {
            var e = new TypeError("Cannot read property tasks of undefined");
            e.stack = "throws at https://firstdata--prodcopy.cs42.my.salesforce.com/EXT/ext-3.3.3/ext.js:84:4150\n\
                at Object.removeAll (https://firstdata--prodcopy.cs42.my.salesforce.com/EXT/ext-3.3.3/ext.js:84:4150)\n\
                at Object._unload (https://firstdata--prodcopy.cs42.my.salesforce.com/EXT/ext-3.3.3/ext.js:84:5058)\n\
                at Object._unload (https://firstdata--prodcopy.cs42.my.salesforce.com/EXT/ext-3.3.3/ext.js:114:420)\n\
                at _unload (https://firstdata--prodcopy.cs42.my.salesforce.com/EXT/ext-3.3.3/ext.js:21:3823)";

            var expected;
            getAuraMock(function() {
                expected = logger.isExternalError(e);
            });
            Assert.True(expected);
        }

        [Fact]
        function ReturnTrueIfErrorIsFromExternalResource() {
            var e = new TypeError("Cannot read property zoomLevel of undefined");
            e.stack = "throws at https://adminlightningbsodf16.lightning.force.com/resource/infografx__ammap_3_14_1_sfdc:203:454\n\
                at b.update (https://adminlightningbsodf16.lightning.force.com/resource/infografx__ammap_3_14_1_sfdc:203:454)\n\
                at b.update (https://adminlightningbsodf16.lightning.force.com/resource/infografx__ammap_3_14_1_sfdc:142:267)\n\
                at Object.d.update (https://adminlightningbsodf16.lightning.force.com/resource/infografx__ammap_3_14_1_sfdc:11:190)\n\
                at https://adminlightningbsodf16.lightning.force.com/resource/infografx__ammap_3_14_1_sfdc:3:167";

            var expected;
            getAuraMock(function() {
                expected = logger.isExternalError(e);
            });
            Assert.True(expected);
        }

        [Fact]
        function ReturnTrueIfAuraErrorIsFromExternalScript() {
            var e = new TypeError("Cannot read property tasks of undefined");
            e.stack = "throws at https://firstdata--prodcopy.cs42.my.salesforce.com/EXT/ext-3.3.3/ext.js:84:4150\n\
                at Object.removeAll (https://firstdata--prodcopy.cs42.my.salesforce.com/EXT/ext-3.3.3/ext.js:84:4150)\n\
                at Object._unload (https://firstdata--prodcopy.cs42.my.salesforce.com/EXT/ext-3.3.3/ext.js:84:5058)\n\
                at Object._unload (https://firstdata--prodcopy.cs42.my.salesforce.com/EXT/ext-3.3.3/ext.js:114:420)\n\
                at _unload (https://firstdata--prodcopy.cs42.my.salesforce.com/EXT/ext-3.3.3/ext.js:21:3823)";

            var expected;
            getAuraMock(function() {
                var ae = new $A.auraError(null, e);
                expected = logger.isExternalError(ae);
            });
            Assert.True(expected);
        }

        [Fact]
        function ReturnFalseIfAuraErrorIsFromBareGetCallback() {
            var e = new Error();
            e.message = "Error from app client controller";
            e.stack = "Error: Error from app client controller\n\
                at eval (http://bah.lightning.localhost.force.com:6109/components/c/testErrors.js:15:35)\n\
                at http://bah.lightning.localhost.force.com:6109/auraFW/javascript/0A2soY7cB16nI8uLh9j3sA/aura_dev.js:19185:23";

            var expected;
            getAuraMock(function() {
                var ae = new $A.auraError(null, e);
                expected = logger.isExternalError(ae);
            });
            Assert.False(expected);
        }

        [Fact]
        function ReturnFalseIfAuraErrorIsNotFromExternalScript() {
            var e = new Error();
            e.message = "Error from app client controller";
            e.stack = "Error: Error from app client controller\n\
    at throwErrorFromClientController (http://localhost:9090/components/auratest/errorHandlingApp.js:42:15)\n\
    at Action.$runDeprecated$ (http://localhost:9090/auraFW/javascript/iMVf5-orschKyiiWELafJg/aura_dev.js:8469:36)\n\
    at Object.Component$getActionCaller [as $handler$] (http://localhost:9090/auraFW/javascript/iMVf5-orschKyiiWELafJg/aura_dev.js:6695:20)\n\
    at Aura.$Event$.$Event$.$executeHandlerIterator$ (http://localhost:9090/auraFW/javascript/iMVf5-orschKyiiWELafJg/aura_dev.js:8100:15)\n\
    at Aura.$Event$.$Event$.$executeHandlers$ (http://localhost:9090/auraFW/javascript/iMVf5-orschKyiiWELafJg/aura_dev.js:8078:8)\n\
    at http://localhost:9090/auraFW/javascript/iMVf5-orschKyiiWELafJg/aura_dev.js:8130:10\n\
    at AuraInstance.$run$ (http://localhost:9090/auraFW/javascript/iMVf5-orschKyiiWELafJg/aura_dev.js:18350:12)\n\
    at Aura.$Event$.$Event$.$fire$ (http://localhost:9090/auraFW/javascript/iMVf5-orschKyiiWELafJg/aura_dev.js:8128:6)\n\
    at Object.catchAndFireEvent (http://localhost:9090/components/ui/button.js:90:33)\n\
    at press (http://localhost:9090/components/ui/button.js:34:16)";

            var expected;
            getAuraMock(function() {
                var ae = new $A.auraError(null, e);
                expected = logger.isExternalError(ae);
            });
            Assert.False(expected);
        }
    }
};
