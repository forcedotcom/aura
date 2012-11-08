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
 * @namespace The Memory adapter for storage service implementation
 * @constructor
 */
var MemoryStorageAdapter = function MemoryStorageAdapter() {
	this.clear();
};

MemoryStorageAdapter.NAME = "memory";

MemoryStorageAdapter.prototype.getName = function() {
	return MemoryStorageAdapter.NAME;
};

MemoryStorageAdapter.prototype.getSize = function() {
	return this.currentSize;
};

MemoryStorageAdapter.prototype.getItem = function(key, resultCallback) {
	resultCallback(this.backingStore[key]);
};

MemoryStorageAdapter.prototype.setItem = function(key, item) {
	item.size = key.length + this.calculateSize(item["value"]);

	this.currentSize += item.size;
	this.backingStore[key] = item;
};

MemoryStorageAdapter.prototype.removeItem = function(key) {
	var item = this.backingStore[key];
	this.currentSize -= item.size;
	
	delete this.backingStore[key];
};

MemoryStorageAdapter.prototype.clear = function(key) {
	this.backingStore = {};
    this.currentSize = 0;
};

MemoryStorageAdapter.prototype.getExpired = function(resultCallback) {
	var now = new Date().getTime();
	var expired = [];
	
	for (var key in this.backingStore) {
		var expires = this.backingStore[key]["expires"];
		if (now > expires) {
			expired.push(key);
		}
	}
	
	resultCallback(expired);
};

// Internals

MemoryStorageAdapter.prototype.calculateSize = function(value) {
	// DCHASMAN TODO create an object graph traversal size algorithm
	return value ? $A.util["json"].encode(value).length : 0;
};


$A.storageService.registerAdapter(MemoryStorageAdapter);


