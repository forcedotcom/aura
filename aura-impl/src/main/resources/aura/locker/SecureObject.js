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

function SecureObject(thing, key) {
	"use strict";

	var o = Object.create(null, {
		toString: {
			value: function () {
				return "SecureObject: " + thing + "{ key: " + JSON.stringify(key) + " }";
			}
		}
	});

	setLockerSecret(o, "key", key);
	setLockerSecret(o, "ref", thing);

	$A.lockerService.markOpaque(o);

	return Object.seal(o);
}

SecureObject.isDOMElementOrNode = function(el) {
	"use strict";

	return typeof el === "object" &&
		((typeof HTMLElement === "object" && el instanceof HTMLElement) ||
		(typeof Node === "object" && el instanceof Node) ||
		(typeof el.nodeType === "number" && typeof el.nodeName === "string"));
};

function newWeakMap() {	
	return typeof WeakMap !== "undefined" ? new WeakMap() : {
		/* WeakMap dummy polyfill */
		"get": function () { 
			return undefined; 
		},
		"set": function () {}
	};
}

var rawToSecureObjectCaches = {};

SecureObject.addToCache = function(raw, so, key) {
	// Keep SecureObject's segregated by key
	var psuedoKeySymbol = JSON.stringify(key);
	var rawToSecureObjectCache = rawToSecureObjectCaches[psuedoKeySymbol];
	if (!rawToSecureObjectCache) {
		rawToSecureObjectCache = newWeakMap();
		rawToSecureObjectCaches[psuedoKeySymbol] = rawToSecureObjectCache;
	}
	
	rawToSecureObjectCache.set(raw, so);
};

SecureObject.getCached = function(raw, key) {
	var psuedoKeySymbol = JSON.stringify(key);
	var rawToSecureObjectCache = rawToSecureObjectCaches[psuedoKeySymbol];
	return rawToSecureObjectCache ? rawToSecureObjectCache.get(raw) : undefined;
};

SecureObject.filterEverything = function (st, raw, options) {
	"use strict";
	
	var key = getLockerSecret(st, "key");
	var cached = SecureObject.getCached(raw, key);
	if (cached) {
		return cached;
	}

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
			var fnReturnedValue = raw.apply(SecureObject.unfilterEverything(st, this), SecureObject.unfilterEverything(st, SecureObject.ArrayPrototypeSlice.call(arguments)));
			return SecureObject.filterEverything(st, fnReturnedValue);
		};
		mutated = true;
		setLockerSecret(swallowed, "ref", raw);
	} else if (t === "object") {
		var isNodeList = raw && (raw instanceof NodeList || raw instanceof HTMLCollection);
		if (raw === window) {
			return $A.lockerService.getEnv(key);
		} else if (raw === document) {
			return $A.lockerService.getEnv(key).document;
		} else if (Array.isArray(raw) || isNodeList) {
			swallowed = [];
			for (var n = 0; n < raw.length; n++) {
				var newValue = SecureObject.filterEverything(st, raw[n]);
				
				// TODO: NaN !== NaN
				
				if (!options || options.filterOpaque !== true || !$A.lockerService.isOpaque(newValue)) {
					swallowed.push(newValue);
				}
				
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
			var hasAccess = $A.lockerService.util.hasAccess(st, raw);
			$A.assert(key, "A secure object should always have a key.");

			if ($A.util.isAction(raw)) {
				swallowed = hasAccess ?
						SecureAction(raw, key) : SecureObject(raw, key);
				mutated = raw !== swallowed;
			} else if ($A.util.isComponent(raw)) {
				swallowed = hasAccess ?
						SecureComponent(raw, key) : SecureComponentRef(raw, key);
				mutated = raw !== swallowed;
			} else if (SecureObject.isDOMElementOrNode(raw)) {
				if (hasAccess || raw === document.body || raw === document.head) {
					swallowed = SecureElement(raw, key);
				} else if (!options || options.filterOpaque !== true) {
					swallowed = SecureObject(raw, key);
				} else {
					swallowed = undefined;
				}

				mutated = true;
			} else if (raw instanceof Aura.Event.Event) {
				swallowed = SecureAuraEvent(raw, key);
				mutated = true;
			} else if (raw instanceof Event) {
				swallowed = SecureDOMEvent(raw, key);
				mutated = true;
			} else if ($A.lockerService.util.isKeyed(raw)) {
				swallowed = SecureObject(raw, key);
				mutated = true;
			} else {
				swallowed = {};
				for (var prop in raw) {
					swallowed[prop] = SecureObject.filterEverything(st, raw[prop]);
					mutated = mutated || (raw[prop] !== swallowed[prop]);
				}
				setLockerSecret(swallowed, "ref", raw);
			}
		}
	}
	
	if (mutated) {
		SecureObject.addToCache(raw, swallowed, key);
		return swallowed;
	} else {
		return raw;
	}
};

SecureObject.unfilterEverything = function(st, value, visited) {
	"use strict";
	
	function memoize(visitedCache, v, unfiltered) {
		visitedCache.set(v, unfiltered);
		
		return unfiltered;
	}
	
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
	
	// Handle cyclic refs and duplicate object refs
	if (visited) {		
		var previous = visited.get(value);
		if (previous) {
			return previous;
		}
	} else {
		visited = newWeakMap();
	}

	if (t === "function") {
		// wrapping functions to guarantee that they run in user-mode, usually
		// callback functions privided by non-privilege code.
		return memoize(visited, value, function () {
			var filteredArguments = SecureObject.filterEverything(st, SecureObject.ArrayPrototypeSlice.call(arguments));
			var fnReturnedValue = value.apply(SecureObject.filterEverything(st, this), filteredArguments);
			return SecureObject.unfilterEverything(st, fnReturnedValue, visited);
		});
	}
	
	var proxy;
	if (Array.isArray(value)) {
		proxy = memoize(visited, value, []);
		
		value.forEach(function (v) {
			proxy.push(SecureObject.unfilterEverything(st, v, visited));
		});
		
		return proxy;
	} else if (t === "object") {
		proxy = memoize(visited, value, {});
		
		for (var prop in value) {
			proxy[prop] = SecureObject.unfilterEverything(st, value[prop], visited);
		}
		
		return proxy;
	}

	return value;
};

SecureObject.createFilteredMethod = function(st, raw, methodName, options) {
	"use strict";

	// Do not expose properties that the raw object does not actually support
	if (!(methodName in raw)) {
		if (options && options.ignoreNonexisting) {
			return undefined;
		} else {
			throw new $A.auraError("Underlying raw object " + raw + " does not support method: " + methodName);
		}
	}

	return {
		enumerable: true,
		value : function() {
			var args = SecureObject.ArrayPrototypeSlice.call(arguments);

			if (options && options.beforeCallback) {
				options.beforeCallback.apply(raw, args);
			}

			var unfilteredArgs = SecureObject.unfilterEverything(st, args);
			var fnReturnedValue = raw[methodName].apply(raw, unfilteredArgs);

			if (options && options.afterCallback) {
				fnReturnedValue = options.afterCallback(fnReturnedValue);
			}

			return SecureObject.filterEverything(st, fnReturnedValue, options);
		}
	};
};

SecureObject.createFilteredProperty = function(st, raw, propertyName, options) {
	"use strict";

	// Do not expose properties that the raw object does not actually support
	if (!(propertyName in raw)) {
		if (options && options.ignoreNonexisting) {
			return undefined;
		} else {
			throw new $A.auraError("Underlying raw object " + raw + " does not support property: " + propertyName);
		}
	}

	var descriptor = {
		enumerable: true
	};

	descriptor.get = function() {
		var value = raw[propertyName];
		
		if (options && options.afterGetCallback) {
			// The caller wants to handle the property value
			return options.afterGetCallback(value);
		} else {
			return SecureObject.filterEverything(st, value, options);
		}
	};

	if (!options || options.writable !== false) {
		descriptor.set = function(value) {
			if (options && options.beforeSetCallback) {
				value = options.beforeSetCallback(value);
			}

			raw[propertyName] = SecureObject.unfilterEverything(st, value);

			if (options && options.afterSetCallback) {
				options.afterSetCallback();
			}
		};
	}

	return descriptor;
};

SecureObject.addIfSupported = function(behavior, st, element, name, options) {
	options = options || {};
	options.ignoreNonexisting = true;

	var prop = behavior(st, element, name, options);
	if (prop) {
		Object.defineProperty(st, name, prop);
	}
};

SecureObject.addPropertyIfSupported = function(st, raw, name, options) {
	SecureObject.addIfSupported(SecureObject.createFilteredProperty, st, raw, name, options);
};

SecureObject.addMethodIfSupported = function(st, raw, name, options) {
	SecureObject.addIfSupported(SecureObject.createFilteredMethod, st, raw, name, options);
};

SecureObject.FunctionPrototypeBind = Function.prototype.bind;
SecureObject.ArrayPrototypeSlice = Array.prototype.slice;
