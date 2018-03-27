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
Test.Aura.AuraComponentServiceTest = function(){
    var $A = {
        assert: function(condition, message) {
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
            ComponentDefLoader: function() {},
            ComponentDefStorage: function () {},
            ComponentClassRegistry: function () {}
        },
        Controller: {
            ActionStorage: function () {
            }
        },
        Library: {
            LibraryRegistry: function () {},
            LibraryIncludeRegistry: function () {}
        }
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
        "Engine": Engine,
        "Proxy": {},
    })(function(){
        [Import("aura-impl/src/main/resources/aura/component/ComponentDefStorage.js")]
        [Import("aura-impl/src/main/resources/aura/AuraComponentService.js")]
    });

    // Mocks necessary to create a new AuraComponentService Object
    var mockOnLoadUtil = Mocks.GetMocks(Object.Global(), {
        "$A": $A,
        "window": function(){},
        "Components": function(){},
        "Aura": Aura,
        "Engine": Engine,
        "Proxy": {},
    });

    var targetService;
    mockOnLoadUtil(function() {
        targetService = new Aura.Services.AuraComponentService();
    });


    [Fixture]
    function createComponent(){
        var $Amock=Mocks.GetMocks(Object.Global(), {
            "$A": {
                assert:function(condition,message){
                    if(!condition)throw message;
                },
                enqueueAction:function(){},
                getCallback:function(f){return f;},
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
                clientService: {
                },
                getContext: function(){
                	    return {getURIDefsState: function() {return {createCmp:true};}};
                }
            },
            "Json": {
                "ApplicationKey": {
                    "DESCRIPTOR": "d"
                }
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
            targetService.componentDefLoader.loadComponentDef = function() {
                actual = true;
            };

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
            var orig = targetService.getComponentDef;
            targetService.getComponentDef = function() {
                return def;
            };
            targetService.requestComponent = function() {
                actual = true;
                return Stubs.Aura.GetAction();
            }

            $Amock(function(){
                targetService.createComponent("test",null,function(){});
            });

            targetService.getComponentDef = orig;
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

        var $Amock=Mocks.GetMocks(Object.Global(), {
            "$A": {
                assert:function(condition,message){
                    if(!condition)throw message;
                },
                clientService: {
                    allowAccess: function () {
                        return true;
                    }
                }
            },
            "Json": {
                "ApplicationKey": {
                    "DESCRIPTOR": "d"
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

    [Fixture]
    function createFromSavedComponentConfigs() {
        [Fact]
        function callsComponentDefCtorWhenComponentClassExistsInRegistry() {
            var actual;
            var descriptor = "test";
            var mock = Mocks.GetMocks(Object.Global(), {
                "ComponentDef": function() {
                    actual = true;
                },
                "Json": {
                    "ApplicationKey": {
                        "COMPONENTCLASS": "cc"
                    }
                }
            });

            mock(function() {
                targetService.savedComponentConfigs[descriptor] = {};
                targetService.componentClassRegistry = {
                    "classConstructors": {
                        "test": true
                    }
                };
                targetService.componentDefRegistry = {};
                targetService.getDescriptorFromConfig = function() {return descriptor;};

                targetService.createFromSavedComponentConfigs();
            });

            Assert.True(actual);
        }

        [Fact]
        function callsComponentDefCtorWhenComponentClassExistsInDef() {
            var actual;
            var descriptor = "test";
            var mock = Mocks.GetMocks(Object.Global(), {
                "ComponentDef": function() {
                    actual = true;
                },
                "Json": {
                    "ApplicationKey": {
                        "COMPONENTCLASS": "cc"
                    }
                }
            });

            mock(function() {
                targetService.savedComponentConfigs[descriptor] = {
                    "cc": {}
                };
                targetService.componentClassRegistry = {
                    "classConstructors": {
                        "test": false
                    },
                    "classExporter": {
                        "test": false
                    }
                };
                targetService.componentDefRegistry = {};
                targetService.getDescriptorFromConfig = function() {return descriptor;};

                targetService.createFromSavedComponentConfigs();
            });

            Assert.True(actual);
        }

        [Fact]
        function callsComponentDefCtorWhenComponentExporterExists() {
            var actual;
            var descriptor = "test";
            var mock = Mocks.GetMocks(Object.Global(), {
                "ComponentDef": function() {
                    actual = true;
                },
                "Json": {
                    "ApplicationKey": {
                        "COMPONENTCLASS": "cc"
                    }
                }
            });

            mock(function() {
                targetService.savedComponentConfigs[descriptor] = {};
                targetService.componentClassRegistry = {
                    "classConstructors": {
                        "test": false
                    },
                    "classExporter": {
                        "test": true
                    }
                };
                targetService.componentDefRegistry = {};
                targetService.getDescriptorFromConfig = function() {return descriptor;};

                targetService.createFromSavedComponentConfigs();
            });

            Assert.True(actual);
        }
    }

    [Fixture]
    function createComponentDef() {
        [Fact]
        function callsComponentDefCtorWhenComponentClassExists() {
            var actual;
            var descriptor = "test";
            var mock = Mocks.GetMock(Object.Global(), "ComponentDef", function() {
                    actual = true;
                });

            mock(function() {
                targetService.componentClassRegistry = {
                    "classConstructors": {
                        "test": true
                    }
                };
                targetService.componentDefRegistry = {};
                targetService.getDescriptorFromConfig = function() {return descriptor;};

                targetService.createComponentDef();
            });

            Assert.True(actual);
        }

        [Fact]
        function callsComponentDefCtorWhenComponentExporterExists() {
            var actual;
            var descriptor = "test";
            var mock = Mocks.GetMock(Object.Global(), "ComponentDef", function() {
                    actual = true;
                });

            mock(function() {
                targetService.componentClassRegistry = {
                    "classConstructors": {
                                "test": false
                    },
                    "classExporter": {
                        "test": true
                    }
                };
                targetService.componentDefRegistry = {};
                targetService.getDescriptorFromConfig = function() {return descriptor;};

                targetService.createComponentDef();
            });

            Assert.True(actual);
        }
    }

    [Fixture]
    function saveComponentDefs() {
        var $Amock=Mocks.GetMocks(Object.Global(), {
            "$A": {
                util: {
                    estimateSize: function(objs){
                        return objs.length * 1024;
                    }
                }
            }
        });

        [Fact]
        function enoughRoomInStorageSavesComponents(){
            var saveCalled = false;

            $Amock(function() {
                targetService.componentDefStorage = {
                    getStorage: function(){
                        return {
                            getSize: function () {
                                return {then: function (f) {
                                    return {then: function(fn){
                                        return {then: function(){fn(f(0))}};
                                    }};
                                }};
                            },
                            getMaxSize: function () {
                                return 10;
                            }
                        }
                    },
                    storeDefs: function() {
                        saveCalled = true;
                    },
                    EVICTION_HEADROOM: 0
                };
                targetService.saveDefsToStorage({componentDefs:[{}]});
            });

            Assert.True(saveCalled, "with enough room in storage, storeDefs should have been called on componentDefStorage");
        }

        [Fact]
        function notEnoughRoomInStorageClearsStorages() {
            var saveCalled = false;
            var clearCalled = false;

            $Amock(function() {
                targetService.componentDefStorage = {
                    getStorage: function(){
                        return {
                            getSize: function () {
                                return {then: function (f) {
                                    return {then: function(fn){
                                        return {then: function(){fn(f(1))}};
                                    }};
                                }};
                            },
                            getMaxSize: function () {
                                return 1;
                            }
                        }
                    },
                    storeDefs: function() {
                        saveCalled = true;
                    },
                    clear: function() {
                        clearCalled = true;
                        return {then:function(){return {then:function(fn){return fn()}}}};
                    },
                    EVICTION_HEADROOM: 0
                };
                targetService.saveDefsToStorage({componentDefs:[{}]});
            });

            Assert.True(!saveCalled && clearCalled, "there was not enough room in storage" +
                (saveCalled?", storeDefs should not have been called on componentDefStorage":"") +
                (!clearCalled?", clear of the storage should have been called":"")
            );
        }
    }

    [Fixture]
    function loadComponentDefs() {

        [Fact]
        function removesAlreadyCachedDefs() {
            var actual;
            var expected = {
                "markup://one": {},
                "markup://two": {},
                "markup://four": {},
                "markup://five": {},
            };

            mockOnLoadUtil(function() {
                $A.util["isObject"] = function(){
                    return true;
                };

                var descriptorMap = {
                    "markup://one": {},
                    "markup://two": {},
                    "markup://three": {},
                    "markup://four": {},
                    "markup://five": {},
                };

                var targetService = new Aura.Services.AuraComponentService();

                targetService.hasCacheableDefinitionOfAnyType = function(desc) {
                    if(desc === "markup://three") {
                        return true;
                    } else {
                        return false;
                    }
                }

                targetService.componentDefLoader = {
                    loadComponentDefs: function(desc, cb) {
                        actual = desc;
                    }
                };

                targetService.loadComponentDefs(descriptorMap, function() {});
            });

            Assert.Equal(expected, actual);
        }

        [Fact]
        function willNotLoadDefsIfDefMapIsNotAnObject() {
            var actual;
            var expected = false;

            mockOnLoadUtil(function() {
                $A.util["isObject"] = function(){
                    return false;
                };

                var descriptorMap = null;

                var targetService = new Aura.Services.AuraComponentService();

                targetService.componentDefLoader = {
                    //Should never enter this code path
                    loadComponentDefs: function() {
                        actual = true;
                    }
                };

                targetService.loadComponentDefs(descriptorMap, function() {
                    actual = false;
                });
            });

            Assert.Equal(expected, actual);
        }

        [Fact]
        function willNotLoadDefsIfDefMapIsEmpty() {
            var actual;
            var expected = false;

            mockOnLoadUtil(function() {
                $A.util["isObject"] = function(){
                    return true;
                };

                var descriptorMap = {
                    "markup://one": {},
                    "markup://two": {},
                    "markup://three": {},
                    "markup://four": {},
                    "markup://five": {},
                };

                var targetService = new Aura.Services.AuraComponentService();

                targetService.hasCacheableDefinitionOfAnyType = function(desc) {
                    return true;
                }

                targetService.componentDefLoader = {
                    //Should never enter this code path
                    loadComponentDefs: function() {
                        actual = true;
                    }
                };

                targetService.loadComponentDefs(descriptorMap, function() {
                    actual = false;
                });
            });

            Assert.Equal(expected, actual);
        }
    }
}
