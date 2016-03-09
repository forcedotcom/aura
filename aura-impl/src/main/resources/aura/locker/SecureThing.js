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

	function SecureThing(thing, key) {
		setLockerSecret(this, "key", key);
		setLockerSecret(this, "ref", thing);
		Object.freeze(this);
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
			var key = getLockerSecret(st, "key");
			var hasAccess = $A.lockerService.util.hasAccess(st, originalValue);
			$A.assert(key, "A secure object should always have a key.");
			if ($A.util.isComponent(originalValue)) {
				swallowed = hasAccess ?
						new SecureComponent(originalValue, key) : new SecureComponentRef(originalValue, key);
				mutated = originalValue !== swallowed;
			} else if (isDOMElementOrNode(originalValue)) {
				swallowed = hasAccess ?
						new SecureElement(originalValue, key) : new SecureThing(originalValue, key);
				mutated = true;
			} else if ($A.lockerService.util.isKeyed(originalValue)) {
				swallowed = new SecureThing(originalValue, key);
				mutated = true;
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

	SecureThing.filterEverything = filterEverything;

	SecureThing.createFilteredMethod = function(methodName) {
		return {
			enumerable: true,
			value : function() {
				var thing = getLockerSecret(this, "ref");
				var raw = thing[methodName].apply(thing, arguments);
				return filterEverything(this, raw);
			}
		};
	};

	SecureThing.createFilteredProperty = function(propertyName) {
		return {
			enumerable: true,
			get : function() {
				var thing = getLockerSecret(this, "ref");
				var raw = thing[propertyName];
				return filterEverything(this, raw);
			}
		};
	};

	SecureThing.createPassThroughMethod = function(methodName) {
		return {
			enumerable: true,
			value : function() {
				var thing = getLockerSecret(this, "ref");
				return thing[methodName].apply(thing, arguments);
			}
		};
	};

	SecureThing.createPassThroughProperty = function(name) {
		return {
			enumerable: true,
			get : function() {
				return getLockerSecret(this, "ref")[name];
			},
			set : function(value) {
				getLockerSecret(this, "ref")[name] = value;
			}
		};
	};

	SecureThing.prototype = Object.create(null, {
		toString: {
			value: function () {
				return "SecureThing: " + getLockerSecret(this, "ref") + "{ key: " + JSON.stringify(getLockerSecret(this, "key")) + " }";
			}
		}
	});

	SecureThing.prototype.constructor = SecureThing;

	return SecureThing;

})();
