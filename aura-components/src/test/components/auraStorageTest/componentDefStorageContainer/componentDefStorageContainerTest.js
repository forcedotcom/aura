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
            function fetchComponentFromServer(cmp) {
                cmp.helper.lib.iframeTest.fetchCmpAndWait("ui:scroller");
            },
            function createComponentOnClient(cmp) {
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
            function createOriginalComponentAndVerify(cmp) {
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
        // This may be unreliable because of a flapper with the server sometimes not sending down a def when it should,
        // because Context.loaded is incorrect.
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
            function fetchComponentFromServer(cmp) {
                cmp.helper.lib.iframeTest.fetchCmpAndWait("ui:scroller");
            },
            function createComponentOnClient(cmp) {
                cmp.helper.lib.iframeTest.createComponentFromConfig("ui:scroller");
            },
            function verifyFirstCmpStored(cmp) {
            	cmp.helper.lib.iframeTest.waitForDefInStorage("ui:scroller");
            },
            function fetchDifferentComponentFromServer(cmp) {
                cmp.helper.lib.iframeTest.fetchCmpAndWait("ui:block");
            },
            function fetchCmpFromServerToEvictFirstCmp(cmp) {
                cmp.helper.lib.iframeTest.fetchCmpAndWait("ui:menu");
            },
            function verifyOriginalFetchedCmpEvicted(cmp) {
                // Ideally we would keep adding defs until the original got evicted instead of just waiting here (W-2979502)
                var iframeCmp = cmp.helper.lib.iframeTest.getIframeRootCmp();
                $A.test.addWaitFor(true, function() {
                    var defs = iframeCmp._ComponentDefStorage.split(',');
                    for (var i = 0; i < defs; i++) {
                        var def = defs[i].trim();
                        if (def === "markup://ui:scroller") {
                            return false;
                        }
                    }
                    return true;
                });
            },
            function reloadPage(cmp) {
                // Reload page to clear anything saved in javascript memory
                cmp.helper.lib.iframeTest.reloadIframe(cmp, true, "second reload");
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
