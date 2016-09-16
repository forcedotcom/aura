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

    SecureElement.addEventTargetMethods(o, el, key);

    SecureObject.addPrototypeMethodsAndProperties(SecureElement.metadata, o, el, key);
    
    // DCHASMAN TODO Remove this - needs to be into the shape metadata!!! Special handling for SVG elements
    if (el.namespaceURI === "http://www.w3.org/2000/svg") {
        SecureObject.addMethodIfSupported(o, el, "getBBox");
    }
    
    setLockerSecret(o, "key", key);
    setLockerSecret(o, "ref", el);

    SecureObject.addToCache(el, o, key);

    return o;
}

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

SecureElement.DEFAULT = {};
SecureElement.FUNCTION = { type: "function" };
SecureElement.EVENT = { type: "@event" };
SecureElement.SKIP_OPAQUE = { skipOpaque : true};

var DEFAULT = SecureElement.DEFAULT;
var FUNCTION = SecureElement.FUNCTION;
var EVENT = SecureElement.EVENT;
var SKIP_OPAQUE = SecureElement.SKIP_OPAQUE;

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
    "compareDocumentPosition":        FUNCTION,
    "contains":                       FUNCTION,
    "firstChild":                     SKIP_OPAQUE,
    "insertBefore":                   FUNCTION,
    "isConnected":                    DEFAULT,
    "isDefaultNamespace":             FUNCTION,
    "isEqualNode":                    FUNCTION,
    "isSameNode":                     FUNCTION,
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
	        "webkitDecodedFrameCount":        DEFAULT,
	        "webkitDisplayingFullscreen":     DEFAULT,
	        "webkitDroppedFrameCount":        DEFAULT,
	        "webkitEnterFullScreen":          FUNCTION,
	        "webkitEnterFullscreen":          FUNCTION,
	        "webkitExitFullScreen":           FUNCTION,
	        "webkitExitFullscreen":           FUNCTION,
	        "webkitSupportsFullscreen":       DEFAULT,
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
	        "ontouchcancel":               	  EVENT,
	        "ontouchend":                	  EVENT,
	        "ontouchmove":                	  EVENT,
	        "ontouchstart":                	  EVENT,
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
	    "Node": SecureElement.nodeMetadata,
	    "EventTarget": SecureElement.eventTargetMetadata
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


Aura.Locker.SecureElement = SecureElement;


