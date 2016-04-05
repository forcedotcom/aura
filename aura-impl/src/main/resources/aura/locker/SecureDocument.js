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

    var o = Object.create(null, {
        toString: {
            value: function() {
                return "SecureDocument: " + doc + "{ key: " + JSON.stringify(key) + " }";
            }
        },
        createElement: {
            value: function(tag) {
                // Insure that no object to string coercion tricks can be applied to evade tag name based logic
                tag = tag + "";
                switch (tag.toLowerCase()) {
                    case "script":
                        return SecureScriptElement(key);

                    default:
                        return trust(o, doc.createElement(tag));
                }
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

    Object.defineProperties(o, {
        addEventListener: SecureElement.createAddEventListenerDescriptor(o, doc, key),

        body: SecureThing.createFilteredProperty(o, doc, "body"),
        head: SecureThing.createFilteredProperty(o, doc, "head"),

        childNodes: SecureThing.createFilteredProperty(o, doc, "childNodes"),

        nodeType: SecureThing.createFilteredProperty(o, doc, "nodeType"),

        getElementById: SecureThing.createFilteredMethod(o, doc, "getElementById"),
        getElementsByClassName: SecureThing.createFilteredMethod(o, doc, "getElementsByClassName"),
        getElementsByName: SecureThing.createFilteredMethod(o, doc, "getElementsByName"),
        getElementsByTagName: SecureThing.createFilteredMethod(o, doc, "getElementsByTagName"),

        querySelector: SecureThing.createFilteredMethod(o, doc, "querySelector"),
        querySelectorAll: SecureThing.createFilteredMethod(o, doc, "querySelectorAll"),

        title: SecureThing.createFilteredProperty(o, doc, "title"),

        // DCHASMAN TODO W-2839646 Figure out how much we want to filter cookie access???
        cookie: SecureThing.createFilteredProperty(o, doc, "cookie")
    });

    setLockerSecret(o, "key", key);
    setLockerSecret(o, "ref", doc);

    return o;
}
