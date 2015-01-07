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

/**
 * Returns item
 * @returns {*} item
 */
MemoryStorageValue.prototype.getItem = function() {
    return this.item;
};

/**
 * Returns size of item
 * @returns {Number} size of item
 */
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
    this.maxSize = config["maxSize"];
    this.debugLoggingEnabled = config["debugLoggingEnabled"];
};

MemoryStorageAdapter.NAME = "memory";

/**
 * Returns name of memory adapter, "memory"
 * @returns {String} name of memory adapter
 */
MemoryStorageAdapter.prototype.getName = function() {
    return MemoryStorageAdapter.NAME;
};

/**
 * Return adapter size used
 * @returns {Promise} Promise with size used in adapter
 */
MemoryStorageAdapter.prototype.getSize = function() {
    var that = this;
    var promise = new Promise(function(success) {
        success(that.cachedSize);
    });

    return promise;
};

/**
 * Retrieve item from storage
 *
 * @param {String} key storage key for item to retrieve
 * @returns {Promise} Promise with item
 */
MemoryStorageAdapter.prototype.getItem = function(key) {
    var that = this;
    var promise = new Promise(function(success, error) {
        var value = that.backingStore[key];
        if (!$A.util.isUndefinedOrNull(value)) {
            // Update the MRU
            that.updateMRU(key);
            success(value.getItem());
        } else {
            success();
        }
    });

    return promise;
};

/**
 * Get all items in storage
 * @returns {Promise} Promise with array of all items
 */
MemoryStorageAdapter.prototype.getAll = function() {
    var that = this;
    var promise = new Promise(function(success, error) {
        var store = that.backingStore;
        var values = [];
        for (var key in store) {
            if (store.hasOwnProperty(key)) {
                var value = store[key];
                if (!$A.util.isUndefinedOrNull(value)) {
                    values.push({
                        key: key,
                        value: value.getItem()
                    });
                    that.updateMRU(key);
                }
            }
        }
        success(values);
    });

    return promise;
};

/**
 * Update key in most recently used list
 * @param {String} key the key to update
 */
MemoryStorageAdapter.prototype.updateMRU = function(key) {
    var index = $A.util.arrayIndexOf(this.mru, key);
    if (index > -1) {
        this.mru.splice(index, 1);
        this.mru.push(key);
    }
};

/**
 * Store item into storage using key as reference
 *
 * @param {String} key key for item
 * @param {*} item item to store
 * @returns {Promise} Promise
 */
MemoryStorageAdapter.prototype.setItem = function(key, item) {
    var that = this;
    var promise = new Promise(function(success, error) {
        // For the size calculation, consider only the inputs to the storage layer: key and value
        // Ignore all the extras added by the Storage layer.
        var size = $A.util.estimateSize(key) + $A.util.estimateSize(item["value"]);

        if (size > that.maxSize) {
            error("MemoryStorageAdapter.setItem() cannot store an item over the maxSize");
            return;
        }

        // existing item ?
        var existingItem = that.backingStore[key],
            existingItemSize = 0;
        if (!$A.util.isUndefinedOrNull(existingItem)) {
            existingItemSize = existingItem.getSize();
        }

        var itemSize =  size - existingItemSize,
            spaceNeeded = itemSize + that.cachedSize - that.maxSize;

        that.backingStore[key] = new MemoryStorageValue(item, size);
        // Update the MRU
        that.mru.push(key);
        that.cachedSize += itemSize;
        that.evict(spaceNeeded);

        success();
    });

    return promise;
};

/**
 * Remove item from storage
 *
 * @param {String} key key referencing item to remove
 * @returns {Promise} Promise with removed item
 */
MemoryStorageAdapter.prototype.removeItem = function(key) {
    var that = this;
    var promise = new Promise(function(success, error) {
        // Update the MRU
        var value = that.backingStore[key];

        if (!$A.util.isUndefinedOrNull(value)) {
            var index = $A.util.arrayIndexOf(that.mru, key);
            if (index >= 0) {
                that.mru.splice(index, 1);
            }

            // adjust actual size
            that.cachedSize -= value.getSize();

            delete that.backingStore[key];
        }
        success(value);
    });

    return promise;
};

/**
 * Clear storage
 * @returns {Promise} Promise for clear
 */
MemoryStorageAdapter.prototype.clear = function() {
    var that = this;
    var promise = new Promise(function(success, error) {
        that.backingStore = {};
        that.cachedSize = 0;

        success();
    });

    return promise;
};

/**
 * Returns currently expired items
 * @returns {Promise} Promise with array of expired items
 */
MemoryStorageAdapter.prototype.getExpired = function() {
    var that = this;
    var promise = new Promise(function(success, error) {
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

    var promise = new Promise(function(success, failure) {
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

// #if {"excludeModes" : ["PRODUCTION", "PRODUCTIONDEBUG"]}
/**
 * Asynchronously gets the most-recently-used list.
 * @returns {Promise} Returns a Promise that will retrieve the mru.
 */
MemoryStorageAdapter.prototype.getMRU = function() {
    var that = this;
    return new Promise(function(success, error) {
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