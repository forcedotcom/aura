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
 * @namespace The SmartStore adapter for storage service implementation
 * @constructor
 */
var SmartStoreAdapter = function SmartStoreAdapter() {
};

SmartStoreAdapter.NAME = "smartstore";

SmartStoreAdapter.prototype.getName = function() {
	return SmartStoreAdapter.NAME;
};

SmartStoreAdapter.prototype.getSize = function() {
	return 0;
};

SmartStoreAdapter.prototype.getItem = function(key, resultCallback) {
	// DCHASMAN TODO
	
	resultCallback(undefined);
};

SmartStoreAdapter.prototype.setItem = function(key, item) {
	// DCHASMAN TODO
};

SmartStoreAdapter.prototype.removeItem = function(key) {
	// DCHASMAN TODO
};

SmartStoreAdapter.prototype.clear = function(key) {
	// DCHASMAN TODO
};

SmartStoreAdapter.prototype.getExpired = function(resultCallback) {
	var now = new Date().getTime();
	var expired = [];

	// DCHASMAN TODO
	
	resultCallback(expired);
};

$A.storageService.registerAdapter(SmartStoreAdapter.NAME, SmartStoreAdapter);

