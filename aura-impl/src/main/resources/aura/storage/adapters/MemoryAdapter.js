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

/**
 * Resets memory objects
 */
MemoryAdapter.prototype.reset = function() {
    this.backingStore = {};
    this.mru = [];
    this.cachedSize = 0;
};

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
    return new Promise(function(success) {
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
        var index = that.mru.indexOf(key);
        if (index > -1) {
            that.mru.splice(index, 1);
        }
        that.mru.push(key);

        that.cachedSize += itemSize;

        // async evict
        that.evict(spaceNeeded)
        .then(undefined, function(error) {
            $A.warning("Failed to evict items from storage: " + error);
        });

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
        that.reset();
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

    return new Promise(function(success, reject) {
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
                            var msg = ["evicted", key, itemRemoved, spaceReclaimed].join(" ");
                            that.log(msg);
                        }

                        if(spaceReclaimed > spaceNeeded || that.mru.length <= 0) {
                            success();
                        } else {
                            pop();
                        }
                })["catch"](function(error) {
                    reject(error);
                });
        };
        pop();
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
 * Log message if debug logging is enabled
 */
MemoryAdapter.prototype.log = function(msg, obj) {
    if (this.debugLoggingEnabled) {
        $A.log("MemoryAdapter '" + this.instanceName + "' " + msg + ":", obj);
    }
};

/**
 * Removes expired items
 * @returns {Promise} when sweep completes
 */
MemoryAdapter.prototype.sweep = function() {
    var that = this;
    return this.getExpired().then(function (expired) {
        // note: expired includes any key prefix. and it may
        // include items with different key prefixes which
        // we want to expire first. thus remove directly from the
        // adapter to avoid re-adding the key prefix.

        if (expired.length === 0) {
            return;
        }

        var promiseSet = [];
        var key;
        for (var n = 0; n < expired.length; n++) {
            key = expired[n];
            that.log("sweep() - expiring item with key: " + key);
            promiseSet.push(that.removeItem(key));
        }

        // When all of the remove promises have completed...
        return Promise.all(promiseSet).then( //eslint-disable-line consistent-return
            function () {
                that.log("sweep() - complete");
            },
            function (err) {
                that.log("Error while sweep() was removing items: " + err);
            }
        );
    });
};

/**
 * delete storage simply resets memory object
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

Aura.Storage.MemoryAdapter = MemoryAdapter;

