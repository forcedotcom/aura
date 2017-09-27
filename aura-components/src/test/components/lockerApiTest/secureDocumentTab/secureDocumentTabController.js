({
    init: function(cmp, event, helper) {
        var key = $A.lockerService.getKeyForNamespace("apiviewer");
        var secureWindow = $A.lockerService.getEnv(key);

        var report = helper.utils.tester.testObject(document, secureWindow.document);
        helper.utils.tester.sortReport(report);
        cmp.set("v.report", report);

        window.__secureDocumentTabTesterReport = report;
    }
})
