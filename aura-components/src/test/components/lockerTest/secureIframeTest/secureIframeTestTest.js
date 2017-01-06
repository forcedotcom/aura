({
    /**
     * Note that this test file operates in system mode (objects are not Lockerized) so the tests delegate logic and
     * verification to the controller and helper files, which operate in user mode.
     */

    // LockerService not supported on IE
    browsers: ['-IE8', '-IE9', '-IE10', "-IE11"],

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

    testMessageChannel: {
        test: function(cmp) {
            cmp.testMessageChannel();
        }
    }
})
