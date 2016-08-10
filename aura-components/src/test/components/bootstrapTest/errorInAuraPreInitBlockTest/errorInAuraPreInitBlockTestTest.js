({
    testErrorSurfacedToUser: {
        test: [
            function(cmp) {
                cmp._frameLoaded = false;
                var frame = document.createElement("iframe");
                frame.scrolling = "auto";
                frame.id = "myFrame";
                frame.width = "100%";
                frame.height = "600";
                $A.util.on(frame, "load", function () {
                    cmp._frameLoaded = true;
                });
                frame.src = "/bootstrapTest/errorInAuraPreInitBlock.app";
                var content = cmp.find("iframeContainer");
                $A.util.insertFirst(frame, content.getElement());
                $A.test.addWaitFor(true, function(){ return cmp._frameLoaded });
            },
            function(cmp) {
                var expected = "expected error thrown in test";
                var frame = document.getElementById("myFrame");
                var errorEl = frame.contentWindow.document.getElementById("auraErrorMessage");
                var errorMsg = $A.util.getText(errorEl);
                $A.test.assertTrue(errorEl.offsetWidth > 0 && errorEl.offsetHeight > 0, "Error not visible to user");
                $A.test.assertTrue(errorMsg.indexOf(expected) > -1, "Unexpected error message. Expected to contain <"
                        + expected + "> but got <" + errorMsg + ">");
            }
        ]
    }
})