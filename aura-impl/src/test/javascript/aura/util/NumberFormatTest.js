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
 * Tests for the number format functions.
 */

[Fixture]
Test.Aura.Util.NumberFormatTest=function() {
    var auraMock=function(delegate){
        Mocks.GetMocks(Object.Global(),{
            exp: function() {},
            window: Object.Global(),
            Aura: {
                Utils: {}
            },
            $A: {
                log: function() {},
                util: {
                    isString : function(value) { return typeof value === 'string'; },
                    isFiniteNumber : function(value) { return typeof value === 'number' && isFinite(value); },
                    NumberFormat : {}
                }
            },
            "NumberFormat": function(){}
        })(function(){
            [Import("aura-impl/src/main/resources/aura/util/NumberFormat.js")]
            delegate();
        });
    };

    [Fixture]
    function formatForNumberFormat() {
        [Fact]
        function formatPositive() {
            var format = "0.###";
            var symbols = {"decimalSeparator": ".",
                           "groupingSeparator": ",",
                           "currency": "$",
                           "currencyCode": "USD",
                           "zeroDigit": "0" };
            var value = 1;
            var expected = "1";
            var result;

            auraMock(function() {
                var target = new Aura.Utils.NumberFormat(format, symbols);
                result = target.format(value);
            });
            Assert.Equal(expected, result);
        }

        [Fact]
        function formatZero() {
            var format = "0.##";
            var symbols = {"decimalSeparator": ".",
                           "groupingSeparator": ",",
                           "currency": "$",
                           "currencyCode": "USD",
                           "zeroDigit": "0" };
            var value = "0.00";
            var expected = "0";
            var result;

            auraMock(function() {
                var target = new Aura.Utils.NumberFormat(format, symbols);
                result = target.format(value);
            });
            Assert.Equal(expected, result);
        }

        [Fact]
        function formatPositiveWithPrecision() {
            var format = "0.00#";
            var symbols = {"decimalSeparator": ".",
                           "groupingSeparator": ",",
                           "currency": "$",
                           "currencyCode": "USD",
                           "zeroDigit": "0" };
            var value = 1;
            var expected = "1.00";
            var result;

            auraMock(function() {
                var target = new Aura.Utils.NumberFormat(format, symbols);
                result = target.format(value);
            });
            Assert.Equal(expected, result);
        }

        [Fact]
        function formatSmallPositive() {
            // Test for bug W-2545700
            // This failed.
            var format = "0.###";
            var symbols = {"decimalSeparator": ".",
                           "groupingSeparator": ",",
                           "currency": "$",
                           "currencyCode": "USD",
                           "zeroDigit": "0" };
            var value = 0.000001;
            var expected = "0";
            var result;

            auraMock(function() {
                var target = new Aura.Utils.NumberFormat(format, symbols);
                result = target.format(value);
            });
            Assert.Equal(expected, result);
        }

        [Fact]
        function formatSmallPositiveWithPrecision() {
            // Test for bug W-2545700
            // This failed.
            var format = "0.00#";
            var symbols = {"decimalSeparator": ".",
                           "groupingSeparator": ",",
                           "currency": "$",
                           "currencyCode": "USD",
                           "zeroDigit": "0" };
            var value = "0.00000001";
            var expected = "0.00";
            var result;

            auraMock(function() {
                var target = new Aura.Utils.NumberFormat(format, symbols);
                result = target.format(value);
            });
            Assert.Equal(expected, result);
        }

        [Fact]
        function formatSmallPositiveWithRoundup() {
            var format = "0.######";
            var symbols = {"decimalSeparator": ".",
                           "groupingSeparator": ",",
                           "currency": "$",
                           "currencyCode": "USD",
                           "zeroDigit": "0" };
            var value = "0.0000016";
            var expected = "0.000002";
            var result;

            auraMock(function() {
                var target = new Aura.Utils.NumberFormat(format, symbols);
                result = target.format(value);
            });
            Assert.Equal(expected, result);
        }

        [Fact]
        function formatNegativeWithFraction() {
            var format = "0.#####";
            var symbols = {"decimalSeparator": ".",
                           "groupingSeparator": ",",
                           "currency": "$",
                           "currencyCode": "USD",
                           "zeroDigit": "0" };
            var value = "-0.0000100222";
            var expected = "-0.00001";
            var result;

            auraMock(function() {
                var target = new Aura.Utils.NumberFormat(format, symbols);
                result = target.format(value);
            });
            Assert.Equal(expected, result);
        }

        [Fact]
        function formatWhenLeadingZerosLessThanMaxFractionDigits() {
            var format = "0.###";
            var symbols = {"decimalSeparator": ".",
                           "groupingSeparator": ",",
                           "currency": "$",
                           "currencyCode": "USD",
                           "zeroDigit": "0" };
            var value = "0.010";
            var expected = "0.01";
            var result;

            auraMock(function() {
                var target = new Aura.Utils.NumberFormat(format, symbols);
                result = target.format(value);
            });
            Assert.Equal(expected, result);
        }

        [Fact]
        function formatWhenLeadingZerosMoreThanMaxFractionDigits() {
            var format = "0.###";
            var symbols = {"decimalSeparator": ".",
                           "groupingSeparator": ",",
                           "currency": "$",
                           "currencyCode": "USD",
                           "zeroDigit": "0" };
            var value = "0.0001";
            var expected = "0";
            var result;

            auraMock(function() {
                var target = new Aura.Utils.NumberFormat(format, symbols);
                result = target.format(value);
            });
            Assert.Equal(expected, result);
        }

        [Fact]
        function formatWhenLeadingZerosMoreThanMinFractionDigits() {
            var format = "0.0";
            var symbols = {"decimalSeparator": ".",
                           "groupingSeparator": ",",
                           "currency": "$",
                           "currencyCode": "USD",
                           "zeroDigit": "0" };
            var value = "0.0001";
            var expected = "0.0";
            var result;

            auraMock(function() {
                var target = new Aura.Utils.NumberFormat(format, symbols);
                result = target.format(value);
            });
            Assert.Equal(expected, result);
        }

        [Fact]
        function formatWhenLeadingZerosLessThanMinFractionDigits() {
            var format = "0.000";
            var symbols = {"decimalSeparator": ".",
                           "groupingSeparator": ",",
                           "currency": "$",
                           "currencyCode": "USD",
                           "zeroDigit": "0" };
            var value = "-0.01";
            var expected = "-0.010";
            var result;

            auraMock(function() {
                var target = new Aura.Utils.NumberFormat(format, symbols);
                result = target.format(value);
            });
            Assert.Equal(expected, result);
        }
    }

    [Fixture]
    function formatForPercentFormat() {

        [Fact]
        function formatForPercentWithFractionDigits() {
            var format = ".00%";
            var symbols = {
                "decimalSeparator": ".",
                "groupingSeparator": ",",
                "zeroDigit": "0"
            };
            var value = "0.14571";
            var expected = "14.57%";
            var result;

            auraMock(function() {
                var target = new Aura.Utils.NumberFormat(format, symbols);
                result = target.format(value);
            });
            Assert.Equal(expected, result);
        }

        [Fact]
        function formatForPercentWithNegativeNumber() {
            var format = "#,##0%";
            var symbols = {
                "decimalSeparator": ".",
                "groupingSeparator": ",",
                "zeroDigit": "0"
            };
            var value = "-0.14571";
            var expected = "-15%";
            var result;

            auraMock(function() {
                var target = new Aura.Utils.NumberFormat(format, symbols);
                result = target.format(value);
            });
            Assert.Equal(expected, result);
        }

        [Fact]
        function formatForPercentWithRoundup() {
            var format = ".00%";
            var symbols = {
                "decimalSeparator": ".",
                "groupingSeparator": ",",
                "zeroDigit": "0"
            };
            var value = "0.14566";
            var expected = "14.57%";
            var result;

            auraMock(function() {
                var target = new Aura.Utils.NumberFormat(format, symbols);
                result = target.format(value);
            });
            Assert.Equal(expected, result);
        }

        [Fact]
        function formatForPercentWithLargeThanHundredPercent() {
            var format = "#,##0%";
            var symbols = {
                "decimalSeparator": ".",
                "groupingSeparator": ",",
                "zeroDigit": "0"
            };
            var value = "3.14559";
            var expected = "315%";
            var result;

            auraMock(function() {
                var target = new Aura.Utils.NumberFormat(format, symbols);
                result = target.format(value);
            });
            Assert.Equal(expected, result);
        }
    }

    [Fixture]
    function formatForCurrencyFormat() {

        [Fact]
        function formatForPercentWithFractionDigits() {
            var format = "¤#,##0.00";
            var symbols = {
                "decimalSeparator": ".",
                "groupingSeparator": ",",
                "currency": "$",
                "zeroDigit": "0"
            };
            var value = "126.341";
            var expected = "$126.34";
            var result;

            auraMock(function() {
                var target = new Aura.Utils.NumberFormat(format, symbols);
                result = target.format(value);
            });
            Assert.Equal(expected, result);
        }

        [Fact]
        function formatForPercentWithNegativeNumber() {
            var format = "¤#,##0.00";
            var symbols = {
                "decimalSeparator": ".",
                "groupingSeparator": ",",
                "currency": "$",
                "zeroDigit": "0"
            };
            var value = "-126.341";
            var expected = "-$126.34";
            var result;

            auraMock(function() {
                var target = new Aura.Utils.NumberFormat(format, symbols);
                result = target.format(value);
            });
            Assert.Equal(expected, result);
        }

        [Fact]
        function formatForPercentWithRoundup() {
            var format = "¤#,##0.00";
            var symbols = {
                "decimalSeparator": ".",
                "groupingSeparator": ",",
                "currency": "$",
                "zeroDigit": "0"
            };
            var value = "0.14566";
            var expected = "$0.15";
            var result;

            auraMock(function() {
                var target = new Aura.Utils.NumberFormat(format, symbols);
                result = target.format(value);
            });
            Assert.Equal(expected, result);
        }

        [Fact]
        function formatForPercentWithGroupSeparator() {
            var format = "¤#,##0.00";
            var symbols = {
                "decimalSeparator": ".",
                "groupingSeparator": ",",
                "currency": "$",
                "zeroDigit": "0"
            };
            var value = "123123123";
            var expected = "$123,123,123.00";
            var result;

            auraMock(function() {
                var target = new Aura.Utils.NumberFormat(format, symbols);
                result = target.format(value);
            });
            Assert.Equal(expected, result);
        }
    }

}
