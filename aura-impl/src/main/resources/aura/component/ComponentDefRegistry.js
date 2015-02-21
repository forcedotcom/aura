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

        if (config === undefined) {
            $A.error("Unknown component: "+descriptor);
            throw new Error("Unknown component: "+descriptor);
        }

        ret = this.saveComponentDef(config);

        if (this.shouldSaveToStorage(descriptor)) {
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
    if (this.useDefinitionStorage()) {
        var encodedConfig = $A.util.json.encode(config);
        this.definitionStorage.put(descriptor, encodedConfig).then(
            function () {
                $A.log("ComponentDefRegistry: Successfully stored " + descriptor);
            },
            function () {
                $A.log("ComponentDefRegistry: Error storing " + descriptor);
            }
        );
    }
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

