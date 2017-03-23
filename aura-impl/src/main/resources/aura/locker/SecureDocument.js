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

/**
 * Factory for SecureDocument objects.
 *
 * @public
 *
 * @param {Object}
 *            doc - the DOM document
 * @param {Object}
 *            key - the key to apply to the secure document
 */
function SecureDocument(doc, key) {
    "use strict";

    var o = ls_getFromCache(doc, key);
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
        createElement: {
            value: function(tag) {
                var el = doc.createElement(tag);
                ls_setKey(el, key);
                return SecureElement(el, key);
            }
        },
        createElementNS: {
            value: function(namespace, tag) {
                var el = doc.createElementNS(namespace, tag);
                ls_setKey(el, key);
                return SecureElement(el, key);
            }
        },
        createDocumentFragment: {
            value: function() {
                var el = doc.createDocumentFragment();
                ls_setKey(el, key);
                return SecureElement(el, key);
            }
        },
        createTextNode: {
            value: function(text) {
                var el = doc.createTextNode(text);
                ls_setKey(el, key);
                return SecureElement(el, key);
            }
        },
        createComment: {
            value: function(data) {
                var el = doc.createComment(data);
                ls_setKey(el, key);
                return SecureElement(el, key);
            }
        },
        querySelector: {
            value: function(selector) {
                return SecureElement.secureQuerySelector(doc, key, selector);
            }
        }
    });

    SecureElement.addEventTargetMethods(o, doc, key);

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

    SecureObject.addPrototypeMethodsAndProperties(SecureDocument.metadata, o, doc, key);

    ls_setRef(o, doc, key);
    ls_addToCache(doc, o, key);
    ls_registerProxy(o);

    return o;
}

var DEFAULT = SecureElement.DEFAULT;
var FUNCTION = SecureElement.FUNCTION;
var EVENT = SecureElement.EVENT;
var SKIP_OPAQUE = SecureElement.SKIP_OPAQUE;

SecureDocument.metadata = {
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
                "domain":                           DEFAULT,
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
                "ontouchcancel":               	  	EVENT,
                "ontouchend":                	  	EVENT,
                "ontouchmove":                	  	EVENT,
                "ontouchstart":                	  	EVENT,
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
                "write":                            FUNCTION,
                "writeln":                          FUNCTION,
                "xmlEncoding":                      DEFAULT,
                "xmlStandalone":                    DEFAULT,
                "xmlVersion":                       DEFAULT
            },
            "Node": SecureElement.nodeMetadata,
            "EventTarget": SecureElement.eventTargetMetadata
        }
};

