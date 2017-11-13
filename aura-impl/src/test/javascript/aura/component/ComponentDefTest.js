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
                "auraError": function() {
                    return {
                        setComponent: function(){}
                    };
                },
                "componentService": {
                    "createComponentDef": function() {
                        return {
                            getAllStyleDefs: function() {},
                            getAllFlavoredStyleDefs: function() {}
                        };
                    }
                }
            },
            "DefDescriptor": function() {
                return {
                    "getNamespace": function() {},
                    "getFullName": function() {}
                };
            },
            "Json": {
                "ApplicationKey": {
                    "ACCESS": "access",
                    "HANDLERDEFS": "handlerDefs",
                    "NAME": "name",
                    "VALUE": "value"
                }
            },
            "AttributeDefSet": function() {},
            "RequiredVersionDefSet": function() {}
        })(during);
    }

    [Fixture]
    function constructor() {
        var mockAura = Mocks.GetMocks(Object.Global(), {
            "Aura": {
                "Component": {
                    "ComponentDef": _componentDef
                }
            },
            "$A": {
                "auraError": function(msg) {
                    return {
                        message: msg,
                        setComponent: function(cmp) {
                            this.component = cmp;
                        }
                    };
                },
                "componentService": {
                    "createComponentDef": function() {
                        return null;
                    }
                }
            },
            "DefDescriptor": function() {
                return {
                    "getNamespace": function() {},
                    "getFullName": function() {
                        return "ns:cmp";
                    }
                };
            },
            "Json": {
                "ApplicationKey": {
                    "DESCRIPTOR": "descriptor",
                    "SUPERDEF": "super"
                }
            },
            "AttributeDefSet": function() {},
            "RequiredVersionDefSet": function() {}
        });

        [Fact]
        function throwsErrorWithFailingDescriptor() {
            var actual;
            var expect = "ns:cmp";
            mockAura(function () {
                try {
                    new Aura.Component.ComponentDef({});
                } catch(e) {
                    actual = e.component;
                }
            });

            Assert.Equal(expect, actual);
        }

        [Fact]
        function throwsErrorWithSuperDescriptorInMessage() {
            var actual;
            var expect = "superDefDescriptor";
            mockAura(function () {
                try {
                    new Aura.Component.ComponentDef({
                        "super": {
                            descriptor: expect
                        }
                    });
                } catch(e) {
                    actual = e.message;
                }
            });

            Assert.True(actual.indexOf(expect) > -1);
        }
    }

    [Fixture]
    function hasInit() {

        [Fact]
        function ReturnsFalseWhenNoValueHandlerDefs() {
            // Arrange
            var cmpDef;
            getAuraMock(function () {
                cmpDef = new Aura.Component.ComponentDef({});
            });

            // Act
            var actual = cmpDef.hasInit();

            // Assert
            Assert.False(actual);
        }

        [Fact]
        function ReturnsTrueWhenHasInitValueDefHandlerDef() {
            // Arrange
            var mockConfig = {
                "handlerDefs": [
                    {
                        "value": {},
                        "name" : "init"
                    }
                ]
            };
            var cmpDef;
            getAuraMock(function() {
                cmpDef = new Aura.Component.ComponentDef(mockConfig);
            });

            // Act
            var actual = cmpDef.hasInit();

            // Assert
            Assert.True(actual);
        }

        [Fact]
        function ReturnsFalseWhenNoInitValueDefHandlerDef() {
            // Arrange
            var mockConfig = {
                "handlerDefs": [
                    {
                        "value": {},
                        "name" : "foo"
                    }
                ]
            };
            var cmpDef;
            getAuraMock(function() {
                cmpDef = new Aura.Component.ComponentDef(mockConfig);
            });

            // Act
            var actual = cmpDef.hasInit();

            // Assert
            Assert.False(actual);
        }
    }
}
