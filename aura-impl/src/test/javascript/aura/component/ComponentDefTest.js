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
Test.Aura.Component.ComponentDefTest = function() {
    var _componentDef;

    Mocks.GetMocks(Object.Global(), {
        "Aura": { "Component": {} },
        "$A": {}
    })(function() {
        Import("aura-impl/src/main/resources/aura/component/ComponentDef.js");
        _componentDef = ComponentDef;
        delete ComponentDef;
    });

    function getAuraMock(during) {
        return Mocks.GetMocks(Object.Global(), {
            "Aura": {
                "Component": {
                    "ComponentDef": _componentDef
                }
            },
            "$A": {
            },
            "DefDescriptor": function() {
                return {
                    "getNamespace": function() {}
                };
            },
            "Json": {
                "ApplicationKey": {
                    "ACCESS": "access"
                }
            },
            "AttributeDefSet": function() {},
            "RequiredVersionDefSet": function() {}
        })(during);
    }

    [Fixture]
    function HasInit() {
        [Fact]
        function ReturnsFalseWhenNoValueHandlerDefs() {
            var actual;
            getAuraMock(function () {
                var cd = new Aura.Component.ComponentDef({});
                actual = cd.hasInit();
                Assert.False(actual);
            });
        }

        [Fact]
        function ReturnsTrueWhenHasInitValueDefHandlerDef() {
            var actual;
            var mockConfig = {
                "handlerDefs": [
                    {
                        "value": {},
                        "name" : "init"
                    }
                ]
            };
            getAuraMock(function() {
                var cd = new Aura.Component.ComponentDef(mockConfig);
                actual = cd.hasInit();
                Assert.True(actual);
            });
        }

        [Fact]
        function ReturnsFalseWhenNoInitValueDefHandlerDef() {
            var actual;
            var mockConfig = {
                "handlerDefs": [
                    {
                        "value": {},
                        "name" : "foo"
                    }
                ]
            };
            getAuraMock(function() {
                var cd = new Aura.Component.ComponentDef(mockConfig);
                actual = cd.hasInit();
                Assert.False(actual);
            });
        }
    }
}