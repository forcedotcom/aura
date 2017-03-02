({
    /**
     * Verifies that aura inits and the app is loaded when the "actions" store
     * fails all requests. Also verifies that the correct mocked storage adapter
     * is in use. See auraStorageTest:failedActionStorageTemplate for mock adapter implementation.
     */
    testAuraInitAndAppLoaded: {
        test: function (cmp) {
            // at this point aura has init'ed and the app has loaded! that's half of the test.
            // now verify the mock adapter is actually in use
            var storage = $A.storageService.getStorage("actions");
            $A.test.assertEquals("mock", storage.getName(), "Wrong storage adapter chosen, should be using mock impl");
            $A.test.assertTrue($A.finishedInit, "Aura finishedInit flag not set");
        }
    },

    /**
     * Verifies that storable actions work when all storage operations fail.
     *
     * This test leverages a server-side static counter in AuraStorageTestController.java to verify the server is hit.
     */
    testStorableAction: {
        test: [
            function resetStaticCounterOnServer(cmp) {
                //we need to reset the counter on server, or the test will only pass once per server start up
                var a = cmp.get("c.setCounter");
                a.setParams({testName: "testStorableAction", value: 0});
                $A.enqueueAction(a);

                $A.test.addWaitForWithFailureMessage(
                        true,
                        function() {
                            return $A.test.areActionsComplete([a]);
                        },
                        "First action to reset counter never completed",
                        function() {
                            $A.test.assertEquals("SUCCESS", a.getState(), "Action did not return in a success state");
                        }
                );
            }, function callServerActionOnce(cmp) {
                // server will return the current counter value, which is still 0, then increment
                var a = cmp.get("c.string");
                a.setParams({testName: "testStorableAction", param1: 1});
                a.setStorable();
                $A.enqueueAction(a);

                $A.test.addWaitForWithFailureMessage(
                        true,
                        function() {
                            return $A.test.areActionsComplete([a]);
                        },
                        "Second action never completed",
                        function() {
                            $A.test.assertEquals("SUCCESS", a.getState(), "Action did not return in a success state");
                            $A.test.assertFalse(a.isFromStorage(), "Action should not be from storage");
                            // server returns an array where the first index is the current counter value
                            $A.test.assertEquals(0, a.getReturnValue()[0], "Server-side counter wasn't initialized to 0");
                        }
                );
            }, function callServerActionAgainAndVerifyServerCounterIncremented(cmp) {
                // when the action hits the server a second time the counter will return 1
                var a = cmp.get("c.string");
                a.setParams({testName: "testStorableAction", param1: 1});
                a.setStorable();
                $A.enqueueAction(a);

                $A.test.addWaitForWithFailureMessage(
                        true,
                        function() {
                            return $A.test.areActionsComplete([a]);
                        },
                        "Third action never completed",
                        function() {
                            $A.test.assertEquals("SUCCESS", a.getState(), "Action did not return in a success state");
                            $A.test.assertFalse(a.isFromStorage(), "Action should not be from storage");
                            $A.test.assertEquals(1, a.getReturnValue()[0], "Server-side counter wasn't incremented to 1");
                        }
                );
            }
        ]
    }
})
