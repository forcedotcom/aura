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
     * Most cases are covered by xUnit, AuraLocalizationServiceTest.js
     * These tests are working as integration tests, since we have polyfill time zone data
     * of Intl API for IE11.
     */

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

    testSupportedTimeZone: {
        // Intl API throws error if it doesn't support the time zone. In localization service, we catch the error and warn.
        failOnWarning: true,
        test: function() {
            // https://help.salesforce.com/articleView?id=admin_supported_timezone.htm&type=5
            var timeZones = [
                "Africa/Algiers", "Africa/Cairo", "Africa/Casablanca", "Africa/Johannesburg", "Africa/Nairobi",
                "America/Adak", "America/Anchorage", "America/Argentina/Buenos_Aires", "America/Bogota", "America/Caracas",
                "America/Chicago", "America/Denver", "America/El_Salvador", "America/Halifax", "America/Indiana/Indianapolis",
                "America/Lima", "America/Los_Angeles", "America/Mazatlan", "America/Mexico_City", "America/New_York",
                "America/Panama", "America/Phoenix", "America/Puerto_Rico", "America/Santiago", "America/Sao_Paulo",
                "America/Scoresbysund", "America/St_Johns", "America/Tijuana", "Asia/Baghdad", "Asia/Baku", "Asia/Bangkok",
                "Asia/Beirut", "Asia/Colombo", "Asia/Dhaka", "Asia/Dubai", "Asia/Ho_Chi_Minh", "Asia/Hong_Kong", "Asia/Jakarta",
                "Asia/Jerusalem", "Asia/Kabul", "Asia/Kamchatka", "Asia/Karachi", "Asia/Kathmandu", "Asia/Kolkata",
                "Asia/Kuala_Lumpur", "Asia/Kuwait", "Asia/Manila", "Asia/Rangoon", "Asia/Riyadh", "Asia/Seoul", "Asia/Shanghai",
                "Asia/Singapore", "Asia/Taipei", "Asia/Tashkent", "Asia/Tbilisi", "Asia/Tehran", "Asia/Tokyo", "Asia/Yekaterinburg",
                "Asia/Yerevan", "Atlantic/Azores", "Atlantic/Bermuda", "Atlantic/Cape_Verde", "Atlantic/South_Georgia",
                "Australia/Adelaide", "Australia/Brisbane", "Australia/Darwin", "Australia/Lord_Howe", "Australia/Perth",
                "Australia/Sydney", "Europe/Amsterdam", "Europe/Athens", "Europe/Berlin", "Europe/Brussels", "Europe/Bucharest",
                "Europe/Dublin", "Europe/Helsinki", "Europe/Istanbul", "Europe/Lisbon", "Europe/London", "Europe/Minsk", "Europe/Moscow",
                "Europe/Paris", "Europe/Prague", "Europe/Rome", "GMT", "Pacific/Auckland", "Pacific/Chatham", "Pacific/Enderbury",
                "Pacific/Fiji", "Pacific/Gambier", "Pacific/Guadalcanal", "Pacific/Honolulu", "Pacific/Kiritimati", "Pacific/Marquesas",
                "Pacific/Niue", "Pacific/Norfolk", "Pacific/Pago_Pago", "Pacific/Pitcairn", "Pacific/Tongatapu"
            ];

            timeZones.forEach(function(timeZone) {
                // WallTimeToUTC is currently sync method
                $A.localizationService.WallTimeToUTC(new Date(), timeZone, function(utc) {
                    $A.test.assertFalse(isNaN(utc.getTime()), "Failed to convert datetime for time zone: " + timeZone);
                });
            });
        }
    }

})
