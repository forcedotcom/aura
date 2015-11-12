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
		return se._get("el", masterKey);
	}

	function getKey(se) {
		return LockerKeyUtil._getKey(se, masterKey);
	}
	
	function definePassThroughProperty(name) {
		return {
			get : function() {
				return getElement(this)[name];
			},
			set : function(value) {
				getElement(this)[name] = value;
			}
		};
	}
	
	function SecureElement(el, key) {
		SecureThing.call(this, key);
		
		LockerKeyUtil.applyKey(el, key);

		this._set("el", el, masterKey);

		Object.freeze(this);
	}

	SecureElement.prototype.constructor = SecureElement;
	SecureElement.prototype = Object.create(SecureThing.prototype, {
		toString : {
			value : function() {
				return "SecureElement: " + getElement(this) + "{ key: " + JSON.stringify(getKey(this)) + " }";
			}
		},
		
		id : definePassThroughProperty("id"),
		className : definePassThroughProperty("className"),

		appendChild : {
			value : function(child) {
				LockerKeyUtil.verifyAccess(this, child);

				if (child.$run) {
					child.$run();
				} else {
					var childEl = child.unwrap(masterKey);
					getElement(this).appendChild(childEl);
				}
			}
		},

		addEventListener : {
			value : function(event, callback, useCapture) {
				var that = this;
				var sCallback = function(event) {
					// Filter out any events not associated with our key
					if (LockerKeyUtil.hasAccess(that, event.target)) {

						// DCHASMAN TODO create SecureEvent class to allow delivery of bubbled events w/out exposing currentTarget etc
						// for (name in event) { if (event[name] instanceof Node) { console.log("Found something to wrap: " + name) } }

						// Wrap the source event in "this" in a secure element
						var sourceEvent = SecureDocument.wrap(this);

						callback.call(sourceEvent, event);
					}
				};

				getElement(this).addEventListener(event, sCallback, useCapture);
			}
		},

		unwrap : {
			value : function(mk) {
				if (mk !== masterKey) {
					throw new Error("Access denied");
				}

				return getElement(this);
			}
		},

		parentNode : {
			get : function() {
				var parentNode = getElement(this).parentNode;
				if (!parentNode) {
					return undefined;
				}

				LockerKeyUtil.verifyAccess(this, parentNode);

				return SecureDocument.wrap(parentNode);
			}
		}
	});

	// definePassThroughProperty(sel, el, "id");
	// definePassThroughProperty(sel, el, "className");

	return SecureElement;
})();