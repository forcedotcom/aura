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

    var Aura = {
        "Component": {}
    };

    Mocks.GetMocks(Object.Global(), {
        "Aura": Aura,
        "Component": function(){}, // Prevent Global
        "ComponentClassRegistry": function(){} // Prevent Global Reference
    })(function () {
        [Import("aura-impl/src/main/resources/aura/component/ComponentClassRegistry.js"),
         Import("aura-impl/src/main/resources/aura/component/Component.js")]
    });

    function mockFramework(during){
        var mock = {
            "Component": Aura.Component.Component,
            "$A": {
                "componentService": {
                    "getLibraryDef": function(){}
                }
            }
        };

        return Mocks.GetMocks(Object.Global(),mock)(during);
    }

    [Fixture]
    function GetComponentClass() {
        var testDescriptor = "testDescriptor";
        var componentClassName = "componentClassName";

        [Fact]
        function ReturnsComponentClassConstructor() {
            // Arrange
            var componentProperties = Stubs.GetObject({}, {
                    "meta": {
                        "name": componentClassName
                    }
                }
            );
            var target = new Aura.Component.ComponentClassRegistry();
            var mockExporter = Stubs.GetMethod(componentProperties);
            target.addComponentClass(testDescriptor, mockExporter);
            var actual;

            // Act
            mockFramework(function(){
                actual = target.getComponentClass(testDescriptor);
            });

            // Assert
            Assert.True(actual instanceof Function);
        }

        [Fact]
        function ConstructorNameIsComponentClassName() {
            // Arrange
            var expected = componentClassName;
            var componentProperties = Stubs.GetObject({}, {
                    "meta": {
                        "name": expected
                    }
                }
            );
            var target = new Aura.Component.ComponentClassRegistry();
            var mockExporter = Stubs.GetMethod(componentProperties);
            target.addComponentClass(testDescriptor, mockExporter);
            var componentClass;

            // Act
            mockFramework(function(){
                componentClass = target.getComponentClass(testDescriptor);
            });
            var actual = componentClass.name;

            // Assert
            Assert.Equal(expected, actual);
        }

        [Fact]
        function ReturnsUndefinedIfNotFound() {
            // Arrange
            var target = new Aura.Component.ComponentClassRegistry();
            // Act
            var actual = target.getComponentClass("NotExisting");
            // Assert
            Assert.Undefined(actual);
        }

        [Fact]
        function ControllerExistsInComponentClassPrototype() {
            // Arrange
            var componentProperties = Stubs.GetObject({}, {
                    "meta": {
                        "name": componentClassName
                    },
                    "controller":{
                        "controllerFunction": function(cmp) {}
                    }
                }
            );
            var target = new Aura.Component.ComponentClassRegistry();
            var mockExporter = Stubs.GetMethod(componentProperties);
            target.addComponentClass(testDescriptor, mockExporter);
            var componentClass;

            // Act
            mockFramework(function(){
                componentClass = target.getComponentClass(testDescriptor);
            });
            var actual = componentClass.prototype.controller["controllerFunction"];

            // Assert
            Assert.True(actual instanceof Function);
        }

        [Fact]
        function HelperExistsInComponentClassPrototype() {
            // Arrange
            var componentProperties = Stubs.GetObject({}, {
                    "meta": {
                        "name": componentClassName
                    },
                    "helper":{
                        "helperFunction": function(cmp) {}
                    }
                }
            );
            var mockExporter = Stubs.GetMethod(componentProperties);
            var target = new Aura.Component.ComponentClassRegistry();
            target.addComponentClass(testDescriptor, mockExporter);
            var componentClass;

            // Act
            mockFramework(function(){
                componentClass = target.getComponentClass(testDescriptor);
            });
            var actual = componentClass.prototype.helper["helperFunction"];

            // Assert
            Assert.True(actual instanceof Function);
        }

        [Fact]
        function RendererExistsInComponentClassPrototype() {
            // Arrange
            var componentProperties = Stubs.GetObject({}, {
                    "meta": {
                        "name": componentClassName
                    },
                    "renderer": {
                        "afterRender": function(cmp) {}
                    }
                }
            );
            var target = new Aura.Component.ComponentClassRegistry();
            var mockExporter = Stubs.GetMethod(componentProperties);
            target.addComponentClass(testDescriptor, mockExporter);
            var componentClass;

            // Act
            mockFramework(function(){
                componentClass = target.getComponentClass(testDescriptor);
            });
            var actual = componentClass.prototype.renderer["afterRender"];

            // Assert
            Assert.True(actual instanceof Function);
        }

        [Fact]
        function ProviderExistsInComponentClassPrototype() {
            // Arrange
            var componentProperties = Stubs.GetObject({}, {
                    "meta": {
                        "name": componentClassName
                    },
                    "provider": {
                        "provide": function(cmp) {}
                    }
                }
            );
            var mockExporter = Stubs.GetMethod(componentProperties);
            var target = new Aura.Component.ComponentClassRegistry();
            target.addComponentClass(testDescriptor, mockExporter);
            var componentClass;

            // Act
            mockFramework(function(){
                componentClass = target.getComponentClass(testDescriptor);
            });
            var actual = componentClass.prototype.provider["provide"];

            // Assert
            Assert.True(actual instanceof Function);
        }

        [Fact]
        function InheritedHelperExistsInComponentClassPrototype() {
            // Arrange
            var superComponentDecriptor = "superDescriptor";
            var superComponentProperites = {
                "meta": {
                    "name": "superComponentClassName"
                },
                "helper": {
                    "superHelperFunction": function() {}
                }
            };
            var componentProperties = Stubs.GetObject({}, {
                    "meta": {
                        "name": componentClassName,
                        "extends": superComponentDecriptor
                    }
                }
            );

            var target = new Aura.Component.ComponentClassRegistry();
            target.addComponentClass(superComponentDecriptor, Stubs.GetMethod(superComponentProperites));
            target.addComponentClass(testDescriptor, Stubs.GetMethod(componentProperties));
            var componentClass;

            // Act
            mockFramework(function(){
                componentClass = target.getComponentClass(testDescriptor);
            });
            var actual = componentClass.prototype.helper["superHelperFunction"];

            // Assert
            Assert.True(actual instanceof Function);
        }

        [Fact]
        function InheritedControllerExistsInComponentClassPrototype() {
            // Arrange
            var superComponentDecriptor = "superDescriptor";
            var superComponentProperites = {
                "meta": {
                    "name": "superComponentClassName"
                },
                "controller": {
                    "superControllerFunction": function() {}
                }
            };
            var componentProperties = Stubs.GetObject({}, {
                    "meta": {
                        "name": componentClassName,
                        "extends": superComponentDecriptor
                    }
                }
            );

            var target = new Aura.Component.ComponentClassRegistry();
            target.addComponentClass(superComponentDecriptor, Stubs.GetMethod(superComponentProperites));
            target.addComponentClass(testDescriptor, Stubs.GetMethod(componentProperties));
            var componentClass;

            // Act
            mockFramework(function(){
                componentClass = target.getComponentClass(testDescriptor);
            });
            var actual = componentClass.prototype.controller["superControllerFunction"];

            // Assert
            Assert.True(actual instanceof Function);
        }

        [Fact]
        function ImportedLibraryExistsInHelper() {
            // Arrange
            var libName = "test:libName";
            var componentProperties = Stubs.GetObject({}, {
                    "meta": {
                        "name": componentClassName,
                        "imports": {
                            "testLib":libName
                        }
                    }
                }
            );

            var expected = Stubs.GetObject();
            var target = new Aura.Component.ComponentClassRegistry();
            target.addComponentClass(testDescriptor, Stubs.GetMethod(componentProperties));
            var componentClass;

            // Act
            mockFramework(function(){
                $A.componentService.getLibraryDef = Stubs.GetMethod([libName], expected);
                componentClass = target.getComponentClass(testDescriptor);
            });
            var actual = componentClass.prototype.helper["testLib"];

            // Assert
            Assert.True(expected === actual);
        }
    }
}
