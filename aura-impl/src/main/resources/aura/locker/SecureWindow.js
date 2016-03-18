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
function SecureWindow(win, key) {
	"use strict";

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
		setTimeout: {
			enumerable: true,
			value: function (callback) {
				setTimeout.apply(win, [SecureThing.FunctionPrototypeBind.call(callback, o)].concat(SecureThing.ArrayPrototypeSlice.call(arguments, 1)));
			}
		},
		setInterval: {
			enumerable: true,
			value: function (callback) {
				setInterval.apply(win, [SecureThing.FunctionPrototypeBind.call(callback, o)].concat(SecureThing.ArrayPrototypeSlice.call(arguments, 1)));
			}
		},
		toString: {
			value: function() {
				return "SecureWindow: " + win + "{ key: " + JSON.stringify(key) + " }";
			}
		}
	});

	setLockerSecret(o, "key", key);
	setLockerSecret(o, "ref", win);
	return Object.seal(o);
}
