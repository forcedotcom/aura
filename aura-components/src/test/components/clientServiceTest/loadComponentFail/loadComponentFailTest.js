({
    /**
     * Load an app in an iframe, emulate being offline, then reload and verify correct error is displayed to the user.
     *
     * See the template file of the component loaded in the iframe for logic relevant to emulating offline behavior
     * and how the storage is set up.
     */
    testOfflineLaunchFailureDisplaysError: {
        test: [
            function loadIframe(cmp) {
                cmp.helper.lib.iframeTest.loadIframe(cmp, "/clientServiceTest/loadComponentFailApp.app", "iframeContainer");
            },
            function reloadIframeOfflineAndVerifyError(cmp) {
                // Emulate being offline. This value will be picked up by the template
                document.getElementById("myFrame").contentWindow.location.hash = "launchOffline";

                // We cannot use the test library reload API here because we expect an error on reload
                document.getElementById("myFrame").contentWindow.location.reload();

                var expectedMsg = "Failed to initialize application";
                $A.test.addWaitForWithFailureMessage(true, function() {
                    var frame = document.getElementById("myFrame").contentWindow;
                    var errorMsgElement = frame.document.getElementById("auraErrorMessage");
                    return errorMsgElement !== null && $A.test.getText(errorMsgElement).indexOf(expectedMsg) > -1;
                }, "Error box never received expected error message. Expected <" + expectedMsg + ">",
                function() {
                    // Verify error box is visible to user
                    var frame = document.getElementById("myFrame").contentWindow;
                    var errorBox = frame.document.getElementById("auraErrorMessage");
                    $A.test.assertTrue(errorBox.offsetHeight > 0 && errorBox.offsetWidth > 0, "Error box not visible");
                });
            }
        ]
    }
})
