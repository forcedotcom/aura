({
	// IndexedDb not supported in IE < 10
    // Disable IndexedDB for Safari because it doesn't work reliably in iframe.
    browsers:["-IE7", "-IE8", "-IE9", "-SAFARI", "-IPAD", "-IPHONE"],

    tearDown: function() {
        $A.storageService.getStorage('actions').remove('aura://ComponentController/ACTION$getApplication:{"name":"auraStorageTest:noGetApplicationCache"}');
    },

    // TODO(W-2942362): Need to figure out a better to emulate offline. Locker fails if host is invalid.
    _testOfflineLaunch: {
        // TODO(W-2701964): Flapping in autobuilds, needs to be revisited
        labels: ["flapper"],
        test: [
            function loadIframe(cmp) {
                cmp.helper.lib.iframeTest.loadIframe(cmp, "/auraStorageTest/noGetApplicationCache.app", "iframeContainer", "first load");
            },
            function reloadIframeOffline(cmp) {
                document.getElementById("myFrame").contentWindow.location.hash = "launchOffline";
                cmp.helper.lib.iframeTest.reloadIframe(cmp, false, "first reload");
            },
            function verifyApplicationLoaded(cmp) {
                $A.test.addWaitFor("Loaded", function() {
                    return cmp.helper.lib.iframeTest.getIframeRootCmp().get('v.status');
                });
            },
            function verifyStorageGets(cmp) {
                // Two gets: AuraContext then GVP
                var gets = document.getElementById("myFrame").contentWindow._storageGets;
                $A.test.assertEquals(3, gets.length, "Expected three storage.get() on reload! " + JSON.stringify(gets));
            }
        ]
    },

    testOnlineLaunch: {
        test: [
            function loadIframe(cmp) {
                $A.test.setTestTimeout(100000);
                cmp.helper.lib.iframeTest.loadIframe(cmp, "/auraStorageTest/noGetApplicationCache.app", "iframeContainer", "first load");
            },
            function reloadIframeOnline(cmp) {
                cmp.helper.lib.iframeTest.reloadIframe(cmp, false, "first reload");
            },
            function verifyApplicationLoaded(cmp) {
                $A.test.addWaitFor("Loaded", function() {
                    return cmp.helper.lib.iframeTest.getIframeRootCmp().get('v.status');
                });
            },
            function verifyStorageGets(cmp) {
                // Two gets: AuraContext then GVP
                var gets = document.getElementById("myFrame").contentWindow._storageGets;
                $A.test.assertEquals(2, gets.length, "More than two storage.get() on reload! " + JSON.stringify(gets));
            }
        ]
    }
})