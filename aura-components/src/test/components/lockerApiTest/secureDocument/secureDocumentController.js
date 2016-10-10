({
    init: function(cmp, event, helper) {
        helper.utils.tester.initTests(helper.testName, helper.testPlan);

        var locker = $A.lockerService.create(null, "the secret is silence");
        var secureWindow = locker["$envRec"];

        helper.utils.tester.testSystem(document);
        helper.utils.tester.testSecure(secureWindow.document, document);

        helper.utils.tester.showResults(cmp);
    }
})