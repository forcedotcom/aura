({

    /**
     * Creates storage in Aura Storage Service and optionally prepopulates it with data.
     * @return {AuraStorage} the created storage.
     */
    createStorage : function(cmp) {
        var adapterName = cmp.get('v.adapterName'),
            adapterSize = cmp.get('v.adapterSize'),
            storageName = "storagePerfTest";

        var adapters = {
                "memory" : {
                    persistent : false,
                    secure : true
                },
                "indexeddb" : {
                    persistent : true,
                    secure : false
                },
                "crypto" : {
                    persistent : true,
                    secure : true
                }
        };
        
        var adapter = adapters[adapterName];
        if (!adapter) {
            $A.error("Couldn't find adapter " + adapterName);
            return;
        }
        
        // delete any existing instance
        var storage = $A.storageService.getStorage(storageName);
        if (storage) {
            $A.storageService.deleteStorage(storageName);
        }

        storage = $A.storageService.initStorage(
            storageName,            /* name */
            adapter.persistent,     /* persistent */
            adapter.secure,         /* secure */
            adapterSize * 1024,     /* maxSize (bytes) */
            10000,                  /* defaultExpiration  (sec) */
            10000,                  /* defaultAutoRefreshInterval (sec) */
            true,                  /* debugLoggingEnabled */
            true,                   /* clearStorageOnInit */
            1);                     /* version */

        if (storage.getName() !== adapterName) {
            $A.error("Aura Storage Service did not select desired adapter. Wanted " + adapterName + ", got " + storage.getName());
            return;
        }
        return storage;
    },

    /**
     * Runs the performance tests.
     */
    runTests : function(cmp) {
        //If you want to display metrics as a table, you'll need this so they can be collected
        //and calculated after the tests run
        if (cmp.get("v.displayLogs")) {
            $A.metricsService.setClearCompletedTransactions(false);
        }

        var helper = this;
        var promise = Promise.resolve();

        var initialStoreSize = cmp.get("v.adapterInitialSize");
        if (initialStoreSize > 0) {
            var payload = this.getPayload(cmp);
            var payloadLength = payload.length ? payload.length : JSON.stringify(payload).length;
            var entries = initialStoreSize / payloadLength;
            var promises = [];

            for (var i = 0; i < entries; i++) {
                promises.push(cmp._storage.put("initial" + i, payload));
            }

            promise = promise.then(function() {
                return Promise.all(promises);
            });
        }

        var ops = this.getOperations(cmp);
        var iterations = cmp.get("v.iterations");
        var opsIterations = cmp.get("v.opsIterations");
        var runOperationFn = function(i) {
            promise = promise.then(function() {
                return helper.runListOfOperations(cmp, '_iter' + i, ops, opsIterations);
            });
        };
        for (var i = 0; i < iterations; i++) {
            // wrapped in anon function to keep i in closure
            runOperationFn(i);
        }

        // indicate finishRun once all operations are finished
        promise = promise.then(function() {
            cmp._finishRun(helper.postProcessing.bind(helper, cmp));
        });

        // error handler for the entire chain of promises. the entire chain of promises
        // is short-circuited when a promise is rejected.
        promise = promise.catch(function(e){
            cmp._finishRun();
        });
    },

    postProcessing: function (cmp,results) {
        var dataMap = {};
        var dataArr = cmp.get("v.perfList");
        dataArr.forEach(function (item) {
        dataMap[item.adapterName + "-" + item.payload + "-" + item.count + "-" + item.operation] = {count: item.count,
               average: item.average,
               ept95: item.ept95,
               max: item.max,
               //sumOfMarks: item.sumOfMarks,
               total: item.total,
               storeSize: item.storeSize};
        });
        results.customMetrics = dataMap;
    },

    /**
     * Runs the list of operations.
     * @param {String} prefix key prefix for the operations
     * @param {String[]} operations the list of operations to run
     * @param {Number} opsIterations number of times to run each operation
     * @return {Promise} a promise that resolves when all operations have run
     */
    runListOfOperations : function(cmp, prefix, operations, opsIterations) {
        var that = this;
        var promise = Promise.resolve();
        var doAnalysis = cmp.get("v.displayLogs");

        // local function to closure variables
        var operation = function(i, op, doAnalysis) {
            promise = promise.then(function() {
                opsIterations = cmp.get("v.opsIterations");
                if (op === "clear") {
                    opsIterations = 1; // only run once for clear operation
                } else if(op  === "getAll") {
                    opsIterations = Math.min(5, opsIterations); // run at most 5 times
                } 
                return that.runOperation(cmp, prefix, opsIterations, op);
            }).then(function() {
                if (doAnalysis) {
                    that.analyzeOperation(cmp, op, opsIterations, prefix);
                }
            });
        };

        // loop over operations
        for (var i = 0; i < operations.length; i++) {
            var op = operations[i];
            // wrapped in anon function to keep i, op in closure
            operation(i, op, doAnalysis);
        }
        return promise;
    },

    /**
     * @return {Promise} a promise that resolves when all iterations of the requested operation are complete.
     */
    runOperation : function(cmp, prefix, opsIterations, op) {
        var that = this;
        var transactionKey = prefix + op;
        var payload = this.getPayload(cmp);

        var promise = new Promise(function(resolve) {
            $A.metricsService.transactionStart("offlinePerfCmp", transactionKey);
            resolve();
        });
        var transactionFn = function(key, payload) {
            //return Promise.resolve().then(function() {
        	promise = promise.then(function() {
                //marking start and doing the operation you care about must be done in one function
                $A.metricsService.markStart("offlinePerfCmp", key);
                console.log("1" + key);
                //return the value of the op, or else we wouldn't wait for it to end
                return that.doOperation(op, cmp._storage, key, payload);
            }).then(function() {
            	console.log("2" + key);
                //marking end must be done in the function after the op, because I need to wait for that op to return
                $A.metricsService.markEnd("offlinePerfCmp", key);
            });
        };

        var key;
        //var promises = [];
        for (var i = 0; i < opsIterations; i++) {
            key = prefix + "_op" + i;
            //wrapped in anon function to keep key, payload in closure
            //promises.push(transactionFn(key, payload));
            transactionFn(key, payload);
        }
        /*promise = promise.then(function() {
            return Promise.all(promises);
        });*/

        //cgrabill: getting the storage size is going to add a little time to the transaction,
        //          but it shouldn't effect the sum of mark duration
        promise = promise.then(function() {
            return cmp._storage.getSize();
        }).then(function(size) {
        	$A.metricsService.onTransactionEnd(function(transaction){
                window.transaction = transaction;
            });
            $A.metricsService.transactionEnd("offlinePerfCmp",
                    transactionKey, {
                        context : {
                            storeSize : size
                        }
                    });
        });
        return promise;
    },

    /**
     * Gets the operation names to run.
     * @return {Array} list of operation names.
     */
    getOperations : function(cmp) {
        var ops = [];
        if (cmp.get("v.doPut")) {
            ops.push("put");
        }
        if (cmp.get("v.doGet")) {
            ops.push("get");
        }
        if (cmp.get("v.doGetAll")) {
            ops.push("getAll");
        }
        if (cmp.get("v.doRemove")) {
            ops.push("remove");
        }
        if (cmp.get("v.doClear")) {
            ops.push("clear");
        }

        return ops;
    },

    /**
     * Analyzes and logs performance of an operation.
     * @param {String} operation - name of the operation
     * @param {Number} opsIterations - number of iterations of the operation ran
     * @param {String} prefix - the opsIteration key used in the metrics service transaction name
     */
    analyzeOperation : function(cmp, operation, opsIterations, prefix) {
    	//Sort by mark duration to make calculating ept95 easier
        var marks = window.transaction.marks.offlinePerfCmp.sort(function(a, b) {
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

        var markDuration = 0;
        var totalTime = 0;
        var maxDuration = 0;
        var eptTotalTime = 0;
        var eptIterations = Math.floor(marks.length * 0.95); //should be at least 1
        var storeSize = window.transaction.context.storeSize;

        for (var i = 0; i < marks.length; i++) {
            markDuration = marks[i].duration;
            totalTime += markDuration;
            if (markDuration > maxDuration) {
                maxDuration = markDuration;
            }
            if (i < eptIterations) { //marks are sorted by duration, so only count the first 95%
                eptTotalTime += markDuration;
            }
        }

        var avg = totalTime / opsIterations;
        this.log(cmp,
                operation,
                opsIterations,
                avg.toFixed(2),
                (eptTotalTime / eptIterations).toFixed(2),
                maxDuration.toFixed(2),
                totalTime.toFixed(2),
                window.transaction.duration.toFixed(2),
                storeSize.toFixed(4));
    },

    /**
     * Logs a perf measurement.
     * @param {Component} cmp - this component
     * @param {String} operation - name of the operation
     * @param {Number} opsIterations - number of iterations of the operation ran
     * @param {Number} avg - avg time (ms) of the operation
     * @param {Number} ept95 - 95th percentile time (ms) of the operation
     * @param {Number} max - max time (ms) of the operation
     * @param {Number} sumOfMarks - the total duration (ms) of all marks in the transaction
     * @param {Number} total - the duration (ms) of the whole transaction
     * @param {Number} storeSize - the size (kB) of SmartStore at the end of the transaction
     */
    log : function(cmp, operation, opsIterations, avg, ept95, max, sumOfMarks, total, storeSize) {
        //let's add a row to the data list
        var dataArr = cmp.get("v.perfList");
        if (!dataArr) {
            dataArr = [];
        }

        dataArr.push({
            adapterName : cmp.get("v.adapterName"),
            payload : cmp.get("v.payload"),
            adapterSize : cmp.get("v.adapterSize"),
            adapterInitialSize : cmp.get("v.adapterInitialSize"),
            operation : operation,
            count : opsIterations,
            average : avg,
            ept95 : ept95,
            max : max,
            sumOfMarks : sumOfMarks,
            total : total,
            storeSize : storeSize
        });
        cmp.set("v.perfList", dataArr);

    },

    /**
     * Do the requested operation.
     * @return {Promise} a promise that resolves after the requested operation is performed
     */
    doOperation : function(op, storage, key, payload) {
        switch (op) {
        case "put":
            return storage.put(key, payload);
        case "get":
            return storage.get(key);
        case "remove":
            return storage.remove(key);
        case "getAll":
            return storage.getAll();
        case "clear":
            return storage.clear();
        default:
            $A.error("Unknown operation: " + op);
            break;
         }
    },

    /**
     * @return {String} a storage payload of the requested size.
     */
    getPayload : function(cmp) {
        // generate payloads if req'd
        if (!cmp._oneKbPayload) {
            cmp._oneKbPayload = new Array(1024).join("1");
            cmp._twoKbPayload = new Array(2048).join("2");
            cmp._fourKbPayload = new Array(4096).join("4");
            cmp._sixtyfourKbPayload = new Array(65536).join("6");
            cmp._fivetwelveKbPayload = new Array(524288).join("8");
        }

        var payload;
        switch (cmp.get("v.payload")) {
            case "0kb":
                payload = {};
                break;
            case "1kb":
                payload = cmp._oneKbPayload;
                break;
            case "2kb":
                payload = cmp._twoKbPayload;
                break;
            case "4kb":
                payload = cmp._fourKbPayload;
                break;
            case "64kb":
                payload = cmp._sixtyfourKbPayload;
                break;
            case "512kb":
                payload = cmp._fivetwelveKbPayload;
                break;
            default:
                $A.error("Unknown payload: " + cmp.get("v.payload"));
                break;
        }
        return payload;
    },

});
