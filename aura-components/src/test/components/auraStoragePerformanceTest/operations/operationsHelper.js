({
    /**
     * Runs the performance tests.
     * @param {Function} msAsyncFn metric service function to invoke when perf testing is done.
     */
    runTests : function(cmp, msAsyncFn) {
        cmp.set("v.status", "Running");
        var helper = this;
        // create storage
        helper.storage.StorageUtil.createStorage(
                cmp.get("v.adapterName"),
                "auraStoragePerformanceTest:operations",
                cmp.get("v.maxSize"),
                cmp.get("v.initialSize")
            )
            .then(
                $A.getCallback(function(storage) {
                    helper.storage.Operations.setStorage(storage);
                    helper.storage.Operations.setMetricsServiceDone(msAsyncFn);
                    helper.storage.Operations.setPayloadSize(cmp.get("v.payloadSize"));
                    helper.storage.Operations.setRuns(cmp.get("v.runs"));
                    helper.storage.Operations.setOperations(cmp.get("v.operations"), cmp.get("v.operationIterations"));

                    // to display results as a table in the UI:
                    // - only do this on manual runs because it will appear as a memory leak (because the logs have to be accummulated)
                    // - tell Metrics Service to not discard data when a transaction is closed
                    // - register a callback with the log data
                    if (cmp.get("v.displayLogs")) {
                        $A.metricsService.setClearCompletedTransactions(false);
                        helper.storage.Operations.setAnalysisCallback($A.getCallback(function(logs) {
                            cmp.set("v.logs", logs);
                        }));
                    }

                    return helper.storage.Operations.run();
                }
            ))
            .then(
                $A.getCallback(function() {
                    cmp.set("v.status", "Complete");
                }),
                $A.getCallback(function(e) {
                    cmp.set("v.status", "Error: " + e);
                })
            );
    }
});
