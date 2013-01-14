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
/*
 * Copyright, 1999-2012, salesforce.com All Rights Reserved Company Confidential
 */
package org.auraframework.service;

import java.math.BigDecimal;
import java.text.DateFormat;
import java.text.DecimalFormat;
import java.text.NumberFormat;
import java.text.ParseException;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Currency;
import java.util.Date;
import java.util.List;
import java.util.Locale;
import java.util.TimeZone;

import org.auraframework.Aura;
import org.auraframework.adapter.LocalizationAdapter;
import org.auraframework.service.testdata.LocalizationServiceTestData;
import org.auraframework.util.AuraLocale;

/**
 * Unit tests for the Localization Service.
 * 
 * Mirrors the service methods for testing, and each is executed with a List of
 * Config objects specifying the Locales to test, and relies on a set of
 * constants from the Config class for other test parameters, such as sample
 * numbers, Dates, and DateFormat styles.
 */
public class LocalizationServiceTest extends BaseServiceTest<LocalizationService, LocalizationServiceTest.Config>
        implements LocalizationService {

    /**
     * For serialization.
     */
    private static final long serialVersionUID = -2454352051474425035L;

    public static final String[] SIMPLE_DATE_FORMAT_PATTERNS = { "yyyy.MM.dd G 'at' HH:mm:ss z", "EEE, MMM d, ''yy",
            "h:mm a", "hh 'o''clock' a, zzzz", "K:mm a, z", "yyyyy.MMMMM.dd GGG hh:mm aaa",
            "EEE, d MMM yyyy HH:mm:ss Z", "yyMMddHHmmssZ", "yyyy-MM-dd'T'HH:mm:ss.SSSZ" };
    // Wed Dec 31 16:00:00 PST 1969
    public Date inputTestDate = new Date(1);
    public String inputTestDateTimeStringStyle00 = "1970年1月1日 星期四 上午08時00分00秒 +08:00";
    // Sun Apr 01 16:27:52 PDT 2012
    public String inputTestDateTimeStringStyle03 = "2012年4月1日 星期日 上午 11:27";

    public String inputTestTimeString = "上午 08:00:00";

    /**
     * Constructor
     * 
     * @param name
     */
    public LocalizationServiceTest(String name) {
        super(name);
    }

    @Override
    public List<Config> getConfigs() {
        LocalizationAdapter adapter = Aura.getLocalizationAdapter();

        // TODO: add European, Asian, multi-byte, RTL languages
        List<Config> configs = new ArrayList<Config>();
        configs.add(new Config(adapter.getAuraLocale()));
        configs.add(new Config(adapter.getAuraLocale(Locale.ENGLISH)));
        configs.add(new Config(adapter.getAuraLocale(Locale.US, TimeZone.getDefault())));
        configs.add(new Config(adapter.getAuraLocale(Locale.US, TimeZone.getTimeZone("EST"))));

        return configs;
    }

    private Config getTraditionalChineseConfigAsDefault() {
        LocalizationAdapter adapter = Aura.getLocalizationAdapter();
        return new Config(adapter.getAuraLocale(Locale.TRADITIONAL_CHINESE, TimeZone.getTimeZone("GMT+8")));
    }

    private Calendar getTraditionalChineseCalendarAsDefault() {
        Calendar c = Calendar.getInstance(Locale.TRADITIONAL_CHINESE);
        c.setTime(inputTestDate);
        return c;
    }

    /**
     * Contains test configuration data for the Localization Service tests.
     * Actual test data is in LocalizationServiceTestData.java
     * 
     * 
     * 
     */
    public static class Config extends BaseServiceTest.Config {

        /**
         * The AuraLocale to test.
         */
        private AuraLocale auraLocale = null;

        /**
         * Constructor
         * 
         * @param auraLocale the testing AuraLocale for this Config
         */
        public Config(AuraLocale auraLocale) {
            setAuraLocale(auraLocale);
        }

        /**
         * Creates Calendars from the test DATES array of Date objects.
         * 
         * @param locale a Locale to apply to the Calendar
         * @return a Calendar array
         */
        public static Calendar[] getCalendars(Locale locale) {
            Calendar[] cals = new Calendar[LocalizationServiceTestData.DATES.length];
            for (int i = 0; i < cals.length; i++) {
                Calendar c = Calendar.getInstance(locale);
                c.setTime(LocalizationServiceTestData.DATES[i]);
                cals[i] = c;
            }
            return cals;
        }

        /**
         * Gets the AuraLocale.
         * 
         * @return a AuraLocale instance
         */
        public AuraLocale getAuraLocale() {
            return this.auraLocale;
        }

        /**
         * Sets the AuraLocale for testing.
         * 
         * @param auraLocale the AuraLocale to set
         */
        public void setAuraLocale(AuraLocale auraLocale) {
            this.auraLocale = auraLocale;
        }

    }

    @Override
    public String formatDate(Date date) {
        // we will be changing the system default and want to be able to set it
        // back to the original value
        Locale originalDefault = Locale.getDefault();
        try {
            // loop through all the Configs (Locales)
            for (Config c : getConfigs()) {

                AuraLocale loc = c.getAuraLocale();

                // set the system default to be the test config Locale, since no
                // arg is passed in to specify Locale
                Locale.setDefault(loc.getDateLocale());

                // loop through all the Dates
                for (Date d : LocalizationServiceTestData.DATES) {

                    // get the JDK standard answer (for default Locale and
                    // default Format
                    String expected = DateFormat.getDateInstance().format(d);

                    // get the Aura Localization Service answer
                    String actual = service.formatDate(d);

                    // make sure they match
                    assertEquals(expected, actual);
                }
            }
        } finally {
            // reset the default Locale even if tests fail
            Locale.setDefault(originalDefault);
        }

        // return value ignored for test
        return null;
    }

    @Override
    public String formatDate(Date date, int dateStyle) {
        Locale originalDefault = Locale.getDefault();
        try {
            for (Config c : getConfigs()) {
                AuraLocale loc = c.getAuraLocale();
                Locale.setDefault(loc.getDateLocale());
                for (Date d : LocalizationServiceTestData.DATES) {
                    for (int style : LocalizationServiceTestData.DATE_FORMATS) {
                        String expected = DateFormat.getDateInstance(style).format(d);
                        String actual = service.formatDate(d, style);
                        assertEquals(expected, actual);
                    }
                }
            }
        } finally {
            Locale.setDefault(originalDefault);
        }
        return null;
    }

    @Override
    public String formatDate(Date date, Locale locale) {
        for (Config c : getConfigs()) {
            AuraLocale loc = c.getAuraLocale();
            Locale l = loc.getDateLocale();
            for (Date d : LocalizationServiceTestData.DATES) {
                String expected = DateFormat.getDateInstance(DateFormat.DEFAULT, l).format(d);
                String actual = service.formatDate(d, l);
                assertEquals(expected, actual);
            }
        }
        return null;
    }

    @Override
    public String formatDate(Date date, Locale locale, TimeZone timeZone) {
        for (Config c : getConfigs()) {
            AuraLocale loc = c.getAuraLocale();
            Locale l = loc.getDateLocale();
            TimeZone tz = loc.getTimeZone();
            for (Date d : LocalizationServiceTestData.DATES) {
                DateFormat df = DateFormat.getDateInstance(DateFormat.DEFAULT, l);
                df.setTimeZone(tz);
                String expected = df.format(d);
                String actual = service.formatDate(d, l, tz);
                assertEquals(expected, actual);
            }
        }
        return null;
    }

    @Override
    public String formatDate(Date date, Locale locale, TimeZone timeZone, int dateStyle) {
        for (Config c : getConfigs()) {
            AuraLocale loc = c.getAuraLocale();
            Locale l = loc.getDateLocale();
            TimeZone tz = loc.getTimeZone();
            for (Date d : LocalizationServiceTestData.DATES) {
                for (int style : LocalizationServiceTestData.DATE_FORMATS) {
                    DateFormat df = DateFormat.getDateInstance(style, l);
                    df.setTimeZone(tz);
                    String expected = df.format(d);
                    String actual = service.formatDate(d, l, tz, style);
                    assertEquals(expected, actual);
                }
            }
        }
        return null;
    }

    @Override
    public String formatDate(Calendar cal) {
        Locale originalLocale = Locale.getDefault();
        try {
            for (Config c : getConfigs()) {
                AuraLocale loc = c.getAuraLocale();
                Locale l = loc.getDateLocale();
                Locale.setDefault(l);
                TimeZone tz = loc.getTimeZone();
                for (Calendar calendar : Config.getCalendars(l)) {
                    calendar.setTimeZone(tz);
                    DateFormat df = DateFormat.getDateInstance();
                    df.setTimeZone(tz);
                    String expected = df.format(calendar.getTime());
                    String actual = service.formatDate(calendar);
                    assertEquals(expected, actual);
                }
            }
        } finally {
            Locale.setDefault(originalLocale);
        }
        return null;
    }

    @Override
    public String formatDate(Calendar cal, int dateStyle) {
        Locale originalLocale = Locale.getDefault();
        try {
            for (Config c : getConfigs()) {
                AuraLocale loc = c.getAuraLocale();
                Locale l = loc.getDateLocale();
                Locale.setDefault(l);
                TimeZone tz = loc.getTimeZone();
                for (Calendar calendar : Config.getCalendars(l)) {
                    for (int style : LocalizationServiceTestData.DATE_FORMATS) {
                        calendar.setTimeZone(tz);
                        DateFormat df = DateFormat.getDateInstance(style, l);
                        df.setTimeZone(tz);
                        String expected = df.format(calendar.getTime());
                        String actual = service.formatDate(calendar, style);
                        assertEquals(expected, actual);
                    }
                }
            }
        } finally {
            Locale.setDefault(originalLocale);
        }
        return null;
    }

    @Override
    public String formatTime(Date time) {
        String expectedDate = "上午 08:00:00";

        // we will be changing the system default and want to be able to set it
        // back to the original value
        Locale originalDefault = Locale.getDefault();
        TimeZone originalTimeZone = TimeZone.getDefault();
        try {
            Config c = getTraditionalChineseConfigAsDefault();
            AuraLocale loc = c.getAuraLocale();
            Locale l = loc.getDateLocale();
            // set the system default (used when no Locale passed into a format
            // or parse method
            TimeZone.setDefault(loc.getTimeZone());
            Locale.setDefault(l);

            // get the Aura Localization Service answer
            String actual = service.formatTime(inputTestDate);
            // make sure they match
            assertEquals("Failed for locale: " + l.getDisplayName() + " timezone: " + loc.getTimeZone().getID(),
                    expectedDate, actual);
        } finally {
            // set the default Locale back
            TimeZone.setDefault(originalTimeZone);
            Locale.setDefault(originalDefault);
        }

        // return value ignored for test
        return null;
    }

    @Override
    public String formatTime(Date time, int timeStyle) {
        int i = 0;
        String expectedDates[] = { "上午 08:00:00", "上午 8:00", "上午 08:00:00", "上午08時00分00秒", "上午08時00分00秒 +08:00" };
        Locale originalDefault = Locale.getDefault();
        TimeZone originalTimeZone = TimeZone.getDefault();
        try {
            Config c = getTraditionalChineseConfigAsDefault();
            AuraLocale loc = c.getAuraLocale();
            Locale l = loc.getDateLocale();
            Locale.setDefault(l);
            TimeZone.setDefault(loc.getTimeZone());
            for (int style : LocalizationServiceTestData.DATE_FORMATS) {
                String actual = service.formatTime(inputTestDate, style);
                assertEquals("Failed for locale: " + l.getDisplayName() + " timezone: " + loc.getTimeZone().getID()
                        + " style: " + style, expectedDates[i++], actual);
            }
        } finally {
            Locale.setDefault(originalDefault);
            TimeZone.setDefault(originalTimeZone);
        }
        return null;
    }

    @Override
    public String formatTime(Date time, Locale locale) {
        for (Config c : getConfigs()) {
            AuraLocale loc = c.getAuraLocale();
            Locale l = loc.getDateLocale();
            for (Date d : LocalizationServiceTestData.TIMES) {
                String expected = DateFormat.getTimeInstance(DateFormat.DEFAULT, l).format(d);
                String actual = service.formatTime(d, l);
                assertEquals(expected, actual);
            }
        }
        return null;
    }

    @Override
    public String formatTime(Date time, Locale locale, TimeZone timeZone) {
        // refer to DateServiceTest.testGetTimeStyleConverter_locale_timeStyle
        return null;
    }

    @Override
    public String formatTime(Date time, Locale locale, TimeZone timeZone, int timeStyle) {
        // refer to DateServiceTest.testGetTimeStyleConverter_locale_timeStyle
        return null;
    }

    @Override
    public String formatTime(Calendar cal) {
        String expectedTime = "上午 08:00:00";
        Locale originalDefault = Locale.getDefault();
        TimeZone originalTimeZone = TimeZone.getDefault();
        try {
            Config c = getTraditionalChineseConfigAsDefault();
            AuraLocale loc = c.getAuraLocale();
            Locale l = loc.getDateLocale();
            Locale.setDefault(l);
            TimeZone.setDefault(loc.getTimeZone());
            TimeZone tz = loc.getTimeZone();
            Calendar calendar = getTraditionalChineseCalendarAsDefault();
            calendar.setTimeZone(tz);

            String actual = service.formatTime(calendar);
            assertEquals("Failed for locale: " + l.getDisplayName() + " timezone: " + loc.getTimeZone().getID(),
                    expectedTime, actual);
        } finally {
            Locale.setDefault(originalDefault);
            TimeZone.setDefault(originalTimeZone);
        }
        return null;
    }

    @Override
    public String formatTime(Calendar cal, int timeStyle) {
        int i = 0;
        String expectedDates[] = { "上午 08:00:00", "上午 8:00", "上午 08:00:00", "上午08時00分00秒", "上午08時00分00秒 +08:00" };
        Locale originalDefault = Locale.getDefault();
        TimeZone originalTimeZone = TimeZone.getDefault();
        try {
            Config c = getTraditionalChineseConfigAsDefault();
            AuraLocale loc = c.getAuraLocale();
            Locale l = loc.getDateLocale();
            Locale.setDefault(l);
            TimeZone tz = loc.getTimeZone();
            TimeZone.setDefault(tz);
            Calendar calendar = getTraditionalChineseCalendarAsDefault();
            calendar.setTimeZone(tz);
            for (int style : LocalizationServiceTestData.DATE_FORMATS) {
                String actual = service.formatTime(calendar, style);
                assertEquals("Failed for locale: " + l.getDisplayName() + " timezone: " + loc.getTimeZone().getID()
                        + " style: " + style, expectedDates[i++], actual);
            }
        } finally {
            Locale.setDefault(originalDefault);
            TimeZone.setDefault(originalTimeZone);
        }
        return null;
    }

    @Override
    public String formatDateTime(Date dateTime) {
        String expectedDateTime = "1970/1/1 上午 08:00:00";
        // we will be changing the system default and want to be able to set it
        // back to the original value
        Locale originalDefault = Locale.getDefault();
        TimeZone originalTimeZone = TimeZone.getDefault();
        try {
            Config c = getTraditionalChineseConfigAsDefault();
            AuraLocale loc = c.getAuraLocale();
            Locale l = loc.getDateLocale();
            Locale.setDefault(l);
            TimeZone.setDefault(loc.getTimeZone());

            // get the Aura Localization Service answer
            String actual = service.formatDateTime(inputTestDate);

            // make sure they match
            assertEquals("Failed for locale: " + l.getDisplayName() + " timezone: " + loc.getTimeZone().getID(),
                    expectedDateTime, actual);
        } finally {
            // set the default Locale back
            Locale.setDefault(originalDefault);
            TimeZone.setDefault(originalTimeZone);
        }

        // return value ignored for test
        return null;
    }

    @Override
    public String formatDateTime(Date dateTime, int dateStyle, int timeStyle) {
        String expectedDateTime = "1970年1月1日 星期四 上午08時00分00秒 +08:00";

        Locale originalDefault = Locale.getDefault();
        TimeZone originalTimeZone = TimeZone.getDefault();
        try {
            Config c = getTraditionalChineseConfigAsDefault();
            AuraLocale loc = c.getAuraLocale();
            Locale l = loc.getDateLocale();
            Locale.setDefault(l);
            TimeZone.setDefault(loc.getTimeZone());

            String actual = service.formatDateTime(inputTestDate, 0, 0);
            assertEquals("Failed for locale: " + l.getDisplayName() + " timezone: " + loc.getTimeZone().getID()
                    + " dateStyle: 0 timeStyle: 0", expectedDateTime, actual);
        } finally {
            Locale.setDefault(originalDefault);
            TimeZone.setDefault(originalTimeZone);
        }
        return null;
    }

    @Override
    public String formatDateTime(Date dateTime, Locale locale) {
        for (Config c : getConfigs()) {
            AuraLocale loc = c.getAuraLocale();
            Locale l = loc.getDateLocale();
            for (Date d : LocalizationServiceTestData.TIMES) {
                String expected = DateFormat.getDateTimeInstance(DateFormat.DEFAULT, DateFormat.DEFAULT, l).format(d);
                String actual = service.formatDateTime(d, l);
                assertEquals(expected, actual);
            }
        }
        return null;
    }

    @Override
    public String formatDateTime(Date dateTime, Locale locale, TimeZone timeZone) {
        // refer to
        // DateServiceTest.testGetDateTimeStyleConverter_locale_dateStyle_timeStyle
        return null;
    }

    @Override
    public String formatDateTime(Date dateTime, Locale locale, TimeZone timeZone, int dateStyle, int timeStyle) {
        // refer to
        // DateServiceTest.testGetDateTimeStyleConverter_locale_dateStyle_timeStyle
        return null;
    }

    @Override
    public String formatDateTime(Date date, Locale locale, TimeZone timeZone, String format) {
        // refer to DateServiceTest.testGetPatternConverter_locale_pattern
        return null;
    }

    @Override
    public String formatDateTime(Calendar cal) {
        String expectedDateTime = "1970/1/1 上午 08:00:00";
        Locale originalDefault = Locale.getDefault();
        TimeZone originalTimeZone = TimeZone.getDefault();
        try {
            Config c = getTraditionalChineseConfigAsDefault();
            AuraLocale loc = c.getAuraLocale();
            Locale l = loc.getDateLocale();
            TimeZone tz = loc.getTimeZone();
            Locale.setDefault(l);
            TimeZone.setDefault(tz);
            Calendar calendar = getTraditionalChineseCalendarAsDefault();
            calendar.setTimeZone(tz);
            String actual = service.formatDateTime(calendar);
            assertEquals("Failed for locale: " + l.getDisplayName() + " timezone: " + loc.getTimeZone().getID(),
                    expectedDateTime, actual);
        } finally {
            Locale.setDefault(originalDefault);
            TimeZone.setDefault(originalTimeZone);
        }
        return null;
    }

    @Override
    public String formatDateTime(Calendar cal, int dateStyle, int timeStyle) {
        Locale originalDefault = Locale.getDefault();
        try {
            Config c = getTraditionalChineseConfigAsDefault();
            AuraLocale loc = c.getAuraLocale();
            Locale l = loc.getDateLocale();
            TimeZone tz = loc.getTimeZone();
            Locale.setDefault(l);
            Calendar calendar = getTraditionalChineseCalendarAsDefault();
            calendar.setTimeZone(tz);
            String actual = service.formatDateTime(calendar, 0, 0);
            assertEquals("Failed for locale: " + l.getDisplayName() + " timezone: " + loc.getTimeZone().getID()
                    + " dateSstyle: 0 timeStyle: 0", inputTestDateTimeStringStyle00, actual);
        } finally {
            Locale.setDefault(originalDefault);
        }
        return null;
    }

    @Override
    public String formatNumber(int number) {
        Locale originalDefault = Locale.getDefault();
        try {
            for (Config c : getConfigs()) {
                AuraLocale loc = c.getAuraLocale();
                Locale l = loc.getNumberLocale();
                Locale.setDefault(l);
                for (int n : LocalizationServiceTestData.INTS) {
                    String expected = NumberFormat.getIntegerInstance().format(n);
                    String actual = service.formatNumber(n);
                    assertEquals(expected, actual);
                }
            }
        } finally {
            Locale.setDefault(originalDefault);
        }
        return null;
    }

    @Override
    public String formatNumber(long number) {
        Locale originalDefault = Locale.getDefault();
        try {
            for (Config c : getConfigs()) {
                AuraLocale loc = c.getAuraLocale();
                Locale l = loc.getNumberLocale();
                Locale.setDefault(l);
                for (long n : LocalizationServiceTestData.LONGS) {
                    String expected = NumberFormat.getIntegerInstance().format(n);
                    String actual = service.formatNumber(n);
                    assertEquals(expected, actual);
                }
            }
        } finally {
            Locale.setDefault(originalDefault);
        }
        return null;
    }

    @Override
    public String formatNumber(double number) {
        Locale originalDefault = Locale.getDefault();
        try {
            for (Config c : getConfigs()) {
                AuraLocale loc = c.getAuraLocale();
                Locale l = loc.getNumberLocale();
                Locale.setDefault(l);
                for (double n : LocalizationServiceTestData.DOUBLES) {
                    String expected = NumberFormat.getNumberInstance().format(n);
                    String actual = service.formatNumber(n);
                    assertEquals(expected, actual);
                }
            }
        } finally {
            Locale.setDefault(originalDefault);
        }
        return null;
    }

    @Override
    public String formatNumber(Integer number) {
        Locale originalDefault = Locale.getDefault();
        try {
            for (Config c : getConfigs()) {
                AuraLocale loc = c.getAuraLocale();
                Locale l = loc.getNumberLocale();
                Locale.setDefault(l);
                for (int n : LocalizationServiceTestData.INTS) {
                    Integer testValue = new Integer(n);
                    String expected = NumberFormat.getIntegerInstance().format(testValue);
                    String actual = service.formatNumber(testValue);
                    assertEquals(expected, actual);
                }
            }
        } finally {
            Locale.setDefault(originalDefault);
        }
        return null;
    }

    @Override
    public String formatNumber(Long number) {
        Locale originalDefault = Locale.getDefault();
        try {
            for (Config c : getConfigs()) {
                AuraLocale loc = c.getAuraLocale();
                Locale l = loc.getNumberLocale();
                Locale.setDefault(l);
                for (long n : LocalizationServiceTestData.LONGS) {
                    Long testValue = new Long(n);
                    String expected = NumberFormat.getIntegerInstance().format(testValue);
                    String actual = service.formatNumber(testValue);
                    assertEquals(expected, actual);
                }
            }
        } finally {
            Locale.setDefault(originalDefault);
        }
        return null;
    }

    @Override
    public String formatNumber(Double number) {
        Locale originalDefault = Locale.getDefault();
        try {
            for (Config c : getConfigs()) {
                AuraLocale loc = c.getAuraLocale();
                Locale l = loc.getNumberLocale();
                Locale.setDefault(l);
                for (double n : LocalizationServiceTestData.DOUBLES) {
                    Double testValue = new Double(n);
                    String expected = NumberFormat.getNumberInstance().format(testValue);
                    String actual = service.formatNumber(testValue);
                    assertEquals(expected, actual);
                }
            }
        } finally {
            Locale.setDefault(originalDefault);
        }
        return null;
    }

    @Override
    public String formatNumber(Double number, int minFractionDigits, int maxFractionDigits) {
        Locale originalDefault = Locale.getDefault();
        try {
            for (Config c : getConfigs()) {
                AuraLocale loc = c.getAuraLocale();
                Locale l = loc.getNumberLocale();
                Locale.setDefault(l);
                for (double n : LocalizationServiceTestData.DOUBLES) {
                    for (int min : LocalizationServiceTestData.FRACTION_DIGITS) {
                        for (int max : LocalizationServiceTestData.FRACTION_DIGITS) {
                            Double testValue = new Double(n);
                            NumberFormat nf = NumberFormat.getNumberInstance();
                            nf.setMinimumFractionDigits(min);
                            nf.setMaximumFractionDigits(max);
                            String expected = nf.format(testValue);
                            String actual = service.formatNumber(testValue, min, max);
                            assertEquals(expected, actual);
                        }
                    }
                }
            }
        } finally {
            Locale.setDefault(originalDefault);
        }
        return null;
    }

    @Override
    public String formatNumber(int number, Locale locale) {
        for (Config c : getConfigs()) {
            AuraLocale loc = c.getAuraLocale();
            Locale l = loc.getNumberLocale();
            for (int n : LocalizationServiceTestData.INTS) {
                String expected = NumberFormat.getIntegerInstance(l).format(n);
                String actual = service.formatNumber(n, l);
                assertEquals(expected, actual);
            }
        }
        return null;
    }

    @Override
    public String formatNumber(long number, Locale locale) {
        for (Config c : getConfigs()) {
            AuraLocale loc = c.getAuraLocale();
            Locale l = loc.getNumberLocale();
            for (long n : LocalizationServiceTestData.LONGS) {
                String expected = NumberFormat.getIntegerInstance(l).format(n);
                String actual = service.formatNumber(n, l);
                assertEquals(expected, actual);
            }
        }
        return null;
    }

    @Override
    public String formatNumber(double number, Locale locale) {
        for (Config c : getConfigs()) {
            AuraLocale loc = c.getAuraLocale();
            Locale l = loc.getNumberLocale();
            for (double n : LocalizationServiceTestData.DOUBLES) {
                String expected = NumberFormat.getNumberInstance(l).format(n);
                String actual = service.formatNumber(n, l);
                assertEquals(expected, actual);
            }
        }
        return null;
    }

    @Override
    public String formatNumber(Integer number, Locale locale) {
        for (Config c : getConfigs()) {
            AuraLocale loc = c.getAuraLocale();
            Locale l = loc.getNumberLocale();
            for (int n : LocalizationServiceTestData.INTS) {
                Integer testValue = new Integer(n);
                String expected = NumberFormat.getIntegerInstance(l).format(testValue);
                String actual = service.formatNumber(testValue, l);
                assertEquals(expected, actual);
            }
        }
        return null;
    }

    @Override
    public String formatNumber(Long number, Locale locale) {
        for (Config c : getConfigs()) {
            AuraLocale loc = c.getAuraLocale();
            Locale l = loc.getNumberLocale();
            for (long n : LocalizationServiceTestData.LONGS) {
                Long testValue = new Long(n);
                String expected = NumberFormat.getIntegerInstance(l).format(testValue);
                String actual = service.formatNumber(testValue, l);
                assertEquals(expected, actual);
            }
        }
        return null;
    }

    @Override
    public String formatNumber(Double number, Locale locale) {
        for (Config c : getConfigs()) {
            AuraLocale loc = c.getAuraLocale();
            Locale l = loc.getNumberLocale();
            for (double n : LocalizationServiceTestData.DOUBLES) {
                Double testValue = new Double(n);
                String expected = NumberFormat.getNumberInstance(l).format(testValue);
                String actual = service.formatNumber(testValue, l);
                assertEquals(expected, actual);
            }
        }
        return null;
    }

    @Override
    public String formatNumber(Double number, Locale locale, int minFractionDigits, int maxFractionDigits) {
        for (Config c : getConfigs()) {
            AuraLocale loc = c.getAuraLocale();
            Locale l = loc.getNumberLocale();
            for (double n : LocalizationServiceTestData.DOUBLES) {
                for (int min : LocalizationServiceTestData.FRACTION_DIGITS) {
                    for (int max : LocalizationServiceTestData.FRACTION_DIGITS) {
                        Double testValue = new Double(n);
                        NumberFormat nf = NumberFormat.getInstance(l);
                        nf.setMinimumFractionDigits(min);
                        nf.setMaximumFractionDigits(max);
                        String expected = nf.format(testValue);
                        String actual = service.formatNumber(testValue, l, min, max);
                        assertEquals(expected, actual);
                    }
                }
            }
        }
        return null;
    }

    @Override
    public String formatPercent(double percent) {
        Locale originalDefault = Locale.getDefault();
        try {
            for (Config c : getConfigs()) {
                AuraLocale loc = c.getAuraLocale();
                Locale l = loc.getNumberLocale();
                Locale.setDefault(l);
                for (double n : LocalizationServiceTestData.PERCENTS) {
                    String expected = NumberFormat.getPercentInstance().format(n);
                    String actual = service.formatPercent(n);
                    assertEquals(expected, actual);
                }
            }
        } finally {
            Locale.setDefault(originalDefault);
        }
        return null;
    }

    @Override
    public String formatPercent(double percent, int minFractionDigits, int maxFractionDigits) {
        Locale originalDefault = Locale.getDefault();
        try {
            for (Config c : getConfigs()) {
                AuraLocale loc = c.getAuraLocale();
                Locale l = loc.getNumberLocale();
                Locale.setDefault(l);
                for (double n : LocalizationServiceTestData.PERCENTS) {
                    for (int min : LocalizationServiceTestData.FRACTION_DIGITS) {
                        for (int max : LocalizationServiceTestData.FRACTION_DIGITS) {
                            NumberFormat nf = NumberFormat.getPercentInstance();
                            nf.setMinimumFractionDigits(min);
                            nf.setMaximumFractionDigits(max);
                            String expected = nf.format(n);
                            String actual = service.formatPercent(n, min, max);
                            assertEquals(expected, actual);
                        }
                    }
                }
            }
        } finally {
            Locale.setDefault(originalDefault);
        }
        return null;
    }

    @Override
    public String formatPercent(double percent, Locale locale) {
        for (Config c : getConfigs()) {
            AuraLocale loc = c.getAuraLocale();
            Locale l = loc.getNumberLocale();
            for (double n : LocalizationServiceTestData.PERCENTS) {
                String expected = NumberFormat.getPercentInstance(l).format(n);
                String actual = service.formatPercent(n, l);
                assertEquals(expected, actual);
            }
        }
        return null;
    }

    @Override
    public String formatPercent(double percent, Locale locale, int minFractionDigits, int maxFractionDigits) {
        for (Config c : getConfigs()) {
            AuraLocale loc = c.getAuraLocale();
            Locale l = loc.getNumberLocale();
            for (double n : LocalizationServiceTestData.PERCENTS) {
                for (int min : LocalizationServiceTestData.FRACTION_DIGITS) {
                    for (int max : LocalizationServiceTestData.FRACTION_DIGITS) {
                        NumberFormat nf = NumberFormat.getPercentInstance(l);
                        nf.setMinimumFractionDigits(min);
                        nf.setMaximumFractionDigits(max);
                        String expected = nf.format(n);
                        String actual = service.formatPercent(n, l, min, max);
                        assertEquals(expected, actual);
                    }
                }
            }
        }
        return null;
    }

    @Override
    public String formatCurrency(double currency) {
        Locale originalDefault = Locale.getDefault();
        try {
            for (Config c : getConfigs()) {
                AuraLocale loc = c.getAuraLocale();
                Locale l = loc.getNumberLocale();
                Locale.setDefault(l);
                for (double n : LocalizationServiceTestData.CURRENCY_DOUBLES) {
                    String expected = NumberFormat.getCurrencyInstance().format(n);
                    String actual = service.formatCurrency(n);
                    assertEquals(expected, actual);
                }
            }
        } finally {
            Locale.setDefault(originalDefault);
        }
        return null;
    }

    @Override
    public String formatCurrency(double currency, int minFractionDigits, int maxFractionDigits) {
        Locale originalDefault = Locale.getDefault();
        try {
            for (Config c : getConfigs()) {
                AuraLocale loc = c.getAuraLocale();
                Locale l = loc.getNumberLocale();
                Locale.setDefault(l);
                for (double n : LocalizationServiceTestData.CURRENCY_DOUBLES) {
                    for (int min : LocalizationServiceTestData.FRACTION_DIGITS) {
                        for (int max : LocalizationServiceTestData.FRACTION_DIGITS) {
                            NumberFormat nf = NumberFormat.getCurrencyInstance();
                            nf.setMinimumFractionDigits(min);
                            nf.setMaximumFractionDigits(max);
                            String expected = nf.format(n);
                            String actual = service.formatCurrency(n, min, max);
                            assertEquals(expected, actual);
                        }
                    }
                }
            }
        } finally {
            Locale.setDefault(originalDefault);
        }
        return null;
    }

    @Override
    public String formatCurrency(double currency, Locale locale) {
        for (Config c : getConfigs()) {
            AuraLocale loc = c.getAuraLocale();
            Locale l = loc.getNumberLocale();
            for (double n : LocalizationServiceTestData.CURRENCY_DOUBLES) {
                String expected = NumberFormat.getCurrencyInstance(l).format(n);
                String actual = service.formatCurrency(n, l);
                assertEquals(expected, actual);
            }
        }
        return null;
    }

    @Override
    public String formatCurrency(double currency, Locale locale, int minFractionDigits, int maxFractionDigits) {
        for (Config c : getConfigs()) {
            AuraLocale loc = c.getAuraLocale();
            Locale l = loc.getNumberLocale();
            for (double n : LocalizationServiceTestData.CURRENCY_DOUBLES) {
                for (int min : LocalizationServiceTestData.FRACTION_DIGITS) {
                    for (int max : LocalizationServiceTestData.FRACTION_DIGITS) {
                        NumberFormat nf = NumberFormat.getCurrencyInstance(l);
                        nf.setMinimumFractionDigits(min);
                        nf.setMaximumFractionDigits(max);
                        String expected = nf.format(n);
                        String actual = service.formatCurrency(n, l, min, max);
                        assertEquals(expected, actual);
                    }
                }
            }
        }
        return null;
    }

    @Override
    public String formatCurrency(double value, Locale locale, int minFractionDigits, int maxFractionDigits,
            Currency currency) {
        return null; // TODO - Nihar?
    }

    @Override
    public String formatCurrency(BigDecimal value) {
        Locale originalDefault = Locale.getDefault();
        try {
            for (Config c : getConfigs()) {
                AuraLocale loc = c.getAuraLocale();
                Locale l = loc.getNumberLocale();
                Locale.setDefault(l);
                DecimalFormat df = (DecimalFormat) NumberFormat.getCurrencyInstance();
                df.setParseBigDecimal(true);
                for (BigDecimal n : LocalizationServiceTestData.CURRENCY_BIGDECIMALS) {
                    String expected = df.format(n);
                    String actual = service.formatCurrency(n);
                    assertEquals(expected, actual);
                }
            }
        } finally {
            Locale.setDefault(originalDefault);
        }
        return null;
    }

    @Override
    public String formatCurrency(BigDecimal value, int minFractionDigits, int maxFractionDigits) {
        Locale originalDefault = Locale.getDefault();
        try {
            for (Config c : getConfigs()) {
                AuraLocale loc = c.getAuraLocale();
                Locale l = loc.getNumberLocale();
                Locale.setDefault(l);
                for (BigDecimal n : LocalizationServiceTestData.CURRENCY_BIGDECIMALS) {
                    for (int min : LocalizationServiceTestData.FRACTION_DIGITS) {
                        for (int max : LocalizationServiceTestData.FRACTION_DIGITS) {
                            DecimalFormat df = (DecimalFormat) NumberFormat.getCurrencyInstance();
                            df.setParseBigDecimal(true);
                            df.setMinimumFractionDigits(min);
                            df.setMaximumFractionDigits(max);
                            String expected = df.format(n);
                            String actual = service.formatCurrency(n, min, max);
                            assertEquals(expected, actual);
                        }
                    }
                }
            }
        } finally {
            Locale.setDefault(originalDefault);
        }
        return null;
    }

    @Override
    public String formatCurrency(BigDecimal value, Locale locale) {
        for (Config c : getConfigs()) {
            AuraLocale loc = c.getAuraLocale();
            Locale l = loc.getNumberLocale();
            for (BigDecimal n : LocalizationServiceTestData.CURRENCY_BIGDECIMALS) {
                DecimalFormat df = (DecimalFormat) NumberFormat.getCurrencyInstance(l);
                df.setParseBigDecimal(true);
                String expected = df.format(n);
                String actual = service.formatCurrency(n, l);
                assertEquals(expected, actual);
            }
        }
        return null;
    }

    @Override
    public String formatCurrency(BigDecimal value, Locale locale, int minFractionDigits, int maxFractionDigits) {
        for (Config c : getConfigs()) {
            AuraLocale loc = c.getAuraLocale();
            Locale l = loc.getNumberLocale();
            for (BigDecimal n : LocalizationServiceTestData.CURRENCY_BIGDECIMALS) {
                for (int min : LocalizationServiceTestData.FRACTION_DIGITS) {
                    for (int max : LocalizationServiceTestData.FRACTION_DIGITS) {
                        DecimalFormat df = (DecimalFormat) NumberFormat.getCurrencyInstance(l);
                        df.setParseBigDecimal(true);
                        df.setMinimumFractionDigits(min);
                        df.setMaximumFractionDigits(max);
                        String expected = df.format(n);
                        String actual = service.formatCurrency(n, l, min, max);
                        assertEquals(expected, actual);
                    }
                }
            }
        }
        return null;
    }

    @Override
    public String formatCurrency(BigDecimal value, Locale locale, int minFractionDigits, int maxFractionDigits,
            Currency currency) {
        return null; // TODO - Nihar
    }

    @Override
    public Date parseDate(String date) throws ParseException {
        // we will be changing the system default and want to be able to set it
        // back to the original value
        Locale originalDefault = Locale.getDefault();
        try {
            // loop through all the Configs (Locales)
            for (Config c : getConfigs()) {

                AuraLocale loc = c.getAuraLocale();
                Locale l = loc.getDateLocale();
                Locale.setDefault(l);

                // loop through all the Dates
                for (Date d : LocalizationServiceTestData.DATES) {

                    // get the JDK standard starting value (the date String for
                    // the default Locale)
                    String testValue = DateFormat.getDateInstance().format(d);

                    // parse it through the JDK
                    Date expected = DateFormat.getDateInstance().parse(testValue);

                    // parse it through Aura Localization Service
                    Date actual = service.parseDate(testValue);

                    // make sure they match
                    assertEquals(expected, actual);
                }
            }
        } finally {
            // always reset the default Locale
            Locale.setDefault(originalDefault);
        }

        // return value ignored for test
        return null;
    }

    @Override
    public Date parseDate(String date, int dateStyle) throws ParseException {
        Locale originalDefault = Locale.getDefault();
        try {
            for (Config c : getConfigs()) {
                AuraLocale loc = c.getAuraLocale();
                Locale l = loc.getDateLocale();
                Locale.setDefault(l);
                for (Date d : LocalizationServiceTestData.DATES) {
                    for (int style : LocalizationServiceTestData.DATE_FORMATS) {
                        String testValue = DateFormat.getDateInstance(style).format(d);
                        Date expected = DateFormat.getDateInstance(style).parse(testValue);
                        Date actual = service.parseDate(testValue, style);
                        assertEquals(expected, actual);
                    }
                }
            }
        } finally {
            Locale.setDefault(originalDefault);
        }
        return null;
    }

    @Override
    public Date parseDate(String date, Locale locale) throws ParseException {
        // refer to DateServiceTest.testGetDateStyleConverter_locale_dateStyle
        return null;
    }

    @Override
    public Date parseDate(String date, Locale locale, TimeZone timeZone) throws ParseException {
        // refer to DateServiceTest.testGetDateStyleConverter_locale_dateStyle
        return null;
    }

    @Override
    public Date parseDate(String date, Locale locale, TimeZone timeZone, int dateStyle) throws ParseException {
        // refer to DateServiceTest.testGetDateStyleConverter_locale_dateStyle
        return null;
    }

    @Override
    public Calendar parseDateToCalendar(String date, Locale locale, TimeZone timeZone, int dateStyle)
            throws ParseException {
        // refer to DateServiceTest.testGetDateStyleConverter_locale_dateStyle
        return null;
    }

    @Override
    public Date parseTime(String time) throws ParseException {
        String expectedTime = "Fri Jan 02 00:00:00 GMT+08:00 1970";
        // we will be changing the system default and want to be able to set it
        // back to the original value
        Locale originalDefault = Locale.getDefault();
        TimeZone originalTimeZone = TimeZone.getDefault();
        try {
            Config c = getTraditionalChineseConfigAsDefault();
            AuraLocale loc = c.getAuraLocale();
            Locale l = loc.getDateLocale();
            Locale.setDefault(l);
            TimeZone.setDefault(loc.getTimeZone());

            // parse it through Aura Localization Service
            Date actual = service.parseTime(inputTestTimeString);
            // make sure they match
            assertEquals(expectedTime, actual.toString());
            assertEquals("Failed for locale: " + l.getDisplayName() + " timezone: " + loc.getTimeZone().getID(),
                    expectedTime, actual.toString());
        } finally {
            // always reset the default Locale
            Locale.setDefault(originalDefault);
            TimeZone.setDefault(originalTimeZone);
        }

        // return value ignored for test
        return null;
    }

    @Override
    public Date parseTime(String time, int timeStyle) throws ParseException {
        String expectedTime = "Thu Jan 01 08:00:00 PST 1970";
        Locale originalDefault = Locale.getDefault();
        try {
            Config c = getTraditionalChineseConfigAsDefault();
            AuraLocale loc = c.getAuraLocale();
            Locale l = loc.getDateLocale();
            Locale.setDefault(l);

            Date actual = service.parseTime(inputTestTimeString, 2);
            assertEquals("Failed for locale: " + l.getDisplayName() + " timezone: " + loc.getTimeZone().getID()
                    + " style: 2", expectedTime, actual.toString());

        } finally {
            Locale.setDefault(originalDefault);
        }
        return null;
    }

    @Override
    public Date parseTime(String time, Locale locale) throws ParseException {
        // refer to DateServiceTest.testGetTimeStyleConverter_locale_timeStyle
        return null;
    }

    @Override
    public Date parseTime(String time, Locale locale, TimeZone timeZone) throws ParseException {
        // refer to DateServiceTest.testGetTimeStyleConverter_locale_timeStyle
        return null;
    }

    @Override
    public Date parseTime(String time, Locale locale, TimeZone timeZone, int timeStyle) throws ParseException {
        // refer to DateServiceTest.testGetTimeStyleConverter_locale_timeStyle
        return null;
    }

    @Override
    public Calendar parseTimeToCalendar(String time, Locale locale, TimeZone timeZone, int timeStyle)
            throws ParseException {
        // refer to DateServiceTest.testGetTimeStyleConverter_locale_timeStyle
        return null;
    }

    @Override
    public Date parseDateTime(String dateTime) throws ParseException {
        // we will be changing the system default and want to be able to set it
        // back to the original value
        Locale originalDefault = Locale.getDefault();
        try {
            // loop through all the Configs (Locales)
            for (Config c : getConfigs()) {

                AuraLocale loc = c.getAuraLocale();
                Locale l = loc.getDateLocale();
                Locale.setDefault(l);

                // loop through all the Dates
                for (Date d : LocalizationServiceTestData.DATE_TIMES) {

                    // get the JDK standard starting value (the date String for
                    // the default Locale)
                    String testValue = DateFormat.getDateTimeInstance().format(d);

                    // parse it through the JDK
                    Date expected = DateFormat.getDateTimeInstance().parse(testValue);

                    // parse it through Aura Localization Service
                    Date actual = service.parseDateTime(testValue);

                    // make sure they match
                    assertEquals(expected, actual);
                }
            }

        } finally {
            // always reset the default Locale
            Locale.setDefault(originalDefault);
        }

        // return value ignored for test
        return null;
    }

    @Override
    public Date parseDateTime(String dateTime, int dateStyle, int timeStyle) throws ParseException {
        String expectedDateTime = "Sun Apr 01 11:27:00 PDT 2012";
        Locale originalDefault = Locale.getDefault();
        try {
            Config c = getTraditionalChineseConfigAsDefault();
            AuraLocale loc = c.getAuraLocale();
            Locale l = loc.getDateLocale();
            Locale.setDefault(l);
            Date actual = service.parseDateTime(inputTestDateTimeStringStyle03, 0, 3);
            assertEquals("Failed for locale: " + l.getDisplayName() + " timezone: " + loc.getTimeZone().getID(),
                    expectedDateTime, actual.toString());
        } finally {
            Locale.setDefault(originalDefault);
        }
        return null;
    }

    @Override
    public Date parseDateTime(String dateTime, Locale locale) throws ParseException {
        // refer to
        // DateServiceTest.testGetDateTimeStyleConverter_locale_dateStyle_timeStyle
        return null;
    }

    @Override
    public Date parseDateTime(String dateTime, Locale locale, TimeZone timeZone) throws ParseException {
        // refer to
        // DateServiceTest.testGetDateTimeStyleConverter_locale_dateStyle_timeStyle
        return null;
    }

    @Override
    public Date parseDateTime(String dateTime, Locale locale, TimeZone timeZone, int dateStyle, int timeStyle)
            throws ParseException {
        // refer to
        // DateServiceTest.testGetDateTimeStyleConverter_locale_dateStyle_timeStyle
        return null;
    }

    @Override
    public Date parseDateTime(String dateTime, Locale locale, TimeZone timeZone, String format) throws ParseException {
        // refer to DateServiceTest.testGetPatternConverter_locale_pattern
        return null;
    }

    @Override
    public Calendar parseDateTimeToCalendar(String dateTime, Locale locale, TimeZone timeZone, int dateStyle,
            int timeStyle) throws ParseException {
        // refer to
        // DateServiceTest.testGetDateTimeStyleConverter_locale_dateStyle_timeStyle
        return null;
    }

    @Override
    public int parseInt(String number) throws ParseException {
        Locale originalDefault = Locale.getDefault();
        try {
            for (Config c : getConfigs()) {
                AuraLocale loc = c.getAuraLocale();
                Locale l = loc.getNumberLocale();
                Locale.setDefault(l);
                for (int n : LocalizationServiceTestData.INTS) {

                    // get the JDK standard starting value (the localized number
                    // String for the default Locale)
                    String testValue = NumberFormat.getIntegerInstance().format(n);

                    // parse it through the JDK
                    int expected = NumberFormat.getIntegerInstance().parse(testValue).intValue();

                    // parse it through Aura Localization Service
                    int actual = service.parseInt(testValue);

                    // make sure they match
                    assertEquals(expected, actual);
                }
            }

        } finally {
            // always reset the default Locale
            Locale.setDefault(originalDefault);
        }
        return 0;
    }

    @Override
    public long parseLong(String number) throws ParseException {
        Locale originalDefault = Locale.getDefault();
        try {
            for (Config c : getConfigs()) {
                AuraLocale loc = c.getAuraLocale();
                Locale l = loc.getNumberLocale();
                Locale.setDefault(l);
                for (long n : LocalizationServiceTestData.LONGS) {
                    String testValue = NumberFormat.getIntegerInstance().format(n);
                    long expected = NumberFormat.getIntegerInstance().parse(testValue).longValue();
                    long actual = service.parseLong(testValue);
                    assertEquals(expected, actual);
                }
            }
        } finally {
            Locale.setDefault(originalDefault);
        }
        return 0;
    }

    @Override
    public float parseFloat(String number) throws ParseException {
        Locale originalDefault = Locale.getDefault();
        try {
            for (Config c : getConfigs()) {
                AuraLocale loc = c.getAuraLocale();
                Locale l = loc.getNumberLocale();
                Locale.setDefault(l);
                for (float n : LocalizationServiceTestData.FLOATS) {
                    String testValue = NumberFormat.getNumberInstance().format(n);
                    float expected = NumberFormat.getNumberInstance().parse(testValue).floatValue();
                    float actual = service.parseFloat(testValue);
                    assertEquals(expected, actual);
                }
            }
        } finally {
            Locale.setDefault(originalDefault);
        }
        return 0;
    }

    @Override
    public double parseDouble(String number) throws ParseException {
        Locale originalDefault = Locale.getDefault();
        try {
            for (Config c : getConfigs()) {
                AuraLocale loc = c.getAuraLocale();
                Locale l = loc.getNumberLocale();
                Locale.setDefault(l);
                for (double n : LocalizationServiceTestData.DOUBLES) {
                    String testValue = NumberFormat.getNumberInstance().format(n);
                    double expected = NumberFormat.getNumberInstance().parse(testValue).doubleValue();
                    double actual = service.parseDouble(testValue);
                    assertEquals(expected, actual);
                }
            }
        } finally {
            Locale.setDefault(originalDefault);
        }
        return 0;
    }

    @Override
    public int parseInt(String number, Locale locale) throws ParseException {
        for (Config c : getConfigs()) {
            AuraLocale loc = c.getAuraLocale();
            Locale l = loc.getNumberLocale();
            for (int n : LocalizationServiceTestData.INTS) {
                String testValue = NumberFormat.getIntegerInstance(l).format(n);
                int expected = NumberFormat.getIntegerInstance(l).parse(testValue).intValue();
                int actual = service.parseInt(testValue, l);
                assertEquals(expected, actual);
            }

            // loop through all the hard coded test data expected to pass
            for (String n : LocalizationServiceTestData.PASS_INT_STRINGS) {
                try {
                    // parse it through Aura Localization Service
                    service.parseInt(n, l);
                } catch (Exception e) {
                    assertTrue("# Exception thrown for valid {int} test data:" + n + " & locale:" + l.getDisplayName()
                            + "\n" + e.getMessage(), false);
                }
            }

            // loop through all the hard coded test data expected to fail
            for (String n : LocalizationServiceTestData.FAIL_INT_STRINGS) {
                try {
                    // parse it through Aura Localization Service
                    service.parseInt(n, l);
                    assertTrue(
                            "# Exception not thrown for invalid {int} test data:" + n + " & locale: "
                                    + l.getDisplayName(), false);
                } catch (Exception e) {
                    assertTrue("# Incorrect exception type!", ((e instanceof ParseException)));
                }
            }
        }
        return 0;
    }

    @Override
    public long parseLong(String number, Locale locale) throws ParseException {
        for (Config c : getConfigs()) {
            AuraLocale loc = c.getAuraLocale();
            Locale l = loc.getNumberLocale();
            for (long n : LocalizationServiceTestData.LONGS) {
                String testValue = NumberFormat.getIntegerInstance(l).format(n);
                long expected = NumberFormat.getIntegerInstance(l).parse(testValue).longValue();
                long actual = service.parseLong(testValue, l);
                assertEquals(expected, actual);
            }

            // loop through all the hard coded test data expected to pass
            for (String n : LocalizationServiceTestData.PASS_LONG_STRINGS) {
                try {
                    // parse it through Aura Localization Service
                    service.parseLong(n, l);
                } catch (Exception e) {
                    assertTrue("# Exception thrown for valid {long} test data:" + n + " & locale:" + l.getDisplayName()
                            + "\n" + e.getMessage(), false);
                }
            }

            // loop through all the hard coded test data expected to fail
            for (String n : LocalizationServiceTestData.FAIL_LONG_STRINGS) {
                try {
                    // parse it through Aura Localization Service
                    service.parseLong(n, l);
                    assertTrue(
                            "# Exception not thrown for invalid {long} test data:" + n + " & locale: "
                                    + l.getDisplayName(), false);
                } catch (Exception e) {
                    assertTrue("# Incorrect exception type!", ((e instanceof ParseException)));
                }
            }
        }
        return 0;
    }

    @Override
    public float parseFloat(String number, Locale locale) throws ParseException {
        for (Config c : getConfigs()) {
            AuraLocale loc = c.getAuraLocale();
            Locale l = loc.getNumberLocale();
            for (long n : LocalizationServiceTestData.LONGS) {
                String testValue = NumberFormat.getNumberInstance(l).format(n);
                float expected = NumberFormat.getNumberInstance(l).parse(testValue).floatValue();
                float actual = service.parseFloat(testValue, l);
                assertEquals(expected, actual);
            }

            // loop through all the hard coded test data expected to pass
            for (String n : LocalizationServiceTestData.PASS_FLOAT_STRINGS) {
                try {
                    // parse it through Aura Localization Service
                    service.parseFloat(n, l);
                } catch (Exception e) {
                    assertTrue(
                            "# Exception thrown for valid {float} test data:" + n + " & locale:" + l.getDisplayName()
                                    + "\n" + e.getMessage(), false);
                }
            }

            // loop through all the hard coded test data expected to fail
            for (String n : LocalizationServiceTestData.FAIL_FLOAT_STRINGS) {
                try {
                    // parse it through Aura Localization Service
                    service.parseFloat(n, l);
                    assertTrue(
                            "# Exception not thrown for invalid {float} test data:" + n + " & locale: "
                                    + l.getDisplayName(), false);
                } catch (Exception e) {
                    assertTrue("# Incorrect exception type!", ((e instanceof ParseException)));
                }
            }
        }
        return 0;
    }

    @Override
    public double parseDouble(String number, Locale locale) throws ParseException {
        for (Config c : getConfigs()) {
            AuraLocale loc = c.getAuraLocale();
            Locale l = loc.getNumberLocale();
            for (double n : LocalizationServiceTestData.DOUBLES) {
                String testValue = NumberFormat.getNumberInstance(l).format(n);
                double expected = NumberFormat.getNumberInstance(l).parse(testValue).doubleValue();
                double actual = service.parseDouble(testValue, l);
                assertEquals(expected, actual);
            }

            // loop through all the hard coded test data expected to pass
            for (String n : LocalizationServiceTestData.PASS_DOUBLE_STRINGS) {
                try {
                    // parse it through Aura Localization Service
                    service.parseDouble(n, l);
                } catch (Exception e) {
                    assertTrue(
                            "# Exception thrown for valid {double} test data:" + n + " & locale:" + l.getDisplayName()
                                    + "\n" + e.getMessage(), false);
                }
            }

            // loop through all the hard coded test data expected to fail
            for (String n : LocalizationServiceTestData.FAIL_DOUBLE_STRINGS) {
                try {
                    // parse it through Aura Localization Service
                    service.parseDouble(n, l);
                    assertTrue(
                            "# Exception not thrown for invalid {double} test data:" + n + " & locale: "
                                    + l.getDisplayName(), false);
                } catch (Exception e) {
                    assertTrue("# Incorrect exception type!", ((e instanceof ParseException)));
                }
            }
        }
        return 0;
    }

    @Override
    public double parsePercent(String percent) throws ParseException {
        Locale originalDefault = Locale.getDefault();
        try {
            for (Config c : getConfigs()) {
                AuraLocale loc = c.getAuraLocale();
                Locale l = loc.getNumberLocale();
                Locale.setDefault(l);
                for (double n : LocalizationServiceTestData.PERCENTS) {
                    String testValue = NumberFormat.getPercentInstance().format(n);
                    double expected = NumberFormat.getPercentInstance().parse(testValue).doubleValue();
                    double actual = service.parsePercent(testValue);
                    assertEquals(expected, actual);
                }
            }
        } finally {
            Locale.setDefault(originalDefault);
        }
        return 0;
    }

    @Override
    public double parsePercent(String percent, Locale locale) throws ParseException {
        for (Config c : getConfigs()) {
            AuraLocale loc = c.getAuraLocale();
            Locale l = loc.getNumberLocale();
            for (double n : LocalizationServiceTestData.PERCENTS) {
                String testValue = NumberFormat.getPercentInstance(l).format(n);
                double expected = NumberFormat.getPercentInstance(l).parse(testValue).doubleValue();
                double actual = service.parsePercent(testValue, l);
                assertEquals(expected, actual);
            }

            // loop through all the hard coded test data expected to pass
            for (String n : LocalizationServiceTestData.PASS_PERCENT_STRINGS) {
                try {
                    // parse it through Aura Localization Service
                    service.parsePercent(n, l);
                } catch (Exception e) {
                    assertTrue(
                            "# Exception thrown for valid percent test data:" + n + " & locale:" + l.getDisplayName()
                                    + "\n" + e.getMessage(), false);
                }
            }
            // loop through all the hard coded test data expected to fail
            for (String n : LocalizationServiceTestData.FAIL_PERCENT_STRINGS) {
                try {
                    // parse it through Aura Localization Service
                    service.parsePercent(n, l);
                    assertTrue(
                            "# Exception not thrown for invalid percent test data:" + n + " & locale: "
                                    + l.getDisplayName(), false);
                } catch (Exception e) {
                    assertTrue("# Incorrect exception type!", ((e instanceof ParseException)));
                }
            }
        }
        return 0;
    }

    @Override
    public BigDecimal parseCurrency(String currency) throws ParseException {
        Locale originalDefault = Locale.getDefault();
        try {
            for (Config c : getConfigs()) {
                AuraLocale loc = c.getAuraLocale();
                Locale l = loc.getCurrencyLocale();
                Locale.setDefault(l);
                for (BigDecimal money : LocalizationServiceTestData.CURRENCY_BIGDECIMALS) {
                    DecimalFormat df = (DecimalFormat) NumberFormat.getCurrencyInstance();
                    df.setParseBigDecimal(true);
                    String testValue = df.format(money);
                    BigDecimal actual = (BigDecimal) df.parse(testValue);
                    BigDecimal expected = service.parseCurrency(testValue);
                    assertEquals(expected, actual);
                }
            }
        } finally {
            Locale.setDefault(originalDefault);
        }
        return null;
    }

    @Override
    public BigDecimal parseCurrency(String currency, Locale locale) throws ParseException {
        for (Config c : getConfigs()) {
            AuraLocale loc = c.getAuraLocale();
            Locale l = loc.getCurrencyLocale();
            for (BigDecimal money : LocalizationServiceTestData.CURRENCY_BIGDECIMALS) {
                DecimalFormat df = (DecimalFormat) NumberFormat.getCurrencyInstance(l);
                df.setParseBigDecimal(true);
                String testValue = df.format(money);
                BigDecimal actual = (BigDecimal) df.parse(testValue);
                BigDecimal expected = service.parseCurrency(testValue, l);
                assertEquals(expected, actual);
            }
        }
        return null;
    }

    @Override
    public String formatNumber(BigDecimal number) {
        Locale originalDefault = Locale.getDefault();
        try {
            for (Config c : getConfigs()) {
                AuraLocale loc = c.getAuraLocale();
                Locale l = loc.getNumberLocale();
                Locale.setDefault(l);
                DecimalFormat df = (DecimalFormat) NumberFormat.getNumberInstance();
                df.setParseBigDecimal(true);
                for (BigDecimal n : LocalizationServiceTestData.CURRENCY_BIGDECIMALS) {
                    String expected = df.format(n);
                    String actual = service.formatNumber(n);
                    assertEquals(expected, actual);
                }
            }
        } finally {
            Locale.setDefault(originalDefault);
        }
        return null;
    }

    @Override
    public String formatNumber(BigDecimal number, int minFractionDigits, int maxFractionDigits) {
        Locale originalDefault = Locale.getDefault();
        try {
            for (Config c : getConfigs()) {
                AuraLocale loc = c.getAuraLocale();
                Locale l = loc.getNumberLocale();
                Locale.setDefault(l);
                DecimalFormat df = (DecimalFormat) NumberFormat.getNumberInstance();
                df.setParseBigDecimal(true);
                for (BigDecimal n : LocalizationServiceTestData.CURRENCY_BIGDECIMALS) {
                    for (int min : LocalizationServiceTestData.FRACTION_DIGITS) {
                        for (int max : LocalizationServiceTestData.FRACTION_DIGITS) {
                            df.setMinimumFractionDigits(min);
                            df.setMaximumFractionDigits(max);
                            String expected = df.format(n);
                            String actual = service.formatNumber(n, min, max);
                            assertEquals(expected, actual);
                        }
                    }
                }
            }
        } finally {
            Locale.setDefault(originalDefault);
        }
        return null;
    }

    @Override
    public String formatNumber(BigDecimal number, Locale locale) {
        for (Config c : getConfigs()) {
            AuraLocale loc = c.getAuraLocale();
            Locale l = loc.getNumberLocale();
            DecimalFormat df = (DecimalFormat) NumberFormat.getNumberInstance(l);
            df.setParseBigDecimal(true);
            for (BigDecimal n : LocalizationServiceTestData.CURRENCY_BIGDECIMALS) {
                String expected = df.format(n);
                String actual = service.formatNumber(n, l);
                assertEquals(expected, actual);
            }
        }
        return null;
    }

    @Override
    public String formatNumber(BigDecimal number, Locale locale, int minFractionDigits, int maxFractionDigits) {
        for (Config c : getConfigs()) {
            AuraLocale loc = c.getAuraLocale();
            Locale l = loc.getNumberLocale();
            Locale.setDefault(l);
            DecimalFormat df = (DecimalFormat) NumberFormat.getNumberInstance(l);
            df.setParseBigDecimal(true);
            for (BigDecimal n : LocalizationServiceTestData.CURRENCY_BIGDECIMALS) {
                for (int min : LocalizationServiceTestData.FRACTION_DIGITS) {
                    for (int max : LocalizationServiceTestData.FRACTION_DIGITS) {
                        df.setMinimumFractionDigits(min);
                        df.setMaximumFractionDigits(max);
                        String expected = df.format(n);
                        String actual = service.formatNumber(n, l, min, max);
                        assertEquals(expected, actual);
                    }
                }
            }
        }
        return null;
    }

    @Override
    public BigDecimal parseBigDecimal(String number) throws ParseException {
        Locale originalDefault = Locale.getDefault();
        try {
            for (Config c : getConfigs()) {
                AuraLocale loc = c.getAuraLocale();
                Locale l = loc.getCurrencyLocale();
                Locale.setDefault(l);
                for (BigDecimal num : LocalizationServiceTestData.CURRENCY_BIGDECIMALS) {
                    DecimalFormat df = (DecimalFormat) NumberFormat.getInstance();
                    df.setParseBigDecimal(true);
                    String testValue = df.format(num);
                    BigDecimal expected = (BigDecimal) df.parse(testValue);
                    BigDecimal actual = service.parseBigDecimal(testValue);
                    assertEquals(expected, actual);
                }
            }
        } finally {
            Locale.setDefault(originalDefault);
        }
        return null;
    }

    @Override
    public BigDecimal parseBigDecimal(String number, Locale locale) throws ParseException {
        for (Config c : getConfigs()) {
            AuraLocale loc = c.getAuraLocale();
            Locale l = loc.getCurrencyLocale();
            Locale.setDefault(l);
            for (BigDecimal num : LocalizationServiceTestData.CURRENCY_BIGDECIMALS) {
                DecimalFormat df = (DecimalFormat) NumberFormat.getInstance();
                df.setParseBigDecimal(true);
                String testValue = df.format(num);
                BigDecimal expected = (BigDecimal) df.parse(testValue);
                BigDecimal actual = service.parseBigDecimal(testValue, l);
                assertEquals(expected, actual);
            }
        }
        return null;
    }

    @Override
    public String formatNumber(Number number) {
        // TODO - missing test
        return null;
    }

    @Override
    public String formatNumber(Number number, Locale locale) {
        // TODO - missing test
        return null;
    }

    @Override
    public String formatNumber(Number number, Locale locale, int minFractionDigits, int maxFractionDigits) {
        return null;
    }

}
