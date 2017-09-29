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
Test.Aura.Component.ComponentDefStorageTest = function () {

    var Aura = { Component: {} };

    Mocks.GetMocks(Object.Global(), {
        Aura: Aura,
        "ComponentDefStorage": function(){} // Prevent Global Reference
    })
    (function () {
        [Import("aura-impl/src/main/resources/aura/component/ComponentDefStorage.js")]
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

    var mockAuraUtil = Mocks.GetMocks(Object.Global(),{
        "$A": {
            util: {
                isString: function () {
                    return true;
                },
                isUndefinedOrNull: function (obj) {
                    return obj === undefined || obj === null;
                },
                setCookie: Stubs.GetMethod()
            },
            log: function() {},
            warning: function (message, error) {},
            assert: function (condition, message) {
                if (!condition) {
                    throw Error(message);
                }
            },
            Perf: {
                mark: function () {
                },
                endMark: function () {
                }
            }
        },
        Aura: Aura
    });


    [Fixture]
    function setupDefinitionStorage() {
        var initStorageCalled = false; //we set this to true in storageService.initStorage() below
        var mockStorageService = function (persistent, secure, withComponentDefStorage, actionStorageIsPersistent, saveEventConfig) {
            return Mocks.GetMocks(Object.Global(), {
                "$A": {
                    storageService: {
                        initStorage: function() {
                            initStorageCalled = true;
                            return {
                                isPersistent: function() {
                                    return persistent;
                                },
                                isSecure: function() {
                                    return secure;
                                },
                                suspendSweeping: function() {}
                            }
                        },
                        deleteStorage: function() {},
                        getStorage: function(name) {
                            if(withComponentDefStorage == true) {
                                if (name === "ComponentDefStorage") {
                                    return {
                                        isPersistent: function() { return persistent; },
                                        suspendSweeping: function() {}
                                    }
                                }
                            }
                        }
                    },
                    clientService: {
                        getActionStorage: function() {
                            return {
                                isStoragePersistent: function() {
                                    return actionStorageIsPersistent;
                                }
                            };
                        }
                    },
                    eventService: {
                        getEventDef: function() { return false; },
                        saveEventConfig: saveEventConfig
                    },
                    getContext: function() {
                        return {
                            getApp: function() {
                                return "foo";
                            }
                        }
                    }
                },
                Json: {
                    ApplicationKey: {
                        TYPE: "type",
                        ATTRIBUTES: "attributes"
                    }
                }
            });
        };

        [Fact]
        function RestoresEventDefWithoutAttributes() {
            var target = new Aura.Component.ComponentDefStorage();
            target.getAll = function() {
                return ResolvePromise({
                    "markup://test:event": {
                        descriptor: "markup://test:event",
                        type: "APPLICATION"
                        // omit attributes
                    }
                });
            };

            var eventStored = false;
            var saveEventConfig = function(value) {
                eventStored = value.descriptor === "markup://test:event";
            };
            mockStorageService(false, false, false, true, saveEventConfig)(function () {
                target.restoreAll();
                Assert.True(eventStored);
            });
        }

        [Fact]
        function ShouldNotUseNotPersistentStorage() {
            var target = new Aura.Component.ComponentDefStorage();
            target.useDefStore = undefined;
            mockStorageService(false, false, false, true)(function () {
                target.setupDefinitionStorage();
            });

            Assert.False(target.useDefStore);
        }

        [Fact]
        function OnlyUsePersistent() {
            var target = new Aura.Component.ComponentDefStorage();
            target.useDefStore = undefined;
            mockStorageService(true, false, false, true)(function () {
                target.setupDefinitionStorage();
            });

            Assert.True(target.useDefStore);
        }

        [Fact]
        function DoNotCreateComponentDefStorageIfAlreadyPresent() {
            initStorageCalled = false;
            var target = new Aura.Component.ComponentDefStorage();
            target.useDefStore = undefined;
            mockStorageService(true, false, true, true)(function () {
                target.setupDefinitionStorage();
            });

            Assert.False(initStorageCalled);
        }

        [Fact]
        function DoNotCreateComponentDefStorageIfActionStorageIsNotPersistent() {
            var target = new Aura.Component.ComponentDefStorage();
            target.useDefStore = undefined;
            mockStorageService(true, false, false, false)(function () {
                target.setupDefinitionStorage();
            });

            Assert.False(target.useDefStore);
        }
    }

    [Fixture]
    function removeDefs() {

        [Fact]
        function SetsBrokenGraphCookieWhenStorageFailsToRemove() {
            var target = new Aura.Component.ComponentDefStorage();
            target.useDefStore = true;
            target.storage = {
                removeAll: function() {
                    return RejectPromise(new Error("intended storage error"));
                }
            };

            mockAuraUtil(function() {
                target.removeDefs(["descriptor"]);

                Assert.Equal(1, $A.util.setCookie.Calls.length);
            });

        }
    }
};
