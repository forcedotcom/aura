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

SecureThing.filterEverything = function(st, raw, hash) {
	"use strict";

	var swallowed;
	var mutated = false;
	if (!raw) {
		return raw;
	}
	hash = hash || {};
	var isNodeList = raw instanceof NodeList;
	if (Array.isArray(raw) || isNodeList) {
		swallowed = [];
		for (var n = 0; n < raw.length; n++) {
			var newValue = SecureThing.filterEverything(st, raw[n]);
			// TODO: NaN !== NaN
			swallowed.push(newValue);
			mutated = mutated || (newValue !== raw[n]);
		}

		// Decorate with .item() to preserve NodeList shape
		if (isNodeList && mutated) {
			Object.defineProperty(swallowed, "item", {
				value: function(index) {
					return swallowed[index];
				}
			});
		}
	} else if (typeof raw === 'object') {
		var key = getLockerSecret(st, "key");
		var hasAccess = $A.lockerService.util.hasAccess(st, raw);
		$A.assert(key, "A secure object should always have a key.");
		if ($A.util.isComponent(raw)) {
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
		}
	}

	return mutated ? swallowed : raw;
};

SecureThing.createFilteredMethod = function(raw, methodName) {
	"use strict";

	return {
		enumerable: true,
		value : function() {
			var value = raw[methodName].apply(raw, arguments);
			return SecureThing.filterEverything(this, value);
		}
	};
};

SecureThing.createFilteredProperty = function(raw, propertyName) {
	"use strict";

	return {
		enumerable: true,
		get : function() {
			var value = raw[propertyName];
			return SecureThing.filterEverything(this, value);
		}
	};
};

SecureThing.createPassThroughMethod = function(raw, methodName) {
	"use strict";

	return {
		enumerable: true,
		value : function() {
			return raw[methodName].apply(raw, arguments);
		}
	};
};

SecureThing.createPassThroughProperty = function(raw, name) {
	"use strict";

	return {
		enumerable: true,
		get : function() {
			return raw[name];
		},
		set : function(value) {
			raw[name] = value;
		}
	};
};

SecureThing.FunctionPrototypeBind = Function.prototype.bind;
SecureThing.ArrayPrototypeSlice = Array.prototype.slice;
