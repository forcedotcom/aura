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
 * @namespace The IndexedDB adapter for storage service implementation
 * @constructor
 */
var IndexedDBStorageAdapter = function IndexedDBStorageAdapter(config) {
};

IndexedDBStorageAdapter.NAME= "indexeddb";

IndexedDBStorageAdapter.prototype.getName = function() {
	return IndexedDBStorageAdapter.NAME;
};

IndexedDBStorageAdapter.prototype.getSize = function() {
	return 0;
};

IndexedDBStorageAdapter.prototype.getItem = function(key, resultCallback) {
	// DCHASMAN TODO
	
	resultCallback(undefined);
};

IndexedDBStorageAdapter.prototype.setItem = function(key, item) {
	// DCHASMAN TODO
};

IndexedDBStorageAdapter.prototype.removeItem = function(key) {
	// DCHASMAN TODO
};

IndexedDBStorageAdapter.prototype.clear = function(key) {
	// DCHASMAN TODO
};

IndexedDBStorageAdapter.prototype.getExpired = function(resultCallback) {
	var now = new Date().getTime();
	var expired = [];

	// DCHASMAN TODO
	
	resultCallback(expired);
};


// DCHASMAN TODO Register IndexedDBAdapter when it is ready for prime time
/*$A.storageService.registerAdapter({ 
	"name": IndexedDBStorageAdapter.NAME, 
	"adapterClass": IndexedDBStorageAdapter,
	"persistent": true
});*/
