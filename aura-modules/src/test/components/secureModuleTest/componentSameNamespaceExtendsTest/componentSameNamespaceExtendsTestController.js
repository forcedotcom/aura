({
    testComponentLockerizedInSameNamespaceExtendsComponentLockerized: function(cmp, event) {
        var testModule = cmp.find("componentLockerizedInSameNamespaceExtendsComponentLockerized");
        var params = event.getParam('arguments');
        testModule[params.testCase]();
    },

    testComponentLockerizedInSameNamespaceExtendsComponentNonLockerized: function(cmp, event) {
        var testModule = cmp.find("componentLockerizedInSameNamespaceExtendsComponentNonLockerized");
        var params = event.getParam('arguments');
        testModule[params.testCase]();
    },

    testComponentNonLockerizedInSameNamespaceExtendsComponentLockerized: function(cmp, event) {
        var testModule = cmp.find("componentNonLockerizedInSameNamespaceExtendsComponentLockerized");
        var params = event.getParam('arguments');
        testModule[params.testCase]();
    }
})
