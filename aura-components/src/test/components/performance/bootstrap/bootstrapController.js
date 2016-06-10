({
    init: function (cmp, event, helper) {
        setTimeout(function (){
            var bootstrap = $A.metricsService.getBootstrapMetrics();
            console.log(JSON.stringify({
                bootstrapEPT   : Math.round(bootstrap.bootstrapEPT * 100) / 100
            }, null, '\t'));
        },0);
    }
})