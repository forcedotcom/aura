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

/*jslint sub: true */

function SecureScriptElement(key) {
	"use strict";

	var src;
	var eventListeners = {};
	
	var o = Object.create(null, {
		src : {
			enumerable: true,
			get: function () {
				return src;
			},
			set: function (value) {
				src = value;
			}
		},
		
		$run : {
			value : function() {
				if (!src) {
					return;
				}
				// XHR in source and secure it using $A.lockerService.create()
				var xhr = $A.services.client.createXHR();

				xhr.onreadystatechange = function() {
					if (xhr.readyState === 4 && xhr.status === 200) {
						$A.lockerService.create(xhr.responseText, key);

						// Fire onload event
						var listeners = eventListeners["load"];
						for (var n = 0; n < listeners.length; n++) {
							listeners[n].call(o);
						}
					}

					// DCHASMAN TODO W-2837800 Add in error handling for 404's etc
				};

				xhr.open("GET", src, true);
				xhr.send();
			}
		},

		toString : {
			value : function() {
				return "SecureScriptElement: " + src + "{ key: " + JSON.stringify(key) + " }";
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

	setLockerSecret(o, "key", key);
	
	return o;
}
