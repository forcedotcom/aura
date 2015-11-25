({
    /**
     * Verify getting new defs from server is not overly aggressive about evicting previously stored defs from storage.
     * 
     * This covers the case where a bug in the pruning logic may cause defs to be evicted whenever any new def is
     * stored to the cache. This is tested with a component test instead of a unit test because the bug may only
     * be present in obfuscated javascript modes, as W-2833015 exemplifies.
     */
    testNoExcessivePruning: {
        test: [
             function clearPersistentStorages(cmp) {
                 $A.storageService.getStorage("ComponentDefStorage").clear();
                 $A.storageService.getStorage("actions").clear();
             },
             function addToDefStorage(cmp) {
                 cmp.set("v.load", "ui:tab");
                 cmp.fetchCmp();
                 $A.test.addWaitFor("Done Fetching", function() { return cmp.get("v.status"); });
             },
             function addToDefStorage(cmp) {
                 cmp.set("v.load", "ui:tree");
                 cmp.fetchCmp();
                 $A.test.addWaitFor("Done Fetching", function() { return cmp.get("v.status"); });
             },
             function addToDefStorage(cmp) {
                 cmp.set("v.load", "ui:scroller");
                 cmp.fetchCmp();
                 $A.test.addWaitFor("Done Fetching", function() { return cmp.get("v.status"); });
             },
             function verifyDefsNotEvicted(cmp) {
                 // ui:scroller is the most recent item to be stored and is the least likely to be evicted so wait for
                 // that def, then assert that the previous are still present.
                 $A.test.addWaitFor(true, function() {
                     var defContents = cmp.get("v.defStorageContents");
                     return defContents.indexOf("markup://ui:scroller") > -1;
                 }, function() {
                     var defContents = cmp.get("v.defStorageContents");
                     $A.test.assertTrue(defContents.indexOf("markup://ui:tab") > -1,
                             "Previously added component (ui:tab) is not in component def storage.");
                     $A.test.assertTrue(defContents.indexOf("markup://ui:tree") > -1,
                             "Previously added component (ui:tree) is not in component def storage.");
                 });
             }
        ]
    }
})