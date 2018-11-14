({
    testComponentLockerizedInOtherNamespaceMixinLockerized: function(cmp, event) {
        var testModule = cmp.find("componentLockerizedInOtherNamespaceMixinLockerized");
        var params = event.getParam('arguments');
        testModule[params.testCase]();
    },

    testComponentLockerizedInOtherNamespaceMixinNonLockerized: function(cmp, event) {
        var testModule = cmp.find("componentLockerizedInOtherNamespaceMixinNonLockerized");
        var params = event.getParam('arguments');
        testModule[params.testCase]();
    },

    testComponentNonLockerizedInOtherNamespaceMixinLockerized: function(cmp, event) {
        var testModule = cmp.find("componentNonLockerizedInOtherNamespaceMixinLockerized");
        var params = event.getParam('arguments');
        testModule[params.testCase]();
    }
})
