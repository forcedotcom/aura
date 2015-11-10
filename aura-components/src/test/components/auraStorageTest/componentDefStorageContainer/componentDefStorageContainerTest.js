({
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
                // Start monitoring logs for what's added to storage to verify later that everything is stored we expect
                cmp.helper.lib.iframeTest.getIframeRootCmp().setupLogListener();
                cmp.helper.lib.iframeTest.getIframeRootCmp().fetchCmp();
                cmp.helper.lib.iframeTest.waitForStatus("Fetching", "Done Fetching");
            },
            function createComponentOnClient(cmp) {
                cmp.helper.lib.iframeTest.getIframeRootCmp().createComponentDeprecated();
                cmp.helper.lib.iframeTest.waitForStatus("Creating Component", "Done Creating Component");
            },
            function waitForAllDefsStored(cmp) {
                var iframeCmp = cmp.helper.lib.iframeTest.getIframeRootCmp();
                $A.test.addWaitFor(true, function(){
                    // ui:scroller has 4 items that go into the ComponentDefStorage: scroller, resizeObserver, and
                    // 2 libraries
                    var log = iframeCmp.get("v.putLog");
                    return log.length >= 4;
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
                    return $A.util.getText(iframeCmp.find("status").getElement()) === "Done Creating Component";
                }, function() {
                    var outputCmp = iframeCmp.get("v.output");
                    $A.test.assertEquals("markup://ui:scroller", outputCmp.getDef().getDescriptor().getQualifiedName(),
                            "Did not properly recreate ui:scroller from component def cache after page reload");
                });
            }
        ]
    }
})