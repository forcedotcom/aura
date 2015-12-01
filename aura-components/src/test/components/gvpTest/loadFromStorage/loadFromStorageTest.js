({
    //
    // see gvptest:loadFromStorageTemplate for details of how the mock adapter works
    //

    testAuraInitWaitsForGetItem : {
        test : function(cmp) {
            // verify getItem(GVP) was called by aura during bootstrap. if this is false then aura isn't waiting for its bootstrap to finish before starting the app (which includes tests).
            $A.test.assertTrue(window.mockStorageAdapter.getItemInvocations['globalValueProviders'],
                    "Aura initialization completed before mockStorageAdapter.getItem('globalValueProviders')'s callback was invoked");

            // verify GVP values (which were loaded async) are available.
            var expected = "bar"; // defined in loadFromStorageTemplate.cmp
            var actual = $A.get("$Custom.foo");
            $A.test.assertEquals(expected, actual, "GVP value loaded from mockStorageAdapter not found");
        }
    }
})
