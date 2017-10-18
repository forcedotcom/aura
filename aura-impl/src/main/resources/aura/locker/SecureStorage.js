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
 * Construct a SecureStorage.
 *
 * @public
 * @class
 * @constructor
 *
 * @param {Object}
 *            storage - localStorage or sessionStorage (or any object that implements the Storage interface https://developer.mozilla.org/en-US/docs/Web/API/Storage)
 * @param {Object}
 *            key - the key to apply to the secure navigator
 */
function SecureStorage(storage, type, key) {
	"use strict";
	
    var o = ls_getFromCache(storage, key);
    if (o) {
        return o;
    }
    
    // Read existing key to synthetic key index from storage
    var stringizedKey = JSON.stringify(key);
    var nextSyntheticKey = "LSSNextSynthtic:" + type;
    var storedIndexKey = "LSSIndex:" + type + stringizedKey;
    var nameToSyntheticRaw;
	try {
		nameToSyntheticRaw = storage.getItem(storedIndexKey);
	} catch(e) {
		// There is a bug in google chrome where localStorage becomes inaccessible.
		// Don't fast fail and break all applications. Defer the exception throwing to when the app actually uses localStorage
	}
    var nameToSynthetic = nameToSyntheticRaw ? JSON.parse(nameToSyntheticRaw) : {};
    
    function persistSyntheticNameIndex() {
		// Persist the nameToSynthetic index
		var stringizedIndex = JSON.stringify(nameToSynthetic);
		storage.setItem(storedIndexKey, stringizedIndex);		
    }

    function getSynthetic(name) {
		var synthetic = nameToSynthetic[name];
		if (!synthetic) {
			var nextSynthticRaw = storage.getItem(nextSyntheticKey);
			var nextSynthetic = nextSynthticRaw ? Number(nextSynthticRaw) : 1;
			
			synthetic = nextSynthetic++;
			
			// Persist the next synthetic counter
			storage.setItem(nextSyntheticKey, nextSynthetic);
			
			nameToSynthetic[name] = synthetic;
			
			persistSyntheticNameIndex();	
		}
		
		return synthetic;
    }
    
    function forgetSynthetic(name) {
		var synthetic = getSynthetic(name);
		if (synthetic) {
			delete nameToSynthetic[name];
			persistSyntheticNameIndex();	
		}
    }
    
	o = Object.create(null, {
		toString: {
			value: function() {
				return "SecureStorage: " + type + " { key: " + JSON.stringify(key) + " }";
			}
		},
		
		length: {
			get: function() {
				return Object.keys(nameToSynthetic).length;
			}
		},

		getItem: {
			value: function(name) {
				var synthetic = getSynthetic(name);
				return synthetic ? storage.getItem(synthetic) : null;
			}
		},
		
		setItem: {
			value: function(name, value) {
				var synthetic = getSynthetic(name);			
				storage.setItem(synthetic, value);
			}
		},
		
		removeItem: {
			value: function(name) {
				var syntheticKey = getSynthetic(name);
				if (syntheticKey) {
					storage.removeItem(syntheticKey);
					forgetSynthetic(name);
				}
			}
		},
		
		key: {
			value: function(index) {
				return Object.keys(nameToSynthetic)[index];
			}
		},
		
		clear: {
			value: function() {
				Object.keys(nameToSynthetic).forEach(function(name) {
					var syntheticKey = getSynthetic(name);
					storage.removeItem(syntheticKey);
				});

				// Forget all synthetic
				nameToSynthetic = {};
				storage.removeItem(storedIndexKey);
			}
		}
	});

    ls_setRef(o, storage, key);
    ls_addToCache(storage, o, key);
    ls_registerProxy(o);

	return o;
}
