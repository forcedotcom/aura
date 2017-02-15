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
                var actual = $A.localizationService.formatDateTimeUTC(walltime, format, "en_US");
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
                var actual = $A.localizationService.formatDateTimeUTC(walltime, format, "en_US");
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
                var actual = $A.localizationService.formatDateTimeUTC(walltime, format, "en_US");
                $A.test.assertEquals(expected, actual,
                        "Incorrect time from UTCToWallTime when given time is right before DST ends");
            });

            $A.localizationService.UTCToWallTime(dateOutOfDST, "America/New_York", function(walltime) {
                var actual = $A.localizationService.formatDateTimeUTC(walltime, format, "en_US");
                $A.test.assertEquals(expected, actual
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
                var actual = $A.localizationService.formatDateTimeUTC(walltime, format, "en_US");
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
                var actual = $A.localizationService.formatDateTimeUTC(walltime, format, "en_US");
                $A.test.assertEquals(expected, actual,
                        "Incorrect time from UTCToWallTime when given zone is GMT");
            });
        }
    },

    testWallTimeToUTC: {
        test: function() {
            var format = "MMM DD, YYYY h:mm:ss A";
            var date = $A.localizationService.parseDateTime("Dec 23, 2013 3:30:00 PM", format, "en_US");
            var expected = "Dec 23, 2013 11:30:00 PM";

            $A.localizationService.WallTimeToUTC(date, "America/Los_Angeles", function(utc){
                var actual = $A.localizationService.formatDateTime(utc, format, "en");
                $A.test.assertEquals(expected, actual, "Incorrect time from WallTimeToUTC");
            });
        }
    },

    testWallTimeToUTCWithTimeInDST: {
        test: function() {
            var format = "MMM DD, YYYY h:mm:ss A";
            var date = $A.localizationService.parseDateTime("Sep 23, 2013 4:30:00 PM", format, "en_US");
            var expected = "Sep 23, 2013 11:30:00 PM";

            $A.localizationService.WallTimeToUTC(date, "America/Los_Angeles", function(utc){
                var actual = $A.localizationService.formatDateTime(utc, format, "en");
                $A.test.assertEquals(expected, actual,
                        "Incorrect time from WallTimeToUTC when given time is in DST");
            });
        }
    },

    testWallTimeToUTCForZoneWithPositiveOffset: {
        test: function() {
            var format = "MMM DD, YYYY h:mm:ss A";
            var date = $A.localizationService.parseDateTime("Dec 24, 2013 12:30:00 AM", format, "en_US");
            var expected = "Dec 23, 2013 11:30:00 PM";

            $A.localizationService.WallTimeToUTC(date, "Europe/Berlin", function(utc){
                var actual = $A.localizationService.formatDateTime(utc, format, "en");
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
            var locale = "en_US";
            var date = $A.localizationService.parseDateTime("Oct 27, 2013 02:30:00 AM", format, locale);
            var expected = "Oct 27, 2013 1:30:00 AM";

            $A.localizationService.WallTimeToUTC(date, "Europe/Berlin", function(utc) {
                var actual = $A.localizationService.formatDateTime(utc, format, locale);
                $A.test.assertEquals(expected, actual,
                        "Incorrect time from WallTimeToUTC when given time is during DST ends");
            });
        }
    },

    testWallTimeToUTCForGMT: {
        test:function() {
            var format = "MMM DD, YYYY h:mm:ss A";
            var locale = "en_US";
            var date = $A.localizationService.parseDateTime("Dec 23, 2013 3:30:00 PM", format, locale);
            var expected = "Dec 23, 2013 3:30:00 PM";

            $A.localizationService.WallTimeToUTC(date, "GMT", function(utc){
                var actual = $A.localizationService.formatDateTime(utc, format, locale);
                $A.test.assertEquals(expected, actual,
                        "Incorrect time from WallTimeToUTC when given zone is GMT");
            });
        }
    },

    testParseDateTime: {
        test: function() {
            var format =  "MMM DD, YYYY h:mm:ss A";
            var dateString = "Sep 23, 2014 4:30:00 PM";
            var locale = "en_US";

            var date = $A.localizationService.parseDateTime(dateString, format, locale);

            // date object contains browser timezone offset, so formatting the date to verify
            var actual = $A.localizationService.formatDateTime(date, format, locale);
            $A.test.assertEquals(dateString, actual, "ParseDateTime() returns a incorrect date");
        }
    },

    testParseDateTimeUTC: {
        test: function() {
            var format =  "MMM DD, YYYY h:mm:ss A";
            var dateString = "Sep 23, 2014 4:30:00 PM";
            var locale = "en_US";

            var date = $A.localizationService.parseDateTimeUTC(dateString, format, locale);

            var actual = $A.localizationService.formatDateTimeUTC(date, format, locale);
            $A.test.assertEquals(dateString, actual, "ParseDateTimeUTC() returns a incorrect date");
        }
    },

    testParseDateTimeISO8601:{
        test: function() {
            var format =  "MMM DD, YYYY h:mm:ss A";
            var expected = "Sep 23, 2014 4:30:00 PM";
            var dateTimeString = "2014-09-23T16:30:00";
            var locale = "en_US";

            var date = $A.localizationService.parseDateTimeISO8601(dateTimeString);

            var actual = $A.localizationService.formatDateTime(date, format, locale);
            $A.test.assertEquals(actual, expected, "ParseDateTimeISO8601() returns a incorrect date");
        }
    },
})
