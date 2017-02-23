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
Function.RegisterNamespace("Test.Aura.Component");

[Fixture]
Test.Aura.Component.ActionValueProviderTest = function() {
    var _actionValueProvider;

    Mocks.GetMocks(Object.Global(), {
        "Aura": { "Component": {} },
        "ActionDef": function(){},
        "$A": {}
    })(function() {
        Import("aura-impl/src/main/resources/aura/component/ActionValueProvider.js");
        _actionValueProvider = ActionValueProvider;
        delete ActionValueProvider;
    });

    function getAuraMock(during) {
        return Mocks.GetMocks(Object.Global(), {
            "Aura": {
                "Component": {
                    "ActionValueProvider": _actionValueProvider
                }
            },
            "$A": {
                "warning": function() {},
                "auraError" : function(msg) {
                    return {
                        message: msg,
                        setComponent: function(){}
                    };
                },
                "util" : {
                    "getComponentHierarchy": function() {}
                }
            }
        })(during);
    }

    [Fixture]
    function Get() {
        [Fact]
        function ThrowsWhenNoActionDef() {
            var key = "test";
            var expected = "Unknown controller action '"+key+"'";
            var actual;

            var mockComponent = {
                "getDef" : function() {
                    return {
                        "getDescriptor" : function() {
                            return "test";
                        }
                    };
                }
            };

            getAuraMock(function () {
                var avp = new Aura.Component.ActionValueProvider(mockComponent, null);
                try {
                    avp.get(key);
                } catch (e) {
                    actual = e.message;
                    Assert.Equal(expected, actual);
                }
            });
        }
    }
}
