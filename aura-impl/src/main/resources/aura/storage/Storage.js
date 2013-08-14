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
/**
 * @namespace The storage service implementation
 * @constructor
 * @param {Object} config The configuration describing the characteristics of the storage to be created.
 */
var AuraStorage = function AuraStorage(config) {
    this.adapter = config["adapter"];
    this.maxSize = config["maxSize"];
    this.defaultExpiration = config["defaultExpiration"] * 1000;
    this.defaultAutoRefreshInterval = config["defaultAutoRefreshInterval"] * 1000;
    this.debugLoggingEnabled = config["debugLoggingEnabled"];
    
    var clearStorageOnInit = config["clearStorageOnInit"];
    
	this.log("AuraStorage:ctor() initializing storage adapter using { name: \"" + config["name"] + "\", implementation: \""
			+ this.adapter.getName() + "\", maxSize: " + this.maxSize + ", defaultExpiration: " + this.defaultExpiration
			+ ", defaultAutoRefreshInterval: " + this.defaultAutoRefreshInterval + ", clearStorageOnInit: " + clearStorageOnInit + ", debugLoggingEnabled: " + this.debugLoggingEnabled + " }");
    
    if (clearStorageOnInit === true) {
    	this.log("AuraStorage.ctor(): clearing " + this.getName() + " storage on init");
    	this.adapter.clear();
    }
    
    //#if {"excludeModes" : ["PRODUCTION", "PRODUCTIONDEBUG"]}
    	this.adapter["getItem"] = this.adapter.getItem;
    	this["adapter"] = this.adapter;
    //#end
};

/**
 * Returns the name of the storage type. For example, "smartStore", "websql", or "memory".
 * @returns {String} The storage type.
 */
AuraStorage.prototype.getName = function() {
	return this.adapter.getName();
};

/**
 * Returns the current storage size in KB. 
 * @returns {number} The current storage size in KB.
 */
AuraStorage.prototype.getSize = function() {
	return this.adapter.getSize() / 1024.0;
};

/**
 * Returns the maximum storage size in KB. 
 * @returns {number} The maximum storage size in KB.
 */
AuraStorage.prototype.getMaxSize = function() {
	return this.maxSize / 1024.0;
};

/**
 * Returns the default auto-refresh interval in seconds. 
 * @returns {number} The default auto-refresh interval.
 */
AuraStorage.prototype.getDefaultAutoRefreshInterval = function() {
	return this.defaultAutoRefreshInterval;
};

/**
 * Clears the storage. 
 */
AuraStorage.prototype.clear = function() {
	this.adapter.clear();
};

/**
 * Gets an item from storage corresponding to the specified key.
 * <p>See Also: <a href="#help?topic=auraStorageService">Aura Storage Service</a></p>
 * @param {String} key The item key. This is the key used when the item was added to storage using put().
 * @param {Function} resultCallback The function that will be called asynchronously with the item that was fetched from the storage as its parameter.
 * @returns {Object} An item from storage.
 */
AuraStorage.prototype.get = function(key, resultCallback) {
	this.sweep();

	// This needs to also be asynchronous (callback) based to map to IndexedDB, WebSQL, SmartStore that are all async worlds
	var that = this;
	this.adapter.getItem(key, function(item) {
		var value;
		if (item && item.value) {
			value = item.value;
			
			that.log("AuraStorage.get(): using action found in " + that.getName() + " storage", [key, item]);
		}
	
		resultCallback(value);
	});
};

/**
 * Stores the value in storage using the specified key.
 * @param {String} key The key of the item to store. 
 * @param {Object} value The value of the item to store.
 */
AuraStorage.prototype.put = function(key, value) {
	this.sweep();

	var now = new Date().getTime();
	
	var item = {
		"value": value,	
		"created": now,
		"expires": now + this.defaultExpiration
	};
	
	this.adapter.setItem(key, item);

	this.log("AuraStorage.put(): persisting action to " + this.getName() + " storage", [key, item]);
	
	$A.storageService.fireModified();
};

/**
 * @private
 */
AuraStorage.prototype.remove = function(key, doNotFireModified) {
	this.adapter.removeItem(key);
	
	if (!doNotFireModified) {
		$A.storageService.fireModified();
	}
};

/**
 * @private
 */
AuraStorage.prototype.sweep = function() {
	// Do not sweep if we have lost our connection - we'll
	// ignore expiration until sweeping resumes
	if (!this._sweepingSuspended) {
		// Check simple expirations
		var removedSomething;
		var now = new Date().getTime();
		var that = this;
		this.adapter.getExpired(function(expired) {
			for (var n = 0; n < expired.length; n++) {
				var key = expired[n];
	
				that.log("AuraStorage.sweep(): expiring action from " + that.getName() + " storage adapter", key);
				that.remove(key, true);
				removedSomething = true;
			}
			
			if (removedSomething) {
				$A.storageService.fireModified();
			}
		});
	}
};

/**
 * Suspends sweeping. The storage adapter is removed if it is expired but sweeping can be suspended if the connection goes offline.
 */
AuraStorage.prototype.suspendSweeping = function() {
	this.log("AuraStorage.suspendSweeping()");

	this._sweepingSuspended = true;
};

/**
 * Resumes sweeping to remove expired storage adapters.
 */
AuraStorage.prototype.resumeSweeping = function() {
	this.log("AuraStorage.resumeSweeping()");

	this._sweepingSuspended = false;
	this.sweep();
};

/**
 * @private
 */
AuraStorage.prototype.log = function() {
	if (this.debugLoggingEnabled) {
		$A.log(arguments[0], arguments.length > 1 ? arguments[1] : undefined);
	}
};

//#include aura.storage.Storage_export
