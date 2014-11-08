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
 * @description The value Object used in the backing store of the MemoryStorageAdapter.
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
 * @description The Memory adapter for storage service implementation
 * @constructor
 */
var MemoryStorageAdapter = function MemoryStorageAdapter(config) {
	this.backingStore = {};
	this.mru = [];
	this.cachedSize = 0;
	this.isDirtyForCachedSize = false;
	this.maxSize = config["maxSize"];
	this.debugLoggingEnabled = config["debugLoggingEnabled"];
};

MemoryStorageAdapter.NAME = "memory";

MemoryStorageAdapter.prototype.getName = function() {
	return MemoryStorageAdapter.NAME;
};

MemoryStorageAdapter.prototype.getSize = function() {
    var that = this;
    var promise = $A.util.createPromise(function(success, error) {

        if (that.isDirtyForCachedSize === true) {
            var newSize = 0;
            for (var key in that.backingStore) {
                newSize += that.backingStore[key].getSize();
            }

            that.cachedSize = newSize;
            that.isDirtyForCachedSize = false;
        }

        success(that.cachedSize);
    });

    return promise;
};

MemoryStorageAdapter.prototype.getItem = function(key) {
    var that = this;
    var promise = $A.util.createPromise(function(success, error) {
        var value = that.backingStore[key];
        if (!$A.util.isUndefinedOrNull(value)) {
            // Update the MRU
            var index = $A.util.arrayIndexOf(that.mru, key);
            that.mru.splice(index, 1);
            that.mru.push(key);

            success(value.getItem());
        } else {
            success();
        }
    });

    return promise;
};

MemoryStorageAdapter.prototype.setItem = function(key, item) {
    var that = this;
    var promise = $A.util.createPromise(function(success, error) {
        // For the size calculation, consider only the inputs to the storage layer: key and value
        // Ignore all the extras added by the Storage layer.
        var size = $A.util.estimateSize(key) + $A.util.estimateSize(item["value"]);

        if (size > that.maxSize) {
            error("MemoryStorageAdapter.setItem() cannot store an item over the maxSize");
        }

        that.getSize()
            .then(function (adapterSize) { return (size + adapterSize) - that.maxSize; })
            .then(function(spaceNeeded) { that.evict(spaceNeeded); })
            .then(function() {
                that.backingStore[key] = new MemoryStorageValue(item, size);
                // Update the MRU
                that.mru.push(key);
                that.isDirtyForCachedSize = true;
                success();
            });
    });

    return promise;
};

MemoryStorageAdapter.prototype.removeItem = function(key) {
    var that = this;
    var promise = $A.util.createPromise(function(success, error) {
        // Update the MRU
        var value = that.backingStore[key];

        var index = $A.util.arrayIndexOf(that.mru, key);
        if (index >= 0) {
            that.mru.splice(index, 1);
        }

        delete that.backingStore[key];
        that.isDirtyForCachedSize = true;

        success(value);
    });

    return promise;
};

MemoryStorageAdapter.prototype.clear = function() {
    var that = this;
    var promise = $A.util.createPromise(function(success, error) {
        that.backingStore = {};
        that.cachedSize = 0;
        that.isDirtyForCachedSize = false;

        success();
    });

    return promise;
};

MemoryStorageAdapter.prototype.getExpired = function() {
    var that = this;
    var promise = $A.util.createPromise(function(success, error) {
        var now = new Date().getTime();
        var expired = [];

        for (var key in that.backingStore) {
            var expires = that.backingStore[key].getItem()["expires"];
            if (now > expires) {
                expired.push(key);
            }
        }

        success(expired);
    });

    return promise;
};

/**
 * Asynchronously removes items, starting with the least-recently-used, until spaceNeeded has been made available.
 * @param {Number} spaceNeeded The amount of space to free.
 * @returns {Promise} Returns a promise that will evict items.
 */
MemoryStorageAdapter.prototype.evict = function(spaceNeeded) {
    var that = this;
    var spaceReclaimed = 0;

    var promise = $A.util.createPromise(function(success, failure) {
        if (spaceReclaimed > spaceNeeded || that.mru.length <= 0) {
            success();
            return;
        }

        var pop = function() {
            var key = that.mru[0];
            that.removeItem(key)
                .then(function(itemRemoved) {
                    spaceReclaimed += itemRemoved.getSize();

                    if (that.debugLoggingEnabled) {
                        var msg = ["MemoryStorageAdapter.evict(): evicted", key, itemRemoved, spaceReclaimed].join(" ");
                        $A.log(msg);
                    }

                    if(spaceReclaimed > spaceNeeded || that.mru.length <= 0) {
                        success();
                    } else {
                        pop();
                    }
                });
        };
        pop();
    });

    return promise;
};

/**
 * Asynchronously gets the most-recently-used list.
 * @returns {Promise} Returns a Promise that will retrieve the mru.
 */
// #if {"excludeModes" : ["PRODUCTION", "PRODUCTIONDEBUG"]}
MemoryStorageAdapter.prototype.getMRU = function() {
    var that = this;
    return $A.util.createPromise(function(success, error) {
        success(that.mru);
    });
};
// #end

//#include aura.storage.adapters.MemoryAdapter_export

$A.storageService.registerAdapter({ 
	"name": MemoryStorageAdapter.NAME, 
	"adapterClass": MemoryStorageAdapter,
	"secure": true
});