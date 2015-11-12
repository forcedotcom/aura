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

var SecureThing = (function() {
	"use strict";
	/**
	 * Construct a new SecureThing.
	 *
	 * @public
	 * @class
	 * @constructor
	 *
	 * @param {String}
	 *            name - name of the secure getter for the wrapped thing
	 * @param {Object}
	 *            thing - the thing to be securely wrapped
	 */
	function SecureThing(key) {
		var things = {};

		LockerKeyUtil.applyKey(this, key);

		Object.defineProperty(this, "_get", {
			value : function(name, mk) {
				if (mk !== masterKey) {
					throw Error("Access denied");
				}

				return things[name];
			}
		});

		Object.defineProperty(this, "_set", {
			value : function(name, value, mk) {
				if (mk !== masterKey) {
					throw Error("Access denied");
				}

				things[name] = value;
			}
		});

		this._get = this["_get"];
		this._set = this["_set"];
	}

	return SecureThing;
})();
