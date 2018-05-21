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
/**
 * @description The Aura Localization Service, accessible using <code>$A.localizationService</code>. Provides utility methods
 * for localizing data or getting formatters for numbers, currencies, dates, etc.
 * @constructor
 * @export
 * @platform
 */
function AuraLocalizationService() {
    this.numberFormat = undefined;
    this.percentFormat = undefined;
    this.currencyFormat = undefined;
    // moment.js must be loaded before we can use date/time related APIs

    this.ZERO = "0";

    this.localeCache = {};

    this.timeZoneFormatCache = {};

    this.cache = {
        format : {},
        strictModeFormat : {}
    };

    // DateTime
    this.dateTimeUnitAlias = {};
    this.ISO_REGEX = /^\s*((?:[+-]\d{6}|\d{4})-(?:\d\d-\d\d|\d\d))(?:(T| )(\d\d(?::\d\d(?::\d\d(?:[.,]\d+)?)?)?)([\+\-]\d\d(?::?\d\d)?|\s*Z)?)?$/;
    this.ISO_REGEX_NO_DASH = /^\s*((?:[+-]\d{6}|\d{4})(?:\d\d\d\d|\d\d))(?:(T| )(\d\d(?:\d\d(?:\d\d(?:[.,]\d+)?)?)?)([\+\-]\d\d(?::?\d\d)?|\s*Z)?)?$/;
    // month/day/year, hour:minute
    this.EN_US_DATETIME_PATTERN = /(\d{1,2})\/(\d{1,2})\/(\d{4})\D+(\d{1,2}):(\d{1,2})/;

    // common time zones which are not supported by Intl API
    this.timeZoneMap = {
        "US/Alaska": "America/Anchorage",
        "US/Aleutian": "America/Adak",
        "US/Arizona": "America/Phoenix",
        "US/Central": "America/Chicago",
        "US/East-Indiana": "America/Fort_Wayne",
        "US/Eastern": "America/New_York",
        "US/Hawaii": "Pacific/Honolulu",
        "US/Indiana-Starke": "America/Indiana/Knox",
        "US/Michigan": "America/Detroit",
        "US/Mountain": "America/Denver",
        "US/Pacific": "America/Los_Angeles",
        "US/Samoa": "Pacific/Pago_Pago",
        "Pacific-New": "America/Los_Angeles"
    };
}

/**
 * Formats a number with the default number format.
 * @param {Number} number - The number to be formatted.
 * @return {Number} The formatted number
 * @memberOf AuraLocalizationService
 * @example
 * var num = 10000;
 * // Returns 10,000
 * var formatted = $A.localizationService.formatNumber(num);
 * @public
 * @export
 * @platform
 */
AuraLocalizationService.prototype.formatNumber = function(number) {
    return this.getDefaultNumberFormat().format(number);
};

/**
 * Returns a formatted percentage number based on the default percentage format.
 * @param {Number} number - The number to be formatted.
 * @return {Number} The formatted percentage
 * @memberOf AuraLocalizationService
 * @example
 * var num = 0.54;
 * // Returns 54%
 * var formatted = $A.localizationService.formatPercent(num);
 * @public
 * @export
 * @platform
 */
AuraLocalizationService.prototype.formatPercent = function(number) {
    return this.getDefaultPercentFormat().format(number);
};

/**
 * Returns a currency number based on the default currency format.
 * @param {Number} number - The currency number to be formatted.
 * @return {Number} The formatted currency
 * @memberOf AuraLocalizationService
 * @example
 * var curr = 123.45;
 * // Returns $123.45
 * $A.localizationService.formatCurrency(curr);
 * @public
 * @export
 * @platform
 */
AuraLocalizationService.prototype.formatCurrency = function(number) {
    return this.getDefaultCurrencyFormat().format(number);
};


/**
 * Returns a NumberFormat object.
 * @param {String} format - The number format. <code>format=".00"</code> displays the number followed by two decimal places.
 * @param {String} symbols
 * @return {Number} The number format
 * @memberOf AuraLocalizationService
 * @example
 * var f = $A.get("$Locale.numberFormat");
 * var num = 10000
 * var nf = $A.localizationService.getNumberFormat(f);
 * var formatted = nf.format(num);
 * // Returns 10,000
 * var formatted = $A.localizationService.formatNumber(num);
 * @public
 * @export
 * @platform
 */
AuraLocalizationService.prototype.getNumberFormat = function(format, symbols) {
    return new Aura.Utils.NumberFormat(format, symbols);
};

/**
 * Returns the default NumberFormat object.
 * @return {Number} The number format returned by <code>$Locale.numberFormat</code>.
 * @memberOf AuraLocalizationService
 * @example
 * // Returns 20,000.123
 * $A.localizationService.getDefaultNumberFormat().format(20000.123);
 * @public
 * @export
 * @platform
 */
AuraLocalizationService.prototype.getDefaultNumberFormat = function() {
    if (!this.numberFormat) {
        this.numberFormat = new Aura.Utils.NumberFormat($A.get("$Locale.numberFormat"));
    }
    return this.numberFormat;
};


/**
 * Returns the default percentage format.
 * @return {Number} The percentage format returned by <code>$Locale.percentFormat</code>.
 * @memberOf AuraLocalizationService
 * @example
 * // Returns 20%
 * $A.localizationService.getDefaultPercentFormat().format(0.20);
 * @public
 * @export
 * @platform
 */
AuraLocalizationService.prototype.getDefaultPercentFormat = function() {
    if (!this.percentFormat) {
        this.percentFormat = new Aura.Utils.NumberFormat($A.get("$Locale.percentFormat"));
    }
    return this.percentFormat;
};

/**
 * Returns the default currency format.
 * @return {Number} The currency format returned by <code>$Locale.currencyFormat</code>.
 * @memberOf AuraLocalizationService
 * @example
 * // Returns $20,000.00
 * $A.localizationService.getDefaultCurrencyFormat().format(20000);
 * @public
 * @export
 * @platform
 */
AuraLocalizationService.prototype.getDefaultCurrencyFormat = function() {
    if (!this.currencyFormat) {
        this.currencyFormat = new Aura.Utils.NumberFormat($A.get("$Locale.currencyFormat"));
    }
    return this.currencyFormat;
};

/**
 * Displays a length of time.
 * @param {Duration} duration - The duration object returned by $A.localizationService.duration
 * @param {Boolean} withSuffix - If true, returns value with the suffix
 * @return {String} a String of a length of time
 * @memberOf AuraLocalizationService
 * @public
 * @example
 * var dur = $A.localizationService.duration(1, 'day');
 * // Returns "a day"
 * var length = $A.localizationService.displayDuration(dur);
 * @export
 * @platform
 */
AuraLocalizationService.prototype.displayDuration = function(duration, withSuffix) {
    if (this.moment["isDuration"](duration)) {
        $A.deprecated("moment Duration object will not be supported in upcoming release.",
                "Use Duration object returned by $A.localizationService.duration()", "AuraLocalizationService.displayDurationInDays");

        return duration["humanize"](withSuffix);
    }

    return duration.displayDuration(withSuffix);
};

/**
 * Displays a length of time in days.
 * @param {Duration} duration - The duration object returned by $A.localizationService.duration
 * @return {Number} The length of time in days.
 * @memberOf AuraLocalizationService
 * @public
 * @example
 * var dur = $A.localizationService.duration(24, 'hour');
 * // Returns 1
 * var length = $A.localizationService.displayDurationInDays(dur);
 * @export
 * @platform
 */
AuraLocalizationService.prototype.displayDurationInDays = function(duration) {
    if (this.moment["isDuration"](duration)) {
        $A.deprecated("moment Duration object will not be supported in upcoming release.",
                "Use Duration object returned by $A.localizationService.duration()", "AuraLocalizationService.displayDurationInDays");

        return duration["asDays"]();
    }

    return duration.asUnit("day");
};

/**
 * Displays a length of time in hours.
 * @param {Duration} duration - The duration object returned by $A.localizationService.duration
 * @return {Number} The length of time in hours.
 * @memberOf AuraLocalizationService
 * @example
 * var dur = $A.localizationService.duration(2, 'day');
 * // Returns 48
 * var length = $A.localizationService.displayDurationInHours(dur);
 * @public
 * @export
 * @platform
 */
AuraLocalizationService.prototype.displayDurationInHours = function(duration) {
    if (this.moment["isDuration"](duration)) {
        $A.deprecated("moment Duration object will not be supported in upcoming release.",
                "Use Duration object returned by $A.localizationService.duration()", "AuraLocalizationService.displayDurationInHours");

        return duration["asHours"]();
    }

    return duration.asUnit("hour");
};

/**
 * Displays a length of time in milliseconds.
 * @param {Duration} duration - The duration object returned by $A.localizationService.duration
 * @return {Number} The length of time in milliseconds.
 * @memberOf AuraLocalizationService
 * @example
 * var dur = $A.localizationService.duration(1, 'hour');
 * // Returns 3600000
 * var length = $A.localizationService.displayDurationInMilliseconds(dur);
 * @public
 * @export
 * @platform
 */
AuraLocalizationService.prototype.displayDurationInMilliseconds = function(duration) {
    if (this.moment["isDuration"](duration)) {
        $A.deprecated("moment Duration object will not be supported in upcoming release.",
                "Use Duration object returned by $A.localizationService.duration()", "AuraLocalizationService.displayDurationInMilliseconds");

        return duration["asMilliseconds"]();
    }

    return duration.asUnit("millisecond");
};

/**
 * Displays a length of time in minutes.
 * @param {Duration} duration - The duration object returned by $A.localizationService.duration
 * @return {Number} The length of time in minutes.
 * @memberOf AuraLocalizationService
 * @example
 * var dur = $A.localizationService.duration(1, 'hour');
 * // Returns 60
 * var length = $A.localizationService.displayDurationInMinutes(dur);
 * @public
 * @export
 * @platform
 */
AuraLocalizationService.prototype.displayDurationInMinutes = function(duration) {
    if (this.moment["isDuration"](duration)) {
        $A.deprecated("moment Duration object will not be supported in upcoming release.",
                "Use Duration object returned by $A.localizationService.duration()", "AuraLocalizationService.displayDurationInMinutes");

        return duration["asMinutes"]();
    }

    return duration.asUnit("minute");
};

/**
 * Displays a length of time in months.
 * @param {Duration} duration - The duration object returned by $A.localizationService.duration
 * @return {Number} The length of time in months.
 * @memberOf AuraLocalizationService
 * @example
 * var dur = $A.localizationService.duration(60, 'day');
 * // Returns 1.971293
 * var length = $A.localizationService.displayDurationInMonths(dur);
 * @public
 * @export
 * @platform
 */
AuraLocalizationService.prototype.displayDurationInMonths = function(duration) {
    if (this.moment["isDuration"](duration)) {
        $A.deprecated("moment Duration object will not be supported in upcoming release.",
                "Use Duration object returned by $A.localizationService.duration()", "AuraLocalizationService.displayDurationInMonths");

        return duration["asMonths"]();
    }

    return duration.asUnit("month");
};

/**
 * Displays a length of time in seconds.
 * @param {Duration} duration - The duration object returned by $A.localizationService.duration
 * @return {Number} The length of time in seconds.
 * @memberOf AuraLocalizationService
 * @example
 * var dur = $A.localizationService.duration(60, 'minutes');
 * // Returns 3600
 * var length = $A.localizationService.displayDurationInSeconds(dur);
 * @public
 * @export
 * @platform
 */
AuraLocalizationService.prototype.displayDurationInSeconds = function(duration) {
    if (this.moment["isDuration"](duration)) {
        $A.deprecated("moment Duration object will not be supported in upcoming release.",
                "Use Duration object returned by $A.localizationService.duration()", "AuraLocalizationService.displayDurationInSeconds");

        return duration["asSeconds"]();
    }

    return duration.asUnit("second");
};

/**
 * Displays a length of time in years.
 * @param {Duration} duration - The duration object returned by $A.localizationService.duration
 * @return {Number} The length of time in years.
 * @memberOf AuraLocalizationService
 * example
 * var dur = $A.localizationService.duration(6, 'month');
 * // Returns 0.5
 * var length = $A.localizationService.displayDurationInYears(dur);
 * @public
 * @export
 * @platform
 */
AuraLocalizationService.prototype.displayDurationInYears = function(duration) {
    if (this.moment["isDuration"](duration)) {
        $A.deprecated("moment Duration object will not be supported in upcoming release.",
                "Use Duration object returned by $A.localizationService.duration()", "AuraLocalizationService.displayDurationInYears");

        return duration["asYears"]();
    }

    return duration.asUnit("year");
};

/**
 * Creates an object representing a length of time.
 * @param {Number} num - The length of time in a given unit
 * @param {String} unit - A datetime unit. The default is milliseconds. Options: years, months, weeks, days, hours, minutes, seconds, milliseconds
 * @return {Object} A duration object
 * @memberOf AuraLocalizationService
 * @example
 * var dur = $A.localizationService.duration(1, 'day');
 * @public
 * @export
 * @platform
 */
AuraLocalizationService.prototype.duration = function(num, unit) {
    return new Aura.Utils.Duration(num, unit, this.moment);
};

/**
 * Formats a date.
 * @param {String|Number|Date} date - A datetime string in ISO8601 format, or a timestamp in milliseconds, or a Date object.
 *   If you provide a String value, use ISO 8601 format to avoid parsing warnings.
 * @param {String} formatString - A string containing tokens to format a date and time. For example, "YYYY-MM-DD" formats 15th January, 2017 as "2017-01-15".
 * 	The default format string comes from the $Locale value provider.
 *  For details on available tokens, see https://developer.salesforce.com/docs/atlas.en-us.lightning.meta/lightning/js_cb_format_dates.htm.
 * @param {String} [locale] - [Deprecated] (optional) Locale value from Locale Value Provider. It falls back to the value in $Locale.langLocale if using unavailable locale. The default value is from $Locale.langLocale.
 * @return {String} A formatted and localized date string
 * @memberOf AuraLocalizationService
 * @example
 * var date = new Date();
 * // Returns date in the format "Oct 9, 2015"
 * $A.localizationService.formatDate(date);
 * @public
 * @export
 * @platform
 */
AuraLocalizationService.prototype.formatDate = function(date, formatString, locale) {
    if (this.moment["isMoment"](date)) {
        $A.deprecated("$A.localizationService.formatDate: 'date' is required to be an ISO 8601 string, or a number, or a Date object. A moment object for the date parameter is not supported.",
                null, "AuraLocalizationService.formatDate(moment)");
    }

    var mDate = this.moment(date);
    if (!mDate || !mDate["isValid"]()) {
        throw { message: "Invalid date value" };
    }

    if (!formatString) { // use default format
        formatString = $A.get("$Locale.dateFormat");
    }

    var langLocale = locale;
    if (locale !== undefined) {
        $A.deprecated("$A.localizationService.formatDate(date, formatString, locale) is deprecated. " +
                "Do NOT rely on the [locale] parameter. It only allows to use the value which is provided " +
                "by Locale Value Provider. It will be removed in an upcoming release.",
                "Use $A.localizationService.formatDate(date, formatString)");

        if (!this.isAvailableLocale(locale)) {
            langLocale = $A.get("$Locale.langLocale");
            $A.warning("AuraLocalizationService.formatDate(): Locale '" + locale + "' is not available. " +
                    "Falls back to the locale in $Locale.langLocale: " + langLocale);
        }
    } else {
        langLocale = $A.get("$Locale.langLocale");
    }

    return this.displayDateTime(mDate, formatString, langLocale);
};

/**
 * Formats a date in UTC.
 * @param {String|Number|Date} date - A datetime string in ISO8601 format, or a timestamp in milliseconds, or a Date object.
 *   If you provide a String value, use ISO 8601 format to avoid parsing warnings.
 * @param {String} formatString - A string containing tokens to format a date and time. For example, "YYYY-MM-DD" formats 15th January, 2017 as "2017-01-15".
 * 	The default format string comes from the $Locale value provider.
 *  For details on available tokens, see https://developer.salesforce.com/docs/atlas.en-us.lightning.meta/lightning/js_cb_format_dates.htm.
 * @param {String} [locale] - [Deprecated] (optional) Locale value from Locale Value Provider. It falls back to the value in $Locale.langLocale if using unavailable locale. The default value is from $Locale.langLocale.
 * @return {String} A formatted and localized date string
 * @memberOf AuraLocalizationService
 * @example
 * var date = new Date();
 * // Returns date in UTC in the format "Oct 9, 2015"
 * $A.localizationService.formatDateUTC(date);
 * @public
 * @export
 * @platform
 */
AuraLocalizationService.prototype.formatDateUTC = function(date, formatString, locale) {
    if (this.moment["isMoment"](date)) {
        $A.deprecated("$A.localizationService.formatDateUTC: 'date' is required to be an ISO 8601 string, or a number, or a Date object. A moment object for the date parameter is not supported.",
                null, "AuraLocalizationService.formatDateUTC(moment)");
    }

    var mDate = this.moment["utc"](date);
    if (!mDate || !mDate["isValid"]()) {
        throw { message: "Invalid date value" };
    }

    if (!formatString) { // use default format
        formatString = $A.get("$Locale.dateFormat");
    }

    var langLocale = locale;
    if (locale !== undefined) {
        $A.deprecated("$A.localizationService.formatDateUTC(date, formatString, locale) is deprecated. " +
                "Do NOT rely on the [locale] parameter. It only allows to use the value which is provided " +
                "by Locale Value Provider. It will be removed in an upcoming release.",
                "Use $A.localizationService.formatDateUTC(date, formatString)");

        if (!this.isAvailableLocale(locale)) {
            langLocale = $A.get("$Locale.langLocale");
            $A.warning("AuraLocalizationService.formatDateUTC(): Locale '" + locale + "' is not available. " +
                    "Falls back to the locale in $Locale.langLocale: " + langLocale);
        }
    } else {
        langLocale = $A.get("$Locale.langLocale");
    }

    return this.displayDateTime(mDate, formatString, langLocale);
};

/**
 * Formats a datetime.
 * @param {String|Number|Date} date - A datetime string in ISO8601 format, or a timestamp in milliseconds, or a Date object.
 *   If you provide a String value, use ISO 8601 format to avoid parsing warnings.
 * @param {String} formatString - A string containing tokens to format a date and time.
 * 	The default format string comes from the $Locale value provider.
 *  For details on available tokens, see https://developer.salesforce.com/docs/atlas.en-us.lightning.meta/lightning/js_cb_format_dates.htm.
 * @param {String} [locale] - [Deprecated] (optional) Locale value from Locale Value Provider. It falls back to the value in $Locale.langLocale if using unavailable locale. The default value is from $Locale.langLocale.
 * @return {String} A formatted and localized datetime string
 * @memberOf AuraLocalizationService
 * @example
 * var date = new Date();
 * // Returns datetime in the format "Oct 9, 2015 9:00:00 AM"
 * $A.localizationService.formatDateTime(date);
 * @public
 * @export
 * @platform
 */
AuraLocalizationService.prototype.formatDateTime = function(date, formatString, locale) {
    if (this.moment["isMoment"](date)) {
        $A.deprecated("$A.localizationService.formatDateTime: 'date' is required to be an ISO 8601 string, or a number, or a Date object. A moment object for the date parameter is not supported.",
                null, "AuraLocalizationService.formatDateTime(moment)");
    }

    var mDate = this.moment(date);
    if (!mDate || !mDate["isValid"]()) {
        throw { message: "Invalid date time value" };
    }

    if (!formatString) { // use default format
        formatString = $A.get("$Locale.datetimeFormat");
    }

    var langLocale = locale;
    if (locale !== undefined) {
        $A.deprecated("$A.localizationService.formatDateTime(date, formatString, locale) is deprecated. " +
                "Do NOT rely on the [locale] parameter. It only allows to use the value which is provided " +
                "by Locale Value Provider. It will be removed in an upcoming release.",
                "Use $A.localizationService.formatDateTime(date, formatString)");

        if (!this.isAvailableLocale(locale)) {
            langLocale = $A.get("$Locale.langLocale");
            $A.warning("AuraLocalizationService.formatDateTime(): Locale '" + locale + "' is not available. " +
                    "Falls back to the locale in $Locale.langLocale: " + langLocale);
        }
    } else {
        langLocale = $A.get("$Locale.langLocale");
    }

    return this.displayDateTime(mDate, formatString, langLocale);
};

/**
 * Formats a datetime in UTC.
 * @param {String|Number|Date} date - A datetime string in ISO8601 format, or a timestamp in milliseconds, or a Date object.
 *   If you provide a String value, use ISO 8601 format to avoid parsing warnings.
 * @param {String} formatString - A string containing tokens to format a date and time.
 * 	The default format string comes from the $Locale value provider.
 *  For details on available tokens, see https://developer.salesforce.com/docs/atlas.en-us.lightning.meta/lightning/js_cb_format_dates.htm.
 * @param {String} [locale] - [Deprecated] (optional) Locale value from Locale Value Provider. It falls back to the value in $Locale.langLocale if using unavailable locale. The default value is from $Locale.langLocale.
 * @return {String} A formatted and localized datetime string
 * @example
 * var date = new Date();
 * // Returns datetime in UTC in the format "Oct 9, 2015 4:00:00 PM"
 * $A.localizationService.formatDateTimeUTC(date);
 * @public
 * @export
 * @platform
 */
AuraLocalizationService.prototype.formatDateTimeUTC = function(date, formatString, locale) {
    if (this.moment["isMoment"](date)) {
        $A.deprecated("$A.localizationService.formatDateTimeUTC: 'date' is required to be an ISO 8601 string, or a number, or a Date object. A moment object for the date parameter is not supported.",
                null, "AuraLocalizationService.formatDateTimeUTC(moment)");
    }

    var mDate = this.moment["utc"](date);
    if (!mDate || !mDate["isValid"]()) {
        throw { message: "Invalid date time value" };
    }

    if (!formatString) { // use default format
        formatString = $A.get("$Locale.datetimeFormat");
    }

    var langLocale = locale;
    if (locale !== undefined) {
        $A.deprecated("$A.localizationService.formatDateTimeUTC(date, formatString, locale) is deprecated. " +
                "Do NOT rely on the [locale] parameter. It only allows to use the value which is provided " +
                "by Locale Value Provider. It will be removed in an upcoming release.",
                "Use $A.localizationService.formatDateTimeUTC(date, formatString)");

        if (!this.isAvailableLocale(locale)) {
            langLocale = $A.get("$Locale.langLocale");
            $A.warning("AuraLocalizationService.formatDateTimeUTC(): Locale '" + locale + "' is not available. " +
                    "Falls back to the locale in $Locale.langLocale: " + langLocale);
        }
    } else {
        langLocale = $A.get("$Locale.langLocale");
    }

    return this.displayDateTime(mDate, formatString, langLocale);
};

/**
 * Formats a time.
 * @param {String|Number|Date} date - A datetime string in ISO8601 format, or a timestamp in milliseconds, or a Date object.
 *   If you provide a String value, use ISO 8601 format to avoid parsing warnings.
 * @param {String} formatString - A string containing tokens to format a time.
 * 	The default format string comes from the $Locale value provider.
 *  For details on available tokens, see https://developer.salesforce.com/docs/atlas.en-us.lightning.meta/lightning/js_cb_format_dates.htm.
 * @param {String} [locale] - [Deprecated] (optional) Locale value from Locale Value Provider. It falls back to the value in $Locale.langLocale if using unavailable locale. The default value is from $Locale.langLocale.
 * @return {String} A formatted and localized time string
 * @memberOf AuraLocalizationService
 * @example
 * var date = new Date();
 * // Returns a date in the format "9:00:00 AM"
 * var now = $A.localizationService.formatTime(date);
 * @public
 * @export
 * @platform
 */
AuraLocalizationService.prototype.formatTime = function(date, formatString, locale) {
    if (this.moment["isMoment"](date)) {
        $A.deprecated("$A.localizationService.formatTime: 'date' is required to be an ISO 8601 string, or a number, or a Date object. A moment object for the date parameter is not supported.",
                null, "AuraLocalizationService.formatTime(moment)");
    }

    var mDate = this.moment(date);
    if (!mDate || !mDate["isValid"]()) {
        throw { message: "Invalid time value" };
    }

    if (!formatString) { // use default format
        formatString = $A.get("$Locale.timeFormat");
    }

    var langLocale = locale;
    if (locale !== undefined) {

        if (!this.isAvailableLocale(locale)) {
            // temporarily suppress the warning if data is available due to perf issue W-4311258
            // enable it once we have alternative solution for format date in user locale
            $A.deprecated("$A.localizationService.formatTime(date, formatString, locale) is deprecated. " +
                    "Do NOT rely on the [locale] parameter. It only allows to use the value which is provided " +
                    "by Locale Value Provider. It will be removed in an upcoming release.",
                    "Use $A.localizationService.formatTime(date, formatString)");

            langLocale = $A.get("$Locale.langLocale");
            $A.warning("AuraLocalizationService.formatTime(): Locale '" + locale + "' is not available. " +
                    "Falls back to the locale in $Locale.langLocale: " + langLocale);
        }
    } else {
        langLocale = $A.get("$Locale.langLocale");
    }

    return this.displayDateTime(mDate, formatString, langLocale);
};

/**
 * Formats a time in UTC.
 * @param {String|Number|Date} date - A datetime string in ISO8601 format, or a timestamp in milliseconds, or a Date object.
 *   If you provide a String value, use ISO 8601 format to avoid parsing warnings.
 * @param {String} formatString - A string containing tokens to format a time.
 * 	The default format string comes from the $Locale value provider.
 *  For details on available tokens, see https://developer.salesforce.com/docs/atlas.en-us.lightning.meta/lightning/js_cb_format_dates.htm.
 * @param {String} [locale] - [Deprecated] (optional) Locale value from Locale Value Provider. It falls back to the value in $Locale.langLocale if using unavailable locale. The default value is from $Locale.langLocale.
 * @return {String} a formatted and localized time string
 * @memberOf AuraLocalizationService
 * @example
 * var date = new Date();
 * // Returns time in UTC in the format "4:00:00 PM"
 * $A.localizationService.formatTimeUTC(date);
 * @public
 * @export
 * @platform
 */
AuraLocalizationService.prototype.formatTimeUTC = function(date, formatString, locale) {
    if (this.moment["isMoment"](date)) {
        $A.deprecated("$A.localizationService.formatTimeUTC: 'date' is required to be an ISO 8601 string, or a number, or a Date object. A moment object for the date parameter is not supported.",
                null, "AuraLocalizationService.formatTimeUTC(moment)");
    }

    var mDate = this.moment["utc"](date);
    if (!mDate || !mDate["isValid"]()) {
        throw { message: "Invalid time value" };
    }

    if (!formatString) { // use default format
        formatString = $A.get("$Locale.timeFormat");
    }

    var langLocale = locale;
    if (locale !== undefined) {

        if (!this.isAvailableLocale(locale)) {
            // temporarily suppress the warning if data is available due to perf issue W-4311258.
            // enable it once we have alternative solution for format datetime in user locale.
            $A.deprecated("$A.localizationService.formatTimeUTC(date, formatString, locale) is deprecated. " +
                    "Do NOT rely on the [locale] parameter. It only allows to use the value which is provided " +
                    "by Locale Value Provider. It will be removed in an upcoming release.",
                    "Use $A.localizationService.formatTimeUTC(date, formatString)");

            langLocale = $A.get("$Locale.langLocale");
            $A.warning("AuraLocalizationService.formatTimeUTC(): Locale '" + locale + "' is not available. " +
                    "Falls back to the locale in $Locale.langLocale: " + langLocale);
        }
    } else {
        langLocale = $A.get("$Locale.langLocale");
    }

    return this.displayDateTime(mDate, formatString, langLocale);
};

/**
 * Gets the number of days in a duration.
 * @param {Duration} duration - The duration object returned by $A.localizationService.duration
 * @return {Number} The number of days in duration.
 * @memberOf AuraLocalizationService
 * @example
 * var dur = $A.localizationService.duration(48, 'hour');
 * // Returns 2, the number of days for the given duration
 * $A.localizationService.getDaysInDuration(dur);
 * @public
 * @export
 * @platform
 */
AuraLocalizationService.prototype.getDaysInDuration = function(duration) {
    if (this.moment["isDuration"](duration)) {
        $A.deprecated("moment Duration object will not be supported in upcoming release.",
                "Use Duration object returned by $A.localizationService.duration()", "AuraLocalizationService.getDaysInDuration");

        return duration["days"]();
    }

    return duration.getUnit("day");
};

/**
 * Gets the number of hours in a duration.
 * @param {Duration} duration - The duration object returned by $A.localizationService.duration
 * @return {Number} The number of hours in duration.
 * @memberOf AuraLocalizationService
 * @example
 * var dur = $A.localizationService.duration(60, 'minute');
 * // Returns 1, the number of hours in the given duration
 * $A.localizationService.getHoursInDuration(dur);
 * @public
 * @export
 * @platform
 */
AuraLocalizationService.prototype.getHoursInDuration = function(duration) {
    if (this.moment["isDuration"](duration)) {
        $A.deprecated("moment Duration object will not be supported in upcoming release.",
                "Use Duration object returned by $A.localizationService.duration()", "AuraLocalizationService.getHoursInDuration");

        return duration["hours"]();
    }

    return duration.getUnit("hour");
};

/**
 * Gets the number of milliseconds in a duration.
 * @param {Duration} duration - The duration object returned by $A.localizationService.duration
 * @return {Number} The number of milliseconds in duration.
 * @memberOf AuraLocalizationService
 * @public
 * @export
 * @platform
 */
AuraLocalizationService.prototype.getMillisecondsInDuration = function(duration) {
    if (this.moment["isDuration"](duration)) {
        $A.deprecated("moment Duration object will not be supported in upcoming release.",
                "Use Duration object returned by $A.localizationService.duration()", "AuraLocalizationService.getMillisecondsInDuration");

        return duration["milliseconds"]();
    }

    return duration.getUnit("millisecond");
};

/**
 * Gets the number of minutes in a duration.
 * @param {Duration} duration - The duration object returned by $A.localizationService.duration
 * @return {Number} The number of minutes in duration.
 * @memberOf AuraLocalizationService
 * @example
 * var dur = $A.localizationService.duration(60, 'second');
 * // Returns 1, the number of minutes in the given duration
 * $A.localizationService.getMinutesInDuration(dur);
 * @public
 * @export
 * @platform
 */
AuraLocalizationService.prototype.getMinutesInDuration = function(duration) {
    if (this.moment["isDuration"](duration)) {
        $A.deprecated("moment Duration object will not be supported in upcoming release.",
                "Use Duration object returned by $A.localizationService.duration()", "AuraLocalizationService.getMillisecondsInDuration");

        return duration["minutes"]();
    }

    return duration.getUnit("minute");
};

/**
 * Gets the number of months in a duration.
 * @param {Duration} duration - The duration object returned by $A.localizationService.duration
 * @return {Number} The number of months in duration.
 * @memberOf AuraLocalizationService
 * @example
 * var dur = $A.localizationService.duration(70, 'day');
 * // Returns 2, the number of months in the given duration
 * $A.localizationService.getMonthsInDuration(dur);
 * @public
 * @export
 * @platform
 */
AuraLocalizationService.prototype.getMonthsInDuration = function(duration) {
    if (this.moment["isDuration"](duration)) {
        $A.deprecated("moment Duration object will not be supported in upcoming release.",
                "Use Duration object returned by $A.localizationService.duration()", "AuraLocalizationService.getMonthsInDuration");

        return duration["months"]();
    }

    return duration.getUnit("month");
};

/**
 * Gets the number of seconds in a duration.
 * @param {Duration} duration - The duration object returned by $A.localizationService.duration
 * @return {Number} The number of seconds in duration.
 * @memberOf AuraLocalizationService
 * @example
 * var dur = $A.localizationService.duration(3000, 'millisecond');
 * // Returns 3
 * $A.localizationService.getSecondsInDuration(dur);
 * @public
 * @export
 * @platform
 */
AuraLocalizationService.prototype.getSecondsInDuration = function(duration) {
    if (this.moment["isDuration"](duration)) {
        $A.deprecated("moment Duration object will not be supported in upcoming release.",
                "Use Duration object returned by $A.localizationService.duration()", "AuraLocalizationService.getSecondsInDuration");

        return duration["seconds"]();
    }

    return duration.getUnit("second");
};

/**
 * Gets the number of years in a duration.
 * @param {Duration} duration - The duration object returned by $A.localizationService.duration
 * @return {Number} The number of years in duration.
 * @memberOf AuraLocalizationService
 * @example
 * var dur = $A.localizationService.duration(24, 'month');
 * // Returns 2
 * $A.localizationService.getYearsInDuration(dur);
 * @public
 * @export
 * @platform
 */
AuraLocalizationService.prototype.getYearsInDuration = function(duration) {
    if (this.moment["isDuration"](duration)) {
        $A.deprecated("moment Duration object will not be supported in upcoming release.",
                "Use Duration object returned by $A.localizationService.duration()", "AuraLocalizationService.getYearsInDuration");

        return duration["years"]();
    }

    return duration.getUnit("year");
};

/**
 * Get the date time related labels (month name, weekday name, am/pm etc.).
 * @return {Object} the localized label set.
 * @memberOf AuraLocalizationService
 * @deprecated
 * @public
 * @export
 * @platform
 */
AuraLocalizationService.prototype.getLocalizedDateTimeLabels = function() {
    $A.deprecated("$A.localizationService.getLocalizedDateTimeLabels(): The labels from this method are no longer supported. This method will be removed in an upcoming release.",
            null, "AuraLocalizationService.getLocalizedDateTimeLabels");

    var langLocale = $A.get("$Locale.langLocale");
    var l = this.getAvailableMomentLocale(langLocale);
    return this.moment["localeData"](l);
};

/**
 * Get today's date based on a time zone.
 * @param {String} timezone - A time zone id based on the java.util.TimeZone class, for example, America/Los_Angeles
 * @param {Function} callback - A function to be called after the "today" value is obtained
 * @return {String} the ISO8601 date string (yyyy-MM-dd).
 * @memberOf AuraLocalizationService
 * @public
 * @export
 * @platform
 */
AuraLocalizationService.prototype.getToday = function(timezone, callback) {
    this.getDateStringBasedOnTimezone(timezone, new Date(), callback);
};


/**
 * Get the date's date string based on a time zone.
 * @param {String} timeZone - A time zone id based on the java.util.TimeZone class, for example, America/Los_Angeles
 * @param {Date} date - A Date object
 * @param {Function} callback - A function to be called after the date string is obtained
 * @memberOf AuraLocalizationService
 * @example
 * var timezone = $A.get("$Locale.timezone");
 * var date = new Date();
 * // Returns the date string in the format "2015-10-9"
 * $A.localizationService.getDateStringBasedOnTimezone(timezone, date, function(today){
 *    console.log(today);
 * });
 * @public
 * @export
 * @platform
 */
AuraLocalizationService.prototype.getDateStringBasedOnTimezone = function(timeZone, date, callback) {
    $A.assert(date instanceof Date, "AuraLocalizationService.getDateStringBasedOnTimezone(): 'date' must be a Date object.");
    $A.assert(typeof callback === "function", "AuraLocalizationService.getDateStringBasedOnTimezone(): 'callback' must be a function.");

    if (!this.isValidDate(date)) {
        return callback("Invalid Date");
    }

    if (!timeZone) {
        timeZone = $A.get("$Locale.timezone");
    }

    var dateTimeString = this.formatDateWithTimeZone(date, timeZone);
    var match = this.EN_US_DATETIME_PATTERN.exec(dateTimeString);

    callback(match[3] + "-" + match[1] + "-" + match[2]);
};

/**
 * A utility function to check if a datetime pattern string uses a 24-hour or period (12 hour with am/pm) time view.
 * @param {String} pattern - datetime pattern string
 * @return {Boolean} Returns true if it uses period time view.
 * @memberOf AuraLocalizationService
 * @public
 * @export
 * @platform
 */
AuraLocalizationService.prototype.isPeriodTimeView = function(pattern) {
    $A.deprecated("$A.localizationService.isPeriodTimeView(): The method is no longer supported by framework, and will be removed in an upcoming release.",
            null, "AuraLocalizationService.isPeriodTimeView");

    if (typeof pattern !== "string") {
        return false;
    }
    var shouldEscape = false;
    for (var i = 0; i < pattern.length; i++) {
        var c = pattern.charAt(i);
        if (c === 'h' && shouldEscape === false) {
            return true;
        }
        if (c === '[') {
            shouldEscape = true;
        } else if (c === ']') {
            shouldEscape = false;
        }
    }
    return false;
};

/**
 * Checks if date1 is after date2.
 * @param {String|Number|Date} date1 - A datetime string in ISO8601 format, or a timestamp in milliseconds, or a Date object.
 * @param {String|Number|Date} date2 - A datetime string in ISO8601 format, or a timestamp in milliseconds, or a Date object.
 * @param {String} unit - A datetime unit. The default is millisecond. Options: year, month, week, day, hour, minute, second, millisecond.
 * @return {Boolean} Returns true if date1 is after date2, or false otherwise.
 * @memberOf AuraLocalizationService
 * @example
 * var date = new Date();
 * var day = $A.localizationService.endOf(date, 'day');
 * // Returns false, since date is before day
 * $A.localizationService.isAfter(date, day);
 * @public
 * @export
 * @platform
 */
AuraLocalizationService.prototype.isAfter = function(date1, date2, unit) {
    var normalizedDate1 = this.normalizeDateTimeInput(date1);
    var normalizedDate2 = this.normalizeDateTimeInput(date2);

    if (!this.isValidDate(normalizedDate1) || !this.isValidDate(normalizedDate2)) {
        return false;
    }

    unit = this.normalizeDateTimeUnit(unit) || "millisecond";

    if (unit === "millisecond") {
        return normalizedDate1.getTime() > normalizedDate2.getTime();
    } else {
        return this.startOf(normalizedDate1, unit).getTime() > this.startOf(normalizedDate2, unit).getTime();
    }
};

/**
 * Checks if date1 is before date2.
 * @param {String|Number|Date} date1 - A datetime string in ISO8601 format, or a timestamp in milliseconds, or a Date object.
 * @param {String|Number|Date} date2 - A datetime string in ISO8601 format, or a timestamp in milliseconds, or a Date object.
 * @param {String} unit - A datetime unit. The default is millisecond. Options: year, month, week, day, hour, minute, second, millisecond.
 * @return {Boolean} Returns true if date1 is before date2, or false otherwise.
 * @memberOf AuraLocalizationService
 * @example
 * var date = new Date();
 * var day = $A.localizationService.endOf(date, 'day');
 * // Returns true, since date is before day
 * $A.localizationService.isBefore(date, day);
 * @public
 * @export
 * @platform
 */
AuraLocalizationService.prototype.isBefore = function(date1, date2, unit) {
    var normalizedDate1 = this.normalizeDateTimeInput(date1);
    var normalizedDate2 = this.normalizeDateTimeInput(date2);

    if (!this.isValidDate(normalizedDate1) || !this.isValidDate(normalizedDate2)) {
        return false;
    }

    unit = this.normalizeDateTimeUnit(unit) || "millisecond";

    if (unit === "millisecond") {
        return normalizedDate1.getTime() < normalizedDate2.getTime();
    } else {
        return this.startOf(normalizedDate1, unit).getTime() < this.startOf(normalizedDate2, unit).getTime();
    }
};

/**
 * Checks if date1 is the same as date2.
 * @param {String|Number|Date} date1 - A datetime string in ISO8601 format, or a timestamp in milliseconds, or a Date object.
 * @param {String|Number|Date} date2 - A datetime string in ISO8601 format, or a timestamp in milliseconds, or a Date object.
 * @param {String} unit - A datetime unit. The default is millisecond. Options: year, month, week, day, hour, minute, second, millisecond.
 * @return {Boolean} Returns true if date1 is the same as date2, or false otherwise.
 * @memberOf AuraLocalizationService
 * @example
 * var date = new Date();
 * var day = $A.localizationService.endOf(date, 'day');
 * // Returns false
 * $A.localizationService.isSame(date, day, 'hour');
 * // Returns true
 * $A.localizationService.isSame(date, day, 'day');
 * @public
 * @export
 * @platform
 */
AuraLocalizationService.prototype.isSame = function(date1, date2, unit) {
    var normalizedDate1 = this.normalizeDateTimeInput(date1);
    var normalizedDate2 = this.normalizeDateTimeInput(date2);

    if (!this.isValidDate(normalizedDate1) || !this.isValidDate(normalizedDate2)) {
        return false;
    }

    unit = this.normalizeDateTimeUnit(unit) || "millisecond";
    if (unit === "millisecond") {
        return normalizedDate1.getTime() === normalizedDate2.getTime();
    } else {
        return this.startOf(normalizedDate1, unit).getTime() === this.startOf(normalizedDate2, unit).getTime();
    }
};

/**
 * Checks if a date is between two other dates (fromDate and toDate), where the match is inclusive.
 * @param {String|Number|Date} date - A datetime string in ISO8601 format, or a timestamp in milliseconds, or a Date object.
 * @param {String|Number|Date} fromDate - A datetime string in ISO8601 format, or a timestamp in milliseconds, or a Date object.
 * @param {String|Number|Date} toDate - A datetime string in ISO8601 format, or a timestamp in milliseconds, or a Date object.
 * @param {String} unit - A datetime unit. The default is millisecond. Options: year, month, week, day, hour, minute, second, millisecond.
 * @return {Boolean} Returns true if date is between fromDate and toDate, or false otherwise.
 * @memberOf AuraLocalizationService
 * @example
 * $A.localizationService.isBetween("2017-03-07","March 7, 2017", "12/1/2017")
 * // Returns true
 * $A.localizationService.isBetween("2017-03-07 12:00", "March 7, 2017 15:00", "12/1/2017")
 * // Returns false
 * $A.localizationService.isBetween("2017-03-07 12:00", "March 7, 2017 15:00", "12/1/2017", "day")
 * // Returns true
 * @public
 * @export
 * @platform
 */
AuraLocalizationService.prototype.isBetween = function(date, fromDate, toDate, unit) {
    return !this.isBefore(date, fromDate, unit) && !this.isAfter(date, toDate, unit);
};

/**
 * Parses a string to a JavaScript Date.
 * @param {String} dateTimeString - The datetime string to be parsed.
 * @param {String} parseFormat - A Java format string which is used to parse datetime. The default is from LocaleValueProvider.
 * @param {String} [locale] - [Deprecated] (optional) Locale value from Locale Value Provider. It falls back to the value in $Locale.langLocale if using unavailable locale. The default value is from $Locale.langLocale.
 * @param {Boolean} [strictParsing] - (optional) Set to true to turn off forgiving parsing and use strict validation.
 * @return {Date} A JavaScript Date object, or null if dateTimeString is invalid
 * @memberOf AuraLocalizationService
 * @public
 * @export
 * @platform
 */
AuraLocalizationService.prototype.parseDateTime = function(dateTimeString, parseFormat, locale, strictParsing) {
    if (!dateTimeString) {
        return null;
    }

    var langLocale = locale;
    // recommended signature
    if (typeof locale === 'boolean') {
        strictParsing = locale;
        langLocale = $A.get("$Locale.langLocale");
    } else if (locale !== undefined || strictParsing !== undefined) {
        $A.deprecated("$A.localizationService.parseDateTime(dateTimeString, parseFormat, locale, strictParsing) is deprecated. " +
                "Do NOT rely on the [locale] parameter. It only allows to use the value which is provided " +
                "by Locale Value Provider. It will be removed in an upcoming release.",
                "Use $A.localizationService.parseDateTime(dateTimeString, parseFormat, strictParsing)");

        if (locale && !this.isAvailableLocale(locale)) {
            langLocale = $A.get("$Locale.langLocale");
            $A.warning("AuraLocalizationService.parseDateTime(): Locale '" + locale + "' is not available. " +
                    "Falls back to the locale in $Locale.langLocale: " + langLocale);
        }
    }

    if (!langLocale) {
        langLocale = $A.get("$Locale.langLocale");
    }

    var format = strictParsing ? this.getStrictModeFormat(parseFormat) : this.getNormalizedFormat(parseFormat);
    var value = strictParsing ? this.getStrictModeDateTimeString(dateTimeString) : dateTimeString;
    var mDate = this.moment(value, format, this.getAvailableMomentLocale(langLocale), strictParsing);
    if (!mDate || !mDate["isValid"]()) {
        return null;
    }

    return mDate["toDate"]();
};

/**
 * Parses a date time string in an ISO-8601 format.
 * @param {String} dateTimeString - The datetime string in an ISO-8601 format.
 * @return {Date} A JavaScript Date object, or null if dateTimeString is invalid.
 * @memberOf AuraLocalizationService
 * @public
 * @export
 * @platform
 */
AuraLocalizationService.prototype.parseDateTimeISO8601 = function(dateTimeString) {
    if (!dateTimeString) {
        return null;
    }

    if (!this.isISO8601DateTimeString(dateTimeString)) {
        $A.warning("LocalizationService.parseDateTimeISO8601: The provided datetime string is not in ISO8601 format. " +
                "This method will return null for non-ISO8601 format string in upcoming release. " + dateTimeString);
    }

    var mDate = this.moment(dateTimeString);
    if (mDate && mDate["isValid"]()) {
        return mDate["toDate"]();
    }
    return null;
};

/**
 * Parses a string to a JavaScript Date in UTC.
 * @param {String} dateTimeString - The datetime string to be parsed
 * @param {String} parseFormat - A Java format string which is used to parse datetime. The default is from LocaleValueProvider.
 * @param {String} [locale] - [Deprecated] (optional) Locale value from Locale Value Provider. It falls back to the value in $Locale.langLocale if using unavailable locale. The default value is from $Locale.langLocale.
 * @param {Boolean} [strictParsing] - (optional) Set to true to turn off forgiving parsing and use strict validation.
 * @return {Date} A JavaScript Date object, or null if dateTimeString is invalid
 * @memberOf AuraLocalizationService
 * @example
 * var date = "2015-10-9";
 * // Returns "Thu Oct 08 2015 17:00:00 GMT-0700 (PDT)"
 * $A.localizationService.parseDateTimeUTC(date);
 * @public
 * @export
 * @platform
 */
AuraLocalizationService.prototype.parseDateTimeUTC = function(dateTimeString, parseFormat, locale, strictParsing) {
    if (!dateTimeString) {
        return null;
    }

    var langLocale = locale;
    // recommended signature
    if (typeof locale === 'boolean') {
        strictParsing = locale;
        langLocale = $A.get("$Locale.langLocale");
    } else if (locale !== undefined || strictParsing !== undefined) {
        $A.deprecated("$A.localizationService.parseDateTimeUTC(dateTimeString, parseFormat, locale, strictParsing) is deprecated. " +
                "Do NOT rely on the [locale] parameter. It only allows to use the value which is provided " +
                "by Locale Value Provider. It will be removed in an upcoming release.",
                "Use $A.localizationService.parseDateTimeUTC(dateTimeString, parseFormat, strictParsing)");

        if (locale && !this.isAvailableLocale(locale)) {
            langLocale = $A.get("$Locale.langLocale");
            $A.warning("AuraLocalizationService.parseDateTimeUTC(): Locale '" + locale + "' is not available. " +
                    "Falls back to the locale in $Locale.langLocale: " + langLocale);
        }
    }

    if (!langLocale) {
        langLocale = $A.get("$Locale.langLocale");
    }

    var format = strictParsing ? this.getStrictModeFormat(parseFormat) : this.getNormalizedFormat(parseFormat);
    var value = strictParsing ? this.getStrictModeDateTimeString(dateTimeString) : dateTimeString;
    var mDate = this.moment["utc"](value, format, this.getAvailableMomentLocale(langLocale), strictParsing);
    if (!mDate || !mDate["isValid"]()) {
        return null;
    }

    return mDate["toDate"]();
};

/**
 * Get a date which is the start of a unit of time for the given date.
 * @param {String|Number|Date} date - A datetime string in ISO8601 format, or a timestamp in milliseconds, or a Date object.
 * @param {String} unit - A datetime unit. Options: year, month, week, day, hour, minute or second.
 * @return {Date} A JavaScript Date object. It returns a parsed Date if unit is not provided.
 * @memberOf AuraLocalizationService
 * @example
 * var date = "2015-10-9";
 * // Returns "Thu Oct 01 2015 00:00:00 GMT-0700 (PDT)"
 * $A.localizationService.startOf(date, 'month');
 * @public
 * @export
 * @platform
 */
AuraLocalizationService.prototype.startOf = function(date, unit) {
    var normalizedDate = (date instanceof Date)? new Date(date.getTime()) : this.normalizeDateTimeInput(date);
    unit = this.normalizeDateTimeUnit(unit);
    if (!unit || !this.isValidDate(normalizedDate)) {
        return normalizedDate;
    }

    switch (unit) {
        case "year":
            normalizedDate.setMonth(0);
            // falls through
        case "month":
            normalizedDate.setDate(1);
            // falls through
        case "week":
        case "day":
            normalizedDate.setHours(0);
            // falls through
        case "hour":
            normalizedDate.setMinutes(0);
            // falls through
        case "minute":
            normalizedDate.setSeconds(0);
            // falls through
        case "second":
            normalizedDate.setMilliseconds(0);
    }

    // for 'week', we adjust days after resetting the time above
    if (unit === "week") {
        var firstDayOfWeek = $A.get("$Locale.firstDayOfWeek");
        var weekday = (normalizedDate.getDay() + 7 - firstDayOfWeek) % 7;
        var offset = weekday * 864e5; // 24 * 60 * 60 * 1000

        normalizedDate.setTime(normalizedDate.getTime() - offset);
    }

    return normalizedDate;
};

/**
 * Get a date which is the end of a unit of time for the given date.
 * @param {String|Number|Date} date - A datetime string in ISO8601 format, or a timestamp in milliseconds, or a Date object.
 * @param {String} unit - A datetime unit. Options: year, month, week, day, hour, minute or second.
 * @return {Date} A JavaScript Date object. It returns a parsed Date if unit is not provided.
 * @memberOf AuraLocalizationService
 * @example
 * var date = new Date();
 * // Returns the time at the end of the day
 * // in the format "Fri Oct 09 2015 23:59:59 GMT-0700 (PDT)"
 * var day = $A.localizationService.endOf(date, 'day')
 * @public
 * @export
 * @platform
 */
AuraLocalizationService.prototype.endOf = function(date, unit) {
    var normalizedDate = this.startOf(date, unit);
    unit = this.normalizeDateTimeUnit(unit);
    if (!unit || !this.isValidDate(normalizedDate)) {
        return normalizedDate;
    }

    this.addSubtract(normalizedDate, 1, unit);
    this.addSubtract(normalizedDate, 1, "millisecond", true);
    return normalizedDate;
};

/**
 * Get a date time string in simplified extended ISO format.
 * @param {Date} date - a Date object
 * @return {String} An ISO8601 string to represent passed in Date object.
 * @memberOf AuraLocalizationService
 * @example
 * var date = new Date();
 * // Returns "2015-10-09T20:47:17.590Z"
 * $A.localizationService.toISOString(date);
 * @deprecated
 * @public
 * @export
 * @platform
 */
AuraLocalizationService.prototype.toISOString = function(date) {
    $A.deprecated("$A.localizationService.toISOString(): The method is no longer supported by framework, and will be removed in an upcoming release.",
            "Use native method Date.toISOString() instead", "AuraLocalizationService.toISOString");

    return this.isValidDate(date)? date.toISOString() : date;
};

/**
 * Translate the localized digit string to a string with Arabic digits if there is any.
 * @param {String} input - a string with localized digits.
 * @return {String} a string with Arabic digits.
 * @memberOf AuraLocalizationService
 * @public
 * @export
 * @platform
 */
AuraLocalizationService.prototype.translateFromLocalizedDigits = function(input) {
    if (!input) {
        return input;
    }

    var localizedZero = $A.get("$Locale.zero");
    var zeroCharCodeOffset = localizedZero.charCodeAt(0) - this.ZERO.charCodeAt(0);
    if (!zeroCharCodeOffset) {
        return input;
    }

    var charArray = input.split("");
    for (var i = 0; i < charArray.length; i++) {
        var charCode = charArray[i].charCodeAt(0);
        if (charCode <= localizedZero.charCodeAt(0) + 9 && charCode >= localizedZero.charCodeAt(0)) {
            charArray[i] = String.fromCharCode(charCode - zeroCharCodeOffset);
        }
    }
    return charArray.join("");
};

/**
 * Translate the input date from other calendar system (for example, Buddhist calendar) to Gregorian calendar
 * based on the locale.
 * @param {Date} date - a Date Object.
 * @return {Date} an updated Date object.
 * @memberOf AuraLocalizationService
 * @public
 * @export
 * @platform
 */
AuraLocalizationService.prototype.translateFromOtherCalendar = function(date) {
    if (!date) {
        return date;
    }
    var userLocaleLang = $A.get("$Locale.userLocaleLang");
    var userLocaleCountry = $A.get("$Locale.userLocaleCountry");
    if (userLocaleLang === 'th' && userLocaleCountry === 'TH') { // Buddhist year
        date.setFullYear(date.getFullYear() - 543);
    }
    return date;
};

/**
 * Translate the input string to a string with localized digits (different from Arabic) if there is any.
 * @param {String} input - a string with Arabic digits.
 * @return {String} a string with localized digits.
 * @memberOf AuraLocalizationService
 * @public
 * @export
 * @platform
 */
AuraLocalizationService.prototype.translateToLocalizedDigits = function(input) {
    if (!input) {
        return input;
    }

    var localizedZero = $A.get("$Locale.zero");
    var zeroCharCodeOffset = localizedZero.charCodeAt(0) - this.ZERO.charCodeAt(0);
    if (!zeroCharCodeOffset) {
        return input;
    }

    var charArray = input.split("");
    for (var i = 0; i < charArray.length; i++) {
        var charCode = charArray[i].charCodeAt(0);
        if (charCode <= "9".charCodeAt(0) && charCode >= "0".charCodeAt(0)) {
            charArray[i] = String.fromCharCode(charCode + zeroCharCodeOffset);
        }
    }
    return charArray.join("");
};

/**
 * Translate the input date to a date in other calendar system, for example, Buddhist calendar based on the locale.
 * @param {Date} date - a Date Object.
 * @return {Date} an updated Date object.
 * @memberOf AuraLocalizationService
 * @public
 * @export
 * @platform
 */
AuraLocalizationService.prototype.translateToOtherCalendar = function(date) {
    if (!date) {
        return date;
    }
    var userLocaleLang = $A.get("$Locale.userLocaleLang");
    var userLocaleCountry = $A.get("$Locale.userLocaleCountry");
    if (userLocaleLang === 'th' && userLocaleCountry === 'TH') { // Buddhist year
        date.setFullYear(date.getFullYear() + 543);
    }
    return date;
};

/**
 * Converts a datetime from UTC to a specified timezone.
 * @param {Date} date - A JavaScript Date object
 * @param {String} timezone - A time zone id based on the java.util.TimeZone class, for example, America/Los_Angeles
 * @param {Function} callback - A function to be called after the conversion is done
 * @memberOf AuraLocalizationService
 * @example
 * // Provides locale information
 * var format = $A.get("$Locale.timeFormat");
 * format = format.replace(":ss", "");
 * var langLocale = $A.get("$Locale.langLocale");
 * var timezone = $A.get("$Locale.timezone");
 * var date = new Date();
 * $A.localizationService.UTCToWallTime(date, timezone, function(walltime) {
 *    // Returns the local time without the seconds, for example, 9:00 PM
 *    displayValue = $A.localizationService.formatDateTimeUTC(walltime, format, langLocale);
 * })
 * @public
 * @export
 * @platform
 */
AuraLocalizationService.prototype.UTCToWallTime = function(date, timezone, callback) {
    $A.assert(date instanceof Date, "AuraLocalizationService.UTCToWallTime(): 'date' must be a Date object.");
    $A.assert(typeof callback === "function", "AuraLocalizationService.UTCToWallTime(): 'callback' must be a function.");

    timezone = this.normalizeTimeZone(timezone);
    if (timezone === "UTC" || !this.isValidDate(date)) {
        callback(date);
        return;
    }

    var data = this.createDateTimeData(date, "UTC");

    var convertedData = this.setDataToZone(data, timezone);
    var dateTime = convertedData["config"];

    var ts = Date.UTC(dateTime["year"], dateTime["month"]-1, dateTime["day"], dateTime["hour"], dateTime["minute"]);
    var wallTimeDate = new Date(ts);
    wallTimeDate.setSeconds(date.getSeconds());
    wallTimeDate.setMilliseconds(date.getMilliseconds());

    callback(wallTimeDate);
};

/**
 * Converts a datetime from a specified timezone to UTC.
 * @param {Date} date - A JavaScript Date object
 * @param {String} timezone - A time zone id based on the java.util.TimeZone class, for example, America/Los_Angeles
 * @param {Function} callback - A function to be called after the conversion is done
 * @memberOf AuraLocalizationService
 * @example
 * $A.localizationService.WallTimeToUTC(date, timezone, function(utc) {
 *     displayDate = $A.localizationService.formatDateTime(utc, format, langLocale);
 * })
 * @public
 * @export
 * @platform
 */
AuraLocalizationService.prototype.WallTimeToUTC = function(date, timezone, callback) {
    $A.assert(date instanceof Date, "AuraLocalizationService.WallTimeToUTC(): 'date' must be a Date object.");
    $A.assert(typeof callback === "function", "AuraLocalizationService.WallTimeToUTC(): callback must be a function.");

    timezone = this.normalizeTimeZone(timezone);
    if (timezone === "UTC" || !this.isValidDate(date)) {
        callback(date);
        return;
    }

    var data = this.createDateTimeData(date, timezone);

    var convertedData = this.setDataToZone(data, "UTC");
    var dateTime = convertedData["config"];

    var ts = Date.UTC(dateTime["year"], dateTime["month"]-1, dateTime["day"], dateTime["hour"], dateTime["minute"]);
    var utcDate = new Date(ts);
    utcDate.setUTCSeconds(date.getSeconds(), date.getMilliseconds());

    callback(utcDate);
};

/**---------- Private functions ----------*/

/**
 * Initialize localization service.
 * @private
 */
AuraLocalizationService.prototype.init = function() {
    if (typeof moment === "undefined") {
        $A.warning("moment is required to initialize Localization Service.");
        return;
    }

    // If locale data didn't get added in inline.js, then adding the locale data.
    if (Aura["loadLocaleData"]) {
        Aura["loadLocaleData"]();
        Aura["loadLocaleData"] = undefined;
    }

    // using local reference to prevent Aura depended moment gets overriden
    this.moment = moment;

    // TODO: remove this when locales are consolidated.
    // Caching all available locales. This is for backward compatibility. At this moment, there are three locales
    // in Locale Value Provider. Keep them all available for now to avoid breaking consumers.

    // Refer to LocaleValueProvider.java
    var langLocale = $A.get("$Locale.langLocale");
    var userLocale = $A.get("$Locale.userLocaleLang") + "_" + $A.get("$Locale.userLocaleCountry");
    var ltngLocale = $A.get("$Locale.language") + "_" + $A.get("$Locale.userLocaleCountry");

    this.localeCache[langLocale] = this.normalizeToMomentLocale(langLocale);
    this.localeCache[userLocale] = this.normalizeToMomentLocale(userLocale);
    this.localeCache[ltngLocale] = this.normalizeToMomentLocale(ltngLocale);

    // set moment default locale
    this.moment.locale(this.localeCache[langLocale]);

    this.setupDateTimeUnitAlias();
};

AuraLocalizationService.prototype.normalizeTimeZone = function(timeZone) {

    if (timeZone) {
        if (timeZone === "GMT" || timeZone === "UTC") {
            return "UTC";
        }

        var timeZoneFormat = this.createDateTimeFormatByTimeZone(timeZone);
        if (timeZoneFormat !== null) {
            return timeZone;
        } else {
            $A.warning("Unsupported time zone: " + timeZone + ". Fallback to default time zone.");
        }
    }

    // If timeZone is falsy or unsupported
    timeZone = $A.get("$Locale.timezone");
    if (timeZone === "GMT" || timeZone === "UTC") {
        return "UTC";
    }

    timeZoneFormat = this.createDateTimeFormatByTimeZone(timeZone);
    if (timeZoneFormat !== null) {
        return timeZone;
    }

    // If the time zone in label is not supported, then fallback to UTC
    var message = "Unsupported time zone value in GVP: " + timeZone;
    $A.warning(message);
    // Sending Gack to server if the time zone in GVP is not supported by browsers
    $A.logger.reportError(new $A.auraError(message));

    return "UTC";
};

AuraLocalizationService.prototype.createDateTimeData = function(date, timeZone) {
    var config = {
        "year": date.getUTCFullYear(),
        "month": date.getUTCMonth() + 1,
        "day": date.getUTCDate(),
        "hour": date.getUTCHours(),
        "minute": date.getUTCMinutes()
        // Currently we only use the config for time zone conversion,
        // second and millisecond are not needed.
    };
    var zoneInfo = this.getZoneInfo(config, timeZone);

    return {
        "config": config,
        "offset": zoneInfo[1],
        "timestamp": zoneInfo[0],
        "timeZone": timeZone
    };
};

/**
 * Convert datatime data created by createDateTimeData() to different time zone.
 *
 * @returns {Object} datetime data for the given zone
 *
 * @private
 */
AuraLocalizationService.prototype.setDataToZone = function(data, timeZone) {
    var timestamp = data["timestamp"];
    var offset = this.zoneOffset(timestamp, timeZone);
    timestamp += offset * 6e4; // 60 * 1000

    var date = new Date(timestamp);
    var config = {
        "year": date.getUTCFullYear(),
        "month": date.getUTCMonth() + 1,
        "day": date.getUTCDate(),
        "hour": date.getUTCHours(),
        "minute": date.getUTCMinutes()
        // Currently we only use the config for time zone conversion,
        // so second and millisecond are not needed.
    };

    return {
        "timestamp": timestamp,
        "config": config,
        "timeZone": timeZone,
        "offset": offset
    };
};

/**
 * @returns {Array} a tuple which contains timestamp and offset
 */
AuraLocalizationService.prototype.getZoneInfo = function(config, timeZone) {
    var nowOffset = this.zoneOffset(Date.now(), timeZone);

    var localTs = Date.UTC(config["year"], config["month"]-1, config["day"], config["hour"], config["minute"]);
    // First attempt: the time zone offset during current time.
    var utcGuess = localTs - nowOffset * 6e4; // 60 * 1000
    var guessOffset = this.zoneOffset(utcGuess, timeZone);

    if (nowOffset === guessOffset) {
        return [utcGuess, guessOffset];
    }

    // Second attempt: if the offsets are different, remove the delta from ts.
    utcGuess -= (guessOffset - nowOffset) * 6e4; // 60 * 1000

    var guessOffset2 = this.zoneOffset(utcGuess, timeZone);
    if (guessOffset === guessOffset2) {
        return [utcGuess, guessOffset];
    }

    // Finally: if the offsets are still different, we have to make the decision.
    return [localTs - Math.max(guessOffset, guessOffset2) * 6e4, Math.max(guessOffset, guessOffset2)];
};

/**
 * Get the time zone offset during the given timestamp.
 *
 * @returns {Number} offset in minute
 */
AuraLocalizationService.prototype.zoneOffset = function(timestamp, timeZone) {
    if (timeZone === "UTC") {
        return 0;
    }

    // clean up second and millisecond from timestamp
    var date = new Date(timestamp);
    date.setSeconds(0, 0);
    var dateTimeString = this.formatDateWithTimeZone(date, timeZone);
    var zoneTs = this.parseEnUSDateTimeString(dateTimeString);

    // converts to minutes
    return (zoneTs - date.getTime()) / (6e4); // 60 * 1000
  };

/**
 * Formats a Date object to the ISO8601 date string.
 *
 * This method assumes the browser supports Intl API with time zone data.
 * @private
 */
AuraLocalizationService.prototype.formatDateWithTimeZone = function(date, timeZone) {

    if (this.formatErrorFromIntl) {
        return this.formatDateTime(date, "MM/dd/yyyy, hh:mm");
    }

    try {
        var timeZoneFormat = this.createDateTimeFormatByTimeZone(timeZone);
        return this.formatDateTimeToString(timeZoneFormat, date);
    } catch(e) {
        // The error should never happen here. The callers validate the arguments.
        // This is only for IE11 profiler. Intl API time zone polyfill gets messed up
        // when start profiling on IE11. If the following code gets executed, we assume
        // that Intl does not work correctly.
        $A.warning("Intl API throws an unexpected error.", e);
        this.formatErrorFromIntl = true;
        return this.formatDateTime(date, "MM/dd/yyyy, hh:mm");
    }
};

/**
 * Parse a datetime string in en-US format, "month/day/year, hour:minute", to a timestamp in millisecond in UTC
 *
 * @param {String} dateTimeString - a datetime string in en-US format, "month/day/year, hour:minute"
 * @returns {Number} timestamp in millisecond
 *
 * @private
 */
AuraLocalizationService.prototype.parseEnUSDateTimeString = function(dateTimeString) {
    var match = this.EN_US_DATETIME_PATTERN.exec(dateTimeString);
    if (match === null) {
        return null;
    }

    // month param is between 0 and 11
    return Date.UTC(match[3], match[1] - 1, match[2], match[4], match[5]);
};

AuraLocalizationService.prototype.formatDateTimeToString = function(dateTimeFormat, date) {
    // IE11 adds LTR / RTL mark in the formatted date time string
    return dateTimeFormat["format"](date).replace(/[\u200E\u200F]/g,'');
};

AuraLocalizationService.prototype.createDateTimeFormatByTimeZone = function(timeZone) {
    var timeZoneFormat = this.timeZoneFormatCache[timeZone];
    if (timeZoneFormat !== undefined) {
        return timeZoneFormat;
    }

    var supportedTimeZone = timeZone;
    if (this.timeZoneMap.hasOwnProperty(timeZone)) {
        supportedTimeZone = this.timeZoneMap[timeZone];
    }

    try {
        // we rely en-US format to parse the datetime string
        timeZoneFormat = Intl["DateTimeFormat"]("en-US", {
            "timeZone": supportedTimeZone,
            "hour12": false, // 24-hour time is needed for parsing the datetime string
            "year": "numeric",
            "month": "2-digit",
            "day": "2-digit",
            "hour": "2-digit",
            "minute": "2-digit"
        });
    } catch (e) {
        timeZoneFormat = null;
    }

    // cache the format for the time zone
    this.timeZoneFormatCache[timeZone] = timeZoneFormat;

    return timeZoneFormat;
};

/**
 * Normalize the specified Java locale string to moment-js compatible locale which
 * has available data on the client. If the given locale doesn't have any available
 * corresponding locale, it falls back to 'en'.
 *
 * @private
 */
AuraLocalizationService.prototype.normalizeToMomentLocale = function(locale) {
    if (!locale) {
        return locale;
    }

    // all locales that have been loaded in moment
    var locales = this.moment["locales"]();
    var momentLocale;

    var normalized = this.normalizeLocale(locale);
    var tokens = normalized.split("-", 2);

    // momentJs uses 'nb' as Norwegian
    if (tokens[0] === "no") {
        tokens[0] = "nb";
    }

    if (tokens.length > 1) {
        momentLocale = tokens.join("-");
        if (locales.indexOf(momentLocale) > -1) {
            return momentLocale;
        }
    }

    momentLocale = tokens[0];
    if (locales.indexOf(momentLocale) > -1) {
        return momentLocale;
    }

    // no matching, falls back to en
    return "en";
};

/**
 * Convert locale string into moment-js locale format.
 *
 * @private
 */
AuraLocalizationService.prototype.normalizeLocale = function(locale) {
    return locale? locale.toLowerCase().replace("_", "-") : locale;
};

/**
 * Get available moment locale from cache based on specified Java locale.
 *
 * This function assumes all available locales are added to cache during init().
 *
 * @param {String} locale - a Java locale
 * @return {String} corresponding momnet locale string, or 'en' if Java locale doesn't exists in cache.
 *
 * @private
 */
AuraLocalizationService.prototype.getAvailableMomentLocale = function(locale) {
    var momentLocale = this.localeCache[locale];
    return momentLocale? momentLocale : "en";
};

/**
 * Check if a Java locale is available in localization service.
 *
 * This function assumes all available locales are added to cache during init().
 *
 * @param {String} locale - a Java locale
 * @return {Boolean} true if locale is available, false otherwise
 *
 * @private
 */
AuraLocalizationService.prototype.isAvailableLocale = function(locale) {
    if (!locale) {
        return false;
    }

    if (this.localeCache.hasOwnProperty(locale)) {
        return true;
    }

    // If locale is not in cache, check if moment has avaiable for the locale
    var momentLocale = this.normalizeToMomentLocale(locale);
    var language = this.normalizeLocale(locale).split("-")[0];
    // Locale falls back to en
    if (momentLocale === "en" && language !== "en") {
        return false;
    } else {
        this.localeCache[locale] = momentLocale;
        return true;
    }
};

/**
 * Display date, datetime or time based on the format string.
 *
 * @private
 */
AuraLocalizationService.prototype.displayDateTime = function(mDate, format, locale) {
    if (locale) { // set locale locally
        mDate["locale"](this.getAvailableMomentLocale(locale));
    }
    return mDate["format"](this.getNormalizedFormat(format));
};

/**
 * Normalize a Java format string to make it compatible with moment.js
 *
 * @private
 */
AuraLocalizationService.prototype.getNormalizedFormat = function(format) {
    if (format) {
        if (!this.cache.format[format]) {
            var normalizedFormat =
                format.replace(/y/g, "Y")
                .replace(/(\b|[^Y])Y(?!Y)/g, "$1YYYY")
                .replace(/d/g, "D")
                .replace(/E/g, "d")
                .replace(/a/g, "A");
            this.cache.format[format] = normalizedFormat;
        }
        return this.cache.format[format];
    }
    return format;
};

/**
 * Modifying the format so that moment's strict parsing doesn't break on minor deviations
 *
 * @private
 */
AuraLocalizationService.prototype.getStrictModeFormat = function(format) {
    if (format) {
        if (!this.cache.strictModeFormat[format]) {
            var normalizedFormat = this.getNormalizedFormat(format);
            if (normalizedFormat) {
                var strictModeFormat = normalizedFormat
                    .replace(/(\b|[^D])D{2}(?!D)/g, "$1D")
                    .replace(/(\b|[^M])M{2}(?!M)/g, "$1M")
                    .replace(/(\b|[^h])h{2}(?!h)/g, "$1h")
                    .replace(/(\b|[^H])H{2}(?!H)/g, "$1H")
                    .replace(/(\b|[^m])m{2}(?!m)/g, "$1m")
                    .replace(/(\b|[^s])s{2}(?!s)/g, "$1s")
                    .replace(/\s*A/g, " A")
                    .trim();
                this.cache.strictModeFormat[format] = strictModeFormat;
            }
        }
        return this.cache.strictModeFormat[format];
    }
    return format;
};

/**
 * Modifying the date time string so that moment's strict parsing doesn't break on minor deviations
 *
 * @private
 */
AuraLocalizationService.prototype.getStrictModeDateTimeString = function(dateTimeString) {
    if (dateTimeString) {
        return dateTimeString.replace(/(\d)([AaPp][Mm])/g, "$1 $2");
    }
    return dateTimeString;
};

/**
 * Mutates the original date object by adding or subtract time.
 *
 * @param {Date} date - The Date object to mutated
 * @param {Number} num - The number of unit to add or to subtract
 * @param {String} unit - A normalized datetime unit, options: year, month, week, day, hour, minute or second
 * @param {Boolean} isSubtract - Set true if it is a subtract
 *
 * @private
 */
AuraLocalizationService.prototype.addSubtract = function(date, num, unit, isSubtract) {
    if (isSubtract) {
        num = -1 * num;
    }

    switch (unit) {
        case "year":
            date.setFullYear(date.getFullYear() + num);
            break;
        case "month":
            date.setMonth(date.getMonth() + num);
            break;
        case "week":
            date.setDate(date.getDate() + num * 7);
            break;
        case "day":
            date.setDate(date.getDate() + num);
            break;
        case "hour":
            date.setHours(date.getHours() + num);
            break;
        case "minute":
            date.setMinutes(date.getMinutes() + num);
            break;
        case "second":
            date.setSeconds(date.getSeconds() + num);
            break;
        case "millisecond":
            date.setMilliseconds(date.getMilliseconds() + num);
    }
};

/**
 * Converts datetime input into a Date object. If datetime is a Date object, it returns the original input.
 * @param {String|Number|Date} datetime - A datetime string in ISO8601 format, or a timestamp in milliseconds, or a Date object
 * @returns {Date} A Date object which represents the provided datetime, an invalid Date if the given datetime is not a supported type
 *
 * @private
 */
AuraLocalizationService.prototype.normalizeDateTimeInput = function(datetime) {
    if ($A.util.isString(datetime)) {
        return this.parseDateTimeString(datetime);
    } else if ($A.util.isNumber(datetime)) {
        return new Date(datetime);
    } else if (datetime instanceof Date) {
        return datetime;
    }

    return new Date(NaN);
};

/**
 * Parses a datetime string into a Date object.
 * @param {String} dateTimeString - A datetime string in ISO8601 format. If the string is not in ISO8601 format, it uses native Date() to parse, which may have different results across browsers and versions.
 *
 * @private
 */
AuraLocalizationService.prototype.parseDateTimeString = function(dateTimeString) {
    if (!this.isISO8601DateTimeString(dateTimeString)) {
        $A.warning("The provided datetime string is not in ISO8601 format. It will be parsed by native Date(), which may have different results across browsers and versions. ");
        var date = new Date(dateTimeString);
        // Date parsing includes browser timezone. To maintain current behavior, needs to remove it.
        date.setTime(date.getTime() + date.getTimezoneOffset() * 6e4); // 60 * 1000
        return date;
    }

    return this.parseDateTimeISO8601(dateTimeString);
};

AuraLocalizationService.prototype.isISO8601DateTimeString = function(dateTimeString) {
    return this.ISO_REGEX.test(dateTimeString) || this.ISO_REGEX_NO_DASH.test(dateTimeString);
};

AuraLocalizationService.prototype.normalizeDateTimeUnit = function(unit) {
    return $A.util.isString(unit) ? this.dateTimeUnitAlias[unit] || this.dateTimeUnitAlias[unit.toLowerCase()] || null : null;
};

/**
 * Adds a datetime unit's aliases (lowercase, lowercase plural, shorthand) to unit alias map.
 */
AuraLocalizationService.prototype.addDateTimeUnitAlias = function(unit, short) {
    var lowerCase = unit.toLowerCase();
    this.dateTimeUnitAlias[lowerCase] = this.dateTimeUnitAlias[lowerCase + 's'] = this.dateTimeUnitAlias[short] = unit;
};

AuraLocalizationService.prototype.setupDateTimeUnitAlias = function() {
    this.addDateTimeUnitAlias("year", "y");
    this.addDateTimeUnitAlias("month", "M");
    this.addDateTimeUnitAlias("week", "w");
    this.addDateTimeUnitAlias("day", "d");
    this.addDateTimeUnitAlias("hour", "h");
    this.addDateTimeUnitAlias("minute", "m");
    this.addDateTimeUnitAlias("second", "s");
    this.addDateTimeUnitAlias("millisecond", "ms");
};

AuraLocalizationService.prototype.isValidDate = function(date) {
    return (date instanceof Date) && !isNaN(date.getTime());
};

Aura.Services.AuraLocalizationService = AuraLocalizationService;
