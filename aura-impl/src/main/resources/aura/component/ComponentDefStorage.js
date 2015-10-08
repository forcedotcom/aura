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
function ComponentDefStorage(){}

/**
 * Determine whether to save component def to storage. Currently, only dynamic layout definitions
 * @param {String }descriptor component descriptor
 * @returns {boolean} true if layout def
 */
ComponentDefStorage.prototype.shouldStore = function(descriptor) {
    return descriptor.indexOf("layout://") === 0;
};

/**
 * Whether to use storage for component definitions
 * @returns {Boolean} whether to use storage for component definitions
 */
ComponentDefStorage.prototype.useDefinitionStorage = function() {
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
ComponentDefStorage.prototype.setupDefinitionStorage = function() {
    if (this.useDefStore === undefined) {
        this.useDefStore = false;
        if ($A.getContext().getApp()) {
            var storage = $A.storageService.initStorage(
                "ComponentDefStorage",  // name
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
                $A.storageService.deleteStorage("ComponentDefStorage");
            }
        }
    }
};

/**
 * Stores component definition into storage
 *
 * @param {String} descriptor component descriptor
 * @param {Object} config config
 */
ComponentDefStorage.prototype.storeDef = function(descriptor, config) {
    if (this.useDefinitionStorage() && this.shouldStore(descriptor)) {
        var encodedConfig = $A.util.json.encode(config);
        this.definitionStorage.put(descriptor, encodedConfig).then(
            function () {
                $A.log("ComponentDefStorage: Successfully stored " + descriptor);
            },
            function () {
                $A.log("ComponentDefStorage: Error storing " + descriptor);
            }
        );
    }
};

/**
 * Removes component def from registry
 * @param {String} descriptor Component descriptor
 */
ComponentDefStorage.prototype.removeDef = function(descriptor) {
    if (this.useDefinitionStorage() && this.shouldStore(descriptor)) {
        this.definitionStorage.remove(descriptor, true);
    }
};


/**
 * Asynchronously retrieves all definitions in storage and adds to localStorage
 */
ComponentDefStorage.prototype.restoreAllFromStorage = function() {
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
                if (!item["isExpired"] && !$A.componentService.hasDefinition(descriptor)) {
                    var config = $A.util.json.decode(item["value"]);
                    $A.componentService.saveComponentConfig(config);
                }
            }
            $A.log("ComponentDefStorage: restored " + len + " definitions from storage into registry");
            defRegistry.restoreInProgress = false;
        },
        function() {
            defRegistry.restoreInProgress = false;
        }
    );
};

/**
 * Clears storage
 * @return {Promise} Promise when storage is cleared
 */
ComponentDefStorage.prototype.clearAllFromStorage = function() {
    var promise;
    if (this.useDefinitionStorage()) {
        promise = this.definitionStorage.clear();
    } else {
        promise = Promise["resolve"]();
    }

    return promise;
};

Aura.Component.ComponentDefStorage = ComponentDefStorage;