({
    testImportLockerizedFromSameNamespaceExportLockerized: function(cmp, event) {
        var testModule = cmp.find("importLockerizedFromSameNamespaceExportLockerized");
        var params = event.getParam('arguments');
        testModule[params.testCase]();
    },

    testImportLockerizedFromSameNamespaceExportNonLockerized: function(cmp, event) {
        var testModule = cmp.find("importLockerizedFromSameNamespaceExportNonLockerized");
        var params = event.getParam('arguments');
        testModule[params.testCase]();
    },

    testImportNonLockerizedFromSameNamespaceExportLockerized: function(cmp, event) {
        var testModule = cmp.find("importNonLockerizedFromSameNamespaceExportLockerized");
        var params = event.getParam('arguments');
        testModule[params.testCase]();
    },

    testImportLockerizedFromDifferentNamespaceExportLockerized: function(cmp, event) {
        var testModule = cmp.find("importLockerizedFromDifferentNamespaceExportLockerized");
        var params = event.getParam('arguments');
        testModule[params.testCase]();
    },

    testImportLockerizedFromDifferentNamespaceExportNonLockerized: function(cmp, event) {
        var testModule = cmp.find("importLockerizedFromDifferentNamespaceExportNonLockerized");
        var params = event.getParam('arguments');
        testModule[params.testCase]();
    },

    testImportNonLockerizedFromDifferentNamespaceExportLockerized: function(cmp, event) {
        var testModule = cmp.find("importNonLockerizedFromDifferentNamespaceExportLockerized");
        var params = event.getParam('arguments');
        testModule[params.testCase]();
    }
})
