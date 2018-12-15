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
/* global Test:false, Mocks:false, Import:false, Assert:false, Fact:false, Fixture:false, Data:false */
Function.RegisterNamespace("Test.Aura.Util");

/**
 * Tests for the number format functions.
 */
[Fixture]
Test.Aura.Util.NumberFormatTest = function() {
    var auraMock = function(delegate) {
        Mocks.GetMocks(Object.Global(), {
            exp: function() {},
            window: Object.Global(),
            Aura: {
                Utils: {}
            },
            $A: {
                log: function() {},
                util: {
                    isString : function(value) {
                        return typeof value === 'string';
                    },
                    isFiniteNumber : function(value) {
                        return (typeof value === 'number') && isFinite(value);
                    },
                    NumberFormat : {}
                }
            },
            "NumberFormat": function(){}
        })(function() {
            [Import("aura-impl/src/main/resources/aura/util/NumberFormat.js")];
            delegate();
        });
    };

    [Fixture]
    function formatForNumberFormat() {
        [Fact, Data({value: 1,    expected: "1"},
                    {value: "1",  expected: "1"},
                    {value: +1,  expected: "1"},
                    {value: "+1", expected: "1"})]
        function formatPositive(data) {
            var format = "0.###",
                symbols = {"decimalSeparator":  ".",
                           "groupingSeparator": ",",
                           "currency":          "$",
                           "currencyCode":      "USD",
                           "zeroDigit":         "0"},
                result;

            auraMock(function() {
                var target = new Aura.Utils.NumberFormat(format, symbols);
                result = target.format(data.value);
            });
            Assert.Equal(data.expected, result);
        }

        [Fact, Data({value: 1234567890.0987654321, pattern: "0.###", expected: "1234567890.099"},
                    {value: 1234567890.0987654321, pattern: "#0.###", expected: "1234567890.099"},
                    {value: 1234567890.0987654321, pattern: "##0.###", expected: "1234567890.099"},
                    {value: 1234567890.0987654321, pattern: "#,##0.###", expected: "1,234,567,890.099"},
                    {value: 1234567890.0987654321, pattern: "#,#0.###", expected: "12,34,56,78,90.099"},
                    {value: 1234567890.0987654321, pattern: "#,##,##0.###", expected: "1,23,45,67,890.099"},
                    {value: 1234567890.0987654321, pattern: "#,###,##,##0.###", expected: "12,345,67,890.099"},
                    {value: 1000000000.0987654321, pattern: "0.###", expected: "1000000000.099"},
                    {value: 1000000000.0987654321, pattern: "#0.###", expected: "1000000000.099"},
                    {value: 1000000000.0987654321, pattern: "##0.###", expected: "1000000000.099"},
                    {value: 1000000000.0987654321, pattern: "#,##0.###", expected: "1,000,000,000.099"},
                    {value: 1000000000.0987654321, pattern: "#,#0.###", expected: "10,00,00,00,00.099"},
                    {value: 1000000000.0987654321, pattern: "#,##,##0.###", expected: "1,00,00,00,000.099"},
                    {value: 1000000000.0987654321, pattern: "#,###,##,##0.###", expected: "10,000,00,000.099"},
                    {value: 0.0987654321, pattern: "0.###", expected: "0.099"},
                    {value: 0.0987654321, pattern: "#0.###", expected: "0.099"},
                    {value: 0.0987654321, pattern: "##0.###", expected: "0.099"},
                    {value: 0.0987654321, pattern: "#,##0.###", expected: "0.099"},
                    {value: 0.0987654321, pattern: "#,#0.###", expected: "0.099"},
                    {value: 0.0987654321, pattern: "#,##,##0.###", expected: "0.099"},
                    {value: 0.0987654321, pattern: "#,###,##,##0.###", expected: "0.099"},
                    {value: 1234.0987654321, pattern: "00000.###", expected: "01234.099"},
                    {value: 1234.0987654321, pattern: "#0000.###", expected: "1234.099"},
                    {value: 1234.0987654321, pattern: "##000.###", expected: "1234.099"},
                    {value: 1234.0987654321, pattern: "#,000.###", expected: "1,234.099"},
                    {value: 1234.0987654321, pattern: "#0,000.###", expected: "1,234.099"},
                    {value: 1234.0987654321, pattern: "#00,00.###", expected: "12,34.099"},
                    {value: 123.0987654321, pattern: "#0,000.###", expected: "0,123.099"},
                    {value: 123.0987654321, pattern: "#00,00.###", expected: "01,23.099"}
                    )]
        function formatIntegerGroups(data) {
            var result, symbols = {
                "decimalSeparator": ".",
                "groupingSeparator": ",",
                "currency": "$",
                "currencyCode": "USD",
                "zeroDigit": "0"
            };
            auraMock(function () {
                result = new Aura.Utils.NumberFormat(data.pattern, symbols).format(data.value);
            });
            Assert.Equal(data.expected, result);
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

        [Fact, Data({value: "0.0000016", expected: "0.000002"},
                    {value: "0.0000015", expected: "0.000002"},
                    {value: "0.0000014", expected: "0.000001"})]
        function formatSmallPositiveWithRoundup(data) {
            var format = "0.######",
                symbols = {"decimalSeparator": ".",
                           "groupingSeparator": ",",
                           "currency": "$",
                           "currencyCode": "USD",
                           "zeroDigit": "0" },
                result;

            auraMock(function() {
                var target = new Aura.Utils.NumberFormat(format, symbols);
                result = target.format(data.value);
            });
            Assert.Equal(data.expected, result);
        }
        
        [Fact]
        function formatLargeFractionDigits() {
            var format = "#,##0.####################",
                symbols = {"decimalSeparator": ".",
                           "groupingSeparator": ",",
                           "zeroDigit": "0" 
                },
                value = "123456789.123456",
                expected = "123,456,789.123456",
                result;

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
        
        [Fact, Data({value: 4.6567654211224e+6,   expected: "465,676,542.1122%"},
                    {value: "4.6567654211224e+6", expected: "465,676,542.1122%"},
                    {value: 4.1e+6,               expected: "410,000,000.0000%"},
                    {value: "4.1e+6",             expected: "410,000,000.0000%"})]
        function formatWhenNumberIsExponentialPositive(data) {
            var format = "#,##0.0000%",
                symbols = {
                    "decimalSeparator":  ".",
                    "groupingSeparator": ",",
                    "zeroDigit":         "0"
                },
                result;

            auraMock(function() {
                var target = new Aura.Utils.NumberFormat(format, symbols);
                result = target.format(data.value);
            });
            Assert.Equal(data.expected, result);
        }
        
        [Fact, Data({value: 4.656e-6,   expected: "0.0005%",                format: "#,##0.0000%"},
                    {value: "4.656e-6", expected: "0.0005%",                format: "#,##0.0000%"},
                    {value: 4.1e-6,     expected: "0.0004100%",             format: "#,##0.0000000%"},
                    {value: "4.1e-6",   expected: "0.0004100%",             format: "#,##0.0000000%"},
                    {value: "4.1e-20",  expected: "0.0000000000000000041%", format: "#,##0.0000000000000000000%"},
                    {value: "4.5e-20",  expected: "0.000000000000000005%",  format: "#,##0.000000000000000000%"})]
        function formatWhenNumberIsExponentialNegative(data) {
            var symbols = {
                    "decimalSeparator":  ".",
                    "groupingSeparator": ",",
                    "zeroDigit":         "0"
                },
                result;

            auraMock(function() {
                var target = new Aura.Utils.NumberFormat(data.format, symbols);
                result = target.format(data.value);
            });
            Assert.Equal(data.expected, result);
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
        
        [Fact]
        function formatWhenNumberIsExponentialPositive() {
            var format = "¤#,##0.0000",
                symbols = {
                    "decimalSeparator":  ".",
                    "groupingSeparator": ",",
                    "currency":          "$",
                    "currencyCode":      "USD",
                    "zeroDigit":         "0"
                },
                value = 4.6567654211224e+6,
                expected = "$4,656,765.4211",
                result;

            auraMock(function() {
                var target = new Aura.Utils.NumberFormat(format, symbols);
                result = target.format(value);
            });
            Assert.Equal(expected, result);
        }
        
        [Fact]
        function formatWhenNumberIsExponentialPositiveAsString() {
            var format = "¤#,##0.0000",
                symbols = {
                    "decimalSeparator":  ".",
                    "groupingSeparator": ",",
                    "currency":          "$",
                    "currencyCode":      "USD",
                    "zeroDigit":         "0"
                },
                value = "4.6567654211224e+6",
                expected = "$4,656,765.4211",
                result;

            auraMock(function() {
                var target = new Aura.Utils.NumberFormat(format, symbols);
                result = target.format(value);
            });
            Assert.Equal(expected, result);
        }
        
        [Fact]
        function formatWhenNumberIsExponentialNegative() {
            var format = "¤#,##0.0000",
                symbols = {
                    "decimalSeparator":  ".",
                    "groupingSeparator": ",",
                    "currency":          "$",
                    "currencyCode":      "USD",
                    "zeroDigit":         "0"
                },
                value = 4.656e-6,
                expected = "$0.0000",
                result;

            auraMock(function() {
                var target = new Aura.Utils.NumberFormat(format, symbols);
                result = target.format(value);
            });
            Assert.Equal(expected, result);
        }
        
        [Fact]
        function formatWhenNumberIsExponentialNegativeAsString() {
            var format = "¤#,##0.0000",
                symbols = {
                    "decimalSeparator":  ".",
                    "groupingSeparator": ",",
                    "currency":          "$",
                    "currencyCode":      "USD",
                    "zeroDigit":         "0"
                },
                value = "4.656e-6",
                expected = "$0.0000",
                result;

            auraMock(function() {
                var target = new Aura.Utils.NumberFormat(format, symbols);
                result = target.format(value);
            });
            Assert.Equal(expected, result);
        }
    }
};