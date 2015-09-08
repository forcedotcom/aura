({
    tearDown: function() {
        $A.storageService.getStorage('actions').remove('aura://ComponentController/ACTION$getApplication:{"chainLoadLabels":true,"name":"auraStorageTest:applicationTest"}');
    },
    // Safari doesn't like deleting the database immediately after initializing it.
    browsers:["-IE7", "-IE8", "-IE9", "-SAFARI", "-IPAD", "-IPHONE"],
    
    testApplicationRefreshedEvent: {
    	// TODO(W-2701964): Flapping in autobuilds, needs to be revisited
    	labels: ["flapper"],
        test: [
            function loadIframe(cmp) {
                $A.test.setTestTimeout(100000);
                cmp._frameLoaded = false;
                cmp._expected = "expected value";
                var frame = document.createElement("iframe");
                frame.src = "/auraStorageTest/applicationTest.app";
                frame.scrolling = "auto";
                frame.id = "myFrame";
                $A.util.on(frame, "load", function () {
                    cmp._frameLoaded = true;
                });
                var content = cmp.find("iframeContainer");
                $A.util.insertFirst(frame, content.getElement());

                this.waitForIframeLoad(cmp);
            },
            function insertStaleApplicationAction() {
                var iframeCmp = document.getElementById("myFrame").contentWindow.$A.getRoot();
                iframeCmp.addToStorage();
                $A.test.addWaitFor(true, function() {
                    return $A.util.getText(iframeCmp.find("status").getElement()) !== "Adding";
                }, function() {
                    $A.test.assertEquals("Done Adding", $A.util.getText(iframeCmp.find("status").getElement()));
                });
            },
            function reloadIframe(cmp) {
                cmp._frameLoaded = false;
                document.getElementById("myFrame").contentWindow.location.reload();
                this.waitForIframeLoad(cmp);
            },
            function verifyApplicationRefreshed(cmp) {
                var iframeCmp = document.getElementById("myFrame").contentWindow.$A.getRoot();
                $A.test.addWaitFor("YES", function() {
                    return iframeCmp.get('v.refreshed');
                });
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
