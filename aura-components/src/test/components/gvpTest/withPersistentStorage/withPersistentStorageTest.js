({
    // IndexedDb not supported in IE < 10
    // Disable IndexedDB for Safari because it doesn't work reliably in iframe.
    browsers:["-IE7", "-IE8", "-IE9", "-SAFARI", "-IPAD", "-IPHONE"],

    // Test modifies/deletes the persistent database
    labels : [ "threadHostile" ],

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
        // tbliss: this should be fixed but leave flapper for a bit to verify it's solid
        labels : ["flapper"],
        test: [
        function getLabelFromServer(cmp) {
            // Requesting a label the client doesn't know about will force a server trip and save the label to storage
            $A.get("$Label" + ".Related_Lists" + ".task_mode_today");

            $A.test.addWaitFor(
                    false,
                    $A.test.isActionPending,
                    function() {
                        // GVP should be merged in-memory when action response is processed
                        $A.test.assertEquals("Today", $A.get("$Label.Related_Lists.task_mode_today"),
                            "Test setup failure: unexpeted label retrieved from server");
                    });
        },
        function verifyLabelSavedToStorage(cmp) {
            this.waitForGvpInStorage();
        }]
    },

    testGvpsLoadedFromStorageWhenOffline: {
        // tbliss: this should be fixed but leave flapper for a bit to verify it's solid
        labels : ["flapper"],
        test: [
        function getLabelFromServer(cmp) {
            // Requesting a label the client doesn't know about will force a server trip and save the label to storage
            $A.get("$Label.Related_Lists.task_mode_today");
            $A.test.addWaitFor(false, $A.test.isActionPending);
        },
        function waitForGvpInStorage(cmp) {
            this.waitForGvpInStorage();
        },
        function modifyLabelEntryInStorage(cmp) {
            var completed = false;
            var failTest = function(error) { this.failTest(error); }.bind(this);

            // Get label from storage and change value
            var storage = $A.storageService.getStorage("actions");
            storage.get("globalValueProviders", true)
                .then(function(gvps) {
                    for(var i = 0; i < gvps.length; i++) {
                        if (gvps[i]["type"] === "$Label") {
                            gvps[i]["values"]["Related_Lists"]["task_mode_today"] = "Updated";
                        }
                    }
                    return storage.set("globalValueProviders", gvps);
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
    },

    waitForGvpInStorage: function() {
        var found = false;
        var failTest = function(error) { this.failTest(error); }.bind(this);
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
            ["catch"](failTest);
        }

        getGvpFromStorage();

        $A.test.addWaitFor(true, function() { return found; });
    }
})
