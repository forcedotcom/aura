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
Function.RegisterNamespace("Test.Aura");

[Fixture]
Test.Aura.AuraLocalizationServiceTest = function() {
    var Aura = {
        Services: {
        }
    };

    // Mock the exp() function defined in Aura.js, this is originally used for exposing members using a export.js file
    Mocks.GetMocks(Object.Global(), {
        "Aura": Aura,
        "AuraLocalizationService":function(){}
    })(function() {
        [Import("aura-impl/src/main/resources/aura/AuraLocalizationService.js")]
    });

    var targetService = new Aura.Services.AuraLocalizationService();

    var targetDate = "07/10/2013";
    var targetDateFormat = "DD-MM-YYYY";
    var targetDateTime = "07/10/2013 12:00:00";
    var targetDateTimeFormat = "DD-MM-YYYY hh:mm:ss";
    var targetTime = "12:00:00";
    var targetTimeFormat = "hh:mm:ss";
    var targetLocale = "en";
    var targetTimezone = "PST";
    var targetNumber = 101;
    var targetPercent = '10%';
    var targetCurrency = '$100';
    var targetNumberFormat = "nFormat";
    var targetPercentFormat = "pFormat";
    var targetCurrencyFormat = "cFormat";

    var mockUtil = Mocks.GetMock(Object.Global(), "$A", {
        assert: function () {},
        auraError: function() {},
        get:function(value){
            if(value == "$Locale.dateFormat") return targetDateFormat;
            if(value == "$Locale.datetimeFormat") return targetDateTimeFormat;
            if(value == "$Locale.timeFormat") return targetTimeFormat;
            if(value == "$Locale.timezone") return targetTimezone;
            if(value == "$Locale.numberFormat") return targetNumberFormat;
            if(value == "$Locale.percentFormat") return targetPercentFormat;
            if(value == "$Locale.currencyFormat") return targetCurrencyFormat;
        },
        clientService: {
            loadClientLibrary: function (name, callback) {
                callback();
            }
        },
        lockerService: {
            instanceOf: function(value, type) {
                return value instanceof type;
            }
        },
        logger: {
            reportError: function(){}
        },
        warning: function(){}
    });

    var mockInvalidDate = {
        isValid:function(){
            return false;
        }
    };

    var mockDate = {
        isValid:function(){
            return true;
        },
        toString:function(){
            return targetDate;
        }
    };

    var mockDateTime = {
        isValid:function(){
            return true;
        },
        toString:function(){
            return targetDateTime;
        },
        toDate:function(){
            return targetDateTime;
        }
    };

    var mockTime = {
        isValid:function(){
            return true;
        },
        toString:function(){
            return targetTime;
        }
    };

    var mockMomentConstructor = Mocks.GetMock(Object.Global(), "moment", function(value, format, locale){
        if(value == mockDate) return mockDate;
        if(value == mockDateTime) return mockDateTime;
        if(value == mockTime) return mockTime;
        return mockInvalidDate;
    });

    var mockMoment = Mocks.GetMock(Object.Global(), "moment", {
        utc:function(value){
            if(value == mockDate) return mockDate;
            if(value == mockDateTime) return mockDateTime;
            if(value == mockTime) return mockTime;
            return mockInvalidDate;
        },
        localeData:function(value){
            if(value == targetLocale || value == "zh-cn") return true;
            return false;
        }
    });

    var mockGetNormalizedFormat = Mocks.GetMock(targetService, "getNormalizedFormat", function(format){
        return format;
    });

    var mockGetAvailableMomentLocale = Mocks.GetMock(targetService, "getAvailableMomentLocale", function(locale){
        return locale;
    });

    [Fixture]
    function displayDuration(){

        var targetNoSuffix = "noSuffix";
        var targetDuration={
            humanize:function(noSuffix){
                if(noSuffix == targetNoSuffix)return true;
            },
            asDays:function(){
                return "365";
            },
            asHours:function(){
                return "24";
            },
            asMilliseconds:function(){
                return "3600000";
            },
            asMinutes:function(){
                return "60";
            },
            asMonths:function(){
                return "12";
            },
            asSeconds:function(){
                return "3600";
            },
            asYears:function(){
                return "2013";
            },
            days:function(){
                return "365";
            },
            hours:function(){
                return "24";
            },
            milliseconds:function(){
                return "3600000";
            },
            minutes:function(){
                return "60";
            },
            months:function(){
                return "12";
            },
            seconds:function(){
                return "3600";
            },
            years:function(){
                return "2013";
            }
        };

        [Fact]
        function displayDuration(){
            // Arrange
            var expected = true;
            var actual;

            // Act
            actual = targetService.displayDuration(targetDuration, targetNoSuffix);

            // Assert
            Assert.Equal(expected, actual);
        }

        [Fact]
        function displayDurationInDays(){
            // Arrange
            var expected = "365";
            var actual;

            // Act
            actual = targetService.displayDurationInDays(targetDuration);

            // Assert
            Assert.Equal(expected, actual);
        }

        [Fact]
        function displayDurationInHours(){
            // Arrange
            var expected = "24";
            var actual;

            // Act
            actual = targetService.displayDurationInHours(targetDuration);

            // Assert
            Assert.Equal(expected, actual);
        }

        [Fact]
        function displayDurationInMilliseconds(){
            // Arrange
            var expected = "3600000";
            var actual;

            // Act
            actual = targetService.displayDurationInMilliseconds(targetDuration);

            // Assert
            Assert.Equal(expected, actual);
        }

        [Fact]
        function displayDurationInMinutes(){
            // Arrange
            var expected = "60";
            var actual;

            // Act
            actual = targetService.displayDurationInMinutes(targetDuration);

            // Assert
            Assert.Equal(expected, actual);
        }

        [Fact]
        function displayDurationInMonths(){
            // Arrange
            var expected = "12";
            var actual;

            // Act
            actual = targetService.displayDurationInMonths(targetDuration);

            // Assert
            Assert.Equal(expected, actual);
        }

        [Fact]
        function displayDurationInSeconds(){
            // Arrange
            var expected = "3600";
            var actual;

            // Act
            actual = targetService.displayDurationInSeconds(targetDuration);

            // Assert
            Assert.Equal(expected, actual);
        }

        [Fact]
        function displayDurationInYears(){
            // Arrange
            var expected = "2013";
            var actual;

            // Act
            actual = targetService.displayDurationInYears(targetDuration);

            // Assert
            Assert.Equal(expected, actual);
        }

        [Fact]
        function getDaysInDuration(){
            // Arrange
            var expected = "365";
            var actual;

            // Act
            actual = targetService.getDaysInDuration(targetDuration);

            // Assert
            Assert.Equal(expected, actual);
        }

        [Fact]
        function getHoursInDuration(){
            // Arrange
            var expected = "24";
            var actual;

            // Act
            actual = targetService.getHoursInDuration(targetDuration);

            // Assert
            Assert.Equal(expected, actual);
        }

        [Fact]
        function getMillisecondsInDuration(){
            // Arrange
            var expected = "3600000";
            var actual;

            // Act
            actual = targetService.getMillisecondsInDuration(targetDuration);

            // Assert
            Assert.Equal(expected, actual);
        }

        [Fact]
        function getMinutesInDuration(){
            // Arrange
            var expected = "60";
            var actual;

            // Act
            actual = targetService.getMinutesInDuration(targetDuration);

            // Assert
            Assert.Equal(expected, actual);
        }

        [Fact]
        function getMonthsInDuration(){
            // Arrange
            var expected = "12";
            var actual;

            // Act
            actual = targetService.getMonthsInDuration(targetDuration);

            // Assert
            Assert.Equal(expected, actual);
        }

        [Fact]
        function getSecondsInDuration(){
            // Arrange
            var expected = "3600";
            var actual;

            // Act
            actual = targetService.getSecondsInDuration(targetDuration);

            // Assert
            Assert.Equal(expected, actual);
        }

        [Fact]
        function getYearsInDuration(){
            // Arrange
            var expected = "2013";
            var actual;

            // Act
            actual = targetService.getYearsInDuration(targetDuration);

            // Assert
            Assert.Equal(expected, actual);
        }
    }

    [Fixture]
    function duration(){

        var targetNum = "Num";
        var targetUnit = "Unit";
        var mockMoment = Mocks.GetMock(Object.Global(), 'moment',{
            duration:function(num, unit){
                if(unit){
                    if(num == targetNum && unit == targetUnit)return "With Unit";
                }
                else{
                    if(num == targetNum)return "Without Unit";
                }
            }
        });

        [Fact]
        function durationWithoutUnit(){
            // Arrange
            var expected = "Without Unit";
            var actual;

            // Act
            mockMoment(function(){
                actual = targetService.duration(targetNum, undefined);
            });

            // Assert
            Assert.Equal(expected, actual);
        }

        [Fact]
        function durationWithUnit(){
            // Arrange
            var expected = "With Unit";
            var actual;

            // Act
            mockMoment(function(){
                actual = targetService.duration(targetNum, targetUnit);
            });

            // Assert
            Assert.Equal(expected, actual);
        }
    }

    [Fixture]
    function DateLimits(){

        var targetDate = "date";
        var targetUnit = "Unit";

        var mockMomentConstr = Mocks.GetMock(Object.Global(), "moment", function(date){
            if(date == targetDate)return mockDuration;
        });

        var mockDuration={
            endOf:function(unit){
                if(unit == targetUnit) {
                    return {
                        toDate:function(){
                            return "endOf";
                        }
                    };
                }
            },
            startOf:function(unit){
                if(unit == targetUnit) {
                    return {
                        toDate:function(){
                            return "startOf";
                        }
                    };
                }
            }
        };

        [Fact]
        function endOf(){
            // Arrange
            var expected = "endOf";
            var actual;

            // Act
            mockMomentConstr(function(){
                actual = targetService.endOf(targetDate, targetUnit);
            });

            // Assert
            Assert.Equal(expected, actual);
        }

        [Fact]
        function startOf(){
            // Arrange
            var expected = "startOf";
            var actual;

            // Act
            mockMomentConstr(function(){
                actual = targetService.startOf(targetDate, targetUnit);
            });

            // Assert
            Assert.Equal(expected, actual);
        }
    }

    [Fixture]
    function formatDate(){

        [Fact]
        function CallsDisplayDateTimeWithMomentDateForValidDate(){
            // Arrange
            var actual;
            var targetService = new Aura.Services.AuraLocalizationService();
            targetService.displayDateTime = function (date, format, locale) {
                actual = date;
            }

            var momentDate = {
                isValid: function() {
                    return true;
                }
            };

            var mockMoment = Mocks.GetMock(Object.Global(), "moment", function(){
                return momentDate;
            });

             var mockUtil = Mocks.GetMock(Object.Global(), "$A", {
                util: {
                    isUndefined: function(value) { return value === undefined; }
                },
                get: function(value) {}
            });

            // Act
            mockMoment(function(){
                mockUtil(function(){
                    targetService.formatDate("date", "format");
                });
            });

            // Assert
            Assert.Equal(momentDate, actual);
        }

        [Fact]
        function UsesDateFormatInLocaleProviderAsDefaultFormat(){
            // Arrange
            var actual;
            var targetService = new Aura.Services.AuraLocalizationService();
            targetService.displayDateTime = function (date, format, locale) {
                actual = format;
            }

            var momentDate = {
                isValid: function() {
                    return true;
                }
            };

            var mockMoment = Mocks.GetMock(Object.Global(), "moment", function(){
                return momentDate;
            });

            var expected = "format";
            var mockUtil = Mocks.GetMock(Object.Global(), "$A", {
                util: {
                    isUndefined: function(value) { return value === undefined; }
                },
                get: function(value){
                    if(value == "$Locale.dateFormat") return expected;
                }
            });

            // Act
            mockMoment(function(){
                mockUtil(function(){
                    targetService.formatDate("date");
                });
            });


            // Assert
            Assert.Equal(expected, actual);
        }

        [Fact]
        function UsesLocaleInLocaleProvider(){
            // Arrange
            var actual;
            var targetService = new Aura.Services.AuraLocalizationService();
            targetService.displayDateTime = function (date, format, locale) {
                actual = locale;
            }

            var momentDate = {
                isValid: function() {
                    return true;
                }
            };

            var mockMoment = Mocks.GetMock(Object.Global(), "moment", function(){
                return momentDate;
            });

            var expected = "locale";
            var mockUtil = Mocks.GetMock(Object.Global(), "$A", {
                util: {
                    isUndefined: function(value) { return value === undefined; }
                },
                get: function(value){
                    if(value == "$Locale.langLocale") return expected;
                }
            });

            // Act
            mockMoment(function(){
                mockUtil(function(){
                    targetService.formatDate("date", "format");
                });
            });


            // Assert
            Assert.Equal(expected, actual);
        }
    }

    [Fixture]
    function formatDateUTC(){

        [Fact]
        function CallsDisplayDateTimeWithMomentDateForValidDate(){
            // Arrange
            var actual;
            var targetService = new Aura.Services.AuraLocalizationService();
            targetService.displayDateTime = function (date, format, locale) {
                actual = date;
            }

            var momentDate = {
                isValid: function() {
                    return true;
                }
            };

            var mockMoment = Mocks.GetMock(Object.Global(), "moment", {
                utc: function() {
                    return momentDate;
                }
            });

             var mockUtil = Mocks.GetMock(Object.Global(), "$A", {
                util: {
                    isUndefined: function(value) { return value === undefined; }
                },
                get: function(value) {}
            });

            // Act
            mockMoment(function(){
                mockUtil(function(){
                    targetService.formatDateUTC("date", "format");
                });
            });

            // Assert
            Assert.Equal(momentDate, actual);
        }

        [Fact]
        function UsesDateFormatInLocaleProviderAsDefaultFormat(){
            // Arrange
            var actual;
            var targetService = new Aura.Services.AuraLocalizationService();
            targetService.displayDateTime = function (date, format, locale) {
                actual = format;
            }

            var momentDate = {
                isValid: function() {
                    return true;
                }
            };

            var mockMoment = Mocks.GetMock(Object.Global(), "moment", {
                utc: function() {
                    return momentDate;
                }
            });

            var expected = "format";
            var mockUtil = Mocks.GetMock(Object.Global(), "$A", {
                util: {
                    isUndefined: function(value) { return value === undefined; }
                },
                get: function(value){
                    if(value == "$Locale.dateFormat") return expected;
                }
            });

            // Act
            mockMoment(function(){
                mockUtil(function(){
                    targetService.formatDateUTC("date");
                });
            });


            // Assert
            Assert.Equal(expected, actual);
        }

        [Fact]
        function UsesLocaleInLocaleProvider(){
            // Arrange
            var actual;
            var targetService = new Aura.Services.AuraLocalizationService();
            targetService.displayDateTime = function (date, format, locale) {
                actual = locale;
            }

            var momentDate = {
                isValid: function() {
                    return true;
                }
            };

            var mockMoment = Mocks.GetMock(Object.Global(), "moment", {
                utc: function() {
                    return momentDate;
                }
            });

            var expected = "locale";
            var mockUtil = Mocks.GetMock(Object.Global(), "$A", {
                util: {
                    isUndefined: function(value) { return value === undefined; }
                },
                get: function(value){
                    if(value == "$Locale.langLocale") return expected;
                }
            });

            // Act
            mockMoment(function(){
                mockUtil(function(){
                    targetService.formatDateUTC("date", "format");
                });
            });


            // Assert
            Assert.Equal(expected, actual);
        }
    }

    [Fixture]
    function formatDateTime(){

        [Fact]
        function CallsDisplayDateTimeWithMomentDateForValidDate(){
            // Arrange
            var actual;
            var targetService = new Aura.Services.AuraLocalizationService();
            targetService.displayDateTime = function (date, format, locale) {
                actual = date;
            }

            var momentDate = {
                isValid: function() {
                    return true;
                }
            };

            var mockMoment = Mocks.GetMock(Object.Global(), "moment", function(){
                return momentDate;
            });

             var mockUtil = Mocks.GetMock(Object.Global(), "$A", {
                util: {
                    isUndefined: function(value) { return value === undefined; }
                },
                get: function(value) {}
            });

            // Act
            mockMoment(function(){
                mockUtil(function(){
                    targetService.formatDateTime("date", "format");
                });
            });

            // Assert
            Assert.Equal(momentDate, actual);
        }

        [Fact]
        function UsesDateTimeFormatInLocaleProviderAsDefaultFormat(){
            // Arrange
            var actual;
            var targetService = new Aura.Services.AuraLocalizationService();
            targetService.displayDateTime = function (date, format, locale) {
                actual = format;
            }

            var momentDate = {
                isValid: function() {
                    return true;
                }
            };

            var mockMoment = Mocks.GetMock(Object.Global(), "moment", function(){
                return momentDate;
            });

            var expected = "format";
            var mockUtil = Mocks.GetMock(Object.Global(), "$A", {
                util: {
                    isUndefined: function(value) { return value === undefined; }
                },
                get: function(value){
                    if(value == "$Locale.datetimeFormat") return expected;
                }
            });

            // Act
            mockMoment(function(){
                mockUtil(function(){
                    targetService.formatDateTime("date");
                });
            });


            // Assert
            Assert.Equal(expected, actual);
        }

        [Fact]
        function UsesLocaleInLocaleProvider(){
            // Arrange
            var actual;
            var targetService = new Aura.Services.AuraLocalizationService();
            targetService.displayDateTime = function (date, format, locale) {
                actual = locale;
            }

            var momentDate = {
                isValid: function() {
                    return true;
                }
            };

            var mockMoment = Mocks.GetMock(Object.Global(), "moment", function(){
                return momentDate;
            });

            var expected = "locale";
            var mockUtil = Mocks.GetMock(Object.Global(), "$A", {
                util: {
                    isUndefined: function(value) { return value === undefined; }
                },
                get: function(value){
                    if(value == "$Locale.langLocale") return expected;
                }
            });

            // Act
            mockMoment(function(){
                mockUtil(function(){
                    targetService.formatDateTime("date", "format");
                });
            });


            // Assert
            Assert.Equal(expected, actual);
        }
    }

    [Fixture]
    function formatDateTimeUTC(){

        [Fact]
        function CallsDisplayDateTimeWithMomentDateForValidDate(){
            // Arrange
            var actual;
            var targetService = new Aura.Services.AuraLocalizationService();
            targetService.displayDateTime = function (date, format, locale) {
                actual = date;
            }

            var momentDate = {
                isValid: function() {
                    return true;
                }
            };

            var mockMoment = Mocks.GetMock(Object.Global(), "moment", {
                utc: function() {
                    return momentDate;
                }
            });

             var mockUtil = Mocks.GetMock(Object.Global(), "$A", {
                util: {
                    isUndefined: function(value) { return value === undefined; }
                },
                get: function(value) {}
            });

            // Act
            mockMoment(function(){
                mockUtil(function(){
                    targetService.formatDateTimeUTC("date", "format");
                });
            });

            // Assert
            Assert.Equal(momentDate, actual);
        }

        [Fact]
        function UsesDateTimeFormatInLocaleProviderAsDefaultFormat(){
            // Arrange
            var actual;
            var targetService = new Aura.Services.AuraLocalizationService();
            targetService.displayDateTime = function (date, format, locale) {
                actual = format;
            }

            var momentDate = {
                isValid: function() {
                    return true;
                }
            };

            var mockMoment = Mocks.GetMock(Object.Global(), "moment", {
                utc: function() {
                    return momentDate;
                }
            });

            var expected = "format";
            var mockUtil = Mocks.GetMock(Object.Global(), "$A", {
                util: {
                    isUndefined: function(value) { return value === undefined; }
                },
                get: function(value){
                    if(value == "$Locale.datetimeFormat") return expected;
                }
            });

            // Act
            mockMoment(function(){
                mockUtil(function(){
                    targetService.formatDateTimeUTC("date");
                });
            });


            // Assert
            Assert.Equal(expected, actual);
        }

        [Fact]
        function UsesLocaleInLocaleProvider(){
            // Arrange
            var actual;
            var targetService = new Aura.Services.AuraLocalizationService();
            targetService.displayDateTime = function (date, format, locale) {
                actual = locale;
            }

            var momentDate = {
                isValid: function() {
                    return true;
                }
            };

            var mockMoment = Mocks.GetMock(Object.Global(), "moment", {
                utc: function() {
                    return momentDate;
                }
            });

            var expected = "locale";
            var mockUtil = Mocks.GetMock(Object.Global(), "$A", {
                util: {
                    isUndefined: function(value) { return value === undefined; }
                },
                get: function(value){
                    if(value == "$Locale.langLocale") return expected;
                }
            });

            // Act
            mockMoment(function(){
                mockUtil(function(){
                    targetService.formatDateTimeUTC("date", "format");
                });
            });


            // Assert
            Assert.Equal(expected, actual);
        }
    }

    [Fixture]
    function formatTime(){

        [Fact]
        function CallsDisplayDateTimeWithMomentDateForValidDate(){
            // Arrange
            var actual;
            var targetService = new Aura.Services.AuraLocalizationService();
            targetService.displayDateTime = function (date, format, locale) {
                actual = date;
            }

            var momentDate = {
                isValid: function() {
                    return true;
                }
            };

            var mockMoment = Mocks.GetMock(Object.Global(), "moment", function(){
                return momentDate;
            });

             var mockUtil = Mocks.GetMock(Object.Global(), "$A", {
                util: {
                    isUndefined: function(value) { return value === undefined; }
                },
                get: function(value) {}
            });

            // Act
            mockMoment(function(){
                mockUtil(function(){
                    targetService.formatTime("date", "format");
                });
            });

            // Assert
            Assert.Equal(momentDate, actual);
        }

        [Fact]
        function UsesDateFormatInLocaleProviderAsDefaultFormat(){
            // Arrange
            var actual;
            var targetService = new Aura.Services.AuraLocalizationService();
            targetService.displayDateTime = function (date, format, locale) {
                actual = format;
            }

            var momentDate = {
                isValid: function() {
                    return true;
                }
            };

            var mockMoment = Mocks.GetMock(Object.Global(), "moment", function(){
                return momentDate;
            });

            var expected = "format";
            var mockUtil = Mocks.GetMock(Object.Global(), "$A", {
                util: {
                    isUndefined: function(value) { return value === undefined; }
                },
                get: function(value){
                    if(value == "$Locale.timeFormat") return expected;
                }
            });

            // Act
            mockMoment(function(){
                mockUtil(function(){
                    targetService.formatTime("date");
                });
            });


            // Assert
            Assert.Equal(expected, actual);
        }

        [Fact]
        function UsesLocaleInLocaleProvider(){
            // Arrange
            var actual;
            var targetService = new Aura.Services.AuraLocalizationService();
            targetService.displayDateTime = function (date, format, locale) {
                actual = locale;
            }

            var momentDate = {
                isValid: function() {
                    return true;
                }
            };

            var mockMoment = Mocks.GetMock(Object.Global(), "moment", function(){
                return momentDate;
            });

            var expected = "locale";
            var mockUtil = Mocks.GetMock(Object.Global(), "$A", {
                util: {
                    isUndefined: function(value) { return value === undefined; }
                },
                get: function(value){
                    if(value == "$Locale.langLocale") return expected;
                }
            });

            // Act
            mockMoment(function(){
                mockUtil(function(){
                    targetService.formatTime("date", "format");
                });
            });


            // Assert
            Assert.Equal(expected, actual);
        }
    }

    [Fixture]
    function formatTimeUTC(){
        [Fact]
        function CallsDisplayDateTimeWithMomentDateForValidDate(){
            // Arrange
            var actual;
            var targetService = new Aura.Services.AuraLocalizationService();
            targetService.displayDateTime = function (date, format, locale) {
                actual = date;
            }

            var momentDate = {
                isValid: function() {
                    return true;
                }
            };

            var mockMoment = Mocks.GetMock(Object.Global(), "moment", {
                utc: function() {
                    return momentDate;
                }
            });

             var mockUtil = Mocks.GetMock(Object.Global(), "$A", {
                util: {
                    isUndefined: function(value) { return value === undefined; }
                },
                get: function(value) {}
            });

            // Act
            mockMoment(function(){
                mockUtil(function(){
                    targetService.formatTimeUTC("date", "format");
                });
            });

            // Assert
            Assert.Equal(momentDate, actual);
        }

        [Fact]
        function UsesTimeFormatInLocaleProviderAsDefaultFormat(){
            // Arrange
            var actual;
            var targetService = new Aura.Services.AuraLocalizationService();
            targetService.displayDateTime = function (date, format, locale) {
                actual = format;
            }

            var momentDate = {
                isValid: function() {
                    return true;
                }
            };

            var mockMoment = Mocks.GetMock(Object.Global(), "moment", {
                utc: function() {
                    return momentDate;
                }
            });

            var expected = "format";
            var mockUtil = Mocks.GetMock(Object.Global(), "$A", {
                util: {
                    isUndefined: function(value) { return value === undefined; }
                },
                get: function(value){
                    if(value == "$Locale.timeFormat") return expected;
                }
            });

            // Act
            mockMoment(function(){
                mockUtil(function(){
                    targetService.formatTimeUTC("date");
                });
            });


            // Assert
            Assert.Equal(expected, actual);
        }

        [Fact]
        function UsesLocaleInLocaleProvider(){
            // Arrange
            var actual;
            var targetService = new Aura.Services.AuraLocalizationService();
            targetService.displayDateTime = function (date, format, locale) {
                actual = locale;
            }

            var momentDate = {
                isValid: function() {
                    return true;
                }
            };

            var mockMoment = Mocks.GetMock(Object.Global(), "moment", {
                utc: function() {
                    return momentDate;
                }
            });

            var expected = "locale";
            var mockUtil = Mocks.GetMock(Object.Global(), "$A", {
                util: {
                    isUndefined: function(value) { return value === undefined; }
                },
                get: function(value){
                    if(value == "$Locale.langLocale") return expected;
                }
            });

            // Act
            mockMoment(function(){
                mockUtil(function(){
                    targetService.formatTimeUTC("date", "format");
                });
            });


            // Assert
            Assert.Equal(expected, actual);
        }
    }

    [Fixture]
    function DateComparisons(){

        var targetDate1 = "date1";
        var targetDate2 = "date2";
        var targetUnit = "unit";

        var mockDuration={
            isAfter:function(date2, unit){
                if(date2 == targetDate2 && unit == targetUnit) return "isAfter";
            },
            isBefore:function(date2, unit){
                if(date2 == targetDate2 && unit == targetUnit) return "isBefore";
            },
            isSame:function(date2, unit){
                if(date2 == targetDate2 && unit == targetUnit) return "isSame";
            }
        };

        var mockMomentConstr = Mocks.GetMock(Object.Global(), "moment", function(date){
            if(date == targetDate1)return mockDuration;
        });

        [Fact]
        function isAfter(){
            // Arrange
            var expected = "isAfter";
            var actual;

            //Act
            mockMomentConstr(function(){
                actual = targetService.isAfter(targetDate1, targetDate2, targetUnit);
            });

            // Assert
            Assert.Equal(expected, actual);
        }


        [Fact]
        function isBefore(){
            // Arrange
            var expected = "isBefore";
            var actual;

            //Act
            mockMomentConstr(function(){
                actual = targetService.isBefore(targetDate1, targetDate2, targetUnit);
            });

            // Assert
            Assert.Equal(expected, actual);
        }


        [Fact]
        function isSame(){
            // Arrange
            var expected = "isSame";
            var actual;

            //Act
            mockMomentConstr(function(){
                actual = targetService.isSame(targetDate1, targetDate2, targetUnit);
            });

            // Assert
            Assert.Equal(expected, actual);
        }
    }

    [Fixture]
    function parseDateTime() {

        [Fact]
        function ReturnsNullForEmptyDateTimeString() {
            // Arrange
            var targetService = new Aura.Services.AuraLocalizationService();

            // Act
            var actual = targetService.parseDateTime("", "format");

            // Assert
            Assert.Null(actual);
        }

        [Fact]
        function ReturnsNullIfMomentDateIsInvalid() {
            // Arrange
            var actual;
            var targetService = new Aura.Services.AuraLocalizationService();

            var momentDate = {
                isValid: function() {
                    return false;
                }
            };

            var mockMoment = Mocks.GetMock(Object.Global(), "moment", function(){
                return momentDate;
            });

            var mockUtil = Mocks.GetMock(Object.Global(), "$A", {
                util: {
                    isBoolean: function(value) { return typeof value === "boolean" },
                    isUndefined: function(value) { return value === undefined; }
                },
                get: function(value){}
            });

            // Act
            mockMoment(function(){
                mockUtil(function(){
                    actual = targetService.parseDateTime("date", "format");
                });
            });

            // Assert
            Assert.Null(actual);
        }

        [Fact]
        function CallsToDateIfMomentDateIsValid() {
            // Arrange
            var actual;
            var targetService = new Aura.Services.AuraLocalizationService();

            var momentDate = {
                isValid: function() {
                    return true;
                },
                toDate: Stubs.GetMethod()
            };

            var mockMoment = Mocks.GetMock(Object.Global(), "moment", function(){
                return momentDate;
            });

            var mockUtil = Mocks.GetMock(Object.Global(), "$A", {
                util: {
                    isBoolean: function(value) { return typeof value === "boolean" },
                    isUndefined: function(value) { return value === undefined; }
                },
                get: function(value){}
            });

            // Act
            mockMoment(function(){
                mockUtil(function(){
                    targetService.parseDateTime("date", "format");
                });
            });

            // Assert
            Assert.Equal(1, momentDate.toDate.Calls.length);
        }

        [Fact]
        function UsesLocaleInLocaleProviderIfThirdParamIsBoolean() {
            // Arrange
            var actual;
            var targetService = new Aura.Services.AuraLocalizationService();
            targetService.getAvailableMomentLocale = function(locale) {
                actual = locale;
            }

            var momentDate = {
                isValid: function() {
                    return true;
                },
                toDate: function() {}
            };

            var mockMoment = Mocks.GetMock(Object.Global(), "moment", function(){
                return momentDate;
            });

            var expected = "locale";
            var mockUtil = Mocks.GetMock(Object.Global(), "$A", {
                util: {
                    isBoolean: function(value) { return typeof value === "boolean" },
                    isUndefined: function(value) { return value === undefined; }
                },
                get: function(value){
                    if(value == "$Locale.langLocale") return expected;
                }
            });

            // Act
            mockMoment(function(){
                mockUtil(function(){
                    targetService.parseDateTime("date", "format", true);
                });
            });

            // Assert
            Assert.Equal(expected, actual);
        }

        [Fact]
        function UsesLocaleInLocaleProviderIfThirdParamIsUndefined() {
            // Arrange
            var actual;
            var targetService = new Aura.Services.AuraLocalizationService();
            targetService.getAvailableMomentLocale = function(locale) {
                actual = locale;
            }

            var momentDate = {
                isValid: function() {
                    return true;
                },
                toDate: function() {}
            };

            var mockMoment = Mocks.GetMock(Object.Global(), "moment", function(){
                return momentDate;
            });

            var expected = "locale";
            var mockUtil = Mocks.GetMock(Object.Global(), "$A", {
                util: {
                    isBoolean: function(value) { return typeof value === "boolean" },
                    isUndefined: function(value) { return value === undefined; }
                },
                get: function(value){
                    if(value == "$Locale.langLocale") return expected;
                }
            });

            // Act
            mockMoment(function(){
                mockUtil(function(){
                    targetService.parseDateTime("date", "format");
                });
            });

            // Assert
            Assert.Equal(expected, actual);
        }

    }


    [Fixture]
    function parseDateTimeUTC(){

        [Fact]
        function ReturnsNullForEmptyDateTimeString() {
            // Arrange
            var targetService = new Aura.Services.AuraLocalizationService();

            // Act
            var actual = targetService.parseDateTime("", "format");

            // Assert
            Assert.Null(actual);
        }

        [Fact]
        function ReturnsNullIfMomentDateIsInvalid() {
            // Arrange
            var actual;
            var targetService = new Aura.Services.AuraLocalizationService();

            var momentDate = {
                isValid: function() {
                    return false;
                }
            };

            var mockMoment = Mocks.GetMock(Object.Global(), "moment", {
                utc: function() {
                    return momentDate;
                }
            });

            var mockUtil = Mocks.GetMock(Object.Global(), "$A", {
                util: {
                    isBoolean: function(value) { return typeof value === "boolean" },
                    isUndefined: function(value) { return value === undefined; }
                },
                get: function(value) {}
            });

            // Act
            mockMoment(function(){
                mockUtil(function(){
                    actual = targetService.parseDateTimeUTC("date", "format");
                });
            });

            // Assert
            Assert.Null(actual);
        }

        [Fact]
        function CallsToDateIfMomentDateIsValid() {
            // Arrange
            var actual;
            var targetService = new Aura.Services.AuraLocalizationService();

            var momentDate = {
                isValid: function() {
                    return true;
                },
                toDate: Stubs.GetMethod()
            };

            var mockMoment = Mocks.GetMock(Object.Global(), "moment", {
                utc: function() {
                    return momentDate;
                }
            });

            var mockUtil = Mocks.GetMock(Object.Global(), "$A", {
                util: {
                    isBoolean: function(value) { return typeof value === "boolean" },
                    isUndefined: function(value) { return value === undefined; }
                },
                get: function(value) {}
            });

            // Act
            mockMoment(function(){
                mockUtil(function(){
                    targetService.parseDateTimeUTC("date", "format");
                });
            });

            // Assert
            Assert.Equal(1, momentDate.toDate.Calls.length);
        }

        [Fact]
        function UsesLocaleInLocaleProviderIfThirdParamIsBoolean() {
            // Arrange
            var actual;
            var targetService = new Aura.Services.AuraLocalizationService();
            targetService.getAvailableMomentLocale = function(locale) {
                actual = locale;
            }

            var momentDate = {
                isValid: function() {
                    return true;
                },
                toDate: function() {}
            };

            var mockMoment = Mocks.GetMock(Object.Global(), "moment", {
                utc: function() {
                    return momentDate;
                }
            });

            var expected = "locale";
            var mockUtil = Mocks.GetMock(Object.Global(), "$A", {
                util: {
                    isBoolean: function(value) { return typeof value === "boolean" },
                    isUndefined: function(value) { return value === undefined; }
                },
                get: function(value){
                    if(value == "$Locale.langLocale") return expected;
                }
            });

            // Act
            mockMoment(function(){
                mockUtil(function(){
                    targetService.parseDateTimeUTC("date", "format", true);
                });
            });

            // Assert
            Assert.Equal(expected, actual);
        }

        [Fact]
        function UsesLocaleInLocaleProviderIfThirdParamIsUndefined() {
            // Arrange
            var actual;
            var targetService = new Aura.Services.AuraLocalizationService();
            targetService.getAvailableMomentLocale = function(locale) {
                actual = locale;
            }

            var momentDate = {
                isValid: function() {
                    return true;
                },
                toDate: function() {}
            };

            var mockMoment = Mocks.GetMock(Object.Global(), "moment", {
                utc: function() {
                    return momentDate;
                }
            });

            var expected = "locale";
            var mockUtil = Mocks.GetMock(Object.Global(), "$A", {
                util: {
                    isBoolean: function(value) { return typeof value === "boolean" },
                    isUndefined: function(value) { return value === undefined; }
                },
                get: function(value){
                    if(value == "$Locale.langLocale") return expected;
                }
            });

            // Act
            mockMoment(function(){
                mockUtil(function(){
                    targetService.parseDateTimeUTC("date", "format");
                });
            });

            // Assert
            Assert.Equal(expected, actual);
        }

    }

    [Fixture]
    function parseDateTimeISO8601(){

        var mockMoment = Mocks.GetMock(Object.Global(), "moment", function(dateTimeString){
            if(dateTimeString == mockDateTime) return mockDateTime;
            if(dateTimeString == "null") return null;
            return mockInvalidDate;
        });

        [Fact]
        function ReturnsNullForEmptyDateTimeString(){
            // Arrange
            var targetService = new Aura.Services.AuraLocalizationService();

            // Act
            var actual = targetService.parseDateTimeISO8601("");

            // Assert
            Assert.Null(actual);
        }

        [Fact]
        function ReturnsNullWhenMomentReturnsNull(){
            // Arrange
            var expected = null;
            var targetService = new Aura.Services.AuraLocalizationService();
            var actual;

            // Act
            mockMoment(function(){
                actual = targetService.parseDateTimeISO8601("null");
            });

            // Assert
            Assert.Null(actual);
        }

        [Fact]
        function ValidDateTime(){
            // Arrange
            var expected = targetDateTime;
            var actual;

            // Act
            mockMoment(function(){
                actual = targetService.parseDateTimeISO8601(targetDateTime);
            });

            // Assert
            Assert.Equal(expected, actual);
        }
    }

    [Fixture]
    function toISOString() {

        [Fact]
        function ReturnsInputValueForFalsyInput() {
            // Arrange
            var expected = "";
            var targetService = new Aura.Services.AuraLocalizationService();

            // Act
            var actual = targetService.toISOString(expected);

            // Assert
            Assert.Equal(expected, actual);
        }

        [Fact]
        function ReturnsInputValueForNonDateInput() {
            // Arrange
            var expected = "2015-04-01";
            var targetService = new Aura.Services.AuraLocalizationService();
            var actual;

            // Act
            mockUtil(function() {
                actual = targetService.toISOString(expected);
            });

            // Assert
            Assert.Equal(expected, actual);
        }

        [Fact]
        function CallsToISOStringOnDateIfExits() {
            // Arrange
            var targetService = new Aura.Services.AuraLocalizationService();
            var date = new Date();
            date.toISOString = Stubs.GetMethod();

            // Act
            mockUtil(function() {
                targetService.toISOString(date);
            });

            // Assert
            Assert.Equal(1, date.toISOString.Calls.length);
        }

        [Fact]
        function ReturnsISOStringForDateWithToISOString(){
            // Arrange
            var targetService = new Aura.Services.AuraLocalizationService();
            var expected = "2004-11-09T12:30:59.123Z";
            var date = new Date(Date.UTC(2004,10,09,12,30,59,123));
            var actual;

            // Act
            mockUtil(function() {
                actual = targetService.toISOString(date);
            });

            // Assert
            Assert.Equal(expected, actual);
        }

        [Fact]
        function ReturnsISOStringForDateWithoutToISOString(){
            // Arrange
            var targetService = new Aura.Services.AuraLocalizationService();
            var expected = "2004-11-09T12:30:59.123Z";
            var date = new Date(Date.UTC(2004,10,09,12,30,59,123));
            date.toISOString = undefined;
            var actual;

            // Act
            mockUtil(function() {
                actual = targetService.toISOString(date);
            });

            // Assert
            Assert.Equal(expected, actual);
        }

    }

    [Fixture]
    function UTCToWallTime() {

        var mockMoment = Mocks.GetMock(Object.Global(), "moment", {
            tz: {
                zone: function(timezone) {
                    if (timezone === "unsupported") {
                        return null;
                    }
                    return Stubs.GetObject({});
                }
            }
        });

        [Fact]
        function CallbackWithOriginalDateWhenTimezoneLibIsMissing() {
            // Arrange
            var targetService = new Aura.Services.AuraLocalizationService();
            var expected = Stubs.GetObject({});
            var actual;

            var mockMomentWithoutTimezone = Mocks.GetMock(Object.Global(), "moment", {});

            // Act
            mockUtil(function () {
                mockMomentWithoutTimezone(function () {
                    targetService.UTCToWallTime(expected, "GMT", function(date) {
                        actual = date;
                    });
                });
            });

            // Assert
            Assert.Equal(expected, actual);
        }

        [Fact]
        function CallbackWithOriginalDateWhenZoneIsGMT() {
            // Arrange
            var targetService = new Aura.Services.AuraLocalizationService();
            var expected = Stubs.GetObject({});
            var actual;

            // Act
            mockUtil(function () {
                mockMoment(function () {
                    targetService.UTCToWallTime(expected, "GMT", function(date) {
                        actual = date;
                    });
                });
            });

            // Assert
            Assert.Equal(expected, actual);
        }

        [Fact]
        function UsesUserTimezoneIfTimeZoneIsFalsy() {
            // Arrange
            var expected = targetDateTime;
            var actual;

            var mockUtil = Mocks.GetMock(Object.Global(), "$A", {
                get:function(value){
                    if(value == "$Locale.timezone") return "UTC";
                },
                assert: function () {},
                warning: function() {}
            });

            // Act
            mockUtil(function() {
                mockMoment(function () {
                    // when timezone is UTC, callback gets called with the original date
                    targetService.UTCToWallTime(mockDateTime, undefined, function(date) {
                        actual = date;
                    });
                });
            });

            // Assert
            Assert.Equal(expected, actual);
        }

        [Fact]
        function UsesUserTimezoneIfTimeZoneIsUnsupported(){
            // Arrange
            var expected = targetDateTime;
            var actual;

            var mockUtil = Mocks.GetMock(Object.Global(), "$A", {
                get:function(value){
                    if(value == "$Locale.timezone") return "UTC";
                },
                assert: function () {},
                warning: function() {}
            });

            // Act
            mockUtil(function() {
                mockMoment(function() {
                    // when timezone is UTC, callback gets called with the original date
                    targetService.UTCToWallTime(mockDateTime, "unsupported", function(date) {
                        actual = date;
                    });
                });
            });

            // Assert
            Assert.Equal(expected, actual);
        }
    }

    [Fixture]
    function WallTimeToUTC(){

        var mockMoment = Mocks.GetMock(Object.Global(), "moment", {
            tz: {
                zone: function(timezone) {
                    if (timezone === "unsupported") {
                        return null;
                    }
                    return Stubs.GetObject({});
                }
            }
        });

        [Fact]
        function CallbackWithOriginalDateWhenTimezoneLibIsMissing() {
            // Arrange
            var targetService = new Aura.Services.AuraLocalizationService();
            var expected = Stubs.GetObject({});
            var actual;

            var mockMomentWithoutTimezone = Mocks.GetMock(Object.Global(), "moment", {});

            // Act
            mockUtil(function () {
                mockMomentWithoutTimezone(function () {
                    targetService.WallTimeToUTC(expected, "GMT", function(date) {
                        actual = date;
                    });
                });
            });

            // Assert
            Assert.Equal(expected, actual);
        }

        [Fact]
        function CallbackWithOriginalDateWhenZoneIsGMT() {
            // Arrange
            var targetService = new Aura.Services.AuraLocalizationService();
            var expected = Stubs.GetObject({});
            var actual;

            // Act
            mockUtil(function () {
                mockMoment(function () {
                    targetService.WallTimeToUTC(expected, "GMT", function(date) {
                        actual = date;
                    });
                });
            });

            // Assert
            Assert.Equal(expected, actual);
        }

        [Fact]
        function UsesUserTimezoneIfTimeZoneIsFalsy(){
            // Arrange
            var expected = targetDateTime;
            var actual;

            var mockUtil = Mocks.GetMock(Object.Global(), "$A", {
                get:function(value){
                    if(value == "$Locale.timezone") return "UTC";
                },
                assert: function () {},
                warning: function() {}
            });

            // Act
            mockUtil(function() {
                mockMoment(function () {
                    // when timezone is UTC, callback gets called with the original date
                    targetService.WallTimeToUTC(mockDateTime, undefined, function(date) {
                        actual = date;
                    });
                });
            });

            // Assert
            Assert.Equal(expected, actual);
        }

        [Fact]
        function UsesUserTimezoneIfTimeZoneIsUnsupported(){
            // Arrange
            var expected = targetDateTime;
            var actual;

            var mockUtil = Mocks.GetMock(Object.Global(), "$A", {
                get:function(value){
                    if(value == "$Locale.timezone") return "UTC";
                },
                assert: function () {},
                warning: function() {}
            });

            // Act
            mockUtil(function() {
                mockMoment(function() {
                    // when timezone is UTC, callback gets called with the original date
                    targetService.WallTimeToUTC(mockDateTime, "unsupported", function(date) {
                        actual = date;
                    });
                });
            });

            // Assert
            Assert.Equal(expected, actual);
        }
    }

    [Fixture]
    function displayDateTime(){

        var targetFormat = "format";
        var targetLang = "lang";

        var targetDateTimeObj={
            l:'',
            f:'',
            locale:function(lang){
                if(lang == targetLang) this.l = lang;
            },
            format:function(format){
                if(format == targetFormat) this.f = format + this.l;
                return this.f;
            }
        };

        [Fact]
        function InvalidLocale(){
            // Arrange
            var expected = targetFormat;
            var actual;

            // Act
            mockMoment(function () {
                mockGetNormalizedFormat(function(){
                    actual = targetService.displayDateTime(targetDateTimeObj, targetFormat, '');
                });
            });

            // Assert
            Assert.Equal(expected, actual);
        }

        [Fact]
        function validFormatAndLocale(){
            // Arrange
            var expected = targetFormat+targetLang;
            var actual;

            // Act
            mockGetAvailableMomentLocale(function(){
                mockGetNormalizedFormat(function(){
                    actual = targetService.displayDateTime(targetDateTimeObj, targetFormat, targetLang);
                });
            });

            // Assert
            Assert.Equal(expected, actual);
        }
    }

    [Fixture]
    function getNormalizedFormat(){

        var targetFormat = "DDMMYYYY";

        [Fact]
        function inValidFormat(){
            // Arrange
            var expected = "";
            var actual;

            // Act
            actual = targetService.getNormalizedFormat("");

            // Assert
            Assert.Equal(expected, actual);
        }

        [Fact]
        function cacheHit(){
            // Arrange
            var expected = targetFormat;
            var actual;

            var mockCache = Mocks.GetMock(targetService, "cache", {
                format: {
                    DDMMYYYY:targetFormat
                }
            });

            // Act
            mockCache(function(){
                actual = targetService.getNormalizedFormat(targetFormat);
            });

            // Assert
            Assert.Equal(expected, actual);
        }

        [Fact]
        function cacheMiss(){
            // Arrange
            var expected = targetFormat;
            var actual;

            var mockCache = Mocks.GetMock(targetService, "cache", {
                format: {
                    ddMMyyyy:false
                }
            });

            // Act
            mockCache(function(){
                actual = targetService.getNormalizedFormat("ddMMyyyy");
            });

            // Assert
            Assert.Equal(expected, actual);
        }
    }

    [Fixture]
    function getStrictModeFormat(){

        var targetFormat = "DDMMYYYY";

        [Fact]
        function emptyFormat(){
            // Arrange
            var expected = "";
            var actual;

            // Act
            actual = targetService.getStrictModeFormat("");

            // Assert
            Assert.Equal(expected, actual);
        }

        [Fact]
        function dateOnlySingleLetterFormat(){
            // Arrange
            var expected = "D-M-YYYY";
            var actual;

            // Act
            actual = targetService.getStrictModeFormat("d-M-y");

            // Assert
            Assert.Equal(expected, actual);
        }


        [Fact]
        function dateOnlyDoubleLetterFormat(){
            // Arrange
            var expected = "D-M-YYYY";
            var actual;

            // Act
            actual = targetService.getStrictModeFormat("dd-MM-y");

            // Assert
            Assert.Equal(expected, actual);
        }

        [Fact]
        function dateTimeSingleLetterFormat(){
            // Arrange
            var expected = "D-M-YYYY h:m A";
            var actual;

            // Act
            actual = targetService.getStrictModeFormat("d-M-y h:m a");

            // Assert
            Assert.Equal(expected, actual);
        }

        [Fact]
        function dateTimeDoubleLetterFormat(){
            // Arrange
            var expected = "D-M-YYYY h:m A";
            var actual;

            // Act
            actual = targetService.getStrictModeFormat("dd-MM-y hh:mm a");

            // Assert
            Assert.Equal(expected, actual);
        }

        [Fact]
        function dateTimeNoSpaceAMPMFormat(){
            // Arrange
            var expected = "D-M-YYYY h:m A";
            var actual;

            // Act
            actual = targetService.getStrictModeFormat("dd-MM-y hh:mmA  ");

            // Assert
            Assert.Equal(expected, actual);
        }

        [Fact]
        function dateTimeExtraSpaceAMPMFormat(){
            // Arrange
            var expected = "D-M-YYYY h:m A";
            var actual;

            // Act
            actual = targetService.getStrictModeFormat("dd-MM-y hh:mm   A  ");

            // Assert
            Assert.Equal(expected, actual);
        }

        [Fact]
        function dateTime24HrFormat(){
            // Arrange
            var expected = "D-M-YYYY H:m";
            var actual;

            // Act
            actual = targetService.getStrictModeFormat("d-M-y HH:mm");

            // Assert
            Assert.Equal(expected, actual);
        }
    }

    [Fixture]
    function getAvailableMomentLocale(){

        [Fact]
        function ReturnsValueInCacheIfHits() {
            // Arrange
            var expected = "momentLocale";
            var targetService = new Aura.Services.AuraLocalizationService();
            targetService.localeCache = { "javaLocale": expected };

            // Act
            var actual = targetService.getAvailableMomentLocale("javaLocale");

            // Assert
            Assert.Equal(expected, actual);
        }

        [Fact]
        function ReturnsEnIfCacheMisses() {
            // Arrange
            var expected = "en";
            var targetService = new Aura.Services.AuraLocalizationService();

            // Act
            var actual = targetService.getAvailableMomentLocale("notExists");

            // Assert
            Assert.Equal(expected, actual);
        }

    }

    [Fixture]
    function normalizeToMomentLocale(){

        [Fact]
        function ReturnsArgValueForFalsy() {
            // Arrange
            var expected = "";
            var targetService = new Aura.Services.AuraLocalizationService();

            // Act
            var actual = targetService.normalizeToMomentLocale(expected);

            // Assert
            Assert.Equal(expected, actual);
        }

        [Fact]
        function ReturnsMomentLocaleIfCompoundLocaleMatches(){
            // Arrange
            var expected = "zh-cn";
            var targetService = new Aura.Services.AuraLocalizationService();

            var mockMoment = Mocks.GetMock(Object.Global(), "moment", {
                locales: function(){
                    return [expected];
                }
            });

            // Act
            var actual;
            mockMoment(function(){
                actual = targetService.normalizeToMomentLocale("zh_CN");
            });

            // Assert
            Assert.Equal(expected, actual);
        }

        [Fact]
        function ReturnsMomentLocaleIfLanguageLocaleMatches(){
            // Arrange
            var expected = "de";
            var targetService = new Aura.Services.AuraLocalizationService();

            var mockMoment = Mocks.GetMock(Object.Global(), "moment", {
                locales: function(){
                    return [expected];
                }
            });

            // Act
            var actual;
            mockMoment(function(){
                actual = targetService.normalizeToMomentLocale("de_DE");
            });

            // Assert
            Assert.Equal(expected, actual);
        }

        [Fact]
        function ReturnEnIfNoMatchingLocale(){
            // Arrange
            var expected = "en";
            var targetService = new Aura.Services.AuraLocalizationService();

            var mockMoment = Mocks.GetMock(Object.Global(), "moment", {
                locales: function(){
                    return [];
                }
            });

            // Act
            var actual;
            mockMoment(function(){
                actual = targetService.normalizeToMomentLocale("not_matching");
            });

            // Assert
            Assert.Equal(expected, actual);
        }

    }

    [Fixture]
    function isAvailableLocale(){

        [Fact]
        function ReturnsFalseForFalsyValue() {
            // Arrange
            var targetService = new Aura.Services.AuraLocalizationService();

            // Act
            var actual = targetService.isAvailableLocale("");

            // Assert
            Assert.False(actual);
        }

        [Fact]
        function ReturnsTrueIfLocaleCacheHits(){
            // Arrange
            var targetService = new Aura.Services.AuraLocalizationService();
            targetService.localeCache["zh_CN"] = "zh-cn";

            // Act
            var actual = targetService.isAvailableLocale("zh_CN");

            // Assert
            Assert.True(actual);
        }

        [Fact]
        function ReturnsTrueIfMomentDataAvailable(){
            // Arrange
            var targetService = new Aura.Services.AuraLocalizationService();

            var mockMoment = Mocks.GetMock(Object.Global(), "moment", {
                locales: function(){
                    return ["zh-cn"];
                }
            });

            // Act
            var actual;
            mockMoment(function(){
                actual = targetService.isAvailableLocale("ZH-CN");
            });

            // Assert
            Assert.True(actual);
        }

        [Fact]
        function AddsToCacheIfCacheMissesOnAvailableLocale(){
            // Arrange
            var expected = "zh-cn";
            var locale = "zh_CN";
            var targetService = new Aura.Services.AuraLocalizationService();

            var mockMoment = Mocks.GetMock(Object.Global(), "moment", {
                locales: function(){
                    return [expected];
                }
            });

            // Act

            mockMoment(function(){
                targetService.isAvailableLocale(locale);
            });
            var actual = targetService.localeCache[locale];

            // Assert
            Assert.Equal(expected, actual);
        }

        [Fact]
        function ReturnsFalseForUnavailableLocale(){
            // Arrange
            var targetService = new Aura.Services.AuraLocalizationService();

            var mockMoment = Mocks.GetMock(Object.Global(), "moment", {
                locales: function(){
                    return [];
                }
            });

            // Act
            var actual;
            mockMoment(function(){
                actual = targetService.isAvailableLocale("unavailable");
            });

            // Assert
            Assert.False(actual);
        }

        [Fact]
        function ReturnsFalseForUnavailableLocale(){
            // Arrange
            var targetService = new Aura.Services.AuraLocalizationService();

            var mockMoment = Mocks.GetMock(Object.Global(), "moment", {
                locales: function(){
                    return [];
                }
            });

            // Act
            var actual;
            mockMoment(function(){
                actual = targetService.isAvailableLocale("unavailable");
            });

            // Assert
            Assert.False(actual);
        }

        [Fact]
        function ReturnsTrueIfEnLocaleIsAvailable(){
            var targetService = new Aura.Services.AuraLocalizationService();

            var mockMoment = Mocks.GetMock(Object.Global(), "moment", {
                locales: function(){
                    return ["en"];
                }
            });

            // Act
            var actual;
            mockMoment(function(){
                actual = targetService.isAvailableLocale("en-US");
            });

            // Assert
            Assert.True(actual);
        }

    }

    [Fixture]
    function init(){

        [Fact]
        function SetsMomentLocaleAsValueInLocaleProvider(){
            // Arrange
            var expected = "locale";
            var javaLocale = "JavaLocale";
            var targetService = new Aura.Services.AuraLocalizationService();
            var actual;

            targetService.normalizeToMomentLocale = function(locale) {
                if (locale === javaLocale) { return expected; }
            }

            var mockUtil = Mocks.GetMock(Object.Global(), "$A", {
                get: function(key) {
                    if(key == "$Locale.langLocale") return javaLocale;
                }
            });

            var mockMoment = Mocks.GetMock(Object.Global(), "moment", {
                locale: function(locale) {
                    actual = locale;
                }
            });

            // Act
            mockUtil(function(){
                mockMoment(function(){
                    targetService.init();
                });
            });

            // Assert
            Assert.Equal(expected, actual);
        }

        [Fact]
        function AddsAvailableLocaleToCache(){
            // Arrange
            var expected = "locale";
            var javaLocale = "JavaLocale";
            var targetService = new Aura.Services.AuraLocalizationService();

            targetService.normalizeToMomentLocale = function(locale) {
                if (locale === javaLocale) { return expected; }
            }

            var mockUtil = Mocks.GetMock(Object.Global(), "$A", {
                get: function(key) {
                    if(key == "$Locale.langLocale") return javaLocale;
                }
            });

            var mockMoment = Mocks.GetMock(Object.Global(), "moment", {
                locale: function(locale) {}
            });

            // Act
            mockUtil(function(){
                mockMoment(function(){
                    targetService.init();
                });
            });

            // Assert
            var actual = targetService.localeCache[javaLocale];
            Assert.Equal(expected, actual);
        }
    }

    [Fixture]
    function formatNumbers(){

        [Fact]
        function formatNumber(){
            // Arrange
            var expected = targetNumber;
            var actual;

            var mockGetDefaultNumberFormat = Mocks.GetMock(targetService, "getDefaultNumberFormat", function(){
                return {
                    format: function(number){
                        if(number == targetNumber) return targetNumber;
                    }
                };
            });

            // Act
            mockGetDefaultNumberFormat(function(){
                actual = targetService.formatNumber(targetNumber);
            });

            // Assert
            Assert.Equal(expected, actual);
        }

        [Fact]
        function formatPercent(){
            // Arrange
            var expected = targetPercent;
            var actual;

            var mockGetDefaultPercentFormat = Mocks.GetMock(targetService, "getDefaultPercentFormat", function(){
                return {
                    format: function(number){
                        if(number == targetPercent) return targetPercent;
                    }
                };
            });

            // Act
            mockGetDefaultPercentFormat(function(){
                actual = targetService.formatPercent(targetPercent);
            });

            // Assert
            Assert.Equal(expected, actual);
        }

        [Fact]
        function formatCurrency(){
            // Arrange
            var expected = targetCurrency;
            var actual;

            var mockGetDefaultCurrencyFormat = Mocks.GetMock(targetService, "getDefaultCurrencyFormat", function(){
                return {
                    format: function(number){
                        if(number == targetCurrency) return targetCurrency;
                    }
                };
            });

            // Act
            mockGetDefaultCurrencyFormat(function(){
                actual = targetService.formatCurrency(targetCurrency);
            });

            // Assert
            Assert.Equal(expected, actual);
        }
    }

    [Fixture]
    function getNumberFormat(){

        [Fact]
        function getNumberFormat(){
            // Arrange
            var actual;
            var targetSymbols = '###';
            var mockNumberFormat = {};

            var mockNumberFormatConstructor = Mocks.GetMock(Object.Global(), "Aura", { "Utils" : {"NumberFormat": function(format, symbols){
                if(format == targetNumberFormat && symbols == targetSymbols) return mockNumberFormat;
            }}});

            // Act
            mockNumberFormatConstructor(function(){
                actual = targetService.getNumberFormat(targetNumberFormat, targetSymbols);
            });

            // Assert
            Assert.Equal(mockNumberFormat, actual);
        }
    }

    [Fixture]
    function getDefaultFormats(){

        [Fact]
        function getNumberFormat(){
            // Arrange
            var actual;
            var mockNumberFormat = {};

            var mockNumberFormatConstructor = Mocks.GetMock(Object.Global(), "Aura", { "Utils" : {"NumberFormat": function(val){
                if(val == targetNumberFormat) return mockNumberFormat;
            }}});

            // Act
            mockUtil(function(){
                mockNumberFormatConstructor(function(){
                    actual = targetService.getDefaultNumberFormat();
                });
            });

            // Assert
            Assert.Equal(mockNumberFormat, actual);
        }

        [Fact]
        function getDefaultPercentFormat(){
            // Arrange
            var actual;
            var mockNumberFormat = {};

            var mockNumberFormatConstructor = Mocks.GetMock(Object.Global(), "Aura", { "Utils" : {"NumberFormat": function(val){
                if(val == targetPercentFormat) return mockNumberFormat;
            }}});

            // Act
            mockUtil(function(){
                mockNumberFormatConstructor(function(){
                    actual = targetService.getDefaultPercentFormat();
                });
            });

            // Assert
            Assert.Equal(mockNumberFormat, actual);
        }

        [Fact]
        function getDefaultCurrencyFormat(){
            // Arrange
            var actual;
            var mockNumberFormat = {};

            var mockNumberFormatConstructor = Mocks.GetMock(Object.Global(), "Aura", { "Utils" : {"NumberFormat": function(val){
                if(val == targetCurrencyFormat) return mockNumberFormat;
            }}});

            // Act
            mockUtil(function(){
                mockNumberFormatConstructor(function(){
                    actual = targetService.getDefaultCurrencyFormat();
                });
            });

            // Assert
            Assert.Equal(mockNumberFormat, actual);
        }
    }

    [Fixture]
    function pad(){

        [Fact]
        function pad0(){
            // Arrange
            var expected = '00';
            var actual;

            // Act
            actual = targetService.pad(0);

            // Assert
            Assert.Equal(expected, actual);
        }

        [Fact]
        function pad1(){
            // Arrange
            var expected = '01';
            var actual;

            // Act
            actual = targetService.pad(1);

            // Assert
            Assert.Equal(expected, actual);
        }

        [Fact]
        function pad9(){
            // Arrange
            var expected = '09';
            var actual;

            // Act
            actual = targetService.pad(9);

            // Assert
            Assert.Equal(expected, actual);
        }

        [Fact]
        function pad10(){
            // Arrange
            var expected = '10';
            var actual;

            // Act
            actual = targetService.pad(10);

            // Assert
            Assert.Equal(expected, actual);
        }
    }

    [Fixture]
    function doublePad(){

        [Fact]
        function pad0(){
            // Arrange
            var expected = '000';
            var actual;

            // Act
            actual = targetService.doublePad(0);

            // Assert
            Assert.Equal(expected, actual);
        }

        [Fact]
        function pad1(){
            // Arrange
            var expected = '001';
            var actual;

            // Act
            actual = targetService.doublePad(1);

            // Assert
            Assert.Equal(expected, actual);
        }

        [Fact]
        function pad9(){
            // Arrange
            var expected = '099';
            var actual;

            // Act
            actual = targetService.doublePad(99);

            // Assert
            Assert.Equal(expected, actual);
        }

        [Fact]
        function pad10(){
            // Arrange
            var expected = '100';
            var actual;

            // Act
            actual = targetService.doublePad(100);

            // Assert
            Assert.Equal(expected, actual);
        }
    }
}
