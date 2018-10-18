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
package org.auraframework.service;

import java.math.BigDecimal;
import java.text.ParseException;
import java.time.format.DateTimeParseException;
import java.util.Calendar;
import java.util.Currency;
import java.util.Date;
import java.util.Locale;
import java.util.TimeZone;

/**
 * This interface provides a service for formatting and parsing date time and numbers.
 * It also has the methods to provide localized format patterns.
 */
public interface LocalizationService {

    /**
     * Format a Date into localized date string with the default locale, time zone,
     * and format. For example, "1/1/2012".
     *
     * @param date - the date to be formatted into a date string
     * @return a formatted date string.
     */
    String formatDate(Date date);

    /**
     * Format a Date into localized date sting with the given locale and formatting style.
     *
     * @param date - the date to be formatted into a date string
     * @param locale - the given locale
     * @param dateStyle - the given formatting style. For example, DateFormat.SHORT for "M/d/yy" in the US locale.
     * @return a formatted date string
     */
    String formatDate(Date date, Locale locale, int dateStyle);

    /**
     * Format a Date into localized date sting with the given locale, formatting style
     * and time zone.
     *
     * @param date - the date to be formatted into a date string
     * @param locale - the given locale
     * @param dateStyle - the given formatting style.
     * @param timeZone - the given time zone
     * @return a formatted date string
     */
    String formatDate(Date date, Locale locale, int dateStyle, TimeZone timeZone);

    /**
     * Format a Date into localized time string with the default locale, formatting style,
     * and time zone. For example, "3:00 PM".
     *
     * @param time - the time to be formatted into a time string
     * @return a formatted time string
     */
    String formatTime(Date time);

    /**
     * Format a Date into localized time string with the given locale and formatting style.
     *
     * @param time - the time to be formatted into a time string
     * @param locale - the given locale
     * @param dateStyle - the given formatting style
     * @return a formatted time string
     */
    String formatTime(Date time, Locale locale, int timeStyle);

    /**
     * Format a Date into localized time string with the given locale, formatting style
     * and time zone.
     *
     * @param time - the time to be formatted into a time string
     * @param locale - the given locale
     * @param dateStyle - the given formatting style
     * @param timeZone - the given time zone
     * @return a formatted time string
     */
    String formatTime(Date time, Locale locale, int timeStyle, TimeZone timeZone);

    /**
     * Format a Date into localized date time string with the default locale, formatting style,
     * and time zone. For example, "1/1/2012 3:00 PM".
     *
     * @param datetime - the date to be formatted into a date time string
     * @return a formatted time string
     */
    String formatDateTime(Date dateTime);

    /**
     * Format a Date into localized date time string with the given locale and formatting style.
     *
     * @param datetime - the date to be formatted into a date time string
     * @param locale - the given locale
     * @param dateStyle - the given date formatting style
     * @param timeStyle - the given time formatting style
     * @return a formatted date time string
     */
    String formatDateTime(Date dateTime, Locale locale, int dateStyle, int timeStyle);

    /**
     * Format a Date into localized date time string with the given locale, formatting style,
     * and time zone.
     *
     * @param datetime - the date to be formatted into a date time string
     * @param locale - the given locale
     * @param dateStyle - the given date formatting style
     * @param timeStyle - the given time formatting style
     * @param timeZone - the given time zone
     * @return a formatted date time string
     */
    String formatDateTime(Date dateTime, Locale locale, int dateStyle, int timeStyle, TimeZone timeZone);

    /**
     * Format a integer with the default locale.
     */
    String formatNumber(int number);

    /**
     * Format a integer with the given locale.
     */
    String formatNumber(int number, Locale locale);

    /**
     * Format a long integer with the default locale.
     */
    String formatNumber(long number);

    /**
     * Format a long integer with the default locale.
     */
    String formatNumber(long number, Locale locale);

    /**
     * Format a double type number with the default locale.
     */
    String formatNumber(double number);

    /**
     * Format a double type number with the given locale.
     */
    String formatNumber(double number, Locale locale);

    /**
     * Format a double type number with the given locale.
     *
     * @param number - the number to be formatted
     * @param locale - the given locale
     * @param minFractionDigits - the minimum number of digits after the decimal separator
     * @param maxFractionDigits - the maximum number of digits after the decimal separator
     * @return a localized number string
     */
    String formatNumber(double number, Locale locale, int minFractionDigits, int maxFractionDigits);

    /**
     * Format a BigDecimal with the default locale.
     */
    String formatNumber(BigDecimal number);

    /**
     * Format a BigDecimal with the given locale.
     */
    String formatNumber(BigDecimal number, Locale locale);

    /**
     * Format a BigDecimal with the given locale.
     *
     * @param number - the number to be formatted
     * @param locale - the given locale
     * @param minFractionDigits - the minimum number of digits after the decimal separator
     * @param maxFractionDigits - the maximum number of digits after the decimal separator
     * @return a localized number string
     */
    String formatNumber(BigDecimal number, Locale locale, int minFractionDigits, int maxFractionDigits);

    /**
     * Format a Number with the default locale.
     */
    String formatNumber(Number number);

    /**
     * Format a Number with the given locale.
     */
    String formatNumber(Number number, Locale locale);

    /**
     * Format a Number with the given locale.
     *
     * @param number - the number to be formatted
     * @param locale - the given locale
     * @param minFractionDigits - the minimum number of digits after the decimal separator
     * @param maxFractionDigits - the maximum number of digits after the decimal separator
     * @return a localized number string
     */
    String formatNumber(Number number, Locale locale, int minFractionDigits, int maxFractionDigits);

    /**
     * Format a double integer in percent format with the default locale.
     * For example, '25%'
     */
    String formatPercent(double percent);

    /**
     * Format a double integer in percent format with the given locale.
     */
    String formatPercent(double percent, Locale locale);

    /**
     * Format a double integer in percent format with the given locale.
     *
     * @param number - the number to be formatted
     * @param locale - the given locale
     * @param minFractionDigits - the minimum number of digits after the decimal separator
     * @param maxFractionDigits - the maximum number of digits after the decimal separator
     * @return a localized number string in percent format
     */
    String formatPercent(double number, Locale locale, int minFractionDigits, int maxFractionDigits);

    /**
     * Format a double integer in currency format with the default locale.
     */
    String formatCurrency(double number);

    /**
     * Format a double integer in currency format with the given locale.
     */
    String formatCurrency(double number, Locale locale);

    /**
     * Format a double integer in currency format with the given locale.
     *
     * @param number - the number to be formatted
     * @param locale - the given locale
     * @param minFractionDigits - the minimum number of digits after the decimal separator
     * @param maxFractionDigits - the maximum number of digits after the decimal separator
     * @return a localized number string in currency format
     */
    String formatCurrency(double number, Locale locale, int minFractionDigits, int maxFractionDigits);

    /**
     * Format a double integer in currency format with the given locale and currency.
     *
     * @param number - the number to be formatted
     * @param locale - the given locale
     * @param minFractionDigits - the minimum number of digits after the decimal separator
     * @param maxFractionDigits - the maximum number of digits after the decimal separator
     * @param currency - the currency used to display the currency string
     * @return a localized number string in currency format
     */
    String formatCurrency(double number, Locale locale, int minFractionDigits, int maxFractionDigits, Currency currency);

    /**
     * Format a BigDecimal in currency format with the default locale.
     */
    String formatCurrency(BigDecimal value);

    /**
     * Format a BigDecimal in currency format with the given locale.
     */
    String formatCurrency(BigDecimal value, Locale locale);

    /**
     * Format a BigDecimal in currency format with the given locale.
     *
     * @param number - the number to be formatted
     * @param locale - the given locale
     * @param minFractionDigits - the minimum number of digits after the decimal separator
     * @param maxFractionDigits - the maximum number of digits after the decimal separator
     * @return a localized number string in currency format
     */
    String formatCurrency(BigDecimal value, Locale locale, int minFractionDigits, int maxFractionDigits);

    /**
     * Format a BigDecimal in currency format with the given locale and currency.
     *
     * @param number - the number to be formatted
     * @param locale - the given locale
     * @param minFractionDigits - the minimum number of digits after the decimal separator
     * @param maxFractionDigits - the maximum number of digits after the decimal separator
     * @param currency - the currency used to display the currency string
     * @return a localized number string in currency format
     */
    String formatCurrency(BigDecimal value, Locale locale, int minFractionDigits, int maxFractionDigits, Currency currency);


    // Parse Date String to Date object with no specific time
    /**
     * Attempt to parse the given String to a Date object where the date is all
     * that is interesting. The time of day will typically be 00:00:00 or
     * undefined.
     *
     * @param date the date String
     * @return the determined Date equivalent
     * @throws DateTimeParseException if a problem occurs parsing the String
     */
    Date parseDate(String date) throws DateTimeParseException;

    /**
     * Attempt to parse the given String to a Date object, assuming the String
     * will match the given style. The date is all that is interesting. The time
     * of day will typically be 00:00:00 or undefined.
     *
     * @param date the date String
     * @param dateStyle the format style to use when parsing
     * @return the determined Date equivalent
     * @throws DateTimeParseException if a problem occurs parsing the String
     */
    Date parseDate(String date, int dateStyle) throws DateTimeParseException;

    /**
     * Attempt to parse the given String to a Date object from the given Locale.
     * The date is all that is interesting. The time of day will typically be
     * 00:00:00 or undefined.
     *
     * @param date the date String
     * @param locale the Locale to use when parsing
     * @return the determined Date equivalent
     * @throws DateTimeParseException if a problem occurs parsing the String
     */
    Date parseDate(String date, Locale locale) throws DateTimeParseException;

    /**
     * Attempt to parse the given String to a Date object from the given Locale,
     * using the given TimeZone. The date is all that is interesting. The time
     * of day will typically be 00:00:00 or undefined.
     *
     * @param date the date String
     * @param locale the Locale to use when parsing
     * @param timeZone the TimeZone to use when parsing
     * @return the determined Date equivalent
     * @throws DateTimeParseException if a problem occurs parsing the String
     */
    Date parseDate(String date, Locale locale, TimeZone timeZone) throws DateTimeParseException;

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
     * @throws DateTimeParseException if a problem occurs parsing the String
     */
    Date parseDate(String date, Locale locale, TimeZone timeZone, int dateStyle) throws DateTimeParseException;

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
     * @throws DateTimeParseException if a problem occurs parsing the String
     */
    Calendar parseDateToCalendar(String date, Locale locale, TimeZone timeZone, int dateStyle)
            throws DateTimeParseException;

    // Parse Time String to Date object of the given Time
    /**
     * Attempt to parse the given String to a Date object where the time of day
     * is all that is interesting. The day, month, and year will be undefined or
     * the fist day of the epoch calendar.
     *
     * @param time the time String
     * @return the determined Date equivalent for the time
     * @throws DateTimeParseException if a problem occurs parsing the String
     */
    Date parseTime(String time) throws DateTimeParseException;

    /**
     * Attempt to parse the given String to a Date object where the time of day
     * is all that is interesting. The day, month, and year will be undefined or
     * the fist day of the epoch calendar.
     *
     * @param time the time String
     * @param timeStyle the format style of the time String (from
     *            java.text.DateFormat)
     * @return the determined Date equivalent for the time
     * @throws DateTimeParseException if a problem occurs parsing the String
     */
    Date parseTime(String time, int timeStyle) throws DateTimeParseException;

    /**
     * Attempt to parse the given String to a Date object where the time of day
     * is all that is interesting. The day, month, and year will be undefined or
     * the fist day of the epoch calendar.
     *
     * @param time the time String
     * @param locale the Locale to use when parsing
     * @return the determined Date equivalent for the time
     * @throws DateTimeParseException if a problem occurs parsing the String
     */
    Date parseTime(String time, Locale locale) throws DateTimeParseException;

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
     * @throws DateTimeParseException if a problem occurs parsing the String
     */
    Date parseTime(String time, Locale locale, TimeZone timeZone) throws DateTimeParseException;

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
     * @throws DateTimeParseException if a problem occurs parsing the String
     */
    Date parseTime(String time, Locale locale, TimeZone timeZone, int timeStyle) throws DateTimeParseException;

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
     * @throws DateTimeParseException if a problem occurs parsing the String
     */
    Calendar parseTimeToCalendar(String time, Locale locale, TimeZone timeZone, int timeStyle)
            throws DateTimeParseException;

    // Parse Date Time String to Date Object with the given time
    /**
     * Attempt to parse the given String to a Date object where the time of day
     * and date are both interesting. A default TimeZone will be used to
     * calibrate the given String to UTC/GMT time on the returned Date object.
     *
     * @param dateTime the time and date String
     * @return the determined Date equivalent
     * @throws DateTimeParseException if a problem occurs parsing the String
     */
    Date parseDateTime(String dateTime) throws DateTimeParseException;

    /**
     * Attempt to parse the given String to a Date object where the time of day
     * and date are both interesting. A default TimeZone will be used to
     * calibrate the given String to UTC/GMT time on the returned Date object.
     *
     * @param dateTime the time and date String
     * @param dateStyle the format style of the date portion of the String
     * @param timeStyle the format style of the time portion of the String
     * @return the determined Date equivalent
     * @throws DateTimeParseException if a problem occurs parsing the String
     */
    Date parseDateTime(String dateTime, int dateStyle, int timeStyle) throws DateTimeParseException;

    /**
     * Attempt to parse the given String to a Date object where the time of day
     * and date are both interesting. A default TimeZone will be used to
     * calibrate the given String to UTC/GMT time on the returned Date object.
     *
     * @param dateTime the time and date String
     * @param locale the Locale to use when parsing
     * @return the determined Date equivalent
     * @throws DateTimeParseException if a problem occurs parsing the String
     */
    Date parseDateTime(String dateTime, Locale locale) throws DateTimeParseException;

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
     * @throws DateTimeParseException if a problem occurs parsing the String
     */
    Date parseDateTime(String dateTime, Locale locale, TimeZone timeZone) throws DateTimeParseException;

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
     * @throws DateTimeParseException if a problem occurs parsing the String
     */
    Date parseDateTime(String dateTime, Locale locale, TimeZone timeZone, int dateStyle, int timeStyle)
            throws DateTimeParseException;

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
     * @throws DateTimeParseException if a problem occurs parsing the String
     */
    Date parseDateTime(String dateTime, Locale locale, TimeZone timeZone, String format) throws DateTimeParseException;

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
     * @throws DateTimeParseException if a problem occurs parsing the String
     */
    Calendar parseDateTimeToCalendar(String dateTime, Locale locale, TimeZone timeZone, int dateStyle,
            int timeStyle) throws DateTimeParseException;

    // Parse a number String to a numeric amount
    /**
     * Attempts to convert a given String to an int value . If the number cannot
     * be deciphered from the String a ParseException is thrown.
     *
     * @param number the localized number String to attempt to parse
     * @return the numeric equivalent
     * @throws ParseException if a problem is encountered
     */
    int parseInt(String number) throws ParseException;

    /**
     * Attempts to convert a given String to a long value . If the number cannot
     * be deciphered from the String a ParseException is thrown.
     *
     * @param number the localized number String to attempt to parse
     * @return the numeric equivalent
     * @throws ParseException if a problem is encountered
     */
    long parseLong(String number) throws ParseException;

    /**
     * Attempts to convert a given String to float value . If the number cannot
     * be deciphered from the String a ParseException is thrown.
     *
     * @param number the localized number String to attempt to parse
     * @return the numeric equivalent
     * @throws ParseException if a problem is encountered
     */
    float parseFloat(String number) throws ParseException;

    /**
     * Attempts to convert a given String to a double value . If the number
     * cannot be deciphered from the String a ParseException is thrown.
     *
     * @param number the localized number String to attempt to parse
     * @return the numeric equivalent
     * @throws ParseException if a problem is encountered
     */
    double parseDouble(String number) throws ParseException;

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
    int parseInt(String number, Locale locale) throws ParseException;

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
    long parseLong(String number, Locale locale) throws ParseException;

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
    float parseFloat(String number, Locale locale) throws ParseException;

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
    double parseDouble(String number, Locale locale) throws ParseException;

    // Parse a BigDecimal String to a BigDecimal amount
    /**
     * Returns a BigDecimal number from the given localized number String.
     *
     * @param number the number String to parse
     * @return a BigDecimal
     * @throws ParseException if number cannot be parsed
     */
    BigDecimal parseBigDecimal(String number) throws ParseException;

    /**
     * Returns a BigDecimal number from the given localized number String and
     * Locale object.
     *
     * @param number the number String to parse
     * @return a BigDecimal
     * @throws ParseException if number cannot be parsed
     */
    BigDecimal parseBigDecimal(String number, Locale locale) throws ParseException;

    /**
     * Returns a BigDecimal number from the given localized number String,
     * Locale object and parseStrict flag.
     *
     * @param number the number String to parse
     * @param locale the Locale object
     * @param strict the flag to indicate if we should parse strictly
     * @return a BigDecimal
     * @throws ParseException if number cannot be parsed
     */
    BigDecimal parseBigDecimal(String number, Locale locale, boolean strict) throws ParseException;

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
    double parsePercent(String percent) throws ParseException;

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
    double parsePercent(String percent, Locale locale) throws ParseException;

    // Parse a Currency String to a BigDecimal amount
    /**
     * Returns a BigDecimal number from the given localized currency String.
     *
     * @param currency the currency String to parse
     * @return a BigDecimal
     * @throws ParseException if currency cannot be parsed
     */
    BigDecimal parseCurrency(String currency) throws ParseException;

    /**
     * Returns a BigDecimal number from the given localized currency String and
     * Locale object.
     *
     * @param currency the currency String to parse
     * @return a BigDecimal
     * @throws ParseException if currency cannot be parsed
     */
    BigDecimal parseCurrency(String currency, Locale locale) throws ParseException;

    /**
     * Returns a short date time format pattern.
     */
    String getShortDateTimeFormatPattern();

    /**
     * Returns a medium date time format pattern.
     */
    String getMediumDateTimeFormatPattern();

    /**
     * Returns a short date format pattern.
     */
    String getShortDateFormatPattern();

    /**
     * Returns a medium date format pattern.
     */
    String getMediumDateFormatPattern();

    /**
     * Returns a long date format pattern.
     */
    String getLongDateFormatPattern();

    /**
     * Returns a medium time format pattern.
     */
    String getMediumTimeFormatPattern();

    /**
     * Returns a short time format pattern.
     */
    String getShortTimeFormatPattern();

    String getNumberFormatPattern();

    String getDecimalSeparator();

    String getGroupingSeparator();

    String getZeroDigit();

    String getPercentFormatPattern();

    String getCurrencyFormatPattern();

    String getCurrencyCode();

    String getCurrencySymbol();
}
