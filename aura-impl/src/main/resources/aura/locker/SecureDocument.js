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

    function trust(st, el) {
        $A.lockerService.trust(st, el);
        return SecureElement(el, key);
    }

    function createElement(tag, namespace) {
    	// Insure that no object to string coercion tricks can be applied to evade tag name based logic
        tag = tag + "";
        switch (tag.toLowerCase()) {
            case "script":
                return SecureScriptElement(key);

            default:
                return trust(o, doc.createElementNS(namespace, tag));
        }
    }

    var o = Object.create(null, {
        toString: {
            value: function() {
                return "SecureDocument: " + doc + "{ key: " + JSON.stringify(key) + " }";
            }
        },
        createElement: {
            value: function(tag) {
                return createElement(tag, "http://www.w3.org/1999/xhtml");
            }
        },
        createElementNS: {
            value: function(namespace, tag) {
                return createElement(tag, namespace);
            }
        },
        createDocumentFragment: {
            value: function() {
                return trust(o, doc.createDocumentFragment());
            }
        },
        createTextNode: {
            value: function(text) {
                return trust(o, doc.createTextNode(text));
            }
        },
        createComment: {
            value: function(data) {
                return trust(o, doc.createComment(data));
            }
        },
        documentElement: {
        	enumerable: true,
    		get : function() {
                return trust(o, doc.documentElement.cloneNode());
            }
        }
    });

	SecureElement.addSecureGlobalEventHandlers(o, doc, key);
	SecureElement.addEventTargetMethods(o, doc, key);

    Object.defineProperties(o, {
        body: SecureObject.createFilteredProperty(o, doc, "body"),
        head: SecureObject.createFilteredProperty(o, doc, "head"),

        childNodes: SecureObject.createFilteredProperty(o, doc, "childNodes"),

        nodeType: SecureObject.createFilteredProperty(o, doc, "nodeType"),

        getElementById: SecureObject.createFilteredMethod(o, doc, "getElementById"),
        getElementsByClassName: SecureObject.createFilteredMethod(o, doc, "getElementsByClassName"),
        getElementsByName: SecureObject.createFilteredMethod(o, doc, "getElementsByName"),
        getElementsByTagName: SecureObject.createFilteredMethod(o, doc, "getElementsByTagName"),

        querySelector: SecureObject.createFilteredMethod(o, doc, "querySelector"),
        querySelectorAll: SecureObject.createFilteredMethod(o, doc, "querySelectorAll"),

        title: SecureObject.createFilteredProperty(o, doc, "title"),

        cookie: SecureObject.createFilteredProperty(o, doc, "cookie", {
            writable: false
        })
    });

    setLockerSecret(o, "key", key);
    setLockerSecret(o, "ref", doc);

    return o;
}
