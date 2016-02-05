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

	function isDOMElementOrNode(o) {
		return typeof o === "object" &&
			((typeof HTMLElement === "object" && o instanceof HTMLElement) ||
			(typeof Node === "object" && o instanceof Node) ||
			(typeof o.nodeType === "number" && typeof o.nodeName === "string"));
  }

	function filterEverything(st, originalValue) {
		var swallowed;
		var mutated = false;
		if (!originalValue) {
			return originalValue;
		}
		if (Array.isArray(originalValue)) {
			swallowed = [];
			for (var n = 0; n < originalValue.length; n++) {
				var newValue = filterEverything(st, originalValue[n]);
				// TODO: NaN !== NaN
				swallowed.push(newValue);
				mutated = mutated || (newValue !== originalValue[n]);
			}
		} else if (typeof originalValue === 'object') {
			if ($A.util.isComponent(originalValue)) {
				if (!$A.lockerService.util.hasAccess(st, originalValue)) {
					throw Error("Access denied");
				}
				swallowed = $A.lockerService.wrapComponent(originalValue, getKey(st));
				mutated = originalValue !== swallowed;
			} else if (isDOMElementOrNode(originalValue)) {
				swallowed = ($A.lockerService.util.hasAccess(st, originalValue) ? new SecureElement(originalValue, getKey(st)) : new ObscureThing(originalValue, getKey(st)));
				mutated = true;
			} else if (getKey(originalValue)) {
				if (!$A.lockerService.util.hasAccess(st, originalValue)) {
					throw Error("Access denied");
				}
			} else {
				swallowed = {};
				for (var prop in originalValue) {
					swallowed[prop] = filterEverything(st, originalValue[prop]);
					mutated = mutated || (originalValue[prop] !== swallowed[prop]);
				}
			}
		}
		return mutated ? swallowed : originalValue;
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
				var raw = thing[methodName].apply(thing, arguments);
				return filterEverything(this, raw);
			}
		};
	};

	SecureThing.createFilteredProperty = function(propertyName) {
		return {
			get : function() {
				var thing = primaryThing(this);
				var raw = thing[propertyName];
				return filterEverything(this, raw);
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

	SecureThing.prototype = {};
	SecureThing.prototype.constructor = SecureThing;

	return SecureThing;

})();
