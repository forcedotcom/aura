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

[Fixture, Skip("TODO include Engine")]
Test.Aura.AuraComponentServiceTest = function(){
    var $A = {
        assert: function(condition, message7) {
            if (!condition) {
                var error = new Error(message);
                throw error;
            }
        },
        deprecated:function(){},
        util: {
            isFunction: function(obj){
                return false;
            }
        }
    };
    var Aura = {
        Services: {},
        Component: {
            ComponentDefStorage: function () {},
            ComponentClassRegistry: function () {}
        },
        Library: {
            LibraryRegistry: function () {},
            LibraryIncludeRegistry: function () {}
        },

    };
    var Engine = {
    };

    Mocks.GetMocks(Object.Global(), {
        "LibraryRegistry": function(){},
        "LibraryIncludeRegistry": function(){},
        "ComponentClassRegistry": function(){},
        "AuraComponentService": function(){},
        "ComponentDefStorage": function(){},
        "Aura": Aura,
        "Engine": Engine
    })(function(){
        [Import("aura-impl/src/main/resources/aura/component/ComponentDefStorage.js")]
        [Import("aura-impl/src/main/resources/aura/AuraComponentService.js")]
    });

    // Mocks necessary to create a new AuraComponentService Object
    var mockOnLoadUtil = Mocks.GetMocks(Object.Global(), {
        "$A": $A,
        "window": function(){},
        "Components": function(){},
        Aura: Aura,
        Engine: Engine
    });

    var targetService;
    mockOnLoadUtil(function() {
        targetService = new Aura.Services.AuraComponentService();
    });


    [Fixture]
    function createComponent(){
        var $Amock=Mocks.GetMock(Object.Global(),"$A",{
            assert:function(condition,message){
                if(!condition)throw message;
            },
            enqueueAction:function(){},
            util:{
                isString:function(obj){
                    return typeof obj === 'string';
                },
                isObject:function(obj){
                    return typeof obj === "object" && obj !== null && !this.isArray(obj);
                },
                isFunction:function(obj){
                    return !!obj && Object.prototype.toString.apply(obj) === '[object Function]';
                }
            },
            getContext: function() {
                return {
                    getCurrentAccess: function() {}
                };
            }
        });

        [Fact]
        function ThrowsIfTypeDoesNotImplementToString(){
            var expected="ComponentService.createComponent(): 'type' must be a valid String.";

            var actual=Record.Exception(function(){
                $Amock(function(){
                    targetService.createComponent(null);
                })
            });

            Assert.Equal(expected,actual);
        }

        [Fact]
        function ThrowsIfAttributesIsNotNullAndNotAnOjbect(){
            var expected="ComponentService.createComponent(): 'attributes' must be a valid Object.";

            var actual=Record.Exception(function(){
                $Amock(function(){
                    targetService.createComponent("test",7357);
                })
            });

            Assert.Equal(expected,actual);
        }

        [Fact]
        function ThrowsIfCallbackisNotAValidFunctionPointer(){
            var expected="ComponentService.createComponent(): 'callback' must be a Function pointer.";

            var actual=Record.Exception(function(){
                $Amock(function(){
                    targetService.createComponent("test",null,{});
                })
            });

            Assert.Equal(expected,actual);
        }

        [Fact]
        function GetsComponentFromServerWhenNoDef() {
            var actual = false;
            targetService.getComponentConfigs = function(config) {
                return {
                    "definition": null,
                    "descriptor": "blah",
                    "configuration": config
                }
            };
            targetService.requestComponent = function() {
                actual = true;
                return Stubs.Aura.GetAction();
            }

            $Amock(function(){
                targetService.createComponent("test",null,function(){});
            });

            Assert.True(actual);
        }

        [Fact]
        function GetsComponentFromServerWhenDefHasRemoteDependencies() {
            var actual = false;
            var def = {
                    hasRemoteDependencies: function() { return true;}
            };
            targetService.getComponentConfigs = function(config) {
                return {
                    "definition": def,
                    "descriptor": "blah",
                    "configuration": config
                }
            };
            targetService.requestComponent = function() {
                actual = true;
                return Stubs.Aura.GetAction();
            }

            $Amock(function(){
                targetService.createComponent("test",null,function(){});
            });

            Assert.True(actual);
        }
    }

    [Fixture]
    function createComponents(){
        var $Amock=Mocks.GetMock(Object.Global(),"$A",{
            assert:function(condition,message){
                if(!condition)throw message;
            },
            util:{
                isArray:function(obj){
                    return obj instanceof Array;
                },
                isFunction:function(obj){
                    return !!obj && Object.prototype.toString.apply(obj) === '[object Function]';
                }
            }
        });

        [Fact]
        function ThrowsIfCallbackIsNotAValidFunctionPointer(){
            var expected="ComponentService.createComponents(): 'callback' must be a Function pointer.";

            var actual=Record.Exception(function(){
                $Amock(function(){
                    targetService.createComponents([], null);
                })
            });

            Assert.Equal(expected,actual);
        }

        [Fact]
        function ThrowsIfComponentsToCreateIsNotArray() {
            var expected = "ComponentService.createComponents(): 'components' must be a valid Array.";

            var actual = Record.Exception(function() {
                $Amock(function() {
                    targetService.createComponents("ui:button",function(){});
                });
            });

            Assert.Equal(expected,actual);
        }

        [Fact]
        function CallsCreateComponentApiOncePerComponent() {
            var actual = 0;
            var expected = 3;
            targetService.createComponent = function() {
                actual++;
            }

            $Amock(function() {
                targetService.createComponents([["test1"],["test2"],["test3"]],function(){});
            });

            Assert.Equal(expected, actual);
        }

        [Fact]
        function PassesERRORWhenIncompleteActionFollowsError() {
            var actual;
            var expected = "ERROR";
            targetService.createComponent = function(type, attributes, callback) {
                if (type === "last") {
                    callback(null, "INCOMPLETE");
                } else {
                    callback(null, "ERROR");
                }
            }
            var callback = function(created, overallStatus, statusList) {
                actual = overallStatus;
            };

            $Amock(function() {
                targetService.createComponents([["test1"],["test2"],["last"]], callback);
            });

            Assert.Equal(expected, actual);
        }
    }

    [Fixture]
    function newComponentAsync(){
        [Fact]
        function AssertsConfigIsPresent(){
            // Arrange
            var expected = "ComponentService.newComponentAsync(): 'config' must be a valid Object.";
            var target;
            var actual;
            mockOnLoadUtil(function(){
                target = new Aura.Services.AuraComponentService();
            });

            // Act
            mockOnLoadUtil(function(){
                actual = Record.Exception(function(){
                    target.newComponentAsync(null, function(){}, undefined);
                });
            });

            // Assert
            Assert.Equal(expected, actual);
        }

        [Fact]
        function AssertsCallbackIsPresent(){
            // Arrange
            var expected = "ComponentService.newComponentAsync(): 'callback' must be a Function pointer.";
            var target;
            var actual;
            mockOnLoadUtil(function(){
                target = new Aura.Services.AuraComponentService();
            });

            // Act
            mockOnLoadUtil(function(){
                actual = Record.Exception(function(){
                    target.newComponentAsync(null, undefined, {});
                });
            });

            // Assert
            Assert.Equal(expected, actual);
        }
    }

    [Fixture]
    function newComponent() {

        var $Amock=Mocks.GetMock(Object.Global(),"$A",{
            assert:function(condition,message){
                if(!condition)throw message;
            },
            util:{
                isString:function(obj){
                    return typeof obj === 'string';
                },
                isArray:function(obj){
                    return false;
                }
            },
            clientService:{
                allowAccess:function(){return true;}
            }
        });

        // [Fact]
        // function ThrowsComponentClassNotFound(){
        //     var component = "markup://bla:notExist";
        //     var expected = "Component class not found: " + component;
        //     var targetService;
        //     mockOnLoadUtil(function(){
        //         targetService = new Aura.Services.AuraComponentService();
        //     });
        //     targetService.getDef = function(){
        //         return null;
        //     }

        //     // Act
        //     var actual = Record.Exception(function() {
        //         $Amock(function() {
        //             targetService.newComponent({
        //                     componentDef:component,
        //                     "skipCreationPath": true
        //                 },
        //                 null, true, true);
        //         });
        //     });

        //     // Assert
        //     Assert.Equal(expected, actual);
        // }
    }

    [Fixture]
    function hasDefinition() {

        var $Amock=Mocks.GetMock(Object.Global(),"$A",{
            assert:function(condition,message){
                if(!condition)throw message;
            },
            clientService: {
                allowAccess: function () {
                    return true;
                }
            }
        });

        [Fact]
        function NoDescriptorTypeInDefinitionAssumesMarkup() {
            var descriptor = "prefix:name";
            var definition = Stubs.Aura.GetComponentDef(descriptor)
            var actual;

            $Amock(function() {
                targetService.componentDefRegistry["markup://" + descriptor] = definition;
                actual = targetService.hasDefinition(descriptor);
            });

            Assert.True(actual);
        }

        [Fact]
        function ReturnsTrueIfDefinitionIsPresentOnClient() {
            var descriptor = "markup://prefix:name";
            var definition = Stubs.Aura.GetComponentDef(descriptor)
            var actual;

            $Amock(function() {
                targetService.componentDefRegistry[descriptor] = definition;
                actual = targetService.hasDefinition(descriptor);
            });

            Assert.True(actual);

        }

        [Fact]
        function ReturnsFalseIfDefinitionIsNotPresentOnClient() {
            var descriptor = "markup://prefix:name";
            var actual;

            $Amock(function() {
                targetService.componentDefRegistry[descriptor] = null;
                actual = targetService.hasDefinition(descriptor);
            });

            Assert.False(actual);
        }
    }
}