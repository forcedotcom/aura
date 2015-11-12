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


// Master key will be hidden by both locker shadowing and scope
var masterKey = Object.freeze({
	name : "master"
});


var LockerKeyUtil = (function() {
	"use strict";

	var lockerNamespaceKeys = {};

	function getKey(thing) {
		var f = thing["$lsKey"];
		return f ? f(masterKey) : undefined;
	}

	var util = {
		getKeyForNamespace : function(namespace) {
	    	// Get the locker key for this namespace
			var key = lockerNamespaceKeys[namespace];
			if (!key) {
	    		key = lockerNamespaceKeys[namespace] = Object.freeze({
	    			namespace: namespace
	    		});
			}
			
			return key;
		},
		
		_getKey : function(thing, mk) {
			if (mk !== masterKey) {
				throw Error("Access denied");
			}
			
			return getKey(thing); 
		},
		
		isKeyed : function(thing) {
			return getKey(thing) !== undefined;
		},
		
		hasAccess : function(from, to) {
			var fromKey = getKey(from);
			var toKey = getKey(to);

			return (fromKey === masterKey) || (fromKey === toKey);
		},

		verifyAccess : function(from, to) {
			if (!LockerKeyUtil.hasAccess(from, to)) {
				var fromKey = getKey(from);
				var toKey = getKey(to);

				throw new Error("Access denied: " + JSON.stringify({
					from : fromKey,
					to : toKey
				}));
			}
		},

		applyKey : function(thing, key) {
			var keyToCheck = getKey(thing);
			if (!keyToCheck) {
				Object.defineProperty(thing, "$lsKey", {
					value : function(mk) {
						if (mk !== masterKey) {
							throw new Error("Access denied");
						}

						return key;
					}
				});
			} else {
				if (keyToCheck !== key) {
					throw new Error("Re-keying of " + thing + " is prohibited");
				}
			}
		}
	};
	
	Object.freeze(util);
	
	return util;
})();

