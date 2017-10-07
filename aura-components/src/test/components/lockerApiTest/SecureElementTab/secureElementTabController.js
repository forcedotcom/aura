({
    init: function(cmp, event, helper) {
        var key = $A.lockerService.getKeyForNamespace("apiviewer");
        var secureWindow = $A.lockerService.getEnv(key);
        var secureDocument = secureWindow.document;

        var report = helper.utils.tester.testObject(document.createTextNode("TEST"), secureDocument.createTextNode("TEST"));

        function test(tagName) {
            helper.utils.tester.testObject(document.createElement(tagName), secureDocument.createElement(tagName), report);
        }

        helper.tagNames.forEach(test);
        helper.svgTagNames.forEach(test);
        helper.utils.tester.sortReport(report);
        cmp.set("v.report", report);

        window.__secureElementTabTesterReport = report;
    }
})
