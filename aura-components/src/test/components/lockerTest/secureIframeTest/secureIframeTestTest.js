({
    /**
     * Note that the test is not in the locker so many of the test cases must delegate to the controller or helper
     * to get objects and then return them to the test for verification.
     */

    // TODO(tbliss): make these lists on SecureIFrameElement accessible here for maintainablility
    AttributesWhitelist: ['height', 'name', 'src', 'width'],
    AttributesBlacklist: ['contentDocument', 'contentWindow', 'sandbox', 'srcdoc'],
    MethodsWhitelist: ['blur', 'focus'],

    testIframeAttributes: {
        test: function(cmp) {
            cmp.getIframe();
            var iframe = cmp.get("v.log");
            this.AttributesWhitelist.forEach(function(name) {
                $A.test.assertTrue(iframe.hasOwnProperty(name));
            });
            this.AttributesBlacklist.forEach(function(name) {
                $A.test.assertFalse(iframe.hasOwnProperty(name));
            });
        }
    },

    testIframeMethods: {
        test: function(cmp) {
            cmp.getIframe();
            var iframe = cmp.get("v.log");
            this.MethodsWhitelist.forEach(function(name) {
                $A.test.assertDefined(iframe[name]);
            });
        }
    }
})