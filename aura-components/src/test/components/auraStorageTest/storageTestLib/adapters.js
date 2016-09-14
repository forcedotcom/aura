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
function adapters() {

    return {
        /**
         * Gets a storage adapter that fails on all operations.
         * @param {String} name the adapter name.
         * @param {Boolean} secure whether the adapter is secure.
         * @param {Boolean} persistent whether the adapter is persistent.
         * @return {Function} constructor function of the adapter.
         */
        getAdapterThatFailsAllOperations: function(name, secure, persistent) {
            $A.assert(typeof name === "string" && name.length > 0, "name must be a non-empty string");
            $A.assert(typeof secure === "boolean", "secure must be a boolean");
            $A.assert(typeof persistent === "boolean", "persistent must be a boolean");

            var FailingAdapter = function FailingAdapter() {};
            FailingAdapter.NAME = name;
            FailingAdapter.prototype.initialize = function() { return Promise["resolve"](); };
            FailingAdapter.prototype.getName = function() { return name; };
            FailingAdapter.prototype.isSecure = function() { return secure; };
            FailingAdapter.prototype.isPersistent = function() { return persistent; };
            FailingAdapter.prototype.suspendSweeping = function() {};
            FailingAdapter.prototype.resumeSweeping = function() {};

            // delete storage always succeeds to make test tear down simpler
            FailingAdapter.prototype.deleteStorage = function() { return Promise.resolve(); };

            var funcs = ["setItems", "getItems", "removeItems", "clear", "sweep", "getSize"];
            for (var f in funcs) {
                FailingAdapter.prototype[funcs[f]] = function(operation) { // eslint-disable-line no-loop-func
                    return Promise.reject(new Error(operation + "(): mock always fails"));
                }.bind(undefined, funcs[f]);
            }
            return FailingAdapter;
        },

        /**
         * Gets a storage adapter that fails initialization.
         * @param {String} name the adapter name.
         * @param {Boolean} secure whether the adapter is secure.
         * @param {Boolean} persistent whether the adapter is persistent.
         * @return {Function} constructor function of the adapter.
         */
        getAdapterThatFailsInitialization: function(name, secure, persistent) {
            $A.assert(typeof name === "string" && name.length > 0, "name must be a non-empty string");
            $A.assert(typeof secure === "boolean", "secure must be a boolean");
            $A.assert(typeof persistent === "boolean", "persistent must be a boolean");

            var FailInitAdapter = function FailInitAdapter() {};
            FailInitAdapter.NAME = name;
            FailInitAdapter.prototype.initialize = function() { return Promise["reject"](new Error("init always fails")); };
            FailInitAdapter.prototype.getName = function() { return name; };
            FailInitAdapter.prototype.isSecure = function() { return secure; };
            FailInitAdapter.prototype.isPersistent = function() { return persistent; };
            FailInitAdapter.prototype.suspendSweeping = function() {};
            FailInitAdapter.prototype.resumeSweeping = function() {};

            // delete storage always succeeds to make test tear down simpler
            FailInitAdapter.prototype.deleteStorage = function() { return Promise.resolve(); };

            var funcs = ["setItems", "getItems", "removeItems", "clear", "sweep", "getSize"];
            for (var f in funcs) {
                FailInitAdapter.prototype[funcs[f]] = function(operation) { // eslint-disable-line no-loop-func
                    return Promise.reject(new Error(operation + "(): mock always fails"));
                }.bind(undefined, funcs[f]);
            }
            return FailInitAdapter;
        },

        /**
         * Gets a storage adapter that fails after a set number of operations. Useful to
         * to simulate adapters that enter a non-recoverable error state.
         * @param {String} name the adapter name.
         * @param {Boolean} secure whether the adapter is secure.
         * @param {Boolean} persistent whether the adapter is persistent.
         * @param {Number} operationCount count of operations that succeed before the adapter
         *  fails all operations.
         * @return {Function} constructor function of the adapter.
         */
        getAdapterThatFailsAfterNOperations: function(name, secure, persistent, operationCount) {
            $A.assert(typeof name === "string" && name.length > 0, "name must be a non-empty string");
            $A.assert(typeof secure === "boolean", "secure must be a boolean");
            $A.assert(typeof persistent === "boolean", "persistent must be a boolean");
            $A.assert(typeof operationCount === "number" && operationCount >= 0, "operationCount must be a positive number");

            var FailingAdapter = function FailingAdapter() {};
            FailingAdapter.NAME = name;
            FailingAdapter.prototype.initialize = function() { return Promise["resolve"](); };
            FailingAdapter.prototype.getName = function() { return name; };
            FailingAdapter.prototype.isSecure = function() { return secure; };
            FailingAdapter.prototype.isPersistent = function() { return persistent; };
            FailingAdapter.prototype.suspendSweeping = function() {};
            FailingAdapter.prototype.resumeSweeping = function() {};

            // delete storage always succeeds to make test tear down simpler
            FailingAdapter.prototype.deleteStorage = function() { return Promise.resolve(); };

            var count = 0;
            var funcs = ["setItems", "getItems", "removeItems", "clear", "sweep", "getSize"];
            for (var f in funcs) {
                FailingAdapter.prototype[funcs[f]] = function(operation) { // eslint-disable-line no-loop-func

                    count++;
                    if (count > operationCount) {
                        return Promise.reject(new Error(operation + "(): mock fails after " + operationCount + " operations"));
                    }
                    return Promise.resolve();
                }.bind(undefined, funcs[f]);
            }
            return FailingAdapter;
        }
    };
}
