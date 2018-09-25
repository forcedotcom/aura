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
     * Most test cases for format*() APIs are covered by xUnit.
     * xUnit only supports locale en-US, so component tests are testing for localized string.
     */
    testFormatDateTimeToLocalizedString: {
        test: function(cmp) {
            var expected = "mars 12, 2014 3:02:03 AM";
            var date = new Date(2014, 2, 12, 3, 2, 3);
            var format = "MMM dd, yyyy h:mm:ss A";

            var actual = $A.localizationService.formatDate(date, format, "fr_FR");

            $A.test.assertEquals(expected, actual, "formatDateTime() returns an unexpected date string");
        }
    },

    testFormatDateTimeUTCToLocalizedString: {
        test: function() {
            var expected = "mars 12, 2014 3:22:30 AM";
            var date = new Date(Date.UTC(2014, 2, 12, 3, 22, 30));
            var format = "MMM dd, yyyy h:mm:ss A";

            var actual = $A.localizationService.formatDateUTC(date, format, "fr_FR");

            $A.test.assertEquals(expected, actual, "formatDateUTC() returns an unexpected date string");
        }
    },

    /**
     * Special case for ja. Intl.DateTimeFormat does not respect 2-digit for hour.
     */
    testFormatTimeToLocalizedString: {
        test: function(cmp) {
            var expected = "03:02:03.000";
            var date = new Date(2014, 2, 12, 3, 2, 3);
            var format = "HH:mm:ss.SSS";

            var actual = $A.localizationService.formatTime(date, format, "ja_JP");

            $A.test.assertEquals(expected, actual, "formatDateTime() returns an unexpected date string");
        }
    }

})
