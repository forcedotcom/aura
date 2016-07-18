({
    init: function (cmp) {
        $A.PerfRunner.run(function (done) {
            // Tells the perfRunner this operation is async 
            // (we will need to execute the returned finishRun callback when we are done)
            var finishRun = done.async();

            $A.createComponent("ui:image", {}, function (newCmp, status, errorMsg) {

                console.log('Downloaded def: ', newCmp.getDef());

                // We now tell the PerfFramework to finish
                finishRun(function (results) {
                    // This callback is for postprocessing
                    // You can add your own custom metrics on results
                	cmp.set("v.loaded", true);
                    results.customMetrics.test = true;
                });
            
            });
        });
    }
})