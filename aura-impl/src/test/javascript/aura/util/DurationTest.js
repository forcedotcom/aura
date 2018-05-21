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
Function.RegisterNamespace("Test.Aura.Util");

/**
 * Tests for Duration class
 */

[Fixture]
Test.Aura.Util.DurationTest = function() {
    var Aura = {
        Utils: { SecureFilters: {} }
    };

    Mocks.GetMocks(Object.Global(), {
        "Aura": Aura,
        "navigator": {
            "userAgent": ""
        },
        "window": {}
    })(function() {
        [Import("aura-impl/src/main/resources/aura/util/Duration.js"),
         Import("aura-impl/src/main/resources/aura/util/Util.js")]
    });

    var mockAura = Mocks.GetMocks(Object.Global(), {
        "$A": {
            localizationService: {
                normalizeDateTimeUnit: function(unit) {
                    return unit;
                }
            },
            util: {
                isEmpty: Aura.Utils.Util.prototype.isEmpty
            }

        },
        "Aura": Aura
    });

    [Fixture]
    function asUnit() {

        var mockMoment = {
            "duration": function(){}
        };

        [Fact]
        function asYears() {
            // Arrange
            var actual;
            mockAura(function() {
                var duration = new Aura.Utils.Duration(30, "month", mockMoment);

                // Act
                actual = duration.asUnit("year");
            });

            Assert.Equal(2.5, actual);
        }

        [Fact]
        function asMonths() {
            // Arrange
            var actual;
            mockAura(function() {
                var duration = new Aura.Utils.Duration(2, "year", mockMoment);

                // Act
                actual = duration.asUnit("month");
            });

            Assert.Equal(24, actual);
        }

        [Fact]
        function asDays() {
            // Arrange
            var actual;
            mockAura(function() {
                var duration = new Aura.Utils.Duration(60, "hour", mockMoment);

                // Act
                actual = duration.asUnit("day");
            });

            Assert.Equal(2.5, actual);
        }

        [Fact]
        function asDaysForMonths() {
            // Arrange
            var actual;
            mockAura(function() {
                var duration = new Aura.Utils.Duration(12, "month", mockMoment);

                // Act
                actual = duration.asUnit("day");
            });

            Assert.Equal(365, actual);
        }

        [Fact]
        function asDaysForYears() {
            // Arrange
            var actual;
            mockAura(function() {
                var duration = new Aura.Utils.Duration(4, "year", mockMoment);

                // Act
                actual = duration.asUnit("day");
            });

            Assert.Equal(1461, actual); // 365 * 3 + 366
        }

        [Fact]
        function asHours() {
            // Arrange
            var actual;
            mockAura(function() {
                var duration = new Aura.Utils.Duration(15, "minute", mockMoment);

                // Act
                actual = duration.asUnit("hour");
            });

            Assert.Equal(0.25, actual);
        }

        [Fact]
        function asMinutes() {
            // Arrange
            var actual;
            mockAura(function() {
                var duration = new Aura.Utils.Duration(105, "second", mockMoment);

                // Act
                actual = duration.asUnit("minute");
            });

            Assert.Equal(1.75, actual);
        }

        [Fact]
        function asSeconds() {
            // Arrange
            var actual;
            mockAura(function() {
                var duration = new Aura.Utils.Duration(1500, "millisecond", mockMoment);

                // Act
                actual = duration.asUnit("second");
            });

            Assert.Equal(1.5, actual);
        }

        function asMilliseconds() {
            // Arrange
            var actual;
            mockAura(function() {
                var duration = new Aura.Utils.Duration(1.5, "second", mockMoment);

                // Act
                actual = duration.asUnit("millisecond");
            });

            Assert.Equal(1500, actual);
        }

        function returnsNaNForInvalidUnit() {
            // Arrange
            var actual;
            mockAura(function() {
                var duration = new Aura.Utils.Duration(1.5, "day", mockMoment);

                // Act
                actual = duration.asUnit("invalidUnit");
            });

            Assert.True(isNaN(actual));
        }
    }

    [Fixture]
    function getUnit() {

        var mockMoment = {
            "duration": function(){}
        };

        [Fact]
        function getYears() {
            // Arrange
            var actual;
            mockAura(function() {
                var duration = new Aura.Utils.Duration(30, "month", mockMoment);

                // Act
                actual = duration.getUnit("year");
            });

            Assert.Equal(2, actual);
        }

        [Fact]
        function getMonths() {
            // Arrange
            var actual;
            mockAura(function() {
                var duration = new Aura.Utils.Duration(2, "year", mockMoment);

                // Act
                actual = duration.getUnit("month");
            });

            Assert.Equal(0, actual);
        }

        [Fact]
        function getDays() {
            // Arrange
            var actual;
            mockAura(function() {
                var duration = new Aura.Utils.Duration(60, "hour", mockMoment);

                // Act
                actual = duration.getUnit("day");
            });

            Assert.Equal(2, actual);
        }

        [Fact]
        function getHours() {
            // Arrange
            var actual;
            mockAura(function() {
                var duration = new Aura.Utils.Duration(30, "minute", mockMoment);

                // Act
                actual = duration.getUnit("hour");
            });

            Assert.Equal(0, actual);
        }

        [Fact]
        function getMinutes() {
            // Arrange
            var actual;
            mockAura(function() {
                var duration = new Aura.Utils.Duration(105, "second", mockMoment);

                // Act
                actual = duration.getUnit("minute");
            });

            Assert.Equal(1, actual);
        }

        [Fact]
        function getSeconds() {
            // Arrange
            var actual;
            mockAura(function() {
                var duration = new Aura.Utils.Duration(1500, "millisecond", mockMoment);

                // Act
                actual = duration.getUnit("second");
            });

            Assert.Equal(1, actual);
        }

        [Fact]
        function getMilliseconds() {
            // Arrange
            var actual;
            mockAura(function() {
                var duration = new Aura.Utils.Duration(1500, "millisecond", mockMoment);

                // Act
                actual = duration.getUnit("millisecond");
            });

            Assert.Equal(500, actual);
        }

        function returnsNaNForInvalidUnit() {
            // Arrange
            var actual;
            mockAura(function() {
                var duration = new Aura.Utils.Duration(1.5, "day", mockMoment);

                // Act
                actual = duration.getUnit("invalidUnit");
            });

            Assert.True(isNaN(actual));
        }
    }
}
