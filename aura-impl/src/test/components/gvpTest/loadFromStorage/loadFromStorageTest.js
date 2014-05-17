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
            $A.test.assertTrue(window.mockStorageAdapter.getItem['globalValueProviders'], "Aura initialization completed before mockStorageAdapter.getItem('globalValueProviders')'s callback was invoked");
        }
    }
})
