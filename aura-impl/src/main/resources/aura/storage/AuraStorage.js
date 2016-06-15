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
    this.adapter.getName = this.adapter.getName || this.adapter["getName"];
    this.adapter.getSize = this.adapter.getSize || this.adapter["getSize"];
    this.adapter.setItems = this.adapter.setItems || this.adapter["setItems"];
    this.adapter.getItems = this.adapter.getItems || this.adapter["getItems"];
    this.adapter.removeItems = this.adapter.removeItems || this.adapter["removeItems"];
    this.adapter.deleteStorage = this.adapter.deleteStorage || this.adapter["deleteStorage"];
    this.adapter.isSecure = this.adapter.isSecure || this.adapter["isSecure"];
    this.adapter.isPersistent = this.adapter.isPersistent || this.adapter["isPersistent"];
    this.adapter.clearOnInit = this.adapter.clearOnInit || this.adapter["clearOnInit"];
    this.adapter.suspendSweeping = this.adapter.suspendSweeping || this.adapter["suspendSweeping"];
    this.adapter.resumeSweeping = this.adapter.resumeSweeping || this.adapter["resumeSweeping"];

    //#if {"excludeModes" : ["PRODUCTION", "PRODUCTIONDEBUG"]}
    // for storage adapter testing
    this["adapter"] = this.adapter;
    this.adapter["getItems"] = this.adapter.getItems;
    this.adapter["getMRU"] = this.adapter.getMRU;
    this.adapter["getSize"] = this.adapter.getSize;
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
 * @returns {Promise} A promise that resolves to the current storage size in KB.
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
 * @returns {Promise} A promise that will clear storage.
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
 * @param {String} key The key of the item to retrieve.
 * @param {Boolean=} includeExpired True to return expired items, false to not return expired items.
 * @returns {Promise} A promise that resolves to the stored item or undefined if the key is not found.
 * @export
 */
AuraStorage.prototype.get = function(key, includeExpired) {
    $A.assert($A.util.isString(key), "AuraStorage.get(): 'key' must be a String.");
    $A.assert(!includeExpired || $A.util.isBoolean(includeExpired), "AuraStorage.get(): 'includeExpired' must be a Boolean.");

    return this.getAll([key], includeExpired)
        .then(
            function(items) {
                if (items) {
                    return items[key];
                }
                return undefined;
            }
        );
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
 * Asynchronously gets multiple items from storage.
 * @param {String[]} [keys] The set of keys to retrieve. Empty array or falsey to retrieve all items.
 * @param {Boolean} [includeExpired] True to return expired items, falsey to not return expired items.
 * @returns {Promise} A promise that resolves to an array of objects in storage. Each
 *      object consists of {key: String, value: *}.
 * @export
 */
AuraStorage.prototype.getAll = function(keys, includeExpired) {
    $A.assert(!keys || Array.isArray(keys), "AuraStorage.getAll(): 'keys' must be an Array.");
    $A.assert(!includeExpired || $A.util.isBoolean(includeExpired), "AuraStorage.getAll(): 'includeExpired' must be a Boolean.");

    var prefixedKeys = undefined;

    if (Array.isArray(keys) && keys.length > 0) {
        prefixedKeys = [];
        for (var i = 0; i < keys.length; i++) {
            prefixedKeys.push(this.keyPrefix + keys[i]);
        }
    }

    this.getOperationsInFlight += 1;
    var that = this;
    return this.adapter.getItems(prefixedKeys, includeExpired)
        .then(
            function(items) {
                that.getOperationsInFlight -= 1;

                if (!items) {
                    return {};
                }

                var now = new Date().getTime();
                var results = {};
                var item;
                var key;
                for (var k in items) {
                    item = items[k];
                    if (k.indexOf(that.keyPrefix) === 0 && (includeExpired || now < item["expires"])) {
                        key = k.substring(that.keyPrefix.length);
                        results[key] = item["value"];
                    }
                    // wrong isolationKey/version or item is expired so ignore the entry
                    // TODO - capture entries to be removed async
                }

                return results;
            }, function (e) {
                that.logError({ "operation": "getAll", "error": e });
                that.getOperationsInFlight -= 1;
                throw e;
            }
        );
};

/**
 * Builds the payload to store in the adapter.
 * @param {String} key The key of the item to store.
 * @param {*} value The value of the item to store.
 * @param {Number} now The current time (milliseconds).
 * @returns {Array} A key-value-size tuple to pass to the adapter's setItems.
 * @private
 */
AuraStorage.prototype.buildPayload = function(key, value, now) {
    // For the size calculation, consider only the inputs to the storage layer: key and value.
    // Ignore all the extras in the item object below.
    var size = $A.util.estimateSize("" + key) + $A.util.estimateSize(value);
    if (size > this.maxSize) {
        throw new Error("AuraStorage.set() cannot store " + key + " of size " + size + "b because it's over the max size of " + this.maxSize + "b");
    }

    return [
        this.keyPrefix + key,
        {
            "value": value,
            "created": now,
            "expires": now + this.expiration
        },
        size
    ];
};


/**
 * Asynchronously stores the value in storage using the specified key.
 * @param {String} key The key of the item to store.
 * @param {*} value The value of the item to store.
 * @returns {Promise} A promise that resolves when are stored.
 * @export
 */
AuraStorage.prototype.set = function(key, value) {
    $A.assert($A.util.isString(key), "AuraStorage.set(): 'key' must be a String.");

    var values = {};
    values[key] = value;
    return this.setAll(values);
};

/**
 * Asynchronously stores multiple values in storage. All or none of the values are stored.
 * @param {Object} values The key-values to store. Eg <code>{key1: value1, key2: value2}</code>.
 * @returns {Promise} A promise that resolves when all of the key-values are stored.
 * @export
 */
AuraStorage.prototype.setAll = function(values) {
    $A.assert($A.util.isObject(values), "AuraStorage.setAll(): 'values' must be an Object.");

    var now = new Date().getTime();
    var storablesSize = 0;
    var storables = [];
    var storable;
    try {
        for (var key in values) {
            storable = this.buildPayload(key, values[key], now);
            storables.push(storable);
            storablesSize += storable[2];
        }
    } catch (e) {
        this.logError({ "operation": "set", "error": e });
        return Promise["reject"](e);
    }

    if (storablesSize > this.maxSize) {
        var e2 = new Error("AuraStorage.set() cannot store " + Object.keys(values).length + " items of total size " + storablesSize + "b because it's over the max size of " + this.maxSize + "b");
        this.logError({ "operation": "set", "error": e2 });
        return Promise["reject"](e2);
    }

    var that = this;
    var promise = this.adapter.setItems(storables)
        .then(
            function() {
                var keys = Object.keys(values);
                that.log("set() - " + keys.length + " keys: " + keys.join(", "));

                that.fireModified();
            },
            function(e) {
                that.logError({ "operation": "set", "error": e });
                throw e;
            }
        );

    this.sweep();

    return promise;
};

/**
 * Asynchronously removes the value from storage corresponding to the specified key.
 * @param {String} key The key of the value to remove.
 * @param {Boolean} doNotFireModified Whether to fire the modified event on item removal.
 * @returns {Promise} A promise that will remove the value from storage.
 * @export
 */
AuraStorage.prototype.remove = function(key, doNotFireModified) {
    $A.assert($A.util.isString(key), "AuraStorage.remove(): 'key' must be a String.");
    $A.assert(!doNotFireModified || $A.util.isBoolean(doNotFireModified), "AuraStorage.remove(): 'doNotFireModified' must be a Boolean.");
    return this.removeAll([key], doNotFireModified);
};

/**
 * Asynchronously removes multiple values from storage. All or none of the values are removed.
 * @param {String[]} keys The keys of the values to remove.
 * @param {Boolean=} doNotFireModified Whether to fire the modified event on item removal.
 * @returns {Promise} A promise that resolves when all of the values are removed.
 * @export
 */
AuraStorage.prototype.removeAll = function(keys, doNotFireModified) {
    $A.assert($A.util.isArray(keys), "AuraStorage.removeAll(): 'keys' must be an Array.");
    $A.assert(!doNotFireModified || $A.util.isBoolean(doNotFireModified), "AuraStorage.removeAll(): 'doNotFireModified' must be a Boolean.");

    var prefixedKeys = [];
    for (var i = 0; i < keys.length; i++) {
        prefixedKeys.push(this.keyPrefix + keys[i]);
    }

    var that = this;
    return this.adapter.removeItems(prefixedKeys)
        .then(
            function() {
                if (that.debugLogging) {
                    for (i = 0; i < prefixedKeys.length; i++) {
                        that.log("remove() - key " + prefixedKeys[i]);
                    }
                }

                if (!doNotFireModified) {
                    that.fireModified();
                }
            },
            function(e) {
                that.logError({ "operation": "remove", "error": e });
                throw e;
            }
        );
};


/**
 * Asynchronously sweeps the store to remove expired items.
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
        .then(function(expired) {
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
 * @param {String} payload.operation The operation which errored (eg get, set)
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
 * @returns {boolean} True if persistent.
 * @export
 */
AuraStorage.prototype.isPersistent = function() {
    return this.adapter.isPersistent();
};

/**
 * Whether the storage implementation is secure.
 * @returns {boolean} True if secure.
 * @export
 */
AuraStorage.prototype.isSecure = function() {
    return this.adapter.isSecure();
};

/**
 * Returns the storage version.
 * @returns {String} The storage version.
 * @export
 */
AuraStorage.prototype.getVersion  = function() {
    return this.version;
};

/**
 * Returns the expiration in seconds.
 * @returns {Number} The expiration in seconds.
 * @export
 */
AuraStorage.prototype.getExpiration = function() {
    return this.expiration / 1000;
};

/**
 * Returns the auto-refresh interval in seconds.
 * @returns {Number} The auto-refresh interval in seconds.
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
                function(e) {
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
