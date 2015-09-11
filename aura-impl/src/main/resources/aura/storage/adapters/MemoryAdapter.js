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
 * @description The Javascript memory adapter for Aura Storage Service.
 * @constructor
 * @export
 */
var MemoryAdapter = function MemoryAdapter(config) {
    this.backingStore = {};
    this.mru = [];
    this.cachedSize = 0;
    this.maxSize = config["maxSize"];
    this.debugLoggingEnabled = config["debugLoggingEnabled"];
};

MemoryAdapter.NAME = "memory";

/**
 * Returns the name of memory adapter, "memory".
 * @returns {String} the name of this adapter ("memory")
 */
MemoryAdapter.prototype.getName = function() {
    return MemoryAdapter.NAME;
};

/**
 * Returns an approximate size of the storage.
 * @returns {Promise} a promise that resolves with the size.
 //#if {"excludeModes" : ["PRODUCTION", "PRODUCTIONDEBUG"]}
	@export
 //#end
 */
MemoryAdapter.prototype.getSize = function() {
    return Promise["resolve"](this.cachedSize);
};

/**
 * Gets item from storage.
 * @param {String} key storage key of item to retrieve.
 * @return {Promise} a promise that resolves with the item or null if not found.
 */
MemoryAdapter.prototype.getItem = function(key) {
    var that = this;
    return new Promise(function(success) {
        var value = that.backingStore[key];
        if (!$A.util.isUndefinedOrNull(value)) {
            // Update the MRU
            that.updateMRU(key);
            success(value.getItem());
        } else {
            success();
        }
    });
};

/**
 * Gets all items from storage.
 * @returns {Promise} a promise that resolves with an array of all items in storage.
 //#if {"excludeModes" : ["PRODUCTION", "PRODUCTIONDEBUG"]}
	@export
 //#end
 */
MemoryAdapter.prototype.getAll = function() {
    var that = this;
    return new Promise(function(success) {
        var store = that.backingStore;
        var values = [];
        var value, innerValue;
        for (var key in store) {
            if (store.hasOwnProperty(key)) {
                value = store[key];
                if (!$A.util.isUndefinedOrNull(value)) {
                    innerValue = value.getItem();
                    values.push({
                        "key": key,
                        "value": innerValue["value"],
                        "expires": innerValue["expires"]
                    });
                    that.updateMRU(key);
                }
            }
        }
        success(values);
    });
};

/**
 * Updates a key in the most recently used list.
 * @param {String} key the key to update
 */
MemoryAdapter.prototype.updateMRU = function(key) {
    var index = this.mru.indexOf(key);
    if (index > -1) {
        this.mru.splice(index, 1);
        this.mru.push(key);
    }
};

/**
 * Stores item into storage.
 * @param {String} key key for item
 * @param {*} item item item to store
 * @param {Number} size of item value
 * @returns {Promise} a promise that resolves when the item is stored.
 */
MemoryAdapter.prototype.setItem = function(key, item, size) {
    var that = this;
    return new Promise(function(success, error) {
        // existing item ?
        var existingItem = that.backingStore[key],
            existingItemSize = 0;
        if (!$A.util.isUndefinedOrNull(existingItem)) {
            existingItemSize = existingItem.getSize();
        }

        var itemSize =  size - existingItemSize,
            spaceNeeded = itemSize + that.cachedSize - that.maxSize;

        that.backingStore[key] = new MemoryAdapter.Entry(item, size);
        // Update the MRU
        that.mru.push(key);
        that.cachedSize += itemSize;

        // async evict
        that.evict(spaceNeeded);

        success();
    });
};

/**
 * Removes an item from storage.
 * @param {String} key the key of the item to remove.
 * @return {Promise} a promise that resolves with the removed object or null if the item was not found.
 */
MemoryAdapter.prototype.removeItem = function(key) {
    var that = this;
    return new Promise(function(success) {
        // Update the MRU
        var value = that.backingStore[key];

        if (!$A.util.isUndefinedOrNull(value)) {
            var index = that.mru.indexOf(key);
            if (index >= 0) {
                that.mru.splice(index, 1);
            }

            // adjust actual size
            that.cachedSize -= value.getSize();

            delete that.backingStore[key];
        }
        success(value);
    });
};

/**
 * Clears storage.
 * @returns {Promise} a promise that resolves when clearing is complete.
 */
MemoryAdapter.prototype.clear = function() {
    var that = this;
    return new Promise(function(success) {
        that.backingStore = {};
        that.cachedSize = 0;

        success();
    });
};

/**
 * Returns currently expired items.
 * @returns {Promise} a promise that resolves with an array of expired items
 */
MemoryAdapter.prototype.getExpired = function() {
    var that = this;
    return new Promise(function(success) {
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
};

/**
 * Removes items using an LRU algorithm until the requested space is freed.
 * @param {Number} spaceNeeded The amount of space to free.
 * @returns {Promise} a promise that resolves when the requested space is freed.
 */
MemoryAdapter.prototype.evict = function(spaceNeeded) {
    var that = this;
    var spaceReclaimed = 0;

    return new Promise(function(success) {
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
                        var msg = ["MemoryAdapter.evict(): evicted", key, itemRemoved, spaceReclaimed].join(" ");
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
};

// #if {"excludeModes" : ["PRODUCTION", "PRODUCTIONDEBUG"]}
/**
 * Gets the most-recently-used list.
 * @returns {Promise} a promise that results with the an array of keys representing the MRU.
 * @export
 */
MemoryAdapter.prototype.getMRU = function() {
    return Promise["resolve"](this.mru);
};
// #end

Aura.Storage.MemoryAdapter = MemoryAdapter;


/**
 * @description A cache entry in the backing store of the MemoryAdapter.
 * @constructor
 * @private
 */
MemoryAdapter.Entry = function Entry(item, size) {
    this.item = item;
    this.size = size;
};

/**
 * @returns {Object} the stored item.
 */
MemoryAdapter.Entry.prototype.getItem = function() {
    return this.item;
};

/**
 * @returns {Number} the size of the cache entry.
 */
MemoryAdapter.Entry.prototype.getSize = function() {
    return this.size;
};



$A.storageService.registerAdapter({
    "name": MemoryAdapter.NAME,
    "adapterClass": MemoryAdapter,
    "secure": true
});
