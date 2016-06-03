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
function(StorageUtil) {
    /** Constructor */
    function Operations() {
        // the AuraStorage instance
        this._storage = undefined;

        // number of runs of the perf test
        this._runs = 1;

        // counter for current run
        this._runIndex = 0;

        // callback function, invoked after each set of operations
        this._analysisCallback = undefined;

        // metrics service callback, invoked when the entire perf test is complete
        this._msCallback = undefined;

        // log / data collector
        this._logs = [];

        // payload size (bytes)
        this._payloadSize = 1;

        // array of payloads (length equivalent to number of operations)
        this._payload = undefined;

        // array of operation configs: name, count
        this._operations = [];
    }


    /** Metrics Service namespace */
    Operations.MS_NAMESPACE = "auraStoragePerformTestLibrary";


    /**
     * Sets the storage on which all operations are performed.
     * @param {AuraStorage} storage the storage on which all operations are performed.
     */
    Operations.prototype.setStorage = function(storage) {
        $A.assert($A.util.isObject(storage), "storage must be an AuraStorage");
        this._storage = storage;
    };


    /**
     * Sets the number of runs of the performance test. That is, the number of
     * times to loop over all operations.
     * @param {Number} count the number of runs.
     */
    Operations.prototype.setRuns = function(count) {
        $A.assert($A.util.isFiniteNumber(count) && count > 0, "count must be a positive number");
        this._runs = count;
    };


    /**
     * @param {Number} size the size of the payload (bytes).
     */
    Operations.prototype.setPayloadSize = function(size) {
        $A.assert($A.util.isFiniteNumber(size) && size > 0, "size must be a positive number");
        this._payloadSize = size;
    };


    /**
     * @param {String[]} operations the list of operation names. See AuraStorage.js.
     * @param {Number} count the number of times to perform each operation.
     */
    Operations.prototype.setOperations = function(operations, count) {
        $A.assert(Array.isArray(operations), "operations must be an array");
        $A.assert($A.util.isFiniteNumber(count) && count > 0, "count must be a positive number");

        this._operations = [];

        var c, i;
        for (i = 0; i < operations.length; i++) {
            switch(operations[i]) {
            case "clear":
                // more than 1 execution is non-sensical
                c = 1;
                break;
            case "getAll":
                // expensive operation so limit to 5 executions
                c = Math.min(5, count);
                break;
            default:
                c = count;
            }

            this._operations.push({
                name: operations[i],
                count: c
            });
        }

        this._payload = [];
        for (i = 0; i < count; i++) {
            this._payload.push(StorageUtil.generatePayload(this._payloadSize));
        }
    };


    /**
     * Sets the callback which is invoked after each operation is run.
     * @param {Function=} fn the function to invoke.
     */
    Operations.prototype.setAnalysisCallback = function(fn) {
        $A.assert(fn === undefined || $A.util.isFunction(fn), "fn must be undefined or a function");
        this._analysisCallback = fn;
    };


    /**
     * Sets the Metrics Service completion callback.
     * @param {Function=} fn the function to invoke.
     */
    Operations.prototype.setMetricsServiceDone = function(fn) {
        $A.assert(fn === undefined || $A.util.isFunction(fn), "fn must be undefined or a function");
        this._msCallback = fn;
    };


    /**
     * Runs the perf test.
     */
    Operations.prototype.run = function() {
        var promise = Promise["resolve"]();

        for (var i = 0; i < this._runs; i++) {
            promise = promise.then(function() {
                this._runIndex++;
                return this._runListOfOperationsOnce(this._operations);
            }.bind(this));
        }

        promise = promise.then(function() {
            this._msCallback && this._msCallback(this._msPostProcessor.bind(this));
        }.bind(this));

        // error handler for the entire chain of promises
        promise = promise["catch"](function(e){
            this._msCallback();
            throw e;
        }.bind(this));

        return promise;
    };


    /**
     * Runs a list of operations once, running each one serially.
     * @param {Object[]} operations the set of operations to run.
     * @param {String} operations.name the name of the operation to run.
     * @param {Number} operations.count the number of times to run the operation.
     * @return {Promise} a promise that resolves when the operations are complete.
     */
    Operations.prototype._runListOfOperationsOnce = function(operations) {
        // promise chain start
        var promise = Promise["resolve"]();

        // run each operation serially
        // use bind to closure the values at the specific loop iteration
        var operation;
        for (var i = 0; i < operations.length; i++) {
            operation = operations[i];
            promise = promise
                .then(this._runOneOperationManyTimes.bind(this, operation.name, operation.count))
                .then(
                    function(name, transaction) {
                        this._log(name, transaction);
                    }.bind(this, operation.name)
                );
        }

        return promise;
    };


    /**
     * Runs one operation serially many times.
     * @param {String} operation the operation to run.
     * @param {Number} count the number of times to the run operation.
     */
    Operations.prototype._runOneOperationManyTimes = function(operation, count) {
        // function to run a single storage operation, wrapped in
        // mark start and end.
        // @return {Promise} a promise that resolves when the operation is complete.
        function run(operation, index) {
            var args = this._getStorageFunctionAsArray(operation, index);
            var fn = args[0];
            args = Array.prototype.slice.call(args, 1);

            var markKey = this._getMsKey(operation, index);
            $A.metricsService.markStart(Operations.MS_NAMESPACE, markKey);
            return this._storage[fn].apply(this._storage, args)
                .then(
                    function() {
                        $A.metricsService.markEnd(Operations.MS_NAMESPACE, markKey);
                    }
                );
        }

        var transactionKey = this._getMsKey(operation, "");

        // promise chain start: start the transaction
        var promise = new Promise(function(resolve) {
            $A.metricsService.transactionStart(Operations.MS_NAMESPACE, transactionKey);
            resolve();
        }.bind(this));

        // run each operation serially. each is wrapped with a mark start + end.
        for (var i = 0; i < count; i++) {
            promise = promise.then(run.bind(this, operation, i));
        }

        // grab the size
        promise = promise.then(function() {
            return this._storage.getSize();
        }.bind(this))
            // end the transaction, and return the transaction data
            .then(function(size) {
                var transactionData;
                $A.metricsService.transactionEnd(
                    Operations.MS_NAMESPACE,
                    transactionKey,
                    { context : { storeSize : size } },
                    function postProcess(t) { // invoked synchronously
                        transactionData = t;
                    }
                );
                return transactionData;
        });

        // return the promise chain
        return promise;
    };


    /**
     * Gets an AuraStorage function as an array so it may be invoked with function.apply.
     * @param {String} operation the name of the operation.
     * @param {Number} index the operation's index.
     */
    Operations.prototype._getStorageFunctionAsArray = function(operation, index) {
        // key must be consistent across operations so set(), get(), and remove()
        // share the same set of keys.
        var key = "run" + this._runIndex + "_idx" + index;

        switch(operation) {
        case "set":
            return [operation, key, this._payload[index]];
        case "get":
        case "remove":
            return [operation, key];
        case "getAll":
        case "clear":
            return [operation];
        default:
            throw new Error("Unsupported operation: " + operation);
        }
    };


    /**
     * Gets a Metric Service transaction/mark key.
     * @param {String} operation the name of the operation.
     * @param {String|Number} index the operation's index.
     */
    Operations.prototype._getMsKey = function(operation, index) {
        return "run" + this._runIndex + "_op" + operation + index;
    };


    /**
     * Logs perf measurements for an operation.
     * @param {String} operation - name of the operation.
     * @param {Object} transaction - the Metrics Service transaction data.
     */
    Operations.prototype._log = function(operation, transaction) {
        // sort by mark duration to make calculating ept95 simple
        var marks = transaction.marks[Operations.MS_NAMESPACE].sort(function(a, b) {
            if (a.duration < b.duration) {
                return -1;
            }
            if (a.duration === b.duration) {
                return 0;
            }
            if (a.duration > b.duration) {
                return 1;
            }
        });

        var totalTime = 0;
        for (var i = 0; i < marks.length; i++) {
            totalTime += marks[i].duration;
        }

        var maxDuration = marks[marks.length-1].duration;

        var ept95Idx = Math.min(marks.length-1, Math.floor(marks.length * 0.95));
        var ept95 = marks[ept95Idx].duration;

        // the values captures here must be a superset of those used in _msPostProcessor,
        // which are the numbers exported for analysis.
        this._logs.push({
            adapterName : this._storage.getName(),
            adapterSize : this._storage.getMaxSize(),
            payloadSize : this._payloadSize,
            operation : operation,
            count : marks.length,
            // timings
            average : (totalTime / marks.length).toFixed(2),
            ept95 : ept95.toFixed(2),
            max : maxDuration.toFixed(2),
            total : transaction.duration.toFixed(2),
            // store size after operation
            storeSize : transaction.context.storeSize.toFixed(4)
        });

        this._analysisCallback && this._analysisCallback(this._logs);
    };



    /**
     * Metrics Service post processor. Used to report custom metrics.
     */
    Operations.prototype._msPostProcessor = function(results) {
        var transformed = {};
        this._logs.forEach(function(item) {
            // eg indexeddb-64000-10-get
            var key = item.adapterName + "-" + item.payloadSize + "-" + item.count + "-" + item.operation;
            transformed[key] = {
                count: item.count,
                average: item.average,
                ept95: item.ept95,
                max: item.max,
                total: item.total,
                storeSize: item.storeSize
            };
        });
        results.customMetrics = transformed;
    };

    return new Operations();
}
