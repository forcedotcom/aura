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
 * (1) getAll(undefined), since we have to.
 * (2) size or error bar over the limit.
 * (3) getSize, with an old size guess.
 * (4) sweep, since we're already scanning the table.
 *
 * @constructor
 */
var IndexedDBAdapter = function IndexedDBAdapter(config) {
    this.instanceName = config["name"];
    this.sizeMax = config["maxSize"];
    this.debugLogging = config["debugLogging"];
    this.keyPrefix = config["keyPrefix"];

    this.db = undefined;

    // whether the adapter is ready to service operations
    // - undefined = being setup (requests are queued)
    // - true = ready (requests are immediately run)
    // - false = permanent error (requests are immediately rejected)
    this.ready = undefined;
    this.initializePromise = undefined;

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
    var appname = (context && (context.app || context.cmp));
    appname = appname || window.location.pathname;
    this.tableName = appname || "store";

    this.sweepingSuspended = false;

    // initialize()'s timer id
    this.initializeTimeoutId = undefined;
};

/** Name of the adapter */
IndexedDBAdapter.NAME = "indexeddb";

/** Log levels */
IndexedDBAdapter.LOG_LEVEL = {
    INFO:    { id: 0, fn: "log" },
    WARNING: { id: 1, fn: "warning" }
};

/** Max time for initialize to complete */
IndexedDBAdapter.INITIALIZE_TIMEOUT = 30 * 1000;


/**
 * Returns the name of the adapter.
 * @returns {String} name of adapter
 */
IndexedDBAdapter.prototype.getName = function() {
    return IndexedDBAdapter.NAME;
};


/**
 * Starts the initialization process.
 * @return {Promise} a promise that resolves when initialization has completed, or rejects if initialization has failed.
 */
IndexedDBAdapter.prototype.initialize = function() {
    if (this.initializePromise) {
        return this.initializePromise;
    }

    var that = this;
    this.initializePromise = new Promise(function(resolve, reject) {
        that.initializePromiseResolve = resolve;
        that.initializePromiseReject = reject;
    });
    this.initializeInternal();
    return this.initializePromise;
};


/**
 * Initializes the adapter by setting up the DB and ObjectStore.
 * @param {Number=} version Optional version value for IndexedDB.open(). Set
 *  to a new value if schema needs to change (eg new table, new index).
 * @private
 */
IndexedDBAdapter.prototype.initializeInternal = function(version) {
    var dbRequest;
    var that = this;

    // it's been observed that indexedDB.open() does not trigger any event when it is under significant
    // load (eg multiple frames concurrently calling open()). this hangs this adapter's init so apply
    // a maximum wait time before moving to a permanent error state.
    if (!this.initializeTimeoutId) {
        this.initializeTimeoutId = setTimeout(function() {
            // setup hasn't completed so move to permanenet error state
            var message = "initializeInternal(): timed out setting up DB";
            that.log(IndexedDBAdapter.LOG_LEVEL.WARNING, message);
            that.initializeComplete(false, message);
        }, IndexedDBAdapter.INITIALIZE_TIMEOUT);
    }

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
        // this is fired if there's a version mismatch. if createTable() doesn't throw
        // then onsuccess() is fired, else onerror() is fired.
        that.createTables(e);
    };
    dbRequest.onsuccess = function(e) {
        that.setupDB(e);
    };
    dbRequest.onerror = function(e) {
        // this means we have no storage.
        var message = "initializeInternal(): error opening DB";
        message += (e.target.error && e.target.error.message) ? ": "+e.target.error.message : "";
        that.log(IndexedDBAdapter.LOG_LEVEL.WARNING, message);
        // reject all pending operations
        that.initializeComplete(false, message);
        // prevent uncatchable InvalidStateError in FF private mode
        e.preventDefault && e.preventDefault();
    };
    dbRequest.onblocked = function(/*error*/) {
        that.log(IndexedDBAdapter.LOG_LEVEL.INFO, "initializeInternal(): blocked from opening DB, most likely by another open browser tab");
    };
};


/**
 * Returns adapter size.
 * @returns {Promise} a promise that resolves with the size in bytes
 */
IndexedDBAdapter.prototype.getSize = function() {
    $A.assert(this.ready, "IndexedDBAdapter.getSize() called with this.ready=" + this.ready);
    var that = this;
    if (this.sizeAge < 50) {
        return Promise["resolve"](this.sizeGuess);
    } else {
        return new Promise(function(resolve, reject) {
            that.walkInternal(resolve, reject, false);
        });
    }
};

/**
 * Retrieves items from storage.
 * @param {String[]} [keys] The set of keys to retrieve. Undefined to retrieve all items.
 * @param {Boolean} [includeExpired] True to return expired items, false to not return expired items.
 * @returns {Promise} A promise that resolves with an object that contains key-value pairs.
 */
IndexedDBAdapter.prototype.getItems = function(keys /*, includeExpired*/) {
    $A.assert(this.ready, "IndexedDBAdapter.getItems() called with this.ready=" + this.ready);
    // TODO - optimize by respecting includeExpired
    var that = this;
    return new Promise(function(resolve, reject) {
        if (!Array.isArray(keys) || keys.length === 0) {
            that.walkInternal(resolve, reject, true);
        } else {
            that.getItemsInternal(keys, resolve, reject);
        }
    });
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
 * @returns {Boolean} Whether the adapter is secure.
 */
IndexedDBAdapter.prototype.isSecure = function() {
    return false;
};

/**
 * @returns {Boolean} Whether the adapter is persistent.
 */
IndexedDBAdapter.prototype.isPersistent = function() {
    return true;
};

/**
 * Sweeps over the store to evict expired items.
 * @returns {Promise} A promise that resolves when the sweep is complete.
 */
IndexedDBAdapter.prototype.sweep = function() {
    $A.assert(this.ready, "IndexedDBAdapter.sweep() called with this.ready=" + this.ready);
    var that = this;
    return new Promise(function(resolve, reject) {
        // 0 because we don't need any space freed. this causes expired items
        // to be evicted + brings the store size below max size.
        that.expireCache(0, resolve, reject);
    });
};

/**
 * Initializes the structure with a new DB.
 * @param {Event} event IndexedDB event.
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
        this.initializeInternal(currentVersion + 1);
    } else {
        this.initializeComplete(true);
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
 * Marks initialization of the adapter as completed successfully or not.
 * @param {Boolean} ready True if the adapter is ready; false if the adapter is in permanent error state.
 * @param {String} error If ready is false, the error message describing cause of the initialization failure.
 * @private
 */
IndexedDBAdapter.prototype.initializeComplete = function(ready, error) {
    if (this.ready !== undefined) {
        return;
    }
    this.ready = !!ready;
    clearTimeout(this.initializeTimeoutId);
    if (this.ready) {
        this.initializePromiseResolve();
    } else {
        this.initializePromiseReject(new Error(error));
    }
    delete this.initializePromiseResolve;
    delete this.initializePromiseReject;
};


/**
 * Retrieves items from storage.
 * @param {String[]} keys The keys of the items to retrieve.
 * @param {Function} resolve Promise resolve function.
 * @param {Function} reject Promise resolve function.
 * @private
 */
IndexedDBAdapter.prototype.getItemsInternal = function(keys, resolve, reject) {
    var transaction = this.db.transaction([this.tableName], "readonly");
    var objectStore = transaction.objectStore(this.tableName);
    var that = this;

    var results = {};
    var collected = 0;
    function collector(event) {
        var stored = event.target.result || {};
        var key = stored["key"];
        var item = stored["item"];

        if (key) {
            results[key] = item;
        }
        collected++;
        if (collected === keys.length) {
            resolve(results);
            return;
        }
    }

    transaction.onabort = function(event) {
        var message = "getItemsInternal(): transaction aborted for keys "+keys.toString()+": "+event.error;
        that.log(IndexedDBAdapter.LOG_LEVEL.WARNING, message);
        reject(new Error("IndexedDBAdapter."+message));
    };
    transaction.onerror = function(event) {
        var message = "getItemsInternal(): transaction error for keys "+keys.toString()+": "+event.error;
        that.log(IndexedDBAdapter.LOG_LEVEL.WARNING, message);
        reject(new Error("IndexedDBAdapter."+message));
    };


    var objectStoreRequest;
    for (var i = 0; i < keys.length; i++) {
        // TODO W-2531907 skip items with the wrong keyprefix when
        // AuraClientService#loadTokenFromStorage doesn't use a keyprefix-less entry
        objectStoreRequest = objectStore.get(keys[i]);
        objectStoreRequest.onsuccess = collector;
    }
};

/**
 * Walks everything in the DB (read only).
 * @param {Function} resolve Promise resolve function
 * @param {Function} reject Promise reject function
 * @param {Boolean} sendResult True to resolve the promise with the full set of results; false to resolve with the size.
 * @private
 */
IndexedDBAdapter.prototype.walkInternal = function(resolve, reject, sendResult) {
    var transaction = this.db.transaction([this.tableName], "readonly");
    var objectStore = transaction.objectStore(this.tableName);
    var cursor = objectStore.openCursor();
    var result = {};
    var count = 0;
    var size = 0;
    var that = this;

    cursor.onsuccess = function(event) {
        var icursor = event.target.result;
        if (icursor) {
            var stored = icursor.value;
            if (stored) {
                size += stored["size"];
                count += 1;
                if (sendResult && stored["key"].indexOf(that.keyPrefix) === 0) {
                    result[stored["key"]] = stored["item"];
                }
            }
            icursor["continue"]();
        } else {
            that.refreshSize(size, count);

            // async sweep
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
 * Stores items in storage.
 * @param {Array} tuples An array of key-value-size pairs.
 * @returns {Promise} A promise that resolves when the items are stored.
 */
IndexedDBAdapter.prototype.setItems = function(tuples) {
    $A.assert(this.ready, "IndexedDBAdapter.setItems() called with this.ready=" + this.ready);

    var that = this;
    return new Promise(function(resolve, reject) {
        var i;
        var sizes = 0;
        var storables = [];
        var storable;
        for (i = 0; i < tuples.length; i++) {
            storable = that.encodeStorable(tuples[i]);
            sizes += storable["size"];
            storables.push(storable);
        }

        // async expire if believed to be necessary
        if (sizes + that.sizeGuess + that.sizeErrorBar > that.limitSweepHigh || that.sizeErrorBar > that.limitError) {
            that.expireCache(sizes);
        }
        var transaction = that.db.transaction([that.tableName], "readwrite");
        var objectStore = transaction.objectStore(that.tableName);

        var collected = 0;
        function collector() {
            collected++;
            if (collected === tuples.length) {
                // transaction is done so update size then resolve.
                that.updateSize(sizes/2, sizes/2);
                resolve();
                return;
            }
        }

        transaction.onabort = function(event) {
            var keys = tuples.map(function(tuple) { return tuple[0]; });
            var message = "setItemsInternal(): transaction aborted for keys "+keys.toString()+": "+event.error;
            that.log(IndexedDBAdapter.LOG_LEVEL.WARNING, message);
            reject(new Error("IndexedDBAdapter."+message));
        };
        transaction.onerror = function(event) {
            var keys = tuples.map(function(tuple) { return tuple[0]; });
            var message = "setItemsInternal(): transaction error for keys "+keys.toString()+": "+event.error;
            that.log(IndexedDBAdapter.LOG_LEVEL.WARNING, message);
            reject(new Error("IndexedDBAdapter."+message));
        };

        var objectStoreRequest;
        for (i = 0; i < storables.length; i++) {
            objectStoreRequest = objectStore.put(storables[i]);
            objectStoreRequest.onsuccess = collector;
        }
    });
};


/**
 * Removes items from storage.
 * @param {String[]} keys The keys of the items to remove.
 * @returns {Promise} A promise that resolves when all items are removed.
 */
IndexedDBAdapter.prototype.removeItems = function(keys) {
    $A.assert(this.ready, "IndexedDBAdapter.removeItems() called with this.ready=" + this.ready);
    var that = this;
    return new Promise(function(resolve, reject) {
        var transaction = that.db.transaction([that.tableName], "readwrite");
        var objectStore = transaction.objectStore(that.tableName);

        var sizeAvg = that.sizeAvg; // capture current sizeAvg

        var collected = 0;
        function collector() {
            collected++;
            if (collected === keys.length) {
                // transaction is done so update size then resolve
                that.updateSize(-sizeAvg, sizeAvg);
                resolve();
                return;
            }
        }

        transaction.onabort = function(event) {
            var message = "removeItemsInternal(): transaction aborted for keys "+keys.toString()+": "+event.error;
            that.log(IndexedDBAdapter.LOG_LEVEL.WARNING, message);
            reject(new Error("IndexedDBAdapter."+message));
        };
        transaction.onerror = function(event) {
            var message = "removeItemsInternal(): transaction error for keys "+keys.toString()+": "+event.error;
            that.log(IndexedDBAdapter.LOG_LEVEL.WARNING, message);
            reject(new Error("IndexedDBAdapter."+message));
        };

        var objectStoreRequest;
        for (var i = 0; i < keys.length; i++) {
            objectStoreRequest = objectStore["delete"](keys[i]);
            objectStoreRequest.onsuccess = collector;
        }
    });
};


/**
 * Clears storage.
 * @returns {Promise} A promise that resolves when the store is cleared.
 */
IndexedDBAdapter.prototype.clear = function() {
    $A.assert(this.ready, "IndexedDBAdapter.clear() called with this.ready=" + this.ready);
    var that = this;
    return new Promise(function(resolve, reject) {
        var transaction = that.db.transaction([that.tableName], "readwrite");
        var objectStore = transaction.objectStore(that.tableName);

        objectStore.clear();
        that.setSize(0, 0);

        transaction.onabort = function(event) {
            reject(new Error("IndexedDBAdapter.clear(): Transaction aborted: "+event.error));
        };
        transaction.oncomplete = function() {
            resolve();
        };
        transaction.onerror = function(event) {
            reject(new Error("IndexedDBAdapter.clearI(): Transaction failed: "+event.error));
        };
    });
};


/**
 * Evicts entries and updates the cached size of the store.
 *
 * Entries are evicted until requested size is freed. Algorithm evicts
 * items based on age and not sharing the key prefix (aka isolation key). An
 * LRU algorithm is not used which differentiates this adapter from others.
 *
 * The rest of the store is traversed to calculate the real size of the
 * persisted data.
 *
 * @param {Number} requestedSize the size to free in bytes
 * @param {Function} resolve promise resolve function
 * @param {Function} reject promise reject function
 * @private
 */
IndexedDBAdapter.prototype.expireCache = function(requestedSize, resolve, reject) {
    var now = new Date().getTime();
    if (this.sweepingSuspended || (this.lastSweep + this.sweepInterval > now && this.sizeGuess < this.limitSweepHigh)) {
        if (resolve) {
            resolve();
        }
        return;
    }

    // TODO W-2481519 - ensure aura framework-required data is never evicted without having a
    // blacklist in every adapter.
    var actionsBlackList = ["globalValueProviders",           /* GlobalValueProviders.js */
                            "$AuraClientService.token$",      /* AuraClientService.js */
                            "$AuraClientService.bootstrap$"]; /* AuraClientService.js */

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
                var stored = icursor.value;
                if (stored) {
                    var shouldEvict = false;

                    if (stored["expires"] < expireDate || expiredSize < removeSize || stored["key"].indexOf(that.keyPrefix) !== 0) {
                        shouldEvict = true;

                        // TODO W-2481519 - ensure aura framework-required data is never evicted without having a
                        // blacklist in every adapter.
                        if (that.instanceName === "actions") {
                            for (var i = 0; i < actionsBlackList.length; i++) {
                                if (icursor.primaryKey.indexOf(actionsBlackList[i]) > -1) {
                                    shouldEvict = false;
                                    break;
                                }
                            }
                        }
                    }

                    if (shouldEvict) {
                        that.log(IndexedDBAdapter.LOG_LEVEL.INFO, "expireCache(): sweep removing "+icursor.primaryKey);
                        icursor["delete"]();
                        expiredSize += stored["size"];
                    } else {
                        size += stored["size"];
                        count += 1;
                    }
                }
                icursor["continue"]();
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
 * @param {Number} sizeChange The amount to change the size of the store.
 * @param {Number} error A really random guess of the size of the error.
 * @private
 */
IndexedDBAdapter.prototype.updateSize = function(sizeChange, error) {
    this.sizeGuess += sizeChange;
    this.sizeErrorBar += error;
    this.sizeAge += 1;
};


/**
 * Refreshes the cached size of the store from real data.
 * @param {Number} size The actual calculated size.
 * @param {Number} count The number of items in the store.
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

    this.log(IndexedDBAdapter.LOG_LEVEL.INFO, "refreshSize(): size calculation: current mistake = " + mistake +
         ", avg mistake = " + (this.sizeMistake/this.sizeMistakeCount).toFixed(1) +
         ", max mistake = " + this.sizeMistakeMax +
         ", outside error bars = " + this.sizeOutsideErrorBar);
    this.setSize(size, count);
};


/**
 * Sets the cached size of the store. Callers must provide sizes based
 * on real data, not estimates.
 * @param {number} size The actual calculated size.
 * @param {number} count The number of items in the store.
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
 * Converts a stored item to a shape appropriate for return to AuraStorage.
 * @param {Object} stored An item stored within IndexedDB.
 * @return {Object} A payload to return to AuraStorage.
 * @private
 */
IndexedDBAdapter.prototype.decodeStorable = function(stored) {
    return {
        "key": stored["key"],
        "value": stored["item"]
    };
};


/**
 * Converts a tuple to a storable item for IndexedDB.
 * @param {Object} tuple The item to store.
 * @return {Object} An item to store.
 * @private
 */
IndexedDBAdapter.prototype.encodeStorable = function(tuple) {
    return {
        "key": tuple[0],
        "item": tuple[1],
        "size": tuple[2],
        "expires": tuple[1]["expires"]
    };
};


/**
 * Logs a message.
 * @param {IndexedDBAdapter.LOG_LEVEL} level Log line level.
 * @param {String} msg The log message.
 * @param {Object=} obj Optional log payload.
 * @private
 */
IndexedDBAdapter.prototype.log = function (level, msg, obj) {
    if (this.debugLogging || level.id >= IndexedDBAdapter.LOG_LEVEL.WARNING.id) {
        $A[level.fn]("IndexedDBAdapter['"+this.instanceName+"'] "+msg, obj);
    }
};


/**
 * Deletes the ENTIRE DB which may contain ObjectStores belonging to other app/cmp.
 * TODO W-2691320 - change db vs store name to avoid this issue.
 * @return {Promise} A promise that deletes the entire database
 */
IndexedDBAdapter.prototype.deleteStorage = function() {
    $A.assert(this.ready, "IndexedDBAdapter.deleteStorage() called with this.ready=" + this.ready);
    var that = this;
    return new Promise(function(resolve, reject) {

        // IE and Safari need to be explicitly closed otherwise may end up stuck in a blocked state
        that.db.close();

        var dbRequest = window.indexedDB.deleteDatabase(that.instanceName);
        dbRequest.onerror = function() {
            var message = "deleteStorage(): delete database error";
            that.log(IndexedDBAdapter.LOG_LEVEL.WARNING, message);
            reject(new Error("IndexedDBAdapter."+message));
        };
        dbRequest.onsuccess = function() {
            that.log(IndexedDBAdapter.LOG_LEVEL.INFO, "deleteStorage(): deleted successfully");
            resolve();
        };
        dbRequest.onblocked = function(/*error*/) {
            // Cannot error here because IE may come to this callback before success
            that.log(IndexedDBAdapter.LOG_LEVEL.INFO, "deleteStorage(): blocked from being deleted");
        };
    });
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
