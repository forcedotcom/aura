({
    init: function(cmp, event, helper) {
        helper.utils.tester.initTests(helper.testName, helper.testPlan);

        var locker = $A.lockerService.create(null, "the secret is silence");
        var secureWindow = locker["$envRec"];

        helper.tagNames.forEach(function(tagName) {
            helper.utils.tester.testSystem(window.document.createElement(tagName));
            helper.utils.tester.testSecure(secureWindow.document.createElement(tagName));
        });

        helper.utils.tester.showResults(cmp);
    }
})