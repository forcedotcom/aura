({
    testErrorFromContainedCmpRender: {
        test: function(cmp) {
            var iframeSrc = "/auratest/errorHandlingApp.app?throwErrorFromContainedCmpRender=true";
            this.loadIframe(iframeSrc, cmp, "iframeContainer");

            var that = this;
            var iframe = this.getIframe();
            this.waitForErrorMaskVisibleInIframe(iframe, function() {
                var errorMsg = that.getErrorMessageFromIframe(iframe);

                var originalErrorMsg = "Error from component render";
                $A.test.assertTrue($A.test.contains(errorMsg, originalErrorMsg),
                        "Failed to find original error message. Expected message: " + originalErrorMsg + "; Actual: " + errorMsg);

                var failingDescriptor = "Failing descriptor: {markup://auratest:errorHandling}";
                $A.test.assertTrue($A.test.contains(errorMsg, failingDescriptor),
                        "The error message has incorrect failing descriptor. Expected descriptor: " + failingDescriptor + "; Actual: " + errorMsg);
            });
        }
    },

    testErrorFromContainedCmpAfterRender: {
        test: function(cmp) {
            var iframeSrc = "/auratest/errorHandlingApp.app?throwErrorFromContainedCmpAfterRender=true";
            this.loadIframe(iframeSrc, cmp, "iframeContainer");

            var that = this;
            var iframe = this.getIframe();
            this.waitForErrorMaskVisibleInIframe(iframe, function() {
                var errorMsg = that.getErrorMessageFromIframe(iframe);

                var originalErrorMsg = "Error from component afterrender";
                $A.test.assertTrue($A.test.contains(errorMsg, originalErrorMsg),
                        "Failed to find original error message. Expected message: " + originalErrorMsg + "; Actual: " + errorMsg);

                var failingDescriptor = "Failing descriptor: {markup://auratest:errorHandling}";
                $A.test.assertTrue($A.test.contains(errorMsg, failingDescriptor),
                        "The error message has incorrect failing descriptor. Expected descriptor: " + failingDescriptor + "; Actual: " + errorMsg);
            });
        }
    },

    testErrorFromContainedCmpRerender: {
        test: [
            function(cmp) {
                var iframeSrc = "/auratest/errorHandlingApp.app";
                this.loadIframe(iframeSrc, cmp, "iframeContainer");
                this.waitForAuraReadyInIframe(this.getIframe());
            },
            function(cmp) {
                var that = this;
                var iframe = this.getIframe();
                iframe.document.querySelector(".errorFromCmpTable .errorFromRerenderButton").click();

                this.waitForErrorMaskVisibleInIframe(iframe, function() {
                    var errorMsg = that.getErrorMessageFromIframe(iframe);

                    var originalErrorMsg = "Error from component rerender";
                    $A.test.assertTrue($A.test.contains(errorMsg, originalErrorMsg),
                            "Failed to find original error message. Expected message: " + originalErrorMsg + "; Actual: " + errorMsg);

                    var failingDescriptor = "Failing descriptor: {markup://auratest:errorHandling}";
                    $A.test.assertTrue($A.test.contains(errorMsg, failingDescriptor),
                            "The error message has incorrect failing descriptor. Expected descriptor: " + failingDescriptor + "; Actual: " + errorMsg);
                });
            }
        ]
    },

    testErrorFromSuperCmpAfterRender: {
        test: function(cmp) {
            var iframeSrc = "/auratest/errorHandlingExtend.cmp?throwErrorFromSuperAfterRender=true&requiredAttribute=true";
            this.loadIframe(iframeSrc, cmp, "iframeContainer");

            var that = this;
            var iframe = this.getIframe();
            this.waitForErrorMaskVisibleInIframe(iframe, function() {
                var errorMsg = that.getErrorMessageFromIframe(iframe);

                var originalErrorMsg = "Error from component afterrender";
                $A.test.assertTrue($A.test.contains(errorMsg, originalErrorMsg),
                        "Failed to find original error message. Expected message: " + originalErrorMsg + "; Actual: " + errorMsg);

                // FIXME? should show the cmp with error renderer? seems the stacktrace gives right point.
                var failingDescriptor = "Failing descriptor: {markup://auratest:errorHandlingExtend}";
                $A.test.assertTrue($A.test.contains(errorMsg, failingDescriptor),
                        "The error message has incorrect failing descriptor. Expected descriptor: " + failingDescriptor + "; Actual: " + errorMsg);
            });
        }
    },

    testErrorFromSuperCmpUnrender: {
        test: [
            function(cmp) {
                var iframeSrc = "/auratest/errorHandlingExtend.cmp?requiredAttribute=true";
                this.loadIframe(iframeSrc, cmp, "iframeContainer");
                this.waitForAuraReadyInIframe(this.getIframe());
            },
            function(cmp) {
                var that = this;
                var iframe = this.getIframe();

                iframe.document.querySelector(".errorFromUnrenderButton").click();

                this.waitForErrorMaskVisibleInIframe(iframe, function() {
                    var errorMsg = that.getErrorMessageFromIframe(iframe);

                    var originalErrorMsg = "Error from component unrender";
                    $A.test.assertTrue($A.test.contains(errorMsg, originalErrorMsg),
                            "Failed to find original error message. Expected message: " + originalErrorMsg + "; Actual: " + errorMsg);

                    // FIXME? same as above
                    var failingDescriptor = "Failing descriptor: {markup://auratest:errorHandlingExtend}";
                    $A.test.assertTrue($A.test.contains(errorMsg, failingDescriptor),
                            "The error message has incorrect failing descriptor. Expected descriptor: " + failingDescriptor + "; Actual: " + errorMsg);
                });
            }
        ]
    },

    getIframe: function() {
        return document.getElementById("myFrame").contentWindow;
    },

    getErrorMessageFromIframe: function(iframe) {
        var errorMessageElement = iframe.document.getElementById("auraErrorMessage");
        return $A.test.getText(errorMessageElement);
    },

    loadIframe: function(url, cmp, containerAuraId, errorMsg) {
        var loaded = false;
        var frame = document.createElement("iframe");
        frame.src = url;
        frame.scrolling = "auto";
        frame.id = "myFrame";
        frame.width = "100%";
        frame.height = "600";

        $A.util.on(frame, "load", function () {
            loaded = true;
        });
        var container = cmp.find(containerAuraId);
        $A.util.insertFirst(frame, container.getElement());

        $A.test.addWaitFor(true, function() {return loaded;});
    },

    waitForErrorMaskVisibleInIframe: function(iframe, callback) {
        $A.test.addWaitForWithFailureMessage(true, function() {
                var errorMaskElement = iframe.document.getElementById("auraErrorMask");
                return $A.util.hasClass(errorMaskElement, "auraForcedErrorBox");
            },
            "Error mask never showed up in given iframe",
            callback);
    },

    /**
     * Do NOT use this method, if expecting an error in renderers.
     */
    waitForAuraReadyInIframe: function(iframe) {
        $A.test.addWaitForWithFailureMessage(true, function() {
                return iframe.$A && iframe.$A.finishedInit === true;
            },
            "Failed to initialize.");
    }
})
