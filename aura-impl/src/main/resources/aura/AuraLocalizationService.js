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
    // moment.js, moment-timezone.js and timezone data must be loaded before we can use date/time related APIs

    this.ZERO = "0";

    this.localeCache = {};

    this.cache = {
        format : {},
        strictModeFormat : {}
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
 * @param {Duration} d - The duration object returned by localizationService.duration
 * @param {Boolean} noSuffix - Set to true if the token should be displayed without a suffix
 * @return {String} A duration object
 * @memberOf AuraLocalizationService
 * @public
 * @example
 * var dur = $A.localizationService.duration(1, 'day');
 * // Returns "a day"
 * var length = $A.localizationService.displayDuration(dur);
 * @export
 * @platform
 */
AuraLocalizationService.prototype.displayDuration = function(d, noSuffix) {
    return d["humanize"](noSuffix);
};

/**
 * Displays a length of time in days.
 * @param {Duration} d - The duration object returned by localizationService.duration
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
AuraLocalizationService.prototype.displayDurationInDays = function(d) {
    return d["asDays"]();
};

/**
 * Displays a length of time in hours.
 * @param {Duration} d - The duration object returned by localizationService.duration
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
AuraLocalizationService.prototype.displayDurationInHours = function(d) {
    return d["asHours"]();
};

/**
 * Displays a length of time in milliseconds.
 * @param {Duration} d - The duration object returned by localizationService.duration
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
AuraLocalizationService.prototype.displayDurationInMilliseconds = function(d) {
    return d["asMilliseconds"]();
};

/**
 * Displays a length of time in minutes.
 * @param {Duration} d - The duration object returned by localizationService.duration
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
AuraLocalizationService.prototype.displayDurationInMinutes = function(d) {
    return d["asMinutes"]();
};

/**
 * Displays a length of time in months.
 * @param {Duration} d - The duration object returned by localizationService.duration
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
AuraLocalizationService.prototype.displayDurationInMonths = function(d) {
    return d["asMonths"]();
};

/**
 * Displays a length of time in seconds.
 * @param {Duration} d - The duration object returned by localizationService.duration
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
AuraLocalizationService.prototype.displayDurationInSeconds = function(d) {
    return d["asSeconds"]();
};

/**
 * Displays a length of time in years.
 * @param {Duration} d - The duration object returned by localizationService.duration
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
AuraLocalizationService.prototype.displayDurationInYears = function(d) {
    return d["asYears"]();
};

/**
 * Creates an object representing a length of time.
 * @param {Number|Object} num - The length of milliseconds/unit
 * @param {String} unit - The unit of measurement of time
 * @return {Object} A duration object
 * @memberOf AuraLocalizationService
 * @example
 * var dur = $A.localizationService.duration(1, 'day');
 * // dur._days returns 1
 * @public
 * @export
 * @platform
 */
AuraLocalizationService.prototype.duration = function(num, unit) {
    return unit ? moment["duration"](num, unit) : moment["duration"](num);
};

/**
 * Converts the passed in Date by setting it to the end of a unit of time.
 * @param {String|Number|Date} date - A format that the JavaScript Date object can parse
 * @param {String} unit - The unit of time in year, month, week, day, hour, minute or second
 * @return {Date} A JavaScript Date object
 * @memberOf AuraLocalizationService
 * @example
 * var d = new Date();
 * // Returns the time at the end of the day
 * // in the format "Fri Oct 09 2015 23:59:59 GMT-0700 (PDT)"
 * var day = $A.localizationService.endOf(d, 'day')
 * @public
 * @export
 * @platform
 */
AuraLocalizationService.prototype.endOf = function(date, unit) {
    return moment(date)["endOf"](unit)["toDate"]();
};

/**
 * Formats a date.
 * @param {String|Number|Date} date - The date format that the JavaScript Date object can parse.
 * @param {String} formatString - A Java format string. The default is from LocaleValueProvider.
 * @param {String} [locale] - [Deprecated] (optional) Locale value from Locale Value Provider. It falls back to the value in $Locale.langLocale if using unavailable locale. The default value is from $Locale.langLocale.
 * @return {String} A formatted and localized date string
 * @memberOf AuraLocalizationService
 * @example
 * var d = new Date();
 * // Returns date in the format "Oct 9, 2015"
 * $A.localizationService.formatDate(d);
 * @public
 * @export
 * @platform
 */
AuraLocalizationService.prototype.formatDate = function(date, formatString, locale) {
    var mDate = moment(date);
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
                "Use $A.localizationService.formatDate(date, formatString)", "2017-02-26", "2018-03-30");

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
 * Formats a date in UTC.
 * @param {String|Number|Date} date - The date format that JS Date object can parse.
 * @param {String} formatString - A Java format string. The default is from LocaleValueProvider.
 * @param {String} [locale] - [Deprecated] (optional) Locale value from Locale Value Provider. It falls back to the value in $Locale.langLocale if using unavailable locale. The default value is from $Locale.langLocale.
 * @return {String} A formatted and localized date string
 * @memberOf AuraLocalizationService
 * @example
 * var d = new Date();
 * // Returns date in UTC in the format "Oct 9, 2015"
 * $A.localizationService.formatDateUTC(d);
 * @public
 * @export
 * @platform
 */
AuraLocalizationService.prototype.formatDateUTC = function(date, formatString, locale) {
    var mDate = moment["utc"](date);
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
                "Use $A.localizationService.formatDateUTC(date, formatString)", "2017-02-26", "2018-03-30");

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
 * @param {String|Number|Date} date - The datetime format that the JavaScript Date object can parse.
 * @param {String} formatString - A Java format string. The default is from LocaleValueProvider.
 * @param {String} [locale] - [Deprecated] (optional) Locale value from Locale Value Provider. It falls back to the value in $Locale.langLocale if using unavailable locale. The default value is from $Locale.langLocale.
 * @return {String} A formatted and localized datetime string
 * @memberOf AuraLocalizationService
 * @example
 * var d = new Date();
 * // Returns datetime in the format "Oct 9, 2015 9:00:00 AM"
 * $A.localizationService.formatDateTime(d);
 * @public
 * @export
 * @platform
 */
AuraLocalizationService.prototype.formatDateTime = function(date, formatString, locale) {
    var mDate = moment(date);
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
                "Use $A.localizationService.formatDateTime(date, formatString)", "2017-02-26", "2018-03-30");

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
 * @param {String|Number|Date} date - The datetime format that the JavaScript Date object can parse.
 * @param {String} formatString - A Java format string. The default is from LocaleValueProvider.
 * @param {String} [locale] - [Deprecated] (optional) Locale value from Locale Value Provider. It falls back to the value in $Locale.langLocale if using unavailable locale. The default value is from $Locale.langLocale.
 * @return {String} A formatted and localized datetime string
 * @example
 * var d = new Date();
 * // Returns datetime in UTC in the format "Oct 9, 2015 4:00:00 PM"
 * $A.localizationService.formatDateTimeUTC(d);
 * @public
 * @export
 * @platform
 */
AuraLocalizationService.prototype.formatDateTimeUTC = function(date, formatString, locale) {
    var mDate = moment["utc"](date);
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
                "Use $A.localizationService.formatDateTimeUTC(date, formatString)", "2017-02-26", "2018-03-30");

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
 * @param {String|Number|Date} date - The time format that JavaScript Date object can parse
 * @param {String} formatString - A Java format string. The default is from LocaleValueProvider.
 * @param {String} [locale] - [Deprecated] (optional) Locale value from Locale Value Provider. It falls back to the value in $Locale.langLocale if using unavailable locale. The default value is from $Locale.langLocale.
 * @return {String} A formatted and localized time string
 * @memberOf AuraLocalizationService
 * @example
 * var d = new Date();
 * // Returns a date in the format "9:00:00 AM"
 * var now = $A.localizationService.formatTime(d);
 * @public
 * @export
 * @platform
 */
AuraLocalizationService.prototype.formatTime = function(date, formatString, locale) {
    var mDate = moment(date);
    if (!mDate || !mDate["isValid"]()) {
        throw { message: "Invalid time value" };
    }

    if (!formatString) { // use default format
        formatString = $A.get("$Locale.timeFormat");
    }

    var langLocale = locale;
    if (locale !== undefined) {
        $A.deprecated("$A.localizationService.formatTime(date, formatString, locale) is deprecated. " +
                "Do NOT rely on the [locale] parameter. It only allows to use the value which is provided " +
                "by Locale Value Provider. It will be removed in an upcoming release.",
                "Use $A.localizationService.formatTime(date, formatString)", "2017-02-26", "2018-03-30");

        if (!this.isAvailableLocale(locale)) {
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
 * @param {String|Number|Date} date - The time format that JavaScript Date object can parse.
 * @param {String} formatString - A Java format string. The default is from LocaleValueProvider.
 * @param {String} [locale] - [Deprecated] (optional) Locale value from Locale Value Provider. It falls back to the value in $Locale.langLocale if using unavailable locale. The default value is from $Locale.langLocale.
 * @return {String} a formatted and localized time string
 * @memberOf AuraLocalizationService
 * @example
 * var d = new Date();
 * // Returns time in UTC in the format "4:00:00 PM"
 * $A.localizationService.formatTimeUTC(d);
 * @public
 * @export
 * @platform
 */
AuraLocalizationService.prototype.formatTimeUTC = function(date, formatString, locale) {
    var mDate = moment["utc"](date);
    if (!mDate || !mDate["isValid"]()) {
        throw { message: "Invalid time value" };
    }

    if (!formatString) { // use default format
        formatString = $A.get("$Locale.timeFormat");
    }

    var langLocale = locale;
    if (locale !== undefined) {
        $A.deprecated("$A.localizationService.formatTimeUTC(date, formatString, locale) is deprecated. " +
                "Do NOT rely on the [locale] parameter. It only allows to use the value which is provided " +
                "by Locale Value Provider. It will be removed in an upcoming release.",
                "Use $A.localizationService.formatTimeUTC(date, formatString)", "2017-02-26", "2018-03-30");

        if (!this.isAvailableLocale(locale)) {
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
 * @param {Duration} d - The duration object returned by this.duration
 * @return {Number} The number of days in d.
 * @memberOf AuraLocalizationService
 * @example
 * var dur = $A.localizationService.duration(48, 'hour');
 * // Returns 2, the number of days for the given duration
 * $A.localizationService.getDaysInDuration(dur);
 * @public
 * @export
 * @platform
 */
AuraLocalizationService.prototype.getDaysInDuration = function(d) {
    return d["days"]();
};

/**
 * Gets the number of hours in a duration.
 * @param {Duration} d - The duration object returned by this.duration
 * @return {Number} The number of hours in d.
 * @memberOf AuraLocalizationService
 * @example
 * var dur = $A.localizationService.duration(60, 'minute');
 * // Returns 1, the number of hours in the given duration
 * $A.localizationService.getHoursInDuration(dur);
 * @public
 * @export
 * @platform
 */
AuraLocalizationService.prototype.getHoursInDuration = function(d) {
    return d["hours"]();
};

/**
 * Get the date time related labels (month name, weekday name, am/pm etc.).
 * @return {Object} the localized label set.
 * @memberOf AuraLocalizationService
 * @public
 * @export
 * @platform
 */
AuraLocalizationService.prototype.getLocalizedDateTimeLabels = function() {
    var langLocale = $A.get("$Locale.langLocale");
    var l = this.getAvailableMomentLocale(langLocale);
    return moment["localeData"](l);
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
 * @param {String} timezone - A time zone id based on the java.util.TimeZone class, for example, America/Los_Angeles
 * @param {Date} dateObj - A date object
 * @param {Function} callback - A function to be called after the "today" value is obtained
 * @memberOf AuraLocalizationService
 * @example
 * var timezone = $A.get("$Locale.timezone");
 * var d = new Date();
 * // Returns the date string in the format "2015-10-9"
 * $A.localizationService.getDateStringBasedOnTimezone(timezone, d, function(today){
 *    console.log(today);
 * });
 * @public
 * @export
 * @platform
 */
AuraLocalizationService.prototype.getDateStringBasedOnTimezone = function(timezone, dateObj, callback) {
    dateObj.setTime(dateObj.getTime() + dateObj.getTimezoneOffset() * 60 * 1000); // time in UTC
    var tz = timezone ? timezone : $A.get("$Locale.timezone");
    this.UTCToWallTime(dateObj, tz, function(date) {
        callback(date.getFullYear() + "-" + this.pad(date.getMonth() + 1) + "-" + this.pad(date.getDate()));
    }.bind(this));
};



/**
 * Gets the number of milliseconds in a duration.
 * @param {Duration} d - The duration object returned by localizationService.duration
 * @return {Number} The number of milliseconds in d.
 * @memberOf AuraLocalizationService
 * @public
 * @export
 * @platform
 */
AuraLocalizationService.prototype.getMillisecondsInDuration = function(d) {
    return d["milliseconds"]();
};

/**
 * Gets the number of minutes in a duration.
 * @param {Duration} d - The duration object returned by localizationService.duration
 * @return {Number} The number of minutes in d.
 * @memberOf AuraLocalizationService
 * @example
 * var dur = $A.localizationService.duration(60, 'second');
 * // Returns 1, the number of minutes in the given duration
 * $A.localizationService.getMinutesInDuration(dur);
 * @public
 * @export
 * @platform
 */
AuraLocalizationService.prototype.getMinutesInDuration = function(d) {
    return d["minutes"]();
};

/**
 * Gets the number of months in a duration.
 * @param {Duration} d - The duration object returned by localizationService.duration
 * @return {Number} The number of months in d.
 * @memberOf AuraLocalizationService
 * @example
 * var dur = $A.localizationService.duration(70, 'day');
 * // Returns 2, the number of months in the given duration
 * $A.localizationService.getMonthsInDuration(dur);
 * @public
 * @export
 * @platform
 */
AuraLocalizationService.prototype.getMonthsInDuration = function(d) {
    return d["months"]();
};

/**
 * Gets the number of seconds in a duration.
 * @param {Duration} d - The duration object returned by localizationService.duration
 * @return {Number} The number of seconds in d.
 * @memberOf AuraLocalizationService
 * @example
 * var dur = $A.localizationService.duration(3000, 'millisecond');
 * // Returns 3
 * $A.localizationService.getSecondsInDuration(dur);
 * @public
 * @export
 * @platform
 */
AuraLocalizationService.prototype.getSecondsInDuration = function(d) {
    return d["seconds"]();
};

/**
 * Gets the number of years in a duration.
 * @param {Duration} d - The duration object returned by localizationService.duration
 * @return {Number} The number of years in d.
 * @memberOf AuraLocalizationService
 * @example
 * var dur = $A.localizationService.duration(24, 'month');
 * // Returns 2
 * $A.localizationService.getYearsInDuration(dur);
 * @public
 * @export
 * @platform
 */
AuraLocalizationService.prototype.getYearsInDuration = function(d) {
    return d["years"]();
};

/**
 * A utility function to check if a datetime pattern string uses a 24-hour or period (12 hour with am/pm) time view.
 * @param {String} pattern - datetime pattern string
 * @return {Boolean} Returns true if it uses period time view.
 * @memberOf AuraLocalizationService
 * @example
 * var d = new Date();
 * // Returns false
 * $A.localizationService.isPeriodTimeView(d);
 * @public
 * @export
 * @platform
 */
AuraLocalizationService.prototype.isPeriodTimeView = function(pattern) {
    if (!pattern || typeof pattern  !== 'string') {
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
 * @param {String|Number|Date} date1 - A date format that the JavaScript Date object can parse
 * @param {String|Number|Date} date2 - A date format that the JavaScript Date object can parse
 * @param {String} unit - The unit to limit the granularity, that is, year, month, week, day, hour, minute and second.
 *                 By default, millisecond is used.
 * @return {Boolean} Returns true if date1 is after date2, or false otherwise.
 * @memberOf AuraLocalizationService
 * @example
 * var d = new Date();
 * var day = $A.localizationService.endOf(d, 'day');
 * // Returns false, since d is before day
 * $A.localizationService.isAfter(d, day);
 * @public
 * @export
 * @platform
 */
AuraLocalizationService.prototype.isAfter = function(date1, date2, unit) {
    return moment(date1)["isAfter"](date2, unit);
};

/**
 * Checks if date1 is before date2.
 * @param {String|Number|Date} date1 - A date format that the JavaScript Date object can parse
 * @param {String|Number|Date} date2 - A date format that the JavaScript Date object can parse
 * @param {String} unit - The unit to limit the granularity, that is, year, month, week, day, hour, minute and second.
 *                 By default, millisecond is used.
 * @return {Boolean} Returns true if date1 is before date2, or false otherwise.
 * @memberOf AuraLocalizationService
 * @example
 * var d = new Date();
 * var day = $A.localizationService.endOf(d, 'day');
 * // Returns true, since d is before day
 * $A.localizationService.isBefore(d, day);
 * @public
 * @export
 * @platform
 */
AuraLocalizationService.prototype.isBefore = function(date1, date2, unit) {
    return moment(date1)["isBefore"](date2, unit);
};

/**
 * Checks if date1 is the same as date2.
 * @param {String|Number|Date} date1 - A date format that the JavaScript Date object can parse
 * @param {String|Number|Date} date2 - A date format that the JavaScript Date object can parse
 * @param {String} unit - The unit to limit the granularity, that is, year, month, week, day, hour, minute and second.
 *                 By default, millisecond is used.
 * @return {Boolean} Returns true if date1 is the same as date2, or false otherwise.
 * @memberOf AuraLocalizationService
 * @example
 * var d = new date();
 * var day = $A.localizationService.endOf(d, 'day');
 * // Returns false
 * $A.localizationService.isSame(d, day, 'hour');
 * // Returns true
 * $A.localizationService.isSame(d, day, 'day');
 * @public
 * @export
 * @platform
 */
AuraLocalizationService.prototype.isSame = function(date1, date2, unit) {
    return moment(date1)["isSame"](date2, unit);
};

/**
 * Checks if a date is between two other dates (fromDate and toDate), where the match is inclusive.
 * @param {String|Number|Date} date - A date format that the JavaScript Date object can parse
 * @param {String|Number|Date} fromDate - A date format that the JavaScript Date object can parse
 * @param {String|Number|Date} toDate - A date format that the JavaScript Date object can parse
 * @param {String} unit - The unit to limit the granularity, that is, year, month, week, day, hour, minute and second.
 *                 By default, millisecond is used.
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
    return moment(date)["isBetween"](fromDate, toDate, unit, '[]');
};

/**
 * Parses a string to a JavaScript Date.
 * @param {String} dateTimeString - The datetime string to be parsed.
 * @param {String} parseFormat - A Java format string which is used to parse datetime. The default is from LocaleValueProvider.
 * @param {String} [locale] - [Deprecated] (optional) Locale value from Locale Value Provider. It falls back to the value in $Locale.langLocale if using unavailable locale. The default value is from $Locale.langLocale.
 * @param {Boolean} [strictParsing] - (optional) Set to true to turn off moment's forgiving parsing and use strict validation.
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
                "Use $A.localizationService.parseDateTime(dateTimeString, parseFormat, strictParsing)", "2017-02-26", "2018-03-30");

        if (!this.isAvailableLocale(locale)) {
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
    var mDate = moment(value, format, this.getAvailableMomentLocale(langLocale), strictParsing);
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

    var mDate = moment(dateTimeString);
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
 * @param {Boolean} [strictParsing] - (optional) Set to true to turn off moment's forgiving parsing and use strict validation.
 * @return {Date} A JavaScript Date object, or null if dateTimeString is invalid
 * @memberOf AuraLocalizationService
 * @example
 * var d = "2015-10-9";
 * // Returns "Thu Oct 08 2015 17:00:00 GMT-0700 (PDT)"
 * $A.localizationService.parseDateTimeUTC(d);
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
                "Use $A.localizationService.parseDateTime(dateTimeString, parseFormat, strictParsing)", "2017-02-26", "2018-03-30");

        if (!this.isAvailableLocale(locale)) {
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
    var mDate = moment["utc"](value, format, this.getAvailableMomentLocale(langLocale), strictParsing);
    if (!mDate || !mDate["isValid"]()) {
        return null;
    }

    return mDate["toDate"]();
};

/**
 * Converts the passed in Date by setting it to the start of a unit of time.
 * @param {String|Number|Date} date - Anything that JS Date object can parse.
 * @param {String} unit - Year, month, week, day, hour, minute or second
 * @return {Date} A JavaScript Date object
 * @memberOf AuraLocalizationService
 * @example
 * var d = "2015-10-9";
 * // Returns "Thu Oct 01 2015 00:00:00 GMT-0700 (PDT)"
 * $A.localizationService.startOf(d, 'month');
 * @public
 * @export
 * @platform
 */
AuraLocalizationService.prototype.startOf = function(date, unit) {
    return moment(date)["startOf"](unit)["toDate"]();
};

/**
 * Most modern browsers support this method on Date object. But that is not the case for IE8 and older.
 * @param {Date} date - a Date object
 * @return {String} An ISO8601 string to represent passed in Date object.
 * @memberOf AuraLocalizationService
 * @example
 * var d = new Date();
 * // Returns "2015-10-09T20:47:17.590Z"
 * $A.localizationService.toISOString(d);
 * @public
 * @export
 * @platform
 */
AuraLocalizationService.prototype.toISOString = function(date) {
    if (date && $A.lockerService.instanceOf(date, Date)) {
        if (date.toISOString) {
            return date.toISOString();
        } else {
            return date.getUTCFullYear() + '-'
                 + this.pad(date.getUTCMonth() + 1) + '-'
                 + this.pad(date.getUTCDate()) + 'T'
                 + this.pad(date.getUTCHours()) + ':'
                 + this.pad(date.getUTCMinutes()) + ':'
                 + this.pad(date.getUTCSeconds()) + '.'
                 + this.doublePad(date.getUTCMilliseconds()) + 'Z';
        }
    } else {
        return date;
    }
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
 * var d = new Date();
 * $A.localizationService.UTCToWallTime(d, timezone, function(walltime) {
 *    // Returns the local time without the seconds, for example, 9:00 PM
 *    displayValue = $A.localizationService.formatDateTimeUTC(walltime, format, langLocale);
 * })
 * @public
 * @export
 * @platform
 */
AuraLocalizationService.prototype.UTCToWallTime = function(date, timezone, callback) {
    $A.assert(callback, 'Callback is required');

    if (typeof callback !== 'function') {
        $A.warning("AuraLocalizationService.UTCToWallTime(): callback must be a function.");
        return;
    }

    if (!moment["tz"]) {
        var message = "AuraLocalizationService.UTCToWallTime(): moment-timezone lib is missing on moment. " +
                      "It could be overridden by another version of moment-js in userland code. Current moment-js version: " + moment["version"];
        $A.warning(message);
        $A.logger.reportError(new $A.auraError(message));

        callback(date);
        return;
    }

    if (!timezone || !moment["tz"]["zone"](timezone)) {
        $A.warning("AuraLocalizationService.UTCToWallTime(): unsupported time zone: " +
            timezone + ". Fallback to default timezone.");
        timezone = $A.get("$Locale.timezone");
    }

    if (timezone === "GMT" || timezone === "UTC") {
        callback(date);
        return;
    }

    var walltimeDate = date;
    try {
        var zone = moment["tz"]["zone"](timezone);
        var offset = zone["offset"](date.getTime());
        var walltime = moment(date)["subtract"](offset, "minutes");
        walltimeDate = walltime["toDate"]();
    } catch (e) {
        // the try-catch block is just for backward compatibility, so that there is no any error
        // thrown during date time conversion.
        $A.warning("AuraLocalizationService.UTCToWallTime(): error occurred during time conversion", e);
    }

    callback(walltimeDate);
};

/**
 * Converts a datetime from a specified timezone to UTC.
 * @param {Date} date - A JavaScript Date object
 * @param {String} timezone - A time zone id based on the java.util.TimeZone class, for example, America/Los_Angeles
 * @param {Function} callback - A function to be called after the conversion is done
 * @memberOf AuraLocalizationService
 * @example
 * $A.localizationService.WallTimeToUTC(d, timezone, function(utc) {
 *     displayDate = $A.localizationService.formatDateTime(utc, format, langLocale);
 * })
 * @public
 * @export
 * @platform
 */
AuraLocalizationService.prototype.WallTimeToUTC = function(date, timezone, callback) {
    $A.assert(callback, 'Callback is required');

    if (typeof callback !== 'function') {
        $A.warning("AuraLocalizationService.WallTimeToUTC(): callback must be a function.");
        return;
    }

    if (!moment["tz"]) {
        var message = "AuraLocalizationService.WallTimeToUTC(): moment-timezone lib is missing on moment. " +
                      "It could be overridden by another version of moment-js in userland code. Current moment-js version: " + moment["version"];
        $A.warning(message);
        $A.logger.reportError(new $A.auraError(message));

        callback(date);
        return;
    }

    if (!timezone || !moment["tz"]["zone"](timezone)) {
        $A.warning("AuraLocalizationService.WallTimeToUTC(): unsupported time zone: " +
            timezone + ". Fallback to default timezone.");
        timezone = $A.get("$Locale.timezone");
    }

    if (timezone === "GMT" || timezone === "UTC") {
        callback(date);
        return;
    }

    var utcDate = date;
    try {
        var zone = moment["tz"]["zone"](timezone);
        var offset = zone["offset"](date.getTime());
        var utc = moment(date)["add"](offset, "minutes");
        utcDate = utc["toDate"]();
    } catch (e) {
        // the try-catch block is just for backward compatibility, so that there is no any error
        // thrown during date time conversion.
        $A.warning("AuraLocalizationService.WallTimeToUTC(): error occurred during time conversion", e);
    }

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
    moment.locale(this.localeCache[langLocale]);
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
    var locales = moment["locales"]();
    var momentLocale;

    var normalized = this.normalizeLocale(locale);
    var tokens = normalized.split("-", 2);

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
 * Append zero in front if necessary to standardize a number with two digits. For example, "9" becomes "09".
 * @private
 */
AuraLocalizationService.prototype.pad = function(n) {
    return n < 10 ? '0' + n : n;
};

/**
 * Append zero in front if necessary to standardize a number with three digits. For example, "99" becomes "099".
 * @private
 */
AuraLocalizationService.prototype.doublePad = function(n) {
    return n < 10 ? '00' + n : n  < 100 ? '0' + n : n;
};

Aura.Services.AuraLocalizationService = AuraLocalizationService;
