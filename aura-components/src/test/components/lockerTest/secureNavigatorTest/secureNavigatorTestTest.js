({
    /**
     * Note that this test file operates in system mode (objects are not Lockerized) so the tests delegate logic and
     * verification to the controller and helper files, which operate in user mode.
     */

    setUp: function(cmp) {
        cmp.set("v.testUtils", $A.test);
    },

    testPropertiesExposed: {
        test: function(cmp) {
            cmp.testPropertiesExposed();
        }
    },
    
    testLanguage: {
        test: function(cmp) {
            cmp.testLanguage();
        }
    }
})