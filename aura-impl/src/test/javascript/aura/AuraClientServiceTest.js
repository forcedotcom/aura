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
Test.Aura.AuraClientServiceTest = function() {
    var $A = {};
    var Aura = {Services: {}, Controller: {}, Utils: {Logger: {MAX_STACKTRACE_SIZE:100000},Util:{prototype:{on:function(){}}}}};
    var document = {
        getElementById : function(id) {}
    };
    var AuraErrorMsg;

    var Importer = Mocks.GetMocks(Object.Global(), {
        "$A": $A,
        "Aura": Aura,
        "Action": function(){},
        "ActionStorage": function(){},
        "AuraClientService": function(){}
    });

    Importer(function () {
        [Import("aura-impl/src/main/resources/aura/AuraClientService.js")]
        [Import("aura-impl/src/main/resources/aura/controller/Action.js"),
         Import("aura-impl/src/main/resources/aura/controller/ActionStorage.js")]
    });

    var mockGlobal = Mocks.GetMocks(Object.Global(), {
        "$A": {
            log : function() {},
            assert : function(condition, message) {
                if(!condition){
                    throw message;
                }
            },
            util : {
                apply: function() {},
                estimateSize: function() {
                    return 0;
                },
                on: function() {},
                isUndefinedOrNull : function(obj){
                    return obj === undefined || obj === null;
                },
                isUndefined : function() {},
                json : {
                    encode : function(toEncode) {
                        return "<<" + JSON.stringify(toEncode) + ">>";
                    },
                    orderedEncode: function(obj) {
                        return this.encode(obj);
                    }
                },
                isFiniteNumber: function(n) {
                    return typeof n === 'number' && isFinite(n);
                },
                clearCookie: function() {},
                isAction: function () { return true; },
                isString : function(obj) {
                    return typeof obj === 'string';
                },
                isArray : function(obj) {
                    return obj instanceof Array;
                },
                isObject: function(obj) {
                    return typeof obj === "object" && obj !== null && !(obj instanceof Array);
                },
                isEmpty: function(obj){
                    return !obj || obj.length == 0;
                },
                isSessionStorageEnabled: function() {
                    return false;
                },
                getURIDefsState: function(){
                    return null;
                }
            },
            mark : function() {},
            getContext : function() {
                return {
                    encodeForServer: function(includeDynamic, includeExtraPropertiesForCacheableXHR) {
                        return 'encodedForServer:' + includeDynamic + ':' + includeExtraPropertiesForCacheableXHR;
                    }
                };
            },
            auraError: function(msg) {
                this.message = msg;
            },
            clientService: {
                hardRefresh: function(){}
            },
            storageService: {
                getStorage: function() { return null; }
            },
            warning: function() {},
            error: function(msg) {
                AuraErrorMsg = msg;
            },
            run: function(fn) {
                fn();
            }
        },
        window:{
            location: {
                pathname : "/pathname",
                search : "?search=1",
                hash : "#hash"
            }
        },
        "document": document,
        "Aura": Aura,
        "Action": Aura.Controller.Action,
        "AuraClientService": Aura.Services.AuraClientService
    });

    // promise mocks
    var ResolvePromise = function ResolvePromise(value) {
        return {
            then: function(resolve, reject) {
                if(!resolve) {
                    return ResolvePromise(value);
                }

                try {
                    var newValue = resolve(value);
                    while (newValue && newValue["then"]) {
                        newValue.then(function(v) {
                            newValue = v;
                        });
                    }
                    return ResolvePromise(newValue);
                } catch (e) {
                    return RejectPromise(e);
                }
            }
        };
    };

    var RejectPromise = function RejectPromise(error) {
        return {
            then: function(resolve, reject) {
                if(!reject) {
                    return RejectPromise(error);
                }

                try {
                    var value = reject(error);
                    while (value && value["then"]) {
                        value.then(function(v) {
                            value = v;
                        });
                    }
                    return ResolvePromise(value);
                } catch (newError) {
                    return RejectPromise(newError);
                }
            }
        };
    };

    [Fixture]
    function testSendOutForegroundActions() {
        [Fact]
        function returnsTrueWhen60sPass() {
            // Arrange
            var target;
            mockGlobal(function() {
                target = new Aura.Services.AuraClientService();
                target.lastSendTime = 0;
            });
            // Act
            var actual;
            mockGlobal(function() {
                actual = target.shouldSendOutForegroundActions([], 1);
            });

            // Assert : we send out caboose action if it has been longer then 60s since last send
            Assert.Equal(true, actual);
        }

        [Fact]
        function returnsTrueMoreForegroundThanCaboose() {
            // Arrange
            var mockDate = Mocks.GetMocks(Object.Global(), {
                "Date": {
                    now : function() {
                        return 70000;
                    }
                }
            });

            var actual;
            var action1 = new MockAction("server", true);
            var action2 = new MockAction("server", true);

            // Act
            mockGlobal(function() {
                mockDate(function() {
                    var target = new Aura.Services.AuraClientService();
                    target.lastSendTime = Date.now();//make sure we won't send it out because of 60s has passed
                    actual = target.shouldSendOutForegroundActions([action1, action2], 1);
                });
            });

            // Assert : we send out caboose action if there are more foreground actions than caboose ones
            Assert.Equal(true, actual);
        }
    }

    [Fixture]
    function testDupes() {
        [Fact]
        function getAndClearDupesNoKey() {
            // Arrange
            var target;
            mockGlobal(function() {
                target = new Aura.Services.AuraClientService();
            });
            // Act
            var actual;
            mockGlobal(function() {
                actual = target.getAndClearDupes();
            });
            // Assert : we return undefined when calling getAndClearDupes without key
            Assert.Equal(undefined, actual);
        }

        [Fact]
        function deDupeNewEntry() {
            // This just tests the case where we add the action for the first time
            // there is no record in actionStoreMap for this action
            // Arrange
            var target;
            var newAction = new MockAction("server", true);
            var actionId = newAction.getId();
            var expect1 = { "action":newAction };
            mockGlobal(function() {
                target = new Aura.Services.AuraClientService();
                target.deDupe(newAction, true);
            });

            // Act
            var actual1;
            var actual2;
            mockGlobal(function() {
                actual1 = target.actionStoreMap["fakeKey"];
                actual2 = target.actionStoreMap[actionId]
            });
            // Assert : we add two entry to the actionStoreMap,
            // actionId --> actionKey, actionKey --> { 'action':action, 'dupes':[dup-action1, dup-action2,....] }
            Assert.Equal(expect1, actual1);
        }

        [Fact]
        function deDupeNewEntryIsActuallyDeDuped() {
            // This just tests the case where we add the action for the first time
            // there is no record in actionStoreMap for this action
            // Arrange
            var target;
            var newAction = new MockAction("server", true);
            var actionId = newAction.getId();
            var expect1 = { "action":newAction };
            mockGlobal(function() {
                target = new Aura.Services.AuraClientService();
                target.deDupe(newAction, true);
            });

            // Act
            var actual1;
            var actual2;
            mockGlobal(function() {
                actual1 = target.actionStoreMap["fakeKey"];
                actual2 = target.actionStoreMap[actionId]
            });
            // Assert : we add two entry to the actionStoreMap,
            // actionId --> actionKey, actionKey --> { 'action':action, 'dupes':[dup-action1, dup-action2,....] }
            Assert.Equal("fakeKey", actual2);
        }

    }

    [Fixture]
    function testAuraXHR() {
        [Fact]
        function CreatedNewAuraXHRisEmpty() {
            // Arrange
            var target = new Aura.Services.AuraClientService$AuraXHR();

            // Assert
            Assert.Equal(0, target.length);
        }

        [Fact]
        function AddedActionStored() {
            // Arrange
            var newAction = new MockAction();
            var target = new Aura.Services.AuraClientService$AuraXHR();

            // Act
            target.addAction(newAction);

            // Assert
            Assert.Equal(newAction, target.actions[newAction.id]);
        }

        [Fact]
        function AddedActionCanBeRetrievedByGetAction() {
            // Arrange
            var newAction = new MockAction();
            var target = new Aura.Services.AuraClientService$AuraXHR();

            // Act
            target.addAction(newAction);

            // Act and Assert
            Assert.Equal(newAction, target.getAction(newAction.id));
        }

        [Fact]
        function RetrievedActionIsClearedFromCollection() {
            // Arrange
            var newAction = new MockAction();
            var target = new Aura.Services.AuraClientService$AuraXHR();

            // Act
            target.addAction(newAction);
            target.getAction(newAction.id);

            // Assert
            Assert.Equal(undefined, target.actions[newAction.id]);//after the getAction above, this become undefined
        }

        [Fact]
        function countAvailableXHRs() {
            // Arrange
            var target;
            mockGlobal(function() {
                target = new Aura.Services.AuraClientService();
                target.setQueueSize(4);
            });

            // Assert
            Assert.Equal(4, target.countAvailableXHRs());
        }

        [Fact]
        function PubliclyCacheableActionInXHRRetrievableWithNoId() {
            // mock the $A.assert function called in getAction()
            var mockAssert = Mocks.GetMock(Object.Global(), "$A", {
                assert: function() {}
            });

            // Arrange
            var newAction = new MockAction("servercacheable");
            var target = new Aura.Services.AuraClientService$AuraXHR();
            var addedAction;

            // Act
            target.addAction(newAction);

            // note there is no parameter provided to getAction here
            mockAssert(function() {
                addedAction = target.getAction();
            });

            // Assert
            Assert.Equal(newAction, addedAction);
         }

    };

    var id = 0;

    var MockAction = function(type, isStorable) {
        this.setBackground = Stubs.GetMethod();
        id = id + 1;
        this.id = id;
        this.getId = function() { return this.id; } ;
        this.resetId = function() {
            id = 1; this.id = 1;
        }
        if (type === undefined) {
            type = "server";
        }
        if (isStorable === undefined) {
            isStorable = false;
        }
        this.storable = isStorable;
        this.getStorageKey = function() { return "fakeKey"; };
        this.isStorable = function() { return this.storable; };
        this.isAbortable = Stubs.GetMethod(false);
        this.isCaboose = Stubs.GetMethod(false);
        this.isBackground = Stubs.GetMethod(false);
        this.isPublicCachingEnabled = Stubs.GetMethod(false);
        this.runDeprecated = Stubs.GetMethod();
        this.addCallbackGroup = Stubs.GetMethod();
        this.abort = Stubs.GetMethod();
        this.def = {
            isClientAction : Stubs.GetMethod(true),
            isServerAction : Stubs.GetMethod(false),
            isPublicCachingEnabled : Stubs.GetMethod(false),
            getPublicCachingExpiration : Stubs.GetMethod(0)
        };

        this.getDef = Stubs.GetMethod(this.def);

        var sdef = Stubs.GetMethod({
            isClientAction : Stubs.GetMethod(false),
            isServerAction : Stubs.GetMethod(true),
            isPublicCachingEnabled: Stubs.GetMethod(false),
            getPublicCachingExpiration: Stubs.GetMethod(0)
        });

        var cacheableDef = {
            isClientAction : Stubs.GetMethod(false),
            isServerAction : Stubs.GetMethod(true),
            isPublicCachingEnabled: Stubs.GetMethod(true),
            getPublicCachingExpiration: Stubs.GetMethod(100)
        };

        this.isPubliclyCacheable = function() {
            return this.def.isPublicCachingEnabled() && this.def.getPublicCachingExpiration() > 0;
        }
        
        this.callAllAboardCallback = function() { return true; }
        this.isChained = function() { return false; }
        this.prepareToSend = function() {}

        if (type === "clientbackground") {
            this.isBackground = Stubs.GetMethod(true);
        } else if (type === "server") {
            this.getDef = sdef;
            this.isRefreshAction = Stubs.GetMethod(false);
        } else if (type === "serverbackground") {
            this.getDef = sdef;
            this.isBackground = Stubs.GetMethod(true);
        } else if (type === "serverabortable") {
            this.getDef = sdef;
            this.isAbortable = Stubs.GetMethod(true);
        } else if (type === "serverforceboxcar") {
            this.getDef = sdef;
            this.isCaboose = Stubs.GetMethod(true);
        } else if (type === "servercacheable") {
            this.def = cacheableDef;
            this.getDef = Stubs.GetMethod(cacheableDef);
        }
    };

    [Fixture]
    function isActionInStorage() {

        [Fact]
        function CallbackWithTrueIfActionKeyInStorage() {
            // Arrange
            var actual;
            var descriptor = "DESCRIPTOR";
            var params = {params: "PARAMS"};

            mockGlobal(function() {
                var targetService = new Aura.Services.AuraClientService();

                var actionKey = Aura.Controller.Action.getStorageKey(descriptor, params);
                var mockActionStorage = {
                    isStoragePersistent: function() {
                        return false;
                    },
                    isStorageEnabled: function() {
                        return true;
                    },
                    get: function(key) {
                        if (key === actionKey) {
                            return ResolvePromise("STORED");
                        }
                    }
                };
                targetService.actionStorage = mockActionStorage;

                // Action
                targetService.isActionInStorage(descriptor, params, function(result){actual = result;});
            });

            // Assert
            Assert.True(actual);
        }

        [Fact]
        function CallbackWithFalseIfActionKeyWithDifferentParams() {
            // Arrange
            var actual;
            var descriptor = "DESCRIPTOR";
            var params = {params: "PARAMS"};

            mockGlobal(function() {
                var targetService = new Aura.Services.AuraClientService();

                var actionKey = Aura.Controller.Action.getStorageKey(descriptor, params);
                var mockActionStorage = {
                    isStoragePersistent: function() {
                        return false;
                    },
                    isStorageEnabled: function() {
                        return true;
                    },
                    get: function(key) {
                        if (key === actionKey) {
                            return ResolvePromise("STORED");
                        } else {
                            return ResolvePromise(undefined);
                        }
                    }
                };
                targetService.actionStorage = mockActionStorage;

                // Action
                targetService.isActionInStorage(descriptor, {}, function(result){actual = result;});
            });

            // Assert
            Assert.False(actual);
        }

        [Fact]
        function CallbackWithFalseIfDescriptorIsNotString() {
            // Arrange
            var actual;
            var descriptor = "DESCRIPTOR";
            var params = {params: "PARAMS"};

            mockGlobal(function() {
                var targetService = new Aura.Services.AuraClientService();

                var actionKey = Aura.Controller.Action.getStorageKey(descriptor, params);
                var mockActionStorage = {
                    isStoragePersistent: function() {
                        return false;
                    }
                };
                targetService.actionStorage = mockActionStorage;

                // Action
                targetService.isActionInStorage(null, params, function(result){actual = result;});
            });

            // Assert
            Assert.False(actual);
        }

        [Fact]
        function CallbackWithFalseIfParamsIsNotObject() {
            // Arrange
            var actual;
            var descriptor = "DESCRIPTOR";
            var params = {params: "PARAMS"};

            mockGlobal(function() {
                var targetService = new Aura.Services.AuraClientService();

                var actionKey = Aura.Controller.Action.getStorageKey(descriptor, params);
                var mockActionStorage = {
                    isStoragePersistent: function() {
                        return false;
                    }
                };
                targetService.actionStorage = mockActionStorage;

                // Action
                targetService.isActionInStorage(descriptor, null, function(result){actual = result;});
            });

            // Assert
            Assert.False(actual);
        }

        [Fact]
        function CallbackWithFalseIfKeyMissesInCacheForPersistentStorage() {
            // Arrange
            var actual;
            var descriptor = "DESCRIPTOR";
            var params = {params: "PARAMS"};

            mockGlobal(function() {
                var targetService = new Aura.Services.AuraClientService();

                var actionKey = Aura.Controller.Action.getStorageKey(descriptor, params);
                var mockActionStorage = {
                    isStoragePersistent: function() {
                        return true;
                    },
                    isStorageEnabled: function() {
                        return true;
                    },
                    isKeyAbsentFromCache: function(key) {
                        return true;
                    }
                };
                targetService.actionStorage = mockActionStorage;

                // Action
                targetService.isActionInStorage(descriptor, params, function(result){actual = result;});
            });

            // Assert
            Assert.False(actual);
        }

    }

    [Fixture]
    function revalidateAction() {

        [Fact]
        function CallbackWithTrueIfRevalidationSucceeds() {
            // Arrange
            var actual;
            var descriptor = "DESCRIPTOR";
            var params = {params: "PARAMS"};

            mockGlobal(function() {
                var targetService = new Aura.Services.AuraClientService();

                var actionKey = Aura.Controller.Action.getStorageKey(descriptor, params);
                var mockActionStorage = {
                    isStoragePersistent: function() {
                        return false;
                    },
                    isStorageEnabled: function() {
                        return true;
                    },
                    get: function(key) {
                        if (key === actionKey) {
                            return ResolvePromise("STORED");
                        }
                    },
                    set: function() {
                        return ResolvePromise();
                    }
                };
                targetService.actionStorage = mockActionStorage;

                // Action
                targetService.revalidateAction(descriptor, params, function(result){actual = result;});
            });

            // Assert
            Assert.True(actual);
        }

        [Fact]
        function CallbackWithFalseIfActionKeyWithDifferentParams() {
            // Arrange
            var actual;
            var descriptor = "DESCRIPTOR";
            var params = {params: "PARAMS"};

            mockGlobal(function() {
                var targetService = new Aura.Services.AuraClientService();

                var actionKey = Aura.Controller.Action.getStorageKey(descriptor, params);
                var mockActionStorage = {
                    isStoragePersistent: function() {
                        return false;
                    },
                    isStorageEnabled: function() {
                        return true;
                    },
                    get: function(key) {
                        if (key === actionKey) {
                            return ResolvePromise("STORED");
                        } else {
                            return ResolvePromise(undefined);
                        }
                    }
                };
                targetService.actionStorage = mockActionStorage;

                // Action
                targetService.revalidateAction(descriptor, {}, function(result){actual = result;});
            });

            // Assert
            Assert.False(actual);
        }

        [Fact]
        function CallbackWithFalseIfParamsIsNotObject() {
            // Arrange
            var actual;

            mockGlobal(function() {
                var targetService = new Aura.Services.AuraClientService();

                var mockActionStorage = {
                    isStoragePersistent: function() {
                        return false;
                    }
                };
                targetService.actionStorage = mockActionStorage;

                // Action
                targetService.revalidateAction("descriptor", null, function(result){actual = result;});
            });

            // Assert
            Assert.False(actual);
        }

        [Fact]
        function CallbackWithFalseIfDescriptorIsNotString() {
            // Arrange
            var actual;
            var params = {params: "PARAMS"};

            mockGlobal(function() {
                var targetService = new Aura.Services.AuraClientService();

                var mockActionStorage = {
                    isStoragePersistent: function() {
                        return false;
                    }
                };
                targetService.actionStorage = mockActionStorage;

                // Action
                targetService.revalidateAction(null, params, function(result){actual = result;});
            });

            // Assert
            Assert.False(actual);
        }

        [Fact]
        function CallbackWithFalseIfStorageIsNotEnabled() {
            // Arrange
            var actual;
            var descriptor = "DESCRIPTOR";
            var params = {params: "PARAMS"};

            mockGlobal(function() {
                var targetService = new Aura.Services.AuraClientService();

                var mockActionStorage = {
                    isStorageEnabled: function() {
                        return false;
                    }
                };
                targetService.actionStorage = mockActionStorage;

                // Action
                targetService.revalidateAction(descriptor, params, function(result){actual = result;});
            });

            // Assert
            Assert.False(actual);
        }

        [Fact]
        function CallbackWithFalseIfKeyMissesInCacheForPersistentStorage() {
            // Arrange
            var actual;
            var descriptor = "DESCRIPTOR";
            var params = {params: "PARAMS"};

            mockGlobal(function() {
                var targetService = new Aura.Services.AuraClientService();

                var mockActionStorage = {
                    isStoragePersistent: function() {
                        return true;
                    },
                    isStorageEnabled: function() {
                        return true;
                    },
                    isKeyAbsentFromCache: function(key) {
                        return true;
                    }
                };
                targetService.actionStorage = mockActionStorage;

                // Action
                targetService.revalidateAction(descriptor, params, function(result){actual = result;});
            });

            // Assert
            Assert.False(actual);
        }
    }

    [Fixture]
    function invalidateAction() {

        [Fact]
        function CallbackWithTrueIfInvalidationSucceeds() {
            // Arrange
            var actual = false;
            var descriptor = "DESCRIPTOR";
            var params = {params: "PARAMS"};

            mockGlobal(function() {
                var targetService = new Aura.Services.AuraClientService();

                var actionKey = Aura.Controller.Action.getStorageKey(descriptor, params);
                var mockActionStorage = {
                    isStoragePersistent: function() {
                        return false;
                    },
                    isStorageEnabled: function() {
                        return true;
                    },
                    remove: function(key) {
                        if (key === actionKey) {
                            return ResolvePromise();
                        }
                    }
                };
                targetService.actionStorage = mockActionStorage;

                // Action
                targetService.invalidateAction(descriptor, params, function(result){actual = result;});
            });

            // Assert
            Assert.True(actual);
        }

        [Fact]
        function CallsErrorCallbackIfStorageRejectsWithError() {
            // Arrange
            var actual;
            var descriptor = "DESCRIPTOR";
            var params = {params: "PARAMS"};
            var mockError = Stubs.GetObject();

            mockGlobal(function() {
                var targetService = new Aura.Services.AuraClientService();

                var mockActionStorage = {
                    isStoragePersistent: function() {
                        return false;
                    },
                    isStorageEnabled: function() {
                        return true;
                    },
                    remove: function(key) {
                        return RejectPromise(mockError);
                    }
                };
                targetService.actionStorage = mockActionStorage;

                // Action
                targetService.invalidateAction(descriptor, params, null, function(err){actual = err;});
            });

            // Assert
            Assert.True(actual === mockError);
        }

        [Fact]
        function CallbackWithFalseIfParamsIsNotObject() {
            // Arrange
            var actual;

            mockGlobal(function() {
                var targetService = new Aura.Services.AuraClientService();

                var mockActionStorage = {
                    isStoragePersistent: function() {
                        return false;
                    }
                };
                targetService.actionStorage = mockActionStorage;

                // Action
                targetService.invalidateAction("descriptor", null, function(result){actual = result;});
            });

            // Assert
            Assert.False(actual);
        }

        [Fact]
        function CallbackWithFalseIfDescriptorIsNotString() {
            // Arrange
            var actual;
            var params = {params: "PARAMS"};

            mockGlobal(function() {
                var targetService = new Aura.Services.AuraClientService();

                var mockActionStorage = {
                    isStoragePersistent: function() {
                        return false;
                    }
                };
                targetService.actionStorage = mockActionStorage;

                // Action
                targetService.invalidateAction(null, params, function(result){actual = result;});
            });

            // Assert
            Assert.False(actual);
        }

        [Fact]
        function CallbackWithFalseIfStorageIsNotEnabled() {
            // Arrange
            var actual;
            var descriptor = "DESCRIPTOR";
            var params = {params: "PARAMS"};

            mockGlobal(function() {
                var targetService = new Aura.Services.AuraClientService();

                var mockActionStorage = {
                    isStorageEnabled: function() {
                        return false;
                    }
                };
                targetService.actionStorage = mockActionStorage;

                // Action
                targetService.invalidateAction(descriptor, params, function(result){actual = result;});
            });

            // Assert
            Assert.False(actual);
        }

        [Fact]
        function CallbackWithTrueIfKeyMissesInCacheForPersistentStorage() {
            // Arrange
            var actual;
            var descriptor = "DESCRIPTOR";
            var params = {params: "PARAMS"};

            mockGlobal(function() {
                var targetService = new Aura.Services.AuraClientService();

                var mockActionStorage = {
                    isStoragePersistent: function() {
                        return true;
                    },
                    isStorageEnabled: function() {
                        return true;
                    },
                    isKeyAbsentFromCache: function(key) {
                        return true;
                    }
                };
                targetService.actionStorage = mockActionStorage;

                // Action
                targetService.invalidateAction(descriptor, params, function(result){actual = result;});
            });

            // Assert
            Assert.True(actual);
        }
    }

    [Fixture]
    function enqueueActionFlowthrough() {

        function getMockedService() {
            var target = new Aura.Services.AuraClientService();
            target.allowFlowthrough = true;
            target.getAvailableXHR = Stubs.GetMethod(true);
            return target;
        }

        [Fact]
        function CallsSend() {
            var target;

            // arrange
            var mockAction = new MockAction();

            mockGlobal(function () {
                target = getMockedService();
                target.send = Stubs.GetMethod(true);

                // act
                target.enqueueAction(mockAction);
            });

            // assert
            Assert.Equal(1, target.send.Calls.length);
        }

        [Fact]
        function CallsSendWithGetIfPubliclyCacheable() {
            // arrange
            var target;
            var mockAction = new MockAction();
            mockAction.isPubliclyCacheable = Stubs.GetMethod(true);

            mockGlobal(function () {
                target = getMockedService();
                target.send = Stubs.GetMethod('auraXHR', 'actions', 'method', true);

                // act
                target.enqueueAction(mockAction);
            });

            // assert
            Assert.Equal('GET', target.send.Calls[0].Arguments.method);
        }

        [Fact]
        function SendsXhrIfStorageIsNotPersistent() {
            // Arrange
            var target;
            var mockAction = new MockAction("server", true);

            var mockStorage = {
                isStoragePersistent: function() {
                    return false;
                }
            };

            mockGlobal(function () {
                target = getMockedService();
                target.send = Stubs.GetMethod(true);
                target.actionStorage = mockStorage;

                // Act
                target.enqueueAction(mockAction);
            });

            // Assert
            Assert.Equal(1, target.send.Calls.length);
        }

        [Fact]
        function SendsXhrIfActionsFilterIsNotInitialized() {
            // Arrange
            var target;
            var mockAction = new MockAction("server", true);

            var mockStorage = {
                isStoragePersistent: function() {
                    return true;
                },
                isActionsFilterInitialized: function() {
                    return false;
                }
            };

            mockGlobal(function () {
                target = getMockedService();
                target.send = Stubs.GetMethod(true);
                target.actionStorage = mockStorage;

                // Act
                target.enqueueAction(mockAction);
            });

            // Assert
            Assert.Equal(1, target.send.Calls.length);
        }

        [Fact]
        function SendsXhrIfActionIsNotStored() {
            // Arrange
            var target;
            var mockAction = new MockAction("server", true);

            var mockStorage = {
                isStoragePersistent: function() {
                    return true;
                },
                isActionsFilterInitialized: function() {
                    return true;
                },
                isKeyAbsentFromCache: function() {
                    return true;
                }
            };

            mockGlobal(function () {
                target = getMockedService();
                target.send = Stubs.GetMethod(true);
                target.actionStorage = mockStorage;

                // Act
                target.enqueueAction(mockAction);
            });

            // Assert
            Assert.Equal(1, target.send.Calls.length);
        }

        [Fact]
        function EnqueuesActionIfActionIsStored() {
            // Arrange
            var target;
            var mockAction = new MockAction("server", true);

            var mockStorage = {
                isStoragePersistent: function() {
                    return true;
                },
                isActionsFilterInitialized: function() {
                    return true;
                },
                isKeyAbsentFromCache: function() {
                    return false;
                }
            };

            mockGlobal(function () {
                target = getMockedService();
                target.actionStorage = mockStorage;

                // Act
                target.enqueueAction(mockAction);
            });

            // Assert
            Assert.True(target.actionsQueued.indexOf(mockAction) > -1);
        }
    }

    [Fixture]
    function setToken() {

        [Fact]
        function RespectsTokenParam() {
            var expected = "myToken";
            var targetService;
            mockGlobal(function() {
                targetService = new Aura.Services.AuraClientService();
                targetService.saveTokenToStorage = function(){};

                targetService.setToken(expected);
            });

            var actual = targetService._token;
            Assert.Equal(expected, actual);
        }
    }


    [Fixture]
    function resetToken() {

        [Fact]
        function ResetTokenCallsSetToken() {
            var expected = "myToken";
            var actual;
            var targetService;
            mockGlobal(function() {
                targetService = new Aura.Services.AuraClientService();
                targetService.setToken = function(newToken) {
                    actual = newToken;
                };

                targetService.resetToken(expected);
            });

            Assert.Equal(expected, actual);
        }
    }

    [Fixture]
    function invalidSession() {

        [Fact]
        function DisablesParallelBootstrapWhenGivenInvalidToken() {

            mockGlobal(function() {
                var target = new Aura.Services.AuraClientService();
                // Since we use document.cookie to switch parallel bootstrap,
                // we just verify the method gets called.
                target.disableParallelBootstrapLoadOnNextLoad = Stubs.GetMethod();
                target.saveTokenToStorage = function() {
                    return ResolvePromise();
                };
                target.hardRefresh=function(){};

                // Act
                target.invalidSession();

                // Assert
                Assert.Equal(1, target.disableParallelBootstrapLoadOnNextLoad.Calls.length)
            });
        }

        [Fact]
        function KeepsCurrentParallelBootstrapCookieIfStoredNewToken() {
            var actual;
            var mockAction = Mocks.GetMocks(Object.Global(), {
                Action: {
                    getStorage: function() {
                        return {
                            isPersistent: function() {
                                return true;
                            }
                        }
                    }
                }
            });

            mockGlobal(function() {
                mockAction(function() {
                    var target = new Aura.Services.AuraClientService();

                    target.saveTokenToStorage = function() {
                        return ResolvePromise();
                    };
                    target.hardRefresh=function(){};

                    document.cookie = "expected";
                    try {
                        target.invalidSession("myToken");

                        Assert.Equal("expected", document.cookie);
                    } finally {
                        delete document.cookie;
                    }
                });
            });
        }
    }

    [Fixture]
    function initializeClientLibraries() {

        var mockGlobals = Mocks.GetMocks(Object.Global(), {
            "$A": {
                util: {
                    apply: function(target, source) {
                        return source;
                    }
                }
            },
            window: {},
            Aura: Aura
        });

        [Fact]
        function MakesLibNamesAsLowerCase() {
            var libName = "libName";
            var script = {
                getAttribute: function(attribute) {
                    if(attribute === "data-src") {
                        return "path/" + libName + ".js";
                    }
                }
            }

            var mockDocument = Mocks.GetMocks(Object.Global(), {
                document: {
                    getElementById: function() {},
                    getElementsByTagName: function(tagName) {
                        if(tagName === "script") {
                            return [script];
                        }
                    }
                },
            });

            var actual;
            mockGlobals(function() {
                mockDocument(function() {
                    var target = new Aura.Services.AuraClientService();
                    target.initializeClientLibraries();
                    // the lib should be retrievable with lowser case name
                    actual = target.clientLibraries[libName.toLowerCase()];
                })
            });

            Assert.Equal(script, actual.script);
        }

        [Fact]
        function DoesNotOverrideLoadedLib() {
            var libName = "libName";
            var script = {
                getAttribute: function(attribute) {
                    if(attribute === "data-src") {
                        return "path/" + libName + ".js";
                    }
                }
            }
            var mockApply = Stubs.GetMethod();

            var mockGlobals = Mocks.GetMocks(Object.Global(), {
                "$A": {
                    util: {
                        apply: mockApply
                    }
                },
                window: {},
                Aura: Aura
            });

            var mockDocument = Mocks.GetMocks(Object.Global(), {
                document: {
                    getElementById: function() {},
                    getElementsByTagName: function(tagName) {
                        if(tagName === "script") {
                            return [script];
                        }
                    }
                },
            });

            var actual;
            mockGlobals(function() {
                mockDocument(function() {
                    var target = new Aura.Services.AuraClientService();
                    target.clientLibraries[libName.toLowerCase()] = { "loaded": true };

                    target.initializeClientLibraries();
                })
            });

            Assert.Equal(0, mockApply.Calls.length);
        }
    }

    [Fixture]
    function loadClientLibrary() {

        [Fact]
        function LoadsLibWithLowerCaseName() {
            var libName = "LIBNAME";
            var lib = {
                // when lib is loaded, the callback will be called
                // syncly if the lib is registered.
                loaded: true
            };

            var callback = Stubs.GetMethod();
            mockGlobal(function() {
                var target = new Aura.Services.AuraClientService();
                // all client libraries should be store as lower case
                target.clientLibraries[libName.toLowerCase()] = lib;

                // Act
                target.loadClientLibrary(libName, callback);
            });

            // callback gets called when lib is found and loaded
            Assert.Equal(1, callback.Calls.length);
        }
    }

    [Fixture]
    function loadBootstrapFromStorage() {

        [Fact]
        function ReturnsResolvedPromiseWhenGlobalAppBootstrapExists() {
            var actual;
            var resolved = false;

            mockGlobal(function() {
                var target = new Aura.Services.AuraClientService();
                Aura["appBootstrap"] = {data: "data"};
                actual = target.loadBootstrapFromStorage();

                // reset global
                delete Aura["appBootstrap"];
            });

            actual.then(function() {
                resolved = true;
            });

            Assert.True(resolved);
        }

        [Fact]
        function SetsGlobalAppBootstrapCacheStatusFailedWhenStorageIsNonpersistent() {
            var actual;

            var mockStorage = {
                isPersistent: function() {
                    return false;
                }
            };

            var mockStorageService = Mocks.GetMocks(Object.Global(), {
                "$A": {
                    storageService: {
                        getStorage: function() { return mockStorage; }
                    },
                    util: {
                        estimateSize: function(){}
                    }
                },
                Aura: Aura,
                window: {},
                document: document,
                AuraClientService: Aura.Services.AuraClientService
            });

            mockStorageService(function() {
                var target = new Aura.Services.AuraClientService();

                target.loadBootstrapFromStorage();
                actual = Aura["appBootstrapCacheStatus"];
                delete Aura["appBootstrapCacheStatus"];
            });

            Assert.Equal("failed", actual);
        }

        [Fact]
        function SetsGlobalAppBootstrapCacheStatusFailedWhenFailToGetBootstrapFromStorage() {
            var actual;

            var mockStorage = {
                get: function() {
                    return RejectPromise();
                },
                isPersistent: function() {
                    return true;
                }
            };

            var mockStorageService = Mocks.GetMocks(Object.Global(), {
                "$A": {
                    storageService: {
                        getStorage: function() { return mockStorage; }
                    },
                    util: {
                        estimateSize: function(){}
                    }
                },
                Aura: Aura,
                window: {},
                document: document,
                AuraClientService: Aura.Services.AuraClientService
            });

            mockStorageService(function() {
                var target = new Aura.Services.AuraClientService();

                target.loadBootstrapFromStorage();
                actual = Aura["appBootstrapCacheStatus"];
                delete Aura["appBootstrapCacheStatus"];
            });

            Assert.Equal("failed", actual);
        }

        [Fact]
        function SetsGlobalAppBootstrapCacheStatusFailedWhenBootstrapNotExistsInStorage() {
            var actual;

            var mockStorage = {
                get: function() {
                    return ResolvePromise();
                },
                isPersistent: function() {
                    return true;
                }
            };

            var mockStorageService = Mocks.GetMocks(Object.Global(), {
                "$A": {
                    storageService: {
                        getStorage: function() { return mockStorage; }
                    },
                    util: {
                        estimateSize: function(){}
                    }
                },
                Aura: Aura,
                window: {},
                document: document,
                AuraClientService: Aura.Services.AuraClientService
            });

            mockStorageService(function() {
                var target = new Aura.Services.AuraClientService();

                target.loadBootstrapFromStorage();
                actual = Aura["appBootstrapCacheStatus"];
                delete Aura["appBootstrapCacheStatus"];
            });

            Assert.Equal("failed", actual);
        }

        [Fact]
        function SetsAppBootstrapCacheWhenSucceedToGetBootstrapFromStorage() {
            var actual;
            var expected = {data:"data"};

            var mockStorage = {
                get: function(key) {
                    if(key === AuraClientService.BOOTSTRAP_KEY) {
                        return ResolvePromise(expected);
                    }
                },
                isPersistent: function() {
                    return true;
                }
            };

            var mockStorageService = Mocks.GetMocks(Object.Global(), {
                "$A": {
                    storageService: {
                        getStorage: function() { return mockStorage; }
                    },
                    util: {
                        estimateSize: function(){}
                    }
                },
                Aura: Aura,
                window: {},
                document: document,
                AuraClientService: Aura.Services.AuraClientService
            });

            mockStorageService(function() {
                var target = new Aura.Services.AuraClientService();

                target.loadBootstrapFromStorage();
                actual = Aura["appBootstrapCache"];
                delete Aura["appBootstrapCache"];
            });

            Assert.Equal(expected, actual);
        }

        [Fact]
        function SetsAppBootstrapCacheStatusLoadedWhenSucceedToGetBootstrapFromStorage() {
            var actual;

            var mockStorage = {
                get: function(key) {
                    return ResolvePromise({data:"data"});
                },
                isPersistent: function() {
                    return true;
                }
            };

            var mockStorageService = Mocks.GetMocks(Object.Global(), {
                "$A": {
                    storageService: {
                        getStorage: function() { return mockStorage; }
                    },
                    util: {
                        estimateSize: function(){}
                    }
                },
                Aura: Aura,
                window: {},
                document: document,
                AuraClientService: Aura.Services.AuraClientService
            });

            mockStorageService(function() {
                var target = new Aura.Services.AuraClientService();

                target.loadBootstrapFromStorage();
                actual = Aura["appBootstrapCacheStatus"];
                delete Aura["appBootstrapCacheStatus"];
            });

            Assert.Equal("loaded", actual);
        }

    }

    [Fixture]
    function getAppBootstrap() {

        [Fact]
        function ReturnsBootstrapFromServerIfLoaded() {
            var actual;
            var appBootstrap = {};
            mockGlobal(function() {
                var target = new Aura.Services.AuraClientService();
                Aura["appBootstrapStatus"] = "loaded";
                Aura["appBootstrap"] = appBootstrap;

                try {
                    actual = target.getAppBootstrap();
                } finally {
                    delete Aura["appBootstrapStatus"];
                    delete Aura["appBootstrap"];
                    delete document.cookie;
                }
            });

            Assert.True(actual.source === "network" && actual.value === appBootstrap);
        }

        [Fact]
        function ReturnsCachedBootstrapIfServerDataIsLoadingAndCachedDataIsLoadedForParallelLoading() {
            var actual;
            var appBootstrap = {};
            mockGlobal(function() {
                var target = new Aura.Services.AuraClientService();
                Aura["appBootstrapStatus"] = undefined;
                Aura["appBootstrapCacheStatus"] = "loaded";
                Aura["appBootstrapCache"] = appBootstrap;
                target.getParallelBootstrapLoad = function() {
                    return true;
                }

                try {
                    actual = target.getAppBootstrap();
                } finally {
                    delete Aura["appBootstrapStatus"];
                    delete Aura["appBootstrapCacheStatus"];
                    delete Aura["appBootstrapCache"];
                }
            });

            Assert.True(actual.source === "cache" && actual.value === appBootstrap);
        }

        [Fact]
        function ReturnsUndefinedIfServerDataIsLoadingForSerialLoading() {
            var actual;
            mockGlobal(function() {
                var target = new Aura.Services.AuraClientService();
                Aura["appBootstrapStatus"] = undefined;
                // Even if cached data is loaded from storage
                Aura["appBootstrapCacheStatus"] = "loaded";

                try {
                    target.setParallelBootstrapLoad(false);
                    actual = target.getAppBootstrap();
                } finally {
                    delete Aura["appBootstrapCacheStatus"];
                    delete Aura["appBootstrapStatus"];
                }
            });

            Assert.Undefined(actual);
        }

        [Fact]
        function ReturnsCachedBootstrapIfServerDataFailsForSerialLoading() {
            var actual;
            var appBootstrap = {};
            mockGlobal(function() {
                var target = new Aura.Services.AuraClientService();
                Aura["appBootstrapStatus"] = "failed";
                Aura["appBootstrapCacheStatus"] = "loaded";
                Aura["appBootstrapCache"] = appBootstrap;

                try {
                    target.setParallelBootstrapLoad(false);
                    actual = target.getAppBootstrap();
                } finally {
                    delete Aura["appBootstrapStatus"];
                    delete Aura["appBootstrapCacheStatus"];
                    delete Aura["appBootstrapCache"];
                }
            });

            Assert.True(actual.source === "cache" && actual.value === appBootstrap);
        }

        [Fact]
        function ReturnsUndefinedIfServerDataIsLoadingAndCachedDataFailsForParallelLoading() {
            var actual;
            mockGlobal(function() {
                var target = new Aura.Services.AuraClientService();
                Aura["appBootstrapStatus"] = undefined;
                Aura["appBootstrapCacheStatus"] = "failed";
                target.getParallelBootstrapLoad = function() {
                    return true;
                }

                try {
                    actual = target.getAppBootstrap();
                } finally {
                    delete Aura["appBootstrapStatus"];
                    delete Aura["appBootstrapCacheStatus"];
                }
            });

            Assert.Undefined(actual);
        }

        [Fact]
        function ReturnsCachedBootstrapIfServerDataFailsAndCachedDataIsLoadedForSerialLoading() {
            var actual;
            var appBootstrap = {};
            mockGlobal(function() {
                var target = new Aura.Services.AuraClientService();
                Aura["appBootstrapStatus"] = "failed";
                Aura["appBootstrapCacheStatus"] = "loaded";
                Aura["appBootstrapCache"] = appBootstrap;

                try {
                    target.setParallelBootstrapLoad(false);
                    actual = target.getAppBootstrap();
                } finally {
                    delete Aura["appBootstrapStatus"];
                    delete Aura["appBootstrapCacheStatus"];
                    delete Aura["appBootstrapCache"];
                }
            });

            Assert.True(actual.source === "cache" && actual.value === appBootstrap);
        }

        [Fact]
        function ThrowsErrorWhenBootstrapBothFailAndAppcacheHasNoRecovery() {
            var actual;
            mockGlobal(function() {
                var target = new Aura.Services.AuraClientService();
                Aura["appBootstrapStatus"] = "failed";
                Aura["appBootstrapCacheStatus"] = "failed";

                window.applicationCache = {
                    UNCACHED: 0,
                    IDLE: 1,
                    status: 0 //UNCACHED
                };

                try {
                    var expected = false;
                    target.dumpCachesAndReload = function() {
                        expected = true;
                    }
                    target.setParallelBootstrapLoad(false);
                    actual = target.getAppBootstrap();
                    Assert.True(expected);
                } finally {
                    delete window["applicationCache"];
                    delete Aura["appBootstrapStatus"];
                    delete Aura["appBootstrapCacheStatus"];
                }
            });
        }

        [Fact]
        function EnablesParallelBootstrapWhenBootstrapIsLoadedFromServerForParallelLoading() {
            var actual = false;
            var mockUtil = Mocks.GetMocks(Object.Global(), {
                "$A": {
                    util: {
                        clearCookie: function(key) {
                            if (key === "auraDisableBootstrapCache") {
                                actual = true;
                            }
                        }
                    }
                }
            });
            mockGlobal(function() {
                mockUtil(function() {
                    var target = new Aura.Services.AuraClientService();

                    Aura["appBootstrapStatus"] = "loaded";

                    try {
                        target.setParallelBootstrapLoad(true);
                        target.getAppBootstrap();

                        Assert.True(actual);
                    } finally {
                        delete Aura["appBootstrapStatus"];
                    }
                });
            });
        }

    }

    [Fixture]
    function isBB10() {
        [Fact]
        function ReturnsTrueForZ10() {
            var target;
            mockGlobal(function() {
                target = new Aura.Services.AuraClientService();
            });
            var mockUserAgent = Mocks.GetMock(Object.Global(), "navigator", {
                userAgent: "Mozilla/5.0 (BB10; Touch) AppleWebKit/537.10+ (KHTML, like Gecko) Version/10.0.9.2372 Mobile Safari/537.10+"
            });

            var actual;
            mockUserAgent(function(){
                actual = target.isBB10();
            });

            Assert.Equal(true, actual);
        }

        [Fact]
        function ReturnsFalseForNonBB10Blackberry() {
            var target;
            mockGlobal(function() {
                target = new Aura.Services.AuraClientService();
            });
            var mockUserAgent = Mocks.GetMock(Object.Global(), "navigator", {
                userAgent: "Mozilla/5.0 (BlackBerry; U; BlackBerry 9900; en-US) AppleWebKit/534.11+ (KHTML, like Gecko) Version/7.0.0 Mobile Safari/534.11+"
            });

            var actual;
            mockUserAgent(function(){
                actual = target.isBB10();
            });

            Assert.Equal(false, actual);
        }
    }

    [Fixture]
    function handleAppCache() {
        var storageClearCalled = false;
        var componentDefsClearCalled = false;
        var evtCallbacks = {};
        var mockApplicationCache = {
            "addEventListener": function(evt, callback) {
                evtCallbacks[evt] = callback;
            }
        };

        var mockStorage = {
            clear: function() {
                storageClearCalled = true;
            }
        };

        var mockLocation = { reload: function() {} };

        var mockComponentService = {
            clearDefsFromStorage: function() {
                componentDefsClearCalled = true;
                return {
                    then: function() {}
                }
            }
        };

        var mockDeps = Mocks.GetMocks(Object.Global(), {
            "$A": {
                log : function() {},
                assert : function(condition, message) {
                    if(!condition){
                        throw message;
                    }
                },
                util : {
                    on: function() {},
                    isUndefinedOrNull : function(obj){
                        return obj === undefined || obj === null;
                    },
                    isUndefined : function() {},
                    isArray : function() {},
                    json : {
                        encode :function(errorText) {
                            return "mockedJson:"+errorText;
                        },
                        orderedEncode: function(obj) {
                            return obj;
                        }
                    }
                },
                mark : function() {},
                componentService: mockComponentService
            },
            window:{
                "applicationCache": mockApplicationCache,
                "localStorage": mockStorage,
                "sessionStorage": mockStorage,
                "location": mockLocation
            },
            document: document,
            Aura: Aura,
            Action : {
                getStorage: function () {
                    return {
                        isPersistent: function () {
                            return true;
                        },

                        clear: function () {
                            return {
                                then: function resolve() {
                                    componentDefsClearCalled = true;
                                    return { then: resolve };
                                }
                            }
                        }
                    };
                }
            },
            location: mockLocation,
            Promise: {
                all: function() {
                    return {
                        then: function(f) {
                            return f();
                        }
                    }
                }
            }
        });

        [Fact]
        function doesNotCallLocalStorageClearWhenUpdateReady() {
            storageClearCalled = false;
            componentDefsClearCalled = false;

            mockDeps(function() {
                var targetService = new Aura.Services.AuraClientService();
                targetService.shouldPreventReload = function() { return false; };
                targetService.reloadPointPassed = true;
                evtCallbacks["updateready"]();
            });

            Assert.False(storageClearCalled);
        }

        [Fact]
        function doesNotCallSessionStorageClearWhenUpdateReady() {
            storageClearCalled = false;
            componentDefsClearCalled = false;

            mockDeps(function() {
                var targetService = new Aura.Services.AuraClientService();
                targetService.shouldPreventReload = function() { return false; };
                targetService.reloadPointPassed = true;
                evtCallbacks["updateready"]();
            });

            Assert.False(storageClearCalled);
        }

       [Fact]
       function callsComponentRegistryClearWhenUpdateReady() {
           storageClearCalled = false;
           componentDefsClearCalled = false;
           mockDeps(function() {
                window.applicationCache.swapCache = function(){};
                window.applicationCache.UPDATEREADY = 4;
                window.applicationCache.status = 4;
                var targetService = new Aura.Services.AuraClientService();
                targetService.shouldPreventReload = function() { return false; };
                targetService.reloadPointPassed = true;
                evtCallbacks["updateready"]();
           });

           Assert.True(componentDefsClearCalled);
       }

       [Fact]
       function doesNotCallComponentRegistryClearWhenUpdateReadyIsntReallyReady() {
           storageClearCalled = false;
           componentDefsClearCalled = false;
           mockDeps(function() {
                window.applicationCache.swapCache = function(){};
                window.applicationCache.UPDATEREADY = 4;
                window.applicationCache.status = undefined;
                var targetService = new Aura.Services.AuraClientService();
                targetService.shouldPreventReload = function() { return false; };
                targetService.reloadPointPassed = true;
                evtCallbacks["updateready"]();
           });

           Assert.False(componentDefsClearCalled);
       }
    }

    [Fixture]
    function hardRefresh() {
        [Fact]
        function replacesSpaceInUrlWithPlus() {
            var target, expected, actual;
            var mockDeps = Mocks.GetMocks(Object.Global(), {
                document: {
                    body: {
                        parentNode: {
                            getAttribute: function() {return true;}
                        }
                    },
                    getElementById: function() {return undefined;}
                },
                navigator: {
                    userAgent: ""
                },
                window: {},
                history: {
                    pushState: function(state, title, url) {
                        actual = url;
                    }
                },
                location: {
                    href: "http://localhost:9090/test/runner.app?foo=bar bar"
                }
            });

            expected = "runner.app?nocache=http%3A%2F%2Flocalhost%3A9090%2Ftest%2Frunner.app%3Ffoo%3Dbar%2bbar";
            mockGlobal(function() { mockDeps(function() {
                target = new Aura.Services.AuraClientService();
                target.shouldPreventReload = function() { return false; };
                target.hardRefresh();
            }); });

            Assert.Equal(expected, actual);
        }
    }

    [Fixture]
    function Decode() {
        var mockData = {
            decodedResponse : undefined
        };
        var requestedToResolve = [];
        var mocksForDecode = Mocks.GetMocks(Object.Global(), {
            "Date" : {
                now : function() {
                    return "today is a good day";
                }
            },
            "$A" : {
                error : function(text){
                    throw text;
                },
                log : function() {
                },
                assert : function(condition, message) {
                    if (!condition) {
                        throw message;
                    }
                },
                componentService : {
                    saveDefsToStorage: function() {}
                },
                util : {
                    on : function() {
                    },
                    isUndefinedOrNull : function(obj) {
                        return obj === undefined || obj === null;
                    },
                    isUndefined : function() {
                    },
                    isArray : function() {
                    },
                    json : {
                        encode : function(errorText) {
                            return "mockedJson:" + errorText;
                        },
                        orderedEncode : function(obj) {
                            return obj;
                        },
                        decode : function(json) {
                            // if it's html, do JSON parsing to fail the test
                            if(/^\s*</.test(json)) {
                                return JSON.parse(json)
                            }
                            return mockData.decodedResponse;
                        },
                        resolveRefsArray : function(input) {
                            // copy input in case inner objects are changed
                            requestedToResolve.push(JSON.stringify(input));
                            input["context"] = input["context"] || {}
                            input["context"]["componentDefs"] = input["context"]["componentDefs"] || [];
                        },
                        resolveRefsObject: function (input) {
                            // copy input in case inner objects are changed
                            requestedToResolve.push(JSON.stringify(input));
                            input["context"] = input["context"] || {}
                            input["context"]["componentDefs"] = input["context"]["componentDefs"] || [];
                        }
                    },
                    stringEndsWith : function() {
                        return false;
                    }
                },
                mark : function() {
                }
            },
            window : {},
            document : document,
            Aura : Aura
        });

        [Fact]
        function ErrorStatusWhenResponseTextIsHtml() {
            var response = {
                status : 200,
                responseText: "<!DOCTYPE html>"
            };
            var target;
            var ret;

            mocksForDecode(function() {
                target = new Aura.Services.AuraClientService();
                ret = target.decode(response);
            });

            Assert.Equal("ERROR", ret["status"]);
        }

        [Fact]
        function SetsStatusToINCOMPLETEWhenTimedOut() {
            var actual;
            var target;
            mocksForDecode(function() {
                target = new Aura.Services.AuraClientService();
                target.setConnected = function() {}
            });

            mocksForDecode(function() {
                actual = target.decode(undefined, undefined, true);
            });

            Assert.Equal("INCOMPLETE", actual["status"]);
        }

        [Fact]
        function SetsOfflineFlagWhenTimedOut() {
            var actual;
            var target;
            mocksForDecode(function() {
                target = new Aura.Services.AuraClientService();
                target.setConnected = function() {
                    actual = true;
                }
            });

            mocksForDecode(function() {
                target.decode(undefined, undefined, true);
            });

            Assert.True(actual);
        }
    }

    [Fixture]
    function receive() {
        [Fact]
        function PassesTimedOutParamThroughToDecode() {
            var expected = "expected";
            var actual;
            var target;
            mockGlobal(function() {
                target = new Aura.Services.AuraClientService();

                target.decode = function(response, noStrip, timedOut) {
                    actual = timedOut;
                    return response;
                };
                target.fireDoneWaiting = function(){};
                target.auraStack = {
                        push: function(){},
                        pop: function(){}
                };
                target.releaseXHR = function(){};
                target.process = function(){};

                target.receive({request:{status: "nothing"}}, expected);
            });

            Assert.Equal(expected, actual);
        }
    }

    [Fixture]
    function setXHRTimeout() {
        [Fact]
        function ThrowsWhenInputIsNonFiniteNumber() {
            var actual;
            var target;
            mockGlobal(function() {
                target = new Aura.Services.AuraClientService();
            });
            var mockIsFiniteNumber = Mocks.GetMock(Object.Global(), "$A", {
                util: {
                    isFiniteNumber: function() {
                        return false;
                    }
                },
                assert : function(condition, message) {
                    if(!condition){
                        throw message;
                    }
                }
            })

            mockIsFiniteNumber(function(){
                actual = Record.Exception(function() {
                    target.setXHRTimeout("asdf");
                });
            });

            Assert.Equal("Timeout must be a positive number", actual);
        }

        [Fact]
        function ThrowsWhenInputIsZero() {
            var actual;
            var target;
            mockGlobal(function() {
                target = new Aura.Services.AuraClientService();
            });
            var mockIsFiniteNumber = Mocks.GetMock(Object.Global(), "$A", {
                util: {
                    isFiniteNumber: function() {
                        return true;
                    }
                },
                assert : function(condition, message) {
                    if(!condition){
                        throw message;
                    }
                }
            })

            mockIsFiniteNumber(function(){
                actual = Record.Exception(function() {
                    target.setXHRTimeout(0);
                });
            });

            Assert.Equal("Timeout must be a positive number", actual);
        }
    }


    [Fixture]
    function send() {
        var auraXHR = {
            addAction: function() {},
            request: {}
        };

        var actions = [{
            callAllAboardCallback: function() { return true; },
            isChained: function() { return false; },
            prepareToSend: function() {},
            markException: function() {},
            finishAction: function () {},
            getDef: function() { return undefined; }
        }];

        function setOverrides(target) {
            target.deDupe = function() {
                return false;
            };
            target.buildParams = function() {
                return "message=something";
            };
            target.buildActionNameList = function () {
                return "";
            };

            target.createXHR = function() {
                return {
                    open: function(){},
                    send: function(){},
                    setRequestHeader: function(){}
                }
            };
        }


        var mockSetTimeout = Mocks.GetMocks(Object.Global(), {
            setTimeout : function(cb, time) {
            }
        });


        [Fact]
        function SendDoesNotSetTimerWhenNoXHRTimeoutSet() {
            var actual = false;
            var target;
            mockGlobal(function() {
                target = new Aura.Services.AuraClientService();
                setOverrides(target);
            });
            target.xhrSetTimeout = function(f) {
                actual = true;
            };

            mockSetTimeout(function() {
                mockGlobal(function() {
                    target.send(auraXHR, actions, "POST", {});
                });
            });

            Assert.False(actual);
        }
        [Fact]
        function SendSetsTimerWhenXHRTimeoutSet() {
            var actual = false;
            var target;
            mockGlobal(function() {
                target = new Aura.Services.AuraClientService();
                setOverrides(target);
                target.setXHRTimeout(1000);
            });
            target.xhrSetTimeout = function(f) {
                actual = true;
            };


            mockSetTimeout(function() {
                mockGlobal(function() {
                    target.send(auraXHR, actions, "POST", {message:"something"});
                });
            });

            Assert.True(actual);
        }
        [Fact]
        function SendLogsErrorWhenParametersCauseJSONSerializationErrors() {
            var actual = true;
            var target;
            mockGlobal(function() {
                target = new Aura.Services.AuraClientService();
                setOverrides(target);

                var mockJsonEncode = Mocks.GetMock(Object.Global().$A.util.json, "encode", function() { throw "invalid json!"; });

                mockJsonEncode(function() {
                    actual = target.send(auraXHR, actions, "POST", {message:"something"});
                });
            });

            Assert.Equal("failed to generate parameters for action xhr for action: undefined", AuraErrorMsg);
        }
        [Fact]
        function SendReturnsFalseWhenParametersCauseJSONSerializationErrors() {
            var actual = true;
            var target;
            mockGlobal(function() {
                target = new Aura.Services.AuraClientService();
                setOverrides(target);

                var mockJsonEncode = Mocks.GetMock(Object.Global().$A.util.json, "encode", function() { throw "invalid json!"; });

                mockJsonEncode(function() {
                    actual = target.send(auraXHR, actions, "POST", {message:"something"});
                });
            });

            Assert.False(actual);
        }
    }

    [Fixture]
    function sendAsSingle() {
        var getMockAction = function(actionId) {
            return Stubs.GetObject({
                isPubliclyCacheable: function() { return false; }
            }, {
                id: actionId
            });
        };

        [Fact]
        function testSendsAll() {
            var target;
            var expected={
                actions:[ getMockAction("1"), getMockAction("2"), getMockAction("3"), getMockAction("4"), getMockAction("5") ],
                sent:5,
                deDuped:5
            };
            var actual={
                actions:[],
                sent:0,
                deDuped:0
            };

            //
            // Set up.
            //
            mockGlobal(function() {
                target = new Aura.Services.AuraClientService();
            });
            target.deDupe = function() { actual.deDuped += 1; return false; };
            target.getAvailableXHR = function() { return true; };
            target.send = function(auraXHR, actions, name) {
                actual.actions = actual.actions.concat(actions);
                actual.sent += 1;
                return true;
            };

            target.sendAsSingle(expected.actions, expected.actions.length);

            Assert.Equal(expected,actual);
        }

        [Fact]
        function testSendsOneAndEnqueuesRest() {
            var target;
            var expected={
                actions:[ getMockAction("1")],
                deferred:[getMockAction("2"), getMockAction("3"), getMockAction("4"), getMockAction("5") ],
                sent:1,
                deDuped:5
            };
            var actual={
                actions:[],
                deferred:[],
                sent:0,
                deDuped:0
            };
            mockGlobal(function() {
                target = new Aura.Services.AuraClientService();
            });
            target.deDupe = function() { actual.deDuped += 1; return false; };
            target.getAvailableXHR = function() { return true; };
            target.send = function(auraXHR, actions, name) {
                actual.actions = actual.actions.concat(actions);
                actual.sent += 1;
                return true;
            };

            target.sendAsSingle(expected.actions.concat(expected.deferred), expected.sent);
            actual.deferred=target.actionsDeferred;

            Assert.Equal(expected,actual);
        }

        [Fact]
        function testDupeIsDropped() {
            var target;
            var expected={
                actions:[],
                deferred:[],
                sent:0,
                deDuped:1
            };
            var actual={
                actions:[],
                deferred:[],
                sent:0,
                deDuped:0
            };
            mockGlobal(function() {
                target = new Aura.Services.AuraClientService();
            });
            target.deDupe = function() { actual.deDuped += 1; return true; };
            target.getAvailableXHR = function() { return true; };
            target.send = function(auraXHR, actions, name) {
                actual.actions = actual.actions.concat(actions);
                actual.sent += 1;
                return true;
            };

            target.sendAsSingle(["1"], 1);
            actual.deferred=target.actionsDeferred;

            Assert.Equal(expected,actual);
        }
    }

    [Fixture]
    function sendActionXHRs() {
        var actionTypeForeground = "FOREGROUND";
        var actionTypeDeferred = "DEFERRED";
        var actionTypeBackground = "BACKGROUND";
        var actionTypeCaboose = "CABOOSE";
        var actionTypeCacheable = "CACHEABLE";

        var mockAction = function(actionType, abort, cachingEnabled) {
            var def = {
                isPublicCachingEnabled : function() {
                    return actionType === actionTypeCacheable ? true : false;
                },
                getPublicCachingExpiration : function() {
                    return actionType === actionTypeCacheable ? 100 : 0;
                }
            };

            return {
                abortIfComponentInvalid : function(v) {
                    return abort;
                },
                isDeferred : function() {
                    return actionType === actionTypeDeferred;
                },
                isBackground : function() {
                    return actionType === actionTypeBackground;
                },
                isCaboose : function() {
                    return actionType === actionTypeCaboose;
                },
                getDef : function() {
                    return def;
                },
                isStorable : function() {
                    return false;
                },
                isPubliclyCacheable : function() {
                    return cachingEnabled && def.isPublicCachingEnabled() && def.getPublicCachingExpiration() > 0;
                },
                callAllAboardCallback: function () {
                    return true;
                },
                isChained: function () {
                    return false;
                },
                prepareToSend: function () {
                    return true;
                }
            }
        };

        [Fact]
        function testReleaseCalledIfSendReturnsFalseForeground() {
            var actions = [ mockAction(actionTypeForeground) ];
            var expected = "XHR";
            var actual = null;
            var target;

            mockGlobal(function() {
                target = new Aura.Services.AuraClientService();
                target.getAvailableXHR = function(background) {
                    return expected;
                };
                target.shouldSendOutForegroundActions = function(x,y) {
                    return true;
                };
                target.send = function(xhr, actionsToSend, method) {
                    return false;
                };
                target.deDupe = function() {
                    return false;
                };
                target.releaseXHR = function(v) {
                    actual = v;
                };
            });

            target.actionsDeferred = actions;
            target.sendActionXHRs();
            Assert.Equal(expected, actual);
        }

        [Fact]
        function testReleaseCalledIfSendReturnsFalseForegroundExclusivity() {
            var actions = [ mockAction(actionTypeForeground) ];
            var expected = "XHR";
            var actual = null;
            var target;

            mockGlobal(function() {
                target = new Aura.Services.AuraClientService();
                target.getAvailableXHR = function(background) {
                    return expected;
                };
                target.deDupe = function() {
                    return false;
                };
                target.send = function(xhr, actionsToSend, method) {
                    return false;
                };
                target.releaseXHR = function(v) {
                    actual = v;
                };
                target.xhrExclusivity = true;
            });

            target.actionsDeferred = actions;
            target.sendActionXHRs();
            Assert.Equal(expected, actual);
        }

        [Fact]
        function testReleaseCalledIfSendReturnsFalseBackground() {
            var actions = [ mockAction(actionTypeBackground) ];
            var expected = "XHR";
            var actual = null;
            var target;

            mockGlobal(function() {
                target = new Aura.Services.AuraClientService();
                target.getAvailableXHR = function(background) {
                    return expected;
                };
                target.deDupe = function() {
                    return false;
                };
                target.send = function(xhr, actionsToSend, method) {
                    return false;
                };
                target.releaseXHR = function(v) {
                    actual = v;
                };
            });

            target.actionsDeferred = actions;
            target.sendActionXHRs();
            Assert.Equal(expected, actual);
        }

        [Fact]
        function testTwoForegroundSentInOneXHRNoExclusivity() {
            var actions = [ mockAction(actionTypeForeground), mockAction(actionTypeForeground) ];
            var expected = [ actions ];
            var actual = [];
            var target;

            mockGlobal(function() {
                target = new Aura.Services.AuraClientService();
                target.getAvailableXHR = function(background) {
                    return true;
                };
                target.send = function(xhr, actionsToSend, method) {
                    actual.push(actionsToSend);
                    return true;
                };
            });

            target.actionsDeferred = actions;
            target.sendActionXHRs();
            Assert.Equal(expected, actual);
        }

        function testTwoForegroundSentInTwoXHRsExclusivity() {
            var actions = [ mockAction(actionTypeForeground), mockAction(actionTypeForeground) ];
            var expected = [ [ actions[0] ], [ actions[1] ] ];
            var actual = [];
            var target;

            mockGlobal(function() {
                target = new Aura.Services.AuraClientService();
                target.getAvailableXHR = function(background) {
                    return true;
                };
                target.shouldSendOutForegroundActions = function(x,y) {
                    return true;
                };
                target.send = function(xhr, actionsToSend, method) {
                    actual.push(actionsToSend);
                    return true;
                };
                target.xhrExclusivity = true;
            });

            target.actionsDeferred = actions;
            target.sendActionXHRs();
            Assert.Equal(expected, actual);
        }

        [Fact]
        function testOneForegroundOneCacheableSentInTwoXHRs() {
            var actions = [ mockAction(actionTypeForeground, false, true), mockAction(actionTypeCacheable, false, true) ];
            var expected = [ [ actions[0] ], [ actions[1] ] ];
            var actual = [];
            var target;

            mockGlobal(function() {
                target = new Aura.Services.AuraClientService();
                target.getAvailableXHR = function(background) {
                    return true;
                };
                target.shouldSendOutForegroundActions = function(x,y) {
                    return true;
                };
                target.send = function(xhr, actionsToSend, method) {
                    actual.push(actionsToSend);
                    return true;
                };
            });

            target.actionsDeferred = actions;
            target.sendActionXHRs();

            Assert.Equal(expected, actual);
        }

        [Fact]
        function testTwoCacheableSentInTwoXHRs() {
            var actions = [ mockAction(actionTypeCacheable, false, true), mockAction(actionTypeCacheable, false, true) ];
            var expected = [ [ actions[0] ], [ actions[1] ] ];
            var actual = [];
            var target;

            mockGlobal(function() {
                target = new Aura.Services.AuraClientService();
                target.getAvailableXHR = function(background) {
                    return true;
                };

                // skip sending out foreground actions (since there are none)
                target.shouldSendOutForegroundActions = function(x,y) {
                    return false;
                };

                target.send = function(xhr, actionsToSend, method) {
                    actual.push(actionsToSend);
                    return true;
                };
            });

            target.actionsDeferred = actions;
            target.sendActionXHRs();

            Assert.Equal(expected, actual);
        }

        [Fact]
        function testGroupingStillWorksForNonContiguousGroupableActions() {
            var actions = [ mockAction(actionTypeForeground, false, true), mockAction(actionTypeCacheable, false, true), mockAction(actionTypeForeground, false, true) ];
            var expected = [ [ actions[0], actions[2] ], [ actions[1] ] ];
            var actual = [];
            var target;

            mockGlobal(function() {
                target = new Aura.Services.AuraClientService();
                target.getAvailableXHR = function(background) {
                    return true;
                };
                target.shouldSendOutForegroundActions = function(x,y) {
                    return true;
                };
                target.send = function(xhr, actionsToSend, method) {
                    actual.push(actionsToSend);
                    return true;
                };
            });

            target.actionsDeferred = actions;
            target.sendActionXHRs();

            Assert.Equal(expected, actual);
        }

        [Fixture]
        function testCacheableActionRequest() {
            // Arrange
            var action = mockAction(actionTypeCacheable, false, true);

            var actions = [action];

            var mockAuraXHR = {
                addAction: function () {}
            };

            var mockXHR = Stubs.GetObject({
                open: function (method, url) {},
                setRequestHeader: function () {},
                send: function () {}
            });

            var mockSetTimeout = Mocks.GetMocks(Object.Global(), {
                setTimeout: function() {}
            });

            mockSetTimeout(function() {
                mockGlobal(function () {
                    var target = new Aura.Services.AuraClientService();
                    target.getAvailableXHR = function () {
                        return mockAuraXHR;
                    };
                    target.buildActionNameList = function (action) {
                        return action;
                    };
                    target.createXHR = function () {
                        return mockXHR;
                    };

                    target.actionsDeferred = actions;

                    // Execute
                    target.sendActionXHRs()
                });
            });

            [Fact]
            function usesGetMethod() {
                var expectedMethod = "GET";

                // Verify
                Assert.Equal({
                    calls: 1,
                    method: expectedMethod
                }, {
                    calls: mockXHR.open.Calls.length,
                    method: mockXHR.open.Calls[0].Arguments.method
                });
            }

            [Fact]
            function usesExpectedURL() {
                var expectedUrl = '/aura?'
                        + 'message=%3C%3C%7B%22actions%22%3A%5Btrue%5D%7D%3E%3E&'
                        + 'aura.context=encodedForServer%3Afalse%3Atrue&'
                        + 'aura.isAction=true';

                // Verify
                Assert.Equal({
                    calls: 1,
                    url: expectedUrl
                }, {
                    calls: mockXHR.open.Calls.length,
                    url: mockXHR.open.Calls[0].Arguments.url
                });
            }

        }

        [Fact]
        function testCabooseSentWithForeground() {
            var actions = [ mockAction(actionTypeForeground), mockAction(actionTypeCaboose) ];
            var expected = [ actions ];
            var actual = [];
            var target;

            mockGlobal(function() {
                target = new Aura.Services.AuraClientService();
                target.getAvailableXHR = function(background) {
                    return true;
                };
                target.send = function(xhr, actionsToSend, method) {
                    actual.push(actionsToSend);
                    return true;
                };
            });

            target.actionsDeferred = actions;
            target.sendActionXHRs();
            Assert.Equal(expected, actual);
        }

        [Fact]
        function testCabooseFound() {
            var actions = [ mockAction(actionTypeCaboose) ];
            var expected = 1
            var actual = null;
            var target;

            mockGlobal(function() {
                target = new Aura.Services.AuraClientService();
                target.getAvailableXHR = function(background) {
                    return true;
                };
                target.shouldSendOutForegroundActions = function(foreground,caboose) {
                    actual = caboose;
                    return true;
                };
                target.send = function(xhr, actionsToSend, method) {
                    return true;
                };
            });

            target.actionsDeferred = actions;
            target.sendActionXHRs();
            Assert.Equal(expected, actual);
        }


        [Fact]
        function testCabooseSent() {
            var actions = [ mockAction(actionTypeCaboose) ];
            var expected = [ actions ];
            var actual = [];
            var target;

            mockGlobal(function() {
                target = new Aura.Services.AuraClientService();
                target.getAvailableXHR = function(background) {
                    return true;
                };
                target.shouldSendOutForegroundActions = function(foreground,caboose) {
                    return true
                };
                target.send = function(xhr, actionsToSend, method) {
                    actual.push(actionsToSend);
                    return true;
                };
            });

            target.actionsDeferred = actions;
            target.sendActionXHRs();
            Assert.Equal(expected, actual);
        }

        [Fact]
        function testCabooseNotSentIfRejected() {
            var actions = [ mockAction(actionTypeCaboose) ];
            var expected = [ ];
            var actual = [];
            var target;

            mockGlobal(function() {
                target = new Aura.Services.AuraClientService();
                target.getAvailableXHR = function(background) {
                    return expected;
                };
                target.shouldSendOutForegroundActions = function(foreground, caboose) {
                    return false;
                };
                target.send = function(xhr, actionsToSend, method) {
                    actual.push(actionsToSend);
                    return true;
                };
            });

            target.actionsDeferred = actions;
            target.sendActionXHRs();
            Assert.Equal(expected, actual);
        }


        [Fact]
        function testCabooseSentUnconditionallyWithExclusivity() {
            var actions = [ mockAction(actionTypeCaboose) ];
            var expected = [ actions ];
            var actual = [];
            var target;

            mockGlobal(function() {
                target = new Aura.Services.AuraClientService();
                target.getAvailableXHR = function(background) {
                    return true;
                };
                target.shouldSendOutForegroundActions = function(x,y) {
                    return false;
                };
                target.deDupe = function() {
                    return false;
                };
                target.send = function(xhr, actionsToSend, method) {
                    actual.push(actionsToSend);
                    return true;
                };
                target.xhrExclusivity = true;
            });

            target.actionsDeferred = actions;
            target.sendActionXHRs();
            Assert.Equal(expected, actual);
        }

        [Fact]
        function testDeferredSentWhenIdle() {
            var actions = [ mockAction(actionTypeDeferred), mockAction(actionTypeDeferred) ];
            var expected = [ [ actions[0] ], [ actions[1] ] ];
            var actual = [];
            var target;

            mockGlobal(function() {
                target = new Aura.Services.AuraClientService();
                target.getAvailableXHR = function(background) {
                    return true;
                };
                target.idle = function() {
                    return true;
                };
                target.deDupe = function() {
                    return false;
                };
                target.send = function(xhr, actionsToSend, method) {
                    actual.push(actionsToSend);
                    return true;
                };
            });

            target.actionsDeferred = actions;
            target.sendActionXHRs();
            Assert.Equal(expected, actual);
        }

        [Fact]
        function testDeferredNotSentWhenNotIdle() {
            var actions = [ mockAction(actionTypeDeferred), mockAction(actionTypeDeferred) ];
            var expected = [ ];
            var actual = [];
            var target;

            mockGlobal(function() {
                target = new Aura.Services.AuraClientService();
                target.getAvailableXHR = function(background) {
                    return true;
                };
                target.idle = function() {
                    return false;
                };
                target.send = function(xhr, actionsToSend, method) {
                    actual.push(actionsToSend);
                    return true;
                };
                target.xhrExclusivity = true;
            });

            target.actionsDeferred = actions;
            target.sendActionXHRs();
            Assert.Equal(expected, actual);
        }

        [Fact]
        function testDeferredLeftWhenIdle() {
            var actions = [ mockAction(actionTypeDeferred), mockAction(actionTypeDeferred) ];
            var expected = actions;
            var actual = [];
            var target;

            mockGlobal(function() {
                target = new Aura.Services.AuraClientService();
                target.getAvailableXHR = function(background) {
                    return true;
                };
                target.idle = function() {
                    return false;
                };
                target.send = function(xhr, actionsToSend, method) {
                    actual.push(actionsToSend);
                    return true;
                };
                target.xhrExclusivity = true;
            });

            target.actionsDeferred = actions;
            target.sendActionXHRs();
            Assert.Equal(expected, target.actionsDeferred);
        }
    }

    [Fixture]
    function setAuthorizationToken() {

        [Fact]
        function setsXhrHeaderIfSet() {
        	var expected = "OAuth token";
        	var actual = undefined;
            var action = new MockAction();

            var mockAuraXHR = {
                addAction: function () {}
            };

            var mockXHR = Stubs.GetObject({
                open: function (method, url) {},
                setRequestHeader: function (name, value) {
                	if (name === "Authorization") {
                		actual = value;
                	}
                },
                send: function () {}
            });

            var mockSetTimeout = Mocks.GetMocks(Object.Global(), {
                setTimeout: function() {}
            });

            mockSetTimeout(function() {
                mockGlobal(function () {
                    var target = new Aura.Services.AuraClientService();
                    target.buildActionNameList = function (action) {
                        return action;
                    };
                    target.createXHR = function () {
                        return mockXHR;
                    };
                    target.setAuthorizationToken(expected);

                    target.send(mockAuraXHR, [action], "POST");
                });
            });

            Assert.Equal(expected, actual);
        }

        [Fact]
        function doesNotSetXhrHeaderIfNotSet() {
        	var expected = undefined;
        	var actual = undefined;
            var action = new MockAction();

            var mockAuraXHR = {
                addAction: function () {}
            };

            var mockXHR = Stubs.GetObject({
                open: function (method, url) {},
                setRequestHeader: function (name, value) {
                	if (name === "Authorization") {
                		actual = value;
                	}
                },
                send: function () {}
            });

            var mockSetTimeout = Mocks.GetMocks(Object.Global(), {
                setTimeout: function() {}
            });

            mockSetTimeout(function() {
                mockGlobal(function () {
                    var target = new Aura.Services.AuraClientService();
                    target.buildActionNameList = function (action) {
                        return action;
                    };
                    target.createXHR = function () {
                        return mockXHR;
                    };
                    target.send(mockAuraXHR, [action], "POST");
                });
            });

            Assert.Equal(expected, actual);
        }
    }

    [Fixture]
    function dumpCachesAndReload() {
        [Fact]
        function testDumpCacheSetsFunctionBeforeReady() {
            var target;

            mockGlobal(function() {
                target = new Aura.Services.AuraClientService();
            });
            target.reloadPointPassed = false;

            target.dumpCachesAndReload();
            Assert.NotNull(target.reloadFunction);
        }

        [Fact]
        function testDumpCacheSavesOnlyOnce() {
            var target;
            var expected = "MyValue";

            mockGlobal(function() {
                target = new Aura.Services.AuraClientService();
            });
            target.reloadFunction = expected;
            target.reloadPointPassed = false;

            target.dumpCachesAndReload();
            Assert.Equal(expected, target.reloadFunction);
        }

        [Fact]
        function testDumpCacheDoesNotRunsBeforeReady() {
            var target;
            var expected = "MyValue";
            var actual = expected;

            mockGlobal(function() {
                target = new Aura.Services.AuraClientService();
            });
            target.actualDumpCachesAndReload = function() { actual = undefined; };
            target.reloadFunction = expected;
            target.reloadPointPassed = false;

            target.dumpCachesAndReload();
            Assert.Equal(expected, actual);
        }

        [Fact]
        function testDumpCacheRunsAfterReady() {
            var target;
            var expected = "MyValue";
            var actual = undefined;

            mockGlobal(function() {
                target = new Aura.Services.AuraClientService();
            });
            target.shouldPreventReload = function() { return false; };
            target.actualDumpCachesAndReload = function() { actual = expected; };
            target.reloadFunction = undefined;
            target.reloadPointPassed = true;

            target.dumpCachesAndReload();
            Assert.Equal(expected, actual);
        }
    }

    [Fixture]
    function releaseXHR() {
        [Fact]
        function CallsProcessXHRIdleQueueIfNoInFlightXhrs() {
            var actual = false;
            var target;
            var mockXhr = {
                    reset: function() {}
            };
            mockGlobal(function() {
                target = new Aura.Services.AuraClientService();
            });
            target.inFlightXHRs = function() {
                return 0;
            };
            target.processXHRIdleQueue = function() {
                actual = true;
            };

            target.releaseXHR(mockXhr);

            Assert.True(actual);
        }

        [Fact]
        function DoesNotCallProcessXHRIdleQueueIfInFlightXhrs() {
            var actual = false;
            var target;
            var mockXhr = {
                    reset: function() {}
            };
            mockGlobal(function() {
                target = new Aura.Services.AuraClientService();
            });
            target.inFlightXHRs = function() {
                return 1;
            };
            target.processXHRIdleQueue = function() {
                actual = true;
            };

            target.releaseXHR(mockXhr);

            Assert.False(actual);
        }

        [Fact]
        function CallsResetOnXhr() {
            var actual = false;
            var target;
            var mockXhr = {
                    reset: function() {
                        actual = true;
                    }
            };
            mockGlobal(function() {
                target = new Aura.Services.AuraClientService();
            });
            target.inFlightXHRs = function() { return 1; };
            target.processXHRIdleQueue = function() {};

            target.releaseXHR(mockXhr);

            Assert.True(actual);
        }

        [Fact]
        function AddsXhrToAvailableXhrs() {
            var target;
            var mockXhr = {
                    reset: function() {}
            };
            mockGlobal(function() {
                target = new Aura.Services.AuraClientService();
            });
            target.inFlightXHRs = function() { return 1; };
            target.processXHRIdleQueue = function() {};
            target.availableXHRs = [];

            target.releaseXHR(mockXhr);

            Assert.Equal([mockXhr], target.availableXHRs);
        }
    }

    [Fixture]
    function runWhenXHRIdle() {
        [Fact]
        function AddsParameterToXhrIdleQueue() {
            var target;
            var expected = "expected";
            mockGlobal(function() {
                target = new Aura.Services.AuraClientService();
            });
            target.inFlightXHRs = function() { return 1; };
            target.processXHRIdleQueue = function() {};
            target.xhrIdleQueue = [];

            target.runWhenXHRIdle(expected);

            Assert.Equal([expected], target.xhrIdleQueue);
        }

        [Fact]
        function CallsProcessXHRIdleQueueIfNoInFlightXhrs() {
            var actual = false;
            var target;
            mockGlobal(function() {
                target = new Aura.Services.AuraClientService();
            });
            target.inFlightXHRs = function() { return 0; };
            target.processXHRIdleQueue = function() {
                actual = true;
            };

            target.runWhenXHRIdle();

            Assert.True(actual);
        }

        [Fact]
        function DoesNotCallProcessXHRIdleQueueIfInFlightXhrs() {
            var actual = false;
            var target;
            mockGlobal(function() {
                target = new Aura.Services.AuraClientService();
            });
            target.inFlightXHRs = function() { return 1; };
            target.processXHRIdleQueue = function() {
                actual = true;
            };

            target.runWhenXHRIdle();

            Assert.False(actual);
        }
    }

    [Fixture]
    function processXHRIdleQueue() {
        [Fact]
        function ExecutesSingleFunctionInXhrIdleQueue() {
            var actual = false;
            var target;
            mockGlobal(function() {
                target = new Aura.Services.AuraClientService();
            });
            var mockAssert = Mocks.GetMock(Object.Global(), "$A", {
                assert: function(){}
            });
            var queueItem = function() {
                actual = true;
            };
            target.xhrIdleQueue = [queueItem];

            mockAssert(function() {
                target.processXHRIdleQueue();
            });

            Assert.True(actual);
        }

        [Fact]
        function ExecutesMultipleFunctionsInXhrIdleQueue() {
            var actual = false;
            var target;
            mockGlobal(function() {
                target = new Aura.Services.AuraClientService();
            });
            var mockAssert = Mocks.GetMock(Object.Global(), "$A", {
                assert: function(){}
            });
            var fillerItem = function() {};
            var queueItem = function() {
                actual = true;
            };
            target.xhrIdleQueue = [fillerItem, fillerItem, queueItem];

            mockAssert(function() {
                target.processXHRIdleQueue();
            });

            Assert.True(actual);
        }
    }


    [Fixture]
    function showErrorDialogWithReload() {

        var mockGlobal = Mocks.GetMocks(Object.Global(), {
            "$A": {
                log : function() {},
                message: function(){},
                assert : function(condition, message) {
                    if(!condition){
                        throw message;
                    }
                },
                util : {
                    apply: function() {},
                    estimateSize: function() {
                        return 0;
                    },
                    on: function() {},
                    isUndefinedOrNull : function(obj){
                        return obj === undefined || obj === null;
                    },
                    isUndefined : function() {},
                    json : {
                        encode : function(toEncode) {
                            return "<<" + JSON.stringify(toEncode) + ">>";
                        },
                        orderedEncode: function(obj) {
                            return this.encode(obj);
                        }
                    },
                    isFiniteNumber: function(n) {
                        return typeof n === 'number' && isFinite(n);
                    },
                    clearCookie: function() {},
                    isString : function(obj) {
                        return typeof obj === 'string';
                    },
                    isArray : function(obj) {
                        return obj instanceof Array;
                    },
                    isObject: function(obj) {
                        return typeof obj === "object" && obj !== null && !(obj instanceof Array);
                    }
                },
                mark : function() {},
                getContext : function() {
                    return {
                        encodeForServer: function(){throw new Error(''); },
                    };
                },
                clientService:{
                },
                auraError: function(msg) {
                    this.message = msg;
                },
                clientService: {
                    hardRefresh: function(){}
                },
                warning: function() {},
                error: function(msg) {
                    AuraErrorMsg = msg;
                },
                run: function(fn) {
                    fn();
                }
            },
            window:{
                location: {
                    pathname : "/pathname",
                    search : "?search=1",
                    hash : "#hash"
                }
            },
            "document": document,
            "Aura": Aura,
            "Action": Aura.Controller.Action,
            "AuraClientService": Aura.Services.AuraClientService
        });


        [Fact]
        function JsonSerializeContextOnEncodeForServerError() {
             // Arrange
            var target;
            var actual;
            var expected = "<<" + JSON.stringify({"fwuid": "UNKNOWN"}) + ">>";

            // Act
            mockGlobal(function() {
                var sendData;
                target = new Aura.Services.AuraClientService();
                target.createXHR = function() {
                    return {
                        "open": function(){},
                        "setRequestHeader": function(){},
                        "send": function(queryString){}
                    }
                };
                target.buildParams = function(params) {
                    sendData = params;
                };

                target.showErrorDialogWithReload(new Error("message"));
                actual = sendData["aura.context"];
            });


            // Assert
            Assert.Equal(expected, actual);
        }

    }

    [Fixture]
    function getCurrentAccessGlobalId() {

        [Fact]
        function shouldReturnGlobalIdIfCurrentContextExists() {
             // Arrange
            var expected = "2";
            var actual;

            // Act
            mockGlobal(function() {
                var sendData;
                var target = new Aura.Services.AuraClientService();
                target.currentAccess = {
                    globalId: "2"
                };
                actual = target.getCurrentAccessGlobalId();
            });


            // Assert
            Assert.Equal(expected, actual);
        }

        [Fact]
        function shouldReturnNullIfCurrentContextDoesNotExist() {
             // Arrange
            var expected = null;
            var actual;

            // Act
            mockGlobal(function() {
                var sendData;
                var target = new Aura.Services.AuraClientService();
                actual = target.getCurrentAccessGlobalId();
            });


            // Assert
            Assert.Equal(expected, actual);
        }

    }

    [Fixture]
    function testInitializeInjectedServices() {
        var mockModuleDeps = Mocks.GetMocks(Object.Global(), {
            "$A": {
                componentService: {
                    evaluateModuleDef: function(serviceDefinition) {
                        return function () {
                            return serviceDefinition;
                        };
                    },
                    moduleEngine: {}
                },
                assert: function(condition, message) {
                    if (!condition) {
                        throw new Error(message);
                    }
                }
            },
            window:{},
            "document": document,
            "Aura": Aura,
            "AuraClientService": Aura.Services.AuraClientService
        });

        [Fact]
        function addServicesToRegistry() {
            var services = [{name: 'foo'}, {name: 'bar'}];
            var expected = {foo: {name: 'foo'}, bar: {name: 'bar'}};

            mockModuleDeps(function() {
                var target = new Aura.Services.AuraClientService();
                target.initializeInjectedServices(services);
                Assert.Equal(expected, target.moduleServices);
            });
        }

        [Fact]
        function assertsServiceHasName() {
            mockModuleDeps(function() {
                var target = new Aura.Services.AuraClientService();
                try {
                    target.initializeInjectedServices([{}]);
                    Assert.Fail();
                } catch(e) {
                    Assert.Equal('Unknown service name', e.message);
                }
            });
        }
    }

    [Fixture]
    function buildActionNameList() {
        [Fact]
        function IncludesFrameworkNamespace() {
            var input = [ { descriptor: "aura://ComponentController/ACTION$getComponent" } ];
            var expected = "aura.Component.getComponent=1";
            
            mockGlobal(function() {
                var target = new Aura.Services.AuraClientService();
                var actual = target.buildActionNameList(input);
                Assert.Equal(expected, actual);
            });
        }

        [Fact]
        function IncludesManagedNamespace() {
            var input = [ { descriptor: "prefix://managed.Custom/ACTION$doIt" } ];
            var expected = "managed.Custom.doIt=1";
            
            mockGlobal(function() {
                var target = new Aura.Services.AuraClientService();
                var actual = target.buildActionNameList(input);
                Assert.Equal(expected, actual);
            });
        }

        [Fact]
        function IncludesDefaultNamespace() {
            var input = [ { descriptor: "prefix://Custom/ACTION$doIt" } ];
            var expected = "other.Custom.doIt=1";
            
            mockGlobal(function() {
                var target = new Aura.Services.AuraClientService();
                var actual = target.buildActionNameList(input);
                Assert.Equal(expected, actual);
            });
        }

        [Fact]
        function IncludesJavaPackage() {
            var input = [ { descriptor: "java://org.auraframework.ServerController/ACTION$doIt" } ];
            var expected = "org-auraframework.Server.doIt=1";
            
            mockGlobal(function() {
                var target = new Aura.Services.AuraClientService();
                var actual = target.buildActionNameList(input);
                Assert.Equal(expected, actual);
            });
        }

        [Fact]
        function IdentifiesUnpackagedJavaPackage() {
            var input = [ { descriptor: "java://ServerController/ACTION$doIt" } ];
            var expected = "other.Server.doIt=1";
            
            mockGlobal(function() {
                var target = new Aura.Services.AuraClientService();
                var actual = target.buildActionNameList(input);
                Assert.Equal(expected, actual);
            });
        }

        [Fact]
        function SortsAlphabetically() {
            var input = [
                { descriptor: "java://org.first/ACTION$doIt" },
                { descriptor: "prefix://second/ACTION$doIt" },
                { descriptor: "aura://third/ACTION$doIt" }
            ];
            var expected = "aura.third.doIt=1&org.first.doIt=1&other.second.doIt=1";
            
            mockGlobal(function() {
                var target = new Aura.Services.AuraClientService();
                var actual = target.buildActionNameList(input);
                Assert.Equal(expected, actual);
            });
        }

        [Fact]
        function CountsMultipleOccurrences() {
            var input = [
                { descriptor: "prefix://first/ACTION$doIt" },
                { descriptor: "java://org.first/ACTION$doIt" },
                { descriptor: "prefix://first/ACTION$doIt" },
                { descriptor: "prefix://first/ACTION$doIt" }
            ];
            var expected = "org.first.doIt=1&other.first.doIt=3";
            
            mockGlobal(function() {
                var target = new Aura.Services.AuraClientService();
                var actual = target.buildActionNameList(input);
                Assert.Equal(expected, actual);
            });
        }

        [Fact]
        function TrimsLastControllerFragment() {
            var input = [ { descriptor: "prefix://some.Controller.CustomController/ACTION$doIt" } ];
            var expected = "some-Controller.Custom.doIt=1";
            
            mockGlobal(function() {
                var target = new Aura.Services.AuraClientService();
                var actual = target.buildActionNameList(input);
                Assert.Equal(expected, actual);
            });
        }

        [Fact]
        function TrimsAtMaxLength() {
            // Each query param will be 98 chars long.
            var input = [
                { descriptor: "java://org.auraframework.very.long.package.name.is.essential.requirement.to.avoid.naming.conflictA/ACTION$doIt" },
                { descriptor: "java://org.auraframework.very.long.package.name.is.essential.requirement.to.avoid.naming.conflictB/ACTION$doIt" },
                { descriptor: "java://org.auraframework.very.long.package.name.is.essential.requirement.to.avoid.naming.conflict0/ACTION$doIt" },
                { descriptor: "java://org.auraframework.very.long.package.name.is.essential.requirement.to.avoid.naming.conflict1/ACTION$doIt" },
                { descriptor: "java://org.auraframework.very.long.package.name.is.essential.requirement.to.avoid.naming.conflict2/ACTION$doIt" },
                { descriptor: "java://org.auraframework.very.long.package.name.is.essential.requirement.to.avoid.naming.conflict3/ACTION$doIt" },
                { descriptor: "java://org.auraframework.very.long.package.name.is.essential.requirement.to.avoid.naming.conflict4/ACTION$doIt" },
                { descriptor: "java://org.auraframework.very.long.package.name.is.essential.requirement.to.avoid.naming.conflict5/ACTION$doIt" },
                { descriptor: "java://org.auraframework.very.long.package.name.is.essential.requirement.to.avoid.naming.conflict6/ACTION$doIt" },
                { descriptor: "java://org.auraframework.very.long.package.name.is.essential.requirement.to.avoid.naming.conflict7/ACTION$doIt" },
                { descriptor: "java://org.auraframework.very.long.package.name.is.essential.requirement.to.avoid.naming.conflict8/ACTION$doIt" },
                { descriptor: "java://org.auraframework.very.long.package.name.is.essential.requirement.to.avoid.naming.conflict9/ACTION$doIt" }
            ];
            var expected = "org-auraframework-very-long-package-name-is-essential-requirement-to-avoid-naming.conflict0.doIt=1"
                + "&org-auraframework-very-long-package-name-is-essential-requirement-to-avoid-naming.conflict1.doIt=1"
                + "&org-auraframework-very-long-package-name-is-essential-requirement-to-avoid-naming.conflict2.doIt=1"
                + "&org-auraframework-very-long-package-name-is-essential-requirement-to-avoid-naming.conflict3.doIt=1"
                + "&org-auraframework-very-long-package-name-is-essential-requirement-to-avoid-naming.conflict4.doIt=1"
                + "&org-auraframework-very-long-package-name-is-essential-requirement-to-avoid-naming.conflict5.doIt=1"
                + "&org-auraframework-very-long-package-name-is-essential-requirement-to-avoid-naming.conflict6.doIt=1"
                + "&org-auraframework-very-long-package-name-is-essential-requirement-to-avoid-naming.conflict7.doIt=1"
                + "&org-auraframework-very-long-package-name-is-essential-requirement-to-avoid-naming.conflict8.doIt=1"
                + "&org-auraframework-very-long-package-name-is-essential-requirement-to-avoid-naming.conflict9.doIt=1";
            
            mockGlobal(function() {
                var target = new Aura.Services.AuraClientService();
                var actual = target.buildActionNameList(input);
                Assert.Equal(expected, actual);
            });
        }
    }
}
