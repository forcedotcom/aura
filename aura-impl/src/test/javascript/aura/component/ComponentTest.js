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
/*jshint asi:true,expr:true,strict:false*/
/*global Async,Data,Fixture,Fact,Skip,Trait,Assert,Mocks,Record,Stubs,Import,ImportJson,MockedImport*/
/*global Test,Component*/
Function.RegisterNamespace("Test.Aura.Component");

// JBUCH: TODO: Don't love this line. Let's try to get namespaces declared in appropriate files.
Function.RegisterNamespace("Aura.Component");

[Fixture]
Test.Aura.Component.ComponentTest=function(){
    var Aura = {
        "Component": {},
        "Attribute": {}
    };

    Mocks.GetMocks(Object.Global(), {
        "Aura": Aura,
        "Component": function(){}, // Prevent Global
        "InvalidComponent": function(){}, // Prevent Global
        "AttributeSet": function(){} // Prevent Global
    })(function(){
        [Import("aura-impl/src/main/resources/aura/component/Component.js"),
         Import("aura-impl/src/main/resources/aura/component/EventValueProvider.js"),
         Import("aura-impl/src/main/resources/aura/component/StyleValueProvider.js"),
         Import("aura-impl/src/main/resources/aura/component/ActionValueProvider.js"),
         Import("aura-impl/src/main/resources/aura/attribute/AttributeSet.js"),
         Import("aura-impl/src/main/resources/aura/component/InvalidComponent.js")]
    });

    function mockFramework(during){
        var mock = {
            "Component": Aura.Component.Component,
            "InvalidComponent": Aura.Component.InvalidComponent,
            "AttributeSet": Aura.Attribute.AttributeSet,
            "$A": {
                assert:function(condition,message){if(!condition)throw new Error(message)},
                error:function(message){throw new Error(message)},
                getContext:function(){return {
                    getAccessVersion:function(){},
                    getCurrentAccess:function(){},
                    getCurrentAction:function(){
                        return {
                            topPath: function () {},
                            getNextGlobalId: function () {},
                            getId: function () {},
                            getCurrentPath: function () {}
                        };
                    },
                    containsComponentConfig: function () { return true;},
                    releaseCurrentAccess:function(){},
                    setCurrentAccess: function(){}
                }},
                componentService:{
                    get:function(){},
                    getDef:function(){
                        // JBUCH: TODO: ADD COMPONENTDEF STUB
                        return {
                            attributeDefs:{
                                getDef:function(){},
                                getNames:function(){return []},
                                getValues:function(){return null}
                            },
                            descriptor: {
                                getFullName: function() { return "" }
                            },
                            getAllEvents:function(){
                                return []
                            },
                            getAppHandlerDefs:function(){},
                            getCmpHandlerDefs:function(){},
                            getControllerDef:function(){},
                            getDescriptor:function(){
                                return {
                                    getNamespace:function(){}
                                }
                            },
                            getEventDef:function(){
                                return {getDescriptor:function(){
                                    return {
                                        getQualifiedName:function(){}
                                    }
                                }}
                            },
                            getModelDef:function(){},
                            getSuperDef:function(){},
                            getValueHandlerDefs:function(){},
                            isAbstract:function(){},
                            isInstanceOf:function(){},
                            hasInit:function(){}
                        };
                    },
                    index:function(){},
                    deIndex:function(){}
                },
                eventService: {
                    removeHandlersByComponentId: function(){}
                },
                expressionService:{
                    clearReferences:function(){},
                    normalize:function(target){return target}
                },
                renderingService:{
                    unrender:function(){}
                },
                util:{
                    apply:function(){
                    },
                    isArray:function(target){
                        return target instanceof Array;
                    },
                    isFunction:function(target){
                        return target instanceof Function;
                    },
                    isString:function(target){
                        return typeof(target) == "string";
                    },
                    isUndefinedOrNull:function(){
                    }
                },
                lockerService: {
                    trust: function() {},
                    unwrap: function(elements) {
                        return elements;
                    },
                    wrapComponent: function(component) {
                        return component;
                    }
                }
            }
        };

        return Mocks.GetMocks(Object.Global(),mock)(during);
    }
    [Fixture]
    function DeIndex() {
        //this cover when component is invalid
        [Fact]
        function ReturnsNullForInvalidComponent() {
            //Arrange
            var target = null;
            mockFramework(function(){
                target = new Aura.Component.Component({},true);
                target.isValid = function() {return false};
            });
            //Act
            var actual = target.deIndex(null,null);
            //Assert
            Assert.Null(actual);
        }

        //this cover when localIndex does not exist
        [Fact]
        function ReturnsNullForNullIndex() {
            //Arrange
            var target = null;
            var actual=null;
            var localid = "testLocalId";
            var globalid = "testGlobalId";
            var Component = Aura.Component.Component;
            mockFramework(function(){
                target = new Aura.Component.Component({},true);
                target.isValid = function(){return true};
                target.localIndex = null;
            });
            //Act
            actual = target.deIndex(localid,globalid);
            //Assert
            Assert.Null(actual);
        }

        //this cover when passing in globalid, and localIndex[localid]=globalid, note index[localid] here is not an array
        [Fact]
        function RemoveLocalIdFromIndexWhenPassingInGlobalId() {
            //Arrange
            var localid = "testLocalId";
            var globalid = "testGlobalId";
            var target = null;
            var actual=null;
            mockFramework(function(){
                target = new Aura.Component.Component({},true);
                target.isValid = function(){return true};
                target.localIndex = [];
                target.localIndex[localid] = globalid;
            });
            //Act
            mockFramework(function(){
                target.deIndex(localid,globalid);
                actual = target.localIndex[localid];
            });
            //Assert
            Assert.Undefined(actual);
        }

        //This cover when remove only item index[localid] has
        [Fact]
        function RemoveLocalIdArrayWhenPassingOnlyItemItHas() {
            //Arrange
            var localid = "testLocalId";
            var globalid = "testGlobalId";
            var target = null;
            var actual=null;
            mockFramework(function(){
                target = new Aura.Component.Component({},true);
                target.localIndex = [];
                target.localIndex[localid] = [globalid];
            });
            //Act
            mockFramework(function(){
                target.deIndex(localid,globalid);
                actual = target.localIndex[localid];
            });
            //Assert
            Assert.Undefined(actual);
        }

        //this cover basic index array with only two global ids, we remove one of them
        [Fact]
        function ReturnsLocalIdArrayWithGlobalIdPassingInSimple() {
            //Arrange
            var localid = "testLocalId";
            var globalid1 = "testGlobalId1";
            var globalid2 = "testGlobalId2";
            var target = null;
            var actual= null;
            var expected= [globalid2];
            mockFramework(function(){
                target = new Aura.Component.Component({},true);
                target.isValid = function(){return true};
                target.localIndex = [];
                target.localIndex[localid] = [globalid1,globalid2];
            });
            //Act
            mockFramework(function(){
                target.deIndex(localid,globalid1);
                actual = target.localIndex[localid];
            });
            //Assert
            Assert.Equal(expected, actual);
        }

        //this cover complex situation when there are duplications in index array.
        [Fact]
        function ReturnsLocalIdArrayWithGlobalIdPassingInComplex() {
            //Arrange
            var localid = "testLocalId";
            var globalid1 = "testGlobalId1";
            var globalid2 = "testGlobalId2";
            var target = null;
            var actual = null;
            var expected=[globalid2];
            mockFramework(function(){
                target = new Aura.Component.Component({},true);
                target.isValid = function(){return true};
                target.localIndex = [];
                target.localIndex[localid] = [globalid1,globalid1,globalid2,globalid1,globalid1];
            });
            //Act
            mockFramework(function(){
                target.deIndex(localid,globalid1);
                actual = target.localIndex[localid];
            });
            //Assert
            Assert.Equal(expected, actual);
        }

        //this cover when NOT passing in globalid, localIndex exist, what localIndex[localid] has doesn't matter
        [Fact]
        function RemoveLocalIdFromIndexWhenNotPassingInGlobalId() {
            //Arrange
            var localid = "testLocalId";
            var target = null;
            var actual=null;
            var expected=null;
            mockFramework(function(){
                target = new Aura.Component.Component({},true);
                target.isValid = function(){return true};
                target.localIndex = [];
                target.localIndex[localid] = "something";
            });
            //Act
            target.deIndex(localid);
            actual = target.localIndex[localid];
            //Assert
            Assert.Undefined(actual);
        }
    }

    [Fixture]
    function Index() {
        //this cover when component is invalid
        [Fact]
        function ReturnsNullForInvalidComponent() {
            //Arrange
            var target = null;
            mockFramework(function(){
                target = new Aura.Component.Component({},true);
                target.assertValid = function(){return false};
            });
            //Act
            var actual = target.index(null,null);
            //Assert
            Assert.Null(actual);
        }

        //this cover when index[locaid] does not exist
        [Fact]
        function InitLocalIdWithGlobalId() {
            //Arrange
            var localid = "testLocalId";
            var globalid = "testGlobalId";
            var expected = globalid;
            var target = null;
            var actual=null;
            mockFramework(function(){
                target = new Aura.Component.Component({},true);
                target.assertValid = function(){return true};
            });
            //Act
            target.index(localid,globalid);
            actual = target.localIndex[localid];
            //Assert
            Assert.Equal(expected, actual);
        }

        //this cover when index[locaid] exist but not an array
        [Fact]
        function AppendLocalIdWithGlobalId() {
            //Arrange
            var localid = "testLocalId";
            var globalid = "testGlobalId2";
            var original_globalid = "testGlobalId1";
            var expected = [original_globalid,globalid];
            var target = null;
            var actual=null;
            mockFramework(function(){
                target = new Aura.Component.Component({},true);
                target.assertValid = function(){return true};
                target.localIndex = [];
                target.localIndex[localid] = original_globalid;
            });
            //Act
            mockFramework(function(){
                target.index(localid,globalid);
                actual = target.localIndex[localid];
            });
            //Assert
            Assert.Equal(expected, actual);
        }

        //this cover when index[locaid] is already an array
        [Fact]
        function AppendLocalIdArrayWithGlobalId() {
            //Arrange
            var localid = "testLocalId";
            var globalid = "testGlobalId2";
            var original_globalid_array = ["testGlobalId1"];
            var expected = ["testGlobalId1",globalid];
            var target = null;
            var actual=null;
            mockFramework(function(){
                target = new Aura.Component.Component({},true);
                target.assertValid = function(){return true};
                target.localIndex = [];
                target.localIndex[localid] = original_globalid_array;
            });
            //Act
            mockFramework(function(){
                target.index(localid,globalid);
                actual = target.localIndex[localid];
            });
            //Assert
            Assert.Equal(expected, actual);
        }
    }//end of [Fixture] Index()

    [Fixture]
    function superRender() {
        [Fact]
        function ReturnsValueFromSuperComponentRender() {
            // Arrange
            var expected = "SuperRender";
            var target = null;
            var mockSuperComponent = {
                    render: function() {
                        return "SuperRender";
                    }
                };
            mockFramework(function() {
                target = new Aura.Component.Component({},true);
            });
            target.setSuperComponent(mockSuperComponent);

            // Act
            var actual = target.superRender();

            // Assert
            Assert.Equal(expected, actual);
        }

        [Fact]
        function ReturnsUndefinedWhenNoSuperComponent() {
            // Arrange
            var target = null;
            mockFramework(function() {
                target = new Aura.Component.Component({},true);
            });

            // Act
            var actual = target.superRender();

            // Assert
            Assert.Undefined(actual);
        }
    }

    [Fixture]
    function render() {
        var mockSuperComponent = {
            render: function() {
                return "SuperRender";
            }
        };
        [Fact]
        function CallsOwnRenderWhenHasOwnRender() {
            // Arrange
            var expected = "Render";
            var mockRenderer = {
                    render: function() {return expected}
                };
            var actual = null;
            mockFramework(function() {
                var target = new Aura.Component.Component({},true);
                target["renderer"] = mockRenderer;
                // shouldn't call render in super component
                target.setSuperComponent(mockSuperComponent);

                // Act
                actual = target.render();
            });

            // Assert
            Assert.Equal(expected, actual);
        }

        [Fact]
        function CallsSuperComponentRenderWhenNoOwnRender() {
            // Arrange
            var expected = "SuperRender";
            var actual = null;
            mockFramework(function() {
                var target = new Aura.Component.Component({},true);
                target.setSuperComponent(mockSuperComponent);

                // Act
                actual = target.render();
            });

            // Assert
            Assert.Equal(expected, actual);
        }
    }

    [Fixture]
    function unrender() {
        [Fact]
        function RemoveUnrenderedComponentFromDirtyComponents() {
            // Arrange
            var expected = "testGlobalId";
            var actual = null;
            mockFramework(function() {
                // Assuming that cleanComponent() cleans the given component from dirtyComponents.
                $A.renderingService.cleanComponent = function(globalId) {
                    actual = globalId;
                }
                var target = new Aura.Component.Component({},true);
                target.setupGlobalId(expected);

                // Act
                target.unrender();
            });

            // Assert
            Assert.Equal(expected, actual);
        }
    }

    [Fixture]
    function GetDef() {
        [Fact]
        function ReturnsNullForInvalidComponent() {
            // Arrange
            var target = null;
            mockFramework(function() {
                target = new Aura.Component.Component({},true);
                target.destroy(false);
            });

            // Act
            var actual = target.getDef();

            // Assert
            Assert.Null(actual);
        }

        [Fact]
        function ReturnsComponentDef() {
            // Arrange
            var expected = "Expected ComponentDef";
            var target = null;
            mockFramework(function() {
                target = new Aura.Component.Component({},true);
                target.componentDef = expected;
            });

            // Act
            var actual = target.getDef();

            // Assert
            Assert.Equal(expected, actual);
        }
    }//end of [Fixture]function GetDef()

    [Fixture]
    function toJSON() {
        [Fact]
        function ReturnsObjectWithFalseIsValidForInvalidComponent() {
            // Arrange
            var target = null;
            mockFramework(function() {
                target = new Aura.Component.Component({},true);
                target.isValid = function() {
                    return false;
                };
            });

            // Act
            var actual = target.toJSON().isValid;

            // Assert
            Assert.False(actual);
        }

        [Fact]
        function ReturnsObjectWithTrueIsValidForValidComponent() {
            // Arrange
            var target = null;
            mockFramework(function() {
                target = new Aura.Component.Component({},true);
                target.isValid = function() {
                    return true;
                };
            });

            // Act
            var actual = target.toJSON().isValid;

            // Assert
            Assert.True(actual);
        }
    }
}
