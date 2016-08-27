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
function storageContents() {
    /**
     * Must match ComponentDefStorage.prototype.TRANSACTION_SENTINEL_KEY;
     * TODO W-3314745 - eliminate this
     */
    var TRANSACTION_SENTINEL_KEY = "sentinel_key";

    /**
     * Delay between storage queries to avoid saturating the service/browser.
     */
    var STORAGE_DELAY = 100;

    /**
     * Gets a promise that, after a delay, invokes and resolves to the provided function.
     * This is useful when dealing with Aura Storage to avoid overwhelming the store with requests,
     * which starves the framework requests.
     * @param {Function} func function to invoke after the delay
     * @param {Number=} delay delay, in milliseconds, before invoking func
     * @return {Promise} a promise that resolves with the provided functions return value.
     */
    function getDelayPromise(func, delay) {
        $A.assert(typeof func === "function", "func must be a function");

        delay = delay || STORAGE_DELAY;
        return new Promise(function(resolve, reject) {
            setTimeout(function() {
                try {
                    resolve(func());
                } catch (e) {
                    reject(e);
                }
            }, delay);
        });
    }


    return {

        /**
         * Waits for storage to become idle.
         * @param {Array} storages the set of storages to wait to become idle.
         * @return {Promise} a promise that resolves when all storages are idle.
         */
        waitForStorageIdle: function(storages) {
            $A.assert(Array.isArray(storages), "storages must be an array of AuraStorage instances");

            function checkInFlightOperations(storage) {
                if (storage.inFlightOperations() > 0) {
                    return getDelayPromise(checkInFlightOperations.bind(this, storage));
                }
                // storage is idle so resolve the promise chain
            }

            var promises = [];
            for (var i = 0; i < storages.length; i++) {
                promises.push(checkInFlightOperations(storages[i]));
            }

            return Promise["resolve"](promises);
        },


        /**
         * Waits for an entry to be present in storage.
         * @param {AuraStorage} storage the storage to inspect.
         * @param {String} key the key of the entry
         * @param {Boolean=} prefix truthy if desc is a prefix; falsey if desc must be an exact match.
         * @return {Promise} a promise that resolves when the key is in storage.
         */
        waitForKeyInStorage: function(storage, key, prefix) {
            $A.assert(storage, "storage must be an an Aura Storage instance");
            $A.assert(typeof key === "string" && key.length > 0, "key must be a non-empty string");

            return this.waitForStorageByPredicate(
                storage,
                function(items) {
                    // exact match
                    if (!prefix) {
                        if (key in items) {
                            return items[key]
                        }
                        return undefined;
                    }

                    // prefix match
                    for (var i in items) {
                        if (i.indexOf(key) === 0) {
                            return items[i];
                        }
                    }
                    return undefined;
                }
            );
        },


        /**
         * Waits for an entry to be absent from storage.
         * @param {AuraStorage} storage the storage to inspect.
         * @param {String} key the key of the entry
         * @param {Boolean=} prefix truthy if desc is a prefix; falsey if desc must be an exact match.
         * @return {Promise} a promise that resolves when the key is not in storage.
         */
        waitForKeyNotInStorage: function(storage, key, prefix) {
            $A.assert(storage, "storage must be an an Aura Storage instance");
            $A.assert(typeof key === "string" && key.length > 0, "key must be a non-empty string");

            return this.waitForStorageByPredicate(
                storage,
                function(items) {
                    // exact match
                    if (!prefix) {
                        if (key in items) {
                            // key is found so predicate not satisfied
                            return undefined;
                        }
                        // key not found, return non-undefined to indicate predicate is satisfied
                        return true;
                    }

                    // prefix match
                    for (var i in items) {
                        if (i.indexOf(key) === 0) {
                            // key prefix matches so predicate not satisfied
                            return undefined;
                        }
                    }

                    // key prefix not matched so return non-undefined to indicate predicate is satisfied
                    return true;
                }
            );
        },


        /**
         * Gets whether a key is in storage.
         * @param {AuraStorage} storage the storage to inspect.
         * @param {String} key the key of the entry
         * @param {Boolean=} prefix truthy if desc is a prefix; falsey if desc must be an exact match.
         * @return {Promise} a promise that resolves to a boolean indicating whether the
         *  key is in storage.
         */
        isKeyInStorage: function(storage, key, prefix) {
            $A.assert(storage, "storage must be an an Aura Storage instance");
            $A.assert(typeof desc === "string", "desc must be a string in form namespace:name");

            var that = this;
            return storage.getAll([], true)
            .then(
                function(items) {
                    // exact match
                    if (!prefix) {
                        return !!(items[key]);
                    }

                    // prefix match
                    for (var i in items) {
                        if (i.indexOf(key) === 0) {
                            return true;
                        }
                    }
                    return false;
                }
            );
        },


        /**
         * Waits for def storage to complete all in-flight operations.
         * @param {Object=} global optional global object, defaults to window.
         * @return {Promise} a promise that resolves when def storage is idle.
         */
        waitForDefStorageIdle: function(global) {
            global = global || window;
            var storage = global.$A.storageService.getStorage("ComponentDefStorage");
            return this.waitForStorageIdle([storage]);
        },


        /**
         * Waits for a def in storage.
         * @param {String} desc component descriptor. Eg ui:scroller.
         * @param {Object=} global optional global object, defaults to window.
         * @return {Promise} a promise that resolves when the def is in storage.
         */
        waitForDefInStorage: function(desc, global) {
            $A.assert(typeof desc === "string", "desc must be a string in form namespace:name");

            desc = "markup://" + desc;
            global = global || window;
            var storage = global.$A.storageService.getStorage("ComponentDefStorage");
            return this.waitForStorageByPredicate(
                storage,
                function(items) {
                    if (items[TRANSACTION_SENTINEL_KEY]) {
                        // storage is in the middle of an operation so recurse
                        return undefined;
                    }
                    return (desc in items);
                }
            );
        },


        /**
         * Waits for a def to be absent from storage.
         * @param {String} desc component descriptor. Eg ui:scroller.
         * @param {Object=} global optional global object, defaults to window.
         * @return {Promise} a promise that resolves when the def is not in storage.
         */
        waitForDefNotInStorage: function(desc, global) {
            $A.assert(typeof desc === "string", "desc must be a string in form namespace:name");

            desc = "markup://" + desc;
            global = global || window;
            var storage = global.$A.storageService.getStorage("ComponentDefStorage");
            return this.waitForStorageByPredicate(
                storage,
                function(items) {
                    if (items[TRANSACTION_SENTINEL_KEY]) {
                        // storage is in the middle of an operation so recurse
                        return undefined;
                    }
                    return !(desc in items);
                }
            );
        },


        /**
         * Gets whether a def is in storage.
         * @param {String} desc component descriptor. Eg ui:scroller.
         * @param {Object=} global optional global object, defaults to window.
         * @return {Promise} a promise that resolves to a boolean indicating whether
         * the def is in storage.
         */
        isDefInStorage: function(desc, global) {
            $A.assert(typeof desc === "string", "desc must be a string in form namespace:name");

            desc = "markup://" + desc;
            global = global || window;
            var storage = global.$A.storageService.getStorage("ComponentDefStorage");

            function checkDefInStorage() {
                return storage.getAll([], true)
                    .then(
                        function(items) {
                            if (items[TRANSACTION_SENTINEL_KEY]) {
                                // storage is in the middle of an operation so recurse
                                return getDelayPromise(checkDefInStorage);
                            }
                            return !!(items[desc]);
                        }
                    );
            }

            return checkDefInStorage();
        },


        /**
         * Waits for action storage to complete all in-flight operations.
         * @param {Object=} global optional global object, defaults to window.
         * @return {Promise} a promise that resolves when def storage is idle.
         */
        waitForActionStorageIdle: function(global) {
            global = global || window;
            var storage = global.$A.storageService.getStorage("actions");
            return this.waitForStorageIdle([storage]);
        },


        /**
         * Waits for an action to be present in storage.
         * @param {String} desc component descriptor. Eg ui:scroller.
         * @param {Boolean=} prefix truthy if desc is a prefix; falsey if desc must be an exact match.
         * @param {Object=} global optional global object, defaults to window.
         * @return {Promise} a promise that resolves when the action is in storage.
         */
        waitForActionInStorage: function(desc, prefix, global) {
            global = global || window;
            var storage = global.$A.storageService.getStorage("actions");
            return this.waitForKeyInStorage(storage, desc, prefix);
        },


        /**
         * Waits for an action to be absent in storage.
         * @param {String} desc component descriptor. Eg ui:scroller.
         * @param {Boolean=} prefix truthy if desc is a prefix; falsey if desc must be an exact match.
         * @param {Object=} global optional global object, defaults to window.
         * @return {Promise} a promise that resolves when the action is not in storage.
         */
        waitForActionNotInStorage: function(desc, prefix, global) {
            global = global || window;
            var storage = global.$A.storageService.getStorage("actions");
            return this.waitForKeyNotInStorage(storage, desc, prefix);
        },


        /**
         * Waits for storage contents to satisfy a provided predicate.
         * @param {AuraStorage} storage the storage to inspect.
         * @param {Function} predicate the predicate to satisfy. The predicate must return undefined to
         *  indicate unsatisfied; any other value is considered satisfied. The predicate is invoked with
         *  the result of storage.getAll(). May be invoked multiple times.
         * @return {Promise} a promise that resolves to the truthy value return by predicate.
         */
        waitForStorageByPredicate: function(storage, predicate) {
            $A.assert(storage, "storage must be an an Aura Storage instance");
            $A.assert(typeof predicate === "function", "predicate must be a function");

            var that = this;

            function checkEntryInStorage() {
                // short-circuit recursion if test is complete
                if ($A.test.isComplete()) {
                    return Promise["reject"](new Error("Test complete, killing recursion"));
                }

                return storage.getAll([], true)
                    .then(
                        function(items) {
                            var found = predicate(items);
                            if (found === undefined) {
                                return getDelayPromise(checkEntryInStorage);
                            }
                            // predicate found so resolve the promise chain
                            return found;
                        }
                    );
            }

            return checkEntryInStorage();
        },


    };
}
