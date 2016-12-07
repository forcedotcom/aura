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
function LockerService() {
	"use strict";
	
	//#include aura.locker.InlineSafeEval
    //#include aura.locker.LockerKeyManager
    //#include aura.locker.SecureObject
    //#include aura.locker.SecureDOMEvent
    //#include aura.locker.SecureIFrameElement
    //#include aura.locker.SecureElement
    //#include aura.locker.SecureScriptElement
    //#include aura.locker.SecureDocument
    //#include aura.locker.SecureAura
    //#include aura.locker.SecureStorage
    //#include aura.locker.SecureMutationObserver
    //#include aura.locker.SecureNavigator
    //#include aura.locker.SecureXMLHttpRequest
    //#include aura.locker.SecureWindow
    //#include aura.locker.SecureAuraEvent
    //#include aura.locker.SecureAction
    //#include aura.locker.SecureComponent
    //#include aura.locker.SecureComponentRef

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
	    "Intl",

	    // passthroughs on document also available on window
	    "location"
	];

	var nsKeys = {};
    
	// defining LockerService as a service
	var service = {
		isEnabled : function() {
			return $A.getContext().isLockerServiceEnabled;
		},

		containerSupportsRequiredFeatures : function() {
			// Sniff for basic ES5 and strict mode support for Locker
			var isStrictModeAvailable = $A.util.globalEval("(function() { \"use strict\"; return this === undefined; })()");
			return isStrictModeAvailable && typeof Map !== "undefined" && Map.prototype["keys"] !== undefined && Map.prototype["values"] !== undefined && Map.prototype["entries"] !== undefined;
	    },
		
		createForDef : function(code, def) {
			var descriptor = def.getDescriptor();
			var namespace = descriptor.getNamespace();
			var name = descriptor.getName();
			var descriptorDebuggableURL = "components/" + namespace + "/" + name + ".js";
			var key = this.getKeyForNamespace(namespace);

			// Key this def so we can transfer the key to component instances
			ls_setKey(def, key);
			
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

        getKeyForNamespace : function(namespace) {
            // Get the locker key for this namespace
            var key = nsKeys[namespace];
            if (!key) {
                key = nsKeys[namespace] = Object.freeze({
                    "namespace": namespace
                });
            }

            return key;
        },

		getEnvForSecureObject : function(st, doNotCreate) {
			var key = ls_getKey(st);
			return key ? this.getEnv(key, doNotCreate) : undefined;
		},

		create : function(code, key, sourceURL, skipPreprocessing) {
			var envRec;

			if (!lockerShadows) {
				lazyInitInlinedSafeEvalWorkaround();
			}
			
			if (this.isEnabled()) {
				envRec = this.getEnv(key);
				if (!lockerShadows) {
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
			} else {
				// Degrade gracefully back to global window, no shadows, etc
				envRec = window;
				
				if (!lockerShadows) {
					lockerShadows = {};
				}
			}
			
			var locker = {
				"$envRec": envRec,
				"$result": window['$$safe-eval$$'](code, sourceURL, skipPreprocessing, envRec, lockerShadows)
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

            var key = ls_getKey(component);
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

			if (typeof event !== "object" || typeof component !== "object") {
				return event;
			}

            var key = ls_getKey(component);
            if (!key) {
                return event;
            }

			// if the component is secure, the event have to be secure.
			return event instanceof Aura.Event.Event ? SecureAuraEvent(event, key) : SecureDOMEvent(event, key);
		},

		unwrap : ls_unwrap,

		trust : ls_trust,

		showLockedNodes : function showLockedNodes(root) {
			if (!root) {
				root = document;
			}

			if (ls_getKey(root)) {
				$A.util.addClass(root, "lockerizedNode");
			}

			var children = root.childNodes;
			for (var i = 0; i < children.length; i++) {
				showLockedNodes(children[i]);
			}
		}

	};

	// Exports
	service["createForDef"] = service.createForDef;
	service["getEnvForSecureObject"] = service.getEnvForSecureObject;
	service["trust"] = service.trust;
	service["showLockedNodes"] = service.showLockedNodes;
	service["wrapComponent"] = service.wrapComponent;

	Object.freeze(service);

	return service;
}

Aura.Services.LockerService = LockerService;
