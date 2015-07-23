({
    setUp : function(component) {
        var completed = false;
        $A.storageService.getStorage("actions").clear()
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
            var key = "key",
                expected = "value",
                version = cmp.get("v.version"),
                storage = $A.storageService.getStorage("actions");
            storage.put(key, expected).then(function() {
                return storage.adapter.getItem(version + key);
            })
            .then(function(item) {
                $A.test.assertEquals(expected, item["value"], "Storage with prefixed key should return correct value");
            })
            .then(function() {
                return storage.getAll();
            })
            .then(function(items) {
                $A.test.assertEquals(1, items.length, "Storage should only have one item");
                $A.test.assertEquals(key, items[0]["key"], "Key should not have prefix when returned to user");
                $A.test.assertEquals(expected, items[0]["value"], "Item with prefixed key should correct value");
            })
            ["catch"](function(error) { $A.test.fail(error); });
        }
    },

    testSettingStorageVersion: {
        attributes: {
            "version": "1"
        },
        test: function (cmp) {
            var storage = $A.storageService.getStorage("actions");
            $A.test.assertEquals("1", storage.getVersion(), "Declaratively set storage version not respected");
            storage.setVersion("2");
            $A.test.assertEquals("2", storage.getVersion(), "Imperatively set storage version not respected");
        }
    },

    testSettingGlobalStorageVersion: {
        test: [
            function globalStorageVersion(cmp) {
                $A.storageService.setVersion("100");
                $A.test.assertEquals("100", $A.storageService.getVersion(), "Storage Service version not set.");
            }, function existingStorageVersion(cmp) {
                var storage = $A.storageService.getStorage("actions");
                $A.test.assertEquals("", storage.getVersion(), "Previously created store should not have version");
            }, function newStorage(cmp) {
                var storage = $A.storageService.initStorage();
                $A.test.assertEquals("100", storage.getVersion(), "Newly created storage should inherit default version.");
            }
        ]
    }

})
