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
import java.text.ParseException;
import java.time.format.DateTimeParseException;
import java.util.Calendar;
import java.util.Date;
import java.util.Locale;
import java.util.TimeZone;

import javax.inject.Inject;

import org.auraframework.service.LocalizationService;
import org.auraframework.test.util.AuraTestCase;
import org.junit.Test;

import com.ibm.icu.text.NumberFormat;

/**
 * Tests for LocalizationServiceImpl.
 */
public class LocalizationServiceImplTest extends AuraTestCase {

    @Inject
    public LocalizationService localizationService;

    /**
     * Tests to verify Date parser across different Locale
     */
    @Test
    public void testDateTimeParserChangeLocale() throws Exception {
        // API: parseDate(String Date, Locale locale, TimeZone timeZone, int dateStyle)
        // Locale: English -> German
        {
            String expectedDE = "Dienstag, 31. Dezember 2222";
            String inputEN = "Tuesday, December 31, 2222";
            Date dateEN = localizationService.parseDate(inputEN, Locale.ENGLISH, TimeZone.getTimeZone("PST"), DateFormat.FULL);
            String actualEN = localizationService.formatDate(dateEN, Locale.GERMAN, DateFormat.FULL, TimeZone.getTimeZone("CEST"));

            assertEquals("Failed to convert date from English to German locale", expectedDE, actualEN);
        }
        // Locale: English -> Simplified Chinese
        {
            String expectedZH = "2500年2月28日";
            String inputEN = "February 28, 2500";
            Date dateEN = localizationService.parseDate(inputEN, Locale.ENGLISH, TimeZone.getTimeZone("PST"), DateFormat.LONG);
            String actualZH = localizationService.formatDate(dateEN, Locale.SIMPLIFIED_CHINESE, DateFormat.LONG, TimeZone.getTimeZone("PST"));
            assertEquals("Failed to convert date from English to Simplified Chinese locale", expectedZH, actualZH);
        }
        // Locale: English -> Arabic
        {
            String expectedSA = "الاثنين، ٢٥ ربيع الأول ١٤٣٢ هـ";
            String inputEN = "Monday, February 28, 2011";
            Date dateEN = localizationService.parseDate(inputEN, Locale.ENGLISH, TimeZone.getTimeZone("PST"), DateFormat.FULL);
            String actualSA = localizationService.formatDate(dateEN, new Locale("ar", "SA"), DateFormat.FULL, TimeZone.getTimeZone("PST"));
            assertEquals("Failed to convert date from English to Arabic locale", expectedSA, actualSA);
        }
    }

    @Test
    public void testDateTimeParser() {
        String dateString = "January 1, 2000";
        Locale locale = Locale.ENGLISH;
        TimeZone timeZone = TimeZone.getTimeZone("America/New_York");
        Calendar calendar = Calendar.getInstance(timeZone, locale);
        calendar.clear();
        calendar.set(2000, 0, 1);
        Date expected = calendar.getTime();

        Date actual = localizationService.parseDate(dateString, locale, timeZone, DateFormat.LONG);
        assertEquals("Found expected parsed date.", expected, actual);
    }

    @Test
    public void testDateTimeParserForLeapYear() {
        String dateString = "February 29, 2008";
        Locale locale = Locale.ENGLISH;
        TimeZone timeZone = TimeZone.getTimeZone("America/New_York");
        Calendar calendar = Calendar.getInstance(timeZone, locale);
        calendar.clear();
        calendar.set(2008, 1, 29);
        Date expected = calendar.getTime();

        Date actual = localizationService.parseDate(dateString, locale, timeZone, DateFormat.LONG);
        assertEquals("Found expected parsed date.", expected, actual);
    }

    @Test
    public void testDateTimeParserExceptionsForInvalidMediumDateString() {
        String invalidMediumDateString = "2012/01/40";
        try {
            localizationService.parseDate(invalidMediumDateString, Locale.ENGLISH, TimeZone.getTimeZone("PST"), DateFormat.MEDIUM);
            fail("No Exception thrown when trying to parse \'" + invalidMediumDateString + "\' into Date");
        } catch (Exception e) {
            String expectedMessage = String.format("\'%s\' could not be parsed", invalidMediumDateString);
            checkExceptionContains(e, DateTimeParseException.class, expectedMessage);
        }
    }

    @Test
    public void testDateTimeParserExceptionsForInvalidShortDateString() {
        String invalidShortDateString = "January 4, 2012";
        try {
            localizationService.parseDate(invalidShortDateString, Locale.ENGLISH, TimeZone.getTimeZone("PST"), DateFormat.SHORT);
            fail("No Exception thrown when trying to parse \'" + invalidShortDateString + "\' into Date");
        } catch (Exception e) {
            String expectedMessage = String.format("\'%s\' could not be parsed", invalidShortDateString);
            checkExceptionContains(e, DateTimeParseException.class, expectedMessage);
        }
    }

    @Test
    public void testDateTimeParserExceptions() {
        // Test date in English to parser with German locale
        {
            String EN_DATE_STRING = "Tuesday, December 31, 2222";
            try {
                localizationService.parseDate(EN_DATE_STRING, Locale.GERMAN, TimeZone.getTimeZone("PST"),
                        DateFormat.FULL);
                fail("# Exception not thrown for date:" + EN_DATE_STRING);
            } catch (Exception e) {
                assertTrue("# Incorrect exception type!", ((e instanceof DateTimeParseException)));
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
                assertTrue("# Incorrect exception type!", ((e instanceof DateTimeParseException)));
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
                assertTrue("# Incorrect exception type!", ((e instanceof DateTimeParseException)));
            }
        }
    }

    @Test
    public void testParseTimeParserExceptions() throws ParseException {
        String invalidTimeString = "xx:xx:0x PM";
        try {
            localizationService.parseDate(invalidTimeString, Locale.ENGLISH, TimeZone.getTimeZone("PST"), DateFormat.SHORT);
            fail("No Exception thrown when trying to parse \'" + invalidTimeString + "\' into Date");
        } catch (Exception e) {
            String expectedMessage = String.format("\'%s\' could not be parsed", invalidTimeString);
            checkExceptionContains(e, DateTimeParseException.class, expectedMessage);
        }
    }

    @Test
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

            try {
                localizationService.parseInt(null);
                fail("parseInt(null) did not throw an exception");
            } catch (Exception e) {
                checkExceptionContains(e, ParseException.class, "Parameter 'number' was null");
            }

            try {
                localizationService.parseLong(null);
                fail("parseLong(null) did not throw an exception");
            } catch (Exception e) {
                checkExceptionContains(e, ParseException.class, "Parameter 'number' was null");
            }

            try {
                localizationService.parseFloat(null);
                fail("parseFloat(null) did not throw an exception");
            } catch (Exception e) {
                checkExceptionContains(e, ParseException.class, "Parameter 'number' was null");
            }

            try {
                localizationService.parseDouble(null);
                fail("parseDouble(null) did not throw an exception");
            } catch (Exception e) {
                checkExceptionContains(e, ParseException.class, "Parameter 'number' was null");
            }

            try {
                localizationService.parsePercent(null);
                fail("parsePercent(null) did not throw an exception");
            } catch (Exception e) {
                checkExceptionContains(e, ParseException.class, "Parameter 'percent' was null");
            }
        }
    }

    @Test
    public void testParsersWithEmptyString() throws ParseException {
        {
            try {
                localizationService.parseCurrency("");
                fail("parseCurrency(\"\") did not throw an exception");
            } catch (Exception e) {
                checkExceptionContains(e, ParseException.class, "Unparseable number: \"\"");
            }

            try {
                localizationService.parseDateTimeToCalendar("", null, null, -1, -1);
                fail("parseDateTimeToCalendar(\"\", null, null, -1, -1) did not throw an exception");
            } catch (Exception e) {
                // TODO(W-1482880): same as testDateTimeParserExceptions()
                checkExceptionContains(e, IllegalArgumentException.class, "Both date style and time style cannot be none");
            }

            try {
                localizationService.parseDateTime("");
                fail("parseDateTime(\"\") did not throw an exception");
            } catch (Exception e) {
                // TODO(W-1482880): same as testDateTimeParserExceptions()
                checkExceptionContains(e, DateTimeParseException.class, "Text '' could not be parsed at index 0");
            }

            try {
                localizationService.parseTimeToCalendar("", null, null, -1);
                fail("parseTimeToCalendar(\"\", null, null, -1) did not throw an exception");
            } catch (Exception e) {
                // TODO(W-1482880): same as testDateTimeParserExceptions()
                checkExceptionContains(e, IllegalArgumentException.class, "Both date style and time style cannot be none");
            }

            try {
                localizationService.parseTime("");
                fail("parseTime(\"\") did not throw an exception");
            } catch (Exception e) {
                // TODO(W-1482880): same as testDateTimeParserExceptions()
                checkExceptionContains(e, DateTimeParseException.class, "Text '' could not be parsed at index 0");
            }

            try {
                localizationService.parseDate("");
                fail("parseDate(\"\") did not throw an exception");
            } catch (Exception e) {
                // TODO(W-1482880): same as testDateTimeParserExceptions()
                checkExceptionContains(e, DateTimeParseException.class, "Text '' could not be parsed at index 0");
            }

            try {
                localizationService.parseInt("");
                fail("parseInt(\"\") did not throw an exception");
            } catch (Exception e) {
                checkExceptionContains(e, ParseException.class, "Unparseable number: \"\"");
            }

            try {
                localizationService.parseLong("");
                fail("parseLong(\"\") did not throw an exception");
            } catch (Exception e) {
                checkExceptionContains(e, ParseException.class, "Unparseable number: \"\"");
            }

            try {
                localizationService.parseFloat("");
                fail("parseFloat(\"\") did not throw an exception");
            } catch (Exception e) {
                checkExceptionContains(e, ParseException.class, "Unparseable number: \"\"");
            }

            try {
                localizationService.parseDouble("");
                fail("parseDouble(\"\") did not throw an exception");
            } catch (Exception e) {
                checkExceptionContains(e, ParseException.class, "Unparseable number: \"\"");
            }

            try {
                localizationService.parsePercent("");
                fail("parsePercent(\"\") did not throw an exception");
            } catch (Exception e) {
                checkExceptionContains(e, ParseException.class, "Unparseable number: \"\"");
            }
        }
    }

    @Test
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
            String expectedJP = NumberFormat.getCurrencyInstance(Locale.JAPAN).format(9.0d);
            String inputEN = "$9.00";
            BigDecimal moneyEN = localizationService.parseCurrency(inputEN, Locale.US);
            String actualJP = localizationService.formatCurrency(moneyEN, Locale.JAPAN);
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

    @Test
    public void testPercentParserExceptions() throws ParseException {
        String invalidPercentString = "%f";
        try {
            localizationService.parsePercent(invalidPercentString, Locale.FRENCH);
            fail("No Exception thrown when trying to parse \'" + invalidPercentString + "\' into Percentage");
        } catch (Exception e) {
            String expectedMessage = "Unparseable number: \"" + invalidPercentString + "\"";
            checkExceptionFull(e, ParseException.class, expectedMessage);
        }
    }

    @Test
    public void testCurrencyParserExceptions() throws ParseException {
        // Test invalid Currency strings
        {
            String currencyJPY = "￥9,990.00";
            try {
                localizationService.parseCurrency(currencyJPY, Locale.US);
                fail("No Exception thrown when trying to parse \'" + currencyJPY + "\' into Currency");
            } catch (Exception e) {
                String expectedMessage = "Unparseable number: \"" + currencyJPY + "\"";
                checkExceptionFull(e, ParseException.class, expectedMessage);
            }
        }

        // Currency in China Yuan to parser with US locale
        {
            String inputCN = NumberFormat.getCurrencyInstance(Locale.CHINA).format(0);
            try {
                localizationService.parseCurrency(inputCN, Locale.UK);
                fail("# Exception not thrown for currency:" + inputCN);
            } catch (Exception e) {
                String expectedMessage = "Unparseable number: \"" + inputCN + "\"";
                checkExceptionFull(e, ParseException.class, expectedMessage);
            }
        }

        // Currency in China Yuan to parser with Brazil locale
        {
            String inputCN = NumberFormat.getCurrencyInstance(Locale.CHINA).format(-1);
            try {
                localizationService.parseCurrency(inputCN, new Locale("pt", "BR"));
                fail("# Exception not thrown for currency:" + inputCN);
            } catch (Exception e) {
                String expectedMessage = "Unparseable number: \"" + inputCN + "\"";
                checkExceptionFull(e, ParseException.class, expectedMessage);
            }
        }
    }

    @Test
    public void testIntParserExceptions() throws ParseException {
        String overflowNumberString = "987654321987654321";
        try {
            localizationService.parseInt(overflowNumberString);
            fail("No Exception thrown when trying to parse \'" + overflowNumberString + "\' into int");
        } catch (Exception e) {
            String expectedMessage = "Unparseable number: \"" + overflowNumberString + "\"";
            checkExceptionFull(e, ParseException.class, expectedMessage);
        }
    }

    @Test
    public void testLongParserExceptions() throws ParseException {
        String overflowNumberString = "987654321987654321987654321987654321987654321987654321";
        try {
            localizationService.parseLong(overflowNumberString);
            fail("No Exception thrown when trying to parse \'" + overflowNumberString + "\' into long");
        } catch (Exception e) {
            String expectedMessage = "Unparseable number: \"" + overflowNumberString + "\"";
            checkExceptionFull(e, ParseException.class, expectedMessage);
        }
    }

    @Test
    public void testFloatParserExceptions() throws ParseException {
        String invalidFloatString = "F";
        try {
            localizationService.parseFloat(invalidFloatString);
            fail("No Exception thrown when trying to parse \'" + invalidFloatString + "\' into float");
        } catch (Exception e) {
            String expectedMessage = "Unparseable number: \"" + invalidFloatString + "\"";
            checkExceptionFull(e, ParseException.class, expectedMessage);
        }
    }

    @Test
    public void testDoubleParserExceptions() throws ParseException {
        String overflowNumberString = "917976931348623157000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000";
        try {
            localizationService.parseDouble(overflowNumberString);
            fail("No Exception thrown when trying to parse \'" + overflowNumberString + "\' into double");
        } catch (Exception e) {
            String expectedMessage = "Unparseable number: \"" + overflowNumberString + "\"";
            checkExceptionFull(e, ParseException.class, expectedMessage);
        }
    }

}
