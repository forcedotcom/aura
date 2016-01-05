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

//#include aura.locker.SecureWindow
//#include aura.locker.SecureComponent

function LockerService() {
	"use strict";

	var lockers = [];
	var keyToEnvironmentMap = {};

	var service = {
		createForDef : function(code, def) {
			var namespace = def.getDescriptor().getNamespace();
			var key = $A.lockerService.util.getKeyForNamespace(namespace);

			// Key this def so we can transfer the key to component instances
			$A.lockerService.util.applyKey(def, key);

			return this.create(code, key);
		},

		getEnv : function(key) {
			var psuedoKeySymbol = JSON.stringify(key);
			var env = keyToEnvironmentMap[psuedoKeySymbol];
			if (!env) {
				env = keyToEnvironmentMap[psuedoKeySymbol] = new SecureWindow(window, key);
			}
			return env;
		},

		create : function(code, key, imports) {
			var envRec = this.getEnv(key);
			var locker;
			try {
				locker = {
					"$envRec": envRec,
					"$result": window['$$safe-eval$$'](code, envRec, imports)
				};
			} catch (x) {
				throw new Error("Unable to create locker IIFE: " + x);
			}
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

		wrapComponent : function(component, referencingKey) {
			if (!component) {
				return component;
			}

			var key = !referencingKey ? $A.lockerService.util._getKey(component, $A.lockerService.masterKey) : referencingKey;
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
			if (!$A.lockerService.util.isKeyed(elements)) {
				return elements;
			}

			if ($A.util.isArray(elements)) {
				for (var n = 0; n < elements.length; n++) {
					var value = elements[n];
					if (value && value.unwrap) {
						elements[n] = value.unwrap($A.lockerService.masterKey);
					}
				}
			} else {
				if (elements && elements.unwrap) {
					elements = elements.unwrap($A.lockerService.masterKey);
				}
			}

			return elements;
		},

		trust : function(from) {
			var key = $A.lockerService.util._getKey(from, $A.lockerService.masterKey);
			if (key) {
				for (var n = 1; n < arguments.length; n++) {
					$A.lockerService.util.applyKey(arguments[n], key);
				}
			}
		},

		showLockedNodes : function showLockedNodes(root) {
			if ($A.lockerService.util.isKeyed(root)) {
				$A.util.addClass(root, "lockerizedNode");
			}

			var children = root.childNodes;
			for (var i = 0; i < children.length; i++) {
				showLockedNodes(children[i]);
			}
		},

		// Master key will be hidden by both locker shadowing and scope
		masterKey : Object.freeze({
			name : "master"
		})
	};

	service.util = (function() {
		var lockerNamespaceKeys = {};

		function getKey(thing) {
			var f = thing["$lsKey"];
			return f ? f($A.lockerService.masterKey) : undefined;
		}

		var util = {
			getKeyForNamespace : function(namespace) {
		    	// Get the locker key for this namespace
				var key = lockerNamespaceKeys[namespace];
				if (!key) {
		    		key = lockerNamespaceKeys[namespace] = Object.freeze({
		    			namespace: namespace
		    		});
				}

				return key;
			},

			_getKey : function(thing, mk) {
				if (mk !== $A.lockerService.masterKey) {
					throw Error("Access denied");
				}

				return getKey(thing);
			},

			isKeyed : function(thing) {
				return getKey(thing) !== undefined;
			},

			hasAccess : function(from, to) {
				var fromKey = getKey(from);
				var toKey = getKey(to);

				return (fromKey === $A.lockerService.masterKey) || (fromKey === toKey);
			},

			verifyAccess : function(from, to) {
				if (!$A.lockerService.util.hasAccess(from, to)) {
					var fromKey = getKey(from);
					var toKey = getKey(to);

					throw new Error("Access denied: " + JSON.stringify({
						from : fromKey,
						to : toKey
					}));
				}
			},

			applyKey : function(thing, key) {
				var keyToCheck = getKey(thing);
				if (!keyToCheck) {
					Object.defineProperty(thing, "$lsKey", {
						value : function(mk) {
							if (mk !== $A.lockerService.masterKey) {
								throw new Error("Access denied");
							}

							return key;
						}
					});
				} else {
					if (keyToCheck !== key) {
						throw new Error("Re-keying of " + thing + " is prohibited");
					}
				}
			}
		};

		Object.freeze(util);

		return util;
	})();

	service["createForDef"] = service.createForDef;
	service["trust"] = service.trust;
	service["showLockedNodes"] = service.showLockedNodes;

	Object.freeze(service);

	return service;
}

Aura.Services.LockerService = LockerService;
