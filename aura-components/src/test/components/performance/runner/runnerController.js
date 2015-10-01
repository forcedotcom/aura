({
    init: function (cmp, event, helper) {
        $A.PerfRunner.setContainer(cmp.find('container'));
    },

    locationChange: function (cmp, event, helper) {
        var params  = event.getParams(),
            jsonCfg = helper.urlToJson(params);

        $A.PerfRunner
            .clearRun()
            .setConfig(jsonCfg)
            .loadComponent()
            .onComponentLoaded(cmp.setup);
    },
    setup: function (cmp, event, helper) {
        $A.PerfRunner
            .setup()
            .onSetupComplete(cmp.run);
    },
    run: function (cmp, event, helper) {
        $A.PerfRunner.run();
    },
    finish: function (cmp, event, helper) {
        $A.PerfRunner.finish();
    }
})