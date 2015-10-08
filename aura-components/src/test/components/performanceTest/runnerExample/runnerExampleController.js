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

        // Action to load a component
        var action = $A.get("c.aura://ComponentController.getComponent");

        // Tells the perfRunner this operation is async 
        // (we will need to execute the returned finishRun callback when we are done)
        var finishRun = done.async(); 

        action.setParams({ name: 'ui:image' });

        action.setCallback(this, function () {
            console.log('Downloaded def: ', action.getReturnValue());
            cmp.set('v.loaded', true);
            finishRun();
        });

        $A.enqueueAction(action);
    },
    postProcessing: function (cmp, event, helper) {
        var results = event.getParam('arguments').results;
        console.log('PostProcessing Results: ', results);
    }
})