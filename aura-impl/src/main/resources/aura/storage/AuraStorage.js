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
 * @description The storage service implementation.
 * @constructor
 * @param {Object} config The configuration describing the characteristics of the storage to be created.
 * @export
 */
var AuraStorage = function AuraStorage(config) {
    var AdapterCtr = config["adapterClass"];
    this.adapter = new AdapterCtr(config);

    // extract values this class uses
    this.name = config["name"];
    this.maxSize = config["maxSize"];
    this.expiration = config["expiration"] * 1000;
    this.autoRefreshInterval = config["autoRefreshInterval"] * 1000;
    this.debugLogging = config["debugLogging"];
    this.version = "" + config["version"];
    this.keyPrefix = this.generateKeyPrefix(config["isolationKey"], this.version);

    this.getOperationsInFlight = 0;

    // frequency guard for sweeping
    this.sweepInterval = Math.min(Math.max(this.expiration*0.5, AuraStorage["SWEEP_INTERVAL"]["MIN"]), AuraStorage["SWEEP_INTERVAL"]["MAX"]);
    this.lastSweepTime = new Date().getTime();
    this.sweepingSuspended = false;

    this.log($A.util.format("initializing storage adapter using { maxSize: {0} KB, expiration: {1} sec, autoRefreshInterval: {2} sec, clearStorageOnInit: {3}, isolationKey: {4} }",
            (this.maxSize/1024).toFixed(1), this.expiration/1000, this.autoRefreshInterval/1000, config["clearOnInit"], this.keyPrefix
        ));

    // work around the obfuscation logic to allow external adapters to properly plug in
    this.adapter.clear = this.adapter.clear || this.adapter["clear"];
    this.adapter.getExpired = this.adapter.getExpired || this.adapter["getExpired"];
    this.adapter.sweep = this.adapter.sweep || this.adapter["sweep"];
    this.adapter.getItem = this.adapter.getItem || this.adapter["getItem"];
    this.adapter.getName = this.adapter.getName || this.adapter["getName"];
    this.adapter.getSize = this.adapter.getSize || this.adapter["getSize"];
    this.adapter.removeItem = this.adapter.removeItem || this.adapter["removeItem"];
    this.adapter.setItem = this.adapter.setItem || this.adapter["setItem"];
    this.adapter.getAll = this.adapter.getAll || this.adapter["getAll"];
    this.adapter.deleteStorage = this.adapter.deleteStorage || this.adapter["deleteStorage"];
    this.adapter.isSecure = this.adapter.isSecure || this.adapter["isSecure"];
    this.adapter.isPersistent = this.adapter.isPersistent || this.adapter["isPersistent"];
    this.adapter.clearOnInit = this.adapter.clearOnInit || this.adapter["clearOnInit"];
    this.adapter.suspendSweeping = this.adapter.suspendSweeping || this.adapter["suspendSweeping"];
    this.adapter.resumeSweeping = this.adapter.resumeSweeping || this.adapter["resumeSweeping"];

    //#if {"excludeModes" : ["PRODUCTION", "PRODUCTIONDEBUG"]}
    // for storage adapter testing
    this["adapter"] = this.adapter;
    this.adapter["getItem"] = this.adapter.getItem;
    this.adapter["getMRU"] = this.adapter.getMRU;
    this.adapter["getSize"] = this.adapter.getSize;
    this.adapter["getAll"] = this.adapter.getAll;
    this.adapter["sweep"] = this.adapter.sweep;
    //#end
};

/**
 * Returns the name of the storage adapter. For example, "indexeddb" or "memory".
 * @returns {String} The storage adapter's name.
 * @export
 */
AuraStorage.prototype.getName = function() {
    return this.adapter.getName();
};

/**
 * Gets the current storage size in KB.
 * @returns {Promise} A Promise that resolves to the current storage size in KB.
 * @export
 */
AuraStorage.prototype.getSize = function() {
    return this.adapter.getSize()
        .then(function(size) { return size / 1024.0; } );
};

/**
 * Returns the maximum storage size in KB.
 * @returns {number} The maximum storage size in KB.
 * @export
 */
AuraStorage.prototype.getMaxSize = function() {
    return this.maxSize / 1024.0;
};

/**
 * Returns a promise that clears the storage.
 * @returns {Promise} A Promise that will clear storage.
 * @export
 */
AuraStorage.prototype.clear = function() {
    var that = this;
    return this.adapter.clear()
        .then(
            undefined,
            function(e) {
                that.logError({ "operation": "clear", "error": e });
                throw e;
            }
        );
};

/**
 * Asynchronously gets an item from storage corresponding to the specified key.
 * @param {String} key The item key. This is the key used when the item was added to storage using <code>put()</code>.
 * @param {Boolean} includeExpired True to return expired items, falsey to not return expired items.
 * @returns {Promise} A Promise that resolves to the stored item or undefined if the key is not found.
 * @export
 */
AuraStorage.prototype.get = function(key, includeExpired) {
    this.getOperationsInFlight += 1;
    var that = this;
    var promise = this.adapter.getItem(this.keyPrefix + key).then(function(item) {
        that.log("get() " + (item ? "HIT" : "MISS") + " - key: " + key + ", value: " + item);
        that.getOperationsInFlight -= 1;

        if (!item || (!includeExpired && new Date().getTime() > item["expires"])) {
            return undefined;
        }
        return item["value"];
    },function (e) {
        that.logError({ "operation": "get", "error": e });
        that.getOperationsInFlight -= 1;
        throw e;
    });

    this.sweep();

    return promise;
};


/**
 * In-flight operations counter.
 * @returns {Integer} Number of operations currently waiting on being resolved.
 * @export
 */
AuraStorage.prototype.inFlightOperations = function() {
    return this.getOperationsInFlight;
};

/**
 * Asynchronously gets all items from storage.
 * @param {Boolean} [includeExpired] True to return expired items, falsey to not return expired items.
 * @returns {Promise} A Promise that resolves to an array of objects in storage. Each
 *      object consists of {key: String, value: *}.
 * @export
 */
AuraStorage.prototype.getAll = function(includeExpired) {
    var that = this;
    return this.adapter.getAll().then(function(items) {
        var length = items.length ? items.length : 0;

        var now = new Date().getTime();
        var results = [];
        for (var i = 0; i < length; i++) {
            var item = items[i];
            if (item["key"].indexOf(that.keyPrefix) === 0 && (includeExpired || now < item["expires"])) {
                var key = item["key"].replace(that.keyPrefix, "");
                results.push({ "key": key, "value": item["value"] });
            }
            // wrong isolationKey/version or item is expired so ignore the entry
            // TODO - capture entries to be removed async
        }

        that.log("getAll() - found " + results.length + " items");
        return results;
    }, function (e) {
        that.logError({ "operation": "getAll", "error": e });
        throw e;
    });
};

/**
 * Asynchronously stores the value in storage using the specified key.
 * Calculates the approximate size of the data and provides it to adapter.
 *
 * @param {String} key The key of the item to store.
 * @param {*} value The value of the item to store.
 * @returns {Promise} A Promise that will put the value in storage.
 * @export
 */
AuraStorage.prototype.set = function(key, value) {
    // For the size calculation, consider only the inputs to the storage layer: key and value
    // Ignore all the extras in the item object below
    var size = $A.util.estimateSize(key) + $A.util.estimateSize(value);
    if (size > this.maxSize) {
        var maxSize = this.maxSize;
        var finalReject = function() {
            return Promise["reject"](new Error("AuraStorage.set() cannot store " + key + " of size " + size + "b because it's over the max size of " + maxSize + "b"));
        };
        return this.remove(key, true).then(finalReject, finalReject);
    }

    var now = new Date().getTime();

    var item = {
        "value": value,
        "created": now,
        "expires": now + this.expiration
    };

    var that = this;
    var promise = this.adapter.setItem(this.keyPrefix + key, item, size)
        .then(
            function () {
                that.log("put() - key: " + key + ", value: " + item);
                that.fireModified();
            },
            function (e) {
                that.logError({ "operation": "put", "error": e });
                throw e;
            }
        );

    this.sweep();

    return promise;
};

/**
 * Asynchronously removes the item from storage corresponding to the specified key.
 * @param {String} key The key of the item to remove.
 * @param {Boolean} doNotFireModified Whether to fire the modified event on item removal.
 * @returns {Promise} A Promise that will remove the item from storage.
 * @private
 */
AuraStorage.prototype.remove = function(key, doNotFireModified) {
    var that = this;
    return this.adapter.removeItem(this.keyPrefix + key)
        .then(function(){
            that.log("remove(): key " + key);
            if (!doNotFireModified) {
                that.fireModified();
            }
        }, function (e) {
            that.logError({ "operation": "remove", "error": e });
            throw e;
        }
    );
};

/**
 * Asynchronously removes all expired items.
 * @private
 */
AuraStorage.prototype.sweep = function() {
    // sweeping guards:
    // 1. sweeping is in progress
    if (this._sweepingInProgress) {
        return;
    }
    // 2. sweeping has been suspended. often set when the client goes offline or the store's size is being manually managed.
    if (this.sweepingSuspended) {
        return;
    }
    // 3. framework hasn't finished init'ing
    if (!$A["finishedInit"]) {
        return;
    }
    // 4. frequency
    var sweepInterval = new Date().getTime() - this.lastSweepTime;
    if (sweepInterval < this.sweepInterval) {
        return;
    }

    // prevent concurrent sweeps
    this._sweepingInProgress = true;
    var that = this;
    function doneSweeping(doNotFireModified) {
        that.log("sweep() - complete");
        that._sweepingInProgress = false;
        that.lastSweepTime = new Date().getTime();
        if (!doNotFireModified) {
            that.fireModified();
        }
    }

    // if adapter can do its own sweeping
    if (this.adapter.sweep) {
        this.adapter.sweep()
            .then(
                undefined, // noop
                function(e) {
                    that.logError({ "operation": "sweep", "error": e });
                    // do not rethrow to move to resolve state. return true to not fire modified
                    return true;
                }
            )
            .then(doneSweeping, doneSweeping);
        return;
    }

    // fallback: get expired items and remove them
    this.adapter.getExpired()
        .then(
            undefined, // noop
            function(e) {
                that.logError({ "operation": "getExpired", "error": e });
                return [];
            }
        )
        .then(function (expired) {
            // note: expired includes any key prefix. and it may
            // include items with different key prefixes which
            // we want to expire first. thus remove directly from the
            // adapter to avoid re-adding the key prefix.

            if (expired.length === 0) {
                // return true to not fire modified
                return true;
            }

            function noop() { return true; }
            var promiseSet = [];
            var key, promise;

            for (var n = 0; n < expired.length; n++) {
                key = expired[n];
                that.log("sweep() - expiring item with key: " + key);
                // ensure all promises succeed
                promise = that.adapter.removeItem(key).then(
                    undefined, // noop
                    noop // return promise to success state
                );
                promiseSet.push(promise);
            }

            return Promise.all(promiseSet); // eslint-disable-line consistent-return
        })
        .then(doneSweeping, doneSweeping);
};

/**
 * Suspends sweeping.
 *
 * Expired storage entries are proactively removed by sweeping. Sweeping is often suspended
 * when the connection goes offline so expired items remain accessible.
 * @export
 */
AuraStorage.prototype.suspendSweeping = function() {
    this.log("suspendSweeping()");

    this.sweepingSuspended = true;

    if (this.adapter.suspendSweeping) {
        this.adapter.suspendSweeping();
    }
};

/**
 * Resumes sweeping to remove expired storage entries.
 * @export
 */
AuraStorage.prototype.resumeSweeping = function() {
    this.log("resumeSweeping()");

    this.sweepingSuspended = false;

    if (this.adapter.resumeSweeping) {
        this.adapter.resumeSweeping();
    }

    this.sweep();
};

/**
 * @private
 */
AuraStorage.prototype.log = function() {
    if (this.debugLogging) {
        var msg = Array.prototype.join.call(arguments, " ");
        $A.log("AuraStorage '" + this.name + "' [" + this.getName() + "] : " + msg);
    }
};

/**
 * Logs an error to the server.
 * @param {Object} payload The error payload object.
 * @param {String} payload.operation The operation which errored (eg get, put)
 * @param {Error=} payload.error Optional error object
 * @private
 */
AuraStorage.prototype.logError = function(payload) {
    $A.metricsService.transaction("aura", "errorStorage", { "context": {
        "name"      : this.name,
        "adapter"   : this.getName(),
        "operation" : payload["operation"],
        "error"     : payload["error"] && payload["error"].toString()
    }});
};

/**
 * Whether the storage implementation is persistent.
 * @returns {boolean} true if persistent
 * @export
 */
AuraStorage.prototype.isPersistent = function() {
    return this.adapter.isPersistent();
};

/**
 * Whether the storage implementation is secure.
 * @returns {boolean} true if secure
 * @export
 */
AuraStorage.prototype.isSecure = function() {
    return this.adapter.isSecure();
};

/**
 * Returns the storage version.
 * @returns {String} storage version.
 * @export
 */
AuraStorage.prototype.getVersion  = function() {
    return this.version;
};

/**
 * Returns the expiration in seconds.
 * @returns {number} The expiration in seconds.
 * @export
 */
AuraStorage.prototype.getExpiration = function() {
    return this.expiration / 1000;
};

/**
 * Returns the auto-refresh interval in seconds.
 * @returns {number} The auto-refresh interval in seconds.
 */
AuraStorage.prototype.getDefaultAutoRefreshInterval = function() {
    return this.autoRefreshInterval;
};

/**
 * Asynchronously deletes this storage.
 * @private
 */
AuraStorage.prototype.deleteStorage = function() {
    var that = this;
    if (this.adapter.deleteStorage) {
        return this.adapter.deleteStorage()
            .then(
                undefined,
                function (e) {
                    that.logError({ "operation": "deleteStorage", "error": e });
                    throw e;
                }
            );
    }
    return Promise["resolve"]();
};

/**
 * Generates the key prefix for storage.
 * @param {String} isolationKey The isolation key.
 * @param {String} version The version.
 * @private
 */
AuraStorage.prototype.generateKeyPrefix = function(isolationKey, version) {
    return "" + isolationKey + version + AuraStorage.KEY_DELIMITER;
};

/**
 * Fires an auraStorage:modified event for this storage.
 * @private
 */
AuraStorage.prototype.fireModified = function() {
    var e = $A.eventService.getNewEvent("markup://auraStorage:modified");
    if (e) {
        e.fire({"name": this.name});
    }
};


/**
 * Storage key delimiter, separating isolation and version key from
 * the user-provided key.
 * @private
 */
AuraStorage.KEY_DELIMITER = ":";

/**
 * Sweep intervals (milliseconds).
 */
AuraStorage["SWEEP_INTERVAL"] = {
        "MIN": 60000, // 1 min
        "MAX": 300000 // 5 min
};


Aura.Storage.AuraStorage = AuraStorage;
