({
    setUp : function(cmp) {
        cmp._iframeLib = cmp.helper.iframeLib.iframeTest;

        // must match AuraStorage.KEY_DELIMITER
        cmp.DELIMITER = ":";
    },

    testPreIsolationKey: {
        test: function(cmp) {
            var completed = false;

            var key = "key";
            var expected = "value";

            var storage = $A.storageService.initStorage("preIsolation", false, false, 1024);
            storage.put(key, expected).then(function() {
                return storage.adapter.getItem(cmp.DELIMITER + key);
            })
            .then(function(item) {
                $A.test.assertEquals(expected, item["value"], "preIsolation storage key should not include an isolation key");
                completed = true;
            })
            ["catch"](function(error) { $A.test.fail(error.toString()); });
            $A.test.addWaitFor(true, function() { return completed; });
        }
    },


    testPostIsolationKey: {
        test: function(cmp) {
            var completed = false;

            var isolationKey = "isolationKey";
            var key = "key";
            var expected = "value";

            $A.storageService.setIsolation(isolationKey);

            var storage = $A.storageService.initStorage("postIsolation", false, false, 1024);
            storage.put(key, expected).then(function() {
                return storage.adapter.getItem(isolationKey + cmp.DELIMITER + key);
            })
            .then(function(item) {
                $A.test.assertEquals(expected, item["value"], "key with isolation key did not return value");

                // try without the isolation key
                return storage.adapter.getItem(cmp.DELIMITER + key);
            }).then(function(item) {
                $A.test.assertUndefined(item, "key without isolation key returned value");
                completed = true;
            })
            ["catch"](function(error) { $A.test.fail(error.toString()); });
            $A.test.addWaitFor(true, function() { return completed; });
        }
    },

    testGetAllOnlyReturnsCurrentIsolation: {
        test: [
        function loadCmpInIframe(cmp) {
            var frameSrc = "/auraStorageTest/isolationTest.cmp?isolationKey=isolationA&storageItemValue=valueA";
            cmp._iframeLib.loadIframe(cmp, frameSrc, "iframeContainer");
        },
        function addItemToStorageWithIsolation(cmp) {
            cmp._iframeLib.getIframeRootCmp().addItemToStorage();
            cmp._iframeLib.waitForStatus("Adding", "Done Adding");
        },
        function reloadIframe(cmp) {
            cmp._iframeLib.reloadIframe(cmp);
        },
        function addItemToStorageWithNewIsolation(cmp) {
            var iframeCmp = cmp._iframeLib.getIframeRootCmp();
            iframeCmp.set("v.isolationKey", "isolationB");
            iframeCmp.set("v.storageItemValue", "valueB");
            iframeCmp.addItemToStorage();
            cmp._iframeLib.waitForStatus("Adding", "Done Adding");
        },
        function getAllFromStorage(cmp) {
            var iframeCmp = cmp._iframeLib.getIframeRootCmp();
            iframeCmp.getAllFromStorage();
            $A.test.addWaitFor(true, function() {
                return $A.util.getText(iframeCmp.find("status").getElement()) !== "Getting";
            }, function() {
                var items = iframeCmp.get("v.items");
                $A.test.assertEquals(1, items.length, "Unexpected number of items returned from storage.getAll()");
                $A.test.assertEquals("valueB", items[0].value, "Unexpected value returned from storage");
            });
        }]
    }
})
