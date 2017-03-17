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
Function.RegisterNamespace("Test.Aura.Storage.Adapters");

[Fixture]
Test.Aura.Storage.Adapters.IndexedDBAdapterTest = function(){
    var Aura = {
        Storage: {}
    };

    Mocks.GetMocks(Object.Global(), {
        "window": {},
        "Aura": Aura,
        "navigator": { "userAgent": ""},
        "IndexedDBAdapter": {}
    })(function(){
        Import("aura-impl/src/main/resources/aura/storage/adapters/IndexedDBAdapter.js");
    });

    // required for non-prototypal functions on CryptoAdapter
    var mockIndexedDB = Mocks.GetMocks(Object.Global(), {
        IndexedDBAdapter: Aura.Storage.IndexedDBAdapter
    });

    // required for non-prototypal functions on CryptoAdapter
    var mockLocation = Mocks.GetMocks(Object.Global(), {
        "window" : { "location":{} }
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
    function initialize(){
        var mocks = Mocks.GetMocks(Object.Global(), {
            $A: {
                getContext: function() {},
                log: function() {},
                warning: function() {},
            },
            setTimeout: function() {},
            window: {
                indexedDB: {
                    open: function() {
                        return {};
                    }
                },
                location: {}
            },
            document: {
                visibilityState: true
            }
        });

        [Fact]
        function SetsTimeoutWithDelay(){
            var actual;
            var mockSetTimeout = Mocks.GetMocks(Object.Global(), {
                setTimeout: function(f, delay) {
                    actual = delay === IndexedDBAdapter.INITIALIZE_TIMEOUT;
                }
            });

            mockLocation(function () {mockIndexedDB(function() { mocks(function() { mockSetTimeout(function() {
                var adapter = new Aura.Storage.IndexedDBAdapter({});
                adapter.initialize();
            }); }); }); });

            Assert.True(actual);
        }

        [Fact]
        function TimeoutInvokesExecuteQueueFalse(){
            var actual;
            var mockSetTimeout = Mocks.GetMocks(Object.Global(), {
                setTimeout: function(f, delay) {
                    f(); // immediately invoke f, no delay
                }
            });

            mockIndexedDB(function() { mocks(function() { mockSetTimeout(function() {
                // mock the global Promise to be synchronous
                Promise.resolve = function() {
                    return ResolvePromise();
                };

                var adapter = new Aura.Storage.IndexedDBAdapter({});
                adapter.initialize();
                Assert.False(adapter.ready);
            }); }); });
        }

        [Fact]
        function MultipleInvocationsSetsTimeoutOnce(){
            var actual = 0;
            var mockSetTimeout = Mocks.GetMocks(Object.Global(), {
                setTimeout: function(f, delay) {
                    actual++;
                    return actual;
                }
            });

            mockIndexedDB(function() { mocks(function() { mockSetTimeout(function() {
                var adapter = new Aura.Storage.IndexedDBAdapter({});
                adapter.initialize(1);
            }); }); });

            Assert.Equal(1, actual);
        }

        [Fact]
        function IdbOpenOnSuccessInvokesSetupDB(){
            var actual;
            var IDBOpenDBRequest = {};
            var mockIDB = Mocks.GetMocks(Object.Global(), {
                window: {
                    indexedDB: {
                        open: function() {
                            return IDBOpenDBRequest;
                        }
                    },
                    location: {}
                }
            });

            mockIndexedDB(function() { mocks(function() { mockIDB(function() {
                var adapter = new Aura.Storage.IndexedDBAdapter({});
                adapter.initialize();
                adapter.setupDB = function() {
                    actual = true;
                };

                IDBOpenDBRequest.onsuccess();
            }); }); });

            Assert.True(actual);
        }

        [Fact]
        function PartitionNameSetsTableName() {
            var partitionName = "partition";
            var tableName;
            mocks(function() {
                var adapter = new Aura.Storage.IndexedDBAdapter({"partitionName": partitionName});
                tableName = adapter.tableName;
            });

            Assert.Equal(partitionName, tableName);
        }
    }

}
