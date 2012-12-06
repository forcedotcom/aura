/*
 * Copyright (C) 2012 salesforce.com, inc.
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
import java.text.DecimalFormat;
import java.text.NumberFormat;
import java.text.ParseException;
import java.util.Calendar;
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
 *
 *
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
    public void _testLeniencyDateTimeParser() throws Exception {

        //API: parseDate(String Date, Locale locale) and DateStyle: DEFAULT
        //Locale: French
        {
            String expectedFR = "9 févr. 2012";
            String inputFR = "40 janv. 2012";
            Date dateFR = localizationService.parseDate(inputFR, Locale.FRENCH);
            String actualFR = localizationService.formatDate(dateFR, Locale.FRENCH);
            assertEquals(expectedFR, actualFR);
        }
        //Locale: German
        {
            String expectedDE = "09.02.2012";
            String inputDE = "40.01.2012";
            Date dateDE = localizationService.parseDate(inputDE, Locale.GERMAN);
            String actualDE = localizationService.formatDate(dateDE, Locale.GERMAN);
            assertEquals(expectedDE, actualDE);
        }
        //Locale: Korean
        {
            String expectedKR = "2012. 2. 9";
            String inputKR = "2012. 1. 40";
            Date dateKR = localizationService.parseDate(inputKR, Locale.KOREAN);
            String actualKR = localizationService.formatDate(dateKR, Locale.KOREAN);
            assertEquals(expectedKR, actualKR);
        }




        //API: parseDateTimeToCalendar(String Date, Locale locale, TimeZone timeZone, DateStyle dateStyle, TimeStyle timeStyle)
        //Locale: Thai
        {
            String expectedTH = "4/29/12 12:00:01 AM";
            String inputTH = "29/4/2555, 00:00:01";
            Calendar dateTH = localizationService.parseDateTimeToCalendar(inputTH, new Locale("th", "TH"), TimeZone.getTimeZone("EST"), DateFormat.SHORT, DateFormat.MEDIUM);
            String actualTH = localizationService.formatDateTime(dateTH,  DateFormat.SHORT, DateFormat.MEDIUM);
            assertEquals(expectedTH, actualTH);
        }




        //API: parseDate(String Date, Locale locale, TimeZone timeZone, int DateStyle)
        //Locale: English -> German
        {
            String expectedDE = "Dienstag, 31. Dezember 2222";
            String inputEN = "Tuesday, December 31, 2222";
            Date dateEN = localizationService.parseDate(inputEN, Locale.ENGLISH, TimeZone.getTimeZone("PST"), DateFormat.FULL);
            String actualEN = localizationService.formatDate(dateEN, Locale.GERMAN, TimeZone.getTimeZone("CEST"),  DateFormat.FULL);
            assertEquals(expectedDE, actualEN);
        }
        //Locale: English -> Simplified Chinese
        {
            String expectedZH = DateFormat.getDateInstance(1, Locale.SIMPLIFIED_CHINESE).format(new Date(16730265600000L));
            String inputEN = "February 29, 2500";
            Date dateEN = localizationService.parseDate(inputEN, Locale.ENGLISH, TimeZone.getTimeZone("UTC"), DateFormat.LONG);
            String actualZH = localizationService.formatDate(dateEN, Locale.SIMPLIFIED_CHINESE, TimeZone.getTimeZone("CST"), DateFormat.LONG);
            assertEquals(expectedZH, actualZH);
        }
        //Locale: English -> Arabic
        {
            String expectedSA = DateFormat.getDateInstance(DateFormat.FULL, new Locale("ar", "SA")).format(new Date(1298880000000L));
            String inputEN = "Tuesday, February 28, 2011";
            Date dateEN = localizationService.parseDate(inputEN, Locale.ENGLISH, TimeZone.getTimeZone("PST"), DateFormat.FULL);
            String actualSA = localizationService.formatDate(dateEN, new Locale("ar", "SA"), TimeZone.getTimeZone("CEST"),  DateFormat.FULL);
            assertEquals(expectedSA, actualSA);
        }
        //Locale: Traditional Chinese
        {
            String expectedZH = "2012/2/9";
            String inputZH = "2012/1/40";
            TimeZone tz = TimeZone.getTimeZone("GMT+8"); // China's TimeZone
            Date dateZH = localizationService.parseDate(inputZH, Locale.TRADITIONAL_CHINESE, tz, DateFormat.MEDIUM);
            String actualZH = localizationService.formatDate(dateZH, Locale.TRADITIONAL_CHINESE, tz);
            assertEquals(expectedZH, actualZH);
        }



        //API: parseDateTime(String Date, Locale locale, TimeZone timeZone, int DateStyle, int TimeStyle)
        //Locale: Japanese -> UK
        {
            String expectedGB = "09/02/12 00:00:01 UTC";
            String inputJA = "12/01/40 9:00:01 JST";
            Date dateJA = localizationService.parseDateTime(inputJA, Locale.JAPANESE, TimeZone.getTimeZone("JST"), DateFormat.SHORT, DateFormat.LONG);
            String actualGB = localizationService.formatDateTime(dateJA, Locale.UK, TimeZone.getTimeZone("UTC"), DateFormat.SHORT, DateFormat.LONG);
            assertEquals(expectedGB, actualGB);
        }
        //Locale: Japanese
        {
            String expectedJA = "12/02/29 17:00:59 JST";
            String inputJA = "12/02/29 0:00:59 PST";
            Date dateJA = localizationService.parseDateTime(inputJA, Locale.JAPANESE, TimeZone.getTimeZone("JST"), DateFormat.SHORT, DateFormat.LONG);
            String actualJA = localizationService.formatDateTime(dateJA, Locale.JAPANESE, TimeZone.getTimeZone("JST"), DateFormat.SHORT, DateFormat.LONG);
            assertEquals(expectedJA, actualJA);
        }
    }



    public void _testDateTimeParserExceptions() throws ParseException {
        //Test invalid date strings
        {
            int failures = 0;
            for(String dt : LocalizationServiceTestData.FAIL_DATE_STRINGS){
                try{
                    localizationService.parseDate(dt, Locale.ENGLISH, TimeZone.getTimeZone("PST"), DateFormat.FULL);
                }catch(Exception e){
                    failures++;
                }
            }
            assertEquals("# Some strings which were expected to be invalid were successfully parsed into Dates!",
                    LocalizationServiceTestData.FAIL_DATE_STRINGS.length, failures);
        }

        //Test date in English to parser with German locale
        {
            String EN_DATE_STRING = "Tuesday, December 31, 2222";
            try{
                localizationService.parseDate(EN_DATE_STRING, Locale.GERMAN, TimeZone.getTimeZone("PST"), DateFormat.FULL);
                assertTrue("# Exception not thrown for date:"+EN_DATE_STRING, false);
            }
            catch(Exception e){
                assertTrue("# Incorrect exception type!", ((e instanceof ParseException)));
            }
        }

        //Test time in US to parser with UK locale
        {
            String US_TIME_STRING = "6:57:10 PM PDT";
            try{
                localizationService.parseTimeToCalendar(US_TIME_STRING, Locale.UK, TimeZone.getTimeZone("GMT"), DateFormat.FULL);
                assertTrue("# Exception not thrown for date:"+US_TIME_STRING, false);
            }
            catch(Exception e){
                assertTrue("# Incorrect exception type!", ((e instanceof ParseException)));
            }
        }

        //Test date time in English to parser with French locale
        {
            String US_DATE_TIME_STRING = "Apr 1, 2012 4:27:52 PM PDT";
            try{
                localizationService.parseDateTimeToCalendar(US_DATE_TIME_STRING, Locale.FRENCH, TimeZone.getTimeZone("UTC"), DateFormat.MEDIUM, DateFormat.FULL);
                assertTrue("# Exception not thrown for date:"+US_DATE_TIME_STRING, false);
            }
            catch(Exception e){
                assertTrue("# Incorrect exception type!", ((e instanceof ParseException)));
            }
        }
    }



    public void testParseTimeParserExceptions() throws ParseException {
        //Test invalid time strings
        {
            int failures = 0;
            for(String t : LocalizationServiceTestData.FAIL_TIME_STRINGS){
                try{
                    localizationService.parseTime(t, Locale.ENGLISH, TimeZone.getTimeZone("PST"), DateFormat.FULL);
                }catch(Exception e){
                    failures++;
                }
            }
            assertEquals("# Some strings which were expected to be invalid were successfully parsed into Times!",
                    LocalizationServiceTestData.FAIL_TIME_STRINGS.length, failures);
        }
    }


    public void testParsersWithNullArgs() throws ParseException {
        {
            assertNull("parseDate(null) did not return 'null'", localizationService.parseDate(null));
            assertNull("parseTime(null) did not return 'null'", localizationService.parseTime(null));
            assertNull("parseDate(null, null) did not return 'null'", localizationService.parseDate(null, null));
            assertNull("parseTimeToCalendar(null, null, null -1) did not return 'null'", localizationService.parseTimeToCalendar(null, null, null, -1));
            assertNull("parseDateTime(null) did not return 'null'", localizationService.parseDateTime(null));
            assertNull("parseDateTimeToCalendar(null, null, null, -1, -1) did not return 'null'", localizationService.parseDateTimeToCalendar(null, null, null, -1, -1));
            assertNull("parseCurrency(null) did not return 'null'", localizationService.parseCurrency(null));

            //parseInt(null)
            try{
                localizationService.parseInt(null);
                assertFalse("parseInt(null) did not throw an exception", false);
            }
            catch(Exception e){
                assertTrue("parseInt(null) threw an incorrect Exception", e.getMessage().contains("Parameter 'number' was null"));
            }

            //parseLong(null)
            try{
                localizationService.parseLong(null);
                assertFalse("parseLong(null) did not throw an exception", false);
            }
            catch(Exception e){
                assertTrue("parseLong(null) threw an incorrect Exception", e.getMessage().contains("Parameter 'number' was null"));
            }

            //parseFloat(null)
            try{
                localizationService.parseFloat(null);
                assertFalse("parseFloat(null) did not throw an exception", false);
            }
            catch(Exception e){
                assertTrue("parseFloat(null) threw an incorrect Exception", e.getMessage().contains("Parameter 'number' was null"));
            }

            //parseDouble(null)
            try{
                localizationService.parseDouble(null);
                assertFalse("parseDouble(null) did not throw an exception", false);
            }
            catch(Exception e){
                assertTrue("parseDouble(null) threw an incorrect Exception", e.getMessage().contains("Parameter 'number' was null"));
            }

            //parsePercent(null)
            try{
                localizationService.parsePercent(null);
                assertFalse("parsePercent(null) did not throw an exception", false);
            }
            catch(Exception e){
                assertTrue("parsePercent(null) threw an incorrect Exception", e.getMessage().contains("Parameter 'percent' was null"));
            }
        }
    }

    public void testParsersWithEmptyString() throws ParseException {
        {
            //localizationService.parseCurrency("")
            try{
                localizationService.parseCurrency("");
                assertFalse("parseCurrency(\"\") did not throw an exception", false);
            }
            catch(Exception e){
                assertTrue("parseCurrency(\"\") threw an incorrect Exception", e.getMessage().contains("Unparseable number: \"\""));
            }

            //localizationService.parseDateTimeToCalendar("", null, null, -1, -1)
            try{
                localizationService.parseDateTimeToCalendar("", null, null, -1, -1);
                assertFalse("parseDateTimeToCalendar(\"\", null, null, -1, -1) did not throw an exception", false);
            }
            catch(Exception e){
                assertTrue("parseDateTimeToCalendar(\"\", null, null, -1, -1) threw an incorrect Exception", e.getMessage().contains("Style '--' is invalid"));
            }

            //localizationService.parseDateTime("")
            try{
                localizationService.parseDateTime("");
                assertFalse("parseDateTime(\"\") did not throw an exception", false);
            }
            catch(Exception e){
                assertTrue("parseDateTime(\"\") threw an incorrect Exception", e.getMessage().contains("Invalid format: \"\""));
            }

            //localizationService.parseTimeToCalendar("", null, null, -1))
            try{
                localizationService.parseTimeToCalendar("", null, null, -1);
                assertFalse("parseTimeToCalendar(\"\", null, null, -1) did not throw an exception", false);
            }
            catch(Exception e){
                assertTrue("parseTimeToCalendar(\"\", null, null, -1) threw an incorrect Exception", e.getMessage().contains("Style '--' is invalid"));
            }

            //localizationService.parseTime("")
            try{
                localizationService.parseTime("");
                assertFalse("parseTime(\"\") did not throw an exception", false);
            }
            catch(Exception e){
                assertTrue("parseTime(\"\") threw an incorrect Exception", e.getMessage().contains("Invalid format: \"\""));
            }

            //localizationService.parseDate("")
            try{
                localizationService.parseDate("");
                assertFalse("parseDate(\"\") did not throw an exception", false);
            }
            catch(Exception e){
                assertTrue("parseDate(\"\") threw an incorrect Exception", e.getMessage().contains("Invalid format: \"\""));
            }

            //localizationService.parseInt(null)
            try{
                localizationService.parseInt("");
                assertFalse("parseInt(\"\") did not throw an exception", false);
            }
            catch(Exception e){
                assertTrue("parseInt(\"\") threw an incorrect Exception", e.getMessage().contains("Unparseable number: \"\""));
            }

            //localizationService.parseLong(null)
            try{
                localizationService.parseLong("");
                assertFalse("parseLong(\"\") did not throw an exception", false);
            }
            catch(Exception e){
                assertTrue("parseLong(\"\") threw an incorrect Exception", e.getMessage().contains("Unparseable number: \"\""));
            }

            //localizationService.parseFloat(null)
            try{
                localizationService.parseFloat("");
                assertFalse("parseFloat(\"\") did not throw an exception", false);
            }
            catch(Exception e){
                assertTrue("parseFloat(\"\") threw an incorrect Exception", e.getMessage().contains("Unparseable number: \"\""));
            }

            //localizationService.parseDouble(null)
            try{
                localizationService.parseDouble("");
                assertFalse("parseDouble(\"\") did not throw an exception", false);
            }
            catch(Exception e){
                assertTrue("parseDouble(\"\") threw an incorrect Exception", e.getMessage().contains("Unparseable number: \"\""));
            }

            //localizationService.parsePercent(null)
            try{
                localizationService.parsePercent("");
                assertFalse("parsePercent(\"\") did not throw an exception", false);
            }
            catch(Exception e){
                assertTrue("parsePercent(\"\") threw an incorrect Exception", e.getMessage().contains("Unparseable number: \"\""));
            }
        }
    }



    public void testLeniencyCurrencyParser() throws Exception {
        //API: parseCurrency(String currency, Locale l)
        //Locale: US $ -> UK £
        {
            String expectedGB = "£100,000.0000000009";
            String inputEN = "$100,000.0000000009";
            BigDecimal moneyEN = localizationService.parseCurrency(inputEN, Locale.US);
            String  actualGB = localizationService.formatCurrency(moneyEN, Locale.UK, 10, 10);
            assertEquals(expectedGB, actualGB);
        }
        //Locale US -> France
        {
            String expectedFR = DecimalFormat.getCurrencyInstance(Locale.FRANCE).format(100000000);
            String inputEN = "$100,000,000.000";
            BigDecimal moneyEN = localizationService.parseCurrency(inputEN, Locale.US);
            String  actualFR = localizationService.formatCurrency(moneyEN, Locale.FRANCE);
            assertEquals(expectedFR, actualFR);
        }
        //Locale US -> China
        {
            String expectedCN = DecimalFormat.getCurrencyInstance(Locale.CHINA).format(0.09);
            String inputEN = "$0.09";
            BigDecimal moneyEN = localizationService.parseCurrency(inputEN, Locale.US);
            String  actualCN = localizationService.formatCurrency(moneyEN, Locale.CHINA, 2, 2);
            assertEquals(expectedCN, actualCN);
        }
        //Locale US -> Japan
        {
            String expectedJP = DecimalFormat.getCurrencyInstance(Locale.JAPAN).format(9.2d);
            String inputEN = "$009.2";
            BigDecimal moneyEN = localizationService.parseCurrency(inputEN, Locale.US);
            String  actualJP = localizationService.formatCurrency(moneyEN, Locale.JAPAN, 2, -2);
            assertEquals(expectedJP, actualJP);
        }
        //Locale US -> Arabic
        {
            String expectedSA = DecimalFormat.getCurrencyInstance(new Locale("ar", "SA")).format(100001100.212d);
            String inputEN = "$100,001,100.212";
            BigDecimal moneyEN = localizationService.parseCurrency(inputEN, Locale.US);
            String  actualSA = localizationService.formatCurrency(moneyEN, new Locale("ar", "SA"));
            assertEquals(expectedSA, actualSA);
        }
    }



    public void testPercentParserExceptions() throws ParseException {
        //Test invalid Percent strings
        {
            int failures = 0;
            for(String per : LocalizationServiceTestData.FAIL_PERCENT_STRINGS){
                try{
                    localizationService.parsePercent(per, Locale.FRENCH);
                }catch(Exception e){
                    failures++;
                }
            }
            assertEquals("# Some strings which were expected to be invalid were successfully parsed into Percentages!",
                    LocalizationServiceTestData.FAIL_PERCENT_STRINGS.length, failures);
        }
    }



    public void testCurrencyParserExceptions() throws ParseException {
        //Test invalid Currency strings
        {
            int failures = 0;
            for(String curr : LocalizationServiceTestData.FAIL_CURRENCY_STRINGS){
                try{
                    localizationService.parseCurrency(curr, Locale.US);
                }catch(Exception e){
                    failures++;
                }
            }
            assertEquals("# Some strings which were expected to be invalid were successfully parsed into Currencies!",
                    LocalizationServiceTestData.FAIL_CURRENCY_STRINGS.length, failures);
        }

        //Currency in USD to parser with UK locale
        {
            String inputEN = "$1";
            try{
                localizationService.parseCurrency(inputEN, Locale.UK);
                assertTrue("# Exception not thrown for currency:"+inputEN, false);
            }
            catch(Exception e){
                assertTrue("# Incorrect exception type!", ((e instanceof ParseException)));
            }
        }

        //Currency in China Yuan to parser with US locale
        {
            String inputCN =  DecimalFormat.getCurrencyInstance(Locale.CHINA).format(0);
            try{
                localizationService.parseCurrency(inputCN, Locale.UK);
                assertTrue("# Exception not thrown for currency:"+inputCN, false);
            }
            catch(Exception e){
                assertTrue("# Incorrect exception type!", ((e instanceof ParseException)));
            }
        }

        //Currency in China Yuan to parser with Brazil locale
        {
            String inputCN =  DecimalFormat.getCurrencyInstance(Locale.CHINA).format(-1);
            try{
                localizationService.parseCurrency(inputCN, new Locale("pt", "BR"));
                assertTrue("# Exception not thrown for currency:"+inputCN, false);
            }
            catch(Exception e){
                assertTrue("# Incorrect exception type!", ((e instanceof ParseException)));
            }
        }
    }


    public void testIntParserExceptions() throws ParseException {
        //Test invalid Int strings
        {
            int failures = 0;
            for(String num : LocalizationServiceTestData.FAIL_INT_STRINGS){
                try{
                    localizationService.parseInt(num);
                }catch(Exception e){
                    failures++;
                }
            }
            assertEquals("# Some strings which were expected to be invalid were successfully parsed into Dates!",
                    LocalizationServiceTestData.FAIL_INT_STRINGS.length, failures);
        }

        //Number in US locale to parser with Hebrew locale

        //Apart from the  Locale mismatch in formatter and parser, the formatted number 12345.6d will be parsed as 12345
        //because the parser will start at the first character and go until it reaches either an expected or non-numeric
        //character then consider that the end. E.g. "100.0", "100a" will all return 100 but "*100", "a100" will throw
        //parse exception - this is now fixed with 'strict' parsing
        {
            String numEN = NumberFormat.getIntegerInstance(Locale.US).format(12345.6d);
            try{
                localizationService.parseInt(numEN, new Locale("iw", "IL"));
                assertFalse("# Exception not thrown for Int:"+numEN, false);
            }
            catch(Exception e){
                assertTrue("# Incorrect exception type!", ((e instanceof ParseException)));
            }
        }
    }



    public void testLongParserExceptions() throws ParseException {
        //Test invalid Long strings
        {
            int failures = 0;
            for(String num : LocalizationServiceTestData.FAIL_LONG_STRINGS){
                try{
                    localizationService.parseLong(num);
                }catch(Exception e){
                    failures++;
                }
            }
            assertEquals("# Some strings which were expected to be invalid were successfully parsed into Dates!",
                    LocalizationServiceTestData.FAIL_LONG_STRINGS.length, failures);
        }
    }



    public void testFloatParserExceptions() throws ParseException {
        //Test invalid Float strings
        {
            int failures = 0;
            for(String num : LocalizationServiceTestData.FAIL_FLOAT_STRINGS){
                try{
                    localizationService.parseFloat(num);
                }catch(Exception e){
                    failures++;
                }
            }
            assertEquals("# Some strings which were expected to be invalid were successfully parsed into Dates!",
                    LocalizationServiceTestData.FAIL_FLOAT_STRINGS.length, failures);
        }
    }



    public void testDoubleParserExceptions() throws ParseException {
        //Test invalid Double strings
        {
            int failures = 0;
            for(String num : LocalizationServiceTestData.FAIL_DOUBLE_STRINGS){
                try{
                    localizationService.parseDouble(num);
                }catch(Exception e){
                    failures++;
                }
            }
            assertEquals("# Some strings which were expected to be invalid were successfully parsed into Dates!",
                    LocalizationServiceTestData.FAIL_DOUBLE_STRINGS.length, failures);
        }
    }



    public void testStrictNumberParsing() throws ParseException {
        int failures = 0;
        NumberFormat nf = null;

        Map<Locale, String[]> strictParserTestNumberStrings = new HashMap<Locale, String[]>();
        strictParserTestNumberStrings.put(Locale.ENGLISH, new String[]{"100.200,300", "1 1", "100'200", "1.1.1.1"});
        strictParserTestNumberStrings.put(Locale.FRANCE, new String[]{"1 1 1 1", "1.1.1", "00. 000 000", "100,200.300"});
        strictParserTestNumberStrings.put(Locale.CHINESE, new String[]{"100 200", "1, 0,0", "100'2", "123 456"});
        strictParserTestNumberStrings.put(Locale.GERMAN, new String[]{"100,200,300.456", "0.123,456,789", "123 456", "111.111,111.111"});

        for(Locale locale : strictParserTestNumberStrings.keySet()){
            for(String num : strictParserTestNumberStrings.get(locale)){
                try{
                    nf = NumberFormat.getInstance(locale);
                    AuraNumberFormat.parseStrict(num, nf);
                    fail("# Exception not thrown for value:"+num+" and locale:"+locale.getDisplayName());
                }
                catch(Exception e){
                    failures++;
                }
            }
        }
        assertEquals("# Some strings which were expected to be invalid were successfully parsed into int Values!",
                16, failures);
    }


}
