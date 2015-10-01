({
    init: function (cmp) {
        $A.PerfRunner.run(function (done) {
            // Tells the perfRunner this operation is async 
            // (we will need to execute the returned finishRun callback when we are done)
            var finishRun = done.async();

            // Example of async operation:
            var action = $A.get("c.aura://ComponentController.getComponent");
            action.setParams({ name: 'ui:image' });

            action.setCallback(this, function () {
                console.log('Downloaded def: ', action.getReturnValue());

                // We now tell the PerfFramework to finish
                finishRun(function (results) {
                    // This callback is for postprocessing
                    // You can add your own custom metrics on results
                    results.customMetrics.test = true;
                });
            });

            $A.enqueueAction(action);
        });
    }
})