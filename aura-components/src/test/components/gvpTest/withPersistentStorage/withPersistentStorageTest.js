({
    // IndexedDb not supported in IE < 10
    // Disable IndexedDB for Safari because it doesn't work reliably in iframe.
    browsers:["-IE7", "-IE8", "-IE9", "-SAFARI", "-IPAD", "-IPHONE"],

    // Test modifies/deletes the persistent database
    labels : [ "threadHostile" ],

    setUp : function(cmp) {
        $A.installOverride("StorageService.selectAdapter", function(){ return "indexeddb" }, this);
        var storage = $A.storageService.initStorage("actions", true, false, 32768, 2000, 3000, true, true);
        $A.test.addCleanup(function(){ $A.storageService.deleteStorage("actions")});
    },

    failTest: function(error) {
        var string;
        if (typeof error === "string") {
            string = error;
        } else {
            string = error.message;
        }
        $A.test.fail(string);
    },

    testGvpsPersistedToStorage: {
        test: [
        function getLabelFromServer(cmp) {
            // Requesting a label the client doesn't know about will force a server trip and save the label to storage
            $A.get("$Label" + ".Related_Lists" + ".task_mode_today");

            $A.test.addWaitFor(
                    false,
                    $A.test.isActionPending,
                    function() {
                        $A.test.assertEquals("Today", $A.get("$Label.Related_Lists.task_mode_today"),
                            "Test setup failure: unexpeted label retrieved from server");
                    });
        },
        function verifyLabelSavedToStorage(cmp) {
            var completed = false;
            var actual = undefined;
            var failTest = function(error) { this.failTest(error); }.bind(this);

            // Get label from storage
            var storage = $A.storageService.getStorage("actions");
            storage.get("globalValueProviders")
                .then(function(gvps) {
                    for(var i = 0; i < gvps.value.length; i++) {
                        if (gvps.value[i]["type"] === "$Label") {
                            var values = gvps.value[i]["values"];
                            actual = values["Related_Lists"] ? values["Related_Lists"]["task_mode_today"] : undefined;
                        }
                    }
                    completed = true;
                })
                ["catch"](failTest);

            $A.test.addWaitFor(
                    true,
                    function() { return completed; },
                    function() {
                        $A.test.assertEquals("Today", actual, "Unexpected label retrieved from storage");
                    });
        }]
    },

    testGvpsLoadedFromStorageWhenOffline: {
        test: [
        function getLabelFromServer(cmp) {
            // Requesting a label the client doesn't know about will force a server trip and save the label to storage
            $A.get("$Label.Related_Lists.task_mode_today");
            $A.test.addWaitFor(false, $A.test.isActionPending);
        },
        function modifyLabelEntryInStorage(cmp) {
            var completed = false;
            var failTest = function(error) { this.failTest(error); }.bind(this);

            // Get label from storage
            var storage = $A.storageService.getStorage("actions");
            storage.get("globalValueProviders")
                .then(function(gvps) {
                    for(var i = 0; i < gvps.value.length; i++) {
                        if (gvps.value[i]["type"] === "$Label") {
                            var values = gvps.value[i]["values"];
                            if (values["Related_Lists"] && values["Related_Lists"]["task_mode_today"]) {
                                values["Related_Lists"]["task_mode_today"] = "Updated";
                            } else {
                                $A.test.fail("Label from server not persisted to storage");
                            }
                        }
                    }
                    return storage.put("globalValueProviders", gvps.value);
                })
                .then(function() { completed = true; })
                ["catch"](failTest);

            $A.test.addWaitFor(true, function() { return completed; });
        },
        function reloadGvpsWhileOffline(cmp) {
            var completed = false;

            $A.test.setServerReachable(false);
            $A.test.addCleanup(function(){ $A.test.setServerReachable(true); });

            $A.test.reloadGlobalValueProviders({}, function() {
                $A.test.assertEquals("Updated", $A.get("$Label.Related_Lists.task_mode_today"));
                completed = true;
            });

            $A.test.addWaitFor(true, function(){ return completed; });
        }]
    }
})