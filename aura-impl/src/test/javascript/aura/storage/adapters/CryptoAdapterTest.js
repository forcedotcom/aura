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
Test.Aura.Storage.Adapters.CryptoAdapterTest = function(){
    var Aura = {
            Storage: {
                IndexedDBAdapter: function(){}
            },
            IndexedDBAdapter: function(){}
    };
    // NOTE: this mock does not currently support chained reject handlers.
    var mockPromise=Mocks.GetMock(Object.Global(), "Promise", function(handler){
        var _result=null;
        var _resolved=false;
        var _rejected=false;
        var _thens=[];
        this.then=function(callback){
            _thens.push(callback);
            if(_resolved){
                callThens();
            }
            return this;
        }
        handler(
            function(result){
                _resolved=true;
                _result=result;
                callThens();
            },
            function(){
                _rejected=true;
            }
        );

        function callThens(){
            while(_thens.length){
                _thens.shift()(_result);
            }
        }
    });

    Mocks.GetMocks(Object.Global(), {
        "window": {},
        "Aura": Aura
    })(function(){
        mockPromise(function(){
            Import("aura-impl/src/main/resources/aura/storage/adapters/CryptoAdapter.js");
        });
    });

    // Mocks necessary to create a new CryptoAdapter Object
    var mockOnLoadUtil = Mocks.GetMocks(Object.Global(), {
        "window": {
            "TextEncoder": function() {},
            "TextDecoder": function() {}
        },
        "Aura": Aura
    });

    var targetService;
    mockOnLoadUtil(function() {
        mockPromise(function() {
            targetService = new CryptoAdapter({});
        });
    });


    [Fixture]
    function register(){

        [Fact]
        function DoesNotRegisterIfAlreadyRegistered(){
            var actual = false;
            var mockA = Mocks.GetMock(Object.Global(), "$A", {
                storageService: {
                    "isRegisteredAdapter": function() {
                        return true;
                    },
                    "registerAdapter": function() {
                        actual = true;
                    }
                },
                warning: function(){}
            });

            mockA(function() {
                CryptoAdapter.register();
            });

            Assert.False(actual);
        }

        [Fact]
        function DoesNotRegisterIfIndexedDbNotRegistered(){
            var actual = false;
            var indexedDbName = "indexeddb";
            var mockA = Mocks.GetMock(Object.Global(), "$A", {
                storageService: {
                    "isRegisteredAdapter": function(param) {
                        if (param === CryptoAdapter.NAME || param === indexedDbName) {
                            return false;
                        }
                        return true;
                    },
                    "registerAdapter": function() {
                        actual = true;
                    }
                },
                warning: function(){}
            });
            var mockIndexedDb = Mocks.GetMock(Object.Global(), "Aura", {
                Storage: {
                    IndexedDBAdapter: {
                        NAME: indexedDbName
                    }
                }
            });

            mockA(function() {
                mockIndexedDb(function() {
                    CryptoAdapter.register();
                });
            });

            Assert.False(actual);
        }

        [Fact]
        function DoesNotRegisterIfHttp(){
            var actual = false;
            var mockA = Mocks.GetMock(Object.Global(), "$A", {
                storageService: {
                    "isRegisteredAdapter": function(param) {
                        if (param === CryptoAdapter.NAME) {
                            return false;
                        }
                        return true;
                    },
                    "registerAdapter": function() {
                        actual = true;
                    }
                },
                warning: function(){}
            });
            var mockIndexedDb = Mocks.GetMock(Object.Global(), "Aura", {
                Storage: {
                    IndexedDBAdapter: {
                        NAME: "indexeddb"
                    }
                }
            });
            var mockWindow = Mocks.GetMock(Object.Global(), "window", {
                location: {
                    href: "http://fakeMachine:9090"
                }
            });

            mockA(function() {
                mockIndexedDb(function() {
                    mockWindow(function() {
                        CryptoAdapter.register();
                    });
                });
            });

            Assert.False(actual);
        }

        [Fact]
        function RegistersIfHttps(){
            var actual = false;
            var mockA = Mocks.GetMock(Object.Global(), "$A", {
                storageService: {
                    "isRegisteredAdapter": function(param) {
                        if (param === CryptoAdapter.NAME) {
                            return false;
                        }
                        return true;
                    },
                    "registerAdapter": function() {
                        actual = true;
                    }
                },
                warning: function(){}
            });
            var mockIndexedDb = Mocks.GetMock(Object.Global(), "Aura", {
                Storage: {
                    IndexedDBAdapter: {
                        NAME: "indexeddb"
                    }
                }
            });
            var mockWindow = Mocks.GetMock(Object.Global(), "window", {
                location: {
                    href: "https://fakeMachine:9090"
                }
            });
            CryptoAdapter.engine = true;

            mockA(function() {
                mockIndexedDb(function() {
                    mockWindow(function() {
                        CryptoAdapter.register();
                    });
                });
            });

            Assert.True(actual);
        }

        [Fact]
        function RegistersIfLocalhost(){
            var actual = false;
            var mockA = Mocks.GetMock(Object.Global(), "$A", {
                storageService: {
                    "isRegisteredAdapter": function(param) {
                        if (param === CryptoAdapter.NAME) {
                            return false;
                        }
                        return true;
                    },
                    "registerAdapter": function() {
                        actual = true;
                    }
                },
                warning: function(){}
            });
            var mockIndexedDb = Mocks.GetMock(Object.Global(), "Aura", {
                Storage: {
                    IndexedDBAdapter: {
                        NAME: "indexeddb"
                    }
                }
            });
            var mockWindow = Mocks.GetMock(Object.Global(), "window", {
                location: {
                    href: "http://localhost:9090",
                    hostname: "localhost"
                }
            });
            CryptoAdapter.engine = true;

            mockA(function() {
                mockIndexedDb(function() {
                    mockWindow(function() {
                        CryptoAdapter.register();
                    });
                });
            });

            Assert.True(actual);
        }

        [Fact]
        function DoesNotRegisterIfNoEngine(){
            var actual = false;
            var mockA = Mocks.GetMock(Object.Global(), "$A", {
                storageService: {
                    "isRegisteredAdapter": function(param) {
                        if (param === CryptoAdapter.NAME) {
                            return false;
                        }
                        return true;
                    },
                    "registerAdapter": function() {
                        actual = true;
                    }
                },
                warning: function(){}
            });
            var mockIndexedDb = Mocks.GetMock(Object.Global(), "Aura", {
                Storage: {
                    IndexedDBAdapter: {
                        NAME: "indexeddb"
                    }
                }
            });
            var mockWindow = Mocks.GetMock(Object.Global(), "window", {
                location: {
                    href: "http://localhost:9090",
                    hostname: "localhost"
                }
            });
            CryptoAdapter.engine = false;

            mockA(function() {
                mockIndexedDb(function() {
                    mockWindow(function() {
                        CryptoAdapter.register();
                    });
                });
            });

            Assert.False(actual);
        }
    }
}