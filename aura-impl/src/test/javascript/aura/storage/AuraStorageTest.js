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
Function.RegisterNamespace("Test.Aura.Storage");

[Fixture]
Test.Aura.Storage.AuraStorageTest = function() {
    var A = {};
    var Aura = {Storage: {} };

    Mocks.GetMocks(Object.Global(), {
        "$A": A,
        "Aura": Aura,
        "AuraStorage": function() {}
    })(function () {
        Import("aura-impl/src/main/resources/aura/storage/AuraStorage.js");
    });

    // mocks for synchronous promises
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

    var MockPromise = function MockPromise(f) {
        var ret;
        try {
            f(
                function resolve(v) { ret = ResolvePromise(v); },
                function reject(e) { ret = RejectPromise(e); }
            );
            return ret;
        } catch (e) {
            return RejectPromise(e);
        }
    };
    MockPromise.resolve = ResolvePromise;
    MockPromise.reject = RejectPromise;


    // aura event mocks + collector for fired aura events.
    // any testing using firedEvents must first reset it.
    var firedEvents = [];
    var AuraEvent = function AuraEvent() {};
    AuraEvent.prototype.fire = function(param) {
        if(!param) {
            firedEvents.push({});
        } else {
            firedEvents.push(param);
        }
    };

    // makes an adapter + config. new class definition prevents cross-test contamination.
    var makeConfigAndAdapter = function() {
        var AdapterClass = function() {};
        AdapterClass.prototype.getName = function() {};
        AdapterClass.prototype.initialize = function() { return ResolvePromise(); };
        return {
            adapterClass: AdapterClass
        };
    };


    [Fixture]
    function constructor() {

        var mockA = Mocks.GetMocks(Object.Global(), {
            "$A": {
                util: {
                    format: function() {}
                }
            },
            "AuraStorage": Aura.Storage.AuraStorage
        });

        [Fact]
        function SetsKeyPrefix() {
            var version = 1;
            var isolationKey = "isolationKey";
            var delimiter = Aura.Storage.AuraStorage.KEY_DELIMITER;
            var expected = isolationKey + version + delimiter;
            var config = makeConfigAndAdapter();
            config.version = version;
            config.isolationKey = isolationKey;

            var target;
            mockA(function() {
                target = new Aura.Storage.AuraStorage(config);
            });

            Assert.Equal(expected, target.keyPrefix);
        }


        [Fact]
        function PassesKeyPrefixToAdapterConstructor() {
            var actual;
            var AdapterClass = function(adapterConfig) {
                actual = adapterConfig;
            };
            AdapterClass.prototype.initialize = function() { return ResolvePromise(); };
            AdapterClass.prototype.getName = function() {};

            var config = {
                adapterClass: AdapterClass
            };

            mockA(function() {
                Aura.Storage.AuraStorage.prototype.generateKeyPrefix = function() {
                    return "keyprefix";
                };
                var target = new Aura.Storage.AuraStorage(config);
                Assert.Equal(target.keyPrefix, actual.keyPrefix);
            });
        }
    }

    [Fixture]
    function getName() {

        var mockA = Mocks.GetMocks(Object.Global(), {
            "$A": {
                util: {
                    format: function() {}
                }
            },
            "AuraStorage": {}
        });

        [Fact]
        function DelegatesToAdapter() {
            var expected = "name";
            var actual;
            var config = makeConfigAndAdapter();

            config.adapterClass.prototype.getName = function() {return expected;};
            mockA(function() {
                var target = new Aura.Storage.AuraStorage(config);
                actual = target.getName();
            });

            Assert.Equal(expected, actual);
        }
    }


    [Fixture]
    function getExpiration() {

        var mockA = Mocks.GetMocks(Object.Global(), {
            "$A": {
                util: {
                    format: function() {}
                }
            },
            "AuraStorage": {}
        });

        [Fact]
        function RespectsConstructorConfig() {
            var expected = 1;
            var actual;
            var config = makeConfigAndAdapter();
            config.expiration = expected;

            mockA(function() {
                var target = new Aura.Storage.AuraStorage(config);
                actual = target.getExpiration();
            });

            Assert.Equal(expected, actual);
        }
    }

    [Fixture]
    function getMaxSize() {

        var mockA = Mocks.GetMocks(Object.Global(), {
            "$A": {
                util: {
                    format: function() {}
                }
            },
            "AuraStorage": {}
        });

        [Fact]
        function RespectsConstructorConfig() {
            var expected = 1; // output as KB
            var actual;
            var config = makeConfigAndAdapter();
            config.maxSize = expected * 1024; // input as bytes

            mockA(function() {
                var target = new Aura.Storage.AuraStorage(config);
                actual = target.getMaxSize();
            });

            Assert.Equal(expected, actual);
        }
    }

    [Fixture]
    function getVersion() {
        var AdapterClass = function() {};
        AdapterClass.prototype.initialize = function() { return ResolvePromise(); };
        AdapterClass.prototype.getName = function() {};
        var config = {
            adapterClass: AdapterClass
        };

        var mockA = Mocks.GetMocks(Object.Global(), {
            "$A": {
                util: {
                    format: function() {}
                }
            },
            "AuraStorage": {}
        });

        [Fact]
        function RespectsConstructorConfig() {
            var expected = "a";
            var actual;

            config.version = expected;
            mockA(function() {
                var target = new Aura.Storage.AuraStorage(config);
                actual = target.getVersion();
            });

            Assert.Equal(expected, actual);
        }
    }

    [Fixture]
    function get() {

        var mockA = Mocks.GetMocks(Object.Global(), {
            "$A": {
                util: {
                    format: function() {},
                    isUndefinedOrNull: function(obj) {
                        return obj === undefined || obj === null;
                    },
                    isBoolean: function(obj) {
                        return typeof obj === 'boolean';
                    },
                    isString: function(obj){
                        return typeof obj === 'string';
                    }
                },
                metricsService: {},
                assert: function(condition, message){
                    if (!condition) {
                        throw new Error(message);
                    }
                }
            },
            "AuraStorage": {
                KEY_DELIMITER: ":"
            },
            "Promise": MockPromise
       });

        [Fact]
        function ThrowsErrorWhenKeyIsNotString() {
            var config = makeConfigAndAdapter();
            var actual;

            mockA(function() {
                var target = new Aura.Storage.AuraStorage(config);

                try {
                    target.get([]);
                } catch (e) {
                    actual = e.toString();
                }
            });

            var expected = "AuraStorage.get(): 'key' must be a String.";
            Assert.Equal(expected, actual);
        }

        [Fact]
        function ThrowsErrorWhenIncludeExpiredIsNotBoolean() {
            var config = makeConfigAndAdapter();
            var actual;

            mockA(function() {
                var target = new Aura.Storage.AuraStorage(config);

                try {
                    target.get("key", "string");
                } catch (e) {
                    actual = e.toString();
                }
            });

            var expected = "AuraStorage.get(): 'includeExpired' must be a Boolean.";
            Assert.Equal(expected, actual);
        }

        [Fact]
        function RespectsIncludeExpired() {
            var config = makeConfigAndAdapter();
            var actual;

            mockA(function() {
                var target = new Aura.Storage.AuraStorage(config);
                target.getAll = function(keys, includeExpired) {
                    actual = includeExpired;
                    return ResolvePromise({});
                };

                target.get("key", true);
            });

            Assert.True(actual);
        }

        [Fact]
        function ReturnsPromiseThatResolvesToStoredItem() {
            var config = makeConfigAndAdapter();
            var expected = "expected";
            var storedItem = {
                value: expected,
                expires: new Date().getTime() + 1000
            };
            var actual;
            config.adapterClass.prototype.getItems = function() {
                return ResolvePromise({"key": storedItem});
            };

            mockA(function() {
                var target = new Aura.Storage.AuraStorage(config);
                target.keyPrefix = "";

                target.get("key").then(function(value) {
                    actual = value;
                });
            });

            Assert.Equal(expected, actual);
        }

        [Fact]
        function ReturnsPromiseThatResolvesToUndefinedWhenKeyNotExists() {
            var config = makeConfigAndAdapter();
            config.adapterClass.prototype.getItems = function() {
                return ResolvePromise({});
            };
            var actual;

            mockA(function() {
                var target = new Aura.Storage.AuraStorage(config);
                target.keyPrefix = "";

                target.get("NotExist").then(function(value) {
                    actual = value;
                });
            });

            Assert.Undefined(actual);
        }

        [Fact]
        function ReturnsRejectPromiseWithError() {
            var config = makeConfigAndAdapter();
            var expected = new Error();
            var actual;

            mockA(function() {
                var target = new Aura.Storage.AuraStorage(config);
                target.getAll = function() {
                    return RejectPromise(expected);
                };

                target.get("key").then(undefined, function(e) {
                    actual = e;
                });
            });

            Assert.Equal(expected, actual);
        }

    }

    [Fixture]
    function getAll() {

        var mockA = Mocks.GetMocks(Object.Global(), {
            "$A": {
                util: {
                    format: function() {},
                    isUndefinedOrNull: function(obj) {
                        return obj === undefined || obj === null;
                    },
                    isBoolean: function(obj) {
                        return typeof obj === 'boolean';
                    }
                },
                metricsService: {},
                assert: function(condition, message){
                    if (!condition) {
                        throw new Error(message);
                    }
                }
            },
            "AuraStorage": {
                KEY_DELIMITER: ":"
            },
            "Promise": MockPromise
        });

        [Fact]
        function ThrowsErrorWhenKeysIsNotArrayOrFalsy() {
            var config = makeConfigAndAdapter();
            var actual;

            mockA(function() {
                var target = new Aura.Storage.AuraStorage(config);

                try {
                    target.getAll("string");
                } catch (e) {
                    actual = e.toString();
                }
            });

            var expected = "AuraStorage.getAll(): 'keys' must be an Array.";
            Assert.Equal(expected, actual);
        }

        [Fact]
        function ThrowsErrorWhenIncludeExpiredIsNotBoolean() {
            var config = makeConfigAndAdapter();
            var actual;

            mockA(function() {
                var target = new Aura.Storage.AuraStorage(config);

                try {
                    target.getAll([], "string");
                } catch (e) {
                    actual = e.toString();
                }
            });

            var expected = "AuraStorage.getAll(): 'includeExpired' must be a Boolean.";
            Assert.Equal(expected, actual);
        }

        [Fact]
        function GetItemsFromAdapterWithPrefixedKeys() {
            var config = makeConfigAndAdapter();
            var keyPrefix = "prefix";
            var expected = keyPrefix + "key";
            var keys;
            config.adapterClass.prototype.getItems = function(prefixedKeys) {
                keys = prefixedKeys;
                return ResolvePromise();
            };

            mockA(function() {
                var target = new Aura.Storage.AuraStorage(config);
                target.keyPrefix = keyPrefix;

                target.getAll(["key"]);
            });

            var actual = keys[0];
            Assert.Equal(expected, actual);
        }

        [Fact]
        function ReturnsPromiseThatResolvesToArrayOfStoredItems() {
            var config = makeConfigAndAdapter();
            var expected = "expected";
            var storedItem = {
                value: expected,
                expires: new Date().getTime() + 1000
            };
            var results;
            config.adapterClass.prototype.getItems = function() {
                return ResolvePromise( {"key": storedItem} );
            };

            mockA(function() {
                var target = new Aura.Storage.AuraStorage(config);
                target.keyPrefix = "";

                target.getAll(["key"]).then(function(items) {
                    results = items;
                });
            });

            var actual = results["key"];
            Assert.Equal(expected, actual);
        }

        [Fact]
        function IncludesAllStoredItemsWhenKeysIsFalsey() {
            var config = makeConfigAndAdapter();
            var storedItem = {
                value: "value",
                expires: new Date().getTime() + 1000
            };
            var results;
            config.adapterClass.prototype.getItems = function() {
                return ResolvePromise( {"key": storedItem} );
            };

            mockA(function() {
                var target = new Aura.Storage.AuraStorage(config);
                target.keyPrefix = "";

                target.getAll().then(function(items) {
                    results = items;
                });
            });

            Assert.Equal(1, Object.keys(results).length);
        }

        [Fact]
        function IncludesAllStoredItemsWhenKeysIsEmptyArray() {
            var config = makeConfigAndAdapter();
            var storedItem = {
                value: "value",
                expires: new Date().getTime() + 1000
            };
            var results;
            config.adapterClass.prototype.getItems = function() {
                return ResolvePromise( {"key": storedItem} );
            };

            mockA(function() {
                var target = new Aura.Storage.AuraStorage(config);
                target.keyPrefix = "";

                target.getAll([]).then(function(items) {
                    results = items;
                });
            });

            Assert.Equal(1, Object.keys(results).length);
        }

        [Fact]
        function ExcludesKeyPrefixInResult() {
            var config = makeConfigAndAdapter();
            var expected = "key";
            var keyPrefix = "prefix";
            var storedItem = {
                value: "value",
                expires: new Date().getTime() + 1000
            };
            var results;
            config.adapterClass.prototype.getItems = function() {
                // in storage adapter, the key is prefixed
                return ResolvePromise( {"prefixkey": storedItem} );
            };

            mockA(function() {
                var target = new Aura.Storage.AuraStorage(config);
                target.keyPrefix = keyPrefix;

                target.getAll([expected]).then(function(items) {
                    results = items;
                });
            });

            var actual = Object.keys(results)[0];
            Assert.Equal(expected, actual);
        }

        [Fact]
        function ExcludesItemsWithDifferentKeyPrefix() {
            var config = makeConfigAndAdapter();
            var results;
            config.adapterClass.prototype.getItems = function() {
                return ResolvePromise( { "diffPrefixkey": {value:"value"}} );
            };

            mockA(function() {
                var target = new Aura.Storage.AuraStorage(config);
                target.keyPrefix = "prefix";

                target.getAll([], true).then(function(items) {
                    results = items;
                });
            });

            Assert.Equal(0, Object.keys(results).length);
        }

        [Fact]
        function IncludeExpiredItemsWhenIncludeExpiredIsTrue() {
            var config = makeConfigAndAdapter();
            var storedItem = {
                value: "value",
                expires: 0
            };
            config.adapterClass.prototype.getItems = function() {
                return ResolvePromise( {"key": storedItem});
            };

            var results;
            mockA(function() {
                var target = new Aura.Storage.AuraStorage(config);
                target.keyPrefix = "";

                target.getAll(["key"], true).then(function(items) {
                    results = items;
                });
            });

            Assert.Equal(1, Object.keys(results).length);
        }

        [Fact]
        function ExcludeExpiredItemsWhenIncludeExpiredIsFalse() {
            var config = makeConfigAndAdapter();
            var storedItem = {
                value: "value",
                expires: 0
            };
            config.adapterClass.prototype.getItems = function() {
                return ResolvePromise({key: storedItem});
            };

            var results;
            mockA(function() {
                var target = new Aura.Storage.AuraStorage(config);
                target.keyPrefix = "";

                target.getAll([], false).then(function(items) {
                    results = items;
                });
            });

            Assert.Equal(0, Object.keys(results).length);
        }

        [Fact]
        function ExcludesExpiredByDefault() {
            var config = makeConfigAndAdapter();
            var storedItem = {
                value: "value",
                expires: 0
            };
            config.adapterClass.prototype.getItems = function() {
                return ResolvePromise({key: storedItem});
            };

            var results;
            mockA(function() {
                var target = new Aura.Storage.AuraStorage(config);
                target.keyPrefix = "";

                target.getAll().then(function(items) {
                    results = items;
                });
            });

            Assert.Equal(0, Object.keys(results).length);
        }

        [Fact]
        function ReturnsRejectPromiseWithError() {
            var config = makeConfigAndAdapter();
            var expected = new Error();
            var actual;
            config.adapterClass.prototype.getItems = function() {
                return RejectPromise(expected);
            };

            mockA(function() {
                var target = new Aura.Storage.AuraStorage(config);
                target.sweep = function() {};
                target.logError = function() {};

                target.getAll().then([], function(e) {
                    actual = e;
                });
            });

            Assert.Equal(expected, actual);
        }

        [Fact]
        function LogErrorWhenGetAllRejects() {
            var config = makeConfigAndAdapter();
            var expected = "test error message";
            var metricConfig;
            config.adapterClass.prototype.getItems = function() {
                return RejectPromise(new Error(expected));
            };

            mockA(function() {
                var target = new Aura.Storage.AuraStorage(config);
                target.keyPrefix = "";
                target.sweep = function() {};
                $A.metricsService.transaction = function(ns, name, config) {
                    metricConfig = config;
                };

                target.getAll();
            });

            var actual = metricConfig["context"]["attributes"]["error"];
            Assert.Equal(expected, actual);
        }

    }

    [Fixture]
    function sweep() {

        // a promise that doesn't resolve, doesn't invoke then()'s
        var UnresolvedPromise = function UnresolvedPromise() {
          return {
              then: function() {
                  return UnresolvedPromise();
              }
          };
        };

        var mockA = Mocks.GetMocks(Object.Global(), {
            "$A": {
                "finishedInit": true,
                storageService: {
                    getAdapterConfig: function() { return {}; }
                },
                util: {
                    format: function() {},
                    isUndefinedOrNull: function(obj) { return obj === undefined || obj === null; },
                    isBoolean: function(b) { return typeof b === "boolean"; }
                },
                eventService: {
                    getNewEvent: function(name) {
                        if (name === "markup://auraStorage:modified") {
                            return new AuraEvent();
                        }
                    }
                },
                metricsService: {
                    transaction: function() {}
                },
                assert: function() {}
            },
            "AuraStorage": {
                KEY_DELIMITER: ":"
            }
        });

        // if using the time mock, must reset time at the start of the test
        var time = 0;
        var mockTime = Mocks.GetMocks(Object.Global(), {
            "Date": function() {
                return {
                    getTime: function() {
                        return time;
                    }
                };
            }
        });

        [Fact]
        function ConcurrentSweepPrevented() {
            var expected = 1;
            var actual = 0;

            var config = makeConfigAndAdapter();
            config.adapterClass.prototype.sweep = function() {
                actual++;
                return UnresolvedPromise();
            };

            mockTime(function() { mockA(function() {
                time = 0;
                var target = new Aura.Storage.AuraStorage(config);

                time = Aura.Storage.AuraStorage.SWEEP_INTERVAL.MAX+1;
                target.sweep();
                target.sweep();
            }); });

            Assert.Equal(expected, actual);
        }


        [Fact]
        function SuspendPreventsSweep() {
            var expected = 0;
            var actual = 0;

            var config = makeConfigAndAdapter();
            config.adapterClass.prototype.sweep = function() {
                actual++;
                return ResolvePromise();
            };

            mockTime(function() { mockA(function() {
                time = 0;
                var target = new Aura.Storage.AuraStorage(config);

                time = Aura.Storage.AuraStorage.SWEEP_INTERVAL.MAX+1;
                target.suspendSweeping();
                target.sweep();
            }); });

            Assert.Equal(expected, actual);
        }

        [Fact]
        function SuspendSweepLogsStats() {
            var actual = false;

            var config = makeConfigAndAdapter();

            mockTime(function() { mockA(function() {
                time = 0;
                var target = new Aura.Storage.AuraStorage(config);
                target.logStats = function() {
                    actual = true;
                }

                target.suspendSweeping();
                target.sweep();
            }); });

            Assert.True(actual);
        }

        [Fact]
        function ResumeTriggersSweep() {
            var expected = 1;
            var actual = 0;

            var config = makeConfigAndAdapter();
            config.adapterClass.prototype.sweep = function() {
                actual++;
                return ResolvePromise();
            };

            mockTime(function() { mockA(function() {
                time = 0;
                var target = new Aura.Storage.AuraStorage(config);

                time = Aura.Storage.AuraStorage.SWEEP_INTERVAL.MAX;
                target.suspendSweeping();
                target.resumeSweeping();
            }); });

            Assert.Equal(expected, actual);
        }


        [Fact]
        function SweepPreventedUntilFrameworkFinishedInit() {
            var expected = 0;
            var actual = 0;

            var config = makeConfigAndAdapter();
            config.adapterClass.prototype.sweep = function() {
                actual++;
                return ResolvePromise();
            };

            mockTime(function() { mockA(function() {
                $A["finishedInit"] = false;
                time = 0;
                var target = new Aura.Storage.AuraStorage(config);

                time = Aura.Storage.AuraStorage.SWEEP_INTERVAL.MAX+1;
                target.sweep();

                $A["finishedInit"] = true;
            }); });

            Assert.Equal(expected, actual);
        }


        [Fact]
        function SweepPreventedBeforeMinInterval() {
            var expected = 0;
            var actual = 0;

            var config = makeConfigAndAdapter();
            config.expiration = 1;
            config.adapterClass.prototype.sweep = function() {
                actual++;
                return ResolvePromise();
            };

            mockTime(function() { mockA(function() {
                time = 0;
                var target = new Aura.Storage.AuraStorage(config);

                // advance time to 1ms less than min sweep interval
                time = Aura.Storage.AuraStorage.SWEEP_INTERVAL.MIN - 1;

                target.sweep();
            }); });

            Assert.Equal(expected, actual);
        }


        [Fact]
        function SweepAllowedAtExpirationMinInterval() {
            var expected = 1;
            var actual = 0;

            var config = makeConfigAndAdapter();
            config.expiration = 1;
            config.adapterClass.prototype.sweep = function() {
                actual++;
                return ResolvePromise();
            };

            mockTime(function() { mockA(function() {
                time = 0;
                var target = new Aura.Storage.AuraStorage(config);

                // advance time to exactly min sweep interval
                time = Aura.Storage.AuraStorage.SWEEP_INTERVAL.MIN;

                target.sweep();
            }); });

            Assert.Equal(expected, actual);
        }


        [Fact]
        function SweepAllowedBeforeMinIntervalIfForced() {
            var expected = 1;
            var actual = 0;

            var config = makeConfigAndAdapter();
            config.expiration = 1;
            config.adapterClass.prototype.sweep = function() {
                actual++;
                return ResolvePromise();
            };

            mockTime(function() { mockA(function() {
                time = 0;
                var target = new Aura.Storage.AuraStorage(config);

                // advance time to 1ms less than min sweep interval
                time = Aura.Storage.AuraStorage.SWEEP_INTERVAL.MIN - 1;

                target.sweep(true);
            }); });

            Assert.Equal(expected, actual);
        }



        [Fact]
        function SweepPreventedBeforeMaxInterval() {
            var expected = 0;
            var actual = 0;

            var config = makeConfigAndAdapter();
            // set config such that max interval applies
            config.expiration = Aura.Storage.AuraStorage.SWEEP_INTERVAL.MAX*2/1000 + 1;
            config.adapterClass.prototype.sweep = function() {
                actual++;
                return ResolvePromise();
            };

            mockTime(function() { mockA(function() {
                time = 0;
                var target = new Aura.Storage.AuraStorage(config);

                // advance time to exactly max sweep interval
                time = Aura.Storage.AuraStorage.SWEEP_INTERVAL.MAX-1;

                target.sweep();
            }); });

            Assert.Equal(expected, actual);
        }


        [Fact]
        function SweepAllowedAfterMaxInterval() {
            var expected = 1;
            var actual = 0;

            var config = makeConfigAndAdapter();
            // set config such that max interval applies
            config.expiration = Aura.Storage.AuraStorage.SWEEP_INTERVAL.MAX*2/1000 + 1;
            config.adapterClass.prototype.sweep = function() {
                actual++;
                return ResolvePromise();
            };

            mockTime(function() { mockA(function() {
                time = 0;
                var target = new Aura.Storage.AuraStorage(config);

                // advance time to exactly max sweep interval
                time = Aura.Storage.AuraStorage.SWEEP_INTERVAL.MAX;

                target.sweep();
            }); });

            Assert.Equal(expected, actual);
        }

        [Fact]
        function AdapterSweepResolveFiresModified() {
            firedEvents = [];

            var config = makeConfigAndAdapter();
            // set config such that max interval applies
            config.expiration = Aura.Storage.AuraStorage.SWEEP_INTERVAL.MAX*2/1000 + 1;
            config.adapterClass.prototype.sweep = function() {
                return ResolvePromise();
            };

            mockTime(function() { mockA(function() {
                time = 0;
                var target = new Aura.Storage.AuraStorage(config);

                // advance time to exactly max sweep interval
                time = Aura.Storage.AuraStorage.SWEEP_INTERVAL.MAX;

                target.sweep();
            }); });

            Assert.Equal(1, firedEvents.length);
        }

        [Fact]
        function AdapterSweepFiresModifiedWithStorageName() {
            firedEvents = [];
            var expected = "storageName";

            var config = makeConfigAndAdapter();
            config.name = expected;
            // set config such that max interval applies
            config.expiration = Aura.Storage.AuraStorage.SWEEP_INTERVAL.MAX*2/1000 + 1;
            config.adapterClass.prototype.sweep = function() {
                return ResolvePromise();
            };

            mockTime(function() { mockA(function() {
                time = 0;
                var target = new Aura.Storage.AuraStorage(config);

                // advance time to exactly max sweep interval
                time = Aura.Storage.AuraStorage.SWEEP_INTERVAL.MAX;

                target.sweep();
            }); });

            var params = firedEvents[0];
            Assert.Equal(expected, params["name"]);
        }

        [Fact]
        function AdapterSweepRejectDoesNotFireModified() {
            firedEvents = [];

            var config = makeConfigAndAdapter();
            // set config such that max interval applies
            config.expiration = Aura.Storage.AuraStorage.SWEEP_INTERVAL.MAX*2/1000 + 1;
            config.adapterClass.prototype.sweep = function() {
                return RejectPromise(new Error("message"));
            };

            mockTime(function() { mockA(function() {
                time = 0;
                var target = new Aura.Storage.AuraStorage(config);

                // advance time to exactly max sweep interval
                time = Aura.Storage.AuraStorage.SWEEP_INTERVAL.MAX;

                target.sweep();
            }); });

            Assert.Equal(0, firedEvents.length);
        }

        [Fact]
        function AdapterSweepLogsStats() {
            var actual = false;

            var config = makeConfigAndAdapter();
            config.expiration = 1;
            config.adapterClass.prototype.sweep = function() {
                return ResolvePromise();
            };

            mockTime(function() { mockA(function() {
                time = 0;
                var target = new Aura.Storage.AuraStorage(config);
                target.logStats = function() {
                    actual = true;
                }

                target.sweep(true);
            }); });

            Assert.True(actual);
        }
    }


    [Fixture]
    function set() {
        var AdapterClass = function() {};
        AdapterClass.prototype.initialize = function() { return ResolvePromise(); };
        AdapterClass.prototype.getName = function() {};
        AdapterClass.prototype.sweep = function() { return ResolvePromise(); };

        var config = {
            adapterClass: AdapterClass
        };

        var mockA = Mocks.GetMocks(Object.Global(), {
            "$A": {
                "finishedInit": true,
                storageService: {
                    getAdapterConfig: function() { return {}; }
                },
                util: {
                    format: function() {},
                    isUndefinedOrNull: function(obj) { return obj === undefined || obj === null; },
                    estimateSize: function(obj) {
                        if(obj === "size5") { return 5; }
                        return 0;
                    },
                    isString: function() { return true; },
                    isObject: function() { return true; }
                },
                eventService: {
                    getNewEvent: function(name) {
                        if (name === "markup://auraStorage:modified") {
                            return new AuraEvent();
                        }
                    }
                },
                metricsService: {
                    transaction: function() {}
                },
                assert: function() {}
            },
            "AuraStorage": {
                KEY_DELIMITER: ":"
            }
        });

        [Fact]
        function CallsSetItemWithKey() {
            var expected = "key";
            var actual;

            AdapterClass.prototype.setItems = function(tuples) {
                actual = tuples[0][0];
                return new ResolvePromise();
            };

            mockA(function() {
                Aura.Storage.AuraStorage.prototype.generateKeyPrefix = function() {
                    return "";
                };

                var target = new Aura.Storage.AuraStorage(config);
                target.sweep = function() {};
                target.set(expected, "value");
            });

            Assert.Equal(expected, actual);
        }

        [Fact]
        function CallsSetItemWithItemDotValue() {
            var expected = "value";
            var actual;

            AdapterClass.prototype.setItems = function(tuples) {
                actual = tuples[0][1];
                return new ResolvePromise();
            };

            mockA(function() {
                var target = new Aura.Storage.AuraStorage(config);
                target.sweep = function() {};
                target.set("key", expected);
            });

            Assert.Equal(expected, actual.value);
        }


        [Fact]
        function CallsSetItemWithItemDotCreated() {
            var actual;

            AdapterClass.prototype.setItems = function(tuples) {
                actual = tuples[0][1];
                return new ResolvePromise();
            };

            mockA(function() {
                var target = new Aura.Storage.AuraStorage(config);
                target.sweep = function() {};
                target.set("key", "value");
            });

            Assert.Equal("number", typeof actual.created);
        }


        [Fact]
        function CallsSetItemWithItemDotExpires() {
            var actual;

            AdapterClass.prototype.setItems = function(tuples) {
                actual = tuples[0][1];
                return new ResolvePromise();
            };

            mockA(function() {
                var target = new Aura.Storage.AuraStorage(config);
                target.sweep = function() {};
                target.set("key", "value");
            });

            Assert.Equal("number", typeof actual.expires);
        }


        [Fact]
        function CallsSetItemWithSize() {
            var expected = 7;
            var actual;

            AdapterClass.prototype.setItems = function(tuples) {
                actual = tuples[0][2];
                return new ResolvePromise();
            };

            mockA(function() {
                $A.util.estimateSize = function() { return expected; };
                var target = new Aura.Storage.AuraStorage(config);
                target.sweep = function() {};
                target.set("key", "value");
            });

            Assert.Equal(expected * 2, actual); // key + value are included in size so x 2
        }


        [Fact]
        function SuccessfulSetFiresModified() {
            firedEvents = [];

            AdapterClass.prototype.setItems = function() {
                return new ResolvePromise();
            };

            mockA(function() {
                var target = new Aura.Storage.AuraStorage(config);
                target.sweep = function() {};
                target.set("key", "value");
            });

            Assert.Equal(1, firedEvents.length);
        }

        [Fact]
        function SetFiresModifiedWithStorageName() {
            firedEvents = [];
            var expected = "storageName";
            var config = makeConfigAndAdapter();
            config.name = expected;

            config.adapterClass.prototype.setItems = function() {
                return ResolvePromise();
            };

            mockA(function() {
                var target = new Aura.Storage.AuraStorage(config);
                target.sweep = function() {};
                target.set("key", "value");
            });

            var params = firedEvents[0];
            Assert.Equal(expected, params["name"]);
        }

        [Fact]
        function FailedSetDoesNotFireModified() {
            firedEvents = [];

            AdapterClass.prototype.setItems = function() {
                return new RejectPromise();
            };

            mockA(function() {
                var target = new Aura.Storage.AuraStorage(config);
                target.sweep = function() {};
                target.set("key", "value");
            });

            Assert.Equal(0, firedEvents.length);
        }
    }


    [Fixture]
    function remove() {
        var AdapterClass = function() {};
        AdapterClass.prototype.initialize = function() { return ResolvePromise(); };
        AdapterClass.prototype.getName = function() {};
        AdapterClass.prototype.sweep = function() { return ResolvePromise(); };

        var config = {
            adapterClass: AdapterClass
        };

        var mockA = Mocks.GetMocks(Object.Global(), {
            "$A": {
                "finishedInit": true,
                storageService: {
                    getAdapterConfig: function() { return {}; }
                },
                util: {
                    format: function() {},
                    isUndefinedOrNull: function(obj) { return obj === undefined || obj === null; },
                    estimateSize: function() { return 0; },
                    isString: function() { return true; },
                    isArray: function() { return true; },
                    isBoolean: function() { return true; }
                },
                eventService: {
                    getNewEvent: function(name) {
                        if (name === "markup://auraStorage:modified") {
                            return new AuraEvent();
                        }
                    }
                },
                metricsService: {
                    transaction: function() {}
                },
                assert: function() {}
            },
            "AuraStorage": {
                KEY_DELIMITER: ":"
            }
        });

        [Fact]
        function SuccessfulRemoveFiresModified() {
            firedEvents = [];

            AdapterClass.prototype.removeItems = function() {
                return new ResolvePromise();
            };

            mockA(function() {
                var target = new Aura.Storage.AuraStorage(config);
                target.sweep = function() {};
                target.remove("key");
            });

            Assert.Equal(1, firedEvents.length);
        }

        [Fact]
        function RemoveFiresModifiedWithStorageName() {
            firedEvents = [];
            var expected = "storageName";
            var config = makeConfigAndAdapter();
            config.name = expected;

            config.adapterClass.prototype.removeItems = function() {
                return ResolvePromise();
            };

            mockA(function() {
                var target = new Aura.Storage.AuraStorage(config);
                target.sweep = function() {};
                target.remove("key");
            });

            var params = firedEvents[0];
            Assert.Equal(expected, params["name"]);
        }

        [Fact]
        function FailedRemoveDoesNotFireModified() {
            firedEvents = [];

            AdapterClass.prototype.removeItems = function() {
                return new RejectPromise();
            };

            mockA(function() {
                var target = new Aura.Storage.AuraStorage(config);
                target.sweep = function() {};
                target.remove("key");
            });

            Assert.Equal(0, firedEvents.length);
        }


        [Fact]
        function RemoveDoNotFireModifiedRespected() {
            firedEvents = [];

            AdapterClass.prototype.removeItems = function() {
                return new ResolvePromise();
            };

            mockA(function() {
                var target = new Aura.Storage.AuraStorage(config);
                target.sweep = function() {};
                target.remove("key", true);
            });

            Assert.Equal(0, firedEvents.length);
        }
    }

}
