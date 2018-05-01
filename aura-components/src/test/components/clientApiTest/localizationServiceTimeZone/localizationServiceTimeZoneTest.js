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
     * In the case, for zone "America/New_York", 02:00 am clocks were turned backward 1 hour to
     * 01:00 am on Nov 3, 2013.
     */
    testUTCToWallTimeWithTimeDuringDSTChange: {
        test: function() {
            // 2013-11-03T04:30:30
            var dateInDaylightTime = new Date(Date.UTC(2013, 10, 3, 4, 30, 30));
            $A.localizationService.UTCToWallTime(dateInDaylightTime, "America/New_York", function(walltime) {
                var actual = walltime.toISOString();
                // UTC-4
                $A.test.assertEquals("2013-11-03T00:30:30.000Z", actual,
                        "Incorrect time from UTCToWallTime when given time is right before DST ends");
            });

            // 2013-11-03T07:30:30
            var dateInStandardTime = new Date(Date.UTC(2013, 10, 3, 7, 30, 30));
            $A.localizationService.UTCToWallTime(dateInStandardTime, "America/New_York", function(walltime) {
                var actual = walltime.toISOString();
                // UTC-5
                $A.test.assertEquals("2013-11-03T02:30:30.000Z", actual,
                        "Incorrect time from UTCToWallTime when given time is right after DST ends");
            });
        }
    },

    /*
     * Verify WallTimeToUTC conversion for the time during the Daylight Saving Time change.
     * This is an edge case but important. Since date object includes browser's timezone offset,
     * the test is verify DST is applied for given timezone vs for browser's timezone.
     *
     * In the case, for zone "Europe/Berlin", 03:00 am clocks were turned backward 1 hour to
     * 02:00 am on Oct 27, 2013.
     */
    testWallTimeToUTCWithTimeDuringDSTChange: {
        test: function() {
            // 2013-10-27T01:30:30
            var dateInDaylightTime = new Date(Date.UTC(2013, 9, 27, 1, 30, 30));
            $A.localizationService.WallTimeToUTC(dateInDaylightTime, "Europe/Berlin", function(utc) {
                // UTC+2
                var actual = utc.toISOString();
                $A.test.assertEquals("2013-10-26T23:30:30.000Z", actual,
                        "Incorrect time from WallTimeToUTC when given time is right before DST ends");
            });

            // 2013-10-27T02:30:30
            var dateInStandardTime = new Date(Date.UTC(2013, 9, 27, 3, 30, 30));
            $A.localizationService.WallTimeToUTC(dateInStandardTime, "Europe/Berlin", function(utc) {
                // UTC+1
                var actual = utc.toISOString();
                $A.test.assertEquals("2013-10-27T02:30:30.000Z", actual,
                        "Incorrect time from WallTimeToUTC when given time is right after DST ends");
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
