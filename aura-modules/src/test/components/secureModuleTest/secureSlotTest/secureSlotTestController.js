({
    secureSlotTester: function(cmp, event) {
        var testModule = cmp.find("secureSlotComponentParent");
        var params = event.getParam('arguments');
        testModule[params.testCase]();
    }
})
