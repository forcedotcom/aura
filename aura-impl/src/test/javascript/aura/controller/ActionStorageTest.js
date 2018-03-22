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
Function.RegisterNamespace("Test.Aura.Controller");

[Fixture]
Test.Aura.Controller.ActionStorageTest = function () {
    var Aura = { Controller: {} };
    var ActionStorage_URI_DEFS_ENABLED_KEY = "_uri_defs_enabled";

    Mocks.GetMocks(Object.Global(), {
        "Aura": Aura,
        "ActionStorage": function(){} // Prevent Global Reference
    })
    (function () {
        [Import("aura-impl/src/main/resources/aura/controller/ActionStorage.js")]
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
    function IsStoragePersistent() {

        [Fact]
        function ReturnsTrueIfStorageIsPersistent() {
            var target = new Aura.Controller.ActionStorage();
            var mockStorage = {
                isPersistent: function() {
                    return true;
                }
            };

            var mockStorageService = Mocks.GetMocks(Object.Global(),{
                "$A": {
                    storageService: {
                        getStorage: function() {
                            return mockStorage;
                        }
                    }
                }
            });

            var actual;
            mockStorageService(function () {
                actual = target.isStoragePersistent();
            });

            Assert.True(actual);
        }

        [Fact]
        function ReturnsFalseIfStorageDoesNotExist() {
            var target = new Aura.Controller.ActionStorage();

            var mockStorageService = Mocks.GetMocks(Object.Global(),{
                "$A": {
                    storageService: {
                        getStorage: function() {
                            return undefined;
                        }
                    }
                }
            });

            var actual;
            mockStorageService(function () {
                actual = target.isStoragePersistent();
            });

            Assert.False(actual);
        }

    }

    [Fixture]
    function IsStorageEnabled() {

        [Fact]
        function ReturnsTrueIfStorageExists() {
            var target = new Aura.Controller.ActionStorage();
            var mockStorageService = Mocks.GetMocks(Object.Global(),{
                "$A": {
                    storageService: {
                        getStorage: function() {
                            return {};
                        }
                    }
                }
            });

            var actual;
            mockStorageService(function () {
                actual = target.isStorageEnabled();
            });

            Assert.True(actual);
        }

        [Fact]
        function ReturnsFalseIfStorageDoesNotExist() {
            var target = new Aura.Controller.ActionStorage();
            var mockStorageService = Mocks.GetMocks(Object.Global(),{
                "$A": {
                    storageService: {
                        getStorage: function() {
                            return undefined;
                        }
                    }
                }
            });

            var actual;
            mockStorageService(function () {
                actual = target.isStorageEnabled();
            });

            Assert.False(actual);
        }
    }

    [Fixture]
    function IsKeyAbsentFromCache() {

        [Fact]
        function ReturnsFalseIfKeyExistsInCache() {
            var target = new Aura.Controller.ActionStorage();
            target.actionKeysFilter = {};
            var actionKey = "actionKey";
            target.actionKeysFilter[actionKey] = true;
            target.isStorageEnabled = function() { return true; };

            var actual = target.isKeyAbsentFromCache(actionKey);

            Assert.False(actual);
        }

        [Fact]
        function ReturnsFalseIfFilterIsDisabled() {
            var target = new Aura.Controller.ActionStorage();
            target.enableActionsFilter(false);
            target.isStorageEnabled = function() { return true; };

            var actual = target.isKeyAbsentFromCache("key");

            Assert.False(actual);
        }

        [Fact]
        function ReturnsTrueIfStorageDoesNotExist() {
            var target = new Aura.Controller.ActionStorage();
            var mockStorageService = Mocks.GetMocks(Object.Global(),{
                "$A": {
                    storageService: {
                        getStorage: function() {
                            return undefined;
                        }
                    }
                }
            });

            var actual;
            mockStorageService(function () {
                actual = target.isKeyAbsentFromCache("actionKey");
            });

            Assert.True(actual);
        }
    }

    [Fixture]
    function SetAll() {

        [Fact]
        function AddsKeysToCache() {
            var target = new Aura.Controller.ActionStorage();
            var mockStorage = {
                setAll: function() {
                    return ResolvePromise();
                },
                isPersistent: function() {
                    return true;
                }
            };

            var mockStorageService = Mocks.GetMocks(Object.Global(),{
                "$A": {
                    storageService: {
                        getStorage: function() {
                            return mockStorage;
                        }
                    }
                }
            });
            var values = {
                "key1": "value1",
                "key2": "value2"
            };

            mockStorageService(function () {
                target.setAll(values);
            });

            Assert.Equal(2, Object.keys(target.actionKeysFilter).length);
        }

        [Fact]
        function RemovesKeysFromCacheIfFailsToStore() {
            var target = new Aura.Controller.ActionStorage();
            target.setupActionsFilter();
            target.actionKeysFilter = {"key1": true};
            var mockStorage = {
                setAll: function() {
                    return RejectPromise();
                }
            };

            var mockStorageService = Mocks.GetMocks(Object.Global(),{
                "$A": {
                    storageService: {
                        getStorage: function() {
                            return mockStorage;
                        }
                    }
                }
            });
            var values = {
                "key1": "value1"
            };

            mockStorageService(function () {
                target.setAll(values);
            });

            Assert.Undefined(target.actionKeysFilter["key1"]);
        }

    }

    [Fixture]
    function GetAll() {

        [Fact]
        function AddsKeysToCacheIfGetValuesFromStorage() {
            var target = new Aura.Controller.ActionStorage();
            target.setupActionsFilter();
            var values = {
                "key1": "value1",
                "key2": "value2"
            };
            var mockStorage = {
                getAll: function() {
                    return ResolvePromise(values);
                },
                isPersistent: function(){ return true; }
            };

            var mockStorageService = Mocks.GetMocks(Object.Global(),{
                "$A": {
                    storageService: {
                        getStorage: function() {
                            return mockStorage;
                        }
                    }
                }
            });

            mockStorageService(function () {
                target.getAll();
            });

            Assert.Equal(2, Object.keys(target.actionKeysFilter).length);
        }

        [Fact]
        function RemovesNonExistingKeysFromCacheIfFailsToGet() {
            var target = new Aura.Controller.ActionStorage();
            target.setupActionsFilter();
            target["key2"] = true;

            var values = {
                "key1": "value1"
            };
            var mockStorage = {
                getAll: function() {
                    return ResolvePromise(values);
                }
            };

            var mockStorageService = Mocks.GetMocks(Object.Global(),{
                "$A": {
                    storageService: {
                        getStorage: function() {
                            return mockStorage;
                        }
                    }
                }
            });

            mockStorageService(function () {
                target.getAll(["key1", "key2"]);
            });

            Assert.Undefined(target.actionKeysFilter["key2"]);
        }

    }

    [Fixture]
    function RemoveAll() {

        [Fact]
        function RemovesKeysFromCache() {
            var target = new Aura.Controller.ActionStorage();
            target.setupActionsFilter();
            target.actionKeysFilter["key1"] = true;
            target.actionKeysFilter["key2"] = true;

            var mockStorage = {
                removeAll: function() {
                    return ResolvePromise();
                }
            };

            var mockStorageService = Mocks.GetMocks(Object.Global(),{
                "$A": {
                    storageService: {
                        getStorage: function() {
                            return mockStorage;
                        }
                    }
                }
            });

            mockStorageService(function () {
                target.removeAll(["key2"]);
            });

            Assert.Equal(1, Object.keys(target.actionKeysFilter).length);
        }

    }

    [Fixture]
    function Clear() {

        [Fact]
        function ResetsCache() {
            var target = new Aura.Controller.ActionStorage();
            target.setupActionsFilter();
            target.actionKeysFilter["key1"] = true;
            target.actionKeysFilter["key2"] = true;

            var mockStorage = {
                clear: function() {
                    return ResolvePromise();
                }
            };

            var mockStorageService = Mocks.GetMocks(Object.Global(),{
                "$A": {
                    storageService: {
                        getStorage: function() {
                            return mockStorage;
                        }
                    }
                }
            });

            mockStorageService(function () {
                target.clear();
            });

            Assert.Equal(0, Object.keys(target.actionKeysFilter).length);
        }

    }

    [Fixture]
    function SetupActionsFilter() {

        [Fact]
        function ReturnsFalseIfFilterIsDisabled() {
            var target = new Aura.Controller.ActionStorage();
            target.enableActionsFilter(false);

            var actual = target.setupActionsFilter();
            Assert.False(actual);
        }

        [Fact]
        function SetsFilterAsNullIfFilterIsDisabled() {
            var target = new Aura.Controller.ActionStorage();
            target.enableActionsFilter(false);

            target.setupActionsFilter();

            var actual = target.actionKeysFilter;
            Assert.Null(actual);
        }

        [Fact]
        function ReturnsTrueIfFilterIsSetup() {
            var target = new Aura.Controller.ActionStorage();
            target.setupActionsFilter();

            var actual = target.setupActionsFilter();
            Assert.True(actual);
        }

        [Fact]
        function InitsFilterIfFilterIsEnabled() {
            var target = new Aura.Controller.ActionStorage();
            target.enableActionsFilter(true);

            target.setupActionsFilter();

            var actual = target.actionKeysFilter;
            Assert.Equal({}, actual);
        }

    }

    [Fixture]
    function PopulateActionsFilter() {

        [Fact]
        function CallsGetAllToPopulateFilter() {
            var target = new Aura.Controller.ActionStorage();
            target.isStoragePersistent = function() { return true; };
            var mockGetAll =  Stubs.GetMethod({"then":function(){}});
            target.getAll = mockGetAll;

            target.populateActionsFilter();

            var actual = target.actionKeysFilter;
            Assert.Equal(1, mockGetAll.Calls.length);
        }
    }

};
