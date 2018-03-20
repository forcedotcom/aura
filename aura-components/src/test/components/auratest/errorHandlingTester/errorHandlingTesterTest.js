({
    browsers : [ "GOOGLECHROME" ],

    /**
     * Verify that error message box displays in the auraErrorMask div and can be dismissed using the close button.
     */
    testErrorMessageDisplayAndClose: {
        test: [
            function(cmp) {
                var iframeSrc = "/auratest/errorHandlingApp.app";
                this.loadIframe(iframeSrc, cmp, "iframeContainer");
                this.waitForAuraReadyInIframe(this.getIframe());
            },
            function(cmp) {
                var that = this;
                var iframe = this.getIframe();

                iframe.document.querySelector(".errorFromAppTable .errorFromClientControllerButton").click();
                this.waitForErrorMaskVisibleInIframe(iframe, function() {
                        // closing error mask
                        iframe.document.querySelector("a[class~='close']").click();

                        var isMaskVisible = that.isErrorMaskIsNotVisibleInIframe(iframe);
                        $A.test.assertFalse(isMaskVisible, "The error mask should have been closed");
                    });
            }
        ]
    },

    /**
     * Verify that error message box displays via $A.error.
     * Test coverage for deprecated API.
     */
    testErrorMessageDisplayAndCloseViaAError: {
        test: [
            function(cmp) {
                var iframeSrc = "/auratest/errorHandlingApp.app";
                this.loadIframe(iframeSrc, cmp, "iframeContainer");
                this.waitForAuraReadyInIframe(this.getIframe());
            },
            function(cmp) {
                var that = this;
                var iframe = this.getIframe();

                iframe.$A.error("Intended error through $A.error");
                this.waitForErrorMaskVisibleInIframe(iframe, function() {
                        // closing error mask
                        iframe.document.querySelector("a[class~='close']").click();

                        var isMaskVisible = that.isErrorMaskIsNotVisibleInIframe(iframe);
                        $A.test.assertFalse(isMaskVisible, "The error mask should have been closed");
                    });
            }
        ]
    },

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

                var failingDescriptor = "Failing descriptor: {auratest:errorHandling}";
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

                var originalErrorMsg = "Error from component afterRender";
                $A.test.assertTrue($A.test.contains(errorMsg, originalErrorMsg),
                        "Failed to find original error message. Expected message: " + originalErrorMsg + "; Actual: " + errorMsg);

                var failingDescriptor = "Failing descriptor: {auratest:errorHandling}";
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

                    var failingDescriptor = "Failing descriptor: {auratest:errorHandling}";
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

                var originalErrorMsg = "Error from component afterRender";
                $A.test.assertTrue($A.test.contains(errorMsg, originalErrorMsg),
                        "Failed to find original error message. Expected message: " + originalErrorMsg + "; Actual: " + errorMsg);

                // FIXME? should show the cmp with error renderer? seems the stacktrace gives right point.
                var failingDescriptor = "Failing descriptor: {auratest:errorHandlingExtend}";
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
                    var failingDescriptor = "Failing descriptor: {auratest:errorHandlingExtend}";
                    $A.test.assertTrue($A.test.contains(errorMsg, failingDescriptor),
                            "The error message has incorrect failing descriptor. Expected descriptor: " + failingDescriptor + "; Actual: " + errorMsg);
                });
            }
        ]
    },

    /**
     * Verify Aura default error handler can handle systemError event when there is a component which misses required attribute.
     */
    testErrorFromRequiredAttributeMissingComponent: {
        // marking as flapper due to intermittent failure; refer to work item W-4517775
        labels : ["flapper"],
        test: function(cmp) {
            var iframeSrc = "/auratest/errorHandlingApp.app?addAttributeMissingComponent=true";
            this.loadIframe(iframeSrc, cmp, "iframeContainer");

            var that = this;
            var iframe = this.getIframe();
            this.waitForErrorMaskVisibleInIframe(iframe, function() {
                var errorMsg = that.getErrorMessageFromIframe(iframe);

                var expectedMsg = "APPLICATION markup://auratest:errorHandlingApp is missing required attribute 'requiredAttribute'";
                $A.test.assertTrue($A.test.contains(errorMsg, expectedMsg),
                        "Failed to find original error message. Expected message: " + expectedMsg + "; Actual: " + errorMsg);
            });
        }
    },

    /**
     * Verify systemError event can be handled by Aura default error handler event when an error is thrown from render()
     * if a cmp/app contains custom error handler. When error is thrown from render(), $A is not initialized, so the
     * event has to be handled by default handler.
     */
    testDefaultHandleErrorFromAppRenderWhenMarkEventHandled: {
        test: function(cmp) {
            var iframeSrc = "/auratest/errorHandlingApp.app?throwErrorFromRender=true&handleSystemError=true";
            this.loadIframe(iframeSrc, cmp, "iframeContainer");

            var that = this;
            var iframe = this.getIframe();
            this.waitForErrorMaskVisibleInIframe(iframe, function() {
                var errorMsg = that.getErrorMessageFromIframe(iframe);

                var expectedMsg = "Error from app render";
                $A.test.assertTrue($A.test.contains(errorMsg, expectedMsg),
                        "Failed to find original error message. Expected message: " + expectedMsg + "; Actual: " + errorMsg);

                var failingDescriptor = "Failing descriptor: {auratest:errorHandlingApp}";
                $A.test.assertTrue($A.test.contains(errorMsg, failingDescriptor),
                        "The error message has incorrect failing descriptor. Expected descriptor: " + failingDescriptor + "; Actual: " + errorMsg);
            });
        }
    },

    testErrorFromAuraAssertContainsStacktraceInDevMode: {
        test: [
            function(cmp) {
                var iframeSrc = "/auratest/errorHandlingApp.app";
                this.loadIframe(iframeSrc, cmp, "iframeContainer");
                this.waitForAuraReadyInIframe(this.getIframe());
            },
            function(cmp) {
                var that = this;
                var iframe = this.getIframe();
                iframe.document.querySelector(".errorFromAppTable .failAssertInClientControllerButton").click();

                this.waitForErrorMaskVisibleInIframe(iframe, function() {
                    var stacktrace = that.getStacktraceFromIframe(iframe);

                    $A.test.assertTrue(stacktrace.length > 0, "stacktrace should not be empty")
                });
            }
        ]
    },

    testDefaultHandleErrorInModelWhenSerialize: {
        test: function(cmp) {
            var iframeSrc = "/auratest/errorHandlingErrorModelApp.app";
            this.loadIframe(iframeSrc, cmp, "iframeContainer");

            var that = this;
            var iframe = this.getIframe();
            this.waitForErrorMaskVisibleInIframe(iframe, function() {
                var errorMsg = that.getErrorMessageFromIframe(iframe);

                var expectedMsg = "TestModelThrowsInGetter.badThing: intentional exception for bad thing";
                $A.test.assertTrue($A.test.contains(errorMsg, expectedMsg),
                        "Failed to find expected error message. Expected message: " + expectedMsg + "; Actual: " + errorMsg);
            });
        }
    },

    isErrorMaskIsNotVisibleInIframe: function(iframe) {
        var errorMaskElement = iframe.document.getElementById("auraErrorMask");
        return $A.util.hasClass(errorMaskElement, "auraForcedErrorBox")
    },

    getIframe: function() {
        return document.getElementById("myFrame").contentWindow;
    },

    getErrorMessageFromIframe: function(iframe) {
        var errorMessageElement = iframe.document.getElementById("auraErrorMessage");
        return $A.test.getText(errorMessageElement);
    },

    getStacktraceFromIframe: function(iframe) {
        var errorMessageElement = iframe.document.getElementById("auraErrorStack");
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
