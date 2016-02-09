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
                cmp.helper.lib.iframeTest.getIframeRootCmp().clearActionAndDefStorage();
                cmp.helper.lib.iframeTest.waitForStatus("Clearing Action and Def Storage", "Done Clearing Action and Def Storage");
            },
            function reloadPage(cmp) {
                // Need to reload the page here to clear any items that may have been restored on initial load and are
                // now in memory
                cmp.helper.lib.iframeTest.reloadIframe(cmp);
            },
            function fetchComponentFromServer(cmp) {
                cmp.helper.lib.iframeTest.getIframeRootCmp().fetchCmp();
                cmp.helper.lib.iframeTest.waitForStatus("Fetching", "Done Fetching");
            },
            function createComponentOnClient(cmp) {
                cmp.helper.lib.iframeTest.getIframeRootCmp().createComponentDeprecated();
                cmp.helper.lib.iframeTest.waitForStatus("Creating Component", "Done Creating Component - Success!");
            },
            function waitForAllDefsStored(cmp) {
                var iframeCmp = cmp.helper.lib.iframeTest.getIframeRootCmp();
                $A.test.addWaitFor(true, function() {
                    // ui:scroller has 4 items that go into the ComponentDefStorage: scroller, resizeObserver, and
                    // 2 libraries
                    var defStorageContents = iframeCmp.get("v.defStorageContents");
                    return defStorageContents.length >= 4 && defStorageContents.indexOf("markup://ui:scroller") > -1;
                });
            },
            function reloadIframe(cmp) {
                cmp.helper.lib.iframeTest.reloadIframe(cmp)
            },
            function waitForDefRestore(cmp) {
                cmp.helper.lib.iframeTest.getIframeRootCmp().verifyDefsRestored();
                cmp.helper.lib.iframeTest.waitForStatus("Verifying Defs Restored", "Done Verifying Defs Restored");
            },
            function createOriginalComponentAndVerify(cmp) {
                var iframeCmp = cmp.helper.lib.iframeTest.getIframeRootCmp();
                iframeCmp.createComponentDeprecated();
                $A.test.addWaitFor(true, function() {
                    return $A.util.getText(iframeCmp.find("status").getElement()) === "Done Creating Component - Success!";
                }, function() {
                    var outputCmp = iframeCmp.get("v.output");
                    $A.test.assertEquals("markup://ui:scroller", outputCmp.getDef().getDescriptor().getQualifiedName(),
                            "Did not properly recreate ui:scroller from component def cache after page reload");
                });
            }
        ]
    },

    testComponentDefStorageEviction: {
        test: [
            function loadIframe(cmp) {
                cmp.helper.lib.iframeTest.loadIframe(cmp, "/auraStorageTest/componentDefStorage.app?overrideStorage=true", "iframeContainer");
            },
            function clearStorages(cmp) {
                cmp.helper.lib.iframeTest.getIframeRootCmp().clearActionAndDefStorage();
                cmp.helper.lib.iframeTest.waitForStatus("Clearing Action and Def Storage", "Done Clearing Action and Def Storage");
            },
            function reloadPage(cmp) {
                // Need to reload the page here to clear any items that may have been restored on initial load and are
                // now in memory
                cmp.helper.lib.iframeTest.reloadIframe(cmp);
            },
            function fetchComponentFromServer(cmp) {
                var iframeCmp = cmp.helper.lib.iframeTest.getIframeRootCmp();
                iframeCmp.set("v.load", "markup://ui:scroller");
                iframeCmp.fetchCmp();
                cmp.helper.lib.iframeTest.waitForStatus("Fetching", "Done Fetching");
            },
            function createComponentOnClient(cmp) {
                var iframeCmp = cmp.helper.lib.iframeTest.getIframeRootCmp();
                iframeCmp.createComponentDeprecated();
                cmp.helper.lib.iframeTest.waitForStatus("Creating Component", "Done Creating Component - Success!");
            },
            function verifyFirstCmpStored(cmp) {
                var iframeCmp = cmp.helper.lib.iframeTest.getIframeRootCmp();
                $A.test.addWaitForWithFailureMessage(true, function(){
                    var defStorageContents = iframeCmp.get("v.defStorageContents");
                    return defStorageContents.indexOf("markup://ui:scroller") > -1;
                }, "First component fetched from server (ui:scroller) was not saved to component def storage");
            },
            function fetchDifferentComponentFromServer(cmp) {
                var iframeCmp = cmp.helper.lib.iframeTest.getIframeRootCmp();
                iframeCmp.set("v.load", "ui:block");
                iframeCmp.fetchCmp();
                cmp.helper.lib.iframeTest.waitForStatus("Fetching", "Done Fetching");
            },
            function fetchCmpFromServerToEvictFirstCmp(cmp) {
                var iframeCmp = cmp.helper.lib.iframeTest.getIframeRootCmp();
                iframeCmp.set("v.load", "ui:menu");
                iframeCmp.fetchCmp();
                cmp.helper.lib.iframeTest.waitForStatus("Fetching", "Done Fetching");
            },
            function verifyOriginalFetchedCmpEvicted(cmp) {
                var iframeCmp = cmp.helper.lib.iframeTest.getIframeRootCmp();
                $A.test.addWaitForWithFailureMessage(true, function(){
                    var defStorageContents = iframeCmp.get("v.defStorageContents");
                    return defStorageContents.indexOf("markup://ui:scroller") === -1;
                }, "First component fetched from server (ui:scroller) never evicted from component def storage");
            },
            function reloadPage(cmp) {
                // Reload page to clear anything saved in javascript memory
                cmp.helper.lib.iframeTest.reloadIframe(cmp);
            },
            function fetchOriginalComponentAgain(cmp) {
                var iframeCmp = cmp.helper.lib.iframeTest.getIframeRootCmp();
                iframeCmp.set("v.load", "markup://ui:scroller");
                iframeCmp.fetchCmp();
                cmp.helper.lib.iframeTest.waitForStatus("Fetching", "Done Fetching");
            },
            function createOriginalComponentOnClient(cmp) {
                var iframeCmp = cmp.helper.lib.iframeTest.getIframeRootCmp();
                iframeCmp.createComponentDeprecated();
                cmp.helper.lib.iframeTest.waitForStatus("Creating Component", "Done Creating Component - Success!");
            },
        ]
    }
})