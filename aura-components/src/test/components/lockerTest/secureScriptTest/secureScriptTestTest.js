({
    /**
     * Note that this test file operates in system mode (objects are not Lockerized) so the tests delegate logic and
     * verification to the controller and helper files, which operate in user mode.
     */

    // LockerService not supported on IE
    // TODO(W-3674741,W-3674751): FF and iOS browser versions in autobuilds are too far behind
    browsers: ["-IE8", "-IE9", "-IE10", "-IE11", "-FIREFOX", "-IPHONE", "-IPAD"],

    setUp: function(cmp) {
        cmp.set("v.testUtils", $A.test);
    },

    testScriptSrcExposed: {
        test: function(cmp) {
            cmp.testScriptSrcExposed();
        }
    },
    
    testGetSetAttribute: {
        test: function(cmp) {
            cmp.testGetSetAttribute();
        }
    },

    testGetSetDataset: {
        test: function(cmp) {
            cmp.testGetSetDataset();
        }
    },

    testGetSetAttributeNode: {
        test: function(cmp) {
            cmp.testGetSetAttributeNode();
        }
    },

    testScriptsFromUnsafeSourceBlocked: {
        test: function(cmp) {
            cmp.testScriptsFromUnsafeSourceBlocked();
        }
    }
})