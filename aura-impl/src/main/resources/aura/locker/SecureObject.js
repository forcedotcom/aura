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

function SecureObject(thing, key) {
	"use strict";

	var o = Object.create(null, {
		toString : {
			value : function() {
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

	return typeof el === "object"
			&& ((typeof HTMLElement === "object" && el instanceof HTMLElement) || (typeof Node === "object" && el instanceof Node) || (typeof el.nodeType === "number" && typeof el.nodeName === "string"));
};

function newWeakMap() {
	return typeof WeakMap !== "undefined" ? new WeakMap() : {
		/* WeakMap dummy polyfill */
		"get" : function() {
			return undefined;
		},
		"set" : function() {
		}
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

SecureObject.filterEverything = function(st, raw, options) {
	"use strict";

	if (!raw) {
		// ignoring falsy, nully references.
		return raw;
	}

	var t = typeof raw;
	if (t === "object") {
		if (raw instanceof File || raw instanceof FileList || raw instanceof CSSStyleDeclaration || raw instanceof TimeRanges || 
				(window.ValidityState && raw instanceof ValidityState)) {
			// Pass thru for objects without privileges.
			return raw;
		}
	}

	function filterOpaque(opts, so) {
		return opts && opts.filterOpaque === true && $A.lockerService.isOpaque(so);
	}

	var key = getLockerSecret(st, "key");
	var cached = SecureObject.getCached(raw, key);
	if (cached) {
		return !filterOpaque(options, cached) ? cached : undefined;
	}

	var swallowed;
	var mutated = false;
	if (t === "function") {
		// wrapping functions to guarantee that they run in system mode but their
		// returned value complies with user-mode.
		swallowed = function SecureFunction() {
			var fnReturnedValue = raw.apply(SecureObject.unfilterEverything(st, this), SecureObject.unfilterEverything(st, SecureObject.ArrayPrototypeSlice.call(arguments)));
			return SecureObject.filterEverything(st, fnReturnedValue);
		};
		mutated = true;
		setLockerSecret(swallowed, "ref", raw);
	} else if (t === "object") {
		if (raw === window) {
			return $A.lockerService.getEnv(key);
		} else if (raw === document) {
			return $A.lockerService.getEnv(key).document;
		}

		var isNodeList = raw && (raw instanceof NodeList || raw instanceof HTMLCollection);
		if (Array.isArray(raw) || isNodeList) {
			swallowed = [];
			for (var n = 0; n < raw.length; n++) {
				var newValue = SecureObject.filterEverything(st, raw[n]);

				// TODO: NaN !== NaN

				if (!filterOpaque(options, newValue)) {
					swallowed.push(newValue);
				}

				mutated = mutated || (newValue !== raw[n]);
			}

			setLockerSecret(swallowed, "ref", raw);

			// Decorate with .item() to preserve NodeList shape
			if (isNodeList) {
				Object.defineProperty(swallowed, "item", {
					value : function(index) {
						return swallowed[index];
					}
				});
			}
		} else {
			var hasAccess = $A.lockerService.util.hasAccess(st, raw);
			$A.assert(key, "A secure object should always have a key.");
			if ($A.util.isAction(raw)) {
				swallowed = hasAccess ? SecureAction(raw, key) : SecureObject(raw, key);
				mutated = raw !== swallowed;
			} else if ($A.util.isComponent(raw)) {
				swallowed = hasAccess ? SecureComponent(raw, key) : SecureComponentRef(raw, key);
				mutated = raw !== swallowed;
			} else if (SecureObject.isDOMElementOrNode(raw)) {
				if (hasAccess || raw === document.body || raw === document.head) {
					swallowed = SecureElement(raw, key);
				} else if (!options || options.filterOpaque !== true) {
					swallowed = SecureObject(raw, key);
				} else {
					swallowed = options.defaultValue;
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
				mutated = true;
				setLockerSecret(swallowed, "key", key);
				setLockerSecret(swallowed, "ref", raw);
				SecureObject.addToCache(raw, swallowed, key);

				for ( var name in raw) {
					if (typeof raw[name] === "function") {
						Object.defineProperty(swallowed, name, SecureObject.createFilteredMethod(swallowed, raw, name, {
							filterOpaque : true
						}));
					} else {
						Object.defineProperty(swallowed, name, SecureObject.createFilteredProperty(swallowed, raw, name, {
							filterOpaque : true
						}));
					}
				}
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
		try {
			visitedCache.set(v, unfiltered);
		} catch (ignore) { /* ignored */
		}

		return unfiltered;
	}

	var t = typeof value;

	if (!value || (t !== "object" && t !== "function") || value === window || value === document || value instanceof File || value instanceof FileList) {
		// ignoring falsy, nully references, non-objects and non-functions, global window/document, and any passthroughs
		// from filterEverything
		return value;
	}

	var isArray = Array.isArray(value);

	var raw = getLockerSecret(value, "ref");
	if (raw) {
		// If this is an array make sure that the backing array is updated to match the system mode proxy that might have been manipulated
		if (isArray) {
			raw.length = 0;
			value.forEach(function(v) {
				raw.push(SecureObject.unfilterEverything(st, v, visited));
			});
		}

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
		return memoize(visited, value, function() {
			var filteredArguments = SecureObject.filterEverything(st, SecureObject.ArrayPrototypeSlice.call(arguments));
			var fnReturnedValue = value.apply(SecureObject.filterEverything(st, this), filteredArguments);
			return SecureObject.unfilterEverything(st, fnReturnedValue, visited);
		});
	}

	var proxy;
	if (isArray) {
		proxy = memoize(visited, value, []);

		value.forEach(function(v) {
			proxy.push(SecureObject.unfilterEverything(st, v, visited));
		});

		return proxy;
	} else if (t === "object") {
		proxy = memoize(visited, value, {});

		for ( var prop in value) {
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
		enumerable : true,
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

	// Do not expose properties that the raw object does not actually support.
	if (!(propertyName in raw)) {
		if (options && options.ignoreNonexisting) {
			return undefined;
		} else {
			throw new $A.auraError("Underlying raw object " + raw + " does not support property: " + propertyName);
		}
	}

	var descriptor = {
		enumerable : true
	};

	descriptor.get = function() {
		var value = raw[propertyName];

		// Continue from the current object until we find an acessible object.
		if (options && options.skipOpaque === true) {
			while (value) {
				var hasAccess = $A.lockerService.util.hasAccess(st, value);
				if (hasAccess || value === document.body || value === document.head) {
					break;
				}
				value = value[propertyName];
			}
		}

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

function getSupportedInterfaces(o) {
	// Return the set of interfaces supported by the object in order of most specific to least specific
	var interfaces = [];
	if (o instanceof Window) {
		interfaces.push("Window", "EventTarget");
	} else if (o instanceof Document) {
		if (o instanceof HTMLDocument) {
			interfaces.push("HTMLDocument");
		}
		interfaces.push("Document", "Node", "EventTarget");
	} else if(o instanceof DocumentFragment){
		interfaces.push("Node", "EventTarget");
	} else if (o instanceof Element) {
		if (o instanceof HTMLElement) {
			// Look for all HTMLElement subtypes
			if (o instanceof HTMLAnchorElement) {
				interfaces.push("HTMLAnchorElement");
			} else if (o instanceof HTMLAreaElement) {
				interfaces.push("HTMLAreaElement");
			} else if (o instanceof HTMLAudioElement) {
				interfaces.push("HTMLAudioElement");
			} else if (o instanceof HTMLMediaElement) {
				interfaces.push("HTMLMediaElement");
			} else if (o instanceof HTMLBaseElement) {
				interfaces.push("HTMLBaseElement");
			} else if (o instanceof HTMLButtonElement) {
				interfaces.push("HTMLButtonElement");
			} else if (o instanceof HTMLCanvasElement) {
				interfaces.push("HTMLCanvasElement");
			} else if (o instanceof HTMLTableColElement) {
				interfaces.push("HTMLTableColElement");
			} else if (o instanceof HTMLModElement) {
				interfaces.push("HTMLModElement");
			// This type has browser compatibility issues currently and have to be guarded
			} else if (window.HTMLDetailsElement && o instanceof window.HTMLDetailsElement) {
				interfaces.push("HTMLDetailsElement");
			} else if (o instanceof HTMLEmbedElement) {
				interfaces.push("HTMLEmbedElement");
			} else if (o instanceof HTMLFieldSetElement) {
				interfaces.push("HTMLFieldSetElement");
			} else if (o instanceof HTMLFormElement) {
				interfaces.push("HTMLFormElement");
			} else if (o instanceof HTMLIFrameElement) {
				interfaces.push("HTMLIFrameElement");
			} else if (o instanceof HTMLImageElement) {
				interfaces.push("HTMLImageElement");
			} else if (o instanceof HTMLInputElement) {
				interfaces.push("HTMLInputElement");
			} else if (o instanceof HTMLLabelElement) {
				interfaces.push("HTMLLabelElement");
			} else if (o instanceof HTMLLIElement) {
				interfaces.push("HTMLLIElement");
			} else if (o instanceof HTMLLinkElement) {
				interfaces.push("HTMLLinkElement");
			} else if (o instanceof HTMLMapElement) {
				interfaces.push("HTMLMapElement");
			} else if (o instanceof HTMLMetaElement) {
				interfaces.push("HTMLMetaElement");
			// This type has browser compatibility issues currently and have to be guarded
			} else if (window.HTMLMeterElement && o instanceof window.HTMLMeterElement) {
				interfaces.push("HTMLMeterElement");
			} else if (o instanceof HTMLObjectElement) {
				interfaces.push("HTMLObjectElement");
			} else if (o instanceof HTMLOListElement) {
				interfaces.push("HTMLOListElement");
			} else if (o instanceof HTMLOptGroupElement) {
				interfaces.push("HTMLOptGroupElement");
			} else if (o instanceof HTMLOptionElement) {
				interfaces.push("HTMLOptionElement");
			} else if (o instanceof HTMLOutputElement) {
				interfaces.push("HTMLOutputElement");
			} else if (o instanceof HTMLParamElement) {
				interfaces.push("HTMLParamElement");
			} else if (o instanceof HTMLProgressElement) {
				interfaces.push("HTMLProgressElement");
			} else if (o instanceof HTMLQuoteElement) {
				interfaces.push("HTMLQuoteElement");
			} else if (o instanceof HTMLSelectElement) {
				interfaces.push("HTMLSelectElement");
			} else if (o instanceof HTMLSourceElement) {
				interfaces.push("HTMLSourceElement");
			} else if (o instanceof HTMLTableCellElement) {
				interfaces.push("HTMLTableCellElement");
			} else if (o instanceof HTMLTemplateElement) {
				interfaces.push("HTMLTemplateElement");
			} else if (o instanceof HTMLTextAreaElement) {
				interfaces.push("HTMLTextAreaElement");
			} else if (o instanceof HTMLTrackElement) {
				interfaces.push("HTMLTrackElement");
			} else if (o instanceof HTMLVideoElement) {
				interfaces.push("HTMLVideoElement");
			}
			
			interfaces.push("HTMLElement");
		}
		
		interfaces.push("Element", "Node", "EventTarget");
	}
	
	return interfaces;
}

SecureObject.addPrototypeMethodsAndProperties = function(metadata, se, raw, key) {
	var prototype;

	function worker(name) {
		var item = prototype[name];
		
		if (!(name in se) && (name in raw)) {
			var options = {
                filterOpaque : item.filterOpaque || true,
	            skipOpaque : item.skipOpaque || false,
	            defaultValue : item.defaultValue || null
            };
			
			if (item.type === "function") {
				SecureObject.addMethodIfSupported(se, raw, name, options);						
			} else if (item.type === "@event") {
				Object.defineProperty(se, name, {
		        	get: function() {
		        		return SecureObject.filterEverything(se, raw[name]);
		        	},
		        	
		            set: function(callback) {
		                raw[name] = function(e) {
		                    callback.call(se, SecureDOMEvent(e, key));
		                };
		            }
		        });
			} else {
				// Properties
				var descriptor = SecureObject.createFilteredProperty(se, raw, name, options);
				
				if (descriptor) {
					Object.defineProperty(se, name, descriptor);
				}
			}
		}
	}
	
	var supportedInterfaces = getSupportedInterfaces(raw);
	
	var prototypes = metadata["prototypes"];
	supportedInterfaces.forEach(function(name) {
		prototype = prototypes[name];
		Object.keys(prototype).forEach(worker);
	});
};

SecureObject.FunctionPrototypeBind = Function.prototype.bind;
SecureObject.ArrayPrototypeSlice = Array.prototype.slice;

Aura.Locker.SecureObject = SecureObject;
