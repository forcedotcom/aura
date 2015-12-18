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

var SecureComponent = (function() {
	"use strict";

	function filterComponent(sc, value) {
		if (!$A.util.isComponent(value)) {
			return value;
		}

		// DCHASMAN TODO W-2837797 Figure out if we want to filter out sometimes, all of the time does not make sense e.g. for component.find()
		// return $A.lockerService.util.hasAccess(sc, value) ? $A.lockerService.wrapComponent(value, referencingKey) : undefined;

		return $A.lockerService.wrapComponent(value, $A.lockerService.util._getKey(sc, $A.lockerService.masterKey));
	}
	
	function SecureComponent(component, referencingKey) {
		SecureThing.call(this, referencingKey, "component");
		
		this._set("component", component, $A.lockerService.masterKey);
	}
	
	function getComponent(sc) {
		return sc._get("component", $A.lockerService.masterKey);
	}

	SecureComponent.prototype = Object.create(SecureThing.prototype, {
		toString : {
			value : function() {
				return "SecureComponent: " + getComponent(this) + "{ referencingKey: " + JSON.stringify($A.lockerService.util._getKey(this, $A.lockerService.masterKey)) + " }";
			}
		},

		"superRender" : {
			value : function() {
				return getComponent(this).superRender();
			}
		},

		"superRerender" : {
			value : function() {
				getComponent(this).superRerender();
			}
		},

		"superAfterRender" : {
			value : function() {
				getComponent(this).superAfterRender();
			}
		},

		"superUnender" : {
			value : function() {
				getComponent(this).superUnrender();
			}
		},

		"find" : {
			value : function(localId) {
				return filterComponent(this, getComponent(this).find(localId));
			}
		},

		"get" : {
			value : function(expression) {
				var value = getComponent(this).get(expression);
				if ($A.util.isArray(value)) {
					var result = [];
					for (var n = 0; n < value.length; n++) {
						var raw = value[n];
						if (!raw) {
							// Always
							result.push(raw);
						} else {
							var filtered = filterComponent(this, raw);
							if (filtered) {
								result.push(filtered);
							}
						}
					}

					value = result;
				} else {
					value = filterComponent(this, value);
				}

				return value;
			}
		},

		"set" : {
			value : function(expression, value) {
				// DCHASMAN TODO W-2837798 Figure out the correct access control model for set()
				getComponent(this).set(expression, value);
			}
		},

		"getElement" : {
			value : function() {
				var element = getComponent(this).getElement();
				$A.lockerService.util.verifyAccess(this, element);
				return SecureDocument.wrap(element);
			}
		},

		"getEvent" : {
			value : function(event) {
				return getComponent(this).getEvent(event);
			}
		},

		"isValid" : {
			value : function() {
				return getComponent(this).isValid();
			}
		}
	});
	
	SecureComponent.prototype.constructor = SecureComponent;

	return SecureComponent;
})();