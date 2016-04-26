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
			// special case for SecureScriptElement to execute without insertion.
			st.$run();
		}
		return isRunnable;
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

				if (!runIfRunnable(child)) {
					el.appendChild(getLockerSecret(child, "ref"));
				}

				return child;
			}
		},
		
		insertBefore : {
			value : function(newNode, referenceNode) {
				$A.lockerService.util.verifyAccess(o, newNode, { verifyNotOpaque: true });
				$A.lockerService.util.verifyAccess(o, referenceNode, { verifyNotOpaque: true });

				if (!runIfRunnable(newNode)) {
					el.insertBefore(getLockerSecret(newNode, "ref"), getLockerSecret(referenceNode, "ref"));
				}
				
				return newNode;
			}
		}
	});

	Object.defineProperties(o, {
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
			beforeSetCallback: function(value) {				
				// Do not allow innerHTML on shared elements (body/head)
				if (isSharedElement(el)) {
		            throw new $A.auraError("SecureElement.innerHTML cannot be used with " + el.tagName + " elements!");
				}
				
				/*jslint sub: true */
				return DOMPurify["sanitize"](value);
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
	SecureElement.addSecureGlobalEventHandlers(o, el, key);
	SecureElement.addEventTargetMethods(o, el, key);

	SecureElement.addElementSpecificProperties(o, el);
	SecureElement.addElementSpecificMethods(o, el);

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
		'style', 'tabIndex', 'title',
		
		'offsetHeight', 'offsetLeft', 'offsetParent', 'offsetTop', 'offsetWidth'
		
		// DCHASMAN TODO This list needs to be revisted as it is missing a ton of valid attributes!
	].forEach(function (name) {
		Object.defineProperty(se, name, SecureObject.createFilteredProperty(se, raw, name));
	});
};

SecureElement.addSecureGlobalEventHandlers = function(se, raw, key) {
	[
		// Standard Global Event handlers
		// https://developer.mozilla.org/en-US/docs/Web/API/GlobalEventHandlers
		"onabort", "onblur", "onchange", "onclick", "onclose", "oncontextmenu", "ondblclick", "onerror",
		"onfocus", "oninput", "onkeydown", "onkeypress", "onkeyup", "onload", 
		"onmousedown", "onmousemove", "onmouseout", "onmouseover", "onmouseup", 
		"onreset", "onresize", "onscroll", "onselect", "onsubmit"	
	].forEach(function (name) {
		Object.defineProperty(se, name, {
			set: function(callback) {
				raw[name] = function(e) {
					callback.call(se, SecureDOMEvent(e, key));
				};
			}
		});
	});
};

SecureElement.addEventTargetMethods = function(se, raw, key) {
	Object.defineProperties(se, {
		addEventListener : SecureElement.createAddEventListenerDescriptor(se, raw, key),
		dispatchEvent : SecureObject.createFilteredMethod(se, raw, "dispatchEvent"),
		
		// removeEventListener() is special in that we do not want to unfilter/unwrap the listener argument or it will not match what 
		// was actually wired up originally
		removeEventListener : {
			value: function(type, listener, options) {
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
				return; // by spec, missing callback argument does not throw, just ignores it.
			}

			var sCallback = function(e) {
				var se = SecureDOMEvent(e, key);
				callback.call(st, se);
			};

			// Back reference for removeEventListener() support
			setLockerSecret(callback, "sCallback", sCallback);
			
			el.addEventListener(event, sCallback, useCapture);
		}
	};
};

SecureElement.createAddEventListener = function(st, el, key) {
	return function(event, callback, useCapture) {
		if (!callback) {
			return; // by spec, missing callback argument does not throw, just ignores it.
		}

		var sCallback = function(e) {
			var se = SecureDOMEvent(e, key);
			callback.call(st, se);
		};

		el.addEventListener(event, sCallback, useCapture);
	};
};

SecureElement.addElementSpecificProperties = function(se, el) {
	var tagName = el.tagName && el.tagName.toUpperCase();
	if (tagName) {
		var whitelist = SecureElement.elementSpecificAttributeWhitelists[tagName];
		if (whitelist) {
			whitelist.forEach(function(name) {
				Object.defineProperty(se, name, SecureObject.createFilteredProperty(se, el, name));
			});
		}
	}
};

SecureElement.addElementSpecificMethods = function(se, el) {
	var tagName = el.tagName && el.tagName.toUpperCase();
	if (tagName) {
		var whitelist = SecureElement.elementSpecificMethodWhitelists[tagName];
		if (whitelist) {
			whitelist.forEach(function(name) {
				Object.defineProperty(se, name, SecureObject.createFilteredMethod(se, el, name));
			});
		}
	}
};

SecureElement.elementSpecificAttributeWhitelists = {
	"A": ["hash", "host", "hostname", "href", "origin", "pathname", "port", "protocol", "search"],
	
	// DCHASMAN TODO Fix SecureElement.setAttribute() hole and whitelist values for http-equiv/httpEquiv
	
	"META": ["content", "name"]
};

SecureElement.elementSpecificMethodWhitelists = {
	"SVG": ["createSVGRect"]
};
