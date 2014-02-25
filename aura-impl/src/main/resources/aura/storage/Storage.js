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
    this.adapter = config["adapter"];
    this.maxSize = config["maxSize"];
    this.defaultExpiration = config["defaultExpiration"] * 1000;
    this.defaultAutoRefreshInterval = config["defaultAutoRefreshInterval"] * 1000;
    this.debugLoggingEnabled = config["debugLoggingEnabled"];
    
    var clearStorageOnInit = config["clearStorageOnInit"];
    
	this.log("AuraStorage:ctor() initializing storage adapter using { name: \"" + config["name"] + "\", implementation: \""
			+ this.adapter.getName() + "\", maxSize: " + this.maxSize + ", defaultExpiration: " + this.defaultExpiration
			+ ", defaultAutoRefreshInterval: " + this.defaultAutoRefreshInterval + ", clearStorageOnInit: " + clearStorageOnInit + ", debugLoggingEnabled: " + this.debugLoggingEnabled + " }");
    
    if (clearStorageOnInit === true) {
    	this.log("AuraStorage.ctor(): clearing " + this.getName() + " storage on init");
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
 * @return {Promise} A Promise that will clear storage.
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
    var promise = this.sweep().then(function() {
        return that.adapter.getItem(key).then(function(item) {

            that.log("AuraStorage.get(): using action found in " + that.getName() + " storage", [key, item]);

            if (!item) {
                return undefined;
            }

            return { value : item.value, isExpired : (new Date().getTime() > item.expires) };
        });
    });

    return promise;
};

/**
 * Asynchronously stores the value in storage using the specified key.
 * @param {String} key The key of the item to store. 
 * @param {Object} value The value of the item to store.
 * @return {Promise} A Promise that will put the value in storage.
 */
AuraStorage.prototype.put = function(key, value) {
    var now = new Date().getTime();

    var item = {
        "value": value,
        "created": now,
        "expires": now + this.defaultExpiration
    };

    var that = this;
    var promise = this.sweep().then(function() {

        return that.adapter.setItem(key, item)
            .then(function () {
                that.log("AuraStorage.put(): persisting action to " + that.getName() + " storage", [key, item]);
                $A.storageService.fireModified();
            });
    });

    return promise;
};

/**
 * @description Asynchronously removes the item indicated by key.
 * @param {String} key The key of the item to remove.
 * @param {Boolean} doNotFireModified A bool indicating whether or not to fire the modified event on item removal.
 * @return {Promise} A Promise that will remove the item from storage.
 * @private
 */
AuraStorage.prototype.remove = function(key, doNotFireModified) {
    var promise = this.adapter.removeItem(key)
        .then(function(){
            if (!doNotFireModified) {
                $A.storageService.fireModified();
            }
        });
    return promise;
};

/**
 * @description Asynchronously removes all expired items.
 * @return{Promise} A Promise that will execute sweep.
 * @private
 */
AuraStorage.prototype.sweep = function() {
    var that = this;
    var promise = $A.util.createPromise(function(success, error) {

        // Do not sweep if we have lost our connection - we'll
        // ignore expiration until sweeping resumes
        if (that._sweepingSuspended) {
            success();
            return;
        }

        // Check simple expirations
        return that.adapter.getExpired().then(function (expired) {

            if (expired.length === 0) {
                success();
                return;
            }

            var promiseSet = [];
            var key;
            for (var n = 0; n < expired.length; n++) {
                key = expired[n];
                that.log("AuraStorage.sweep(): expiring action from " + that.getName() + " storage adapter", key);
                promiseSet.push(that.remove(key, true));
            }

            // When all of the remove promises have completed...
            $A.util.when.apply(that, promiseSet).then(
                function () {
                    $A.storageService.fireModified();
                    success();
                },
                function (err) {
                    that.log("Error while AuraStorage.sweep was removing items: " + err);
                    error(err);
                }
            );
        });
    });

    return promise;
};

/**
 * Suspends sweeping. The storage adapter is removed if it is expired but sweeping can be suspended if the
 * connection goes offline.
 */
AuraStorage.prototype.suspendSweeping = function() {
	this.log("AuraStorage.suspendSweeping()");

	this._sweepingSuspended = true;
};

/**
 * Resumes sweeping to remove expired storage adapters.
 * @return{Promise} A Promise that will execute sweep.
 */
AuraStorage.prototype.resumeSweeping = function() {
	this.log("AuraStorage.resumeSweeping()");

	this._sweepingSuspended = false;
	return this.sweep();
};

/**
 * @private
 */
AuraStorage.prototype.log = function() {
	if (this.debugLoggingEnabled) {
        var msg = Array.prototype.join.call(arguments, " ");
        $A.log(msg);
	}
};

//#include aura.storage.Storage_export
