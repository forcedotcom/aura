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
Test.Aura.Component.ComponentDefRegistryTest = function() {
    Mocks.GetMock(Object.Global(), "window", {})(function() {
            // #import aura.component.ComponentDefRegistry
    });

    var makeDefDescriptor = function(name) {
        return {
            "toString" : function() { return name; },
            "getNamespace" : function() { return "namespace:" + name; }
        };
    };

    [Fixture]
    function AuraType() {

        [Fact]
        function HasCorrectAuraType() {
            // Arrange
            var expected = "ComponentDefRegistry";

            // Act
            var target = new ComponentDefRegistry();
            var actual = target.auraType;

            // Assert
            Assert.Equal(expected, actual);
        }

    }

    [Fixture]
    function GetDef() {

        var mockComponentDef = function () {
            return Mocks.GetMock(Object.Global(), "$A", {
                ns: {
                    ComponentDef: function (config) {
                        return {
                            "config": config,
                            "getDescriptor": function () {
                                return makeDefDescriptor(config["descriptor"]);
                            }
                        }
                    }
                },
                util: {
                    isString: function () {
                        return true;
                    },
                    isUndefinedOrNull: function (obj) {
                        return obj === undefined || obj === null;
                    }
                },
                warning: function (message, error) {},
                assert: function (condition, message) {
                    if (!condition) {
                        throw new Error(message);
                    }
                },
                Perf: {
                    mark: function () {},
                    endMark: function () {}
                }
            });
        };

        [Fact]
        function ThrowsIfConfigParamUndefined() {
            // Arrange
            var target = new ComponentDefRegistry();
            var expected = "ComponentDef Config required for registration";
            var actual;

            // Act
            mockComponentDef()(function () {
                actual = Record.Exception(function () {
                    target.getDef(undefined);
                });
            });

            // Assert
            Assert.Equal(expected, actual);
        }

        [Fact]
        function ReturnsDefIfFound() {
            // Arrange
            var expected = "ComponentDef";
            var target = new ComponentDefRegistry();
            var descriptor = "markup://foo:bar";
            target.componentDefs[descriptor] = expected;
            var actual;

            // Act
            mockComponentDef()(function () {
                actual = target.getDef(descriptor);
            });

            // Assert
            Assert.Equal(expected, actual);
        }

        [Fact]
        function SupportsShortHandFormatOfDescriptor() {
            // Arrange
            var expected = "ComponentDef";
            var target = new ComponentDefRegistry();
            var descriptor = "markup://foo:bar";
            target.componentDefs[descriptor] = expected;
            var actual;

            // Act
            mockComponentDef()(function () {
                actual = target.getDef("foo:bar");
            });

            // Assert
            Assert.Equal(expected, actual);
        }

        [Fact]
        function SupportsDescriptorInMapFormat() {
            // Arrange
            var expected = "ComponentDef";
            var target = new ComponentDefRegistry();
            var descriptor = "markup://foo:bar";
            target.componentDefs[descriptor] = expected;
            var actual;

            // Act
            mockComponentDef()(function () {
                actual = target.getDef({
                    "descriptor": "foo:bar"
                });
            });

            // Assert
            Assert.Equal(expected, actual);
        }

        [Fact]
        function RegistersConfigAsNewDefIfDoesntExist() {
            // Arrange
            var target = new ComponentDefRegistry();
            var newConfig = {
                "descriptor": "markup://foo:bar",
                "rendererDef": {}
            };
            var registeredDef;
            var actualDef;

            // Act
            // Should register the given config
            mockComponentDef()(function () {
                registeredDef = target.getDef(newConfig);
            });
            var registeredConfig = registeredDef["config"];

            // Assert
            Assert.Equal(newConfig, registeredConfig);
        }

        [Fact]
        function GetExistingDef() {
            // Arrange
            var target = new ComponentDefRegistry();
            var newConfig = {
                "descriptor": "markup://foo:bar",
                "rendererDef": {}
            };
            var registeredDef;
            var actualDef;

            // Act
            // Should register the given config
            mockComponentDef()(function () {
                registeredDef = target.getDef(newConfig);
            });
            // Re-fetch def
            mockComponentDef()(function () {
                actualDef = target.getDef("markup://foo:bar");
            });

            // Assert
            Assert.Equal(registeredDef, actualDef);
        }

        [Fact]
        function ShouldSaveDefToStorage() {
            //Arrange
            var target = new ComponentDefRegistry();
            var descriptor = "layout://foo:bar";
            var actual;
            target.saveToStorage = function (desc, config) {
                actual = {"descriptor": desc, "config": config};
            };
            var newConfig = {
                "descriptor": descriptor,
                "rendererDef": {}
            };
            var expected = {
                "descriptor": descriptor,
                "config": newConfig
            };
            // Act
            mockComponentDef()(function () {
                target.getDef(newConfig);
            });

            // Assert
            Assert.Equal(expected, actual);
        }

        [Fact]
        function ShouldNotSaveDefToStorage() {
            //Arrange
            var target = new ComponentDefRegistry();
            var saved = false;
            target.saveToStorage = function (desc, config) {
                saved = true;
            };
            var newConfig = {
                "descriptor": "markup://foo:bar",
                "rendererDef": {}
            };
            // Act
            mockComponentDef()(function () {
                target.getDef(newConfig);
            });

            // Assert
            Assert.False(saved);
            Assert.Equal(0, target.dynamicNamespaces.length)
        }
    };

    [Fixture]
    function SetupDefinitionStorage() {

        var mockStorageService = function (persistent, secure) {
            return Mocks.GetMock(Object.Global(), "$A", {
                storageService: {
                    initStorage: function() {
                        return {
                            isPersistent: function() {
                                return persistent;
                            },
                            isSecure: function() {
                                return secure
                            }
                        }
                    },
                    deleteStorage: function() {}
                }
            });
        };

        [Fact]
        function ShouldNotUseNotPersistentNotSecureStorage() {
            var target = new ComponentDefRegistry();
            target.useDefStore = undefined;
            mockStorageService(false, false)(function () {
                target.setupDefinitionStorage();
            });

            Assert.False(target.useDefStore);
            Assert.True(target.definitionStorage === undefined);
        }

        function OnlyUsePersistentAndSecure() {
            var target = new ComponentDefRegistry();
            target.useDefStore = undefined;
            mockStorageService(true, true)(function () {
                target.setupDefinitionStorage();
            });

            Assert.True(target.useDefStore);
            Assert.True(target.definitionStorage !== undefined);
        }

    }

    [Fixture]
    function SaveAllToRegistry() {

        var mockUtil = function(isArray, decoded) {
            return Mocks.GetMock(Object.Global(), "$A", {
                util: {
                    isArray: function() {
                        return isArray;
                    },
                    isUndefinedOrNull: function(obj) {
                        return obj === undefined || obj === null;
                    },
                    json: {
                        decode: function() {
                            return decoded;
                        }
                    }
                },
                warning: function(msg) {

                }
            });
        };

        [Fact]
        function ShouldSaveToRegistry() {
            var target = new ComponentDefRegistry();
            var descriptor = "layout://foo:bar";
            var newConfig = {
                "descriptor": descriptor,
                "rendererDef": {}
            };
            var items = [{
                key: descriptor,
                value: newConfig
            }];
            var actual;
            target.saveComponentDef = function(config) {
                actual = config;
            };
            mockUtil(true, newConfig)(function() {
                target.saveAllToRegistry(items);
            });

            Assert.Equal(descriptor, actual.descriptor);

        };

    };

    [Fixture]
    function RemoveDef() {

        [Fact]
        function RemoveDef() {
            var target = new ComponentDefRegistry();
            target.componentDefs = {
                "markup://foo:bar": "hello"
            };
            target.useDefinitionStorage = function() {
                return false;
            };

            target.removeDef("markup://foo:bar");

            Assert.Undefined(target.componentDefs["markup://foo:bar"]);
        }

        [Fact]
        function RemoveLayoutDef() {
            var target = new ComponentDefRegistry();
            var descriptor = "layout://foo:bar";
            target.componentDefs = {
                "layout://foo:bar": "hello"
            };
            target.useDefinitionStorage = function() {
                return true;
            };
            target.shouldSaveToStorage = function() {
                return true;
            }
            var actual;
            target.definitionStorage = {
                remove: function(descriptor) {
                    actual = descriptor;
                }
            };

            target.removeDef(descriptor);

            Assert.Undefined(target.componentDefs[descriptor]);
            Assert.Equal(descriptor, actual);
        }

    }

};
