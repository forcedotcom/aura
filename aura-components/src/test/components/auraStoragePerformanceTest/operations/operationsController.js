({
    runButton: function (cmp, event, helper) {
        helper.runTests(cmp);
    },

    run: function (cmp, event, helper) {
        var callbackFn = event.getParam("arguments").callback;
        $A.assert($A.util.isFunction(callbackFn), "'callback' must be a Function");
        helper.runTests(cmp, callbackFn);
    },

    locationChange: function (cmp, event, helper) {
        $A.PerfRunner.clearRun();
    },
})
