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
 * @description Storage for component definitions. If persistent storage
 * is not available then most operations are noops.
 * @constructor
 * @protected
 */
function ComponentDefStorage(){}

/**
 * Target size, as a percent of max size, for component def storage during eviction.
 */
ComponentDefStorage.prototype.EVICTION_TARGET_LOAD = 0.75;

/**
 * Key to use of the MutexLocker to guarantee atomic execution across tabs.
 */
ComponentDefStorage.prototype.LOCK_STORAGE_KEY = 'DEF_STORAGE';

/**
 * Minimum head room, as a percent of max size, to allocate after eviction and adding new definitions.
 */
ComponentDefStorage.prototype.EVICTION_HEADROOM = 0.1;

/**
 * Storage key used to track transactional bounds.
 * TODO W-2365447 - replace this with bulk remove + put
 */
ComponentDefStorage.prototype.TRANSACTION_SENTINEL_KEY = "sentinel_key";

/**
 * Queue of operations on the def store. Used to prevent concurrent DML on the def store, or analysis
 * of the def store during DML, which often results in a broken def graph. This is set to an array
 * when an operation is in-flight.
 */
ComponentDefStorage.prototype.queue = undefined;

/**
 * Whether to use storage for component definitions.
 * @returns {Boolean} whether to use storage for component definitions.
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
 * storage to backup definitions.
 */
ComponentDefStorage.prototype.setupDefinitionStorage = function() {
    if (this.useDefStore === undefined) {
        this.useDefStore = false;

        // only persistently cache defs if actions is persistently cached. this is because
        // labels are stored in the GVP mechanism which is stored in actions. if labels
        // aren't persisted and defs are then components get rendered without labels (or with
        // the label placeholder in non-prod mode).

        var actions = Action.getStorage();
        if (actions && actions.isPersistent()) {

            var storage = $A.storageService.getStorage("ComponentDefStorage");
            var removeStorage = false;
            if (!storage) {
                // only create (and then remove) if the app hasn't defined one
                removeStorage = true;
                storage = $A.storageService.initStorage(
                    "ComponentDefStorage",  // name
                    true,           // persistent
                    false,          // secure
                    4096000,        // maxSize 4MB
                    10886400,       // defaultExpiration (1/2 year because we handle eviction ourselves)
                    0,              // defaultAutoRefreshInterval
                    true,           // debugLoggingEnabled
                    false           // clearStorageOnInit
                );
            }

            // def storage only enabled with persistent storage
            if (storage.isPersistent()) {
                this.definitionStorage = storage;
                // explicitly disable sweeping b/c AuraComponentService handles eviction
                this.definitionStorage.suspendSweeping();
                this.useDefStore = true;
            } else if (removeStorage) {
                $A.storageService.deleteStorage("ComponentDefStorage");
            }
        }
    }
};

/**
 * Gets the storage for component definitions.
 * @return {AuraStorage|null} the component def storage or null if it's disabled.
 */
ComponentDefStorage.prototype.getStorage = function () {
    if (this.useDefinitionStorage()) {
        return this.definitionStorage;
    }
};

/**
 * Stores component and library definitions into storage. Should always be called from within a call to #enqueue().
 * @param {Array} cmpConfigs the component definitions to store
 * @param {Array} libConfigs the lib definitions to store
 * @return {Promise} promise that resolves when storing is complete.
 */
ComponentDefStorage.prototype.storeDefs = function(cmpConfigs, libConfigs, context) {
    if (!this.useDefinitionStorage() || (!cmpConfigs.length && !libConfigs.length)) {
        return Promise["resolve"]();
    }

    var that = this;
    return this.definitionStorage.put(this.TRANSACTION_SENTINEL_KEY, {})
        .then(function() {
        var promises = [];
        var descriptor, encodedConfig, i;

        for (i = 0; i < cmpConfigs.length; i++) {
            descriptor = cmpConfigs[i]["descriptor"];
            cmpConfigs[i]["uuid"] = context.findLoaded(descriptor);
            encodedConfig = $A.util.json.encode(cmpConfigs[i]);
                promises.push(that.definitionStorage.put(descriptor, encodedConfig));
        }

        for (i = 0; i < libConfigs.length; i++) {
            descriptor = libConfigs[i]["descriptor"];
            encodedConfig = $A.util.json.encode(libConfigs[i]);
                promises.push(that.definitionStorage.put(descriptor, encodedConfig));
        }

        return Promise["all"](promises).then(
            function () {
                $A.log("ComponentDefStorage: Successfully stored " + cmpConfigs.length + " components, " + libConfigs.length + " libraries");
                    return that.definitionStorage.remove(that.TRANSACTION_SENTINEL_KEY)
                        .then(
                            undefined,
                            function() {
                                // we can't recover: the defs were properly stored but the sentinel is still there.
                                // W-2365447 removes the need for a sentinel which eliminates this possibility.
                            }
                        );
            },
            function (e) {
                $A.warning("ComponentDefStorage: Error storing  " + cmpConfigs.length + " components, " + libConfigs.length + " libraries", e);
                    // error storing defs so the persisted def graph is broken. do not remove the sentinel:
                    // 1. reject this promise so the caller, AuraComponentService.saveDefsToStorage(), will
                    //    clear the def + action stores which removes the sentinel.
                    // 2. if the page reloads before the stores are cleared the sentinel prevents getAll()
                    //    from restoring any defs.
                throw e;
            }
        );
        });
};

/**
 * Removes definitions from storage. Should always be called from within a call to #enqueue().
 * @param {String[]} descriptors the descriptors identifying the definitions to remove.
 * @return {Promise} a promise that resolves when the definitions are removed.
 */
ComponentDefStorage.prototype.removeDefs = function(descriptors) {
    if (!this.useDefinitionStorage() || !descriptors.length) {
        return Promise["resolve"]();
    }

    var that = this;
    return this.definitionStorage.put(this.TRANSACTION_SENTINEL_KEY, {})
        .then(function() {
            var promises = [];
            for (var i = 0; i < descriptors.length; i++) {
                    promises.push(that.definitionStorage.remove(descriptors[i], true));
            }

            return Promise["all"](promises).then(
                function () {
                    $A.log("ComponentDefStorage: Successfully removed " + promises.length + " descriptors");
                    return that.definitionStorage.remove(that.TRANSACTION_SENTINEL_KEY)
                    .then(
                        undefined,
                        function() {
                            // we can't recover: the defs were properly removed but the sentinel is still there.
                            // W-2365447 removes the need for a sentinel which eliminates this possibility.
                        }
                    );
                },
                function (e) {
                    $A.log("ComponentDefStorage: Error removing  " + promises.length + " descriptors", e);
                    // error removing defs so the persisted def graph is broken. do not remove the sentinel:
                    // 1. reject this promise so the caller, AuraComponentService.evictDefsFromStorage(), will
                    //    clear the def + action stores which removes the sentinel.
                    // 2. if the page reloads before the stores are cleared the sentinel prevents getAll()
                    //    from restoring any defs.
                    throw e;
                }
            );
        });
};


/**
 * Gets all definitions from storage. Should always be called from within a call to #enqueue().
 * @return {Promise} a promise that resolves with an array of the configs from storage. If decoding
 *  the configs fails the promise rejects. If the underlying storage fails or is disabled the promise
 *  resolves to an empty array.
 */
ComponentDefStorage.prototype.getAll = function () {
    if (!this.useDefinitionStorage()) {
        return Promise["resolve"]([]);
    }

    var that = this;
    var actions = Action.getStorage();

    return this.definitionStorage.getAll().then(
        function(items) {
            function clearActionsCache() {
                if (actions && actions.isPersistent()) {
                    return actions.clear();
                }
                return Promise["resolve"]();
            }

            function throwSentinelError() {
                throw new $A.auraError("Sentinel value found in def storage indicating a corrupt def graph", null, $A.severity.QUIET);
            }

            var i, len, result = [];
            for (i = 0, len = items.length; i < len; i++) {
                var item = items[i];

                // if sentinel key is found then the persisted graph is corrupt. clear it and
                // cause the parent promise to error.
                if (item["key"] === that.TRANSACTION_SENTINEL_KEY) {
                    return that.definitionStorage.clear()
                        .then(clearActionsCache, clearActionsCache)
                        .then(throwSentinelError, throwSentinelError);
                }

                var config = $A.util.json.decode(item["value"]);
                if (config === null) {
                    throw new $A.auraError("Error decoding definition from storage: " + item["key"], null, $A.severity.QUIET);
                }
                result.push({ "key": item["key"], "value" : config });
            }

            return result;
        },
        function() {
            return [];
        }
    );
};

/**
 * Asynchronously retrieves all definitions from storage and adds to component service.
 * @return {Promise} a promise that resolves when definitions are restored.
 */
ComponentDefStorage.prototype.restoreAll = function(context) {
    var that = this;
    return this.enqueue(function(resolve) {
        that.getAll()
        .then(
            function(items) {
                var libCount = 0;
                var cmpCount = 0;

                // decode all items
                for (var i = 0; i < items.length; i++) {
                    var config = items[i]["value"];
                    if (config["includes"]) {
                        if (!$A.componentService.hasLibrary(config["descriptor"])) {
                            $A.componentService.saveLibraryConfig(config);
                        }
                        libCount++;
                    } else {
                        if (config["uuid"]) {
                            context.addLoaded(config["uuid"]);
                        }
                        if (!$A.componentService.getComponentDef(config)) {
                            $A.componentService.saveComponentConfig(config);
                        }
                        cmpCount++;
                    }
                }

                $A.log("ComponentDefStorage: restored " + cmpCount + " components, " + libCount + " libraries from storage into registry");
                resolve();
            }
        ).then(
            undefined, // noop
            function(e) {
                $A.log("ComponentDefStorage: error during restore from storage, no component or library defs restored", e);
                resolve();
            }
        );
    });
};


/**
 * Enqueues a function that requires isolated access to def storage.
 * @param {function} execute the function to execute.
 * @return {Promise} a promise that resolves when the provided function executes.
 */
ComponentDefStorage.prototype.enqueue = function(execute) {
    var that = this;

    // run the next item on the queue
    function executeQueue() {
        // should never happen
        if (!that.queue) {
            return;
        }

        var next = that.queue.pop();
        if (next) {
            $A.log("ComponentDefStorage.enqueue: " + (that.queue.length+1) + " items in queue, running next");
            $A.util.Mutex.lock(that.LOCK_STORAGE_KEY , function (unlock) {
                // next["execute"] is run within a promise so may do async things (eg return other promises,
                // use setTimeout) before calling resolve/reject. the mutex must be held until the promise
                // resolves/rejects.
                that.mutexUnlock = unlock;
                next["execute"](next["resolve"], next["reject"]);
            });
        } else {
            that.queue = undefined;
        }
    }

    var promise = new Promise(function(resolve, reject) {
        // if something is in-flight then just enqueue
        if (that.queue) {
            that.queue.push({ "execute":execute, "resolve":resolve, "reject":reject });
            return;
        }

        // else run it immediately
        that.queue = [{ "execute":execute, "resolve":resolve, "reject":reject }];
        executeQueue();
    });

    // when this promise resolves or rejects, unlock the mutex then run the next item in the queue
    promise.then(
        function() {
            try { that.mutexUnlock(); } catch (ignore) { /* ignored */ }
            executeQueue();
        },
        function() {
            try { that.mutexUnlock(); } catch (ignore) { /* ignored */ }
            executeQueue();
        }
    );

    return promise;
};


/**
 * Clears all definitions from storage.
 * @return {Promise} a promise that resolves when storage is cleared.
 */
ComponentDefStorage.prototype.clear = function() {
    if (this.useDefinitionStorage()) {
        return this.definitionStorage.clear();
    }
    return Promise["resolve"]();
};

Aura.Component.ComponentDefStorage = ComponentDefStorage;