({
    //
    // see gvptest:loadFromStorageTemplate for details of how the mock adapter works
    //

    testMockAdapterSelected : {
        test : function(cmp) {
            var storage = $A.storageService.getStorage("actions");
            $A.test.assertEquals("mock", storage.getName(), "wrong storage adapter chosen. does aura now include a persistent adapter?");
        }
    },

    testAuraInitWaitsForGetItem : {
        test : function(cmp) {

            var completed = false;
            var result;
            window.mockStorageAdapter.getItem('globalValueProviders')
                .then(function(item) {
                    result = item;
                    completed = true;
                });

            $A.test.addWaitFor(
                true,
                function() { return completed; },
                function() { $A.test.assertNotUndefinedOrNull(result, "Aura initialization completed before mockStorageAdapter.getItem('globalValueProviders')'s callback was invoked"); }
            );
        }
    }
})
