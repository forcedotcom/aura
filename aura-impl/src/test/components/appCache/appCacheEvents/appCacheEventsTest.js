({
    /**
     * Verify the correct AppCache events are received and are in the right order, without an error event.  This case
     * covers when we have not seen the page before and must download resources.
     * 
     * TODO(W-1708575): Android AppCache tests fail when running on SauceLabs
     */
    testAppCacheEvents: {
        // AppCache only supported on WebKit browsers
        browsers:["-FIREFOX","-IE7","-IE8","-IE9", "-IE10", "-ANDROID_PHONE", "-ANDROID_TABLET"],
        test: function(component){
            var appCacheEvents = $A.test.getAppCacheEvents();
            var lastEvent = appCacheEvents.length - 1;

            // Error event is always the last event in the sequence
            $A.test.assertNotEquals("error", appCacheEvents[lastEvent], "AppCache returned with an error.");

            // Verify we received the events in the right order
            $A.test.assertEquals("checking", appCacheEvents[0], "AppCache should begin with checking event.");
            $A.test.assertEquals("downloading", appCacheEvents[1], "AppCache did not start downloading resources.");

            // A progress event is fired for each file that is successfully downloaded. Only check that at least one
            // file has been downloaded then check that AppCache completed.
            $A.test.assertEquals("progress", appCacheEvents[2], "No files successfully downloaded.");
            $A.test.assertEquals("cached", appCacheEvents[lastEvent], "Cached event to signal all files downloaded never fired");
        }
    }
})
