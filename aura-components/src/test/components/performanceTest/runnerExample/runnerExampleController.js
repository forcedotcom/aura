({
    // --- Performance framework lifecycle
    setup: function (cmp, event, helper) {
        var done = event.getParam('arguments').done;
        console.log('runnerExample:setup', done);
    },
    // --- Performance framework lifecycle
    run: function (cmp, event, helper) {
        var done = event.getParam('arguments').done;
        console.log('runnerExample:run', done);
    },


    // --- Custom Controller methods ---
    press: function (cmp) {
        cmp.set('v.counter', cmp.get('v.counter') + 1);
    },
    finishTestWithEvent: function (cmp, event, helper) {
        cmp.getEvent('finish').fire();
    },
    finishTestPerfRunner: function (cmp, event, helper) {
        $A.PerfRunner.finish();
    }
})