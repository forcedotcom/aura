({
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

    testDynamicallyCreatingComponentOnServer: {
        test: [
        function createComponentOnServer(cmp) {
            cmp._expectedCmp = "test:text";
            var completed = false;
            $A.createComponent(cmp._expectedCmp, {}, function(newCmp) {
                var actual = newCmp.getDef().getDescriptor().getQualifiedName();
                $A.test.assertEquals("markup://"+cmp._expectedCmp, actual,
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
                $A.test.assertEquals("markup://"+cmp._expectedCmp, actual,
                        "Unexpected component returned via $A.createComponent on second call");
                completed = true;
            });

            $A.test.addWaitFor(true, function(){ return completed; });
        }]
    },
    
    testDynamicallyCreatingComponentOnClient: {
        test: [
        function createComponentOnClient(cmp) {
            // Create a component we've included as a dependency so component creation stays client-side
            cmp._expectedCmp = "attributesTest:parent";
            var completed = false;
            $A.createComponent(cmp._expectedCmp, {}, function(newCmp) {
                var actual = newCmp.getDef().getDescriptor().getQualifiedName();
                $A.test.assertEquals("markup://"+cmp._expectedCmp, actual,
                        "Unexpected component returned via $A.createComponent on second call");
                completed = true;
            });
            
            $A.test.addWaitFor(true, function(){ return completed; });
        },
        function createSameComponent(cmp) {
            var completed = false;
            $A.createComponent(cmp._expectedCmp, {}, function(newCmp) {
                var actual = newCmp.getDef().getDescriptor().getQualifiedName();
                $A.test.assertEquals("markup://"+cmp._expectedCmp, actual,
                        "Unexpected component returned via $A.createComponent on second call");
                completed = true;
            });

            $A.test.addWaitFor(true, function(){ return completed; });
        }]
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

            $A.test.addWaitFor(
                    true,
                    function() {
                        return actual !== undefined;
                    },
                    function() {
                        $A.test.assertTrue(window.mockComponentDefStorage.clearCallCount > 0,
                                "Expected clear() to be called on ComponentDefStorage when storage operations fail");
                        $A.test.assertEquals("markup://test:text", actual.getDef().getDescriptor().getQualifiedName(),
                                "Unexpected component returned from createComponent() when storage operations fail");
                    }
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
            window.mockComponentDefStorage.failSetItem = true;
            var actual;
            $A.createComponent("test:text", {}, function(newCmp){
                actual = newCmp;
            });

            $A.test.addWaitForWithFailureMessage(
                    true,
                    function() {
                        return window.mockComponentDefStorage.clearCallCount > 0;
                    },
                    "Component def storage never called clear() when the adapter's setItem() fails",
                    function() {
                        $A.test.assertEquals("markup://test:text", actual.getDef().getDescriptor().getQualifiedName(),
                                "Unexpected component returned from createComponent() when storage operations fail");
                    }
            );
        }
    }
})