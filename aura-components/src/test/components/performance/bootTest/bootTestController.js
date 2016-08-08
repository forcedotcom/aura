({
    init: function (cmp, event, helper) {
        setTimeout(function (){
            var bootstrap = $A.metricsService.getBootstrapMetrics();
            console.log(JSON.stringify({
                bootstrapEPT   : Math.round(bootstrap.bootstrapEPT * 100) / 100
            }, null, '\t'));
        },0);
    },

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