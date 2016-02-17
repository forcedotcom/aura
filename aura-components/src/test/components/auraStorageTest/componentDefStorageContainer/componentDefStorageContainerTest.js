({
    // IndexedDB has problems in Safari and is not supported in older IE
    browsers:["-IE7", "-IE8", "-IE9", "-SAFARI", "-IPAD", "-IPHONE"],

    // Test modifies/deletes the persistent database
    labels : [ "threadHostile" ],


    testComponentDefsPersisted: {
        test: [
            function loadIframe(cmp) {
                var iframeSrc = "/auraStorageTest/componentDefStorage.app";
                cmp.helper.lib.iframeTest.loadIframe(cmp, iframeSrc, "iframeContainer");
            },
            function clearStorages(cmp) {
                cmp.helper.lib.iframeTest.clearCachesAndLogAndWait();
            },
            function reloadPage(cmp) {
                // Need to reload the page here to clear any items that may have been restored on initial load and are
                // now in memory
                cmp.helper.lib.iframeTest.reloadIframe(cmp, false);
            },
            function fetchComponentFromServer(cmp) {
                cmp.helper.lib.iframeTest.fetchCmpAndWait("ui:scroller");
            },
            function createComponentOnClient(cmp) {
                cmp.helper.lib.iframeTest.createComponentFromConfig("ui:scroller");
            },
            function waitForAllDefsStored(cmp) {
                cmp.helper.lib.iframeTest.verifyDefStorage("ui:scroller", true);
                cmp.helper.lib.iframeTest.verifyDefStorage("ui:resizeObserver", true);
                cmp.helper.lib.iframeTest.verifyDefStorage("ui:scrollerLib", true);
                cmp.helper.lib.iframeTest.verifyDefStorage("ui:scopedScroll", true);
            },
            function reloadIframe(cmp) {
                cmp.helper.lib.iframeTest.reloadIframe(cmp, true)
            },
            function createOriginalComponentAndVerify(cmp) {
                cmp.helper.lib.iframeTest.createComponentFromConfig("ui:scroller");
            },
            function cleanup(cmp) {
                cmp.helper.lib.iframeTest.clearCachesAndLogAndWait();
            }
        ]
    },

    testComponentDefStorageEviction: {
        labels : ["flapper"],
        test: [
            function loadIframe(cmp) {
                cmp.helper.lib.iframeTest.loadIframe(cmp, "/auraStorageTest/componentDefStorage.app?overrideStorage=true", "iframeContainer");
            },
            function clearStorages(cmp) {
                cmp.helper.lib.iframeTest.clearCachesAndLogAndWait();
            },
            function reloadPage(cmp) {
                // Need to reload the page here to clear any items that may have been restored on initial load and are
                // now in memory
                cmp.helper.lib.iframeTest.reloadIframe(cmp, false);
            },
            function fetchComponentFromServer(cmp) {
                cmp.helper.lib.iframeTest.fetchCmpAndWait("ui:scroller");
            },
            function createComponentOnClient(cmp) {
                cmp.helper.lib.iframeTest.createComponentFromConfig("ui:scroller");
            },
            function verifyFirstCmpStored(cmp) {
                cmp.helper.lib.iframeTest.verifyDefStorage("ui:scroller", true);
            },
            function fetchDifferentComponentFromServer(cmp) {
                cmp.helper.lib.iframeTest.fetchCmpAndWait("ui:block");
            },
            function fetchCmpFromServerToEvictFirstCmp(cmp) {
                cmp.helper.lib.iframeTest.fetchCmpAndWait("ui:menu");
            },
            function verifyOriginalFetchedCmpEvicted(cmp) {
                cmp.helper.lib.iframeTest.verifyDefStorage("ui:scroller", false, "First component fetched from server (ui:scroller) never evicted from component def storage");
            },
            function reloadPage(cmp) {
                // Reload page to clear anything saved in javascript memory
                cmp.helper.lib.iframeTest.reloadIframe(cmp, true);
            },
            function fetchOriginalComponentAgain(cmp) {
                cmp.helper.lib.iframeTest.fetchCmpAndWait("ui:scroller");
            },
            function createOriginalComponentOnClient(cmp) {
                cmp.helper.lib.iframeTest.createComponentFromConfig("ui:scroller");
            },
            function cleanup(cmp) {
                cmp.helper.lib.iframeTest.clearCachesAndLogAndWait();
            }
        ]
    }
})
