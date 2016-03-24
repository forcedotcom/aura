({
    /**
     * Note that this test file operates in system mode (objects are not Lockerized) so the tests delegate logic and
     * verification to the controller and helper files, which operate in user mode.
     */

    // TODO(tbliss): make these lists on SecureIFrameElement accessible here for maintainablility
    AttributesWhitelist: ['height', 'name', 'src', 'width'],
    AttributesBlacklist: ['contentDocument', 'contentWindow', 'sandbox', 'srcdoc'],
    MethodsWhitelist: ['blur', 'focus'],

    setUp: function(cmp) {
        cmp.set("v.testUtils", $A.test);
    },

    testIframeAttributes: {
        test: function(cmp) {
            cmp.testIframeAttributes(this.AttributesWhitelist, this.AttributesBlacklist);
        }
    },

    testIframeMethods: {
        test: function(cmp) {
            cmp.testIframeMethods(this.MethodsWhitelist);
        }
    }
})
