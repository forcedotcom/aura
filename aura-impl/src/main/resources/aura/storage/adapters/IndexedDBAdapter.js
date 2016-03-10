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
 * Implementation notes:
 *
 * Each store name gets its own DB. Each app gets its own ObjectStore (aka table). If the same
 * store name is used across apps (eg actions ) then a single DB contains multiple ObjectStores.
 * TODO - it'd be better scoped to have one DB per app with all its tables within.
 *
 * Sizing is approximate and updates to sizes are very approximate. We recalculate when our error bars get
 * too big or after a certain number of updates. This is locked to happen no more than once every 15 minutes
 * if our size is not over the limit.
 * TODO - revamp size calculations to be more understandable while still supporting multiple browser tabs
 *
 * Entire table scans are performed for:
 * (1) getAll, since we have to.
 * (2) size or error bar over the limit.
 * (3) getSize, with an old size guess.
 * (4) sweep, since we're already scanning the table.
 *
 *
 * @constructor
 */
var IndexedDBAdapter = function IndexedDBAdapter(config) {
    this.instanceName = config["name"];
    this.sizeMax = config["maxSize"];
    this.debugLoggingEnabled = config["debugLoggingEnabled"];
    this.db = undefined;
    // whether the ObjectStore is ready to service operations
    // undefined = being setup, true = ready, false = permanent error
    this.ready = undefined;
    // whether the ObjectStore should be cleared as part of the setup process
    this.clearBeforeReady = false;
    // requests received before this.ready is moved to true or false
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
    this.limitError = 0.5*this.sizeMax;     // 50% for the error bar

    // objectStore name is the descriptor of current app or cmp
    var context = $A.getContext();
    this.tableName = (context && (context.app || context.cmp)) || "store";

    this.sweepingSuspended = false;

    this.initialize();
};

/** Name of the adapter */
IndexedDBAdapter.NAME = "indexeddb";

/** Log levels */
IndexedDBAdapter.LOG_LEVEL = {
    INFO:    { id: 0, fn: "log" },
    WARNING: { id: 1, fn: "warning" }
};


/**
 * Returns the name of the adapter.
 * @returns {String} name of adapter
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

    // Firefox private browsing mode throws an uncatchable (except by window.onerror) InvalidStateError when
    // indexedDB.open is called. the onerror handler is also invoked which allows us to set the adapter to a
    // permanent error state. FYI Logging.js suppresses InvalidStateError messages.
    // see https://bugzilla.mozilla.org/show_bug.cgi?id=781982.

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
        var message = "initialize(): error opening DB";
        message += (e.target.error && e.target.error.message) ? ": "+e.target.error.message : "";
        that.log(IndexedDBAdapter.LOG_LEVEL.WARNING, message);
        // reject all pending operations
        that.executeQueue(false);
    };
    dbRequest.onblocked = function(/*error*/) {
        that.log(IndexedDBAdapter.LOG_LEVEL.INFO, "initialize(): blocked from opening DB, most likely by another open browser tab");
    };
};


/**
 * Returns adapter size.
 * @returns {Promise} a promise that resolves with the size in bytes
 */
IndexedDBAdapter.prototype.getSize = function() {
    var that = this;
    if (this.sizeAge < 50) {
        return Promise["resolve"](this.sizeGuess);
    } else {
        return this.enqueue(function(resolve, reject) {
            that.walkInternal(resolve, reject, false);
        });
    }
};

/**
 * Retrieves an item from storage.
 * @param {String} key key for item to retrieve
 * @returns {Promise} a promise that resolves with the item or undefined if not found
 */
IndexedDBAdapter.prototype.getItem = function(key) {
    var that = this;
    var execute = function getIem(resolve, reject) {
        that.getItemInternal(key, resolve, reject);
    };
    return this.enqueue(execute);
};

/**
 * Gets all items in storage.
 * @returns {Promise} a promise that resolves with the an array of all items
 */
IndexedDBAdapter.prototype.getAll = function() {
    var that = this;
    var execute = function getAll(resolve, reject) {
        that.walkInternal(resolve, reject, true);
    };
    return this.enqueue(execute);
};

/**
 * Suspends eviction.
 */
IndexedDBAdapter.prototype.suspendSweeping = function() {
    this.sweepingSuspended = true;
};

/**
 * Resumes eviction.
 */
IndexedDBAdapter.prototype.resumeSweeping = function() {
    this.sweepingSuspended = false;
};

/**
 * Stores an item in storage.
 * @param {String} key key for item
 * @param {Object} item item to store
 * @param {Number} size size of key + item in bytes
 * @returns {Promise} a promise that resolves when the item is stored
 */
IndexedDBAdapter.prototype.setItem = function(key, item, size) {
    var that = this;
    var execute = function setItem(resolve, reject) {
        that.setItemInternal(key, item, size, resolve, reject);
    };
    return this.enqueue(execute);
};

/**
 * Removes an item from storage.
 * @param {String} key key for item to remove
 * @returns {Promise} a promise that resolves when the item is removed
 */
IndexedDBAdapter.prototype.removeItem = function(key) {
    var that = this;
    var execute = function removeItem(resolve, reject) {
        that.removeItemInternal(key, resolve, reject);
    };
    return this.enqueue(execute);
};

/**
 * Clears storage on initialization, before any other operation is performed.
 */
IndexedDBAdapter.prototype.clearOnInit = function() {
    this.clearBeforeReady = true;
};

/**
 * Clears storage.
 * @returns {Promise} a promise that resolves when the store is cleared
 */
IndexedDBAdapter.prototype.clear = function() {
    var that = this;
    var execute = function(resolve, reject) {
        that.clearInternal(resolve, reject);
    };
    return this.enqueue(execute);
};

/**
 * Sweeps over the store to evict expired items.
 * @returns {Promise} a promise that resolves when the sweep is complete.
 */
IndexedDBAdapter.prototype.sweep = function() {
    var that = this;
    var execute = function(resolve, reject) {
        // 0 because we don't need any space freed. this causes expired items
        // to be evicted + brings the store size below max size (see evictMaxStoreSize).
        that.expireCache(0, resolve, reject);
    };
    return this.enqueue(execute);
};


/**
 * Initializes the structure with a new DB.
 * @param {Event} event IndexedDB event
 * @private
 */
IndexedDBAdapter.prototype.setupDB = function(event) {
    var db = event.target.result;
    var that = this;
    this.db = db;
    this.db.onerror = function(e) {
        that.log(IndexedDBAdapter.LOG_LEVEL.WARNING, "setupDB(): error event received", e);
    };
    this.db.onabort = function(e) {
        that.log(IndexedDBAdapter.LOG_LEVEL.WARNING, "setupDB(): abort event received", e);
    };
    this.db.onversionchange = function(e) {
        that.log(IndexedDBAdapter.LOG_LEVEL.INFO, "setupDB(): onversionchanged event received", e);
        e.target.close();
    };

    if (!db.objectStoreNames.contains(this.tableName)) {
        // objectStore does not exist so increment version so we can create it
        var currentVersion = db["version"];
        db.close();
        this.initialize(currentVersion + 1);
    } else {
        this.executeQueue(true);
    }
};

/**
 * Creates tables in the DB.
 * @param {Event} event IndexedDB event
 * @private
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
        // check for existing index
        if (!objectStore.indexNames.contains("expires")) {
            objectStore.createIndex("expires", "expires", {"unique": false});
        }
    }

};

/**
 * Runs the stored queue of requests.
 * @param {Boolean} readyState true if the adapter is ready; false if the adapter is in permanent error state
 * @private
 */
IndexedDBAdapter.prototype.executeQueue = function(ready) {
    var that = this;
    var promise;

    if (this.clearBeforeReady && ready) {
        promise = new Promise(function(resolve, reject) {
            that.clearInternal(resolve, reject);
        })
        .then(undefined, function() {
            // no-op to move promise to resolve state
        });
    } else {
        promise = Promise["resolve"]();
    }

    promise.then(function() {
        // finally flip the switch so subsequent requests are immediately processed
        that.ready = ready;

        var queue = that.pendingRequests;
        that.pendingRequests = [];

        for (var i = 0; i < queue.length; i++) {
            if (!that.ready) {
                // adapter is in permanent error state, reject all queued promises
                queue[i]["reject"](new Error(that.getInitializationError()));
            } else {
                // run the queued logic, which will resolve the promises
                queue[i]["execute"](queue[i]["resolve"], queue[i]["reject"]);
            }
        }
    });
};

/**
 * Gets the error message when adapter fails to initialize.
 * @private
 */
IndexedDBAdapter.prototype.getInitializationError = function() {
    return "IndexedDBAdapter '" + this.instanceName + "' adapter failed to initialize";
};

/**
 * Enqueues a function to execute.
 * @param {function} execute the function to execute
 * @return {Promise} a promise that resolves when the provided function executes
 */
IndexedDBAdapter.prototype.enqueue = function(execute) {
    var that = this;
    var promise;

    if (this.ready === false) {
        promise = Promise["reject"](new Error("IndexedDBStorageAdapte.enqueue: database failed to initialize"));
    } else if (this.ready === undefined) {
        promise = new Promise(function(resolve, reject) {
            that.pendingRequests.push({ "execute":execute, "resolve":resolve, "reject":reject });
            if (that.ready !== undefined) {
                // rare race condition.
                that.executeQueue();
            }
        });
    } else {
        promise = new Promise(function(resolve, reject) { execute(resolve, reject); });
    }
    return promise;
};


/**
 * Retrieves an item from storage.
 * @param {String} key key for item to retrieve
 * @param {Function} resolve promise resolve function
 * @param {Function} reject promise resolve function
 * @private
 */
IndexedDBAdapter.prototype.getItemInternal = function(key, resolve, reject) {
    var transaction = this.db.transaction([this.tableName], "readonly");
    var objectStore = transaction.objectStore(this.tableName);
    var objectStoreRequest = objectStore.get(key);
    var that = this;
    transaction.onabort = function(event) {
        var message = "getItemInternal(): transaction aborted for key "+key+": "+event.error;
        that.log(IndexedDBAdapter.LOG_LEVEL.WARNING, message);
        reject(new Error("IndexedDBAdapter."+message));
    };
    objectStoreRequest.onsuccess = function(event) {
        var item = event.target.result && event.target.result.item;
        item = item || undefined;
        resolve(item);
    };
    transaction.onerror = function(event) {
        var message = "getItemInternal(): transaction error for key "+key+": "+event.error;
        that.log(IndexedDBAdapter.LOG_LEVEL.WARNING, message);
        reject(new Error("IndexedDBAdapter."+message));
    };
};

/**
 * Walks everything in the DB (read only).
 * @param {Function} resolve promise resolve function
 * @param {Function} reject promise reject function
 * @param {Boolean} sendResult true to resolve the promise with the full set of results; false to resolve with the size.
 */
IndexedDBAdapter.prototype.walkInternal = function(resolve, reject, sendResult) {
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
                resolve(result);
            } else {
                resolve(that.sizeGuess);
            }
        }
    };
    cursor.onerror = function(event) {
        reject(new Error("IndexedDBAdapter.walkInternal: Transaction failed: "+event.error));
    };
    cursor.onabort = function(event) {
        reject(new Error("IndexedDBAdapter.walkInternal: Transaction aborted: "+event.error));
    };
};

/**
 * Stores an item in storage.
 * @param {String} key key for item
 * @param {Object} item item to store
 * @param {Number} size size of key + item in bytes
 * @param {Function} resolve promise resolve function
 * @param {Function} reject promise resolve function
 */
IndexedDBAdapter.prototype.setItemInternal = function(key, item, size, resolve, reject) {
    var expires = +item["expires"];
    var that = this;

    // TODO W-2795489 AuraStorage should always provide an expires value so each adapter
    // doesn't set its own default
    if (!expires) {
        expires = new Date().getTime() + 60000;
    }
    var storable = {
        "key":key,
        "item":item,
        "size":size,
        "expires": expires
    };

    // maxSize check happens in AuraStorage.
    if (size + this.sizeGuess + this.sizeErrorBar > this.limitSweepHigh || this.sizeErrorBar > this.limitError) {
        this.expireCache(size);
    }
    var transaction = this.db.transaction([this.tableName], "readwrite");
    var objectStore = transaction.objectStore(this.tableName);
    this.updateSize(size/2, size/2);

    try {
        var objectStoreRequest = objectStore.put(storable);
        transaction.onabort = function(event) {
            var message = "setItemInternal(): transaction aborted for key "+key+": "+event.error;
            that.log(IndexedDBAdapter.LOG_LEVEL.WARNING, message);
            reject(new Error("IndexedDBAdapter."+message));
        };
        objectStoreRequest.onsuccess = function() {
            resolve();
        };
        transaction.onerror = function(event) {
            var message = "setItemInternal(): transaction error for key "+key+": "+event.error;
            that.log(IndexedDBAdapter.LOG_LEVEL.WARNING, message);
            reject(new Error("IndexedDBAdapter."+message));
        };
    } catch (e) {
        reject(new Error("IndexedDBAdapter."+e.message));
    }
};

/**
 * Removes an item from storage.
 * @param {String} key key for item to remove
 * @param {Function} resolve promise resolve function
 * @param {Function} reject promise resolve function
 */
IndexedDBAdapter.prototype.removeItemInternal = function(key, resolve, reject) {
    var transaction = this.db.transaction([this.tableName], "readwrite");
    var objectStore = transaction.objectStore(this.tableName);
    this.updateSize(-this.sizeAvg, this.sizeAvg);
    var removeRequest = objectStore['delete'](key);
    transaction.onabort = function(event) {
        reject(new Error("IndexedDBAdapter.removeItem: Transaction aborted: "+event.error));
    };
    removeRequest.onsuccess = function() {
        resolve();
    };
    transaction.onerror = function(event) {
        reject(new Error("IndexedDBAdapter.removeItem: Transaction failed: "+event.error));
    };
};

/**
 * Clears storage.
 * @param {Function} resolve promise resolve function
 * @param {Function} reject promise reject function
 */
IndexedDBAdapter.prototype.clearInternal = function(resolve, reject) {
    var transaction = this.db.transaction([this.tableName], "readwrite");
    var objectStore = transaction.objectStore(this.tableName);
    //FIXME: probably should do an object here.
    objectStore.clear();
    transaction.onabort = function(event) {
        reject(new Error("IndexedDBAdapter.clear: Transaction aborted: "+event.error));
    };
    transaction.oncomplete = function() {
        resolve();
    };
    transaction.onerror = function(event) {
        reject(new Error("IndexedDBAdapter.clear: Transaction failed: "+event.error));
    };
    this.setSize(0, 0);
};

/**
 * Evicts cache entries and updates the cached size of the store.
 *
 * Cache entries are evicted until requested size is freed. Algorithm evicts
 * items based on age; an LRU algorithm is not used which differentiates this
 * adapter from others.
 *
 * The rest of the store is traversed to calculate the real size of the
 * persisted data.
 *
 * @param {Number} requestedSize the size to free in bytes
 * @param {Function} resolve promise resolve function
 * @param {Function} reject promise reject function
 */
IndexedDBAdapter.prototype.expireCache = function(requestedSize, resolve, reject) {
    var now = new Date().getTime();
    if (this.sweepingSuspended || (this.lastSweep + this.sweepInterval > now && this.sizeGuess < this.limitSweepHigh)) {
        if (resolve) {
            resolve();
        }
        return;
    }
    this.lastSweep = now;
    try {
        var transaction = this.db.transaction([this.tableName], "readwrite");
        var objectStore = transaction.objectStore(this.tableName);
        var index = objectStore.index("expires");
        var cursor = index.openCursor();
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
        this.log(IndexedDBAdapter.LOG_LEVEL.INFO, "expireCache(): sweeping to remove "+removeSize);
        cursor.onsuccess = function(event) {
            var icursor = event.target.result;
            if (icursor) {
                var store = icursor.value;
                if (store) {
                    if (store["expires"] < expireDate || expiredSize < removeSize) {
                        that.log(IndexedDBAdapter.LOG_LEVEL.INFO, "expireCache(): sweep removing "+icursor.primaryKey);
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

                if (resolve) {
                    // intentionally don't return: the sweep is done so resolve the promise
                    // but then check if we need to do an async sweep due to size
                    resolve();
                }
                if (size > that.limitSweepHigh) {
                    that.expireCache(0);
                }
            }
        };
        cursor.onerror = function(event) {
            if (reject) {
                reject(new Error("IndexedDBAdapter.getAll: Transaction failed: "+event.error));
            }
        };
        cursor.onabort = function(event) {
            if (reject) {
                reject(new Error("IndexedDBAdapter.getAll: Transaction aborted: "+event.error));
            }
        };
    } catch (e) {
        throw e;
    }
};

/**
 * Updates the guessed size of the store.
 * @param {Number} sizeChange the amount to change the size of the store.
 * @param {Number} error a really random guess of the size of the error.
 */
IndexedDBAdapter.prototype.updateSize = function(sizeChange, error) {
    this.sizeGuess += sizeChange;
    this.sizeErrorBar += error;
    this.sizeAge += 1;
};

/**
 * Refreshes the cached size of the store from real data.
 * @param {Number} size the actual calculated size.
 * @param {Number} count the number of items in the store.
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

    this.log(IndexedDBAdapter.LOG_LEVEL.INFO, "refreshSize(): size calculation: current mistake = "+mistake+", avg mistake = "
        +(this.sizeMistake/this.sizeMistakeCount).toFixed(1)+", max mistake = "+this.sizeMistakeMax
        +", outside error bars = "+this.sizeOutsideErrorBar);
    this.setSize(size, count);
};

/**
 * Sets the cached size of the store. Callers must provide sizes based
 * on real data, not estimates.
 * @param {number} size the actual calculated size.
 * @param {number} count the number of items in the store.
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
 * @param {IndexedDBAdapter.LOG_LEVEL} level log line level
 * @param {String} msg the log message
 * @param {Object} [obj] optional log payload
 * @private
 */
IndexedDBAdapter.prototype.log = function (level, msg, obj) {
    if (this.debugLoggingEnabled || level.id >= IndexedDBAdapter.LOG_LEVEL.WARNING.id) {
        $A[level.fn]("IndexedDBAdapter '"+this.instanceName+"' "+msg, obj);
    }
};

/**
 * Deletes the ENTIRE DB which may contain ObjectStores belonging to other app/cmp.
 * TODO W-2691320 - change db vs store name to avoid this issue.
 *
 * @return {Promise} a promise that deletes the entire database
 */
IndexedDBAdapter.prototype.deleteStorage = function() {
    var that = this;
    var execute = function deleteStorage(resolve, reject) {
        that.deleteStorageInternal(resolve, reject);
    };
    return this.enqueue(execute);
};

/**
 * Internal routine to delete the DB.
 * @private
 */
IndexedDBAdapter.prototype.deleteStorageInternal = function(resolve, reject) {
    var that = this;

    // IE and Safari need to be explicitly closed otherwise may end up stuck in a blocked state
    this.db.close();

    var dbRequest = window.indexedDB.deleteDatabase(this.instanceName);
    dbRequest.onerror = function() {
        var message = "deleteStorageInternal(): delete database error";
        that.log(IndexedDBAdapter.LOG_LEVEL.WARNING, message);
        reject(new Error("IndexedDBAdapter."+message));
    };
    dbRequest.onsuccess = function() {
        that.log(IndexedDBAdapter.LOG_LEVEL.INFO, "deleteStorageInternal(): deleted successfully");
        resolve();
    };
    dbRequest.onblocked = function(/*error*/) {
        // Cannot error here because IE may come to this callback before success
        that.log(IndexedDBAdapter.LOG_LEVEL.INFO, "deleteStorageInternal(): blocked from being deleted");
    };
};

/**
 * Registers IndexedDB adapter.
 */
IndexedDBAdapter.register = function() {
    // Always disable support for Safari (including embedded Safari eg Outlook) because its implementation is not reliable in iframe.
    if (navigator.userAgent.indexOf("AppleWebKit") !== -1 && navigator.userAgent.indexOf("Chrome") === -1) {
        return;
    }

    // Only register this adapter if the IndexedDB API is present
    if (!window.indexedDB) {
        return;
    }

    $A.storageService.registerAdapter({
        "name": IndexedDBAdapter.NAME,
        "adapterClass": IndexedDBAdapter,
        "persistent": true
    });
};

IndexedDBAdapter.register();

Aura.Storage.IndexedDBAdapter = IndexedDBAdapter;
