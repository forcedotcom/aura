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

//#include aura.locker.SecureThing
//#include aura.locker.SecureElement
//#include aura.locker.SecureScriptElement
var SecureDocument = (function() {
	"use strict";

	/**
	 * Construct a new SecureDocument.
	 * 
	 * @public
	 * @class
	 * @constructor
	 * 
	 * @param {Object}
	 *            document - the DOM document
	 * @param {Object}
	 *            key - the key to apply to the secure document
	 */
	function SecureDocument(document, key) {
		SecureThing.call(this, key, "document");

		this._set("document", document, $A.lockerService.masterKey);

		Object.freeze(this);
	}

	function getDocument(sd) {
		return sd._get("document", $A.lockerService.masterKey);
	}

	function getKey(sd) {
		return $A.lockerService.util._getKey(sd, $A.lockerService.masterKey);
	}

	SecureDocument.prototype.constructor = SecureDocument;
	SecureDocument.prototype = Object.create(SecureThing.prototype, {
		toString : {
			value : function() {
				return "SecureDocument: " + getDocument(this) + "{ key: " + JSON.stringify(getKey(this)) + " }";
			}
		},

		createDocumentFragment : {
			value : function() {
				return new SecureElement(getDocument(this).createDocumentFragment(), getKey(this));
			}
		},

		createElement : {
			value : function(tag) {
				var key = getKey(this);
				switch (tag.toLowerCase()) {
				case "script":
					return new SecureScriptElement(key);

				case "iframe":
					throw new Error("SecureDocument: iframe element is not currently supported");

				default:
					var el = getDocument(this).createElement(tag);
					return new SecureElement(el, key);
				}
			}
		},

		createTextNode : {
			value : function(text) {
				return new SecureElement(getDocument(this).createTextNode(text), getKey(this));
			}
		},

		body : SecureThing.createFilteredProperty("body"),
		head : SecureThing.createFilteredProperty("head"),

		getElementById : SecureThing.createFilteredMethod("getElementById"),
		getElementsByClassName : SecureThing.createFilteredMethod("getElementsByClassName"),
		getElementsByName : SecureThing.createFilteredMethod("getElementsByName"),
		getElementsByTagName : SecureThing.createFilteredMethod("getElementsByTagName"),

		querySelector : SecureThing.createFilteredMethod("querySelector"),
		querySelectorAll : SecureThing.createFilteredMethod("querySelectorAll"),

		// DCHASMAN TODO W-2839646 Figure out how much we want to filter cookie access???
		cookie : SecureThing.createPassThroughProperty("cookie")
	});

	SecureDocument.wrap = function(el) {
		return new SecureElement(el, $A.lockerService.util._getKey(el, $A.lockerService.masterKey));
	};

	return SecureDocument;
})();
