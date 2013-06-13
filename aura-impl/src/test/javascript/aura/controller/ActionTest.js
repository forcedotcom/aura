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

//Mock the exp() function defined in Aura.js, this is originally used for exposing members using a export.js file
Mocks.GetMock(Object.Global(), "exp", function(){})(function(){
    //#import aura.controller.Action
});

Function.RegisterNamespace("Test.Aura.Controller");

[Fixture]
Test.Aura.Controller.ActionTest = function(){
    [Fixture]
    function Constructor(){
        [Fact]
        function SetsStateToNew(){
            // Arrange
            var expected = "NEW";
            var target = new Action();

            // Act
            var actual = target.state;

            // Assert
            Assert.Equal(expected, actual);
        }
    }

    [Fixture]
    function GetId(){
        [Fact]
        function ReturnsIdIfSet(){
            // Arrange
            var expected = "expected";
            var target = new Action();
            target.id = expected;

            // Act
            var actual = target.getId();

            // Assert
            Assert.Equal(expected, actual);
        }

        [Fact]
        function ConstructsIdIfNotSet(){
            // Arrange
            var targetNextActionId = 123;
            var targetContextNum = "expectedContextNum";
            var expected = String.Format("{0}.{1}", targetNextActionId, targetContextNum);
            var target = new Action();
            var mockContext = Mocks.GetMock(Object.Global(), "$A", {
                getContext: function(){
                    return {
                        getNum: function(){
                            return targetContextNum;
                        }
                    };
                }
            });
            var mockActionId = Mocks.GetMock(Action.prototype, "nextActionId", targetNextActionId);
            var actual;

            // Act
            mockContext(function(){
                mockActionId(function(){
                    actual = target.getId();
                });
            });

            // Assert
            Assert.Equal(expected, actual);
        }

        [Fact]
        function SetsConstructedIdOnAction(){
            // Arrange
            var targetNextActionId = 123;
            var targetContextNum = "expectedContextNum";
            var expected = String.Format("{0}.{1}", targetNextActionId, targetContextNum);
            var target = new Action();
            var mockContext = Mocks.GetMock(Object.Global(), "$A", {
                getContext: function(){
                    return {
                        getNum: function(){
                            return targetContextNum;
                        }
                    };
                }
            });
            var mockActionId = Mocks.GetMock(Action.prototype, "nextActionId", targetNextActionId);

            // Act
            mockContext(function(){
                mockActionId(function(){
                    target.getId();
                });
            });
            var actual = target.id;

            // Assert
            Assert.Equal(expected, actual);
        }

        [Fact]
        function IncrementsActionIdAfterUse(){
            // Arrange
            var targetNextActionId = 123;
            var targetContextNum = "expectedContextNum";
            var expected = targetNextActionId + 1;
            var target = new Action();
            var mockContext = Mocks.GetMock(Object.Global(), "$A", {
                getContext: function(){
                    return {
                        getNum: function(){
                            return targetContextNum;
                        }
                    };
                }
            });
            var mockActionId = Mocks.GetMock(Action.prototype, "nextActionId", targetNextActionId);
            var actual;

            // Act
            mockContext(function(){
                mockActionId(function(){
                    target.getId();
                    actual = target.nextActionId;
                });
            });

            // Assert
            Assert.Equal(expected, actual);
        }
    }

    [Fixture]
    function GetNextGlobalId(){
        [Fact]
        function ReturnsOneIfNotSet(){
            // Arrange
            var expected = 1;
            var target = new Action();

            // Act
            var actual = target.getNextGlobalId();

            // Assert
            Assert.Equal(expected, actual);
        }

        [Fact]
        function ReturnsNextGlobalIdWhenSet(){
            // Arrange
            var expected = 123;
            var target = new Action();
            target.nextGlobalId = expected;

            // Act
            var actual = target.getNextGlobalId();

            // Assert
            Assert.Equal(expected, actual);
        }

        [Fact]
        function IncrementsIdAfterUse(){
            // Arrange
            var expected = 100;
            var target = new Action();
            target.nextGlobalId = 99;

            // Act
            target.getNextGlobalId();
            var actual = target.nextGlobalId;

            // Assert
            Assert.Equal(expected, actual);
        }
    }

    [Fixture]
    function GetDef(){
        [Fact]
        function ReturnsDef(){
            // Arrange
            var expected = "expected";
            var target = new Action();
            target.def = expected;

            // Act
            var actual = target.getDef();

            // Assert
            Assert.Equal(expected, actual);
        }
    }

    [Fixture]
    function SetParams(){
        [Fact]
        function MapsKeyInParamDefsToConfig(){
            // Arrange
            var expected = "expected";
            var key = "key";
            var paramDefs = {key:1};
            var target = new Action(null, null, paramDefs);
            var config = {key:expected};

            // Act
            target.setParams(config);
            var actual = target.params[key];

            // Assert
            Assert.Equal(actual, expected);
        }
    }

    [Fixture]
    function GetParam(){
        [Fact]
        function ReturnsValueFromParamsObject(){
            // Arrange
            var expected = "expected";
            var paramsKey = "key";
            var target = new Action();
            target.params[paramsKey] = expected;

            // Act
            var actual = target.getParam(paramsKey);

            // Assert
            Assert.Equal(expected, actual);
        }
    }

    [Fixture]
    function GetParams(){
        [Fact]
        function ReturnsParamsObject(){
            // Arrange
            var expected = "expected";
            var target = new Action();
            target.params = expected;

            // Act
            var actual = target.getParams();

            // Assert
            Assert.Equal(expected, actual);
        }
    }

    [Fixture]
    function GetComponent(){
        [Fact]
        function ReturnsCmpObject(){
            // Arrange
            var expected = "expected";
            var target = new Action();
            target.cmp = expected;

            // Act
            var actual = target.getComponent();

            // Assert
            Assert.Equal(expected, actual);
        }
    }

    [Fixture]
    function SetCallback(){
        [Fact]
        function SetsCallbackWhenNameSet(){
            // Arrange
            var mockContext = Mocks.GetMock(Object.Global(), "$A", {
                util: {
                    isFunction: function(){ return true; }
                }
            });
            var expectedScope = "expectedScope";
            var expectedCallback = "expectedCallback";
            var name = "SUCCESS";
            var target = new Action();

            // Act
            mockContext(function(){
                target.setCallback(expectedScope, expectedCallback, name);
            });

            // Assert
            Assert.Equal(expectedScope, target.callbacks[name]["s"]);
            Assert.Equal(expectedCallback, target.callbacks[name]["fn"]);
        }

        [Fact]
        function ThrowsErrorWhenNameIsInvalid(){
            // Arrange
            var mockContext = Mocks.GetMock(Object.Global(), "$A", {
                error: function() {
                    actual = true;
                },
                util: {
                    isFunction: function() { return true; }
                }
            })
            var name = "someInvalidName";
            var target = new Action();
            var actual = false;

            // Act
            mockContext(function() {
                target.setCallback(null, null, name);
            });

            // Assert
            Assert.True(actual);
        }

        [Fact]
        function SetsAllCallbacksAndScopeWhenNameUndefined(){
            // Arrange
            var mockContext = Mocks.GetMock(Object.Global(), "$A", {
                util: {
                    isFunction: function(){ return true; }
                }
            });
            var expectedScope = "expectedScope";
            var expectedCallback = "expectedCallback";
            var callbackNames = ["SUCCESS", "ERROR", "ABORTED", "INCOMPLETE"];
            var target = new Action();

            // Act
            mockContext(function(){
                target.setCallback(expectedScope, expectedCallback);
            });

            // Assert
            for (var i = 0; i < callbackNames.length; i++) {
                Assert.Equal(expectedScope, target.callbacks[callbackNames[i]]["s"]);
                Assert.Equal(expectedCallback, target.callbacks[callbackNames[i]]["fn"]);
            }
        }

        [Fact]
        function SetsAllCallbacksAndScopeWhenNameAll(){
            // Arrange
            var mockContext = Mocks.GetMock(Object.Global(), "$A", {
                util: {
                    isFunction: function(){ return true; }
                }
            });
            var expectedScope = "expectedScope";
            var expectedCallback = "expectedCallback";
            var callbackNames = ["SUCCESS", "ERROR", "ABORTED", "INCOMPLETE"];
            var target = new Action();

            // Act
            mockContext(function() {
                target.setCallback(expectedScope, expectedCallback, "ALL");
            });

            // Assert
            for (var i = 0; i < callbackNames.length; i++) {
                Assert.Equal(expectedScope, target.callbacks[callbackNames[i]]["s"]);
                Assert.Equal(expectedCallback, target.callbacks[callbackNames[i]]["fn"]);
            }
        }

        [Fact]
        function ThrowsErrorIfCallbackNotAFunction(){
            // Arrange
            var expected = "Action callback should be a function";
            var mockContext = Mocks.GetMock(Object.Global(), "$A", {
                error: function(msg) {
                    actual = msg;
                },
                util: {
                    isFunction: function() { return false; }
                }
            })
            var target = new Action();
            var actual;

            // Act
            mockContext(function() {
                target.setCallback();
            });

            // Assert
            Assert.Equal(expected, actual);
        }
    }

    [Fixture]
    function WrapCallback(){
        [Fact]
        function SetsCallbackToCurrentCallbackThenNewCallback(){
            // Arrange
            var expectedScope = "expectedScope";
            var outerCallbackFlag = false; // Set when function passed in as param is called
            var outerCallback = function() {
                outerCallbackFlag = true;
            }
            var target = new Action();
            target.getState = function() { return "STATE"; };
            target.callbacks = {
                "STATE": {
                    "fn": function(scope, callback) {
                        if (outerCallbackFlag) {
                            Assert.Fail("New callback called before current callback");
                        }
                    }
                }
            };
            target.setCallback = function(scope, func) {
                func.call(scope); // Call what the new callback is set as to test logic inside
            }

            // Act
            target.wrapCallback(null, outerCallback);

            // Assert
            Assert.True(outerCallbackFlag);
        }
    }

    [Fixture]
    function RunDeprecated(){
        [Fact]
        function AssertsIsClientAction(){
            // Arrange
            var expected = "expected";
            var mockAssert = Mocks.GetMock(Object.Global(), "$A", {
                assert: function(param) {
                    actual = param;
                }
            });
            var def = {
                isClientAction: function(){
                    return expected;
                }
            };
            var cmp = {
                getDef: function() {
                    return {
                        getHelper: function(){}
                    }
                }
            };
            var meth = {
                call: function() {}
            };
            var target = new Action();
            target.def = def;
            target.meth = meth;
            target.cmp = cmp;
            var actual = null;

            // Act
            mockAssert(function(){
                target.runDeprecated();
            })

            // Assert
            Assert.Equal(expected, actual);
        }

        [Fact]
        function LogsFailMessageOnException(){
            // Arrange
            var expectedName = "expectedName";
            var expectedQualifiedName = "expectedQN";
            var expected = "Action failed: " + expectedQualifiedName + " -> " + expectedName;
            var mockAssert = Mocks.GetMock(Object.Global(), "$A", {
                assert: function(param) {},
                log: function(msg) {
                    actual = msg;
                }
            });
            var def = {
                isClientAction: function(){}
            };
            var cmp = {
                getDef: function() {
                    return {
                        getDescriptor: function() {
                            return {
                                getQualifiedName: function() {
                                    return expectedQualifiedName;
                                }
                            }
                        }
                    }
                }
            };
            var target = new Action();
            target.def = def;
            target.cmp = cmp;
            target.getDef = function() {
                return {
                    getName: function() {
                        return expectedName;
                    }
                }
            }
            var actual = null;

            // Act
            mockAssert(function(){
                target.runDeprecated();
            })

            // Assert
            Assert.Equal(expected, actual);
        }

        [Fact]
        function SetsStateToRunning(){
            // Arrange
            var expectedState = "RUNNING";
            var mockAssert = Mocks.GetMock(Object.Global(), "$A", {
                assert: function(param) {}
            });
            var def = {
                isClientAction: function(){}
            };
            var cmp = {
                getDef: function() {
                    return {
                        getHelper: function(){}
                    }
                }
            };
            var meth = {
                call: function() {}
            };
            var target = new Action();
            target.def = def;
            target.meth = meth;
            target.cmp = cmp;

            // Act
            mockAssert(function(){
                target.runDeprecated();
            })

            // Assert
            Assert.Equal(expectedState, target.state);
        }

        [Fact]
        function SetsStateToFailureOnException(){
            // Arrange
            var expectedState = "FAILURE";
            var mockAssert = Mocks.GetMock(Object.Global(), "$A", {
                assert: function(param) {},
                log: function() {}
            });
             var def = {
                isClientAction: function(){}
            };
            var cmp = {
                getDef: function() {
                    return {
                        getDescriptor: function() {
                            return {
                                getQualifiedName: function() {}
                            }
                        }
                    }
                }
            };
            var target = new Action();
            target.def = def;
            target.cmp = cmp;
            target.getDef = function() {
                return {
                    getName: function() {}
                }
            }

            // Act
            mockAssert(function(){
                target.runDeprecated();
            })

            // Assert
            Assert.Equal(expectedState, target.state);
        }
    }

    [Fixture]
    function GetState(){
        [Fact]
        function ReturnsState(){
            // Arrange
            var expected = "expected";
            var target = new Action();
            target.state = expected;

            // Act
            var actual = target.getState();

            // Assert
            Assert.Equal(expected, actual);
        }
    }

    [Fixture]
    function GetReturnValue(){
        [Fact]
        function ReturnsReturnValue(){
            // Arrange
            var expected = "expected";
            var target = new Action();
            target.returnValue = expected;

            // Act
            var actual = target.getReturnValue();

            // Assert
            Assert.Equal(expected, actual);
        }
    }

    [Fixture]
    function GetError(){
        [Fact]
        function ReturnsError(){
            // Arrange
            var expected = "expected";
            var target = new Action();
            target.error = expected;

            // Act
            var actual = target.getError();

            // Assert
            Assert.Equal(expected, actual);
        }
    }

    [Fixture]
    function IsBackground(){
        [Fact]
        function ReturnsTrueIfBackgroundSet(){
            //Arrange
            var target = new Action();
            target.background = true;

            // Act
            var actual = target.isBackground();

            // Assert
            Assert.True(actual);
        }

        [Fact]
        function ReturnsFalseIfBackgroundNotSet(){
            //Arrange
            var target = new Action();

            // Act
            var actual = target.isBackground();

            // Assert
            Assert.False(actual);
        }

        [Fact]
        function ReturnsFalseIfBackgroundNotTrue(){
            //Arrange
            var target = new Action();
            target.background = "true";

            // Act
            var actual = target.isBackground();

            // Assert
            Assert.False(actual);
        }
    }

    [Fixture]
    function SetBackground(){
        [Fact]
        function SetsBackgroundToParam(){
            //Arrange
            var expected = "expected";
            var target = new Action();

            // Act
            target.setBackground(expected);
            var actual = target.background;

            // Assert
            Assert.Equal(expected, actual);
        }
    }

    [Fixture]
    function RunAfter(){
        [Fact]
        function AssertsIsServerAction(){
            // Arrange
            var expected = "expected";
            var expectedReturn = "expectedReturn";
            var mockAssert = Mocks.GetMock(Object.Global(), "$A", {
                assert: function(param) {
                    if (param === expectedReturn) {
                        actual = expected;
                    }
                },
                clientService : {
                    enqueueAction: function() {}
                }
            });
            var target = new Action();
            var action = { 
                def: { 
                    isServerAction: function() {
                        return expectedReturn;
                    }
                }
            };
            var actual = null;

            // Act
            mockAssert(function(){
                target.runAfter(action);
            })

            // Assert
            Assert.Equal(expected, actual);
        }

        [Fact]
        function AddsActionParamToQueue(){
            // Arrange
            var expectedReturn = "expectedReturn";
            var mockAssert = Mocks.GetMock(Object.Global(), "$A", {
                assert: function(param) {},
                clientService : {
                    enqueueAction: function(param) {
                        actual = param;
                    }
                }
            });
            var target = new Action();
            var action = { 
                def: { 
                    isServerAction: function() {}
                }
            };
            var actual = null;

            // Act
            mockAssert(function(){
                target.runAfter(action);
            })

            // Assert
            Assert.Equal(action, actual);
        }
        
        [Fact]
        function ThrowsIfActionIsNotServerAction(){
            // Arrange
            var expected = "RunAfter() cannot be called on a client action. Use run() on a client action instead.";
            var mockAssert = Mocks.GetMock(Object.Global(), "$A", {
        	assert : function(condition, message){
        	    if(!condition){
        		var error = new Error(message);
			throw error;
		    }
		}
            });
            var target = new Action();
            var action = { 
                def: { 
                    isServerAction: function() {
                        return false;
                    }
                }
            };
            var actual = null;

            // Act
            mockAssert(function(){
                actual = Record.Exception(function(){
                    target.runAfter(action);
                })
            });

            // Assert
            Assert.Equal(expected, actual);
        }
    }

    [Fixture]
    function Complete(){
        /**
         * Action.complete() is a very large function and would be easier to test if it was broken up into smaller
         * sections. CallsActionCallbackIfCmpIsValid is a happy path test to make sure the Action callback is called
         * when there are is no originalResponse, no storage, and is not in an error state.
         */
        [Fact]
        function CallsActionCallbackIfCmpIsValid(){
            // Arrange
            var mockContext = Mocks.GetMock(Object.Global(), "$A", {
                getContext: function(){
                    return {
                        setCurrentAction: function(){}
                    }
                }
            });
            var target = new Action();
            target.sanitizeStoredResponse = function(){};
            delete target.originalResponse;
            target.getState = function(){ return "NOTERRORSTATE" };
            target.cmp = {
                isValid: function(){ return true; }
            };
            target.callbacks = {
                "NOTERRORSTATE": {
                    "fn": function(){
                        actual = true;
                    }
                }
            };
            target.getStorage = function() { return false; }
            var actual = false;

            // Act
            mockContext(function(){
                target.complete({});
            })

            // Assert
            Assert.True(actual);
        }
    }

    [Fixture]
    function SetAbortable(){
        [Fact]
        function SetsAbortableToTrue(){
            // Arrange
            var target = new Action();

            // Act
            target.setAbortable();

            // Assert
            Assert.True(target.abortable);
        }
    }

    [Fixture]
    function IsAbortable(){
        [Fact]
        function ReturnsAbortableIfSet(){
            // Arrange
            var expected = "expected";
            var target = new Action();
            target.abortable = expected;

            // Act
            var actual = target.isAbortable();

            // Assert
            Assert.Equal(expected, actual);
        }

        [Fact]
        function ReturnsFalseIfAbortableNotSet(){
            // Arrange
            var target = new Action();
            target.abortable = undefined;

            // Act
            var actual = target.isAbortable();

            // Assert
            Assert.False(actual);
        }
    }

    [Fixture]
    function SetExclusive(){
        [Fact]
        function SetsExclusiveTrueIfParamUndefined(){
            // Arrange
            var target = new Action();

            // Act
            target.setExclusive(undefined);

            // Assert
            Assert.True(target.exclusive);
        }

        [Fact]
        function SetsExclusiveToParamIfDefined(){
            // Arrange
            var expected = "expected";
            var target = new Action();

            // Act
            target.setExclusive(expected);
            var actual = target.exclusive;

            // Assert
            Assert.Equal(expected, actual);
        }
    }

    [Fixture]
    function IsExclusive(){
        [Fact]
        function ReturnsExclusiveIfSet(){
            // Arrange
            var expected = "expected";
            var target = new Action();
            target.exclusive = expected;

            // Act
            var actual = target.isExclusive();

            // Assert
            Assert.Equal(expected, actual);
        }

        [Fact]
        function ReturnsFalseIfExclusiveNotSet(){
            // Arrange
            var target = new Action();
            target.exclusive = undefined;

            // Act
            var actual = target.isExclusive();

            // Assert
            Assert.False(actual);
        }
    }

    [Fixture]
    function SetStorable(){
        [Fact]
        function SetsStorableToTrue(){
            // Arrange
            var mockAssert = Mocks.GetMock(Object.Global(), "$A", {
                assert: function() {}
            });
            var target = new Action();
            target.def = {
                isServerAction: function(){
                }
            };
            target.setAbortable = function(){};
            var actual;

            // Act
            mockAssert(function(){
                target.setStorable();
                actual = target.storable;
            })

            // Assert
            Assert.True(actual);
        }

        [Fact]
        function SetsStorableConfigToParam(){
            // Arrange
            var expected = "expected";
            var mockAssert = Mocks.GetMock(Object.Global(), "$A", {
                assert: function() {}
            });
            var target = new Action();
            target.def = {
                isServerAction: function(){
                }
            };
            target.setAbortable = function(){};
            var actual;

            // Act
            mockAssert(function(){
                target.setStorable(expected);
                actual = target.storableConfig;
            })

            // Assert
            Assert.Equal(expected, actual);
        }

        [Fact]
        function SetsStorableCallsSetAbortable(){
            // Arrange
            var expected = "expected";
            var mockAssert = Mocks.GetMock(Object.Global(), "$A", {
                assert: function() {}
            });
            var target = new Action();
            target.def = {
                isServerAction: function(){
                }
            };
            target.setAbortable = function(){
                actual = expected;
            };
            var actual = null;

            // Act
            mockAssert(function(){
                target.setStorable();
            })

            // Assert
            Assert.Equal(expected, actual);
        }

        [Fact]
        function AssertsDefIsServerAction(){
            // Arrange
            var expected = "expected";
            var expectedReturn = "expectedReturn";
            var mockAssert = Mocks.GetMock(Object.Global(), "$A", {
                assert: function(param) {
                    if (param === expectedReturn) {
                        actual = expected;
                    }
                }
            });
            var target = new Action();
            target.def = {
                isServerAction: function(){
                    return expectedReturn;
                }
            };
            target.setAbortable = function(){};
            var actual = null;

            // Act
            mockAssert(function(){
                target.setStorable();
            })

            // Assert
            Assert.Equal(expected, actual);
        }
    }

    [Fixture]
    function IsStorable(){
        [Fact]
        function ReturnsFalseWhenIgnoreExistingFlagSet() {
            // Arrange
            var target = new Action();
            target.storableConfig = { ignoreExisting: true };
            target._isStorable = function() {
                return true;
            }

            // Act
            var ret = target.isStorable();

            // Assert
            Assert.False(ret);
        }

        [Fact]
        function ReturnsFalseWhen_IsStorableFalse() {
            // Arrange
            var target = new Action();
            target._isStorable = function() {
                return false;
            }

            // Act
            var ret = target.isStorable();

            // Assert
            Assert.False(ret);
        }
        
        [Fact]
        function ReturnsTrueWhen_IsStorableTrue() {
            // Arrange
            var target = new Action();
            target._isStorable = function() {
                return true;
            }

            // Act
            var ret = target.isStorable();

            // Assert
            Assert.True(ret);
        }
    }

    [Fixture]
    function _IsStorable(){
        [Fact]
        function ReturnsStorableIfSet(){
            // Arrange
            var expected = "expected";
            var target = new Action();
            target.storable = expected;

            // Act
            var actual = target._isStorable();

            // Assert
            Assert.Equal(expected, actual);
        }

        [Fact]
        function ReturnsFalseIfStorableNotSet(){
            // Arrange
            var target = new Action();
            target.storable = undefined;

            // Act
            var actual = target._isStorable();

            // Assert
            Assert.False(actual);
        }
    }

    [Fixture]
    function getStorageKey(){
        [Fact]
        function ReturnsKeyAsDescriptorAndEncodedParams(){
            // Arrange
            var expectedEncode = "encodedString";
            var expectedDescriptor = "expectedDescriptor";
            var expected = expectedDescriptor + ":" + expectedEncode;
            var mockContext = Mocks.GetMock(Object.Global(), "$A", {
                util: {
                    json: {
                        encode: function(){
                            return expectedEncode;
                        }
                    }
                }
            });
            var target = new Action();
            target.getParams = function(){};
            target.getDef = function() {
                return {
                    getDescriptor: function() {
                        return {
                            toString: function() {
                                return expectedDescriptor;
                            }
                        }
                    }
                }
            };

            // Act
            mockContext(function(){
                actual = target.getStorageKey();
            });

            // Assert
            Assert.Equal(expected, actual);
        }
    }

    [Fixture]
    function IsFromStorage(){
        var mockContext = Mocks.GetMock(Object.Global(), "$A", {
            util: {
                isUndefinedOrNull: function(storage){
                    return storage === undefined || storage === null;
                }
            }
        });
        [Fact]
        function ReturnsTrueIfStorageSet(){
            // Arrange
            var target = new Action();
            target.storage = {};
            var actual = null;

            // Act
            mockContext(function(){
                actual = target.isFromStorage();
            });

            // Assert
            Assert.True(actual);
        }

        [Fact]
        function ReturnsFalseIfStorageNotSet(){
            // Arrange
            var target = new Action();
            delete target.storage;
            var actual = null;

            // Act
            mockContext(function(){
                actual = target.isFromStorage();
            });

            // Assert
            Assert.False(actual);
        }
    }

    [Fixture]
    function SetChained(){
        [Fact]
        function SetsChainedTrue(){
            // Arrange
            var target = new Action();
            var mockContext = Mocks.GetMock(Object.Global(), "$A", {
                enqueueAction: function() {}
            });

            // Act
            mockContext(function(){
                target.setChained();
            })
            

            // Assert
            Assert.True(target.chained);
        }

        [Fact]
        function ChainsCurrentAction(){
            // Arrange
            var target = new Action();
            var mockContext = Mocks.GetMock(Object.Global(), "$A", {
                enqueueAction: function(param) {
                    actual = param;
                }
            });
            var actual = null;

            // Act
            mockContext(function(){
                target.setChained();
            })

            // Assert
            Assert.Equal(target, actual);
        }
    }

    [Fixture]
    function IsChained(){
        [Fact]
        function ReturnsChainedIfSet(){
            // Arrange
            var expected = "expected";
            var target = new Action();
            target.chained = expected;

            // Act
            var actual = target.isChained();

            // Assert
            Assert.Equal(expected, actual);
        }

        [Fact]
        function ReturnsFalseIfStorableNotSet(){
            // Arrange
            var target = new Action();
            target.chained = undefined;

            // Act
            var actual = target.isChained();

            // Assert
            Assert.False(actual);
        }
    }

    [Fixture]
    function ToJSON(){
        [Fact]
        function ReturnsMapOfIdDescriptorAndParams(){
            // Arrange
            var expectedId = "expectedId";
            var expectedDescriptor = "expectedDescriptor";
            var expectedParams = "expectedParams";
            var expected = {"id": expectedId, "descriptor": expectedDescriptor, "params": expectedParams};
            var target = new Action();
            target.getId = function(){ return expectedId; }
            target.getParams = function(){ return expectedParams; }
            target.getDef = function() {
                return {
                    getDescriptor: function() { return expectedDescriptor; }
                }
            }

            // Act
            var actual = target.toJSON();

            // Assert
            Assert.Equal(expected, actual);
        }
    }

    [Fixture]
    function Refresh(){
        [Fact]
        function EnqueuesRefreshAction(){
            // Arrange
            var target = new Action();
            target.storage = {
                created: 0
            };
            target.getStorage = function(){
                return {
                    log: function(){}
                }
            };
            target.storableConfig = {
                refresh: 1 // autoRefreshInterval will be this value times 1000
            };
            target.getComponent = function(){};
            target.fireRefreshEvent = function(){};
            var refreshAction = {
                setParams: function(){},
                setStorable: function(){},
                sanitizeStoredResponse: function(){},
                wrapCallback: function(){}
            }
            target.getDef = function() {
                return {
                    newInstance: function(){
                        return refreshAction;
                    }
                }
            }
            var mockContext = Mocks.GetMock(Object.Global(), "$A", {
                enqueueAction: function(){
                    actual = true;
                }
            });
            var actual = false;

            // Act
            mockContext(function(){
                target.refresh("");
            });

            // Assert
            Assert.True(actual);
        }

        [Fact,Skip("Trouble mocking Date().getTime(). Replace 'EnqueuesRefreshAction' Fact when fixed")]
        function EnqueuesRefreshActionMockDate(){
            // Arrange
            var target = new Action();
            target.storage = {
                created: 0
            };
            target.getStorage = function(){
                return {
                    log: function(){}
                }
            };
            target.storableConfig = {
                refresh: 0 // autoRefreshInterval will be this value times 1000
            };
            target.getComponent = function(){};
            target.fireRefreshEvent = function(){};
            var refreshAction = {
                setParams: function(){},
                setStorable: function(){},
                sanitizeStoredResponse: function(){},
                wrapCallback: function(){}
            }
            target.getDef = function() {
                return {
                    newInstance: function(){
                        return refreshAction;
                    }
                }
            }
            var mockContext = Mocks.GetMock(Object.Global(), "$A", {
                enqueueAction: function(){
                    actual = true;
                }
            });
            var mockDate = Mocks.GetMock(Object.Global(), "Date", function(){
                return {
                    getTime: function() {
                        return 10000;
                    }
                }
            });
            var actual = false;

            // Act
            mockContext(function(){
                mockDate(function() {
                    target.refresh("");
                });
            });

            // Assert
            Assert.True(actual);
        }

        [Fact]
        function DoesNotEnqueueActionIfUnderRefreshInterval(){
            // Arrange
            var target = new Action();
            target.storage = {
                created: new Date().getTime() // set to current time to keep stay below refresh interval
            };
            target.getStorage = function(){
                return {
                    log: function(){}
                }
            };
            target.storableConfig = {
                refresh: 1000 // autoRefreshInterval will be this value times 1000
            };
            target.getComponent = function(){};
            target.fireRefreshEvent = function(){};
            var refreshAction = {
                setParams: function(){},
                setStorable: function(){},
                sanitizeStoredResponse: function(){},
                wrapCallback: function(){}
            }
            target.getDef = function() {
                return {
                    newInstance: function(){
                        return refreshAction;
                    }
                }
            }
            var mockContext = Mocks.GetMock(Object.Global(), "$A", {
                enqueueAction: function(){
                    actual = false;
                }
            });
            var actual = true;

            // Act
            mockContext(function(){
                target.refresh("");
            });

            // Assert
            Assert.True(actual);
        }
    }

    [Fixture]
    function SanitizeStoredResponse(){
        [Fact]
        function ChangesGlobalIdOfComponent(){
            // Arrange
            var suffix = "newSuffix";
            var expectedNewId = "globalId:" + suffix;
            var target = new Action();
            target.getId = function() {
                return suffix;
            }
            var response = {
                "components": {
                    "globalId:originalSuffix" : {
                        "globalId": "originalId"
                    }
                }
            }

            // Act
            target.sanitizeStoredResponse(response);

            // Assert
            Assert.True(expectedNewId in response["components"]);
        }

        [Fact]
        function AddsKeyNamedGlobalIdWithNewGlobalIdAsValueToResponse(){
            // Arrange
            var suffix = "newSuffix";
            var expectedNewId = "globalId:" + suffix;
            var target = new Action();
            target.getId = function() {
                return suffix;
            }
            var response = {
                "components": {
                    "globalId:originalSuffix" : {
                        "globalId": "originalId"
                    }
                }
            }

            // Act
            target.sanitizeStoredResponse(response);
            var actual = response["components"][expectedNewId]["globalId"];

            // Assert
            Assert.Equal(expectedNewId, actual);
        }

        [Fact]
        function ChangesReturnValueGlobalIdIfSet(){
            // Arrange
            var suffix = "newSuffix";
            var expectedNewId = "globalId:" + suffix;
            var target = new Action();
            target.getId = function() {
                return suffix;
            }
            var response = {
                "components": {},
                "returnValue": {
                    "globalId": "globalId:origSuffix"
                }
            }

            // Act
            target.sanitizeStoredResponse(response);
            var actual = response["returnValue"]["globalId"];

            // Assert
            Assert.Equal(expectedNewId, actual);
        }
    }

    [Fixture]
    function GetStorage(){
        [Fact]
        function ReturnsStorageServiceGetStorage(){
            // Arrange
            var target = new Action();
            var mockStorageService = Mocks.GetMock(Object.Global(), "$A", {
                storageService : {
                    getStorage: function(param){
                        return param === "actions";
                    }
                }
            });
            var actual = false;

            // Act
            mockStorageService(function(){
                actual = target.getStorage();
            })

            // Assert
            Assert.True(actual);
        }
    }

    [Fixture]
    function ParseAndFireEvent(){
        [Fact]
        function CallsClientServiceWhenEventNotFoundByDescriptor(){
            // Arrange
            var expected = "expected";
            var mockClientService = Mocks.GetMock(Object.Global(), "$A", {
                clientService : {
                    parseAndFireEvent: function(){
                        actual = expected;
                    }
                }
            });
            var target = new Action();
            target.getComponent = function(){
                return {
                    getEventByDescriptor: function(){
                        return null;
                    }
                }
            }
            var actual = null;

            // Act
            mockClientService(function(){
                target.parseAndFireEvent("");
            })

            // Assert
            Assert.Equal(expected, actual);
        }

        [Fact]
        function FiresEventWhenEventFoundByDescriptor(){
            // Arrange
            var expected = "expected";
            var evt = {
                fire: function(){
                    actual = expected;
                }
            }
            var target = new Action();
            target.getComponent = function(){
                return {
                    getEventByDescriptor: function(){
                        return evt;
                    }
                }
            }
            var actual = null;

            // Act
            target.parseAndFireEvent("");

            // Assert
            Assert.Equal(expected, actual);
        }
    }

    [Fixture]
    function FireRefreshEvent(){
        [Fact]
        function FiresRefreshEventIfImplementsRefreshObserver(){
            // Arrange
            var expected = "expected";
            var target = new Action();
            var cmp = {
                isInstanceOf: function(param) {
                    return param === "auraStorage:refreshObserver";
                },
                getEvent: function() {
                    return {
                        setParams: function() {
                            return {
                                fire: function() {
                                    actual = expected;
                                }
                            }
                        }
                    }
                }
            }
            var actual = null;

            // Act
            target.fireRefreshEvent(null, cmp);

            // Assert
            Assert.Equal(expected, actual);
        }
    }
}
