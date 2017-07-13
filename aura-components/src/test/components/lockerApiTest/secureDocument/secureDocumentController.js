({
    init: function(cmp, event, helper) {
        helper.utils.tester.initTests(helper.testName, helper.testPlan);

        var key = $A.lockerService.getKeyForNamespace("apiviewer");
        var secureWindow = $A.lockerService.getEnv(key);

        helper.utils.tester.testSystem(document);
        helper.utils.tester.testSecure(secureWindow.document, document);

        helper.utils.tester.showResults(cmp);
    }
})