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
 * @description A registry for ComponentDef objects.
 * @constructor
 * @protected
 */
function ComponentDefRegistry(){
    this.componentDefs = {};
    this.dynamicNamespaces = [];
}

ComponentDefRegistry.prototype.auraType = "ComponentDefRegistry";

ComponentDefRegistry.prototype.cacheName = "componentDefRegistry.catalog";

ComponentDefRegistry.prototype.isLocalStorageAvailable = (function() {
    if (window.localStorage) {
        // Now actually try a test write because private browsing and use of local when not authorized by the user will only fail on writes
        try {
            window.localStorage.setItem("test", "test");
            window.localStorage.removeItem("test");
            return true;
        } catch(ignore) {
        }
    }

    return false;
})();

/**
 * Returns a ComponentDef instance from registry, or config after adding to the registry.
 * Throws an error if config is not provided.
 * @param {Object} config Passes in a config, a ComponentDef, or the name of a ComponentDef.
 * @param {Boolean} noInit If set to false, try loading from cache first before
 * trying to write through of local storage cacheable componentDefs.
 * @returns {ComponentDef} a ComponentDef instance from registry, or config after adding to registry.
 */
ComponentDefRegistry.prototype.getDef = function(config, noInit) {

    if(config === undefined) {
        throw new Error("ComponentDef Config required for registration");
    }

    // We don't re-register (or modify in any way) once we've registered
    var descriptor;
    if (config["descriptor"]) {
        descriptor = config["descriptor"];
    } else {
        descriptor = config;
        config = undefined;
    }
    if ($A.util.isString(descriptor) && (descriptor.indexOf("://") < 0)) {
        descriptor = "markup://" + descriptor; // support shorthand
    }
    var ret = this.componentDefs[descriptor];
    if ((!noInit) && !ret) {
        // use localStorage as alternative if storage implementation is not available
        var useLocalStorage = !this.useDefinitionStorage() && this.useLocalCache(descriptor);
        if (useLocalStorage) {
            // Try to load from cache
            var cachedConfig = this.getConfigFromLocalCache(descriptor);
            if (cachedConfig) {
                config = cachedConfig;
                useLocalStorage = false;
            }
        }

        if (config === undefined) {
            $A.error("Unknown component: "+descriptor);
            throw new Error("Unknown component: "+descriptor);
        }

        ret = this.saveComponentDef(config);

        // Execute the Component Class before returning
        var componentClassDef = config["componentClass"];
        if(componentClassDef) {
            componentClassDef = $A.util.json.decode(componentClassDef);
            componentClassDef();
        }

        if (useLocalStorage) {
            // Write through of local storage cacheable componentDefs
            try {
                this.writeToCache(descriptor, config);
            } catch (ignore) {
                // This fails when localStorage is full. Carry on.
            }
        }

        if (this.useDefinitionStorage() && this.shouldSaveToStorage(descriptor)) {
            this.saveToStorage(descriptor, config);
        }
    }

    return ret;
};

/**
 * Saves component def into registry (memory) and updates list of dynamic namespaces
 * @param {Object} config Component config
 * @returns {ComponentDef} ComponentDef
 */
ComponentDefRegistry.prototype.saveComponentDef = function(config) {
    var def = new $A.ns.ComponentDef(config);
    var descriptor = def.getDescriptor().toString();
    this.componentDefs[descriptor] = def;
    var namespace = def.getDescriptor().getNamespace();
    if (descriptor.indexOf("layout://") === 0 && this.dynamicNamespaces.indexOf(namespace) === -1) {
        this.dynamicNamespaces.push(namespace);
    }

    return def;
};

/**
 * Use the local cache for the page session persistently when layouts are used.
 */
ComponentDefRegistry.prototype.useLocalCache = function(descriptor) {
    return this.isLocalStorageAvailable && !$A.util.isUndefinedOrNull(descriptor) && descriptor.indexOf("layout://") === 0;
};

/**
 * Returns the JSON decoded localStorage values based on the cache name,
 * or returns null.
 */
ComponentDefRegistry.prototype.getLocalCacheCatalog = function() {
    if (!this.isLocalStorageAvailable) {
        return null;
    }

    var catalog = localStorage.getItem(this.cacheName);
    return catalog ? $A.util.json.decode(catalog) : {};
};

/**
 * Returns the JSON decoded localStorage value.
 * @param {Object} descriptor The key to look up on the localStorage.
 */
ComponentDefRegistry.prototype.getConfigFromLocalCache = function(descriptor) {
    if (!this.isLocalStorageAvailable) {
        return null;
    }

    var item = localStorage.getItem(this.cacheName + "." + descriptor);
    return item ? $A.util.json.decode(item) : null;
};

/**
 * Updates the local cache catalog and writes out the componentDef.
 * @param {String} descriptor
 * @param {Object} config
 */
ComponentDefRegistry.prototype.writeToCache = function(descriptor, config) {
    if (this.isLocalStorageAvailable) {
        // Update the catalog
        var catalog = this.getLocalCacheCatalog();
        catalog[descriptor] = true;
        localStorage.setItem(this.cacheName, $A.util.json.encode(catalog));

        // Write out the componentDef
        var encodedConfig = $A.util.json.encode(config);
        localStorage.setItem(this.cacheName + "." + descriptor, encodedConfig);
    }
};

/**
 * Clears all component definitions from localStorage
 *
 */
ComponentDefRegistry.prototype.clearCache = function() {
    var catalog=this.getLocalCacheCatalog();
    if(catalog){
        for(var descriptor in catalog){
            localStorage.removeItem(this.cacheName + "." +descriptor);
        }
        localStorage.removeItem(this.cacheName);
    }
};

/**
 * Determine whether to save component def to storage. Currently, only dynamic layout definitions
 * @param {String }descriptor component descriptor
 * @returns {boolean} true if layout def
 */
ComponentDefRegistry.prototype.shouldSaveToStorage = function(descriptor) {
    return descriptor.indexOf("layout://") === 0;
};

/**
 * Whether to use storage for component definitions
 * @returns {Boolean} whether to use storage for component definitions
 */
ComponentDefRegistry.prototype.useDefinitionStorage = function() {
    if (this.useDefStore === undefined) {
        this.setupDefinitionStorage();
    }
    return this.useDefStore;
};

/**
 * Creates storage to determine whether available storage mechanism is persistent
 * to store component definitions. Uses storage if persistent. Otherwise, don't use
 * storage to backup definitions
 */
ComponentDefRegistry.prototype.setupDefinitionStorage = function() {
    if (this.useDefStore === undefined) {
        this.useDefStore = false;
        var storage = $A.storageService.initStorage(
            this.auraType,  // name
            true,           // persistent
            true,           // secure
            2048000,        // maxSize 2MB
            1209600,        // defaultExpiration (2 weeks)
            0,              // defaultAutoRefreshInterval
            true,           // debugLoggingEnabled
            false           // clearStorageOnInit
        );
        if (storage.isPersistent() && storage.isSecure()) {
            // we only want a persistent storage that is not websql because it will be deprecated
            this.definitionStorage = storage;
            this.useDefStore = true;
        } else {
            $A.storageService.deleteStorage(this.auraType);
        }
    }
};

/**
 * Asynchronously retrieves all definitions in storage and adds to localStorage
 */
ComponentDefRegistry.prototype.restoreAllFromStorage = function() {
    if (!this.useDefinitionStorage() || this.restoreInProgress) {
        return;
    }
    var defRegistry = this;
    this.restoreInProgress = true;
    this.definitionStorage.getAll().then(
        function(items) {
            defRegistry.saveAllToRegistry(items);
            defRegistry.restoreInProgress = false;
        },
        function() {
            defRegistry.restoreInProgress = false;
        }
    );
};

/**
 * Saves component definitions to registry (memory)
 * @param {Array} items Array of objects containing component descriptor as key, value as definition
 */
ComponentDefRegistry.prototype.saveAllToRegistry = function (items) {
    if (!$A.util.isArray(items)) {
        $A.warning("Component definitions should be in an array");
        return;
    }

    var iLength = items.length;
    for (var i = 0; i < iLength; i++) {
        var item = items[i];
        var descriptor = item["key"];
        // TODO W-2512654: revisit "isExpired"
        if (!item["isExpired"] && $A.util.isUndefinedOrNull(this.componentDefs[descriptor])) {
            var config = $A.util.json.decode(item["value"]);
            this.saveComponentDef(config);
        }
    }
};

/**
 * Save component definition to storage
 *
 * @param {String} descriptor component descriptor
 * @param {Object} config config
 */
ComponentDefRegistry.prototype.saveToStorage = function(descriptor, config) {
    var encodedConfig = $A.util.json.encode(config);
    this.definitionStorage.put(descriptor, encodedConfig).then(
        function () {
            $A.log("ComponentDefRegistry: Successfully stored " + descriptor);
        },
        function () {
            $A.log("ComponentDefRegistry: Error storing " + descriptor);
        }
    );
};

/**
 * Removes component def from registry
 * @param {String} descriptor Component descriptor
 */
ComponentDefRegistry.prototype.removeDef = function(descriptor) {
    delete this.componentDefs[descriptor];
    if (descriptor.indexOf("layout://") === 0) {
        var d = this.dynamicNamespaces.indexOf(descriptor);
        if (d !== -1) {
            this.dynamicNamespaces.splice(d, 1);
        }
    }
    if (this.useDefinitionStorage() && this.shouldSaveToStorage(descriptor)) {
        this.definitionStorage.remove(descriptor, true);
    }
};
