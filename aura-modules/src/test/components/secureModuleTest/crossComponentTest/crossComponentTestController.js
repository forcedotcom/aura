({
    crossComponentTester: function(cmp, event) {
        var testModule = cmp.find("crossComponentSource");
        var params = event.getParam('arguments');
        testModule[params.testCase]();
    }
})
