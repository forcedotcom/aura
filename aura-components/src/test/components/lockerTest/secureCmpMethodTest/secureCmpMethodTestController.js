({
    testMethodParamFilteringOnNonLockerFacet : function(cmp, event, helper) {
        helper.runTestRoutine(cmp, "unlockedFacet", "Non Locker facet did not set the method params");
    },

    testMethodParamFilteringInSameLocker : function(cmp, event, helper) {
        helper.runTestRoutine(cmp, "sameLocker", "Facet from same locker did not set the method params");
    },

    testMethodParamFilteringInDifferentLocker : function(cmp, event, helper) {
        helper.runTestRoutine(cmp, "differentLocker", "Facet from different locker did not set the method params");
    }
})
