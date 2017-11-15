({
    componentLifecycleTester: function(cmp, event) {
        var testUtils = cmp.get("v.testUtils");
        var params = event.getParam('arguments');
        // Making sure that the life cycle hook was indeed invoked and we don't get any false positives
        testUtils.addWaitForWithFailureMessage(true, function(){
            return window[params.testCaseConfirmationFlag];
            },
            "Life cycle hook was not invoked:" + params.testCase);
    }
})
