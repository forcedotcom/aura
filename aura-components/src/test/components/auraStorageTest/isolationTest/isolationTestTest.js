({
    setUp : function(component) {
        // must match AuraStorage.KEY_DELIMITER
        component.DELIMITER = ":";
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
            $A.test.setTestTimeout(60000);
            cmp._frameLoaded = false;
            cmp._expected = "expected value";
            var frame = document.createElement("iframe");
            frame.src = "/auraStorageTest/isolationTest.cmp?isolationKey=isolationA&storageItemValue=valueA";
            frame.scrolling = "auto";
            frame.id = "myFrame";
            $A.util.on(frame, "load", function () {
                cmp._frameLoaded = true;
            });
            var content = cmp.find("iframeContainer");
            $A.util.insertFirst(frame, content.getElement());

            this.waitForIframeLoad(cmp);
        },
        function addItemToStorageWithIsolation(cmp) {
            var iframeCmp = document.getElementById("myFrame").contentWindow.$A.getRoot();
            iframeCmp.addItemToStorage();
            $A.test.addWaitFor(true, function() {
                return $A.util.getText(iframeCmp.find("status").getElement()) !== "Adding";
            }, function() {
                $A.test.assertEquals("Done Adding", $A.util.getText(iframeCmp.find("status").getElement()));
            });
        },
        function reloadIframe(cmp) {
            cmp._frameLoaded = false;
            document.getElementById("myFrame").contentWindow.location.reload();
            this.waitForIframeLoad(cmp);
        },
        function addItemToStorageWithNewIsolation(cmp) {
            var iframeCmp = document.getElementById("myFrame").contentWindow.$A.getRoot();
            iframeCmp.set("v.isolationKey", "isolationB");
            iframeCmp.set("v.storageItemValue", "valueB");
            iframeCmp.addItemToStorage();
            $A.test.addWaitFor(true, function() {
                return $A.util.getText(iframeCmp.find("status").getElement()) !== "Adding";
            }, function() {
                $A.test.assertEquals("Done Adding", $A.util.getText(iframeCmp.find("status").getElement()));
            });
        },
        function getAllFromStorage(cmp) {
            var iframeCmp = document.getElementById("myFrame").contentWindow.$A.getRoot();
            iframeCmp.getAllFromStorage();
            $A.test.addWaitFor(true, function() {
                return $A.util.getText(iframeCmp.find("status").getElement()) !== "Getting";
            }, function() {
                var items = iframeCmp.get("v.items");
                $A.test.assertEquals(1, items.length, "Unexpected number of items returned from storage.getAll()");
                $A.test.assertEquals("valueB", items[0].value, "Unexpected value returned from storage");
            });
        }]
    },

    waitForIframeLoad: function(cmp) {
        var iframeWindow = document.getElementById("myFrame").contentWindow;
        $A.test.addWaitFor(true, function() {
            return cmp._frameLoaded
                && iframeWindow.$A
                && iframeWindow.$A.getRoot() !== undefined
                && !$A.test.isActionPending()
        });
    }
})
