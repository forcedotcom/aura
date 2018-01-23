({
    // IndexedDB has problems in Safari and is not supported in older IE
    browsers:["-IE8", "-IE9", "-SAFARI", "-IPAD", "-IPHONE"],

    // threadHostile: test modifies/deletes the persistent database
    // UnAdaptableTest: running on core autobuilds is unreliable and causes lots of noise without giving us much more
    //                  value over OSS autobuilds
    labels : ["threadHostile", "UnAdaptableTest"],

    _testComponentDefsPersisted: {
        // TODO(kevinv 9/24/2016): re-enabled tests so marking as a flapper to get some non-blocking jenkins runs
        labels : ["flapper"],
        test: [
            function loadIframe(cmp) {
                var iframeSrc = "/auraStorageTest/componentDefStorage.app";
                return cmp.helper.lib.iframeTest.loadIframe(cmp, iframeSrc, "iframeContainer", "first load");
            },
            function clearStorages(cmp) {
                return cmp.helper.lib.iframeTest.clearCachesAndLogAndWait();
            },
            function reloadPage(cmp) {
                // Need to reload the page here to clear any items that may have been restored on initial load and are
                // now in memory
                return cmp.helper.lib.iframeTest.reloadIframe(cmp, false, "first reload");
            },
            function fetchTargetCmpFromServer(cmp) {
                return cmp.helper.lib.iframeTest.fetchCmpAndWait("ui:scroller");
            },
            function createTargetCmpOnClient(cmp) {
                return cmp.helper.lib.iframeTest.createComponentFromConfig("ui:scroller");
            },
            function waitForAllDefsStored(cmp) {
                return cmp.helper.lib.iframeTest.waitForDefInStorage("ui:scroller")
                    .then(function() {
                        return cmp.helper.lib.iframeTest.waitForDefInStorage("ui:resizeObserver");
                    })
                    .then(function() {
                        return cmp.helper.lib.iframeTest.waitForDefInStorage("ui:scrollerLib");
                    })
                    .then(function() {
                        return cmp.helper.lib.iframeTest.waitForDefInStorage("ui:scopedScroll");
                    })
                    .then(function() {
                        return cmp.helper.lib.iframeTest.waitForGvpsInStorage();
                    });
            },
            function reloadIframe(cmp) {
                return cmp.helper.lib.iframeTest.reloadIframe(cmp, true, "second reload");
            },
            function createTargetCmpAndVerify(cmp) {
                // avoid any server trip to prove that ui:scroller is on the client
                return cmp.helper.lib.iframeTest.createComponentFromConfig("ui:scroller");
            },
            function cleanup(cmp) {
                return cmp.helper.lib.iframeTest.clearCachesAndLogAndWait();
            }
        ]
    },

    _testComponentDefStorageEviction: {
        // TODO(tbliss 8/18/2016): let it run in jenkins and monitor for a bit before removing the annotation.
        labels : ["flapper"],
        test: [
            function loadIframe(cmp) {
                return cmp.helper.lib.iframeTest.loadIframe(cmp, "/auraStorageTest/componentDefStorage.app?overrideStorage=true", "iframeContainer", "first load");
            },
            function clearStorages(cmp) {
                return cmp.helper.lib.iframeTest.clearCachesAndLogAndWait();
            },
            function reloadPage(cmp) {
                // Need to reload the page here to clear any items that may have been restored on initial load and are
                // now in memory
                return cmp.helper.lib.iframeTest.reloadIframe(cmp, false, "first reload");
            },
            function fetchTargetCmpFromServer(cmp) {
                return cmp.helper.lib.iframeTest.fetchCmpAndWait("ui:scroller");
            },
            function createTargetCmpOnClient(cmp) {
                return cmp.helper.lib.iframeTest.createComponentFromConfig("ui:scroller");
            },
            function verifyTargetCmpStored(cmp) {
                return cmp.helper.lib.iframeTest.waitForDefInStorage("ui:scroller");
            },
            function fetchCmpsUntilEvictTargetCmp(cmp) {
                var complete = false;
                return this.fetchCmpsUntilEviction(cmp, "ui:scroller");
            },
            function reloadPage(cmp) {
                // Reload page to clear anything saved in javascript memory
                return cmp.helper.lib.iframeTest.reloadIframe(cmp, true, "second reload");
            },
            function fetchTargetCmpAgain(cmp) {
                return cmp.helper.lib.iframeTest.fetchCmpAndWait("ui:scroller");
            },
            function createTargetCmpOnClient(cmp) {
                return cmp.helper.lib.iframeTest.createComponentFromConfig("ui:scroller");
            },
            function cleanup(cmp) {
                return cmp.helper.lib.iframeTest.clearCachesAndLogAndWait();
            }
        ]
    },

    /**
     * Verifies that aura.context.loaded is reset when defs are evicted causing evicted defs to be re-downloaded from the server.
     * If aura.context.loaded is not reset then the client reports that it has more defs than it has persisted, which causes the
     * server to not send the defs, resulting in a broken def graph being persisted on the client (the in-memory graph is correct
     * though).
     */
    _testEvictedDefsAreRefetchedWithoutReload: {
        // TODO(tbliss 8/18/2016): let it run in jenkins and monitor for a bit before removing the annotation.
        labels : ["flapper"],
        test: [
            function loadIframe(cmp) {
                return cmp.helper.lib.iframeTest.loadIframe(cmp, "/auraStorageTest/componentDefStorage.app?overrideStorage=true", "iframeContainer", "first load");
            },
            function clearStorages(cmp) {
                return cmp.helper.lib.iframeTest.clearCachesAndLogAndWait();
            },
            function reloadPage(cmp) {
                // Need to reload the page here to clear any items that may have been restored on initial load and are
                // now in memory
                return cmp.helper.lib.iframeTest.reloadIframe(cmp, false, "first reload");
            },
            function fetchTargetCmpFromServer(cmp) {
                return cmp.helper.lib.iframeTest.fetchCmpAndWait("ui:scroller");
            },
            function verifyTargetCmpStored(cmp) {
                return cmp.helper.lib.iframeTest.waitForDefInStorage("ui:scroller");
            },
            function fetchCmpsUntilEvictTargetCmp(cmp) {
                return this.fetchCmpsUntilEviction(cmp, "ui:scroller");
            },
            function verifyTargetCmpNotInContext(cmp) {
                cmp.helper.lib.iframeTest.verifyDefNotInLoaded("ui:scroller");
            },
            function fetchCmpFromServerThatDependsOnTargetCmp(cmp) {
                // ui:carousel contains ui:scroller. if aura.context.loaded reports that it still has
                // ui:scroller then the server won't send it, resulting in a broken def graph being persisted
                // on the client. doing a reload then cmp create would fail.
                return cmp.helper.lib.iframeTest.fetchCmpAndWait("ui:carousel");
            },
            function verifyTargetDependentCmpInStorage(cmp) {
                return cmp.helper.lib.iframeTest.waitForDefInStorage("ui:carousel");
            },
            function verifyTargetCmpInStorage(cmp) {
                return cmp.helper.lib.iframeTest.waitForDefInStorage("ui:scroller");
            },
            function waitForGvpsStored(cmp) {
                // must wait for gvps to be stored otherwise we may not load defs from storage on boot after reload
                return cmp.helper.lib.iframeTest.waitForGvpsInStorage();
            },
            function reloadPage(cmp) {
                // Reload page to clear anything saved in javascript memory
                return cmp.helper.lib.iframeTest.reloadIframe(cmp, true, "second reload");
            },
            function createTargetDependentCmpOnClient(cmp) {
                // avoid any server trip to prove that ui:scroller is on the client
                return cmp.helper.lib.iframeTest.createComponentFromConfig("ui:carousel");
            },
            function createTargetCmpOnClient(cmp) {
                // avoid any server trip to prove that ui:scroller is on the client
                return cmp.helper.lib.iframeTest.createComponentFromConfig("ui:scroller");
            },
            function cleanup(cmp) {
                return cmp.helper.lib.iframeTest.clearCachesAndLogAndWait();
            }
        ]
    },

    /**
     * Keep fetching components from the server until targetCmp is evicted from storage.
     */
    fetchCmpsUntilEviction: function(cmp, targetCmp) {
        var defs = ["ui:dataTable", "ui:panel", "ui:autocomplete", "ui:dropzone", "ui:image", "ui:inlineEditGrid",
                    "ui:pillContainer", "ui:menu"];

        /**
         * Fetch the next cmp, waiting for it to be retrieved and
         * placed in storage (aka def in storage, sentinel is gone).
         */
        function fetchAnotherCmp() {
            var def = defs.pop();
            if (!def) {
                return Promise["reject"](new Error("Ran out of defs to fetch while trying to get " + targetCmp + " to evict"))
            }
            return cmp.helper.lib.iframeTest.fetchCmpAndWaitAsPromise(def);
        }

        /**
         * Checks whether the provided def is in storage.
         */
        function checkInStorage() {
            return cmp.helper.lib.iframeTest.checkDefInStorage(targetCmp);
        }

        /**
         * Uses promise recursion until targetCmp is not in storage
         */
        function recurse(inStorage) {
            if (!inStorage) {
                // end recursion
                return;
            }
            // still present so keep recursing
            return fetchAnotherCmp().then(checkInStorage).then(recurse);
        }

        // start the recursion
        return checkInStorage().then(recurse);
    }
})
