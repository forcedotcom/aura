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
package org.auraframework.util.date;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.ZoneOffset;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.time.format.FormatStyle;
import java.time.temporal.TemporalAccessor;
import java.time.temporal.TemporalQueries;
import java.util.Date;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.TimeZone;

import com.google.common.collect.ImmutableList;
import com.google.common.collect.ImmutableMap;

public class DateServiceImpl implements DateService {

    private static DateService INSTANCE = new DateServiceImpl();

    public static DateService get() {
        return INSTANCE;

    }

    /**
     * DATETIME: yyyy-MM-dd'T'HH:mm:ss.SSSZZ
     */
    @Override
    public DateConverter getDateTimeISO8601Converter() {
        return ISO_8601_DATETIME;
    }

    /**
     * DATE: yyyy-MM-dd
     */
    @Override
    public DateConverter getDateISO8601Converter() {
        return ISO_8601_DATE;
    }

    /**
     * For parsing, tries the following patterns, in order:
     * yyyy-MM-dd'T'HH:mm:ss.SSSZZ yyyy-MM-dd'T'HH:mmZ yyyy-MM-dd
     */
    @Override
    public DateConverter getGenericISO8601Converter() {
        return ISO_8601_ANY;
    }

    /**
     * Returns converter based on locale, date style, and time style
     *
     * <p/>
     * * @see <a
     * href="http://joda-time.sourceforge.net/apidocs/org/joda/time/format/DateTimeFormat.html#patternForStyle(java.lang.String, java.util.Locale)">DateTimeFormat</a>
     * <p/>
     * Style and results:
     * <p/>
     * <p/>
     * <pre>
     * SS   6/1/12 10:37 PM
     * SM   6/1/12 10:37:14 PM
     * SL   6/1/12 10:37:14 PM UTC
     * SF   6/1/12 10:37:14 PM UTC
     * S-   6/1/12
     * MS   Jun 1, 2012 10:37 PM
     * MM   Jun 1, 2012 10:37:14 PM
     * ML   Jun 1, 2012 10:37:14 PM UTC
     * MF   Jun 1, 2012 10:37:14 PM UTC
     * M-   Jun 1, 2012
     * LS   June 1, 2012 10:37 PM
     * LM   June 1, 2012 10:37:14 PM
     * LL   June 1, 2012 10:37:14 PM UTC
     * LF   June 1, 2012 10:37:14 PM UTC
     * L-   June 1, 2012
     * FS   Friday, June 1, 2012 10:37 PM
     * FM   Friday, June 1, 2012 10:37:14 PM
     * FL   Friday, June 1, 2012 10:37:14 PM UTC
     * FF   Friday, June 1, 2012 10:37:14 PM UTC
     * F-   Friday, June 1, 2012
     * -S   10:37 PM
     * -M   10:37:14 PM
     * -L   10:37:14 PM UTC
     * -F   10:37:14 PM UTC
     * </pre>
     */
    @Override
    public DateConverter getDateTimeStyleConverter(Locale locale, int dateStyle, int timeStyle) {

        if (locale == null) {
            throw new IllegalArgumentException("Locale must be provided");
        }

        StyleType date = intToStyleTypeMap.get(dateStyle);
        StyleType time = intToStyleTypeMap.get(timeStyle);

        if (date == null) {
            throw new IllegalArgumentException("Date style is invalid");
        }

        if (time == null) {
            throw new IllegalArgumentException("Time style is invalid");
        }

        FormatStyle dateFormat = date.getFormatStyle();
        FormatStyle timeFormat = time.getFormatStyle();

        DateTimeFormatter formatter;

        if (dateFormat == null && timeFormat == null) {
            throw new IllegalArgumentException("Both date style and time style cannot be none");
        } else if (dateFormat == null) {
            formatter = DateTimeFormatter.ofLocalizedTime(timeFormat);
        } else if (timeFormat == null) {
            formatter = DateTimeFormatter.ofLocalizedDate(dateFormat);
        } else {
            formatter = DateTimeFormatter.ofLocalizedDateTime(dateFormat, timeFormat);
        }

        return new JodaConverter(formatter.withLocale(locale));
    }

    /**
     * Calls getDateTimeStyleConverter, with DateService.NONE for timeStyle.
     */
    @Override
    public DateConverter getDateStyleConverter(Locale locale, int dateStyle) {
        return getDateTimeStyleConverter(locale, dateStyle, DateService.NONE);
    }

    /**
     * Calls getDateTimeStyleConverter, with DateService.NONE for dateStyle.
     */
    @Override
    public DateConverter getTimeStyleConverter(Locale locale, int timeStyle) {
        return getDateTimeStyleConverter(locale, DateService.NONE, timeStyle);
    }

    /**
     * SimpleDateFormat pattern - e.g. yyyy/MM/dd
     */
    @Override
    public DateConverter getPatternConverter(Locale locale, String pattern) {
        if (locale == null) {
            throw new IllegalArgumentException("Locale must be provided");
        }
        if (pattern == null) {
            throw new IllegalArgumentException("Pattern must be provided");
        }
        return new JodaConverter(DateTimeFormatter.ofPattern(pattern, locale));
    }

    @Override
    public int getStyle(String style) {
        if (style == null) {
            throw new IllegalArgumentException("Style is null");
        }
        style = style.trim().toLowerCase();
        StyleType st = nameToStyleTypeMap.get(style);
        if (st == null) {
            throw new IllegalArgumentException("Unknown style name '" + style + "'");
        } else {
            return st.getIntStyle();
        }
    }

    private enum StyleType {

        SHORT(DateService.SHORT, FormatStyle.SHORT, "short", "S"),
        MEDIUM(DateService.MEDIUM, FormatStyle.MEDIUM, "medium", "M"),
        LONG(DateService.LONG, FormatStyle.LONG, "long", "L"),
        FULL(DateService.FULL, FormatStyle.FULL, "full", "F"),
        NONE(DateService.NONE, null, "none", "-");

        int dateFormat;
        String nameStyle;
        String jodaNameStyle;
        FormatStyle formatStyle;

        StyleType(int intStyle, FormatStyle formatStyle, String nameStyle, String jodaNameStyle) {
            this.dateFormat = intStyle;
            this.nameStyle = nameStyle;
            this.jodaNameStyle = jodaNameStyle;
            this.formatStyle = formatStyle;
        }

        String getNameStyle() {
            return this.nameStyle;
        }

        int getIntStyle() {
            return this.dateFormat;
        }

        String getJodaNameStyle() {
            return this.jodaNameStyle;
        }

        FormatStyle getFormatStyle() {
            return this.formatStyle;
        }
    }

    private static Map<Integer, StyleType> intToStyleTypeMap = new ImmutableMap.Builder<Integer, StyleType>()
            .put(StyleType.SHORT.getIntStyle(), StyleType.SHORT)
            .put(StyleType.MEDIUM.getIntStyle(), StyleType.MEDIUM)
            .put(StyleType.LONG.getIntStyle(), StyleType.LONG)
            .put(StyleType.FULL.getIntStyle(), StyleType.FULL)
            .put(StyleType.NONE.getIntStyle(), StyleType.NONE)
            .build();

    private static Map<String, StyleType> nameToStyleTypeMap = new ImmutableMap.Builder<String, StyleType>()
            .put(StyleType.SHORT.getNameStyle(), StyleType.SHORT)
            .put(StyleType.MEDIUM.getNameStyle(), StyleType.MEDIUM)
            .put(StyleType.LONG.getNameStyle(), StyleType.LONG)
            .put(StyleType.FULL.getNameStyle(), StyleType.FULL)
            .put(StyleType.NONE.getNameStyle(), StyleType.NONE)
            .build();

    /**
     * Format: yyyy-MM-dd'T'HH:mm:ss.SSSXXX
     */
    private static DateConverter ISO_8601_DATETIME = new ISO8601DateTimeConverter(
            DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss.SSSXXX")
    );

    /**
     * Format: yyyy-MM-dd
     */
    private static DateConverter ISO_8601_DATE = new ISO8601DateTimeConverter(
            DateTimeFormatter.ISO_LOCAL_DATE
    );

    /**
     * Format: yyyy-MM-dd'T'HH:mm'Z'
     */
    private static DateConverter ISO_8601_DATETIME_NO_SECONDS = new ISO8601DateTimeConverter(
            DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm'Z'")
    );

    /**
     * Format: yyyy-MM-dd'T'HH:mm:ss'Z'
     */
    private static DateConverter ISO_8601_DATETIME_SECONDS = new ISO8601DateTimeConverter(
            DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss'Z'")
    );

    /**
     * Tries a number of ISO formats when converting a Date to a String. String
     * to Date conversions use ISO_8601_DATETIME
     */
    private static DateConverter ISO_8601_ANY = new DateConverter() {

        private final List<DateConverter> isoConversions = ImmutableList.of(
                ISO_8601_DATETIME,
                ISO_8601_DATETIME_NO_SECONDS,
                ISO_8601_DATETIME_SECONDS,
                ISO_8601_DATE);

        /**
         * Uses ISO_8601_DATETIME.
         */
        @Override
        public String format(Date date) {
            return ISO_8601_DATETIME.format(date);
        }

        /**
         * Uses ISO_860AuraDateUtil1_DATETIME.
         */
        @Override
        public String format(Date date, TimeZone timeZone) {
            return ISO_8601_DATETIME.format(date, timeZone);
        }

        /**
         * Tries, in order: ISO_8601_DATETIME, ISO_8601_DATETIME_NO_SECONDS,
         * ISO_8601_DATE If none parse, null is returned.
         */
        @Override
        public Date parse(String date, TimeZone timeZone) {
            for (DateConverter format : isoConversions) {
                try {
                    return format.parse(date, timeZone);
                } catch (DateTimeParseException | IllegalArgumentException e) {
                    // try the next one
                }
            }
            return null;
        }

        /**
         * Tries, in order: ISO_8601_DATETIME, ISO_8601_DATETIME_NO_SECONDS,
         * ISO_8601_DATE If none parse, null is returned.
         */
        @Override
        public Date parse(String date) {
            for (DateConverter format : isoConversions) {
                try {
                    return format.parse(date);
                } catch (IllegalArgumentException e) {
                    // try the next one
                }
            }
            return null;
        }
    };

    private static class JodaConverter implements DateConverter {

        protected final DateTimeFormatter formatter;

        protected JodaConverter(DateTimeFormatter formatter) {
            this.formatter = formatter;
        }

        @Override
        public String format(Date date) {
            return format(date, TimeZone.getDefault());
        }

        @Override
        public String format(Date date, TimeZone timeZone) {
            if (date == null) {
                throw new IllegalArgumentException("Date can not be null");
            }
            if (timeZone == null) {
                throw new IllegalArgumentException("TimeZone can not be null");
            }

            return formatter.withZone(timeZone.toZoneId()).format(date.toInstant());
        }

        @Override
        public Date parse(String date) {
            return parse(date, TimeZone.getDefault());
        }

        @Override
        public Date parse(String date, TimeZone timeZone) {
            if (date == null) {
                throw new IllegalArgumentException("Date can not be null");
            }
            if (timeZone == null) {
                throw new IllegalArgumentException("TimeZone can not be null");
            }

            TemporalAccessor temporalAccessor = formatter.parse(date);

            LocalDate qld = temporalAccessor.query(TemporalQueries.localDate());
            LocalTime qlt = temporalAccessor.query(TemporalQueries.localTime());
            ZoneOffset qzo = temporalAccessor.query(TemporalQueries.offset());

            Instant instant;

            if (qlt == null && qld == null) {
                throw new IllegalArgumentException("Could not parse");
            } else if (qlt == null) {
                LocalDate ld = LocalDate.from(temporalAccessor);
                instant = ld.atStartOfDay(timeZone.toZoneId()).toInstant();
            } else if (qld == null) {
                LocalTime lt = LocalTime.from(temporalAccessor);
                instant = LocalDate.ofEpochDay(0).atTime(lt).atZone(timeZone.toZoneId()).toInstant();
            } else {
                if (qzo != null) {
                    instant = ZonedDateTime.from(temporalAccessor).toInstant();
                } else {
                    instant = LocalDateTime.from(temporalAccessor).atZone(timeZone.toZoneId()).toInstant();
                }
            }

            return Date.from(instant);
        }

    }

    /**
     * Allows ISO8601 converters to default to GMT instead of the JDK's
     * timezone. Makes things more predictable - especially for testing.
     */
    private static class ISO8601DateTimeConverter extends JodaConverter {

        private static TimeZone ISO8601_DEFAULT_TIMEZONE = TimeZone.getTimeZone("GMT");

        protected ISO8601DateTimeConverter(DateTimeFormatter formatter) {
            super(formatter);
        }

        @Override
        public String format(Date date) {
            return format(date, ISO8601_DEFAULT_TIMEZONE);
        }

        @Override
        public Date parse(String date) {
            return parse(date, ISO8601_DEFAULT_TIMEZONE);
        }

    }
}
