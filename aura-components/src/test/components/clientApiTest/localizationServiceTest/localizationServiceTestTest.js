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

/**
 * Most test cases for format*() APIs are covered by xUnit.
 * xUnit only supports locale en-US, so component tests are testing
 * for localized string.
 */
({ // eslint-disable-line no-unused-expressions
    /**
     * Test $A.localizationService.parseDateTime with the default locale
     */
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

    /**
     * Test $A.localizationService.parseDateTimeUTC with the default
     * locale
     */
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
     * Test $A.localizationService.formatDate with "fr_FR" and "th"
     * locales.
     */
    testFormatDateToLocalizedString: {
        test: [function testFrFR() {
            var expected = "mars 12, 2014 3:02:03 AM";
            var date = new Date(2014, 2, 12, 3, 2, 3);
            var format = "MMM dd, yyyy h:mm:ss A";

            var actual = $A.localizationService.formatDate(date, format, "fr_FR");

            $A.test.assertEquals(expected, actual, "formatDate() returns an unexpected date string");
        }, function testyyyyWithTh() {
            var expected = "มี.ค. 12, 2014 3:02:03 ก่อนเที่ยง";
            var date = new Date(2014, 2, 12, 3, 2, 3);
            var format = "MMM dd, yyyy h:mm:ss A";

            var actual = $A.localizationService.formatDate(date, format, "th");

            $A.test.assertEquals(expected, actual, "formatDate() for the 'th' locale and format with yyyy returns an unexpected date string");
        }, function testyyWithTh() {
            var expected = "มี.ค. 12, 14 3:02:03 ก่อนเที่ยง";
            var date = new Date(2014, 2, 12, 3, 2, 3);
            var format = "MMM dd, yy h:mm:ss A";

            var actual = $A.localizationService.formatDate(date, format, "th");

            $A.test.assertEquals(expected, actual, "formatDate() for the 'th' locale and format with yy returns an unexpected date string");
        }]
    },

    /**
     * Test $A.localizationService.formatDateUTC with "fr_FR" and "th"
     * locales.
     */
    testFormatDateUTCToLocalizedString: {
        test: [function testFrFR() {
            var expected = "mars 12, 2014 3:22:30 AM";
            var date = new Date(Date.UTC(2014, 2, 12, 3, 22, 30));
            var format = "MMM dd, yyyy h:mm:ss A";

            var actual = $A.localizationService.formatDateUTC(date, format, "fr_FR");

            $A.test.assertEquals(expected, actual, "formatDateUTC() for the 'fr_FR' returns an unexpected date string");
        }, function testyyyyWithTh() {
            var expected = "มี.ค. 12, 2014 3:22:30 ก่อนเที่ยง";
            var date = new Date(Date.UTC(2014, 2, 12, 3, 22, 30));
            var format = "MMM dd, yyyy h:mm:ss A";

            var actual = $A.localizationService.formatDateUTC(date, format, "th");

            $A.test.assertEquals(expected, actual, "formatDateUTC() for the 'th' locale and format with yyyy returns an unexpected date string");
        }, function testyyWithTh() {
            var expected = "มี.ค. 12, 14 3:22:30 ก่อนเที่ยง";
            var date = new Date(Date.UTC(2014, 2, 12, 3, 22, 30));
            var format = "MMM dd, yy h:mm:ss A";

            var actual = $A.localizationService.formatDateUTC(date, format, "th");

            $A.test.assertEquals(expected, actual, "formatDateUTC() for the 'th' locale and format with yy returns an unexpected date string");
        }]
    },

    /**
     * Test $A.localizationService.formatDateTime with "fr_FR" and "th"
     * locales.
     */
    testFormatDateTimeToLocalizedString: {
        test: [function testFrFR() {
            var expected = "mars 12, 2014 3:02:03 AM";
            var date = new Date(2014, 2, 12, 3, 2, 3);
            var format = "MMM dd, yyyy h:mm:ss A";

            var actual = $A.localizationService.formatDateTime(date, format, "fr_FR");

            $A.test.assertEquals(expected, actual, "formatDateTime() returns an unexpected date string");
        }, function testyyyyWithTh() {
            var expected = "มี.ค. 12, 2014 3:02:03 ก่อนเที่ยง";
            var date = new Date(2014, 2, 12, 3, 2, 3);
            var format = "MMM dd, yyyy h:mm:ss A";

            var actual = $A.localizationService.formatDateTime(date, format, "th");

            $A.test.assertEquals(expected, actual, "formatDateTime() for the 'th' locale and format with yyyy returns an unexpected date string");
        }, function testyyWithTh() {
            var expected = "มี.ค. 12, 14 3:02:03 ก่อนเที่ยง";
            var date = new Date(2014, 2, 12, 3, 2, 3);
            var format = "MMM dd, yy h:mm:ss A";

            var actual = $A.localizationService.formatDateTime(date, format, "th");

            $A.test.assertEquals(expected, actual, "formatDateTime() for the 'th' locale and format with yy returns an unexpected date string");
        }]
    },

    /**
     * Test $A.localizationService.formatDateTimeUTC with "fr_FR" and
     * "th" locales.
     */
    testFormatDateTimeUTCToLocalizedString: {
        test: [function testFrFR() {
            var expected = "mars 12, 2014 3:22:30 AM";
            var date = new Date(Date.UTC(2014, 2, 12, 3, 22, 30));
            var format = "MMM dd, yyyy h:mm:ss A";

            var actual = $A.localizationService.formatDateTimeUTC(date, format, "fr_FR");

            $A.test.assertEquals(expected, actual, "formatDateTimeUTC() for the 'fr_FR' returns an unexpected date string");
        }, function testyyyyWithTh() {
            var expected = "มี.ค. 12, 2014 3:22:30 ก่อนเที่ยง";
            var date = new Date(Date.UTC(2014, 2, 12, 3, 22, 30));
            var format = "MMM dd, yyyy h:mm:ss A";

            var actual = $A.localizationService.formatDateTimeUTC(date, format, "th");

            $A.test.assertEquals(expected, actual, "formatDateTimeUTC() for the 'th' locale and format with yyyy returns an unexpected date string");
        }, function testyyWithTh() {
            var expected = "มี.ค. 12, 14 3:22:30 ก่อนเที่ยง";
            var date = new Date(Date.UTC(2014, 2, 12, 3, 22, 30));
            var format = "MMM dd, yy h:mm:ss A";

            var actual = $A.localizationService.formatDateTimeUTC(date, format, "th");

            $A.test.assertEquals(expected, actual, "formatDateTimeUTC() for the 'th' locale and format with yy returns an unexpected date string");
        }]
    },
    
    /**
     * Test $A.localizationService.formatTime with "fr_FR" and "th"
     * locales.
     */
    testFormatTimeToLocalizedString: {
        test: [function testFrFR() {
            var expected = "mars 12, 2014 3:02:03 AM";
            var date = new Date(2014, 2, 12, 3, 2, 3);
            var format = "MMM dd, yyyy h:mm:ss A";

            var actual = $A.localizationService.formatTime(date, format, "fr_FR");

            $A.test.assertEquals(expected, actual, "formatTime() returns an unexpected date string");
        }, function testyyyyWithTh() {
            var expected = "มี.ค. 12, 2014 3:02:03 ก่อนเที่ยง";
            var date = new Date(2014, 2, 12, 3, 2, 3);
            var format = "MMM dd, yyyy h:mm:ss A";

            var actual = $A.localizationService.formatTime(date, format, "th");

            $A.test.assertEquals(expected, actual, "formatTime() for the 'th' locale and format with yyyy returns an unexpected date string");
        }, function testyyWithTh() {
            var expected = "มี.ค. 12, 14 3:02:03 ก่อนเที่ยง";
            var date = new Date(2014, 2, 12, 3, 2, 3);
            var format = "MMM dd, yy h:mm:ss A";

            var actual = $A.localizationService.formatTime(date, format, "th");

            $A.test.assertEquals(expected, actual, "formatTime() for the 'th' locale and format with yy returns an unexpected date string");
        }, 
        /**
         * Special case for ja. Intl.DateTimeFormat does not respect 2-digit for hour.
         */
        function testWithJaJP() {
            var expected = "03:02:03.000";
            var date = new Date(2014, 2, 12, 3, 2, 3);
            var format = "HH:mm:ss.SSS";
        
            var actual = $A.localizationService.formatTime(date, format, "ja_JP");
        
            $A.test.assertEquals(expected, actual, "formatDateTime() returns an unexpected date string");
        }]
    },

    /**
     * Test $A.localizationService.formatTimeUTC with "fr_FR" and "th"
     * locales.
     */
    testFormatTimeUTCToLocalizedString: {
        test: [function testFrFR() {
            var expected = "mars 12, 2014 3:22:30 AM";
            var date = new Date(Date.UTC(2014, 2, 12, 3, 22, 30));
            var format = "MMM dd, yyyy h:mm:ss A";

            var actual = $A.localizationService.formatTimeUTC(date, format, "fr_FR");

            $A.test.assertEquals(expected, actual, "formatTimeUTC() for the 'fr_FR' returns an unexpected date string");
        }, function testyyyyWithTh() {
            var expected = "มี.ค. 12, 2014 3:22:30 ก่อนเที่ยง";
            var date = new Date(Date.UTC(2014, 2, 12, 3, 22, 30));
            var format = "MMM dd, yyyy h:mm:ss A";

            var actual = $A.localizationService.formatTimeUTC(date, format, "th");

            $A.test.assertEquals(expected, actual, "formatTimeUTC() for the 'th' locale and format with yyyy returns an unexpected date string");
        }, function testyyWithTh() {
            var expected = "มี.ค. 12, 14 3:22:30 ก่อนเที่ยง";
            var date = new Date(Date.UTC(2014, 2, 12, 3, 22, 30));
            var format = "MMM dd, yy h:mm:ss A";

            var actual = $A.localizationService.formatTimeUTC(date, format, "th");

            $A.test.assertEquals(expected, actual, "formatTimeUTC() for the 'th' locale and format with yy returns an unexpected date string");
        }]
    }
})