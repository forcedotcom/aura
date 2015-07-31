({
    tearDown: function() {
        $A.storageService.getStorage('actions').remove('aura://ComponentController/ACTION$getApplication:{"name":"auraStorageTest:noGetApplicationCache"}');
    },

    // TODO(W-2701964): Flapping in autobuilds, needs to be revisited
    _testOfflineLaunch: {
        test: [
            function loadIframe(cmp) {
                cmp._frameLoaded = false;
                var frame = document.createElement("iframe");
                frame.src = "/auraStorageTest/noGetApplicationCache.app";
                frame.scrolling = "auto";
                frame.id = "myFrame";
                $A.util.on(frame, "load", function () {
                    cmp._frameLoaded = true;
                });
                var content = cmp.find("iframeContainer");
                $A.util.insertFirst(frame, content.getElement());

                this.waitForIframeLoad(cmp);
            },
            function reloadIframeOffline(cmp) {
                cmp._frameLoaded = false;
                document.getElementById("myFrame").contentWindow.location.hash = "launchOffline";
                document.getElementById("myFrame").contentWindow.location.reload();
                this.waitForIframeLoad(cmp);
            },
            function verifyApplicationLoaded(cmp) {
                var iframeCmp = document.getElementById("myFrame").contentWindow.$A.getRoot();
                $A.test.addWaitFor("Loaded", function() {
                    return iframeCmp.get('v.status');
                });
            },
            function verifyStorageGets(cmp) {
                // First get is for GVP
                var gets = document.getElementById("myFrame").contentWindow._storageGets;
                $A.test.assertEquals(2, gets.length, "Expected two storage.get() on reload! " + JSON.stringify(gets));
            }
        ]
    },
    
    testOnlineLaunch: {
        test: [
            function loadIframe(cmp) {
                $A.test.setTestTimeout(100000);
                cmp._frameLoaded = false;
                var frame = document.createElement("iframe");
                frame.src = "/auraStorageTest/noGetApplicationCache.app";
                frame.scrolling = "auto";
                frame.id = "myFrame";
                $A.util.on(frame, "load", function () {
                    cmp._frameLoaded = true;
                });
                var content = cmp.find("iframeContainer");
                $A.util.insertFirst(frame, content.getElement());
            
                this.waitForIframeLoad(cmp);
            },
            function reloadIframeOffline(cmp) {
                cmp._frameLoaded = false;
                document.getElementById("myFrame").contentWindow.location.reload();
                this.waitForIframeLoad(cmp);
            },
            function verifyApplicationLoaded(cmp) {
                var iframeCmp = document.getElementById("myFrame").contentWindow.$A.getRoot();
                $A.test.addWaitFor("Loaded", function() {
                    return iframeCmp.get('v.status');
                });
            },
            function verifyStorageGets(cmp) {
                // First get is for GVP
                var gets = document.getElementById("myFrame").contentWindow._storageGets;
                $A.test.assertEquals(1, gets.length, "More than one storage.get() on reload! " + JSON.stringify(gets));
            }
        ]
    },

    waitForIframeLoad: function(cmp) {
        var iframeWindow = document.getElementById("myFrame").contentWindow;
        $A.test.addWaitFor(true, function() {
            return cmp._frameLoaded
                && iframeWindow.$A
                && iframeWindow.$A.getRoot() !== undefined
                && !$A.test.isActionPending()
        });
    }
})