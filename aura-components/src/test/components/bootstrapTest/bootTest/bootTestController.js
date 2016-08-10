({
    clearCachesAndLog: function(cmp, event, helper) {
        helper.setStatus(cmp, "Clearing Caches and Logs");
        helper.clearActionAndDefStorage(cmp)
            .then(function() {
                helper.setStatus(cmp, "Cleared Caches and Logs");
            })
            .catch(function(e) {
                helper.setStatus(cmp, "Error: " + e);
            }
        );
    }
})