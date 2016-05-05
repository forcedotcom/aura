({
    // IndexedDB has problems in Safari and is not supported in older IE
    browsers:["-IE7", "-IE8", "-IE9", "-SAFARI", "-IPAD", "-IPHONE"],

    // Test modifies/deletes the persistent database
    labels : [ "threadHostile" ],

    testComponentDefsPersisted: {
        test: [
            function loadIframe(cmp) {
                var iframeSrc = "/auraStorageTest/componentDefStorage.app";
                cmp.helper.lib.iframeTest.loadIframe(cmp, iframeSrc, "iframeContainer", "first load");
            },
            function clearStorages(cmp) {
                cmp.helper.lib.iframeTest.clearCachesAndLogAndWait();
            },
            function reloadPage(cmp) {
                // Need to reload the page here to clear any items that may have been restored on initial load and are
                // now in memory
                cmp.helper.lib.iframeTest.reloadIframe(cmp, false, "first reload");
            },
            function fetchTargetCmpFromServer(cmp) {
                cmp.helper.lib.iframeTest.fetchCmpAndWait("ui:scroller");
            },
            function createTargetCmpOnClient(cmp) {
                cmp.helper.lib.iframeTest.createComponentFromConfig("ui:scroller");
            },
            function waitForAllDefsStored(cmp) {
                cmp.helper.lib.iframeTest.waitForDefInStorage("ui:scroller");
                cmp.helper.lib.iframeTest.waitForDefInStorage("ui:resizeObserver");
                cmp.helper.lib.iframeTest.waitForDefInStorage("ui:scrollerLib");
                cmp.helper.lib.iframeTest.waitForDefInStorage("ui:scopedScroll");
            },
            function reloadIframe(cmp) {
                cmp.helper.lib.iframeTest.reloadIframe(cmp, true, "second reload")
            },
            function createTargetCmpAndVerify(cmp) {
                // avoid any server trip to prove that ui:scroller is on the client
                cmp.helper.lib.iframeTest.createComponentFromConfig("ui:scroller");
            },
            function cleanup(cmp) {
                cmp.helper.lib.iframeTest.clearCachesAndLogAndWait();
            }
        ]
    },

    // TODO(W-2979502): this test should keep adding defs until something is evicted instead of adding a set amount and
    // assuming it will get evicted.
    testComponentDefStorageEviction: {
        // TODO - this test should now be reliable. let is run in jenkins for a bit before removing the annotation.
        labels : ["flapper"],
        test: [
            function loadIframe(cmp) {
                cmp.helper.lib.iframeTest.loadIframe(cmp, "/auraStorageTest/componentDefStorage.app?overrideStorage=true", "iframeContainer", "first load");
            },
            function clearStorages(cmp) {
                cmp.helper.lib.iframeTest.clearCachesAndLogAndWait();
            },
            function reloadPage(cmp) {
                // Need to reload the page here to clear any items that may have been restored on initial load and are
                // now in memory
                cmp.helper.lib.iframeTest.reloadIframe(cmp, false, "first reload");
            },
            function fetchTargetCmpFromServer(cmp) {
                cmp.helper.lib.iframeTest.fetchCmpAndWait("ui:scroller");
            },
            function createTargetCmpOnClient(cmp) {
                cmp.helper.lib.iframeTest.createComponentFromConfig("ui:scroller");
            },
            function verifyTargetCmpStored(cmp) {
                cmp.helper.lib.iframeTest.waitForDefInStorage("ui:scroller");
            },
            function fetchDifferentCmpFromServer(cmp) {
                cmp.helper.lib.iframeTest.fetchCmpAndWait("ui:block");
            },
            function fetchCmpFromServerToEvictTargetCmp(cmp) {
                cmp.helper.lib.iframeTest.fetchCmpAndWait("ui:menu");
            },
            function verifyTargetCmpEvicted(cmp) {
                // Ideally we would keep adding defs until the original got evicted instead of just waiting here (W-2979502)
                cmp.helper.lib.iframeTest.waitForDefRemovedFromStorage("ui:scroller");
            },
            function reloadPage(cmp) {
                // Reload page to clear anything saved in javascript memory
                cmp.helper.lib.iframeTest.reloadIframe(cmp, true, "second reload");
            },
            function fetchTargetCmpAgain(cmp) {
                cmp.helper.lib.iframeTest.fetchCmpAndWait("ui:scroller");
            },
            function createTargetCmpOnClient(cmp) {
                cmp.helper.lib.iframeTest.createComponentFromConfig("ui:scroller");
            },
            function cleanup(cmp) {
                cmp.helper.lib.iframeTest.clearCachesAndLogAndWait();
            }
        ]
    },

    // TODO(W-2979502): this test should keep adding defs until something is evicted instead of adding a set amount and
    // assuming it will get evicted.
    /**
     * Verifies that aura.context.loaded is reset when defs are evicted causing evicted defs to be re-downloaded from the server.
     * If aura.context.loaded is not reset then the client reports that it has more defs than it has persisted, which causes the
     * server to not send the defs, resulting in a broken def graph being persisted on the client (the in-memory graph is correct
     * though).
     */
    testEvictedDefsAreRefetchedWithoutReload: {
        test: [
            function loadIframe(cmp) {
                cmp.helper.lib.iframeTest.loadIframe(cmp, "/auraStorageTest/componentDefStorage.app?overrideStorage=true", "iframeContainer", "first load");
            },
            function clearStorages(cmp) {
                cmp.helper.lib.iframeTest.clearCachesAndLogAndWait();
            },
            function reloadPage(cmp) {
                // Need to reload the page here to clear any items that may have been restored on initial load and are
                // now in memory
                cmp.helper.lib.iframeTest.reloadIframe(cmp, false, "first reload");
            },
            function fetchTargetCmpFromServer(cmp) {
                cmp.helper.lib.iframeTest.fetchCmpAndWait("ui:scroller");
            },
            function verifyTargetCmpStored(cmp) {
                cmp.helper.lib.iframeTest.waitForDefInStorage("ui:scroller");
            },
            function fetchDifferentCmpFromServer(cmp) {
                cmp.helper.lib.iframeTest.fetchCmpAndWait("ui:block");
            },
            function fetchCmpFromServerToEvictTargetCmp(cmp) {
                cmp.helper.lib.iframeTest.fetchCmpAndWait("ui:menu");
            },
            function verifyTargetCmpEvicted(cmp) {
                // Ideally we would keep adding defs until the original got evicted instead of just waiting here (W-2979502)
                cmp.helper.lib.iframeTest.waitForDefRemovedFromStorage("ui:scroller");
            },
            function verifyTargetCmpNotInContext(cmp) {
                cmp.helper.lib.iframeTest.verifyDefNotInLoaded("ui:scroller");
            },
            function fetchCmpFromServerThatDependsOnTargetCmp(cmp) {
                // ui:carousel contains ui:scroller. if aura.context.loaded reports that it still has
                // ui:scroller then the server won't send it, resulting in a broken def graph being persisted
                // on the client. doing a reload then cmp create would fail.
                cmp.helper.lib.iframeTest.fetchCmpAndWait("ui:carousel");
            }, function verifyTargetDependentCmpInStorage(cmp) {
                cmp.helper.lib.iframeTest.waitForDefInStorage("ui:carousel");
            }, function verifyTargetCmpInStorage(cmp) {
                cmp.helper.lib.iframeTest.waitForDefInStorage("ui:scroller");
            },
            function reloadPage(cmp) {
                // Reload page to clear anything saved in javascript memory
                cmp.helper.lib.iframeTest.reloadIframe(cmp, true, "second reload");
            },
            function createTargetDependentCmpOnClient(cmp) {
                // avoid any server trip to prove that ui:scroller is on the client
                cmp.helper.lib.iframeTest.createComponentFromConfig("ui:carousel");
            },
            function createTargetCmpOnClient(cmp) {
                // avoid any server trip to prove that ui:scroller is on the client
                cmp.helper.lib.iframeTest.createComponentFromConfig("ui:scroller");
            },
            function cleanup(cmp) {
                cmp.helper.lib.iframeTest.clearCachesAndLogAndWait();
            }
        ]
    }
})
