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
  * This is internal Locker API. We can export those methods because we know that there is never
  * more than one LockerService instance created (otherwise these would be overwritten), and
  * because all Aura objects are created inside an IIC function (otherwise objects would be
  * exported on window and available outside of Aura Framework). 
  */

var ls_getKey,
    ls_setKey,
    ls_trust,
    ls_hasAccess,
    ls_verifyAccess,
    ls_getRef,
    ls_setRef,
    ls_getData,
    ls_setData,
    ls_isOpaque,
    ls_unwrap,
    ls_addToCache,
    ls_getFromCache,
    ls_isProxy,
    ls_registerProxy;

(function LockerKeyManager() {
	var substituteMapForWeakMap = false;
	if (typeof WeakMap !== "undefined" && typeof Proxy !== "undefined") {
		// Test for the Edge weakmap with proxies bug https://github.com/Microsoft/ChakraCore/issues/1662
		var map = new WeakMap();
		var proxyAsKey = new Proxy({}, {});
		map.set(proxyAsKey, true);
		substituteMapForWeakMap = map.get(proxyAsKey) !== true;
	}
	
    function newWeakMap() {
        return typeof WeakMap !== "undefined" ? (!substituteMapForWeakMap ? new WeakMap() : new Map()) : {
            /* WeakMap dummy polyfill */
            "get" : function() {
                return undefined;
            },
            "set" : function() {
            }
        };
    }

    function newMap() {
        return typeof Map !== "undefined" ? new Map() : {
            /* Map dummy polyfill */
            "get" : function() {
                return undefined;
            },
            "set" : function() {
            }
        };
    }

    // Keyed objects can only have one owner. We prevent "null" and "undefined"
    // keys by guarding all set operations.
    var keychain = newWeakMap();      
    var rawToSecureByKey = newMap(); 
    var secureToRaw = newWeakMap(); 
    var opaqueSecure = newWeakMap();
    var objectToKeyedData = newWeakMap();  
    var isSecureProxy = newWeakMap();

    // ALL METHODS BELOW USE KEY ONLY

    /**
     * LockerService internal API.
     * Gets the key associated to a thing. The existence of a key means
     * the object has already been trusted.
     */
    ls_getKey = function(thing) {
        return keychain.get(thing);
    };

    /**
     * LockerService internal API.
     * Sets the key on a thing to mark it trusted. Trustred objects can't
     * have multiple keys, and we throw if there is an attempt to override
     * an existing key.
     */
    ls_setKey = function(thing, key) {
        if (!thing) {
            return;
        }
        if (!key) {
            throw new Error("Setting an empty key is prohibited.");
        }
        var hasKey = keychain.get(thing);
        if (hasKey === undefined) {
            keychain.set(thing, key);
        } else if (hasKey === key) {
            // noop.
        } else {
            // Prevent keyed objects from being keyed again.
            throw new Error("Re-setting of key is prohibited.");
        }
    };

    /**
     * LockerService internal API.
     * The trust operation propagates the key to the thing being trusted.
     * This method is used when the key is not known.
     */
    ls_trust = function(from, thing) {
    	if (from) {
	        var key = keychain.get(from);
	        if (key) {
	            ls_setKey(thing, key);
	        }
    	}
    };

    /**
     * LockerService internal API.
     * Compare the keys of two objects.
     */
    ls_hasAccess = function(from, to) {
        return keychain.get(from) === keychain.get(to);
    };

    /**
     * LockerService internal API.
     * Assert that the keys of two objects are the same,
     * and, optionally, that the target object is not opaque.
     */
    ls_verifyAccess = function(from, to, skipOpaque) {
        var fromKey = keychain.get(from);
        var toKey = keychain.get(to);
        if (fromKey !== toKey || (skipOpaque && ls_isOpaque(to))) {
            throw new Error("Access denied: " + JSON.stringify({
                from : fromKey,
                to : toKey
            }));
        }
    };

    // ALL METHODS BELOW USE KEY & REF

    /**
     * LockerService internal API.
     * Verify access and retrieve the reference,
     * optionally verifying whether the object is opaque.
     */
    ls_getRef = function(st, key, skipOpaque) {
        var toKey = keychain.get(st);
        if (toKey !== key || (skipOpaque && opaqueSecure.get(st))) {
        	throw new Error("Access denied: " + JSON.stringify({
                from : key,
                to : toKey
            }));
        }

        return secureToRaw.get(st);
    };

    /**
     * LockerService internal API.
     * Trust a secure object and create a secure to raw relation. We combine the
     * two operations to leverage the setKey validation to prevent any change
     * to references and to opacity using a different key.
     */
    ls_setRef = function(st, raw, key, isOpaque) {
        if (!st) {
            throw new Error("Setting an empty reference is prohibited.");
        }
        if (!key) {
            throw new Error("Setting an empty key is prohibited.");
        }
        ls_setKey(st, key);
        secureToRaw.set(st, raw);
        if (isOpaque) {
            opaqueSecure.set(st, true);
        }
    };

    /**
     * LockerService internal API.
     * Given a object/key pair get the associated data object for the pair
     */
    ls_getData = function(object, key) {
        var keyedData = objectToKeyedData.get(object);
        return keyedData ? keyedData.get(key) : undefined;
    };

    /**
     * LockerService internal API.
     * Given a object/key pair set the associated data object for the pair
     */
    ls_setData = function(object, key, data) {
        var keyedData = objectToKeyedData.get(object);
        if (!keyedData) {
            keyedData = newWeakMap();
            objectToKeyedData.set(object, keyedData);
        }
        
        keyedData.set(key, data);
    };
    
    /**
     * LockerService internal API.
     * Returns whether or not the provided object has been marked opaque.
     */
    ls_isOpaque = function(st) {
        return opaqueSecure.get(st) === true;
    };

    /**
     * LockerService internal API.
     * Returns whether or not the provided object represents a secure proxy/wrapper.
     */
    ls_isProxy = function(st) {
        return isSecureProxy.get(st) === true;
    };
    
    /**
     * LockerService internal API.
     * Track the fact that st is a secure proxy or wrapper class.
     */
    ls_registerProxy = function(st) {
        isSecureProxy.set(st, true);
    };
    
    
    /**
     * LockerService internal API.
     * Verify access and retrieve the raw object.
     * This method is used when the key is not known.
     */
    ls_unwrap = function(from, st) {
    	if (!st) {
    		return st;
    	}
    	
        var key = keychain.get(from);        
        var ref;
        
        if (Array.isArray(st)) {
        	// Only getRef on "secure" arrays
        	if (secureToRaw.get(st)) {
                // Secure array - reconcile modifications to the filtered clone with the actual array
        		ref = ls_getRef(st, key);
        		
        		var originalLength = ref.length;
        		var insertIndex = 0;
        		for (var n = 0; n < st.length; n++) {
        			// Find the next available location that corresponds to the filtered projection of the array
        			while (insertIndex < originalLength && ls_getKey(ref[insertIndex]) !== key) {
        				insertIndex++;
        			}
        			
        			ref[insertIndex++] = ls_unwrap(from, st[n]);
        		}
        	} else {
        		ref = [];
        	}
        } else {
        	ref = ls_getRef(st, key);
        }
        
        return ref;
    };

    /**
     * LockerService internal API.
     * Stores a SecureType under the provided raw object and key
     * to reduce cost of re-creation and improve identity continuity.
     */
    ls_addToCache = function(raw, st, key) {
        if (!raw) {
            throw new Error("Caching an empty reference is prohibited.");
        }
        
        if (!key) {
            throw new Error("Caching with an empty key is prohibited.");
        }
        
        var rawToSecure = rawToSecureByKey.get(key);
        if (!rawToSecure) {
            rawToSecure = new WeakMap();
            rawToSecureByKey.set(key, rawToSecure);
        }
        
        rawToSecure.set(raw, st);
    };

    /**
     * LockerService internal API.
     * Retrieve the SecureType associated with the given raw object and key.
     */
    ls_getFromCache = function(raw, key) {
        var rawToSecure = rawToSecureByKey.get(key);
        return rawToSecure && rawToSecure.get(raw);
    };
}());
