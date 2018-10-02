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
 * Most test cases for format*() APIs are covered by xUnit. xUnit only supports
 * locale en-US, so component tests are testing for localized string.
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
     * Verify localized date time strings from formatDateTime APIs are parsable by parseDateTime()
     * in strict mode for supported locales.
     */
    testParseLocalizedDateTimeString: {
        test: function() {
            var testData = [
                {"locale": "da",    "dateTimeFormat": "dd-MM-yyyy HH:mm:ss",      "languageName": "Danish"},
                {"locale": "de",    "dateTimeFormat": "dd.MM.yyyy HH:mm:ss",      "languageName": "German"},
                {"locale": "es",    "dateTimeFormat": "dd-MMM-yyyy H:mm:ss",      "languageName": "Spanish"},
                {"locale": "es_MX", "dateTimeFormat": "d/MM/yyyy hh:mm:ss a",     "languageName": "Spanish (Mexico)"},
                {"locale": "fi",    "dateTimeFormat": "d.M.yyyy H:mm:ss",         "languageName": "Finnish"},
                {"locale": "fr",    "dateTimeFormat": "d MMM yyyy HH:mm:ss",      "languageName": "French"},
                {"locale": "it",    "dateTimeFormat": "d-MMM-yyyy H.mm.ss",       "languageName": "Italian"},
                {"locale": "ja",    "dateTimeFormat": "yyyy/MM/dd H:mm:ss",       "languageName": "Japanese"},
                {"locale": "ko",    "dateTimeFormat": "yyyy. M. d a h:mm:ss",     "languageName": "Korean"},
                {"locale": "nl_NL", "dateTimeFormat": "d-MMM-yyyy H:mm:ss",       "languageName": "Dutch"},
                {"locale": "no",    "dateTimeFormat": "dd.MMM.yyyy HH:mm:ss",     "languageName": "Norwegian"},
                {"locale": "pt_BR", "dateTimeFormat": "dd/MM/yyyy HH:mm:ss",      "languageName": "Portuguese (Brazil)"},
                {"locale": "sv",    "dateTimeFormat": "yyyy-MMM-dd HH:mm:ss",     "languageName": "Swedish"},
                {"locale": "th",    "dateTimeFormat": "d MMM yyyy, H:mm:ss",      "languageName": "Thai"},
                {"locale": "zh_CN", "dateTimeFormat": "yyyy-M-d H:mm:ss",         "languageName": "Chinese (Simplified)"},
                {"locale": "zh_TW", "dateTimeFormat": "yyyy/M/d a hh:mm:ss",      "languageName": "Chinese (Traditional)"},

                // TODO: Russian uses different words for a month in a date VS standalone month
                // {"locale": "ru",    "dateTimeFormat": "d MMMM yyyy 'г.' H:mm:ss", "languageName": "Russian"},

                // TODO: for Arabic, we need to add a number system to parse localized numbers
                // {"locale": "ar",    "dateTimeFormat": "dd/MM/yyyy hh:mm:ss a",    "languageName": "Arabic"},

                {"locale": "bg",    "dateTimeFormat": "dd.MM.yyyy HH:mm:ss",      "languageName": "Bulgarian"},
                {"locale": "hr",    "dateTimeFormat": "dd.MM.yyyy. HH:mm:ss",     "languageName": "Croatian"},
                {"locale": "cs",    "dateTimeFormat": "d.M.yyyy H:mm:ss",         "languageName": "Czech"},
                {"locale": "en_GB", "dateTimeFormat": "dd-MMM-yyyy HH:mm:ss",     "languageName": "English (UK)"},
                {"locale": "el",    "dateTimeFormat": "d MMM yyyy h:mm:ss a",     "languageName": "Greek"},
                {"locale": "iw",    "dateTimeFormat": "HH:mm:ss dd/MM/yyyy",      "languageName": "Hebrew"},
                {"locale": "hu",    "dateTimeFormat": "yyyy.MM.dd. H:mm:ss",      "languageName": "Hungarian"},
                {"locale": "in",    "dateTimeFormat": "dd MMM yyyy H:mm:ss",      "languageName": "Indonesian"},
                {"locale": "pl",    "dateTimeFormat": "yyyy-MM-dd HH:mm:ss",      "languageName": "Polish"},
                {"locale": "pt_PT", "dateTimeFormat": "d/MMM/yyyy H:mm:ss",       "languageName": "Portuguese (Portugal)"},
                {"locale": "ro",    "dateTimeFormat": "dd.MM.yyyy HH:mm:ss",      "languageName": "Romanian"},
                {"locale": "sk",    "dateTimeFormat": "d.M.yyyy H:mm:ss",         "languageName": "Slovak"},
                {"locale": "sl",    "dateTimeFormat": "d.M.yyyy H:mm:ss",         "languageName": "Slovenian"},
                {"locale": "tr",    "dateTimeFormat": "dd.MMM.yyyy HH:mm:ss",     "languageName": "Turkish"},
                {"locale": "uk",    "dateTimeFormat": "d MMM yyyy H:mm:ss",       "languageName": "Ukrainian"},
                {"locale": "vi",    "dateTimeFormat": "HH:mm:ss dd-MM-yyyy",      "languageName": "Vietnamese"}
            ];

            var date = new Date(2018, 3, 14, 2, 30);
            var expected = date.toISOString();

            testData.forEach(function(data) {
                var locale = data["locale"];
                var format = data["dateTimeFormat"];

                var dateTimeString = $A.localizationService.formatDate(date, format, locale);

                var actual = $A.localizationService.parseDateTime(dateTimeString, format, locale, true);

                $A.test.assertEquals(expected, actual && actual.toISOString(),
                        "Found unexpected date from parsed localized date time string in language " + data["languageName"] + ": " + dateTimeString);
            });
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
            var expected = "มี.ค. 12, 2014 03:02:03";
            var date = new Date(2014, 2, 12, 3, 2, 3);
            var format = "MMM dd, yyyy kk:mm:ss";

            var actual = $A.localizationService.formatDate(date, format, "th");

            $A.test.assertEquals(expected, actual, "formatDate() for the 'th' locale and format with yyyy returns an unexpected date string");
        }, function testyyWithTh() {
            var expected = "มี.ค. 12, 14 03:02:03";
            var date = new Date(2014, 2, 12, 3, 2, 3);
            var format = "MMM dd, yy kk:mm:ss";

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
            var expected = "มี.ค. 12, 2014 03:22:30";
            var date = new Date(Date.UTC(2014, 2, 12, 3, 22, 30));
            var format = "MMM dd, yyyy kk:mm:ss";

            var actual = $A.localizationService.formatDateUTC(date, format, "th");

            $A.test.assertEquals(expected, actual, "formatDateUTC() for the 'th' locale and format with yyyy returns an unexpected date string");
        }, function testyyWithTh() {
            var expected = "มี.ค. 12, 14 03:22:30";
            var date = new Date(Date.UTC(2014, 2, 12, 3, 22, 30));
            var format = "MMM dd, yy kk:mm:ss";

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
            var expected = "มี.ค. 12, 2014 03:02:03";
            var date = new Date(2014, 2, 12, 3, 2, 3);
            var format = "MMM dd, yyyy kk:mm:ss";

            var actual = $A.localizationService.formatDateTime(date, format, "th");

            $A.test.assertEquals(expected, actual, "formatDateTime() for the 'th' locale and format with yyyy returns an unexpected date string");
        }, function testyyWithTh() {
            var expected = "มี.ค. 12, 14 03:02:03";
            var date = new Date(2014, 2, 12, 3, 2, 3);
            var format = "MMM dd, yy kk:mm:ss";

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
            var expected = "มี.ค. 12, 2014 03:22:30";
            var date = new Date(Date.UTC(2014, 2, 12, 3, 22, 30));
            var format = "MMM dd, yyyy kk:mm:ss";

            var actual = $A.localizationService.formatDateTimeUTC(date, format, "th");

            $A.test.assertEquals(expected, actual, "formatDateTimeUTC() for the 'th' locale and format with yyyy returns an unexpected date string");
        }, function testyyWithTh() {
            var expected = "มี.ค. 12, 14 03:22:30";
            var date = new Date(Date.UTC(2014, 2, 12, 3, 22, 30));
            var format = "MMM dd, yy kk:mm:ss";

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
            var expected = "มี.ค. 12, 2014 03:02:03";
            var date = new Date(2014, 2, 12, 3, 2, 3);
            var format = "MMM dd, yyyy kk:mm:ss";

            var actual = $A.localizationService.formatTime(date, format, "th");

            $A.test.assertEquals(expected, actual, "formatTime() for the 'th' locale and format with yyyy returns an unexpected date string");
        }, function testyyWithTh() {
            var expected = "มี.ค. 12, 14 03:02:03";
            var date = new Date(2014, 2, 12, 3, 2, 3);
            var format = "MMM dd, yy kk:mm:ss";

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
            var expected = "มี.ค. 12, 2014 03:22:30";
            var date = new Date(Date.UTC(2014, 2, 12, 3, 22, 30));
            var format = "MMM dd, yyyy kk:mm:ss";

            var actual = $A.localizationService.formatTimeUTC(date, format, "th");

            $A.test.assertEquals(expected, actual, "formatTimeUTC() for the 'th' locale and format with yyyy returns an unexpected date string");
        }, function testyyWithTh() {
            var expected = "มี.ค. 12, 14 03:22:30";
            var date = new Date(Date.UTC(2014, 2, 12, 3, 22, 30));
            var format = "MMM dd, yy kk:mm:ss";

            var actual = $A.localizationService.formatTimeUTC(date, format, "th");

            $A.test.assertEquals(expected, actual, "formatTimeUTC() for the 'th' locale and format with yy returns an unexpected date string");
        }]
    }
})
