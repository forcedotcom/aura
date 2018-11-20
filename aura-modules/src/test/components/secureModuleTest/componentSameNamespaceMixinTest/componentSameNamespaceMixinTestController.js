({
    testComponentLockerizedInSameNamespaceMixinLockerized: function(cmp, event) {
        var testModule = cmp.find("componentLockerizedInSameNamespaceMixinLockerized");
        var params = event.getParam('arguments');
        testModule[params.testCase]();
    },

    testComponentLockerizedInSameNamespaceMixinNonLockerized: function(cmp, event) {
        var testModule = cmp.find("componentLockerizedInSameNamespaceMixinNonLockerized");
        var params = event.getParam('arguments');
        testModule[params.testCase]();
    },

    testComponentNonLockerizedInSameNamespaceMixinLockerized: function(cmp, event) {
        var testModule = cmp.find("componentNonLockerizedInSameNamespaceMixinLockerized");
        var params = event.getParam('arguments');
        testModule[params.testCase]();
    }
})
