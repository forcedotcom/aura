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
                        var el = doc.createElement(tag);
                        $A.lockerService.trust(o, el);
                        return SecureElement(el, key);
                }
            }
        },
        createDocumentFragment: {
            value: function() {
                var frag = doc.createDocumentFragment();
                $A.lockerService.trust(o, frag);
                return SecureElement(frag, key);
            }
        },
        createTextNode: {
            value: function(text) {
                var node = doc.createTextNode(text);
                $A.lockerService.trust(o, node);
                return SecureElement(node, key);
            }
        },

        body: SecureThing.createFilteredProperty(doc, "body"),
        head: SecureThing.createFilteredProperty(doc, "head"),

        getElementById: SecureThing.createFilteredMethod(doc, "getElementById"),
        getElementsByClassName: SecureThing.createFilteredMethod(doc, "getElementsByClassName"),
        getElementsByName: SecureThing.createFilteredMethod(doc, "getElementsByName"),
        getElementsByTagName: SecureThing.createFilteredMethod(doc, "getElementsByTagName"),

        querySelector: SecureThing.createFilteredMethod(doc, "querySelector"),
        querySelectorAll: SecureThing.createFilteredMethod(doc, "querySelectorAll"),

        title: SecureThing.createPassThroughProperty(doc, "title"),

        // DCHASMAN TODO W-2839646 Figure out how much we want to filter cookie access???
        cookie: SecureThing.createPassThroughProperty(doc, "cookie")
    });

    setLockerSecret(o, "key", key);
    setLockerSecret(o, "ref", doc);
    return Object.seal(o);
}
