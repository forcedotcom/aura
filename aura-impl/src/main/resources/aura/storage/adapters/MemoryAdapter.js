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
 * @namespace The value Object used in the backing store of the MemoryStorageAdapter.
 * @constructor
 */
var MemoryStorageValue = function MemoryStorageValue(item) {
	this.setItem(item);
};

MemoryStorageValue.prototype.setItem = function(newItem) {
	this.item = newItem;
};

MemoryStorageValue.prototype.setSize = function(newSize) {
	this.size = newSize;
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
var MemoryStorageAdapter = function MemoryStorageAdapter() {
	/*
	 * Note on sizing.  The following values are taken from the ECMAScript specification, where available.
	 * Other values are guessed.
	 * 
	 * Source: http://www.ecma-international.org/publications/files/ECMA-ST/Ecma-262.pdf
	 */
	this.CHARACTER_SIZE = 2;
	this.NUMBER_SIZE = 8;
	// note: this value is not defined by the spec.
	this.BOOLEAN_SIZE = 4;

	this.backingStore = {};
	this.cachedSize = 0;
	this.isDirtyForCachedSize = false;
	
};

MemoryStorageAdapter.NAME = "memory";

MemoryStorageAdapter.prototype.getName = function() {
	return MemoryStorageAdapter.NAME;
};

MemoryStorageAdapter.prototype.getSize = function() {
	if (this.isDirtyForCachedSize === true) {
		var newSize = 0;
		for (var key in this.backingStore) {
			// the size might be cached for the item, in order to avoid an expensive recalculation
			var backingStoreValue = this.backingStore[key];
			var itemSize = backingStoreValue.getSize();
			if ($A.util.isUndefinedOrNull(itemSize)) {
				// For the size calculation, consider only the inputs to the storage layer: key and value
				// Ignore all the extras added by the Storage layer.
				itemSize = this.sizeOfString(key) + this.estimateSize(backingStoreValue.getItem()["value"]);
				backingStoreValue.setSize(itemSize);
			}
			newSize += itemSize;
		}
		this.cachedSize = newSize;
		this.isDirtyForCachedSize = false;
	}
	
	return this.cachedSize;
};

MemoryStorageAdapter.prototype.getItem = function(key, resultCallback) {
	var backingStoreValue = this.backingStore[key];
	if (!$A.util.isUndefinedOrNull(backingStoreValue)) {
		resultCallback(backingStoreValue.getItem());
	} else {
		resultCallback();
	}
};

MemoryStorageAdapter.prototype.setItem = function(key, item) {
	this.backingStore[key] = new MemoryStorageValue(item);
	this.isDirtyForCachedSize = true;
};

MemoryStorageAdapter.prototype.removeItem = function(key) {
	delete this.backingStore[key];
	this.isDirtyForCachedSize = true;
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

// Internals

MemoryStorageAdapter.prototype.sizeOfString = function(value) {
	return value.length * this.CHARACTER_SIZE;
};

MemoryStorageAdapter.prototype.estimateSize = function(value) {
	var bytes = 0;
	var typeOfValue = typeof value;

	if ('boolean' === typeOfValue) {
		bytes = this.BOOLEAN_SIZE;
	} else if ('string' === typeOfValue) {
		bytes = this.sizeOfString(value);
	} else if ('number' === typeOfValue) {
		bytes = this.NUMBER_SIZE;
	} else if ($A.util.isArray(value) || $A.util.isObject(value)) {
		// recursive case
		for (var i in value) {
			bytes += this.sizeOfString(i);
			bytes += 8; // an assumed existence overhead
			bytes += this.estimateSize(value[i]);
		}
	}

	return bytes;
};

$A.storageService.registerAdapter(MemoryStorageAdapter.NAME, MemoryStorageAdapter);