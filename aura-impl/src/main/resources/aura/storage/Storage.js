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
 * @description The storage service implementation
 * @constructor
 * @param {Object} config The configuration describing the characteristics of the storage to be created.
 */
var AuraStorage = function AuraStorage(config) {
    this.name = config["name"];
    this.adapter = config["adapter"];
    this.maxSize = config["maxSize"];
    this.defaultExpiration = config["defaultExpiration"] * 1000;
    this.defaultAutoRefreshInterval = config["defaultAutoRefreshInterval"] * 1000;
    this.debugLoggingEnabled = config["debugLoggingEnabled"];
    this.lastSweep = new Date().getTime();
    this.setVersion(config["version"]);

    var clearStorageOnInit = config["clearStorageOnInit"];

    this.log("initializing storage adapter using { name: \"" + config["name"] + "\", implementation: \""
        + this.adapter.getName() + "\", maxSize: " + this.maxSize + ", defaultExpiration: " + this.defaultExpiration
        + ", defaultAutoRefreshInterval: " + this.defaultAutoRefreshInterval + ", clearStorageOnInit: " + clearStorageOnInit + ", debugLoggingEnabled: " + this.debugLoggingEnabled + " }");

    if (clearStorageOnInit === true) {
        this.log("clearing " + this.getName() + " storage on init");
        this.adapter.clear();
    }

    // work around the obfuscation logic to allow external Adapters to properly plug in
    this.adapter.clear = this.adapter.clear || this.adapter["clear"];
    this.adapter.getExpired = this.adapter.getExpired || this.adapter["getExpired"];
    this.adapter.getItem = this.adapter.getItem || this.adapter["getItem"];
    this.adapter.getName = this.adapter.getName || this.adapter["getName"];
    this.adapter.getSize = this.adapter.getSize || this.adapter["getSize"];
    this.adapter.removeItem = this.adapter.removeItem || this.adapter["removeItem"];
    this.adapter.setItem = this.adapter.setItem || this.adapter["setItem"];
    this.adapter.getAll = this.adapter.getAll || this.adapter["getAll"];

    var adapterConfig = $A.storageService.getAdapterConfig(this.adapter.getName());
    this.persistent = !$A.util.isUndefinedOrNull(adapterConfig["persistent"]) && adapterConfig["persistent"];
    this.secure = !$A.util.isUndefinedOrNull(adapterConfig["secure"]) && adapterConfig["secure"];

    //#if {"excludeModes" : ["PRODUCTION", "PRODUCTIONDEBUG"]}
    this.adapter["getItem"] = this.adapter.getItem;
    this["adapter"] = this.adapter;
    //#end
};

/**
 * Returns the name of the storage type. For example, "smartStore", "websql", or "memory".
 * @returns {String} The storage type.
 */
AuraStorage.prototype.getName = function() {
    return this.adapter.getName();
};

/**
 * Asynchronously gets the current storage size in KB.
 * @returns {Promise} A Promise that will get the current storage size in KB.
 */
AuraStorage.prototype.getSize = function() {
    return this.adapter.getSize()
        .then(function(size) { return size / 1024.0; } );
};

/**
 * Returns the maximum storage size in KB.
 * @returns {number} The maximum storage size in KB.
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
 */
AuraStorage.prototype.clear = function() {
    return this.adapter.clear();
};

/**
 * Asynchronously gets an item from storage corresponding to the specified key.
 * @param {String} key The item key. This is the key used when the item was added to storage using put().
 * @returns {Promise} A Promise that will fetch an item from storage.
 */
AuraStorage.prototype.get = function(key) {
    // This needs to also be asynchronous to map to IndexedDB, WebSQL, SmartStore that are all async worlds
    var that = this;
    var promise = this.adapter.getItem(this.version + key).then(function(item) {
        that.log("get() " + (item ? "HIT" : "MISS") + " - key: " + key + ", value: " + item);

        if (!item) {
            return undefined;
        }
        return { "value" : item.value, "isExpired" : (new Date().getTime() > item["expires"]) };
    });

    this.sweep();

    return promise;
};

/**
 * Asynchronously gets all items from storage
 * @returns {Promise} A Promise that will fetch all items from storage.
 */
AuraStorage.prototype.getAll = function() {
    var that = this;
    return this.adapter.getAll().then(function(items) {
        that.log("getAll() - found " + items.length + " items");
        return $A.util.map(items, function(item) {
            var realKey = item["key"],
                key = realKey;
            if (realKey.indexOf(that.version) === 0) {
                // in case version string is part of the actual key
                // then only replace first occurrence
                key = item["key"].replace(that.version, "");
            }
            return { "key": key, "value": item["value"], "isExpired": (new Date().getTime() > item.expires) };
        });
    });
};

/**
 * Asynchronously stores the value in storage using the specified key.
 * @param {String} key The key of the item to store.
 * @param {Object} value The value of the item to store.
 * @returns {Promise} A Promise that will put the value in storage.
 */
AuraStorage.prototype.put = function(key, value) {
    var now = new Date().getTime();

    var item = {
        "value": value,
        "created": now,
        "expires": now + this.defaultExpiration
    };

    var that = this;
    var promise = this.adapter.setItem(this.version + key, item)
        .then(function () {
            that.log("put() - key: " + key + ", value: " + item);
            $A.storageService.fireModified();
        });

    this.sweep();

    return promise;
};

/**
 * @description Asynchronously removes the item indicated by key.
 * @param {String} key The key of the item to remove.
 * @param {Boolean} doNotFireModified A bool indicating whether or not to fire the modified event on item removal.
 * @returns {Promise} A Promise that will remove the item from storage.
 * @private
 */
AuraStorage.prototype.remove = function(key, doNotFireModified) {
    return this.adapter.removeItem(this.version + key)
        .then(function(){
            if (!doNotFireModified) {
                $A.storageService.fireModified();
            }
        });
};

/**
 * @description Asynchronously removes all expired items.
 * @private
 */
AuraStorage.prototype.sweep = function() {

    // Do not sweep if we have lost our connection, we'll ignore expiration until sweeping resumes
    // OR if we've recently swept
    if (this._sweepingSuspended || ((new Date().getTime() - this.lastSweep) < (this.defaultExpiration / 60))) {
        this.log("sweep() - skipping sweep");
        return;
    }

    var that = this;

    // Check simple expirations
    this.adapter.getExpired().then(function (expired) {

        if (expired.length === 0) {
            return;
        }

        var promiseSet = [];
        var key;
        for (var n = 0; n < expired.length; n++) {
            key = expired[n];
            that.log("sweep() - expiring item with key: " + key);
            promiseSet.push(that.remove(key, true));
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
};

/**
 * Suspends sweeping. The storage adapter is removed if it is expired but sweeping can be suspended if the
 * connection goes offline.
 */
AuraStorage.prototype.suspendSweeping = function() {
    this.log("suspendSweeping()");

    this._sweepingSuspended = true;
};

/**
 * Resumes sweeping to remove expired storage adapters.
 */
AuraStorage.prototype.resumeSweeping = function() {
    this.log("resumeSweeping()");

    this._sweepingSuspended = false;
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
 * Whether current storage implementation is persistent
 * @returns {boolean} true if persistent
 */
AuraStorage.prototype.isPersistent = function() {
    return this.persistent;
};

/**
 * Whether current storage implementation is secure
 * @returns {boolean} true if secure
 */
AuraStorage.prototype.isSecure = function() {
    return this.secure;
};

/**
 * Sets the storage version. Cannot be set unless never set.
 */
AuraStorage.prototype.setVersion  = function(version) {
    // ensure string
    this.version = (version || "") + "";
};

/**
 * Returns the storage version.
 * @returns {String} storage version.
 */
AuraStorage.prototype.getVersion  = function() {
    return this.version;
};


//#include aura.storage.Storage_export
