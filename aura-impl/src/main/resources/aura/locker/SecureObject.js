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
    ls_registerProxy(o);

    return Object.seal(o);
}

var defaultSecureObjectKey = {
        defaultSecureObjectKey: true	
};

SecureObject.getRaw = function(so) {
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

    var key = ls_getKey(st);
    var cached = ls_getFromCache(raw, key);
    if (cached) {
        return cached;
    }

    // Handle already proxied things
    var rawKey = ls_getKey(raw);
    var belongsToLocker = rawKey === key;
    var defaultKey = options && options.defaultKey ? options.defaultKey : defaultSecureObjectKey;

    if (ls_isProxy(raw)) {
        // If !belongsToLocker then this is a jump from one locker to another - we just need to unwrap and then reproxy based on the target locker's perspective
        // otherwise just return the proxy (do not proxy a proxy)
        return belongsToLocker ? raw : SecureObject.filterEverything(st, ls_getRef(raw, rawKey), options);
    }

    var swallowed;
    var mutated = false;
    if (t === "function") {
        // wrapping functions to guarantee that they run in system mode but their
        // returned value complies with user-mode.
        swallowed = function SecureFunction() {
            var filteredArgs = SecureObject.filterArguments(st, arguments);

            // DCHASMAN TODO Here is where we need to factor in the decision to use raw self to avoid InvalidInvocation on system types!
            var self = SecureObject.filterEverything(st, this);

            var fnReturnedValue = raw.apply(self, filteredArgs);

            return SecureObject.filterEverything(st, fnReturnedValue, options);
        };

        mutated = true;
        ls_setRef(swallowed, raw, key);
        ls_registerProxy(swallowed);
    } else if (t === "object") {
        if (raw === window) {
            return $A.lockerService.getEnv(key);
        } else if (raw === document) {
            return $A.lockerService.getEnv(key).document;
        } else if (raw === location) {
            return $A.lockerService.getEnv(key).location;
        }

        var isNodeList = raw && (raw instanceof NodeList || raw instanceof HTMLCollection);
        if (Array.isArray(raw)) {
            if (!belongsToLocker) {
                if (!rawKey) {
                    // Array that was created in this locker or system mode but not yet keyed - key it now
                    ls_setKey(raw, defaultKey);
                    return SecureObject.filterEverything(st, raw, options);
                } else {
                    // DCHASMAN TODO Replace this with SecureObject.createProxyForArrayLikeObjects() once it supports mutating operations!!!

                    swallowed = [];

                    for (var n = 0; n < raw.length; n++) {
                        var newValue = SecureObject.filterEverything(st, raw[n]);

                        if (!ls_isOpaque(newValue)) {
                            swallowed.push(newValue);
                        }

                        mutated = mutated || (newValue !== raw[n]);
                    }

                    ls_setRef(swallowed, raw, key);
                }
            }
        } else if (isNodeList) {
            swallowed = SecureObject.createProxyForArrayLikeObjects(raw, key);
            ls_setRef(swallowed, raw, key);
            mutated = true;
        } else {
            $A.assert(key, "A secure object should always have a key.");
            if ($A.util.isAction(raw)) {
                swallowed = belongsToLocker ? SecureAction(raw, key) : SecureObject(raw, key);
                mutated = raw !== swallowed;
            } else if ($A.util.isComponent(raw)) {
                swallowed = belongsToLocker ? SecureComponent(raw, key) : SecureComponentRef(raw, key);
                mutated = raw !== swallowed;
            } else if (SecureObject.isDOMElementOrNode(raw)) {
                if (belongsToLocker || SecureElement.isSharedElement(raw)) {
                    swallowed = SecureElement(raw, key);
                } else if (!options) {
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
            } else if (raw["Window"] && raw instanceof raw["Window"]) {
                // Cross realm window instances (window.open() and iframe.contentWindow)
                swallowed = SecureIFrameElement.SecureIFrameContentWindow(raw, key);
                SecureObject.addMethodIfSupported(swallowed, raw, "close");
                SecureObject.addPropertyIfSupported(swallowed, raw, "opener");

                mutated = true;
            } else if (SecureObject.isUnfilteredType(raw)) {
                // return raw for unfiltered types
                mutated = false;
            } else if (raw instanceof PropertyReferenceValue) {
                swallowed = SecurePropertyReferenceValue(raw, key);
                mutated = true;
            } else {
                if (!belongsToLocker) {
                    if (!rawKey) {
                        // Object that was created in this locker or insystem mode and not yet keyed - key it now
                        ls_setKey(raw, defaultKey);
                        return SecureObject.filterEverything(st, raw, options);
                    } else {
                        swallowed = SecureObject.createFilteringProxy(raw, key);
                        ls_addToCache(raw, swallowed, key);
                        mutated = true;
                    }
                }
            }
        }
    }

    return mutated ? swallowed : raw;
};

SecureObject.filterArguments = function(st, args, options) {
    function getRaw(v) {
        if (ls_isProxy(v)) {
            var key = ls_getKey(v);
            var ref = ls_getRef(v, key);
            v = ref;
        }

        return v;
    }

    function getRawArray(v) {
        var result = [];
        for (var i = 0; i < v.length; i++) {
            result.push(getRaw(v[i]));
        }
        return result;
    }

    args = SecureObject.ArrayPrototypeSlice.call(args);

    if (options && options.beforeCallback) {
        options.beforeCallback.apply(st, args);
    }

    var rawArguments = options && options.rawArguments;
    for (var n = 0; n < args.length; n++) {
        var value = args[n];
        if (value) {
            if (rawArguments && (typeof value === "object")) {
                args[n] = Array.isArray(value) ? getRawArray(value) : getRaw(value);
            } else {
                args[n] = SecureObject.filterEverything(st, value, options);
            }
        }
    }

    return args;
};

function convertSymbol(property) {
    // Symbols have to be handled in some browsers
    if (typeof property === "symbol") {
        if (property === Symbol["toStringTag"]) {
            property = "toString";
        } else {
            property = property.toString();
        }
    }

    return property;
}

var filteringProxyHandler = (function() {
    function FilteringProxyHandler() {
    }

    FilteringProxyHandler.prototype["get"] = function(target, property) {
        var raw = ls_getRef(target, ls_getKey(target));
        var value = raw[property];

        return value ? SecureObject.filterEverything(target, value) : value;
    };

    FilteringProxyHandler.prototype["set"] = function(target, property, value) {   	
        var raw = ls_getRef(target, ls_getKey(target));

        var filteredValue = value ? SecureObject.filterEverything(target, value) : value;

        raw[property] = filteredValue;

        return true;
    };

    // These are all direct pass through methods to preserve the shape etc of the delegate

    FilteringProxyHandler.prototype["getPrototypeOf"] = function(target) {
        var raw = ls_getRef(target, ls_getKey(target));
        return Object.getPrototypeOf(raw);
    };

    FilteringProxyHandler.prototype["setPrototypeOf"] = function(target, prototype) {
        var raw = ls_getRef(target, ls_getKey(target));
        return Object.setPrototypeOf(raw, prototype);
    };

    FilteringProxyHandler.prototype["has"] = function(target, property) {
        var raw = ls_getRef(target, ls_getKey(target));
        return property in raw;
    };

    FilteringProxyHandler.prototype["defineProperty"] = function(target, property, descriptor) {
        var raw = ls_getRef(target, ls_getKey(target));
        Object.defineProperty(raw, property, descriptor);
        return true;
    };

    FilteringProxyHandler.prototype["deleteProperty"] = function(target, property) {
        var raw = ls_getRef(target, ls_getKey(target));
        delete target[property];
        delete raw[property];
        return true;
    };

    FilteringProxyHandler.prototype["ownKeys"] = function(target) {
        var raw = ls_getRef(target, ls_getKey(target));
        return Object.keys(raw);
    };

    FilteringProxyHandler.prototype["getOwnPropertyDescriptor"] = function(target, property) {
        var raw = ls_getRef(target, ls_getKey(target));
        var descriptor = Object.getOwnPropertyDescriptor(raw, property);

        // If the descriptor is for a non-configurable property we need to shadow it directly on the surrogate 
        // to avoid proxy invariant violations
        if (descriptor && !descriptor.configurable && !Object.getOwnPropertyDescriptor(target, property)) {
            Object.defineProperty(target, property, descriptor);
        }

        return descriptor;
    };

    FilteringProxyHandler.prototype["isExtensible"] = function(target) {
        var raw = ls_getRef(target, ls_getKey(target));
        return Object.isExtensible(raw);
    };

    FilteringProxyHandler.prototype["preventExtensions"] = function(target) {
        var raw = ls_getRef(target, ls_getKey(target));
        return Object.preventExtensions(raw);
    };    

    return Object.freeze(new FilteringProxyHandler());
})();

//Prototype to make debugging and identification of direct exposure of the surrogate (should not happen) easier
function FilteringProxySurrogate(actual) {
    // For debugging usability only
    Object.defineProperty(this, "$actual$", {
        value: actual,
        configurable: true
    });
}

SecureObject.createFilteringProxy = function(raw, key) {
    // Use a direct proxy on raw to a proxy on {} to avoid the Proxy invariants for non-writable, non-configurable properties
    var surrogate = new FilteringProxySurrogate(raw);
    ls_setRef(surrogate, raw, key);

    var rawKey = ls_getKey(raw);
    if (!rawKey) {
        // This is a newly created plain old js object - stamp it with the key
        ls_setKey(raw, key);
    }

    var swallowed = new Proxy(surrogate, filteringProxyHandler);
    ls_registerProxy(swallowed);

    // DCHASMAN TODO We should be able to remove this (replaced with ls_setKey()) in the next phase of proxy work where we remove unfilterEverything() as something that is done all the time
    ls_setRef(swallowed, raw, key);

    ls_addToCache(raw, swallowed, key);

    return swallowed;
};


//We cache 1 array like thing proxy per key
var KEY_TO_ARRAY_LIKE_THING_HANLDER = typeof Map !== "undefined" ? new Map() : undefined;

function getFilteredArray(raw, key) {
    var filtered = [];

    for (var n = 0; n < raw.length; n++) {
        var value = raw[n];
        if (ls_getKey(value) === key || SecureElement.isSharedElement(value)) {
            filtered.push(value);
        }
    }

    return filtered;
}

function getArrayLikeThingProxyHandler(key) {
    function getFromFiltered(so, filtered, index) {
        // Numeric indexing into array
        var value = filtered[index];
        return value ? SecureObject.filterEverything(so, value) : value;	
    }

    var handler = KEY_TO_ARRAY_LIKE_THING_HANLDER.get(key);
    if (!handler) {    	
        handler = {
                "get": function(target, property) {
                    var raw = ls_getRef(target, key);

                    var filtered = getFilteredArray(raw, key);
                    var ret;

                    property = convertSymbol(property);
                    if (isNaN(property)) {
                        switch (property) {
                        case "length":
                            ret = filtered.length;
                            break;

                        case "item": 
                            ret = function(index) {
                            return getFromFiltered(handler, filtered, index);
                        };
                        break;

                        case "namedItem": 
                            ret = function(name) {
                            var value = raw.namedItem(name);
                            return value ? SecureObject.filterEverything(handler, value) : value;	
                        };
                        break;

                        case "toString":
                            ret = function() {
                            return raw.toString();
                        };
                        break;

                        case "toJSON":
                            ret = function() {
                            return JSON.stringify(filtered);
                        };
                        break;
                        case "Symbol(Symbol.iterator)":
                            ret = function () {
                            var nextIndex = 0;
                            return {
                                next: function() {
                                    if(nextIndex < filtered.length) {
                                        var value = filtered[nextIndex];
                                        nextIndex++;
                                        return {value: value ? SecureObject.filterEverything(handler, value) : value, done: false};
                                    } else {
                                        return {done: true};
                                    }
                                }
                            };
                        };
                        break;
                        default:
                            $A.warning("Unsupported " + raw + " method: " + property + ". Returning undefined");
                        return undefined;
                        }
                    } else {
                        ret = getFromFiltered(handler, filtered, property);		    		
                    }

                    return ret;
                }
        };

        ls_setKey(handler, key);

        KEY_TO_ARRAY_LIKE_THING_HANLDER.set(key, handler);

        Object.freeze(handler);
    }

    return handler;
}

SecureObject.createProxyForArrayLikeObjects = function(raw, key) {
    var surrogate = Object.create(Object.getPrototypeOf(raw));
    ls_setRef(surrogate, raw, key);

    var proxy = new Proxy(surrogate, getArrayLikeThingProxyHandler(key));   
    ls_setKey(proxy, key);
    ls_registerProxy(proxy);

    return proxy;
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
        writable : true,
        value : function() {
            var filteredArgs = SecureObject.filterArguments(st, arguments, options);
            var fnReturnedValue = raw[methodName].apply(raw, filteredArgs);

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
        writable : true,
        value : function() {
            var st = this;
            var raw = SecureObject.getRaw(st);

            var filteredArgs = SecureObject.filterArguments(st, arguments, options);
            var fnReturnedValue = raw[methodName].apply(raw, filteredArgs);

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

            raw[propertyName] = SecureObject.filterEverything(st, value);

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
        var raw = SecureObject.getRaw(st);

        var value = raw[propertyName];

        // Continue from the current object until we find an acessible object.
        if (options && options.skipOpaque === true) {
            while (value) {
                var hasAccess = ls_hasAccess(st, value);
                if (hasAccess || value === document.body || value === document.head || value === document.documentElement || value === document) {
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

            raw[propertyName] = SecureObject.filterEverything(st, value);

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

//Return the set of interfaces supported by the object in order of most specific to least specific
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
            }else if (o instanceof HTMLScriptElement) {
                interfaces.push("HTMLScriptElement");
            }else if (o instanceof HTMLSelectElement) {
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
        var valueOverride;
        if (!(name in so) && (name in raw)) {
            var options = {
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
                        return valueOverride || raw[name];
                    },
                    set: function(value){
                        valueOverride = value;
                    }
                });
            } else if (item.type === "@ctor") {
                Object.defineProperty(so, name, {
                    get: function() {
                        return valueOverride || function() {
                            var cls = raw[name];

                            var result,
                            args = Array.prototype.slice.call(arguments);
                            if (typeof cls === "function") {
                                //  Function.prototype.bind.apply is being used to invoke the constructor and to pass all the arguments provided by the caller
                                // TODO Switch to ES6 when available https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_operator
                                var ctor = Function.prototype.bind.apply(cls, [null].concat(args));
                                result = new ctor();
                            } else {
                                // For browsers that use a constructor that's not a function, invoke the constructor directly.
                                // For example, on Mobile Safari window["Audio"] returns an object called AudioConstructor
                                // Passing the args as an array is the closest we got to passing the arguments.
                                result = new cls(args);
                            }
                            $A.lockerService.trust(so, result);

                            return SecureObject.filterEverything(so, result);
                        };
                    },
                    set: function(value){
                        valueOverride = value;
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


//Closure factory
function addPrototypeMethodsAndPropertiesStatelessHelper(name, prototype, prototypicalInstance, prototypeForValidation, rawPrototypicalInstance, config) {
    var descriptor;
    var item = prototype[name];
    var valueOverride;

    if (!prototypeForValidation.hasOwnProperty(name) && (name in rawPrototypicalInstance)) {
        var options = {
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
                        if(valueOverride){
                            return valueOverride;
                        }
                        var raw = SecureObject.getRaw(this);
                        return raw[name];
                    },
                    set: function(value){
                        valueOverride = value;
                    }
            };
        } else if (item.type === "@ctor") {
            descriptor = {
                    get: valueOverride || function() {
                        return function() {
                            var so = this;
                            var raw = SecureObject.getRaw(so);
                            var cls = raw[name];

                            // TODO Switch to ES6 when available https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_operator
                            var ctor = Function.prototype.bind.apply(cls, [null].concat(Array.prototype.slice.call(arguments)));
                            var result = new ctor();
                            $A.lockerService.trust(so, result);

                            return SecureObject.filterEverything(so, result);
                        };
                    },
                    set: function(value){
                        valueOverride = value;
                    }
            };
        } else if (item.type === "@event") {
            descriptor = {
                    get: function() {
                        return SecureObject.filterEverything(this, SecureObject.getRaw(this)[name]);
                    },

                    set: function(callback) {
                        var raw = SecureObject.getRaw(this);

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

SecureObject.addPrototypeMethodsAndPropertiesStateless = function(metadata, prototypicalInstance, prototypeForValidation) {
    var rawPrototypicalInstance = SecureObject.getRaw(prototypicalInstance);
    var prototype;
    var config = {};

    var supportedInterfaces = getSupportedInterfaces(rawPrototypicalInstance);

    var prototypes = metadata["prototypes"];
    supportedInterfaces.forEach(function(name) {
        prototype = prototypes[name];
        for (var property in prototype) {
            addPrototypeMethodsAndPropertiesStatelessHelper(property, prototype, prototypicalInstance, prototypeForValidation, rawPrototypicalInstance, config);
        }
    });

    return config;
};

var workerFrame = window.document.getElementById("safeEvalWorkerCustom");
var safeEvalScope = workerFrame && workerFrame.contentWindow;

function getUnfilteredTypes() {
    var ret = [];
    var unfilteredTypesMeta = [
                               "File",
                               "FileList",
                               "CSSStyleDeclaration",
                               "TimeRanges",
                               "Date",
                               "Promise",
                               "MessagePort",
                               "MessageChannel",
                               "MessageEvent",
                               "FormData",
                               "ValidityState",
                               "Crypto",
                               "DOMTokenList"];
    unfilteredTypesMeta.forEach(function(unfilteredType){
        if (typeof window[unfilteredType] !== "undefined") {
            ret.push(window[unfilteredType]);
        }
    });
    return ret;
}
var unfilteredTypes = getUnfilteredTypes();

SecureObject.isUnfilteredType = function(raw) {
    for (var n = 0; n < unfilteredTypes.length; n++) {
        if ($A.lockerService.instanceOf(raw, unfilteredTypes[n])) {
            return true;
        }
    }

    // Do not filter ArrayBufferView types. https://developer.mozilla.org/en-US/docs/Web/API/ArrayBufferView
    if (raw && $A.lockerService.instanceOf(raw.buffer, ArrayBuffer) && raw.byteLength !== undefined) {
        return true;
    }

    return false;
};

//FIXME(tbliss): remove this once the necessary APIs become standard and can be exposed to everyone
SecureObject.addRTCMediaApis = function(st, raw, name, key) {
    if (raw[name]) {
        var config = {
                enumerable: true,
                get: function() {
                    var namespace = key["namespace"];
                    if (namespace === "runtime_rtc_spark" || namespace === "runtime_rtc") {
                        return raw[name];
                    }
                    return undefined;
                }
        };
        Object.defineProperty(st, name, config);
    }
};

SecureObject.FunctionPrototypeBind = Function.prototype.bind;
SecureObject.ArrayPrototypeSlice = Array.prototype.slice;
