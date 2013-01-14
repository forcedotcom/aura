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
package org.auraframework.util.date;

import java.text.DateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Locale;
import java.util.TimeZone;

import org.auraframework.test.UnitTestCase;

/**
 * @since: 224
 */
public class DateServiceTest extends UnitTestCase {

    @SuppressWarnings("serial")
    private static class DebugDate extends Date {

        private final String debugInfo;

        DebugDate(long time, String debugInfo) {
            super(time);
            this.debugInfo = debugInfo;
        }

        /*
         * }
         */

        DebugDate(long time) {
            this(time, "Date(" + time + ")");
        }

        @Override
        public String toString() {
            return debugInfo;
        }
    }

    public StringBuilder sb = new StringBuilder();
    /**
     * Test Data
     */
    final Date[] DATE_TIME = { new DebugDate(1), // now
            new DebugDate(1000L), // 12:00:01 AM GMT
            new DebugDate(1333322872649L), // 4:27:52.649 PM PDT (GMT-7)
            new DebugDate(0) // 00:00:00.000 GMT
    };
    public static final int[] DATE_TIME_STYLES = { DateFormat.SHORT, DateFormat.MEDIUM, DateFormat.LONG,
            DateFormat.FULL, -1 };
    public static final String[] SIMPLE_DATE_FORMAT_PATTERNS = { "yyyy.MM.dd G 'at' HH:mm:ss z", "EEE, MMM d, ''yy",
            "h:mm a", "hh 'o''clock' a, zzzz", "K:mm a, z", "yyyyy.MMMMM.dd GGG hh:mm aaa",
            "EEE, d MMM yyyy HH:mm:ss Z", "yyMMddHHmmssZ", "yyyy-MM-dd'T'HH:mm:ss.SSSZ" };

    public List<LocaleConfig> getConfigs() {
        List<LocaleConfig> configs = new ArrayList<LocaleConfig>();
        configs.add(new LocaleConfig(Locale.TRADITIONAL_CHINESE, TimeZone.getTimeZone("GMT+8")));
        configs.add(new LocaleConfig(Locale.US, TimeZone.getTimeZone("EST")));
        configs.add(new LocaleConfig(new Locale("en", "US"), TimeZone.getTimeZone("PDT")));

        return configs;
    }

    public static class LocaleConfig {

        private Locale locale = null;
        private TimeZone timeZone = null;

        public LocaleConfig(Locale locale) {
            setLocale(locale);
            setTimeZone(TimeZone.getDefault());
        }

        public LocaleConfig(Locale locale, TimeZone timeZone) {
            setLocale(locale);
            setTimeZone(timeZone);
        }

        public Locale getLocale() {
            return this.locale;
        }

        public void setLocale(Locale locale) {
            this.locale = locale;
        }

        public TimeZone getTimeZone() {
            return this.timeZone;
        }

        public void setTimeZone(TimeZone timeZone) {
            this.timeZone = timeZone;
        }

    }

    /**
     * NOTE: api's converter.format(date) and converter.parse(date) will rely on
     * the TimeZone.getDefault() value to do their job. Thus, tests for these
     * will return different results based on default TimeZone that is set.
     */

    /**
     * Tests for different converters including parsing and formatting
     */

    public void testGetDateTimeISO8601Converter() throws Exception {
        DateConverter converter = null;
        converter = DateServiceImpl.get().getDateTimeISO8601Converter();
        for (LocaleConfig c : getConfigs()) {
            TimeZone tz = c.getTimeZone();
            for (Date d : DATE_TIME) {
                // formatting
                String formattedDate = converter.format(d, tz);
                // parsing
                Date parsedDate = converter.parse(formattedDate, tz);
                String text = "Input date:" + d.toString() + "\t\tFormatted date:" + formattedDate + "\t\tParsed date:"
                        + parsedDate.getTime() + "\t\tTimezone:" + tz.getID() + "\n";
                sb.append(text);
            }
        }

        goldFileText("Test:testGetDateTimeISO8601Converter\n" + sb.toString());
    }

    public void testGetDateISO8601Converter() throws Exception {
        DateConverter converter = null;
        converter = DateServiceImpl.get().getDateISO8601Converter();

        for (LocaleConfig c : getConfigs()) {
            TimeZone tz = c.getTimeZone();
            for (Date d : DATE_TIME) {
                // formatting
                String formattedDate = converter.format(d, tz);
                // parsing
                Date parsedDate = converter.parse(formattedDate, tz);
                String text = "Input date:" + d.toString() + "\t\tFormatted date:" + formattedDate + "\t\tParsed date:"
                        + parsedDate.getTime() + "\t\tTimezone:" + tz.getID() + "\n";
                sb.append(text);
            }
        }

        goldFileText("Test:testGetDateISO8601Converter\n" + sb.toString());

    }

    public void testGetGenericISO8601Converter() throws Exception {
        String text = null;
        DateConverter converter = DateServiceImpl.get().getGenericISO8601Converter();
        ;

        // date time
        for (LocaleConfig c : getConfigs()) {
            TimeZone tz = c.getTimeZone();
            for (Date d : DATE_TIME) {
                // formatting
                String formattedDate = converter.format(d, tz);
                // parsing
                Date parsedDate = converter.parse(formattedDate, tz);
                text = "Input date:" + d.toString() + "\t\tFormatted date:" + formattedDate + "\t\tParsed date:"
                        + parsedDate.getTime() + "\t\tTimezone:" + tz.getID() + "\n";
                sb.append(text);
            }
        }

        // datetime no seconds
        String DATETIME_NOSECONDS[] = { "2012-06-05T13:12Z" };
        for (LocaleConfig c : getConfigs()) {
            TimeZone tz = c.getTimeZone();
            for (String d : DATETIME_NOSECONDS) {
                try {
                    // parsing
                    Date parsedDate = converter.parse(d, tz);
                    // formatting
                    String formattedDate = converter.format(parsedDate, tz);
                    text = "Input date:" + d.toString() + "\t\tFormatted date:" + formattedDate + "\t\tParsed date:"
                            + parsedDate.getTime() + "\n";
                    sb.append(text);
                } catch (IllegalArgumentException e) {
                    sb.append(e.getMessage() + "\n");
                }
            }
        }

        goldFileText("Test:testGetGenericISO8601Converter\n" + sb.toString());
    }

    public void testGetDateStyleConverter_locale_dateStyle() throws Exception {
        DateConverter converter = null;
        String text = null;

        for (LocaleConfig c : getConfigs()) {
            Locale l = c.getLocale();
            TimeZone tz = c.getTimeZone();
            for (Date d : DATE_TIME) {
                for (int ds : DATE_TIME_STYLES) {
                    if (ds > -1) {
                        converter = DateServiceImpl.get().getDateStyleConverter(l, ds);
                        // formatting
                        String formattedDate = converter.format(d, tz);
                        // parsing
                        try {
                            Date parsedDate = converter.parse(formattedDate, tz);
                            text = "Input date:" + d.toString() + "\t\tFormatted date:" + formattedDate
                                    + "\t\tParsed date:" + parsedDate.getTime() + "\t\tLocale:" + l.getDisplayName()
                                    + "\t\tTimeZone: " + tz.getID() + "\t\tDate style: " + ds + "\n";
                            sb.append(text);
                        } catch (IllegalArgumentException e) {
                            sb.append(e.getMessage() + "\n");
                        }
                    }
                }
            }
        }

        goldFileText("Test:testGetDateStyleConverter_locale_dateStyle\n" + sb.toString());

    }

    public void testGetTimeStyleConverter_locale_timeStyle() throws Exception {
        DateConverter converter = null;
        String text = null;

        for (LocaleConfig c : getConfigs()) {
            Locale l = c.getLocale();
            TimeZone tz = c.getTimeZone();
            for (Date d : DATE_TIME) {
                for (int ts : DATE_TIME_STYLES) {
                    if (ts > -1) {
                        converter = DateServiceImpl.get().getTimeStyleConverter(l, ts);
                        // formatting
                        String formattedDate = converter.format(d, tz);
                        // parsing
                        try {
                            Date parsedDate = converter.parse(formattedDate, tz);
                            text = "Input date:" + d.toString() + "\t\tFormatted date:" + formattedDate
                                    + "\t\tParsed date:" + parsedDate.getTime() + "\t\tLocale:" + l.getDisplayName()
                                    + "\t\tTimeZone: " + tz.getID() + "\t\tTime style: " + ts + "\n";
                            sb.append(text);
                        } catch (IllegalArgumentException e) {
                            sb.append(e.getMessage() + "\n");
                        }
                    }
                }
            }
        }

        goldFileText("Test:testGetTimeStyleConverter_locale_timeStyle\n" + sb.toString());

    }

    public void testGetDateTimeStyleConverter_locale_dateStyle_timeStyle() throws Exception {
        DateConverter converter = null;
        String text = null;

        for (LocaleConfig c : getConfigs()) {
            Locale l = c.getLocale();
            TimeZone tz = c.getTimeZone();
            for (Date d : DATE_TIME) {
                for (int ds : DATE_TIME_STYLES) {
                    for (int ts : DATE_TIME_STYLES) {
                        if ((ds + ts) > 0) {
                            converter = DateServiceImpl.get().getDateTimeStyleConverter(l, ds, ts);
                            // formatting
                            String formattedDate = converter.format(d, tz);
                            // parsing
                            try {
                                Date parsedDate = converter.parse(formattedDate, tz);
                                text = "Input date:" + d.toString() + "\t\tFormatted date:" + formattedDate
                                        + "\t\tParsed date:" + parsedDate.getTime() + "\t\tLocale:"
                                        + l.getDisplayName() + "\t\tTimeZone: " + tz.getID() + "\t\tDate style: " + ds
                                        + "\t\tTime style: " + ts + "\n";
                                sb.append(text);
                            } catch (IllegalArgumentException e) {
                                sb.append(e.getMessage() + "\n");
                            }
                        }
                    }
                }
            }
        }

        goldFileText("Test:testGetDateTimeStyleConverter_locale_dateStyle_timeStyle\n" + sb.toString());

    }

    public void testGetPatternConverter_locale_pattern() throws Exception {
        DateConverter converter = null;
        String text = null;

        // format/parse(date, timezone)
        // SimpleDateFormat style
        for (LocaleConfig c : getConfigs()) {
            Locale l = c.getLocale();
            TimeZone tz = c.getTimeZone();
            for (Date d : DATE_TIME) {
                for (String pattern : SIMPLE_DATE_FORMAT_PATTERNS) {
                    converter = DateServiceImpl.get().getPatternConverter(l, pattern);
                    // formatting
                    String formattedDate = converter.format(d, tz);
                    // parsing
                    try {
                        Date parsedDate = converter.parse(formattedDate, tz);
                        text = "Input date:" + d.toString() + "\t\tFormatted date:" + formattedDate
                                + "\t\tParsed date:" + parsedDate.getTime() + "\t\tLocale:" + l.getDisplayName()
                                + "\t\tTimeZone:" + tz.getID() + "\t\tSimpleDateFormat pattern:" + pattern + "\n";
                        sb.append(text);
                    } catch (IllegalArgumentException e) {
                        sb.append(e.getMessage() + "\n");
                    }
                }

            }
        }

        goldFileText("Test:testGetPatternConverter_locale_pattern\n" + sb.toString());
    }

    public void testGetStyle() {
        String[] styles = { "full", "long", "medium", "short" };
        int i = -1;
        for (String s : styles) {
            i++;
            int dateFormatStyleInteger = DateServiceImpl.get().getStyle(s);
            assertEquals("# date format style integer does not match for style " + s, dateFormatStyleInteger, i);
        }
    }

    public void testDateTimeNoneConverter() {
        try {
            DateServiceImpl.get().getDateTimeStyleConverter(Locale.US, -1, -1);
        } catch (IllegalArgumentException e) {
            assertEquals("# Incorrect exception message for api getDateTimeStyleConverter(Locale.US, -1, -1)",
                    "Style '--' is invalid", e.getMessage());
        }

        try {
            DateServiceImpl.get().getDateStyleConverter(Locale.US, -1);
        } catch (IllegalArgumentException e) {
            assertEquals("# Incorrect exception message for api getDateStyleConverter(Locale.US, -1)",
                    "Style '--' is invalid", e.getMessage());
        }

        try {
            DateServiceImpl.get().getTimeStyleConverter(Locale.US, -1);
        } catch (IllegalArgumentException e) {
            assertEquals("# Incorrect exception message for api getTimeStyleConverter(Locale.US, -1)",
                    "Style '--' is invalid", e.getMessage());
        }
    }

    public void testNullDataForConverters() {
        try {
            DateServiceImpl.get().getDateTimeStyleConverter(null, -0, -0);
        } catch (IllegalArgumentException e) {
            assertEquals("# Incorrect exception message for api getDateTimeStyleConverter(null, -0, -0)",
                    "Both dateStyle and timeStyle are invalid", e.getMessage());
        }
        try {
            DateServiceImpl.get().getDateStyleConverter(null, -0);
        } catch (IllegalArgumentException e) {
            assertEquals("# Incorrect exception message for api getDateStyleConverter(null, -0)",
                    "Style '--' is invalid", e.getMessage());
        }
        try {
            DateServiceImpl.get().getTimeStyleConverter(null, -0);
        } catch (IllegalArgumentException e) {
            assertEquals("# Incorrect exception message for api getTimeStyleConverter(null, -0)",
                    "Style '--' is invalid", e.getMessage());
        }
        try {
            DateServiceImpl.get().getPatternConverter(null, null);
        } catch (IllegalArgumentException e) {
            assertEquals("# Incorrect exception message for api getPatternConverter(null, null)",
                    "Invalid pattern specification", e.getMessage());
        }
        try {
            DateServiceImpl.get().getStyle(null);
        } catch (IllegalArgumentException e) {
            assertEquals("# Incorrect exception message for api getStyle(null)", "Style is null", e.getMessage());
        }
    }

    public void testNullDataForFormatAndParse() {
        try {
            DateServiceImpl.get().getDateTimeISO8601Converter().format(null);
        } catch (IllegalArgumentException e) {
            assertEquals("# Incorrect exception message for api getDateTimeISO8601Converter().format(null)",
                    "Date can not be null", e.getMessage());
        }
        try {
            DateServiceImpl.get().getDateTimeISO8601Converter().format(null, null);
        } catch (IllegalArgumentException e) {
            assertEquals("# Incorrect exception message for api getDateTimeISO8601Converter().format(null, null)",
                    "Date can not be null", e.getMessage());
        }
        try {
            DateServiceImpl.get().getDateTimeISO8601Converter().parse(null);
        } catch (IllegalArgumentException e) {
            assertEquals("# Incorrect exception message for api getDateTimeISO8601Converter().parse(null)",
                    "Date can not be null", e.getMessage());
        }
        try {
            DateServiceImpl.get().getDateTimeISO8601Converter().parse(null, null);
        } catch (IllegalArgumentException e) {
            assertEquals("# Incorrect exception message for api getDateTimeISO8601Converter().parse(null, null)",
                    "Date can not be null", e.getMessage());
        }
    }

    public void testFormatWithTimeZone() {
        // this is equivalent to 1970-01-01 5pm EST
        long offsetEST = 5 * 60 * 60 * 1000;
        Date testDate = new Date(offsetEST);
        DateConverter converter = DateServiceImpl.get().getDateISO8601Converter();

        // gmt-8 here is the equivalent of using the default JDK timezone
        // hardcoded so the test works wherever it is run
        String result = converter.format(testDate, TimeZone.getTimeZone("GMT-8"));
        // 1970-01-01 midnight EST is 1969-12-31 9pm PST
        assertEquals("1969-12-31", result);

        // 1970-01-01 midnight EST should match EST, right?
        result = converter.format(testDate, TimeZone.getTimeZone("GMT-5"));
        assertEquals("1970-01-01", result);

        // switch to datetime converter
        converter = DateServiceImpl.get().getDateTimeISO8601Converter();

        // gmt-8 here is the equivalent of using the default JDK timezone
        // hardcoded so the test works wherever it is run
        result = converter.format(testDate, TimeZone.getTimeZone("GMT-8"));
        // 9PM PST = midnight EST, right? note the 21:00 and -08:00
        assertEquals("1969-12-31T21:00:00.000-08:00", result);
        // and a quick reverse check to verify
        assertEquals(offsetEST, converter.parse(result).getTime());

        // 1970-01-01 midnight EST should match EST
        result = converter.format(testDate, TimeZone.getTimeZone("GMT-5"));
        assertEquals("1970-01-01T00:00:00.000-05:00", result);
    }

    public void testParseWithTimeZone() {
        // if someone types in 1970-01-01, and they're in GMT - that's date=0L
        String testDate = "1970-01-01";
        long offsetEST = 5 * 60 * 60 * 1000;
        long offsetGMT8 = -(8 * 60 * 60 * 1000);

        DateConverter converter = DateServiceImpl.get().getDateISO8601Converter();

        // 1970-01-01, and they're in EST, that's 5 hours behind.
        // but when they hit 1970-01-01, they're 5 hours later than when GMT
        // folks hit it
        // date=0 PLUS (5x60x60x1000)
        Date resultDate = converter.parse(testDate, TimeZone.getTimeZone("EST"));
        assertEquals(offsetEST, resultDate.getTime());

        // 1970-01-01, and they're in China, that's 8 hours ahead of GMT.
        // but when they hit 1970-01-01, they're 8 hours earlier than when GMT
        // folks hit it
        // date=0 MINUS (8x60x60x1000)
        resultDate = converter.parse(testDate, TimeZone.getTimeZone("GMT+8"));
        assertEquals(offsetGMT8, resultDate.getTime());

        // If parse, without timezone is called, the JDK's default timezone
        // should be used.
        resultDate = converter.parse(testDate);
        assertEquals(-TimeZone.getDefault().getRawOffset(), resultDate.getTime());

        // switch to dateTime converter
        converter = DateServiceImpl.get().getDateTimeISO8601Converter();

        // timezone is in this date - EST again - so we should get the same as
        // above
        testDate = "1970-01-01T00:00:00.000-05:00";
        resultDate = converter.parse(testDate);
        assertEquals(offsetEST, resultDate.getTime());

        // specifying a timezone shouldn't change a thing
        resultDate = converter.parse(testDate, TimeZone.getTimeZone("GMT+8"));
        assertEquals(offsetEST, resultDate.getTime());
    }

}
