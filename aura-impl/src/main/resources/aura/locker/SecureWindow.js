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
 * Construct a SecureWindow.
 *
 * @public
 * @class
 * @constructor
 *
 * @param {Object}
 *            win - the DOM window
 * @param {Object}
 *            key - the key to apply to the secure window
 */
function SecureWindow(win, key, globalAttributeWhitelist) {
	"use strict";
	
    var hostedDefinedGlobals = ["alert", "clearInterval", "clearTimeout", "confirm", "console", "location", "Node"];

	var o = Object.create(null, {
		document: {
			enumerable: true,
			value: SecureDocument(win.document, key)
		},
		"$A": {
			enumerable: true,
			value: SecureAura(win['$A'], key)
		},
		window: {
			enumerable: true,
			get: function () {
				// circular window references to match DOM API
				return o;
			}
		},
		navigator: {
			enumerable: true,
			value: SecureNavigator(win.navigator, key)
		},
		XMLHttpRequest: {
			enumerable: true,
			value: SecureXMLHttpRequest(key)
		},
		setTimeout: {
			enumerable: true,
			value: function (callback) {
				setTimeout.apply(win, [SecureObject.FunctionPrototypeBind.call(callback, o)].concat(SecureObject.ArrayPrototypeSlice.call(arguments, 1)));
			}
		},
		setInterval: {
			enumerable: true,
			value: function (callback) {
				setInterval.apply(win, [SecureObject.FunctionPrototypeBind.call(callback, o)].concat(SecureObject.ArrayPrototypeSlice.call(arguments, 1)));
			}
		},
		toString: {
			value: function() {
				return "SecureWindow: " + win + "{ key: " + JSON.stringify(key) + " }";
			}
		}
	});

	SecureElement.addSecureGlobalEventHandlers(o, win, key);
	SecureElement.addEventTargetMethods(o, win, key);

	setLockerSecret(o, "key", key);
	setLockerSecret(o, "ref", win);

	// Has to happen last because it depends on the secure getters defined above that require the object to be keyed
	globalAttributeWhitelist.forEach(function(name) {
		// These are direct passthrough's and should never be wrapped in a SecureObject
		Object.defineProperty(o, name, {
			enumerable: true,
			value: win[name]
		});
	});

	hostedDefinedGlobals.forEach(function(name) {
		if (!o[name]) {
			// These are direct passthrough's and should never be wrapped in a SecureObject
			var value = win[name];
			Object.defineProperty(o, name, {
				enumerable: true,
				value: value.bind ? value.bind(win) : value
			});
		}
	});

	return o;
}
