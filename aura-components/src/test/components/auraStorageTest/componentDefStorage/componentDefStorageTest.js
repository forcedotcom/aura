({
    // IndexedDB has problems in Safari and is not supported in older IE
    browsers:["-IE7", "-IE8", "-IE9", "-SAFARI", "-IPAD", "-IPHONE"],

    // Test modifies/deletes the persistent database
    labels : [ "threadHostile" ],

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
                 this.clearCaches();
             },
             function addToDefStorage(cmp) {
                 var desc = "ui:tab";
                 cmp.set("v.load", desc);
                 cmp.fetchCmp();
                 this.waitForDefInStorage(desc);
             },
             function addToDefStorage(cmp) {
                 var desc = "ui:tree"
                 cmp.set("v.load", desc);
                 cmp.fetchCmp();
                 this.waitForDefInStorage(desc);
             },
             function addToDefStorage(cmp) {
                 var desc = "ui:scroller";
                 cmp.set("v.load", desc);
                 cmp.fetchCmp();
                 this.waitForDefInStorage(desc);
             },
             function verifyDefsNotEvicted(cmp) {
                 // This test assumes pruning is done before inserting defs into the persistent def storage. By waiting
                 // for each def to be put in persistent storage before continuing on, we know pruning has already
                 // completed at this point so we can simply check what's currently in storage and verify no defs got
                 // removed.

                 // If defs are being pruned because the defs have gone over the storage maxSize we need to tweak the
                 // size of ComponentDefStorage in the test template.
                 var defs = undefined;
                 $A.storageService.getStorage("ComponentDefStorage").getAll().then(function(items) {
                     items = items || [];
                     items = items.map(function(item) {
                         return item["key"];
                     });
                     defs = items;
                 });
                 $A.test.addWaitForWithFailureMessage(true,
                     function() { return defs !== undefined; },
                     "Failed to get contents of ComponentDefStorage",
                     function() {
                         var expectedDefs = ["markup://ui:scroller", "markup://ui:tab", "markup://ui:tree"];
                         expectedDefs.forEach(function(expected) {
                             $A.test.assertTrue(defs.indexOf(expected) > -1, expected + " not found in ComponentDefStorage");
                         });
                     });
             },
             function cleanup(cmp) {
                 this.clearCaches();
             }
        ]
    },

    waitForDefInStorage: function(desc, msg) {
        var found = false;

        function checkDefStorage(desc) {
            $A.storageService.getStorage("ComponentDefStorage").getAll().then(function(items) {
                items = items || [];
                for (var i = 0; i < items.length; i++) {
                    if (items[i]["key"] === "markup://" + desc) {
                        found = true;
                        return;
                    }
                }
                checkDefStorage(desc);
            });
        }

        checkDefStorage(desc);

        msg = msg || "Def " + desc + " never present in ComponentDefStorage";
        $A.test.addWaitForWithFailureMessage(true,
            function() { return found; },
            msg
        );
    },

    /**
     * Empty the caches.
     */
    clearCaches: function(cmp) {
        var done = false;
        var promises = [ $A.storageService.getStorage("ComponentDefStorage").clear(), $A.storageService.getStorage("actions").clear() ];
        Promise.all(promises)
            .then(function() {
                done = true;
            })
            ["catch"](function(e) {
                $A.test.fail("Error clearing ComponentDefStorage or actions stores: " + e);
            })

        $A.test.addWaitForWithFailureMessage(true,
                function() { return done; },
                "Clearing ComponentDefStorage and actions store didn't complete");
    },

})