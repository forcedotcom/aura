({
    setUp : function(component) {
        // must match AuraStorage.KEY_DELIMITER
        component.DELIMITER = ":";

        var completed = false;
        $A.storageService.getStorage("cmpStorage").clear()
            .then(
                function() { completed = true; },
                function(err) { $A.test.fail("Test setUp() failed to clear storage: " + err);
            });

        $A.test.addWaitFor(true, function() { return completed; });
    },

    testStorageKeyVersionString: {
        attributes : {
            "version" : "version"
        },
        test: function(cmp) {
            var completed = false;

            var key = "key";
            var expected = "value";
            var version = cmp.get("v.version");

            var storage = $A.storageService.getStorage("cmpStorage");
            storage.set(key, expected)
                .then(function() {
                    return storage.adapter.getItems([version + cmp.DELIMITER + key]);
                })
                .then(function(items) {
                    $A.test.assertEquals(1, Object.keys(items).length, "Adapter should have only one item");
                    $A.test.assertEquals(expected, items[version + cmp.DELIMITER + key]["value"], "Adapter.getItems() should return prefixed key");
                })
                .then(function() {
                    return storage.getAll();
                })
                .then(function(items) {
                    $A.test.assertEquals(1, Object.keys(items).length, "Storage should have only one item");
                    $A.test.assertEquals(expected, items[key], "AuraStorage.getAll() should return unprefixed key");
                    completed = true;
                })
                ["catch"](function(error) { $A.test.fail(error.toString()); });

            $A.test.addWaitFor(true, function() { return completed; });
        }
    },

    testSettingVersion: {
        attributes: {
            "version": "1"
        },
        test: function (cmp) {
            var storage = $A.storageService.getStorage("cmpStorage");
            $A.test.assertEquals("1", storage.getVersion(), "Declaratively set storage version not respected");
        }
    },

    testSettingGlobalVersion: {
        attributes: {
            "version": "setBeforeGlobal"
        },
        test: [
            function globalStorageVersion(cmp) {
                $A.storageService.setVersion("100");
                $A.test.assertEquals("100", $A.storageService.getVersion(), "Storage Service version not set.");
            },
            function existingStorageVersion(cmp) {
                var storage = $A.storageService.getStorage("cmpStorage");
                $A.test.assertEquals("setBeforeGlobal", storage.getVersion(), "Previously created store should not have version");
            },
            function newStorage(cmp) {
                var storage = $A.storageService.initStorage({name: "testSettingGlobalVersion"});
                $A.test.assertEquals("100", storage.getVersion(), "Newly created storage should inherit default version.");
            }
        ]
    },

    testEmptyVersionGetsGlobalVersion: {
        test: [
           function verifyVersionDefault(cmp) {
               var expected = "globalVersion"; // defined in versionTestTemplate.cmp
               var storage = $A.storageService.getStorage("templateStorageDefaultVersion");  // defined in versionTemplate.cmp
               $A.test.assertEquals(expected, storage.getVersion(), "<auraStorage:init/> component with default version did not inherit global value");
           },
           function verifyVersionEmptyString(cmp) {
               var expected = "globalVersion"; // defined in versionTestTemplate.cmp
               var storage = $A.storageService.getStorage("templateStorageEmptyVersion");  // defined in versionTemplate.cmp
               $A.test.assertEquals(expected, storage.getVersion(), "<auraStorage:init/> component with empty version did not inherit global value");
           }
       ]
    },

    // TODO - need a test that verifies version changes across page reloads
    _testGetAllOnlyReturnsCurrentVersionWhenSwitchingBetweenVersions: {
        test: [
            function populateStorageVersionA(cmp) {
                var completed = false;
                var storage = $A.storageService.initStorage({name: "getAllIsolation", version:"A"});
                storage.set("keyA","valueA")
                    .then(function() {
                        completed = true;
                    })
                    ["catch"](function(error) { $A.test.fail(error.toString()); });

                $A.test.addWaitFor(true, function(){ return completed; });
            },
            function reloadPageWithStorageVersionB(cmp) {
            },
            function verifyGetAllReturnsNothing(cmp) {
                var storage = $A.storageService.getStorage("getAllIsolation");
                storage.getAll()
                    .then(function(items) {
                        $A.test.assertEquals(0, Object.keys(items).length, "storage.getAll() should've returned zero items");
                    })
                    ["catch"](function(error) { $A.test.fail(error.toString()); });
            }
        ]
    }
})
