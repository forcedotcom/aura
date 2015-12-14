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

var SecureElement = (function() {
	"use strict";

	function getElement(se) {
		return se._get("el", $A.lockerService.masterKey);
	}

	function getKey(se) {
		return $A.lockerService.util._getKey(se, $A.lockerService.masterKey);
	}

	function SecureElement(el, key) {
		SecureThing.call(this, key, "el");

		$A.lockerService.util.applyKey(el, key);

		this._set("el", el, $A.lockerService.masterKey);

		Object.freeze(this);
	}

	SecureElement.prototype.constructor = SecureElement;
	SecureElement.prototype = Object.create(SecureThing.prototype, {
		toString : {
			value : function() {
				return "SecureElement: " + getElement(this) + "{ key: " + JSON.stringify(getKey(this)) + " }";
			}
		},

		id : SecureThing.createPassThroughProperty("id"),
		className : SecureThing.createPassThroughProperty("className"),

		appendChild : {
			value : function(child) {
				$A.lockerService.util.verifyAccess(this, child);

				if (child.$run) {
					child.$run();
				} else {
					var childEl = child.unwrap($A.lockerService.masterKey);
					getElement(this).appendChild(childEl);
				}
			}
		},

		addEventListener : {
			value : function(event, callback, useCapture) {
				var that = this;
				var sCallback = function(e) {
					// Filter out any events not associated with our key
					if ($A.lockerService.util.hasAccess(that, e.target)) {

						// DCHASMAN TODO W-2837770 create SecureEvent class to allow delivery of bubbled events w/out exposing currentTarget etc
						// for (name in event) { if (event[name] instanceof Node) { console.log("Found something to wrap: " + name) } }

						// Wrap the source event in "this" in a secure element
						var sourceEvent = SecureDocument.wrap(this);

						callback.call(sourceEvent, e);
					}
				};

				getElement(this).addEventListener(event, sCallback, useCapture);
			}
		},

		childNodes : SecureThing.createFilteredProperty("childNodes"),
		children : SecureThing.createFilteredProperty("children"),
		
		getAttribute: SecureThing.createPassThroughMethod("getAttribute"),
		setAttribute: SecureThing.createPassThroughMethod("setAttribute"),

		ownerDocument : SecureThing.createFilteredProperty("ownerDocument"),
		parentNode : SecureThing.createFilteredProperty("parentNode"),

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

	return SecureElement;
})();