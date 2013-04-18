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
package org.auraframework.impl;

import java.math.BigDecimal;
import java.text.DateFormat;
import java.text.NumberFormat;
import java.text.ParseException;
import java.util.Date;
import java.util.HashMap;
import java.util.Locale;
import java.util.Map;
import java.util.TimeZone;

import org.auraframework.Aura;
import org.auraframework.service.LocalizationService;
import org.auraframework.service.testdata.LocalizationServiceTestData;
import org.auraframework.util.number.AuraNumberFormat;

/**
 * Tests for LocalizationServiceImpl.
 */
public class LocalizationServiceImplTest extends AuraImplTestCase {

    public LocalizationService localizationService = null;

    public LocalizationServiceImplTest(String name) {
        super(name);
        localizationService = Aura.getLocalizationService();
    }

    /**
     * Tests to verify Date parser across different Locale
     */
    public void testDateTimeParserChangeLocale() throws Exception {
        // API: parseDate(String Date, Locale locale, TimeZone timeZone, int
        // DateStyle)
        // Locale: English -> German
        {
            String expectedDE = "Dienstag, 31. Dezember 2222";
            String inputEN = "Tuesday, December 31, 2222";
            Date dateEN = localizationService.parseDate(inputEN, Locale.ENGLISH, TimeZone.getTimeZone("PST"),
                    DateFormat.FULL);
            String actualEN = localizationService.formatDate(dateEN, Locale.GERMAN, TimeZone.getTimeZone("CEST"),
                    DateFormat.FULL);
            assertEquals("Failed to convert date from English to German locale", expectedDE, actualEN);
        }
        // Locale: English -> Simplified Chinese
        {
            String expectedZH = DateFormat.getDateInstance(1, Locale.SIMPLIFIED_CHINESE).format(
                    new Date(16730265600000L));
            String inputEN = "February 28, 2500";
            Date dateEN = localizationService.parseDate(inputEN, Locale.ENGLISH, TimeZone.getTimeZone("PST"),
                    DateFormat.LONG);
            String actualZH = localizationService.formatDate(dateEN, Locale.SIMPLIFIED_CHINESE,
                    TimeZone.getTimeZone("PST"), DateFormat.LONG);
            assertEquals("Failed to convert date from English to Simplified Chinese locale", expectedZH, actualZH);
        }
        // Locale: English -> Arabic
        {
            String expectedSA = DateFormat.getDateInstance(DateFormat.FULL, new Locale("ar", "SA")).format(
                    new Date(1298880000000L));
            String inputEN = "Monday, February 28, 2011";
            Date dateEN = localizationService.parseDate(inputEN, Locale.ENGLISH, TimeZone.getTimeZone("PST"),
                    DateFormat.FULL);
            String actualSA = localizationService.formatDate(dateEN, new Locale("ar", "SA"),
                    TimeZone.getTimeZone("PST"), DateFormat.FULL);
            assertEquals("Failed to convert date from English to Arabic locale", expectedSA, actualSA);
        }
    }

    public void testDateTimeParserBorderCases() {
        for (String dt : LocalizationServiceTestData.PASS_DATE_STRINGS) {
            try {
                localizationService.parseDate(dt, Locale.ENGLISH, TimeZone.getTimeZone("PST"), DateFormat.MEDIUM);
            } catch (Exception e) {
                fail("Failed to parse valid date \'" + dt + "\', error: " + e);
            }
        }
    }

    // TODO(W-1482880): Change how Exceptions are handled after bug is fixed. We
    // should just be catching the Exception
    // type we expect and letting the others be thrown. This will either be
    // ParseExceptions or IllegalArgumentExceptions
    public void testDateTimeParserExceptions() throws IllegalArgumentException {
        // Test invalid date strings in format DateFormat.MEDIUM
        {
            for (String dt : LocalizationServiceTestData.FAIL_DATE_STRINGS_MEDIUM_FORMAT) {
                try {
                    localizationService.parseDate(dt, Locale.ENGLISH, TimeZone.getTimeZone("PST"), DateFormat.MEDIUM);
                    fail("No Exception thrown when trying to parse \'" + dt + "\' into Date");
                } catch (Exception e) {
                    // Expected
                }
            }
        }

        // Test invalid date strings in format DateFormat.SHORT
        {
            for (String dt : LocalizationServiceTestData.FAIL_DATE_STRINGS_SHORT_FORMAT) {
                try {
                    localizationService.parseDate(dt, Locale.ENGLISH, TimeZone.getTimeZone("PST"), DateFormat.SHORT);
                    fail("No Exception thrown when trying to parse \'" + dt + "\' into Date");
                } catch (Exception e) {
                    // Expected
                }
            }
        }

        // Test date in English to parser with German locale
        {
            String EN_DATE_STRING = "Tuesday, December 31, 2222";
            try {
                localizationService.parseDate(EN_DATE_STRING, Locale.GERMAN, TimeZone.getTimeZone("PST"),
                        DateFormat.FULL);
                fail("# Exception not thrown for date:" + EN_DATE_STRING);
            } catch (Exception e) {
                assertTrue("# Incorrect exception type!", ((e instanceof IllegalArgumentException)));
            }
        }

        // Test time in US to parser with UK locale
        {
            String US_TIME_STRING = "6:57:10 PM PDT";
            try {
                localizationService.parseTimeToCalendar(US_TIME_STRING, Locale.UK, TimeZone.getTimeZone("GMT"),
                        DateFormat.FULL);
                fail("# Exception not thrown for date:" + US_TIME_STRING);
            } catch (Exception e) {
                assertTrue("# Incorrect exception type!", ((e instanceof IllegalArgumentException)));
            }
        }

        // Test date time in English to parser with French locale
        {
            String US_DATE_TIME_STRING = "Apr 1, 2012 4:27:52 PM PDT";
            try {
                localizationService.parseDateTimeToCalendar(US_DATE_TIME_STRING, Locale.FRENCH,
                        TimeZone.getTimeZone("UTC"), DateFormat.MEDIUM, DateFormat.FULL);
                fail("# Exception not thrown for date:" + US_DATE_TIME_STRING);
            } catch (Exception e) {
                assertTrue("# Incorrect exception type!", ((e instanceof IllegalArgumentException)));
            }
        }
    }

    public void testParseTimeParserExceptions() throws ParseException {
        // Test invalid time strings
        {
            for (String t : LocalizationServiceTestData.FAIL_TIME_STRINGS) {
                try {
                    localizationService.parseTime(t, Locale.ENGLISH, TimeZone.getTimeZone("PST"), DateFormat.FULL);
                    fail("No Exception thrown when trying to parse \'" + t + "\' into Time");
                } catch (Exception e) {
                    // Expected
                }
            }
        }
    }

    public void testParsersWithNullArgs() throws ParseException {
        {
            assertNull("parseDate(null) did not return 'null'", localizationService.parseDate(null));
            assertNull("parseTime(null) did not return 'null'", localizationService.parseTime(null));
            assertNull("parseDate(null, null) did not return 'null'", localizationService.parseDate(null, null));
            assertNull("parseTimeToCalendar(null, null, null -1) did not return 'null'",
                    localizationService.parseTimeToCalendar(null, null, null, -1));
            assertNull("parseDateTime(null) did not return 'null'", localizationService.parseDateTime(null));
            assertNull("parseDateTimeToCalendar(null, null, null, -1, -1) did not return 'null'",
                    localizationService.parseDateTimeToCalendar(null, null, null, -1, -1));
            assertNull("parseCurrency(null) did not return 'null'", localizationService.parseCurrency(null));

            // parseInt(null)
            try {
                localizationService.parseInt(null);
                fail("parseInt(null) did not throw an exception");
            } catch (Exception e) {
                assertTrue("parseInt(null) threw an incorrect Exception",
                        e.getMessage().contains("Parameter 'number' was null"));
            }

            // parseLong(null)
            try {
                localizationService.parseLong(null);
                fail("parseLong(null) did not throw an exception");
            } catch (Exception e) {
                assertTrue("parseLong(null) threw an incorrect Exception",
                        e.getMessage().contains("Parameter 'number' was null"));
            }

            // parseFloat(null)
            try {
                localizationService.parseFloat(null);
                fail("parseFloat(null) did not throw an exception");
            } catch (Exception e) {
                assertTrue("parseFloat(null) threw an incorrect Exception",
                        e.getMessage().contains("Parameter 'number' was null"));
            }

            // parseDouble(null)
            try {
                localizationService.parseDouble(null);
                fail("parseDouble(null) did not throw an exception");
            } catch (Exception e) {
                assertTrue("parseDouble(null) threw an incorrect Exception",
                        e.getMessage().contains("Parameter 'number' was null"));
            }

            // parsePercent(null)
            try {
                localizationService.parsePercent(null);
                fail("parsePercent(null) did not throw an exception");
            } catch (Exception e) {
                assertTrue("parsePercent(null) threw an incorrect Exception",
                        e.getMessage().contains("Parameter 'percent' was null"));
            }
        }
    }

    public void testParsersWithEmptyString() throws ParseException {
        {
            // localizationService.parseCurrency("")
            try {
                localizationService.parseCurrency("");
                fail("parseCurrency(\"\") did not throw an exception");
            } catch (Exception e) {
                assertTrue("parseCurrency(\"\") threw an incorrect Exception",
                        e.getMessage().contains("Unparseable number: \"\""));
            }

            // localizationService.parseDateTimeToCalendar("", null, null, -1,
            // -1)
            try {
                localizationService.parseDateTimeToCalendar("", null, null, -1, -1);
                fail("parseDateTimeToCalendar(\"\", null, null, -1, -1) did not throw an exception");
            } catch (Exception e) {
                assertTrue("parseDateTimeToCalendar(\"\", null, null, -1, -1) threw an incorrect Exception", e
                        .getMessage().contains("Style '--' is invalid"));
            }

            // localizationService.parseDateTime("")
            try {
                localizationService.parseDateTime("");
                fail("parseDateTime(\"\") did not throw an exception");
            } catch (Exception e) {
                assertTrue("parseDateTime(\"\") threw an incorrect Exception",
                        e.getMessage().contains("Invalid format: \"\""));
            }

            // localizationService.parseTimeToCalendar("", null, null, -1))
            try {
                localizationService.parseTimeToCalendar("", null, null, -1);
                fail("parseTimeToCalendar(\"\", null, null, -1) did not throw an exception");
            } catch (Exception e) {
                assertTrue("parseTimeToCalendar(\"\", null, null, -1) threw an incorrect Exception", e.getMessage()
                        .contains("Style '--' is invalid"));
            }

            // localizationService.parseTime("")
            try {
                localizationService.parseTime("");
                fail("parseTime(\"\") did not throw an exception");
            } catch (Exception e) {
                assertTrue("parseTime(\"\") threw an incorrect Exception",
                        e.getMessage().contains("Invalid format: \"\""));
            }

            // localizationService.parseDate("")
            try {
                localizationService.parseDate("");
                fail("parseDate(\"\") did not throw an exception");
            } catch (Exception e) {
                assertTrue("parseDate(\"\") threw an incorrect Exception",
                        e.getMessage().contains("Invalid format: \"\""));
            }

            // localizationService.parseInt(null)
            try {
                localizationService.parseInt("");
                fail("parseInt(\"\") did not throw an exception");
            } catch (Exception e) {
                assertTrue("parseInt(\"\") threw an incorrect Exception",
                        e.getMessage().contains("Unparseable number: \"\""));
            }

            // localizationService.parseLong(null)
            try {
                localizationService.parseLong("");
                fail("parseLong(\"\") did not throw an exception");
            } catch (Exception e) {
                assertTrue("parseLong(\"\") threw an incorrect Exception",
                        e.getMessage().contains("Unparseable number: \"\""));
            }

            // localizationService.parseFloat(null)
            try {
                localizationService.parseFloat("");
                fail("parseFloat(\"\") did not throw an exception");
            } catch (Exception e) {
                assertTrue("parseFloat(\"\") threw an incorrect Exception",
                        e.getMessage().contains("Unparseable number: \"\""));
            }

            // localizationService.parseDouble(null)
            try {
                localizationService.parseDouble("");
                fail("parseDouble(\"\") did not throw an exception");
            } catch (Exception e) {
                assertTrue("parseDouble(\"\") threw an incorrect Exception",
                        e.getMessage().contains("Unparseable number: \"\""));
            }

            // localizationService.parsePercent(null)
            try {
                localizationService.parsePercent("");
                fail("parsePercent(\"\") did not throw an exception");
            } catch (Exception e) {
                assertTrue("parsePercent(\"\") threw an incorrect Exception",
                        e.getMessage().contains("Unparseable number: \"\""));
            }
        }
    }

    public void testLeniencyCurrencyParser() throws Exception {
        // API: parseCurrency(String currency, Locale l)
        // Locale: US $ -> UK £
        {
            String expectedGB = "£100,000.0000000009";
            String inputEN = "$100,000.0000000009";
            BigDecimal moneyEN = localizationService.parseCurrency(inputEN, Locale.US);
            String actualGB = localizationService.formatCurrency(moneyEN, Locale.UK, 10, 10);
            assertEquals(expectedGB, actualGB);
        }
        // Locale US -> France
        {
            String expectedFR = NumberFormat.getCurrencyInstance(Locale.FRANCE).format(100000000);
            String inputEN = "$100,000,000.000";
            BigDecimal moneyEN = localizationService.parseCurrency(inputEN, Locale.US);
            String actualFR = localizationService.formatCurrency(moneyEN, Locale.FRANCE);
            assertEquals(expectedFR, actualFR);
        }
        // Locale US -> China
        {
            String expectedCN = NumberFormat.getCurrencyInstance(Locale.CHINA).format(0.09);
            String inputEN = "$0.09";
            BigDecimal moneyEN = localizationService.parseCurrency(inputEN, Locale.US);
            String actualCN = localizationService.formatCurrency(moneyEN, Locale.CHINA, 2, 2);
            assertEquals(expectedCN, actualCN);
        }
        // Locale US -> Japan
        {
            String expectedJP = NumberFormat.getCurrencyInstance(Locale.JAPAN).format(9.2d);
            String inputEN = "$009.2";
            BigDecimal moneyEN = localizationService.parseCurrency(inputEN, Locale.US);
            String actualJP = localizationService.formatCurrency(moneyEN, Locale.JAPAN, 2, -2);
            assertEquals(expectedJP, actualJP);
        }
        // Locale US -> Arabic
        {
            String expectedSA = NumberFormat.getCurrencyInstance(new Locale("ar", "SA")).format(100001100.212d);
            String inputEN = "$100,001,100.212";
            BigDecimal moneyEN = localizationService.parseCurrency(inputEN, Locale.US);
            String actualSA = localizationService.formatCurrency(moneyEN, new Locale("ar", "SA"));
            assertEquals(expectedSA, actualSA);
        }
    }

    public void testPercentParserExceptions() throws ParseException {
        // Test invalid Percent strings
        {
            for (String per : LocalizationServiceTestData.FAIL_PERCENT_STRINGS) {
                try {
                    localizationService.parsePercent(per, Locale.FRENCH);
                    fail("No Exception thrown when trying to parse \'" + per + "\' into Percentage");
                } catch (Exception e) {
                    // Expected
                }
            }
        }
    }

    public void testCurrencyParserExceptions() throws ParseException {
        // Test invalid Currency strings
        {
            for (String curr : LocalizationServiceTestData.FAIL_CURRENCY_STRINGS) {
                try {
                    localizationService.parseCurrency(curr, Locale.US);
                    fail("No Exception thrown when trying to parse \'" + curr + "\' into Currency");
                } catch (Exception e) {
                    // Expected
                }
            }
        }

        // Currency in USD to parser with UK locale
        {
            String inputEN = "$1";
            try {
                localizationService.parseCurrency(inputEN, Locale.UK);
                fail("# Exception not thrown for currency:" + inputEN);
            } catch (Exception e) {
                assertTrue("# Incorrect exception type!", ((e instanceof ParseException)));
            }
        }

        // Currency in China Yuan to parser with US locale
        {
            String inputCN = NumberFormat.getCurrencyInstance(Locale.CHINA).format(0);
            try {
                localizationService.parseCurrency(inputCN, Locale.UK);
                fail("# Exception not thrown for currency:" + inputCN);
            } catch (Exception e) {
                assertTrue("# Incorrect exception type!", ((e instanceof ParseException)));
            }
        }

        // Currency in China Yuan to parser with Brazil locale
        {
            String inputCN = NumberFormat.getCurrencyInstance(Locale.CHINA).format(-1);
            try {
                localizationService.parseCurrency(inputCN, new Locale("pt", "BR"));
                fail("# Exception not thrown for currency:" + inputCN);
            } catch (Exception e) {
                assertTrue("# Incorrect exception type!", ((e instanceof ParseException)));
            }
        }
    }

    public void testIntParserExceptions() throws ParseException {
        // Test invalid Int strings
        {
            for (String num : LocalizationServiceTestData.FAIL_INT_STRINGS) {
                try {
                    localizationService.parseInt(num);
                    fail("No Exception thrown when trying to parse \'" + num + "\' into int");
                } catch (Exception e) {
                    // Expected
                }
            }
        }
    }

    public void testLongParserExceptions() throws ParseException {
        // Test invalid Long strings
        {
            for (String num : LocalizationServiceTestData.FAIL_LONG_STRINGS) {
                try {
                    localizationService.parseLong(num);
                    fail("No Exception thrown when trying to parse \'" + num + "\' into long");
                } catch (Exception e) {
                    // Expected
                }
            }
        }
    }

    public void testFloatParserExceptions() throws ParseException {
        // Test invalid Float strings
        {
            for (String num : LocalizationServiceTestData.FAIL_FLOAT_STRINGS) {
                try {
                    localizationService.parseFloat(num);
                    fail("No Exception thrown when trying to parse \'" + num + "\' into float");
                } catch (Exception e) {
                    // Expected
                }
            }
        }
    }

    public void testDoubleParserExceptions() throws ParseException {
        // Test invalid Double strings
        {
            for (String num : LocalizationServiceTestData.FAIL_DOUBLE_STRINGS) {
                try {
                    localizationService.parseDouble(num);
                    fail("No Exception thrown when trying to parse \'" + num + "\' into double");
                } catch (Exception e) {
                    // Expected
                }
            }
        }
    }

    public void testStrictNumberParsing() throws ParseException {
        NumberFormat nf = null;

        Map<Locale, String[]> strictParserTestNumberStrings = new HashMap<Locale, String[]>();
        strictParserTestNumberStrings.put(Locale.ENGLISH, new String[] { "100.200,300", "1 1", "100'200", "1.1.1.1" });
        strictParserTestNumberStrings.put(Locale.FRANCE, new String[] { "1 1 1 1", "1.1.1", "00. 000 000",
                "100,200.300" });
        strictParserTestNumberStrings.put(Locale.CHINESE, new String[] { "100 200", "1, 0,0", "100'2", "123 456" });
        strictParserTestNumberStrings.put(Locale.GERMAN, new String[] { "100,200,300.456", "0.123,456,789", "123 456",
                "111.111,111.111" });

        for (Locale locale : strictParserTestNumberStrings.keySet()) {
            for (String num : strictParserTestNumberStrings.get(locale)) {
                try {
                    nf = NumberFormat.getInstance(locale);
                    AuraNumberFormat.parseStrict(num, nf);
                    fail("No Exception thrown for value:" + num + " and locale:" + locale.getDisplayName());
                } catch (Exception e) {
                    // Expected
                }
            }
        }
    }
}
