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
                Assert.Equal(1234567.89,unFormatted);
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
        function unFormatNumber_Shortcut_M() {
            mockAura(function () {
                var unFormatted = library.unFormatNumber('12.8m');
                Assert.Equal(12800000,unFormatted);
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
        function unFormatNumber_Shortcut_T() {
            mockAura(function () {
                var unFormatted = library.unFormatNumber('12.8t');
                Assert.Equal(12800000000000,unFormatted);
            })
        }

        [Fact]
        function unFormatNumber_LocaleEuro() {
            mockLocaleEurope(function () {
                var unFormatted = library.unFormatNumber('€12,8b');
                Assert.Equal(12800000000,unFormatted);
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