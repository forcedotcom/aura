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

//#include aura.locker.SecureThing
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
	 *            window - the DOM window
	 * @param {Object}
	 *            key - the key to apply to the secure window
	 */
	function SecureWindow(window, key) {
		SecureThing.call(this, key, "window");

		this._set("window", window, $A.lockerService.masterKey);
		Object.defineProperties(this, {
			document: {
				value: new SecureDocument(window.document, key)
			},
			"$A": {
				value: new SecureAura($A, key)
			},
			window: {
				get: function () {
					// circular window references to match DOM API
					return this;
				}
			}
		});
		Object.freeze(this);
	}

	function getWindow(sw) {
		return sw._get("window", $A.lockerService.masterKey);
	}

	function getKey(sw) {
		return $A.lockerService.util._getKey(sw, $A.lockerService.masterKey);
	}

	SecureWindow.prototype = Object.create(SecureThing.prototype, {
		toString: {
			value: function() {
				return "SecureWindow: " + getWindow(this) + "{ key: " + JSON.stringify(getKey(this)) + " }";
			}
		}
	});

	SecureWindow.prototype.constructor = SecureWindow;

	return SecureWindow;
})();
