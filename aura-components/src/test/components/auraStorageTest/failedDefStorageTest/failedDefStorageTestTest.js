({
    // IndexedDB has problems in Safari and is not supported in older IE
    browsers:["-IE7", "-IE8", "-IE9", "-SAFARI", "-IPAD", "-IPHONE"],

    // Test modifies/deletes the persistent database
    labels : [ "threadHostile" ],

    // This must stay sync with ComponentDefStorage.prototype.BROKEN_GRAPH_COOKIE
    BROKEN_GRAPH_COOKIE: "auraBrokenDefGraph",

    /**
     * These tests verify components are still successfully created when the component def storage is in a state of
     * permanent failure (i.e. all operations on it error out). The app should be smart enough to catch and handle the
     * errors without compromising functionality.
     */

    testAuraInitAndAppLoaded: {
        test: function(cmp) {
            var storage = $A.storageService.getStorage("ComponentDefStorage");
            $A.test.assertEquals("mockComponentDefStorage", storage.getName(),
                    "Wrong storage adapter chosen, should be using mock impl");
            $A.test.assertTrue($A.finishedInit, "Aura finishedInit flag not set");
        }
    },

    testComponentInMarkupCreatedSuccessfully: {
        test: function(cmp) {
            var markupCmp = cmp.find("outputUrl");
            $A.test.assertEquals("markup://ui:outputURL", markupCmp.getDef().getDescriptor().getQualifiedName(),
                    "Unexpected markup component");
            $A.test.assertEquals("Fake link", markupCmp.get("v.label"), "Unexpected label on markup component");
        }
    },

    testDynamicallyCreatingComponentWithNoServerDependencyFromServer: {
        test: [
            function createComponentOnServer(cmp) {
                cmp._expectedCmp = "markup://ui:inputText";
                var completed = false;
                $A.createComponent(cmp._expectedCmp, {}, function(newCmp) {
                    var actual = newCmp.getDef().getDescriptor().getQualifiedName();
                    $A.test.assertEquals(cmp._expectedCmp, actual,
                            "Unexpected component returned via $A.createComponent on first call");
                    completed = true;
                });

                $A.test.addWaitFor(true, function(){ return completed; });
            },
            function createSameComponent(cmp) {
                // After retrieving the component from the server it should be saved in memory on the client, even though
                // all def cache operations will fail, allowing us to recreate the same component offline.
                $A.test.setServerReachable(false);
                $A.test.addCleanup(function(){ $A.test.setServerReachable(true) });
                var completed = false;
                $A.createComponent(cmp._expectedCmp, {}, function(newCmp) {
                    var actual = newCmp.getDef().getDescriptor().getQualifiedName();
                    $A.test.assertEquals(cmp._expectedCmp, actual,
                            "Unexpected component returned via $A.createComponent on second call");
                    completed = true;
                });

                $A.test.addWaitFor(true, function(){ return completed; });
            }
        ]
    },

    testDynamicallyCreatingComponentFromClient: {
        test: [
            function createComponentOnClient(cmp) {
                // Create a component we've included as a dependency so component creation stays client-side
                cmp._expectedCmp = "markup://ui:button";
                var completed = false;
                $A.createComponent(cmp._expectedCmp, {}, function(newCmp) {
                    var actual = newCmp.getDef().getDescriptor().getQualifiedName();
                    $A.test.assertEquals(cmp._expectedCmp, actual,
                            "Unexpected component returned via $A.createComponent on first call");
                    completed = true;
                });

                $A.test.addWaitFor(true, function(){ return completed; });
            },
            function createSameComponent(cmp) {
                var completed = false;
                $A.createComponent(cmp._expectedCmp, {}, function(newCmp) {
                    var actual = newCmp.getDef().getDescriptor().getQualifiedName();
                    $A.test.assertEquals(cmp._expectedCmp, actual,
                            "Unexpected component returned via $A.createComponent on second call");
                    completed = true;
                });

                $A.test.addWaitFor(true, function(){ return completed; });
            }
        ]
    },

    /**
     * After getting a new def from the server the framework will attempt to cache the def in persistent storage if
     * it's available. If the logic to save the def fails, we should clear the cache in an attempt to recover.
     */
    testDefStorageClearedWhenAllOperationsFail: {
        test: function(cmp) {
            var actual;
            $A.createComponent("test:text", {}, function(newCmp) {
                actual = newCmp;
            });

            $A.test.addWaitFor(true, function() { return actual !== undefined; },
                    function() {
                        $A.test.assertEquals("markup://test:text", actual.getDef().getDescriptor().getQualifiedName(),
                                "Unexpected component returned from createComponent() when storage operations fail");
                    }
            );
            // run as a separate waitFor because def persistence and the subsequent clearing is async to cmp creation
            $A.test.addWaitForWithFailureMessage(true,
                    function() {
                        return window.mockComponentDefStorage.clearCallCount > 0;
                    },
                    "ComponentDefStorage didn't have clear() called"
            );
        }
    },

    /**
     * When we get a new def from the server we will attempt to prune the storages to see if items need to be evicted
     * and then store the new defs to storage. If we error out during the store operation the app should continue
     * functioning and storages should be cleared.
     *
     * Failing specifically on setItem rather than all operations is important because it will fail further down the
     * promise chain and may hit different error handlers (see W-2839691).
     */
    testDefStorageClearedWhenSetItemOperationFails: {
        test: function(cmp) {
            window.mockComponentDefStorage.failAll = false;
            window.mockComponentDefStorage.failSetItems = true;
            var actual;
            $A.createComponent("test:text", {}, function(newCmp){
                actual = newCmp;
            });

            $A.test.addWaitForWithFailureMessage(
                    true,
                    function() {
                        return window.mockComponentDefStorage.clearCallCount > 0;
                    },
                    "Component def storage never called clear() when the adapter's setItems() fails",
                    function() {
                        $A.test.assertEquals("markup://test:text", actual.getDef().getDescriptor().getQualifiedName(),
                                "Unexpected component returned from createComponent() when storage operations fail");
                    }
            );
        }
    },

    testBrokenGraphCookieGetsRemovedWhenStorageIsCleared: {
        labels : ["UnAdaptableTest"],
        test: function(cmp) {
            $A.test.addCleanup(this.clearBrokenGraphCookie);

            window.mockComponentDefStorage.failAll = false;
            // Broken graph cookie is set when failing to store defs to componentDefStorage.
            // When storeDefs() fails, clear() will be called.
            window.mockComponentDefStorage.failSetItems = true;
            $A.createComponent("test:text", {}, function(newCmp){
                    $A.test.assertEquals("test:text", newCmp.getType(),
                            "Unexpected component returned from createComponent()");
                });

            var that = this;
            $A.test.addWaitForWithFailureMessage(
                    true,
                    function() {
                        // make sure clear() gets called
                        return window.mockComponentDefStorage.clearCallCount > 0;
                    },
                    "Component def storage never called clear() when the adapter's setItems() fails",
                    function() {
                        // This must stay sync with ComponentDefStorage.prototype.BROKEN_GRAPH_COOKIE
                        var actual = $A.util.getCookie(that.BROKEN_GRAPH_COOKIE);
                        $A.test.assertUndefined(actual);
                    }
            );
        }
    },

    testBrokenGraphCookieIsNotRemovedWhenStorageFailsToClear: {
        labels : ["UnAdaptableTest"],
        test: function(cmp) {
            $A.test.addCleanup(this.clearBrokenGraphCookie);

            window.mockComponentDefStorage.failAll = false;
            // Broken graph cookie is set when failing to store defs to componentDefStorage
            window.mockComponentDefStorage.failSetItems = true;
            window.mockComponentDefStorage.failClear = true;

            $A.createComponent("test:text", {}, function(newCmp){
                    $A.test.assertEquals("test:text", newCmp.getType(),
                            "Unexpected component returned from createComponent()");
                });

            var that = this;
            $A.test.addWaitForWithFailureMessage(
                    true,
                    function() {
                        return window.mockComponentDefStorage.clearCallCount > 0;
                    },
                    "Component def storage never called clear() when the adapter's setItems() fails",
                    function() {
                        var actual = $A.util.getCookie(that.BROKEN_GRAPH_COOKIE);
                        $A.test.assertEquals("true", actual);
                    }
            );
        }
    },

    testDefStorageClearedWhenBrokenGraphCookieIsSet: {
        labels : ["UnAdaptableTest"],
        test: function(cmp) {
            $A.test.addCleanup(this.clearBrokenGraphCookie);

            window.mockComponentDefStorage.failAll = false;

            $A.createComponent("test:text", {}, function(newCmp){
                    $A.test.assertEquals("test:text", newCmp.getType(),
                            "Unexpected component returned from createComponent()");
                });

            var expiration = new Date(new Date().getTime() + 1000*60*60); //1h
            var existedCookie = this.BROKEN_GRAPH_COOKIE + "=true; expires=" + expiration.toUTCString();
            document.cookie = existedCookie;

            var that = this;
            return $A.test.getAllComponentDefsFromStorage()
                .then(function() {
                    $A.test.assertEquals(1, window.mockComponentDefStorage.clearCallCount,
                            "ComponentDefStorage never called clear() when broken graph cookie is set");
                    $A.test.assertUndefined($A.util.getCookie(that.BROKEN_GRAPH_COOKIE),
                            "Broken graph cookie should be cleared");
                });
        }
    },

    /**
     * Expire broken graph cookie. Register this function as cleanup if a test keeps broken graph cookie
     * at the end.
     */
    clearBrokenGraphCookie: function() {
        document.cookie = this.BROKEN_GRAPH_COOKIE + "= true; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    }
})
