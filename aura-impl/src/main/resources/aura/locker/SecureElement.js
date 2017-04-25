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
            if (ls_hasAccess(st, child) || child.nodeType === Node.TEXT_NODE) {
                var childClone = child.cloneNode(false);
                parentClone.appendChild(childClone);
                ls_trust(st, childClone);
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
    var key = ls_getKey(from);
    if (key) {
        _trustChildNodes(node, key);
    }
}

function _trustChildNodes(node, key) {
    var children = node.childNodes;
    for (var i = 0; i < children.length; i++) {
        var child = children[i];
        ls_setKey(child, key);
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
    "use strict";

    var o = ls_getFromCache(el, key);
    if (o) {
        return o;
    }

    // A secure element can have multiple forms, this block allows us to apply
    // some polymorphic behavior to SecureElement depending on the tagName
    var tagName = el.tagName && el.tagName.toUpperCase();
    switch (tagName) {
        case "FRAME":
            throw new $A.auraError("The deprecated FRAME element is not supported in LockerService!");
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
                    return propertyIsSupported(target, property) ? target[property] : undefined;
                }

                // Expando - retrieve it from a private locker scoped object
                var raw = ls_getRef(target, key);
                var data = ls_getData(raw, key);
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
                var raw = ls_getRef(target, key);

                // SELECT elements allow options to be specified in array assignment style
                if( raw instanceof HTMLSelectElement && !isNaN(property)) {
                    var rawOption = ls_getRef(value, key);
                    raw[property] = rawOption;
                    return value;
                }

                var data = ls_getData(raw, key);
                if (!data) {
                    data = {};
                    ls_setData(raw, key, data);
                }

                data[property] = value;
                return true;
            },

            "has": function(target, property) {
                if (property in basePrototype) {
                    return true;
                }
                var raw = ls_getRef(target, key);
                var data = ls_getData(raw, key);
                return !!data && property in data;
            },

            "deleteProperty": function(target, property) {
                var raw = ls_getRef(target, key);
                var data = ls_getData(raw, key);
                if (data && property in data) {
                    return delete data[property];
                }
                return delete target[property];
            },

            "ownKeys": function(target) {
                var raw = ls_getRef(target, key);
                var data = ls_getData(raw, key);
                var keys = Object.keys(raw);
                if (data) {
                    keys = keys.concat(Object.keys(data));
                }
                return keys;
            },

            "getOwnPropertyDescriptor": function(target, property) {
                var desc = Object.getOwnPropertyDescriptor(target, property);
                if (!desc) {
                    var raw = ls_getRef(target, key);
                    var data = ls_getData(raw, key);
                    desc = Object.getOwnPropertyDescriptor(data,  property);
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

            return new SecureElementPrototype();
        })();

        SecureElement.addStandardMethodAndPropertyOverrides(prototype, caseInsensitiveAttributes, key);

        Object.defineProperties(prototype, {
            toString: {
                value: function() {
                    var e = SecureObject.getRaw(this);
                    return "SecureElement: " + e + "{ key: " + JSON.stringify(ls_getKey(this)) + " }";
                }
            }
        });

        var prototypicalInstance = Object.create(prototype);
        ls_setRef(prototypicalInstance, el, key);

        if (tagName === "IFRAME") {
            SecureIFrameElement.addMethodsAndProperties(prototype);
        }

        var tagNameSpecificConfig = SecureObject.addPrototypeMethodsAndPropertiesStateless(SecureElement.metadata, prototypicalInstance, prototype);

        // Conditionally add things that not all Node types support
        if ("attributes" in el) {
            tagNameSpecificConfig["attributes"] = SecureObject.createFilteredPropertyStateless("attributes", prototype, {
                writable : false,
                afterGetCallback : function(attributes) {
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
                        throw new $A.auraError("SecureElement.innerText cannot be used with " + raw.tagName + " elements!");
                    }

                    raw.innerText = value;

                    trustChildNodes(this, raw);
                }
            };
        }

        if ("innerHTML" in el) {
            tagNameSpecificConfig["innerHTML"] = {
                get : function() {
                    return cloneFiltered(SecureObject.getRaw(this), o).innerHTML;
                },
                set : function(value) {
                    var raw = SecureObject.getRaw(this);
                    // Do not allow innerHTML on shared elements (body/head)
                    if (SecureElement.isSharedElement(raw)) {
                        throw new $A.auraError("SecureElement.innerHTML cannot be used with " + raw.tagName + " elements!");
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

                    var fromKey = ls_getKey(raw);
                    if (fromKey) {
                        ls_setKey(newNode, fromKey);
                    }

                    return SecureElement(newNode, ls_getKey(this));
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
                    $A.lockerService.trust(this, newRow);
                    if (!tbodyExists) {
                        // a new tbody element has also been inserted, key that too.
                        var tbody = getFirstTBody(raw);
                        tbody && $A.lockerService.trust(this, tbody);
                    }
                    return SecureElement(newRow, ls_getKey(this));
                }
            };
        }

        SecureElement.createEventTargetMethodsStateless(tagNameSpecificConfig, prototype);

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
        ls_setRef(o, el, key);
        o = new Proxy(o, prototypeInfo.expandoCapturingHandler);
    }

    ls_setRef(o, el, key);
    ls_addToCache(el, o, key);
    ls_registerProxy(o);

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
    if(raw.tagName === "LABEL"  && name.toLowerCase() === "for"){
        return true;
    }

    return false;
};

SecureElement.addStandardMethodAndPropertyOverrides = function(prototype, caseInsensitiveAttributes, key) {
    Object.defineProperties(prototype, {
        appendChild : {
            writable: true,
            value : function(child) {
                if (!runIfRunnable(child)) {
                    var e = SecureObject.getRaw(this);
                    e.appendChild(ls_getRef(child, ls_getKey(this), true));
                }

                return child;
            }
        },

        replaceChild : {
            writable: true,
            value : function(newChild, oldChild) {
                if (!runIfRunnable(newChild)) {
                    var e = SecureObject.getRaw(this);
                    var k = ls_getKey(this);
                    e.replaceChild(ls_getRef(newChild, k, true), ls_getRef(oldChild, k, true));
                }

                return oldChild;
            }
        },

        insertBefore : {
            writable: true,
            value : function(newNode, referenceNode) {
                if (!runIfRunnable(newNode)) {
                    var e = SecureObject.getRaw(this);
                    var k = ls_getKey(this);
                    e.insertBefore(ls_getRef(newNode, k, true), referenceNode ? ls_getRef(referenceNode, k, true) : null);
                }

                return newNode;
            }
        },

        querySelector: {
            writable: true,
            value: function(selector) {
                var raw = SecureObject.getRaw(this);
                return SecureElement.secureQuerySelector(raw, ls_getKey(this), selector);
            }
        },

        insertAdjacentHTML: {
            writable: true,
            value: function(position, text) {
                var raw = SecureObject.getRaw(this);

                // Do not allow insertAdjacentHTML on shared elements (body/head)
                if (SecureElement.isSharedElement(raw)) {
                    throw new $A.auraError("SecureElement.insertAdjacentHTML cannot be used with " + raw.tagName + " elements!");
                }

                var parent;
                if (position === "afterbegin" || position === "beforeend") {
                    // We have access to el, nothing else to check.
                } else if (position === "beforebegin" || position === "afterend") {
                    // Prevent writing outside secure node.
                    parent = raw.parentNode;
                    ls_verifyAccess(this, parent, true);
                } else {
                    throw new $A.auraError("SecureElement.insertAdjacentHTML requires position 'beforeBegin', 'afterBegin', 'beforeEnd', or 'afterEnd'.");
                }

                raw.insertAdjacentHTML(position, DOMPurify["sanitize"](text, domPurifyConfig));

                trustChildNodes(this, parent || raw);
            }
        },

        removeChild : SecureObject.createFilteredMethodStateless("removeChild", prototype, {
            rawArguments: true,
            beforeCallback : function(child) {
                // Verify that the passed in child is not opaque!
                ls_verifyAccess(this, child, true);
            }
        }),

        cloneNode : {
            writable: true,
            value : function(deep) {
                function copyKeys(from, to) {
                    // Copy keys from the original to the cloned tree
                    var fromKey = ls_getKey(from);
                    if (fromKey) {
                        ls_setKey(to, fromKey);
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

                return SecureElement(root, ls_getKey(this));
            }
        },

        textContent : {
            get : function() {
                return cloneFiltered(SecureObject.getRaw(this), this).textContent;
            },
            set : function(value) {
                var raw = SecureObject.getRaw(this);
                if (SecureElement.isSharedElement(raw)) {
                    throw new $A.auraError("SecureElement.textContent cannot be used with " + raw.tagName + " elements!");
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
            if(nameProp){
                name = name[nameProp];
            }
            if (!SecureElement.isValidAttributeName(raw, name, prototype, caseInsensitiveAttributes)) {
                $A.warning(this + " does not allow getting/setting the " + name.toLowerCase() + " attribute, ignoring!");
                return invalidAttributeReturnValue;
            }

            args = SecureObject.filterArguments(this, args, { rawArguments: true });
            var ret = raw[methodName].apply(raw, args);
            return ret instanceof Node ? SecureElement(ret, key) : ret;
        }
    };
};

SecureElement.addEventTargetMethods = function(se, raw, key) {
    Object.defineProperties(se, {
        addEventListener : SecureElement.createAddEventListenerDescriptor(se, raw, key),
        dispatchEvent : SecureObject.createFilteredMethod(se, raw, "dispatchEvent", { rawArguments: true }),

        // removeEventListener() is special in that we do not want to
        // unfilter/unwrap the listener argument or it will not match what
        // was actually wired up originally
        removeEventListener : {
            writable : true,
            value : function(type, listener, options) {
                var sCallback = ls_getFromCache(listener, key);
                raw.removeEventListener(type, sCallback, options);
            }
        }
    });
};

SecureElement.createEventTargetMethodsStateless = function(config, prototype) {
    config["addEventListener"] = SecureElement.createAddEventListenerDescriptorStateless(prototype);

    config["dispatchEvent"] = SecureObject.createFilteredMethodStateless("dispatchEvent", prototype, { rawArguments: true });

    // removeEventListener() is special in that we do not want to
    // unfilter/unwrap the listener argument or it will not match what
    // was actually wired up originally
    config["removeEventListener"] = {
        value : function(type, listener, options) {
            var raw = SecureObject.getRaw(this);
            var sCallback = ls_getFromCache(listener, ls_getKey(this));
            raw.removeEventListener(type, sCallback, options);
        }
    };
};

SecureElement.createAddEventListenerDescriptor = function(st, el, key) {
    return {
        writable : true,
        value : function(event, callback, useCapture) {
            if (!callback) {
                return; // by spec, missing callback argument does not throw,
                // just ignores it.
            }

            var sCallback = ls_getFromCache(callback, key);
            if (!sCallback) {
                sCallback = function(e) {
                    ls_verifyAccess(st, callback, true);
                    var se = SecureDOMEvent(e, key);
                    callback.call(st, se);
                };

                // Back reference for removeEventListener() support
                ls_addToCache(callback, sCallback, key);
                ls_setKey(callback, key);
            }

            el.addEventListener(event, sCallback, useCapture);
        }
    };
};

SecureElement.createAddEventListenerDescriptorStateless = function() {
    return {
        value : function(event, callback, useCapture) {
            if (!callback) {
                return; // by spec, missing callback argument does not throw,
                // just ignores it.
            }

            var so = this;
            var el = SecureObject.getRaw(so);
            var key = ls_getKey(so);
            var sCallback = ls_getFromCache(callback, key);
            if (!sCallback) {
                sCallback = function(e) {
                    ls_verifyAccess(so, callback, true);
                    var se = SecureDOMEvent(e, key);
                    callback.call(so, se);
                };

                // Back reference for removeEventListener() support
                ls_addToCache(callback, sCallback, key);
                ls_setKey(callback, key);
            }

            el.addEventListener(event, sCallback, useCapture);
        }
    };
};

SecureElement.createAddEventListener = function(st, el, key) {
    return function(event, callback, useCapture) {
        if (!callback) {
            return; // by spec, missing callback argument does not throw, just
            // ignores it.
        }

        var sCallback = function(e) {
            var se = SecureDOMEvent(e, key);
            callback.call(st, se);
        };

        el.addEventListener(event, sCallback, useCapture);
    };
};

SecureElement.DEFAULT = {};
SecureElement.FUNCTION = { type: "function" };
SecureElement.FUNCTION_TRUST_RETURN_VALUE = { type: "function", trustReturnValue: true };
SecureElement.EVENT = { type: "@event" };
SecureElement.SKIP_OPAQUE = { skipOpaque : true};
SecureElement.FUNCTION_RAW_ARGS = { type: "function", rawArguments: true };

var DEFAULT = SecureElement.DEFAULT;
var FUNCTION = SecureElement.FUNCTION;
var FUNCTION_TRUST_RETURN_VALUE = SecureElement.FUNCTION_TRUST_RETURN_VALUE;
var EVENT = SecureElement.EVENT;
var SKIP_OPAQUE = SecureElement.SKIP_OPAQUE;
var FUNCTION_RAW_ARGS = SecureElement.FUNCTION_RAW_ARGS;

SecureElement.nodeMetadata = {
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

SecureElement.eventTargetMetadata = {
    "addEventListener":               FUNCTION,
    "dispatchEvent":                  FUNCTION,
    "removeEventListener":            FUNCTION
};

SecureElement.metadata = {
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
            "willValidate":                   DEFAULT
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
            "animationsPaused":				  FUNCTION,
            "checkIntersection":			  FUNCTION,
            "checkEnclosure":				  FUNCTION,
            "contentScriptType":			  DEFAULT,
            "contentStyleType":				  DEFAULT,
            "createSVGAngle":				  FUNCTION,
            "createSVGLength":				  FUNCTION,
            "createSVGMatrix":				  FUNCTION,
            "createSVGNumber":				  FUNCTION,
            "createSVGPoint":				  FUNCTION,
            "createSVGRect":				  FUNCTION,
            "createSVGTransform":			  FUNCTION,
            "createSVGTransformFromMatrix":	  FUNCTION,
            "currentScale":		  			  DEFAULT,
            "currentTranslate":		  		  DEFAULT,
            "currentView":		  			  DEFAULT,
            "forceRedraw":				      FUNCTION,
            "height":						  DEFAULT,
            "pauseAnimations":				  FUNCTION,
            "pixelUnitToMillimeterX":		  DEFAULT,
            "pixelUnitToMillimeterY":		  DEFAULT,
            "getCurrentTime":				  FUNCTION,
            "getEnclosureList":				  FUNCTION,
            "getElementById":				  FUNCTION,
            "getIntersectionList":			  FUNCTION,
            "screenPixelToMillimeterX":		  DEFAULT,
            "screenPixelToMillimeterY":		  DEFAULT,
            "setCurrentTime":				  FUNCTION,
            "suspendRedraw":				  FUNCTION,
            "unpauseAnimations":			  FUNCTION,
            "unsuspendRedraw":				  FUNCTION,
            "unsuspendRedrawAll":			  FUNCTION,
            "useCurrentView":		  		  DEFAULT,
            "viewport":						  DEFAULT,
            "width":						  DEFAULT,
            "x":							  DEFAULT,
            "y":							  DEFAULT
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
            "blur":							  FUNCTION,
            "focus":						  FUNCTION,
            "getBBox":						  FUNCTION,
            "ownerSVGElement":				  SKIP_OPAQUE,
            "onabort":                     	  EVENT,
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
            "style":						  DEFAULT,
            "tabIndex":						  DEFAULT,
            "viewportElement":				  SKIP_OPAQUE
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
        "Node": SecureElement.nodeMetadata,
        "EventTarget": SecureElement.eventTargetMetadata
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
        var rawKey = ls_getKey(raw);
        if (rawKey === key || SecureElement.isSharedElement(raw)) {
            return SecureElement(raw, key);
        }
    }

    return null;
};
