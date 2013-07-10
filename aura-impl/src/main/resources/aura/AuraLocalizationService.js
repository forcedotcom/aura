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
/*jslint sub: true */
/**
 * @namespace The Aura Localization service Service, accessible using $A.localizationService. Provides utility methods
 * for localizing data or getting formatters for numbers, currencies, dates, etc.
 * @constructor
 */
var AuraLocalizationService = function AuraLocalizationService() {
    var numberFormat, percentFormat, currencyFormat;
    // moment.js and walltime-js must be loaded before we can use date/time related APIs
    var localizationService = {
        cache : {
            format : {},
            langLocale : {}
        },

        formatNumber : function(number) {
            return this.getDefaultNumberFormat().format(number);
        },

        formatPercent : function(number) {
            return this.getDefaultPercentFormat().format(number);
        },

        formatCurrency : function(number) {
            return this.getDefaultCurrencyFormat().format(number);
        },

        getNumberFormat : function(format, symbols) {
            return new NumberFormat(format, symbols);
        },

        getDefaultNumberFormat : function() {
            if (!numberFormat) {
                numberFormat = new NumberFormat($A.get("$Locale.numberFormat"));
            }
            return numberFormat;
        },

        getDefaultPercentFormat : function() {
            if (!percentFormat) {
                percentFormat = new NumberFormat($A.get("$Locale.percentFormat"));
            }
            return percentFormat;
        },

        getDefaultCurrencyFormat : function() {
            if (!currencyFormat) {
                currencyFormat = new NumberFormat($A.get("$Locale.currencyFormat"));
            }
            return ccurrencyFormatf;
        },

        /**
         * Displays a length of time.
         * @param {Duration} d The duration object returned by localizationService.duration
         * @param {Boolean} noSuffix Set to true if the token should be displayed without a suffix
         * @return {String} A duration object
         * @memberOf AuraLocalizationService
         * @public
         */
        displayDuration : function(d, noSuffix) {
            return d["humanize"](noSuffix);
        },

        /**
         * Displays a length of time in days.
         * @param {Duration} d The duration object returned by localizationService.duration
         * @return {Number} The length of time in days.
         * @memberOf AuraLocalizationService
         * @public
         */
        displayDurationInDays : function(d) {
            return d["asDays"]();
        },

        /**
         * Displays a length of time in hours.
         * @param {Duration} d The duration object returned by localizationService.duration
         * @return {Number} The length of time in hours.
         * @memberOf AuraLocalizationService
         * @public
         */
        displayDurationInHours : function(d) {
            return d["asHours"]();
        },

        /**
         * Displays a length of time in milliseconds.
         * @param {Duration} d The duration object returned by localizationService.duration
         * @return {Number} The length of time in milliseconds.
         * @memberOf AuraLocalizationService
         * @public
         */
        displayDurationInMilliseconds : function(d) {
            return d["asMilliseconds"]();
        },

        /**
         * Displays a length of time in minutes.
         * @param {Duration} d The duration object returned by localizationService.duration
         * @return {Number} The length of time in minutes.
         * @memberOf AuraLocalizationService
         * @public
         */
        displayDurationInMinutes : function(d) {
            return d["asMinutes"]();
        },

        /**
         * Displays a length of time in months.
         * @param {Duration} d The duration object returned by localizationService.duration
         * @return {Number} The length of time in months.
         * @memberOf AuraLocalizationService
         * @public
         */
        displayDurationInMonths : function(d) {
            return d["asMonths"]();
        },
        
        /**
         * Displays a length of time in seconds.
         * @param {Duration} d The duration object returned by localizationService.duration
         * @return {Number} The length of time in seconds.
         * @memberOf AuraLocalizationService
         * @public
         */
        displayDurationInSeconds : function(d) {
            return d["asSeconds"]();
        },
        
        /**
         * Displays a length of time in years.
         * @param {Duration} d The duration object returned by localizationService.duration
         * @return {Number} The length of time in years.
         * @memberOf AuraLocalizationService
         * @public
         */
        displayDurationInYears : function(d) {
            return d["asYears"]();
        },
        
        /**
         * Creates an object representing a length of time.
         * @param {Number|Object} num The length of milliseconds/unit
         * @param {String} unit The unit of measurement of time
         * @return {Object} A duration object
         * @memberOf AuraLocalizationService
         * @public
         */
        duration : function(num, unit) {
            return unit ? moment["duration"](num, unit) : moment["duration"](num);
        },
        
        /**
         * Converts the passed in Date by setting it to the end of a unit of time.
         * @param {String|Number|Date} date A format that the JavaScript Date object can parse
         * @param {String} unit The unit of time in year, month, week, day, hour, minute or second
         * @return {Date} A JavaScript Date object
         * @memberOf AuraLocalizationService
         * @public
         */
        endOf : function(date, unit) {
            return (moment(date)["endOf"](unit)).toDate();
        },
        
        /**
         * Formats a date.
         * @param {String|Number|Date} date The date format that the JavaScript Date object can parse.
         * @param {String} formatString A Java format string. The default is from LocaleValueProvider.
         * @param {String} locale A Java locale string. The default is from LocaleValueProvider.
         * @return A formatted and localized date string
         * @memberOf AuraLocalizationService
         * @public
         */ 
        formatDate : function(date, formatString, locale) {
            var mDate = moment(date);
            if (mDate["isValid"]()) {
                var format = formatString;
                if (!format) { // use default format
                    format = $A.getGlobalValueProviders().get("$Locale.dateformat");
                }
                return localizationService.displayDateTime(mDate, format, locale);
            } else {
                throw {message: "Invalid date value"};
            }
        },
        
        /**
         * Formats a date in UTC.
         * @param {String|Number|Date} date The date format that JS Date object can parse.
         * @param {String} formatString A Java format string. The default is from LocaleValueProvider.
         * @param {String} locale A Java locale string. The default is from LocaleValueProvider.
         * @return A formatted and localized date string
         * @memberOf AuraLocalizationService
         * @public
         */
        formatDateUTC : function(date, formatString, locale) {
            var mDate = moment["utc"](date);
            if (mDate["isValid"]()) {
                var format = formatString;
                if (!format) { // use default format
                    format = $A.getGlobalValueProviders().get("$Locale.dateformat");
                }
                return localizationService.displayDateTime(mDate, format, locale);
            } else {
                throw {message: "Invalid date value"};
            }
        },
        
        /**
         * Formats a datetime.
         * @param {String|Number|Date} date The datetime format that the JavaScript Date object can parse.
         * @param {String} formatString A Java format string. The default is from LocaleValueProvider.
         * @param {String} locale A Java locale string. The default is from LocaleValueProvider.
         * @return A formatted and localized datetime string
         * @memberOf AuraLocalizationService
         * @public
         */
        formatDateTime : function(date, formatString, locale) {
            var mDate = moment(date);
            if (mDate["isValid"]()) {
                var format = formatString;
                if (!format) { // use default format
                    format = $A.getGlobalValueProviders().get("$Locale.datetimeformat");
                }
                return localizationService.displayDateTime(mDate, format, locale);
            } else {
                throw {message: "Invalid date time value"};
            }
        },
        
        /**
         * Formats a datetime in UTC.
         * @param {String|Number|Date} date The datetime format that the JavaScript Date object can parse.
         * @param {String} formatString A Java format string. The default is from LocaleValueProvider.
         * @param {String} locale A Java locale string. The default is from LocaleValueProvider.
         * @return A formatted and localized datetime string
         * @public
         */
        formatDateTimeUTC : function(date, formatString, locale) {
            var mDate = moment["utc"](date);
            if (mDate["isValid"]()) {
                var format = formatString;
                if (!format) { // use default format
                    format = $A.getGlobalValueProviders().get("$Locale.datetimeformat");
                }
                return localizationService.displayDateTime(mDate, format, locale);
            } else {
                throw {message: "Invalid date time value"};
            }
        },

        /**
         * Formats a time.
         * @param {String|Number|Date} date The time format that JavaScript Date object can parse
         * @param {String} formatString A Java format string. The default is from LocaleValueProvider.
         * @param {String} locale A Java locale string. The default is from LocaleValueProvider.
         * @return A formatted and localized time string
         * @memberOf AuraLocalizationService
         * @public
         */
        formatTime : function(date, formatString, locale) {
            var mDate = moment(date);
            if (mDate["isValid"]()) {
                var format = formatString;
                if (!format) { // use default format
                    format = $A.getGlobalValueProviders().get("$Locale.timeformat");
                }
                return localizationService.displayDateTime(mDate, format, locale);
            } else {
                throw {message: "Invalid time value"};
            }
        },
        
        /**
         * Formats a time in UTC.
         * @param {String|Number|Date} date The time format that JavaScript Date object can parse.
         * @param {String} formatString A Java format string. The default is from LocaleValueProvider.
         * @param {String} locale A Java locale string. The default is from LocaleValueProvider.
         * @return a formatted and localized time string
         * @memberOf AuraLocalizationService
         * @public
         */
        formatTimeUTC : function(date, formatString, locale) {
            var mDate = moment["utc"](date);
            if (mDate["isValid"]()) {
                var format = formatString;
                if (!format) { // use default format
                    format = $A.getGlobalValueProviders().get("$Locale.timeformat");
                }
                return localizationService.displayDateTime(mDate, format, locale);
            } else {
                throw {message: "Invalid time value"};
            }
        },

        /**
         * Gets the number of hours in a duration.
         * @param {Duration} d The duration object returned by localizationService.duration
         * @return {Number} The number of hours in d.
         * @memberOf AuraLocalizationService
         * @public
         */
        getHoursInDuration : function(d) {
            return d["hours"]();
        },
        
        /**
         * Gets the number of milliseconds in a duration.
         * @param {Duration} d The duration object returned by localizationService.duration
         * @return {Number} The number of milliseconds in d.
         * @memberOf AuraLocalizationService
         * @public
         */
        getMillisecondsInDuration : function(d) {
            return d["milliseconds"]();
        },
        
        /**
         * Gets the number of minutes in a duration.
         * @param {Duration} d The duration object returned by localizationService.duration
         * @return {Number} The number of minutes in d.
         * @memberOf AuraLocalizationService
         * @public
         */
        getMinutesInDuration : function(d) {
            return d["minutes"]();
        },
        
        /**
         * Gets the number of months in a duration.
         * @param {Duration} d The duration object returned by localizationService.duration
         * @return {Number} The number of months in d.
         * @memberOf AuraLocalizationService
         * @public
         */
        getMonthsInDuration : function(d) {
            return d["months"]();
        },
        
        /**
         * Gets the number of seconds in a duration.
         * @param {Duration} d The duration object returned by localizationService.duration
         * @return {Number} The number of seconds in d.
         * @memberOf AuraLocalizationService
         * @public
         */
        getSecondsInDuration : function(d) {
            return d["seconds"]();
        },
                
        /**
         * Gets the number of years in a duration.
         * @param {Duration} d The duration object returned by localizationService.duration
         * @return {Number} The number of years in d.
         * @memberOf AuraLocalizationService
         * @public
         */
        getYearsInDuration : function(d) {
            return d["years"]();
        },
        
        /**
         * Checks if date1 is after date2.
         * @param {String|Number|Date} date1 A date format that the JavaScript Date object can parse
         * @param {String|Number|Date} date2 A date format that the JavaScript Date object can parse
         * @param {String} unit The unit to limit the granularity, that is, year, month, week, day, hour, minute and second.
         *                 By default, millisecond is used.
         * @return {Boolean} Returns true if date1 is after date2, or false otherwise.
         * @memberOf AuraLocalizationService
         * @public
         */ 
        isAfter : function(date1, date2, unit) {
            return moment(date1)["isAfter"](date2, unit);
        },

        /**
         * Checks if date1 is before date2.
         * @param {String|Number|Date} date1 A date format that the JavaScript Date object can parse
         * @param {String|Number|Date} date2 A date format that the JavaScript Date object can parse
         * @param {String} unit The unit to limit the granularity, that is, year, month, week, day, hour, minute and second.
         *                 By default, millisecond is used.
         * @return {Boolean} Returns true if date1 is before date2, or false otherwise.
         * @memberOf AuraLocalizationService
         * @public
         */
        isBefore : function(date1, date2, unit) {
            return moment(date1)["isBefore"](date2, unit);
        },
        
        /**
         * Checks if date1 is the same as date2.
         * @param {String|Number|Date} date1 A date format that the JavaScript Date object can parse
         * @param {String|Number|Date} date2 A date format that the JavaScript Date object can parse
         * @param {String} unit The unit to limit the granularity, that is, year, month, week, day, hour, minute and second.
         *                 By default, millisecond is used.
         * @return {Boolean} Returns true if date1 is the same as date2, or false otherwise.
         * @memberOf AuraLocalizationService
         * @public
         */
        isSame : function(date1, date2, unit) {
            return moment(date1)["isSame"](date2, unit);
        },

        /**
         * Parses a string to a JavaScript Date.
         * @param {String} dateTimeString The datetime string to be parsed.
         * @param {String} targetFormat A Java format string which is used to parse datetime. The default is from LocaleValueProvider.
         * @param {String} locale A Java locale string used to parse datetime. The default is from LocaleValueProvider.
         * @return {Date} A JavaScript Date object
         * @memberOf AuraLocalizationService
         * @public
         */
        parseDateTime : function(dateTimeString, targetFormat, locale) {
            if (!dateTimeString) {
                return null;
        }

            var mDate = moment(dateTimeString, localizationService.getNormalizedFormat(targetFormat), localizationService.getNormalizedLangLocale(locale));
            if (mDate["isValid"]()) {
                return mDate["toDate"]();
            }
            return null;
        },
        
        /**
         * Parses a string to a JavaScript Date in UTC.
         * @param {String} dateTimeString The datetime string to be parsed
         * @param {String} targetFormat A Java format string which is used to parse datetime. The default is from LocaleValueProvider.
         * @param {String} locale A Java locale string used to parse datetime. The default is from LocaleValueProvider.
         * @return {Date} A JavaScript Date object
         * @memberOf AuraLocalizationService
         * @public
         */
        parseDateTimeUTC : function(dateTimeString, targetFormat, locale) {
            if (!dateTimeString) {
                return null;
            }
            
            var mDate = moment["utc"](dateTimeString, localizationService.getNormalizedFormat(targetFormat), localizationService.getNormalizedLangLocale(locale));
            if (mDate["isValid"]()) {
                return mDate["toDate"]();
            }
            return null;
        },
        
        /**
         * Converts the passed in Date by setting it to the start of a unit of time.
         * @param {String|Number|Date} date It could be anything that JS Date object can parse.
         * @param {String} unit Year, month, week, day, hour, minute or second
         * @return {Date} A JavaScript Date object
         * @memberOf AuraLocalizationService
         * @public
         */
        startOf : function(date, unit) {
            return (moment(date)["startOf"](unit)).toDate();
        },
        
        /**
         * Converts a datetime from UTC to a specified timezone.
         * @param {Date} date A JavaScript Date object
         * @param {String} timezone A time zone id based on the java.util.TimeZone class, for example, America/Los_Angeles
         * @param {Function} callback A function to be called after the conversion is done
         * @memberOf AuraLocalizationService
         * @public
         */
        UTCToWallTime : function(date, timezone, callback) {
            if (typeof callback === 'function') {
                if (!timezone) {
                    timezone = $A.getGlobalValueProviders().get("$Locale.timezone");
                }
                
                if (timezone == "GMT" || timezone == "UTC") {
                    callback(date);
                    return;
                }
            
                if (!WallTime["zones"] || !WallTime["zones"][timezone]) {
                    // retrieve timezone data from server
                    localizationService.getTimeZoneInfo(timezone, function() {
                        callback(localizationService.getWallTimeFromUTC(date, timezone));
                    });
                } else {
                    callback(localizationService.getWallTimeFromUTC(date, timezone));
                }
            }
        },
        
        /**
         * Converts a datetime from a specified timezone to UTC.
         * @param {Date} date A JavaScript Date object
         * @param {String} timezone A time zone id based on the java.util.TimeZone class, for example, America/Los_Angeles
         * @param {Function} callback A function to be called after the conversion is done
         * @memberOf AuraLocalizationService
         * @public
         */
        WallTimeToUTC : function(date, timezone, callback) {
            if (typeof callback === 'function') {
                if (!timezone) {
                    timezone = $A.getGlobalValueProviders().get("$Locale.timezone");
                }
                
                if (timezone == "GMT" || timezone == "UTC") {
                    callback(date);
                    return;
                }
            
                if (!WallTime["zones"] || !WallTime["zones"][timezone]) {
                    // retrieve timezone data from server
                    localizationService.getTimeZoneInfo(timezone, function() {
                        callback(localizationService.getUTCFromWallTime(date, timezone));
                    });
                } else {
                    callback(localizationService.getUTCFromWallTime(date, timezone));
                }
            }
        },
        
        /**---------- Private functions ----------*/
        
        /**
         * Display date, datetime or time based on the format string.
         *
         * @private
         */
        displayDateTime : function(mDate, format, locale) {
            if (locale) { // set locale locally
                mDate["lang"](localizationService.getNormalizedLangLocale(locale));
            }
            return mDate["format"](localizationService.getNormalizedFormat(format));
        },

        /**
         * Normalize a Java format string to make it compatible with moment.js
         *
         * @private
         */
        getNormalizedFormat : function(format) {            
            if (format) {
                if (!localizationService.cache.format[format]) {
                    var normalizedFormat = format.replace(/y/g, "Y").replace(/d/g, "D").replace(/E/g, "d").replace(/a/g, "A"); 
                    localizationService.cache.format[format] = normalizedFormat;
                }
                return localizationService.cache.format[format];
            }
            return format;
        },

        /**
         * Normalize the input Java locale string to moment.js compatible one.
         *
         * @private
         */
        getNormalizedLangLocale : function(langLocale) {
            if (!langLocale) {
                return langLocale;
            }
            
            if (!localizationService.cache.langLocale[langLocale]) {
                var lang = [];
                var token = "";
        
                var index = langLocale.indexOf("_");
                while (index > 0) {
                    token = langLocale.substring(0, index);
                    langLocale = langLocale.substring(index + 1);
                    lang.push(token.toLowerCase());
                    index = langLocale.indexOf("_");
                }
        
                langLocale = langLocale.substring(index + 1);
                if (!$A.util.isEmpty(langLocale)) {
                    lang.push(langLocale.toLowerCase());
                }

                var ret = lang[0];
                if (lang[1]) {
                    var langAndCountry = lang[0] + "-" + lang[1];
                    if (moment["langData"](langAndCountry)) {
                        ret = langAndCountry;
                    }
                }
                if (!moment["langData"](ret)) {
                    ret = "en";
                }
                localizationService.cache.langLocale[langLocale] = ret;
            }
            return localizationService.cache.langLocale[langLocale];
        },

        /**
         * retrieve timezone info from server.
         *
         * @private
         */
        getTimeZoneInfo: function(timezone, callback) { 
            var a = $A.get("c.aura://TimeZoneInfoController.getTimeZoneInfo");
            a.setParams({
                "timezoneId": timezone
            });
            a.setCallback(localizationService, function(action){
                var state = action.getState();
                if(state === "SUCCESS"){
                    var ret = action.returnValue;
                    if (ret) {
                        WallTime["data"] = ret;
                        if (WallTime["zones"]) {
                            WallTime["addRulesZones"](WallTime["data"]["rules"], WallTime["data"]["zones"]);
                        } else { // initialize walltime-js if it doesn't yet 
                            WallTime["autoinit"] = true;
                            WallTime["init"](WallTime["data"]["rules"], WallTime["data"]["zones"]);
                        }
                    }
                }
                callback();
            });
            $A.enqueueAction(a);
        },

       /** 
        * @private
        */
        getUTCFromWallTime : function(d, timezone) {
            var ret = d;
            try {
                ret = WallTime["WallTimeToUTC"](timezone, d);
            } catch (e) {
                // The timezone id is invalid or for some reason, we can't get timezone info.
                // use default timezone
                timezone = $A.getGlobalValueProviders().get("$Locale.timezone");
                if (timezone == "GMT" || timezone == "UTC") {
                    return d;
        }
                try {
                    ret = WallTime["WallTimeToUTC"](timezone, d);
                } catch (ee) {}
            }
            return ret;
        },

       /** 
        * @private
        */
        getWallTimeFromUTC : function(d, timezone) {
            var ret = d;
            try {
                ret = WallTime["UTCToWallTime"](d, timezone)["wallTime"];
            } catch (e) {
                // The timezone id is invalid or for some reason, we can't get timezone info.
                // use default timezone
                timezone = $A.getGlobalValueProviders().get("$Locale.timezone");
                if (timezone == "GMT" || timezone == "UTC") {
                    return d;
                }
                try {
                    ret = WallTime["UTCToWallTime"](d, timezone)["wallTime"];
                } catch (ee) {}
            }
            return ret;
        },
        
        /**
         * Initialize localization service.
         * @private
         */
        init : function() {
            // Set global default language locale
            var defaultLangLocale = $A.getGlobalValueProviders().get("$Locale.langLocale");
            if (defaultLangLocale) {
                moment.lang(localizationService.getNormalizedLangLocale(defaultLangLocale));
            }
        }
    };
    //#include aura.AuraLocalizationService_export

    return localizationService;
};
