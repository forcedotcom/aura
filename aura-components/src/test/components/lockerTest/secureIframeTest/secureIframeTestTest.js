({
    /**
     * Note that this test file operates in system mode (objects are not Lockerized) so the tests delegate logic and
     * verification to the controller and helper files, which operate in user mode.
     */

    // LockerService not supported on IE
    // TODO(W-3674741,W-3674751): FF and iOS browser versions in autobuilds are too far behind
    browsers: ["-IE8", "-IE9", "-IE10", "-IE11", "-FIREFOX", "-IPHONE", "-IPAD"],

    // TODO(tbliss): make these lists on SecureIFrameElement accessible here for maintainability
    AttributesWhitelist: ['contentWindow', 'height', 'name', 'src', 'width'],
    AttributesBlacklist: ['contentDocument', 'sandbox', 'srcdoc'],
    MethodsWhitelist: ['blur', 'focus',
                       'getAttribute', 'hasAttribute', 'setAttribute', 'removeAttribute',
                       'getAttributeNS', 'hasAttributeNS', 'setAttributeNS', 'removeAttributeNS'],

    setUp: function(cmp) {
        cmp.set('v.testUtils', $A.test);
    },

    testIframeAttributes: {
        test: function(cmp) {
        	// Set srcdoc (forbidden in Locker) directly
        	cmp.find("iframe").getElement().setAttribute("srcdoc", "<div>Hello World</div>");
            cmp.testIframeAttributes(this.AttributesWhitelist, this.AttributesBlacklist);
        }
    },

    testIframeMethods: {
        test: function(cmp) {
            cmp.testIframeMethods(this.MethodsWhitelist);
        }
    },

    testContentWindow: {
        test: function(cmp) {
            cmp.testContentWindow();
        }
    },

    testParentWindow: {
        test: function(cmp) {
            // When lockerized component is loaded in the top level window, we want to ensure that window, window.parent and window.top resolve
            // to the exact same SecureWindow.
            //This can only be done when running in AUTO modes as for manual runs component under test loads inside an iframe.
            if(window === window.parent){
                cmp.testParentWindowIsWindowForTopLevelWindow();
            }
            // When component is loaded inside an iframe, window.parent and window.top should resolve to SecureIFrameContentWindow
            cmp.testParentWindowIsSecureIFrameContentWindowForIframedWindow();
        }
    },

    testMessageChannel: {
        test: [function(cmp) {
            var iframe = cmp.find("iframeMessageChannel").getElement();
            $A.test.addWaitForWithFailureMessage(
                    true,
                    function() {
                        // wait for iframe to set flag at end of init handler to signal it's fully loaded
                        return iframe.contentWindow && iframe.contentWindow.$A && iframe.contentWindow.$A.getRoot() 
                                && iframe.contentWindow.$A.getRoot().get("v.loaded");
                    },
                    "iframe never loaded"
            );
        }, function(cmp) {
            cmp.testMessageChannel();
        }]
    }
})
