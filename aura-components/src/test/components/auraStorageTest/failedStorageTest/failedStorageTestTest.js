({
    /**
     * Verifies that aura inits and the app is loaded when the "actions" store
     * fails all requests. Also verifies that the correct mocked storage adapter
     * is in use. See auraStorageTest:faileStorageTemplate for mock adapter implementation.
     */
    testAuraInitAndAppLoaded : {
        test : function(cmp) {
            // at this point aura has init'ed and the app has loaded! that's half of the test.
            // now verify the mock adapter is actually in use
            var storage = $A.storageService.getStorage("actions");
            $A.test.assertEquals("mock", storage.getName(), "wrong storage adapter chosen. does aura now include a persistent adapter?");
        }
    },

    /**
     * Verifies that storable actions work when all storage operations fail. This explicitly
     * exercises Storage Service's get() and put(), and the Action Service.
     */
    testStorableAction : {
        test : [ function(cmp) {
            // sets the server-side counter to 0
            var a = cmp.get("c.string");
            a.setParams({ testName : "testStorableAction", param1 : 1 /* ignored */ });
            a.setStorable();

            $A.test.addWaitForWithFailureMessage(
                "SUCCESS",
                function() { return a.getState() },
                "first action didn't succeed; returned state=" + a.getState(),
                function() {
                    $A.test.assertFalse(a.isFromStorage(), "first action should not be from storage");
                    $A.test.assertEquals(0, a.getReturnValue()[0], "server-side counter wasn't initialized to 0");
                }
            );

            $A.test.enqueueAction(a);
        }, function(cmp) {
            // increment the server-side counter (to 1)
            var a = cmp.get("c.string");
            a.setParams({ testName : "testStorableAction", param1 : 1 /* ignored */ });
            a.setStorable();

            $A.test.addWaitForWithFailureMessage(
                "SUCCESS",
                function() { return a.getState() },
                "second action didn't succeed; returned state=" + a.getState(),
                function() {
                    $A.test.assertFalse(a.isFromStorage(), "second action should not be from storage because 'actions' store fails all operations");
                    $A.test.assertEquals(1, a.getReturnValue()[0], "server-side counter wasn't incremented to 1");
                }
            );

            $A.test.enqueueAction(a);

        }]
    }
})
