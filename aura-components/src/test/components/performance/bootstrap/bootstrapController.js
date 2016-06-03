({
    init: function (cmp, event, helper) {
        setTimeout(function (){
            var bootstrap = $A.metricsService.getBootstrapMetrics();
            console.log(JSON.stringify({
                frameworkInit  : Math.round(bootstrap.frameworkInit  * 100) / 100,
                frameworkReady : Math.round(bootstrap.frameworkReady  * 100) / 100,
                metadataReady  : Math.round(bootstrap.metadataReady * 100) / 100,
                bootstrapEPT   : Math.round(bootstrap.bootstrapEPT * 100) / 100
            }, null, '\t'));
        },0);
    }
})