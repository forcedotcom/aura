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
	this.cache = {};
};

MemoryStorageAdapter.prototype.getName = function() {
	return "memory";
};

MemoryStorageAdapter.prototype.getItem = function(key) {
	return this.cache[key];
};

MemoryStorageAdapter.prototype.setItem = function(key, value) {
	this.cache[key] = value;
};

MemoryStorageAdapter.prototype.removeItem = function(key) {
	delete this.cache[key];
};