({
    init: function (cmp, event, helper) {
        // Create storage of desired type
        cmp._storage = helper.createStorage(cmp);
        
        $A.PerfRunner.run(function (done) {
            // Tells the perfRunner this operation is async
            cmp._finishRun = done.async();
            helper.runTests(cmp);
        });
    },
    
    locationChange: function (cmp, event, helper) {
        $A.PerfRunner.clearRun();
    },
})
