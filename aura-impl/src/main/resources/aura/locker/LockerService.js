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

var getLockerSecret, setLockerSecret;

// DCHASMAN TODO Revert this after we clear issues with CKEditor and unsafe inline from W-3028925
function lazyInitInlinedSafeEvalWorkaround() {
	if (!window['$$safe-eval$$']) {
	  (function (window, placeholder, parent) {
	      'use strict';

	      // TODO: improve returnable detection. `function (...` is a trick used today
	      //       to return arbitrary code from actions, it should be legacy in the future.
	      var returnableEx = /^(\s*)([{(\["']|function\s*\()/;
	      // TODO: improve first comment removal
	      var trimFirstMultilineCommentEx = /^\/\*([\s\S]*?)\*\//;
	      var trimFirstLineCommentEx = /^\/\/.*\n?/;
	      var hookFn = '$globalEvalIIFE$';

	      // wrapping the source with `with` statements create a new lexical scope,
	      // that can prevent access to the globals in the worker by shodowing them
	      // with the members of new scopes passed as arguments into the `hookFn` call.
	      // additionally, when specified, strict mode will be enforced to avoid leaking
	      // global variables into the worker.
	      function addLexicalScopesToSource(src, options) {
	          // removing first line CSFR protection and other comments to facilitate
	          // the detection of returnable code
	          src = src.replace(trimFirstMultilineCommentEx, '');
	          src = src.replace(trimFirstLineCommentEx, '');
	          // only add return statement if source it starts with [, {, or (
	          var match = src.match(returnableEx);
	          if (match) {
	        	  src = src.replace(match[1], 'return ');
	          }
	          
	          if (options.useStrict) {
	        	  // forcing strict mode
	        	  src = '"use strict";\n' + src;
	          }
	        	
	          src = 'return (function(window){\n' + src + '\n}).call(arguments[0], arguments[0])';

	          for (var i = 0; i < options.levels; i++) {
	              src = 'with(arguments[' + i + ']||{}){' + src + '}';
	          }
	          var code = 'function ' + hookFn + '(){' + src + '}';
	          if (options.sourceURL) {
	              code += '\n//# sourceURL=' + options.sourceURL;
	          }
	          return code;
	      }

	      function evalAndReturn(src) {
	          var script = document.createElement('script');
	          script.type = 'text/javascript';
	          window[hookFn] = undefined;
	          script.appendChild(document.createTextNode(src));
	          placeholder.appendChild(script);
	          placeholder.removeChild(script);
	          var result = window[hookFn];
	          window[hookFn] = undefined;
	          return result;
	      }

	      // adding non-configurable hooks into parent window.
	      Object.defineProperties(parent, {
	          '$$safe-eval$$': {
	              value: function(src, optionalSourceURL) {
	                  if (!src) {
	                	  return undefined;
	                  }
	                  var args = Array.prototype.slice.call(arguments, 1);
	                  optionalSourceURL = typeof optionalSourceURL === "string" ? args.shift() : undefined;
	                  var fn = evalAndReturn(addLexicalScopesToSource(src, {
	                      levels: args.length,
	                      useStrict: true,
	                      sourceURL: optionalSourceURL
	                  }));
	                  return fn.apply(undefined, args);
	              }
	          }
	      });

	      // locking down the environment
	      try {
	          // @W-2961201: fixing properties of Object to comply with strict mode
	          // and ES2016 semantics, we do this by redefining them while in 'use strict'
	          // https://tc39.github.io/ecma262/#sec-object.prototype.__defineGetter__
	          [Object, parent.Object].forEach(function (o) {
	        	  if (o === undefined) {
	        		  return;
	        	  }

	              o.defineProperty(o.prototype, '__defineGetter__', {
	                  value: function (key, fn) {
	                      return o.defineProperty(this, key, {
	                          get: fn
	                      });
	                  }
	              });
	              o.defineProperty(o.prototype, '__defineSetter__', {
	                  value: function (key, fn) {
	                      return o.defineProperty(this, key, {
	                          set: fn
	                      });
	                  }
	              });
	              o.defineProperty(o.prototype, '__lookupGetter__', {
	                  value: function (key) {
	                      var d, p = this;
	                      while (p && (d = o.getOwnPropertyDescriptor(p, key)) === undefined) {
	                          p = o.getPrototypeOf(this);
	                      }
	                      return d ? d.get : undefined;
	                  }
	              });
	              o.defineProperty(o.prototype, '__lookupSetter__', {
	                  value: function (key) {
	                      var d, p = this;
	                      while (p && (d = o.getOwnPropertyDescriptor(p, key)) === undefined) {
	                          p = o.getPrototypeOf(this);
	                      }
	                      return d ? d.set : undefined;
	                  }
	              });
	              // Immutable Prototype Exotic Objects
	              // https://github.com/tc39/ecma262/issues/272
	              o.seal(o.prototype);
	          });
	      } catch (ignore) {
	    	  // Ignored
	      }
	  })(window, document.body, window);
	}
}

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
			throw new Error("Re-setting of " + type + " is prohibited");
		}
		validLockSet["add"](lock);
		Object.defineProperty(st, "$ls" + type, {
			value : lock
		});
	};

	// defining LockerService as a service
	var service = {
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
			return getLockerSecret(st, "opaque") === true;
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
