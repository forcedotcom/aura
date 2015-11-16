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
    this.name = config["name"];
    this.adapter = config["adapter"];
    this.maxSize = config["maxSize"];
    this.defaultExpiration = config["defaultExpiration"] * 1000;
    this.defaultAutoRefreshInterval = config["defaultAutoRefreshInterval"] * 1000;
    this.debugLoggingEnabled = config["debugLoggingEnabled"];

    this.isolationKey = config["isolationKey"];
    this.setVersion(config["version"]);
    this.updateKeyPrefix();

    this.lastSweep = new Date().getTime();

    var clearStorageOnInit = config["clearStorageOnInit"];

    this.log($A.util.format("initializing storage adapter using { maxSize: {0} KB, defaultExpiration: {1} sec, defaultAutoRefreshInterval: {2} sec, clearStorageOnInit: {3}, version: {4} }",
            (this.maxSize/1024).toFixed(1), this.defaultExpiration/1000, this.defaultAutoRefreshInterval/1000, clearStorageOnInit, this.version
        ));

    // work around the obfuscation logic to allow external Adapters to properly plug in
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

    var adapterConfig = $A.storageService.getAdapterConfig(this.adapter.getName());
    this.persistent = !$A.util.isUndefinedOrNull(adapterConfig["persistent"]) && adapterConfig["persistent"];
    this.secure = !$A.util.isUndefinedOrNull(adapterConfig["secure"]) && adapterConfig["secure"];

    //#if {"excludeModes" : ["PRODUCTION", "PRODUCTIONDEBUG"]}
    // for storage adapter testing
    this["adapter"] = this.adapter;
    this.adapter["getItem"] = this.adapter.getItem;
    this.adapter["getMRU"] = this.adapter.getMRU;
    //#end


    // clear on init is special: it should complete before any subsequent operation
    // is executed.
    if (clearStorageOnInit === true) {
        this.log("clearing " + this.getName() + " storage on init");
        if (this.adapter.clearOnInit) {
            this.adapter.clearOnInit();
        } else {
            this.adapter.clear();
        }
     }
};

/**
 * Returns the name of the storage type. For example, "indexeddb" or "memory".
 * @returns {String} The storage type.
 * @export
 */
AuraStorage.prototype.getName = function() {
    return this.adapter.getName();
};

/**
 * Asynchronously gets the current storage size in KB.
 * @returns {Promise} A Promise that will get the current storage size in KB.
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
 * Returns the default auto-refresh interval in seconds.
 * @returns {number} The default auto-refresh interval.
 */
AuraStorage.prototype.getDefaultAutoRefreshInterval = function() {
    return this.defaultAutoRefreshInterval;
};

/**
 * Returns a promise that clears the storage.
 * @returns {Promise} A Promise that will clear storage.
 * @export
 */
AuraStorage.prototype.clear = function() {
    return this.adapter.clear();
};

/**
 * Asynchronously gets an item from storage corresponding to the specified key.
 * @param {String} key The item key. This is the key used when the item was added to storage using <code>put()</code>.
 * @returns {Promise} A Promise that resolves to an object in storage or undefined if the key is not found.
 *      The object consists of {value: *, isExpired: Boolean}.

 * @export
 */
AuraStorage.prototype.get = function(key) {
    var that = this;
    var promise = this.adapter.getItem(this.keyPrefix + key).then(function(item) {
        that.log("get() " + (item ? "HIT" : "MISS") + " - key: " + key + ", value: " + item);

        if (!item) {
            return undefined;
        }
        return { "value" : item["value"], "isExpired" : (new Date().getTime() > item["expires"]) };
    });

    this.sweep();

    return promise;
};

/**
 * Asynchronously gets all items from storage.
 * @returns {Promise} A Promise that resolves to an array of objects in storage. Each
 *      object consists of {key: String, value: *, isExpired: Boolean}.
 * @export
 */
AuraStorage.prototype.getAll = function() {
    var that = this;
    return this.adapter.getAll().then(function(items) {
        var length = items.length ? items.length : 0;

        var now = new Date().getTime();
        var results = [];
        for (var i = 0; i < length; i++) {
            var item = items[i];
            if (item["key"].indexOf(that.keyPrefix) === 0) {
                var key = item["key"].replace(that.keyPrefix, "");
                results.push({ "key": key, "value": item["value"], "isExpired": (now > item["expires"]) });
            }
            // else: wrong isolationKey/version so ignore the entry
        }

        that.log("getAll() - found " + results.length + " items");
        return results;
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
AuraStorage.prototype.put = function(key, value) {

    // For the size calculation, consider only the inputs to the storage layer: key and value
    // Ignore all the extras in the item object below
    var size = $A.util.estimateSize(key) + $A.util.estimateSize(value);
    if (size > this.maxSize) {
        var maxSize = this.maxSize;
        var finalReject = function() {
            return Promise["reject"](new Error("AuraStorage.put() cannot store " + key + " of size " + size + "b because it's over the max size of " + maxSize + "b"));
        };
        return this.remove(key, true).then(finalReject, finalReject);
    }

    var now = new Date().getTime();

    var item = {
        "value": value,
        "created": now,
        "expires": now + this.defaultExpiration
    };

    var that = this;
    var promise = this.adapter.setItem(this.keyPrefix + key, item, size)
        .then(function () {
            that.log("put() - key: " + key + ", value: " + item);
            $A.storageService.fireModified();
        });

    this.sweep();

    return promise;
};

/**
 * Asynchronously removes the item from storage corresponding to the specified key.
 * @param {String} key The key of the item to remove.
 * @param {Boolean} doNotFireModified A bool indicating whether or not to fire the modified event on item removal.
 * @returns {Promise} A Promise that will remove the item from storage.
 * @private
 */
AuraStorage.prototype.remove = function(key, doNotFireModified) {
    var that = this;
    return this.adapter.removeItem(this.keyPrefix + key)
        .then(function(){
            that.log("remove() - key: " + key);
            if (!doNotFireModified) {
                $A.storageService.fireModified();
            }
        });
};

/**
 * Asynchronously removes all expired items.
 * @private
 */
AuraStorage.prototype.sweep = function() {
    // Do not sweep if we have lost our connection, we'll ignore expiration until sweeping resumes
    // OR if we've recently swept
    if (this._sweepingSuspended || ((new Date().getTime() - this.lastSweep) < (this.defaultExpiration / 60))) {
        return;
    }

    var that = this;
    if (this.adapter.sweep) {
        this.adapter.sweep().then(function() {
            that.lastSweep = new Date().getTime();
            $A.storageService.fireModified();
        });
    } else {
        this.adapter.getExpired().then(function (expired) {
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
                promiseSet.push(that.adapter.removeItem(key));
            }

            // When all of the remove promises have completed...
            Promise.all(promiseSet).then(
                function () {
                    that.log("sweep() - complete");
                    that.lastSweep = new Date().getTime();
                    $A.storageService.fireModified();
                },
                function (err) {
                    that.log("Error while sweep() was removing items: " + err);
                }
            );
        });
    }
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

    this._sweepingSuspended = true;

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

    this._sweepingSuspended = false;

    if (this.adapter.resumeSweeping) {
        this.adapter.resumeSweeping();
    }

    this.sweep();
};

/**
 * @private
 */
AuraStorage.prototype.log = function() {
    if (this.debugLoggingEnabled) {
        var msg = Array.prototype.join.call(arguments, " ");
        $A.log("AuraStorage '" + this.name + "' [" + this.getName() + "] : " + msg);
    }
};

/**
 * Whether the storage implementation is persistent.
 * @returns {boolean} true if persistent
 * @export
 */
AuraStorage.prototype.isPersistent = function() {
    if (this.adapter.isPersistent) {
        return this.adapter.isPersistent();
    }
    return this.persistent;
};

/**
 * Whether the storage implementation is secure.
 * @returns {boolean} true if secure
 * @export
 */
AuraStorage.prototype.isSecure = function() {
    if (this.adapter.isSecure) {
        return this.adapter.isSecure();
    }
    return this.secure;
};

/**
 * Sets the storage version.
 * @param {String} version storage version.
 * @export
 */
AuraStorage.prototype.setVersion  = function(version) {
    // ensure string
    this.version = (version || "") + "";
    this.updateKeyPrefix();
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
 * Asynchronously deletes this storage.
 * @private
 */
AuraStorage.prototype.deleteStorage = function() {
    var that = this;
    if (this.adapter.deleteStorage) {
        return this.adapter.deleteStorage();
    } else {
        return new Promise(function(success) {
            that.log("AuraStorage '" + that.name + "' [" + that.getName() + "] : " + "Does not implement deleteStorage(), returning success");
            success();
        });
    }
};

/**
 * Update the prefix for all storage keys.
 * @private
 */
AuraStorage.prototype.updateKeyPrefix = function() {
    this.keyPrefix = this.isolationKey + this.version + AuraStorage.KEY_DELIMITER;
};


/**
 * Storage key delimiter, separating isolation and version key from
 * the user-provided key.
 * @private
 */
AuraStorage.KEY_DELIMITER = ":";
