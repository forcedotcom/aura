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


Function.RegisterNamespace("Test.inputNumberLibrary");


[Fixture]
Test.inputNumberLibrary = function () {
    var EMPTY_STRING = '';
    var library;
    ImportJson('aura-components/src/main/components/ui/inputNumberLibrary/number.js', function (path,result) {
        library = result();
    });

    var mockAura = Mocks.GetMock(Object.Global(),"$A",{
        util:{
            isNumber : function (number) {
                return  typeof number === 'number';
            },
            isUndefinedOrNull : function (value) {
                return typeof value === 'undefined' || value === null;
            }
        },
        localizationService : {
            getDefaultNumberFormat: function () {
                return {
                    format: function () {
                        return '2,545.00'
                    }
                }
            }
        },
        get : function (attr) {
            var attrs = { '$Locale.decimal' : '.', '$Locale.currency' : '$' };
            return attrs[attr];
        }
    });


    [Fixture]
    function unFormatNumber () {

        var mockLocaleEurope = Mocks.GetMock(Object.Global(),"$A",{
            get : function (attr) {
                var attrs = { '$Locale.decimal' : ',', '$Locale.currency' : '€' };
                return attrs[attr];
            },
            util:{
                isNumber : function (number) {
                    return  typeof number === 'number';
                },
                isUndefinedOrNull : function (value) {
                    return typeof value === 'undefined' || value === null;
                }
            }
        })

        [Fact]
        function unFormatNumberNumber() {
            mockAura(function () {
                var unFormatted = library.unFormatNumber(1234);
                Assert.Equal(1234,unFormatted);
            })
        }

        [Fact]
        function unFormatNumber_GoodFormattedString() {
            mockAura(function () {
                var unFormatted = library.unFormatNumber('1,234,567.89');
                Assert.Equal(1234567.89, unFormatted);
            })
        }

        [Fact]
        function unFormatNumber_GoodFormattedStringM() {
            mockAura(function () {
                var unFormatted = library.unFormatNumber('1,234,567.89m');
                Assert.Equal(1234567890000, unFormatted);
            })
        }

        [Fact]
        function unFormatNumber_GoodFormattedStringB() {
            mockAura(function () {
                var unFormatted = library.unFormatNumber('1,234,567.89b');
                Assert.Equal(1234567890000000, unFormatted);
            })
        }

        [Fact]
        function unFormatNumber_GoodFormattedStringT() {
            mockAura(function () {
                var unFormatted = library.unFormatNumber('1,234,567.89t');
                Assert.Equal(1234567890000000000, unFormatted);
            })
        }

        [Fact]
        function unFormatNumber_Shortcut_K() {
            mockAura(function () {
                var unFormatted = library.unFormatNumber('12.8k');
                Assert.Equal(12800,unFormatted);
            })
        }

        [Fact]
        function unFormatNumber_Shortcut_dot1K() {
            mockAura(function () {
                var unFormatted = library.unFormatNumber('.1k');
                Assert.Equal(100,unFormatted);
            })
        }

        [Fact]
        function unFormatNumber_Shortcut_dot0001K() {
            mockAura(function () {
                var unFormatted = library.unFormatNumber('0.00001m');
                Assert.Equal(10, unFormatted);
            })
        }
        
        [Fact]
        function unFormatNumber_Shortcut_dot00001K() {
            mockAura(function () {
                var unFormatted = library.unFormatNumber('0.00000000001m');
                Assert.Equal(0.00001, unFormatted);
            })
        }

        [Fact]
        function unFormatNumber_Shortcut_41K() {
            mockAura(function () {
                var unFormatted = library.unFormatNumber('4.1k');
                Assert.Equal(4100,unFormatted);
            })
        }

        [Fact]
        function unFormatNumber_Shortcut_4K() {
            mockAura(function () {
                var unFormatted = library.unFormatNumber('4k');
                Assert.Equal(4000,unFormatted);
            })
        }
        
        [Fact]
        function unFormatNumber_Shortcut_4111111K() {
            mockAura(function () {
                var unFormatted = library.unFormatNumber('4.111111k');
                Assert.Equal(4111.111,unFormatted);

            })
        }
        
        [Fact]
        function unFormatNumber_Shortcut_4111111111111111K() {
            mockAura(function () {
                var unFormatted = library.unFormatNumber('4.111111111111111111k');
                Assert.Equal(4111.11111111111, unFormatted);
            })
        }
        [Fact]
        function unFormatNumber_Shortcut_N4111111111111111K() {
            mockAura(function () {
                var unFormatted = library.unFormatNumber('-4.111111111111111111k');
                Assert.Equal(-4111.11111111111, unFormatted);
            })
        }

        [Fact]
        function unFormatNumber_Shortcut_M() {
            mockAura(function () {
                var unFormatted = library.unFormatNumber('12.8m');
                Assert.Equal(12800000, unFormatted);
            })
        }

        [Fact]
        function unFormatNumber_Shortcut_PLUSM() {
            mockAura(function () {
                var unFormatted = library.unFormatNumber('+12.8m');
                Assert.Equal(12800000, unFormatted);
            })
        }

        [Fact]
        function unFormatNumber_Shortcut_NM() {
            mockAura(function () {
                var unFormatted = library.unFormatNumber('-12.8m');
                Assert.Equal(-12800000, unFormatted);
            })
        }

        [Fact]
        function unFormatNumber_Shortcut_1M() {
            mockAura(function () {
                var unFormatted = library.unFormatNumber('1m');
                Assert.Equal(1000000, unFormatted);
            })
        }
        

        [Fact]
        function unFormatNumber_Shortcut_41M() {
            mockAura(function () {
                var unFormatted = library.unFormatNumber('4.1m');
                Assert.Equal(4100000, unFormatted);
            })
        }

        [Fact]
        function unFormatNumber_Shortcut_B() {
            mockAura(function () {
                var unFormatted = library.unFormatNumber('12.8b');
                Assert.Equal(12800000000,unFormatted);
            })
        }

        [Fact]
        function unFormatNumber_Shortcut_41B() {
            mockAura(function () {
                var unFormatted = library.unFormatNumber('4.1b');
                Assert.Equal(4100000000,unFormatted);
            })
        }

        [Fact]
        function unFormatNumber_Shortcut_1B() {
            mockAura(function () {
                var unFormatted = library.unFormatNumber('1b');
                Assert.Equal(1000000000,unFormatted);
            })
        }

        [Fact]
        function unFormatNumber_Shortcut_41987989898989989899898B() {
            mockAura(function () {
                var unFormatted = library.unFormatNumber('4.1987989898989989899898b');
                Assert.Equal(4198798989.8989989899898,unFormatted);
            })
        }

        [Fact]
        function unFormatNumber_Shortcut_T() {
            mockAura(function () {
                var unFormatted = library.unFormatNumber('12.8t');
                Assert.Equal(12800000000000, unFormatted);
            })
        }

        [Fact]
        function unFormatNumber_Shortcut_1T() {
            mockAura(function () {
                var unFormatted = library.unFormatNumber('1t');
                Assert.Equal(1000000000000, unFormatted);
            })
        }

        [Fact]
        function unFormatNumber_Shortcut_41T() {
            mockAura(function () {
                var unFormatted = library.unFormatNumber('4.1t');
                Assert.Equal(4100000000000, unFormatted);
            })
        }

        [Fact]
        function unFormatNumber_LocaleEuro() {
            mockLocaleEurope(function () {
                var unFormatted = library.unFormatNumber('€12,8b');
                Assert.Equal(12800000000, unFormatted);
            })
        }

        [Fact]
        function unFormatNumber_LocaleEuro41() {
            mockLocaleEurope(function () {
                var unFormatted = library.unFormatNumber('€4,1b');
                Assert.Equal(4100000000, unFormatted);
            })
        }
    }

    [Fixture]
    function isNumberMethod () {
        [Fact]
        function isNumberNumber() {
            mockAura(function () {
                Assert.True(library.isNumber(123.56));
            });
        }

        [Fact]
        function isNumberString() {
            mockAura(function () {
                Assert.False(library.isNumber('123.45'));
            });
        }

        [Fact]
        function isNumberUndefined() {
            mockAura(function () {
                Assert.False(library.isNumber(undefined));
            });
        }

        [Fact]
        function isNumberNull() {
            mockAura(function () {
                Assert.False(library.isNumber(null));
            });
        }
    }

    [Fixture]
    function formatNumberMethod () {
        [Fact]
        function formatNumber () {
            mockAura(function () {
                var formatted = library.formatNumber(2545,'#,##0.00');
                Assert.Equal('2,545.00',formatted);
            })
        }
        [Fact]
        function formatNumberUndefined () {
            mockAura(function () {
                var formatted = library.formatNumber(undefined,'#,##0.00');
                Assert.Equal(EMPTY_STRING,formatted);
            })
        }
        [Fact]
        function formatNumberNull () {
            mockAura(function () {
                var formatted = library.formatNumber(null,'#,##0.00');
                Assert.Equal(EMPTY_STRING,formatted);
            })
        }
    }

};