({
    // IndexedDb not supported in IE < 10
    // Disable IndexedDB for Safari because it doesn't work reliably in iframe.
    browsers:["-IE8", "-IE9", "-SAFARI", "-IPAD", "-IPHONE"],

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
                var that = this;
                var storage = $A.storageService.getStorage("actions");
                return cmp.helper.storage.storageContents.waitForStorageByPredicate(
                        storage,
                        function labelFoundPredicate(items) {
                            var labels = that.getLabelGvp(items);
                            if (!labels) {
                                return undefined;
                            }

                            var actual = labels["Related_Lists"] && labels["Related_Lists"]["task_mode_today"];
                            if (actual === "Today") {
                                return true;
                            }

                            return undefined;
                        }
                );
            }
        ]
    },

    testGvpsAreLoadedFromStorageWhenOffline: {
        // TODO: W-3306953
        labels : ["flapper"],
        test: [
            function setLabelToStorage(cmp) {
                var storage = $A.storageService.getStorage("actions");
                var item = {
                    "type": "$Label",
                    "values": {
                        "section": {
                            "name": "expected"
                        }
                    }
                };

                return storage.set("globalValueProviders", [item])
            },
            // for debugging only. remove it if found the flapping cause.
            function verifyLabelInStorage(cmp) {
                var that = this;
                var storage = $A.storageService.getStorage("actions");
                return cmp.helper.storage.storageContents.waitForStorageByPredicate(
                        storage,
                        function labelFoundPredicate(items) {
                            var labels = that.getLabelGvp(items);
                            if (!labels) {
                                return undefined;
                            }

                            $A.test.assertDefined(labels["section"]);
                            $A.test.assertEquals("expected", labels["section"]["name"]);
                            return true;
                        }
                );
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
    },

    /**
     * Gets the $Label GVP value. This utility is useful because of the unusual persistence shape
     * of GVPs.
     * @param {Object} items the contents of storage (eg return value from storage.getAll()).
     */
    getLabelGvp: function(items) {
        var gvps = items["globalValueProviders"];
        if (!gvps) {
            return undefined;
        }
        for (var i = 0; i < gvps.length; i++) {
            if (gvps[i]["type"] === "$Label") {
                return gvps[i]["values"];
            }
        }
    }
})
