({
    domEventTester: function(cmp, event) {
        var testModule = cmp.find("domEventTester");
        var params = event.getParam('arguments');
        testModule[params.testCase]();
    }
})
