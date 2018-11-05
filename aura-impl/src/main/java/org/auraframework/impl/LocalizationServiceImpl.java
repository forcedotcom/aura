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
import java.text.ParseException;
import java.time.format.DateTimeParseException;
import java.util.Calendar;
import java.util.Currency;
import java.util.Date;
import java.util.Locale;
import java.util.TimeZone;

import org.auraframework.adapter.LocalizationAdapter;
import org.auraframework.annotations.Annotations.ServiceComponent;
import org.auraframework.service.LocalizationService;
import org.auraframework.util.AuraLocale;
import org.auraframework.util.date.DateService;
import org.auraframework.util.date.DateServiceImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import com.ibm.icu.text.DateFormat;
import com.ibm.icu.text.DecimalFormat;
import com.ibm.icu.text.DecimalFormatSymbols;
import com.ibm.icu.text.NumberFormat;
import com.ibm.icu.text.SimpleDateFormat;

/**
 * Default implementation for the Localization Service
 */
@ServiceComponent
@Component("org.auraframework.impl.LocalizationServiceImpl")
public class LocalizationServiceImpl implements LocalizationService {

    protected LocalizationAdapter localizationAdapter;

    // Remove it!!!
    // make pluggable in the future?
    private final DateService dateService = DateServiceImpl.get();

    @Override
    public String formatDate(Date date) {
        return formatDate(date, null, DateFormat.DEFAULT, null);
    }

    @Override
    public String formatDate(Date date, Locale locale, int dateStyle) {
        return formatDate(date, locale, DateFormat.DEFAULT, null);

    }

    @Override
    public String formatDate(Date date, Locale locale, int dateStyle, TimeZone timeZone) {
        if (date == null) {
            return null;
        }

        AuraLocale auraLocale = null;
        if (locale == null) {
            auraLocale = this.localizationAdapter.getAuraLocale();
            locale = auraLocale.getDateLocale();
        }
        if (timeZone == null) {
            if (auraLocale == null) {
                auraLocale = this.localizationAdapter.getAuraLocale();
            }
            timeZone = auraLocale.getTimeZone();
        }

        DateFormat dateFormat = DateFormat.getDateInstance(dateStyle, locale);
        dateFormat.setTimeZone(com.ibm.icu.util.TimeZone.getTimeZone(timeZone.getID()));
        return dateFormat.format(date);
    }

    @Override
    public String formatTime(Date time) {
        return formatTime(time, null, DateFormat.DEFAULT, null);
    }

    @Override
    public String formatTime(Date time, Locale locale, int timeStyle) {
        return formatTime(time, locale, DateFormat.DEFAULT, null);
    }

    @Override
    public String formatTime(Date time, Locale locale, int timeStyle, TimeZone timeZone) {
        AuraLocale auraLocale = this.localizationAdapter.getAuraLocale();
        if (locale == null) {
            locale = auraLocale.getDateLocale();
        }
        if (timeZone == null) {
            timeZone = auraLocale.getTimeZone();
        }

        DateFormat timeFormat = DateFormat.getTimeInstance(timeStyle, locale);
        timeFormat.setTimeZone(com.ibm.icu.util.TimeZone.getTimeZone(timeZone.getID()));
        return timeFormat.format(time);
        // return dateService.getTimeStyleConverter(locale, timeStyle).format(time, timeZone);
    }

    @Override
    public String formatDateTime(Date dateTime) {
        return formatDateTime(dateTime, null, DateFormat.DEFAULT, DateFormat.DEFAULT, null);
    }

    @Override
    public String formatDateTime(Date dateTime, Locale locale, int dateStyle, int timeStyle) {
        return formatDateTime(dateTime, null, dateStyle, timeStyle, null);
    }

    @Override
    public String formatDateTime(Date dateTime, Locale locale, int dateStyle, int timeStyle, TimeZone timeZone) {
        AuraLocale auraLocale = this.localizationAdapter.getAuraLocale();
        if (locale == null) {
            locale = auraLocale.getDateLocale();
        }
        if (timeZone == null) {
            timeZone = auraLocale.getTimeZone();
        }

        DateFormat timeFormat = DateFormat.getDateTimeInstance(dateStyle, timeStyle, locale);
        timeFormat.setTimeZone(com.ibm.icu.util.TimeZone.getTimeZone(timeZone.getID()));
        return timeFormat.format(dateTime);
        //return dateService.getDateTimeStyleConverter(locale, dateStyle, timeStyle).format(dateTime, timeZone);
    }

    @Override
    public String formatNumber(int number) {
        return formatNumber(number, null);
    }

    @Override
    public String formatNumber(int number, Locale locale) {
        if (locale == null) {
            locale = this.localizationAdapter.getAuraLocale().getNumberLocale();
        }
        NumberFormat nf = NumberFormat.getNumberInstance(locale);
        return nf.format(number);
    }

    @Override
    public String formatNumber(long number) {
        return formatNumber(number, null);
    }

    @Override
    public String formatNumber(long number, Locale locale) {
        if (locale == null) {
            locale = this.localizationAdapter.getAuraLocale().getNumberLocale();
        }
        NumberFormat numberFormat = NumberFormat.getNumberInstance(locale);
        return numberFormat.format(number);
    }

    @Override
    public String formatNumber(double number) {
        return formatNumber(number, null);
    }

    @Override
    public String formatNumber(double number, Locale locale) {
        if (locale == null) {
            locale = this.localizationAdapter.getAuraLocale().getNumberLocale();
        }
        NumberFormat nf = NumberFormat.getNumberInstance(locale);
        return nf.format(number);
    }

    @Override
    public String formatNumber(double number, Locale locale, int minFractionDigits, int maxFractionDigits) {
        if (locale == null) {
            locale = this.localizationAdapter.getAuraLocale().getNumberLocale();
        }
        NumberFormat numberFormat = NumberFormat.getNumberInstance(locale);
        numberFormat.setMinimumFractionDigits(minFractionDigits);
        numberFormat.setMaximumFractionDigits(maxFractionDigits);
        return numberFormat.format(number);
    }

    @Override
    public String formatNumber(BigDecimal number) {
        return formatNumber(number, null);
    }

    @Override
    public String formatNumber(BigDecimal number, Locale locale) {
        if (number == null) {
            return null;
        }
        if (locale == null) {
            locale = this.localizationAdapter.getAuraLocale().getNumberLocale();
        }
        NumberFormat numberFormat = NumberFormat.getNumberInstance(locale);
        return numberFormat.format(number);
    }

    @Override
    public String formatNumber(BigDecimal number, Locale locale, int minFractionDigits, int maxFractionDigits) {
        if (number == null) {
            return null;
        }
        if (locale == null) {
            locale = this.localizationAdapter.getAuraLocale().getNumberLocale();
        }
        NumberFormat nf = NumberFormat.getNumberInstance(locale);
        nf.setMinimumFractionDigits(minFractionDigits);
        nf.setMaximumFractionDigits(maxFractionDigits);
        return nf.format(number);
    }

    @Override
    public String formatNumber(Number number) {
        return formatNumber(number, null);
    }

    @Override
    public String formatNumber(Number number, Locale locale) {
        if (number == null) {
            return null;
        }
        if (locale == null) {
            locale = this.localizationAdapter.getAuraLocale().getNumberLocale();
        }
        NumberFormat numberFormat = NumberFormat.getNumberInstance(locale);
        return numberFormat.format(number);
    }

    @Override
    public String formatNumber(Number number, Locale locale, int minFractionDigits, int maxFractionDigits) {
        if (number == null) {
            return null;
        }
        if (locale == null) {
            locale = this.localizationAdapter.getAuraLocale().getNumberLocale();
        }

        NumberFormat numberFormat = NumberFormat.getNumberInstance(locale);
        numberFormat.setMinimumFractionDigits(minFractionDigits);
        numberFormat.setMaximumFractionDigits(maxFractionDigits);
        return numberFormat.format(number);
    }

    @Override
    public String formatPercent(double percent) {
        return formatPercent(percent, null);
    }

    @Override
    public String formatPercent(double percent, Locale locale) {
        if (locale == null) {
            locale = this.localizationAdapter.getAuraLocale().getNumberLocale();
        }
        NumberFormat percentFormat = NumberFormat.getPercentInstance(locale);
        return percentFormat.format(percent);
    }

    @Override
    public String formatPercent(double percent, Locale locale, int minFractionDigits, int maxFractionDigits) {
        if (locale == null) {
            locale = this.localizationAdapter.getAuraLocale().getNumberLocale();
        }
        NumberFormat percentFormat = NumberFormat.getPercentInstance(locale);
        percentFormat.setMinimumFractionDigits(minFractionDigits);
        percentFormat.setMaximumFractionDigits(maxFractionDigits);
        return percentFormat.format(percent);
    }

    @Override
    public String formatCurrency(double currency) {
        return formatCurrency(currency, null);
    }

    @Override
    public String formatCurrency(double currency, Locale locale) {
        if (locale == null) {
            locale = this.localizationAdapter.getAuraLocale().getNumberLocale();
        }

        DecimalFormat currencyFormat = (DecimalFormat) NumberFormat.getCurrencyInstance(locale);
        return currencyFormat.format(currency);
    }

    @Override
    public String formatCurrency(double value, Locale locale, int minFractionDigits, int maxFractionDigits) {
        return formatCurrency(value, locale, minFractionDigits, maxFractionDigits, null);
    }

    @Override
    public String formatCurrency(double value, Locale locale, int minFractionDigits, int maxFractionDigits, Currency currency) {
        if (locale == null) {
            locale = this.localizationAdapter.getAuraLocale().getCurrencyLocale();
        }

        if (currency == null) {
            currency = Currency.getInstance(locale);
        }
        DecimalFormat currencyFormat = (DecimalFormat) NumberFormat.getCurrencyInstance(locale);
        // setCurrency will set fraction digits based on locale so that statement needs to happen before if we
        // want to set fraction digits ourselves
        currencyFormat.setCurrency(com.ibm.icu.util.Currency.fromJavaCurrency(currency));
        currencyFormat.setMinimumFractionDigits(minFractionDigits);
        currencyFormat.setMaximumFractionDigits(maxFractionDigits);
        return currencyFormat.format(value);
    }

    @Override
    public String formatCurrency(BigDecimal currency) {
        return formatCurrency(currency, null);
    }

    @Override
    public String formatCurrency(BigDecimal currency, Locale locale) {
        if (locale == null) {
            locale = this.localizationAdapter.getAuraLocale().getNumberLocale();
        }

        DecimalFormat currencyFormat = (DecimalFormat) NumberFormat.getCurrencyInstance(locale);
        currencyFormat.setParseBigDecimal(true);
        return currencyFormat.format(currency);
    }

    @Override
    public String formatCurrency(BigDecimal value, Locale locale, int minFractionDigits, int maxFractionDigits) {
        return formatCurrency(value, locale, minFractionDigits, maxFractionDigits, null);
    }

    @Override
    public String formatCurrency(BigDecimal value, Locale locale, int minFractionDigits, int maxFractionDigits, Currency currency) {
        if (locale == null) {
            locale = this.localizationAdapter.getAuraLocale().getCurrencyLocale();
        }
        if (currency == null) {
            currency = Currency.getInstance(locale);
        }

        DecimalFormat currencyFormat = (DecimalFormat) NumberFormat.getCurrencyInstance(locale);
        currencyFormat.setParseBigDecimal(true);
        currencyFormat.setCurrency(com.ibm.icu.util.Currency.fromJavaCurrency(currency));
        currencyFormat.setMinimumFractionDigits(minFractionDigits);
        currencyFormat.setMaximumFractionDigits(maxFractionDigits);
        return currencyFormat.format(value);
    }

    @Override
    public Date parseDate(String date) throws DateTimeParseException {
        return parseDate(date, null, null, DateFormat.DEFAULT);
    }

    @Override
    public Date parseDate(String date, int dateStyle) throws DateTimeParseException {
        return parseDate(date, null, null, dateStyle);
    }

    @Override
    public Date parseDate(String date, Locale locale) throws DateTimeParseException {
        return parseDate(date, locale, null, DateFormat.DEFAULT);
    }

    @Override
    public Date parseDate(String date, Locale locale, TimeZone timeZone) throws DateTimeParseException {
        return parseDate(date, locale, timeZone, DateFormat.DEFAULT);
    }

    @Override
    public Date parseDate(String date, Locale locale, TimeZone timeZone, int dateStyle) throws DateTimeParseException {
        if (date == null) {
            return null;
        }
        AuraLocale loc = null;
        if (locale == null) {
            loc = this.localizationAdapter.getAuraLocale();
            locale = loc.getDateLocale();
        }
        if (timeZone == null) {
            if(loc == null) {
                loc = this.localizationAdapter.getAuraLocale();
            }
            timeZone = loc.getTimeZone();
        }
        return dateService.getDateStyleConverter(locale, dateStyle).parse(date, timeZone);
    }

    @Override
    public Calendar parseDateToCalendar(String date, Locale locale, TimeZone timeZone, int dateStyle)
            throws DateTimeParseException {
        if (date == null) {
            return null;
        }
        AuraLocale loc = this.localizationAdapter.getAuraLocale();
        if (locale == null) {
            locale = loc.getDateLocale();
        }
        if (timeZone == null) {
            timeZone = loc.getTimeZone();
        }
        Calendar c = Calendar.getInstance(timeZone, locale);
        c.setTime(parseDate(date, locale, timeZone, dateStyle));
        return c;
    }

    @Override
    public Date parseTime(String time) throws DateTimeParseException {
        return parseTime(time, null, null, DateFormat.DEFAULT);
    }

    @Override
    public Date parseTime(String time, int timeStyle) throws DateTimeParseException {
        return parseTime(time, null, null, timeStyle);
    }

    @Override
    public Date parseTime(String time, Locale locale) throws DateTimeParseException {
        return parseTime(time, locale, null, DateFormat.DEFAULT);
    }

    @Override
    public Date parseTime(String time, Locale locale, TimeZone timeZone) throws DateTimeParseException {
        return parseTime(time, locale, timeZone, DateFormat.DEFAULT);
    }

    @Override
    public Date parseTime(String time, Locale locale, TimeZone timeZone, int timeStyle) throws DateTimeParseException {
        if (time == null) {
            return null;
        }
        AuraLocale loc = this.localizationAdapter.getAuraLocale();
        if (locale == null) {
            locale = loc.getDateLocale();
        }
        if (timeZone == null) {
            timeZone = loc.getTimeZone();
        }
        return dateService.getTimeStyleConverter(locale, timeStyle).parse(time, timeZone);
    }

    @Override
    public Date parseIsoLocalTime(String time) {
        return dateService.getTimeISO8601Converter().parse(time);
    }

    @Override
    public Calendar parseTimeToCalendar(String time, Locale locale, TimeZone timeZone, int timeStyle)
            throws DateTimeParseException {
        if (time == null) {
            return null;
        }
        AuraLocale loc = this.localizationAdapter.getAuraLocale();
        if (locale == null) {
            locale = loc.getDateLocale();
        }
        if (timeZone == null) {
            timeZone = loc.getTimeZone();
        }
        Calendar c = Calendar.getInstance(timeZone, locale);
        c.setTime(parseTime(time, locale, timeZone, timeStyle));
        return c;
    }

    @Override
    public Date parseDateTime(String dateTime) throws DateTimeParseException {
        return parseDateTime(dateTime, null, null, DateFormat.DEFAULT, DateFormat.DEFAULT);
    }

    @Override
    public Date parseDateTime(String dateTime, int dateStyle, int timeStyle) throws DateTimeParseException {
        return parseDateTime(dateTime, null, null, dateStyle, timeStyle);
    }

    @Override
    public Date parseDateTime(String dateTime, Locale locale) throws DateTimeParseException {
        return parseDateTime(dateTime, locale, null, DateFormat.DEFAULT, DateFormat.DEFAULT);
    }

    @Override
    public Date parseDateTime(String dateTime, Locale locale, TimeZone timeZone) throws DateTimeParseException {
        return parseDateTime(dateTime, locale, timeZone, DateFormat.DEFAULT, DateFormat.DEFAULT);
    }

    @Override
    public Date parseDateTime(String dateTime, Locale locale, TimeZone timeZone, int dateStyle, int timeStyle)
            throws DateTimeParseException {
        if (dateTime == null) {
            return null;
        }
        AuraLocale loc = this.localizationAdapter.getAuraLocale();
        if (locale == null) {
            locale = loc.getDateLocale();
        }
        if (timeZone == null) {
            timeZone = loc.getTimeZone();
        }
        return dateService.getDateTimeStyleConverter(locale, dateStyle, timeStyle).parse(dateTime, timeZone);
    }

    @Override
    public Date parseDateTime(String dateTime, Locale locale, TimeZone timeZone, String format) throws DateTimeParseException {
        if (dateTime == null) {
            return null;
        }
        AuraLocale loc = this.localizationAdapter.getAuraLocale();
        if (locale == null) {
            locale = loc.getDateLocale();
        }
        if (timeZone == null) {
            timeZone = loc.getTimeZone();
        }
        return dateService.getPatternConverter(locale, format).parse(dateTime, timeZone);
    }

    @Override
    public Calendar parseDateTimeToCalendar(String dateTime, Locale locale, TimeZone timeZone, int dateStyle,
                                            int timeStyle) throws DateTimeParseException {
        if (dateTime == null) {
            return null;
        }
        AuraLocale loc = this.localizationAdapter.getAuraLocale();
        if (locale == null) {
            locale = loc.getDateLocale();
        }
        if (timeZone == null) {
            timeZone = loc.getTimeZone();
        }
        Calendar c = Calendar.getInstance(timeZone, locale);
        c.setTime(parseDateTime(dateTime, locale, timeZone, dateStyle, timeStyle));
        return c;
    }

    @Override
    public int parseInt(String number) throws ParseException {
        return parseInt(number, null);
    }

    @Override
    public long parseLong(String number) throws ParseException {
        return parseLong(number, null);
    }

    @Override
    public float parseFloat(String number) throws ParseException {
        return parseFloat(number, null);
    }

    @Override
    public double parseDouble(String number) throws ParseException {
        return parseDouble(number, null);
    }

    @Override
    public int parseInt(String number, Locale locale) throws ParseException {
        Number parsedNumber = parseNumber(number, locale);
        double value = parsedNumber.doubleValue();
        if (value >= Integer.MIN_VALUE && value <= Integer.MAX_VALUE) {
            return parsedNumber.intValue();
        }
        throw new ParseException("Unparseable number: \"" + number + "\"", 0);
    }

    @Override
    public long parseLong(String number, Locale locale) throws ParseException {
        Number parsedNumber = parseNumber(number, locale);
        double value = parsedNumber.doubleValue();
        if (value >= Long.MIN_VALUE && value <= Long.MAX_VALUE) {
            return parsedNumber.longValue();
        }
        throw new ParseException("Unparseable number: \"" + number + "\"", 0);
    }

    @Override
    public float parseFloat(String number, Locale locale) throws ParseException {
        Number parsedNumber = parseNumber(number, locale);
        double value = parsedNumber.doubleValue();
        if (value >= Float.MIN_VALUE && value <= Float.MAX_VALUE) {
            return parsedNumber.floatValue();
        }
        throw new ParseException("Unparseable number: \"" + number + "\"", 0);
    }

    @Override
    public double parseDouble(String number, Locale locale) throws ParseException {
        Number parsedNumber = parseNumber(number, locale);
        double value = parsedNumber.doubleValue();
        if (value >= Double.MIN_VALUE && value <= Double.MAX_VALUE) {
            return value;
        }
        throw new ParseException("Unparseable number: \"" + number + "\"", 0);
    }

    /*
     * Parses the given number.
     * 
     * @param number string representation of the number
     * 
     * @locale locate to be used
     * 
     * @return a Number
     */
    private Number parseNumber(String number, Locale locale) throws ParseException {
        if (number == null) {
            throw new ParseException("Parameter 'number' was null", 0);
        }
        if (locale == null) {
            locale = this.localizationAdapter.getAuraLocale().getNumberLocale();
        }
        NumberFormat numberFormat = NumberFormat.getNumberInstance(locale);
        numberFormat.setParseStrict(true);
        return numberFormat.parse(number);
    }

    @Override
    public double parsePercent(String percent) throws ParseException {
        return parsePercent(percent, null);
    }

    @Override
    public double parsePercent(String percent, Locale locale) throws ParseException {
        if (percent == null) {
            throw new ParseException("Parameter 'percent' was null", 0);
        }
        if (locale == null) {
            locale = this.localizationAdapter.getAuraLocale().getNumberLocale();
        }
        NumberFormat numberFormat = NumberFormat.getPercentInstance(locale);
        numberFormat.setParseStrict(true);
        return numberFormat.parse(percent).doubleValue();
    }

    @Override
    public BigDecimal parseCurrency(String currency) throws ParseException {
        return parseCurrency(currency, null);
    }

    @Override
    public BigDecimal parseCurrency(String currency, Locale locale) throws ParseException {
        if (currency == null) {
            return null;
        }
        if (locale == null) {
            locale = this.localizationAdapter.getAuraLocale().getCurrencyLocale();
        }
        DecimalFormat decimalFormat = (DecimalFormat) NumberFormat.getCurrencyInstance(locale);
        decimalFormat.setParseBigDecimal(true);
        decimalFormat.setParseStrict(true);
        return ((com.ibm.icu.math.BigDecimal) decimalFormat.parse(currency)).toBigDecimal();
    }

    @Override
    public BigDecimal parseBigDecimal(String number) throws ParseException {
        return parseBigDecimal(number, null);
    }

    @Override
    public BigDecimal parseBigDecimal(String number, Locale locale) throws ParseException {
        return parseBigDecimal(number, locale, true);
    }

    @Override
    public BigDecimal parseBigDecimal(String number, Locale locale, boolean strict) throws ParseException {
        if (number == null) {
            return null;
        }
        if (locale == null) {
            locale = this.localizationAdapter.getAuraLocale().getNumberLocale();
        }
        DecimalFormat decimalFormat = (DecimalFormat)NumberFormat.getNumberInstance(locale);
        decimalFormat.setParseBigDecimal(true);
        // icu BigDecimal to java BigDecimal
        if (strict) {
            decimalFormat.setParseStrict(strict);
        }
        return ((com.ibm.icu.math.BigDecimal) decimalFormat.parse(number)).toBigDecimal();
    }

    @Override
    public String getShortDateFormatPattern() {
        return this.getDateFormatPattern(DateFormat.SHORT);
    }

    @Override
    public String getMediumDateFormatPattern() {
        return this.getDateFormatPattern(DateFormat.MEDIUM);
    }

    @Override
    public String getLongDateFormatPattern() {
        return this.getDateFormatPattern(DateFormat.LONG);
    }

    @Override
    public String getShortDateTimeFormatPattern() {
        return this.getDateTimeFormatPattern(DateFormat.SHORT);
    }

    @Override
    public String getMediumDateTimeFormatPattern() {
        return this.getDateTimeFormatPattern(DateFormat.MEDIUM);
    }

    @Override
    public String getShortTimeFormatPattern() {
        return this.getTimeFormatPattern(DateFormat.SHORT);
    }

    @Override
    public String getMediumTimeFormatPattern() {
        return this.getTimeFormatPattern(DateFormat.MEDIUM);
    }

    @Override
    public String getNumberFormatPattern() {
        return getDecimalFormatForNumber().toPattern();
    }

    @Override
    public String getDecimalSeparator() {
        DecimalFormatSymbols dfs = getDecimalFormatSymbolsForNumber();
        return String.valueOf(dfs.getDecimalSeparator());
    }

    @Override
    public String getGroupingSeparator() {
        DecimalFormatSymbols dfs = getDecimalFormatSymbolsForNumber();
        return String.valueOf(dfs.getGroupingSeparator());
    }

    @Override
    public String getZeroDigit() {
        DecimalFormatSymbols dfs = getDecimalFormatSymbolsForNumber();
        return String.valueOf(dfs.getZeroDigit());
    }

    @Override
    public String getPercentFormatPattern() {
        AuraLocale auraLocale = this.localizationAdapter.getAuraLocale();
        DecimalFormat pdf = (DecimalFormat) NumberFormat.getPercentInstance(auraLocale.getNumberLocale());
        return pdf.toPattern();
    }

    @Override
    public String getCurrencyFormatPattern() {
        DecimalFormat cdf = getDecimalFormatForCurrency();
        return cdf.toPattern();
    }

    @Override
    public String getCurrencyCode() {
        DecimalFormatSymbols cdfs = getDecimalFormatSymbolsForCurrency();
        com.ibm.icu.util.Currency currency = cdfs.getCurrency();
        return currency != null ? currency.getCurrencyCode() : "";
    }

    @Override
    public String getCurrencySymbol() {
        DecimalFormatSymbols cdfs = getDecimalFormatSymbolsForCurrency();
        return cdfs.getCurrencySymbol();
    }

    private DecimalFormat getDecimalFormatForNumber() {
        AuraLocale auraLocale = this.localizationAdapter.getAuraLocale();
        // Why do we use ICU for numbers and java for Dates ?
        return (DecimalFormat) NumberFormat.getNumberInstance(auraLocale.getNumberLocale());
    }

    private DecimalFormatSymbols getDecimalFormatSymbolsForNumber() {
        DecimalFormat df = getDecimalFormatForNumber();
        return df.getDecimalFormatSymbols();
    }

    private DecimalFormat getDecimalFormatForCurrency() {
        AuraLocale auraLocale = this.localizationAdapter.getAuraLocale();
        return (DecimalFormat) NumberFormat.getCurrencyInstance(auraLocale.getCurrencyLocale());
    }

    private DecimalFormatSymbols getDecimalFormatSymbolsForCurrency() {
        DecimalFormat cdf = getDecimalFormatForCurrency();
        return cdf.getDecimalFormatSymbols();
    }

    private String getDateFormatPattern(int dateStyle) {
        AuraLocale auraLocale = this.localizationAdapter.getAuraLocale();
        DateFormat dateFormat = DateFormat.getDateInstance(dateStyle, auraLocale.getDateLocale());
        return ((SimpleDateFormat) dateFormat).toPattern();
    }

    private String getDateTimeFormatPattern(int dateTimeStyle) {
        AuraLocale auraLocale = this.localizationAdapter.getAuraLocale();
        DateFormat datetimeFormat = DateFormat.getDateTimeInstance(dateTimeStyle, dateTimeStyle, auraLocale.getDateLocale());
        return ((SimpleDateFormat) datetimeFormat).toPattern();
    }

    private String getTimeFormatPattern(int timeStyle) {
        AuraLocale auraLocale = this.localizationAdapter.getAuraLocale();
        DateFormat timeFormat = DateFormat.getTimeInstance(timeStyle, auraLocale.getDateLocale());
        return ((SimpleDateFormat) timeFormat).toPattern();
    }

    @Autowired
    public void setLocalizationAdapter(LocalizationAdapter adapter) {
        this.localizationAdapter = adapter;
    }
}
