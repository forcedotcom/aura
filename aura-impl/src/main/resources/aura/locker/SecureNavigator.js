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
 * Construct a SecureNavigator.
 *
 * @public
 * @class
 * @constructor
 *
 * @param {Object}
 *            navigator - the global navigator object
 * @param {Object}
 *            key - the key to apply to the secure navigator
 */
function SecureNavigator(navigator, key) {
	"use strict";

    var o = ls_getFromCache(navigator, key);
    if (o) {
        return o;
    }

	o = Object.create(null, {
		toString: {
			value: function() {
				return "SecureNavigator: " + navigator + "{ key: " + JSON.stringify(key) + " }";
			}
		}
	});

    ["appCodeName", "appName", "appVersion", "cookieEnabled", "geolocation",
     "language", "onLine", "platform", "product", "userAgent"].forEach(function(name) {
        SecureObject.addPropertyIfSupported(o, navigator, name);
    });

    ["mediaDevices", "mozGetUserMedia", "webkitGetUserMedia"].forEach(function(name) {
        SecureObject.addRTCMediaApis(o, navigator, name, key);
    });

    ls_setRef(o, navigator, key);
    ls_addToCache(navigator, o, key);
    ls_registerProxy(o);

    return o;
}