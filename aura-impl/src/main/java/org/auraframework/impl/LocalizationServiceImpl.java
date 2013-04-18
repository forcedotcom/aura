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
import java.text.DecimalFormat;
import java.text.NumberFormat;
import java.text.ParseException;
import java.util.Calendar;
import java.util.Currency;
import java.util.Date;
import java.util.Locale;
import java.util.TimeZone;

import org.auraframework.Aura;
import org.auraframework.service.LocalizationService;
import org.auraframework.util.AuraLocale;
import org.auraframework.util.date.DateService;
import org.auraframework.util.date.DateServiceImpl;
import org.auraframework.util.number.AuraNumberFormat;

/**
 * Default implementation for the Localization Service
 */
public class LocalizationServiceImpl implements LocalizationService {

    // make pluggable in the future?
    private final DateService dateService = DateServiceImpl.get();

    /**
     * Used for Serialization to ensure class consistency.
     */
    private static final long serialVersionUID = 9203705220037034653L;

    @Override
    public String formatDate(Date date) {
        return formatDate(date, null, null, DateFormat.DEFAULT);
    }

    @Override
    public String formatDate(Date date, int dateStyle) {
        return formatDate(date, null, null, dateStyle);
    }

    @Override
    public String formatDate(Date date, Locale locale) {
        return formatDate(date, locale, null, DateFormat.DEFAULT);

    }

    @Override
    public String formatDate(Date date, Locale locale, TimeZone timeZone) {
        return formatDate(date, locale, timeZone, DateFormat.DEFAULT);
    }

    @Override
    public String formatDate(Date date, Locale locale, TimeZone timeZone, int dateStyle) {
        if (date == null) {
            return null;
        }
        AuraLocale loc = Aura.getLocalizationAdapter().getAuraLocale();
        if (locale == null) {
            locale = loc.getDateLocale();
        }
        if (timeZone == null) {
            timeZone = loc.getTimeZone();
        }
        return dateService.getDateStyleConverter(locale, dateStyle).format(date, timeZone);
    }

    @Override
    public String formatDate(Calendar cal) {
        return formatDate(cal, DateFormat.DEFAULT);
    }

    @Override
    public String formatDate(Calendar cal, int dateStyle) {
        if (cal == null) {
            return null;
        }
        return formatDate(cal.getTime(), null, cal.getTimeZone(), dateStyle);
    }

    @Override
    public String formatTime(Date time) {
        return formatTime(time, null, null, DateFormat.DEFAULT);
    }

    @Override
    public String formatTime(Date time, int timeStyle) {
        return formatTime(time, null, null, timeStyle);
    }

    @Override
    public String formatTime(Date time, Locale locale) {
        return formatTime(time, locale, null, DateFormat.DEFAULT);
    }

    @Override
    public String formatTime(Date time, Locale locale, TimeZone timeZone) {
        return formatTime(time, locale, timeZone, DateFormat.DEFAULT);
    }

    @Override
    public String formatTime(Date time, Locale locale, TimeZone timeZone, int timeStyle) {
        if (time == null) {
            return null;
        }
        AuraLocale loc = Aura.getLocalizationAdapter().getAuraLocale();
        if (locale == null) {
            locale = loc.getDateLocale();
        }
        if (timeZone == null) {
            timeZone = loc.getTimeZone();
        }
        return dateService.getTimeStyleConverter(locale, timeStyle).format(time, timeZone);
    }

    @Override
    public String formatTime(Calendar cal) {
        return formatTime(cal, DateFormat.DEFAULT);
    }

    @Override
    public String formatTime(Calendar cal, int timeStyle) {
        if (cal == null) {
            return null;
        }
        return formatTime(cal.getTime(), null, cal.getTimeZone(), timeStyle);
    }

    @Override
    public String formatDateTime(Date dateTime) {
        return formatDateTime(dateTime, null, null, DateFormat.DEFAULT, DateFormat.DEFAULT);
    }

    @Override
    public String formatDateTime(Date dateTime, int dateStyle, int timeStyle) {
        return formatDateTime(dateTime, null, null, dateStyle, timeStyle);
    }

    @Override
    public String formatDateTime(Date dateTime, Locale locale) {
        return formatDateTime(dateTime, locale, null, DateFormat.DEFAULT, DateFormat.DEFAULT);
    }

    @Override
    public String formatDateTime(Date dateTime, Locale locale, TimeZone timeZone) {
        return formatDateTime(dateTime, locale, timeZone, DateFormat.DEFAULT, DateFormat.DEFAULT);
    }

    @Override
    public String formatDateTime(Date dateTime, Locale locale, TimeZone timeZone, int dateStyle, int timeStyle) {
        if (dateTime == null) {
            return null;
        }
        AuraLocale loc = Aura.getLocalizationAdapter().getAuraLocale();
        if (locale == null) {
            locale = loc.getDateLocale();
        }
        if (timeZone == null) {
            timeZone = loc.getTimeZone();
        }
        return dateService.getDateTimeStyleConverter(locale, dateStyle, timeStyle).format(dateTime, timeZone);
    }

    @Override
    public String formatDateTime(Date date, Locale locale, TimeZone timeZone, String format) {
        if (date == null) {
            return null;
        }
        AuraLocale loc = Aura.getLocalizationAdapter().getAuraLocale();
        if (locale == null) {
            locale = loc.getDateLocale();
        }
        if (timeZone == null) {
            timeZone = loc.getTimeZone();
        }
        return dateService.getPatternConverter(locale, format).format(date, timeZone);

    }

    @Override
    public String formatDateTime(Calendar cal) {
        return formatDateTime(cal, DateFormat.DEFAULT, DateFormat.DEFAULT);
    }

    @Override
    public String formatDateTime(Calendar cal, int dateStyle, int timeStyle) {
        if (cal == null) {
            return null;
        }
        return formatDateTime(cal.getTime(), null, cal.getTimeZone(), dateStyle, timeStyle);
    }

    @Override
    public String formatNumber(int number) {
        return formatNumber(number, null);
    }

    @Override
    public String formatNumber(long number) {
        return formatNumber(number, null);
    }

    @Override
    public String formatNumber(double number) {
        return formatNumber(number, null);
    }

    @Override
    public String formatNumber(Integer number) {
        return formatNumber(number, null);
    }

    @Override
    public String formatNumber(Long number) {
        return formatNumber(number, null);
    }

    @Override
    public String formatNumber(Double number) {
        return formatNumber(number, null);
    }

    @Override
    public String formatNumber(Double number, int minFractionDigits, int maxFractionDigits) {
        return formatNumber(number, null, minFractionDigits, maxFractionDigits);
    }

    @Override
    public String formatNumber(int number, Locale locale) {
        if (locale == null) {
            locale = Aura.getLocalizationAdapter().getAuraLocale().getNumberLocale();
        }
        NumberFormat nf = NumberFormat.getNumberInstance(locale);
        return nf.format(number);
    }

    @Override
    public String formatNumber(long number, Locale locale) {
        if (locale == null) {
            locale = Aura.getLocalizationAdapter().getAuraLocale().getNumberLocale();
        }
        NumberFormat nf = NumberFormat.getNumberInstance(locale);
        return nf.format(number);
    }

    @Override
    public String formatNumber(double number, Locale locale) {
        if (locale == null) {
            locale = Aura.getLocalizationAdapter().getAuraLocale().getNumberLocale();
        }
        NumberFormat nf = NumberFormat.getNumberInstance(locale);
        return nf.format(number);
    }

    @Override
    public String formatNumber(Integer number, Locale locale) {
        if (number == null) {
            return null;
        }
        return formatNumber(number.intValue(), locale);
    }

    @Override
    public String formatNumber(Long number, Locale locale) {
        if (number == null) {
            return null;
        }
        return formatNumber(number.longValue(), locale);
    }

    @Override
    public String formatNumber(Double number, Locale locale) {
        if (number == null) {
            return null;
        }
        return formatNumber(number.doubleValue(), locale);
    }

    @Override
    public String formatNumber(Double number, Locale locale, int minFractionDigits, int maxFractionDigits) {
        if (number == null) {
            return null;
        }
        if (locale == null) {
            locale = Aura.getLocalizationAdapter().getAuraLocale().getNumberLocale();
        }
        NumberFormat nf = NumberFormat.getNumberInstance(locale);
        nf.setMinimumFractionDigits(minFractionDigits);
        nf.setMaximumFractionDigits(maxFractionDigits);
        return nf.format(number);
    }

    @Override
    public String formatPercent(double percent) {
        return formatPercent(percent, null);
    }

    @Override
    public String formatPercent(double percent, int minFractionDigits, int maxFractionDigits) {
        return formatPercent(percent, null, minFractionDigits, maxFractionDigits);
    }

    @Override
    public String formatPercent(double percent, Locale locale) {
        if (locale == null) {
            locale = Aura.getLocalizationAdapter().getAuraLocale().getNumberLocale();
        }
        NumberFormat nf = NumberFormat.getPercentInstance(locale);
        return nf.format(percent);
    }

    @Override
    public String formatPercent(double percent, Locale locale, int minFractionDigits, int maxFractionDigits) {
        if (locale == null) {
            locale = Aura.getLocalizationAdapter().getAuraLocale().getNumberLocale();
        }
        NumberFormat nf = NumberFormat.getPercentInstance(locale);
        nf.setMinimumFractionDigits(minFractionDigits);
        nf.setMaximumFractionDigits(maxFractionDigits);
        return nf.format(percent);
    }

    @Override
    public String formatCurrency(double currency) {
        return formatCurrency(currency, null);
    }

    @Override
    public String formatCurrency(double currency, int minFractionDigits, int maxFractionDigits) {
        return formatCurrency(currency, null, minFractionDigits, maxFractionDigits);
    }

    @Override
    public String formatCurrency(double currency, Locale locale) {
        if (locale == null) {
            locale = Aura.getLocalizationAdapter().getAuraLocale().getNumberLocale();
        }
        DecimalFormat df = (DecimalFormat) NumberFormat.getCurrencyInstance(locale);
        return df.format(currency);
    }

    @Override
    public String formatCurrency(double value, Locale locale, int minFractionDigits, int maxFractionDigits) {
        return formatCurrency(value, locale, minFractionDigits, maxFractionDigits, null);
    }

    @Override
    public String formatCurrency(double value, Locale locale, int minFractionDigits, int maxFractionDigits,
            Currency currency) {
        if (locale == null) {
            locale = Aura.getLocalizationAdapter().getAuraLocale().getCurrencyLocale();
        }
        if (currency == null) {
            currency = Currency.getInstance(locale);
        }
        DecimalFormat df = (DecimalFormat) NumberFormat.getCurrencyInstance(locale);
        df.setMinimumFractionDigits(minFractionDigits);
        df.setMaximumFractionDigits(maxFractionDigits);
        df.setCurrency(currency);
        return df.format(value);
    }

    @Override
    public String formatCurrency(BigDecimal currency) {
        return formatCurrency(currency, null);
    }

    @Override
    public String formatCurrency(BigDecimal currency, int minFractionDigits, int maxFractionDigits) {
        return formatCurrency(currency, null, minFractionDigits, maxFractionDigits);
    }

    @Override
    public String formatCurrency(BigDecimal currency, Locale locale) {
        if (locale == null) {
            locale = Aura.getLocalizationAdapter().getAuraLocale().getNumberLocale();
        }
        DecimalFormat df = (DecimalFormat) NumberFormat.getCurrencyInstance(locale);
        df.setParseBigDecimal(true);
        return df.format(currency);
    }

    @Override
    public String formatCurrency(BigDecimal value, Locale locale, int minFractionDigits, int maxFractionDigits) {
        return formatCurrency(value, locale, minFractionDigits, maxFractionDigits, null);
    }

    @Override
    public String formatCurrency(BigDecimal value, Locale locale, int minFractionDigits, int maxFractionDigits,
            Currency currency) {
        if (locale == null) {
            locale = Aura.getLocalizationAdapter().getAuraLocale().getCurrencyLocale();
        }
        if (currency == null) {
            currency = Currency.getInstance(locale);
        }
        DecimalFormat df = (DecimalFormat) NumberFormat.getCurrencyInstance(locale);
        df.setParseBigDecimal(true);
        df.setMinimumFractionDigits(minFractionDigits);
        df.setMaximumFractionDigits(maxFractionDigits);
        df.setCurrency(currency);
        return df.format(value);
    }

    @Override
    public Date parseDate(String date) throws ParseException {
        return parseDate(date, null, null, DateFormat.DEFAULT);
    }

    @Override
    public Date parseDate(String date, int dateStyle) throws ParseException {
        return parseDate(date, null, null, dateStyle);
    }

    @Override
    public Date parseDate(String date, Locale locale) throws ParseException {
        return parseDate(date, locale, null, DateFormat.DEFAULT);
    }

    @Override
    public Date parseDate(String date, Locale locale, TimeZone timeZone) throws ParseException {
        return parseDate(date, locale, timeZone, DateFormat.DEFAULT);
    }

    @Override
    public Date parseDate(String date, Locale locale, TimeZone timeZone, int dateStyle) throws ParseException {
        if (date == null) {
            return null;
        }
        AuraLocale loc = Aura.getLocalizationAdapter().getAuraLocale();
        if (locale == null) {
            locale = loc.getDateLocale();
        }
        if (timeZone == null) {
            timeZone = loc.getTimeZone();
        }
        return dateService.getDateStyleConverter(locale, dateStyle).parse(date, timeZone);
    }

    @Override
    public Calendar parseDateToCalendar(String date, Locale locale, TimeZone timeZone, int dateStyle)
            throws ParseException {
        if (date == null) {
            return null;
        }
        AuraLocale loc = Aura.getLocalizationAdapter().getAuraLocale();
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
    public Date parseTime(String time) throws ParseException {
        return parseTime(time, null, null, DateFormat.DEFAULT);
    }

    @Override
    public Date parseTime(String time, int timeStyle) throws ParseException {
        return parseTime(time, null, null, timeStyle);
    }

    @Override
    public Date parseTime(String time, Locale locale) throws ParseException {
        return parseTime(time, locale, null, DateFormat.DEFAULT);
    }

    @Override
    public Date parseTime(String time, Locale locale, TimeZone timeZone) throws ParseException {
        return parseTime(time, locale, timeZone, DateFormat.DEFAULT);
    }

    @Override
    public Date parseTime(String time, Locale locale, TimeZone timeZone, int timeStyle) throws ParseException {
        if (time == null) {
            return null;
        }
        AuraLocale loc = Aura.getLocalizationAdapter().getAuraLocale();
        if (locale == null) {
            locale = loc.getDateLocale();
        }
        if (timeZone == null) {
            timeZone = loc.getTimeZone();
        }
        return dateService.getTimeStyleConverter(locale, timeStyle).parse(time, timeZone);
    }

    @Override
    public Calendar parseTimeToCalendar(String time, Locale locale, TimeZone timeZone, int timeStyle)
            throws ParseException {
        if (time == null) {
            return null;
        }
        AuraLocale loc = Aura.getLocalizationAdapter().getAuraLocale();
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
    public Date parseDateTime(String dateTime) throws ParseException {
        return parseDateTime(dateTime, null, null, DateFormat.DEFAULT, DateFormat.DEFAULT);
    }

    @Override
    public Date parseDateTime(String dateTime, int dateStyle, int timeStyle) throws ParseException {
        return parseDateTime(dateTime, null, null, dateStyle, timeStyle);
    }

    @Override
    public Date parseDateTime(String dateTime, Locale locale) throws ParseException {
        return parseDateTime(dateTime, locale, null, DateFormat.DEFAULT, DateFormat.DEFAULT);
    }

    @Override
    public Date parseDateTime(String dateTime, Locale locale, TimeZone timeZone) throws ParseException {
        return parseDateTime(dateTime, locale, timeZone, DateFormat.DEFAULT, DateFormat.DEFAULT);
    }

    @Override
    public Date parseDateTime(String dateTime, Locale locale, TimeZone timeZone, int dateStyle, int timeStyle)
            throws ParseException {
        if (dateTime == null) {
            return null;
        }
        AuraLocale loc = Aura.getLocalizationAdapter().getAuraLocale();
        if (locale == null) {
            locale = loc.getDateLocale();
        }
        if (timeZone == null) {
            timeZone = loc.getTimeZone();
        }
        return dateService.getDateTimeStyleConverter(locale, dateStyle, timeStyle).parse(dateTime, timeZone);
    }

    @Override
    public Date parseDateTime(String dateTime, Locale locale, TimeZone timeZone, String format) throws ParseException {
        if (dateTime == null) {
            return null;
        }
        AuraLocale loc = Aura.getLocalizationAdapter().getAuraLocale();
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
            int timeStyle) throws ParseException {
        if (dateTime == null) {
            return null;
        }
        AuraLocale loc = Aura.getLocalizationAdapter().getAuraLocale();
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
        if (number == null) {
            throw new ParseException("Parameter 'number' was null", 0);
        }
        if (locale == null) {
            locale = Aura.getLocalizationAdapter().getAuraLocale().getNumberLocale();
        }
        NumberFormat nf = NumberFormat.getInstance(locale);
        return AuraNumberFormat.parseStrict(number, nf).intValue();
    }

    @Override
    public long parseLong(String number, Locale locale) throws ParseException {
        if (number == null) {
            throw new ParseException("Parameter 'number' was null", 0);
        }
        if (locale == null) {
            locale = Aura.getLocalizationAdapter().getAuraLocale().getNumberLocale();
        }
        NumberFormat nf = NumberFormat.getInstance(locale);
        return AuraNumberFormat.parseStrict(number, nf).longValue();
    }

    @Override
    public float parseFloat(String number, Locale locale) throws ParseException {
        if (number == null) {
            throw new ParseException("Parameter 'number' was null", 0);
        }
        if (locale == null) {
            locale = Aura.getLocalizationAdapter().getAuraLocale().getNumberLocale();
        }
        NumberFormat nf = NumberFormat.getInstance(locale);
        return AuraNumberFormat.parseStrict(number, nf).floatValue();
    }

    @Override
    public double parseDouble(String number, Locale locale) throws ParseException {
        if (number == null) {
            throw new ParseException("Parameter 'number' was null", 0);
        }
        if (locale == null) {
            locale = Aura.getLocalizationAdapter().getAuraLocale().getNumberLocale();
        }
        NumberFormat nf = NumberFormat.getInstance(locale);
        return AuraNumberFormat.parseStrict(number, nf).doubleValue();
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
            locale = Aura.getLocalizationAdapter().getAuraLocale().getNumberLocale();
        }
        NumberFormat nf = NumberFormat.getPercentInstance(locale);
        return AuraNumberFormat.parseStrict(percent, nf).doubleValue();
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
            locale = Aura.getLocalizationAdapter().getAuraLocale().getCurrencyLocale();
        }
        DecimalFormat df = (DecimalFormat) NumberFormat.getCurrencyInstance(locale);
        df.setParseBigDecimal(true);
        return (BigDecimal) AuraNumberFormat.parseStrict(currency, df);
    }

    @Override
    public String formatNumber(BigDecimal number) {
        return formatNumber(number, null);
    }

    @Override
    public String formatNumber(BigDecimal number, int minFractionDigits, int maxFractionDigits) {
        return formatNumber(number, null, minFractionDigits, maxFractionDigits);
    }

    @Override
    public String formatNumber(BigDecimal number, Locale locale) {
        if (number == null) {
            return null;
        }
        if (locale == null) {
            locale = Aura.getLocalizationAdapter().getAuraLocale().getNumberLocale();
        }
        NumberFormat nf = NumberFormat.getNumberInstance(locale);
        return nf.format(number);
    }

    @Override
    public String formatNumber(BigDecimal number, Locale locale, int minFractionDigits, int maxFractionDigits) {
        if (number == null) {
            return null;
        }
        if (locale == null) {
            locale = Aura.getLocalizationAdapter().getAuraLocale().getNumberLocale();
        }
        NumberFormat nf = NumberFormat.getNumberInstance(locale);
        nf.setMinimumFractionDigits(minFractionDigits);
        nf.setMaximumFractionDigits(maxFractionDigits);
        return nf.format(number);
    }

    @Override
    public BigDecimal parseBigDecimal(String number) throws ParseException {
        return parseBigDecimal(number, null);
    }

    @Override
    public BigDecimal parseBigDecimal(String number, Locale locale) throws ParseException {
        if (number == null) {
            return null;
        }
        if (locale == null) {
            locale = Aura.getLocalizationAdapter().getAuraLocale().getNumberLocale();
        }
        DecimalFormat df = (DecimalFormat) NumberFormat.getInstance(locale);
        df.setParseBigDecimal(true);
        return new BigDecimal(AuraNumberFormat.parseStrict(number, df).toString());
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
            locale = Aura.getLocalizationAdapter().getAuraLocale().getNumberLocale();
        }
        NumberFormat nf = NumberFormat.getNumberInstance(locale);
        return nf.format(number);
    }

    @Override
    public String formatNumber(Number number, Locale locale, int minFractionDigits, int maxFractionDigits) {
        if (number == null) {
            return null;
        }
        if (locale == null) {
            locale = Aura.getLocalizationAdapter().getAuraLocale().getNumberLocale();
        }

        NumberFormat nf = NumberFormat.getNumberInstance(locale);
        nf.setMinimumFractionDigits(minFractionDigits);
        nf.setMaximumFractionDigits(maxFractionDigits);
        return nf.format(number);
    }

}
