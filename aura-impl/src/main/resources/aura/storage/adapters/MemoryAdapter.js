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
 */
var MemoryAdapter = function MemoryAdapter(config) {
    this.reset();
    this.maxSize = config["maxSize"];
    this.instanceName = config["name"];
    this.debugLoggingEnabled = config["debugLoggingEnabled"];
};

MemoryAdapter.NAME = "memory";

/** Log levels */
MemoryAdapter.LOG_LEVEL = {
    INFO:    { id: 0, fn: "log" },
    WARNING: { id: 1, fn: "warning" }
};

/**
 * Resets memory objects.
 */
MemoryAdapter.prototype.reset = function() {
    this.backingStore = {};
    this.mru = [];
    this.cachedSize = 0; // bytes
};

/**
 * Returns the name of the adapter.
 * @returns {String} name of adapter
 */
MemoryAdapter.prototype.getName = function() {
    return MemoryAdapter.NAME;
};

/**
 * Returns adapter size.
 * @returns {Promise} a promise that resolves with the size in bytes
 */
MemoryAdapter.prototype.getSize = function() {
    return Promise["resolve"](this.cachedSize);
};

/**
 * Retrieves an item from storage.
 * @param {String} key key for item to retrieve
 * @returns {Promise} a promise that resolves with the item or undefined if not found
 */
MemoryAdapter.prototype.getItem = function(key) {
    var that = this;
    return new Promise(function(resolve) {
        var value = that.backingStore[key];
        if (value) {
            // Update the MRU
            that.updateMRU(key);
            resolve(value.getItem());
        } else {
            resolve();
        }
    });
};

/**
 * Gets all items in storage.
 * @returns {Promise} a promise that resolves with the an array of all items
 */
MemoryAdapter.prototype.getAll = function() {
    var that = this;
    return new Promise(function(resolve) {
        var store = that.backingStore;
        var values = [];
        var value, innerValue;
        for (var key in store) {
            if (store.hasOwnProperty(key)) {
                value = store[key];
                if (value) {
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
        resolve(values);
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
 * Stores an item in storage.
 * @param {String} key key for item
 * @param {Object} item item to store
 * @param {Number} size size of key + item in bytes
 * @returns {Promise} a promise that resolves when the item is stored
 */
MemoryAdapter.prototype.setItem = function(key, item, size) {
    var that = this;
    return new Promise(function(resolve) {
        var existingItem = that.backingStore[key];
        var existingItemSize = existingItem ? existingItem.getSize() : 0;
        var itemSize = size - existingItemSize;
        var spaceNeeded = itemSize + that.cachedSize - that.maxSize;

        that.backingStore[key] = new MemoryAdapter.Entry(item, size);

        // update the MRU
        var index = that.mru.indexOf(key);
        if (index > -1) {
            that.mru.splice(index, 1);
        }
        that.mru.push(key);

        that.cachedSize += itemSize;

        // async evict
        if (spaceNeeded > 0) {
            that.expireCache(spaceNeeded)
                .then(undefined, function(e) {
                    that.log(MemoryAdapter.LOG_LEVEL.WARNING, "setItem(): error during eviction", e);
                });
        }

        resolve();
    });
};

/**
 * Removes an item from storage.
 * @param {String} key key for item to remove
 * @returns {Promise} a promise that resolves when the item is removed
 */
MemoryAdapter.prototype.removeItem = function(key) {
    var that = this;
    return new Promise(function(resolve) {
        that.removeItemInternal(key);
        resolve();
    });
};

/**
 * Removes an item from storage.
 * @param {String} key key for item to remove
 */
MemoryAdapter.prototype.removeItemInternal = function(key) {
    var item = this.backingStore[key];

    if (item) {
        var index = this.mru.indexOf(key);
        if (index >= 0) {
            this.mru.splice(index, 1);
        }

        // adjust actual size
        this.cachedSize -= item.getSize();

        delete this.backingStore[key];
    }

    return item;
};

/**
 * Clears storage.
 * @returns {Promise} a promise that resolves when the store is cleared
 */
MemoryAdapter.prototype.clear = function() {
    var that = this;
    return new Promise(function(resolve) {
        that.reset();
        resolve();
    });
};


/**
 * Evicts items. Expired items are evicted first. If additional space is required then
 * items are evicted based on LRU.
 * @param {Number} spaceNeeded The amount of space to free. Specify 0 to remove only expired items.
 * @returns {Promise} a promise that resolves when the requested space is freed.
 */
MemoryAdapter.prototype.expireCache = function(spaceNeeded) {
    // no items to expire
    if (this.mru.length <= 0) {
        return Promise["resolve"]();
    }

    var that = this;
    return new Promise(function(resolve) {
        var spaceReclaimed = 0;
        var key;
        var item;

        // first evict expired items
        var now = +new Date();
        for (key in that.backingStore) {
            var expires = that.backingStore[key].getItem()["expires"];
            if (now > expires) {
                item = that.removeItemInternal(key);
                spaceReclaimed += item.getSize();
                that.log(MemoryAdapter.LOG_LEVEL.INFO, "evict(): evicted expired item with key " + key);
            }
        }

        // if more space is required then evict based on LRU
        while (spaceReclaimed < spaceNeeded && that.mru.length > 0) {
            key = that.mru[0];
            item = that.removeItemInternal(key);
            spaceReclaimed += item.getSize();
            that.log(MemoryAdapter.LOG_LEVEL.INFO, "evict(): evicted for size item with key " + key);
        }

        resolve();
    });
};


/**
 * Gets the most-recently-used list.
 * @returns {Promise} a promise that results with the an array of keys representing the MRU.
 */
MemoryAdapter.prototype.getMRU = function() {
    return Promise["resolve"](this.mru);
};

/**
 * Logs a message.
 * @param {MemoryAdapter.LOG_LEVEL} level log line level
 * @param {String} msg the log message.
 * @param {Object} [obj] optional log payload.
 * @private
 */
MemoryAdapter.prototype.log = function (level, msg, obj) {
    if (this.debugLoggingEnabled || level.id >= MemoryAdapter.LOG_LEVEL.WARNING.id) {
        $A[level.fn]("MemoryAdapter '"+this.instanceName+"' "+msg, obj);
    }
};


/**
 * Removes expired items
 * @returns {Promise} when sweep completes
 */
MemoryAdapter.prototype.sweep = function() {
    // evict expired items; 0 indicates min space to free
    return this.expireCache(0);
};

/**
 * Deletes this storage.
 * @returns {Promise} a promise that resolves when storage is deleted
 */
MemoryAdapter.prototype.deleteStorage = function() {
    this.reset();
    return Promise["resolve"]();
};

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
 * @returns {Object} the stored item
 */
MemoryAdapter.Entry.prototype.getItem = function() {
    return this.item;
};

/**
 * @returns {Number} the size of the cache entry in bytes
 */
MemoryAdapter.Entry.prototype.getSize = function() {
    return this.size;
};


$A.storageService.registerAdapter({
    "name": MemoryAdapter.NAME,
    "adapterClass": MemoryAdapter,
    "secure": true
});

Aura.Storage.MemoryAdapter = MemoryAdapter;

