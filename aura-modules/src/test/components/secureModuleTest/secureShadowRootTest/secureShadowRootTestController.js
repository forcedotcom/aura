({
    secureShadowRootTester: function(cmp, event) {
        var testModule = cmp.find("secureShadowRootComponentParent");
        var params = event.getParam('arguments');
        testModule[params.testCase]();
    }
})
