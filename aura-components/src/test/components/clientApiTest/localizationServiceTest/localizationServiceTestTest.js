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

    testParseDateTime: {
        test: function() {
            var format =  "MMM DD, YYYY h:mm:ss A";
            var dateString = "Sep 23, 2014 4:30:00 PM";

            var date = $A.localizationService.parseDateTime(dateString, format);

            // date object contains browser timezone offset, so formatting the date to verify
            var actual = $A.localizationService.formatDateTime(date, format);
            $A.test.assertEquals(dateString, actual, "parseDateTime() returns a incorrect date");
        }
    },

    testParseDateTimeUTC: {
        test: function() {
            var format =  "MMM DD, YYYY h:mm:ss A";
            var dateString = "Sep 23, 2014 4:30:00 PM";

            var date = $A.localizationService.parseDateTimeUTC(dateString, format);

            var actual = $A.localizationService.formatDateTimeUTC(date, format);
            $A.test.assertEquals(dateString, actual, "parseDateTimeUTC() returns a incorrect date");
        }
    },

    /**
     * TODO: needs to verify the behaviors are consistent across browsers with or without 'Z' in the string "2014-09-23T16:30:00" Vs. "2014-09-23T16:30:00Z"
     * Seems moment has different behaviors between "2014-09-23T16:30:00" and "2014-09-23T16:30:00Z"
     */
    testParseDateTimeISO8601: {
        test: function() {
            var format =  "MMM DD, YYYY h:mm:ss A";
            var expected = "Sep 23, 2014 4:30:00 PM";
            var dateTimeString = "2014-09-23T16:30:00";

            var date = $A.localizationService.parseDateTimeISO8601(dateTimeString);

            var actual = $A.localizationService.formatDateTime(date, format);
            $A.test.assertEquals(expected, actual, "parseDateTimeISO8601() returns a incorrect date");
        }
    },

    testParseDateTimeISO8601ForInvalidDatetimeString: {
        test: function() {
            var dateTimeString = "2014-09-43";

            var actual = $A.localizationService.parseDateTimeISO8601(dateTimeString);

            $A.test.assertNull(actual, "parseDateTimeISO8601() should return null for invalid datetime");
        }
    },

    testFormatDate: {
        test: function() {
            var expected = "Sep 23, 2004";

            var actual = $A.localizationService.formatDate("2004-09-23", "MMM DD, YYYY");

            $A.test.assertEquals(expected, actual, "formatDate() returns an unexpected date string");
        }
    },

    testFormatDateWithInvalidDate: {
        test: function() {
            var expected = "Invalid date value";

            try {
                $A.localizationService.formatDate("Invalid", "MMM DD, YYYY");
                $A.test.fail("Expecting throw an error.");
            } catch(e) {
                $A.test.assertEquals(expected, e.message);
            }

        }
    },

    testFormatDateUsesFormatInLocaleProviderIfFormatIsFalsy: {
        test: function() {
            var format = $A.get("$Locale.dateFormat");
            var expected = $A.localizationService.formatDate("2004-09-23", format);

            var actual = $A.localizationService.formatDate("2004-09-23", "");

            $A.test.assertEquals(expected, actual, "formatDate() returns an unexpected date string");
        }
    },

    testFormatDateUTC: {
        test: function() {
            var expected = "Sep 23, 2004";

            var actual = $A.localizationService.formatDateUTC("2004-09-23", "MMM DD, YYYY");

            $A.test.assertEquals(expected, actual, "formatDateUTC() returns an unexpected date string");
        }
    },

    testFormatDateUTCWithInvalidDate: {
        test: function() {
            var expected = "Invalid date value";

            try {
                $A.localizationService.formatDateUTC("Invalid", "MMM DD, YYYY");
                $A.test.fail("Expecting throw an error.");
            } catch(e) {
                $A.test.assertEquals(expected, e.message);
            }

        }
    },

    testFormatDateUTCForDateWithTimezone: {
        test: function() {
            var expected = "Sep 23, 2004";

            var actual = $A.localizationService.formatDateUTC("2004-09-22T18:00:00-07:00", "MMM DD, YYYY");

            $A.test.assertEquals(expected, actual, "formatDateUTC() returns an unexpected date string");
        }
    },

    testFormatDateTime: {
        test: function() {
            var format =  "MMM DD, YYYY h:mm:ss A";
            var expected = "Sep 23, 2014 4:30:00 PM";

            var actual = $A.localizationService.formatDateTime("2014-09-23T16:30:00", format);

            $A.test.assertEquals(expected, actual, "formatDateTime() returns an unexpected date string");
        }
    },

    testFormatDateTimeWithInvalidDate: {
        test: function() {
            var expected = "Invalid date time value";

            try {
                $A.localizationService.formatDateTime("Invalid", "MMM DD, YYYY");
                $A.test.fail("Expecting throw an error.");
            } catch(e) {
                $A.test.assertEquals(expected, e.message);
            }

        }
    },

    testFormatDateTimeUTC: {
        test: function() {
            var format =  "MMM DD, YYYY h:mm:ss A";
            var expected = "Sep 23, 2014 4:30:00 PM";

            var actual = $A.localizationService.formatDateTimeUTC("2014-09-23T16:30:00", format);

            $A.test.assertEquals(expected, actual, "formatDateTimeUTC() returns an unexpected date string");
        }
    },

    testFormatDateTimeUTCWithInvalidDate: {
        test: function() {
            var expected = "Invalid date time value";

            try {
                $A.localizationService.formatDateTimeUTC("Invalid", "MMM DD, YYYY");
                $A.test.fail("Expecting throw an error.");
            } catch(e) {
                $A.test.assertEquals(expected, e.message);
            }

        }
    },

    testFormatDateTimeUTCForDateWithTimezone: {
        test: function() {
            var format =  "MMM DD, YYYY h:mm:ss A";
            var expected = "Sep 23, 2004 1:00:00 AM";

            var actual = $A.localizationService.formatDateTimeUTC("2004-09-22T18:00:00-07:00", format);

            $A.test.assertEquals(expected, actual, "formatDateTimeUTC() returns an unexpected date string");
        }
    },

    testFormatDateTimeUTCWith24HrFormat: {
        test: function() {
            var format =  "MMM DD, YYYY HH:mm:ss";
            var expected = "Oct 31, 2004 00:30:00";

            var actual = $A.localizationService.formatDateTimeUTC("2004-10-31T00:30:00", format);

            $A.test.assertEquals(expected, actual, "formatDateTimeUTC() returns an unexpected date string");
        }
    },

    testFormatDateTimeUTCWith12HrFormat: {
        test: function() {
            var format =  "MMM DD, YYYY hh:mm:ss A";
            var expected = "Oct 31, 2004 12:30:00 AM";

            var actual = $A.localizationService.formatDateTimeUTC("2004-10-31T00:30:00", format);

            $A.test.assertEquals(expected, actual, "formatDateTimeUTC() returns an unexpected date string");
        }
    },

    testFormatTime: {
        test: function() {
            var format =  "h:mm:ss A";
            var expected = "4:30:00 PM";

            var actual = $A.localizationService.formatTime("2014-09-23T16:30:00", format);

            $A.test.assertEquals(expected, actual, "formatTime() returns an unexpected date string");
        }
    },

    testFormatTimeWithInvalidDate: {
        test: function() {
            var expected = "Invalid time value";

            try {
                $A.localizationService.formatTime("Invalid", "MMM DD, YYYY");
                $A.test.fail("Expecting throw an error.");
            } catch(e) {
                $A.test.assertEquals(expected, e.message);
            }

        }
    },

    testFormatTimeUTC: {
        test: function() {
            var format =  "h:mm:ss A";
            var expected = "4:30:00 PM";

            var actual = $A.localizationService.formatTimeUTC("2014-09-23T16:30:00Z", format);

            $A.test.assertEquals(expected, actual, "formatTimeUTC() returns an unexpected date string");
        }
    },

    testFormatTimeUTCWithInvalidDate: {
        test: function() {
            var expected = "Invalid time value";

            try {
                $A.localizationService.formatTimeUTC("Invalid", "MMM DD, YYYY");
                $A.test.fail("Expecting throw an error.");
            } catch(e) {
                $A.test.assertEquals(expected, e.message);
            }

        }
    }

})
