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
 * @description The Aura Storage Service, accessible using $A.storageService.
 * @constructor
 * @export
 */
function AuraStorageService(){
    this.storages = {};
    this.adapters = {};
    this.version = "";
    this.isolationKey = "";
}

/**
 * Returns an existing storage using the specified name. For example, <code>$A.storageService.getStorage("MyStorage").getSize()</code> returns the cache size.
 * <p>See Also: <a href="#reference?topic=api:AuraStorage">AuraStorage</a></p>
 * @param {String} name The name of the requested storage.
 * @memberOf AuraStorageService
 * @returns {AuraStorage} Returns an AuraStorage object corresponding to an existing storage.
 * @export
 */
AuraStorageService.prototype.getStorage = function(name) {
    return this.storages[name];
};


/**
 * Returns all existing storages.
 * <p>See Also: <a href="#reference?topic=api:AuraStorage">AuraStorage</a></p>
 * @memberOf AuraStorageService
 * @returns {Object} Returns a map of storage names to AuraStorage objects.
 * @export
 */
AuraStorageService.prototype.getStorages = function() {
    return $A.util.apply({}, this.storages);
};

/**
 * Initializes and returns new storage.
 * @param {String} name Required. The unique name of the storage to be initialized.
 * @param {Boolean} persistent Set to true if the requested storage is persistent.
 * @param {Boolean} secure Set to true if the requested storage is secure.
 * @param {number} maxSize Specifies the maximum storage size (bytes).
 * @param {number} defaultExpiration Specifies the default time (seconds) after which the cache expires. When an item is requested that has gone past the default cache expiration time, it will not be used.
 * @param {number} defaultAutoRefreshInterval Specifies the default interval (seconds) after which cached data is to be refreshed.
 * @param {Boolean} debugLoggingEnabled Set to true to enable debug logging in the JavaScript console for the Aura Storage Service.
 * @param {Boolean} clearStorageOnInit Set to true to clear storage when storage is initialized.
 * @param {String} version The version of storage. for any item in the storage. This is useful if you want to avoid retrieving stale cached items for a newer version of your application.
 * @memberOf AuraStorageService
 * @returns {AuraStorage} Returns an AuraStorage object for the new storage.
 * @export
 */
AuraStorageService.prototype.initStorage = function(name, persistent, secure, maxSize, defaultExpiration, defaultAutoRefreshInterval, debugLoggingEnabled, clearStorageOnInit, version) {
    if (this.storages[name]) {
        $A.error("Storage named '" + name + "' already exists!");
    }

    var adapter = this.createAdapter(this.selectAdapter(persistent, secure), name, maxSize, debugLoggingEnabled);

    // apply the default version if one is not specified (falsey values, like <auraStorage:init/>'s default empty string, is treated as not specified)
    if (!version) {
        version = this.version;
    }

    var config = {
        "name": name,
        "adapter": adapter,
        "maxSize": maxSize,
        "defaultExpiration": defaultExpiration,
        "defaultAutoRefreshInterval": defaultAutoRefreshInterval,
        "debugLoggingEnabled": debugLoggingEnabled,
        "clearStorageOnInit": clearStorageOnInit,
        "version": version,
        "isolationKey": this.isolationKey
    };

    var storage = new AuraStorage(config);
    this.storages[name] = storage;

    return storage;
};

/**
 * Registers a new Aura Storage Service adapter.
 *
 * @param {Object} config Adapter configuration object.
 * @memberOf AuraStorageService
 * @export
 */
AuraStorageService.prototype.registerAdapter = function(config) {
    var name = config["name"];

    if (this.adapters[name]) {
        $A.error("AuraStorageService.registerAdapter() adapter '" + name + "' already registered!");
        return;
    }

    this.adapters[name] = config;
};

/**
 * Whether an adapter is registered
 *
 * @param {String} name adapter name
 * @memberOf AuraStorageService
 * @returns {boolean} whether adapter is registered
 * @export
 */
AuraStorageService.prototype.isRegisteredAdapter = function(name) {
    return this.adapters[name] !== undefined;
};

/**
 * Returns an adapter's configuration.
 *
 * @param {String} adapter name of the adapter
 * @memberOf AuraStorageService
 * @export
 */
AuraStorageService.prototype.getAdapterConfig = function(adapter) {
    return this.adapters[adapter];
};

/**
 * Creates a storage adapter. Used only by tests.
 * <p>Example:</p>
 * <code>$A.storageService.createAdapter("memory", "test", 4096, true);</code>
 * @param {String} adapter The new adapter to create.
 * @param {String} name The name of the adapter.
 * @param {Integer} maxSize The maximum size (bytes) to allocate to the storage adapter.
 * @param {Boolean} debugLoggingEnabled Set to true to enable logging, or false otherwise.
 * @memberOf AuraStorageService
//#if {"excludeModes" : ["PRODUCTION", "PRODUCTIONDEBUG"]}
	@export
 //#end
 */
AuraStorageService.prototype.createAdapter = function(adapter, name, maxSize, debugLoggingEnabled) {
    var config = this.adapters[adapter];
    if (!config) {
        $A.error("AuraStorageService.createAdapter() unknown adapter '" + adapter + "'!");
    }

    var AdapterClass = config["adapterClass"];

    var adapterConfig = {
        "name": name,
        "maxSize": maxSize,
        "debugLoggingEnabled": debugLoggingEnabled
    };

    return new AdapterClass(adapterConfig);
};

AuraStorageService.prototype.fireModified = function() {
    var e = $A.get("e.auraStorage:modified");
    if (e) {
        e.fire();
    }
};

/**
 * Selects an adapter based on the given configuration. Used mostly in non-production modes.
 * @param {Boolean} persistent Set to true if the adapter should be persistent, or false otherwise.
 * @param {Boolean} secure Set to true if the adapter should be secure, or false otherwise.
 * @memberOf AuraStorageService
 //#if {"excludeModes" : ["PRODUCTION", "PRODUCTIONDEBUG"]}
	@export
 //#end
 */
AuraStorageService.prototype.selectAdapter = function(persistent, secure) {
    // Find the best match for the specific implementation based on the requested configuration

    var candidates = [];
    for (var name in this.adapters) {
        var adapter = this.adapters[name];

        // If secure is required then find all secure adapters otherwise use any adapter
        if (!secure || adapter["secure"] === true) {
            candidates.push(adapter);
        }
    }

    if (candidates.length === 0) {
        $A.error("AuraStorageService.selectAdapter() unable to find a secure adapter implementation!");
        return null;
    }

    // Now take the set of candidates and weed out any non-persistent if persistence is requested (not required)
    var match;
    for (var n = 0; !match && n < candidates.length; n++) {
        var candidate = candidates[n];
        var candidateIsPersistent = candidate["persistent"];
        if ((persistent && candidateIsPersistent === true) || (!persistent && !candidateIsPersistent)) {
            match = candidate;
        }
    }

    if (!match) {
        match = candidates[0];
    }

    return match["name"];
};

/**
 * Deletes a storage.
 * @param {String} name name of storage to delete.
 * @export
 */
AuraStorageService.prototype.deleteStorage = function(name) {
    var storage = this.getStorage(name);
    if (!storage) {
        // Nothing to delete, just call success callback
        return Promise["resolve"]();
    }

    var promise = storage.deleteStorage();
    delete this.storages[name];
    return promise;
};

/**
 * Sets the default version for all storages.
 * @param {String} version default version for storages.
 * @export
 */
AuraStorageService.prototype.setVersion = function(version) {
    // ensure string
    this.version = (version || "") + "";
};

/**
 * Gets the default version for all storages.
 * @return {String} the default version for storages.
 * @export
 */
AuraStorageService.prototype.getVersion = function() {
    return this.version;
};

/**
 * Sets a key from which isolation in the storage system is enforced.
 *
 * This mechanism is typically used to isolate multiple users' data by setting
 * the isolation key to the user id.
 *
 * It should only be called once during the application life cycle, since it
 * will be deleted in production mode.
 *
 *
 * @param {String} isolationKey the key defining isolation.
 * @export
 */
AuraStorageService.prototype.setIsolation = function(isolationKey) {
    // ensure string
    this.isolationKey = (isolationKey || "") + "";

    //#if {"modes" : ["PRODUCTION", "PRODUCTIONDEBUG"]}
    delete AuraStorageService.prototype.setIsolation;
    delete AuraStorageService.prototype["setIsolation"];
    //#end

};

Aura.Services.AuraStorageService = AuraStorageService;
