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

//#include aura.locker.SecureDOMEvent
//#include aura.locker.SecureIFrameElement

var SecureElement = (function() {
	"use strict";

	// Standard Element interface represents an object of a Document.
	// https://developer.mozilla.org/en-US/docs/Web/API/Element#Properties
	var ElementSecureProperties = ['attributes', 'childElementCount', 'classList', 'className', 'id', 'tagName'];
	// Note: ignoring 'children', 'firstElementChild', 'innerHTML', 'lastElementChild', 'namespaceURI',
	//      'nextElementSibling' and 'previousElementSibling' from the list above.

	// Standard HTMLElement interface represents any HTML element
	// https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement#Properties
	var HTMLElementSecureProperties = ['accessKey', 'accessKeyLabel', 'contentEditable', 'isContentEditable',
			'contextMenu', 'dataset', 'dir', 'draggable', 'dropzone', 'hidden', 'lang', 'spellcheck',
			'style', 'tabIndex', 'title'];
	// Note: ignoring 'offsetParent' from the list above.

	function getElement(se) {
		return se._get("el", $A.lockerService.masterKey);
	}

	function getKey(se) {
		return $A.lockerService.util._getKey(se, $A.lockerService.masterKey);
	}

	function SecureElement(el, key) {
		// A secure element can have multiple forms, this block allows us to apply
		// some polymorphic behavior to SecureElement depending on the tagName
		var tagName = el.tagName && el.tagName.toUpperCase();
		if (tagName === 'IFRAME') {
			return new SecureIFrameElement(el, key);
		}

		// SecureElement is it then!
		SecureThing.call(this, key, "el");
		$A.lockerService.util.applyKey(el, key);
		this._set("el", el, $A.lockerService.masterKey);
		SecureElement.enableSecureProperties(this);
		Object.freeze(this);
	}

	SecureElement.prototype = Object.create(SecureThing.prototype, {
		toString : {
			value : function() {
				return "SecureElement: " + getElement(this) + "{ key: " + JSON.stringify(getKey(this)) + " }";
			}
		},

		appendChild : {
			value : function(child) {
				$A.lockerService.util.verifyAccess(this, child);

				if (child.$run) {
					// special case for SecureScriptElement to execute without insertion.
					// TODO: improve
					child.$run();
				} else {
					var childEl = child.unwrap($A.lockerService.masterKey);
					getElement(this).appendChild(childEl);
				}
			}
		},

		addEventListener : {
			value : function(event, callback, useCapture) {
				if (!callback) {
					return; // by spec, missing callback argument does not throw, just ignores it.
				}
				var key = getKey(this);
				var sCallback = function(e) {
					var se = new SecureDOMEvent(e, key);
					// Wrap the source event in "this" in a secure element
					var secureEventContext = SecureDocument.wrap(this);
					callback.call(secureEventContext, se);
				};
				getElement(this).addEventListener(event, sCallback, useCapture);
			}
		},
		removeEventListener : SecureThing.createPassThroughMethod("removeEventListener"),
		dispatchEvent : SecureThing.createPassThroughMethod("dispatchEvent"),

		childNodes : SecureThing.createFilteredProperty("childNodes"),
		children : SecureThing.createFilteredProperty("children"),

		getAttribute: SecureThing.createPassThroughMethod("getAttribute"),
		setAttribute: SecureThing.createPassThroughMethod("setAttribute"),

		ownerDocument : SecureThing.createFilteredProperty("ownerDocument"),
		parentNode : SecureThing.createFilteredProperty("parentNode"),

		// Standard HTMLElement methods
		// https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement#Methods
		blur: SecureThing.createPassThroughMethod("blur"),
		click: SecureThing.createPassThroughMethod("click"),
		focus: SecureThing.createPassThroughMethod("focus"),

		// Internal master key protected API

		unwrap : {
			value : function(mk) {
				if (mk !== $A.lockerService.masterKey) {
					throw new Error("Access denied");
				}

				return getElement(this);
			}
		}
	});

	SecureElement.prototype.constructor = SecureElement;

	SecureElement.enableSecureProperties = function (se) {
		[].concat(ElementSecureProperties, HTMLElementSecureProperties).forEach(function (name) {
			Object.defineProperty(se, name, SecureThing.createPassThroughProperty(name));
		});
	};

	return SecureElement;
})();
