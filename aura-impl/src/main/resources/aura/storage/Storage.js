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
var AuraStorage = function Storage(implementation, maxSize, defaultExpiration, defaultAutoRefreshInterval, debugLoggingEnabled) {
    this.adapter = this.createAdapter(implementation);
    this.metadata = {};
    this.size = 0;
    this.maxSize = maxSize;
    this.defaultExpiration = defaultExpiration * 1000;
    this.defaultAutoRefreshInterval = defaultAutoRefreshInterval * 1000;
    this.debugLoggingEnabled = debugLoggingEnabled;
};

AuraStorage.prototype.getName = function() {
	return this.adapter.getName();
};

AuraStorage.prototype.getSize = function() {
	return this.size / 1024.0;
};

AuraStorage.prototype.getMaxSize = function() {
	return this.maxSize / 1024.0;
};

AuraStorage.prototype.getDefaultAutoRefreshInterval = function() {
	return this.defaultAutoRefreshInterval;
};

AuraStorage.prototype.get = function(key) {
	this.sweep();

	// DCHASMAN TODO We need to switch this to be asynchronous (callback) based to map to IndexedDB, WebSQL, SmartStore that are all async worlds
	
	var value = this.adapter.getItem(key);

	if (!$A.util.isUndefined(value)) {
		this.log("Storage.get(): using action found in " + this.getName() + " storage (" + this.getSize() + "K)", [ key, value ]);
	}

	return value;
};

AuraStorage.prototype.put = function(key, value) {
	this.sweep();

	this.remove(key, true);

	var cost = key.length + this.calculateSize(value);
	
	if (this.size + cost > this.maxSize) {
		this.evict(cost);
	}
	
	this.adapter.setItem(key, value);

	this.size += cost;
	
	var expiration = this.defaultExpiration;
	var now = new Date().getTime();
	this.metadata[key] = {
		created : now,
		expires : now + this.defaultExpiration
	};

	this.log("Storage.put(): persisting action to " + this.getName() + " storage (" + this.getSize() + "K)", [ key, cost / 1024.0, value ]);
	
	this.fireModified();
};

AuraStorage.prototype.remove = function(key, doNotFireModified) {
	var value = this.adapter.getItem(key);

	this.adapter.removeItem(key);

	delete this.metadata[key];

	if (!$A.util.isUndefined(value)) {
		this.size -= key.length;
		if (value) {
			this.size -= this.calculateSize(value);
		}
	}
	
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
		for ( var toCheck in this.metadata) {
			if (now > this.metadata[toCheck].expires) {
				this.log("Storage.sweep(): expiring action from " + this.getName() + " storage adapter (" + this.getSize() + "K)", toCheck);
				this.remove(toCheck, true);
				removedSomething = true;
			}
		}
		
		if (removedSomething) {
			this.fireModified();
		}
	}
};

AuraStorage.prototype.suspendSweeping = function() {
	this.log("Storage.suspendSweeping()");

	this._sweepingSuspended = true;
};

AuraStorage.prototype.resumeSweeping = function() {
	this.log("Storage.resumeSweeping()");

	this._sweepingSuspended = false;
	this.sweep();
};

AuraStorage.prototype.evict = function(spaceNeeded) {
	this.log("Storage.evict(): Exceeded maximum space usage allowed in storage: DCHASMAN TODO implement LRU/expiry eviction strategy!", [spaceNeeded / 1024.0, this.getMaxSize() / 1024.0, this.getSize()]);
};

AuraStorage.prototype.calculateSize = function(value) {
	// DCHASMAN TODO create an object graph traversal size
	// algorithm
	return value ? $A.util["json"].encode(value).length : 0;
};

AuraStorage.prototype.fireModified = function() {
	// DCHASMAN TODO Only fire the event when in debug modes
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
		case "local":
			adapter = new LocalStorageAdapter();
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
            throw new Error ("Unknown storage adapter: " + implementation);
	}
	
	return adapter;
};


//#include aura.storage.Storage_export
