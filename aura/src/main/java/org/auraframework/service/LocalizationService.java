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
/*
 * Copyright, 1999-2012, salesforce.com All Rights Reserved Company Confidential
 */
package org.auraframework.service;

import java.math.BigDecimal;
import java.text.ParseException;
import java.util.Calendar;
import java.util.Date;
import java.util.Locale;
import java.util.TimeZone;

import com.ibm.icu.util.Currency;

/**
 * <p>
 * Service for handling locale-specific data.
 * </p>
 * <p>
 * Instances of all AuraServices should be retrieved from {@link AuraService}
 * </p>
 */
public interface LocalizationService extends AuraService {

    // Format Date (e.g. 1/1/2012)
    /**
     * Format a given Date for localized display using the default Locale,
     * TimeZone, and format.
     * 
     * @param date the Date to format
     * 
     * @return a formatted Date String similar to "Jan 1, 2012 3:00pm PST"
     */
    public String formatDate(Date date);

    /**
     * Format a given Date for localized display using the given format style.
     * Valid dateStyle values are from java.text.DateFormat, and include:
     * DateFormat.SHORT, DateFormat.MEDIUM, DateFormat.LONG, and
     * DateFormat.DEFAULT
     * 
     * @param date the Date to format
     * @param dateStyle the style to use.
     * 
     * @return a formatted Date String
     */
    public String formatDate(Date date, int dateStyle);

    /**
     * Format a given Date for localized display using the given Locale.
     * 
     * @param date the Date to format
     * @param locale the Locale to use
     * 
     * @return a formatted Date String
     */
    public String formatDate(Date date, Locale locale);

    /**
     * Format a given Date for localized display using the given Locale and
     * TimeZone.
     * 
     * @param date the Date to format
     * @param locale the Locale to use
     * @param timeZone the TimeZone to use
     * 
     * @return a formatted Date String
     */
    public String formatDate(Date date, Locale locale, TimeZone timeZone);

    /**
     * Format a given Date for localized display using the given Locale,
     * TimeZone, and format style.
     * 
     * @param date the Date to format
     * @param locale the Locale to use
     * @param timeZone the TimeZone to use
     * @param dateStyle the style from DateFormat to use (SHORT, MEDIUM, LONG,
     *            or DEFAULT)
     * 
     * @return a formatted Date String
     */
    public String formatDate(Date date, Locale locale, TimeZone timeZone, int dateStyle);

    /**
     * Format a given Calendar object for display as a localized String.
     * 
     * @param cal the Calendar to use for Date and TimeZone
     * 
     * @return a formatted Date String
     */
    public String formatDate(Calendar cal);

    /**
     * Format a given Calendar object for display as a localized String using
     * the given format style.
     * 
     * @param cal the Calendar to use for Date and TimeZone
     * @param dateStyle the style from DateFormat to use (SHORT, MEDIUM, LONG,
     *            or DEFAULT)
     * 
     * @return a formatted Date String
     */
    public String formatDate(Calendar cal, int dateStyle);

    // Format Time (e.g. 3:00pm)
    /**
     * Format a given Date object as a localized time String.
     * 
     * @param time the time to format
     * @return a formatted String of the local time
     */
    public String formatTime(Date time);

    /**
     * Format a given Date object as a localized time String using the format
     * style specified (from java.text.DateFormat).
     * 
     * @param time the time to format
     * @param timeStyle the format style to use
     * @return a formatted String of the local time
     */
    public String formatTime(Date time, int timeStyle);

    /**
     * Format a given Date object as a time String for the given Locale.
     * 
     * @param time the time to format
     * @param locale the Locale to use
     * @return a formatted String of the local time
     */
    public String formatTime(Date time, Locale locale);

    /**
     * Format a given Date object as a time String for the given Locale using
     * the given TimeZone.
     * 
     * @param time the time for format
     * @param locale the Locale to use
     * @param timeZone the TimeZone to use for ofsetting the displayed time
     * @return a formatted String of the local time
     */
    public String formatTime(Date time, Locale locale, TimeZone timeZone);

    /**
     * Format a given Date object as a time String for the given Locale using
     * the given TimeZone in the given format style (from java.text.DateFormat).
     * 
     * @param time the time for format
     * @param locale the Locale to use
     * @param timeZone the TimeZone to use for offsetting the displayed time
     * @param timeStyle the format style to use
     * @return a formatted String of the local time
     */
    public String formatTime(Date time, Locale locale, TimeZone timeZone, int timeStyle);

    /**
     * Format a given Calendar for display as a localized time String, using the
     * TimeZone on the Calendar.
     * 
     * @param cal the Calendar to format
     * @return a formatted String of the local time
     */
    public String formatTime(Calendar cal);

    /**
     * Format a given Calendar for display as a localized time String in the
     * given format style, using the TimeZone on the Calendar.
     * 
     * @param cal the Calendar to format
     * @param timeStyle the format style to use
     * @return a formatted String of the local time
     */
    public String formatTime(Calendar cal, int timeStyle);

    // Format Date-Time (e.g. 1/1/2012 3:00pm)
    /**
     * Format a given Date object as a localized time and date String.
     * 
     * @param dateTime the Date object to format
     * @return a formatted String of the local time and date
     */
    public String formatDateTime(Date dateTime);

    /**
     * Format a given Date object as a localized time String using the format
     * style specified (from java.text.DateFormat).
     * 
     * @param dateTime the Date object to format
     * @param dateStyle the format style to use for the date portion
     * @param timeStyle the format style to use for the time portion
     * @return a formatted String of the local time and date
     */
    public String formatDateTime(Date dateTime, int dateStyle, int timeStyle);

    /**
     * Format a given Date object as a time and date String for the given
     * Locale.
     * 
     * @param dateTime the Date object to format
     * @param locale the Locale to use
     * @return a formatted String of the local time and date
     */
    public String formatDateTime(Date dateTime, Locale locale);

    /**
     * Format a given Date object as a time and date String for the given Locale
     * using the given TimeZone.
     * 
     * @param dateTime the Date object to format
     * @param locale the Locale to use
     * @param timeZone the TimeZone to use for ofsetting the displayed time
     * @return a formatted String of the local time and date
     */
    public String formatDateTime(Date dateTime, Locale locale, TimeZone timeZone);

    /**
     * Format a given Date object as a time and date String for the given Locale
     * using the given TimeZone in the given format style (from
     * java.text.DateFormat).
     * 
     * @param dateTime the Date object to format
     * @param locale the Locale to use
     * @param timeZone the TimeZone to use for offsetting the displayed time
     * @param dateStyle the format style to use for the date
     * @param timeStyle the format style to use for the time
     * @return a formatted String of the local time and date
     */
    public String formatDateTime(Date dateTime, Locale locale, TimeZone timeZone, int dateStyle, int timeStyle);

    /**
     * Format a given Date for localized display using the given Locale,
     * TimeZone, and format style.
     * 
     * @param date the Date to format
     * @param locale the Locale to use
     * @param timeZone the TimeZone to use
     * @param format SimpleDateFormat pattern
     * 
     * @return a formatted Date String
     */
    public String formatDateTime(Date date, Locale locale, TimeZone timeZone, String format);

    /**
     * Format a given Calendar for display as a localized time and date String,
     * using the TimeZone on the Calendar.
     * 
     * @param cal the Calendar to format
     * @return a formatted String of the local time and date
     */
    public String formatDateTime(Calendar cal);

    /**
     * Format a given Calendar for display as a localized time and date String
     * in the given format style, using the TimeZone on the Calendar.
     * 
     * @param cal the Calendar to format
     * @param timeStyle the format style to use
     * @return a formatted String of the local time and date
     */
    public String formatDateTime(Calendar cal, int dateStyle, int timeStyle);

    // Format Number (e.g. 12,345.67)
    /**
     * Format the given number for display using the appropriate format for the
     * locale.
     * 
     * @param number the number to format
     * @return a String representation of the number
     */
    public String formatNumber(int number);

    /**
     * Format the given number for display using the appropriate format for the
     * locale.
     * 
     * @param number the number to format
     * @return a String representation of the number
     */
    public String formatNumber(long number);

    /**
     * Format the given number for display using the appropriate format for the
     * locale.
     * 
     * @param number the number to format
     * @return a String representation of the number
     */
    public String formatNumber(double number);

    /**
     * Format the given number for display using the appropriate format for the
     * locale.
     * 
     * @param number the number to format
     * @return a String representation of the number
     */
    public String formatNumber(Integer number);

    /**
     * Format the given number for display using the appropriate format for the
     * locale.
     * 
     * @param number the number to format
     * @return a String representation of the number
     */
    public String formatNumber(Long number);

    /**
     * Format the given number for display using the appropriate format for the
     * locale.
     * 
     * @param number the number to format
     * @return a String representation of the number
     */
    public String formatNumber(Double number);

    /**
     * Format the given number for display using the appropriate format for the
     * locale. The caller can specify the minimum and maximum number of digits
     * after the decimal separator.
     * 
     * @param number the number to format
     * @param minFractionDigits the minimum number of digits after the decimal
     *            separator
     * @param maxFractionDigits the maximum number of digits after the decimal
     *            separator. If the input number has more precision than this
     *            allows, the value will be rounded
     * @return a String representation of the number
     */
    public String formatNumber(Double number, int minFractionDigits, int maxFractionDigits);

    /**
     * Format a BigDecimal for localized display.
     * 
     * @param number the number to format
     * @return a String representation of the number
     */
    public String formatNumber(BigDecimal number);

    /**
     * Format the given number for display using the appropriate format for the
     * locale. The caller can specify the minimum and maximum number of digits
     * after the decimal separator.
     * 
     * @param number the number to format
     * @param minFractionDigits the minimum number of digits after the decimal
     *            separator
     * @param maxFractionDigits the maximum number of digits after the decimal
     *            separator. If the input number has more precision than this
     *            allows, the value will be rounded
     * @return a String representation of the number
     */
    public String formatNumber(BigDecimal number, int minFractionDigits, int maxFractionDigits);

    /**
     * Format the given number for display using the appropriate format for the
     * given Locale.
     * 
     * @param number the number to format
     * @param locale the Locale to use to specify formatting
     * @return a String representation of the number
     */
    public String formatNumber(int number, Locale locale);

    /**
     * Format the given number for display using the appropriate format for the
     * given Locale.
     * 
     * @param number the number to format
     * @param locale the Locale to use to specify formatting
     * @return a String representation of the number
     */
    public String formatNumber(long number, Locale locale);

    /**
     * Format the given number for display using the appropriate format for the
     * given Locale.
     * 
     * @param number the number to format
     * @param locale the Locale to use to specify formatting
     * @return a String representation of the number
     */
    public String formatNumber(double number, Locale locale);

    /**
     * Format the given number for display using the appropriate format for the
     * given Locale.
     * 
     * @param number the number to format
     * @param locale the Locale to use to specify formatting
     * @return a String representation of the number
     */
    public String formatNumber(Integer number, Locale locale);

    /**
     * Format the given number for display using the appropriate format for the
     * given Locale.
     * 
     * @param number the number to format
     * @param locale the Locale to use to specify formatting
     * @return a String representation of the number
     */
    public String formatNumber(Long number, Locale locale);

    /**
     * Format the given number for display using the appropriate format for the
     * given Locale.
     * 
     * @param number the number to format
     * @param locale the Locale to use to specify formatting
     * @return a String representation of the number
     */
    public String formatNumber(Double number, Locale locale);

    /**
     * Format the given number for display using the appropriate format for the
     * given Locale. The caller can specify the minimum and maximum number of
     * digits after the decimal separator.
     * 
     * @param number the number to format
     * @param minFractionDigits the minimum number of digits after the decimal
     *            separator
     * @param maxFractionDigits the maximum number of digits after the decimal
     *            separator. If the input number has more precision than this
     *            allows, the value will be rounded
     * @return a String representation of the number
     */
    public String formatNumber(Double number, Locale locale, int minFractionDigits, int maxFractionDigits);

    /**
     * Format the given number for display using the appropriate format for the
     * given Locale.
     * 
     * @param number the number to format
     * @param locale the Locale to use to specify formatting
     * @return a String representation of the number
     */
    public String formatNumber(BigDecimal number, Locale locale);

    /**
     * Format the given number for display using the appropriate format for the
     * given Locale. The caller can specify the minimum and maximum number of
     * digits after the decimal separator.
     * 
     * @param number the number to format
     * @param minFractionDigits the minimum number of digits after the decimal
     *            separator
     * @param maxFractionDigits the maximum number of digits after the decimal
     *            separator. If the input number has more precision than this
     *            allows, the value will be rounded
     * @return a String representation of the number
     */
    public String formatNumber(BigDecimal number, Locale locale, int minFractionDigits, int maxFractionDigits);

    // Format Percent (e.g. 75.5%)
    /**
     * Format the given number as a localized percentage. Generally this will
     * move the decimal point over two places from the given value and add a
     * localized percentage character. For example in the en_US Locale the input
     * of 0.25 would be returned as "25%".
     * 
     * @param percent the number to format as a percentage String
     * @return a formatted percentage String
     */
    public String formatPercent(double percent);

    /**
     * Format the given number as a localized percentage. Generally this will
     * move the decimal point over two places from the given value and add a
     * localized percentage character. For example in the en_US Locale the input
     * of {0.25, 2, 4} would be returned as "25.00%".
     * 
     * @param percent the number to format as a percentage String
     * @param minFractionDigits the minimum number of digits after the decimal
     *            separator of the String
     * @param maxFractionDigits the maximum number of digits after the decimal
     *            separator. of the String
     * @return a formatted percentage String
     */
    public String formatPercent(double percent, int minFractionDigits, int maxFractionDigits);

    /**
     * Format the given number as a localized percentage. Generally this will
     * move the decimal point over two places from the given value and add a
     * localized percentage character. For example for the en_US Locale the
     * input of 0.25 would be returned as "25%".
     * 
     * @param percent the number to format as a percentage String
     * @param locale the Locale to use for formatting
     * @return a formatted percentage String
     */
    public String formatPercent(double percent, Locale locale);

    /**
     * Format the given number as a localized percentage. Generally this will
     * move the decimal point over two places from the given value and add a
     * localized percentage character. For example in the en_US Locale the input
     * of {0.25, 2, 4} would be returned as "25.00%".
     * 
     * @param percent the number to format as a percentage String
     * @param locale the Locale to use for formatting
     * @param minFractionDigits the minimum number of digits after the decimal
     *            separator of the String
     * @param maxFractionDigits the maximum number of digits after the decimal
     *            separator. of the String
     * @return a formatted percentage String
     */
    public String formatPercent(double percent, Locale locale, int minFractionDigits, int maxFractionDigits);

    // Format Currency (e.g. $12,345.67)
    /**
     * Format the given number as a currency amount. This will generally assign
     * a currency symbol and apply a decimal precision commonly associated with
     * the local currency.
     * 
     * For more precise control of the output or to add your own currency
     * indicator, simply format as a number instead of a currency amount. This
     * could be useful to apply a "USD" suffix instead of a "$" prefix for
     * example, or to have no symbol at all if that symbol is rendered
     * separately in a label outside of a field.
     * 
     * @param value the number to format
     * @return a formatted currency String
     */
    public String formatCurrency(double value);

    /**
     * Format the given number as a currency amount. This will generally assign
     * a currency symbol and apply a decimal precision commonly associated with
     * the local currency.
     * 
     * For more precise control of the output or to add your own currency
     * indicator, simply format as a number instead of a currency amount. This
     * could be useful to apply a "USD" suffix instead of a "$" prefix for
     * example, or to have no symbol at all if that symbol is rendered
     * separately in a label outside of a field.
     * 
     * @param value the number to format
     * @param minFractionDigits the minimum number of digits to display after
     *            the decimal separator in the String
     * @param maxFractionDigits the maximum number of digits to display after
     *            the decimal separator in the String. If the input number has
     *            more precision than this allows, the value will be rounded
     * @return a formatted currency String
     */
    public String formatCurrency(double value, int minFractionDigits, int maxFractionDigits);

    /**
     * Format the given number as a currency amount. This will generally assign
     * a currency symbol and apply a decimal precision commonly associated with
     * the Locale's currency.
     * 
     * For more precise control of the output or to add your own currency
     * indicator, simply format as a number instead of a currency amount. This
     * could be useful to apply a "USD" suffix instead of a "$" prefix for
     * example, or to have no symbol at all if that symbol is rendered
     * separately in a label outside of a field.
     * 
     * @param value the number to format
     * @return a formatted currency String
     */
    public String formatCurrency(double value, Locale locale);

    /**
     * Format the given number as a currency amount. This will generally assign
     * a currency symbol and apply a decimal precision commonly associated with
     * the Locale's currency.
     * 
     * For more precise control of the output or to add your own currency
     * indicator, simply format as a number instead of a currency amount. This
     * could be useful to apply a "USD" suffix instead of a "$" prefix for
     * example, or to have no symbol at all if that symbol is rendered
     * separately in a label outside of a field.
     * 
     * @param value the number to format
     * @param minFractionDigits the minimum number of digits to display after
     *            the decimal separator in the String
     * @param maxFractionDigits the maximum number of digits to display after
     *            the decimal separator in the String. If the input number has
     *            more precision than this allows, the value will be rounded
     * @return a formatted currency String
     */
    public String formatCurrency(double value, Locale locale, int minFractionDigits, int maxFractionDigits);

    /**
     * Format the given number as a currency amount. This will generally assign
     * a currency symbol and apply a decimal precision commonly associated with
     * the Locale's currency.
     * 
     * For more precise control of the output or to add your own currency
     * indicator, simply format as a number instead of a currency amount. This
     * could be useful to apply a "USD" suffix instead of a "$" prefix for
     * example, or to have no symbol at all if that symbol is rendered
     * separately in a label outside of a field.
     * 
     * @param value the number to format
     * @param minFractionDigits the minimum number of digits to display after
     *            the decimal separator in the String
     * @param maxFractionDigits the maximum number of digits to display after
     *            the decimal separator in the String. If the input number has
     *            more precision than this allows, the value will be rounded
     * @param currency the currency to use with the format
     * @return a formatted currency String
     */
    public String formatCurrency(double value, Locale locale, int minFractionDigits, int maxFractionDigits,
            Currency currency);

    /**
     * Format the given BigDecimal as a currency amount. This will generally
     * assign a currency symbol and apply a decimal precision commonly
     * associated with the local currency.
     * 
     * For more precise control of the output or to add your own currency
     * indicator, simply format as a number instead of a currency amount. This
     * could be useful to apply a "USD" suffix instead of a "$" prefix for
     * example, or to have no symbol at all if that symbol is rendered
     * separately in a label outside of a field.
     * 
     * @param value the number to format
     * @return a formatted currency String
     */
    public String formatCurrency(BigDecimal value);

    /**
     * Format the given BigDecimal as a currency amount. This will generally
     * assign a currency symbol and apply a decimal precision commonly
     * associated with the local currency.
     * 
     * For more precise control of the output or to add your own currency
     * indicator, simply format as a number instead of a currency amount. This
     * could be useful to apply a "USD" suffix instead of a "$" prefix for
     * example, or to have no symbol at all if that symbol is rendered
     * separately in a label outside of a field.
     * 
     * @param value the number to format
     * @param minFractionDigits the minimum number of digits to display after
     *            the decimal separator in the String
     * @param maxFractionDigits the maximum number of digits to display after
     *            the decimal separator in the String. If the input number has
     *            more precision than this allows, the value will be rounded
     * @return a formatted currency String
     */
    public String formatCurrency(BigDecimal value, int minFractionDigits, int maxFractionDigits);

    /**
     * Format the given BigDecimal as a currency amount. This will generally
     * assign a currency symbol and apply a decimal precision commonly
     * associated with the Locale's currency.
     * 
     * For more precise control of the output or to add your own currency
     * indicator, simply format as a number instead of a currency amount. This
     * could be useful to apply a "USD" suffix instead of a "$" prefix for
     * example, or to have no symbol at all if that symbol is rendered
     * separately in a label outside of a field.
     * 
     * @param value the number to format
     * @return a formatted currency String
     */
    public String formatCurrency(BigDecimal value, Locale locale);

    /**
     * Format the given BigDecimal as a currency amount. This will generally
     * assign a currency symbol and apply a decimal precision commonly
     * associated with the Locale's currency.
     * 
     * For more precise control of the output or to add your own currency
     * indicator, simply format as a number instead of a currency amount. This
     * could be useful to apply a "USD" suffix instead of a "$" prefix for
     * example, or to have no symbol at all if that symbol is rendered
     * separately in a label outside of a field.
     * 
     * @param value the number to format
     * @param minFractionDigits the minimum number of digits to display after
     *            the decimal separator in the String
     * @param maxFractionDigits the maximum number of digits to display after
     *            the decimal separator in the String. If the input number has
     *            more precision than this allows, the value will be rounded
     * @return a formatted currency String
     */
    public String formatCurrency(BigDecimal value, Locale locale, int minFractionDigits, int maxFractionDigits);

    /**
     * Format the given BigDecimal as a currency amount. This will generally
     * assign a currency symbol and apply a decimal precision commonly
     * associated with the Locale's currency.
     * 
     * For more precise control of the output or to add your own currency
     * indicator, simply format as a number instead of a currency amount. This
     * could be useful to apply a "USD" suffix instead of a "$" prefix for
     * example, or to have no symbol at all if that symbol is rendered
     * separately in a label outside of a field.
     * 
     * @param value the number to format
     * @param minFractionDigits the minimum number of digits to display after
     *            the decimal separator in the String
     * @param maxFractionDigits the maximum number of digits to display after
     *            the decimal separator in the String. If the input number has
     *            more precision than this allows, the value will be rounded
     * @param currency the currency to use with the format
     * @return a formatted currency String
     */
    public String formatCurrency(BigDecimal value, Locale locale, int minFractionDigits, int maxFractionDigits,
            Currency currency);

    // Parse Date String to Date object with no specific time
    /**
     * Attempt to parse the given String to a Date object where the date is all
     * that is interesting. The time of day will typically be 00:00:00 or
     * undefined.
     * 
     * @param date the date String
     * @return the determined Date equivalent
     * @throws ParseException if a problem occurs parsing the String
     */
    public Date parseDate(String date) throws ParseException;

    /**
     * Attempt to parse the given String to a Date object, assuming the String
     * will match the given style. The date is all that is interesting. The time
     * of day will typically be 00:00:00 or undefined.
     * 
     * @param date the date String
     * @param dateStyle the format style to use when parsing
     * @return the determined Date equivalent
     * @throws ParseException if a problem occurs parsing the String
     */
    public Date parseDate(String date, int dateStyle) throws ParseException;

    /**
     * Attempt to parse the given String to a Date object from the given Locale.
     * The date is all that is interesting. The time of day will typically be
     * 00:00:00 or undefined.
     * 
     * @param date the date String
     * @param locale the Locale to use when parsing
     * @return the determined Date equivalent
     * @throws ParseException if a problem occurs parsing the String
     */
    public Date parseDate(String date, Locale locale) throws ParseException;

    /**
     * Attempt to parse the given String to a Date object from the given Locale,
     * using the given TimeZone. The date is all that is interesting. The time
     * of day will typically be 00:00:00 or undefined.
     * 
     * @param date the date String
     * @param locale the Locale to use when parsing
     * @param timeZone the TimeZone to use when parsing
     * @return the determined Date equivalent
     * @throws ParseException if a problem occurs parsing the String
     */
    public Date parseDate(String date, Locale locale, TimeZone timeZone) throws ParseException;

    /**
     * Attempt to parse the given String to a Date object from the given Locale,
     * using the given TimeZone, assuming the String will match the given format
     * style. The date is all that is interesting. The time of day will
     * typically be 00:00:00 or undefined.
     * 
     * @param date the date String
     * @param locale the Locale to use when parsing
     * @param timeZone the TimeZone to use when parsing
     * @param dateStyle the format style to use when parsing
     * @return the determined Date equivalent
     * @throws ParseException if a problem occurs parsing the String
     */
    public Date parseDate(String date, Locale locale, TimeZone timeZone, int dateStyle) throws ParseException;

    /**
     * Attempt to parse the given String to a Calendar object from the given
     * Locale, using the given TimeZone, assuming the String will match the
     * given format style. The date is all that is interesting. The time of day
     * will typically be 00:00:00 or undefined.
     * 
     * @param date the date String
     * @param locale the Locale to use when parsing
     * @param timeZone the TimeZone to use when parsing
     * @param dateStyle the format style to use when parsing
     * @return the determined Calendar equivalent
     * @throws ParseException if a problem occurs parsing the String
     */
    public Calendar parseDateToCalendar(String date, Locale locale, TimeZone timeZone, int dateStyle)
            throws ParseException;

    // Parse Time String to Date object of the given Time
    /**
     * Attempt to parse the given String to a Date object where the time of day
     * is all that is interesting. The day, month, and year will be undefined or
     * the fist day of the epoch calendar.
     * 
     * @param time the time String
     * @return the determined Date equivalent for the time
     * @throws ParseException if a problem occurs parsing the String
     */
    public Date parseTime(String time) throws ParseException;

    /**
     * Attempt to parse the given String to a Date object where the time of day
     * is all that is interesting. The day, month, and year will be undefined or
     * the fist day of the epoch calendar.
     * 
     * @param time the time String
     * @param timeStyle the format style of the time String (from
     *            java.text.DateFormat)
     * @return the determined Date equivalent for the time
     * @throws ParseException if a problem occurs parsing the String
     */
    public Date parseTime(String time, int timeStyle) throws ParseException;

    /**
     * Attempt to parse the given String to a Date object where the time of day
     * is all that is interesting. The day, month, and year will be undefined or
     * the fist day of the epoch calendar.
     * 
     * @param time the time String
     * @param locale the Locale to use when parsing
     * @return the determined Date equivalent for the time
     * @throws ParseException if a problem occurs parsing the String
     */
    public Date parseTime(String time, Locale locale) throws ParseException;

    /**
     * Attempt to parse the given String to a Date object where the time of day
     * is all that is interesting. The day, month, and year will be undefined or
     * the fist day of the epoch calendar. The given TimeZone will be used to
     * calibrate the given String to UTC/GMT time on the returned Date object.
     * 
     * For example given a user in the en_US Locale and Pacific Standard Time
     * (PST) TimeZone a given String of "8:00pm PST" would be returned as a Date
     * object of either 12:00pm or 1:00pm UTC/GMT depending on the current
     * Daylight Savings offset for PST/PDT.
     * 
     * @param time the time String
     * @param locale the Locale to use when parsing
     * @param timeZone the timeZone to use to adjust the offset on the returned
     *            Date
     * @return the determined Date equivalent for the time
     * @throws ParseException if a problem occurs parsing the String
     */
    public Date parseTime(String time, Locale locale, TimeZone timeZone) throws ParseException;

    /**
     * Attempt to parse the given String to a Date object where the time of day
     * is all that is interesting. The day, month, and year will be undefined or
     * the fist day of the epoch calendar. The given TimeZone will be used to
     * calibrate the given String to UTC/GMT time on the returned Date object.
     * 
     * For example given a user in the en_US Locale and Pacific Standard Time
     * (PST) TimeZone a given String of "8:00pm PST" would be returned as a Date
     * object of either 12:00pm or 1:00pm UTC/GMT depending on the current
     * Daylight Savings offset for PST/PDT.
     * 
     * @param time the time String
     * @param locale the Locale to use when parsing
     * @param timeZone the timeZone to use to adjust the offset on the returned
     *            Date
     * @param timeStyle the format style of the time String (from
     *            java.text.DateFormat)
     * @return the determined Date equivalent for the time
     * @throws ParseException if a problem occurs parsing the String
     */
    public Date parseTime(String time, Locale locale, TimeZone timeZone, int timeStyle) throws ParseException;

    /**
     * Attempt to parse the given String to a Calendar object where the time of
     * day is all that is interesting. The day, month, and year will be
     * undefined or the fist day of the epoch calendar. The given TimeZone will
     * be used to calibrate the given String to UTC/GMT time on the returned
     * Calendar object.
     * 
     * For example given a user in the en_US Locale and Pacific Standard Time
     * (PST) TimeZone a given String of "8:00pm PST" would be returned as a Date
     * object of either 12:00pm or 1:00pm UTC/GMT depending on the current
     * Daylight Savings offset for PST/PDT.
     * 
     * The TimeZone will also be set on the returned Calendar instance.
     * 
     * @param time the time String
     * @param locale the Locale to use when parsing
     * @param timeZone the timeZone to use to adjust the offset on the returned
     *            Calendar
     * @param timeStyle the format style of the time String
     * @return the determined Calendar equivalent for the time
     * @throws ParseException if a problem occurs parsing the String
     */
    public Calendar parseTimeToCalendar(String time, Locale locale, TimeZone timeZone, int timeStyle)
            throws ParseException;

    // Parse Date Time String to Date Object with the given time
    /**
     * Attempt to parse the given String to a Date object where the time of day
     * and date are both interesting. A default TimeZone will be used to
     * calibrate the given String to UTC/GMT time on the returned Date object.
     * 
     * @param dateTime the time and date String
     * @return the determined Date equivalent
     * @throws ParseException if a problem occurs parsing the String
     */
    public Date parseDateTime(String dateTime) throws ParseException;

    /**
     * Attempt to parse the given String to a Date object where the time of day
     * and date are both interesting. A default TimeZone will be used to
     * calibrate the given String to UTC/GMT time on the returned Date object.
     * 
     * @param dateTime the time and date String
     * @param dateStyle the format style of the date portion of the String
     * @param timeStyle the format style of the time portion of the String
     * @return the determined Date equivalent
     * @throws ParseException if a problem occurs parsing the String
     */
    public Date parseDateTime(String dateTime, int dateStyle, int timeStyle) throws ParseException;

    /**
     * Attempt to parse the given String to a Date object where the time of day
     * and date are both interesting. A default TimeZone will be used to
     * calibrate the given String to UTC/GMT time on the returned Date object.
     * 
     * @param dateTime the time and date String
     * @param locale the Locale to use when parsing
     * @return the determined Date equivalent
     * @throws ParseException if a problem occurs parsing the String
     */
    public Date parseDateTime(String dateTime, Locale locale) throws ParseException;

    /**
     * Attempt to parse the given String to a Date object where the time of day
     * and date are both interesting. The given TimeZone will be used to
     * calibrate the given String to UTC/GMT time on the returned Date object.
     * 
     * @param dateTime the time and date String
     * @param locale the Locale to use when parsing
     * @param timeZone the timeZone to use to adjust the offset on the returned
     *            Calendar
     * @return the determined Date equivalent
     * @throws ParseException if a problem occurs parsing the String
     */
    public Date parseDateTime(String dateTime, Locale locale, TimeZone timeZone) throws ParseException;

    /**
     * Attempt to parse the given String to a Date object where the time of day
     * and date are both interesting. The given TimeZone will be used to
     * calibrate the given String to UTC/GMT time on the returned Date object.
     * 
     * @param dateTime the time and date String
     * @param locale the Locale to use when parsing
     * @param timeZone the timeZone to use to adjust the offset on the returned
     *            Calendar
     * @param dateStyle the format style of the date portion of the String
     * @param timeStyle the format style of the time portion of the String
     * @return the determined Date equivalent
     * @throws ParseException if a problem occurs parsing the String
     */
    public Date parseDateTime(String dateTime, Locale locale, TimeZone timeZone, int dateStyle, int timeStyle)
            throws ParseException;

    /**
     * Attempt to parse the given String to a Date object where the time of day
     * and date are both interesting. The given TimeZone will be used to
     * calibrate the given String to UTC/GMT time on the returned Date object.
     * 
     * @param dateTime the time and date String
     * @param locale the Locale to use when parsing
     * @param timeZone the timeZone to use to adjust the offset on the returned
     *            Calendar
     * @param format SimpleDateFormat pattern
     * @return the determined Date equivalent
     * @throws ParseException if a problem occurs parsing the String
     */
    public Date parseDateTime(String dateTime, Locale locale, TimeZone timeZone, String format) throws ParseException;

    /**
     * Attempt to parse the given String to a Calendar object where the time of
     * day and date are both interesting. The given TimeZone will be used to
     * calibrate the given String to UTC/GMT time on the returned Calendar
     * object.
     * 
     * The TimeZone will also be set on the returned Calendar instance.
     * 
     * @param dateTime the time and date String
     * @param locale the Locale to use when parsing
     * @param timeZone the timeZone to use to adjust the offset on the returned
     *            Calendar
     * @param dateStyle the format style of the date portion of the String
     * @param timeStyle the format style of the time portion of the String
     * @return the determined Calendar equivalent
     * @throws ParseException if a problem occurs parsing the String
     */
    public Calendar parseDateTimeToCalendar(String dateTime, Locale locale, TimeZone timeZone, int dateStyle,
            int timeStyle) throws ParseException;

    // Parse a number String to a numeric amount
    /**
     * Attempts to convert a given String to an int value . If the number cannot
     * be deciphered from the String a ParseException is thrown.
     * 
     * @param number the localized number String to attempt to parse
     * @return the numeric equivalent
     * @throws ParseException if a problem is encountered
     */
    public int parseInt(String number) throws ParseException;

    /**
     * Attempts to convert a given String to a long value . If the number cannot
     * be deciphered from the String a ParseException is thrown.
     * 
     * @param number the localized number String to attempt to parse
     * @return the numeric equivalent
     * @throws ParseException if a problem is encountered
     */
    public long parseLong(String number) throws ParseException;

    /**
     * Attempts to convert a given String to float value . If the number cannot
     * be deciphered from the String a ParseException is thrown.
     * 
     * @param number the localized number String to attempt to parse
     * @return the numeric equivalent
     * @throws ParseException if a problem is encountered
     */
    public float parseFloat(String number) throws ParseException;

    /**
     * Attempts to convert a given String to a double value . If the number
     * cannot be deciphered from the String a ParseException is thrown.
     * 
     * @param number the localized number String to attempt to parse
     * @return the numeric equivalent
     * @throws ParseException if a problem is encountered
     */
    public double parseDouble(String number) throws ParseException;

    /**
     * Attempts to convert a given String to an int value . If the number cannot
     * be deciphered from the String using the given Locale a ParseException is
     * thrown.
     * 
     * @param number the localized number String to attempt to parse
     * @param locale the Locale to use
     * @return the numeric equivalent
     * @throws ParseException if a problem is encountered
     */
    public int parseInt(String number, Locale locale) throws ParseException;

    /**
     * Attempts to convert a given String toa long value . If the number cannot
     * be deciphered from the String using the given Locale a ParseException is
     * thrown.
     * 
     * @param number the localized number String to attempt to parse
     * @param locale the Locale to use
     * @return the numeric equivalent
     * @throws ParseException if a problem is encountered
     */
    public long parseLong(String number, Locale locale) throws ParseException;

    /**
     * Attempts to convert a given String to a float value . If the number
     * cannot be deciphered from the String using the given Locale a
     * ParseException is thrown.
     * 
     * @param number the localized number String to attempt to parse
     * @param locale the Locale to use
     * @return the numeric equivalent
     * @throws ParseException if a problem is encountered
     */
    public float parseFloat(String number, Locale locale) throws ParseException;

    /**
     * Attempts to convert a given String to a double value . If the number
     * cannot be deciphered from the String using the given Locale a
     * ParseException is thrown.
     * 
     * @param number the localized number String to attempt to parse
     * @param locale the Locale to use
     * @return the numeric equivalent
     * @throws ParseException if a problem is encountered
     */
    public double parseDouble(String number, Locale locale) throws ParseException;

    // Parse a BigDecimal String to a BigDecimal amount
    /**
     * Returns a BigDecimal number from the given localized number String.
     * 
     * @param number the number String to parse
     * @return a BigDecimal
     * @throws ParseException if number cannot be parsed
     */
    public BigDecimal parseBigDecimal(String number) throws ParseException;

    /**
     * Returns a BigDecimal number from the given localized number String and
     * Locale object.
     * 
     * @param number the number String to parse
     * @return a BigDecimal
     * @throws ParseException if number cannot be parsed
     */
    public BigDecimal parseBigDecimal(String number, Locale locale) throws ParseException;

    // Parse a Percent String to a double amount ("75.5%" = 0.755)
    /**
     * Returns a number from the given localized percentage String. This will be
     * the mathematical equivalent, not the language equivalent.
     * 
     * For example "75%" in en_US is returned as 0.75 not as 75.
     * 
     * @param percent the percent String to parse
     * @return a number representation of the percentage String
     * @throws ParseException if the percentage cannot be parsed
     */
    public double parsePercent(String percent) throws ParseException;

    /**
     * Returns a number from the given localized percentage String based on the
     * given Locale's percent format. This will be the mathematical equivalent,
     * not the language equivalent.
     * 
     * For example "75%" in en_US is returned as 0.75 not as 75.
     * 
     * @param percent the percent String to parse
     * @return a number representation of the percentage String
     * @throws ParseException if the percentage cannot be parsed
     */
    public double parsePercent(String percent, Locale locale) throws ParseException;

    // Parse a Currency String to a BigDecimal amount
    /**
     * Returns a BigDecimal number from the given localized currency String.
     * 
     * @param currency the currency String to parse
     * @return a BigDecimal
     * @throws ParseException if currency cannot be parsed
     */
    public BigDecimal parseCurrency(String currency) throws ParseException;

    /**
     * Returns a BigDecimal number from the given localized currency String and
     * Locale object.
     * 
     * @param currency the currency String to parse
     * @return a BigDecimal
     * @throws ParseException if currency cannot be parsed
     */
    public BigDecimal parseCurrency(String currency, Locale locale) throws ParseException;

    /**
     * Format a Number for localized display.
     * 
     * @param number the number to format
     * @return a String representation of the number
     */
    public String formatNumber(Number number);

    /**
     * Format a Number for localized display.
     * 
     * @param number the number to format
     * @return a String representation of the number
     */
    public String formatNumber(Number number, Locale locale);

    /**
     * Format a Number for localized display.
     * 
     * @param number the number to format
     * @return a String representation of the number
     */
    public String formatNumber(Number number, Locale locale, int minFractionDigits, int maxFractionDigits);

}
