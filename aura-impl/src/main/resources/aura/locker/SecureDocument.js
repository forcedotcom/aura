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

//#include aura.locker.LockerKeyUtil
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
	 *            key - the key to apply to the swecure document
	 */
	function SecureDocument(document, key) {
		SecureThing.call(this, key);

		this._set("document", document, masterKey);

		Object.freeze(this);
	}

	function getDocument(sd) {
		return sd._get("document", masterKey);
	}

	function getKey(sd) {
		return LockerKeyUtil._getKey(sd, masterKey);
	}

	function filterNodes(sd, raw) {
		if (!raw) {
			return undefined;
		}

		if (raw.length !== undefined) {
			var key = getKey(sd);
			var filtered = [];
			for (var n = 0; n < raw.length; n++) {
				var e = raw[n];
				if (LockerKeyUtil.hasAccess(sd, e)) {
					filtered.push(new SecureElement(e, key));
				}
			}

			return filtered;
		} else {
			return LockerKeyUtil.hasAccess(sd, raw) ? new SecureElement(raw, getKey(sd)) : undefined;
		}
	}

	function createFilteredMethod(methodName) {
		return {
			value : function() {
				var doc = getDocument(this);
				return filterNodes(this, doc[methodName].apply(doc, arguments));
			}
		};
	}

	function createFilteredProperty(propertyName) {
		return {
			get : function() {
				var doc = getDocument(this);
				var raw = doc[propertyName];
				LockerKeyUtil.verifyAccess(this, raw);
				return new SecureElement(raw, getKey(sd));
			}
		};
	}
	
	function createPassThroughProperty(name) {
		return {
			get : function() {
				return getDocument(this)[name];
			},
			set : function(value) {
				getDocument(this)[name] = value;
			}
		};
	}

	SecureDocument.prototype.constructor = SecureDocument;
	SecureDocument.prototype = Object.create(SecureThing.prototype, {
		toString : {
			value : function() {
				return "SecureDocument: " + getDocument(this) + "{ key: " + JSON.stringify(getKey(this)) + " }";
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
	
		body : createFilteredProperty("body"),
		head : createFilteredProperty("head"),
		
		getElementById : createFilteredMethod("getElementById"),
		getElementsByClassName : createFilteredMethod("getElementsByClassName"),
		getElementsByName : createFilteredMethod("getElementsByName"),
		getElementsByTagName : createFilteredMethod("getElementsByTagName"),

		querySelector : createFilteredMethod("querySelector"),
		querySelectorAll : createFilteredMethod("querySelectorAll"),
		
		// DCHASMAN TODO W-2839646 Figure out how much we want to filter cookie access???
		cookie: createPassThroughProperty("cookie")
	});

	SecureDocument.wrap = function(el) {
		return new SecureElement(el, LockerKeyUtil._getKey(el, masterKey));
	};

	return SecureDocument;
})();
