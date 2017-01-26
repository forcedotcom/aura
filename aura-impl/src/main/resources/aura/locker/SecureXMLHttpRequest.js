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
 * Construct a SecureXMLHttpRequest.
 *
 * @public
 * @class
 * @constructor
 *
 * @param {Object}
 *            key - the key to apply to the secure xhr
 */
function SecureXMLHttpRequest(key) {
	"use strict";

	// Create a new closure constructor for new XHMLHttpRequest() syntax support that captures the key
	return function() {
		var xhr = new XMLHttpRequest();

		var o = Object.create(null, {
			toString: {
				value: function() {
					return "SecureXMLHttpRequest: " + xhr + " { key: " + JSON.stringify(key) + " }";
				}
			}
		});

		// Properties
		["readyState", "status", "statusText", "response", "responseType", "responseText",
		 "responseXML", "responseURL", "timeout", "withCredentials", "upload"].forEach(function (name) {
			SecureObject.addPropertyIfSupported(o, xhr, name);
		});

		// Event handlers
		["onloadstart", "onprogress", "onabort", "onerror", "onload", "ontimeout", "onloadend", "onreadystatechange"].forEach(function (name) {
			Object.defineProperty(o, name, {
				set: function(callback) {
					xhr[name] = function(e) {
						callback.call(o, SecureDOMEvent(e, key));
					};
				}
			});
		});

		Object.defineProperties(o, {
			abort: SecureObject.createFilteredMethod(o, xhr, "abort"),

			addEventListener: SecureElement.createAddEventListenerDescriptor(o, xhr, key),

			open: SecureObject.createFilteredMethod(o, xhr, "open", {
	        	beforeCallback: function(method, url) {
	        		// Block attempts to directly invoke /aura end points
	        		var normalizer = document.createElement("a");
	        		normalizer.href = decodeURIComponent(url + "");
	        		var urlLower = normalizer.href.toLowerCase();

	        		if (urlLower.indexOf("/aura") >= 0) {
			            throw new $A.auraError("SecureXMLHttpRequest.open cannot be used with Aura framework internal API endpoints " + url + "!");
	        		}
	        	}
	    	}),

			send: SecureObject.createFilteredMethod(o, xhr, "send"),

			getAllResponseHeaders: SecureObject.createFilteredMethod(o, xhr, "getAllResponseHeaders"),
			getResponseHeader: SecureObject.createFilteredMethod(o, xhr, "getResponseHeader"),

			setRequestHeader: SecureObject.createFilteredMethod(o, xhr, "setRequestHeader")
		});

        ls_setRef(o, xhr, key);

		return Object.freeze(o);
	};
}
