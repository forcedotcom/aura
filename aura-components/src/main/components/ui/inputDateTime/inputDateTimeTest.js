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
({
    /**
     * Verify that the provided component is inputDateTimeHtml on mobile/tablet, and inputDateTime on desktop
     */
    testCorrectComponentProvided: {
        test: function (cmp) {
            var isDesktop = $A.get('$Browser.formFactor').toLowerCase() === "desktop";
            var providedCmpName = cmp.getDef().getDescriptor().getQualifiedName();
            if (isDesktop) {
                $A.test.assertEquals("markup://ui:inputDateTime", providedCmpName, "should use inputDate on desktop");
            } else {
                $A.test.assertEquals("markup://ui:inputDateTimeHtml", providedCmpName, "should use inputDate on desktop");
            }
        }
    },

    /**
     * Verify behavior when 'Value' attribute is assigned an empty string.
     */
    testEmptyStringValue: {
        browsers: ['DESKTOP'],
        attributes: {value: ''},
        test: function (cmp) {
            var inputDateStr = cmp.find("inputDate").getElement().value;
            $A.test.assertEquals('', inputDateStr, "Expected an empty inputDate.");
            var inputTimeStr = cmp.find("inputTime").getElement().value;
            $A.test.assertEquals('', inputTimeStr, "Expected an empty inputTime.");
        }
    },

    /**
     * Verify behavior when 'Value' attribute is assigned a Garbage value.
     */
    testInvalidValue: {
        browsers: ['DESKTOP'],
        attributes: {value: 'cornholio'},
        test: function (cmp) {
            $A.test.addWaitFor(true, function () {
                return cmp.find("inputDate").getElement().value.length > 0;
            }, function () {
                var inputDateStr = cmp.find("inputDate").getElement().value;
                $A.test.assertEquals('cornholio', inputDateStr, "Value must be an ISO8601-formatted string or a number of milliseconds from Epoch.");
            });
        }
    },

    /**
     * Verify behavior when 'timezone' attribute is assigned a garbage value.
     */
    _testInvalidTimeZone: {
        attributes: {displayDatePicker: 'true', timezone: 'dummy', format: 'MMM dd, yyyy h:mm:ss a'},
        test: function (cmp) {
            cmp.find("datePicker").get('c.selectToday').runDeprecated();
            $A.test.addWaitFor(true, function () {
                return cmp.find("inputDate").getElement().value.length > 0;
            }, function () {
                var inputDateStr = cmp.find("inputDate").getElement().value;
                var dt = $A.localizationService.formatDateTime(new Date(), 'MMM DD, YYYY') + " 12:00:00 AM";
                $A.test.assertEquals(dt, inputDateStr, "Should have used default timezone.");
            });
        }
    },

    /**
     * Verify behavior when 'timezone' attribute is assigned a garbage value.
     */
    testInvalidTimeZoneUsingValue: {
        browsers: ['DESKTOP'],
        attributes: {value: '2004-09-23T16:30:00.000Z', displayDatePicker: 'true', timezone: 'dummy'},
        test: function (cmp) {
            $A.test.addWaitFor(true, function () {
                return cmp.find("inputDate").getElement().value.length > 0;
            }, function () {
                var inputDateStr = cmp.find("inputDate").getElement().value;
                var timezone = $A.get("$Locale.timezone");
                var inputTimeStr = cmp.find("inputTime").getElement().value;
                if (timezone === "GMT") {
                    $A.test.assertEquals("Sep 23, 2004", inputDateStr, "Should have used default timezone.");
                    $A.test.assertEquals("4:30 PM", inputTimeStr, "Should have used default timezone.");
                }
                else if (timezone === "America/Los_Angeles") {
                    $A.test.assertEquals("Sep 23, 2004", inputDateStr, "Should have used default timezone.");
                    $A.test.assertEquals("9:30 AM", inputTimeStr, "Should have used default timezone.");
                }
                else {// For any other time zone we just make sure it has some value
                    $A.test.assertTrue(inputDateStr.length > 0, "Should have used default timezone.");
                    $A.test.assertTrue(inputTimeStr.length > 0, "Should have used default timezone.");
                }
            });
        }
    },

    /**
     * Verify behavior when 'timezone' is assigned a empty string.
     */
    _testEmptyStringTimeZone: {
        attributes: {displayDatePicker: 'true', timezone: '', format: 'MMM dd, yyyy h:mm:ss a'},
        test: function (cmp) {
            cmp.find("datePicker").get('c.selectToday').runDeprecated();
            $A.test.addWaitFor(true, function () {
                return cmp.find("inputDate").getElement().value.length > 0;
            }, function () {
                var inputDateStr = cmp.find("inputDate").getElement().value;
                var dt = $A.localizationService.formatDateTime(new Date(), 'MMM DD, YYYY') + " 12:00:00 AM";
                $A.test.assertEquals(dt, inputDateStr, "Should have used default timezone.");
            });
        }
    },

    /**
     * Verify behavior when 'langLocale' is not provided.
     */
    testDefaultLangLocale: {
        browsers: ['DESKTOP'],
        attributes: {value: '2004-09-23T16:30:00.000Z', displayDatePicker: 'true', timezone: 'GMT'},
        test: function (cmp) {
            $A.test.addWaitFor(true, function () {
                return cmp.find("inputDate").getElement().value.length > 0;
            }, function () {
                var inputDateStr = cmp.find("inputDate").getElement().value;
                $A.test.assertEquals("Sep 23, 2004", inputDateStr, "Should have used Default langLocale.");
                var inputTimeStr = cmp.find("inputTime").getElement().value;
                $A.test.assertEquals("4:30 PM", inputTimeStr, "Should have used Default langLocale.");
            });
        }
    },

    /**
     * Verify behavior when 'langLocale' is assigned a empty string.
     */
    testEmptyStringLangLocale: {
        browsers: ['DESKTOP'],
        attributes: {value: '2004-09-23T16:30:00.000Z', displayDatePicker: 'true', langLocale: '', timezone: 'GMT'},
        test: function (cmp) {
            $A.test.addWaitFor(true, function () {
                return cmp.find("inputDate").getElement().value.length > 0;
            }, function () {
                var inputDateStr = cmp.find("inputDate").getElement().value;
                $A.test.assertEquals("Sep 23, 2004", inputDateStr, "Should have used Default langLocale.");
                var inputTimeStr = cmp.find("inputTime").getElement().value;
                $A.test.assertEquals("4:30 PM", inputTimeStr, "Should have used Default langLocale.");
            });
        }
    },

    /**
     * Verify behavior when 'langLocale' is assigned garbage.
     */
    testInvalidLangLocale: {
        browsers: ['DESKTOP'],
        attributes: {value: '2004-09-23T16:30:00.000Z', displayDatePicker: 'true', langLocale: 'xx', timezone: 'GMT'},
        test: function (cmp) {
            $A.test.addWaitFor(true, function () {
                return cmp.find("inputDate").getElement().value.length > 0;
            }, function () {
                var inputDateStr = cmp.find("inputDate").getElement().value;
                $A.test.assertEquals("Sep 23, 2004", inputDateStr, "Should have used Default langLocale.");
                var inputTimeStr = cmp.find("inputTime").getElement().value;
                $A.test.assertEquals("4:30 PM", inputTimeStr, "Should have used Default langLocale.");
            });
        }
    },

    /**
     * Verify behavior when 'format' attribute is assigned an empty string.
     */
    testEmptyFormat: {
        browsers: ['DESKTOP'],
        attributes: {value: '2004-09-23T16:30:00.000Z', format: '', timezone: 'GMT'},
        test: function (cmp) {
            $A.test.addWaitFor(true, function () {
                return cmp.find("inputDate").getElement().value.length > 0;
            }, function () {
                var inputDateStr = cmp.find("inputDate").getElement().value;
                $A.test.assertEquals("Sep 23, 2004", inputDateStr, "Incorrect date/time format.");
                var inputTimeStr = cmp.find("inputTime").getElement().value;
                $A.test.assertEquals("4:30 PM", inputTimeStr, "Incorrect date/time format.");
            });
        }
    },

    /**
     * Verify behavior when 'format' attribute is assigned a garbage value.
     */
    testInvalidFormat: {
        browsers: ['DESKTOP'],
        attributes: {
            value: '2004-09-23T16:30:00.000Z',
            format: 'cornoio',
            dateFormat: 'cornoio',
            timeFormat: 'cornoio'
        },
        test: function (cmp) {
            $A.test.addWaitFor(true, function () {
                return cmp.find("inputDate").getElement().value.length > 0;
            }, function () {
                var inputDateStr = cmp.find("inputDate").getElement().value;
                $A.test.assertEquals("cornoio", inputDateStr, "Invalid pattern character is output as it is.");
                var inputTimeStr = cmp.find("inputTime").getElement().value;
                $A.test.assertEquals("cornoio", inputTimeStr, "Invalid pattern character is output as it is.");
            });
        }
    },

    /**
     * Verify Today in default time zone.
     */
    _testTodayInGMT: {
        attributes: {displayDatePicker: 'true', timezone: 'GMT', format: 'MMM dd, yyyy h:mm:ss a'},
        test: function (cmp) {
            cmp.find("datePicker").get('c.selectToday').runDeprecated();
            var inputDateStr = cmp.find("inputDate").getElement().value;
            var dt = $A.localizationService.formatDateTime(new Date(), 'MMM DD, YYYY') + " 12:00:00 AM";
            $A.test.assertEquals(dt, inputDateStr, "Dates are not the same and they should be");
        }
    },

    /**
     * Verify Today in LA time zone.
     */
    _testTodayInLosAngeles: {
        attributes: {displayDatePicker: 'true', format: 'MMM dd, yyyy h:mm:ss a'},
        test: function (cmp) {
            cmp.find("datePicker").get('c.selectToday').runDeprecated();
            $A.test.addWaitFor(true, function () {
                return cmp.find("inputDate").getElement().value.length > 0;
            }, function () {
                var inputDateStr = cmp.find("inputDate").getElement().value;
                var dt = $A.localizationService.formatDateTime(new Date(), 'MMM DD, YYYY') + " 12:00:00 AM";
                $A.test.assertEquals(dt, inputDateStr, "Dates are not the same and they should be");
            });
        }
    },

    /**
     * Verify Today in NY time zone.
     */
    _testTodayInNewYork: {
        attributes: {displayDatePicker: 'true', timezone: 'America/New_York', format: 'MMM dd, yyyy h:mm:ss a'},
        test: function (cmp) {
            cmp.find("datePicker").get('c.selectToday').runDeprecated();
            $A.test.addWaitFor(true, function () {
                return cmp.find("inputDate").getElement().value.length > 0;
            }, function () {
                var inputDateStr = cmp.find("inputDate").getElement().value;
                var dt = $A.localizationService.formatDateTime(new Date(), 'MMM DD, YYYY') + " 12:00:00 AM";
                $A.test.assertEquals(dt, inputDateStr, "Dates are not the same and they should be");
            });
        }
    },

    /**
     * Verify a value in default time zone.
     */
    testTimeInGMT: {
        browsers: ['DESKTOP'],
        attributes: {
            value: '2004-09-23T16:30:00.000Z',
            displayDatePicker: 'true',
            format: 'M/dd/yy h:mm A',
            dateFormat: 'M/dd/yy',
            timeFormat: 'h:mm A',
            timezone: 'GMT'
        },
        test: function (cmp) {
            $A.test.addWaitFor(true, function () {
                return cmp.find("inputDate").getElement().value.length > 0;
            }, function () {
                var inputDateStr = cmp.find("inputDate").getElement().value;
                $A.test.assertEquals("9/23/04", inputDateStr, "Dates are not the same and they should be");
                var inputTimeStr = cmp.find("inputTime").getElement().value;
                $A.test.assertEquals("4:30 PM", inputTimeStr, "Dates are not the same and they should be");
            });
        }
    },

    /**
     * Verify a value in LA time zone.
     */
    testTimeInLA: {
        browsers: ['DESKTOP'],
        attributes: {
            value: '2004-09-23T16:30:00.000Z',
            displayDatePicker: 'true',
            format: 'M/dd/yy h:mm A',
            dateFormat: 'M/dd/yy',
            timeFormat: 'h:mm A',
            timezone: 'America/Los_Angeles'
        },
        test: function (cmp) {
            $A.test.addWaitFor(true, function () {
                return cmp.find("inputDate").getElement().value.length > 0;
            }, function () {
                var inputDateStr = cmp.find("inputDate").getElement().value;
                $A.test.assertEquals("9/23/04", inputDateStr, "Dates are not the same and they should be");
                var inputTimeStr = cmp.find("inputTime").getElement().value;
                $A.test.assertEquals("9:30 AM", inputTimeStr, "Dates are not the same and they should be");
            });
        }
    },

    /**
     * Verify a value in NY time zone.
     */
    testTimeInNewYork: {
        browsers: ['DESKTOP'],
        attributes: {
            value: '2004-09-23T16:30:00.000Z',
            displayDatePicker: 'true',
            format: 'M/dd/yy h:mm A',
            dateFormat: 'M/dd/yy',
            timeFormat: 'h:mm A',
            timezone: 'America/New_York'
        },
        test: function (cmp) {
            $A.test.addWaitFor(true, function () {
                return cmp.find("inputDate").getElement().value.length > 0;
            }, function () {
                var inputDateStr = cmp.find("inputDate").getElement().value;
                $A.test.assertEquals("9/23/04", inputDateStr, "Dates are not the same and they should be");
                var inputTimeStr = cmp.find("inputTime").getElement().value;
                $A.test.assertEquals("12:30 PM", inputTimeStr, "Dates are not the same and they should be");
            });
        }
    },

    /**
     * Verify a value in default time zone.
     */
    testMidnightInGMT: {
        browsers: ['DESKTOP'],
        attributes: {
            value: '2004-09-23T00:00:00.000Z',
            displayDatePicker: 'true',
            format: 'M/dd/yy h:mm A',
            dateFormat: 'M/dd/yy',
            timeFormat: 'h:mm A',
            timezone: 'GMT'
        },
        test: function (cmp) {
            $A.test.addWaitFor(true, function () {
                return cmp.find("inputDate").getElement().value.length > 0;
            }, function () {
                var inputDateStr = cmp.find("inputDate").getElement().value;
                $A.test.assertEquals("9/23/04", inputDateStr, "Dates are not the same and they should be");
                var inputTimeStr = cmp.find("inputTime").getElement().value;
                $A.test.assertEquals("12:00 AM", inputTimeStr, "Dates are not the same and they should be");
            });
        }
    },

    /**
     * Verify a value in LA time zone.
     */
    testUTCMidnightInLA: {
        browsers: ['DESKTOP'],
        attributes: {
            value: '2004-09-23T00:00:00.000Z',
            displayDatePicker: 'true',
            format: 'M/dd/yy h:mm A',
            dateFormat: 'M/dd/yy',
            timeFormat: 'h:mm A',
            timezone: 'America/Los_Angeles'
        },
        test: function (cmp) {
            $A.test.addWaitFor(true, function () {
                return cmp.find("inputDate").getElement().value.length > 0;
            }, function () {
                var inputDateStr = cmp.find("inputDate").getElement().value;
                $A.test.assertEquals("9/22/04", inputDateStr, "Dates are not the same and they should be");
                var inputTimeStr = cmp.find("inputTime").getElement().value;
                $A.test.assertEquals("5:00 PM", inputTimeStr, "Dates are not the same and they should be");
            });
        }
    },

    /**
     * Verify a value in NY time zone.
     */
    testUTCMidnightInNewYork: {
        browsers: ['DESKTOP'],
        attributes: {
            value: '2004-09-23T00:00:00.000Z',
            displayDatePicker: 'true',
            format: 'M/dd/yy h:mm A',
            dateFormat: 'M/dd/yy',
            timeFormat: 'h:mm A',
            timezone: 'America/New_York'
        },
        test: function (cmp) {
            $A.test.addWaitFor(true, function () {
                return cmp.find("inputDate").getElement().value.length > 0;
            }, function () {
                var inputDateStr = cmp.find("inputDate").getElement().value;
                $A.test.assertEquals("9/22/04", inputDateStr, "Dates are not the same and they should be");
                var inputTimeStr = cmp.find("inputTime").getElement().value;
                $A.test.assertEquals("8:00 PM", inputTimeStr, "Dates are not the same and they should be");
            });
        }
    },

    /**
     * Verify a value in other language.
     * TODO: The usage is not valid anymore. Needs to change the app's locale on the server side.
     */
    _testLanguage: {
        browsers: ['DESKTOP'],
        attributes: {value: '2004-09-23T16:30:00.000Z', displayDatePicker: 'true', timezone: 'GMT', langLocale: 'fr'},
        test: function (cmp) {
            $A.test.addWaitFor(true, function () {
                return cmp.find("inputDate").getElement().value.length > 0;
            }, function () {
                var inputDateStr = cmp.find("inputDate").getElement().value;
                $A.test.assertEquals("sept. 23, 2004", inputDateStr, "Dates are not the same and they should be");
                var inputTimeStr = cmp.find("inputTime").getElement().value;
                $A.test.assertEquals("4:30 PM", inputTimeStr, "Dates are not the same and they should be");
            });
        }
    }
    /*eslint-disable semi */
})
/*eslint-enable semi */
