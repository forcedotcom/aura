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
/*jslint sub: true*/

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

	var su = Object.create(null);
	var sls = Object.create(null);
	var o = Object.create(null, {
		"util" : {
			enumerable : true,
			value : su
		},
		"localizationService" : {
			enumerable : true,
			value : sls
		},
		toString : {
			value : function() {
				return "SecureAura: " + AuraInstance + "{ key: " + JSON.stringify(key) + " }";
			}
		}
	});

	// SecureAura methods and properties
	[ "createComponent", "createComponents", "enqueueAction", "reportError", "get", "getCallback", "getComponent", "getRoot", "log", "warning" ]
			.forEach(function(name) {
				Object.defineProperty(o, name, SecureObject.createFilteredMethod(o, AuraInstance, name));
			});

	setLockerSecret(o, "key", key);
	setLockerSecret(o, "ref", AuraInstance);
	Object.seal(o);

	// SecureUtil: creating a proxy for $A.util
	[ "addClass", "getBooleanValue", "hasClass", "isArray", "isEmpty", "isObject", "isUndefined", "removeClass", "toggleClass" ].forEach(function(name) {
		Object.defineProperty(su, name, SecureObject.createFilteredMethod(su, AuraInstance["util"], name));
	});

	setLockerSecret(su, "key", key);
	setLockerSecret(su, "ref", AuraInstance["util"]);
	Object.seal(su);

	// SecureLocalizationService: creating a proxy for $A.localizationService
	[ "displayDuration", "displayDurationInDays", "displayDurationInHours", "displayDurationInMilliseconds", "displayDurationInMinutes",
			"displayDurationInMonths", "displayDurationInSeconds", "duration", "endOf", "formatCurrency", "formatDate", "formatDateTime", "formatDateTimeUTC",
			"formatDateUTC", "formatNumber", "formatPercent", "formatTime", "formatTimeUTC", "getDateStringBasedOnTimezone", "getDaysInDuration",
			"getDefaultCurrencyFormat", "getDefaultNumberFormat", "getDefaultPercentFormat", "getHoursInDuration", "getLocalizedDateTimeLabels",
			"getMillisecondsInDuration", "getMinutesInDuration", "getMonthsInDuration", "getNumberFormat", "getSecondsInDuration", "getToday",
			"getYearsInDuration", "isAfter", "isBefore", "isPeriodTimeView", "isSame", "parseDateTime", "parseDateTimeISO8601", "parseDateTimeUTC", "startOf",
			"toISOString", "translateFromLocalizedDigits", "translateFromOtherCalendar", "translateToLocalizedDigits", "translateToOtherCalendar",
			"UTCToWallTime", "WallTimeToUTC" ].forEach(function(name) {
		Object.defineProperty(sls, name, SecureObject.createFilteredMethod(sls, AuraInstance["localizationService"], name));
	});

	setLockerSecret(sls, "key", key);
	setLockerSecret(sls, "ref", AuraInstance["localizationService"]);
	Object.seal(sls);

	return o;
}
