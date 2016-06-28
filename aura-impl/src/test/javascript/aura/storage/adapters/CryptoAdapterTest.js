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

    Mocks.GetMocks(Object.Global(), {
        "window": {},
        "Aura": Aura,
        "CryptoAdapter": {},
        "AuraStorageService": function(){}
    })(function(){
        Import("aura-impl/src/main/resources/aura/storage/adapters/CryptoAdapter.js");
    });

    // required for non-prototypal functions on CryptoAdapter
    var mockCrypto = Mocks.GetMocks(Object.Global(), {
        CryptoAdapter: Aura.Storage.CryptoAdapter
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
    function setKey(){

        [Fact]
        function RejectsWithErrorForInvalidKey(){
            var expected = "CryptoAdapter cannot import key of wrong type (undefined), rejecting"
            var actual;
            var mockA = Mocks.GetMock(Object.Global(), "$A", {
                warning: function(){}
            });

            Aura.Storage.CryptoAdapter._keyReject = function(error) {
                actual = error;
            };

            mockCrypto(function() {
                mockA(function() {
                    Aura.Storage.CryptoAdapter.setKey();
                });
            });

            Assert.Equal(expected, actual.toString());
        }
    }


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

            mockCrypto(function() {
                mockA(function() {
                    Aura.Storage.CryptoAdapter.register();
                });
            });

            Assert.False(actual);
        }

        [Fact]
        function DoesNotRegisterIfIndexedDbNotRegistered(){
            var actual = false;
            var mockA = Mocks.GetMock(Object.Global(), "$A", {
                storageService: {
                    "isRegisteredAdapter": function(param) {
                        return false;
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

            mockCrypto(function() {
                mockA(function() {
                    mockIndexedDb(function() {
                        Aura.Storage.CryptoAdapter.register();
                    });
                });
            });

            Assert.False(actual);
        }

        [Fact]
        function DoesNotRegisterIfHttp() {
            var actual = false;
            var mocks = Mocks.GetMocks(Object.Global(), {
                $A: {
                    storageService: {
                        "isRegisteredAdapter": function(param) {
                            if (param === Aura.Storage.CryptoAdapter.NAME) {
                                return false;
                            }
                            return true;
                        },
                        "registerAdapter": function() {
                            actual = true;
                        }
                    },
                    warning: function(){}
                },
                Aura: {
                    Storage: {
                        IndexedDBAdapter: {
                            NAME: "indexeddb"
                        }
                    }
                },
                // href mock is the crux of the test
                window: {
                    location: {
                        href: "http://fakeMachine:9090"
                    }
                }
            });

            mockCrypto(function() {
                mocks(function() {
                    Aura.Storage.CryptoAdapter.register();
                });
            });

            Assert.False(actual);
        }

        [Fact]
        function RegistersIfHttps(){
            var actual = false;
            var mocks = Mocks.GetMocks(Object.Global(), {
                $A: {
                    storageService: {
                        "isRegisteredAdapter": function(param) {
                            if (param === Aura.Storage.CryptoAdapter.NAME) {
                                return false;
                            }
                            return true;
                        },
                        "registerAdapter": function() {
                            actual = true;
                        }
                    },
                    warning: function(){}
                },
                Aura: {
                    Storage: {
                        IndexedDBAdapter: {
                            NAME: "indexeddb"
                        }
                    }
                },
                // href mock is the crux of the test
                window: {
                    location: {
                        href: "https://fakeMachine:9090"
                    }
                }
            });
            Aura.Storage.CryptoAdapter.engine = true;

            mockCrypto(function() {
                mocks(function() {
                    Aura.Storage.CryptoAdapter.register();
                });
            });

            Assert.True(actual);
        }

        [Fact]
        function RegistersIfLocalhost(){
            var actual = false;
            var mocks = Mocks.GetMocks(Object.Global(), {
                $A: {
                    storageService: {
                        "isRegisteredAdapter": function(param) {
                            if (param === Aura.Storage.CryptoAdapter.NAME) {
                                return false;
                            }
                            return true;
                        },
                        "registerAdapter": function() {
                            actual = true;
                        }
                    },
                    warning: function(){}
                },
                Aura: {
                    Storage: {
                        IndexedDBAdapter: {
                            NAME: "indexeddb"
                        }
                    }
                },
                // href mock is the crux of the test
                window: {
                    location: {
                        href: "http://localhost:9090",
                        hostname: "localhost"
                    }
                }
            });
            Aura.Storage.CryptoAdapter.engine = true;

            mockCrypto(function() {
                mocks(function() {
                    Aura.Storage.CryptoAdapter.register();
                });
            });

            Assert.True(actual);
        }

        [Fact]
        function DoesNotRegisterIfNoEngine(){
            var actual = false;
            var mocks = Mocks.GetMocks(Object.Global(), {
                $A: {
                    storageService: {
                        "isRegisteredAdapter": function(param) {
                            if (param === Aura.Storage.CryptoAdapter.NAME) {
                                return false;
                            }
                            return true;
                        },
                        "registerAdapter": function() {
                            actual = true;
                        }
                    },
                    warning: function(){}
                },
                Aura: {
                    Storage: {
                        IndexedDBAdapter: {
                            NAME: "indexeddb"
                        }
                    }
                },
                window: {
                    location: {
                        href: "http://localhost:9090",
                        hostname: "localhost"
                    }
                }
            });
            // Setting the engine to false is the crux of the test
            Aura.Storage.CryptoAdapter.engine = false;

            mockCrypto(function() {
                mocks(function() {
                    Aura.Storage.CryptoAdapter.register();
                });
            });

            Assert.False(actual);
        }
    }


    [Fixture]
    function getItemsInternal() {
        var AdapterClass = function() {
        }
        var mocks = Mocks.GetMocks(Object.Global(), {
            $A: {
                storageService: {
                    "getAdapterConfig": function() {
                        return {
                            adapterClass: AdapterClass
                        };
                    }
                },
                warning: function(){},
                util: {
                    isUndefinedOrNull: function(obj) {
                        return obj === undefined || obj === null;
                    }
                }
            },
            Aura: {
                Storage: {
                    IndexedDBAdapter: {
                        NAME: "indexeddb"
                    }
                }
            },
            window: {
                TextEncoder: function(){},
                TextDecoder: function(){}
            }
        });

        [Fact]
        function IncludesInternalKeysWhenRequested(){
            var actual;
            AdapterClass.prototype.getItems = function(keys) {
                // crux of the test: return CryptoAdapter.SENTINEL
                return ResolvePromise({"cryptoadapter": "anything", "noncryptoadapter":"anything else"});
            };

            mockCrypto(function() {
                mocks(function() {
                    // mock the global Promise to be synchronous
                    Promise.all = function() {
                        return ResolvePromise();
                    };

                    // simplify the adapter init cycle
                    Aura.Storage.CryptoAdapter.prototype.initialize = function() {
                        return ResolvePromise();
                    };

                    var adapter = new Aura.Storage.CryptoAdapter({});
                    adapter.decrypt = function(key, value) {
                        return ResolvePromise(value);
                    };

                    adapter.getItemsInternal(
                        [],
                        function resolve(values) {
                            actual = values;
                        },
                        function reject() {},
                        true // includeInternalKeys
                    );
                });
            });

            Assert.Equal(2, Object.keys(actual).length);
        }

        [Fact]
        function ExcludesInternalKeysWhenRequested(){
            var actual;
            AdapterClass.prototype.getItems = function(keys) {
                // crux of the test: return CryptoAdapter.SENTINEL
                return ResolvePromise({"cryptoadapter": "anything", "noncryptoadapter":"anything else"});
            };

            mockCrypto(function() {
                mocks(function() {
                    // mock the global Promise to be synchronous
                    Promise.all = function() {
                        return ResolvePromise();
                    };

                    // simplify the adapter init cycle
                    Aura.Storage.CryptoAdapter.prototype.initialize = function() {
                        return ResolvePromise();
                    };

                    var adapter = new Aura.Storage.CryptoAdapter({});
                    adapter.decrypt = function(key, value) {
                        return ResolvePromise(value);
                    };

                    adapter.getItemsInternal(
                        [],
                        function resolve(values) {
                            actual = values;
                        },
                        function reject() {},
                        false // includeInternalKeys
                    );
                });
            });

            Assert.Equal(1, Object.keys(actual).length);
        }
    }


    [Fixture]
    function clear() {
        var AdapterClass = function() {
        }
        var mocks = Mocks.GetMocks(Object.Global(), {
            $A: {
                storageService: {
                    "getAdapterConfig": function() {
                        return {
                            adapterClass: AdapterClass
                        };
                    }
                }
            },
            Aura: {
                Storage: {
                    IndexedDBAdapter: {
                        NAME: "indexeddb"
                    }
                }
            },
            window: {
                TextEncoder: function(){},
                TextDecoder: function(){}
            }
        });

        [Fact]
        function SetsSentinelAfterAdapterClearResolves(){
            var actual = false;
            AdapterClass.prototype.clear = function() {
                return ResolvePromise();
            };

            mockCrypto(function() {
                mocks(function() {
                    // simplify the adapter init cycle
                    Aura.Storage.CryptoAdapter.prototype.initialize = function() {
                        return ResolvePromise();
                    }

                    var adapter = new Aura.Storage.CryptoAdapter({});
                    adapter.setSentinelItem = function() {
                        actual = true;
                    };

                    adapter.clear();
                });
            });

            Assert.True(actual);
        }

        [Fact]
        function DoesNotSetSentinelAfterAdapterClearRejects(){
            var actual = false;
            AdapterClass.prototype.clear = function() {
                return RejectPromise();
            };

            mockCrypto(function() {
                mocks(function() {
                    // simplify the adapter init cycle
                    Aura.Storage.CryptoAdapter.prototype.initialize = function() {
                        return ResolvePromise();
                    }

                    var adapter = new Aura.Storage.CryptoAdapter({});
                    adapter.setSentinelItem = function() {
                        actual = true;
                    };

                    adapter.clear();
                });
            });

            Assert.False(actual);
        }
    }


    [Fixture]
    function sweep() {
        var AdapterClass = function() {
        }
        var mocks = Mocks.GetMocks(Object.Global(), {
            $A: {
                storageService: {
                    "getAdapterConfig": function() {
                        return {
                            adapterClass: AdapterClass
                        };
                    }
                }
            },
            Aura: {
                Storage: {
                    IndexedDBAdapter: {
                        NAME: "indexeddb"
                    }
                }
            },
            window: {
                TextEncoder: function(){},
                TextDecoder: function(){}
            }
        });


        [Fact]
        function SetsSentinelAfterAdapterSweepResolves(){
            var actual = false;
            AdapterClass.prototype.sweep = function() {
                return ResolvePromise();
            };

            mockCrypto(function() {
                mocks(function() {
                    // simplify the adapter init cycle
                    Aura.Storage.CryptoAdapter.prototype.initialize = function() {
                        return ResolvePromise();
                    }

                    var adapter = new Aura.Storage.CryptoAdapter({});
                    adapter.setSentinelItem = function() {
                        actual = true;
                    };

                    adapter.sweep();
                });
            });

            Assert.True(actual);
        }

        [Fact]
        function DoesNotSetSentinelAfterAdapterSweepRejects(){
            var actual = false;
            AdapterClass.prototype.sweep = function() {
                return RejectPromise();
            };

            mockCrypto(function() {
                mocks(function() {
                    // simplify the adapter init cycle
                    Aura.Storage.CryptoAdapter.prototype.initialize = function() {
                        return ResolvePromise();
                    }

                    var adapter = new Aura.Storage.CryptoAdapter({});
                    adapter.setSentinelItem = function() {
                        actual = true;
                    };

                    adapter.sweep();
                });
            });

            Assert.False(actual);
        }
    }


    [Fixture]
    function setSentinelItem() {
        var mocks = Mocks.GetMocks(Object.Global(), {
            $A: {
                storageService: {
                    "getAdapterConfig": function() {
                        return {
                            adapterClass: function(){}
                        };
                    }
                }
            },
            Aura: {
                Storage: {
                    IndexedDBAdapter: {
                        NAME: "indexeddb"
                    }
                }
            },
            window: {
                TextEncoder: function(){},
                TextDecoder: function(){}
            }
        });


        [Fact]
        function ValueContainsValue() {
            var actual = false;
            mockCrypto(function() {
                mocks(function() {
                    // simplify the adapter init cycle
                    Aura.Storage.CryptoAdapter.prototype.initialize = function() {
                        return ResolvePromise();
                    }

                    var adapter = new Aura.Storage.CryptoAdapter({});
                    adapter.setItemsInternal = function(tuples, resolve, reject) {
                        actual = tuples[0][1];
                    };

                    adapter.setSentinelItem();
                });
            });

            Assert.True(!!actual["value"]);
        }

        [Fact]
        function ValueContainsCreated() {
            var actual = false;
            mockCrypto(function() {
                mocks(function() {
                    Aura.Storage.CryptoAdapter.prototype.initialize = function() {
                        return ResolvePromise();
                    }

                    var adapter = new Aura.Storage.CryptoAdapter({});
                    adapter.setItemsInternal = function(tuples, resolve, reject) {
                        actual = tuples[0][1];
                    };

                    adapter.setSentinelItem();
                });
            });

            Assert.True(!!actual["created"]);
        }

        [Fact]
        function ValueContainsExpires() {
            var actual = false;
            mockCrypto(function() {
                mocks(function() {
                    Aura.Storage.CryptoAdapter.prototype.initialize = function() {
                        return ResolvePromise();
                    }

                    var adapter = new Aura.Storage.CryptoAdapter({});
                    adapter.setItemsInternal = function(tuples, resolve, reject) {
                        actual = tuples[0][1];
                    };

                    adapter.setSentinelItem();
                });
            });

            Assert.True(!!actual["expires"]);
        }
    }

}
