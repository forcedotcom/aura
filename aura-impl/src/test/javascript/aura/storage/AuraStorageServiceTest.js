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
Test.Aura.Storage.Adapters.AuraStorageServiceTest = function() {
    var $A = {};
    var Aura = {Services: {} };

    Mocks.GetMocks(Object.Global(), {
        "$A": $A,
        "Aura": Aura,
        "AuraStorageService": function() {}
    })(function () {
        Import("aura-impl/src/main/resources/aura/storage/AuraStorageService.js");
    });


    var mockOnLoadUtil = Mocks.GetMocks(Object.Global(), {
        "$A": $A,
        Aura: Aura
    });
    var targetService;
    mockOnLoadUtil(function() {
        targetService = new Aura.Services.AuraStorageService();
    });


    [Fixture]
    function initStorage() {
        var mockA = Mocks.GetMocks(Object.Global(), {
            "$A": {
                assert: function() {},
                util: {
                    isBoolean: function(obj) { return typeof obj === 'boolean'; },
                    isFiniteNumber: function(obj) { return typeof obj === 'number' && isFinite(obj); }
                }
            },
            "AuraStorage": function() {}
        });

        targetService.createAdapter = function() {};
        targetService.selectAdapter = function() {};

        [Fact]
        function RequiresName() {
            var expected = new Error("expected");
            var mockAssert = Mocks.GetMock(Object.Global(), "$A", {
                assert: function(value, msg) {
                    if (value === undefined) {
                        throw expected;
                    }
                }
            });

            mockAssert(function() {
                try {
                    targetService.initStorage();
                    Assert.Fail("Error should've been thrown");
                } catch (actual) {
                    Assert.Equal(expected, actual);
                }
            });
        }

        [Fact]
        function PersistentDefaultsFalse() {
            var actual;

            targetService.createAdapter = function() {};
            targetService.selectAdapter = function(persistent, secure) {
                actual = persistent;
            };

            mockA(function() {
                targetService.initStorage("name");
            });

            Assert.False(actual);
        }

        function PersistentRespectsArgument() {
            var actual;

            targetService.createAdapter = function() {};
            targetService.selectAdapter = function(persistent, secure) {
                actual = persistent;
            };

            mockA(function() {
                targetService.initStorage("name", true);
            });

            Assert.True(actual);
        }

        [Fact]
        function SecureDefaultsFalse() {
            var actual;

            targetService.createAdapter = function() {};
            targetService.selectAdapter = function(persistent, secure) {
                actual = secure;
            };

            mockA(function() {
                targetService.initStorage("name", true);
            });

            Assert.False(actual);
        }

        [Fact]
        function SecureRespectsArgument() {
            var actual;

            targetService.createAdapter = function() {};
            targetService.selectAdapter = function(persistent, secure) {
                actual = secure;
            };

            mockA(function() {
                targetService.initStorage("name", true, true);
            });

            Assert.True(actual);
        }

        [Fact]
        function MaxSizeDefaults1MB() {
            var actual;
            var mockAuraStorage = Mocks.GetMocks(Object.Global(), {
                "AuraStorage": function(config) {
                    actual = config.maxSize;
                }
            });

            mockA(function() { mockAuraStorage(function() {
                targetService.initStorage("name", true, true);
            })});

            Assert.Equal(1000*1024, actual);
        }

        [Fact]
        function MaxSizeRespectsArgument() {
            var expected = 25;
            var actual;
            var mockAuraStorage = Mocks.GetMocks(Object.Global(), {
                "AuraStorage": function(config) {
                    actual = config.maxSize;
                }
            });

            mockA(function() { mockAuraStorage(function() {
                targetService.initStorage("name", true, true, expected);
            })});

            Assert.Equal(expected, actual);
        }

        [Fact]
        function DefaultExpirationDefaults10() {
            var actual;
            var mockAuraStorage = Mocks.GetMocks(Object.Global(), {
                "AuraStorage": function(config) {
                    actual = config.defaultExpiration;
                }
            });

            mockA(function() { mockAuraStorage(function() {
                targetService.initStorage("name", true, true, 1);
            })});

            Assert.Equal(10, actual);
        }

        [Fact]
        function DefaultExpirationRespectsArgument() {
            var expected = 25;
            var actual;
            var mockAuraStorage = Mocks.GetMocks(Object.Global(), {
                "AuraStorage": function(config) {
                    actual = config.defaultExpiration;
                }
            });

            mockA(function() { mockAuraStorage(function() {
                targetService.initStorage("name", true, true, 1, expected);
            })});

            Assert.Equal(expected, actual);
        }

        [Fact]
        function DefaultAutoRefreshIntervalDefaults30() {
            var actual;
            var mockAuraStorage = Mocks.GetMocks(Object.Global(), {
                "AuraStorage": function(config) {
                    actual = config.defaultAutoRefreshInterval;
                }
            });

            mockA(function() { mockAuraStorage(function() {
                targetService.initStorage("name", true, true, 1, 2);
            })});

            Assert.Equal(30, actual);
        }

        [Fact]
        function DefaultAutoRefreshIntervalRespectsArgument() {
            var expected = 25;
            var actual;
            var mockAuraStorage = Mocks.GetMocks(Object.Global(), {
                "AuraStorage": function(config) {
                    actual = config.defaultAutoRefreshInterval;
                }
            });

            mockA(function() { mockAuraStorage(function() {
                targetService.initStorage("name", true, true, 1, 2, expected);
            })});

            Assert.Equal(expected, actual);
        }

        [Fact]
        function DebugLoggingEnabledDefaultsFalse() {
            var actual;
            var mockAuraStorage = Mocks.GetMocks(Object.Global(), {
                "AuraStorage": function(config) {
                    actual = config.debugLoggingEnabled;
                }
            });

            mockA(function() { mockAuraStorage(function() {
                targetService.initStorage("name", true, true, 1, 2, 3);
            })});

            Assert.False(actual);
        }

        [Fact]
        function DebugLoggingEnabledRespectsArgument() {
            var actual;
            var mockAuraStorage = Mocks.GetMocks(Object.Global(), {
                "AuraStorage": function(config) {
                    actual = config.debugLoggingEnabled;
                }
            });

            mockA(function() { mockAuraStorage(function() {
                targetService.initStorage("name", true, true, 1, 2, 3, true);
            })});

            Assert.True(actual);
        }

        [Fact]
        function ClearStorageOnInitDefaultsTrue() {
            var actual;
            var mockAuraStorage = Mocks.GetMocks(Object.Global(), {
                "AuraStorage": function(config) {
                    actual = config.clearStorageOnInit;
                }
            });

            mockA(function() { mockAuraStorage(function() {
                targetService.initStorage("name", true, true, 1, 2, 3, 4);
            })});

            Assert.True(actual);
        }

        [Fact]
        function ClearStorageOnInitRespectsArgument() {
            var actual;
            var mockAuraStorage = Mocks.GetMocks(Object.Global(), {
                "AuraStorage": function(config) {
                    actual = config.clearStorageOnInit;
                }
            });

            mockA(function() { mockAuraStorage(function() {
                targetService.initStorage("name", true, true, 1, 2, 3, 4, false);
            })});

            Assert.False(actual);
        }


        [Fact]
        function VersionDefault() {
            var expected = "expected";
            targetService.version = expected;

            var actual;
            var mockAuraStorage = Mocks.GetMocks(Object.Global(), {
                "AuraStorage": function(config) {
                    actual = config.version;
                }
            });

            mockA(function() { mockAuraStorage(function() {
                targetService.initStorage("name", true, true, 1, 2, 3, 4, 5);
            })});

            Assert.Equal(expected, actual);
        }

        [Fact]
        function VersionRespectsArgument() {
            var expected = "version";
            var actual;
            var mockAuraStorage = Mocks.GetMocks(Object.Global(), {
                "AuraStorage": function(config) {
                    actual = config.version;
                }
            });

            mockA(function() { mockAuraStorage(function() {
                targetService.initStorage("name", true, true, 1, 2, 3, 4, 5, expected);
            })});

            Assert.Equal(expected, actual);
        }
    }
}