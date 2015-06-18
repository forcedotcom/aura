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

/**
 * Returns a ComponentDef instance from registry
 * @param {String|Object} descriptor name of a ComponentDef.
 * @returns {ComponentDef} ComponentDef from registry
 */
ComponentDefRegistry.prototype.getDef = function(descriptor) {
    $A.assert(descriptor, "No ComponentDef descriptor specified");
    return this.componentDefs[descriptor];
};

/**
 * Creates and returns ComponentDef
 * @param {Object} config component definition configuration
 * @returns {ComponentDef} component definition
 */
ComponentDefRegistry.prototype.createDef = function(config) {
    $A.assert(config && config["descriptor"], "ComponentDef config required for registration");
    var descriptor = config["descriptor"];
    var def = this.getDef(descriptor);
    if (!def) {
        def = this.saveComponentDef(config);
        this.storeDef(descriptor, config);
    }

    return def;
};

/**
 * Saves component def into registry (memory) and updates list of dynamic namespaces
 * @param {Object} config Component config
 * @returns {ComponentDef} ComponentDef
 */
ComponentDefRegistry.prototype.saveComponentDef = function(config) {
    var def = new ComponentDef(config);
    var descriptor = def.getDescriptor().toString();
    this.componentDefs[descriptor] = def;
    var namespace = def.getDescriptor().getNamespace();
    if (descriptor.indexOf("layout://") === 0 && this.dynamicNamespaces.indexOf(namespace) === -1) {
        this.dynamicNamespaces.push(namespace);
    }

    // Execute the Component Class before returning
    var componentClassDef = config["componentClass"];
    if(componentClassDef) {
        componentClassDef = $A.util.json.decode(componentClassDef);
        componentClassDef();
    }

    return def;
};

/**
 * Determine whether to save component def to storage. Currently, only dynamic layout definitions
 * @param {String }descriptor component descriptor
 * @returns {boolean} true if layout def
 */
ComponentDefRegistry.prototype.shouldStore = function(descriptor) {
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
        if ($A.getContext().getApp()) {
            var storage = $A.storageService.initStorage(
                "ComponentDefRegistry",  // name
                true,           // persistent
                false,          // secure
                2048000,        // maxSize 2MB
                1209600,        // defaultExpiration (2 weeks)
                0,              // defaultAutoRefreshInterval
                true,           // debugLoggingEnabled
                false           // clearStorageOnInit
            );
            if (storage.isPersistent()) {
                // we only want a persistent storage
                this.definitionStorage = storage;
                this.useDefStore = true;
            } else {
                $A.storageService.deleteStorage("ComponentDefRegistry");
            }
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
            var i, len;
            for (i = 0, len = items.length; i < len; i++) {
                var item = items[i];
                var descriptor = item["key"];
                // TODO W-2512654: revisit "isExpired"
                if (!item["isExpired"] && $A.util.isUndefinedOrNull(defRegistry.componentDefs[descriptor])) {
                    var config = $A.util.json.decode(item["value"]);
                    $A.componentService.saveComponentConfig(config);
                }
            }
            $A.log("ComponentDefRegistry: restored " + len + " definitions from storage into registry");
            defRegistry.restoreInProgress = false;
        },
        function() {
            defRegistry.restoreInProgress = false;
        }
    );
};

/**
 * Stores component definition into storage
 *
 * @param {String} descriptor component descriptor
 * @param {Object} config config
 */
ComponentDefRegistry.prototype.storeDef = function(descriptor, config) {
    if (this.useDefinitionStorage() && this.shouldStore(descriptor)) {
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
    if (this.useDefinitionStorage() && this.shouldStore(descriptor)) {
        this.definitionStorage.remove(descriptor, true);
    }
};

/**
 * Clears storage
 * @return {Promise} Promise when storage is cleared
 */
ComponentDefRegistry.prototype.clearStorage = function() {
    var promise;
    if (this.useDefinitionStorage()) {
        promise = this.definitionStorage.clear();
    } else {
        promise = Promise["resolve"]();
    }

    return promise;
};

Aura.Component.ComponentDefRegistry = ComponentDefRegistry;