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

//#include aura.locker.SecureDocument
//#include aura.locker.SecureAura

var SecureWindow = (function() {
	"use strict";

	/**
	 * Construct a new SecureWindow.
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
		setLockerSecret(this, "key", key);
		setLockerSecret(this, "ref", win);
		Object.defineProperties(this, {
			document: {
				enumerable: true,
				value: new SecureDocument(win.document, key)
			},
			"$A": {
				enumerable: true,
				value: new SecureAura(win['$A'], key)
			},
			window: {
				enumerable: true,
				get: function () {
					// circular window references to match DOM API
					return this;
				}
			},
			setTimeout: {
				enumerable: true,
				value: function (callback) {
					setTimeout.apply(win, [callback.bind(this)].concat(Array.prototype.slice.call(arguments, 1)));
				}
			},
			setInterval: {
				enumerable: true,
				value: function (callback) {
					setInterval.apply(win, [callback.bind(this)].concat(Array.prototype.slice.call(arguments, 1)));
				}
			}
		});
		Object.freeze(this);
	}

	SecureWindow.prototype = Object.create(null, {
		toString: {
			value: function() {
				return "SecureWindow: " + getLockerSecret(this, "ref") + "{ key: " + JSON.stringify(getLockerSecret(this, "key")) + " }";
			}
		}
	});

	SecureWindow.prototype.constructor = SecureWindow;

	return SecureWindow;
})();
