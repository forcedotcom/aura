({
    testEngineIsImportable: {
        browsers : [ 'GOOGLECHROME' ],
        test: [
            function (cmp) {
                var c = cmp.find("import-cmp");
                return new Promise(function(resolve, reject) {
                    c.getElement(function(element) {
                        $A.test.assertDefined(element, "import of 'engine' element should return a defined object");
                        resolve();
                    });
                });
            }
        ]
    },

    testAuraIsImportable: {
        browsers : [ 'GOOGLECHROME' ],
        test: [
            function (cmp) {
                var c = cmp.find("import-cmp");
                return new Promise(function(resolve, reject) {
                    c.getAura(function(aura) {
                        $A.test.assertDefined(aura, "import of 'aura' should return a defined object");
                        resolve();
                    });
                });
            }
        ]
    },

    testAuraStorageIsImportable: {
        browsers : [ 'GOOGLECHROME' ],
        test: [
            function (cmp) {
                var c = cmp.find("import-cmp");
                return new Promise(function(resolve, reject) {
                    c.getAuraStorage(function(auraStorage) {
                        $A.test.assertDefined(auraStorage, "import of 'aura-storage' should return a defined object");
                        resolve();
                    });
                });
            }
        ]
    },

    testImportedLibIsCallableFromConstructor: {
        browsers : [ 'GOOGLECHROME' ],
        test: [
            function (cmp) {
                var c = cmp.find("import-cmp");
                return new Promise(function(resolve, reject) {
                    c.getLibImport(function(libImport) {
                        $A.test.assertEquals("expected", libImport, "Unexpected value returned from function call of imported library call");
                        resolve();
                    });
                });
            }
        ]
    }
})