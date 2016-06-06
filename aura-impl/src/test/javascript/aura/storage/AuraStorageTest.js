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

    // promise mocks
    var ResolvePromise = function ResolvePromise(value) {
        return {
            then: function(resolve, reject) {
                try {
                    var newValue = resolve && resolve(value);
                    return new ResolvePromise(newValue);
                } catch (e) {
                    return new RejectPromise(e);
                }
            }
        };
    };

    var RejectPromise = function RejectPromise(error) {
        return {
            then: function(resolve, reject) {
                try {
                    var value = reject && reject(error);
                    return new ResolvePromise(value);
                } catch (newError) {
                  return new RejectPromise(newError);
                }
            }
        };
    };


    // aura event mocks + collector for fired aura events.
    // any testing using firedEvents must first reset it.
    var firedEvents = [];
    var AuraEvent = function AuraEvent() {};
    AuraEvent.prototype.fire = function() {
        firedEvents.push(this);
    };


    [Fixture]
    function getName() {
        var AdapterClass = function() {};
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
        function DelegatesToAdapter() {
            var expected = "name";
            var actual;

            AdapterClass.prototype.getName = function() {return expected;};
            mockA(function() {
                var target = new Aura.Storage.AuraStorage(config);
                actual = target.getName();
            });

            Assert.Equal(expected, actual);
        }
    }


    [Fixture]
    function getExpiration() {
        var AdapterClass = function() {};
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
            var expected = 1;
            var actual;

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
        var AdapterClass = function() {};
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
            var expected = 1; // output as KB
            var actual;

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
    function sweep() {
        // makes an adapter + config. new class definition prevents cross-test contamination.
        var makeConfigAndAdapter = function() {
            var AdapterClass = function() {};
            AdapterClass.prototype.getName = function() {};
            return {
                adapterClass: AdapterClass
            };
        };

        var NoopPromise = function NoopPromise() {
          return {
              then: function() {
                  return { then: function() {} };
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
                    isUndefinedOrNull: function(obj) { return obj === undefined || obj === null; }
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
                }
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
                return new NoopPromise();
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
                return new NoopPromise();
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
        function ResumeTriggersSweep() {
            var expected = 1;
            var actual = 0;

            var config = makeConfigAndAdapter();
            config.adapterClass.prototype.sweep = function() {
                actual++;
                return new NoopPromise();
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
                return new NoopPromise();
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
                return new NoopPromise();
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
                return new NoopPromise();
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
        function SweepPreventedBeforeMaxInterval() {
            var expected = 0;
            var actual = 0;

            var config = makeConfigAndAdapter();
            // set config such that max interval applies
            config.expiration = Aura.Storage.AuraStorage.SWEEP_INTERVAL.MAX*2/1000 + 1;
            config.adapterClass.prototype.sweep = function() {
                actual++;
                return new NoopPromise();
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
                return new NoopPromise();
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
        function AdapterSweepRejectClearsSweepInProgress() {
            var config = makeConfigAndAdapter();
            // set config such that max interval applies
            config.expiration = Aura.Storage.AuraStorage.SWEEP_INTERVAL.MAX*2/1000 + 1;
            config.adapterClass.prototype.sweep = function() {
                return new RejectPromise();
            };

            mockTime(function() { mockA(function() {
                time = 0;
                var target = new Aura.Storage.AuraStorage(config);

                // advance time to exactly max sweep interval
                time = Aura.Storage.AuraStorage.SWEEP_INTERVAL.MAX;

                target.sweep();
                Assert.False(target._sweepingInProgress);
            }); });
        }


        [Fact]
        function AdapterSweepResolveFiresModified() {
            firedEvents = [];

            var config = makeConfigAndAdapter();
            // set config such that max interval applies
            config.expiration = Aura.Storage.AuraStorage.SWEEP_INTERVAL.MAX*2/1000 + 1;
            config.adapterClass.prototype.sweep = function() {
                return new ResolvePromise();
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
        function AdapterSweepRejectsDoesNotFireModified() {
            firedEvents = [];

            var config = makeConfigAndAdapter();
            // set config such that max interval applies
            config.expiration = Aura.Storage.AuraStorage.SWEEP_INTERVAL.MAX*2/1000 + 1;
            config.adapterClass.prototype.sweep = function() {
                return new RejectPromise();
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
        function AdapterAbsentSweepInvokesGetExpired() {
            var actual = false;
            var config = makeConfigAndAdapter();
            // set config such that max interval applies
            config.expiration = Aura.Storage.AuraStorage.SWEEP_INTERVAL.MAX*2/1000 + 1;

            // do not define adapter.sweep(). this forces getExpired() to be used.
            config.adapterClass.prototype.getExpired = function() {
                actual = true
                return new ResolvePromise(); // do not return the expected array
            };

            mockTime(function() { mockA(function() {
                time = 0;
                var target = new Aura.Storage.AuraStorage(config);

                // advance time to exactly max sweep interval
                time = Aura.Storage.AuraStorage.SWEEP_INTERVAL.MAX;

                target.sweep();
            }); });

            Assert.True(actual);
        }


        [Fact]
        function AdapterGetExpiredReturnsNonArrayUnblocksFutureSweep() {
            var config = makeConfigAndAdapter();
            // set config such that max interval applies
            config.expiration = Aura.Storage.AuraStorage.SWEEP_INTERVAL.MAX*2/1000 + 1;
            config.adapterClass.prototype.getExpired = function() {
                return new ResolvePromise(); // do not return the expected array
            };

            mockTime(function() { mockA(function() {
                time = 0;
                var target = new Aura.Storage.AuraStorage(config);
                target._sweepingInProgress = false;

                // advance time to exactly max sweep interval
                time = Aura.Storage.AuraStorage.SWEEP_INTERVAL.MAX;

                target.sweep();
                Assert.False(target._sweepingInProgress);
            }); });
        }
    }


    [Fixture]
    function set() {
        var AdapterClass = function() {};
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
                    }
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
                }
            },
            "AuraStorage": {
                KEY_DELIMITER: ":"
            }
        });

        [Fact]
        function CallsRemoveItemWithPrefixAndKeyWhenKeyValuePairLargerThanMax() {
            var actual;
            var keyPrefix = "prefix";
            var expected = keyPrefix + "key";

            AdapterClass.prototype.removeItem = function(key) {
                actual = key;
                return new ResolvePromise();
            };

            mockA(function() {
                Aura.Storage.AuraStorage.prototype.generateKeyPrefix = function() {
                    return keyPrefix;
                };

                var target = new Aura.Storage.AuraStorage(config);
                target.maxSize = 1;
                // set a key-value pair with size of 5
                target.set("key", "size5");
            });

            Assert.Equal(expected, actual);
        }

        [Fact]
        function CallsSetItemWithKey() {
            var expected = "key";
            var actual;

            AdapterClass.prototype.setItem = function(key, item, size) {
                actual = key;
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

            AdapterClass.prototype.setItem = function(key, item, size) {
                actual = item;
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

            AdapterClass.prototype.setItem = function(key, item, size) {
                actual = item;
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

            AdapterClass.prototype.setItem = function(key, item, size) {
                actual = item;
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

            AdapterClass.prototype.setItem = function(key, item, size) {
                actual = size;
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

            AdapterClass.prototype.setItem = function() {
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
        function FailedSetDoesNotFireModified() {
            firedEvents = [];

            AdapterClass.prototype.setItem = function() {
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
                    estimateSize: function() { return 0; }
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
                }
            },
            "AuraStorage": {
                KEY_DELIMITER: ":"
            }
        });


        [Fact]
        function SuccessfulRemoveFiresModified() {
            firedEvents = [];

            AdapterClass.prototype.removeItem = function() {
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
        function FailedRemoveDoesNotFireModified() {
            firedEvents = [];

            AdapterClass.prototype.removeItem = function() {
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

            AdapterClass.prototype.removeItem = function() {
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
