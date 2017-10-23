/**
 * Copyright (C) 2017 salesforce.com, inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * Bundle from LockerService-Core
 * Generated: 2017-10-23
 * Version: 0.2.2
 */

(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(factory((global.AuraLocker = global.AuraLocker || {})));
}(this, (function (exports) { 'use strict';

const DEFAULT = {};
const FUNCTION = { type: "function" };
const FUNCTION_TRUST_RETURN_VALUE = { type: "function", trustReturnValue: true };
const EVENT = { type: "@event" };
const SKIP_OPAQUE = { skipOpaque: true };
const FUNCTION_RAW_ARGS = { type: "function", rawArguments: true };

const CTOR = { type: "@ctor" };
const RAW = { type: "@raw" };
const READ_ONLY_PROPERTY = { writable: false };

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
var substituteMapForWeakMap = false;

if (typeof WeakMap !== "undefined" && typeof Proxy !== "undefined") {
    // Test for the Edge weakmap with proxies bug https://github.com/Microsoft/ChakraCore/issues/1662
    var map = new WeakMap();
    var proxyAsKey = new Proxy({}, {});
    map.set(proxyAsKey, true);
    substituteMapForWeakMap = map.get(proxyAsKey) !== true;
}

function newWeakMap() {
    return typeof WeakMap !== "undefined" ? (!substituteMapForWeakMap ? new WeakMap() : new Map()) : {
        /* WeakMap dummy polyfill */
        get: function() {
            return undefined;
        },
        set: function() {
        }
    };
}

// Keyed objects can only have one owner. We prevent "null" and "undefined"
// keys by guarding all set operations.
var keychain = newWeakMap();
var rawToSecureByKey = new Map();
var secureToRaw = newWeakMap();
var opaqueSecure = newWeakMap();
var objectToKeyedData = newWeakMap();
var secureProxy = newWeakMap();
var filteringProxy = newWeakMap();
var secureFunction = newWeakMap();

function getKey(thing) {
    return keychain.get(thing);
}

function setKey(thing, key) {
    if (!thing) {
        return;
    }
    if (!key) {
        throw new Error("Setting an empty key is prohibited.");
    }
    var hasKey = keychain.get(thing);
    if (hasKey === undefined) {
        keychain.set(thing, key);
    } else if (hasKey === key) {
        // noop.
    } else {
        // Prevent keyed objects from being keyed again.
        throw new Error("Re-setting of key is prohibited.");
    }
}

function trust$1(from, thing) {
    if (from) {
        var key = keychain.get(from);
        if (key) {
            setKey(thing, key);
        }
    }
}

function hasAccess(from, to) {
    return keychain.get(from) === keychain.get(to);
}

function verifyAccess(from, to, skipOpaque) {
    var fromKey = keychain.get(from);
    var toKey = keychain.get(to);
    if ((fromKey !== toKey) || (skipOpaque && isOpaque(to))) {
        throw new Error("Access denied: " + JSON.stringify({
            from: fromKey,
            to: toKey
        }));
    }
}

function getRef(st, key, skipOpaque) {
    var toKey = keychain.get(st);
    if ((toKey !== key) || (skipOpaque && opaqueSecure.get(st))) {
        throw new Error("Access denied: " + JSON.stringify({
            from: key,
            to: toKey
        }));
    }

    return secureToRaw.get(st);
}

function setRef(st, raw, key, isOpaque) {
    if (!st) {
        throw new Error("Setting an empty reference is prohibited.");
    }
    if (!key) {
        throw new Error("Setting an empty key is prohibited.");
    }
    setKey(st, key);
    secureToRaw.set(st, raw);
    if (isOpaque) {
        opaqueSecure.set(st, true);
    }
}

function getData(object, key) {
    var keyedData = objectToKeyedData.get(object);
    return keyedData ? keyedData.get(key) : undefined;
}

function setData(object, key, data) {
    var keyedData = objectToKeyedData.get(object);
    if (!keyedData) {
        keyedData = newWeakMap();
        objectToKeyedData.set(object, keyedData);
    }

    keyedData.set(key, data);
}

function isOpaque(st) {
    return opaqueSecure.get(st) === true;
}

function isProxy(st) {
    return secureProxy.get(st) === true;
}

function registerProxy(st) {
    secureProxy.set(st, true);
}

function registerFilteringProxy(st) {
    filteringProxy.set(st, true);
}

function isFilteringProxy(st) {
    return filteringProxy.get(st) === true;
}

function registerSecureFunction(st) {
    secureFunction.set(st, true);
}

function isSecureFunction(st) {
    return secureFunction.get(st) === true;
}

function unwrap$1(from, st) {
    if (!st) {
        return st;
    }

    var key = keychain.get(from);
    var ref;

    if (Array.isArray(st)) {
        // Only getRef on "secure" arrays
        if (secureToRaw.get(st)) {
            // Secure array - reconcile modifications to the filtered clone with the actual array
            ref = getRef(st, key);

            var originalLength = ref.length;
            var insertIndex = 0;
            for (var n = 0; n < st.length; n++) {
                // Find the next available location that corresponds to the filtered projection of the array
                while (insertIndex < originalLength && getKey(ref[insertIndex]) !== key) {
                    insertIndex++;
                }

                ref[insertIndex++] = unwrap$1(from, st[n]);
            }
        } else {
            ref = [];
        }
    } else {
        ref = getRef(st, key);
    }

    return ref;
}

function addToCache(raw, st, key) {
    if (!raw) {
        throw new Error("Caching an empty reference is prohibited.");
    }

    if (!key) {
        throw new Error("Caching with an empty key is prohibited.");
    }

    var rawToSecure = rawToSecureByKey.get(key);
    if (!rawToSecure) {
        rawToSecure = new WeakMap();
        rawToSecureByKey.set(key, rawToSecure);
    }

    rawToSecure.set(raw, st);
}


function getFromCache(raw, key) {
    var rawToSecure = rawToSecureByKey.get(key);
    return rawToSecure && rawToSecure.get(raw);
}

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

const metadata$4 = {
    "ATTRIBUTE_NODE":                 DEFAULT,
    "CDATA_SECTION_NODE":             DEFAULT,
    "COMMENT_NODE":                   DEFAULT,
    "DOCUMENT_FRAGMENT_NODE":         DEFAULT,
    "DOCUMENT_NODE":                  DEFAULT,
    "DOCUMENT_POSITION_CONTAINED_BY": DEFAULT,
    "DOCUMENT_POSITION_CONTAINS":     DEFAULT,
    "DOCUMENT_POSITION_DISCONNECTED": DEFAULT,
    "DOCUMENT_POSITION_FOLLOWING":    DEFAULT,
    "DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC": DEFAULT,
    "DOCUMENT_POSITION_PRECEDING":    DEFAULT,
    "DOCUMENT_TYPE_NODE":             DEFAULT,
    "ELEMENT_NODE":                   DEFAULT,
    "ENTITY_NODE":                    DEFAULT,
    "ENTITY_REFERENCE_NODE":          DEFAULT,
    "NOTATION_NODE":                  DEFAULT,
    "PROCESSING_INSTRUCTION_NODE":    DEFAULT,
    "TEXT_NODE":                      DEFAULT,
    "appendChild":                    FUNCTION,
    "baseURI":                        DEFAULT,
    "childNodes":                     DEFAULT,
    "cloneNode":                      FUNCTION,
    "compareDocumentPosition":        FUNCTION_RAW_ARGS,
    "contains":                       FUNCTION_RAW_ARGS,
    "firstChild":                     SKIP_OPAQUE,
    "insertBefore":                   FUNCTION,
    "isDefaultNamespace":             FUNCTION,
    "isEqualNode":                    FUNCTION_RAW_ARGS,
    "isSameNode":                     FUNCTION_RAW_ARGS,
    "lastChild":                      SKIP_OPAQUE,
    "lookupNamespaceURI":             FUNCTION,
    "lookupPrefix":                   FUNCTION,
    "nextSibling":                    SKIP_OPAQUE,
    "nodeName":                       DEFAULT,
    "nodeType":                       DEFAULT,
    "nodeValue":                      DEFAULT,
    "normalize":                      FUNCTION,
    "ownerDocument":                  DEFAULT,
    "parentElement":                  SKIP_OPAQUE,
    "parentNode":                     SKIP_OPAQUE,
    "previousSibling":                SKIP_OPAQUE,
    "removeChild":                    FUNCTION,
    "replaceChild":                   FUNCTION,
    "textContent":                    DEFAULT
};

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

function SecureDOMEvent(event, key) {

    var o = getFromCache(event, key);
    if (o) {
        return o;
    }

    o = Object.create(null, {
        toString: {
            value: function() {
                return "SecureDOMEvent: " + event + "{ key: " + JSON.stringify(key) + " }";
            }
        }
    });

    var DOMEventSecureDescriptors = {
        // Events properties that are DOM Elements were compiled from
        // https://developer.mozilla.org/en-US/docs/Web/Events
        target: SecureObject.createFilteredProperty(o, event, "target"),
        currentTarget: SecureObject.createFilteredProperty(o, event, "currentTarget"),

        initEvent: SecureObject.createFilteredMethod(o, event, "initEvent"),
        // Touch Events are special on their own:
        // https://developer.mozilla.org/en-US/docs/Web/API/Touch
        touches: SecureDOMEvent.filterTouchesDescriptor(o, event, "touches"),
        targetTouches: SecureDOMEvent.filterTouchesDescriptor(o, event, "targetTouches"),
        changedTouches: SecureDOMEvent.filterTouchesDescriptor(o, event, "changedTouches"),

        view: {
            get: function() {
                var key = getKey(o);
                var swin = getEnv$1(key);
                var win = getRef(swin, key);
                return win === event.view ? swin : undefined;
            }
        }
    };

    ["preventDefault", "stopImmediatePropagation", "stopPropagation"].forEach(function(method) {
        SecureObject.addMethodIfSupported(o, event, method);
    });

    // non-standard properties and aliases
    ["relatedTarget", "srcElement", "explicitOriginalTarget", "originalTarget"].forEach(function(property) {
        SecureObject.addPropertyIfSupported(o, event, property);
    });

    // re-exposing externals
    // TODO: we might need to include non-enumerables
    for (var name in event) {
        if (!(name in o)) {
            // every DOM event has a different shape, we apply filters when possible,
            // and bypass when no secure filter is found.
            Object.defineProperty(o, name, DOMEventSecureDescriptors[name] || SecureObject.createFilteredProperty(o, event, name));
        }
    }

    setRef(o, event, key);
    addToCache(event, o, key);
    registerProxy(o);

    return o;
}

SecureDOMEvent.filterTouchesDescriptor = function(se, event, propName) {

    var valueOverride;
    // descriptor to produce a new collection of touches where the target of each
    // touch is a secure element
    return {
        get: function() {
            if (valueOverride) {
                return valueOverride;
            }
            // perf hard-wired in case there is not a touches to wrap
            var touches = event[propName];
            if (!touches) {
                return touches;
            }
            // touches, of type ToucheList does not implement "map"
            return Array.prototype.map.call(touches, function(touch) {
                // touches is normally a big big collection of touch objects,
                // we do not want to pre-process them all, just create the getters
                // and process the accessor on the spot. e.g.:
                // https://developer.mozilla.org/en-US/docs/Web/Events/touchstart
                var keys = [];
                var touchShape = touch;
                // Walk up the prototype chain and gather all properties
                do {
                    keys = keys.concat(Object.keys(touchShape));
                } while ((touchShape = Object.getPrototypeOf(touchShape)) && touchShape !== Object.prototype);

                // Create a stub object with all the properties
                return keys.reduce(function(o, p) {
                    return Object.defineProperty(o, p, {
                        // all props in a touch object are readonly by spec:
                        // https://developer.mozilla.org/en-US/docs/Web/API/Touch
                        get: function() {
                            return SecureObject.filterEverything(se, touch[p]);
                        }
                    });
                }, {});
            });
        },
        set: function(value) {
            valueOverride = value;
        }
    };
};

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

const metadata$5 = {
    "addEventListener":               FUNCTION,
    "dispatchEvent":                  FUNCTION,
    "removeEventListener":            FUNCTION
};

function addEventTargetMethods(st, raw, key) {
    Object.defineProperties(st, {
        addEventListener: createAddEventListenerDescriptor(st, raw, key),
        dispatchEvent: SecureObject.createFilteredMethod(st, raw, "dispatchEvent", { rawArguments: true }),

        // removeEventListener() is special in that we do not want to
        // unfilter/unwrap the listener argument or it will not match what
        // was actually wired up originally
        removeEventListener: {
            writable: true,
            value: function(type, listener, options) {
                var sCallback = getFromCache(listener, key);
                raw.removeEventListener(type, sCallback, options);
            }
        }
    });
}

function createEventTargetMethodsStateless(config, prototype) {
    config["addEventListener"] = createAddEventListenerDescriptorStateless(prototype);

    config["dispatchEvent"] = SecureObject.createFilteredMethodStateless("dispatchEvent", prototype, { rawArguments: true });

    // removeEventListener() is special in that we do not want to
    // unfilter/unwrap the listener argument or it will not match what
    // was actually wired up originally
    config["removeEventListener"] = {
        value: function(type, listener, options) {
            var raw = SecureObject.getRaw(this);
            var sCallback = getFromCache(listener, getKey(this));
            raw.removeEventListener(type, sCallback, options);
        }
    };
}

function createAddEventListenerDescriptor(st, el, key) {
    return {
        writable: true,
        value: function(event, callback, useCapture) {
            if (!callback) {
                return; // by spec, missing callback argument does not throw,
                // just ignores it.
            }

            var sCallback = getFromCache(callback, key);
            if (!sCallback) {
                sCallback = function(e) {
                    verifyAccess(st, callback, true);
                    var se = SecureDOMEvent(e, key);
                    callback.call(st, se);
                };

                // Back reference for removeEventListener() support
                addToCache(callback, sCallback, key);
                setKey(callback, key);
            }

            el.addEventListener(event, sCallback, useCapture);
        }
    };
}

function createAddEventListenerDescriptorStateless() {
    return {
        value: function(event, callback, useCapture) {
            if (!callback) {
                return; // by spec, missing callback argument does not throw,
                // just ignores it.
            }

            var so = this;
            var el = SecureObject.getRaw(so);
            var key = getKey(so);
            var sCallback = getFromCache(callback, key);
            if (!sCallback) {
                sCallback = function(e) {
                    verifyAccess(so, callback, true);
                    var se = SecureDOMEvent(e, key);
                    callback.call(so, se);
                };

                // Back reference for removeEventListener() support
                addToCache(callback, sCallback, key);
                setKey(callback, key);
            }

            el.addEventListener(event, sCallback, useCapture);
        }
    };
}

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

function SecureDocument(doc, key) {

    var o = getFromCache(doc, key);
    if (o) {
        return o;
    }

    // create prototype to allow instanceof checks against document
    var prototype = function() {};
    Object.freeze(prototype);

    o = Object.create(prototype, {
        toString: {
            value: function() {
                return "SecureDocument: " + doc + "{ key: " + JSON.stringify(key) + " }";
            }
        },
        createAttribute: {
            value: function(name) {
                var att = doc.createAttribute(name);
                setKey(att, key);
                return SecureElement(att, key);
            }
        },
        createElement: {
            value: function(tag) {
                var el = doc.createElement(tag);
                setKey(el, key);
                return SecureElement(el, key);
            }
        },
        createElementNS: {
            value: function(namespace, tag) {
                var el = doc.createElementNS(namespace, tag);
                setKey(el, key);
                return SecureElement(el, key);
            }
        },
        createDocumentFragment: {
            value: function() {
                var el = doc.createDocumentFragment();
                setKey(el, key);
                return SecureElement(el, key);
            }
        },
        createTextNode: {
            value: function(text) {
                var el = doc.createTextNode(text);
                setKey(el, key);
                return SecureElement(el, key);
            }
        },
        createComment: {
            value: function(data) {
                var el = doc.createComment(data);
                setKey(el, key);
                return SecureElement(el, key);
            }
        },
        domain: {
            get: function() {
                return doc.domain;
            },
            set: function() {
                throw new Error("SecureDocument does not allow setting domain property.");
            }
        },
        querySelector: {
            value: function(selector) {
                return SecureElement.secureQuerySelector(doc, key, selector);
            }
        }
    });

    addEventTargetMethods(o, doc, key);

    function getCookieKey() {
        return "LSKey[" + key["namespace"] + "]";
    }

    Object.defineProperty(o, "cookie", {
        get: function() {
            var fullCookie = doc.cookie;
            var entries = fullCookie.split(";");
            var cookieKey = getCookieKey();
            // filter out cookies that do not match current namespace
            var nsFiltered = entries.filter(function(val) {
                var left = val.split("=")[0].trim();
                return left.indexOf(cookieKey) === 0;
            });
            // strip LockerService key before returning to user land
            var keyFiltered = nsFiltered.map(function(val) {
                return val.trim().substring(cookieKey.length);
            });
            return keyFiltered.join("; ");
        },
        set: function(cookie) {
            var chunks = cookie.split(";");
            var entry = chunks[0].split("=");
            var newKey = getCookieKey() + entry[0];
            chunks[0] = newKey + "=" + entry[1];
            var newCookie = chunks.join(";");
            doc.cookie = newCookie;
        }
    });

    ["implementation"].forEach(function(name) {
        // These are direct passthrough's and should never be wrapped in a SecureObject
        Object.defineProperty(o, name, {
            enumerable: true,
            value: doc[name]
        });
    });

    SecureObject.addPrototypeMethodsAndProperties(metadata$3, o, doc, key);

    setRef(o, doc, key);
    addToCache(doc, o, key);
    registerProxy(o);

    return o;
}

const metadata$3 = {
    "prototypes": {
        "HTMLDocument" : {
            // Defined on Instance
            "location":                         DEFAULT,
            // Defined on Proto
            "fgColor":                          DEFAULT,
            "linkColor":                        DEFAULT,
            "vlinkColor":                       DEFAULT,
            "alinkColor":                       DEFAULT,
            "bgColor":                          DEFAULT,
            "clear":                            FUNCTION,
            "captureEvents":                    FUNCTION,
            "releaseEvents":                    FUNCTION
        },
        "Document" : {
            "URL":                              DEFAULT,
            "activeElement":                    DEFAULT,
            "adoptNode":                        FUNCTION,
            "anchors":                          DEFAULT,
            "applets":                          DEFAULT,
            "body":                             DEFAULT,
            "caretRangeFromPoint":              FUNCTION,
            "characterSet":                     DEFAULT,
            "charset":                          DEFAULT,
            "childElementCount":                DEFAULT,
            "children":                         DEFAULT,
            "close":                            FUNCTION,
            "compatMode":                       DEFAULT,
            "contentType":                      DEFAULT,
            "cookie":                           DEFAULT,
            "createAttribute":                  FUNCTION,
            "createAttributeNS":                FUNCTION,
            "createCDATASection":               FUNCTION,
            "createComment":                    FUNCTION,
            "createDocumentFragment":           FUNCTION,
            "createElement":                    FUNCTION,
            "createElementNS":                  FUNCTION,
            "createEvent":                      FUNCTION,
            "createExpression":                 FUNCTION,
            "createNSResolver":                 FUNCTION,
            "createNodeIterator":               FUNCTION,
            "createProcessingInstruction":      FUNCTION,
            "createRange":                      FUNCTION,
            "createTextNode":                   FUNCTION,
            "createTreeWalker":                 FUNCTION,
            "defaultView":                      DEFAULT,
            "designMode":                       DEFAULT,
            "dir":                              DEFAULT,
            "doctype":                          DEFAULT,
            "documentElement":                  DEFAULT,
            "documentURI":                      DEFAULT,
            // SecureDocument does not allow setting domain property.
            // "domain":                           DEFAULT,
            "elementFromPoint":                 FUNCTION,
            "elementsFromPoint":                FUNCTION,
            "embeds":                           DEFAULT,
            "evaluate":                         FUNCTION,
            "execCommand":                      FUNCTION,
            "exitPointerLock":                  FUNCTION,
            "firstElementChild":                DEFAULT,
            "fonts":                            DEFAULT,
            "forms":                            DEFAULT,
            "getElementById":                   FUNCTION,
            "getElementsByClassName":           FUNCTION,
            "getElementsByName":                FUNCTION,
            "getElementsByTagName":             FUNCTION,
            "getElementsByTagNameNS":           FUNCTION,
            "getSelection":                     FUNCTION,
            "hasFocus":                         FUNCTION,
            "head":                             DEFAULT,
            "hidden":                           DEFAULT,
            "images":                           DEFAULT,
            "implementation":                   DEFAULT,
            "importNode":                       FUNCTION,
            "inputEncoding":                    DEFAULT,
            "lastElementChild":                 DEFAULT,
            "lastModified":                     DEFAULT,
            "links":                            DEFAULT,
            "onabort":                          EVENT,
            "onautocomplete":                   EVENT,
            "onautocompleteerror":              EVENT,
            "onbeforecopy":                     EVENT,
            "onbeforecut":                      EVENT,
            "onbeforepaste":                    EVENT,
            "onblur":                           EVENT,
            "oncancel":                         EVENT,
            "oncanplay":                        EVENT,
            "oncanplaythrough":                 EVENT,
            "onchange":                         EVENT,
            "onclick":                          EVENT,
            "onclose":                          EVENT,
            "oncontextmenu":                    EVENT,
            "oncopy":                           EVENT,
            "oncuechange":                      EVENT,
            "oncut":                            EVENT,
            "ondblclick":                       EVENT,
            "ondrag":                           EVENT,
            "ondragend":                        EVENT,
            "ondragenter":                      EVENT,
            "ondragleave":                      EVENT,
            "ondragover":                       EVENT,
            "ondragstart":                      EVENT,
            "ondrop":                           EVENT,
            "ondurationchange":                 EVENT,
            "onemptied":                        EVENT,
            "onended":                          EVENT,
            "onerror":                          EVENT,
            "onfocus":                          EVENT,
            "oninput":                          EVENT,
            "oninvalid":                        EVENT,
            "onkeydown":                        EVENT,
            "onkeypress":                       EVENT,
            "onkeyup":                          EVENT,
            "onload":                           EVENT,
            "onloadeddata":                     EVENT,
            "onloadedmetadata":                 EVENT,
            "onloadstart":                      EVENT,
            "onmousedown":                      EVENT,
            "onmouseenter":                     EVENT,
            "onmouseleave":                     EVENT,
            "onmousemove":                      EVENT,
            "onmouseout":                       EVENT,
            "onmouseover":                      EVENT,
            "onmouseup":                        EVENT,
            "onmousewheel":                     EVENT,
            "onpaste":                          EVENT,
            "onpause":                          EVENT,
            "onplay":                           EVENT,
            "onplaying":                        EVENT,
            "onpointerlockchange":              EVENT,
            "onpointerlockerror":               EVENT,
            "onprogress":                       EVENT,
            "onratechange":                     EVENT,
            "onreadystatechange":               EVENT,
            "onreset":                          EVENT,
            "onresize":                         EVENT,
            "onscroll":                         EVENT,
            "onsearch":                         EVENT,
            "onseeked":                         EVENT,
            "onseeking":                        EVENT,
            "onselect":                         EVENT,
            "onselectionchange":                EVENT,
            "onselectstart":                    EVENT,
            "onshow":                           EVENT,
            "onstalled":                        EVENT,
            "onsubmit":                         EVENT,
            "onsuspend":                        EVENT,
            "ontimeupdate":                     EVENT,
            "ontoggle":                         EVENT,
            "ontouchcancel":                    EVENT,
            "ontouchend":                       EVENT,
            "ontouchmove":                      EVENT,
            "ontouchstart":                     EVENT,
            "onvolumechange":                   EVENT,
            "onwaiting":                        EVENT,
            "onwebkitfullscreenchange":         EVENT,
            "onwebkitfullscreenerror":          EVENT,
            "onwheel":                          EVENT,
            "open":                             FUNCTION,
            "origin":                           DEFAULT,
            "plugins":                          DEFAULT,
            "pointerLockElement":               DEFAULT,
            "preferredStylesheetSet":           DEFAULT,
            "queryCommandEnabled":              FUNCTION,
            "queryCommandIndeterm":             FUNCTION,
            "queryCommandState":                FUNCTION,
            "queryCommandSupported":            FUNCTION,
            "queryCommandValue":                FUNCTION,
            "querySelector":                    FUNCTION,
            "querySelectorAll":                 FUNCTION,
            "readyState":                       DEFAULT,
            "referrer":                         DEFAULT,
            "registerElement":                  FUNCTION,
            "rootElement":                      DEFAULT,
            "scripts":                          DEFAULT,
            "scrollingElement":                 DEFAULT,
            "selectedStylesheetSet":            DEFAULT,
            "styleSheets":                      DEFAULT,
            "title":                            DEFAULT,
            "visibilityState":                  DEFAULT,
            "webkitCancelFullScreen":           FUNCTION,
            "webkitCurrentFullScreenElement":   DEFAULT,
            "webkitExitFullscreen":             FUNCTION,
            "webkitFullscreenElement":          DEFAULT,
            "webkitFullscreenEnabled":          DEFAULT,
            "webkitHidden":                     DEFAULT,
            "webkitIsFullScreen":               DEFAULT,
            "webkitVisibilityState":            DEFAULT,
            // Blocked on purpose because of security risk
            // "write":                            FUNCTION,
            // "writeln":                          FUNCTION,
            "xmlEncoding":                      DEFAULT,
            "xmlStandalone":                    DEFAULT,
            "xmlVersion":                       DEFAULT
        },
        "Node": metadata$4,
        "EventTarget": metadata$5
    }
};

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

function SecureLocation(loc, key) {

    var o = getFromCache(loc, key);
    if (o) {
        return o;
    }

    o = Object.create(null, {
        toString: {
            value: function() {
                return loc.href;
            }
        }
    });

    ["href", "protocol", "host", "hostname", "port", "pathname", "search", "hash", "username", "password", "origin"].forEach(function(property) {
        SecureObject.addPropertyIfSupported(o, loc, property);
    });

    ["assign", "reload", "replace"].forEach(function(method) {
        SecureObject.addMethodIfSupported(o, loc, method);
    });

    setRef(o, loc, key);
    addToCache(loc, o, key);
    registerProxy(o);

    return o;
}

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

function SecureNavigator(navigator, key) {

    var o = getFromCache(navigator, key);
    if (o) {
        return o;
    }

    o = Object.create(null, {
        toString: {
            value: function() {
                return "SecureNavigator: " + navigator + "{ key: " + JSON.stringify(key) + " }";
            }
        }
    });

    ["appCodeName", "appName", "appVersion", "cookieEnabled", "geolocation",
        "language", "onLine", "platform", "product", "userAgent"].forEach(function(name) {
            SecureObject.addPropertyIfSupported(o, navigator, name);
        });

    ["mediaDevices", "mozGetUserMedia", "webkitGetUserMedia"].forEach(function(name) {
        SecureObject.addRTCMediaApis(o, navigator, name, key);
    });

    setRef(o, navigator, key);
    addToCache(navigator, o, key);
    registerProxy(o);

    return o;
}

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

let warn = window.console.warn;
let error = Error;

function registerReportAPI(api) {
    if (api) {
        warn = api.warn;
        error = api.error;
    }
}

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

function SecureXMLHttpRequest(key) {

    // Create a new closure constructor for new XHMLHttpRequest() syntax support that captures the key
    return function() {
        var xhr = new XMLHttpRequest();

        var o = Object.create(null, {
            toString: {
                value: function() {
                    return "SecureXMLHttpRequest: " + xhr + " { key: " + JSON.stringify(key) + " }";
                }
            }
        });

        // Properties
        ["readyState", "status", "statusText", "response", "responseType", "responseText",
            "responseURL", "timeout", "withCredentials", "upload"].forEach(function(name) {
                SecureObject.addPropertyIfSupported(o, xhr, name);
            });

        SecureObject.addPropertyIfSupported(o, xhr, "responseXML", {
            afterGetCallback: function(value) {
                return value;
            }
        });

        // Event handlers
        ["onloadstart", "onprogress", "onabort", "onerror", "onload", "ontimeout", "onloadend", "onreadystatechange"].forEach(function(name) {
            Object.defineProperty(o, name, {
                set: function(callback) {
                    xhr[name] = function(e) {
                        callback.call(o, SecureDOMEvent(e, key));
                    };
                }
            });
        });

        Object.defineProperties(o, {
            abort: SecureObject.createFilteredMethod(o, xhr, "abort"),

            addEventListener: createAddEventListenerDescriptor(o, xhr, key),

            open: SecureObject.createFilteredMethod(o, xhr, "open", {
                beforeCallback: function(method, url) {
                    var normalizer = document.createElement("a");
                    normalizer.href = decodeURIComponent(url + "");
                    var urlLower = normalizer.href.toLowerCase();
                    // TODO: inject URL prefix check
                    if (urlLower.indexOf("/aura") >= 0) {
                        throw new error("SecureXMLHttpRequest.open cannot be used with Aura framework internal API endpoints " + url + "!");
                    }
                }
            }),

            send: SecureObject.createFilteredMethod(o, xhr, "send"),

            getAllResponseHeaders: SecureObject.createFilteredMethod(o, xhr, "getAllResponseHeaders"),
            getResponseHeader: SecureObject.createFilteredMethod(o, xhr, "getResponseHeader"),

            setRequestHeader: SecureObject.createFilteredMethod(o, xhr, "setRequestHeader"),

            overrideMimeType: SecureObject.createFilteredMethod(o, xhr, "overrideMimeType")
        });

        setRef(o, xhr, key);

        return Object.freeze(o);
    };
}

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

function SecureMutationObserver(key) {

    function filterRecords(st, records) {
        var filtered = [];

        records.forEach(function(record) {
            if (hasAccess(st, record.target)) {
                filtered.push(SecureObject.filterEverything(st, record));
            }
        });

        return filtered;
    }

    // Create a new closure constructor for new XHMLHttpRequest() syntax support that captures the key
    return function(callback) {
        var o = Object.create(null);

        var observer = new MutationObserver(function(records) {
            var filtered = filterRecords(o, records);
            if (filtered.length > 0) {
                callback(filtered);
            }
        });

        Object.defineProperties(o, {
            toString: {
                value: function() {
                    return "SecureMutationObserver: " + observer + " { key: " + JSON.stringify(key) + " }";
                }
            },

            "observe": SecureObject.createFilteredMethod(o, observer, "observe", { rawArguments: true }),
            "disconnect": SecureObject.createFilteredMethod(o, observer, "disconnect"),

            "takeRecords": {
                writable: true,
                value: function() {
                    return filterRecords(o, observer["takeRecords"]());
                }
            }
        });

        setRef(o, observer, key);

        return Object.freeze(o);
    };
}

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

function SecureNotification(key) {

    // Create a new closure constructor for new Notification() syntax support that captures the key
    return function(title, options) {
        var notification = new Notification(title, options);

        var o = Object.create(null, {
            toString: {
                value: function() {
                    return "SecureNotification: " + notification + " { key: " + JSON.stringify(key) + " }";
                }
            }
        });

        // Properties
        ["actions", "badge", "body", "data", "dir", "lang", "tag", "icon", "image", "requireInteraction",
            "silent", "timestamp", "title", "vibrate", "noscreen", "renotify", "sound", "sticky"].forEach(function (name) {
                SecureObject.addPropertyIfSupported(o, notification, name);
            });

        // Event handlers
        ["onclick", "onerror"].forEach(function (name) {
            Object.defineProperty(o, name, {
                set: function(callback) {
                    notification[name] = function(e) {
                        callback.call(o, SecureDOMEvent(e, key));
                    };
                }
            });
        });

        Object.defineProperties(o, {
            close: SecureObject.createFilteredMethod(o, notification, "close")
        });

        setRef(o, notification, key);

        return Object.freeze(o);
    };
}

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

function SecureStorage(storage, type, key) {

    var o = getFromCache(storage, key);
    if (o) {
        return o;
    }

    // Read existing key to synthetic key index from storage
    var stringizedKey = JSON.stringify(key);
    var nextSyntheticKey = "LSSNextSynthtic:" + type;
    var storedIndexKey = "LSSIndex:" + type + stringizedKey;
    var nameToSyntheticRaw;
    try {
      nameToSyntheticRaw = storage.getItem(storedIndexKey);
    } catch(e) {
      // There is a bug in google chrome where localStorage becomes inaccessible.
      // Don't fast fail and break all applications. Defer the exception throwing to when the app actually uses localStorage
    }
    var nameToSynthetic = nameToSyntheticRaw ? JSON.parse(nameToSyntheticRaw) : {};

    function persistSyntheticNameIndex() {
        // Persist the nameToSynthetic index
        var stringizedIndex = JSON.stringify(nameToSynthetic);
        storage.setItem(storedIndexKey, stringizedIndex);
    }

    function getSynthetic(name) {
        var synthetic = nameToSynthetic[name];
        if (!synthetic) {
            var nextSynthticRaw = storage.getItem(nextSyntheticKey);
            var nextSynthetic = nextSynthticRaw ? Number(nextSynthticRaw) : 1;

            synthetic = nextSynthetic++;

            // Persist the next synthetic counter
            storage.setItem(nextSyntheticKey, nextSynthetic);

            nameToSynthetic[name] = synthetic;

            persistSyntheticNameIndex();
        }

        return synthetic;
    }

    function forgetSynthetic(name) {
        var synthetic = getSynthetic(name);
        if (synthetic) {
            delete nameToSynthetic[name];
            persistSyntheticNameIndex();
        }
    }

    o = Object.create(null, {
        toString: {
            value: function() {
                return "SecureStorage: " + type + " { key: " + JSON.stringify(key) + " }";
            }
        },

        length: {
            get: function() {
                return Object.keys(nameToSynthetic).length;
            }
        },

        getItem: {
            value: function(name) {
                var synthetic = getSynthetic(name);
                return synthetic ? storage.getItem(synthetic) : null;
            }
        },

        setItem: {
            value: function(name, value) {
                var synthetic = getSynthetic(name);
                storage.setItem(synthetic, value);
            }
        },

        removeItem: {
            value: function(name) {
                var syntheticKey = getSynthetic(name);
                if (syntheticKey) {
                    storage.removeItem(syntheticKey);
                    forgetSynthetic(name);
                }
            }
        },

        key: {
            value: function(index) {
                return Object.keys(nameToSynthetic)[index];
            }
        },

        clear: {
            value: function() {
                Object.keys(nameToSynthetic).forEach(function(name) {
                    var syntheticKey = getSynthetic(name);
                    storage.removeItem(syntheticKey);
                });

                // Forget all synthetic
                nameToSynthetic = {};
                storage.removeItem(storedIndexKey);
            }
        }
    });

    setRef(o, storage, key);
    addToCache(storage, o, key);
    registerProxy(o);

    return o;
}

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

// For URL, we only need to tame one static method. That method is on the
// window.URL primordial and disappears from instances of URL. We only create
// the secure object and we will let the deep freeze operation make it tamper
// proof.

// Taming of URL createObjectURL will not be necessary on webkit
// "CSP rules ignored when a page navigates to a blob URL" is declassified,
// https://bugs.webkit.org/show_bug.cgi?id=174883

// and once the correct behavior on Edge is confirmed (curently in development)
// https://developer.microsoft.com/en-us/microsoft-edge/platform/status/urlapi/

// Only FireFox implements the correct behavior.

function SecureURL(raw) {

  var SecureURLMethods = Object.create(null,{
    'createObjectURL': {
      value: function(object) {
        if (Object.prototype.toString.call(object) === '[object Blob]') {
          if (object.type === 'text/html') {
            // There are no relible ways to convert syncronously
            // a blob back to a string. Disallow until
            // <rdar://problem/33575448> is declassified
            throw new TypeError("SecureURL does not allow creation of Object URL from blob type " + object.type);
          }
        }
        // IMPORTANT: thisArg is the target of the proxy.
        return raw.createObjectURL(object);
      }
    },
    'toString': {
      value: function() {
        return "SecureURL: " + Object.prototype.toString.call(raw);
      }
    }
  });

  return new Proxy(raw, {
    get: function (target, name) {
      // Give priority to the overritten methods.
      var desc = Object.getOwnPropertyDescriptor(SecureURLMethods, name);
      if (desc === undefined) {
        desc = Object.getOwnPropertyDescriptor(target, name);
      }
      if (desc === undefined || desc.value === undefined) {
        return undefined;
      }
      // Properties not found the object are not static.
      if (Object.keys(target).indexOf(name) < 0) {
        return desc.value;
      }
      // Prevent static methods from executing in the context of the proxy.
      return function() {
        return desc.value.apply(undefined, arguments);
      };
    },
    set: function () { return true; }
  });
}

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

var extraAddProperty;
function injectExtraAddProperty(addProperty) {
    extraAddProperty = addProperty;
}

// This whilelist represents reflective ECMAScript APIs or reflective DOM APIs
// which, by definition, do not provide authority or access to globals.
var whitelist = [
    // Accessible Intrinsics (not reachable by own property name traversal)
    // -> from ES5
    "ThrowTypeError",
    // -> from ES6.
    "IteratorPrototype", "ArrayIteratorPrototype", "StringIteratorPrototype", "MapIteratorPrototype", "SetIteratorPrototype", "GeneratorFunction", "TypedArray",

    // Intrinsics
    // -> from ES5
    "Function", "WeakMap", "StringMap",
    // Proxy,
    "escape", "unescape", "Object", "NaN", "Infinity", "undefined",
    // eval,
    "parseInt", "parseFloat", "isNaN", "isFinite", "decodeURI", "decodeURIComponent", "encodeURI", "encodeURIComponent", "Function", "Array", "String", "Boolean", "Number",
    "Math", "Date", "RegExp", "Error", "EvalError", "RangeError", "ReferenceError", "SyntaxError", "TypeError", "URIError", "JSON",
    // -> from ES6
    "ArrayBuffer", "Int8Array", "Uint8Array", "Uint8ClampedArray", "Int16Array", "Uint16Array", "Int32Array", "Uint32Array", "Float32Array", "Float64Array", "DataView",
    "Promise",

    // Misc
    "Intl"
];

function SecureWindow(win, key) {

    var o = getFromCache(win, key);
    if (o) {
        return o;
    }

    // Create prototype to allow basic object operations like hasOwnProperty etc
    var emptyProto = {};
    // Do not treat window like a plain object, $A.util.isPlainObject() returns true if we leave the constructor intact
    emptyProto.constructor = null;
    Object.freeze(emptyProto);

    o = Object.create(emptyProto, {
        document: {
            enumerable: true,
            value: SecureDocument(win.document, key)
        },
        window: {
            enumerable: true,
            get: function () {
                return o;
            }
        },
        localStorage: {
            enumerable: true,
            value: SecureStorage(win.localStorage, "LOCAL", key)
        },
        sessionStorage: {
            enumerable: true,
            value: SecureStorage(win.sessionStorage, "SESSION", key)
        },
        MutationObserver: {
            enumerable: true,
            value: SecureMutationObserver(key)
        },
        navigator: {
            enumerable: true,
            value: SecureNavigator(win.navigator, key)
        },
        XMLHttpRequest: {
            enumerable: true,
            value: SecureXMLHttpRequest(key)
        },
        setTimeout: {
            enumerable: true,
            value: function (callback) {
                return setTimeout.apply(win, [SecureObject.FunctionPrototypeBind.call(callback, o)].concat(SecureObject.ArrayPrototypeSlice.call(arguments, 1)));
            }
        },
        setInterval: {
            enumerable: true,
            value: function (callback) {
                return setInterval.apply(win, [SecureObject.FunctionPrototypeBind.call(callback, o)].concat(SecureObject.ArrayPrototypeSlice.call(arguments, 1)));
            }
        },
        location: {
            enumerable: true,
            get: function() {
                return SecureLocation(location, key);
            },
            set: function(value) {
                var ret = location.href = value;
                return ret;
            }
        },
        URL: {
            enumerable: true,
            value: SecureURL(win.URL)
        },
        toString: {
            value: function() {
                return "SecureWindow: " + win + "{ key: " + JSON.stringify(key) + " }";
            }
        }
    });

    SecureObject.addMethodIfSupported(o, win, "getComputedStyle", {
        rawArguments: true
    });

    ["outerHeight", "outerWidth"].forEach(function(name) {
        SecureObject.addPropertyIfSupported(o, win, name);
    });

    ["scroll", "scrollBy", "scrollTo"].forEach(function(name) {
        SecureObject.addMethodIfSupported(o, win, name);
    });

    ["open"].forEach(function(name) {
        SecureObject.addMethodIfSupported(o, win, name, {
            beforeCallback  : function(url){
                // If an url was provided to window.open()
                if (url && typeof url === "string" && url.length > 1) {
                    // Only allow http|https|relative urls.
                    var schemeRegex = /^[\s]*(http:\/\/|https:\/\/|\/)/i;
                    if (!schemeRegex.test(url)){
                        throw new error("SecureWindow.open supports http://, https:// schemes and relative urls.");
                    }
                }
            }
        });
    });

    if ("FormData" in win) {
        var formDataValueOverride;
        Object.defineProperty(o, "FormData", {
            get: function() {
                return formDataValueOverride || function() {
                    var args = SecureObject.ArrayPrototypeSlice.call(arguments);
                    // make sure we have access to any <form> passed in to constructor
                    var form;
                    if (args.length > 0) {
                        form = args[0];
                        verifyAccess(o, form);
                    }

                    var rawArgs = form ? [getRef(form, getKey(form))]: [];
                    var cls = win["FormData"];
                    if (typeof cls === "function") {
                        return new (Function.prototype.bind.apply(window["FormData"], [null].concat(rawArgs)));
                    } else {
                        return new cls(rawArgs);
                    }
                };
            },
            set: function(value) {
                formDataValueOverride = value;
            }
        });
    }

    if ("Notification" in win) {
        var notificationValueOverride;
        Object.defineProperty(o, "Notification", {
            get: function() {
                if (notificationValueOverride) {
                    return notificationValueOverride;
                }
                var notification = SecureNotification(key);
                if ("requestPermission" in win["Notification"]) {
                    Object.defineProperty(notification, "requestPermission", {
                        enumerable: true,
                        value: function(callback) {
                            return Notification["requestPermission"](callback);
                        }
                    });
                }
                if ("permission" in win["Notification"]) {
                    Object.defineProperty(notification, "permission", {
                        enumerable: true,
                        value: Notification["permission"]
                    });
                }
                return notification;
            },
            set: function(value) {
                notificationValueOverride = value;
            }
        });
    }

    ["Blob", "File"].forEach(function(name) {
        if (name in win) {
            var valueOverride;
            Object.defineProperty(o, name, {
                get: function() {
                    return valueOverride || function() {
                        var cls = win[name],
                        result,
                        args = Array.prototype.slice.call(arguments);
                        var scriptTagsRegex = /<script[\s\S]*?>[\s\S]*?<\/script[\s]*?>/gi;
                        if (scriptTagsRegex.test(args[0])) {
                            throw new error(name + " creation failed: <script> tags are blocked");
                        }
                        if (typeof cls === "function") {
                            //  Function.prototype.bind.apply is being used to invoke the constructor and to pass all the arguments provided by the caller
                            // TODO Switch to ES6 when available https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_operator
                            result = new (Function.prototype.bind.apply(cls, [null].concat(args)));
                        } else {
                            // For browsers that use a constructor that's not a function, invoke the constructor directly.
                            // For example, on Mobile Safari window["Blob"] returns an object called BlobConstructor
                            // Invoke constructor with specific arguments, handle up to 3 arguments(Blob accepts 2 param, File accepts 3 param)
                            switch (args.length) {
                                case 0:
                                    result = new cls();
                                    break;
                                case 1:
                                    result = new cls(args[0]);
                                    break;
                                case 2:
                                    result = new cls(args[0], args[1]);
                                    break;
                                case 3:
                                    result = new cls(args[0], args[1], args[2]);
                                    break;
                            }
                        }
                        return result;
                    };
                },
                set: function(value) {
                    valueOverride = value;
                }
            });
        }
    });

    addEventTargetMethods(o, win, key);

    // Has to happen last because it depends on the secure getters defined above that require the object to be keyed
    whitelist.forEach(function(name) {
        // These are direct passthrough's and should never be wrapped in a SecureObject
        Object.defineProperty(o, name, {
            enumerable: true,
            writable: true,
            value: win[name]
        });
    });

    if (extraAddProperty) {
        extraAddProperty(o, win, key);
    }

    SecureObject.addPrototypeMethodsAndProperties(metadata$2, o, win, key);

    setRef(o, win, key);
    addToCache(win, o, key);
    registerProxy(o);

    return o;
}

const metadata$2 = {
    "prototypes": {
        "Window" : {
            "AnalyserNode":                         FUNCTION,
            "AnimationEvent":                       FUNCTION,
            "AppBannerPromptResult":                FUNCTION,
            "ApplicationCache":                     FUNCTION,
            "ApplicationCacheErrorEvent":           FUNCTION,
            "Array":                                RAW,
            "ArrayBuffer":                          RAW,
            "Attr":                                 RAW,
            "Audio":                                CTOR,
            "AudioBuffer":                          FUNCTION,
            "AudioBufferSourceNode":                FUNCTION,
            "AudioContext":                         CTOR,
            "AudioDestinationNode":                 FUNCTION,
            "AudioListener":                        FUNCTION,
            "AudioNode":                            FUNCTION,
            "AudioParam":                           FUNCTION,
            "AudioProcessingEvent":                 FUNCTION,
            "AutocompleteErrorEvent":               FUNCTION,
            "BarProp":                              FUNCTION,
            "BatteryManager":                       FUNCTION,
            "BeforeInstallPromptEvent":             FUNCTION,
            "BeforeUnloadEvent":                    FUNCTION,
            "BiquadFilterNode":                     FUNCTION,
            "BlobEvent":                            FUNCTION,
            "Boolean":                              FUNCTION,
            "CDATASection":                         FUNCTION,
            "CSS":                                  FUNCTION,
            "CSSFontFaceRule":                      FUNCTION,
            "CSSGroupingRule":                      FUNCTION,
            "CSSImportRule":                        FUNCTION,
            "CSSKeyframeRule":                      FUNCTION,
            "CSSKeyframesRule":                     FUNCTION,
            "CSSMediaRule":                         FUNCTION,
            "CSSNamespaceRule":                     FUNCTION,
            "CSSPageRule":                          FUNCTION,
            "CSSRule":                              FUNCTION,
            "CSSRuleList":                          FUNCTION,
            "CSSStyleDeclaration":                  FUNCTION,
            "CSSStyleRule":                         FUNCTION,
            "CSSStyleSheet":                        FUNCTION,
            "CSSSupportsRule":                      FUNCTION,
            "CSSViewportRule":                      FUNCTION,
            "CanvasCaptureMediaStreamTrack":        FUNCTION,
            "CanvasGradient":                       FUNCTION,
            "CanvasPattern":                        FUNCTION,
            "CanvasRenderingContext2D":             RAW,
            "ChannelMergerNode":                    FUNCTION,
            "ChannelSplitterNode":                  FUNCTION,
            "CharacterData":                        FUNCTION,
            "ClientRect":                           FUNCTION,
            "ClientRectList":                       FUNCTION,
            "ClipboardEvent":                       FUNCTION,
            "CloseEvent":                           FUNCTION,
            "Comment":                              CTOR,
            "CompositionEvent":                     FUNCTION,
            "ConvolverNode":                        FUNCTION,
            "Credential":                           FUNCTION,
            "CredentialsContainer":                 FUNCTION,
            "Crypto":                               FUNCTION,
            "CryptoKey":                            FUNCTION,
            "CustomEvent":                          CTOR,
            "DOMError":                             FUNCTION,
            "DOMException":                         FUNCTION,
            "DOMImplementation":                    FUNCTION,
            "DOMParser":                            RAW,
            "DOMStringList":                        FUNCTION,
            "DOMStringMap":                         FUNCTION,
            "DOMTokenList":                         FUNCTION,
            "DataTransfer":                         FUNCTION,
            "DataTransferItem":                     FUNCTION,
            "DataTransferItemList":                 FUNCTION,
            "DataView":                             FUNCTION,
            "Date":                                 RAW,
            "DelayNode":                            FUNCTION,
            "DeviceMotionEvent":                    FUNCTION,
            "DeviceOrientationEvent":               FUNCTION,
            "Document":                             FUNCTION,
            "DocumentFragment":                     FUNCTION,
            "DocumentType":                         FUNCTION,
            "DragEvent":                            FUNCTION,
            "DynamicsCompressorNode":               FUNCTION,
            "ES6Promise":                           DEFAULT,
            "Element":                              RAW,
            "Error":                                FUNCTION,
            "ErrorEvent":                           FUNCTION,
            "EvalError":                            FUNCTION,
            "Event":                                CTOR,
            "EventSource":                          FUNCTION,
            "EventTarget":                          RAW,
            "FederatedCredential":                  FUNCTION,
            "FileError":                            FUNCTION,
            "FileList":                             RAW,
            "FileReader":                           RAW,
            "Float32Array":                         RAW,
            "Float64Array":                         RAW,
            "FocusEvent":                           FUNCTION,
            "FontFace":                             FUNCTION,
            "Function":                             FUNCTION,
            "GainNode":                             FUNCTION,
            "HTMLAllCollection":                    FUNCTION,
            "HTMLAnchorElement":                    RAW,
            "HTMLAreaElement":                      RAW,
            "HTMLAudioElement":                     RAW,
            "HTMLBRElement":                        RAW,
            "HTMLBaseElement":                      RAW,
            "HTMLBodyElement":                      RAW,
            "HTMLButtonElement":                    RAW,
            "HTMLCanvasElement":                    RAW,
            "HTMLCollection":                       RAW,
            "HTMLContentElement":                   RAW,
            "HTMLDListElement":                     RAW,
            "HTMLDataListElement":                  RAW,
            "HTMLDetailsElement":                   RAW,
            "HTMLDialogElement":                    RAW,
            "HTMLDirectoryElement":                 RAW,
            "HTMLDivElement":                       RAW,
            "HTMLDocument":                         RAW,
            "HTMLElement":                          RAW,
            "HTMLEmbedElement":                     RAW,
            "HTMLFieldSetElement":                  RAW,
            "HTMLFontElement":                      RAW,
            "HTMLFormControlsCollection":           FUNCTION,
            "HTMLFormElement":                      RAW,
            "HTMLFrameElement":                     RAW,
            "HTMLFrameSetElement":                  RAW,
            "HTMLHRElement":                        RAW,
            "HTMLHeadElement":                      RAW,
            "HTMLHeadingElement":                   RAW,
            "HTMLHtmlElement":                      RAW,
            "HTMLIFrameElement":                    RAW,
            "HTMLImageElement":                     RAW,
            "HTMLInputElement":                     RAW,
            "HTMLKeygenElement":                    RAW,
            "HTMLLIElement":                        RAW,
            "HTMLLabelElement":                     RAW,
            "HTMLLegendElement":                    RAW,
            "HTMLLinkElement":                      RAW,
            "HTMLMapElement":                       RAW,
            "HTMLMarqueeElement":                   RAW,
            "HTMLMediaElement":                     RAW,
            "HTMLMenuElement":                      RAW,
            "HTMLMetaElement":                      RAW,
            "HTMLMeterElement":                     RAW,
            "HTMLModElement":                       RAW,
            "HTMLOListElement":                     RAW,
            "HTMLObjectElement":                    RAW,
            "HTMLOptGroupElement":                  RAW,
            "HTMLOptionElement":                    RAW,
            "HTMLOptionsCollection":                RAW,
            "HTMLOutputElement":                    RAW,
            "HTMLParagraphElement":                 RAW,
            "HTMLParamElement":                     RAW,
            "HTMLPictureElement":                   RAW,
            "HTMLPreElement":                       RAW,
            "HTMLProgressElement":                  RAW,
            "HTMLQuoteElement":                     RAW,
            "HTMLScriptElement":                    RAW,
            "HTMLSelectElement":                    RAW,
            "HTMLShadowElement":                    RAW,
            "HTMLSourceElement":                    RAW,
            "HTMLSpanElement":                      RAW,
            "HTMLStyleElement":                     RAW,
            "HTMLTableCaptionElement":              RAW,
            "HTMLTableCellElement":                 RAW,
            "HTMLTableColElement":                  RAW,
            "HTMLTableElement":                     RAW,
            "HTMLTableRowElement":                  RAW,
            "HTMLTableSectionElement":              RAW,
            "HTMLTemplateElement":                  RAW,
            "HTMLTextAreaElement":                  RAW,
            "HTMLTitleElement":                     RAW,
            "HTMLTrackElement":                     RAW,
            "HTMLUListElement":                     RAW,
            "HTMLUnknownElement":                   RAW,
            "HTMLVideoElement":                     RAW,
            "HashChangeEvent":                      FUNCTION,
            "IdleDeadline":                         FUNCTION,
            "Image":                                CTOR,
            "ImageBitmap":                          FUNCTION,
            "ImageData":                            FUNCTION,
            "Infinity":                             DEFAULT,
            "InputDeviceCapabilities":              FUNCTION,
            "Int16Array":                           FUNCTION,
            "Int32Array":                           FUNCTION,
            "Int8Array":                            FUNCTION,
            "Intl":                                 DEFAULT,
            "JSON":                                 DEFAULT,
            "KeyboardEvent":                        FUNCTION,
            "Location":                             FUNCTION,
            "MIDIAccess":                           FUNCTION,
            "MIDIConnectionEvent":                  FUNCTION,
            "MIDIInput":                            FUNCTION,
            "MIDIInputMap":                         FUNCTION,
            "MIDIMessageEvent":                     FUNCTION,
            "MIDIOutput":                           FUNCTION,
            "MIDIOutputMap":                        FUNCTION,
            "MIDIPort":                             FUNCTION,
            "Map":                                  RAW,
            "Math":                                 DEFAULT,
            "MediaDevices":                         DEFAULT,
            "MediaElementAudioSourceNode":          FUNCTION,
            "MediaEncryptedEvent":                  FUNCTION,
            "MediaError":                           FUNCTION,
            "MediaKeyMessageEvent":                 FUNCTION,
            "MediaKeySession":                      FUNCTION,
            "MediaKeyStatusMap":                    FUNCTION,
            "MediaKeySystemAccess":                 FUNCTION,
            "MediaKeys":                            FUNCTION,
            "MediaList":                            FUNCTION,
            "MediaQueryList":                       FUNCTION,
            "MediaQueryListEvent":                  FUNCTION,
            "MediaRecorder":                        CTOR,
            "MediaSource":                          FUNCTION,
            "MediaStreamAudioDestinationNode":      CTOR,
            "MediaStreamAudioSourceNode":           CTOR,
            "MediaStreamEvent":                     CTOR,
            "MediaStreamTrack":                     FUNCTION,
            "MessageChannel":                       RAW,
            "MessageEvent":                         RAW,
            "MessagePort":                          RAW,
            "MimeType":                             FUNCTION,
            "MimeTypeArray":                        FUNCTION,
            "MutationObserver":                     CTOR,
            "MutationRecord":                       FUNCTION,
            "MouseEvent":                           CTOR,
            "NaN":                                  DEFAULT,
            "NamedNodeMap":                         FUNCTION,
            "Navigator":                            FUNCTION,
            "Node":                                 RAW,
            "NodeFilter":                           FUNCTION,
            "NodeIterator":                         FUNCTION,
            "NodeList":                             FUNCTION,
            "Number":                               FUNCTION,
            "Object":                               FUNCTION,
            "OfflineAudioCompletionEvent":          FUNCTION,
            "OfflineAudioContext":                  FUNCTION,
            "Option":                               CTOR,
            "OscillatorNode":                       FUNCTION,
            "PERSISTENT":                           DEFAULT,
            "PageTransitionEvent":                  FUNCTION,
            "PasswordCredential":                   FUNCTION,
            "Path2D":                               FUNCTION,
            "Performance":                          RAW,
            "PerformanceEntry":                     FUNCTION,
            "PerformanceMark":                      FUNCTION,
            "PerformanceMeasure":                   FUNCTION,
            "PerformanceNavigation":                FUNCTION,
            "PerformanceResourceTiming":            FUNCTION,
            "PerformanceTiming":                    FUNCTION,
            "PeriodicWave":                         FUNCTION,
            "PopStateEvent":                        FUNCTION,
            "Presentation":                         FUNCTION,
            "PresentationAvailability":             FUNCTION,
            "PresentationConnection":               FUNCTION,
            "PresentationConnectionAvailableEvent": FUNCTION,
            "PresentationConnectionCloseEvent":     FUNCTION,
            "PresentationRequest":                  FUNCTION,
            "ProcessingInstruction":                FUNCTION,
            "ProgressEvent":                        FUNCTION,
            "Promise":                              FUNCTION,
            "PromiseRejectionEvent":                FUNCTION,
            "RTCCertificate":                       FUNCTION,
            "RTCIceCandidate":                      FUNCTION,
            "RTCSessionDescription":                CTOR,
            "RadioNodeList":                        FUNCTION,
            "Range":                                FUNCTION,
            "RangeError":                           FUNCTION,
            "ReadableByteStream":                   FUNCTION,
            "ReadableStream":                       FUNCTION,
            "ReferenceError":                       FUNCTION,
            "Reflect":                              DEFAULT,
            "RegExp":                               FUNCTION,
            "Request":                              FUNCTION,
            "Response":                             FUNCTION,
            "SVGAElement":                          FUNCTION,
            "SVGAngle":                             FUNCTION,
            "SVGAnimateElement":                    FUNCTION,
            "SVGAnimateMotionElement":              FUNCTION,
            "SVGAnimateTransformElement":           FUNCTION,
            "SVGAnimatedAngle":                     FUNCTION,
            "SVGAnimatedBoolean":                   FUNCTION,
            "SVGAnimatedEnumeration":               FUNCTION,
            "SVGAnimatedInteger":                   FUNCTION,
            "SVGAnimatedLength":                    FUNCTION,
            "SVGAnimatedLengthList":                FUNCTION,
            "SVGAnimatedNumber":                    FUNCTION,
            "SVGAnimatedNumberList":                FUNCTION,
            "SVGAnimatedPreserveAspectRatio":       FUNCTION,
            "SVGAnimatedRect":                      FUNCTION,
            "SVGAnimatedString":                    FUNCTION,
            "SVGAnimatedTransformList":             FUNCTION,
            "SVGAnimationElement":                  RAW,
            "SVGCircleElement":                     RAW,
            "SVGClipPathElement":                   RAW,
            "SVGComponentTransferFunctionElement":  RAW,
            "SVGCursorElement":                     RAW,
            "SVGDefsElement":                       RAW,
            "SVGDescElement":                       RAW,
            "SVGDiscardElement":                    RAW,
            "SVGElement":                           RAW,
            "SVGEllipseElement":                    RAW,
            "SVGFEBlendElement":                    RAW,
            "SVGFEColorMatrixElement":              RAW,
            "SVGFEComponentTransferElement":        RAW,
            "SVGFECompositeElement":                RAW,
            "SVGFEConvolveMatrixElement":           RAW,
            "SVGFEDiffuseLightingElement":          RAW,
            "SVGFEDisplacementMapElement":          RAW,
            "SVGFEDistantLightElement":             RAW,
            "SVGFEDropShadowElement":               RAW,
            "SVGFEFloodElement":                    RAW,
            "SVGFEFuncAElement":                    RAW,
            "SVGFEFuncBElement":                    RAW,
            "SVGFEFuncGElement":                    RAW,
            "SVGFEFuncRElement":                    RAW,
            "SVGFEGaussianBlurElement":             RAW,
            "SVGFEImageElement":                    RAW,
            "SVGFEMergeElement":                    RAW,
            "SVGFEMergeNodeElement":                RAW,
            "SVGFEMorphologyElement":               RAW,
            "SVGFEOffsetElement":                   RAW,
            "SVGFEPointLightElement":               RAW,
            "SVGFESpecularLightingElement":         RAW,
            "SVGFESpotLightElement":                RAW,
            "SVGFETileElement":                     RAW,
            "SVGFETurbulenceElement":               RAW,
            "SVGFilterElement":                     RAW,
            "SVGForeignObjectElement":              RAW,
            "SVGGElement":                          RAW,
            "SVGGeometryElement":                   RAW,
            "SVGGradientElement":                   RAW,
            "SVGGraphicsElement":                   RAW,
            "SVGImageElement":                      RAW,
            "SVGLength":                            FUNCTION,
            "SVGLengthList":                        FUNCTION,
            "SVGLineElement":                       RAW,
            "SVGLinearGradientElement":             RAW,
            "SVGMPathElement":                      RAW,
            "SVGMarkerElement":                     RAW,
            "SVGMaskElement":                       RAW,
            "SVGMatrix":                            RAW,
            "SVGMetadataElement":                   RAW,
            "SVGNumber":                            FUNCTION,
            "SVGNumberList":                        FUNCTION,
            "SVGPathElement":                       RAW,
            "SVGPatternElement":                    RAW,
            "SVGPoint":                             FUNCTION,
            "SVGPointList":                         FUNCTION,
            "SVGPolygonElement":                    RAW,
            "SVGPolylineElement":                   RAW,
            "SVGPreserveAspectRatio":               FUNCTION,
            "SVGRadialGradientElement":             RAW,
            "SVGRect":                              FUNCTION,
            "SVGRectElement":                       RAW,
            "SVGSVGElement":                        RAW,
            "SVGScriptElement":                     RAW,
            "SVGSetElement":                        RAW,
            "SVGStopElement":                       RAW,
            "SVGStringList":                        FUNCTION,
            "SVGStyleElement":                      RAW,
            "SVGSwitchElement":                     RAW,
            "SVGSymbolElement":                     RAW,
            "SVGTSpanElement":                      RAW,
            "SVGTextContentElement":                RAW,
            "SVGTextElement":                       RAW,
            "SVGTextPathElement":                   RAW,
            "SVGTextPositioningElement":            RAW,
            "SVGTitleElement":                      RAW,
            "SVGTransform":                         FUNCTION,
            "SVGTransformList":                     FUNCTION,
            "SVGUnitTypes":                         FUNCTION,
            "SVGUseElement":                        RAW,
            "SVGViewElement":                       RAW,
            "SVGViewSpec":                          FUNCTION,
            "SVGZoomEvent":                         FUNCTION,
            "Screen":                               FUNCTION,
            "ScreenOrientation":                    FUNCTION,
            "SecurityPolicyViolationEvent":         FUNCTION,
            "Selection":                            FUNCTION,
            "Set":                                  RAW,
            "SourceBuffer":                         FUNCTION,
            "SourceBufferList":                     FUNCTION,
            "SpeechSynthesisEvent":                 FUNCTION,
            "SpeechSynthesisUtterance":             FUNCTION,
            "String":                               RAW,
            "StyleSheet":                           FUNCTION,
            "StyleSheetList":                       FUNCTION,
            "SubtleCrypto":                         FUNCTION,
            "Symbol":                               RAW,
            "SyntaxError":                          FUNCTION,
            "TEMPORARY":                            DEFAULT,
            "Text":                                 CTOR,
            "TextDecoder":                          FUNCTION,
            "TextEncoder":                          RAW,
            "TextEvent":                            FUNCTION,
            "TextMetrics":                          FUNCTION,
            "TextTrack":                            FUNCTION,
            "TextTrackCue":                         FUNCTION,
            "TextTrackCueList":                     FUNCTION,
            "TextTrackList":                        FUNCTION,
            "TimeRanges":                           RAW,
            "Touch":                                FUNCTION,
            "TouchEvent":                           FUNCTION,
            "TouchList":                            FUNCTION,
            "TrackEvent":                           FUNCTION,
            "TransitionEvent":                      FUNCTION,
            "TreeWalker":                           FUNCTION,
            "TypeError":                            FUNCTION,
            "UIEvent":                              FUNCTION,
            "URIError":                             FUNCTION,
            // Replaced by SecureURL
            // "URL":                                  RAW,
            "URLSearchParams":                      FUNCTION,
            "Uint16Array":                          RAW,
            "Uint32Array":                          RAW,
            "Uint8Array":                           RAW,
            "Uint8ClampedArray":                    RAW,
            "VTTCue":                               FUNCTION,
            "ValidityState":                        FUNCTION,
            "WaveShaperNode":                       FUNCTION,
            "WeakMap":                              RAW,
            "WeakSet":                              RAW,
            "WebGLActiveInfo":                      FUNCTION,
            "WebGLBuffer":                          FUNCTION,
            "WebGLContextEvent":                    FUNCTION,
            "WebGLFramebuffer":                     FUNCTION,
            "WebGLProgram":                         FUNCTION,
            "WebGLRenderbuffer":                    FUNCTION,
            "WebGLRenderingContext":                FUNCTION,
            "WebGLShader":                          FUNCTION,
            "WebGLShaderPrecisionFormat":           FUNCTION,
            "WebGLTexture":                         FUNCTION,
            "WebGLUniformLocation":                 FUNCTION,
            "WebKitAnimationEvent":                 FUNCTION,
            "WebKitCSSMatrix":                      CTOR,
            "WebKitTransitionEvent":                FUNCTION,
            "WebSocket":                            RAW,
            "WheelEvent":                           FUNCTION,
            "Window":                               FUNCTION,
            "XMLDocument":                          FUNCTION,
            "XMLHttpRequest":                       CTOR,
            "XMLHttpRequestEventTarget":            FUNCTION,
            "XMLHttpRequestUpload":                 FUNCTION,
            "XMLSerializer":                        CTOR,
            "XPathEvaluator":                       FUNCTION,
            "XPathExpression":                      FUNCTION,
            "XPathResult":                          FUNCTION,
            "XSLTProcessor":                        FUNCTION,
            "alert":                                FUNCTION,
            "atob":                                 FUNCTION,
            "blur":                                 FUNCTION,
            "btoa":                                 FUNCTION,
            "cancelAnimationFrame":                 FUNCTION,
            "cancelIdleCallback":                   FUNCTION,
            "captureEvents":                        FUNCTION,
            "chrome":                               DEFAULT,
            "clearInterval":                        FUNCTION,
            "clearTimeout":                         FUNCTION,
            "close":                                FUNCTION,
            "closed":                               DEFAULT,
            "confirm":                              FUNCTION,
            "console":                              RAW,
            "createImageBitmap":                    FUNCTION,
            "crypto":                               DEFAULT,
            "decodeURI":                            FUNCTION,
            "decodeURIComponent":                   FUNCTION,
            "defaultStatus":                        DEFAULT,
            "defaultstatus":                        DEFAULT,
            "devicePixelRatio":                     DEFAULT,
            "document":                             DEFAULT,
            "encodeURI":                            FUNCTION,
            "encodeURIComponent":                   FUNCTION,
            "escape":                               FUNCTION,
            "fetch":                                FUNCTION,
            "find":                                 FUNCTION,
            "focus":                                FUNCTION,
            "frameElement":                         DEFAULT,
            "frames":                               DEFAULT,
            "getComputedStyle":                     FUNCTION,
            "getMatchedCSSRules":                   FUNCTION,
            "getSelection":                         FUNCTION,
            "history":                              RAW,
            "innerHeight":                          DEFAULT,
            "innerWidth":                           DEFAULT,
            "isFinite":                             FUNCTION,
            "isNaN":                                FUNCTION,
            "isSecureContext":                      DEFAULT,
            "length":                               DEFAULT,
            "localStorage":                         DEFAULT,
            "locationbar":                          DEFAULT,
            "matchMedia":                           FUNCTION,
            "menubar":                              DEFAULT,
            "moveBy":                               FUNCTION,
            "moveTo":                               FUNCTION,
            "name":                                 DEFAULT,
            "navigator":                            DEFAULT,
            "offscreenBuffering":                   DEFAULT,
            "onabort":                              EVENT,
            "onanimationend":                       EVENT,
            "onanimationiteration":                 EVENT,
            "onanimationstart":                     EVENT,
            "onautocomplete":                       EVENT,
            "onautocompleteerror":                  EVENT,
            "onbeforeunload":                       EVENT,
            "onblur":                               EVENT,
            "oncancel":                             EVENT,
            "oncanplay":                            EVENT,
            "oncanplaythrough":                     EVENT,
            "onchange":                             EVENT,
            "onclick":                              EVENT,
            "onclose":                              EVENT,
            "oncontextmenu":                        EVENT,
            "oncuechange":                          EVENT,
            "ondblclick":                           EVENT,
            "ondevicemotion":                       EVENT,
            "ondeviceorientation":                  EVENT,
            "ondeviceorientationabsolute":          EVENT,
            "ondrag":                               EVENT,
            "ondragend":                            EVENT,
            "ondragenter":                          EVENT,
            "ondragleave":                          EVENT,
            "ondragover":                           EVENT,
            "ondragstart":                          EVENT,
            "ondrop":                               EVENT,
            "ondurationchange":                     EVENT,
            "onemptied":                            EVENT,
            "onended":                              EVENT,
            "onerror":                              EVENT,
            "onfocus":                              EVENT,
            "onhashchange":                         EVENT,
            "oninput":                              EVENT,
            "oninvalid":                            EVENT,
            "onkeydown":                            EVENT,
            "onkeypress":                           EVENT,
            "onkeyup":                              EVENT,
            "onlanguagechange":                     EVENT,
            "onload":                               EVENT,
            "onloadeddata":                         EVENT,
            "onloadedmetadata":                     EVENT,
            "onloadstart":                          EVENT,
            "onmessage":                            EVENT,
            "onmousedown":                          EVENT,
            "onmouseenter":                         EVENT,
            "onmouseleave":                         EVENT,
            "onmousemove":                          EVENT,
            "onmouseout":                           EVENT,
            "onmouseover":                          EVENT,
            "onmouseup":                            EVENT,
            "onmousewheel":                         EVENT,
            "onoffline":                            EVENT,
            "ononline":                             EVENT,
            "onpagehide":                           EVENT,
            "onpageshow":                           EVENT,
            "onpause":                              EVENT,
            "onplay":                               EVENT,
            "onplaying":                            EVENT,
            "onpopstate":                           EVENT,
            "onprogress":                           EVENT,
            "onratechange":                         EVENT,
            "onrejectionhandled":                   EVENT,
            "onreset":                              EVENT,
            "onresize":                             EVENT,
            "onscroll":                             EVENT,
            "onsearch":                             EVENT,
            "onseeked":                             EVENT,
            "onseeking":                            EVENT,
            "onselect":                             EVENT,
            "onshow":                               EVENT,
            "onstalled":                            EVENT,
            "onstorage":                            EVENT,
            "onsubmit":                             EVENT,
            "onsuspend":                            EVENT,
            "ontimeupdate":                         EVENT,
            "ontoggle":                             EVENT,
            "ontransitionend":                      EVENT,
            "ontouchcancel":                        EVENT,
            "ontouchend":                           EVENT,
            "ontouchmove":                          EVENT,
            "ontouchstart":                         EVENT,
            "onunhandledrejection":                 EVENT,
            "onunload":                             EVENT,
            "onvolumechange":                       EVENT,
            "onwaiting":                            EVENT,
            "onwheel":                              EVENT,
            "open":                                 FUNCTION,
            "outerHeight":                          DEFAULT,
            "outerWidth":                           DEFAULT,
            "pageStartTime":                        DEFAULT,
            "pageXOffset":                          DEFAULT,
            "pageYOffset":                          DEFAULT,
            "parent":                               DEFAULT,
            "parseFloat":                           FUNCTION,
            "parseInt":                             FUNCTION,
            "performance":                          RAW,
            "personalbar":                          DEFAULT,
            "postMessage":                          FUNCTION,
            "print":                                FUNCTION,
            "prompt":                               FUNCTION,
            "releaseEvents":                        FUNCTION,
            "requestAnimationFrame":                FUNCTION,
            "requestIdleCallback":                  FUNCTION,
            "resizeBy":                             FUNCTION,
            "resizeTo":                             FUNCTION,
            "screen":                               RAW,
            "screenLeft":                           DEFAULT,
            "screenTop":                            DEFAULT,
            "screenX":                              DEFAULT,
            "screenY":                              DEFAULT,
            "scroll":                               FUNCTION,
            "scrollBy":                             FUNCTION,
            "scrollTo":                             FUNCTION,
            "scrollX":                              DEFAULT,
            "scrollY":                              DEFAULT,
            "scrollbars":                           DEFAULT,
            "sessionStorage":                       DEFAULT,
            "self":                                 DEFAULT,
            "setInterval":                          FUNCTION,
            "setTimeout":                           FUNCTION,
            "status":                               DEFAULT,
            "statusbar":                            DEFAULT,
            "stop":                                 FUNCTION,
            "styleMedia":                           DEFAULT,
            "toolbar":                              DEFAULT,
            "top":                                  DEFAULT,
            "undefined":                            DEFAULT,
            "unescape":                             FUNCTION,
            "window":                               DEFAULT
        },
        "EventTarget": metadata$5
    }
};

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

// Declare shorthand functions. Sharing these declarations accross modules
// improves both consitency and minification. Unused declarations are dropped
// by the tree shaking process.

const {
    getPrototypeOf,
    setPrototypeOf,
    defineProperty,
    deleteProperty,
    ownKeys
} = Reflect;

const {
    defineProperties,
    hasOwnProperty,
    getOwnPropertyDescriptor,
    getOwnPropertyDescriptors,
    getOwnPropertyNames,
    create: create$1,
    assign,
    freeze,
    seal
} = Object;



const objectToString = Object.prototype.toString;

/*
 * Copyright (C) 2013 salesforce.com, inc.
 *
 * Licensed under the Apache License, Version 2.0(the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *         http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
let initalized = false;

// TODO: improve returnable detection. `function (...` is a trick used today
//       to return arbitrary code from actions, it should be legacy in the future.
// var returnableEx = /^(\s*)([{(\['']|function\s*\()/;

// TODO: improve first comment removal
// var trimFirstMultilineCommentEx = /^\/\*([\s\S]*?)\*\//;
// var trimFirstLineCommentEx = /^\/\/.*\n?/;

// @W-2961201: fixing properties of Object to comply with strict mode
// and ES2016 semantics, we do this by redefining them while in 'use strict'
// https://tc39.github.io/ecma262/#sec-object.prototype.__defineGetter__
function repairAccessors() {
    defineProperties(Object.prototype, {
        '__defineGetter__': {
            value: function (key, fn) {
                return defineProperty(this, key, {
                    get: fn
                });
            }
        },
        '__defineSetter__': {
            value: function (key, fn) {
                return defineProperty(this, key, {
                    set: fn
                });
            }
        },
        '__lookupGetter__': {
            value: function (key) {
                let d;
                let p = this;
                while (p && (d = getOwnPropertyDescriptor(p, key)) === undefined) {
                    p = getPrototypeOf(this);
                }
                return d ? d.get : undefined;
            }
        },
        '__lookupSetter__': {
            value: function (key) {
                let d;
                let p = this;
                while (p && (d = getOwnPropertyDescriptor(p, key)) === undefined) {
                    p = getPrototypeOf(this);
                }
                return d ? d.set : undefined;
            }
        }
    });
}

// Immutable Prototype Exotic Objects
// https://github.com/tc39/ecma262/issues/272
function freezeIntrinsics() {
    seal(Object.prototype);
}

// wrapping the source with `with` statements create a new lexical scope,
// that can prevent access to the globals in the worker by shodowing them
// with the members of new scopes passed as arguments into the `hookFn` call.
// additionally, when specified, strict mode will be enforced to avoid leaking
// global variables into the worker.
function makeEvaluatorSource(src, sourceURL) {

    // // removing first line CSFR protection and other comments to facilitate
    // // the detection of returnable code
    // src = src.replace(trimFirstMultilineCommentEx, '');
    // src = src.replace(trimFirstLineCommentEx, '');
    // // only add return statement if source it starts with [, {, or (
    // var match = src.match(returnableEx);
    // if (match) {
    //   src = src.replace(match[1], 'return ');
    // }


    // Create the evaluator function.
    // The shadow is a proxy that has all window properties defined as undefined.
    // We mute globals for convenience. However, they remain available on window.
    // force strict mode
    // Objects: this = globals, window = globals

    let fnSource = `
(function () {
    with (new Proxy({}, {
        has: (target, prop) => prop in window
    })) {
    with (arguments[0]) {
        return (function(window){
            "use strict";

${src}

        }).call(arguments[0], arguments[0]);
    }}
})`;

    // Sanitize the URL
    if (sourceURL) {
        const a = document.createElement('a');
        a.href = sourceURL;
        sourceURL = a.href;
    }
    if (sourceURL) {
        fnSource += '\n//# sourceURL=' + sourceURL;
    }

    return fnSource;
}

function safeEval(src, sourceURL, globals) {

    if (!src) {
        return undefined;
    }

    const fnSource = makeEvaluatorSource(src, sourceURL);
    const fn = (0, eval)(fnSource);

    if (typeof fn === 'function') {
        if (!initalized) {
            repairAccessors();
            freezeIntrinsics();
            initalized = true;
        }

        return fn(globals);
    }

    throw new SyntaxError('Unable to evaluate code at: ' + sourceURL);
}

/*
 * Copyright (C) 2013 salesforce.com, inc.
 *
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *         http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const keyToEnvironment = new Map();

function evaluate(src, key, sourceURL) {
    return safeEval(src, sourceURL, getEnv$1(key));
}



function getEnv$1(key) {
    let env = keyToEnvironment.get(key);
    if (!env) {
        env = SecureWindow(window, key);
        keyToEnvironment.set(key, env);
    }

    return env;
}

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

function SecureScriptElement() {}

SecureScriptElement.setOverrides = function(elementOverrides, prototype) {
    function getAttributeName(name) {
        return name.toLowerCase() === "src" ? "data-locker-src" : name;
    }

    elementOverrides["src"] = {
        enumerable: true,
        get: function() {
            return this.getAttribute.apply(this, ["src"]);
        },
        set: function(value) {
            this.setAttribute.apply(this, ["src", value]);
        }
    };

    var orignalGetAttribute = prototype.getAttribute;
    elementOverrides["getAttribute"] = {
        value: function(name) {
            return orignalGetAttribute.apply(this, [getAttributeName(name)]);
        }
    };

    var orignalSetAttribute = prototype.setAttribute;
    elementOverrides["setAttribute"] = {
        value: function(name, value) {
            orignalSetAttribute.apply(this, [getAttributeName(name), value]);
        }
    };

    var orignalGetAttributeNS = prototype.getAttributeNS;
    elementOverrides["getAttributeNS"] = {
        value: function(ns, name) {
            return orignalGetAttributeNS.apply(this, [ns, getAttributeName(name)]);
        }
    };

    var orignalSetAttributeNS = prototype.setAttributeNS;
    elementOverrides["setAttributeNS"] = {
        value: function(ns, name, value) {
            orignalSetAttributeNS.apply(this, [ns, getAttributeName(name), value]);
        }
    };

    var orignalGetAttributeNode = prototype.getAttributeNode;
    elementOverrides["getAttributeNode"] = {
        value: function(name) {
            return orignalGetAttributeNode.apply(this, [getAttributeName(name)]);
        }
    };

    var orignalGetAttributeNodeNS = prototype.getAttributeNodeNS;
    elementOverrides["getAttributeNodeNS"] = {
        value: function(ns, name) {
            return orignalGetAttributeNodeNS.apply(this, [ns, getAttributeName(name)]);
        }
    };

    elementOverrides["attributes"] = SecureObject.createFilteredPropertyStateless("attributes", prototype, {
        writable: false,
        afterGetCallback: function(attributes) {
            if (!attributes) {
                return attribute;
            }
            // Secure attributes
            var secureAttributes = [];
            var raw = SecureObject.getRaw(this);
            for (var i = 0; i < attributes.length; i++) {
                var attribute = attributes[i];

                // Only add supported attributes
                if (SecureElement.isValidAttributeName(raw, attribute.name, prototype)) {
                    var attributeName = attribute.name;
                    if (attribute.name === "src") {
                        continue;
                    }
                    if (attribute.name === "data-locker-src") {
                        attributeName = "src";
                    }
                    secureAttributes.push({
                        name: attributeName,
                        value: SecureObject.filterEverything(this, attribute.value)
                    });
                }
            }
            return secureAttributes;
        }
    });
};

SecureScriptElement.run = function(st) {
    var src = st.getAttribute("src");
    if (!src) {
        return;
    }

    var el = SecureObject.getRaw(st);
    document.head.appendChild(el);

    // Get source using XHR and secure it using
    var xhr = new XMLHttpRequest();

    xhr.onreadystatechange = function() {
        var key = getKey(st);
        if (xhr.readyState === 4 && xhr.status === 200) {
            var code = xhr.responseText;
            evaluate(code, key, src);

            el.dispatchEvent(new Event("load"));
        }

        // DCHASMAN TODO W-2837800 Add in error handling for 404's etc
    };

    xhr.open("GET", src, true);

    //for relative urls enable sending credentials
    if (src.indexOf("/") === 0) {
        xhr.withCredentials = true;
    }
    xhr.send();
};

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

var SecureIFrameElement = {
    addMethodsAndProperties: function(prototype) {
                Object.defineProperties(prototype, {
            // Standard HTMLElement methods
            // https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement#Methods
            blur: SecureObject.createFilteredMethodStateless("blur", prototype),
            focus: SecureObject.createFilteredMethodStateless("focus", prototype),
            contentWindow: {
                get: function() {
                    var raw = SecureObject.getRaw(this);
                    return raw.contentWindow ? SecureIFrameElement.SecureIFrameContentWindow(raw.contentWindow, getKey(this)) : raw.contentWindow;
                }
            }
        });

        // Standard list of iframe's properties from:
        // https://developer.mozilla.org/en-US/docs/Web/API/HTMLIFrameElement
        // Note: ignoring 'contentDocument', 'sandbox' and 'srcdoc' from the list above.
        ["height", "width", "name", "src"].forEach(function(name) {
            Object.defineProperty(prototype, name, SecureObject.createFilteredPropertyStateless(name, prototype));
        });
    },

    SecureIFrameContentWindow: function(w, key) {
        var sicw = Object.create(null, {
            toString: {
                value: function() {
                    return "SecureIFrameContentWindow: " + w + "{ key: " + JSON.stringify(key) + " }";
                }
            }
        });

        Object.defineProperties(sicw, {
            postMessage: SecureObject.createFilteredMethod(sicw, w, "postMessage", { rawArguments: true })
        });

        setRef(sicw, w, key);
        addToCache(w, sicw, key);
        registerProxy(sicw);

        return sicw;
    }
};

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

function cloneFiltered(el, st) {
    var root = el.cloneNode(false);
    function cloneChildren(parent, parentClone) {
        var childNodes = parent.childNodes;
        for (var i = 0; i < childNodes.length; i++) {
            var child = childNodes[i];
            if (hasAccess(st, child) || child.nodeType === Node.TEXT_NODE) {
                var childClone = child.cloneNode(false);
                parentClone.appendChild(childClone);
                trust$1(st, childClone);
                cloneChildren(child, childClone);
            }
        }
    }
    cloneChildren(el, root);
    return root;
}

function runIfRunnable(st) {
    if (st instanceof HTMLScriptElement) {
        SecureScriptElement.run(st);
        return true;
    }
    return false;
}

function trustChildNodes(from, node) {
    var key = getKey(from);
    if (key) {
        _trustChildNodes(node, key);
    }
}

function _trustChildNodes(node, key) {
    var children = node.childNodes;
    for (var i = 0; i < children.length; i++) {
        var child = children[i];
        setKey(child, key);
        _trustChildNodes(child, key);
    }
}

var KEY_TO_PROTOTYPES = typeof Map !== "undefined" ? new Map() : undefined;

var domPurifyConfig = {
    // Allow SVG <use> element
    "ADD_TAGS" : [ "use" ],
    "ADD_ATTR" : ["aria-activedescendant",
        "aria-atomic",
        "aria-autocomplete",
        "aria-busy",
        "aria-checked",
        "aria-controls",
        "aria-describedby",
        "aria-disabled",
        "aria-readonly",
        "aria-dropeffect",
        "aria-expanded",
        "aria-flowto",
        "aria-grabbed",
        "aria-haspopup",
        "aria-hidden",
        "aria-disabled",
        "aria-invalid",
        "aria-label",
        "aria-labelledby",
        "aria-level",
        "aria-live",
        "aria-multiline",
        "aria-multiselectable",
        "aria-orientation",
        "aria-owns",
        "aria-posinset",
        "aria-pressed",
        "aria-readonly",
        "aria-relevant",
        "aria-required",
        "aria-selected",
        "aria-setsize",
        "aria-sort",
        "aria-valuemax",
        "aria-valuemin",
        "aria-valuenow",
        "aria-valuetext",
        "role",
        "target"]
};

function propertyIsSupported(target, property) {
    // If the SecureElement prototype does not have the property directly on it then this
    // is an attempt to get a property that we do not support
    return Object.getPrototypeOf(target).hasOwnProperty(property);
}

function SecureElement(el, key) {

    var o = getFromCache(el, key);
    if (o) {
        return o;
    }

    // A secure element can have multiple forms, this block allows us to apply
    // some polymorphic behavior to SecureElement depending on the tagName
    var tagName = el.tagName && el.tagName.toUpperCase();
    switch (tagName) {
        case "FRAME":
            throw new error("The deprecated FRAME element is not supported in LockerService!");
    }

    // SecureElement is it then!

    // Lazily create and cache tag name specific prototype
    switch (el.nodeType) {
        case Node.TEXT_NODE:
            tagName = "#text";
            break;

        case Node.DOCUMENT_FRAGMENT_NODE:
            tagName = "#fragment";
            break;

        case Node.ATTRIBUTE_NODE:
            tagName = "Attr";
            break;

        case Node.COMMENT_NODE:
            tagName = "#comment";
            break;
    }

    // Segregate prototypes by their locker
    var prototypes = KEY_TO_PROTOTYPES.get(key);
    if (!prototypes) {
        prototypes = new Map();
        KEY_TO_PROTOTYPES.set(key, prototypes);
    }

    var prototypeInfo = prototypes.get(tagName);
    if (!prototypeInfo) {
        var basePrototype = Object.getPrototypeOf(el);

        var expandoCapturingHandler = {
            "get": function(target, property) {
                if (property in basePrototype) {
                    return property in target ? target[property] : undefined;
                }

                // Expando - retrieve it from a private locker scoped object
                var raw = getRef(target, key);
                var data = getData(raw, key);
                return data ? data[property] : undefined;
            },

            "set": function(target, property, value) {
                if (property in basePrototype) {
                    if (!propertyIsSupported(target, property)) {
                        throw new Error("SecureElement does not allow access to " + property);
                    }

                    target[property] = value;
                    return true;
                }

                // Expando - store it from a private locker scoped object
                var raw = getRef(target, key);

                // SELECT elements allow options to be specified in array assignment style
                if( raw instanceof HTMLSelectElement && !isNaN(property)) {
                    var rawOption = getRef(value, key);
                    raw[property] = rawOption;
                    return value;
                }

                var data = getData(raw, key);
                if (!data) {
                    data = {};
                    setData(raw, key, data);
                }

                data[property] = value;
                return true;
            },

            "has": function(target, property) {
                if (property in basePrototype) {
                    return true;
                }
                var raw = getRef(target, key);
                var data = getData(raw, key);
                return !!data && property in data;
            },

            "deleteProperty": function(target, property) {
                var raw = getRef(target, key);
                var data = getData(raw, key);
                if (data && property in data) {
                    return delete data[property];
                }
                return delete target[property];
            },

            "ownKeys": function(target) {
                var raw = getRef(target, key);
                var data = getData(raw, key);
                var keys = Object.keys(raw);
                if (data) {
                    keys = keys.concat(Object.keys(data));
                }
                return keys;
            },

            "getOwnPropertyDescriptor": function(target, property) {
                var desc = Object.getOwnPropertyDescriptor(target, property);
                if (!desc) {
                    var raw = getRef(target, key);
                    var data = getData(raw, key);
                    desc = data ? Object.getOwnPropertyDescriptor(data, property) : undefined;
                }
                return desc;
            },

            "getPrototypeOf": function() {
                return basePrototype;
            },

            "setPrototypeOf": function() {
                throw new Error("Illegal attempt to set the prototype of: " + basePrototype);
            }
        };

        // "class", "id", etc global attributes are special because they do not directly correspond to any property
        var caseInsensitiveAttributes = {
            "class": true,
            "contextmenu": true,
            "dropzone": true,
            "http-equiv": true,
            "id": true,
            "role": true
        };

        var prototype = (function() {
            function SecureElementPrototype() {
            }
            SecureElementPrototype.prototype["tagName"] = tagName;

            var sep = new SecureElementPrototype();
            sep.constructor = function() {throw new TypeError("Illegal constructor");};
            return sep;
        })();

        SecureElement.addStandardMethodAndPropertyOverrides(prototype, caseInsensitiveAttributes, key);

        Object.defineProperties(prototype, {
            toString: {
                value: function() {
                    var e = SecureObject.getRaw(this);
                    return "SecureElement: " + e + "{ key: " + JSON.stringify(getKey(this)) + " }";
                }
            }
        });

        var prototypicalInstance = Object.create(prototype);
        setRef(prototypicalInstance, el, key);

        if (tagName === "IFRAME") {
            SecureIFrameElement.addMethodsAndProperties(prototype);
        }

        var tagNameSpecificConfig = SecureObject.addPrototypeMethodsAndPropertiesStateless(metadata$1, prototypicalInstance, prototype);

        // Conditionally add things that not all Node types support
        if ("attributes" in el) {
            tagNameSpecificConfig["attributes"] = SecureObject.createFilteredPropertyStateless("attributes", prototype, {
                writable: false,
                afterGetCallback: function(attributes) {
                    if (!attributes) {
                        return attributes;
                    }

                    return SecureObject.createProxyForNamedNodeMap(attributes, key, prototype, caseInsensitiveAttributes);
                }
            });
        }

        if ("innerText" in el) {
            tagNameSpecificConfig["innerText"] = {
                get: function() {
                    /*
                     * innerText changes it's return value based on style and whether the element is live in
                     * the DOM or not. This implementation does not account for that and simply returns the
                     * innerText of the cloned node. This may cause subtle differences, such as missing newlines,
                     * from the original implementation.
                     *
                     * https://developer.mozilla.org/en-US/docs/Web/API/Node/textContent#Differences_from_innerText
                     */
                    var rawEl = SecureObject.getRaw(this);
                    var filtered = cloneFiltered(rawEl, o);
                    var ret = filtered.innerText;
                    return ret;
                },
                set: function(value) {
                    var raw = SecureObject.getRaw(this);
                    if (SecureElement.isSharedElement(raw)) {
                        throw new error("SecureElement.innerText cannot be used with " + raw.tagName + " elements!");
                    }

                    raw.innerText = value;

                    trustChildNodes(this, raw);
                }
            };
        }

        if ("innerHTML" in el) {
            tagNameSpecificConfig["innerHTML"] = {
                get: function() {
                    return cloneFiltered(SecureObject.getRaw(this), o).innerHTML;
                },
                set: function(value) {
                    var raw = SecureObject.getRaw(this);
                    // Do not allow innerHTML on shared elements (body/head)
                    if (SecureElement.isSharedElement(raw)) {
                        throw new error("SecureElement.innerHTML cannot be used with " + raw.tagName + " elements!");
                    }

                    raw.innerHTML = DOMPurify["sanitize"](value, domPurifyConfig);

                    trustChildNodes(this, raw);
                }
            };
        }

        // special handling for Text.splitText() instead of creating a new secure wrapper
        if (tagName === "#text" && "splitText" in el) {
            tagNameSpecificConfig["splitText"] = {
                value: function(index) {
                    var raw = SecureObject.getRaw(this);
                    var newNode = raw.splitText(index);

                    var fromKey = getKey(raw);
                    if (fromKey) {
                        setKey(newNode, fromKey);
                    }

                    return SecureElement(newNode, getKey(this));
                }
            };
        }

        // special handle insertRow since it may automatically also insert a <tbody> element that
        // also needs to be keyed.
        if ("insertRow" in el && el instanceof HTMLTableElement) {
            tagNameSpecificConfig["insertRow"] = {
                value: function(index) {

                    function getFirstTBody(table) {
                        for (var i = 0; i < table.childNodes.length; i++) {
                            var node = table.childNodes[i];
                            if (node instanceof HTMLTableSectionElement) {
                                return node;
                            }
                        }
                        return undefined;
                    }

                    var raw = SecureObject.getRaw(this);
                    var tbodyExists = !!getFirstTBody(raw);
                    var newRow = raw.insertRow(index);
                    trust$1(this, newRow);
                    if (!tbodyExists) {
                        // a new tbody element has also been inserted, key that too.
                        var tbody = getFirstTBody(raw);
                        tbody && trust$1(this, tbody);
                    }
                    return SecureElement(newRow, getKey(this));
                }
            };
        }

        createEventTargetMethodsStateless(tagNameSpecificConfig, prototype);

        if (tagName === "SCRIPT") {
            SecureScriptElement.setOverrides(tagNameSpecificConfig, prototype);
        }

        Object.defineProperties(prototype, tagNameSpecificConfig);

        // Build case insensitive index for attribute validation
        Object.keys(prototype).forEach(function(k) {
            var lower = k.toLowerCase();
            if (lower !== k) {
                caseInsensitiveAttributes[lower] = true;
            }
        });

        prototypeInfo = {
            prototype: prototype,
            expandoCapturingHandler: expandoCapturingHandler
        };

        prototypes.set(tagName, prototypeInfo);
    }

    o = Object.create(prototypeInfo.prototype);

    if (prototypeInfo.expandoCapturingHandler) {
        setRef(o, el, key);
        o = new Proxy(o, prototypeInfo.expandoCapturingHandler);
    }

    setRef(o, el, key);
    addToCache(el, o, key);
    registerProxy(o);

    return o;
}

SecureElement.isValidAttributeName = function(raw, name, prototype, caseInsensitiveAttributes) {
    // Always allow names with the form a-b.* (e.g. data-foo, x-foo, ng-repeat, etc)
    if (name.indexOf("-") >= 0) {
        return true;
    }

    if (name in caseInsensitiveAttributes) {
        return true;
    }

    // Allow SVG elements free reign
    if (raw instanceof SVGElement) {
        return true;
    }

    if (name in prototype) {
        return true;
    }

    // Special case Label element's 'for' attribute. It called 'htmlFor' on prototype but
    // needs to be addressable as 'for' via accessors like .attributes/getAttribute()/setAtribute()
    if (raw.tagName === "LABEL" && name.toLowerCase() === "for") {
        return true;
    }

    // Special case Meta element's custom 'property' attribute. It used by the Open Graph protocol.
    if(raw.tagName === "META" && name.toLowerCase() === "property"){
        return true;
    }

    return false;
};

SecureElement.addStandardMethodAndPropertyOverrides = function(prototype, caseInsensitiveAttributes, key) {
    Object.defineProperties(prototype, {
        appendChild: {
            writable: true,
            value: function(child) {
                if (!runIfRunnable(child)) {
                    var e = SecureObject.getRaw(this);
                    e.appendChild(getRef(child, getKey(this), true));
                }

                return child;
            }
        },

        replaceChild: {
            writable: true,
            value: function(newChild, oldChild) {
                if (!runIfRunnable(newChild)) {
                    var e = SecureObject.getRaw(this);
                    var k = getKey(this);
                    e.replaceChild(getRef(newChild, k, true), getRef(oldChild, k, true));
                }

                return oldChild;
            }
        },

        insertBefore: {
            writable: true,
            value: function(newNode, referenceNode) {
                if (!runIfRunnable(newNode)) {
                    var e = SecureObject.getRaw(this);
                    var k = getKey(this);
                    e.insertBefore(getRef(newNode, k, true), referenceNode ? getRef(referenceNode, k, true): null);
                }

                return newNode;
            }
        },

        querySelector: {
            writable: true,
            value: function(selector) {
                var raw = SecureObject.getRaw(this);
                return SecureElement.secureQuerySelector(raw, getKey(this), selector);
            }
        },

        insertAdjacentHTML: {
            writable: true,
            value: function(position, text) {
                var raw = SecureObject.getRaw(this);

                // Do not allow insertAdjacentHTML on shared elements (body/head)
                if (SecureElement.isSharedElement(raw)) {
                    throw new error("SecureElement.insertAdjacentHTML cannot be used with " + raw.tagName + " elements!");
                }

                var parent;
                if (position === "afterbegin" || position === "beforeend") {
                    // We have access to el, nothing else to check.
                } else if (position === "beforebegin" || position === "afterend") {
                    // Prevent writing outside secure node.
                    parent = raw.parentNode;
                    verifyAccess(this, parent, true);
                } else {
                    throw new error("SecureElement.insertAdjacentHTML requires position 'beforeBegin', 'afterBegin', 'beforeEnd', or 'afterEnd'.");
                }

                raw.insertAdjacentHTML(position, DOMPurify["sanitize"](text, domPurifyConfig));

                trustChildNodes(this, parent || raw);
            }
        },

        removeChild: SecureObject.createFilteredMethodStateless("removeChild", prototype, {
            rawArguments: true,
            beforeCallback: function(child) {
                // Verify that the passed in child is not opaque!
                verifyAccess(this, child, true);
            }
        }),

        cloneNode: {
            writable: true,
            value: function(deep) {
                function copyKeys(from, to) {
                    // Copy keys from the original to the cloned tree
                    var fromKey = getKey(from);
                    if (fromKey) {
                        setKey(to, fromKey);
                    }

                    var toChildren = to.childNodes;
                    var length = toChildren.length;
                    if (length > 0) {
                        var fromChildren = from.childNodes;
                        for (var i = 0; i < length; i++) {
                            copyKeys(fromChildren[i], toChildren[i]);
                        }
                    }
                }

                var e = SecureObject.getRaw(this);
                var root = e.cloneNode(deep);

                // Maintain the same ownership in the cloned subtree
                copyKeys(e, root);

                return SecureElement(root, getKey(this));
            }
        },

        textContent: {
            get: function() {
                return cloneFiltered(SecureObject.getRaw(this), this).textContent;
            },
            set: function(value) {
                var raw = SecureObject.getRaw(this);
                if (SecureElement.isSharedElement(raw)) {
                    throw new error("SecureElement.textContent cannot be used with " + raw.tagName + " elements!");
                }

                raw.textContent = value;

                trustChildNodes(this, raw);
            }
        },

        getAttribute: SecureElement.createAttributeAccessMethodConfig("getAttribute", prototype, caseInsensitiveAttributes, null, undefined, undefined, key),
        getAttributeNS: SecureElement.createAttributeAccessMethodConfig("getAttributeNS", prototype, caseInsensitiveAttributes, null, true, undefined, key),
        getAttributeNode: SecureElement.createAttributeAccessMethodConfig("getAttributeNode", prototype, caseInsensitiveAttributes, null, undefined, undefined, key),
        getAttributeNodeNS: SecureElement.createAttributeAccessMethodConfig("getAttributeNodeNS", prototype, caseInsensitiveAttributes, null, true, undefined, key),

        setAttribute: SecureElement.createAttributeAccessMethodConfig("setAttribute", prototype, caseInsensitiveAttributes, undefined, undefined, undefined, key),
        setAttributeNS: SecureElement.createAttributeAccessMethodConfig("setAttributeNS", prototype, caseInsensitiveAttributes, undefined, true, undefined, key),
        setAttributeNode: SecureElement.createAttributeAccessMethodConfig("setAttributeNode", prototype, caseInsensitiveAttributes, undefined, undefined, "name", key),
        setAttributeNodeNS: SecureElement.createAttributeAccessMethodConfig("setAttributeNodeNS", prototype, caseInsensitiveAttributes, undefined, true, "name", key),

        removeAttributeNode: SecureElement.createAttributeAccessMethodConfig("removeAttributeNode", prototype, caseInsensitiveAttributes, undefined, undefined, "name", key),
        removeAttributeNodeNS: SecureElement.createAttributeAccessMethodConfig("removeAttributeNodeNS", prototype, caseInsensitiveAttributes, undefined, true, "name", key)
    });
};

SecureElement.createAttributeAccessMethodConfig = function(methodName, prototype, caseInsensitiveAttributes, invalidAttributeReturnValue, namespaced, nameProp, key) {
    return {
        writable: true,
        value: function() {
            var raw = SecureObject.getRaw(this);
            var args = SecureObject.ArrayPrototypeSlice.call(arguments);

            var name = args[namespaced ? 1 : 0];
            if (nameProp) {
                name = name[nameProp];
            }
            if (!SecureElement.isValidAttributeName(raw, name, prototype, caseInsensitiveAttributes)) {
                warn(this + " does not allow getting/setting the " + name.toLowerCase() + " attribute, ignoring!");
                return invalidAttributeReturnValue;
            }

            args = SecureObject.filterArguments(this, args, { rawArguments: true });
            var ret = raw[methodName].apply(raw, args);
            return ret instanceof Node ? SecureElement(ret, key) : ret;
        }
    };
};

const metadata$1 = {
    "prototypes": {
        "DocumentFragment" : {
            "childElementCount":              DEFAULT,
            "children":                       DEFAULT,
            "firstElementChild":              SKIP_OPAQUE,
            "getElementById":                 FUNCTION,
            "lastElementChild":               SKIP_OPAQUE,
            "querySelector":                  FUNCTION,
            "querySelectorAll":               FUNCTION
        },
        "HTMLAnchorElement": {
            "charset":                        DEFAULT,
            "coords":                         DEFAULT,
            "download":                       DEFAULT,
            "hash":                           DEFAULT,
            "host":                           DEFAULT,
            "hostname":                       DEFAULT,
            "href":                           DEFAULT,
            "hreflang":                       DEFAULT,
            "name":                           DEFAULT,
            "origin":                         DEFAULT,
            "password":                       DEFAULT,
            "pathname":                       DEFAULT,
            "ping":                           DEFAULT,
            "port":                           DEFAULT,
            "protocol":                       DEFAULT,
            "referrerPolicy":                 DEFAULT,
            "rel":                            DEFAULT,
            "rev":                            DEFAULT,
            "search":                         DEFAULT,
            "shape":                          DEFAULT,
            "target":                         DEFAULT,
            "text":                           DEFAULT,
            "type":                           DEFAULT,
            "username":                       DEFAULT
        },
        "HTMLAreaElement": {
            "alt":                            DEFAULT,
            "coords":                         DEFAULT,
            "hash":                           DEFAULT,
            "host":                           DEFAULT,
            "hostname":                       DEFAULT,
            "href":                           DEFAULT,
            "noHref":                         DEFAULT,
            "origin":                         DEFAULT,
            "password":                       DEFAULT,
            "pathname":                       DEFAULT,
            "ping":                           DEFAULT,
            "port":                           DEFAULT,
            "protocol":                       DEFAULT,
            "referrerPolicy":                 DEFAULT,
            "search":                         DEFAULT,
            "shape":                          DEFAULT,
            "target":                         DEFAULT,
            "username":                       DEFAULT
        },
        "HTMLAudioElement": {
        },
        "HTMLMediaElement": {
            "HAVE_CURRENT_DATA":              DEFAULT,
            "HAVE_ENOUGH_DATA":               DEFAULT,
            "HAVE_FUTURE_DATA":               DEFAULT,
            "HAVE_METADATA":                  DEFAULT,
            "HAVE_NOTHING":                   DEFAULT,
            "NETWORK_EMPTY":                  DEFAULT,
            "NETWORK_IDLE":                   DEFAULT,
            "NETWORK_LOADING":                DEFAULT,
            "NETWORK_NO_SOURCE":              DEFAULT,
            "addTextTrack":                   FUNCTION,
            "autoplay":                       DEFAULT,
            "buffered":                       DEFAULT,
            "canPlayType":                    FUNCTION,
            "controls":                       DEFAULT,
            "crossOrigin":                    DEFAULT,
            "currentSrc":                     DEFAULT,
            "currentTime":                    DEFAULT,
            "defaultMuted":                   DEFAULT,
            "defaultPlaybackRate":            DEFAULT,
            "disableRemotePlayback":          DEFAULT,
            "duration":                       DEFAULT,
            "ended":                          DEFAULT,
            "error":                          DEFAULT,
            "load":                           FUNCTION,
            "loop":                           DEFAULT,
            "mediaKeys":                      DEFAULT,
            "muted":                          DEFAULT,
            "networkState":                   DEFAULT,
            "onencrypted":                    EVENT,
            "pause":                          FUNCTION,
            "paused":                         DEFAULT,
            "play":                           FUNCTION,
            "playbackRate":                   DEFAULT,
            "played":                         DEFAULT,
            "preload":                        DEFAULT,
            "readyState":                     DEFAULT,
            "seekable":                       DEFAULT,
            "seeking":                        DEFAULT,
            "setMediaKeys":                   FUNCTION,
            "setSinkId":                      FUNCTION,
            "sinkId":                         DEFAULT,
            "src":                            DEFAULT,
            "srcObject":                      DEFAULT,
            "textTracks":                     DEFAULT,
            "volume":                         DEFAULT,
            "webkitAudioDecodedByteCount":    DEFAULT,
            "webkitVideoDecodedByteCount":    DEFAULT
        },
        "HTMLBaseElement": {
            "href":                           DEFAULT,
            "target":                         DEFAULT
        },
        "HTMLButtonElement": {
            "autofocus":                      DEFAULT,
            "checkValidity":                  FUNCTION,
            "disabled":                       DEFAULT,
            "form":                           DEFAULT,
            "formAction":                     DEFAULT,
            "formEnctype":                    DEFAULT,
            "formMethod":                     DEFAULT,
            "formNoValidate":                 DEFAULT,
            "formTarget":                     DEFAULT,
            "labels":                         DEFAULT,
            "name":                           DEFAULT,
            "reportValidity":                 FUNCTION,
            "setCustomValidity":              FUNCTION,
            "type":                           DEFAULT,
            "validationMessage":              DEFAULT,
            "validity":                       DEFAULT,
            "value":                          DEFAULT,
            "willValidate":                   DEFAULT
        },
        "HTMLCanvasElement": {
            "captureStream":                  FUNCTION,
            "getContext":                     FUNCTION,
            "height":                         DEFAULT,
            "toBlob":                         FUNCTION,
            "toDataURL":                      FUNCTION,
            "width":                          DEFAULT
        },
        "HTMLTableColElement": {
            "align":                          DEFAULT,
            "ch":                             DEFAULT,
            "chOff":                          DEFAULT,
            "span":                           DEFAULT,
            "vAlign":                         DEFAULT,
            "width":                          DEFAULT
        },
        "HTMLUnknownElement": {
        },
        "HTMLModElement": {
            "cite":                           DEFAULT,
            "dateTime":                       DEFAULT
        },
        "HTMLDetailsElement": {
            "open":                           DEFAULT
        },
        "HTMLEmbedElement": {
            "align":                          DEFAULT,
            "getSVGDocument":                 FUNCTION,
            "height":                         DEFAULT,
            "name":                           DEFAULT,
            "src":                            DEFAULT,
            "type":                           DEFAULT,
            "width":                          DEFAULT
        },
        "HTMLFieldSetElement": {
            "checkValidity":                  FUNCTION,
            "disabled":                       DEFAULT,
            "elements":                       DEFAULT,
            "form":                           DEFAULT,
            "name":                           DEFAULT,
            "reportValidity":                 FUNCTION,
            "setCustomValidity":              FUNCTION,
            "type":                           DEFAULT,
            "validationMessage":              DEFAULT,
            "validity":                       DEFAULT,
            "willValidate":                   DEFAULT
        },
        "HTMLFormElement": {
            "acceptCharset":                  DEFAULT,
            "action":                         DEFAULT,
            "autocomplete":                   DEFAULT,
            "checkValidity":                  FUNCTION,
            "elements":                       DEFAULT,
            "encoding":                       DEFAULT,
            "enctype":                        DEFAULT,
            "length":                         DEFAULT,
            "method":                         DEFAULT,
            "name":                           DEFAULT,
            "noValidate":                     DEFAULT,
            "reportValidity":                 FUNCTION,
            "requestAutocomplete":            FUNCTION,
            "reset":                          FUNCTION,
            "submit":                         FUNCTION,
            "target":                         DEFAULT
        },
        "HTMLIFrameElement": {
            "align":                          DEFAULT,
            "allowFullscreen":                DEFAULT,
            "frameBorder":                    DEFAULT,
            "height":                         DEFAULT,
            "longDesc":                       DEFAULT,
            "marginHeight":                   DEFAULT,
            "marginWidth":                    DEFAULT,
            "name":                           DEFAULT,
            "referrerPolicy":                 DEFAULT,
            "scrolling":                      DEFAULT,
            "src":                            DEFAULT,
            "width":                          DEFAULT
        },
        "HTMLImageElement": {
            "align":                          DEFAULT,
            "alt":                            DEFAULT,
            "border":                         DEFAULT,
            "complete":                       DEFAULT,
            "crossOrigin":                    DEFAULT,
            "currentSrc":                     DEFAULT,
            "height":                         DEFAULT,
            "hspace":                         DEFAULT,
            "isMap":                          DEFAULT,
            "longDesc":                       DEFAULT,
            "lowsrc":                         DEFAULT,
            "name":                           DEFAULT,
            "naturalHeight":                  DEFAULT,
            "naturalWidth":                   DEFAULT,
            "referrerPolicy":                 DEFAULT,
            "sizes":                          DEFAULT,
            "src":                            DEFAULT,
            "srcset":                         DEFAULT,
            "useMap":                         DEFAULT,
            "vspace":                         DEFAULT,
            "width":                          DEFAULT,
            "x":                              DEFAULT,
            "y":                              DEFAULT
        },
        "HTMLInputElement": {
            "accept":                         DEFAULT,
            "align":                          DEFAULT,
            "alt":                            DEFAULT,
            "autocapitalize":                 DEFAULT,
            "autocomplete":                   DEFAULT,
            "autocorrect":                    DEFAULT,
            "autofocus":                      DEFAULT,
            "checkValidity":                  FUNCTION,
            "checked":                        DEFAULT,
            "defaultChecked":                 DEFAULT,
            "defaultValue":                   DEFAULT,
            "dirName":                        DEFAULT,
            "disabled":                       DEFAULT,
            "files":                          DEFAULT,
            "form":                           DEFAULT,
            "formAction":                     DEFAULT,
            "formEnctype":                    DEFAULT,
            "formMethod":                     DEFAULT,
            "formNoValidate":                 DEFAULT,
            "formTarget":                     DEFAULT,
            "height":                         DEFAULT,
            "incremental":                    DEFAULT,
            "indeterminate":                  DEFAULT,
            "labels":                         DEFAULT,
            "list":                           DEFAULT,
            "max":                            DEFAULT,
            "maxLength":                      DEFAULT,
            "min":                            DEFAULT,
            "minLength":                      DEFAULT,
            "multiple":                       DEFAULT,
            "name":                           DEFAULT,
            "pattern":                        DEFAULT,
            "placeholder":                    DEFAULT,
            "readOnly":                       DEFAULT,
            "reportValidity":                 FUNCTION,
            "required":                       DEFAULT,
            "results":                        DEFAULT,
            "select":                         FUNCTION,
            "selectionDirection":             DEFAULT,
            "selectionEnd":                   DEFAULT,
            "selectionStart":                 DEFAULT,
            "setCustomValidity":              FUNCTION,
            "setRangeText":                   FUNCTION,
            "setSelectionRange":              FUNCTION,
            "size":                           DEFAULT,
            "src":                            DEFAULT,
            "step":                           DEFAULT,
            "stepDown":                       FUNCTION,
            "stepUp":                         FUNCTION,
            "type":                           DEFAULT,
            "useMap":                         DEFAULT,
            "validationMessage":              DEFAULT,
            "validity":                       DEFAULT,
            "value":                          DEFAULT,
            "valueAsDate":                    DEFAULT,
            "valueAsNumber":                  DEFAULT,
            "webkitEntries":                  DEFAULT,
            "webkitdirectory":                DEFAULT,
            "width":                          DEFAULT,
            "willValidate":                   DEFAULT,
            "x-moz-errormessage":             DEFAULT
        },
        "HTMLLabelElement": {
            "control":                        DEFAULT,
            "form":                           DEFAULT,
            "htmlFor":                        DEFAULT
        },
        "HTMLLIElement": {
            "type":                           DEFAULT,
            "value":                          DEFAULT
        },
        "HTMLLinkElement": {
            "as":                             DEFAULT,
            "charset":                        DEFAULT,
            "crossOrigin":                    DEFAULT,
            "disabled":                       DEFAULT,
            "href":                           DEFAULT,
            "hreflang":                       DEFAULT,
            "import":                         DEFAULT,
            "integrity":                      DEFAULT,
            "media":                          DEFAULT,
            "rel":                            DEFAULT,
            "relList":                        DEFAULT,
            "rev":                            DEFAULT,
            "sheet":                          DEFAULT,
            "sizes":                          DEFAULT,
            "target":                         DEFAULT,
            "type":                           DEFAULT
        },
        "HTMLMapElement": {
            "areas":                          DEFAULT,
            "name":                           DEFAULT
        },
        "HTMLMetaElement": {
            "content":                        DEFAULT,
            "httpEquiv":                      DEFAULT,
            "name":                           DEFAULT,
            "scheme":                         DEFAULT
        },
        "HTMLMeterElement": {
            "high":                           DEFAULT,
            "labels":                         DEFAULT,
            "low":                            DEFAULT,
            "max":                            DEFAULT,
            "min":                            DEFAULT,
            "optimum":                        DEFAULT,
            "value":                          DEFAULT
        },
        "HTMLObjectElement": {
            "align":                          DEFAULT,
            "archive":                        DEFAULT,
            "border":                         DEFAULT,
            "checkValidity":                  FUNCTION,
            "code":                           DEFAULT,
            "codeBase":                       DEFAULT,
            "codeType":                       DEFAULT,
            "contentDocument":                DEFAULT,
            "data":                           DEFAULT,
            "declare":                        DEFAULT,
            "form":                           DEFAULT,
            "getSVGDocument":                 FUNCTION,
            "height":                         DEFAULT,
            "hspace":                         DEFAULT,
            "name":                           DEFAULT,
            "reportValidity":                 FUNCTION,
            "setCustomValidity":              FUNCTION,
            "standby":                        DEFAULT,
            "type":                           DEFAULT,
            "useMap":                         DEFAULT,
            "validationMessage":              DEFAULT,
            "validity":                       DEFAULT,
            "vspace":                         DEFAULT,
            "width":                          DEFAULT,
            "willValidate":                   DEFAULT
        },
        "HTMLOListElement": {
            "compact":                        DEFAULT,
            "reversed":                       DEFAULT,
            "start":                          DEFAULT,
            "type":                           DEFAULT
        },
        "HTMLOptGroupElement": {
            "disabled":                       DEFAULT,
            "label":                          DEFAULT
        },
        "HTMLOptionElement": {
            "defaultSelected":                DEFAULT,
            "disabled":                       DEFAULT,
            "form":                           DEFAULT,
            "index":                          DEFAULT,
            "label":                          DEFAULT,
            "selected":                       DEFAULT,
            "text":                           DEFAULT,
            "value":                          DEFAULT
        },
        "HTMLOutputElement": {
            "checkValidity":                  FUNCTION,
            "defaultValue":                   DEFAULT,
            "form":                           DEFAULT,
            "htmlFor":                        DEFAULT,
            "labels":                         DEFAULT,
            "name":                           DEFAULT,
            "reportValidity":                 FUNCTION,
            "setCustomValidity":              FUNCTION,
            "type":                           DEFAULT,
            "validationMessage":              DEFAULT,
            "validity":                       DEFAULT,
            "value":                          DEFAULT,
            "willValidate":                   DEFAULT
        },
        "HTMLParamElement": {
            "name":                           DEFAULT,
            "type":                           DEFAULT,
            "value":                          DEFAULT,
            "valueType":                      DEFAULT
        },
        "HTMLProgressElement": {
            "labels":                         DEFAULT,
            "max":                            DEFAULT,
            "position":                       DEFAULT,
            "value":                          DEFAULT
        },
        "HTMLQuoteElement": {
            "cite":                           DEFAULT
        },
        "HTMLScriptElement": {
            "src":                            DEFAULT,
            "type":                           DEFAULT
        },
        "HTMLSelectElement": {
            "add":                            FUNCTION,
            "autofocus":                      DEFAULT,
            "checkValidity":                  FUNCTION,
            "disabled":                       DEFAULT,
            "form":                           DEFAULT,
            "item":                           FUNCTION,
            "labels":                         DEFAULT,
            "length":                         DEFAULT,
            "multiple":                       DEFAULT,
            "name":                           DEFAULT,
            "namedItem":                      FUNCTION,
            "options":                        DEFAULT,
            "remove":                         FUNCTION,
            "reportValidity":                 FUNCTION,
            "required":                       DEFAULT,
            "selectedIndex":                  DEFAULT,
            "selectedOptions":                DEFAULT,
            "setCustomValidity":              FUNCTION,
            "size":                           DEFAULT,
            "type":                           DEFAULT,
            "validationMessage":              DEFAULT,
            "validity":                       DEFAULT,
            "value":                          DEFAULT,
            "willValidate":                   DEFAULT
        },
        "HTMLSourceElement": {
            "media":                          DEFAULT,
            "sizes":                          DEFAULT,
            "src":                            DEFAULT,
            "srcset":                         DEFAULT,
            "type":                           DEFAULT
        },
        "HTMLTableCellElement": {
            "abbr":                           DEFAULT,
            "align":                          DEFAULT,
            "axis":                           DEFAULT,
            "bgColor":                        DEFAULT,
            "cellIndex":                      DEFAULT,
            "ch":                             DEFAULT,
            "chOff":                          DEFAULT,
            "colSpan":                        DEFAULT,
            "headers":                        DEFAULT,
            "height":                         DEFAULT,
            "noWrap":                         DEFAULT,
            "rowSpan":                        DEFAULT,
            "scope":                          DEFAULT,
            "vAlign":                         DEFAULT,
            "width":                          DEFAULT
        },
        "HTMLTableElement": {
            "caption":                        DEFAULT,
            "tHead":                          SKIP_OPAQUE,
            "tFoot":                          SKIP_OPAQUE,
            "tBodies":                        DEFAULT,
            "createTHead":                    FUNCTION_TRUST_RETURN_VALUE,
            "deleteTHead":                    FUNCTION,
            "createTFoot":                    FUNCTION_TRUST_RETURN_VALUE,
            "deleteTFoot":                    FUNCTION,
            "createCaption":                  FUNCTION_TRUST_RETURN_VALUE,
            "deleteCaption":                  FUNCTION,
            "rows":                           DEFAULT,
            "insertRow":                      FUNCTION_TRUST_RETURN_VALUE,
            "deleteRow":                      FUNCTION,
            "width":                          DEFAULT
        },
        "HTMLTableRowElement": {
            "cells":                          DEFAULT,
            "rowIndex":                       DEFAULT,
            "sectionRowIndex":                DEFAULT,
            "insertCell":                     FUNCTION_TRUST_RETURN_VALUE,
            "deleteCell":                     FUNCTION
        },
        "HTMLTableSectionElement": {
            "rows":                           DEFAULT,
            "insertRow":                      FUNCTION_TRUST_RETURN_VALUE,
            "deleteRow":                      FUNCTION
        },
        "HTMLTemplateElement": {
            "content":                        DEFAULT
        },
        "HTMLTextAreaElement": {
            "autocapitalize":                 DEFAULT,
            "autofocus":                      DEFAULT,
            "checkValidity":                  FUNCTION,
            "cols":                           DEFAULT,
            "defaultValue":                   DEFAULT,
            "dirName":                        DEFAULT,
            "disabled":                       DEFAULT,
            "form":                           DEFAULT,
            "labels":                         DEFAULT,
            "maxLength":                      DEFAULT,
            "minLength":                      DEFAULT,
            "name":                           DEFAULT,
            "placeholder":                    DEFAULT,
            "readOnly":                       DEFAULT,
            "reportValidity":                 FUNCTION,
            "required":                       DEFAULT,
            "rows":                           DEFAULT,
            "select":                         FUNCTION,
            "selectionDirection":             DEFAULT,
            "selectionEnd":                   DEFAULT,
            "selectionStart":                 DEFAULT,
            "setCustomValidity":              FUNCTION,
            "setRangeText":                   FUNCTION,
            "setSelectionRange":              FUNCTION,
            "textLength":                     DEFAULT,
            "type":                           DEFAULT,
            "validationMessage":              DEFAULT,
            "validity":                       DEFAULT,
            "value":                          DEFAULT,
            "willValidate":                   DEFAULT,
            "wrap":                           DEFAULT
        },
        "HTMLTrackElement": {
            "ERROR":                          DEFAULT,
            "LOADED":                         DEFAULT,
            "LOADING":                        DEFAULT,
            "NONE":                           DEFAULT,
            "default":                        DEFAULT,
            "kind":                           DEFAULT,
            "label":                          DEFAULT,
            "readyState":                     DEFAULT,
            "src":                            DEFAULT,
            "srclang":                        DEFAULT,
            "track":                          DEFAULT
        },
        "HTMLVideoElement": {
            "height":                         DEFAULT,
            "poster":                         DEFAULT,
            "videoHeight":                    DEFAULT,
            "videoWidth":                     DEFAULT,
            "width":                          DEFAULT
        },
        "HTMLElement": {
            "accessKey":                      DEFAULT,
            "blur":                           FUNCTION,
            "click":                          FUNCTION,
            "contentEditable":                DEFAULT,
            "dataset":                        DEFAULT,
            "dir":                            DEFAULT,
            "draggable":                      DEFAULT,
            "focus":                          FUNCTION,
            "hidden":                         DEFAULT,
            "innerText":                      DEFAULT,
            "isContentEditable":              DEFAULT,
            "lang":                           DEFAULT,
            "offsetHeight":                   DEFAULT,
            "offsetLeft":                     DEFAULT,
            "offsetParent":                   DEFAULT,
            "offsetTop":                      DEFAULT,
            "offsetWidth":                    DEFAULT,
            "onabort":                        EVENT,
            "onautocomplete":                 EVENT,
            "onautocompleteerror":            EVENT,
            "onblur":                         EVENT,
            "oncancel":                       EVENT,
            "oncanplay":                      EVENT,
            "oncanplaythrough":               EVENT,
            "onchange":                       EVENT,
            "onclick":                        EVENT,
            "onclose":                        EVENT,
            "oncontextmenu":                  EVENT,
            "oncuechange":                    EVENT,
            "ondblclick":                     EVENT,
            "ondrag":                         EVENT,
            "ondragend":                      EVENT,
            "ondragenter":                    EVENT,
            "ondragleave":                    EVENT,
            "ondragover":                     EVENT,
            "ondragstart":                    EVENT,
            "ondrop":                         EVENT,
            "ondurationchange":               EVENT,
            "onemptied":                      EVENT,
            "onended":                        EVENT,
            "onerror":                        EVENT,
            "onfocus":                        EVENT,
            "oninput":                        EVENT,
            "oninvalid":                      EVENT,
            "onkeydown":                      EVENT,
            "onkeypress":                     EVENT,
            "onkeyup":                        EVENT,
            "onload":                         EVENT,
            "onloadeddata":                   EVENT,
            "onloadedmetadata":               EVENT,
            "onloadstart":                    EVENT,
            "onmousedown":                    EVENT,
            "onmouseenter":                   EVENT,
            "onmouseleave":                   EVENT,
            "onmousemove":                    EVENT,
            "onmouseout":                     EVENT,
            "onmouseover":                    EVENT,
            "onmouseup":                      EVENT,
            "onmousewheel":                   EVENT,
            "onpause":                        EVENT,
            "onplay":                         EVENT,
            "onplaying":                      EVENT,
            "onprogress":                     EVENT,
            "onratechange":                   EVENT,
            "onreset":                        EVENT,
            "onresize":                       EVENT,
            "onscroll":                       EVENT,
            "onseeked":                       EVENT,
            "onseeking":                      EVENT,
            "onselect":                       EVENT,
            "onshow":                         EVENT,
            "onstalled":                      EVENT,
            "onsubmit":                       EVENT,
            "onsuspend":                      EVENT,
            "ontimeupdate":                   EVENT,
            "ontoggle":                       EVENT,
            "ontouchcancel":                     EVENT,
            "ontouchend":                      EVENT,
            "ontouchmove":                      EVENT,
            "ontouchstart":                      EVENT,
            "onvolumechange":                 EVENT,
            "onwaiting":                      EVENT,
            "outerText":                      DEFAULT,
            "spellcheck":                     DEFAULT,
            "style":                          DEFAULT,
            "tabIndex":                       DEFAULT,
            "title":                          DEFAULT,
            "translate":                      DEFAULT,
            "webkitdropzone":                 DEFAULT
        },
        "SVGAngle": {
            "unitType":                       DEFAULT,
            "value":                          DEFAULT,
            "valueInSpecifiedUnits":          DEFAULT,
            "valueAsString":                  DEFAULT,
            "newValueSpecifiedUnits":         FUNCTION,
            "convertToSpecifiedUnits":        FUNCTION
        },
        "SVGAnimatedAngle": {
            "baseVal":                        DEFAULT,
            "animVal":                        DEFAULT
        },
        "SVGAnimatedBoolean": {
            "baseVal":                        DEFAULT,
            "animVal":                        DEFAULT
        },
        "SVGAnimatedEnumeration": {
            "baseVal":                        DEFAULT,
            "animVal":                        DEFAULT
        },
        "SVGAnimatedInteger": {
            "baseVal":                        DEFAULT,
            "animVal":                        DEFAULT
        },
        "SVGAnimatedLength": {
            "baseVal":                        DEFAULT,
            "animVal":                        DEFAULT
        },
        "SVGAnimatedLengthList": {
            "baseVal":                        DEFAULT,
            "animVal":                        DEFAULT
        },
        "SVGAnimatedNumber": {
            "baseVal":                        DEFAULT,
            "animVal":                        DEFAULT
        },
        "SVGAnimatedNumberList": {
            "baseVal":                        DEFAULT,
            "animVal":                        DEFAULT
        },
        "SVGAnimatedPreserveAspectRatio": {
            "baseVal":                        DEFAULT,
            "animVal":                        DEFAULT
        },
        "SVGAnimatedRect": {
            "baseVal":                        DEFAULT,
            "animVal":                        DEFAULT
        },
        "SVGAnimatedString": {
            "baseVal":                        DEFAULT,
            "animVal":                        DEFAULT
        },
        "SVGAnimatedTransformList": {
            "baseVal":                        DEFAULT,
            "animVal":                        DEFAULT
        },
        "SVGAnimationElement": {
            "targetElement":                  SKIP_OPAQUE,
            "getCurrentTime":                 FUNCTION,
            "getSimpleDuration":              FUNCTION
        },
        "SVGCircleElement": {
            "cx":                             DEFAULT,
            "cy":                             DEFAULT,
            "r":                              DEFAULT
        },
        "SVGClipPathElement": {
            "clipPathUnits":                  DEFAULT
        },
        "SVGEllipseElement": {
            "cx":                             DEFAULT,
            "cy":                             DEFAULT,
            "rx":                             DEFAULT,
            "ry":                             DEFAULT
        },
        "SVGFilterElement": {
            "filterUnits":                    DEFAULT,
            "primitiveUnits":                 DEFAULT,
            "x":                              DEFAULT,
            "y":                              DEFAULT,
            "width":                          DEFAULT,
            "height":                         DEFAULT,
            "filterResX":                     DEFAULT,
            "fitlerResY":                     DEFAULT
        },
        "SVGForeignObjectElement": {
            "x":                              DEFAULT,
            "y":                              DEFAULT,
            "width":                          DEFAULT,
            "height":                         DEFAULT
        },
        "SVGGeometryElement": {
            "pathLength":                     DEFAULT,
            "isPointInFill":                  FUNCTION,
            "isPointInStroke":                FUNCTION,
            "getTotalLength":                 FUNCTION,
            "getPointAtLength":               FUNCTION
        },
        "SVGGradientElement": {
            "gradientUnits":                  DEFAULT,
            "gradientTransform":              DEFAULT,
            "spreadMethod":                   DEFAULT
        },
        "SVGGraphicsElement": {
            "transform":                      DEFAULT,
            "getBBox":                        FUNCTION,
            "getCTM":                         FUNCTION,
            "getScreenCTM":                   FUNCTION
        },
        "SVGImageElement": {
            "x":                              DEFAULT,
            "y":                              DEFAULT,
            "width":                          DEFAULT,
            "height":                         DEFAULT,
            "preserveAspectRatio":            DEFAULT,
            "crossOrigin":                    DEFAULT
        },
        "SVGLength": {
            "SVG_LENGTHTYPE_UNKNOWN":         DEFAULT,
            "SVG_LENGTHTYPE_NUMBER":          DEFAULT,
            "SVG_LENGTHTYPE_PERCENTAGE":      DEFAULT,
            "SVG_LENGTHTYPE_EMS":             DEFAULT,
            "SVG_LENGTHTYPE_EXS":             DEFAULT,
            "SVG_LENGTHTYPE_PX":              DEFAULT,
            "SVG_LENGTHTYPE_CM":              DEFAULT,
            "SVG_LENGTHTYPE_MM":              DEFAULT,
            "SVG_LENGTHTYPE_IN":              DEFAULT,
            "SVG_LENGTHTYPE_PT":              DEFAULT,
            "SVG_LENGTHTYPE_PC":              DEFAULT,
            "unitType":                       DEFAULT,
            "value":                          DEFAULT,
            "valueInSpecifiedUnits":          DEFAULT,
            "valueAsString":                  DEFAULT,
            "newValueSpecifiedUnits":         FUNCTION,
            "convertToSpecifiedUnits":        FUNCTION
        },
        "SVGLengthList": {
            "numberOfItem":                   DEFAULT,
            "clear":                          FUNCTION,
            "initialize":                     FUNCTION,
            "getItem":                        SKIP_OPAQUE,
            "insertItemBefore":               FUNCTION,
            "replaceItem":                    FUNCTION,
            "removeItem":                     SKIP_OPAQUE,
            "appendItem":                     FUNCTION
        },
        "SVGLineElement": {
            "x1":                             DEFAULT,
            "x2":                             DEFAULT,
            "y1":                             DEFAULT,
            "y2":                             DEFAULT
        },
        "SVGLinearGradientElement": {
            "x1":                             DEFAULT,
            "x2":                             DEFAULT,
            "y1":                             DEFAULT,
            "y2":                             DEFAULT
        },
        "SVGMaskElement": {
            "maskUnits":                      DEFAULT,
            "maskContentUnits":               DEFAULT,
            "x":                              DEFAULT,
            "y":                              DEFAULT,
            "width":                          DEFAULT,
            "height":                         DEFAULT
        },
        "SVGNumber": {
            "value":                          DEFAULT
        },
        "SVGNumberList": {
            "numberOfItem":                   DEFAULT,
            "clear":                          FUNCTION,
            "initialize":                     FUNCTION,
            "getItem":                        SKIP_OPAQUE,
            "insertItemBefore":               FUNCTION,
            "replaceItem":                    FUNCTION,
            "removeItem":                     SKIP_OPAQUE,
            "appendItem":                     FUNCTION
        },
        "SVGPatternElement": {
            "x":                              DEFAULT,
            "y":                              DEFAULT,
            "width":                          DEFAULT,
            "height":                         DEFAULT,
            "patternUnits":                   DEFAULT,
            "patternContentUnits":            DEFAULT,
            "patternTransform":               DEFAULT
        },
        "SVGPreserveAspectRatio": {
            "align":                          DEFAULT,
            "meetOrSlice":                    DEFAULT,
            "SVG_PRESERVEASPECTRATIO_UNKNOWN":DEFAULT,
            "SVG_PRESERVEASPECTRATIO_NONE":   DEFAULT,
            "SVG_PRESERVEASPECTRATIO_XMINYMIN":DEFAULT,
            "SVG_PRESERVEASPECTRATIO_XMIDYMIN":DEFAULT,
            "SVG_PRESERVEASPECTRATIO_XMAXYMIN":DEFAULT,
            "SVG_PRESERVEASPECTRATIO_XMINYMID":DEFAULT,
            "SVG_PRESERVEASPECTRATIO_XMIDYMID":DEFAULT,
            "SVG_PRESERVEASPECTRATIO_XMAXYMID":DEFAULT,
            "SVG_PRESERVEASPECTRATIO_XMINYMAX":DEFAULT,
            "SVG_PRESERVEASPECTRATIO_XMIDYMAX":DEFAULT,
            "SVG_PRESERVEASPECTRATIO_XMAXYMAX":DEFAULT,
            "SVG_MEETORSLICE_UNKNOWN":        DEFAULT,
            "SVG_MEETORSLICE_MEET":           DEFAULT,
            "SVG_MEETORSLICE_SLICE":          DEFAULT
        },
        "SVGRadialGradientElement": {
            "cx":                             DEFAULT,
            "cy":                             DEFAULT,
            "r":                              DEFAULT,
            "fx":                             DEFAULT,
            "fy":                             DEFAULT
        },
        "SVGRect": {
            "x":                              DEFAULT,
            "y":                              DEFAULT,
            "width":                          DEFAULT,
            "height":                         DEFAULT
        },
        "SVGRectElement": {
            "x":                              DEFAULT,
            "y":                              DEFAULT,
            "width":                          DEFAULT,
            "height":                         DEFAULT,
            "rx":                             DEFAULT,
            "ry":                             DEFAULT
        },
        "SVGScriptElement": {
            "type":                           DEFAULT,
            "crossOrigin":                    DEFAULT
        },
        "SVGStopElement": {
            "offset":                         DEFAULT
        },
        "SVGStringList": {
            "numberOfItem":                   DEFAULT,
            "clear":                          FUNCTION,
            "initialize":                     FUNCTION,
            "getItem":                        SKIP_OPAQUE,
            "insertItemBefore":               FUNCTION,
            "replaceItem":                    FUNCTION,
            "removeItem":                     SKIP_OPAQUE,
            "appendItem":                     FUNCTION
        },
        "SVGStyleElement": {
            "type":                           DEFAULT,
            "media":                          DEFAULT,
            "title":                          DEFAULT
        },
        "SVGSVGElement": {
            "animationsPaused":               FUNCTION,
            "checkIntersection":              FUNCTION,
            "checkEnclosure":                 FUNCTION,
            "contentScriptType":              DEFAULT,
            "contentStyleType":               DEFAULT,
            "createSVGAngle":                 FUNCTION,
            "createSVGLength":                FUNCTION,
            "createSVGMatrix":                FUNCTION,
            "createSVGNumber":                FUNCTION,
            "createSVGPoint":                 FUNCTION,
            "createSVGRect":                  FUNCTION,
            "createSVGTransform":             FUNCTION,
            "createSVGTransformFromMatrix":   FUNCTION,
            "currentScale":                   DEFAULT,
            "currentTranslate":               DEFAULT,
            "currentView":                    DEFAULT,
            "forceRedraw":                    FUNCTION,
            "height":                         DEFAULT,
            "pauseAnimations":                FUNCTION,
            "pixelUnitToMillimeterX":         DEFAULT,
            "pixelUnitToMillimeterY":         DEFAULT,
            "getCurrentTime":                 FUNCTION,
            "getEnclosureList":               FUNCTION,
            "getElementById":                 FUNCTION,
            "getIntersectionList":            FUNCTION,
            "screenPixelToMillimeterX":       DEFAULT,
            "screenPixelToMillimeterY":       DEFAULT,
            "setCurrentTime":                 FUNCTION,
            "suspendRedraw":                  FUNCTION,
            "unpauseAnimations":              FUNCTION,
            "unsuspendRedraw":                FUNCTION,
            "unsuspendRedrawAll":             FUNCTION,
            "useCurrentView":                 DEFAULT,
            "viewport":                       DEFAULT,
            "width":                          DEFAULT,
            "x":                              DEFAULT,
            "y":                              DEFAULT
        },
        "SVGTextContentElement": {
            "LENGTHADJUST_UNKNOWN":           DEFAULT,
            "LENGTHADJUST_SPACING":           DEFAULT,
            "LENGTHADJUST_SPACINGANDGLYPHS":  DEFAULT,
            "textLength":                     DEFAULT,
            "lengthAdjust":                   DEFAULT,
            "getNumberOfChars":               FUNCTION,
            "getComputedTextLength":          FUNCTION,
            "getSubStringLength":             FUNCTION,
            "getStartPositionOfChar":         FUNCTION,
            "getEndPositionOfChar":           FUNCTION,
            "getExtentOfChar":                FUNCTION,
            "getRotationOfChar":              FUNCTION,
            "getCharNumAtPosition":           FUNCTION
        },
        "SVGTextPositioningElement": {
            "x":                              DEFAULT,
            "y":                              DEFAULT,
            "dx":                             DEFAULT,
            "dy":                             DEFAULT,
            "rotate":                         DEFAULT
        },
        "SVGTransform": {
            "SVG_TRANSFORM_UNKNOWN":          DEFAULT,
            "SVG_TRANSFORM_MATRIX":           DEFAULT,
            "SVG_TRANSFORM_TRANSLATE":        DEFAULT,
            "SVG_TRANSFORM_SCALE":            DEFAULT,
            "SVG_TRANSFORM_ROTATE":           DEFAULT,
            "SVG_TRANSFORM_SKEWX":            DEFAULT,
            "SVG_TRANSFORM_SKEWY":            DEFAULT,
            "type":                           DEFAULT,
            "angle":                          DEFAULT,
            "matrix":                         DEFAULT,
            "setMatrix":                      FUNCTION,
            "setTranslate":                   FUNCTION,
            "setScale":                       FUNCTION,
            "setRotate":                      FUNCTION,
            "setSkewX":                       FUNCTION,
            "setSkewY":                       FUNCTION
        },
        "SVGTransformList": {
            "numberOfItem":                   DEFAULT,
            "clear":                          FUNCTION,
            "initialize":                     FUNCTION,
            "getItem":                        SKIP_OPAQUE,
            "insertItemBefore":               FUNCTION,
            "replaceItem":                    FUNCTION,
            "removeItem":                     SKIP_OPAQUE,
            "appendItem":                     FUNCTION,
            "createSVGTransformFromMatrix":   FUNCTION,
            "consolidate":                    FUNCTION
        },
        "SVGUseElement": {
            "x":                              DEFAULT,
            "y":                              DEFAULT,
            "width":                          DEFAULT,
            "height":                         DEFAULT,
            "instanceRoot":                   DEFAULT,
            "animatedInstanceRoot":           DEFAULT
        },
        "SVGViewElement": {
            "viewTarget":                     DEFAULT
        },
        "SVGElement": {
            "blur":                           FUNCTION,
            "focus":                          FUNCTION,
            "getBBox":                        FUNCTION,
            "ownerSVGElement":                SKIP_OPAQUE,
            "onabort":                        EVENT,
            "onblur":                         EVENT,
            "oncancel":                       EVENT,
            "oncanplay":                      EVENT,
            "oncanplaythrough":               EVENT,
            "onchange":                       EVENT,
            "onclick":                        EVENT,
            "onclose":                        EVENT,
            "oncontextmenu":                  EVENT,
            "oncuechange":                    EVENT,
            "ondblclick":                     EVENT,
            "ondrag":                         EVENT,
            "ondragend":                      EVENT,
            "ondragenter":                    EVENT,
            "ondragleave":                    EVENT,
            "ondragover":                     EVENT,
            "ondragstart":                    EVENT,
            "ondrop":                         EVENT,
            "ondurationchange":               EVENT,
            "onemptied":                      EVENT,
            "onended":                        EVENT,
            "onerror":                        EVENT,
            "onfocus":                        EVENT,
            "oninput":                        EVENT,
            "oninvalid":                      EVENT,
            "onkeydown":                      EVENT,
            "onkeypress":                     EVENT,
            "onkeyup":                        EVENT,
            "onload":                         EVENT,
            "onloadeddata":                   EVENT,
            "onloadedmetadata":               EVENT,
            "onloadstart":                    EVENT,
            "onmousedown":                    EVENT,
            "onmouseenter":                   EVENT,
            "onmouseleave":                   EVENT,
            "onmousemove":                    EVENT,
            "onmouseout":                     EVENT,
            "onmouseover":                    EVENT,
            "onmouseup":                      EVENT,
            "onmousewheel":                   EVENT,
            "onpause":                        EVENT,
            "onplay":                         EVENT,
            "onplaying":                      EVENT,
            "onprogress":                     EVENT,
            "onratechange":                   EVENT,
            "onreset":                        EVENT,
            "onresize":                       EVENT,
            "onscroll":                       EVENT,
            "onseeked":                       EVENT,
            "onseeking":                      EVENT,
            "onselect":                       EVENT,
            "onshow":                         EVENT,
            "onstalled":                      EVENT,
            "onsubmit":                       EVENT,
            "onsuspend":                      EVENT,
            "ontimeupdate":                   EVENT,
            "ontoggle":                       EVENT,
            "ontouchcancel":                  EVENT,
            "ontouchend":                     EVENT,
            "ontouchmove":                    EVENT,
            "ontouchstart":                   EVENT,
            "onvolumechange":                 EVENT,
            "onwaiting":                      EVENT,
            "style":                          DEFAULT,
            "tabIndex":                       DEFAULT,
            "viewportElement":                SKIP_OPAQUE
        },
        "Element": {
            "animate":                        FUNCTION,
            "attributes":                     DEFAULT,
            "children":                       DEFAULT,
            "classList":                      DEFAULT,
            "className":                      DEFAULT,
            "clientHeight":                   DEFAULT,
            "clientLeft":                     DEFAULT,
            "clientTop":                      DEFAULT,
            "clientWidth":                    DEFAULT,
            "closest":                        FUNCTION,
            "getAttribute":                   FUNCTION,
            "getAttributeNS":                 FUNCTION,
            "getAttributeNode":               FUNCTION,
            "getAttributeNodeNS":             FUNCTION,
            "getBoundingClientRect":          FUNCTION,
            "getClientRects":                 FUNCTION,
            "getDestinationInsertionPoints":  FUNCTION,
            "getElementsByClassName":         FUNCTION,
            "getElementsByTagName":           FUNCTION,
            "getElementsByTagNameNS":         FUNCTION,
            "hasAttribute":                   FUNCTION,
            "hasAttributeNS":                 FUNCTION,
            "hasAttributes":                  FUNCTION,
            "id":                             DEFAULT,
            "innerHTML":                      DEFAULT,
            "insertAdjacentElement":          FUNCTION,
            "insertAdjacentHTML":             FUNCTION,
            "insertAdjacentText":             FUNCTION,
            "localName":                      DEFAULT,
            "matches":                        FUNCTION,
            "namespaceURI":                   DEFAULT,
            "nextElementSibling":             SKIP_OPAQUE,
            "onbeforecopy":                   EVENT,
            "onbeforecut":                    EVENT,
            "onbeforepaste":                  EVENT,
            "oncopy":                         EVENT,
            "oncut":                          EVENT,
            "onpaste":                        EVENT,
            "onsearch":                       EVENT,
            "onselectstart":                  EVENT,
            "onwebkitfullscreenchange":       EVENT,
            "onwebkitfullscreenerror":        EVENT,
            "onwheel":                        EVENT,
            "outerHTML":                      DEFAULT,
            "prefix":                         DEFAULT,
            "previousElementSibling":         SKIP_OPAQUE,
            "querySelector":                  FUNCTION,
            "querySelectorAll":               FUNCTION,
            "remove":                         FUNCTION,
            "removeAttribute":                FUNCTION,
            "removeAttributeNS":              FUNCTION,
            "removeAttributeNode":            FUNCTION,
            "requestPointerLock":             FUNCTION,
            "scrollHeight":                   DEFAULT,
            "scrollIntoView":                 FUNCTION,
            "scrollIntoViewIfNeeded":         FUNCTION,
            "scrollLeft":                     DEFAULT,
            "scrollTop":                      DEFAULT,
            "scrollWidth":                    DEFAULT,
            "setAttribute":                   FUNCTION,
            "setAttributeNS":                 FUNCTION,
            "setAttributeNode":               FUNCTION,
            "setAttributeNodeNS":             FUNCTION,
            "tagName":                        DEFAULT
        },
        "CharacterData": {
            "after":                          FUNCTION,
            "appendData":                     FUNCTION,
            "before":                         FUNCTION,
            "data":                           DEFAULT,
            "deleteData":                     FUNCTION,
            "insertData":                     FUNCTION,
            "length":                         DEFAULT,
            "nextElementSibling":             SKIP_OPAQUE,
            "previousElementSibling":         SKIP_OPAQUE,
            "remove":                         FUNCTION,
            "replaceData":                    FUNCTION,
            "replaceWith":                    FUNCTION,
            "substringData":                  FUNCTION
        },
        "Text": {
            "assignedSlot":                   DEFAULT,
            "isElementContentWhitespace":     DEFAULT,
            "replaceWholeText":               FUNCTION,
            "splitText":                      FUNCTION,
            "wholeText":                      DEFAULT
        },
        "Attr": {
            "name":                           DEFAULT,
            "namespaceURI":                   DEFAULT,
            "localName":                      DEFAULT,
            "prefix":                         DEFAULT,
            "ownerElement":                   DEFAULT,
            "specified":                      DEFAULT,
            "value":                          DEFAULT
        },
        "Node": metadata$4,
        "EventTarget": metadata$5
    }
};

SecureElement.isSharedElement = function(el) {
    return el === document.body ||
        el === document.head ||
        el === document.documentElement;
};

SecureElement.secureQuerySelector = function(el, key, selector) {
    var rawAll = el.querySelectorAll(selector);
    for (var n = 0; n < rawAll.length; n++) {
        var raw = rawAll[n];
        var rawKey = getKey(raw);
        if (rawKey === key || SecureElement.isSharedElement(raw)) {
            return SecureElement(raw, key);
        }
    }

    return null;
};

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

function SecureCanvasRenderingContext2D(ctx, key) {

    var o = getFromCache(ctx, key);
    if (o) {
        return o;
    }
    o = Object.create(null, {
        toString: {
            value: function() {
                return "SecureCanvasRenderingContext2D: " + ctx + "{ key: " + JSON.stringify(key) + " }";
            }
        }
    });

    SecureObject.addPrototypeMethodsAndProperties(metadata$$1, o, ctx, key);

    setRef(o, ctx, key);
    addToCache(ctx, o, key);
    registerProxy(o);

    return o;
}

const metadata$$1 = {
    "prototypes": {
        "CanvasRenderingContext2D" : {
            "addHitRegion" :            FUNCTION,
            "arc" :                     FUNCTION,
            "arcTo" :                   FUNCTION,
            "beginPath" :               FUNCTION,
            "bezierCurveTo" :           FUNCTION,
            "canvas" :                  READ_ONLY_PROPERTY,
            "clearHitRegions" :         FUNCTION,
            "clearRect" :               FUNCTION,
            "clip" :                    FUNCTION,
            "closePath" :               FUNCTION,
            "createImageData" :         FUNCTION,
            "createLinearGradient" :    FUNCTION,
            "createPattern":            FUNCTION_RAW_ARGS,
            "createRadialGradient" :    FUNCTION,
            "currentTransform" :        RAW,
            "direction" :               DEFAULT,
            "drawFocusIfNeeded" :       FUNCTION_RAW_ARGS,
            "drawImage" :               FUNCTION_RAW_ARGS,
            "ellipse" :                 FUNCTION,
            "fill" :                    FUNCTION_RAW_ARGS,
            "fillRect" :                FUNCTION,
            "fillStyle":                DEFAULT,
            "fillText" :                FUNCTION,
            "font" :                    DEFAULT,
            "getImageData" :            FUNCTION,
            "getLineDash" :             FUNCTION,
            "globalAlpha" :             DEFAULT,
            "globalCompositeOperation": DEFAULT,
            "imageSmoothingEnabled" :   DEFAULT,
            "isPointInPath" :           FUNCTION,
            "isPointInStroke" :         FUNCTION,
            "lineCap" :                 DEFAULT,
            "lineDashOffset" :          DEFAULT,
            "lineJoin":                 DEFAULT,
            "lineTo" :                  FUNCTION,
            "lineWidth" :               DEFAULT,
            "measureText" :             FUNCTION,
            "miterLimit" :              DEFAULT,
            "moveTo" :                  FUNCTION,
            "putImageData" :            FUNCTION_RAW_ARGS,
            "quadraticCurveTo" :        FUNCTION,
            "rect" :                    FUNCTION,
            "removeHitRegion" :         FUNCTION,
            "restore" :                 FUNCTION,
            "resetTransform" :          FUNCTION,
            "rotate" :                  FUNCTION,
            "save" :                    FUNCTION,
            "scale" :                   FUNCTION,
            "setLineDash" :             FUNCTION,
            "setTransform" :            FUNCTION,
            "scrollPathIntoView" :      FUNCTION_RAW_ARGS,
            "strokeRect" :              FUNCTION,
            "strokeStyle":              DEFAULT,
            "strokeText" :              FUNCTION,
            "shadowBlur" :              DEFAULT,
            "shadowColor" :             DEFAULT,
            "shadowOffsetX" :           DEFAULT,
            "shadowOffsetY" :           DEFAULT,
            "stroke" :                  FUNCTION_RAW_ARGS,
            "textAlign" :               DEFAULT,
            "textBaseline" :            DEFAULT,
            "translate" :               FUNCTION,
            "transform" :               FUNCTION
        }
    }
};

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
function assert(condition) {
    if (!condition) {
        throw new Error();
    }
}

// TODO: remove these functions. Our filtering mechanism should not
// rely on the more expensive operation.

function isObjectObject(value) {
    return (typeof value === 'object' && value !== null) &&
      objectToString.call(value) === '[object Object]';
}

// https://github.com/jonschlinkert/is-plain-object
// Copyright © 2017, Jon Schlinkert. Released under the MIT License.
function isPlainObject(value) {

    if (isObjectObject(value) === false) {
        return false;
    }

    // If has modified constructor
    const ctor = value.constructor;
    if (typeof ctor !== 'function') {
        return false;
    }

    try {
        // If has modified prototype
        const proto = ctor.prototype;
        if (isObjectObject(proto) === false) {
            return false;
        }
        // If constructor does not have an Object-specific method
        if (proto.hasOwnProperty('isPrototypeOf') === false) {
            return false;
        }
    } catch (e) { /* Assume is  object when throws */ }

    // Most likely a plain Object
    return true;
}

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

var extraFilter;
function injectExtraFilter(filter) {
    extraFilter = filter;
}

function SecureObject(thing, key) {

    var o = getFromCache(thing, key);
    if (o) {
        return o;
    }

    o = Object.create(null, {
        toString : {
            value: function() {
                return "SecureObject: " + thing + "{ key: " + JSON.stringify(key) + " }";
            }
        }
    });

    setRef(o, thing, key, true);
    addToCache(thing, o, key);
    registerProxy(o);

    return Object.seal(o);
}

var defaultSecureObjectKey = {
    defaultSecureObjectKey: true
};

SecureObject.getRaw = function(so) {
    var raw = getRef(so, getKey(so));

    if (!raw) {
        throw new Error("Blocked attempt to invoke secure method with altered this!");
    }

    return raw;
};

SecureObject.isDOMElementOrNode = function(el) {

    return typeof el === "object" &&
        ((typeof HTMLElement === "object" && el instanceof HTMLElement) || (typeof Node === "object" && el instanceof Node) || (typeof el.nodeType === "number" && typeof el.nodeName === "string"));
};

SecureObject.filterEverything = function(st, raw, options) {

    if (!raw) {
        // ignoring falsy, nully references.
        return raw;
    }

    var t = typeof raw;

    var key = getKey(st);
    var cached = getFromCache(raw, key);
    if (cached) {
        return cached;
    }

    // Handle already proxied things
    var rawKey = getKey(raw);
    var belongsToLocker = rawKey === key;
    var defaultKey = options && options.defaultKey ? options.defaultKey : defaultSecureObjectKey;

    if (isProxy(raw)) {
        // - If !belongsToLocker then this is a jump from one locker to another - we just need to unwrap and then reproxy based on the target locker's perspective
        // otherwise just return the proxy (do not proxy a proxy).
        // - Bypass unwrapping and refiltering for SecureFunction so arguments and 'this' are filtered against the
        // Locker where the function was originally defined.
        return belongsToLocker || isSecureFunction(raw) ? raw : SecureObject.filterEverything(st, getRef(raw, rawKey), options);
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
                if (isFilteringProxy(arg)) {
                    var unfilteredProxy = getRef(arg, getKey(arg));
                    var unfilteredKey = getKey(unfilteredProxy);
                    arg = unfilteredKey === getKey(raw) ? unfilteredProxy: SecureObject.filterEverything(st, arg);
                } else {
                    arg = SecureObject.filterEverything(st, arg);
                }
                filteredArgs[i] = arg;
            }

            var self = SecureObject.filterEverything(st, this);
            if (isFilteringProxy(self) && getKey(self) === getKey(st)) {
                self = getRef(self, key);
            }

            var fnReturnedValue = raw.apply(self, filteredArgs);

            return SecureObject.filterEverything(st, fnReturnedValue, options);
        };

        mutated = true;
        setRef(swallowed, raw, key);

        if (!rawKey) {
            setKey(raw, defaultKey);
        }

        registerProxy(swallowed);
        registerSecureFunction(swallowed);
    } else if (t === "object") {
        if (raw === window) {
            return getEnv$1(key);
        } else if (raw === document) {
            return getEnv$1(key).document;
        } else if (raw === location) {
            return getEnv$1(key).location;
        }

        var isNodeList = raw && (raw instanceof NodeList || raw instanceof HTMLCollection);
        if (Array.isArray(raw)) {
            if (!belongsToLocker) {
                if (!rawKey) {
                    // Array that was created in this locker or system mode but not yet keyed - key it now
                    setKey(raw, defaultKey);
                    return SecureObject.filterEverything(st, raw, options);
                } else {
                    swallowed = SecureObject.createProxyForArrayObjects(raw, key);
                    setRef(swallowed, raw, key);
                    addToCache(raw, swallowed, key);
                    mutated = true;
                }
            }
        } else if (isNodeList) {
            swallowed = SecureObject.createProxyForArrayLikeObjects(raw, key);
            setRef(swallowed, raw, key);
            mutated = true;
        } else {
            assert(key, "A secure object should always have a key.");
            if (extraFilter) {
                swallowed = extraFilter(raw, key, belongsToLocker);
            }
            if (swallowed) {
                mutated = raw !== swallowed;
            } else if (SecureObject.isDOMElementOrNode(raw)) {
                if (belongsToLocker || SecureElement.isSharedElement(raw)) {
                    swallowed = SecureElement(raw, key);
                } else if (!options) {
                    swallowed = SecureObject(raw, key);
                } else if (raw instanceof Attr && !rawKey) {
                    setKey(raw, defaultKey);
                    return SecureObject.filterEverything(st, raw, options);
                } else {
                    swallowed = options.defaultValue;
                    addToCache(raw, swallowed, key);
                }
                mutated = true;
            } else if (raw instanceof Event) {
                swallowed = SecureDOMEvent(raw, key);
                mutated = true;
            } else if (typeof raw["Window"] === "function" && raw instanceof raw["Window"]) {
                // Cross realm window instances (window.open() and iframe.contentWindow)
                swallowed = SecureIFrameElement.SecureIFrameContentWindow(raw, key);
                SecureObject.addMethodIfSupported(swallowed, raw, "close");
                SecureObject.addMethodIfSupported(swallowed, raw, "focus");
                SecureObject.addPropertyIfSupported(swallowed, raw, "opener");
                SecureObject.addPropertyIfSupported(swallowed, raw, "closed", { writable : false });

                mutated = true;
            } else if (raw instanceof CanvasRenderingContext2D) {
                swallowed = SecureCanvasRenderingContext2D(raw, key);
                mutated = true;
            } else if (SecureObject.isUnfilteredType(raw, key)) {
                // return raw for unfiltered types
                mutated = false;
            } else {
                if (!belongsToLocker) {
                    if (!rawKey) {
                        // Object that was created in this locker or in system mode and not yet keyed - key it now
                        setKey(raw, defaultKey);
                        return SecureObject.filterEverything(st, raw, options);
                    } else {
                        swallowed = SecureObject.createFilteringProxy(raw, key);
                        addToCache(raw, swallowed, key);
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
        if (isProxy(v)) {
            var key = getKey(v);
            var ref = getRef(v, key);
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
    if (options && options.unfilterEverything) {
        return options.unfilterEverything.call(st, args);
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
        var raw = getRef(target, getKey(target));
        var value = raw[property];

        return value ? SecureObject.filterEverything(target, value): value;
    };

    FilteringProxyHandler.prototype["set"] = function(target, property, value) {
        var raw = getRef(target, getKey(target));

        var filteredValue = value ? SecureObject.filterEverything(target, value): value;

        raw[property] = filteredValue;

        return true;
    };

    // These are all direct pass through methods to preserve the shape etc of the delegate

    FilteringProxyHandler.prototype["getPrototypeOf"] = function(target) {
        var raw = getRef(target, getKey(target));
        return Object.getPrototypeOf(raw);
    };

    FilteringProxyHandler.prototype["setPrototypeOf"] = function(target, prototype) {
        var raw = getRef(target, getKey(target));
        return Object.setPrototypeOf(raw, prototype);
    };

    FilteringProxyHandler.prototype["has"] = function(target, property) {
        var raw = getRef(target, getKey(target));
        return property in raw;
    };

    FilteringProxyHandler.prototype["defineProperty"] = function(target, property, descriptor) {
        var raw = getRef(target, getKey(target));
        Object.defineProperty(raw, property, descriptor);
        return true;
    };

    FilteringProxyHandler.prototype["deleteProperty"] = function(target, property) {
        var raw = getRef(target, getKey(target));
        delete target[property];
        delete raw[property];
        return true;
    };

    FilteringProxyHandler.prototype["ownKeys"] = function(target) {
        var raw = getRef(target, getKey(target));
        return Object.keys(raw);
    };

    FilteringProxyHandler.prototype["getOwnPropertyDescriptor"] = function(target, property) {
        var raw = getRef(target, getKey(target));
        var descriptor = Object.getOwnPropertyDescriptor(raw, property);

        // If the descriptor is for a non-configurable property we need to shadow it directly on the surrogate
        // to avoid proxy invariant violations
        if (descriptor && !descriptor.configurable && !Object.getOwnPropertyDescriptor(target, property)) {
            Object.defineProperty(target, property, descriptor);
        }

        return descriptor;
    };

    FilteringProxyHandler.prototype["isExtensible"] = function(target) {
        var raw = getRef(target, getKey(target));
        return Object.isExtensible(raw);
    };

    FilteringProxyHandler.prototype["preventExtensions"] = function(target) {
        var raw = getRef(target, getKey(target));
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
    setRef(surrogate, raw, key);

    var rawKey = getKey(raw);
    if (!rawKey) {
        // This is a newly created plain old js object - stamp it with the key
        setKey(raw, key);
    }

    var swallowed = new Proxy(surrogate, filteringProxyHandler);
    registerProxy(swallowed);

    // DCHASMAN TODO We should be able to remove this (replaced with ls.setKey()) in the next phase of proxy work where we remove unfilterEverything() as something that is done all the time
    setRef(swallowed, raw, key);

    addToCache(raw, swallowed, key);

    registerFilteringProxy(swallowed);

    return swallowed;
};

//We cache 1 array like thing proxy per key
var KEY_TO_ARRAY_LIKE_THING_HANDLER = typeof Map !== "undefined" ? new Map() : undefined;

function getFilteredArrayLikeThings(raw, key) {
    var filtered = [];

    for (var n = 0; n < raw.length; n++) {
        var value = raw[n];
        if (getKey(value) === key || SecureElement.isSharedElement(value)) {
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
                var raw = getRef(target, key);

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
                                                "value": value ? SecureObject.filterEverything(handler, value) : value,
                                                "done": false
                                            };
                                        } else {
                                            return {"done": true};
                                        }
                                    }
                                };
                            };
                            break;
                        default:
                            warn("Unsupported " + raw + " method: " + property + ". Returning undefined");
                            return undefined;
                    }
                } else {
                    ret = getFromFiltered(handler, filtered, property);
                }

                return ret;
            },
            "has": function(target, property) {
                var raw = getRef(target, key);
                var filtered = getFilteredArrayLikeThings(raw, key);
                return property in filtered;
            }
        };

        setKey(handler, key);

        KEY_TO_ARRAY_LIKE_THING_HANDLER.set(key, handler);

        Object.freeze(handler);
    }

    return handler;
}

SecureObject.createProxyForArrayLikeObjects = function(raw, key) {
    var surrogate = Object.create(Object.getPrototypeOf(raw));
    setRef(surrogate, raw, key);

    var proxy = new Proxy(surrogate, getArrayLikeThingProxyHandler(key));
    setKey(proxy, key);
    registerProxy(proxy);

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
        if (!value || // Array can contain undefined/null/false/0 such falsy values
            getKey(value) === key // Value has been keyed and belongs to this locker
        ) {
            validEntry = true;
        } else {
            var filteredValue = SecureObject.filterEverything(st, value, {defaultKey: key});
            if (filteredValue && !isOpaque(filteredValue)) {
                validEntry = true;
            }
        }
        if (validEntry) {
            // Store the raw index and value in an object
            filtered.push({"rawIndex": n, "rawValue": value});
        }
    }

    return filtered;
}

function getArrayProxyHandler(key) {
    function getFromFiltered(so, filtered, index) {
        // Numeric indexing into array
        var value = filtered[index] ? filtered[index]["rawValue"] : filtered[index];
        return value ? SecureObject.filterEverything(so, value) : value;
    }
    function getFilteredValues(so, filtered) { // Gather values from the filtered array
        var ret = [];
        filtered.forEach(function(item) {
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
                return getFromCache(target, key);
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
                                if (filtered.length > 0) {
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
                                if (arguments.length === 0) {
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
                                return getFromCache(raw, key);
                            };
                            break;
                        case "shift":
                            ret = function() {
                                if (filtered.length > 0) {
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
                                if (arguments.length > 0) {
                                    raw.sort(SecureObject.filterEverything(handler, compareFunction));
                                } else {
                                    raw.sort();
                                }
                                return getFromCache(raw, key);
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
                                    } else if (start >= filtered.length) { // If position is bigger than filtered's last index, insert at end of raw
                                        positionToInsert = raw.length;
                                    } else { // If start is a negative
                                        // If trying to insert at the beginning of filtered array
                                        if ((filtered.length + start) <= 0) {
                                            positionToInsert = filtered.length > 0 ? filtered[0]["rawIndex"] : raw.length;
                                        } else { // Else inserting in the middle of filtered array, get index of element in raw array
                                            positionToInsert = filtered[filtered.length + start]["rawIndex"];
                                        }
                                    }
                                }
                                // If there are items to be inserted
                                var newItems = [];
                                if (arguments.length > 2) {
                                    for (var j = 2; j < arguments.length ; j++) {
                                        newItems.push(SecureObject.filterEverything(handler, arguments[j]));
                                    }
                                }
                                if (newItems.length > 0) {
                                    raw.splice.apply(raw, [positionToInsert, 0].concat(newItems));
                                }
                                return getFilteredValues(handler, itemsToRemove);
                            };
                            break;
                        case "unshift":
                            ret = function() {
                                if (arguments.length === 0) {
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
                            ret = function() {
                                var nextIndex = 0;
                                return {
                                    next: function() {
                                        if (nextIndex < filtered.length) {
                                            var value = filtered[nextIndex]["rawValue"];
                                            nextIndex++;
                                            return {"value": value ? SecureObject.filterEverything(handler, value) : value, "done": false};
                                        } else {
                                            return {"done": true};
                                        }
                                    }
                                };
                            };
                            break;
                        case "Symbol(Symbol.isConcatSpreadable)":
                            ret = raw[Symbol.isConcatSpreadable];
                            break;
                        default:
                            if (raw[property]) { // If trying to use array like an associative array
                                ret = SecureObject.filterEverything(handler, raw[property]);
                            } else {
                                warn("Unsupported " + raw + " method: " + property + ". Returning undefined");
                                return undefined;
                            }
                    }
                } else {
                    ret = getFromFiltered(handler, filtered, property);
                }

                return ret;
            },
            "set": function(target, property, value) {
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
                        for (var i = 0; i < (property - filtered.length); i++) {
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
                        var rawValue = getRef(value, key);
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
            // Not handling "apply" and "construct" trap and letting the underlying raw handle apply and throw the error
        };

        setKey(handler, key);

        KEY_TO_ARRAY_HANLDER.set(key, handler);

        Object.freeze(handler);
    }

    return handler;
}

SecureObject.createProxyForArrayObjects = function(raw, key) {
    if (!Array.isArray(raw)) {
        warn("Illegal usage of SecureObject.createProxyForArrayObjects");
        return SecureObject.createFilteringProxy(raw, key);
    }
    // Not using a surrogate for array Proxy because we want to support for..in style of looping on arrays
    // Having a fake surrogate does not allow for correct looping. Mitigating this risk by handling all traps for Proxy.
    var proxy = new Proxy(raw, getArrayProxyHandler(key));
    setKey(proxy, key);
    registerProxy(proxy);

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
                var raw = getRef(target, key);

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
                                    warn(this + " does not allow getting/setting the " + attribute.name.toLowerCase() + " attribute, ignoring!");
                                    return undefined;
                                }
                                // it may not be possible to get here from another Locker so the access check may be unnecessary
                                // keep to error on the safe side
                                verifyAccess(attribute, target);
                                if (isProxy(attribute)) {
                                    attribute = getRef(attribute, key);
                                }
                                return SecureObject.filterEverything(handler, raw["setNamedItem"](attribute), { defaultKey: key });
                            };
                            break;
                        case "removeNamedItem":
                            ret = function(name) {
                                if (!SecureElement.isValidAttributeName(raw, name, prototype, caseInsensitiveAttributes)) {
                                    warn(this + " does not allow removing the " + name.toLowerCase() + " attribute, ignoring!");
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
                                    warn(this + " does not allow getting/setting the " + attribute.name.toLowerCase() + " attribute, ignoring!");
                                    return undefined;
                                }
                                verifyAccess(attribute, target);
                                if (isProxy(attribute)) {
                                    attribute = getRef(attribute, key);
                                }
                                return SecureObject.filterEverything(handler, raw["setNamedItemNS"](attribute), { defaultKey: key });
                            };
                            break;
                        case "removeNamedItemNS":
                            ret = function(namespace, localName) {
                                if (!SecureElement.isValidAttributeName(raw, name, prototype, caseInsensitiveAttributes)) {
                                    warn(this + " does not allow removing the " + name.toLowerCase() + " attribute, ignoring!");
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
                            ret = function() {
                                var nextIndex = 0;
                                return {
                                    next: function() {
                                        if (nextIndex < filtered.length) {
                                            var value = filtered[nextIndex];
                                            nextIndex++;
                                            return {"value": value ? SecureObject.filterEverything(handler, value) : value, "done": false};
                                        } else {
                                            return {"done": true};
                                        }
                                    }
                                };
                            };
                            break;
                        default:
                            warn("Unsupported " + raw + " method: " + property + ". Returning undefined");
                            return undefined;
                    }
                } else {
                    ret = getFromFiltered(handler, filtered, property);
                }

                return ret;
            },
            "has": function(target, property) {
                var raw = getRef(target, key);
                var filtered = getFilteredNamedNodeMap(handler, raw, key, prototype, caseInsensitiveAttributes);
                return property in filtered;
            }
        };

        setKey(handler, key);

        KEY_TO_NAMED_NODE_MAP_HANLDER.set(key, handler);

        Object.freeze(handler);
    }

    return handler;
}

SecureObject.createProxyForNamedNodeMap = function(raw, key, prototype, caseInsensitiveAttributes) {
    var surrogate = Object.create(Object.getPrototypeOf(raw));
    setRef(surrogate, raw, key);

    var proxy = new Proxy(surrogate, getNamedNodeMapProxyHandler(key, prototype, caseInsensitiveAttributes));
    setKey(proxy, key);
    registerProxy(proxy);

    return proxy;
};

SecureObject.createFilteredMethod = function(st, raw, methodName, options) {

    // Do not expose properties that the raw object does not actually support
    if (!(methodName in raw)) {
        if (options && options.ignoreNonexisting) {
            return undefined;
        } else {
            throw new error("Underlying raw object " + raw + " does not support method: " + methodName);
        }
    }

    return {
        enumerable: true,
        writable: true,
        value: function() {
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

    if (!prototype) {
        throw new Error("SecureObject.createFilteredMethodStateless() called without prototype");
    }

    return {
        enumerable: true,
        writable: true,
        value: function() {
            var st = this;
            var raw = SecureObject.getRaw(st);

            var filteredArgs = SecureObject.filterArguments(st, arguments, options);
            var fnReturnedValue = raw[methodName].apply(raw, filteredArgs);

            if (options) {
                if (options.afterCallback) {
                    fnReturnedValue = options.afterCallback.call(st, fnReturnedValue);
                }

                if (options.trustReturnValue) {
                    trust$1(st, fnReturnedValue);
                }
            }

            return SecureObject.filterEverything(st, fnReturnedValue, options);
        }
    };
};

SecureObject.createFilteredProperty = function(st, raw, propertyName, options) {

    // Do not expose properties that the raw object does not actually support.
    if (!(propertyName in raw)) {
        if (options && options.ignoreNonexisting) {
            return undefined;
        } else {
            throw new error("Underlying raw object " + raw + " does not support property: " + propertyName);
        }
    }

    var descriptor = {
        enumerable: true
    };

    descriptor.get = function() {
        var value = raw[propertyName];

        // Continue from the current object until we find an acessible object.
        if (options && options.skipOpaque === true) {
            while (value) {
                var hasAccess$$1 = hasAccess(st, value);
                if (hasAccess$$1 || SecureElement.isSharedElement(value)) {
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

    if (!prototype) {
        throw new Error("SecureObject.createFilteredPropertyStateless() called without prototype");
    }

    var descriptor = {
        enumerable: true
    };

    descriptor.get = function() {
        var st = this;
        var raw = SecureObject.getRaw(st);

        var value = raw[propertyName];

        // Continue from the current object until we find an acessible object.
        if (options && options.skipOpaque === true) {
            while (value) {
                var hasAccess$$1 = hasAccess(st, value);
                if (hasAccess$$1 || value === document.body || value === document.head || value === document.documentElement || value === document) {
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
            var key = getKey(st);
            var raw = getRef(st, key);

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
            } else if (o instanceof HTMLScriptElement) {
                interfaces.push("HTMLScriptElement");
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
    } else if (o instanceof CanvasRenderingContext2D) {
        interfaces.push("CanvasRenderingContext2D");
    } else if (typeof RTCPeerConnection !== "undefined" && o instanceof RTCPeerConnection) {
        interfaces.push("RTCPeerConnection");
    }

    return interfaces;
}

SecureObject.addPrototypeMethodsAndProperties = function(metadata$$1, so, raw, key) {
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
                    set: function(value) {
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
                            trust$1(so, result);

                            return SecureObject.filterEverything(so, result);
                        };
                    },
                    set: function(value) {
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

    var prototypes = metadata$$1["prototypes"];
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
                set: function(value) {
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
                        trust$1(so, result);

                        return SecureObject.filterEverything(so, result);
                    };
                },
                set: function(value) {
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
                    var key = getKey(raw);
                    // Shared elements like <body> and <head> are not tied to specific namespaces.
                    // Every namespace has a secure wrapper for these elements
                    if (!key && SecureElement.isSharedElement(raw)) {
                        // Obtain the key of the secure wrapper
                        key = getKey(this);
                    }
                    var o = getFromCache(raw, key);

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

SecureObject.addPrototypeMethodsAndPropertiesStateless = function(metadata$$1, prototypicalInstance, prototypeForValidation) {
    var rawPrototypicalInstance = SecureObject.getRaw(prototypicalInstance);
    var prototype;
    var config = {};

    var supportedInterfaces = getSupportedInterfaces(rawPrototypicalInstance);

    var prototypes = metadata$$1["prototypes"];
    supportedInterfaces.forEach(function(name) {
        prototype = prototypes[name];
        for (var property in prototype) {
            addPrototypeMethodsAndPropertiesStatelessHelper(property, prototype, prototypicalInstance, prototypeForValidation, rawPrototypicalInstance, config);
        }
    });

    return config;
};

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
        "DOMTokenList",
        "ArrayBuffer"
    ];
    unfilteredTypesMeta.forEach(function(unfilteredType) {
        if (typeof window[unfilteredType] !== "undefined") {
            ret.push(window[unfilteredType]);
        }
    });
    return ret;
}
var unfilteredTypes = getUnfilteredTypes();

SecureObject.isUnfilteredType = function(raw, key) {
    for (var n = 0; n < unfilteredTypes.length; n++) {
        if (raw instanceof unfilteredTypes[n]) {
            return true;
        }
    }

    var namespace = key["namespace"];
    // Special previlege for RTC, TODO:RJ remove it once we have SecureMediaStream
    if ((namespace === "runtime_rtc_spark" || namespace === "runtime_rtc")
        && window["MediaStream"] && (raw instanceof window["MediaStream"])) {
        return true;
    }
    // Do not filter ArrayBufferView types. https://developer.mozilla.org/en-US/docs/Web/API/ArrayBufferView
    if (raw && (raw.buffer instanceof ArrayBuffer) && raw.byteLength !== undefined) {
        return true;
    }

    return false;
};

//FIXME(tbliss): remove this once the necessary APIs become standard and can be exposed to everyone
SecureObject.addRTCMediaApis = function(st, raw, name, key) {
    if (raw[name]) {
      var namespace = key["namespace"];
        var config = {
                enumerable: true,
                value: (namespace === "runtime_rtc_spark" || namespace === "runtime_rtc") ? raw[name] : undefined,
                writable: true
        };
        Object.defineProperty(st, name, config);
    }
};

SecureObject.FunctionPrototypeBind = Function.prototype.bind;
SecureObject.ArrayPrototypeSlice = Array.prototype.slice;

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

function SecureRTCPeerConnection(raw, key) {
        var SecureConstructor = function(configuration) {
        var rtc = new raw(configuration);
        var o = Object.create(null, {
            toString: {
                value: function() {
                    return "SecureRTCPeerConnection: " + rtc + "{ key: " + JSON.stringify(key) + " }";
                }
            }
        });
        setRef(o, rtc, key);
        // Reference to the original event target functions
        var originalAddEventListener = rtc["addEventListener"];
        var originalDispatchEvent = rtc["dispatchEvent"];
        var originalRemoveEventListener = rtc["removeEventListener"];
        var options = { rawArguments: true };
        // Override the event target functions to handled wrapped arguments
        Object.defineProperties(rtc, {
            "addEventListener" : {
                writable : true,
                value : function(event, callback, useCapture) {
                    if (!callback) {
                        return;
                    }
                    var sCallback = getFromCache(callback, key);
                    if (!sCallback) {
                        sCallback = function(e) {
                            verifyAccess(o, callback, true);
                            var se = SecureDOMEvent(e, key);
                            callback.call(o, se);
                        };
                        addToCache(callback, sCallback, key);
                        setKey(callback, key);
                    }
                    originalAddEventListener.call(rtc, event, sCallback, useCapture);
                }
            },
            "dispatchEvent" : {
                enumerable : true,
                writable : true,
                value : function() {
                    var filteredArgs = SecureObject.filterArguments(o, arguments, options);
                    var fnReturnedValue = originalDispatchEvent.apply(rtc, filteredArgs);
                    if (options && options.afterCallback) {
                        fnReturnedValue = options.afterCallback(fnReturnedValue);
                    }
                    return SecureObject.filterEverything(o, fnReturnedValue, options);
                }
            },
            "removeEventListener" : {
                writable : true,
                value : function(type, listener, removeOption) {
                    var sCallback = getFromCache(listener, key);
                    originalRemoveEventListener.call(rtc, type, sCallback, removeOption);
                }
            }
        });
        return rtc;
    };
    SecureConstructor.prototype = raw.prototype;
    return SecureConstructor;
}

// TODO: unused

/*
 * Copyright (C) 2013 salesforce.com, inc.
 *
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *         http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

function SecureEngine(engine) {

    const o = Object.create(null, {
        'Element': {
            enumerable: true,
            value: engine['Element']
        },
        toString: {
            value: function() {
                return 'SecureEngine';
            }
        }
    });
    Object.freeze(o);
    return o;
}

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

function SecureAura(AuraInstance, key) {

    var o = getFromCache(AuraInstance, key);
    if (o) {
        return o;
    }

    /*
     * Deep traverse an object and unfilter any Locker proxies. Isolate this logic here for the component
     * creation APIs rather than a more general solution to avoid overly aggressive unfiltering that may open
     * new security holes.
     */
    function deepUnfilterArgs(baseObject, members) {
        var value;
        for (var property in members) {
            value = members[property];
            if (value !== undefined && value !== null) {
                if (Array.isArray(value) || isPlainObject(value)) {
                    var branchValue = baseObject[property];
                    baseObject[property] = deepUnfilterArgs(branchValue, value);
                    continue;
                }
            }
            if (isProxy(value)) {
                value = getRef(value, key);
            }
            baseObject[property] = value;
        }
        return baseObject;
    }

    var su = Object.create(null);
    var sls = Object.create(null);
    o = Object.create(null, {
        "util" : {
            writable : true,
            enumerable : true,
            value : su
        },
        "localizationService" : {
            writable : true,
            enumerable : true,
            value : sls
        },
        "getCallback" : {
            value : function(f) {
                // If the results of $A.getCallback() is wired up to an event handler, passed as an attribute or aura event attribute etc it will get
                // filtered and wrapped with the caller's perspective at that time.
                return AuraInstance.getCallback(f);
            }
        },
        toString : {
            value : function() {
                return "SecureAura: " + AuraInstance + "{ key: " + JSON.stringify(key) + " }";
            }
        },

        "createComponent" : {
            enumerable : true,
            writable : true,
            value : function(type, attributes, callback) {
                // copy attributes before modifying so caller does not see unfiltered results
                var attributesCopy = AuraInstance.util.apply({}, attributes, true, true);
                var filteredArgs = attributes && AuraInstance.util.isObject(attributes) ? deepUnfilterArgs(attributesCopy, attributes) : attributes;
                var fnReturnedValue = AuraInstance.createComponent(type, filteredArgs, SecureObject.filterEverything(o, callback));
                return SecureObject.filterEverything(o, fnReturnedValue);
            }
        },

        "createComponents" : {
            enumerable : true,
            writable : true,
            value : function(components, callback) {
                var filteredComponents = [];
                if (Array.isArray(components)) {
                    for (var i = 0; i < components.length; i++) {
                        var filteredComponent = [];
                        filteredComponent[0] = components[i][0];
                        // copy attributes before modifying so caller does not see unfiltered results
                        var attributesCopy = AuraInstance.util.apply({}, components[i][1], true, true);
                        filteredComponent[1] = deepUnfilterArgs(attributesCopy, components[i][1]);
                        filteredComponents.push(filteredComponent);
                    }
                } else {
                    filteredComponents = components;
                }
                var fnReturnedValue = AuraInstance.createComponents(filteredComponents, SecureObject.filterEverything(o, callback));
                return SecureObject.filterEverything(o, fnReturnedValue);
            }
        }
    });

    // SecureAura methods and properties
    [ "enqueueAction" ].forEach(function(name) {
        Object.defineProperty(o, name, SecureObject.createFilteredMethod(o, AuraInstance, name, { rawArguments: true }));
    });

    [ "get", "getComponent", "getReference", "getRoot", "log", "reportError", "warning" ].forEach(function(name) {
        Object.defineProperty(o, name, SecureObject.createFilteredMethod(o, AuraInstance, name));
    });

    setRef(o, AuraInstance, key);
    Object.seal(o);

    // SecureUtil: creating a proxy for $A.util
    ["getBooleanValue", "isArray", "isEmpty", "isObject", "isUndefined", "isUndefinedOrNull"].forEach(function(name) {
        Object.defineProperty(su, name, SecureObject.createFilteredMethod(su, AuraInstance["util"], name));
    });
    // These methods in Util deal with raw objects like components, so mark them as such
    [ "addClass", "hasClass", "removeClass", "toggleClass" ].forEach(function(name) {
        Object.defineProperty(su, name, SecureObject.createFilteredMethod(su, AuraInstance["util"], name, { rawArguments: true }));
    });

    setRef(su, AuraInstance["util"], key);
    Object.seal(su);

    // SecureLocalizationService: creating a proxy for $A.localizationService
    [ "displayDuration", "displayDurationInDays", "displayDurationInHours", "displayDurationInMilliseconds", "displayDurationInMinutes",
        "displayDurationInMonths", "displayDurationInSeconds", "duration", "endOf", "formatCurrency", "formatDate", "formatDateTime", "formatDateTimeUTC",
        "formatDateUTC", "formatNumber", "formatPercent", "formatTime", "formatTimeUTC", "getDateStringBasedOnTimezone", "getDaysInDuration",
        "getDefaultCurrencyFormat", "getDefaultNumberFormat", "getDefaultPercentFormat", "getHoursInDuration", "getLocalizedDateTimeLabels",
        "getMillisecondsInDuration", "getMinutesInDuration", "getMonthsInDuration", "getNumberFormat", "getSecondsInDuration", "getToday",
        "getYearsInDuration", "isAfter", "isBefore", "isBetween", "isPeriodTimeView", "isSame", "parseDateTime", "parseDateTimeISO8601", "parseDateTimeUTC", "startOf",
        "toISOString", "translateFromLocalizedDigits", "translateFromOtherCalendar", "translateToLocalizedDigits", "translateToOtherCalendar",
        "UTCToWallTime", "WallTimeToUTC" ].forEach(function(name) {
            Object.defineProperty(sls, name, SecureObject.createFilteredMethod(sls, AuraInstance["localizationService"], name));
        });

    setRef(sls, AuraInstance["localizationService"], key);
    Object.seal(sls);

    addToCache(AuraInstance, o, key);
    registerProxy(o);

    return o;
}

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

function SecureAuraAction(action, key) {

    var o = getFromCache(action, key);
    if (o) {
        return o;
    }

    o = Object.create(null, {
        "toString": {
            value: function() {
                return "SecureAction: " + action + "{ key: " + JSON.stringify(key) + " }";
            }
        }
    });

    Object.defineProperties(o, {
        "getName": SecureObject.createFilteredMethod(o, action, "getName"),
        "setCallback": SecureObject.createFilteredMethod(o, action, "setCallback", { defaultKey: key }),
        "setParams": SecureObject.createFilteredMethod(o, action, "setParams", { defaultKey: key }),
        "setParam": SecureObject.createFilteredMethod(o, action, "setParam", { defaultKey: key }),
        "getParams": SecureObject.createFilteredMethod(o, action, "getParams"),
        "getParam": SecureObject.createFilteredMethod(o, action, "getParam"),
        "getCallback": SecureObject.createFilteredMethod(o, action, "getCallback"),
        "getState": SecureObject.createFilteredMethod(o, action, "getState"),
        "getReturnValue": SecureObject.createFilteredMethod(o, action, "getReturnValue", { defaultKey: key }),
        "getError": SecureObject.createFilteredMethod(o, action, "getError"),
        "isBackground": SecureObject.createFilteredMethod(o, action, "isBackground"),
        "setBackground": SecureObject.createFilteredMethod(o, action, "setBackground"),
        "setAbortable": SecureObject.createFilteredMethod(o, action, "setAbortable"),
        "setStorable": SecureObject.createFilteredMethod(o, action, "setStorable")
    });

    setRef(o, action, key);
    addToCache(action, o, key);
    registerProxy(o);

    return Object.seal(o);
}

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

function SecureAuraEvent(event, key) {

    var o = getFromCache(event, key);
    if (o) {
        return o;
    }

    /**
     * Traverse all entries in the baseObject to unwrap any secure wrappers and wrap any functions as
     * SecureFunction. This ensures any non-Lockerized handlers of the event do not choke on the secure
     * wrappers, but any callbacks back into the original Locker have their arguments properly filtered.
     */
    function deepUnfilterMethodArguments(baseObject, members) {
        var value;
        for (var property in members) {
            value = members[property];
            if (Array.isArray(value)) {
                value = deepUnfilterMethodArguments([], value);
            } else if (isPlainObject(value)) {
                value = deepUnfilterMethodArguments({}, value);
            } else if (typeof value !== "function") {
                if (value) {
                    var key = getKey(value);
                    if (key) {
                        value = getRef(value, key) || value;
                    }
                }
                //If value is a plain object, we need to deep unfilter
                if (isPlainObject(value)) {
                    value = deepUnfilterMethodArguments({}, value);
                }
            } else {
                value = SecureObject.filterEverything(o, value, { defaultKey: key });
            }
            baseObject[property] = value;
        }
        return baseObject;
    }

    o = Object.create(null, {
        toString: {
            value: function() {
                return "SecureAuraEvent: " + event + "{ key: " + JSON.stringify(key) + " }";
            }
        },
        "setParams": {
            writable: true,
            enumerable: true,
            value: function(config) {
                var unfiltered = deepUnfilterMethodArguments({}, config);
                event["setParams"](unfiltered);
                return o;
            }
        },
        "setParam": {
            writable: true,
            enumerable: true,
            value: function(property, value) {
                var unfiltered = deepUnfilterMethodArguments({}, {value: value}).value;
                event["setParam"](property, unfiltered);
            }
        }
    });

	[ "fire", "getName", "getParam", "getParams", "getPhase", "getSource", "pause", "preventDefault", "resume", "stopPropagation", "getType", "getEventType" ]
	.forEach(function(name) {
		Object.defineProperty(o, name, SecureObject.createFilteredMethod(o, event, name));
	});

    setRef(o, event, key);
    addToCache(event, o, key);
    registerProxy(o);

    return Object.seal(o);
}

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

let getPublicMethodNames;
let requireLocker;

function registerAuraAPI(api) {
    if (api) {
        getPublicMethodNames = api.getPublicMethodNames;
        requireLocker = api.requireLocker;
    }
}

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

function SecureAuraComponent(component, key) {

    var o = getFromCache(component, key);
    if (o) {
        return o;
    }

    // special methods that require some extra work
    o = Object.create(null, {
        "get": {
            writable: true,
            enumerable: true,
            value: function(name) {
                var path = name.split('.');
                // protection against `cmp.get('c')`
                if (typeof path[1] !== "string" || path[1] === "") {
                    throw new SyntaxError('Invalid key '+ name);
                }

                var value = component["get"](name);
                if (!value) {
                    return value;
                }

                if (path[0] === 'c') {
                    return SecureAuraAction(value, key);
                } else {
                    return SecureObject.filterEverything(o, value);
                }
            }
        },
        "getEvent": {
            writable: true,
            enumerable: true,
            value: function(name) {
                var event = component["getEvent"](name);
                if (!event) {
                    return event;
                }
                return SecureAuraEvent(event, key);
            }
        },
        toString: {
            value: function() {
                return "SecureComponent: " + component + "{ key: " + JSON.stringify(key) + " }";
            }
        }
    });

    Object.defineProperties(o, {
        // these four super* methods are exposed as a temporary solution until we figure how to re-arrange the render flow
        "superRender": SecureObject.createFilteredMethod(o, component, "superRender"),
        "superAfterRender": SecureObject.createFilteredMethod(o, component, "superAfterRender"),
        "superRerender": SecureObject.createFilteredMethod(o, component, "superRerender"),
        "superUnrender": SecureObject.createFilteredMethod(o, component, "superUnrender"),

        // component @platform methods
        "isValid": SecureObject.createFilteredMethod(o, component, "isValid"),
        "isInstanceOf": SecureObject.createFilteredMethod(o, component, "isInstanceOf"),
        "addEventHandler": SecureObject.createFilteredMethod(o, component, "addEventHandler", { rawArguments: true }),
        "addHandler": SecureObject.createFilteredMethod(o, component, "addHandler"),
        "addValueHandler": SecureObject.createFilteredMethod(o, component, "addValueHandler"),
        "addValueProvider": SecureObject.createFilteredMethod(o, component, "addValueProvider"),
        "destroy": SecureObject.createFilteredMethod(o, component, "destroy"),
        "isRendered": SecureObject.createFilteredMethod(o, component, "isRendered"),
        "getGlobalId": SecureObject.createFilteredMethod(o, component, "getGlobalId"),
        "getLocalId": SecureObject.createFilteredMethod(o, component, "getLocalId"),
        "getSuper": SecureObject.createFilteredMethod(o, component, "getSuper"),
        "getReference": SecureObject.createFilteredMethod(o, component, "getReference"),
        "getVersion": SecureObject.createFilteredMethod(o, component, "getVersion"),
        "clearReference": SecureObject.createFilteredMethod(o, component, "clearReference"),
        "autoDestroy": SecureObject.createFilteredMethod(o, component, "autoDestroy"),
        "isConcrete": SecureObject.createFilteredMethod(o, component, "isConcrete"),
        "getConcreteComponent": SecureObject.createFilteredMethod(o, component, "getConcreteComponent"),
        "find": SecureObject.createFilteredMethod(o, component, "find"),
        "set": SecureObject.createFilteredMethod(o, component, "set", { defaultKey: key, rawArguments: true }),
        "getElement": SecureObject.createFilteredMethod(o, component, "getElement"),
        "getElements": SecureObject.createFilteredMethod(o, component, "getElements"),
        "getName": SecureObject.createFilteredMethod(o, component, "getName"),
        "getType": SecureObject.createFilteredMethod(o, component, "getType"),
        "removeEventHandler": SecureObject.createFilteredMethod(o, component, "removeEventHandler")
    });

    // The shape of the component depends on the methods exposed in the definitions:
    var methodsNames = getPublicMethodNames(component);
    if (methodsNames && methodsNames.length) {
        methodsNames.forEach(function(methodName) {
            SecureObject.addMethodIfSupported(o, component, methodName, { defaultKey: key });
        });
    }

    setRef(o, component, key);
    addToCache(component, o, key); // backpointer
    registerProxy(o);

    return o;
}

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

function SecureAuraComponentRef(component, key) {

    var o = getFromCache(component, key);
    if (o) {
        return o;
    }

    o = Object.create(null, {
        toString: {
            value: function() {
                return "SecureComponentRef: " + component + "{ key: " + JSON.stringify(key) + " }";
            }
        }
    });
    Object.defineProperties(o, {
        "addValueHandler": SecureObject.createFilteredMethod(o, component, "addValueHandler"),
        "addValueProvider": SecureObject.createFilteredMethod(o, component, "addValueProvider"),
        "destroy": SecureObject.createFilteredMethod(o, component, "destroy"),
        "getGlobalId": SecureObject.createFilteredMethod(o, component, "getGlobalId"),
        "getLocalId": SecureObject.createFilteredMethod(o, component, "getLocalId"),
        "getEvent": SecureObject.createFilteredMethod(o, component, "getEvent"),
        "isInstanceOf": SecureObject.createFilteredMethod(o, component, "isInstanceOf"),
        "isRendered": SecureObject.createFilteredMethod(o, component, "isRendered"),
        "isValid": SecureObject.createFilteredMethod(o, component, "isValid"),
        "set": SecureObject.createFilteredMethod(o, component, "set", { defaultKey: key, rawArguments: true }),
        "get": {
            writable: true,
            enumerable: true,
            value: function(name) {
                // protection against anything other then `cmp.get('v.something')`
                if (typeof name !== "string" || name.length < 3 || (name.indexOf("v.") !== 0 && name.indexOf("e.") !== 0)) {
                    throw new SyntaxError('Invalid key '+ name);
                }

                return SecureObject.filterEverything(o, component["get"](name));
            }
        }
    });

    /**
     * Traverse all entries in the baseObject to unwrap any secure wrappers and wrap any functions as
     * SecureFunction. This ensures any non-Lockerized handlers of the event do not choke on the secure
     * wrappers, but any callbacks back into the original Locker have their arguments properly filtered.
     */
    function deepUnfilterMethodArguments(baseObject, members) {
        var value;
        for (var property in members) {
            value = members[property];
            if (Array.isArray(value)) {
                value = deepUnfilterMethodArguments([], value);
            } else if (isPlainObject(value)) {
                value = deepUnfilterMethodArguments({}, value);
            } else if (typeof value !== "function") {
                if (value) {
                    var key = getKey(value);
                    if (key) {
                        value = getRef(value, key) || value;
                    }
                }
                //If value is a plain object, we need to deep unfilter
                if (isPlainObject(value)) {
                    value = deepUnfilterMethodArguments({}, value);
                }
            } else {
                value = SecureObject.filterEverything(o, value, { defaultKey: key });
            }
            baseObject[property] = value;
        }
        return baseObject;
    }

    var methodsNames = getPublicMethodNames(component);
    if (methodsNames && methodsNames.length) {
        // If SecureAuraComponentRef is an unlockerized component, then let it
        // have access to raw arguments
        var methodOptions = {
            defaultKey: key,
            unfilterEverything: !requireLocker(component) ?
                function(args) { return deepUnfilterMethodArguments([], args); } :
                undefined
        };

        methodsNames.forEach(function (methodName) {
            SecureObject.addMethodIfSupported(o, component, methodName, methodOptions);
        });
    }

    // DCHASMAN TODO Workaround for ui:button redefining addHandler using aura:method!!!
    if (!("addHandler" in o)) {
        SecureObject.addMethodIfSupported(o, component, "addHandler", { rawArguments: true });
    }

    setRef(o, component, key);
    addToCache(component, o, key);
    registerProxy(o);

    return Object.seal(o);
}

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

function SecureAuraPropertyReferenceValue(prv, key) {

    var o = getFromCache(prv, key);
    if (o) {
        return o;
    }

    o = Object.create(null, {
        toString: {
            value: function() {
                return "SecurePropertyReferenceValue: " + prv + " { key: " + JSON.stringify(key) + " }";
            }
        }
    });

    setRef(o, prv, key);
    addToCache(prv, o, key);
    registerProxy(o);

    return Object.seal(o);
}

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

let AuraAction;
let AuraComponent;
let AuraEvent;
let AuraPropertyReferenceValue;

function registerTypes(types) {
    if (types) {
        AuraAction = types.Action;
        AuraComponent = types.Component;
        AuraEvent = types.Event;
        AuraPropertyReferenceValue = types.PropertyReferenceValue;
    }
}

/*
 * Copyright (C) 2017 salesforce.com, inc.
 *
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *         http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// AuraLocker is a facade for Locker. Its role is to:
// - implement methods not present on Locker (extends API).
// - decouple the Locker API from the Aura API.
let isLockerInitialized = false;

const namespaceToKey = new Map();
const engineToSecureEngine = new Map();

function create$$1(src, key, sourceURL) {
    return {
        globals: getEnv$1(key),
        returnValue: evaluate(src, key, sourceURL)
    };
}

function createForDef(src, def) {
    const defDescriptor = def.getDescriptor();
    const namespace = defDescriptor.getNamespace();
    const name = defDescriptor.getName();
    const sourceURL = 'components/' + namespace + '/' + name + '.js';
    const key = getKeyForNamespace(namespace);

    // Key this def so we can transfer the key to component instances
    setKey(def, key);

    return evaluate(src, key, sourceURL);
}

function createForModule(src, defDescriptor) {
    const namespace = defDescriptor.getNamespace();
    const name = defDescriptor.getName();
    const sourceURL = 'modules/' + namespace + '/' + name + '.js';
    const key = getKeyForNamespace(namespace);

    // Mute several globals for modules
    src = `
const {$A, aura, Sfdc, sforce} = {};
return (
${src}
)`;

    const returnValue = evaluate(src, key, sourceURL);
    // Key the sanitized definition so we can transfer the key to interop component instances
    setKey(returnValue, key);
    return returnValue;
}

function getEnv$$1(key) {
    return getEnv$1(key);
}

function getEnvForSecureObject(st) {
    const key = getKey(st);
    if (!key) {
        return undefined;
    }

    return getEnv$1(key);
}

function getKeyForNamespace(namespace) {
    let key = namespaceToKey.get(namespace);

    if (!key) {
        key = freeze({
            'namespace': namespace
        });

        namespaceToKey.set(namespace, key);
    }

    return key;
}

function getRaw(value) {
    if (value) {
        const key = getKey(value);
        if (key) {
            value = getRef(value, key) || value;
        }
    }
    return value;
}

function initialize(types, api) {
    if (isLockerInitialized) {
        return;
    }

    registerTypes(types);
    registerAuraAPI(api);
    registerReportAPI(api);
    injectExtraFilter(filterAuraTypes);
    injectExtraAddProperty(addAuraGlobals);

    isLockerInitialized = true;
}

function isEnabled() {
    return true;
}

// @deprecated
function instanceOf(value, type) {
    return value instanceof type;
}

function runScript(src, namespace) {
    const key = getKeyForNamespace(namespace);
    return evaluate(src, key);
}

function trust$$1(from, thing) {
    return trust$1(from, thing);
}

function unwrap$$1(from, st) {
    return unwrap$1(from, st);
}

function wrapComponent(component) {

    const key = getKey(component);
    if (!key) {
        return component;
    }

    if (typeof component !== 'object') {
        return component;
    }

    return requireLocker(component) ? SecureAuraComponent(component, key) : component;
}

function wrapComponentEvent(component, event) {

    // if the component is not secure, return the event.
    const key = getKey(component);
    if (!key) {
        return event;
    }

    if (typeof component !== 'object' || typeof event !== 'object') {
        return event;
    }

    return event instanceof AuraEvent ?
        SecureAuraEvent(event, key) :
        SecureDOMEvent(event, key);
}

function wrapEngine(engine, /* deprecated */ defDescriptor) {
    let secureEngine = engineToSecureEngine.get(engine);
    if (!secureEngine) {
        secureEngine = SecureEngine(engine);
        engineToSecureEngine.set(engine, secureEngine);
    }
    return secureEngine;
}

function filterAuraTypes(raw, key, belongsToLocker) {
    if (raw instanceof AuraAction) {
        return belongsToLocker ? SecureAuraAction(raw, key) : SecureObject(raw, key);
    } else if (raw instanceof AuraComponent) {
        return belongsToLocker ? SecureAuraComponent(raw, key) : SecureAuraComponentRef(raw, key);
    } else if (raw instanceof AuraEvent) {
        return SecureAuraEvent(raw, key);
    } else if (raw instanceof AuraPropertyReferenceValue) {
        return SecureAuraPropertyReferenceValue(raw, key);
    }
    return null;
}

function addAuraGlobals(sw, win, key) {

    defineProperty(sw, '$A', {
        enumerable: true,
        value: SecureAura(win['$A'], key)
    });

    // Salesforce API entry points (first phase) - W-3046191 is tracking adding a publish() API
    // enhancement where we will move these to their respective javascript/container architectures
    ['Sfdc', 'sforce'].forEach(name => SecureObject.addPropertyIfSupported(sw, win, name));

    // Add RTC related api only to specific namespaces
    addRTCPeerConnection(sw, win, key);
}

function addRTCPeerConnection(sw, win, key) {
    const namespace = key['namespace'];
    if (namespace === 'runtime_rtc_spark' || namespace === 'runtime_rtc') {
        ['RTCPeerConnection', 'webkitRTCPeerConnection'].forEach(name => {
            if (name in win) {
                defineProperty(sw, name, {
                    enumerable: true,
                    value: SecureRTCPeerConnection(win[name], key)
                });
            }
        });
    }
}

exports.create = create$$1;
exports.createForDef = createForDef;
exports.createForModule = createForModule;
exports.getEnv = getEnv$$1;
exports.getEnvForSecureObject = getEnvForSecureObject;
exports.getKeyForNamespace = getKeyForNamespace;
exports.getRaw = getRaw;
exports.initialize = initialize;
exports.isEnabled = isEnabled;
exports.instanceOf = instanceOf;
exports.runScript = runScript;
exports.trust = trust$$1;
exports.unwrap = unwrap$$1;
exports.wrapComponent = wrapComponent;
exports.wrapComponentEvent = wrapComponentEvent;
exports.wrapEngine = wrapEngine;

Object.defineProperty(exports, '__esModule', { value: true });

})));
