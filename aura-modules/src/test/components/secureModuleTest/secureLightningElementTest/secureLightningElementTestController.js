({
    secureLightningElementTester: function(cmp, event) {
        var testModule = cmp.find("secureLightningElementComponentParent");
        var params = event.getParam("arguments");
        testModule[params.testCase]();
    }
})
