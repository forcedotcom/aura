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
package org.auraframework.service.testdata;

import java.math.BigDecimal;
import java.text.DateFormat;
import java.util.Date;
import java.util.TimeZone;

/**
 * Unit tests for the Localization Service.
 * Test exceptions thrown when supplied miscellaneous data
 */
public final class LocalizationServiceTestData {

    public static final TimeZone[] TIMEZONES = {
        TimeZone.getTimeZone("EST"),    //Australia, Central America, Caribbean, North America
        TimeZone.getTimeZone("JST"),    //Japan
        TimeZone.getTimeZone("GMT"),    //Africa, Europe
        TimeZone.getTimeZone("PST"),    //North America, Pacific
        TimeZone.getTimeZone("PDT"),    //North America
        TimeZone.getTimeZone("KST"),    //Korea
        TimeZone.getTimeZone("AST"),    //Asia, Atlantic, Caribbean, North America
        TimeZone.getTimeZone("MST"),    //North America
        TimeZone.getTimeZone("CST"),    //Asia, Australia, Central America, Caribbean, North America
        TimeZone.getTimeZone("UTC")     //UTC or UTC/GMT at Greenwich, England
    };

    public static final int[] FRACTION_DIGITS = {0, 1, 2, 3, 4, 5, 6, 7};

    /**
     * Test data for Dates
     */
    public static final int[] DATE_FORMATS = {DateFormat.DEFAULT, DateFormat.SHORT, DateFormat.MEDIUM, DateFormat.LONG, DateFormat.FULL};
    public static final Date[] DATES = {
        new Date(),               // now
        new Date(1000L),          // early in 1970
        new Date(1333322872649L), // April 1, 2012
        new Date(0),              // January 1, 1970 00:00:00.000 GMT
        new Date(946684800000L),  // January 1, 2000 00:00:00.000 GMT (Y2K)
        new Date(946684801000L),  // January 1, 2000 00:00:01.000 GMT
        new Date(1330502400000L), // February 29, 2012 (Leap year)
        new Date(1331456400000L)  // March 11, 2012 02:00:00.000 PST (Daylight savings)
    };

    /**
     * Test data for Date
     */
    public static final String[] PASS_DATE_STRINGS= {
        "February 29, 2008",   // leap year
        "January 1, 2000",     // Y2K
        "December 31, 1999"    // Day before Y2K
    };
    public static final String[] FAIL_DATE_STRINGS_MEDIUM_FORMAT = {
        new String(""),
        "null",
        "",
        "''",
        "Jonuary 4, 2012",     // bad spelling for month
        "Janua 4, 2012",       // incomplete spelling of month
        "January 32, 2012",    // days cannot exceed max for that month
        "February 30, 2012",   // leap year but day still exceeds max
        "February 29, 2013",   // non leap year
        "Wednesday, January 4, 2012" // DateFormat.LONG instead of MEDIUM
    };
    public static final String[] FAIL_DATE_STRINGS_SHORT_FORMAT = {
        new String(""),
        "null",
        "",
        "''",
        "January 4, 2012", // DateFormat.MEDIUM instead of DateFormat.SHORT
        "2012/01/40",
        "2012/01/1x",      // bad format yyyy/mm/dd
        "0000-00-00",
    };

    /**
     * Test data for Date-Time
     */
    public static final Date[] DATE_TIMES = {
        new Date(),              // now
        new Date(1000L),         // 12:00:01 AM GMT early in 1970
        new Date(1333322872649L) // April 1, 2012  4:27:52.649 PM PDT (GMT-7)
    };
    public static final String[] PASS_DATE_TIME_STRINGS = {
        "May 1, 2012 90:00:00 PM",
        "APRIL 001, 1970 01:01:20 PM",  //Upper case month
        "Feb 29, 2012 00:00:00 AM",
    };
    public static final String[] FAIL_DATE_TIME_STRINGS = {
        "JANU 01, 2012 12:12:12 PM",
        "NOV 01, 2012, -10:10:00 AM",
        "fEB 29, 2011 00-00-00 AM"
    };

    /**
     * Test data for Time
     */
    public static final Date[] TIMES = {
        new Date(),               // now
        new Date(1000L),          // 12:00:01 AM GMT
        new Date(1333322872649L), // 4:27:52.649 PM PDT (GMT-7)
        new Date(0)               // 00:00:00.000 GMT
    };
    public static final String[] PASS_TIME_STRINGS = {
        "10:27:52 PM GMT",
        "00:00:00 AM",
        "24:60:60 PM",
    };
    public static final String[] FAIL_TIME_STRINGS = {
        "00:00:0x PM",                   //bad format
        "-23:23:23 PST",                 //-hh-mm-ss
        "0",                             //zero
        "Jan 10, 2010 00:00:00.000 GMT", //complete date-time
        "string time",
        "2500年2月28日",
        "雨が降りそう"
    };

    /**
     * Test data for Int
     */
    public static final int[] INTS = {0, -5, 10, 12345, -12345};
    public static final String[] PASS_INT_STRINGS = {
        "1.11f"     //float value
    };
    public static final String[] FAIL_INT_STRINGS = {
        "#FFAA33",  //# value
        "a",        //alphabet
        "'",
        "\0"
    };

    /**
     * Test data for Long
     */
    public static final long[] LONGS = {0L, -5L, 10L, 1234567L, -1234567L};
    public static final String[] PASS_LONG_STRINGS = {
        "11l",      //long value
        "123f",     //float value
        "10d"       //double value
    };
    public static final String[] FAIL_LONG_STRINGS = {
        "L"         //alphabet
    };

    /**
     * Test data for Float
     */
    public static final float[] FLOATS = {0.0f, -5.10f, 10.99f, 1234567.0f, -12345.67f};
    public static final String[] PASS_FLOAT_STRINGS = {
        "0x9Af",    //hex value
        "4f",       //float
        "2.2%"      //percentage value
    };
    public static final String[] FAIL_FLOAT_STRINGS = {
        "F"         //alphabet
    };

    /**
     * Test data for Double
     */
    public static final double[] DOUBLES = {0.0d, -5.10d, 10.99d, 1234567.89d, -12345.6789d};
    public static final String[] PASS_DOUBLE_STRINGS = {
        "1/3",                      //fraction
        "0x 3ff0 0000 0000 0001",   //double-precision, the next higher number > 1
        "0x0DD",                    //hex value
        "12.12f",                   //float value
        "3.14+e"                    //irrational
    };
    public static final String[] FAIL_DOUBLE_STRINGS = {
        "-d"        //alphabet
    };

    /**
     * Test data for Percent
     */
    public static final double[] PERCENTS = {0.00d, 1.0d, 0.50d, 0.999d, 0.12345d, -2.25d};
    public static final String[] PASS_PERCENT_STRINGS = {
        "01%"
    };
    public static final String[] FAIL_PERCENT_STRINGS = {
        "5d",       //double value
        "%",        //empty %
        "5°",       //degrees
        "%f",
        "%d"
    };

    /**
     * Test data for currency
     */
    public static final double[] CURRENCY_DOUBLES = {0.0d, -5.10d, 10.99d, 1234567.89d, -12345.6789d};
    public static final BigDecimal[] CURRENCY_BIGDECIMALS ={
        new BigDecimal("0.0"),
        new BigDecimal("-5.10"),
        new BigDecimal("10.99"),
        new BigDecimal("1234567.89"),
        new BigDecimal("-12345.6789")
    };
    public static final String[] PASS_CURRENCY_STRINGS = {
        "$100,000,000.00",
        "($0.000001)"
    };
    public static final String[] FAIL_CURRENCY_STRINGS = {
        "\n100000000000",
        "1K",
        "1.00",
        "100,000,000.1000",
        "￥9,990.00"
    };

    // List of currency codes: http://en.wikipedia.org/wiki/ISO_4217
    public static final String[] CURRENCY_TYPES = {
        "USD",
        "GBP",
        "EUR",
        "JPY"
    };
}
