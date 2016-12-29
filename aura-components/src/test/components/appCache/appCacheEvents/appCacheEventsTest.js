({
    // ThreadHostile: The test needs to be running in the first load to get all AppCache events fired.
    // UnAdaptableTest: Autobuild may re-use the browser session to run tests, it causes expected AppCache events
    //                  don't get fired, which is causing flapping.
    labels : ["threadHostile", "UnAdaptableTest"],

    /**
     * Verify the correct AppCache events are received and are in the right order, without an error event.
     */
    testAppCacheEvents : {
        browsers : [ "-FIREFOX", "-IE7","-IE8","-IE9", "-IE10", "-IE11" ],
        test : [
            function waitForAppCacheToPopulate(component) {
                var that = this;
                $A.test.addWaitForWithFailureMessage(
                        true,
                        function() {
                            return that.getIndexOfAppCacheEvent("cached") > -1;
                        },
                        "appcache cached event was never received, events: " + JSON.stringify(window.appCacheEvents));
            },
            function verifyAppCacheEvents(component) {
                $A.test.assertEquals(-1, this.getIndexOfAppCacheEvent("error"), "Test prerequisite failed: appcache must not be populated when the test is started; received noupdate appcache event indicating it was");
                $A.test.assertEquals(-1, this.getIndexOfAppCacheEvent("error"), "appcache error event received, events: " + JSON.stringify(window.appCacheEvents));

                // note: spec says checking will be fired but it's observed most browsers do not fire it
                var downloading = this.getIndexOfAppCacheEvent("downloading");
                var cached = this.getIndexOfAppCacheEvent("cached");

                $A.test.assertNotEquals(-1, downloading, "appcache downloading event not received, events: " + JSON.stringify(window.appCacheEvents));
                $A.test.assertNotEquals(-1, cached, "appcache cached event not received, events: " + JSON.stringify(window.appCacheEvents));
                $A.test.assertTrue(downloading < cached, "appcache checking event not received before downloading, events: " + JSON.stringify(window.appCacheEvents));
                $A.test.assertEquals(window.appCacheEvents.length -1, cached, "appcache cached event not the last received event, events: " + JSON.stringify(window.appCacheEvents));
            }
        ]
    },

    /**
     * Gets the index of the specified appcache event type.
     * @param {String} type the type of appcache event to find.
     * @return {Number} index of the event, -1 if not found.
     */
    getIndexOfAppCacheEvent: function(type) {
        for (var i = 0; i < window.appCacheEvents.length; i++) {
            if (window.appCacheEvents[i].type === type) {
                return i;
            }
        }
        return -1;
    }
})
