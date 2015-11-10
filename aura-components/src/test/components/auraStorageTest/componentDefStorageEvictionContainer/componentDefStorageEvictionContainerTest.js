({
    testComponentDefStorageEviction: {
        test: [
            function loadIframe(cmp) {
                // Warning! The iframe cmp must be run in non-obfuscated mode otherwise cache override code in iframe
                // component's template won't be valid
                cmp.helper.lib.iframeTest.loadIframe(cmp, "/auraStorageTest/componentDefStorageEviction.app?aura.mode=DEV", "iframeContainer");
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
                iframeCmp.set("v.load", "ui:tab");
                iframeCmp.fetchCmp();
                cmp.helper.lib.iframeTest.waitForStatus("Fetching", "Done Fetching");
            },
            function createComponentOnClient(cmp) {
                var iframeCmp = cmp.helper.lib.iframeTest.getIframeRootCmp();
                iframeCmp.createComponentDeprecated();
                cmp.helper.lib.iframeTest.waitForStatus("Creating Component", "Done Creating Component - Success!");
            },
            function fetchDifferentComponentFromServer(cmp) {
                var iframeCmp = cmp.helper.lib.iframeTest.getIframeRootCmp();
                iframeCmp.set("v.load", "ui:block");
                iframeCmp.fetchCmp();
                cmp.helper.lib.iframeTest.waitForStatus("Fetching", "Done Fetching");
            },
            function fetchCmpFromServerToEvictFirstCmp(cmp) {
                var iframeCmp = cmp.helper.lib.iframeTest.getIframeRootCmp();
                // Setup listener on the logs to see what's evicted from the storage
                iframeCmp.setupLogListener();
                iframeCmp.set("v.load", "ui:menu");
                iframeCmp.fetchCmp();
                cmp.helper.lib.iframeTest.waitForStatus("Fetching", "Done Fetching");
            },
            function verifyOriginalFetchedCmpEvicted(cmp) {
                var iframeCmp = cmp.helper.lib.iframeTest.getIframeRootCmp();
                $A.test.addWaitFor(true, function() {
                    var evictLog = iframeCmp.get("v.evictLog");
                    if (evictLog.indexOf("markup://ui:tab") > -1) {
                        return true;
                    }
                    return false;
                });
            },
            function reloadPage(cmp) {
                // Reload page to clear anything saved in javascript memory
                cmp.helper.lib.iframeTest.reloadIframe(cmp);
            },
            function fetchOriginalComponentAgain(cmp) {
                var iframeCmp = cmp.helper.lib.iframeTest.getIframeRootCmp();
                iframeCmp.set("v.load", "ui:tab");
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