({
    // IndexedDb not supported in IE < 10
    // Disable IndexedDB for Safari because it doesn't work reliably in iframe.
    browsers:["-IE7", "-IE8", "-IE9", "-SAFARI", "-IPAD", "-IPHONE"],

    // Test modifies/deletes the persistent database
    labels : [ "threadHostile" ],

    testGvpsPersistedToStorage: {
        // tbliss: this should be fixed but leave flapper for a bit to verify it's solid
        labels : ["flapper"],
        test: [
            function getLabelFromServer(cmp) {
                // Requesting a label the client doesn't know about will force a server trip and save the label to storage
                $A.get("$Label" + ".Related_Lists" + ".task_mode_today");

                $A.test.addWaitFor(false, $A.test.isActionPending,
                    function() {
                        // GVP should be merged in-memory when action response is processed
                        $A.test.assertEquals("Today", $A.get("$Label.Related_Lists.task_mode_today"),
                            "Test setup failure: unexpeted label retrieved from server");
                    });
            },
            function verifyLabelSavedToStorage(cmp) {
                var found = false;
                var storage = $A.storageService.getStorage("actions");

                function getGvpFromStorage() {
                    if ($A.test.isComplete()) {
                        return;
                    }
                    storage.get("globalValueProviders", true)
                    .then(function(gvps) {
                        if (gvps) {
                            for(var i = 0; i < gvps.length; i++) {
                                if (gvps[i]["type"] === "$Label") {
                                    var values = gvps[i]["values"];
                                    var actual = values["Related_Lists"] && values["Related_Lists"]["task_mode_today"];
                                    if (actual === "Today") {
                                        found = true;
                                        return;
                                    }
                                }
                            }
                        }

                        getGvpFromStorage();
                    })
                    .catch(function(e) {
                        $A.test.fail(e.toString());
                    })

                }

                getGvpFromStorage();

                $A.test.addWaitForWithFailureMessage(true, function() { return found; },
                    "Failed to find label in storage.");
            }
        ]
    },

    testGvpsAreLoadedFromStorageWhenOffline: {
        // TODO: W-3306953
        labels : ["flapper"],
        test: [
            function setLabelToStorage(cmp) {
                var completed = false;
                var storage = $A.storageService.getStorage("actions");
                var item = {
                    "type": "$Label",
                    "values": {
                        "section": {
                            "name": "expected"
                        }
                    }
                };

                storage.set("globalValueProviders", [item]).then(
                    function() { completed = true; },
                    function(e) {
                        $A.test.fail("Failed to save label to storage: " + e.toString());
                    }
                );
                $A.test.addWaitFor(true, function() { return completed; });
            },
            // for debugging only. remove it if found the flapping cause.
            function verifyLabelInStorage(cmp) {
                var completed = false;
                var gvpKey = "globalValueProviders";
                var storage = $A.storageService.getStorage("actions");

                $A.test.assertTrue(storage.isPersistent(), "The test expects a persistent storage.");

                storage.get("globalValueProviders").then(
                    function(gvps) {
                        var labels;
                        for(var i = 0, len = gvps.length; i < len ;i++) {
                            if("$Label" === gvps[i]["type"]) {
                                labels = gvps[i]["values"];
                                break;
                            }
                        }

                        $A.test.assertDefined(labels["section"]);
                        $A.test.assertEquals("expected", labels["section"]["name"]);
                        completed = true;
                    },
                    function(e) {
                        $A.test.fail("Failed to find stored label from storage: " + e.toString());
                    }
                );
                $A.test.addWaitFor(true, function() { return completed; });
            },
            function initGvpsWhileOffline(cmp) {
                var completed = false;

                $A.test.setServerReachable(false);
                $A.test.addCleanup(function(){ $A.test.setServerReachable(true); });

                $A.getContext().initGlobalValueProviders({}, function() {
                    $A.test.assertEquals("expected", $A.get("$Label.section.name"),
                            "Failed to load label from Storage.");
                    completed = true;
                });

                $A.test.addWaitFor(true, function(){ return completed; });
            }
        ]
    }
})
