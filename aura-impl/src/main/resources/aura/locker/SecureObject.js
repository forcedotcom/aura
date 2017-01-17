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

    var o = ls_getFromCache(thing, key);
    if (o) {
        return o;
    }

	o = Object.create(null, {
		toString : {
			value : function() {
				return "SecureObject: " + thing + "{ key: " + JSON.stringify(key) + " }";
			}
		}
	});

    ls_setRef(o, thing, key, true);
    ls_addToCache(thing, o, key);

	return Object.seal(o);
}

var _useProxy;

SecureObject.useProxy = function() {
    if (_useProxy === undefined) {
        _useProxy = false;
        if ("Proxy" in window) {
            // Attempt to create a proxy just to test if its really a Proxy and not some polyfill etc
            try {
                var handler = {
                    "get": function(target, prop) {
                        return prop === "foo" ? "proxied" : undefined;
                    }
                };
                
                var proxy = new Proxy({}, handler);
                _useProxy = proxy["foo"] === "proxied";
            } catch (e) {
                // Do nothing
            }
        }
    }
        
    return _useProxy;
};

SecureObject.getRaw = function(so, prototype) {
	if (Object.getPrototypeOf(so) !== prototype) {
		throw new Error("Blocked attempt to invoke secure method with altered prototype!");
	}
	
	var raw = ls_getRef(so, ls_getKey(so));
	
	if (!raw) {
		throw new Error("Blocked attempt to invoke secure method with altered this!");
	}
	
	return raw;
};

SecureObject.isDOMElementOrNode = function(el) {
	"use strict";

	return typeof el === "object"
			&& ((typeof HTMLElement === "object" && el instanceof HTMLElement) || (typeof Node === "object" && el instanceof Node) || (typeof el.nodeType === "number" && typeof el.nodeName === "string"));
};

SecureObject.filterEverything = function(st, raw, options) {
	"use strict";

	if (!raw) {
		// ignoring falsy, nully references.
		return raw;
	}

	var t = typeof raw;
	if (t === "object") {		
		if (SecureObject.isUnfilteredType(raw)) {
			// Pass thru for objects without privileges.
			return raw;
		}
	}

	function filterOpaque(opts, so) {
		return opts && opts.filterOpaque === true && ls_isOpaque(so);
	}

	var key = ls_getKey(st);
	var cached = ls_getFromCache(raw, key);
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
        ls_setRef(swallowed, raw, key);
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

            ls_setRef(swallowed, raw, key);

			// Decorate with .item() to preserve NodeList shape
			if (isNodeList) {
				Object.defineProperty(swallowed, "item", {
					value : function(index) {
						return swallowed[index];
					}
				});
			}
		} else {
            var rawKey = ls_getKey(raw);
            var hasAccess = rawKey === key;
			$A.assert(key, "A secure object should always have a key.");
			if ($A.util.isAction(raw)) {
				swallowed = hasAccess ? SecureAction(raw, key) : SecureObject(raw, key);
				mutated = raw !== swallowed;
			} else if ($A.util.isComponent(raw)) {
				swallowed = hasAccess ? SecureComponent(raw, key) : SecureComponentRef(raw, key);
				mutated = raw !== swallowed;
			} else if (SecureObject.isDOMElementOrNode(raw)) {
				if (hasAccess || SecureElement.isSharedElement(raw)) {
					swallowed = SecureElement(raw, key);
				} else if (!options || options.filterOpaque !== true) {
					swallowed = SecureObject(raw, key);
				} else {
					swallowed = options.defaultValue;
					ls_addToCache(raw, swallowed, key);
				}

				mutated = true;
			} else if (raw instanceof Aura.Event.Event) {
				swallowed = SecureAuraEvent(raw, key);
				mutated = true;
			} else if (raw instanceof Event) {
				swallowed = SecureDOMEvent(raw, key);
				mutated = true;
			} else if (rawKey) {
				swallowed = SecureObject(raw, key);
				mutated = true;
			} else {
			    // DCHASMAN Temporarily suppress the use of universal proxy until issue with TypeError: Illegal invocation with intrinsics can be corrected
				swallowed = SecureObject.createUniversalProxy(raw, key, true);
				mutated = true;
			}
		}
	}

	return mutated ? swallowed : raw;
};

var univeralProxyHandler = {
    "get": function(target, property, receiver) {
        var value = target[property];
        return value ? SecureObject.filterEverything(receiver, value) : value;
    },
    
    "set": function(target, property, value, receiver) {
        target[property] = SecureObject.unfilterEverything(receiver, value);
        
        return true;
    }
    
    // DCHASMAN TODO apply and construct traps
    /*apply: function(target, thisArg, argumentsList) {
    },
    
    construct: function(target, argumentsList, newTarget) {
    }*/
};

SecureObject.createUniversalProxy = function(raw, key, doNotUseProxy) {
    var swallowed;
    if (SecureObject.useProxy() && doNotUseProxy !== true) {
        swallowed = new Proxy(raw, univeralProxyHandler);
        ls_setKey(swallowed, key);
    } else {
        // Fallback for environments that do not support Proxy
        swallowed = {};
        ls_setRef(swallowed, raw, key);
    
        for (var name in raw) {
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
    
    ls_addToCache(raw, swallowed, key);
    
    return swallowed;
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
	
	if (!value || (t !== "object" && t !== "function") || value === window || value === document || SecureObject.isUnfilteredType(value)) {
		// ignoring falsy, nully references, non-objects and non-functions, global window/document, and any pass throughs
		// from filterEverything
		return value;
	}

	var isArray = Array.isArray(value);

    var key = ls_getKey(value);
	var raw = ls_getRef(value, key);
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
		visited = new WeakMap();
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


SecureObject.createFilteredMethodStateless = function(methodName, prototype, options) {
	"use strict";
	
	if (!prototype) {
		throw new Error("SecureObject.createFilteredMethodStateless() called without prototype");
	}

	return {
		enumerable : true,
		value : function() {
			var st = this;
			var raw = SecureObject.getRaw(st, prototype);
						
			var args = SecureObject.ArrayPrototypeSlice.call(arguments);

			if (options && options.beforeCallback) {
				options.beforeCallback.apply(st, args);
			}

			var unfilteredArgs = SecureObject.unfilterEverything(st, args);
			var fnReturnedValue = raw[methodName].apply(raw, unfilteredArgs);

			if (options) {
				if (options.afterCallback) {
					fnReturnedValue = options.afterCallback.call(st, fnReturnedValue);
				}
				
				if (options.trustReturnValue) {
        			$A.lockerService.trust(st, fnReturnedValue);
				}
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
                var hasAccess = ls_hasAccess(st, value);
				if (hasAccess || SecureElement.isSharedElement(value)) {
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


SecureObject.createFilteredPropertyStateless = function(propertyName, prototype, options) {
	"use strict";

	if (!prototype) {
		throw new Error("SecureObject.createFilteredPropertyStateless() called without prototype");
	}
	
	var descriptor = {
		enumerable : true
	};

	descriptor.get = function() {
		var st = this;
		var raw = SecureObject.getRaw(st, prototype);
		
		var value = raw[propertyName];

		// Continue from the current object until we find an acessible object.
		if (options && options.skipOpaque === true) {
			while (value) {
                var hasAccess = ls_hasAccess(st, value);
				if (hasAccess || value === document.body || value === document.head || value === document.documentElement) {
					break;
				}
				value = value[propertyName];
			}
		}

		if (options && options.afterGetCallback) {
			// The caller wants to handle the property value
			return options.afterGetCallback.call(st, value);
		} else {
			return SecureObject.filterEverything(st, value, options);
		}
	};

	if (!options || options.writable !== false) {
		descriptor.set = function(value) {
			var st = this;
			var key = ls_getKey(st);
			var raw = ls_getRef(st, key);
			
			if (options && options.beforeSetCallback) {
				value = options.beforeSetCallback.call(st, value);
			}
			
			raw[propertyName] = SecureObject.unfilterEverything(st, value);

			if (options && options.afterSetCallback) {
				options.afterSetCallback.call(st);
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

// Return the set of interfaces supported by the object in order of most specific to least specific
function getSupportedInterfaces(o) {

	var interfaces = [];
	if (o instanceof Window) {
		interfaces.push("Window", "EventTarget");
	} else if (o instanceof Document) {
		if (o instanceof HTMLDocument) {
			interfaces.push("HTMLDocument");
		}
		interfaces.push("Document", "Node", "EventTarget");
	} else if (o instanceof DocumentFragment) {
		interfaces.push("Node", "EventTarget", "DocumentFragment");
	} else if (o instanceof Element) {
		if (o instanceof HTMLElement) {
			// Look for all HTMLElement subtypes
			if (o instanceof HTMLAnchorElement) {
				interfaces.push("HTMLAnchorElement");
			} else if (o instanceof HTMLAreaElement) {
				interfaces.push("HTMLAreaElement");
			} else if (o instanceof HTMLMediaElement) {
				if (o instanceof HTMLAudioElement) {
					interfaces.push("HTMLAudioElement");
				} else if (o instanceof HTMLVideoElement) {
					interfaces.push("HTMLVideoElement");
				}
				interfaces.push("HTMLMediaElement");
			} else if (o instanceof HTMLBaseElement) {
				interfaces.push("HTMLBaseElement");
			} else if (o instanceof HTMLButtonElement) {
				interfaces.push("HTMLButtonElement");
			} else if (o instanceof HTMLCanvasElement) {
				interfaces.push("HTMLCanvasElement");
			} else if (o instanceof HTMLTableColElement) {
				interfaces.push("HTMLTableColElement");
			} else if (o instanceof HTMLTableRowElement) {
				interfaces.push("HTMLTableRowElement");
			} else if (o instanceof HTMLModElement) {
				interfaces.push("HTMLModElement");
			} else if (typeof HTMLDetailsElement !== "undefined" && o instanceof HTMLDetailsElement) {
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
			} else if (typeof HTMLMeterElement !== "undefined" && o instanceof HTMLMeterElement) {
				interfaces.push("HTMLMeterElement");
			} else if (o instanceof HTMLObjectElement) {
				interfaces.push("HTMLObjectElement");
			} else if (o instanceof HTMLOListElement) {
				interfaces.push("HTMLOListElement");
			} else if (o instanceof HTMLOptGroupElement) {
				interfaces.push("HTMLOptGroupElement");
			} else if (o instanceof HTMLOptionElement) {
				interfaces.push("HTMLOptionElement");
			} else if (typeof HTMLOutputElement !== "undefined" && o instanceof HTMLOutputElement) {
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
			} else if (o instanceof HTMLTableElement) {
				interfaces.push("HTMLTableElement");
			} else if (typeof HTMLTemplateElement !== "undefined" && o instanceof HTMLTemplateElement) {
				interfaces.push("HTMLTemplateElement");
			} else if (o instanceof HTMLTextAreaElement) {
				interfaces.push("HTMLTextAreaElement");
			} else if (o instanceof HTMLTrackElement) {
				interfaces.push("HTMLTrackElement");
			}
			
			if (o instanceof HTMLTableSectionElement) {
				interfaces.push("HTMLTableSectionElement");
			}

			interfaces.push("HTMLElement");
		} else if (o instanceof SVGElement) {
			if (o instanceof SVGSVGElement) {
				interfaces.push("SVGSVGElement");
			}
			interfaces.push("SVGElement");
			
			// DCHASMAN TODO Add all of the remaining SVG name space elements
		}

		interfaces.push("Element", "Node", "EventTarget");
	} else if (o instanceof Text) {
		interfaces.push("Text", "CharacterData", "Node");
	}

	return interfaces;
}

SecureObject.addPrototypeMethodsAndProperties = function(metadata, so, raw, key) {
	var prototype;

	function worker(name) {
		var item = prototype[name];

		if (!(name in so) && (name in raw)) {
			var options = {
                filterOpaque: item.filterOpaque || true,
	            skipOpaque: item.skipOpaque || false,
	            defaultValue: item.defaultValue || null,
	            trustReturnValue: item.trustReturnValue || false
            };

			if (item.type === "function") {
				SecureObject.addMethodIfSupported(so, raw, name, options);
			} else if (item.type === "@raw") {
				Object.defineProperty(so, name, {
        			// Does not currently secure proxy the actual class
		        	get: function() {
		        		return raw[name];
		        	}
		        });
			} else if (item.type === "@ctor") {
				Object.defineProperty(so, name, {
		        	get: function() {
		        		return function() {
		        			var cls = raw[name];

							var result,
								args = Array.prototype.slice.call(arguments);
							if (typeof cls === "function") {
								//  Function.prototype.bind.apply is being used to invoke the constructor and to pass all the arguments provided by the caller
								// TODO Switch to ES6 when available https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_operator
								result = new (Function.prototype.bind.apply(cls, [null].concat(args)));
							} else {
								// For browsers that use a constructor that's not a function, invoke the constructor directly.
								// For example, on Mobile Safari window["Audio"] returns an object called AudioConstructor
								// Passing the args as an array is the closest we got to passing the arguments.
								result = new cls(args);
							}
		        			$A.lockerService.trust(so, result);

		        			return SecureObject.filterEverything(so, result);
		        		};
		        	}
		        });
			} else if (item.type === "@event") {
				Object.defineProperty(so, name, {
		        	get: function() {
		        		return SecureObject.filterEverything(so, raw[name]);
		        	},

		            set: function(callback) {
		            	raw[name] = function(e) {
		            	    if (callback) {
		            	        callback.call(so, SecureDOMEvent(e, key));
		            	    }
		                };
		            }
		        });
			} else {
				// Properties
				var descriptor = SecureObject.createFilteredProperty(so, raw, name, options);
				if (descriptor) {
					Object.defineProperty(so, name, descriptor);
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


SecureObject.addPrototypeMethodsAndPropertiesStateless = function(metadata, prototypicalInstance, prototypeForValidation) {
	var rawPrototypicalInstance = SecureObject.getRaw(prototypicalInstance, prototypeForValidation);
	var prototype;
	var config = {};

	function worker(name) {
		var descriptor;
		var item = prototype[name];

		if (!(name in prototypicalInstance) && (name in rawPrototypicalInstance)) {
			var options = {
                filterOpaque: item.filterOpaque || true,
	            skipOpaque: item.skipOpaque || false,
	            defaultValue: item.defaultValue || null,
	            trustReturnValue: item.trustReturnValue || false
            };
			
			if (item.type === "function") {
				descriptor = SecureObject.createFilteredMethodStateless(name, prototypeForValidation, options);
			} else if (item.type === "@raw") {
				descriptor = {
        			// Does not currently secure proxy the actual class
		        	get: function() {
	        			var raw = SecureObject.getRaw(this, prototypeForValidation);
		        		return raw[name];
		        	}
		        };
			} else if (item.type === "@ctor") {
				descriptor = {
		        	get: function() {
		        		return function() {
		        			var so = this;
		        			var raw = SecureObject.getRaw(so, prototypeForValidation);
		        			var cls = raw[name];
		        					        			
		        			// TODO Switch to ES6 when available https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_operator
		        			var result = new (Function.prototype.bind.apply(cls, [null].concat(Array.prototype.slice.call(arguments))));
		        			$A.lockerService.trust(so, result);
		        			
		        			return SecureObject.filterEverything(so, result);
		        		};
		        	}
		        };
			} else if (item.type === "@event") {
				descriptor = {
		        	get: function() {
		        		return SecureObject.filterEverything(this, SecureObject.getRaw(this, prototypeForValidation)[name]);
		        	},

		            set: function(callback) {
		            	var raw = SecureObject.getRaw(this, prototypeForValidation);

                        // Insure that we pick up the current proxy for the raw object
		            	var key = ls_getKey(raw);
		            	var o = ls_getFromCache(raw, key);

                        raw[name] = function(e) {
		            	    if (callback) {
		            	        callback.call(o, SecureDOMEvent(e, key));
		            	    }
		                };
		            }
		        };
			} else {
				// Properties
				descriptor = SecureObject.createFilteredPropertyStateless(name, prototypeForValidation, options);
			}
		}
		
		if (descriptor) {
			config[name] = descriptor;
		}
	}

	var supportedInterfaces = getSupportedInterfaces(rawPrototypicalInstance);

	var prototypes = metadata["prototypes"];
	supportedInterfaces.forEach(function(name) {
		prototype = prototypes[name];
		Object.keys(prototype).forEach(worker);
	});
	
	return config;
};

var workerFrame = window.document.getElementById("safeEvalWorker");
var safeEvalScope = workerFrame && workerFrame.contentWindow;

var unfilteredTypes = [File, FileList, CSSStyleDeclaration, TimeRanges, Date, Promise, MessagePort, MessageChannel, MessageEvent, FormData];
if (typeof ValidityState !== "undefined") {
    unfilteredTypes.push(ValidityState);
}

SecureObject.isUnfilteredType = function(raw) {
    for (var n = 0; n < unfilteredTypes.length; n++) {
        if ($A.lockerService.instanceOf(raw, unfilteredTypes[n])) {
            return true;
        }
    }
    
    return false;
};


SecureObject.FunctionPrototypeBind = Function.prototype.bind;
SecureObject.ArrayPrototypeSlice = Array.prototype.slice;
