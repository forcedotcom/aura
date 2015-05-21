({
    /**
     * Verifies that aura inits and the app is loaded when the "actions" store
     * fails all requests. Also verifies that the correct mocked storage adapter
     * is in use. See auraStorageTest:faileStorageTemplate for mock adapter implementation.
     *
     * here we expect the warning from storage.set() 4 times.
     * one from GlobalValueProvider merging context
     * one from saving the return component of the loadComponent action
     * two from saveTokenToStorage -- I need to double check if both of them are necessary
     *
     */
    testAuraInitAndAppLoaded: {
        //failOnWarning: true, //ailOnWarning will fail on jenkins : W-2523040
        auraWarningsExpectedDuringInit: ["AuraClientService.saveTokenToStorage(): failed to persist token: Error: setItem(): mock always fails",
            "GlobalValueProvider.merge(), failed to put, error:Error: setItem(): mock always fails",
            "AuraClientService.singleAction, problem when putting aura://ComponentController/ACTION$getComponent:{\"name\":\"auraStorageTest:failedStorageTest\"} into storage, error:Error: setItem(): mock always fails"],
        test: function (cmp) {
            // at this point aura has init'ed and the app has loaded! that's half of the test.
            // now verify the mock adapter is actually in use
            var storage = $A.storageService.getStorage("actions");
            $A.test.assertEquals("mock", storage.getName(), "wrong storage adapter chosen. does aura now include a persistent adapter?");
        }
    },

    /**
     * Verifies that storable actions work when all storage operations fail. This explicitly
     * exercises Storage Service's get() and put(), and the Action Service.
     *
     *
     * during initialization, we expect warning from storage.set() 4 times, just like the test above
     */
    testStorableAction: {
        //failOnWarning: true, //failOnWarning will fail on jenkins W-2523040
        auraWarningsExpectedDuringInit: ["AuraClientService.saveTokenToStorage(): failed to persist token: Error: setItem(): mock always fails",
            "GlobalValueProvider.merge(), failed to put, error:Error: setItem(): mock always fails",
            "AuraClientService.saveTokenToStorage(): failed to persist token: Error: setItem(): mock always fails",
            "AuraClientService.singleAction, problem when putting aura://ComponentController/ACTION$getComponent:{\"name\":\"auraStorageTest:failedStorageTest\"} into storage, error:Error: setItem(): mock always fails"
        ],
        test: [
            function (cmp) {
                //we are expecting 1 warning from setItem, it's from gvp's merging context
                //which is from the auraClientService's callback for action:c.setCounter down there
                $A.test.expectAuraWarning("GlobalValueProvider.merge(), failed to put, error:Error: setItem(): mock always fails");
                //we need to reset the counter on server, or the test will only pass once per server start up
                var a = cmp.get("c.setCounter");
                a.setParams({testName: "testStorableAction", value: 0});
                $A.test.enqueueAction(a);

                $A.test.addWaitForWithFailureMessage(
                    "SUCCESS",
                    function () {
                        return a.getState()
                    },
                    "fail to reset counter, action return with state=" + a.getState()
                );
            }, function (cmp) {
                $A.log("action#2 start");
                //we expect 2 warnings from setItem.
                //one from gvp's merging context. another one is from storing the return of Action c.string down there
                $A.test.expectAuraWarning("GlobalValueProvider.merge(), failed to put, error:Error: setItem(): mock always fails");
                $A.test.expectAuraWarning('AuraClientService.singleAction, problem when putting java://org.auraframework.impl.java.controller.AuraStorageTestController/ACTION$string:{"param1":1,"testName":"testStorableAction"} into storage, error:Error: setItem(): mock always fails');
                // sets the server-side counter to 0
                var a = cmp.get("c.string");
                a.setParams({testName: "testStorableAction", param1: 1});
                a.setStorable();

                $A.test.addWaitForWithFailureMessage(
                    "SUCCESS",
                    function () {
                        return a.getState()
                    },
                    "first action didn't succeed; returned state=" + a.getState(),
                    function () {
                        $A.test.assertFalse(a.isFromStorage(), "first action should not be from storage");
                        $A.test.assertEquals(0, a.getReturnValue()[0], "server-side counter wasn't initialized to 0");
                    }
                );

                $A.test.enqueueAction(a);
            }, function (cmp) {
                $A.log("action#3 start");
                //we are expecting 2 warning from setItem()
                //one from gvp's merging context
                //one from storing the return of Action c.string below
                $A.test.expectAuraWarning('AuraClientService.singleAction, problem when putting java://org.auraframework.impl.java.controller.AuraStorageTestController/ACTION$string:{"param1":11,"testName":"testStorableAction"} into storage, error:Error: setItem(): mock always fails');
                $A.test.expectAuraWarning("GlobalValueProvider.merge(), failed to put, error:Error: setItem(): mock always fails");

                // increment the server-side counter (to 1)
                var a = cmp.get("c.string");
                a.setParams({testName: "testStorableAction", param1: 11});
                a.setStorable();

                $A.test.addWaitForWithFailureMessage(
                    "SUCCESS",
                    function () {
                        return a.getState()
                    },
                    "second action didn't succeed; returned state=" + a.getState(),
                    function () {
                        $A.test.assertFalse(a.isFromStorage(), "second action should not be from storage because 'actions' store fails all operations");
                        $A.test.assertEquals(1, a.getReturnValue()[0], "server-side counter wasn't incremented to 1");
                    }
                );

                $A.test.enqueueAction(a);

            }
        ]
    }
})
