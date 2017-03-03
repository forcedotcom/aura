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
    testUTCToWallTime: {
        test: function() {
            var date = $A.localizationService.parseDateTimeISO8601("2013-12-03T06:01:00.000Z");
            var format = "MMM d, yyyy h:mm:ss a";
            var expected = "Dec 3, 2013 1:01:00 AM";

            $A.localizationService.UTCToWallTime(date, "America/New_York", function(walltime) {
                var actual = $A.localizationService.formatDateTimeUTC(walltime, format);
                $A.test.assertEquals(expected, actual);
            });
        }
    },

    testUTCToWallTimeWithTimeInDST: {
        test: function() {
            var date = $A.localizationService.parseDateTimeISO8601("2013-10-03T06:01:00.000Z");
            var format = "MMM d, yyyy h:mm:ss a";
            var expected = "Oct 3, 2013 2:01:00 AM";

            $A.localizationService.UTCToWallTime(date, "America/New_York", function(walltime) {
                var actual = $A.localizationService.formatDateTimeUTC(walltime, format);
                $A.test.assertEquals(expected, actual,
                    "Incorrect time from UTCToWallTime when given time is in DST.");
            });
        }
    },

    /*
     * Verify UTCToWallTime conversion for the time during the Daylight Saving Time change.
     * This is an edge case but important. Since date object includes browser's timezone offset,
     * the test is verify DST is applied for given timezone vs for browser's timezone.
     *
     * In the case, for zone "America/New_York", 2:00:00 am clocks were turned backward 1 hour to
     * 1:00:00 am on Nov 3, 2013.
     */
    testUTCToWallTimeWithTimeDuringDSTChange: {
        test: function() {
            var dateInDST = $A.localizationService.parseDateTimeISO8601("2013-11-03T05:01:00.000Z");
            var dateOutOfDST = $A.localizationService.parseDateTimeISO8601("2013-11-03T06:01:00.000Z");
            var format = "MMM d, yyyy h:mm:ss a";
            var expected = "Nov 3, 2013 1:01:00 AM";

            $A.localizationService.UTCToWallTime(dateInDST, "America/New_York", function(walltime) {
                var actual = $A.localizationService.formatDateTimeUTC(walltime, format);
                $A.test.assertEquals(expected, actual,
                        "Incorrect time from UTCToWallTime when given time is right before DST ends");
            });

            $A.localizationService.UTCToWallTime(dateOutOfDST, "America/New_York", function(walltime) {
                var actual = $A.localizationService.formatDateTimeUTC(walltime, format);
                $A.test.assertEquals(expected, actual,
                        "Incorrect time from UTCToWallTime when given time is right after DST ends");
            });
        }
    },

    testUTCToWallTimeForZoneWithPositiveOffset: {
        test: function() {
            var date = $A.localizationService.parseDateTimeISO8601("2013-12-03T06:01:00.000Z");
            var format = "MMM d, yyyy h:mm:ss a";
            var expected = "Dec 3, 2013 7:01:00 AM";

            $A.localizationService.UTCToWallTime(date, "Europe/Berlin", function(walltime) {
                var actual = $A.localizationService.formatDateTimeUTC(walltime, format);
                $A.test.assertEquals(expected, actual,
                        "Incorrect time from UTCToWallTime when given zone has positive offset");
            });
        }
    },

    testUTCToWallTimeForGMT: {
        test: function() {
            var date = $A.localizationService.parseDateTimeISO8601("2013-12-03T06:01:00.000Z");
            var format = "MMM d, yyyy h:mm:ss a";
            var expected = "Dec 3, 2013 6:01:00 AM";

            $A.localizationService.UTCToWallTime(date, "GMT", function(walltime) {
                var actual = $A.localizationService.formatDateTimeUTC(walltime, format);
                $A.test.assertEquals(expected, actual,
                        "Incorrect time from UTCToWallTime when given zone is GMT");
            });
        }
    },

    testWallTimeToUTC: {
        test: function() {
            var format = "MMM DD, YYYY h:mm:ss A";
            var date = $A.localizationService.parseDateTime("Dec 23, 2013 3:30:00 PM", format);
            var expected = "Dec 23, 2013 11:30:00 PM";

            $A.localizationService.WallTimeToUTC(date, "America/Los_Angeles", function(utc){
                var actual = $A.localizationService.formatDateTime(utc, format);
                $A.test.assertEquals(expected, actual, "Incorrect time from WallTimeToUTC");
            });
        }
    },

    testWallTimeToUTCWithTimeInDST: {
        test: function() {
            var format = "MMM DD, YYYY h:mm:ss A";
            var date = $A.localizationService.parseDateTime("Sep 23, 2013 4:30:00 PM", format);
            var expected = "Sep 23, 2013 11:30:00 PM";

            $A.localizationService.WallTimeToUTC(date, "America/Los_Angeles", function(utc){
                var actual = $A.localizationService.formatDateTime(utc, format);
                $A.test.assertEquals(expected, actual,
                        "Incorrect time from WallTimeToUTC when given time is in DST");
            });
        }
    },

    testWallTimeToUTCForZoneWithPositiveOffset: {
        test: function() {
            var format = "MMM DD, YYYY h:mm:ss A";
            var date = $A.localizationService.parseDateTime("Dec 24, 2013 12:30:00 AM", format);
            var expected = "Dec 23, 2013 11:30:00 PM";

            $A.localizationService.WallTimeToUTC(date, "Europe/Berlin", function(utc){
                var actual = $A.localizationService.formatDateTime(utc, format);
                $A.test.assertEquals(expected, actual,
                        "Incorrect time from WallTimeToUTC when given zone has positive offset");
            });
        }
    },

    /*
     * Verify WallTimeToUTC conversion for the time during the Daylight Saving Time change.
     * This is an edge case but important. Since date object includes browser's timezone offset,
     * the test is verify DST is applied for given timezone vs for browser's timezone.
     *
     * In the case, for zone "Europe/Berlin", 3:00:00 am clocks were turned backward 1 hour to
     * 2:00:00 am am on Oct 27, 2013.
     */
    testWallTimeToUTCWithTimeDuringDSTChange: {
        test: function() {
            var format = "MMM d, yyyy h:mm:ss a";
            var date = $A.localizationService.parseDateTime("Oct 27, 2013 02:30:00 AM", format);
            var expected = "Oct 27, 2013 1:30:00 AM";

            $A.localizationService.WallTimeToUTC(date, "Europe/Berlin", function(utc) {
                var actual = $A.localizationService.formatDateTime(utc, format);
                $A.test.assertEquals(expected, actual,
                        "Incorrect time from WallTimeToUTC when given time is during DST ends");
            });
        }
    },

    testWallTimeToUTCForGMT: {
        test:function() {
            var format = "MMM DD, YYYY h:mm:ss A";
            var date = $A.localizationService.parseDateTime("Dec 23, 2013 3:30:00 PM", format);
            var expected = "Dec 23, 2013 3:30:00 PM";

            $A.localizationService.WallTimeToUTC(date, "GMT", function(utc){
                var actual = $A.localizationService.formatDateTime(utc, format);
                $A.test.assertEquals(expected, actual,
                        "Incorrect time from WallTimeToUTC when given zone is GMT");
            });
        }
    },

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

    testParseDateTimeISO8601: {
        test: function() {
            var format =  "MMM DD, YYYY h:mm:ss A";
            var expected = "Sep 23, 2014 4:30:00 PM";
            var dateTimeString = "2014-09-23T16:30:00";

            var date = $A.localizationService.parseDateTimeISO8601(dateTimeString);

            var actual = $A.localizationService.formatDateTime(date, format);
            $A.test.assertEquals(actual, expected, "parseDateTimeISO8601() returns a incorrect date");
        }
    },

    testGetDateStringBasedOnTimezoneForSameZone: {
        test: function() {
            var expected = "2015-7-6";
            var date = $A.localizationService.parseDateTimeISO8601("2015-07-06T00:00:00+02:00");
            $A.localizationService.getDateStringBasedOnTimezone("Europe/Berlin", date, function(dateString){
                $A.test.assertEquals(expected, dateString);
            });
        }
    },

    testGetDateStringBasedOnTimezoneForDifferentZones: {
        test: function() {
            var expected = "2015-7-5";
            var date = $A.localizationService.parseDateTimeISO8601("2015-07-06T00:00:00+02:00");
            // Zone "America/Los_Angeles" is still on 2015-7-5
            $A.localizationService.getDateStringBasedOnTimezone("America/Los_Angeles", date, function(dateString){
                $A.test.assertEquals(expected, dateString);
            });
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

    testFormatDateForDateWithTimezone: {
        test: function() {
            var expected = "Sep 22, 2004";

            var actual = $A.localizationService.formatDate("2004-09-22T18:00:00-07:00", "MMM DD, YYYY");

            $A.test.assertEquals(expected, actual, "formatDate() returns an unexpected date string");
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

            var actual = $A.localizationService.formatTimeUTC("2014-09-23T16:30:00", format);

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
    },

    testIsSameForSameDates: {
        test: function() {
            var date1 = $A.localizationService.parseDateTime("2014-09-23T16:30:00");
            var date2 = $A.localizationService.parseDateTime("2014-09-23T16:30:00");

            var actual = $A.localizationService.isSame(date1, date2);

            $A.test.assertTrue(actual, "isSame() should return true for same dates.");
        }
    },

    testIsSameForDifferentDates: {
        test: function() {
            var date1 = $A.localizationService.parseDateTime("2014-09-01T16:30:00");
            var date2 = $A.localizationService.parseDateTime("2014-09-23T16:30:00");

            var actual = $A.localizationService.isSame(date1, date2);

            $A.test.assertFalse(actual, "isSame() should return false for different dates.");
        }
    },

    testIsSameForSameValueInGivenUnit: {
        test: function() {
            var dateTime1 = $A.localizationService.parseDateTime("2014-09-01");
            var dateTime2 = $A.localizationService.parseDateTime("2014-09-23");

            var actual = $A.localizationService.isSame(dateTime1, dateTime2, "years");

            $A.test.assertTrue(actual, "isSame() should return true for same years when using years as unit.");
        }
    },

    testIsSameForDifferentValueInGivenUnit: {
        test: function() {
            var dateTime1 = $A.localizationService.parseDateTime("2014-09-01T16:30:00");
            var dateTime2 = $A.localizationService.parseDateTime("2014-09-01T23:30:00");

            var actual = $A.localizationService.isSame(dateTime1, dateTime2, "hours");

            $A.test.assertFalse(actual, "isSame() should return false for different hours when using hours as unit.");
        }
    },


})
