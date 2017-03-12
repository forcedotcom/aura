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

	ls_setKey(el, key);

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

		// dataset can only change `data-` attributes, thus, it is safe to expose.
		dataset : {
			get: function () {
				return o.dataset;
			},
			set: function (value) {
				o.dataset = value;
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
				} else {
					var safeSources = $A.getContext().safeScriptSources;
					// Easiest way to get the resolved url for any src value provided including relative paths on same domain
					var testElement = document.createElement('a');
					testElement.href = src;
					var hrefToTest = testElement["href"];
					var hostToTest = testElement["host"];
					var sourceVetted = false;
					for(var i in safeSources) {
						var safeSource = safeSources[i];
						if (safeSource && $A.util.isString(safeSource)) {
							safeSource = safeSource.trim();
							// 1. Source url matches the specified protocol, domain, sub-domain, path
							// Also takes care of same origin
							if (hrefToTest && hrefToTest.indexOf(safeSource) === 0){
								sourceVetted = true;
								break;
							}
							if(hostToTest) {
								if (safeSource.indexOf("*.") === 0) { // 2. Sub-domain match
									var subDomainTestStr = safeSource.replace("*", "");
									// endsWith check since String.endsWith() is not supported on all browsers
									if(hostToTest.length >= subDomainTestStr.length &&  hostToTest.substr(hostToTest.length - subDomainTestStr.length) === subDomainTestStr) {
										sourceVetted = true;
										break;
									}
								} else if (safeSource === hostToTest){ // 3. Domain match
									sourceVetted = true;
									break;
								}
							}
						}
					}
					if(!sourceVetted){
						throw new Error("SecureScriptElement: External script loading blocked, CSP restrictions:" + hrefToTest);
					}
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
    ls_registerProxy(o);

	return o;
}
