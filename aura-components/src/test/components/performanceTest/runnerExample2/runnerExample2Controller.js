({
    // --- Performance framework lifecycle
    setup: function (cmp, event, helper) {
        // Trivial (sync) setup phase
        cmp.set('v.loaded', false);

        // --- If the setup was async: ---
        // var done = event.getParam('arguments').done;
        // var finish = done.async();
        // ...
        // finish();
    },
    // --- Performance framework lifecycle
    run: function (cmp, event, helper) {
        // The "done" attribute gets provided by the perfRunner
        var done = event.getParam('arguments').done;

        // Tells the perfRunner this operation is async 
        // (we will need to execute the returned finishRun callback when we are done)
        var finishRun = done.async(); 

        $A.createComponent("ui:image", {}, function (newCmp, status, errorMsg) {
            cmp.set('v.loaded', true);
            finishRun();            
        });
    }
})