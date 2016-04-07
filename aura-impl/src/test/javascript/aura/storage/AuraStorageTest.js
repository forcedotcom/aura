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
Test.Aura.Storage.Adapters.AuraStorageTest = function() {
    var A = {};
    var Aura = {Storage: {} };

    Mocks.GetMocks(Object.Global(), {
        "$A": A,
        "Aura": Aura,
        "AuraStorage": function() {}
    })(function () {
        Import("aura-impl/src/main/resources/aura/storage/AuraStorage.js");
    });



    [Fixture]
    function sweep() {
        var config = {
            adapter: {
                getName: function() {}
            }
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

            config.adapter.sweep = function() {
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

            config.adapter.sweep = function() {
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

            config.adapter.sweep = function() {
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

            config.adapter.sweep = function() {
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
        function SweepPreventedBeforeOneMinInterval() {
            var expected = 0;
            var actual = 0;

            config.defaultExpiration = 1;
            config.adapter.sweep = function() {
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

            config.defaultExpiration = 1;
            config.adapter.sweep = function() {
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

            // set config such that max interval applies
            config.defaultExpiration = Aura.Storage.AuraStorage.SWEEP_INTERVAL.MAX*2/1000 + 1;
            config.adapter.sweep = function() {
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

            // set config such that max interval applies
            config.defaultExpiration = Aura.Storage.AuraStorage.SWEEP_INTERVAL.MAX*2/1000 + 1;
            config.adapter.sweep = function() {
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
    }
}
