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

	// A secure element can have multiple forms, this block allows us to apply
	// some polymorphic behavior to SecureElement depending on the tagName
	var tagName = el.tagName && el.tagName.toUpperCase();
	if (tagName === 'IFRAME') {
		return SecureIFrameElement(el, key);
	}

	// SecureElement is it then!
	var o = Object.create(null, {
		toString : {
			value : function() {
				return "SecureElement: " + el + "{ key: " + JSON.stringify(key) + " }";
			}
		},

		appendChild : {
			value : function(child) {
				$A.lockerService.util.verifyAccess(o, child);

				if (child.$run) {
					// special case for SecureScriptElement to execute without insertion.
					// TODO: improve
					child.$run();
				} else {
					el.appendChild(getLockerSecret(child, "ref"));
				}
			}
		},

		addEventListener : {
			value : function(event, callback, useCapture) {
				if (!callback) {
					return; // by spec, missing callback argument does not throw, just ignores it.
				}
				var sCallback = function(e) {
					var se = SecureDOMEvent(e, key);
					callback.call(o, se);
				};
				el.addEventListener(event, sCallback, useCapture);
			}
		},

		removeEventListener : SecureThing.createPassThroughMethod(el, "removeEventListener"),
		dispatchEvent : SecureThing.createPassThroughMethod(el, "dispatchEvent"),

		childNodes : SecureThing.createFilteredProperty(el, "childNodes"),
		children : SecureThing.createFilteredProperty(el, "children"),

		getAttribute: SecureThing.createPassThroughMethod(el, "getAttribute"),
		setAttribute: SecureThing.createPassThroughMethod(el, "setAttribute"),

		ownerDocument : SecureThing.createFilteredProperty(el, "ownerDocument"),
		parentNode : SecureThing.createFilteredProperty(el, "parentNode"),

		// Standard HTMLElement methods
		// https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement#Methods
		blur: SecureThing.createPassThroughMethod(el, "blur"),
		click: SecureThing.createPassThroughMethod(el, "click"),
		focus: SecureThing.createPassThroughMethod(el, "focus")
	});
	// applying standard secure element properties
	SecureElement.addSecureProperties(o, el);

	setLockerSecret(o, "key", key);
	setLockerSecret(o, "ref", el);
	return Object.seal(o);
}

SecureElement.addSecureProperties = function (se, raw) {
	[
		// Standard Element interface represents an object of a Document.
		// https://developer.mozilla.org/en-US/docs/Web/API/Element#Properties
		'childElementCount', 'classList', 'className', 'id', 'tagName',
		// Note: ignoring 'attributes', 'children', 'firstElementChild', 'innerHTML', 'lastElementChild', 'namespaceURI',
		//      'nextElementSibling' and 'previousElementSibling' from the list above.

		// Standard HTMLElement interface represents any HTML element
		// https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement#Properties
		'accessKey', 'accessKeyLabel', 'contentEditable', 'isContentEditable',
		'contextMenu', 'dataset', 'dir', 'draggable', 'dropzone', 'hidden', 'lang', 'spellcheck',
		'style', 'tabIndex', 'title'
		// Note: ignoring 'offsetParent' from the list above.
	].forEach(function (name) {
		Object.defineProperty(se, name, SecureThing.createPassThroughProperty(raw, name));
	});
};
