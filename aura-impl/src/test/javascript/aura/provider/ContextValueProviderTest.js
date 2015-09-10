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
Function.RegisterNamespace("Test.Aura.Provider");

[ Fixture ]
Test.Aura.Provider.ContextValueProviderTest = function() {
    var $A = {
    };
    var Aura = {Provider: {}};
    
    Mocks.GetMocks(Object.Global(), { 
        "Aura": Aura,
        "ContextValueProvider": function(){}
    })(function(){
        [Import("aura-impl/src/main/resources/aura/provider/ContextValueProvider.js")]
    });

    var mockDollarA = function(isExpression) {
        $A.util = {};
        $A.util.isExpression = function() { return isExpression; };
        $A.assert = Stubs.GetMethod("value", "message", null);
        return Mocks.GetMocks(Object.Global(), { "$A":$A });
    };

    var getStandardSet = function() {
        return {
            "writable" : { "defaultValue":"start", "writable":true },
            "readOnly" : { "defaultValue":"value" }
        };
    };

    var getCVP = function() {
        var target = new Aura.Provider.ContextValueProvider();
        target.merge(getStandardSet());
        return target;
    };

    [Fixture]
    function Merge() {
        /*
         * Merge is the only place here where we need to understand the internals. Really, I'd rather we
         * didn't depend on them at all, but we have to verify something in a simple manner. This allows
         * us to then use merge to populate the GVP, and use other routines to verify the public API.
         */
        [Fact]
        function BasicTest() {
            var target = getCVP();

            Assert.Equal(getStandardSet(), target.values);
        }

        [Fact]
        function BadValuesThrow() {
            var target = new Aura.Provider.ContextValueProvider();
            // record exception
            var actual = Record.Exception(function(){
                target.merge({ "readOnly" : "baffle" });
            });
            Assert.Equal("Invalid merge value at key 'readOnly' with value 'baffle'", actual.toString());
        }

        [Fact]
        function OverwriteGVOnSecondMerge() {
            var target = getCVP();
            var expected = { "writable" : { "defaultValue":"start", "writable":true },
                "readOnly" : { "defaultValue":"baffle", "writable":true } };

            target.merge({ "readOnly" : { "defaultValue":"baffle", "writable":true } });

            Assert.Equal(expected, target.values);
        }
        
        [Fact]
        function OverwriteValueOnSecondMerge() {
            var target = getCVP();
            var expected = { "writable" : { "defaultValue":"start", "writable":true },
                "readOnly" : { "defaultValue":"baffle" } };

            target.merge({ "readOnly" : { "defaultValue":"baffle" }});

            Assert.Equal(expected, target.values);
        }

        [Fact]
        function NoOverwriteValueOnSetWritable() {
            var target = getCVP();
            var expected = { "writable" : { "value":"end", "defaultValue":"start", "writable":true },
                "readOnly" : { "defaultValue":"value" } };

            mockDollarA()(function () {
                target.set("writable", "end");
                target.merge({ "writable" : { "value":"flub", "defaultValue":"start", "writable":true }});
            });

            Assert.Equal(expected, target.values);
        }

        [Fact]
        function OverwriteValueOnReadOnly() {
            var target = getCVP();
            var expected = { "writable" : { "defaultValue":"start", "writable":true },
                "readOnly" : { "value":"two", "defaultValue":"value" } };

            target.merge({ "readOnly" : { "value":"one", "defaultValue":"value" }});
            target.merge({ "readOnly" : { "value":"two", "defaultValue":"value" }});

            Assert.Equal(expected, target.values);
        }
    }

    [Fixture]
    function GetStorableValues() {
        [Fact]
        function StartsEmpty() {
            var target = new Aura.Provider.ContextValueProvider();

            var result = target.getStorableValues();

            Assert.Equal({}, result);
        }

        [Fact]
        function MergeToEmptyGetsIdentical() {
            var target = new Aura.Provider.ContextValueProvider();
            var toMerge = { "test":{"defaultValue":"value"} };

            target.merge(toMerge);

            var result = target.getStorableValues();

            Assert.Equal(toMerge, result);
        }

        [Fact]
        function TwoMergeToEmptyGetsCombined() {
            var target = getCVP();
            var toMerge = { "test":{"defaultValue":"value"} };
            var expected = {
                "writable" : { "defaultValue":"start", "writable":true },
                "readOnly" : { "defaultValue":"value" },
                "test":{"defaultValue":"value"}
            };

            target.merge(toMerge);

            var result = target.getStorableValues();

            Assert.Equal(expected, result);
        }

        [Fact]
        function SetAddsValueToStorable() {
            var target = getCVP();
            var expected = {
                "writable" : { "value":"end", "defaultValue":"start", "writable":true },
                "readOnly" : { "defaultValue":"value" }
            };

            mockDollarA()(function () {
                target.set("writable", "end");
            });

            var result = target.getStorableValues();

            Assert.Equal(expected, result);
        }
    }

    [Fixture]
    function Get() {
        [Fact]
        function GetReadOnlyValue() {
            var target = getCVP();
            var actual, expected = "value";

            mockDollarA()(function() {
                actual = target.get("readOnly");
            });

            Assert.Equal(expected, actual);
        }

        [Fact]
        function GetWritableValue() {
            var target = getCVP();
            var actual, expected = "start";

            mockDollarA()(function() {
                actual = target.get("writable");
            });

            Assert.Equal(expected, actual);
        }

        [Fact]
        function GetFailsOnNonExistingKey() {
            var target = getCVP();
            var actual;

            actual = Record.Exception(function() {
                mockDollarA()(function () {
                    target.get("anIllegalValue");
                });
            });

            Assert.Equal("Attempting to retrieve an unknown global item 'anIllegalValue'. Global items must be pre-registered and have a default value", actual.message);
        }
    }

    [Fixture]
    function Set() {
        [Fact]
        function SetWritableFollowedByGet() {
            var target = getCVP();
            var actual, expected = "end";

            mockDollarA()(function() {
                target.set("writable", expected);
                actual = target.get("writable");
            });

            Assert.Equal(expected, actual);
        }

        [Fact]
        function SetNonWritableThrows() {
            var target = getCVP();
            var actual;

            actual = Record.Exception(function() {
                mockDollarA()(function () {
                    target.set("readOnly");
                });
            });

            Assert.Equal("Attempting to set a read only global item 'readOnly'", actual.message);
        }

        [Fact]
        function SetNonExistantThrows() {
            var target = getCVP();
            var actual;

            actual = Record.Exception(function() {
                mockDollarA()(function () {
                    target.set("anIllegalValue");
                });
            });

            Assert.Equal("Attempting to set an unknown global item 'anIllegalValue'. Global items must be pre-registered and have a default value", actual.message);
        }

        [Fact]
        function SetKeyHasDotThrows() {
            var target = getCVP();
            var actual;

            actual = Record.Exception(function() {
                mockDollarA()(function () {
                    target.set("blah.blah");
                });
            });

            Assert.Equal(1, $A.assert.Calls.length);
            Assert.Equal(false, $A.assert.Calls[0].Arguments.value);
            Assert.Equal("Unable to set value for key 'blah.blah', did you add an extra '.'?", $A.assert.Calls[0].Arguments.message);
            Assert.Equal("Attempting to set an unknown global item 'blah.blah'. Global items must be pre-registered and have a default value", actual.message);
        }

        [Fact]
        function SetValueIsExpressionThrows() {
            var target = getCVP();
            var actual;

            actual = Record.Exception(function() {
                mockDollarA(true)(function () {
                    target.set("writable", "new");
                });
            });

            Assert.Equal("Unable to set global value 'writable' to the expression 'new'. Global items must be constants", actual.message);
        }
    }

    [Fixture]
    function GetValues() {
        [Fact]
        function StartsEmpty() {
            var target = new Aura.Provider.ContextValueProvider();

            var result = target.getValues();

            Assert.Equal({}, result);
        }

        [Fact]
        function InitialValuesOnMerge() {
            var target = getCVP();
            var expected = {
                "writable" : "start",
                "readOnly" : "value"
            };
            var result = target.getValues();

            Assert.Equal(expected, result);
        }

        [Fact]
        function SetChangesValues() {
            var target = getCVP();
            var expected = {
                "writable" : "end",
                "readOnly" : "value"
            };

            mockDollarA()(function () {
                target.set("writable", "end");
            });

            var result = target.getValues();

            Assert.Equal(expected, result);
        }
    }

    [Fixture]
    function SerializeForServer() {
        [Fact]
        function StartsEmpty() {
            var target = new Aura.Provider.ContextValueProvider();

            var result = target.serializeForServer();

            Assert.Equal({}, result);
        }

        [Fact]
        function InitialValuesOnMerge() {
            var target = getCVP();
            var expected = { };
            var result = target.serializeForServer();

            Assert.Equal(expected, result);
        }

        [Fact]
        function SetChangesValues() {
            var target = getCVP();
            var expected = {
                "writable" : "end",
            };

            mockDollarA()(function () {
                target.set("writable", "end");
            });

            var result = target.serializeForServer();

            Assert.Equal(expected, result);
        }

        [Fact]
        function ReadOnlyMergeValuesSent() {
            var target = getCVP();
            var expected = { "readOnly":"bar" };

            target.merge({"readOnly":{"defaultValue":"foo", "value":"bar"}});
            var result = target.serializeForServer();

            Assert.Equal(expected, result);
        }
    }
}
