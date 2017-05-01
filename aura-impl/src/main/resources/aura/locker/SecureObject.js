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
        // - If !belongsToLocker then this is a jump from one locker to another - we just need to unwrap and then reproxy based on the target locker's perspective
        // otherwise just return the proxy (do not proxy a proxy).
        // - Bypass unwrapping and refiltering for SecureFunction so arguments and 'this' are filtered against the
        // Locker where the function was originally defined.
        return belongsToLocker || ls_isSecureFunction(raw) ? raw : SecureObject.filterEverything(st, ls_getRef(raw, rawKey), options);
    }

    var swallowed;
    var mutated = false;
    if (t === "function") {
        // wrapping functions to guarantee that they run in system mode but their
        // returned value complies with user-mode.
        swallowed = function SecureFunction() {
            // special unfiltering logic to unwrap Proxies passed back to origin.
            // this could potentially be folded into filterArguments with an option set if needed.
            var filteredArgs = [];
            for (var i = 0; i < arguments.length; i++) {
                var arg = arguments[i];
                if (ls_isFilteringProxy(arg)) {
                    var unfilteredProxy = ls_getRef(arg, ls_getKey(arg));
                    var unfilteredKey = ls_getKey(unfilteredProxy);
                    arg = unfilteredKey === ls_getKey(raw) ? unfilteredProxy : SecureObject.filterEverything(st, arg);
                } else {
                    arg = SecureObject.filterEverything(st, arg);
                }
                filteredArgs[i] = arg;
            }

            var self = SecureObject.filterEverything(st, this);
            if (ls_isFilteringProxy(self) && ls_getKey(self) === ls_getKey(st)) {
                self = ls_getRef(self, key);
            }

            var fnReturnedValue = raw.apply(self, filteredArgs);

            return SecureObject.filterEverything(st, fnReturnedValue, options);
        };

        mutated = true;
        ls_setRef(swallowed, raw, key);

        if (!rawKey) {
            ls_setKey(raw, defaultKey);
        }

        ls_registerProxy(swallowed);
        ls_registerSecureFunction(swallowed);
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
                    swallowed = SecureObject.createProxyForArrayObjects(raw, key);
                    ls_setRef(swallowed, raw, key);
                    ls_addToCache(raw, swallowed, key);
                    mutated = true;
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
                } else if (raw instanceof Attr && !rawKey) {
                    ls_setKey(raw, defaultKey);
                    return SecureObject.filterEverything(st, raw, options);
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
            } else if (typeof raw["Window"] === "function" && raw instanceof raw["Window"]) {
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
                        // Object that was created in this locker or in system mode and not yet keyed - key it now
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

    ls_registerFilteringProxy(swallowed);

    return swallowed;
};


//We cache 1 array like thing proxy per key
var KEY_TO_ARRAY_LIKE_THING_HANDLER = typeof Map !== "undefined" ? new Map() : undefined;

function getFilteredArrayLikeThings(raw, key) {
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

    var handler = KEY_TO_ARRAY_LIKE_THING_HANDLER.get(key);
    if (!handler) {
        handler = {
            "get": function(target, property) {
                var raw = ls_getRef(target, key);

                var filtered = getFilteredArrayLikeThings(raw, key);
                var ret;

                property = convertSymbol(property);
                if (isNaN(property)) {
                    switch (property) {
                        case "length":
                            ret = filtered.length;
                            break;

                        case "item":
                            ret = function (index) {
                                return getFromFiltered(handler, filtered, index);
                            };
                            break;

                        case "namedItem":
                            ret = function (name) {
                                var value = raw.namedItem(name);
                                return value ? SecureObject.filterEverything(handler, value) : value;
                            };
                            break;

                        case "toString":
                            ret = function () {
                                return raw.toString();
                            };
                            break;

                        case "toJSON":
                            ret = function () {
                                return JSON.stringify(filtered);
                            };
                            break;
                        case "Symbol(Symbol.iterator)":
                            ret = function () {
                                var nextIndex = 0;
                                return {
                                    next: function () {
                                        if (nextIndex < filtered.length) {
                                            var value = filtered[nextIndex];
                                            nextIndex++;
                                            return {
                                                value: value ? SecureObject.filterEverything(handler, value) : value,
                                                done: false
                                            };
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
            },
            "has": function(target, property) {
                var raw = ls_getRef(target, key);
                var filtered = getFilteredArrayLikeThings(raw, key);
                return property in filtered;
            }
        };

        ls_setKey(handler, key);

        KEY_TO_ARRAY_LIKE_THING_HANDLER.set(key, handler);

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

//We cache 1 array proxy per key
var KEY_TO_ARRAY_HANLDER = typeof Map !== "undefined" ? new Map() : undefined;

function getFilteredArray(st, raw, key) {
    var filtered = [];
    // TODO: RJ, we are missing named(non-integer) properties, changing this for loop to for..in should fix it
    for (var n = 0; n < raw.length; n++) {
        var value = raw[n];
        var validEntry = false;
        if (!value // Array can contain undefined/null/false/0 such falsy values
            || ls_getKey(value) === key // Value has been keyed and belongs to this locker
        ) {
            validEntry = true;
        } else {
            var filteredValue = SecureObject.filterEverything(st, value, {defaultKey: key});
            if (filteredValue && !ls_isOpaque(filteredValue)) {
                validEntry = true;
            }
        }
        if (validEntry) {
            // Store the raw index and value in an object
            filtered.push({"rawIndex": n, "rawValue" : value});
        }
    }

    return filtered;
}

function getArrayProxyHandler(key) {
    function getFromFiltered(so, filtered, index) {
        // Numeric indexing into array
        var value = filtered[index] ? filtered[index]["rawValue"]: filtered[index];
        return value ? SecureObject.filterEverything(so, value) : value;
    }
    function getFilteredValues(so, filtered) { // Gather values from the filtered array
        var ret = [];
        filtered.forEach(function(item){
            var value = item["rawValue"];
            ret.push(value ? SecureObject.filterEverything(so, value) : value);
        });
        return ret;
    }
    var handler = KEY_TO_ARRAY_HANLDER.get(key);
    if (!handler) {
        handler = {
            "getPrototypeOf": function(target) {
                return Object.getPrototypeOf(target);
            },
            "setPrototypeOf": function(target, newProto) {
                return Object.setPrototypeOf(target, newProto);
            },
            "isExtensible": function(target) {
                return Object.isExtensible(target);
            },
            "preventExtensions": function(target) {
                Object.preventExtensions(target);
                return ls_getFromCache(target, key);
            },
            "getOwnPropertyDescriptor": function(target, property) {
                var raw = target;
                var filtered = getFilteredArray(handler, raw, key);
                if (property === "length") {
                    return Object.getOwnPropertyDescriptor(filtered, property);
                }
                if (property in filtered) {
                    return Object.getOwnPropertyDescriptor(raw, filtered[property]["rawIndex"]);
                }
                return undefined;
            },
            "defineProperty": function(target, property, descriptor) {
                var raw = target;
                Object.defineProperty(raw, property, descriptor);
                return true;
            },
            "get": function(target, property) {
                var raw = target;
                var filtered = getFilteredArray(handler, raw, key);
                var ret;

                property = convertSymbol(property);
                if (isNaN(property) || parseFloat(property) < 0 || (parseFloat(property) !== 0 && parseFloat(property) !== parseInt(property, 10))) {
                    switch (property) {
                        case "length":
                            ret = filtered.length;
                            break;
                        case "pop":
                            ret = function() {
                                if (filtered.length > 0){
                                    // Get the filtered value by index to return
                                    var itemValue = getFromFiltered(handler, filtered, filtered.length - 1);
                                    // Get raw index and update the raw array
                                    var itemToRemove = filtered.pop();
                                    raw.splice(itemToRemove["rawIndex"], 1);
                                    return itemValue;
                                } else {
                                    return undefined;
                                }
                            };
                            break;
                        case "push":
                            ret = function() {
                                if (arguments.length === 0 ){
                                    return filtered.length;
                                }
                                for (var i = 0; i < arguments.length ; i++) {
                                    raw.push(SecureObject.filterEverything(handler, arguments[i]));
                                }
                                return filtered.length + arguments.length;
                            };
                            break;
                        case "reverse":
                            ret = function() {
                                raw.reverse();
                                return ls_getFromCache(raw, key);
                            };
                            break;
                        case "shift":
                            ret = function() {
                                if (filtered.length > 0){
                                    // Get the filtered value by index to return
                                    var itemValue = getFromFiltered(handler, filtered, 0);
                                    // Get raw index and update the raw array
                                    var itemToRemove = filtered.shift();
                                    raw.splice(itemToRemove["rawIndex"], 1);
                                    return itemValue;
                                } else {
                                    return undefined;
                                }
                            };
                            break;
                        case "sort":
                            ret = function(compareFunction) {
                                if (arguments.length > 0){
                                    raw.sort(SecureObject.filterEverything(handler, compareFunction));
                                } else{
                                    raw.sort();
                                }
                                return ls_getFromCache(raw, key);
                            };
                            break;
                        case "splice":
                            ret = function(start, deleteCount) {
                                var positionToInsert = raw.length; // By default insert at the end of raw
                                var itemsToRemove = filtered.splice(start, deleteCount);
                                // If there are items to remove
                                if (itemsToRemove.length > 0) {
                                    // Get position to insert the new items if there are any
                                    positionToInsert = itemsToRemove[0]["rawIndex"];
                                    // Remove from raw
                                    for (var i = 0; i < itemsToRemove.length ; i++) {
                                        var itemToRemove = itemsToRemove[i];
                                        // Remove from raw
                                        raw.splice((itemToRemove["rawIndex"] - i), 1);  // Since we are removing elements from raw, account for index adjustment
                                    }
                                } else {
                                    // Not deleting anything but inserting
                                    if (start >= 0 && start < filtered.length) {
                                        positionToInsert = filtered[start]["rawIndex"];
                                    } else if (start >= filtered.length){ // If position is bigger than filtered's last index, insert at end of raw
                                        positionToInsert = raw.length;
                                    } else { // If start is a negative
                                        // If trying to insert at the beginning of filtered array
                                        if((filtered.length + start) <= 0) {
                                            positionToInsert = filtered.length > 0 ? filtered[0]["rawIndex"] : raw.length;
                                        } else{ // Else inserting in the middle of filtered array, get index of element in raw array
                                            positionToInsert = filtered[filtered.length + start]["rawIndex"];
                                        }
                                    }
                                }
                                // If there are items to be inserted
                                var newItems = [];
                                if (arguments.length > 2){
                                    for (var j = 2; j < arguments.length ; j++) {
                                        newItems.push(SecureObject.filterEverything(handler, arguments[j]));
                                    }
                                }
                                if (newItems.length > 0){
                                    raw.splice.apply(raw, [positionToInsert, 0].concat(newItems));
                                }
                                return getFilteredValues(handler, itemsToRemove);
                            };
                            break;
                        case "unshift":
                            ret = function() {
                                if (arguments.length === 0 ){
                                    return filtered.length;
                                } else {
                                    var newItems = [];
                                    for (var i = 0; i < arguments.length ; i++) {
                                        newItems.push(SecureObject.filterEverything(handler, arguments[i]));
                                    }
                                    raw.splice.apply(raw, [0, 0].concat(newItems));
                                    return filtered.length + newItems.length;
                                }
                            };
                            break;
                        case "concat":
                        case "indexOf":
                        case "join":
                        case "lastIndexOf":
                        case "slice":
                            ret = function() {
                                var filteredValues = getFilteredValues(handler, filtered);
                                return filteredValues[property].apply(filteredValues, arguments);
                            };
                            break;
                        // For the iteration handlers, secure the callback function and invoke the method on filtered array
                        case "every":
                        case "filter":
                        case "forEach":
                        case "map":
                        case "reduce":
                        case "reduceRight":
                        case "some":
                            ret = function() {
                                if (arguments.length > 0) {
                                    var secureCallback = SecureObject.filterEverything(handler, arguments[0]);
                                    arguments[0] = secureCallback;
                                }
                                var filteredValues = getFilteredValues(handler, filtered);
                                return filteredValues[property].apply(filteredValues, arguments);
                            };
                            break;
                        case "toString":
                            ret = function() {
                                var filteredValues = getFilteredValues(handler, filtered);
                                return filteredValues.toString();
                            };
                            break;
                        case "Symbol(Symbol.iterator)":
                            ret = function () {
                                var nextIndex = 0;
                                return {
                                    next: function() {
                                        if(nextIndex < filtered.length) {
                                            var value = filtered[nextIndex]["rawValue"];
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
                            if (raw[property]) { // If trying to use array like an associative array
                                ret = SecureObject.filterEverything(handler, raw[property]);
                            } else {
                                $A.warning("Unsupported " + raw + " method: " + property + ". Returning undefined");
                                return undefined;
                            }
                    }
                } else {
                    ret = getFromFiltered(handler, filtered, property);
                }

                return ret;
            },
            "set" : function(target, property, value) {
                var raw = target;
                // Setting numerical indexes, number has to be positive integer, else its treated as an associative array key
                if (!isNaN(property) && (parseFloat(property) >= 0) && (parseFloat(property) === parseInt(property, 10))) {
                    // Refilter raw to recreate the index mapping between raw and filtered value
                    var filtered = getFilteredArray(handler, raw, key);
                    // If we are replacing existing index
                    if (filtered[property]) {
                        raw[filtered[property]["rawIndex"]] = SecureObject.filterEverything(handler, value);
                        return true;
                    } else { // Adding values at a random numerical index greater than length
                        var filteredLength = filtered.length;
                        var newItems = [];
                        for(var i = 0; i < (property - filtered.length); i++) {
                            newItems.push(undefined);
                        }
                        newItems.push(value);
                        // Find the position in raw where we have to insert the new items
                        // If filtered is empty, insert at beginning of raw
                        // else, find the rawIndex of last filtered element and insert one after
                        var positionToInsert = filteredLength ? (filtered[filteredLength-1]["rawIndex"]+1): 0;
                        raw.splice.apply(raw, [positionToInsert, 0].concat(newItems));
                        return true;
                    }
                } else { // Trying to use it like an associative array
                    raw[property] = SecureObject.filterEverything(handler, value);
                    return true;
                }
            },
            "has" : function(target, property) {
                var raw = target;
                var filtered = getFilteredArray(handler, raw, key);
                return property in filtered;
            },
            "ownKeys": function(target) {
                var raw = target;
                var filtered = getFilteredArray(handler, raw, key);
                return Object.getOwnPropertyNames(filtered);
            },
            "deleteProperty": function(target, property) {
                var raw = target;
                // If property is a non-numerical index
                if (isNaN(property) || parseFloat(property) < 0 || (parseFloat(property) !== 0 && parseFloat(property) !== parseInt(property, 10))) {
                    var value = raw[property];
                    // If value was set by using the array like an associative array
                    if (value) {
                        // Check if we have access
                        var rawValue = ls_getRef(value, key);
                        if (rawValue) {
                            delete raw[property];
                        }
                    }
                } else {
                    var filtered = getFilteredArray(handler, raw, key);
                    if (filtered[property]) {
                        delete raw[filtered[property]["rawIndex"]];
                    }
                }
                return true;
            }
            // No handling "apply" and "construct" trap and letting the underlying raw handle apply and throw the error
        };

        ls_setKey(handler, key);

        KEY_TO_ARRAY_HANLDER.set(key, handler);

        Object.freeze(handler);
    }

    return handler;
}

/**
 * Create a proxy to handle Arrays
 * @param raw
 * @param key
 * @returns {Proxy}
 */
SecureObject.createProxyForArrayObjects = function(raw, key) {
    if (!Array.isArray(raw)) {
        $A.warning("Illegal usage of SecureObject.createProxyForArrayObjects");
        return SecureObject.createFilteringProxy(raw, key);
    }
    // Not using a surrogate for array Proxy because we want to support for..in style of looping on arrays
    // Having a fake surrogate does not allow for correct looping. Mitigating this risk by handling all traps for Proxy.
    var proxy = new Proxy(raw, getArrayProxyHandler(key));
    ls_setKey(proxy, key);
    ls_registerProxy(proxy);

    return proxy;
};

var KEY_TO_NAMED_NODE_MAP_HANLDER = typeof Map !== "undefined" ? new Map() : undefined;

function getFilteredNamedNodeMap(raw, key, prototype, caseInsensitiveAttributes) {
    var filtered = {};

    for (var n = 0; n < raw.length; n++) {
        var value = raw[n];
        if (SecureElement.isValidAttributeName(raw, value.name, prototype, caseInsensitiveAttributes)) {
            filtered[n] = value;
        }
    }

    return filtered;
}

function getNamedNodeMapProxyHandler(key, prototype, caseInsensitiveAttributes) {
    function getFromFiltered(so, filtered, index) {
        var value = filtered[index];
        return value ? SecureObject.filterEverything(so, value, { defaultKey: key }) : value;
    }

    var handler = KEY_TO_NAMED_NODE_MAP_HANLDER.get(key);
    if (!handler) {     
        handler = {
                "get": function(target, property) {
                    var raw = ls_getRef(target, key);

                    var filtered = getFilteredNamedNodeMap(raw, key, prototype, caseInsensitiveAttributes);
                    var ret;

                    property = convertSymbol(property);
                    if (isNaN(property)) {
                        switch (property) {
                        case "length":
                            ret = Object.keys(filtered).length;
                            break;
                        case "item":
                            ret = function(index) {
                                return getFromFiltered(handler, filtered, index);
                            };
                        break;
                        case "getNamedItem":
                            ret = function(name) {
                                for (var val in filtered) {
                                    if (name === filtered[val].name) {
                                        return SecureObject.filterEverything(handler, filtered[val], { defaultKey: key });
                                    }
                                }
                                return null;
                            };
                        break;
                        case "setNamedItem":
                            ret = function(attribute) {
                                if (!SecureElement.isValidAttributeName(raw, attribute.name, prototype, caseInsensitiveAttributes)) {
                                    $A.warning(this + " does not allow getting/setting the " + attribute.name.toLowerCase() + " attribute, ignoring!");
                                    return undefined;
                                }
                                // it may not be possible to get here from another Locker so the access check may be unnecessary
                                // keep to error on the safe side
                                ls_verifyAccess(attribute, target);
                                if (ls_isProxy(attribute)) {
                                    attribute = ls_getRef(attribute, key);
                                }
                                return SecureObject.filterEverything(handler, raw["setNamedItem"](attribute), { defaultKey: key });
                            };
                        break;
                        case "removeNamedItem":
                            ret = function(name) {
                                if (!SecureElement.isValidAttributeName(raw, name, prototype, caseInsensitiveAttributes)) {
                                    $A.warning(this + " does not allow removing the " + name.toLowerCase() + " attribute, ignoring!");
                                    return undefined;
                                }
                                return SecureObject.filterEverything(handler, raw["removeNamedItem"](name), { defaultKey: key });
                            };
                        break;
                        case "getNamedItemNS":
                            ret = function(namespace, localName) {
                                for (var val in filtered) {
                                    if (namespace === filtered[val].namespaceURI && localName === filtered[val].localName) {
                                        return SecureObject.filterEverything(handler, filtered[val], { defaultKey: key });
                                    }
                                }
                                return null;
                            };
                        break;
                        case "setNamedItemNS":
                            ret = function(attribute) {
                                if (!SecureElement.isValidAttributeName(raw, attribute.name, prototype, caseInsensitiveAttributes)) {
                                    $A.warning(this + " does not allow getting/setting the " + attribute.name.toLowerCase() + " attribute, ignoring!");
                                    return undefined;
                                }
                                ls_verifyAccess(attribute, target);
                                if (ls_isProxy(attribute)) {
                                    attribute = ls_getRef(attribute, key);
                                }
                                return SecureObject.filterEverything(handler, raw["setNamedItemNS"](attribute), { defaultKey: key });
                            };
                        break;
                        case "removeNamedItemNS":
                            ret = function(namespace, localName) {
                                if (!SecureElement.isValidAttributeName(raw, name, prototype, caseInsensitiveAttributes)) {
                                    $A.warning(this + " does not allow removing the " + name.toLowerCase() + " attribute, ignoring!");
                                    return undefined;
                                }
                                return SecureObject.filterEverything(handler, raw["removeNamedItemNS"](namespace, localName), { defaultKey: key });
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
                },
                "has": function(target, property) {
                    var raw = ls_getRef(target, key);
                    var filtered = getFilteredNamedNodeMap(handler, raw, key, prototype, caseInsensitiveAttributes);
                    return property in filtered;
                }
        };

        ls_setKey(handler, key);

        KEY_TO_NAMED_NODE_MAP_HANLDER.set(key, handler);

        Object.freeze(handler);
    }

    return handler;
}

SecureObject.createProxyForNamedNodeMap = function(raw, key, prototype, caseInsensitiveAttributes) {
    var surrogate = Object.create(Object.getPrototypeOf(raw));
    ls_setRef(surrogate, raw, key);

    var proxy = new Proxy(surrogate, getNamedNodeMapProxyHandler(key, prototype, caseInsensitiveAttributes));
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
            var filteredArgs;
            // Allow hook for pre-processing of the arguments
            if (options && options.beforeCallback) {
                filteredArgs = options.beforeCallback(st, arguments);
            } else{
                filteredArgs = SecureObject.filterArguments(st, arguments, options);
            }

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
            } else if (o instanceof SVGAngle) {
                interfaces.push("SVGAngle");
            } else if (o instanceof SVGCircleElement) {
                interfaces.push("SVGCircleElement");
            } else if (o instanceof SVGClipPathElement) {
                interfaces.push("SVGClipPathElement");
            } else if (o instanceof SVGDefsElement) {
                interfaces.push("SVGGraphicsElement");
            } else if (o instanceof SVGEllipseElement) {
                interfaces.push("SVGEllipseElement");
            } else if (o instanceof SVGFilterElement) {
                interfaces.push("SVGFilterElement");
            } else if (o instanceof SVGForeignObjectElement) {
                interfaces.push("SVGForeignObjectElement");
            } else if (o instanceof SVGImageElement) {
                interfaces.push("SVGImageElement");
            } else if (o instanceof SVGLength) {
                interfaces.push("SVGLength");
            } else if (o instanceof SVGLengthList) {
                interfaces.push("SVGLengthList");
            } else if (o instanceof SVGLineElement) {
                interfaces.push("SVGLineElement");
            } else if (o instanceof SVGLinearGradientElement) {
                interfaces.push("SVGLinearGradientElement");
            } else if (o instanceof SVGMaskElement) {
                interfaces.push("SVGMaskElement");
            } else if (o instanceof SVGNumber) {
                interfaces.push("SVGNumber");
            } else if (o instanceof SVGNumberList) {
                interfaces.push("SVGNumberList");
            } else if (o instanceof SVGPatternElement) {
                interfaces.push("SVGPatternElement");
            } else if (o instanceof SVGPreserveAspectRatio) {
                interfaces.push("SVGPreserveAspectRatio");
            } else if (o instanceof SVGRadialGradientElement) {
                interfaces.push("SVGRadialGradientElement");
            } else if (o instanceof SVGRect) {
                interfaces.push("SVGRect");
            } else if (o instanceof SVGRectElement) {
                interfaces.push("SVGRectElement");
            } else if (o instanceof SVGScriptElement) {
                interfaces.push("SVGScriptElement");
            } else if (o instanceof SVGStopElement) {
                interfaces.push("SVGStopElement");
            } else if (o instanceof SVGStringList) {
                interfaces.push("SVGStringList");
            } else if (o instanceof SVGStyleElement) {
                interfaces.push("SVGStyleElement");
            } else if (o instanceof SVGTransform) {
                interfaces.push("SVGTransform");
            } else if (o instanceof SVGTransformList) {
                interfaces.push("SVGTransformList");
            } else if (o instanceof SVGUseElement) {
                interfaces.push("SVGUseElement");
            } else if (o instanceof SVGViewElement) {
                interfaces.push("SVGViewElement");
            } else if (o instanceof SVGAnimatedAngle) {
                interfaces.push("SVGAnimatedAngle");
            } else if (o instanceof SVGAnimatedBoolean) {
                interfaces.push("SVGAnimatedBoolean");
            } else if (o instanceof SVGAnimatedEnumeration) {
                interfaces.push("SVGAnimatedEnumeration");
            } else if (o instanceof SVGAnimatedInteger) {
                interfaces.push("SVGAnimatedInteger");
            } else if (o instanceof SVGAnimatedLength) {
                interfaces.push("SVGAnimatedLength");
            } else if (o instanceof SVGAnimatedLengthList) {
                interfaces.push("SVGAnimatedLengthList");
            } else if (o instanceof SVGAnimatedNumber) {
                interfaces.push("SVGAnimatedNumber");
            } else if (o instanceof SVGAnimatedNumberList) {
                interfaces.push("SVGAnimatedNumberList");
            } else if (o instanceof SVGAnimatedPreserveAspectRatio) {
                interfaces.push("SVGAnimatedPreserveAspectRatio");
            } else if (o instanceof SVGAnimatedRect) {
                interfaces.push("SVGAnimatedRect");
            } else if (o instanceof SVGAnimatedString) {
                interfaces.push("SVGAnimatedString");
            } else if (o instanceof SVGAnimatedTransformList) {
                interfaces.push("SVGAnimatedTransformList");
            }

            // below may be implemented by multiple types
            if (o instanceof SVGTextContentElement) {
                interfaces.push("SVGTextContentElement");
            }
            if (typeof SVGAnimationElement !== "undefined" && o instanceof SVGAnimationElement) {
                interfaces.push("SVGAnimationElement");
            }
            if (o instanceof SVGGradientElement) {
                interfaces.push("SVGGradientElement");
            }
            if (typeof SVGGraphicsElement !== "undefined" && o instanceof SVGGraphicsElement) {
                interfaces.push("SVGGraphicsElement");
            }
            if (typeof SVGGeometryElement !== "undefined" && o instanceof SVGGeometryElement) {
                interfaces.push("SVGGeometryElement");
            }
            if (o instanceof SVGTextPositioningElement) {
                interfaces.push("SVGTextPositioningElement");
            }

            interfaces.push("SVGElement");
        }

        interfaces.push("Element", "Node", "EventTarget");
    } else if (o instanceof Text) {
        interfaces.push("Text", "CharacterData", "Node");
    } else if (o instanceof Comment) {
        interfaces.push("CharacterData", "Node");
    } else if (o instanceof Attr) {
        interfaces.push("Attr", "Node", "EventTarget");
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
                    trustReturnValue: item.trustReturnValue || false,
                    rawArguments: item.rawArguments || false
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
                trustReturnValue: item.trustReturnValue || false,
                rawArguments: item.rawArguments || false
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
