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

//#include aura.locker.SecureDocument
//#include aura.locker.SecureComponent
var LockerService = window["LockerService"] = (function() {
	"use strict";

	var lockers = [];
	var keyToEnvironmentMap = {};

	var validSymbolNameRegEx = /^[a-z$_][a-z0-9$]*$/i;

	function getShadows(imports) {
		var globalKeys = Object.getOwnPropertyNames(window).concat(
			Object.getOwnPropertyNames(Object)).concat(Object.getOwnPropertyNames(Object.prototype));
			
		var candidates = [ "$A", "document", "window", "self", "top", "console", "Error" ].concat(globalKeys);

		function getInitialWhitelist(symbols) {
			var skip = {};

			for (var i = 0; i < symbols.length; i++) {
				var symbol = symbols[i];
				skip["#" + symbol] = true;
			}

			return skip;
		}

		// eval and arguments keywords are protected by strict mode
		var used = getInitialWhitelist([ "eval", "arguments", "undefined", "NaN", "Date", "Number", "Boolean" ]);

		var shadows = [];
		for (var n = 0; n < candidates.length; n++) {
			var candidate = candidates[n];
			var usedKey = "#" + candidate;
			if (!used[usedKey]) {
				if (!imports || !imports[candidate]) {
					// Skip over non-viable names
					if (validSymbolNameRegEx.test(candidate)) {
						shadows.push(candidate);
					}
				}

				used[usedKey] = true;
			}
		}

		return shadows;
	}

	function verifyShadows(expectedShadows, imports) {
		var shadows = getShadows(imports);
		if (shadows.length !== expectedShadows.length) {
			return false;
		}

		// DCHASMAN TODO Scan shadows and expected shadows for equality

		return true;
	}

	var service = {
		createForDef : function(code, def) {
			var namespace = def.getDescriptor().getNamespace();
			var key = LockerKeyUtil.getKeyForNamespace(namespace);

			// Key this def so we can transfer the key to component instances
			LockerKeyUtil.applyKey(def, key);

			return this.create(code, key);
		},

		create : function(code, key, imports) {
			return (function() {
				var shadows = getShadows(imports);

				var shadowingIIFESource = "function(" + shadows.toString() + ") {\n\"use strict\";\n" + code + "\n}";

				var locker;
				try {
					locker = $A.util.json.decode(shadowingIIFESource);
				} catch (x) {
					throw Error("Unable to create locker IIFE", x);
				}

				locker.verifyShadows = function() {
					return verifyShadows(shadows, imports);
				};

				// For debugging purposes only. We return a copy to avoid leaking a mutatable reference that would allow hacking of verifyShadows()!
				Object.defineProperty(locker, "$shadows", {
					get : function() {
						return shadows.slice(0);
					}
				});

				// DCHASMAN TODO Fix this - does not work correctly because objects are auto coerced to strings in javascript maps until ES6
				var psuedoKeySymbol = JSON.stringify(key);
				var env = keyToEnvironmentMap[psuedoKeySymbol];
				if (!env) {
					env = keyToEnvironmentMap[psuedoKeySymbol] = {
						sWindow : Object.create(Object.prototype, {
							toString : {
								value : function() {
									return "SecureWindow: { key: " + JSON.stringify(key) + " }";
								}
							}
						}),

						sAura : Object.create($A, {
							getComponent : {
								value : function(globalId) {
									// DCHASMAN TODO Wire up SecureComponent for scope awareness
									throw Error("No Access");
								}
							},

							toString : {
								value : function() {
									return "SecureAura: { key: " + JSON.stringify(key) + " }";
								}
							}
						}),

						sDocument : new SecureDocument(document, key)
					};

					LockerKeyUtil.applyKey(env.sAura, key);
					LockerKeyUtil.applyKey(env.sWindow, key);

					Object.freeze(env.sAura);
				}

				var sWindow = env.sWindow;
				var result = locker.call(sWindow, env.sAura, env.sDocument, sWindow, sWindow, sWindow, console, Error);

				Object.defineProperty(locker, "$result", {
					value : result
				});

				lockers.push(locker);

				Object.freeze(locker);

				return locker;
			})();
		},

		verifyAll : function() {
			for (var n = 0; n < lockers.length; n++) {
				var locker = lockers[n];
				if (!locker.verifyShadows()) {
					return false;
				}
			}

			return true;
		},

		destroy : function(locker) {
			var index = lockers.indexOf(locker);
			if (index >= 0) {
				lockers.splice(index, 1);
			}
		},

		destroyAll : function() {
			lockers = [];
		},

		wrapComponent : function(component, referencingKey) {
			if (!component) {
				return component;
			}

			var key = !referencingKey ? LockerKeyUtil._getKey(component, masterKey) : referencingKey;
			if (!key) {
				return component;
			}

			if (!referencingKey) {
				var def = component.getDef();
				if ($A.clientService.isPrivilegedNamespace(def.getDescriptor().getNamespace()) && !def.isInstanceOf("aura:requireLocker")) {
					return component;
				}
			}

			// Store the SC on the component???
			var sc = component["$lsComponent"];
			if (!sc) {
				sc = new SecureComponent(component, key);
				Object.defineProperty(component, "$lsComponent", {
					value : sc
				});
			}

			return sc;
		},

		unwrap : function(elements) {
			if (!LockerKeyUtil.isKeyed(elements)) {
				return elements;
			}

			if ($A.util.isArray(elements)) {
				for (var n = 0; n < elements.length; n++) {
					var value = elements[n];
					if (value && value.unwrap) {
						elements[n] = value.unwrap(masterKey);
					}
				}
			} else {
				if (elements && elements.unwrap) {
					elements = elements.unwrap(masterKey);
				}
			}

			return elements;
		},

		trust : function(from) {
			var key = LockerKeyUtil._getKey(from, masterKey);
			if (key) {
				for (var n = 1; n < arguments.length; n++) {
					LockerKeyUtil.applyKey(arguments[n], key);
				}
			}
		},

		showLockedNodes : function showLockedNodes(root) {
			if (LockerKeyUtil.isKeyed(root)) {
				$A.util.addClass(root, "lockerizedNode");
			}

			var children = root.childNodes;
			for (var i = 0; i < children.length; i++) {
				showLockedNodes(children[i]);
			}
		}
	};

	service["createForDef"] = service.createForDef;
	service["trust"] = service.trust;
	service["showLockedNodes"] = service.showLockedNodes;

	Object.freeze(service);

	return service;
})();
