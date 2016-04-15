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

	// A secure element can have multiple forms, this block allows us to apply
	// some polymorphic behavior to SecureElement depending on the tagName
	var tagName = el.tagName && el.tagName.toUpperCase();
	switch (tagName) {
		case 'IFRAME':
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
				$A.lockerService.util.verifyAccess(o, child, { verifyNotOpaque: true });

				if (child.$run) {
					// special case for SecureScriptElement to execute without insertion.
					child.$run();
				} else {
					el.appendChild(getLockerSecret(child, "ref"));
				}

				return child;
			}
		}
	});

	Object.defineProperties(o, {
		addEventListener : SecureElement.createAddEventListenerDescriptor(o, el, key),

		removeEventListener : SecureObject.createFilteredMethod(o, el, "removeEventListener"),
		dispatchEvent : SecureObject.createFilteredMethod(o, el, "dispatchEvent"),

		childNodes : SecureObject.createFilteredProperty(o, el, "childNodes"),
		children : SecureObject.createFilteredProperty(o, el, "children"),

		firstChild : SecureObject.createFilteredProperty(o, el, "firstChild"),
		lastChild : SecureObject.createFilteredProperty(o, el, "lastChild"),

        compareDocumentPosition: SecureObject.createFilteredMethod(o, el, "compareDocumentPosition"),

		getAttribute: SecureObject.createFilteredMethod(o, el, "getAttribute"),
		setAttribute: SecureObject.createFilteredMethod(o, el, "setAttribute"),

        getElementsByClassName: SecureObject.createFilteredMethod(o, el, "getElementsByClassName"),
        getElementsByTagName: SecureObject.createFilteredMethod(o, el, "getElementsByTagName"),

		ownerDocument : SecureObject.createFilteredProperty(o, el, "ownerDocument"),
		parentNode : SecureObject.createFilteredProperty(o, el, "parentNode"),

        nodeName: SecureObject.createFilteredProperty(o, el, "nodeName"),
        nodeType: SecureObject.createFilteredProperty(o, el, "nodeType"),

        removeChild: SecureObject.createFilteredMethod(o, el, "removeChild", { 
        	beforeCallback: function(child) {
        		// Verify that the passed in child is not opaque!
				$A.lockerService.util.verifyAccess(o, child, { verifyNotOpaque: true });
        	}	
    	}),

		// Standard HTMLElement methods
		// https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement#Methods
		blur: SecureObject.createFilteredMethod(o, el, "blur"),
		click: SecureObject.createFilteredMethod(o, el, "click"),
		focus: SecureObject.createFilteredMethod(o, el, "focus"),

		innerHTML : SecureObject.createFilteredProperty(o, el, "innerHTML", { 
			returnValue: "", 
			beforeSetCallback: function() {				
				// Do not allow innerHTML on shared elements (body/head)
				if (isSharedElement(el)) {
		            throw new $A.auraError("SecureElement.innerHTML cannot be used with " + el.tagName + " elements!");
				}
			},
			afterSetCallback: function() {
				// DCHASMAN TODO We need these to then depth first traverse/visit and $A.lockerServer.trust() all of the new nodes!
				if (el.firstChild) {
					$A.lockerService.trust(o, el.firstChild);
				}
			} 
		}),

        cloneNode: SecureObject.createFilteredMethod(o, el, "cloneNode", { afterCallback: function(fnReturnedValue) {
			// DCHASMAN TODO We need these to then depth first traverse/visit and $A.lockerServer.trust() all of the new nodes!
			$A.lockerService.trust(o, fnReturnedValue);
			return fnReturnedValue;
		} }),

        textContent: SecureObject.createFilteredProperty(o, el, "textContent", { returnValue: "" })
	});

	// applying standard secure element properties
	SecureElement.addSecureProperties(o, el);

	SecureElement.addElementSpecificProperties(o, el);

	setLockerSecret(o, "key", key);
	setLockerSecret(o, "ref", el);

	return o;
}

SecureElement.addSecureProperties = function(se, raw) {
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
		Object.defineProperty(se, name, SecureObject.createFilteredProperty(se, raw, name));
	});
};

SecureElement.createAddEventListenerDescriptor = function(st, el, key) {
	return {
		value : function(event, callback, useCapture) {
			if (!callback) {
				return; // by spec, missing callback argument does not throw, just ignores it.
			}

			var sCallback = function(e) {
				var se = SecureDOMEvent(e, key);
				callback.call(st, se);
			};

			el.addEventListener(event, sCallback, useCapture);
		}
	};
};

SecureElement.addElementSpecificProperties = function(se, el) {
	var tagName = el.tagName && el.tagName.toUpperCase();
	if (tagName) {
		var whitelist = SecureElement.elementSpecificWhitelists[tagName];
		if (whitelist) {
			whitelist.forEach(function(name) {
				Object.defineProperty(se, name, SecureObject.createFilteredProperty(se, el, name));
			});
		}
	}
};

SecureElement.elementSpecificWhitelists = {
	"A": ["hash", "host", "hostname", "href", "origin", "pathname", "port", "protocol", "search"],
	
	// DCHASMAN TODO Fix SecureElement.setAttribute() hole and whitelist values for http-equiv/httpEquiv
	
	"META": ["content", "name"]
};
