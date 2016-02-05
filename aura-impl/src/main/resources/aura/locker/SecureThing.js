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

	function primaryThing(st) {
		return st._get(st._getPrimaryName($A.lockerService.masterKey), $A.lockerService.masterKey);
	}

	function getKey(st) {
		return $A.lockerService.util._getKey(st, $A.lockerService.masterKey);
	}

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
	function SecureThing(key, primaryName) {
		var _things = {};
		var _primaryName = primaryName;

		$A.lockerService.util.applyKey(this, key);

		Object.defineProperty(this, "_getPrimaryName", {
			value : function(mk) {
				if (mk !== $A.lockerService.masterKey) {
					throw Error("Access denied");
				}

				return _primaryName;
			}
		});

		Object.defineProperty(this, "_get", {
			value : function(name, mk) {
				if (mk !== $A.lockerService.masterKey) {
					throw Error("Access denied");
				}

				return _things[name];
			}
		});

		Object.defineProperty(this, "_set", {
			value : function(name, value, mk) {
				if (mk !== $A.lockerService.masterKey) {
					throw Error("Access denied");
				}

				_things[name] = value;
			}
		});

		this._getPrimaryName = this["_getPrimaryName"];
		this._get = this["_get"];
		this._set = this["_set"];
	}

	SecureThing.createFilteredMethod = function(methodName) {
		return {
			value : function() {
				var thing = primaryThing(this);
				return this.filterNodes(thing[methodName].apply(thing, arguments));
			}
		};
	};

	SecureThing.createFilteredProperty = function(propertyName) {
		return {
			get : function() {
				var thing = primaryThing(this);
				var raw = thing[propertyName];
				$A.lockerService.util.verifyAccess(this, raw);

				var key = getKey(this);
				return new SecureElement(raw, key);
			}
		};
	};

	SecureThing.createPassThroughMethod = function(methodName) {
		return {
			value : function() {
				var thing = primaryThing(this);
				return thing[methodName].apply(thing, arguments);
			}
		};
	};

	SecureThing.createPassThroughProperty = function(name) {
		return {
			get : function() {
				return primaryThing(this)[name];
			},
			set : function(value) {
				primaryThing(this)[name] = value;
			}
		};
	};

	SecureThing.prototype = {
		filterNodes: function(raw) {
			if (!raw) {
				return undefined;
			}

			var key = getKey(this);
			if (raw.length !== undefined) {
				var filtered = [];
				for (var n = 0; n < raw.length; n++) {
					var e = raw[n];
					if ($A.lockerService.util.hasAccess(this, e)) {
						filtered.push(new SecureElement(e, key));
					}
				}

				return filtered;
			} else {
				return $A.lockerService.util.hasAccess(this, raw) ? new SecureElement(raw, key) : undefined;
			}
		}
	};

	SecureThing.prototype.constructor = SecureThing;

	return SecureThing;

})();
