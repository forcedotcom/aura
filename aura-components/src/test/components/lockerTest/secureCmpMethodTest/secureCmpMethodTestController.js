({
    testMethodParamFilteringOnLockerFacetInSame : function(cmp, event, helper) {
        helper.runTestRoutine(cmp, "lockerFacetInSame", "Locker facet from the same namespace did not set the method params.");
    },

    testMethodParamFilteringOnNonLockerFacetInSame : function(cmp, event, helper) {
        helper.runTestRoutine(cmp, "nonLockerFacetInSame", "Non-Locker facet from the same namespace did not set the method params.");
    },

    testMethodParamFilteringOnLockerFacetInDifferent : function(cmp, event, helper) {
        helper.runTestRoutine(cmp, "lockerFacetInDifferent", "Locker facet from a different namespace did not set the method params.");
    },

    testMethodParamFilteringOnNonLockerFacetInDifferent : function(cmp, event, helper) {
        helper.runTestRoutine(cmp, "nonLockerFacetInDifferent", "Non-locker facet form a different namespace did not set the method params.")
    }
})