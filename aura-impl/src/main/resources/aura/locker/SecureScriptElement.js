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

var SecureScriptElement = (function() {
	"use strict";

	function SecureScriptElement(key) {
		SecureThing.call(this, key);
	}

	SecureScriptElement.prototype.constructor = SecureScriptElement;
	SecureScriptElement.prototype = Object.create(SecureThing.prototype, {
		$run : {
			value : function() {
				// XHR in source and secure it using LockerService.create()
				var xhr = $A.services.client.createXHR();

				xhr.onreadystatechange = function() {
					if (xhr.readyState == 4 && xhr.status == 200) {
						LockerService.create(xhr.responseText, key);
					}
					
					// DCHASMAN TODO W-2837800 Add in error handling for 404's etc
				};

				xhr.open("GET", this._get("src", masterKey), true);
				xhr.send();
			}
		},

		toString : {
			value : function() {
				return "SecureScriptElement: " + this._get("src", masterKey) + "{ key: " + JSON.stringify(LockerKeyUtil._getKey(this, masterKey)) + " }";
			}
		},

		src : {
			get : function() {
				return this._get("src", masterKey);
			},

			set : function(value) {
				this._set("src", value, masterKey);
			}
		},

		addEventListener : {
			value : function(event, callback) {
				// DCHASMAN TOOD W-2837803 Add support for onload event
			}
		}
	});

	return SecureScriptElement;
})();