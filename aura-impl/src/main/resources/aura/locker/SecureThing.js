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

function SecureThing(thing, key) {
	"use strict";

	var o = Object.create(null, {
		toString: {
			value: function () {
				return "SecureThing: " + thing + "{ key: " + JSON.stringify(key) + " }";
			}
		}
	});

	setLockerSecret(o, "key", key);
	setLockerSecret(o, "ref", thing);
	return Object.seal(o);
}

SecureThing.isDOMElementOrNode = function(el) {
	"use strict";

	return typeof el === "object" &&
		((typeof HTMLElement === "object" && el instanceof HTMLElement) ||
		(typeof Node === "object" && el instanceof Node) ||
		(typeof el.nodeType === "number" && typeof el.nodeName === "string"));
};

SecureThing.filterEverything = function (st, raw) {
	"use strict";

	var t = typeof raw;
	var swallowed;
	var mutated = false;
	if (!raw) {
		// ignoring falsy, nully references
		return raw;
	} else if (t === "function") {
		// wrapping functions to guarantee that they run in system mode but their
		// returned value complies with user-mode.
		swallowed = function SecureFunction() {
			var fnReturnedValue = raw.apply(SecureThing.unfilterEverything(st, this), SecureThing.unfilterEverything(st, SecureThing.ArrayPrototypeSlice.call(arguments)));
			return SecureThing.filterEverything(st, fnReturnedValue);
		};
		mutated = true;
		setLockerSecret(swallowed, "ref", raw);
	} else if (t === "object") {
		var isNodeList = raw && (raw instanceof NodeList || raw instanceof HTMLCollection);
		if (raw === window) {
			return $A.lockerService.getEnv(getLockerSecret(st, "key"));
		} else if (raw === document) {
			return $A.lockerService.getEnv(getLockerSecret(st, "key")).document;
		} else if (Array.isArray(raw) || isNodeList) {
			swallowed = [];
			for (var n = 0; n < raw.length; n++) {
				var newValue = SecureThing.filterEverything(st, raw[n]);
				// TODO: NaN !== NaN
				swallowed.push(newValue);
				mutated = mutated || (newValue !== raw[n]);
			}
			setLockerSecret(swallowed, "ref", raw);
			// Decorate with .item() to preserve NodeList shape
			if (isNodeList) {
				Object.defineProperty(swallowed, "item", {
					value: function(index) {
						return swallowed[index];
					}
				});
			}
		} else {
			var key = getLockerSecret(st, "key");
			var hasAccess = $A.lockerService.util.hasAccess(st, raw);
			$A.assert(key, "A secure object should always have a key.");
			if ($A.util.isAction(raw)) {
				swallowed = hasAccess ?
						SecureAction(raw, key) : SecureThing(raw, key);
				mutated = raw !== swallowed;
			} else if ($A.util.isComponent(raw)) {
				swallowed = hasAccess ?
						SecureComponent(raw, key) : SecureComponentRef(raw, key);
				mutated = raw !== swallowed;
			} else if (SecureThing.isDOMElementOrNode(raw)) {
				swallowed = hasAccess ?
						SecureElement(raw, key) : SecureThing(raw, key);
				mutated = true;
			} else if ($A.lockerService.util.isKeyed(raw)) {
				swallowed = SecureThing(raw, key);
				mutated = true;
			} else {
				swallowed = {};
				for (var prop in raw) {
					swallowed[prop] = SecureThing.filterEverything(st, raw[prop]);
					mutated = mutated || (raw[prop] !== swallowed[prop]);
				}
				setLockerSecret(swallowed, "ref", raw);
			}
		}
	}
	return mutated ? swallowed : raw;
};

SecureThing.unfilterEverything = function(st, value) {
	"use strict";

	var t = typeof value;
	if (!value || (t !== "object" && t !== "function")) {
		// ignoring falsy, nully references, non-objects and non-functions
		return value;
	}
	var raw = getLockerSecret(value, "ref");
	if (raw) {
		// returning the raw value stored in the secure reference, which means
		// this value was original produced in system-mode
		return raw;
	}
	if (t === "function") {
		// wrapping functions to guarantee that they run in user-mode, usually
		// callback functions privided by non-privilege code.
		return function () {
			var fnReturnedValue = value.apply(SecureThing.filterEverything(st, this), SecureThing.filterEverything(st, SecureThing.ArrayPrototypeSlice.call(arguments)));
			return SecureThing.unfilterEverything(st, fnReturnedValue);
		};
	}
	if (Array.isArray(value)) {
		return value.map(function (v) {
			return SecureThing.unfilterEverything(st, v);
		});
	}
	if (t === "object") {
		var proxy = {};
		var mutated = false;
		for (var prop in value) {
			proxy[prop] = SecureThing.unfilterEverything(st, value[prop]);
			mutated = mutated || (value[prop] !== proxy[prop]);
		}
		if (mutated) {
			return proxy;
		}
	}

	return value;
};

SecureThing.createFilteredMethod = function(st, raw, methodName) {
	"use strict";

	return {
		enumerable: true,
		value : function() {
			var fnReturnedValue = raw[methodName].apply(raw, SecureThing.unfilterEverything(st, SecureThing.ArrayPrototypeSlice.call(arguments)));
			return SecureThing.filterEverything(st, fnReturnedValue);
		}
	};
};

SecureThing.createFilteredProperty = function(st, raw, propertyName) {
	"use strict";

	return {
		enumerable: true,
		get : function() {
			var value = raw[propertyName];
			return SecureThing.filterEverything(st, value);
		},
		set : function(value) {
			raw[propertyName] = SecureThing.unfilterEverything(st, value);
		}
	};
};

SecureThing.FunctionPrototypeBind = Function.prototype.bind;
SecureThing.ArrayPrototypeSlice = Array.prototype.slice;
