({
    testDefaultImportLockerizedFromSameNamespaceExportLockerized: function(cmp, event) {
        var testModule = cmp.find("defaultImportLockerizedFromSameNamespaceExportLockerized");
        var params = event.getParam('arguments');
        testModule[params.testCase]();
    },

    testDefaultImportLockerizedFromSameNamespaceExportNonLockerized: function(cmp, event) {
        var testModule = cmp.find("defaultImportLockerizedFromSameNamespaceExportNonLockerized");
        var params = event.getParam('arguments');
        testModule[params.testCase]();
    },

    testDefaultImportNonLockerizedFromSameNamespaceExportLockerized: function(cmp, event) {
        var testModule = cmp.find("defaultImportNonLockerizedFromSameNamespaceExportLockerized");
        var params = event.getParam('arguments');
        testModule[params.testCase]();
    },

    testDefaultImportLockerizedFromDifferentNamespaceExportLockerized: function(cmp, event) {
        var testModule = cmp.find("defaultImportLockerizedFromDifferentNamespaceExportLockerized");
        var params = event.getParam('arguments');
        testModule[params.testCase]();
    },

    testDefaultImportLockerizedFromDifferentNamespaceExportNonLockerized: function(cmp, event) {
        var testModule = cmp.find("defaultImportLockerizedFromDifferentNamespaceExportNonLockerized");
        var params = event.getParam('arguments');
        testModule[params.testCase]();
    },

    testDefaultImportNonLockerizedFromDifferentNamespaceExportLockerized: function(cmp, event) {
        var testModule = cmp.find("defaultImportNonLockerizedFromDifferentNamespaceExportLockerized");
        var params = event.getParam('arguments');
        testModule[params.testCase]();
    }
})
