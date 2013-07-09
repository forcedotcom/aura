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

//#include aura.storage.adapters.SizeEstimator

/**
 * @namespace The value Object used in the backing store of the MemoryStorageAdapter.
 * @constructor
 */
var MemoryStorageValue = function MemoryStorageValue(item, size) {
	this.item = item;
	this.size = size;
};

MemoryStorageValue.prototype.getItem = function() {
	return this.item;
};

MemoryStorageValue.prototype.getSize = function() {
	return this.size;
};

/**
 * @namespace The Memory adapter for storage service implementation
 * @constructor
 */
var MemoryStorageAdapter = function MemoryStorageAdapter(config) {
	this.backingStore = {};
	this.mru = [];
	this.cachedSize = 0;
	this.isDirtyForCachedSize = false;
	this.sizeEstimator = new SizeEstimator();
	this.maxSize = config["maxSize"];
	this.debugLoggingEnabled = config["debugLoggingEnabled"];
};

MemoryStorageAdapter.NAME = "memory";

MemoryStorageAdapter.prototype.getName = function() {
	return MemoryStorageAdapter.NAME;
};

MemoryStorageAdapter.prototype.getSize = function() {
	if (this.isDirtyForCachedSize === true) {
		var newSize = 0;
		for (var key in this.backingStore) {
			var backingStoreValue = this.backingStore[key];
			newSize += backingStoreValue.getSize();
		}
		
		this.cachedSize = newSize;
		this.isDirtyForCachedSize = false;
	}
	
	return this.cachedSize;
};

MemoryStorageAdapter.prototype.getItem = function(key, resultCallback) {
	var value = this.backingStore[key];
	if (!$A.util.isUndefinedOrNull(value)) {
		// Update the MRU
		var index = $A.util.arrayIndexOf(this.mru, key);
		this.mru.splice(index, 1);
		this.mru.push(key);

		resultCallback(value.getItem());
	} else {
		resultCallback();
	}
};

MemoryStorageAdapter.prototype.setItem = function(key, item) {
	// For the size calculation, consider only the inputs to the storage layer: key and value
	// Ignore all the extras added by the Storage layer.
	var size = this.sizeEstimator.estimateSize(key) + this.sizeEstimator.estimateSize(item["value"]);
	
	if (size > this.maxSize) {
            $A.error("MemoryStorageAdapter.setItem() cannot store an item over the maxSize");
            return;
	}
	
	var spaceNeeded = (size + this.getSize()) - this.maxSize;
	if (spaceNeeded > 0) {
            this.evict(spaceNeeded);
	}
	
	var value = new MemoryStorageValue(item, size);
	this.backingStore[key] = value;
	
	// Update the MRU
	this.mru.push(key);
	
	this.isDirtyForCachedSize = true;
};

MemoryStorageAdapter.prototype.removeItem = function(key) {
	// Update the MRU
	var value = this.backingStore[key];
	
	var index = $A.util.arrayIndexOf(this.mru, key);
	if (index >= 0) {
		this.mru.splice(index, 1);
	}
	
	delete this.backingStore[key];
	
	this.isDirtyForCachedSize = true;
	
	return value;
};

MemoryStorageAdapter.prototype.clear = function(key) {
	this.backingStore = {};
	this.cachedSize = 0;
	this.isDirtyForCachedSize = false;
};

MemoryStorageAdapter.prototype.getExpired = function(resultCallback) {
	var now = new Date().getTime();
	var expired = [];
	
	for (var key in this.backingStore) {
		var expires = this.backingStore[key].getItem()["expires"];
		if (now > expires) {
			expired.push(key);
		}
	}
	
	resultCallback(expired);
};

MemoryStorageAdapter.prototype.evict = function(spaceNeeded) {
	var spaceReclaimed = 0;
	while (spaceReclaimed < spaceNeeded && this.mru.length > 0) {
		var key = this.mru[0];
		var value = this.removeItem(key);
		spaceReclaimed += value.getSize();
		
		if (this.debugLoggingEnabled) {
			$A.log("MemoryStorageAdapter.evict(): evicted", [key, value, spaceReclaimed]);
		}
	}
};

MemoryStorageAdapter.prototype.getSizeEstimator = function() {
	return this.sizeEstimator;
};

// #if {"excludeModes" : ["PRODUCTION", "PRODUCTIONDEBUG"]}
MemoryStorageAdapter.prototype.getMRU = function() {
	return this.mru;
};
// #end

//#include aura.storage.adapters.MemoryAdapter_export

$A.storageService.registerAdapter({ 
	"name": MemoryStorageAdapter.NAME, 
	"adapterClass": MemoryStorageAdapter,
	"secure": true
});
