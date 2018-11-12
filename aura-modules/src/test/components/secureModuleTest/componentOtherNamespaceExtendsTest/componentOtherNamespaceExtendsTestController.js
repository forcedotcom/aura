({
    testComponentLockerizedInOtherNamespaceExtendsComponentLockerized: function(cmp, event) {
        var testModule = cmp.find("componentLockerizedInOtherNamespaceExtendsComponentLockerized");
        var params = event.getParam('arguments');
        testModule[params.testCase]();
    },

    testComponentLockerizedInOtherNamespaceExtendsComponentNonLockerized: function(cmp, event) {
        var testModule = cmp.find("componentLockerizedInOtherNamespaceExtendsComponentNonLockerized");
        var params = event.getParam('arguments');
        testModule[params.testCase]();
    },

    testComponentNonLockerizedInOtherNamespaceExtendsComponentLockerized: function(cmp, event) {
        var testModule = cmp.find("componentNonLockerizedInOtherNamespaceExtendsComponentLockerized");
        var params = event.getParam('arguments');
        testModule[params.testCase]();
    }
})
