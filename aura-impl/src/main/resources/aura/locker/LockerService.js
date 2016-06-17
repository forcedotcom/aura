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

//#include aura.locker.InlineSafeEval

function LockerService() {
	"use strict";

	var lockers = [];
	var keyToEnvironmentMap = {};
	var lockerShadows;

	// This whilelist represents reflective ECMAScript APIs or reflective DOM APIs
	// which, by definition, do not provide authority or access to globals.
	var whitelist = [
	    // Accessible Intrinsics (not reachable by own property name traversal)
	    // -> from ES5
	    "ThrowTypeError",
	    // -> from ES6.
	    "IteratorPrototype",
	    "ArrayIteratorPrototype",
	    "StringIteratorPrototype",
	    "MapIteratorPrototype",
	    "SetIteratorPrototype",
	    "GeneratorFunction",
	    "TypedArray",

	    // Intrinsics
	    // -> from ES5
	    "Function",
	    "WeakMap",
	    "StringMap",
	    // Proxy,
	    "escape",
	    "unescape",
	    "Object",
	    "NaN",
	    "Infinity",
	    "undefined",
	    // eval,
	    "parseInt",
	    "parseFloat",
	    "isNaN",
	    "isFinite",
	    "decodeURI",
	    "decodeURIComponent",
	    "encodeURI",
	    "encodeURIComponent",
	    "Function",
	    "Array",
	    "String",
	    "Boolean",
	    "Number",
	    "Math",
	    "Date",
	    "RegExp",
	    "Error",
	    "EvalError",
	    "RangeError",
	    "ReferenceError",
	    "SyntaxError",
	    "TypeError",
	    "URIError",
	    "JSON",
	    // -> from ES6
	    "ArrayBuffer",
	    "Int8Array",
	    "Uint8Array",
	    "Uint8ClampedArray",
	    "Int16Array",
	    "Uint16Array",
	    "Int32Array",
	    "Uint32Array",
	    "Float32Array",
	    "Float64Array",
	    "DataView",
	    "Promise",

	    // Misc
	    "Intl"
	];

	var nsKeys = {};
	var validLockSet = typeof WeakSet !== "undefined" ? new WeakSet() : {
			/*WeakSet dummy polyfill that does not enforce any verification on the locks */
			"add": function () {},
			"has": function () {
				return true;
			}
		};

	function masterKey() {/*lexical master key*/}

	getLockerSecret = function (st, type) {
		if (typeof st !== "object" && typeof st !== "function") {
			throw new TypeError("Secrets can only be stored in Objects and Functions.");
		}
		var lock = st["$ls" + type];
		if (lock && validLockSet["has"](lock)) {
			return lock(masterKey);
		} else if (lock) {
			throw new ReferenceError('Invalid Secure Object');
		}
	};

	setLockerSecret = function(st, type, secret) {
		function lock(mk) {
			if (mk !== masterKey) {
				throw new Error("Access denied");
			}
			return secret;
		}
		
		if (typeof st !== "object" && typeof st !== "function") {
			throw new TypeError("Secrets can only be retrieved from Objects and Functions.");
		}
		
		if (typeof st["$ls" + type] === 'function') {
			var existingSecret = getLockerSecret(st, type);
			if (existingSecret === secret) {
				// We allow NOOPs
				return;
			}
			
			throw new Error("Re-setting of " + type + " is prohibited");
		}
		
		validLockSet["add"](lock);
		Object.defineProperty(st, "$ls" + type, {
			value : lock
		});
	};
	
	// defining LockerService as a service
	var service = {
		isEnabled : function() {
			return $A.getContext().isLockerServiceEnabled;
		},
		
		createForDef : function(code, def) {
			var descriptor = def.getDescriptor();
			var namespace = descriptor.getNamespace();
			var name = descriptor.getName();
			var descriptorDebuggableURL = "components/" + namespace + "/" + name + ".js";
			var key = $A.lockerService.util.getKeyForNamespace(namespace);

			// Key this def so we can transfer the key to component instances
			$A.lockerService.util.applyKey(def, key);
			return this.create(code, key, descriptorDebuggableURL);
		},

		getEnv : function(key, doNotCreate) {
			var psuedoKeySymbol = JSON.stringify(key);
			var env = keyToEnvironmentMap[psuedoKeySymbol];
			if (!env && !doNotCreate) {
				env = keyToEnvironmentMap[psuedoKeySymbol] = SecureWindow(window, key, whitelist);
			}

			return env;
		},

		getEnvForSecureObject : function(st, doNotCreate) {
			var key = getLockerSecret(st, "key");
			return key && key !== masterKey ? this.getEnv(key, doNotCreate) : undefined;
		},

		create : function(code, key, optionalSourceURL) {
			var envRec = this.getEnv(key);
			var locker;
			if (!lockerShadows) {
				lazyInitInlinedSafeEvalWorkaround();

				// one time operation to lazily create this giant object with
				// the value of `undefined` to shadow every global binding in
				// `window`, except for those with no authority defined in the
				// `whitelist`. this object will be used as the base lexical
				// scope when evaluating all non-privilege components.
				lockerShadows = {};
				Object.getOwnPropertyNames(window).forEach(function (name) {
					// apply whitelisting to the lockerShadows
					// TODO: recursive to cover WindowPrototype properties as well
					var value = whitelist.indexOf(name) >= 0 ? window[name] : undefined;
					lockerShadows[name] = value;
				});
			}

			locker = {
				"$envRec": envRec,
				"$result": window['$$safe-eval$$'](code, optionalSourceURL, envRec, lockerShadows)
			};

			Object.freeze(locker);
			lockers.push(locker);
			return locker;
		},

		destroy : function(locker) {
			var index = lockers.indexOf(locker);
			if (index >= 0) {
				lockers.splice(index, 1);
			}
		},

		destroyAll : function() {
			lockers = [];
			keyToEnvironmentMap = [];
		},

		wrapComponent : function(component) {
			if (!$A.lockerService.isEnabled()) {
				return component;
			}
			
			if (typeof component !== "object") {
				return component;
			}

			var key = getLockerSecret(component, "key");
			if (!key) {
				return component;
			}

			var def = component.getDef();
			if ($A.clientService.isInternalNamespace(def.getDescriptor().getNamespace()) && !def.isInstanceOf("aura:requireLocker")) {
				return component;
			}

			return SecureComponent(component, key);
		},

		wrapComponentEvent : function(component, event) {
			if (!$A.lockerService.isEnabled()) {
				return event;
			}
			
			if (typeof event !== "object" || typeof component !== "object" || !$A.lockerService.util.isKeyed(component)) {
				return event;
			}
			
			// if the component is secure, the event have to be secure.
			var key = getLockerSecret(component, "key");
			return event instanceof Aura.Event.Event ? SecureAuraEvent(event, key) : SecureDOMEvent(event, key);
		},

		unwrap : function(st) {
			if (Array.isArray(st)) {
				return st.map(function (o) {
					return typeof o === 'object' && $A.lockerService.util.isKeyed(o) ? getLockerSecret(o, "ref") : o;
				});
			}
			return (typeof st === 'object' && getLockerSecret(st, "ref")) || st;
		},

		trust : function(from) {
			var key = getLockerSecret(from, "key");
			if (key) {
				for (var n = 1; n < arguments.length; n++) {
					$A.lockerService.util.applyKey(arguments[n], key);
				}
			}
		},

		markOpaque : function(st) {
			setLockerSecret(st, "opaque", true);
		},

		isOpaque : function(st) {
			var t = typeof st;
			return (t === "object" || t === "function") && getLockerSecret(st, "opaque") === true;
		},

		showLockedNodes : function showLockedNodes(root) {
			if (!root) {
				root = document;
			}

			if ($A.lockerService.util.isKeyed(root)) {
				$A.util.addClass(root, "lockerizedNode");
			}

			var children = root.childNodes;
			for (var i = 0; i < children.length; i++) {
				showLockedNodes(children[i]);
			}
		}

	};

	service.util = (function() {
		var util = {
			getKeyForNamespace : function(namespace) {
				// Get the locker key for this namespace
				var key = nsKeys[namespace];
				if (!key) {
					key = nsKeys[namespace] = Object.freeze({
						namespace: namespace
					});
				}

				return key;
			},

			isKeyed : function(thing) {
				return getLockerSecret(thing, "key") !== undefined;
			},

			hasAccess : function(from, to) {
				var fromKey = getLockerSecret(from, "key");
				var toKey = getLockerSecret(to, "key");

				return (fromKey === masterKey) || (fromKey === toKey);
			},

			verifyAccess : function(from, to, options) {
				if (!$A.lockerService.util.hasAccess(from, to) || (options && options.verifyNotOpaque && $A.lockerService.isOpaque(to))) {
					var fromKey = getLockerSecret(from, "key");
					var toKey = getLockerSecret(to, "key");

					throw new Error("Access denied: " + JSON.stringify({
						from : fromKey,
						to : toKey
					}));
				}
			},

			applyKey : function(thing, key) {
				setLockerSecret(thing, "key", key);
			}
		};

		Object.freeze(util);

		return util;
	})();

	service["createForDef"] = service.createForDef;
	service["getEnvForSecureObject"] = service.getEnvForSecureObject;
	service["trust"] = service.trust;
	service["showLockedNodes"] = service.showLockedNodes;

	Object.freeze(service);

	return service;
}

Aura.Services.LockerService = LockerService;
