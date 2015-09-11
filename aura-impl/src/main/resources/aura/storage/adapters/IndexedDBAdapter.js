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
 * @description The IndexedDB adapter for Aura Storage Service.
 *
 * Some notes on the implementation:
 *
 * We do a single DB per table, which is wasteful, but simple. These databases are scoped to the page,
 * and so should not conflict across different applications. They are shared within a single app (as you
 * would expect).
 * TODO this is not accurate. Each table name gets its own DB. Instances across app/cmp are stored in
 * the same DB.
 *
 * Sizing is approximate, and updates to sizes are very approximate. We recalculate when our error bars get
 * too big, or after a certain number of updates. This is locked to happen no more than once every 15 minutes
 * if our size is not over the limit.
 *
 * We sweep the database in three cases.
 * (1) getAll, since we have to.
 * (2) size or error bar over the limit.
 * (3) getSize, with an old size guess.
 * Sweeping the database always recalculates size, and if we are over the limit, we will re-sweep to clean the DB.
 *
 * @constructor
 */
var IndexedDBAdapter = function IndexedDBAdapter(config) {
    this.instanceName = config["name"];
    this.sizeMax = config["maxSize"];
    this.debugLoggingEnabled = config["debugLoggingEnabled"];
    this.db = undefined;
    this.ready = undefined;
    this.pendingRequests = [];

    // FIXME: fix size calculation
    this.sizeLastReal = 0;
    this.sizeGuess = 0;
    this.sizeErrorBar = 0;
    this.sizeAge = 1000000;
    this.sizeAvg = 100;

    this.sizeMistake = 0;
    this.sizeMistakeMax = 0;
    this.sizeMistakeCount = 0;
    this.sizeOutsideErrorBar = 0;

    this.lastSweep = 0;
    this.sweepInterval = 15*60*1000;        // 15 minutes
    this.expiresFudge = 10000;              // 10 seconds
    this.limitSweepHigh = 0.9*this.sizeMax; // 90%
    this.limitSweepLow = 0.7*this.sizeMax;  // 70%
    this.limitItem = 0.25*this.sizeMax;     // 25% for a single item.
    this.limitError = 0.5*this.sizeMax;     // 50% for the error bar

    var context = $A.getContext();
    // objectStore name is the descriptor of current app or cmp
    this.tableName = (context && (context.app || context.cmp)) || "store";

    this.initialize();
};

/** Name of the adapter */
IndexedDBAdapter.NAME = "indexeddb";

/**
 * Returns the name of the adapter, "indexeddb".
 * @public
 * @return {String} the name of this adapter ("indexeddb")
 */
IndexedDBAdapter.prototype.getName = function() {
    return IndexedDBAdapter.NAME;
};

/**
 * Initializes the adapter by setting up the DB and ObjectStore.
 * @private
 */
IndexedDBAdapter.prototype.initialize = function(version) {
    // Set version number when changing schema ie adding index, etc
    var dbRequest,
        that = this;
    if (version) {
        // version is dynamic because it needs to be incremented when we need to create an objectStore
        // for the current app or cmp. IndexedDB only allows modifications to db or objectStore during
        // version change. Hence, we check for the existence of the table and increment the version
        // if it needs to be created in setupDB().
        dbRequest = window.indexedDB.open(this.instanceName, version);
    } else {
        dbRequest = window.indexedDB.open(this.instanceName);
    }
    dbRequest.onupgradeneeded = function (e) {
        that.createTables(e);
    };
    dbRequest.onsuccess = function(e) {
        that.setupDB(e);
    };
    dbRequest.onerror = function(e) {
        // this means we have no storage.
        that.ready = false;
        var message = "open() - Error opening DB";
        message += (e.target.error && e.target.error.message) ? ": " + e.target.error.message : "";
        that.log("initialize(): " + message);
    };
    dbRequest.onblocked = function(/*error*/) {
        that.log("initialize() - blocked from opening DB, most likely by another open browser tab");
    };
};

/**
 * Returns an approximate size for the ObjectStore.
 * @return {Promise} a promise that resolves with the size.
 * @public
 */
IndexedDBAdapter.prototype.getSize = function() {
    var that = this;
    if (this.sizeAge < 50) {
        return Promise["resolve"](this.sizeGuess);
    } else {
        return this.enqueue(function(success, error) {
            that.walkInternal(success, error, false);
        });
    }
};

/**
 * Gets an item from the ObjectStore.
 * @param {String} key storage key of item to retrieve.
 * @return {Promise} a promise that resolves with the item or null if not found.
 */
IndexedDBAdapter.prototype.getItem = function(key) {
    var that = this;
    var execute = function(success, error) {
        that.getItemInternal(key, success, error);
    };
    return this.enqueue(execute);
};

/**
 * Gets all items from the ObjectStore.
 * @returns {Promise} a promise that resolves with an array of all items in the ObjectStore.
 */
IndexedDBAdapter.prototype.getAll = function() {
    var that = this;
    var execute = function(success, error) {
        that.walkInternal(success, error, true);
    };
    return this.enqueue(execute);
};

/**
 * Stores an item in the ObjectStore.
 * @param {String} key the key.key for the item
 * @param {Object} item the item to store.
 * @param {Number} size of item value
 * @return {Promise} a promise that resolves when the item is stored.
 */
IndexedDBAdapter.prototype.setItem = function(key, item, size) {
    var that = this;
    var execute = function(success, error) {
        that.setItemInternal(key, item, size, success, error);
    };
    return this.enqueue(execute);
};

/**
 * Removes an item from storage.
 * @param {String} key the key of the item to remove.
 * @return {Promise} a promise that resolves with the removed object or null if the item was not found.
 */
IndexedDBAdapter.prototype.removeItem = function(key) {
    var that = this;
    var execute = function(success, error) {
        that.removeItemInternal(key, success, error);
    };
    return this.enqueue(execute);
};

/**
 * Clears the ObjectStore.
 * @returns {Promise} a promise that resolves when clearing is complete.
 */
IndexedDBAdapter.prototype.clear = function() {
    var that = this;
    var execute = function(success, error) {
        that.clearInternal(success, error);
    };
    return this.enqueue(execute);
};

/**
 * Gets the expired items.
 * @return {Promise} a promise that resolves when the sweep is complete.
 */
IndexedDBAdapter.prototype.sweep = function() {
    var that = this;
    var execute = function(success, error) {
        that.expireCache(0, success, error);
    };
    return this.enqueue(execute);
};


/**
 * Initializes the structure with a new DB.
 * @private
 * @param {Event} event IndexedDB event
 */
IndexedDBAdapter.prototype.setupDB = function(event) {
    var db = event.target.result;
    var self = this;
    this.db = db;
    this.db.onerror = function(e) {
        self.log("setupDB(): error event received", e);
    };
    this.db.onabort = function(e) {
        self.log("setupDB(): abort event received", e);
    };
    this.db.onversionchange = function(e) {
        self.log("setupDB(): onversionchanged event received", e);
        e.target.close();
    };

    if (!db.objectStoreNames.contains(this.tableName)) {
        // objectStore does not exist so increment version so we can create it
        var currentVersion = db["version"];
        db.close();
        this.initialize(currentVersion + 1);
    } else {
        this.ready = true;
        this.executeQueue();
    }
};

/**
 * Creates tables in the DB.
 * @private
 * @param {Event} event IndexedDB event
 */
IndexedDBAdapter.prototype.createTables = function(event) {
    var db = event.target.result,
        transaction = event.target.transaction,
        objectStore;

    // these checks are required because IndexedDB will error on existing things

    if (!db.objectStoreNames.contains(this.tableName)) {
        // non existent table
        objectStore = db.createObjectStore(this.tableName, {"keyPath": "key"});
    } else if (transaction) {
        // existing table
        objectStore = transaction.objectStore(this.tableName);
    }

    if (objectStore) {
        if (!objectStore.indexNames.contains("expires")) {
            // check for existing index
            objectStore.createIndex("expires", "expires", {"unique": false});
        }
    }

};

/**
 * Runs the queue of requests.
 *
 * This method is part of the startup sequence, wherein we queue actions as they come in until the database is
 * ready. Once the database is ready, this function executes everything in the queue.
 * @private
 */
IndexedDBAdapter.prototype.executeQueue = function() {
    var queue = this.pendingRequests;
    var idx;

    this.pendingRequests = [];
    for (idx = 0; idx < queue.length; idx++) {
        queue[idx]["execute"](queue[idx]["success"], queue[idx]["error"]);
    }
};

/**
 * Enqueues a function to execute.
 * @param {function} execute the function to execute.
 * @return {Promise} a promise that resolves when the provided function executes.
 */
IndexedDBAdapter.prototype.enqueue = function(execute) {
    var that = this;
    var promise;

    if (this.ready === false) {
        promise = Promise["reject"](new Error("IndexedDBStorageAdapte.enqueue: database failed to initialize"));
    } else if (this.ready === undefined) {
        promise = new Promise(function(success, error) {
            that.pendingRequests.push({ "execute":execute, "success":success, "error":error });
            if (that.ready !== undefined) {
                // rare race condition.
                that.executeQueue();
            }
        });
    } else {
        promise = new Promise(function(success, error) { execute(success, error); });
    }
    return promise;
};


/**
 * Internal routine to complete the promise.
 * @param {String} key The key to retrieve.
 * @param {function} success the success callback from the promise
 * @param {function} error the error callback from the promise
 */
IndexedDBAdapter.prototype.getItemInternal = function(key, success, error) {
    var transaction = this.db.transaction([this.tableName], "readonly");
    var objectStore = transaction.objectStore(this.tableName);
    var objectStoreRequest = objectStore.get(key);
    transaction.onabort = function(event) {
        error(new Error("IndexedDBAdapter.getItem: Transaction aborted: "+event.error));
    };
    objectStoreRequest.onsuccess = function(event) {
        var item = event.target.result && event.target.result.item;
        item = item || null;
        success(item);
    };
    transaction.onerror = function(event) {
        error(new Error("IndexedDBAdapter.getItem: Transaction failed: "+event.error));
    };
};

/**
 * Walks everything in the DB (read only).
 * @param {function} success the success callback from the promise
 * @param {function} error the error callback from the promise
 * @param {boolean} sendResult true to resolve the promise with the full set of results; false to resolve with the size.
 */
IndexedDBAdapter.prototype.walkInternal = function(success, error, sendResult) {
    var transaction = this.db.transaction([this.tableName], "readonly");
    var objectStore = transaction.objectStore(this.tableName);
    var cursor = objectStore.openCursor();
    var result = [];
    var count = 0;
    var size = 0;
    var that = this;

    cursor.onsuccess = function(event) {
        var icursor = event.target.result;
        if (icursor) {
            var store = icursor.value;
            if (store) {
                size += store['size'];
                count += 1;
                if (sendResult) {
                    var sent = {
                        "key": store["key"],
                        "value": store["item"]["value"],
                        "expires": store["expires"]
                    };
                    result.push(sent);
                }
            }
            icursor['continue']();
        } else {
            that.refreshSize(size, count);
            if (that.sizeGuess > that.limitSweepHigh) {
                that.expireCache(0);
            }
            if (sendResult) {
                success(result);
            } else {
                success(that.sizeGuess);
            }
        }
    };
    cursor.onerror = function(event) {
        error(new Error("IndexedDBAdapter.getAll: Transaction failed: " + event.error));
    };
    cursor.onabort = function(event) {
        error(new Error("IndexedDBAdapter.getAll: Transaction aborted: " + event.error));
    };
};

/**
 * Sets an item in the ObjectStore.
 * @param {String} key the key to set.
 * @param {String} item the item to set for the key.
 * @param {Number} size of item value
 * @param {function} success the promise success callback.
 * @param {function} error the promise error callback.
 */
IndexedDBAdapter.prototype.setItemInternal = function(key, item, size, success, error) {
    var expires = +item["expires"];
    var that = this;
    if (!expires) {
        expires = new Date().getTime()+60000;
    }
    var storable = {
        "key":key,
        "item":item,
        "size":size,
        "expires": expires
    };

    // maxSize check happens in AuraStorage.
    // TODO: refactor size calculations
    if (size > this.limitItem) {
        error(new Error("IndexedDBAdapter.setItem(): Item larger than size limit of " + this.limitItem));
        return;
    }
    if (size + this.sizeGuess + this.sizeErrorBar > this.limitSweepHigh || this.sizeErrorBar > this.limitError) {
        this.expireCache(size);
    }
    var transaction = this.db.transaction([this.tableName], "readwrite");
    var objectStore = transaction.objectStore(this.tableName);
    this.updateSize(size/2, size/2);

    var objectStoreRequest = objectStore.put(storable);
    transaction.onabort = function(event) {
        error(new Error("IndexedDBAdapter.setItem: Transaction aborted: " + event.error));
    };
    objectStoreRequest.onsuccess = function() {
        success();
    };
    transaction.onerror = function(event) {
        that.log("setItemInternal(): DIED " + event.error);
        error(new Error("IndexedDBAdapter.setItem: Transaction failed: " + event.error));
    };
};

/**
 * Removes an item from the ObjectStore.
 * @param {String} key the key to remove.
 * @param {function} success the success callback from the promise.
 * @param {function} error the error callback from the promise.
 */
IndexedDBAdapter.prototype.removeItemInternal = function(key, success, error) {
    var transaction = this.db.transaction([this.tableName], "readwrite");
    var objectStore = transaction.objectStore(this.tableName);
    this.updateSize(-this.sizeAvg, this.sizeAvg);
    var removeRequest = objectStore['delete'](key);
    transaction.onabort = function(event) {
        error(new Error("IndexedDBAdapter.removeItem: Transaction aborted: " + event.error));
    };
    removeRequest.onsuccess = function() {
        success();
    };
    transaction.onerror = function(event) {
        error(new Error("IndexedDBAdapter.removeItem: Transaction failed: " + event.error));
    };
};

/**
 * Internal function to clear the ObjectStore.
 * @param {function} success the success callback for the promise.
 * @param {function} error the error callback from the promise.
 */
IndexedDBAdapter.prototype.clearInternal = function(success, error) {
    var transaction = this.db.transaction([this.tableName], "readwrite");
    var objectStore = transaction.objectStore(this.tableName);
    //FIXME: probably should do an object here.
    objectStore.clear();
    transaction.onabort = function(event) {
        error(new Error("IndexedDBAdapter.clear: Transaction aborted: " + event.error));
    };
    transaction.oncomplete = function() {
        success();
    };
    transaction.onerror = function(event) {
        error(new Error("IndexedDBAdapter.clear: Transaction failed: " + event.error));
    };
    this.setSize(0, 0);
};

/**
 * Expires cache entries and updates the cached size of the ObjectStore.
 *
 * Cache entries are evicted until requested size is freed. Algorithm evicts
 * items based on age; an LRU algorithm is not used which differentiates this
 * adapter from others.
 *
 * The rest of the ObjectStore is traversed to calculate the real size of the
 * persisted data.
 *
 * @param {number} requestedSize the size we want to free.
 */
IndexedDBAdapter.prototype.expireCache = function(requestedSize, success, error) {
    var now = new Date().getTime();
    if (this.lastSweep + this.sweepInterval > now && this.sizeGuess < this.limitSweepHigh) {
        this.log("expireCache(): shortcircuiting sweep, last sweep = "+this.lastSweep+", time = "+now);
        if (success) {
            success();
        }
        return;
    }
    this.lastSweep = now;
    try {
        var transaction = this.db.transaction([this.tableName], "readwrite");
        var objectStore = transaction.objectStore(this.tableName);
        var index = objectStore.index("expires");
        var expiredBound = IDBKeyRange.upperBound(now);
        var cursor = index.openCursor(expiredBound);
        var count = 0;
        var size = 0;
        var expiredSize = 0;
        var expireDate = now + this.expiresFudge;
        var that = this;
        var removeSize = requestedSize || 0;

        // if we are above the low water mark, sweep down to it.
        if (this.sizeGuess > this.limitSweepLow) {
            removeSize += this.sizeGuess-this.limitSweepLow;
        }
        this.log("expireCache(): sweeping to remove " + removeSize);
        cursor.onsuccess = function(event) {
            var icursor = event.target.result;
            if (icursor) {
                var store = icursor.value;
                if (store) {
                    if (store["expires"] < expireDate || expiredSize < removeSize) {
                        that.log("expireCache(): sweep removing " + icursor.primaryKey);
                        icursor['delete']();
                        expiredSize += store["size"];
                    } else {
                        size += store["size"];
                        count += 1;
                    }
                }
                icursor['continue']();
            } else {
                that.refreshSize(size, count);
                if (success) {
                    success();
                }
                if (size > that.limitSweepHigh) {
                    that.expireCache(0);
                }
            }
        };
        cursor.onerror = function(event) {
            if (error) {
                error(new Error("IndexedDBAdapter.getAll: Transaction failed: "+event.error));
            }
        };
        cursor.onabort = function(event) {
            if (error) {
                error(new Error("IndexedDBAdapter.getAll: Transaction aborted: "+event.error));
            }
        };
    } catch (e) {
        throw e;
    }
};

/**
 * Updates the guessed size of the ObjectStore.
 * @param {number} sizeChange the amount to change the size of the db.
 * @param {number} error a really random guess of the size of the error.
 */
IndexedDBAdapter.prototype.updateSize = function(sizeChange, error) {
    this.sizeGuess += sizeChange;
    this.sizeErrorBar += error;
    this.sizeAge += 1;
};

/**
 * Refreshes the cached size of the ObjectStore from real data.
 * @param {number} size the actual calculated size.
 * @param {number} count the number of items in the ObjectStore.
 * @private
 */
IndexedDBAdapter.prototype.refreshSize = function(size, count) {
    var mistake = this.sizeGuess - size;
    if (mistake < 0) {
        mistake = -mistake;
    }
    if (mistake > this.sizeMistakeMax) {
        this.sizeMistakeMax = mistake;
    }
    this.sizeMistake += mistake;
    this.sizeMistakeCount += 1;
    if (mistake > this.sizeErrorBar) {
        this.sizeOutsideErrorBar += 1;
    }

    this.log("refreshSize(): size calculation: current mistake = "+mistake+", avg mistake = "
        +(this.sizeMistake/this.sizeMistakeCount).toFixed(1)+", max mistake = "+this.sizeMistakeMax
        +", outside error bars = "+this.sizeOutsideErrorBar);
    this.setSize(size, count);
};

/**
 * Sets the cached size of the ObjectStore. Callers must provide sizes based
 * on real data, not estimates.
 *
 * @param {number} size the actual calculated size.
 * @param {number} count the number of items in the ObjectStore.
 * @private
 */
IndexedDBAdapter.prototype.setSize = function(size, count) {
    this.sizeLastReal = size;
    this.sizeGuess = size;
    this.sizeErrorBar = 0;
    this.sizeAge = 0;
    if (count > 0) {
        this.sizeAvg = size/count;
    }
};

/**
 * Logs a message.
 * @private
 */
IndexedDBAdapter.prototype.log = function (msg, obj) {
    if (this.debugLoggingEnabled) {
        $A.log("IndexedDBAdapter '" + this.instanceName + "' " + msg + ":", obj);
    }
};

/**
 * Deletes the ENTIRE DB which may contain ObjectStores belonging to other app/cmp.
 * @return {Promise} promise that deletes the entire database
 */
IndexedDBAdapter.prototype.deleteStorage = function() {
    var that = this;
    var execute = function(success, error) {
        that.deleteStorageInternal(success, error);
    };
    return this.enqueue(execute);
};

/**
 * Internal routine to delete the DB.
 * @private
 */
IndexedDBAdapter.prototype.deleteStorageInternal = function(success, error) {
    var that = this;

    // IE and Safari need to be explicitly closed otherwise may end up stuck in a blocked state
    this.db.close();

    var dbRequest = window.indexedDB.deleteDatabase(this.instanceName);
    dbRequest.onerror = function() {
        error(new Error("IndexedDBAdapter.deleteStorage: Database failed to be deleted"));
    };
    dbRequest.onsuccess = function() {
        that.log("deleteStorageInternal(): deleted successfully");
        success();
    };
    dbRequest.onblocked = function(/*error*/) {
        // Cannot error here because IE may come to this callback before success
        that.log("deleteStorageInternal(): blocked from being deleted");
    };
};



// Only register this adapter if the IndexedDB API is present
// disable support for Safari because its implementation is not reliable in iframe.
if (window.indexedDB &&
    !(navigator.userAgent.indexOf("Safari") !== -1 && navigator.userAgent.indexOf("Chrome") === -1)) {
    $A.storageService.registerAdapter({
        "name": IndexedDBAdapter.NAME,
        "adapterClass": IndexedDBAdapter,
        "persistent": true
    });
}

Aura.Storage.IndexedDBAdapter = IndexedDBAdapter;
