({
    testPreIsolationKey: {
        test: function(cmp) {
            var completed = false;

            var key = "key";
            var expected = "value";

            var storage = $A.storageService.initStorage("preIsolation", false, false, 1024);
            storage.put(key, expected).then(function() {
                return storage.adapter.getItem(key);
            })
            .then(function(item) {
                $A.test.assertEquals(expected, item["value"], "preIsolation storage key should not include an isolation key");
                completed = true;
            })
            ["catch"](function(error) { $A.test.fail(error); });
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
                return storage.adapter.getItem(isolationKey + key);
            })
            .then(function(item) {
                $A.test.assertEquals(expected, item["value"], "key with isolation key did not return value");

                // try without the isolation key
                return storage.adapter.getItem(key);
            }).then(function(item) {
                $A.test.assertUndefined(item, "key without isolation key returned value");
                completed = true;
            })
            ["catch"](function(error) { $A.test.fail(error); });
            $A.test.addWaitFor(true, function() { return completed; });
        }
    }
})
