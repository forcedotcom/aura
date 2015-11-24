({
    // IndexedDB has problems in Safari and is not supported in older IE
    browsers:["-IE7", "-IE8", "-IE9", "-SAFARI", "-IPAD", "-IPHONE"],

    tearDown: function() {
        $A.storageService.getStorage('actions').remove('aura://ComponentController/ACTION$getApplication:{"chainLoadLabels":true,"name":"auraStorageTest:applicationTest"}');
        document.getElementById("myFrame").contentWindow.$A.getRoot().clearStoredAction();
    },

    /**
     * This test verifies that when the application is loaded from storage it fires a refresh action and if that
     * action response is different from what is currently in storage than the page is refreshed.
     * 
     * The app is loaded in an iframe so that we can manually reload it to force the load from storage.
     * 
     * The test takes the following steps:
     * - Load the test app in an iframe and wait for the bootstrap action to return from the server where it's saved
     *   saved to storage.
     * - Manually modify the 'actions' storage to have a different value than what will be returned from server.
     * - Reload the page causing the app to load from storage and fire a refresh action.
     * - When the refresh action returns it will be different than the stored action and the page should refresh.
     * - Finally verify the refresh happened via the 'aura:applicationRefreshed' handler.
     */
    testApplicationRefreshedEvent: {
        // TODO(W-2701964): Flapping in autobuilds, needs to be revisited
        labels: ["flapper"],
        test: [
            function loadIframe(cmp) {
                $A.test.setTestTimeout(100000);
                cmp.helper.lib.iframeTest.loadIframe(cmp, "/auraStorageTest/applicationTest.app?aura.mode=SELENIUMDEBUG",
                        "iframeContainer");
                // To account for refresh actions, even though it'd be ideal if there weren't any, wait for the flag
                // to be set that tells us the bootstrap action has returned from the server.
                $A.test.addWaitFor("true", function() {
                    return $A.util.getText(cmp.helper.lib.iframeTest.getIframeRootCmp().find("actionComplete").getElement());
                });
            },
            function insertStaleApplicationAction(cmp) {
                cmp.helper.lib.iframeTest.getIframeRootCmp().addToStorage();
                cmp.helper.lib.iframeTest.waitForStatus("Adding", "Done Adding");
            },
            function reloadIframe(cmp) {
                cmp.helper.lib.iframeTest.reloadIframe(cmp);
            },
            function verifyApplicationRefreshed(cmp) {
                $A.test.addWaitFor("YES", function() {
                    return cmp.helper.lib.iframeTest.getIframeRootCmp().get('v.refreshed');
                });
            }
        ]
    }
})
