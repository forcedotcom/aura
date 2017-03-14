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
 * Factory for SecureAura objects.
 *
 * @param {Object}
 *            AuraInstance - the Aura Instance to be secured
 * @param {Object}
 *            key - the key to apply to the secure aura
 */
function SecureAura(AuraInstance, key) {
    "use strict";

    var o = ls_getFromCache(AuraInstance, key);
    if (o) {
        return o;
    }

    /**
     * Deep traverse an object and unfilter any Locker proxies. Isolate this logic here for the component
     * creation APIs rather than a more general solution to avoid overly aggressive unfiltering that may open
     * new security holes.
     */
    function deepUnfilterArgs(baseObject, members) {
        var value;
        for (var property in members) {
            value = members[property];
            if (value !== undefined && value !== null) {
                if (Array.isArray(value) || AuraInstance.util.isPlainObject(value)) {
                    var branchValue = baseObject[property];
                    baseObject[property] = deepUnfilterArgs(branchValue, value);
                    continue;
                } 
            }
            if (ls_isProxy(value)) {
                value = ls_getRef(value, key);
            }
            baseObject[property] = value;
        }
        return baseObject;
    }

    var su = Object.create(null);
    var sls = Object.create(null);
    o = Object.create(null, {
        "util" : {
            writable : true,
            enumerable : true,
            value : su
        },
        "localizationService" : {
            writable : true,
            enumerable : true,
            value : sls
        },
        "getCallback" : {
            value : function(f) {
                // If the results of $A.getCallback() is wired up to an event handler, passed as an attribute or aura event attribute etc it will get
                // filtered and wrapped with the caller's perspective at that time.
                return AuraInstance.getCallback(f);
            }
        },
        toString : {
            value : function() {
                return "SecureAura: " + AuraInstance + "{ key: " + JSON.stringify(key) + " }";
            }
        },

        "createComponent" : {
            enumerable : true,
            writable : true,
            value : function(type, attributes, callback) {
                // copy attributes before modifying so caller does not see unfiltered results
                var attributesCopy = AuraInstance.util.apply({}, attributes, true, true);
                var filteredArgs = attributes && AuraInstance.util.isObject(attributes) ? deepUnfilterArgs(attributesCopy, attributes) : attributes;
                var fnReturnedValue = AuraInstance.createComponent(type, filteredArgs, SecureObject.filterEverything(o, callback));
                return SecureObject.filterEverything(o, fnReturnedValue);
            }
        },

        "createComponents" : {
            enumerable : true,
            writable : true,
            value : function(components, callback) {
                var filteredComponents = [];
                if (Array.isArray(components)) {
                    for (var i = 0; i < components.length; i++) {
                        var filteredComponent = [];
                        filteredComponent[0] = components[i][0];
                        // copy attributes before modifying so caller does not see unfiltered results
                        var attributesCopy = AuraInstance.util.apply({}, components[i][1], true, true);
                        filteredComponent[1] = deepUnfilterArgs(attributesCopy, components[i][1]);
                        filteredComponents.push(filteredComponent);
                    }
                } else {
                    filteredComponents = components;
                }
                var fnReturnedValue = AuraInstance.createComponents(filteredComponents, SecureObject.filterEverything(o, callback));
                return SecureObject.filterEverything(o, fnReturnedValue);
            }
        }
    });

    // SecureAura methods and properties
    [ "enqueueAction" ].forEach(function(name) {
        Object.defineProperty(o, name, SecureObject.createFilteredMethod(o, AuraInstance, name, { rawArguments: true }));
    });

    [ "addEventHandler", "get", "getComponent", "getReference", "getRoot", "log", "removeEventHandler", "reportError", "warning" ].forEach(function(name) {
        Object.defineProperty(o, name, SecureObject.createFilteredMethod(o, AuraInstance, name));
    });

    ls_setRef(o, AuraInstance, key);
    Object.seal(o);

    // SecureUtil: creating a proxy for $A.util
    [ "addClass", "getBooleanValue", "hasClass", "isArray", "isEmpty", "isObject", "isUndefined", "isUndefinedOrNull", "removeClass", "toggleClass" ].forEach(function(name) {
        Object.defineProperty(su, name, SecureObject.createFilteredMethod(su, AuraInstance["util"], name));
    });

    ls_setRef(su, AuraInstance["util"], key);
    Object.seal(su);

    // SecureLocalizationService: creating a proxy for $A.localizationService
    [ "displayDuration", "displayDurationInDays", "displayDurationInHours", "displayDurationInMilliseconds", "displayDurationInMinutes",
        "displayDurationInMonths", "displayDurationInSeconds", "duration", "endOf", "formatCurrency", "formatDate", "formatDateTime", "formatDateTimeUTC",
        "formatDateUTC", "formatNumber", "formatPercent", "formatTime", "formatTimeUTC", "getDateStringBasedOnTimezone", "getDaysInDuration",
        "getDefaultCurrencyFormat", "getDefaultNumberFormat", "getDefaultPercentFormat", "getHoursInDuration", "getLocalizedDateTimeLabels",
        "getMillisecondsInDuration", "getMinutesInDuration", "getMonthsInDuration", "getNumberFormat", "getSecondsInDuration", "getToday",
        "getYearsInDuration", "isAfter", "isBefore", "isBetween", "isPeriodTimeView", "isSame", "parseDateTime", "parseDateTimeISO8601", "parseDateTimeUTC", "startOf",
        "toISOString", "translateFromLocalizedDigits", "translateFromOtherCalendar", "translateToLocalizedDigits", "translateToOtherCalendar",
        "UTCToWallTime", "WallTimeToUTC" ].forEach(function(name) {
            Object.defineProperty(sls, name, SecureObject.createFilteredMethod(sls, AuraInstance["localizationService"], name));
        });

    ls_setRef(sls, AuraInstance["localizationService"], key);
    Object.seal(sls);

    ls_addToCache(AuraInstance, o, key);
    ls_registerProxy(o);

    return o;
}
