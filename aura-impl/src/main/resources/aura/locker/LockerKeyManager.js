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
  * exported on window and available outside of Aura Framework). Those replace & expand the functions
  * getLockerSecret and setLockerSecret use in previous iterations of LockerService.
  */

var ls_created,
    ls_getKey,
    ls_setKey,
    ls_trust,
    ls_hasAccess,
    ls_verifyAccess,
    ls_getRef,
    ls_setRef,
    ls_isOpaque,
    ls_unwrap,
    ls_addToCache,
    ls_getFromCache;

(function LockerKeyManager() {

    // Prevent reinitialization (design limitation).
    if (ls_created) {
        throw new Error("Only one instance of Locker Service can be created");
    }
    ls_created = true;

    // Keyed objects can only have one owner. We prevent "null" and "undefined"
    // keys by guarding all set operations.
    var keychain = new WeakMap();      // Replaces $lskey
    var rawToSecureByKey = new Map();  // Replaces rawToSecureObjectCaches
    var secureToRaw = new WeakMap();   // Replaces $lsref
    var opaqueSecure = new WeakMap();  // Replaces $lsopaque

    // ALL METHODS BELOW USE KEY ONLY

    /**
     * LockerService internal API.
     * Gets the key associated to a thing. The existence of a key means
     * the object has already been trusted.
     * replaces getLockerSecret(thing, "key").
     */
    ls_getKey = function(thing) {
        return keychain.get(thing);
    };

    /**
     * LockerService internal API.
     * Sets the key on a thing to mark it trusted. Trustred objects can't
     * have multiple keys, and we throw if there is an attempt to override
     * an existing key.
     * Replaces setLockerSecret(thing, "key") used previously.
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
     * The trust opertion propagtes the key to the thing being trusted.
     * This method is used when the key is not known.
     * Moved from $A.lockerService.trust().
     */
    ls_trust = function(from, thing) {
        var key = keychain.get(from);
        if (key) {
            ls_setKey(thing, key);
        }
    };

    /**
     * LockerService internal API.
     * Compare the keys of two objects.
     * Moved from $A.lockerService.util.hasAccess().
     */
    ls_hasAccess = function(from, to) {
        return keychain.get(from) === keychain.get(to);
    };

    /**
     * LockerService internal API.
     * Assert that the keys of two objects are the same,
     * and, optionally, that the target object is not opaque.
     * Moved from $A.lockerService.util.verifyAccess().
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
     * Replaces getLockerSecret(st, "ref").
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
     * Replaces setLockerSecret(st, "key", key), setLockerSecret(st, "ref", raw),
     * and optionally $A.lockerService.markOpaque(st);
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
     * Returns whether or not the provided object has been marked opaque.
     * Moved from $A.lockerService.isOpaque(st).
     */
    ls_isOpaque = function(st) {
        return opaqueSecure.get(st) === true;
    };

    /**
     * LockerService internal API.
     * Verify access and retrieve the raw object,
     * optionally verifying whether the object is opaque.
     * This method is used when the key is not known.
     * Moved from $A.lockerService.unwrap().
     */
    ls_unwrap = function(from, st, skipOpaque) {
        var key = keychain.get(from);
        return ls_getRef(st, key, skipOpaque);
    };

    /**
     * LockerService internal API.
     * Stores a SecureType under the provided raw object and key
     * to reduce cost of re-creation and improve identity continuity.
     * Moved from SecureObject.addToCache().
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
     * Moved from SecureObject.getCached().
     */
    ls_getFromCache = function(raw, key) {
        var rawToSecure = rawToSecureByKey.get(key);
        return rawToSecure && rawToSecure.get(raw);
    };
}());
