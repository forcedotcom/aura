/*
 * Copyright (C) 2012 salesforce.com, inc.
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
 * @param {Object} adapter The backing data store that the storage service uses for persistence.
 * @param {Decimal} maxSize The physical cap on the amount of space the service will use before it attempts evictions.
 * @param {Decimal} defaultExpiration The default value of TTL in seconds.
 */
var AuraStorage = function AuraStorage(implementation, maxSize, defaultExpiration, defaultAutoRefreshInterval, debugLoggingEnabled, clearStorageOnInit) {
    this.adapter = this.createAdapter(implementation);
    this.maxSize = maxSize;
    this.defaultExpiration = defaultExpiration * 1000;
    this.defaultAutoRefreshInterval = defaultAutoRefreshInterval * 1000;
    this.debugLoggingEnabled = debugLoggingEnabled;
    
	this.log("AuraStorage:ctor() initializing storage adapter using { implementation: \""
			+ implementation + "\", defaultExpiration: " + defaultExpiration
			+ ", defaultAutoRefreshInterval: " + defaultAutoRefreshInterval + ", clearStorageOnInit: " + clearStorageOnInit + " }");
    
    if (clearStorageOnInit) {
    	this.log("AuraStorage.ctor(): clearing " + this.getName() + " storage on init");
    	this.adapter.clear();
    }
};

AuraStorage.prototype.getName = function() {
	return this.adapter.getName();
};

AuraStorage.prototype.getSize = function() {
	return this.adapter.getSize() / 1024.0;
};

AuraStorage.prototype.getMaxSize = function() {
	return this.maxSize / 1024.0;
};

AuraStorage.prototype.getDefaultAutoRefreshInterval = function() {
	return this.defaultAutoRefreshInterval;
};

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

AuraStorage.prototype.put = function(key, value) {
	this.sweep();

	// DCHASMAN TODO Revive cost based eviction
	/*if (this.size + cost > this.maxSize) {
		this.evict(cost);
	}*/
	
	var expiration = this.defaultExpiration;
	var now = new Date().getTime();
	
	var item = {
		"value": value,	
		"created": now,
		"expires": now + this.defaultExpiration
	};
	
	this.adapter.setItem(key, item);

	this.log("AuraStorage.put(): persisting action to " + this.getName() + " storage", [key, item]);
	
	this.fireModified();
};

AuraStorage.prototype.remove = function(key, doNotFireModified) {
	this.adapter.removeItem(key);
	
	if (!doNotFireModified) {
		this.fireModified();
	}
};

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
				that.fireModified();
			}
		});
	}
};

AuraStorage.prototype.suspendSweeping = function() {
	this.log("AuraStorage.suspendSweeping()");

	this._sweepingSuspended = true;
};

AuraStorage.prototype.resumeSweeping = function() {
	this.log("AuraStorage.resumeSweeping()");

	this._sweepingSuspended = false;
	this.sweep();
};

AuraStorage.prototype.evict = function(spaceNeeded) {
	this.log("AuraStorage.evict(): Exceeded maximum space usage allowed in storage: DCHASMAN TODO implement LRU/expiry eviction strategy!", [spaceNeeded / 1024.0, this.getMaxSize() / 1024.0, this.getSize()]);
};

AuraStorage.prototype.fireModified = function() {
	var e = $A.get("e.auraStorage:modified");
	if (e) {
		e.fire();
	}
};

/**
 * Gets the current storage implementation name.
 * @returns {String}
 */
AuraStorage.prototype.getName = function() {
    return this.adapter.getName();
};

AuraStorage.prototype.log = function() {
	if (this.debugLoggingEnabled) {
		$A.log(arguments[0], arguments.length > 1 ? arguments[1] : undefined);
	}
};

AuraStorage.prototype.createAdapter = function(implementation) {
	var adapter;
	switch (implementation.toLowerCase()) {
		case "memory":
			adapter = new MemoryStorageAdapter();
			break;
		case "websql":
			adapter = new WebSQLStorageAdapter();
			break;
		case "indexeddb":
			adapter = new IndexedDBStorageAdapter();
			break;
		case "smartstore":
			adapter = new SmartStoreAdapter();
			break;
		default:
            throw new Error ("AuraStorage: Unknown storage adapter '" + implementation + "'");
	}
	
	return adapter;
};


//#include aura.storage.Storage_export
