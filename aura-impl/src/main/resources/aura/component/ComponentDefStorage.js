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
 * @description Storage for component, library, and event definitions. If persistent storage
 * is not available then most operations are noops.
 * @constructor
 * @protected
 */
function ComponentDefStorage() {}

/**
 * Target size, as a percent of max size, for component def storage during eviction.
 */
ComponentDefStorage.prototype.EVICTION_TARGET_LOAD = 0.75;

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
 * Key to use of the MutexLocker to guarantee atomic execution across tabs.
 */
ComponentDefStorage.prototype.MUTEX_KEY = "ComponentDefStorage";

/**
 * Function to release the mutex, set while the mutex is held.
 */
ComponentDefStorage.prototype.mutexUnlock = undefined;

/**
 * Queue of operations on the def store. Used to prevent concurrent DML on the underlying AuraStorage, or analysis
 * of the AuraStorage contents during DML, which often results in a broken def graph. This is set to an array
 * when an operation is in-flight.
 */
ComponentDefStorage.prototype.queue = undefined;

/**
 * Whether defs are backed up to persistent storage. Evaluated to a boolean
 * on first request to operate on defs (get, put, or remove).
 */
ComponentDefStorage.prototype.useDefStore = undefined;

/**
 * The AuraStorage instance.
 */
ComponentDefStorage.prototype.storage = undefined;


/**
 * Whether to use storage for component definitions.
 * @returns {Boolean} Whether to use storage for component definitions.
 */
ComponentDefStorage.prototype.useDefinitionStorage = function() {
    if (this.useDefStore === undefined) {
        this.setupDefinitionStorage();
    }
    return this.useDefStore;
};

/**
 * Sets up persistent storage for definitions if the necessary prerequisites are satisfied.
 * If they are not then storage is not setup and definitions are not backed up.
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
                storage = $A.storageService.initStorage({
                    "name":         "ComponentDefStorage",
                    "persistent":   true,
                    "secure":       false,
                    "maxSize":      4096000, // 4MB
                    "expiration":   10886400, // 1/2 year because we handle eviction ourselves
                    "debugLogging": true,
                    "clearOnInit":  false
                });
            }

            // def storage only enabled with persistent storage
            if (storage.isPersistent()) {
                this.storage = storage;
                // explicitly disable sweeping b/c AuraComponentService handles eviction
                this.storage.suspendSweeping();
                this.useDefStore = true;
            } else if (removeStorage) {
                $A.storageService.deleteStorage("ComponentDefStorage");
            }
        }
    }
};

/**
 * Gets the storage for component definitions.
 * @return {AuraStorage|null} The component def storage or null if it's disabled.
 */
ComponentDefStorage.prototype.getStorage = function () {
    if (this.useDefinitionStorage()) {
        return this.storage;
    }
};

/**
 * Stores component and library definitions into storage. Should always be called from within a call to #enqueue().
 * @param {Array} cmpConfigs The component definitions to store.
 * @param {Array} libConfigs The library definitions to store.
 * @param {Array} evtConfigs The event definitions to store.
 * @param {AuraContext} context The Aura context.
 * @return {Promise} Promise that resolves when storing is complete.
 */
ComponentDefStorage.prototype.storeDefs = function(cmpConfigs, libConfigs, evtConfigs, context) {
    if (!this.useDefinitionStorage() || (!cmpConfigs.length && !libConfigs.length && !evtConfigs.length)) {
        return Promise["resolve"]();
    }

    var that = this;
    return this.storage.set(this.TRANSACTION_SENTINEL_KEY, true)
        .then(function() {
            var toStore = {};
            var descriptor, encodedConfig, i;

            for (i = 0; i < cmpConfigs.length; i++) {
                descriptor = cmpConfigs[i]["descriptor"];
                cmpConfigs[i]["uuid"] = context.findLoaded(descriptor);
                encodedConfig = $A.util.json.encode(cmpConfigs[i]);
                toStore[descriptor] = encodedConfig;
            }

            for (i = 0; i < libConfigs.length; i++) {
                descriptor = libConfigs[i]["descriptor"];
                encodedConfig = $A.util.json.encode(libConfigs[i]);
                toStore[descriptor] = encodedConfig;
            }

            for (i = 0; i < evtConfigs.length; i++) {
                descriptor = evtConfigs[i]["descriptor"];
                encodedConfig = $A.util.json.encode(evtConfigs[i]);
                toStore[descriptor] = encodedConfig;
            }

            return that.storage.setAll(toStore).then(
                function () {
                    $A.log("ComponentDefStorage: Successfully stored " + cmpConfigs.length + " components, " + libConfigs.length + " libraries, " + evtConfigs.length + " events");
                        return that.storage.remove(that.TRANSACTION_SENTINEL_KEY)
                            .then(
                                undefined,
                                function() {
                                    // we can't recover: the defs were properly stored but the sentinel is still there.
                                    // W-2365447 removes the need for a sentinel which eliminates this possibility.
                                }
                            );
                },
                function (e) {
                    $A.warning("ComponentDefStorage: Error storing  " + cmpConfigs.length + " components, " + libConfigs.length + " libraries, " + evtConfigs.length + " events", e);
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
 * @param {String[]} descriptors The descriptors identifying the definitions to remove.
 * @return {Promise} A promise that resolves when the definitions are removed.
 */
ComponentDefStorage.prototype.removeDefs = function(descriptors) {
    if (!this.useDefinitionStorage() || !descriptors.length) {
        return Promise["resolve"]();
    }

    var that = this;
    return this.storage.set(this.TRANSACTION_SENTINEL_KEY, true)
        .then(function() {
            return that.storage.removeAll(descriptors, true)
                .then(
                    function () {
                        $A.log("ComponentDefStorage: Successfully removed " + descriptors.length + " descriptors");
                        return that.storage.remove(that.TRANSACTION_SENTINEL_KEY)
                        .then(
                            undefined,
                            function() {
                                // we can't recover: the defs were properly removed but the sentinel is still there.
                                // W-2365447 removes the need for a sentinel which eliminates this possibility.
                            }
                        );
                    },
                    function (e) {
                        $A.log("ComponentDefStorage: Error removing  " + descriptors.length + " descriptors", e);
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
 * @return {Promise} A promise that resolves with a map of descriptor name to definitions. If
 *  the underlying storage fails or is disabled then the promise resolves to an empty map.
 */
ComponentDefStorage.prototype.getAll = function () {
    if (!this.useDefinitionStorage()) {
        return Promise["resolve"]({});
    }

    var that = this;
    var actions = Action.getStorage();

    return this.storage.getAll([], true).then(
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

            // if sentinel key is found then the persisted graph is corrupt. clear it and
            // cause the parent promise to error.
            if (items[that.TRANSACTION_SENTINEL_KEY] === true) {
                return that.storage.clear()
                    .then(clearActionsCache, clearActionsCache)
                    .then(throwSentinelError, throwSentinelError);
            }

            var result = {};
            for (var key in items) {
                var config = $A.util.json.decode(items[key]);
                if (config === null) {
                    throw new $A.auraError("Error decoding definition from storage: " + key, null, $A.severity.QUIET);
                }
                result[key] = config;
            }
            return result;
        },
        function() {
            return {};
        }
    );
};

/**
 * Asynchronously retrieves all definitions from storage and adds to component service.
 * @return {Promise} A promise that resolves when definitions are restored.
 */
ComponentDefStorage.prototype.restoreAll = function(context) {
    var that = this;
    return this.enqueue(function(resolve, reject) {
        that.getAll()
        .then(
            function(items) {
                var libCount = 0;
                var cmpCount = 0;
                var evtCount = 0;

                // Decode all items
                // @dval: The following type checking is REALLY loose and flaky.
                // All this code needs to go as part of the epic caching refactor.
                for (var key in items) {
                    var config = items[key];

                    if (config["type"] && config["attributes"]) { // It's an event (although the signature is... interesting)
                        if (!$A.eventService.getEventDef(config)) {
                            $A.eventService.saveEventConfig(config);
                        }
                        evtCount++;
                    } else if (config["includes"]) { // it's a library
                        if (!$A.componentService.hasLibrary(config["descriptor"])) {
                            $A.componentService.saveLibraryConfig(config);
                        }
                        libCount++;
                    } else {
                        // Otherwise, it's a component
                        if (config["uuid"]) {
                            context.addLoaded(config["uuid"]);
                        }
                        if (!$A.componentService.getComponentDef(config)) {
                            $A.componentService.saveComponentConfig(config);
                        }
                        cmpCount++;
                    }
                }

                $A.log("ComponentDefStorage: restored " + cmpCount + " components, " + libCount + " libraries, " + evtCount + " events from storage into registry");
                resolve();
            }
        ).then(
            undefined, // noop
            function(e) {
                $A.log("ComponentDefStorage: error during restore from storage, no component, library or event defs restored", e);
                reject(e);
            }
        );
    });
};


/**
 * Enqueues a function that requires isolated access to the underlying AuraStorage.
 * @param {Function} execute The function to execute.
 * @return {Promise} A promise that resolves when the provided function executes.
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
            $A.util.Mutex.lock(that.MUTEX_KEY , function (unlock) {
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
 * Clears persisted definitions and all dependent stores and context.
 * @param {Object=} metricsPayload An optional payload to send to metrics service.
 * @return {Promise} A promise that resolves when all stores are cleared.
 */
ComponentDefStorage.prototype.clear = function(metricsPayload) {
    // if def storage isn't in use then nothing to do
    if (!this.useDefinitionStorage()) {
        return Promise["resolve"]();
    }

    var that = this;
    return new Promise(function(resolve) {
        // aura has an optimization whereby the client reports (on every XHR) to the server the
        // dynamic defs it has and the server doesn't resend those defs. this is managed in
        // aura.context.loaded.
        //
        // by clearing the persisted defs this optimization needs to be reset: the server must
        // send all defs so the client rebuilds a complete def graph for persistence. (the in-memory
        // graph remains complete at all times but when the app is restarted memory is reset.)
        //
        // to avoid an in-flight XHR from having a stale context.loaded value, def clearing is
        // carefully orchestrated:
        // 1. wait until no XHRs are in flight
        // 2. synchronously clear aura.context.loaded
        // 3. async clear the actions store
        // 4. async clear the def store
        //
        // 1 & 2 ensures all future XHRs have a context.loaded value that matches the cleared def store.
        // because 3 and 4 are async it's possible that XHRs may be sent and received after 2 but
        // before 3 or 4 completes; that's ok because ComponentDefStorage#enqueue provides mutual exclusion
        // to persistent def store manipulation.

        // log that we're starting the clear
        metricsPayload = $A.util.apply({}, metricsPayload);
        metricsPayload["evicted"] = "all";
        $A.metricsService.transactionStart("aura", "evictedDefs", { "context": metricsPayload });

        $A.clientService.runWhenXHRIdle(function() {
            $A.warning("ComponentDefStorage.clear: clearing all defs and actions");

            // clear aura.context.loaded
            $A.context.resetLoaded();

            var actionClear;
            var actionStorage = Action.getStorage();
            if (actionStorage && actionStorage.isPersistent()) {
                actionClear = actionStorage.clear().then(
                    undefined, // noop on success
                    function(e) {
                        $A.warning("ComponentDefStorage.clear: failure clearing actions store", e);
                        metricsPayload["actionsError"] = true;
                        // do not rethrow to return to resolve state
                    }
                );
            } else {
                actionClear = Promise["resolve"]();
            }

            var defClear = that.storage.clear().then(
                undefined, // noop on success
                function(e) {
                    $A.warning("ComponentDefStorage.clear: failure clearing cmp def store", e);
                    metricsPayload["componentDefStorageError"] = true;
                    // do not rethrow to return to resolve state
                }
            );

            var promise = Promise.all([actionClear, defClear]).then(
                function() {
                    // done the clearing. metricsPayload is updated with any errors
                    $A.metricsService.transactionEnd("aura", "evictedDefs", { "context": metricsPayload });
                }
            );
            resolve(promise);
        });
    });
};

Aura.Component.ComponentDefStorage = ComponentDefStorage;
