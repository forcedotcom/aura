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
var AuraLocalizationService = function AuraLocalizationService() {
    // moment.js and walltime-js must be loaded before we can use date/time related APIs
    var localizationService = {
        cache : {
            format : {},
            langLocale : {}
        },
        
        /**
         * Display a length of time.
         * @param {Duration} d the duration object returned by #LocalizationService.duration#
         * @param {String} unit the unit of measurement of time
         * @param {Boolean} noSuffix 
         * @return {String} duration object
         * @public
         */
        displayDuration : function(d, noSuffix) {
            return d["humanize"](noSuffix);
        },
        
        /**
         * Display a length of time in days.
         * @param {Duration} d the duration object returned by #LocalizationService.duration#
         * @return {Number} the length of time in days.
         * @public
         */
        displayDurationInDays : function(d) {
            return d["asDays"]();
        },
        
        /**
         * Display a length of time in hours.
         * @param {Duration} d the duration object returned by #LocalizationService.duration#
         * @return {Number} the length of time in hours.
         * @public
         */
        displayDurationInHours : function(d) {
            return d["asHours"]();
        },
        
        /**
         * Display a length of time in milliseconds.
         * @param {Duration} d the duration object returned by #LocalizationService.duration#
         * @return {Number} the length of time in milliseconds.
         * @public
         */
        displayDurationInMilliseconds : function(d) {
            return d["asMilliseconds"]();
        },
        
        /**
         * Display a length of time in minutes.
         * @param {Duration} d the duration object returned by #LocalizationService.duration#
         * @return {Number} the length of time in minutes.
         * @public
         */
        displayDurationInMinutes : function(d) {
            return d["asMinutes"]();
        },
        
        /**
         * Display a length of time in months.
         * @param {Duration} d the duration object returned by #LocalizationService.duration#
         * @return {Number} the length of time in months.
         * @public
         */
        displayDurationInMonths : function(d) {
            return d["asMonths"]();
        },
        
        /**
         * Display a length of time in seconds.
         * @param {Duration} d the duration object returned by #LocalizationService.duration#
         * @return {Number} the length of time in seconds.
         * @public
         */
        displayDurationInSeconds : function(d) {
            return d["asSeconds"]();
        },
        
        /**
         * Display a length of time in years.
         * @param {Duration} d the duration object returned by #LocalizationService.duration#
         * @return {Number} the length of time in years.
         * @public
         */
        displayDurationInYears : function(d) {
            return d["asYears"]();
        },
        
        /**
         * Create an object representing a length of time.
         * @param {Number|Object} num the length of milliseconds/unit
         * @param {String} unit the unit of measurement of time
         * @return {Object} duration object
         * @public
         */
        duration : function(num, unit) {
            return unit ? moment["duration"](num, unit) : moment["duration"](num);
        },
        
        /**
         * Convert the passed in Date by setting it to the end of a unit of time.
         * @param {String|Number|Date} date it could be anything that JS Date object can parse
         * @param {String} unit year, month, week, day, hour, minute or second
         * @return {Date}
         * @public
         */
        endOf : function(date, unit) {
            return (moment(date)["endOf"](unit)).toDate();
        },
        
        /**
         * Format a date.
         * @param {String|Number|Date} date the date to be formatted. It could be anything that JS Date object can parse
         * @param {String} formatString a Java format string. The default is from LocaleValueProvider
         * @param {String} locale a Java locale string. The default is from LocaleValueProvider
         * @return a formatted and localized date string
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
         * Format a date in UTC.
         * @param {String|Number|Date} date the date to be formatted. It could be anything that JS Date object can parse
         * @param {String} formatString a Java format string. The default is from LocaleValueProvider
         * @param {String} locale a Java locale string. The default is from LocaleValueProvider
         * @return a formatted and localized date string
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
         * Format a datetime.
         * @param {String|Number|Date} date the datetime to be formatted. It could be anything that JS Date object can parse
         * @param {String} formatString a Java format string. The default is from LocaleValueProvider
         * @param {String} locale a Java locale string. The default is from LocaleValueProvider
         * @return a formatted and localized datetime string
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
         * Format a datetime in UTC.
         * @param {String|Number|Date} date the datetime to be formatted. It could be anything that JS Date object can parse
         * @param {String} formatString a Java format string. The default is from LocaleValueProvider
         * @param {String} locale a Java locale string. The default is from LocaleValueProvider
         * @return a formatted and localized datetime string
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
         * Format a time.
         * @param {String|Number|Date} date the time to be formatted. It could be anything that JS Date object can parse
         * @param {String} formatString a Java format string. The default is from LocaleValueProvider
         * @param {String} locale a Java locale string. The default is from LocaleValueProvider
         * @return a formatted and localized time string
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
         * Format a time in UTC.
         * @param {String|Number|Date} date the time to be formatted. It could be anything that JS Date object can parse
         * @param {String} formatString a Java format string. The default is from LocaleValueProvider
         * @param {String} locale a Java locale string. The default is from LocaleValueProvider
         * @return a formatted and localized time string
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

        formatNumber : function(number, formatter) {

        },

        formatCurrency : function(amount, formatter) {

        },
        
        /**
         * Get the number of hours in a duration.
         * @param {Duration} d the duration object returned by #LocalizationService.duration#
         * @return {Number} the number of hours in d.
         * @public
         */
        getHoursInDuration : function(d) {
            return d["hours"]();
        },
        
        /**
         * Get the number of milliseconds in a duration.
         * @param {Duration} d the duration object returned by #LocalizationService.duration#
         * @return {Number} the number of milliseconds in d.
         * @public
         */
        getMillisecondsInDuration : function(d) {
            return d["milliseconds"]();
        },
        
        /**
         * Get the number of minutes in a duration.
         * @param {Duration} d the duration object returned by #LocalizationService.duration#
         * @return {Number} the number of minutes in d.
         * @public
         */
        getMinutesInDuration : function(d) {
            return d["minutes"]();
        },
        
        /**
         * Get the number of months in a duration.
         * @param {Duration} d the duration object returned by #LocalizationService.duration#
         * @return {Number} the number of months in d.
         * @public
         */
        getMonthsInDuration : function(d) {
            return d["months"]();
        },
        
        /**
         * Get the number of seconds in a duration.
         * @param {Duration} d the duration object returned by #LocalizationService.duration#
         * @return {Number} the number of seconds in d.
         * @public
         */
        getSecondsInDuration : function(d) {
            return d["seconds"]();
        },
                
        /**
         * Get the number of years in a duration.
         * @param {Duration} d the duration object returned by #LocalizationService.duration#
         * @return {Number} the number of years in d.
         * @public
         */
        getYearsInDuration : function(d) {
            return d["years"]();
        },
        
        /**
         * Check if date1 is after date2.
         * @param {String|Number|Date} date1 it could be anything that JS Date object can parse
         * @param {String|Number|Date} date2 it could be anything that JS Date object can parse
         * @param {String} unit the unit to limit the granularity, that is, year, month, week, day, hour, minute and second.
         *                 By default it uses millisecond
         * @return {Boolean}
         * @public
         */ 
        isAfter : function(date1, date2, unit) {
            return moment(date1)["isAfter"](date2, unit);
        },
        
        /**
         * Check if date1 is before date2.
         * @param {String|Number|Date} date1 it could be anything that JS Date object can parse
         * @param {String|Number|Date} date2 it could be anything that JS Date object can parse
         * @param {String} unit the unit to limit the granularity, that is, year, month, week, day, hour, minute and second.
         *                 By default it uses millisecond
         * @return {Boolean}
         * @public
         */
        isBefore : function(date1, date2, unit) {
            return moment(date1)["isBefore"](date2, unit);
        },
        
        /**
         * Check if date1 is the same as date2.
         * @param {String|Number|Date} date1 it could be anything that JS Date object can parse
         * @param {String|Number|Date} date2 it could be anything that JS Date object can parse
         * @param {String} unit the unit to limit the granularity, that is, year, month, week, day, hour, minute and second.
         *                 By default it uses millisecond
         * @return {Boolean}
         * @public
         */
        isSame : function(date1, date2, unit) {
            return moment(date1)["isSame"](date2, unit);
        },

        /**
         * Parse a string to a JavaScript Date.
         * @param {String} dateTimeString the datetime string to be parsed
         * @param {String} targetFormat a Java format string which is used to parse datetime. The default is from LocaleValueProvider
         * @param {String} locale a Java locale string used to parse datetime. The default is from LocaleValueProvider
         * @return a JavaScript Date object
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
        },
        
        /**
         * Parse a string to a JavaScript Date in UTC.
         * @param {String} dateTimeString the datetime string to be parsed
         * @param {String} targetFormat a Java format string which is used to parse datetime. The default is from LocaleValueProvider
         * @param {String} locale a Java locale string used to parse datetime. The default is from LocaleValueProvider
         * @return a JavaScript Date object
         * @public
         */
        parseDateTimeUTC : function(dateTimeString, targetFormat, locale) {
            if (!dateTimeString && !targetFormat) {
                return null;
            }
            
            var mDate = moment["utc"](dateTimeString, localizationService.getNormalizedFormat(targetFormat), localizationService.getNormalizedLangLocale(locale));
            if (mDate["isValid"]()) {
                return mDate["toDate"]();
            }
            return null;
        },
        
        /**
         * Convert the passed in Date by setting it to the start of a unit of time.
         * @param {String|Number|Date} date it could be anything that JS Date object can parse
         * @param {String} unit year, month, week, day, hour, minute or second
         * @return {Date}
         * @public
         */
        startOf : function(date, unit) {
            return (moment(date)["startOf"](unit)).toDate();
        },
        
        /**
         * Convert a datetime from UTC to a specified timezone.
         * @param {Date} date a JavaScript Date object
         * @param {String} timezone a time zone id, for example, America/Los_Angeles
         * @param {Function} callback a function to be called after the conversion is done
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
         * Convert a datetime from a specified timezone to UTC.
         * @param {Date} date a JavaScript Date object
         * @param {String} timezone a time zone id, for example, America/Los_Angeles
         * @param {Function} callback a function to be called after the conversion is done
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
        }
    };
    //#include aura.AuraLocalizationService_export

    return localizationService;
};
