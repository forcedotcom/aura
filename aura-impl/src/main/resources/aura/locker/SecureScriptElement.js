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


function SecureScriptElement(el, key) {
	"use strict";

    var o = ls_getFromCache(el, key);
    if (o) {
        return o;
    }

	function getAttributeName(name) {
		return name.toLowerCase() === "src" ? "data-locker-src" : name;
	}

	var eventListeners = {};

	// Create a placeholder script element in the doc
	el = el || document.createElement("SCRIPT");

	o = Object.create(null, {
		src : {
			enumerable: true,
			get: function () {
				return o.getAttribute("src");
			},
			set: function (value) {
				o.setAttribute("src", value);
			}
		},

		getAttribute : {
			value: function(name) {
				return el.getAttribute(getAttributeName(name));
			}
		},

		setAttribute : {
			value: function(name, value) {
				el.setAttribute(getAttributeName(name), value);
			}
		},

		removeAttribute : {
			value: function(name, value) {
				el.removeAttribute(getAttributeName(name), value);
			}
		},

		getAttributeNode : {
			value: function(name) {
				return el.getAttributeNode(getAttributeName(name));
			}
		},

		setAttributeNode : {
			value: function(value) {
				el.setAttributeNode(value);
			}
		},

		removeAttributeNode : {
			value: function(value) {
				el.removeAttributeNode(value);
			}
		},

		$run : {
			value : function() {
				var src = o.getAttribute("src");
				if (!src) {
					return;
				}

				document.head.appendChild(el);

				// XHR in source and secure it using $A.lockerService.create()
				var xhr = $A.services.client.createXHR();

				xhr.onreadystatechange = function() {
					if (xhr.readyState === 4 && xhr.status === 200) {
						$A.lockerService.create(xhr.responseText, key, src, true);

						// Fire onload event
						var listeners = eventListeners["load"];
						if (listeners) {
							listeners.forEach(function(listener) {
								listener.call(o);
							});
						}
					}

					// DCHASMAN TODO W-2837800 Add in error handling for 404's etc
				};

				xhr.open("GET", src, true);
				
				//for relative urls enable sending credentials
				if(src.indexOf("/") === 0){
					xhr.withCredentials = true;
				}
				xhr.send();
			}
		},

		toString : {
			value : function() {
				return "SecureScriptElement: " + o.getAttribute("src") + "{ key: " + JSON.stringify(key) + " }";
			}
		},

		addEventListener : {
			value : function(event, callback) {
				if (!callback) {
					return; // by spec, missing callback argument does not throw, just ignores it.
				}

				var listeners = eventListeners[event];
				if (!listeners) {
					eventListeners[event] = [callback];
				} else {
					listeners.push(callback);
				}
			}
		}
	});

    ls_setRef(o, el, key);
    ls_addToCache(el, o, key);

	return o;
}
