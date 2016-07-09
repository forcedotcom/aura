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

/*jslint sub: true*/

function SecureElement(el, key) {
    "use strict";

    function isSharedElement(element) {
        return element === document.body || element === document.head;
    }

    function runIfRunnable(st) {
        var isRunnable = st.$run;
        if (isRunnable) {
            // special case for SecureScriptElement to execute without
            // insertion.
            st.$run();
        }
        return isRunnable;
    }

    function trustNodes(node, children) {
        if (node) {
            $A.lockerService.trust(o, node);
        }

        for (var i = 0; i < children.length; i++) {
            var child = children[i];
            trustNodes(child, child.childNodes);
        }
    }

    var o = SecureObject.getCached(el, key);
    if (o) {
        return o;
    }

    // A secure element can have multiple forms, this block allows us to apply
    // some polymorphic behavior to SecureElement depending on the tagName
    var tagName = el.tagName && el.tagName.toUpperCase();
    switch (tagName) {
    case "FRAME":
        throw new $A.auraError("The deprecated FRAME element is not supported in LockerService!");

    case "IFRAME":
        o = SecureIFrameElement(el, key);
        break;

    case "SCRIPT":
        o = SecureScriptElement(key, el);
        break;
    }

    if (o) {
        SecureObject.addToCache(el, o, key);
        return o;
    }

    // SecureElement is it then!
    o = Object.create(null, {
        toString : {
            value : function() {
                return "SecureElement: " + el + "{ key: " + JSON.stringify(key) + " }";
            }
        },

        appendChild : {
            value : function(child) {
                $A.lockerService.util.verifyAccess(o, child, {
                    verifyNotOpaque : true
                });

                if (!runIfRunnable(child)) {
                    el.appendChild(getLockerSecret(child, "ref"));
                }

                return child;
            }
        },

        replaceChild : {
            value : function(newChild, oldChild) {
                $A.lockerService.util.verifyAccess(o, newChild, {
                    verifyNotOpaque : true
                });
                $A.lockerService.util.verifyAccess(o, oldChild, {
                    verifyNotOpaque : true
                });

                if (!runIfRunnable(newChild)) {
                    el.replaceChild(getLockerSecret(newChild, "ref"), getLockerSecret(oldChild, "ref"));
                }

                return oldChild;
            }
        },

        insertBefore : {
            value : function(newNode, referenceNode) {
                $A.lockerService.util.verifyAccess(o, newNode, {
                    verifyNotOpaque : true
                });

                if (referenceNode) {
                    $A.lockerService.util.verifyAccess(o, referenceNode, {
                        verifyNotOpaque : true
                    });
                }

                if (!runIfRunnable(newNode)) {
                    el.insertBefore(getLockerSecret(newNode, "ref"), referenceNode ? getLockerSecret(referenceNode, "ref") : null);
                }

                return newNode;
            }
        },
        querySelector: {
            value: function(selector) {
                return SecureElement.secureQuerySelector(o, el, key, selector);
            }
        },
        insertAdjacentHTML: {
            value: function(position, text) {

                // Do not allow insertAdjacentHTML on shared elements (body/head)
                if (isSharedElement(el)) {
                    throw new $A.auraError("SecureElement.insertAdjacentHTML cannot be used with " + el.tagName + " elements!");
                }
                var parent;
                if (position === "afterbegin" || position === "beforeend") {
                    // We have access to el, nothing else to check.
                } else if (position === "beforebegin" || position === "afterend") {
                    // Prevent writing outside secure node.
                    parent = el.parentNode;
                    $A.lockerService.util.verifyAccess(o, parent, {
                        verifyNotOpaque : true
                    });
                } else {
                    throw new $A.auraError("SecureElement.insertAdjacentHTML requires position 'beforeBegin', 'afterBegin', 'beforeEnd', or 'afterEnd'.");
                }

                // Allow SVG <use> element
                var config = {
                    "ADD_TAGS" : [ "use" ]
                };

                el.insertAdjacentHTML(position, DOMPurify["sanitize"](text, config));

                trustNodes(undefined, parent ? parent.childNodes : el.childNodes);
            }
        }
    });

    Object.defineProperties(o, {
        removeChild : SecureObject.createFilteredMethod(o, el, "removeChild", {
            beforeCallback : function(child) {
                // Verify that the passed in child is not opaque!
                $A.lockerService.util.verifyAccess(o, child, {
                    verifyNotOpaque : true
                });
            }
        }),

        cloneNode : {
            value : function(deep) {
                // We need to clone only nodes that can be accessed to and prune
                // the rest
                var root = el.cloneNode(false);

                function cloneChildren(parent, parentClone) {
                    var childNodes = parent.childNodes;
                    for (var i = 0; i < childNodes.length; i++) {
                        var child = childNodes[i];
                        if ($A.lockerService.util.hasAccess(o, child, {
                            verifyNotOpaque : true
                        })) {
                            var childClone = child.cloneNode(false);
                            parentClone.appendChild(childClone);
                            $A.lockerService.trust(o, childClone);
                            cloneChildren(child, childClone);
                        }
                    }
                }

                if (deep) {
                    cloneChildren(el, root);
                }

                return SecureElement(root, key);
            }
        },

        textContent : SecureObject.createFilteredProperty(o, el, "textContent", {
            afterGetCallback : function() {
                return getLockerSecret(o.cloneNode(true), "ref").textContent;
            },
            afterSetCallback : function() {
                trustNodes(undefined, el.childNodes);
            }
        })
    });

    // Conditionally add things that not all Node types support
    SecureObject.addPropertyIfSupported(o, el, "attributes", {
        writable : false,
        afterGetCallback : function(attributes) {
            // Secure attributes
            var secureAttributes = [];
            for (var i = 0; i < attributes.length; i++) {
                var attribute = attributes[i];
                secureAttributes.push({
                    name : attribute.name,
                    value : SecureObject.filterEverything(o, attribute.value)
                });
            }

            return secureAttributes;
        }
    });

    SecureObject.addPropertyIfSupported(o, el, "innerText", {
        afterGetCallback : function() {
            return getLockerSecret(o.cloneNode(true), "ref").innerText;
        },
        afterSetCallback : function() {
            trustNodes(undefined, el.childNodes);
        }
    });

    [ "childNodes", "children", "firstChild", "lastChild", "nodeName", "nodeType", "parentElement", "ownerDocument"].forEach(function(name) {
        SecureObject.addPropertyIfSupported(o, el, name, {
            filterOpaque : true
        });
    });

    [ "parentNode" ].forEach(function(name) {
        SecureObject.addPropertyIfSupported(o, el, name, {
            filterOpaque : true,
            defaultValue: null
        });
    });

    [ "compareDocumentPosition", "getElementsByClassName", "getElementsByTagName", "getElementsByTagNameNS", "querySelectorAll",
            "getBoundingClientRect", "getClientRects", "blur", "click", "focus",
            "getAttribute", "hasAttribute", "setAttribute", "removeAttribute", "getAttributeNS", "hasAttributeNS", "setAttributeNS", "removeAttributeNS" ].forEach(function(name) {
        SecureObject.addMethodIfSupported(o, el, name, {
            filterOpaque : true
        });
    });

    SecureObject.addPropertyIfSupported(o, el, "innerHTML", {
        afterGetCallback : function() {
            return getLockerSecret(o.cloneNode(true), "ref").innerHTML;
        },
        beforeSetCallback : function(value) {
            // Do not allow innerHTML on shared elements (body/head)
            if (isSharedElement(el)) {
                throw new $A.auraError("SecureElement.innerHTML cannot be used with " + el.tagName + " elements!");
            }

            // Allow SVG <use> element
            var config = {
                "ADD_TAGS" : [ "use" ]
            };

            return DOMPurify["sanitize"](value, config);
        },
        afterSetCallback : function() {
            trustNodes(undefined, el.childNodes);
        }
    });

    // applying standard secure element properties
    SecureElement.addSecureProperties(o, el);
    SecureElement.addSecureGlobalEventHandlers(o, el, key);
    SecureElement.addEventTargetMethods(o, el, key);

    SecureElement.addElementSpecificProperties(o, el);
    SecureElement.addElementSpecificMethods(o, el);

    setLockerSecret(o, "key", key);
    setLockerSecret(o, "ref", el);

    SecureObject.addToCache(el, o, key);

    return o;
}

SecureElement.addSecureProperties = function(se, raw) {
    [
    // Standard Element interface represents an object of a Document.
    // https://developer.mozilla.org/en-US/docs/Web/API/Element#Properties
    "childElementCount", "classList", "className", "id", "tagName", "namespaceURI",
            "scrollHeight", "scrollLeft", "scrollTop", "scrollWidth",

    // Note: ignoring "firstElementChild", "lastElementChild",
    // "nextElementSibling" and "previousElementSibling" from the list
    // above.

    // Standard HTMLElement interface represents any HTML element
    // https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement#Properties
    "accessKey", "accessKeyLabel", "contentEditable", "isContentEditable", "contextMenu", "dataset", "dir", "draggable", "dropzone", "hidden", "lang",
            "spellcheck", "style", "tabIndex", "title",
            "offsetHeight", "offsetLeft", "offsetParent", "offsetTop", "offsetWidth",
            "clientHeight", "clientLeft", "clientTop", "clientWidth",
            "nodeValue"

    // DCHASMAN TODO This list needs to be revisted as it is missing a ton of
    // valid attributes!
    ].forEach(function(name) {
        SecureObject.addPropertyIfSupported(se, raw, name, {
            filterOpaque : true
        });
    });
};

SecureElement.addSecureGlobalEventHandlers = function(se, raw, key) {
    [
    // Standard Global Event handlers
    // https://developer.mozilla.org/en-US/docs/Web/API/GlobalEventHandlers
    "onabort", "onblur", "onchange", "onclick", "onclose", "oncontextmenu", "ondblclick", "onerror", "onfocus", "oninput", "onkeydown", "onkeypress",
            "onkeyup", "onload", "onmousedown", "onmousemove", "onmouseout", "onmouseover", "onmouseup", "onreset", "onresize", "onscroll", "onselect",
            "onsubmit" ].forEach(function(name) {
        Object.defineProperty(se, name, {
            set : function(callback) {
                raw[name] = function(e) {
                    callback.call(se, SecureDOMEvent(e, key));
                };
            }
        });
    });
};

SecureElement.addEventTargetMethods = function(se, raw, key) {
    Object.defineProperties(se, {
        addEventListener : SecureElement.createAddEventListenerDescriptor(se, raw, key),
        dispatchEvent : SecureObject.createFilteredMethod(se, raw, "dispatchEvent"),

        // removeEventListener() is special in that we do not want to
        // unfilter/unwrap the listener argument or it will not match what
        // was actually wired up originally
        removeEventListener : {
            value : function(type, listener, options) {
                var sCallback = getLockerSecret(listener, "sCallback");
                raw.removeEventListener(type, sCallback, options);
            }
        }
    });
};

SecureElement.createAddEventListenerDescriptor = function(st, el, key) {
    return {
        value : function(event, callback, useCapture) {
            if (!callback) {
                return; // by spec, missing callback argument does not throw,
                // just ignores it.
            }

            var sCallback = getLockerSecret(callback, "sCallback");
            if (!sCallback) {
                sCallback = function(e) {
                    $A.lockerService.util.verifyAccess(st, callback, {
                        verifyNotOpaque : true
                    });

                    var se = SecureDOMEvent(e, key);
                    callback.call(st, se);
                };

                // Back reference for removeEventListener() support
                setLockerSecret(callback, "sCallback", sCallback);

                $A.lockerService.trust(st, callback);
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

SecureElement.addElementSpecificProperties = function(se, el) {
    var tagName = el.tagName && el.tagName.toUpperCase();
    if (tagName) {
        var whitelist = SecureElement.elementSpecificAttributeWhitelists[tagName];
        if (whitelist) {
            whitelist.forEach(function(name) {
                SecureObject.addPropertyIfSupported(se, el, $A.util.hyphensToCamelCase(name), {
                    filterOpaque : true
                });
            });
        }

        // Special handling for SVG elements
        if (el.namespaceURI === "http://www.w3.org/2000/svg") {
            SecureObject.addMethodIfSupported(se, el, "getBBox");
        }
    }
};

SecureElement.addElementSpecificMethods = function(se, el) {
    var tagName = el.tagName && el.tagName.toUpperCase();
    if (tagName) {
        var whitelist = SecureElement.elementSpecificMethodWhitelists[tagName];
        if (whitelist) {
            whitelist.forEach(function(name) {
                SecureObject.addMethodIfSupported(se, el, name, {
                    filterOpaque : true
                });
            });
        }
    }
};

SecureElement.secureQuerySelector = function(st, el, key, selector) {
    var rawAll = el.querySelectorAll(selector);
    for (var n = 0; n < rawAll.length; n++) {
        var raw = rawAll[n];
        var hasAccess = $A.lockerService.util.hasAccess(st, raw);
        if (hasAccess || raw === document.body || raw === document.head) {

            var cached = SecureObject.getCached(raw, key);
            if (cached) {
                return cached;
            }

            var swallowed = SecureElement(raw, key);
            SecureObject.addToCache(raw, swallowed, key);
            return swallowed;
        }
    }

    return null;
};

SecureElement.elementSpecificAttributeWhitelists = {
    "A" : [ "hash", "host", "hostname", "href", "origin", "pathname", "port", "protocol", "search" ],
    "AREA" : [ "alt", "coords", "download", "href", "hreflang", "media", "rel", "shape", "target", "type" ],
    "AUDIO" : [ "autoplay", "buffered", "controls", "loop", "muted", "played", "preload", "src", "volume" ],
    "BASE" : [ "href", "target" ],
    "BDO" : [ "dir" ],
    "BUTTON" : [ "autofocus", "disabled", "form", "formAction", "formEnctype", "formMethod", "formNoValidate", "formTarget", "name", "type" ],
    "CANVAS" : [ "height", "width" ],
    "COL" : [ "span" ],
    "COLGROUP" : [ "span", "width" ],
    "DATA" : [ "value" ],
    "DEL" : [ "cite", "dateTime" ],
    "DETAILS" : [ "open" ],
    "EMBED" : [ "height", "src", "type", "width" ],
    "FIELDSET" : [ "disabled", "form", "name" ],
    "FORM" : [ "acceptCharset", "action", "autocomplete", "enctype", "method", "name", "noValidate", "target" ],
    "IMG" : [ "alt", "crossOrigin", "height", "isMap", "longDesc", "sizes", "src", "srcset", "width", "useMap" ],
    "INPUT" : [ "type", "accept", "autocomplete", "autofocus", "autosave", "checked", "disabled", "files", "form", "formAction",
                "formEnctype", "formMethod", "formNoValidate", "formTarget", "height", "inputMode", "list", "max", "maxLength",
                "min", "minLength", "multiple", "name", "pattern", "placeholder", "readOnly", "required", "selectionDirection",
                "size", "src", "step", "value", "width" ],
    "INS" : [ "cite", "dateTime" ],
    "LABEL" : [ "accesKey", "htmlFor", "form" ],
    "LI" : [ "value" ],
    "LINK" : [ "crossOrigin", "href", "hreflang", "media", "rel", "sizes", "title", "type" ],
    "MAP" : [ "name" ],

    // DCHASMAN TODO Fix SecureElement.setAttribute() hole and whitelist values
    // for http-equiv/httpEquiv
    "META" : [ "content", "name" ],

    "METER" : [ "value", "min", "max", "low", "high", "optimum", "form" ],
    "OBJECT" : [ "data", "form", "height", "type", "typeMustMatch", "useMap", "width" ],
    "OL" : [ "reversed", "start", "type" ],
    "OPTGROUP" : [ "disabled", "label" ],
    "OPTION" : [ "disabled", "label", "selected", "value" ],
    "OUTPUT" : [ "form", "htmlFor", "name" ],
    "PARAM" : [ "name", "value" ],
    "PROGRESS" : [ "max", "value" ],
    "Q" : [ "cite" ],
    "SELECT" : [ "autofocus", "disabled", "form", "multiple", "name", "required", "size" ],
    "SOURCE" : [ "src", "type" ],
    "TD" : [ "colSpan", "headers", "rowSpan" ],
    "TEMPLATE" : [ "content" ],
    "TEXTAREA" : [ "autocomplete", "autofocus", "cols", "disabled", "form", "maxLength", "minLength", "name",
                   "placeholder", "readOnly", "required", "rows", "selectionDirection", "selectionEnd", "selectionStart",
                   "wrap" ],
    "TH" : [ "colSpan", "headers", "rowSpan", "scope" ],
    "TIME" : [ "dateTime" ],
    "TRACK" : [ "default", "kind", "label", "src", "srclang" ],
    "VIDEO" : [ "autoplay", "buffered", "controls", "crossOrigin", "height", "loop", "muted", "played", "preload", "poster", "src", "width" ]
};

SecureElement.elementSpecificMethodWhitelists = {
    "AUDIO" : [ "addTextTrack", "canPlayType", "fastSeek", "getStartDate", "load", "play", "pause" ],
    "CANVAS" : [ "getContext", "toDataURL", "toBlob" ],
    "SVG" : [ "createSVGRect" ],
    "VIDEO" : [ "addTextTrack", "canPlayType", "load", "play", "pause" ]
};
