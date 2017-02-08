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
Test.Aura.Component.ComponentClassRegistryTest = function () {

    Function.RegisterNamespace("Aura.Component");
    [Import("aura-impl/src/main/resources/aura/component/Component.js"),
     Import("aura-impl/src/main/resources/aura/component/BaseComponent.js"),
     Import("aura-impl/src/main/resources/aura/component/ExpressionComponent.js"),
     Import("aura-impl/src/main/resources/aura/component/HtmlComponent.js"),
     Import("aura-impl/src/main/resources/aura/component/IfComponent.js"),
     Import("aura-impl/src/main/resources/aura/component/IterationComponent.js"),
     Import("aura-impl/src/main/resources/aura/component/TextComponent.js"),
     Import("aura-impl/src/main/resources/aura/component/ComponentClassRegistry.js")]
    delete ComponentClassRegistry;
    delete Component;
    delete BaseComponent;
    delete HtmlComponent;
    delete ExpressionComponent;
    delete IfComponent;
    delete IterationComponent;
    delete TextComponent;

    var mockFramework = Mocks.GetMocks(Object.Global(), {
        "Component": function() {},
        "BaseComponent": function() {},
        "ExpressionComponent": function() {},
        "HtmlComponent": function() {},
        "IfComponent": function() {},
        "IterationComponent": function() {},
        "TextComponent": function() {},
        "$A": {
            "assert": function(condition, message){ if (!condition) { throw new message }},
            "util": {
                "isString": function(obj){ return typeof obj === 'string' },
                "isFunction": function(obj){ return typeof obj === 'function' },
                "globalEval": function(src){ 
                    var returnableEx = /^(\s*)([{(["']|function\s*\()/;
                    var match = src.match(returnableEx);
                    if (match) src = src.replace(match[1], 'return ');
                    eval ("function x() {" + src + "}");
                    return x();
                }
            },
            "componentService": {
                "getLibrary": function(descriptor) { return descriptor }
            },
            clientService: {
                getSourceMapsUrl: function () {return;}
            }
        }
    });

    [Fixture]
    function GetComponentClass() {

        [Fact]
        function ReturnsComponentClassConstructor() {
            // Arrange
            var exporter = function() {
                return {
                    "meta": {
                        "name": "componentClassName"
                    }
                }
            };

            // Act
            var actual;
            mockFramework(function(){
                var target = new Aura.Component.ComponentClassRegistry();
                target.addComponentClass("testDescriptor", exporter);
                actual = target.getComponentClass("testDescriptor");
            });

            // Assert
            Assert.True(actual instanceof Function);
        }

        [Fact]
        function ConstructorNameIsComponentClassName() {
            // Arrange
            var expected = "componentClassName";
            var exporter = function() {
                return {
                    "meta": {
                        "name": "componentClassName"
                    }
                }
            };

            // Act
            var actual;
            mockFramework(function(){
                var target = new Aura.Component.ComponentClassRegistry();
                target.addComponentClass("testDescriptor", exporter);
                var componentClass = target.getComponentClass("testDescriptor");
                actual = componentClass.prototype.meta["name"];
            });

            // Assert
            Assert.Equal(expected, actual);
        }

        [Fact]
        function ReturnsUndefinedIfNotFound() {
            // Arrange

            // Act
            var actual;
            mockFramework(function(){
                var target = new Aura.Component.ComponentClassRegistry();
                actual = target.getComponentClass("NotExisting");
            });

            // Assert
            Assert.Undefined(actual);
        }

        [Fact]
        function ControllerExistsInComponentClassPrototype() {
            // Arrange
            var exporter = function() {
                return {
                    "meta": {
                        "name": "componentClassName"
                    },
                    "controller":{
                        "controllerFunction": function(cmp) {}
                    }
                }
            };

            // Act
            var actual;
            mockFramework(function(){
                var target = new Aura.Component.ComponentClassRegistry();
                target.addComponentClass("testDescriptor", exporter);
                var componentClass = target.getComponentClass("testDescriptor");
                actual = componentClass.prototype.controller["controllerFunction"];
            });

            // Assert
            Assert.True(actual instanceof Function);
        }

        [Fact]
        function HelperExistsInComponentClassPrototype() {
            // Arrange
            var exporter = function() {
                return {
                    "meta": {
                        "name": "componentClassName"
                    },
                    "helper":{
                        "helperFunction": function(cmp) {}
                    }
                }
            };

            // Act
            var actual;
            mockFramework(function(){
                var target = new Aura.Component.ComponentClassRegistry();
                target.addComponentClass("testDescriptor", exporter);
                var componentClass = target.getComponentClass("testDescriptor");
                actual = componentClass.prototype.helper["helperFunction"];
            });

            // Assert
            Assert.True(actual instanceof Function);
        }

        [Fact]
        function RendererExistsInComponentClassPrototype() {
            // Arrange
            var exporter = function() {
                return {
                    "meta": {
                        "name": "componentClassName"
                    },
                    "renderer": {
                        "afterRender": function(cmp) {}
                    }
                }
            };

            // Act
            var actual;
            mockFramework(function(){
                var target = new Aura.Component.ComponentClassRegistry();
                target.addComponentClass("testDescriptor", exporter);
                var componentClass = target.getComponentClass("testDescriptor");
                actual = componentClass.prototype.renderer["afterRender"];
            });

            // Assert
            Assert.True(actual instanceof Function);
        }

        [Fact]
        function ProviderExistsInComponentClassPrototype() {
            // Arrange
            var exporter = function() {
                return {
                    "meta": {
                        "name": "componentClassName"
                    },
                    "provider": {
                        "provide": function(cmp) {}
                    }
                }
            };

            // Act
            var actual;
            mockFramework(function(){
                var target = new Aura.Component.ComponentClassRegistry();
                target.addComponentClass("testDescriptor", exporter);
                var componentClass = target.getComponentClass("testDescriptor");
                actual = componentClass.prototype.provider["provide"];
            });

            // Assert
            Assert.True(actual instanceof Function);
        }

        [Fact]
        function InheritedHelperExistsInComponentClassPrototype() {
            // Arrange
            var mockSuperExporter = function() {
                return {
                    "meta": {
                        "name": "superComponentClassName"
                    },
                    "helper": {
                        "superHelperFunction": function() {}
                    }
                };
            };
            var exporter = function() {
                return {
                    "meta": {
                        "name": "componentClassName",
                        "extends": "superTestDecriptor"
                    }
                };
            };

            // Act
            var actual;
            mockFramework(function(){
                var target = new Aura.Component.ComponentClassRegistry();
                target.addComponentClass("superTestDecriptor", mockSuperExporter);
                target.addComponentClass("testDescriptor", exporter);
                var componentClass = target.getComponentClass("testDescriptor");
                actual = componentClass.prototype.helper["superHelperFunction"];
            });

            // Assert
            Assert.True(actual instanceof Function);
        }

        [Fact]
        function InheritedControllerExistsInComponentClassPrototype() {
            // Arrange
            var mockSuperExporter = function() {
                return {
                    "meta": {
                        "name": "superComponentClassName"
                    },
                    "controller": {
                        "superControllerFunction": function() {}
                    }
                };
            };
            var exporter = function() {
                return {
                    "meta": {
                        "name": "componentClassName",
                        "extends": "superComponentDecriptor"
                    }
                };
            };

            // Act
            var actual;
            mockFramework(function(){
                var target = new Aura.Component.ComponentClassRegistry();
                target.addComponentClass("superComponentDecriptor", mockSuperExporter);
                target.addComponentClass("testDescriptor", exporter);
                var componentClass = target.getComponentClass("testDescriptor");
                actual = componentClass.prototype.controller["superControllerFunction"];
            });

            // Assert
            Assert.True(actual instanceof Function);
        }

        [Fact]
        function ImportedLibraryExistsInHelper() {
            // Arrange
            var expected = "test:libName";
            var exporter = function() {
                return {
                    "meta": {
                        "name": "componentClassName",
                        "imports": {
                            "testLib": "test:libName"
                        }
                    }
                }
            };

            // Act
            var actual;
            mockFramework(function(){
                var target = new Aura.Component.ComponentClassRegistry();
                target.addComponentClass("testDescriptor", exporter);
                var componentClass = target.getComponentClass("testDescriptor");
                actual = componentClass.prototype.helper["testLib"];
            });

            // Assert
            Assert.Equal(expected, actual);
        }
    }
}
